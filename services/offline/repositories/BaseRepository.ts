/**
 * BaseRepository - Classe abstraite pour le pattern Repository
 *
 * Encapsule la logique:
 * - Cache (RAM + AsyncStorage)
 * - Database (SQLite)
 * - API (GraphQL/REST)
 *
 * Fonctionnalités:
 * - Lecture offline-first (cache → DB → API)
 * - Écriture optimiste avec queue
 * - Observables pour les subscriptions UI
 * - Gestion automatique de la synchronisation
 */

import NetInfo from '@react-native-community/netinfo';
import {
  EntityTable,
  BaseEntity,
  RepositoryConfig,
  QueryParams,
  PaginatedResult,
  PageInfo,
  GetByIdOptions,
  GetManyOptions,
  Observable,
  BehaviorSubject,
  SyncStatusType,
  generateTempId,
  isTempId,
} from '../core/types';
import { getUnifiedCacheService, UnifiedCacheService } from '../core/UnifiedCacheService';
import { getUnifiedDatabase, UnifiedDatabase } from '../core/UnifiedDatabase';
import { getOfflineQueueService, OfflineQueueService } from '../core/OfflineQueueService';
import { getReactiveDataLayer, ReactiveDataLayer } from '../core/ReactiveDataLayer';
import { getSyncEngine, SyncEngine } from '../core/SyncEngine';

// ============================================================================
// SIMPLE BEHAVIOR SUBJECT
// ============================================================================

class SimpleBehaviorSubject<T> implements BehaviorSubject<T> {
  private value: T;
  private subscribers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  next(value: T): void {
    this.value = value;
    this.subscribers.forEach((callback) => callback(value));
  }

  getValue(): T {
    return this.value;
  }

  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.add(callback);
    callback(this.value);
    return () => this.subscribers.delete(callback);
  }
}

// ============================================================================
// BASE REPOSITORY
// ============================================================================

export abstract class BaseRepository<T extends BaseEntity> {
  protected cache: UnifiedCacheService;
  protected db: UnifiedDatabase;
  protected queue: OfflineQueueService;
  protected sync: SyncEngine;
  protected reactive: ReactiveDataLayer;
  protected config: RepositoryConfig<T>;

  // Observables pour les subscriptions UI
  private entitySubjects: Map<string, SimpleBehaviorSubject<T | null>> = new Map();
  private listSubjects: Map<string, SimpleBehaviorSubject<T[]>> = new Map();

  // État de connexion
  private _isOnline = true;

  constructor(config: RepositoryConfig<T>) {
    this.config = config;
    this.cache = getUnifiedCacheService();
    this.db = getUnifiedDatabase();
    this.queue = getOfflineQueueService();
    this.sync = getSyncEngine();
    this.reactive = getReactiveDataLayer();

    this.setupNetworkListener();
    this.setupReactiveSubscription();
  }

  // ==========================================================================
  // SETUP
  // ==========================================================================

