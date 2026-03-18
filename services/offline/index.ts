/**
 * Offline Services - Main Export
 *
 * Architecture Hybride Offline-First Ultra-Performante
 *
 * Structure:
 * - core/: Services fondamentaux (cache, database, queue, sync)
 * - repositories/: Pattern Repository par entité
 *
 * Usage:
 * ```typescript
 * import {
 *   unifiedCacheService,
 *   unifiedDatabase,
 *   getPropertyRepository,
 * } from '@/services/offline';
 * ```
 */

// ============================================================================
// CORE SERVICES
// ============================================================================

// Types
export type {
  EntityTable,
  BaseEntity,
  CacheEntry,
  CacheSetOptions,
  CacheConfig,
  CacheStats,
  QueryOptions,
  PaginatedResult,
  PageInfo,
  QueryParams,
  PaginationInput,
  QueueItem,
  QueueAction,
  QueueProcessResult,
  QueuePriorityValue,
  SyncState,
  SyncStatus,
  SyncResult,
  DeltaChanges,
  ConflictType,
  ConflictStrategy,
  ConflictInfo,
  DataEventType,
  DataChangeEvent,
  DataChangeCallback,
  RepositoryConfig,
  ApiServiceInterface,
  UseCachedQueryOptions,
  UseCachedQueryResult,
  UseMutationOptions,
  UseMutationResult,
  Observable,
  BehaviorSubject,
} from './core/types';

export {
  QueuePriority,
  DEFAULT_ENTITY_TTLS,
  DEFAULT_BACKOFF_CONFIG,
  DEFAULT_MAX_RETRIES,
  DEFAULT_SYNC_INTERVAL,
  generateTempId,
  isTempId,
} from './core/types';

// Cache Service
export {
  UnifiedCacheService,
  getUnifiedCacheService,
  unifiedCacheService,
  legacyCacheWrapper,
} from './core/UnifiedCacheService';

// Database
export {
  UnifiedDatabase,
  getUnifiedDatabase,
  unifiedDatabase,
} from './core/UnifiedDatabase';

// Reactive Layer
export {
  ReactiveDataLayer,
  getReactiveDataLayer,
  reactiveDataLayer,
} from './core/ReactiveDataLayer';

// Queue Service
export {
  OfflineQueueService,
  getOfflineQueueService,
  offlineQueueService,
} from './core/OfflineQueueService';

// Sync Engine
export {
  SyncEngine,
  getSyncEngine,
  syncEngine,
  ConflictResolver,
} from './core/SyncEngine';

// ============================================================================
// REPOSITORIES
// ============================================================================

export {
  BaseRepository,
  PropertyRepository,
  getPropertyRepository,
  propertyRepository,
} from './repositories';

export type {
  Property,
  PropertyType,
  PropertyStatus,
  PropertyAddress,
  PropertyOwner,
  PropertyFilters,
} from './repositories';

// ============================================================================
// INITIALIZATION HELPER
// ============================================================================

/**
 * Initialise tous les services offline
 * À appeler au démarrage de l'application
 */
export async function initializeOfflineServices(): Promise<void> {
  console.log('[Offline] Initializing services...');

  const { unifiedCacheService } = await import('./core/UnifiedCacheService');
  const { unifiedDatabase } = await import('./core/UnifiedDatabase');
  const { syncEngine } = await import('./core/SyncEngine');

  // Initialiser le cache
  await unifiedCacheService.initialize();

  // Initialiser la database
  await unifiedDatabase.initialize();

  // Démarrer le background sync
  syncEngine.startBackgroundSync();

  console.log('[Offline] Services initialized successfully');
}

/**
 * Nettoie les ressources offline
 * À appeler lors du logout ou de la fermeture
 */
export async function cleanupOfflineServices(): Promise<void> {
  console.log('[Offline] Cleaning up services...');

  const { syncEngine } = await import('./core/SyncEngine');
  const { unifiedCacheService } = await import('./core/UnifiedCacheService');
  const { unifiedDatabase } = await import('./core/UnifiedDatabase');

  // Arrêter le background sync
  syncEngine.stopBackgroundSync();

  // Nettoyer le cache et la database avec un timeout pour éviter de bloquer le logout
  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T | void> =>
    Promise.race([promise, new Promise<void>(resolve => setTimeout(resolve, ms))]);

  try {
    await withTimeout(unifiedCacheService.clearAll(), 3000);
  } catch (e) {
    console.warn('[Offline] Cache cleanup failed:', e);
  }

  try {
    await withTimeout(unifiedDatabase.clearAll(), 3000);
  } catch (e) {
    console.warn('[Offline] Database cleanup failed:', e);
  }

  console.log('[Offline] Services cleaned up');
}
