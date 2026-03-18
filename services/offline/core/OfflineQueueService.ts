/**
 * OfflineQueueService - Queue offline améliorée
 *
 * Améliorations par rapport à QueueManager:
 * - Backoff exponentiel avec jitter
 * - Priorités par type d'action
 * - Batch processing pour actions similaires
 * - Stockage previousState pour rollback
 * - Max retries configurable par action
 */

import {
  EntityTable,
  QueueItem,
  QueueAction,
  QueuePriority,
  QueuePriorityValue,
  QueueProcessResult,
  BackoffConfig,
  DEFAULT_BACKOFF_CONFIG,
  DEFAULT_MAX_RETRIES,
} from './types';
import { getUnifiedDatabase } from './UnifiedDatabase';
import { getReactiveDataLayer } from './ReactiveDataLayer';

// ============================================================================
// PRIORITY MAPPING
// ============================================================================

/**
 * Map des priorités par type d'entité et action
 */
const PRIORITY_MAP: Record<EntityTable, Partial<Record<QueueAction, QueuePriorityValue>>> = {
  transactions: {
    CREATE: QueuePriority.CRITICAL,
    UPDATE: QueuePriority.CRITICAL,
  },
  wallet: {
    UPDATE: QueuePriority.CRITICAL,
  },
  activities: {
    CREATE: QueuePriority.HIGH,
    UPDATE: QueuePriority.HIGH,
    DELETE: QueuePriority.HIGH,
  },
  messages: {
    CREATE: QueuePriority.HIGH,
    DELETE: QueuePriority.HIGH,
  },
  conversations: {
    UPDATE: QueuePriority.HIGH,
  },
  properties: {
    CREATE: QueuePriority.NORMAL,
    UPDATE: QueuePriority.NORMAL,
    DELETE: QueuePriority.NORMAL,
  },
  services: {
    CREATE: QueuePriority.NORMAL,
    UPDATE: QueuePriority.NORMAL,
  },
  favorites: {
    CREATE: QueuePriority.LOW,
    DELETE: QueuePriority.LOW,
  },
  notifications: {
    UPDATE: QueuePriority.LOW,
  },
  users: {
    UPDATE: QueuePriority.NORMAL,
  },
  service_subscriptions: {
    CREATE: QueuePriority.HIGH,
    UPDATE: QueuePriority.NORMAL,
  },
  sync_queue: {},
  metadata: {},
};

/**
 * Max retries par type d'entité
 */
const MAX_RETRIES_MAP: Partial<Record<EntityTable, number>> = {
  transactions: 10,
  wallet: 10,
  activities: 7,
  messages: 5,
  properties: 5,
  favorites: 3,
  notifications: 3,
};

// ============================================================================
// OFFLINE QUEUE SERVICE
// ============================================================================

class OfflineQueueService {
  private db = getUnifiedDatabase();
  private reactive = getReactiveDataLayer();
  private backoffConfig: BackoffConfig = DEFAULT_BACKOFF_CONFIG;
  private isProcessing = false;
  private processingPromise: Promise<QueueProcessResult> | null = null;

  // ==========================================================================
  // QUEUE OPERATIONS
  // ==========================================================================

  /**
   * Ajoute un item à la queue
   */
  async enqueue(item: {
    entityType: EntityTable;
    entityId: string;
    action: QueueAction;
    data: any;
    previousState?: any;
    priority?: QueuePriorityValue;
    maxRetries?: number;
  }): Promise<string> {
    const priority = item.priority ?? this.getPriorityForAction(item.entityType, item.action);
    const maxRetries = item.maxRetries ?? this.getMaxRetriesForEntity(item.entityType);

    const id = await this.db.addToSyncQueue({
      entityType: item.entityType,
      entityId: item.entityId,
      action: item.action,
      data: item.data,
      previousState: item.previousState,
      priority,
    });

    console.log(`[OfflineQueue] Enqueued ${item.action} for ${item.entityType}:${item.entityId} (priority: ${priority})`);

    // Notifier que la queue a changé
    this.reactive.emit('sync_queue', 'created', { id, ...item }, { entityId: id });

    return id;
  }

  /**
   * Retire un item de la queue
   */
  async dequeue(id: string): Promise<void> {
    await this.db.removeFromSyncQueue(id);
    this.reactive.emit('sync_queue', 'deleted', { id }, { entityId: id });
  }

