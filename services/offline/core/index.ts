/**
 * Offline Core Services Index
 *
 * Export centralisé des services core
 */

// Types
export * from './types';

// Cache Service
export {
  UnifiedCacheService,
  getUnifiedCacheService,
  unifiedCacheService,
  legacyCacheWrapper,
} from './UnifiedCacheService';

// Database
export {
  UnifiedDatabase,
  getUnifiedDatabase,
  unifiedDatabase,
} from './UnifiedDatabase';

// Reactive Data Layer
export {
  ReactiveDataLayer,
  getReactiveDataLayer,
  reactiveDataLayer,
  createObservableHook,
  isEventType,
  isEntityType,
} from './ReactiveDataLayer';

// Offline Queue
export {
  OfflineQueueService,
  getOfflineQueueService,
  offlineQueueService,
} from './OfflineQueueService';

// Sync Engine
export {
  SyncEngine,
  getSyncEngine,
  syncEngine,
  ConflictResolver,
  ConflictRequiresManualResolution,
} from './SyncEngine';
