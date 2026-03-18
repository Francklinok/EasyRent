/**
 * SyncEngine - Moteur de synchronisation avec détection de conflits
 *
 * Fonctionnalités:
 * - Delta sync (uniquement les changements depuis lastSync)
 * - Détection de conflits avec version vectors
 * - Stratégies de résolution configurables
 * - Background sync scheduling
 * - Push des changements locaux avant pull
 */

import NetInfo from '@react-native-community/netinfo';
import {
  EntityTable,
  SyncState,
  SyncStatus,
  SyncResult,
  PushResult,
  DeltaChanges,
  ConflictType,
  ConflictStrategy,
  ConflictInfo,
  QueueItem,
  BaseEntity,
  DEFAULT_SYNC_INTERVAL,
} from './types';
import { getUnifiedDatabase } from './UnifiedDatabase';
import { getUnifiedCacheService } from './UnifiedCacheService';
import { getOfflineQueueService } from './OfflineQueueService';
import { getReactiveDataLayer } from './ReactiveDataLayer';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface SyncEngineConfig {
  syncInterval: number;
  autoSync: boolean;
  maxConcurrentRequests: number;
  conflictStrategy: ConflictStrategy;
  entityStrategies: Partial<Record<EntityTable, ConflictStrategy>>;
}

const DEFAULT_CONFIG: SyncEngineConfig = {
  syncInterval: DEFAULT_SYNC_INTERVAL,
  autoSync: true,
  maxConcurrentRequests: 3,
  conflictStrategy: 'LAST_WRITE_WINS',
  entityStrategies: {
    transactions: 'SERVER_WINS',
    wallet: 'SERVER_WINS',
    messages: 'LAST_WRITE_WINS',
    properties: 'LAST_WRITE_WINS',
  },
};

// ============================================================================
// CONFLICT RESOLVER
// ============================================================================

class ConflictResolver {
  resolve<T extends BaseEntity>(
    local: T,
    server: T,
    strategy: ConflictStrategy
  ): T {
    switch (strategy) {
      case 'LAST_WRITE_WINS':
        return this.lastWriteWins(local, server);

      case 'SERVER_WINS':
        return server;

      case 'CLIENT_WINS':
        return local;

      case 'MERGE':
        return this.mergeEntities(local, server);

      case 'MANUAL':
        throw new ConflictRequiresManualResolution(local, server);

      default:
        return server;
    }
  }

  private lastWriteWins<T extends BaseEntity>(local: T, server: T): T {
    const localTime = new Date(local.updatedAt).getTime();
    const serverTime = new Date(server.updatedAt).getTime();
    return localTime > serverTime ? local : server;
  }

  private mergeEntities<T extends BaseEntity>(local: T, server: T): T {
    const merged = { ...server } as T;

    // Parcourir les propriétés locales
    for (const key of Object.keys(local)) {
      if (key === 'id' || key === 'serverId' || key === 'version') continue;

      // Si la propriété n'existe pas sur le serveur, garder la locale
      if (!(key in server)) {
        (merged as any)[key] = (local as any)[key];
      }
    }

    // Incrémenter la version
    merged.version = Math.max(local.version || 0, server.version || 0) + 1;
    merged.updatedAt = new Date().toISOString();

    return merged;
  }

  detectConflict<T extends BaseEntity>(
    local: T,
    server: T
  ): ConflictType | null {
    // Pas de conflit si les versions sont identiques
    if (local.version === server.version) {
      return null;
    }

    // Version locale plus récente que le serveur attendu
    if (local.version > server.version) {
      return 'CONCURRENT_EDIT';
    }

    // Le serveur a une version plus récente
    if (server.version > local.version) {
      return 'VERSION_MISMATCH';
    }

    return null;
  }
}

class ConflictRequiresManualResolution extends Error {
  constructor(public local: any, public server: any) {
    super('Conflict requires manual resolution');
    this.name = 'ConflictRequiresManualResolution';
  }
}

// ============================================================================
// SYNC ENGINE
// ============================================================================

class SyncEngine {
  private db = getUnifiedDatabase();
  private cache = getUnifiedCacheService();
  private queue = getOfflineQueueService();
  private reactive = getReactiveDataLayer();
  private conflictResolver = new ConflictResolver();

  private config: SyncEngineConfig;
  private syncStatus: SyncStatus = {
    state: 'idle',
    lastSyncTime: null,
    pendingCount: 0,
    failedCount: 0,
  };

  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;
  private apiService: any = null; // Injecté par le repository