  /**
   * Récupère le prochain item à traiter
   */
  async peek(): Promise<QueueItem | null> {
    const items = await this.db.getPendingChanges();
    if (items.length === 0) return null;

    const item = items[0];
    return this.convertToQueueItem(item);
  }

  /**
   * Récupère tous les items de la queue
   */
  async getQueue(): Promise<QueueItem[]> {
    const items = await this.db.getPendingChanges();
    return items.map((item) => this.convertToQueueItem(item));
  }

  /**
   * Récupère un batch d'items à traiter
   */
  async getBatch(size: number = 10): Promise<QueueItem[]> {
    const now = Date.now();
    const allItems = await this.getQueue();

    // Filtrer les items prêts à être traités (pas en attente de retry)
    const readyItems = allItems.filter((item) => {
      if (!item.nextRetryAt) return true;
      return item.nextRetryAt <= now;
    });

    return readyItems.slice(0, size);
  }

  // ==========================================================================
  // PROCESSING
  // ==========================================================================

  /**
   * Traite toute la queue
   */
  async processQueue(
    processor: (item: QueueItem) => Promise<boolean>
  ): Promise<QueueProcessResult> {
    if (this.isProcessing && this.processingPromise) {
      return this.processingPromise;
    }

    this.isProcessing = true;
    this.processingPromise = this._processQueue(processor);

    try {
      return await this.processingPromise;
    } finally {
      this.isProcessing = false;
      this.processingPromise = null;
    }
  }

  private async _processQueue(
    processor: (item: QueueItem) => Promise<boolean>
  ): Promise<QueueProcessResult> {
    const result: QueueProcessResult = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      retried: 0,
      errors: [],
    };

    const items = await this.getBatch(20);

    for (const item of items) {
      result.processed++;

      try {
        const success = await processor(item);

        if (success) {
          await this.dequeue(item.id);
          result.succeeded++;
        } else {
          await this.handleRetry(item, 'Processing returned false');
          result.retried++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({ itemId: item.id, error: errorMessage });

        const shouldRetry = await this.handleRetry(item, errorMessage);
        if (shouldRetry) {
          result.retried++;
        } else {
          result.failed++;
        }
      }
    }

    console.log(`[OfflineQueue] Processed ${result.processed} items: ${result.succeeded} succeeded, ${result.retried} retried, ${result.failed} failed`);

    return result;
  }

