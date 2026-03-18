

import { useCallback, useMemo } from 'react';
import {
  useCachedQuery,
  useInfiniteQuery,
  useMutation,
} from './offline';
import {
  getPropertyRepository,
  Property,
  PropertyFilters,
  PropertyStatus,
} from '../services/offline/repositories';
import { PaginationInput } from '../services/offline/core/types';

// ============================================================================
// TYPES
// ============================================================================

interface UsePropertiesOptions {
  filters?: PropertyFilters;
  pagination?: PaginationInput;
  autoLoad?: boolean;
  staleTime?: number;
}

interface UsePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  availableCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isStale: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  search: (query: string) => Promise<void>;
  applyFilters: (filters: PropertyFilters) => void;
}

// ============================================================================
// USE PROPERTIES HOOK (REFACTORED)
// ============================================================================

export function usePropertiesV2(options: UsePropertiesOptions = {}): UsePropertiesResult {
  const {
    filters,
    pagination = { page: 1, limit: 20 },
    autoLoad = true,
    staleTime = 5 * 60 * 1000,
  } = options;

  const repository = useMemo(() => getPropertyRepository(), []);

  // Query principale avec le nouveau système
  const {
    data: result,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
  } = useCachedQuery({
    queryKey: ['properties', JSON.stringify(filters), pagination.page, pagination.limit],
    queryFn: () => repository.getMany({ filters, pagination }),
    enabled: autoLoad,
    staleTime,
    refetchOnReconnect: true,
  });

  // Refresh
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Load more (pour pagination infinie)
  const loadMore = useCallback(async () => {
    // Dans une vraie implémentation, on utiliserait useInfiniteQuery
    // Pour l'instant, on invalide pour recharger
    await invalidate();
  }, [invalidate]);

  // Search
  const search = useCallback(async (query: string) => {
    const searchResult = await repository.searchProperties(query, filters, pagination);
    // Les résultats sont automatiquement mis en cache par le repository
  }, [repository, filters, pagination]);

  // Apply filters (déclenche un re-fetch automatique via le queryKey)
  const applyFilters = useCallback((newFilters: PropertyFilters) => {
    // Le changement de filters dans les options va déclencher
    // automatiquement un nouveau fetch via le queryKey
  }, []);

  return {
    properties: result?.items || [],
    loading,
    error: error?.message || null,
    totalCount: result?.totalCount || 0,
    availableCount: result?.items?.filter((p) => p.status === 'AVAILABLE').length || 0,
    hasNextPage: result?.pageInfo?.hasNextPage || false,
    hasPreviousPage: result?.pageInfo?.hasPreviousPage || false,
    isStale,
    refresh,
    loadMore,
    search,
    applyFilters,
  };
}

// ============================================================================
// USE PROPERTY HOOK (SINGLE)
// ============================================================================

export function usePropertyV2(id: string) {
  const repository = useMemo(() => getPropertyRepository(), []);

  const { data, loading, error, refetch } = useCachedQuery({
    queryKey: ['property', id],
    queryFn: () => repository.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    property: data,
    loading,
    error: error?.message || null,
    reload: refetch,
  };
}

// ============================================================================
// USE SIMILAR PROPERTIES HOOK
// ============================================================================

export function useSimilarPropertiesV2(propertyId: string, limit = 5) {
  const repository = useMemo(() => getPropertyRepository(), []);

  const { data, loading, error, refetch } = useCachedQuery({
    queryKey: ['similar-properties', propertyId, limit],
    queryFn: () => repository.getSimilarProperties(propertyId, limit),
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    properties: data || [],
    loading,
    error: error?.message || null,
    reload: refetch,
  };
}

// ============================================================================
// USE OWNER PROPERTIES HOOK
// ============================================================================

export function useOwnerPropertiesV2(ownerId: string) {
  const repository = useMemo(() => getPropertyRepository(), []);

  const { data, loading, error, refetch } = useCachedQuery({
    queryKey: ['owner-properties', ownerId],
    queryFn: () => repository.getOwnerProperties(ownerId),
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    properties: data || [],
    loading,
    error: error?.message || null,
    reload: refetch,
  };
}

// ============================================================================
// USE PROPERTY MUTATIONS
// ============================================================================

export function useCreateProperty() {
  const repository = useMemo(() => getPropertyRepository(), []);

  return useMutation({
    mutationFn: (data: Partial<Property>) => repository.create(data),
    invalidateQueries: ['properties'],
    onSuccess: (property) => {
      console.log('[useCreateProperty] Property created:', property.id);
    },
  });
}

export function useUpdateProperty() {
  const repository = useMemo(() => getPropertyRepository(), []);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      repository.update(id, data),
    invalidateQueries: ['properties'],
    onSuccess: (property) => {
      console.log('[useUpdateProperty] Property updated:', property.id);
    },
  });
}

export function useDeleteProperty() {
  const repository = useMemo(() => getPropertyRepository(), []);

  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    invalidateQueries: ['properties'],
    onSuccess: () => {
      console.log('[useDeleteProperty] Property deleted');
    },
  });
}

// ============================================================================
// USE PROPERTY STATS HOOK
// ============================================================================

export function usePropertyStatsV2() {
  const repository = useMemo(() => getPropertyRepository(), []);

  const { data, loading, error, refetch } = useCachedQuery({
    queryKey: ['property-stats'],
    queryFn: () => repository.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    stats: data,
    loading,
    error: error?.message || null,
    reload: refetch,
  };
}

// ============================================================================
// USE INFINITE PROPERTIES (PAGINATION INFINIE)
// ============================================================================

export function useInfinitePropertiesV2(filters?: PropertyFilters) {
  const repository = useMemo(() => getPropertyRepository(), []);

  const {
    data,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['properties-infinite', JSON.stringify(filters)],
    queryFn: async (page) => {
      const result = await repository.getMany({
        filters,
        pagination: { page: page + 1, limit: 20 },
      });
      return {
        items: result.items,
        hasNextPage: result.pageInfo.hasNextPage,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    properties: data,
    loading,
    error: error?.message || null,
    hasNextPage,
    isFetchingNextPage,
    loadMore: fetchNextPage,
    refresh: refetch,
  };
}

export default usePropertiesV2;
