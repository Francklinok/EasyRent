/**
 * Types partagés pour l'architecture offline-first
 *
 * Ce fichier définit toutes les interfaces et types utilisés
 * par les services UnifiedCache, UnifiedDatabase, SyncEngine, etc.
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Tables disponibles dans la base de données unifiée
 */
export type EntityTable =
  | 'properties'
  | 'activities'
  | 'wallet'
  | 'transactions'
  | 'favorites'
  | 'services'
  | 'service_subscriptions'
  | 'notifications'
  | 'conversations'
  | 'messages'
  | 'users'
  | 'sync_queue'
  | 'metadata';

/**
 * Statut de synchronisation d'une entité
 */
export type SyncStatusType = 'pending' | 'synced' | 'failed' | 'conflict';

/**
 * Interface de base pour toutes les entités
 */
export interface BaseEntity {
  id: string;
  serverId?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatusType;
  syncError?: string;
  version: number;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

/**
 * Entrée dans le cache avec métadonnées
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  version: number;
  entityType: EntityTable | string;
  dependencies: string[];
  ttl: number;
}

/**
 * Options pour définir une entrée dans le cache
 */
export interface CacheSetOptions {
  ttl?: number;
  entityType?: EntityTable | string;
  dependencies?: string[];
}

/**
 * Options pour récupérer une entrée du cache
 */
export interface CacheGetOptions {
  maxAge?: number;
  ignoreStale?: boolean;
}

/**
 * Configuration du cache par type d'entité
 */
export interface CacheEntityConfig {
  ttl: number;
  maxEntries?: number;
  dependencies?: EntityTable[];
}

/**
 * Configuration globale du cache
 */
export interface CacheConfig {
  maxMemoryEntries: number;
  maxAsyncStorageSize: number;
  defaultTTL: number;
  entityConfigs: Record<string, CacheEntityConfig>;
  evictionBatchSize: number;
}

/**
 * Statistiques d'utilisation du cache
 */
export interface CacheStats {
  memoryEntries: number;
  estimatedMemoryBytes: number;
  hitCount: number;
  missCount: number;
  evictionCount: number;
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

/**
 * Options de requête pour la base de données
 */
export interface QueryOptions {
  where?: Record<string, any>;
  orderBy?: { field: string; direction: 'ASC' | 'DESC' };
  limit?: number;
  offset?: number;
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageInfo: PageInfo;
}

/**
 * Informations de pagination
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

/**
 * Paramètres de requête
 */
export interface QueryParams {
  filters?: Record<string, any>;
  pagination?: PaginationInput;
  orderBy?: { field: string; direction: 'ASC' | 'DESC' };
}

/**
 * Input de pagination
 */
export interface PaginationInput {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Changement en attente de sync
 */
export interface PendingChange {
  id: string;
  entityType: EntityTable;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

// ============================================================================
// QUEUE TYPES
// ============================================================================

/**
 * Priorités des actions dans la queue
 */
export const QueuePriority = {
  CRITICAL: 100,  // Paiements, signatures de contrat
  HIGH: 80,       // Messages, activités
  NORMAL: 50,     // Propriétés, services
  LOW: 20,        // Analytics, préférences
  BACKGROUND: 10, // Uploads d'images, logs
} as const;

export type QueuePriorityValue = typeof QueuePriority[keyof typeof QueuePriority];

/**
 * Actions supportées par la queue
 */
export type QueueAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';

/**
 * Item dans la queue offline
 */
export interface QueueItem {
  id: string;
  entityType: EntityTable;
  entityId: string;
  action: QueueAction;
  data: any;
  previousState?: any;
  priority: QueuePriorityValue;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: number;
  backoffMultiplier: number;
  createdAt: number;
  lastAttemptAt?: number;
  error?: string;
  batchId?: string;
}

/**
 * Résultat du traitement de la queue
 */
export interface QueueProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  retried: number;
  errors: Array<{ itemId: string; error: string }>;
}

/**
 * Configuration du backoff exponentiel
 */
export interface BackoffConfig {
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  jitter: number;
}

// ============================================================================
// SYNC TYPES
// ============================================================================

/**
 * État de la synchronisation
 */
export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';

/**
 * Statut complet de synchronisation
 */
export interface SyncStatus {
  state: SyncState;
  lastSyncTime: number | null;
  pendingCount: number;
  failedCount: number;
  error?: string;
  progress?: {
    current: number;
    total: number;
  };
}

/**
 * Changements delta depuis le serveur
 */
export interface DeltaChanges<T = any> {
  created: T[];
  updated: T[];
  deleted: string[];
  timestamp: number;
}

/**
 * Résultat d'une synchronisation
 */
export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
  duration: number;
}

/**
 * Résultat du push des changements
 */
export interface PushResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ entityId: string; error: string }>;
}

// ============================================================================
// CONFLICT TYPES
// ============================================================================

/**
 * Types de conflits détectables
 */
export type ConflictType =
  | 'VERSION_MISMATCH'
  | 'CONCURRENT_EDIT'
  | 'DELETED_LOCALLY'
  | 'DELETED_REMOTELY';

/**
 * Stratégies de résolution de conflits
 */