  /**
   * Traite un batch d'items similaires
   */
  async processBatch(
    items: QueueItem[],
    batchProcessor: (items: QueueItem[]) => Promise<Map<string, boolean>>
  ): Promise<QueueProcessResult> {
    const result: QueueProcessResult = {
      processed: items.length,
      succeeded: 0,
      failed: 0,
      retried: 0,
      errors: [],
    };

    try {
      const results = await batchProcessor(items);

      for (const item of items) {
        const success = results.get(item.id) ?? false;

        if (success) {
          await this.dequeue(item.id);
          result.succeeded++;
        } else {
          await this.handleRetry(item, 'Batch processing failed');
          result.retried++;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch error';

      for (const item of items) {
        result.errors.push({ itemId: item.id, error: errorMessage });
        const shouldRetry = await this.handleRetry(item, errorMessage);
        if (shouldRetry) {
          result.retried++;
        } else {
          result.failed++;
        }
      }
    }

    return result;
  }

  // ==========================================================================
  // RETRY MANAGEMENT
  // ==========================================================================

  /**
   * Gère le retry d'un item avec backoff exponentiel
   */
  private async handleRetry(item: QueueItem, error: string): Promise<boolean> {
    const newRetryCount = item.retryCount + 1;
    const maxRetries = item.maxRetries || this.getMaxRetriesForEntity(item.entityType);

    if (newRetryCount >= maxRetries) {
      // Max retries atteint - marquer l'entité comme échouée
      await this.db.markAsFailed(item.entityType, item.entityId, error);
      await this.dequeue(item.id);
      console.log(`[OfflineQueue] Item ${item.id} failed after ${newRetryCount} retries`);
      return false;
    }

    // Calculer le prochain délai de retry
    const nextRetryAt = this.calculateNextRetryTime(newRetryCount);

    await this.db.updateSyncQueueRetry(item.id, error, nextRetryAt);

    console.log(`[OfflineQueue] Item ${item.id} scheduled for retry #${newRetryCount} at ${new Date(nextRetryAt).toISOString()}`);

    return true;
  }

  /**
   * Calcule le temps du prochain retry avec backoff exponentiel et jitter
   */
  private calculateNextRetryTime(retryCount: number): number {
    const { initialDelayMs, maxDelayMs, multiplier, jitter } = this.backoffConfig;

    // Backoff exponentiel
    const baseDelay = initialDelayMs * Math.pow(multiplier, retryCount);

    // Cap au maximum
    const cappedDelay = Math.min(baseDelay, maxDelayMs);

    // Ajouter du jitter pour éviter les thundering herds
    const jitterRange = cappedDelay * jitter;
    const randomJitter = (Math.random() - 0.5) * 2 * jitterRange;

    const finalDelay = Math.max(0, cappedDelay + randomJitter);

    return Date.now() + finalDelay;
  }

  /**
   * Récupère le délai de retry pour un item
   */
  getRetryDelay(item: QueueItem): number {
    if (!item.nextRetryAt) return 0;
    return Math.max(0, item.nextRetryAt - Date.now());
  }

  // ==========================================================================
  // PRIORITY MANAGEMENT
  // ==========================================================================

  /**
   * Obtient la priorité pour une action
   */
  private getPriorityForAction(
    entityType: EntityTable,
    action: QueueAction
  ): QueuePriorityValue {
    const entityPriorities = PRIORITY_MAP[entityType];
    if (entityPriorities && entityPriorities[action]) {
      return entityPriorities[action]!;
    }
    return QueuePriority.NORMAL;
  }

  /**
   * Obtient le max retries pour un type d'entité
   */
  private getMaxRetriesForEntity(entityType: EntityTable): number {
    return MAX_RETRIES_MAP[entityType] ?? DEFAULT_MAX_RETRIES;
  }

  /**
   * Met à jour la priorité d'un item
   */
  async updatePriority(id: string, priority: QueuePriorityValue): Promise<void> {
    // Note: nécessite une méthode update dans UnifiedDatabase
    // Pour l'instant, on peut supprimer et recréer
    console.log(`[OfflineQueue] Priority update for ${id} to ${priority}`);
  }

  // ==========================================================================
  // QUERY OPERATIONS
  // ==========================================================================

  /**
   * Obtient la taille de la queue
   */
  async getQueueSize(): Promise<number> {
    const items = await this.db.getPendingChanges();
    return items.length;
  }

  /**
   * Obtient les items en attente pour une entité
   */
  async getPendingByEntity(entityType: EntityTable): Promise<QueueItem[]> {
    const items = await this.db.getPendingChanges(entityType);
    return items.map((item) => this.convertToQueueItem(item));
  }

  /**
   * Obtient les items en attente pour une entité spécifique
   */
  async getPendingByEntityId(
    entityType: EntityTable,
    entityId: string
  ): Promise<QueueItem[]> {
    const allItems = await this.getPendingByEntity(entityType);
    return allItems.filter((item) => item.entityId === entityId);
  }

  /**
   * Vérifie si une entité a des changements en attente
   */
  async hasPendingChanges(entityType: EntityTable, entityId: string): Promise<boolean> {
    const items = await this.getPendingByEntityId(entityType, entityId);
    return items.length > 0;
  }

  // ==========================================================================
  // CLEANUP OPERATIONS
  // ==========================================================================

  /**
   * Supprime les items périmés
   */
  async removeStaleItems(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
    const removed = await this.db.cleanupStaleSyncItems(DEFAULT_MAX_RETRIES, maxAgeMs);
    return removed;
  }

  /**
   * Supprime les items échoués
   */
  async removeFailedItems(): Promise<number> {
    const items = await this.getQueue();
    const failedItems = items.filter(
      (item) => item.retryCount >= (item.maxRetries || DEFAULT_MAX_RETRIES)
    );

    for (const item of failedItems) {
      await this.dequeue(item.id);
    }

    return failedItems.length;
  }

  /**
   * Vide toute la queue
   */
  async clear(): Promise<void> {
    const items = await this.getQueue();
    for (const item of items) {
      await this.dequeue(item.id);
    }
    console.log('[OfflineQueue] Queue cleared');
  }

  /**
   * Alias pour clear() - pour compatibilité avec l'interface de stockage
   */
  async clearQueue(): Promise<void> {
    return this.clear();
  }

  /**
   * Alias pour getQueue() - pour compatibilité avec l'interface de stockage
   */
  async getQueueItems(): Promise<QueueItem[]> {
    return this.getQueue();
  }

  // ==========================================================================
  // ROLLBACK OPERATIONS
  // ==========================================================================

  /**
   * Effectue un rollback pour un item
   */
  async rollback(item: QueueItem): Promise<boolean> {
    if (!item.previousState) {
      console.warn(`[OfflineQueue] No previous state for rollback of ${item.id}`);
      return false;
    }

    try {
      // Restaurer l'état précédent dans la DB
      if (item.action === 'CREATE') {
        // Si c'était une création, supprimer l'entité
        await this.db.delete(item.entityType, item.entityId);
      } else if (item.action === 'UPDATE' || item.action === 'DELETE') {
        // Restaurer l'état précédent
        await this.db.upsert(item.entityType, item.previousState);
      }

      // Supprimer de la queue
      await this.dequeue(item.id);

      // Notifier du rollback
      this.reactive.emit(item.entityType, 'updated', item.previousState, {
        entityId: item.entityId,
        source: 'local',
      });

      console.log(`[OfflineQueue] Rolled back ${item.action} for ${item.entityType}:${item.entityId}`);
      return true;
    } catch (error) {
      console.error(`[OfflineQueue] Rollback failed for ${item.id}:`, error);
      return false;
    }
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private convertToQueueItem(pendingChange: any): QueueItem {
    return {
      id: pendingChange.id,
      entityType: pendingChange.entityType,
      entityId: pendingChange.entityId,
      action: pendingChange.action,
      data: pendingChange.data,
      previousState: pendingChange.previousState,
      priority: pendingChange.priority ?? QueuePriority.NORMAL,
      retryCount: pendingChange.retryCount ?? 0,
      maxRetries: pendingChange.maxRetries ?? this.getMaxRetriesForEntity(pendingChange.entityType),
      nextRetryAt: pendingChange.nextRetryAt ?? 0,
      backoffMultiplier: pendingChange.backoffMultiplier ?? this.backoffConfig.multiplier,
      createdAt: pendingChange.timestamp ?? Date.now(),
      lastAttemptAt: pendingChange.lastAttemptAt,
      error: pendingChange.error,
      batchId: pendingChange.batchId,
    };
  }

  /**
   * Configure le backoff
   */
  setBackoffConfig(config: Partial<BackoffConfig>): void {
    this.backoffConfig = { ...this.backoffConfig, ...config };
  }

  /**
   * Vérifie si la queue est en cours de traitement
   */
  isProcessingQueue(): boolean {
    return this.isProcessing;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Obtient les statistiques de la queue
   */
  async getStats(): Promise<{
    total: number;
    byEntity: Record<EntityTable, number>;
    byPriority: Record<string, number>;
    pendingRetry: number;
    readyToProcess: number;
  }> {
    const items = await this.getQueue();
    const now = Date.now();

    const byEntity: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let pendingRetry = 0;
    let readyToProcess = 0;

    for (const item of items) {
      // Par entité
      byEntity[item.entityType] = (byEntity[item.entityType] || 0) + 1;

      // Par priorité
      const priorityKey = Object.entries(QueuePriority).find(
        ([, v]) => v === item.priority
      )?.[0] || 'UNKNOWN';
      byPriority[priorityKey] = (byPriority[priorityKey] || 0) + 1;

      // En attente de retry
      if (item.nextRetryAt && item.nextRetryAt > now) {
        pendingRetry++;
      } else {
        readyToProcess++;
      }
    }

    return {
      total: items.length,
      byEntity: byEntity as Record<EntityTable, number>,
      byPriority,
      pendingRetry,
      readyToProcess,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let instance: OfflineQueueService | null = null;

export function getOfflineQueueService(): OfflineQueueService {
  if (!instance) {
    instance = new OfflineQueueService();
  }
  return instance;
}

export const offlineQueueService = getOfflineQueueService();

export default OfflineQueueService;
