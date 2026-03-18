/**
 * useProperties - Hook migré vers la nouvelle architecture offline-first
 *
 * Utilise:
 * - useCachedQuery pour le pattern SWR (Stale-While-Revalidate)
 * - useInfiniteQuery pour la pagination
 * - Réactivité automatique avec invalidation de cache
 * - Support offline complet
 */

import { useState, useCallback, useMemo } from 'react';
import { useCachedQuery, useInfiniteQuery } from './offline/useCachedQuery';
import { useMutation } from './offline/useMutation';
import {
  getPropertyService,
  Property,
  PropertyFilters,
  PaginationInput,
  PropertyConnection,
} from '@/services/api/propertyService';

// ============================================================================
// TYPES
// ============================================================================

interface UsePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  availableCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  search: (query: string) => Promise<void>;
  applyFilters: (filters: PropertyFilters) => Promise<void>;
}

interface UsePropertiesOptions {
  filters?: PropertyFilters;
  pagination?: PaginationInput;
  autoLoad?: boolean;
}

// ============================================================================
// USE PROPERTIES HOOK (LIST)
// ============================================================================

export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesResult {
  const { filters: initialFilters, pagination: initialPagination, autoLoad = true } = options;

  const [currentFilters, setCurrentFilters] = useState<PropertyFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  const propertyService = useMemo(() => getPropertyService(), []);

  // Build unique query key based on filters and search
  const queryKey = useMemo(
    () => ['properties', JSON.stringify(currentFilters), searchQuery],
    [currentFilters, searchQuery]
  );

  // Use infinite query for paginated data with SWR pattern
  const {
    data: properties,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<Property>({
    queryKey,
    queryFn: async (page: number) => {
      const pagination: PaginationInput = {
        ...initialPagination,
        page: page + 1,
        limit: initialPagination?.limit || 20,
      };

      let result: PropertyConnection;

      if (searchQuery.trim()) {
        result = await propertyService.searchProperties(searchQuery, currentFilters, pagination);
      } else {
        result = await propertyService.getProperties(currentFilters, pagination);
      }

      // Update metadata
      setTotalCount(result.totalCount);
      setAvailableCount(result.availableCount);

      return {
        items: result.edges.map((edge) => edge.node),
        hasNextPage: result.pageInfo.hasNextPage,
      };
    },
    enabled: autoLoad,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const search = useCallback(async (query: string) => {
    setSearchQuery(query);
    // The queryKey change will trigger automatic refetch
  }, []);

  const applyFilters = useCallback(async (filters: PropertyFilters) => {
    setCurrentFilters(filters);
    // The queryKey change will trigger automatic refetch
  }, []);

  return {
    properties: properties || [],
    loading,
    error: error?.message || null,
    totalCount,
    availableCount,
    hasNextPage,
    hasPreviousPage: false,
    refresh,
    loadMore,
    search,
    applyFilters,
  };
}

// ============================================================================
// USE PROPERTY HOOK (SINGLE)
// ============================================================================

export function useProperty(id: string) {
  const propertyService = useMemo(() => getPropertyService(), []);

  const { data, loading, error, refetch, isStale } = useCachedQuery<Property | null>({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) {
        return null;
      }
      return propertyService.getProperty(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    property: data,
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

// ============================================================================
// USE SIMILAR PROPERTIES HOOK
// ============================================================================

export function useSimilarProperties(propertyId: string, limit: number = 5) {
  const propertyService = useMemo(() => getPropertyService(), []);

  const { data, loading, error, refetch } = useCachedQuery<Property[]>({
    queryKey: ['properties', 'similar', propertyId, String(limit)],
    queryFn: async () => {
      if (!propertyId) return [];
      return propertyService.getSimilarProperties(propertyId, limit);
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000, // 10 minutes for similar properties
  });

  return {
    properties: data || [],
    loading,
    error: error?.message || null,
    reload: refetch,
  };
}

// ============================================================================
// USE PROPERTY STATS HOOK
// ============================================================================

export function usePropertyStats() {
  const propertyService = useMemo(() => getPropertyService(), []);

  const { data, loading, error, refetch } = useCachedQuery<any>({
    queryKey: ['properties', 'stats'],
    queryFn: () => propertyService.getPropertyStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
  });

  return {
    stats: data,
    loading,
    error: error?.message || null,
    reload: refetch,
  };
}

// ============================================================================
// USE PROPERTY MUTATIONS
// ============================================================================

export function useCreateProperty() {
  const propertyService = useMemo(() => getPropertyService(), []);

  return useMutation<Property, Partial<Property>>({
    mutationFn: (data) => propertyService.createProperty(data),
    invalidateQueries: [['properties']],
  });
}

export function useUpdateProperty() {
  const propertyService = useMemo(() => getPropertyService(), []);

  return useMutation<Property, { id: string; data: Partial<Property> }>({
    mutationFn: ({ id, data }) => propertyService.updateProperty(id, data),
    invalidateQueries: [['properties']],
  });
}

export function useDeleteProperty() {
  const propertyService = useMemo(() => getPropertyService(), []);

  return useMutation<boolean, string>({
    mutationFn: (id) => propertyService.deleteProperty(id),
    invalidateQueries: [['properties']],
  });
}