  private setupNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      this._isOnline = state.isConnected ?? false;
    });
  }

  private setupReactiveSubscription(): void {
    // S'abonner aux changements pour mettre à jour les observables
    this.reactive.subscribe<T>(this.config.entityType, (event) => {
      this.handleDataChange(event);
    });
  }

  private handleDataChange(event: { eventType: string; entityId: string; data: T }): void {
    const key = event.entityId;

    // Mettre à jour l'observable d'entité si existant
    if (this.entitySubjects.has(key)) {
      const subject = this.entitySubjects.get(key)!;
      if (event.eventType === 'deleted') {
        subject.next(null);
      } else {
        subject.next(event.data);
      }
    }

    // Invalider les listes (elles seront rechargées au prochain accès)
    this.listSubjects.forEach((subject, listKey) => {
      // Marquer comme nécessitant un refresh
      // Les listes seront rechargées automatiquement
    });
  }

  // ==========================================================================
  // READ OPERATIONS (OFFLINE-FIRST)
  // ==========================================================================

  /**
   * Récupère une entité par ID (offline-first)
   * Ordre: Cache mémoire → SQLite → API
   */
  async getById(id: string, options?: GetByIdOptions): Promise<T | null> {
    const cacheKey = this.buildCacheKey(id);

    // 1. Vérifier le cache mémoire (instant)
    if (!options?.forceRefresh) {
      const cached = await this.cache.get<T>(cacheKey);
      if (cached && !this.cache.isStale(cacheKey)) {
        return cached;
      }
    }

    // 2. Vérifier SQLite (rapide)
    let dbData = await this.db.findById<T>(this.config.entityType, id);
    if (dbData && !options?.forceRefresh) {
      // Mettre en cache et retourner
      await this.cache.set(cacheKey, dbData, {
        entityType: this.config.entityType,
        ttl: this.config.defaultTTL,
      });
      return dbData;
    }

    // 3. Récupérer depuis l'API (si en ligne)
    if (await this.isOnline()) {
      try {
        const apiData = await this.config.apiService.getOne(id);
        if (apiData) {
          await this.saveToLocal(apiData);
          return apiData;
        }
      } catch (error) {
        console.error(`[${this.config.entityType}Repository] API fetch error:`, error);
        // Retourner les données locales même si stale
        return dbData;
      }
    }

    return dbData;
  }

  /**
   * Récupère plusieurs entités avec pagination (offline-first)
   */
  async getMany(options: GetManyOptions = {}): Promise<PaginatedResult<T>> {
    const cacheKey = this.buildListCacheKey(options);

    // 1. Vérifier le cache pour la liste
    if (!options.forceRefresh) {
      const cached = await this.cache.get<T[]>(cacheKey);
      if (cached && !this.cache.isStale(cacheKey)) {
        return this.buildPaginatedResult(cached, options);
      }
    }

    // 2. Requête SQLite
    const dbResults = await this.db.findMany<T>(this.config.entityType, {
      where: options.filters,
      orderBy: options.orderBy,
      limit: options.pagination?.limit,
      offset: this.calculateOffset(options.pagination),
    });

    if (dbResults.length > 0 && !options.forceRefresh) {
      await this.cache.set(cacheKey, dbResults, {
        entityType: this.config.entityType,
        ttl: this.config.defaultTTL,
      });

      if (!(await this.isOnline())) {
        return this.buildPaginatedResult(dbResults, options);
      }
    }

    // 3. Récupérer depuis l'API (si en ligne)
    if (await this.isOnline()) {
      try {
        const response = await this.config.apiService.getMany(options);
        const items = response.edges.map((e) => e.node);

        // Sauvegarder en local
        await this.db.bulkUpsert(this.config.entityType, items);
        await this.cache.set(cacheKey, items, {
          entityType: this.config.entityType,
          ttl: this.config.defaultTTL,
        });

        return {
          items,
          pageInfo: response.pageInfo,
          totalCount: response.totalCount,
        };
      } catch (error) {
        console.error(`[${this.config.entityType}Repository] API fetch error:`, error);
        // Retourner les données locales
        return this.buildPaginatedResult(dbResults, options);
      }
    }

    return this.buildPaginatedResult(dbResults, options);
  }

  /**
   * Recherche d'entités
   */
  async search(query: string, options: GetManyOptions = {}): Promise<PaginatedResult<T>> {
    // Implémenter la recherche locale puis API
    // La recherche locale peut être basique (LIKE)
    // L'API peut avoir une recherche plus avancée

    if (await this.isOnline()) {
      try {
        const response = await this.config.apiService.getMany({
          ...options,
          filters: { ...options.filters, search: query },
        });

        const items = response.edges.map((e) => e.node);
        return {
          items,
          pageInfo: response.pageInfo,
          totalCount: response.totalCount,
        };
      } catch (error) {
        console.error(`[${this.config.entityType}Repository] Search error:`, error);
      }
    }

    // Recherche locale basique
    const dbResults = await this.db.findMany<T>(this.config.entityType, {
      where: { ...options.filters },
      limit: options.pagination?.limit || 20,
    });

    // Filtrage basique côté client
    const filtered = dbResults.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
    );

    return this.buildPaginatedResult(filtered, options);
  }

  // ==========================================================================
  // WRITE OPERATIONS (OPTIMISTIC)
  // ==========================================================================

  /**
   * Crée une nouvelle entité avec mise à jour optimiste
   */
  async create(data: Partial<T>): Promise<T> {
    const tempId = generateTempId();
    const timestamp = new Date().toISOString();

    // Créer l'entité optimiste
    const optimisticEntity: T = {
      ...data,
      id: tempId,
      createdAt: timestamp,
      updatedAt: timestamp,
      syncStatus: 'pending' as SyncStatusType,
      version: 1,
    } as T;

    // 1. Sauvegarder localement immédiatement
    await this.db.insert(this.config.entityType, optimisticEntity);
    await this.cache.setEntity(this.config.entityType, tempId, optimisticEntity);

    // 2. Émettre pour l'UI
    this.reactive.emit(this.config.entityType, 'created', optimisticEntity, {
      entityId: tempId,
      source: 'local',
    });

    // 3. Envoyer à l'API ou queue
    if (await this.isOnline()) {
      try {
        const serverEntity = await this.config.apiService.create(data);
        await this.reconcileCreatedEntity(tempId, serverEntity);
        return serverEntity;
      } catch (error) {
        console.error(`[${this.config.entityType}Repository] Create API error:`, error);
        await this.queueForSync('CREATE', tempId, data);
        return optimisticEntity;
      }
    } else {
      await this.queueForSync('CREATE', tempId, data);
      return optimisticEntity;
    }
  }

  /**
   * Met à jour une entité avec mise à jour optimiste
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    // Récupérer l'état actuel pour rollback
    const previousState = await this.getById(id);

    const timestamp = new Date().toISOString();
    const optimisticUpdate: Partial<T> = {
      ...data,
      updatedAt: timestamp,
      syncStatus: 'pending' as SyncStatusType,
      version: ((previousState?.version || 0) + 1),
    };

    // 1. Mettre à jour localement
    await this.db.update(this.config.entityType, id, optimisticUpdate);
    const updatedEntity = { ...previousState, ...optimisticUpdate } as T;
    await this.cache.setEntity(this.config.entityType, id, updatedEntity);

    // 2. Émettre pour l'UI
    this.reactive.emit(this.config.entityType, 'updated', updatedEntity, {
      entityId: id,
      previousData: previousState || undefined,
      source: 'local',
    });

    // 3. Envoyer à l'API ou queue
    if (await this.isOnline()) {
      try {
        const serverEntity = await this.config.apiService.update(id, data);
        await this.saveToLocal(serverEntity);
        return serverEntity;
      } catch (error) {
        console.error(`[${this.config.entityType}Repository] Update API error:`, error);
        await this.queueForSync('UPDATE', id, data, previousState);
        return updatedEntity;
      }
    } else {
      await this.queueForSync('UPDATE', id, data, previousState);
      return updatedEntity;
    }
  }

  /**
   * Supprime une entité avec mise à jour optimiste
   */
  async delete(id: string): Promise<boolean> {
    // Récupérer l'état actuel pour rollback
    const previousState = await this.getById(id);

    // 1. Supprimer localement
    await this.db.delete(this.config.entityType, id);
    await this.cache.remove(this.buildCacheKey(id));

    // 2. Émettre pour l'UI
    this.reactive.emit(this.config.entityType, 'deleted', { id } as any, {
      entityId: id,
      previousData: previousState || undefined,
      source: 'local',
    });

    // 3. Envoyer à l'API ou queue
    if (await this.isOnline()) {
      try {
        const success = await this.config.apiService.delete(id);
        return success;
      } catch (error) {
        console.error(`[${this.config.entityType}Repository] Delete API error:`, error);
        await this.queueForSync('DELETE', id, { id }, previousState);
        return true; // Optimiste
      }
    } else {
      await this.queueForSync('DELETE', id, { id }, previousState);
      return true; // Optimiste
    }
  }

  // ==========================================================================
  // OBSERVABLES
  // ==========================================================================

  /**
   * Crée un observable pour une entité spécifique
   */
  observe(id: string): Observable<T | null> {
    if (!this.entitySubjects.has(id)) {
      const subject = new SimpleBehaviorSubject<T | null>(null);
      this.entitySubjects.set(id, subject);

      // Charger les données initiales
      this.getById(id).then((data) => {
        subject.next(data);
      });
    }

    return this.entitySubjects.get(id)!;
  }

  /**
   * Crée un observable pour une liste d'entités
   */
  observeMany(options: GetManyOptions = {}): Observable<T[]> {
    const key = this.buildListCacheKey(options);

    if (!this.listSubjects.has(key)) {
      const subject = new SimpleBehaviorSubject<T[]>([]);
      this.listSubjects.set(key, subject);

      // Charger les données initiales
      this.getMany(options).then((result) => {
        subject.next(result.items);
      });
    }

    return this.listSubjects.get(key)!;
  }

  /**
   * Force le refresh d'un observable
   */
  async refreshObservable(id: string): Promise<void> {
    const subject = this.entitySubjects.get(id);
    if (subject) {
      const data = await this.getById(id, { forceRefresh: true });
      subject.next(data);
    }
  }

  /**
   * Force le refresh d'une liste observable
   */
  async refreshListObservable(options: GetManyOptions = {}): Promise<void> {
    const key = this.buildListCacheKey(options);
    const subject = this.listSubjects.get(key);
    if (subject) {
      const result = await this.getMany({ ...options, forceRefresh: true });
      subject.next(result.items);
    }
  }

  // ==========================================================================
  // SYNC OPERATIONS
  // ==========================================================================

  /**
   * Force la synchronisation de cette entité type
   */
  async synchronize(): Promise<void> {
    await this.sync.syncEntity(this.config.entityType);
  }

  /**
   * Vérifie si des changements sont en attente
   */
  async hasPendingChanges(): Promise<boolean> {
    const items = await this.queue.getPendingByEntity(this.config.entityType);
    return items.length > 0;
  }

  /**
   * Récupère le nombre de changements en attente
   */
  async getPendingCount(): Promise<number> {
    const items = await this.queue.getPendingByEntity(this.config.entityType);
    return items.length;
  }

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================

  /**
   * Invalide le cache pour une entité
   */
  async invalidateCache(id?: string): Promise<void> {
    if (id) {
      await this.cache.invalidateEntity(this.config.entityType, id);
    } else {
      await this.cache.invalidateEntityType(this.config.entityType);
    }
  }

  /**
   * Précharge des données dans le cache
   */
  async preload(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.getById(id);
    }
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  protected async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  protected buildCacheKey(id: string): string {
    return `${this.config.cacheKeyPrefix}:${id}`;
  }

  protected buildListCacheKey(options: GetManyOptions): string {
    const parts = [this.config.cacheKeyPrefix, 'list'];

    if (options.filters) {
      parts.push(JSON.stringify(options.filters));
    }

    if (options.pagination) {
      parts.push(`p${options.pagination.page || 1}`);
      parts.push(`l${options.pagination.limit || 20}`);
    }

    return parts.join(':');
  }

  protected calculateOffset(pagination?: { page?: number; limit?: number }): number {
    if (!pagination) return 0;
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    return (page - 1) * limit;
  }

  protected buildPaginatedResult(items: T[], options: GetManyOptions): PaginatedResult<T> {
    const limit = options.pagination?.limit || 20;
    const page = options.pagination?.page || 1;

    return {
      items,
      totalCount: items.length, // Approximatif pour les données locales
      pageInfo: {
        hasNextPage: items.length === limit,
        hasPreviousPage: page > 1,
      },
    };
  }

  protected async saveToLocal(entity: T): Promise<void> {
    const localEntity = {
      ...entity,
      syncStatus: 'synced' as SyncStatusType,
    };

    await this.db.upsert(this.config.entityType, localEntity);
    await this.cache.setEntity(this.config.entityType, entity.id, localEntity);
  }

  protected async reconcileCreatedEntity(tempId: string, serverEntity: T): Promise<void> {
    // Supprimer l'entité temporaire
    await this.db.delete(this.config.entityType, tempId);
    await this.cache.remove(this.buildCacheKey(tempId));

    // Sauvegarder l'entité serveur
    await this.saveToLocal(serverEntity);

    // Notifier du changement
    this.reactive.emit(this.config.entityType, 'synced', serverEntity, {
      entityId: serverEntity.id,
      previousData: { id: tempId } as T,
      source: 'sync',
    });

    // Mettre à jour le subject si existant
    if (this.entitySubjects.has(tempId)) {
      const subject = this.entitySubjects.get(tempId)!;
      this.entitySubjects.delete(tempId);
      this.entitySubjects.set(serverEntity.id, subject);
      subject.next(serverEntity);
    }
  }

  protected async queueForSync(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityId: string,
    data: any,
    previousState?: T | null
  ): Promise<void> {
    await this.queue.enqueue({
      entityType: this.config.entityType,
      entityId,
      action,
      data,
      previousState: previousState || undefined,
    });
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Nettoie les ressources du repository
   */
  cleanup(): void {
    this.entitySubjects.clear();
    this.listSubjects.clear();
  }
}

export default BaseRepository;
