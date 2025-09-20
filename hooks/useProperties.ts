import { useState, useEffect, useCallback } from 'react';
import { getPropertyService, Property, PropertyFilters, PaginationInput, PropertyConnection } from '@/services/api/propertyService';

interface UsePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  totalCount: number;
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

/**
 * Hook personnalisé pour gérer les propriétés
 */
export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<PropertyFilters>(options.filters || {});
  const [currentPagination, setCurrentPagination] = useState<PaginationInput>(
    options.pagination || { page: 1, limit: 20 }
  );

  const propertyService = getPropertyService();

  const loadProperties = useCallback(async (
    filters: PropertyFilters = currentFilters,
    pagination: PaginationInput = currentPagination,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result: PropertyConnection = await propertyService.getProperties(filters, pagination);

      const newProperties = result.edges.map(edge => edge.node);

      if (append) {
        setProperties(prev => [...prev, ...newProperties]);
      } else {
        setProperties(newProperties);
      }

      setTotalCount(result.totalCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setHasPreviousPage(result.pageInfo.hasPreviousPage);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [propertyService, currentFilters, currentPagination]);

  const refresh = useCallback(async () => {
    setCurrentPagination(prev => ({ ...prev, page: 1 }));
    await loadProperties(currentFilters, { ...currentPagination, page: 1 }, false);
  }, [loadProperties, currentFilters, currentPagination]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;

    const nextPage = (currentPagination.page || 1) + 1;
    const newPagination = { ...currentPagination, page: nextPage };
    setCurrentPagination(newPagination);
    await loadProperties(currentFilters, newPagination, true);
  }, [hasNextPage, loading, currentFilters, currentPagination, loadProperties]);

  const search = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const pagination = { ...currentPagination, page: 1 };
      const result: PropertyConnection = await propertyService.searchProperties(
        query,
        currentFilters,
        pagination
      );

      const newProperties = result.edges.map(edge => edge.node);
      setProperties(newProperties);
      setTotalCount(result.totalCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setHasPreviousPage(result.pageInfo.hasPreviousPage);
      setCurrentPagination(pagination);
    } catch (err) {
      console.error('Error searching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to search properties');
    } finally {
      setLoading(false);
    }
  }, [propertyService, currentFilters, currentPagination]);

  const applyFilters = useCallback(async (filters: PropertyFilters) => {
    setCurrentFilters(filters);
    const pagination = { ...currentPagination, page: 1 };
    setCurrentPagination(pagination);
    await loadProperties(filters, pagination, false);
  }, [loadProperties, currentPagination]);

  // Chargement initial
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadProperties();
    }
  }, []);

  return {
    properties,
    loading,
    error,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    refresh,
    loadMore,
    search,
    applyFilters
  };
}

/**
 * Hook pour récupérer une propriété spécifique
 */
export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propertyService = getPropertyService();

  const loadProperty = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const result = await propertyService.getProperty(id);
      setProperty(result);
    } catch (err) {
      console.error('Error loading property:', err);
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  }, [id, propertyService]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  return {
    property,
    loading,
    error,
    reload: loadProperty
  };
}

/**
 * Hook pour récupérer les propriétés similaires
 */
export function useSimilarProperties(propertyId: string, limit: number = 5) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propertyService = getPropertyService();

  const loadSimilarProperties = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await propertyService.getSimilarProperties(propertyId, limit);
      setProperties(result);
    } catch (err) {
      console.error('Error loading similar properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load similar properties');
    } finally {
      setLoading(false);
    }
  }, [propertyId, limit, propertyService]);

  useEffect(() => {
    loadSimilarProperties();
  }, [loadSimilarProperties]);

  return {
    properties,
    loading,
    error,
    reload: loadSimilarProperties
  };
}

/**
 * Hook pour récupérer les statistiques des propriétés
 */
export function usePropertyStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propertyService = getPropertyService();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await propertyService.getPropertyStats();
      setStats(result);
    } catch (err) {
      console.error('Error loading property stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load property stats');
    } finally {
      setLoading(false);
    }
  }, [propertyService]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats
  };
}