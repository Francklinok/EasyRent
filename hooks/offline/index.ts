/**
 * Hooks Offline-First
 *
 * Export centralisé de tous les hooks pour l'architecture offline-first
 */

// Query hooks
export {
  useCachedQuery,
  useCachedQueries,
  useInfiniteQuery,
} from './useCachedQuery';

// Mutation hooks
export {
  useMutation,
  useOptimisticMutation,
  useMutationState,
  useSimpleMutation,
  useDeleteMutation,
} from './useMutation';

// Status hooks
export { useOfflineStatus } from './useOfflineStatus';
export { useSyncStatus } from './useSyncStatus';

// Re-export types
export type {
  UseCachedQueryOptions,
  UseCachedQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from '../../services/offline/core/types';