export type ConflictStrategy =
  | 'LAST_WRITE_WINS'
  | 'SERVER_WINS'
  | 'CLIENT_WINS'
  | 'MERGE'
  | 'MANUAL';

/**
 * Information sur un conflit
 */
export interface ConflictInfo<T = any> {
  type: ConflictType;
  localEntity: T;
  serverEntity: T;
  localVersion: number;
  serverVersion: number;
  resolvedWith?: ConflictStrategy;
  resolvedEntity?: T;
}

/**
 * Version vector pour la détection de conflits
 */
export interface VersionVector {
  [deviceId: string]: number;
}

// ============================================================================
// REACTIVE LAYER TYPES
// ============================================================================

/**
 * Types d'événements de données
 */
export type DataEventType = 'created' | 'updated' | 'deleted' | 'synced' | 'conflict' | 'invalidated';

/**
 * Événement de changement de données
 */
export interface DataChangeEvent<T = any> {
  entityType: EntityTable;
  eventType: DataEventType;
  entityId: string;
  data: T;
  previousData?: T;
  timestamp: number;
  source: 'local' | 'remote' | 'sync';
}

/**
 * Callback pour les subscriptions
 */
export type DataChangeCallback<T = any> = (event: DataChangeEvent<T>) => void;

/**
 * Dépendance entre entités
 */
export interface EntityDependency {
  type: EntityTable;
  id?: string;
}

// ============================================================================
// REPOSITORY TYPES
// ============================================================================

/**
 * Configuration d'un repository
 */
export interface RepositoryConfig<T> {
  entityType: EntityTable;
  cacheKeyPrefix: string;
  defaultTTL: number;
  conflictStrategy: ConflictStrategy;
  idField?: string;
  apiService: ApiServiceInterface<T>;
}

/**
 * Interface du service API pour un repository
 */
export interface ApiServiceInterface<T> {
  getOne: (id: string) => Promise<T>;
  getMany: (params: QueryParams) => Promise<{
    edges: Array<{ node: T }>;
    pageInfo: PageInfo;
    totalCount: number;
  }>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<boolean>;
}

/**
 * Options pour getById
 */
export interface GetByIdOptions {
  forceRefresh?: boolean;
  includeDeleted?: boolean;
}

/**
 * Options pour getMany
 */
export interface GetManyOptions extends QueryParams {
  forceRefresh?: boolean;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * Options pour useCachedQuery
 */
export interface UseCachedQueryOptions<T> {
  queryKey: string | string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Résultat de useCachedQuery
 */
export interface UseCachedQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
}

/**
 * Options pour useMutation
 */
export interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => Promise<TData | void>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, rollback?: TData) => void;
  onSettled?: (data: TData | undefined, error: Error | null) => void;
  invalidateQueries?: string[];
  optimisticUpdate?: boolean;
}

/**
 * Résultat de useMutation
 */
export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: TData | null;
  reset: () => void;
}

// ============================================================================
// OBSERVABLE TYPES
// ============================================================================

/**
 * Interface Observable simplifiée
 */
export interface Observable<T> {
  subscribe: (callback: (value: T) => void) => () => void;
  getValue: () => T;
}

/**
 * BehaviorSubject simplifié
 */
export interface BehaviorSubject<T> extends Observable<T> {
  next: (value: T) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Rend certaines propriétés optionnelles
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extrait le type de données d'un résultat paginé
 */
export type ExtractData<T> = T extends PaginatedResult<infer U> ? U : never;

/**
 * Type pour les ID temporaires
 */
export type TempId = `temp_${string}`;

/**
 * Vérifie si un ID est temporaire
 */
export function isTempId(id: string): id is TempId {
  return id.startsWith('temp_');
}

/**
 * Génère un ID temporaire unique
 */
export function generateTempId(): TempId {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * TTL par défaut par type d'entité (en ms)
 */
export const DEFAULT_ENTITY_TTLS: Record<EntityTable, number> = {
  properties: 5 * 60 * 1000,      // 5 minutes
  activities: 2 * 60 * 1000,      // 2 minutes
  wallet: 1 * 60 * 1000,          // 1 minute
  transactions: 2 * 60 * 1000,    // 2 minutes
  favorites: 10 * 60 * 1000,      // 10 minutes
  services: 5 * 60 * 1000,        // 5 minutes
  service_subscriptions: 5 * 60 * 1000,
  notifications: 30 * 1000,       // 30 secondes
  conversations: 1 * 60 * 1000,   // 1 minute
  messages: 30 * 1000,            // 30 secondes
  users: 15 * 60 * 1000,          // 15 minutes
  sync_queue: 0,                  // Pas de cache
  metadata: 60 * 60 * 1000,       // 1 heure
};

/**
 * Configuration par défaut du backoff
 */
export const DEFAULT_BACKOFF_CONFIG: BackoffConfig = {
  initialDelayMs: 1000,
  maxDelayMs: 5 * 60 * 1000,  // 5 minutes max
  multiplier: 1.5,
  jitter: 0.1,                 // 10% randomization
};

/**
 * Nombre max de retries par défaut
 */
export const DEFAULT_MAX_RETRIES = 5;

/**
 * Intervalle de sync par défaut (en ms)
 */
export const DEFAULT_SYNC_INTERVAL = 30 * 1000; // 30 secondes