  constructor(config: Partial<SyncEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupNetworkListener();
    this.loadLastSyncTime();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private setupNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        console.log('[SyncEngine] Back online, triggering sync');
        this.synchronize();
      }
    });
  }

  private async loadLastSyncTime(): Promise<void> {
    const lastSync = await this.db.getMetadata<number>('lastSyncTime');
    this.syncStatus.lastSyncTime = lastSync;
  }

  /**
   * Configure le service API pour les appels réseau
   */
  setApiService(apiService: any): void {
    this.apiService = apiService;
  }

  // ==========================================================================
  // MAIN SYNC OPERATIONS
  // ==========================================================================

  /**
   * Effectue une synchronisation complète
   */
  async synchronize(): Promise<SyncResult> {
    if (this.syncStatus.state === 'syncing') {
      console.log('[SyncEngine] Sync already in progress');
      return this.createEmptyResult();
    }

    if (!this.isOnline) {
      console.log('[SyncEngine] Offline, sync cancelled');
      this.syncStatus.state = 'offline';
      return this.createEmptyResult();
    }

    const startTime = Date.now();
    this.syncStatus.state = 'syncing';
    this.reactive.emit('metadata', 'synced', this.syncStatus, { entityId: 'syncStatus' });

    const result: SyncResult = {
      success: true,
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
      duration: 0,
    };

    try {
      // 1. Push des changements locaux
      const pushResult = await this.pushPendingChanges();
      result.pushed = pushResult.processed;
      result.errors.push(...pushResult.errors.map((e) => e.error));

      // 2. Pull des changements serveur
      const pullResult = await this.pullServerChanges();
      result.pulled = pullResult.created.length + pullResult.updated.length;
      result.conflicts = pullResult.conflicts || 0;

      // 3. Mettre à jour le timestamp
      this.syncStatus.lastSyncTime = Date.now();
      await this.db.setMetadata('lastSyncTime', this.syncStatus.lastSyncTime);

      this.syncStatus.state = 'idle';
    } catch (error) {
      console.error('[SyncEngine] Sync error:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      this.syncStatus.state = 'error';
      this.syncStatus.error = result.errors[0];
    }

    result.duration = Date.now() - startTime;

    // Mettre à jour les stats
    const queueStats = await this.queue.getStats();
    this.syncStatus.pendingCount = queueStats.total;

    this.reactive.emit('metadata', 'synced', this.syncStatus, { entityId: 'syncStatus' });

    console.log(`[SyncEngine] Sync completed in ${result.duration}ms: pushed=${result.pushed}, pulled=${result.pulled}, conflicts=${result.conflicts}`);

    return result;
  }

  /**
   * Synchronise une entité spécifique
   */
  async syncEntity(entityType: EntityTable): Promise<void> {
    if (!this.isOnline || !this.apiService) {
      console.log(`[SyncEngine] Cannot sync ${entityType}: offline or no API`);
      return;
    }

    try {
      // Push les changements pour cette entité
      const pendingItems = await this.queue.getPendingByEntity(entityType);
      for (const item of pendingItems) {
        await this.processQueueItem(item);
      }

      // Pull les changements
      const lastSync = await this.getLastSyncTimestamp(entityType);
      await this.pullEntityChanges(entityType, lastSync);

    } catch (error) {
      console.error(`[SyncEngine] Error syncing ${entityType}:`, error);
    }
  }

  // ==========================================================================
  // PUSH OPERATIONS
  // ==========================================================================

  /**
   * Push tous les changements en attente
   */
  async pushPendingChanges(): Promise<PushResult> {
    const result: PushResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
    };

    if (!this.apiService) {
      console.warn('[SyncEngine] No API service configured');
      return result;
    }

    const processResult = await this.queue.processQueue(async (item) => {
      return this.processQueueItem(item);
    });

    result.processed = processResult.succeeded;
    result.failed = processResult.failed;
    result.errors = processResult.errors;
    result.success = processResult.failed === 0;

    return result;
  }

  /**
   * Traite un item de la queue
   */
  private async processQueueItem(item: QueueItem): Promise<boolean> {
    if (!this.apiService) return false;

    try {
      let serverEntity: any;

      switch (item.action) {
        case 'CREATE':
          serverEntity = await this.apiService.create(item.entityType, item.data);
          if (serverEntity) {
            await this.db.markAsSynced(item.entityType, item.entityId, serverEntity.id);
            this.reactive.emit(item.entityType, 'synced', serverEntity, {
              entityId: item.entityId,
              source: 'sync',
            });
          }
          break;

        case 'UPDATE':
          serverEntity = await this.apiService.update(item.entityType, item.entityId, item.data);
          if (serverEntity) {
            // Vérifier les conflits
            const localEntity = await this.db.findById(item.entityType, item.entityId);
            if (localEntity) {
              const conflict = this.conflictResolver.detectConflict(
                localEntity as BaseEntity,
                serverEntity
              );

              if (conflict) {
                const resolved = await this.handleConflict(
                  item.entityType,
                  localEntity as BaseEntity,
                  serverEntity,
                  conflict
                );
                await this.db.upsert(item.entityType, resolved);
              } else {
                await this.db.markAsSynced(item.entityType, item.entityId);
              }
            }
            this.reactive.emit(item.entityType, 'synced', serverEntity, {
              entityId: item.entityId,
              source: 'sync',
            });
          }
          break;

        case 'DELETE':
          const success = await this.apiService.delete(item.entityType, item.entityId);
          if (success) {
            await this.db.delete(item.entityType, item.entityId);
            this.reactive.emit(item.entityType, 'deleted', { id: item.entityId }, {
              entityId: item.entityId,
              source: 'sync',
            });
          }
          break;
      }

      return true;
    } catch (error) {
      console.error(`[SyncEngine] Error processing ${item.action} for ${item.entityType}:`, error);
      return false;
    }
  }

  // ==========================================================================
  // PULL OPERATIONS
  // ==========================================================================

  /**
   * Pull les changements depuis le serveur
   */
  private async pullServerChanges(): Promise<DeltaChanges & { conflicts: number }> {
    const result: DeltaChanges & { conflicts: number } = {
      created: [],
      updated: [],
      deleted: [],
      timestamp: Date.now(),
      conflicts: 0,
    };

    if (!this.apiService) return result;

    const lastSync = this.syncStatus.lastSyncTime || 0;

    try {
      // Appel API pour récupérer les changements delta
      const changes = await this.apiService.getDelta?.(lastSync);

      if (!changes) return result;

      // Traiter chaque type d'entité
      for (const entityType of Object.keys(changes.entities || {}) as EntityTable[]) {
        const entities = changes.entities[entityType] || [];

        for (const serverEntity of entities) {
          const existingEntity = await this.db.findByServerId(entityType, serverEntity.id);

          if (existingEntity) {
            // Vérifier les conflits
            const conflict = this.conflictResolver.detectConflict(
              existingEntity as BaseEntity,
              serverEntity
            );

            if (conflict) {
              const resolved = await this.handleConflict(
                entityType,
                existingEntity as BaseEntity,
                serverEntity,
                conflict
              );
              await this.db.upsert(entityType, resolved);
              result.conflicts++;
            } else {
              await this.db.upsert(entityType, this.mapServerToLocal(serverEntity));
            }
            result.updated.push(serverEntity);
          } else {
            // Nouvelle entité
            await this.db.insert(entityType, this.mapServerToLocal(serverEntity));
            result.created.push(serverEntity);
          }

          // Invalider le cache
          await this.cache.invalidateEntity(entityType, serverEntity.id);
          this.reactive.emit(entityType, 'updated', serverEntity, {
            entityId: serverEntity.id,
            source: 'remote',
          });
        }
      }

      // Traiter les suppressions
      for (const entityType of Object.keys(changes.deletions || {}) as EntityTable[]) {
        const deletedIds = changes.deletions[entityType] || [];

        for (const serverId of deletedIds) {
          const entity = await this.db.findByServerId(entityType, serverId);
          if (entity) {
            await this.db.delete(entityType, (entity as any).id);
            await this.cache.invalidateEntity(entityType, serverId);
            this.reactive.emit(entityType, 'deleted', { id: serverId }, {
              entityId: serverId,
              source: 'remote',
            });
          }
          result.deleted.push(serverId);
        }
      }

    } catch (error) {
      console.error('[SyncEngine] Error pulling server changes:', error);
    }

    return result;
  }

  /**
   * Pull les changements pour une entité spécifique
   */
  private async pullEntityChanges(entityType: EntityTable, since: number): Promise<void> {
    if (!this.apiService?.getEntityDelta) return;

    try {
      const changes = await this.apiService.getEntityDelta(entityType, since);

      for (const serverEntity of changes.updated || []) {
        const existing = await this.db.findByServerId(entityType, serverEntity.id);
        if (existing) {
          await this.db.upsert(entityType, this.mapServerToLocal(serverEntity));
        } else {
          await this.db.insert(entityType, this.mapServerToLocal(serverEntity));
        }
        await this.cache.invalidateEntity(entityType, serverEntity.id);
      }

      for (const serverId of changes.deleted || []) {
        const entity = await this.db.findByServerId(entityType, serverId);
        if (entity) {
          await this.db.delete(entityType, (entity as any).id);
          await this.cache.invalidateEntity(entityType, serverId);
        }
      }

      await this.setLastSyncTimestamp(entityType, Date.now());

    } catch (error) {
      console.error(`[SyncEngine] Error pulling ${entityType} changes:`, error);
    }
  }

  // ==========================================================================
  // CONFLICT HANDLING
  // ==========================================================================

  /**
   * Gère un conflit entre versions locale et serveur
   */
  private async handleConflict<T extends BaseEntity>(
    entityType: EntityTable,
    local: T,
    server: T,
    conflictType: ConflictType
  ): Promise<T> {
    const strategy = this.config.entityStrategies[entityType] || this.config.conflictStrategy;

    console.log(`[SyncEngine] Conflict ${conflictType} for ${entityType}:${local.id}, resolving with ${strategy}`);

    // Émettre un événement de conflit pour l'UI
    const conflictInfo: ConflictInfo<T> = {
      type: conflictType,
      localEntity: local,
      serverEntity: server,
      localVersion: local.version,
      serverVersion: server.version,
      resolvedWith: strategy,
    };

    this.reactive.emit(entityType, 'conflict', conflictInfo, {
      entityId: local.id,
      source: 'sync',
    });

    try {
      const resolved = this.conflictResolver.resolve(local, server, strategy);
      conflictInfo.resolvedEntity = resolved;
      return resolved;
    } catch (error) {
      if (error instanceof ConflictRequiresManualResolution) {
        // Stocker le conflit pour résolution manuelle
        await this.storeUnresolvedConflict(entityType, local, server);
        // Retourner la version serveur par défaut
        return server;
      }
      throw error;
    }
  }

  private async storeUnresolvedConflict(
    entityType: EntityTable,
    local: any,
    server: any
  ): Promise<void> {
    await this.db.setMetadata(`conflict:${entityType}:${local.id}`, {
      local,
      server,
      timestamp: Date.now(),
    });
  }

  /**
   * Récupère les conflits non résolus
   */
  async getUnresolvedConflicts(): Promise<ConflictInfo[]> {
    // Implémentation basée sur les métadonnées stockées
    // À étendre selon les besoins
    return [];
  }

  /**
   * Résout manuellement un conflit
   */
  async resolveConflict<T extends BaseEntity>(
    entityType: EntityTable,
    entityId: string,
    resolution: 'local' | 'server' | 'merge',
    mergedData?: Partial<T>
  ): Promise<void> {
    const conflictData = await this.db.getMetadata(`conflict:${entityType}:${entityId}`);
    if (!conflictData) return;

    let resolved: T;

    switch (resolution) {
      case 'local':
        resolved = conflictData.local;
        break;
      case 'server':
        resolved = conflictData.server;
        break;
      case 'merge':
        resolved = { ...conflictData.server, ...mergedData } as T;
        break;
    }

    await this.db.upsert(entityType, resolved);
    await this.db.setMetadata(`conflict:${entityType}:${entityId}`, null);

    this.reactive.emit(entityType, 'updated', resolved, {
      entityId,
      source: 'local',
    });
  }

  // ==========================================================================
  // TIMESTAMP MANAGEMENT
  // ==========================================================================

  async getLastSyncTimestamp(entityType?: EntityTable): Promise<number> {
    if (entityType) {
      const timestamp = await this.db.getMetadata<number>(`lastSync:${entityType}`);
      return timestamp || 0;
    }
    return this.syncStatus.lastSyncTime || 0;
  }

  async setLastSyncTimestamp(entityType: EntityTable, timestamp: number): Promise<void> {
    await this.db.setMetadata(`lastSync:${entityType}`, timestamp);
  }

  // ==========================================================================
  // BACKGROUND SYNC
  // ==========================================================================

  /**
   * Démarre la synchronisation périodique
   */
  startBackgroundSync(intervalMs?: number): void {
    this.stopBackgroundSync();

    const interval = intervalMs || this.config.syncInterval;

    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncStatus.state !== 'syncing') {
        this.synchronize();
      }
    }, interval);

    console.log(`[SyncEngine] Background sync started (interval: ${interval}ms)`);
  }

  /**
   * Arrête la synchronisation périodique
   */
  stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[SyncEngine] Background sync stopped');
    }
  }

  // ==========================================================================
  // STATUS
  // ==========================================================================

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  isSyncing(): boolean {
    return this.syncStatus.state === 'syncing';
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private mapServerToLocal(serverEntity: any): any {
    return {
      ...serverEntity,
      serverId: serverEntity.id,
      id: serverEntity.id, // Sera remplacé par l'ID local si existant
      syncStatus: 'synced',
      version: serverEntity.version || 1,
    };
  }

  private createEmptyResult(): SyncResult {
    return {
      success: false,
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
      duration: 0,
    };
  }

  /**
   * Configure le moteur de sync
   */
  configure(config: Partial<SyncEngineConfig>): void {
    this.config = { ...this.config, ...config };

    // Redémarrer le background sync si nécessaire
    if (this.syncInterval && config.syncInterval) {
      this.startBackgroundSync(config.syncInterval);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let instance: SyncEngine | null = null;

export function getSyncEngine(): SyncEngine {
  if (!instance) {
    instance = new SyncEngine();
  }
  return instance;
}

export const syncEngine = getSyncEngine();

export { ConflictResolver, ConflictRequiresManualResolution };
export default SyncEngine;
