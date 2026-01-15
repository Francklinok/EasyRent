import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  getServiceMarketplaceService, 
  Service, 
  ServiceFilters, 
  ServiceConnection,
  PaginationInput 
} from '@/services/api/serviceMarketplaceService';

interface UseServicesOptions {
  filters?: ServiceFilters;
  pagination?: PaginationInput;
  autoLoad?: boolean;
}

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  search: (query: string) => Promise<void>;
  applyFilters: (filters: ServiceFilters) => Promise<void>;
  clearServices: () => void;
}

export const useServices = (options: UseServicesOptions = {}): UseServicesReturn => {
  const {
    filters: initialFilters = {},
    pagination: initialPagination = { first: 20 },
    autoLoad = true
  } = options;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  const filtersRef = useRef<ServiceFilters>(initialFilters);
  const paginationRef = useRef<PaginationInput>(initialPagination);
  const serviceMarketplace = getServiceMarketplaceService();

  const cacheRef = useRef<Map<string, ServiceConnection>>(new Map());
  const lastQueryRef = useRef<string>('');

  const generateCacheKey = useCallback((filters: ServiceFilters, pagination: PaginationInput, query?: string) => {
    return JSON.stringify({ filters, pagination, query });
  }, []);

  const loadServices = useCallback(async (
    filters: ServiceFilters = filtersRef.current,
    pagination: PaginationInput = paginationRef.current,
    query?: string,
    append = false
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading services with:', { filters, pagination, query });

      const cacheKey = generateCacheKey(filters, pagination, query);
      
      if (cacheRef.current.has(cacheKey) && !append) {
        const cachedResult = cacheRef.current.get(cacheKey)!;
        console.log('📦 Using cached services:', cachedResult.totalCount);
        setServices(cachedResult.edges.map(edge => edge.node));
        setTotalCount(cachedResult.totalCount);
        setHasNextPage(cachedResult.pageInfo.hasNextPage);
        setCursor(cachedResult.pageInfo.endCursor);
        setLoading(false);
        return;
      }

      let result: ServiceConnection;

      if (query && query.trim()) {
        console.log('🔍 Searching services with query:', query.trim());
        result = await serviceMarketplace.searchServices(query.trim(), filters, pagination);
        lastQueryRef.current = query.trim();
      } else {
        console.log('📋 Getting all services');
        result = await serviceMarketplace.getServices(filters, pagination);
        lastQueryRef.current = '';
      }
      
      console.log('✅ Services loaded:', result.totalCount, 'services found');
      console.log('📊 Services data:', result.edges.map(e => ({ id: e.node.id, title: e.node.title })));

      if (!append) {
        cacheRef.current.set(cacheKey, result);
      }

      const newServices = result.edges.map(edge => edge.node);

      if (append) {
        setServices(prev => [...prev, ...newServices]);
      } else {
        setServices(newServices);
      }

      setTotalCount(result.totalCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setCursor(result.pageInfo.endCursor);

      filtersRef.current = filters;
      paginationRef.current = pagination;

    } catch (err) {
      console.error('❌ Error loading services:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  }, [serviceMarketplace, generateCacheKey]);

  const refresh = useCallback(async () => {
    cacheRef.current.clear();
    setCursor(undefined);
    
    const refreshPagination = { ...paginationRef.current, after: undefined };
    await loadServices(filtersRef.current, refreshPagination, lastQueryRef.current);
  }, [loadServices]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading || !cursor) return;

    const morePagination = { ...paginationRef.current, after: cursor };
    await loadServices(filtersRef.current, morePagination, lastQueryRef.current, true);
  }, [hasNextPage, loading, cursor, loadServices]);

  const search = useCallback(async (query: string) => {
    cacheRef.current.clear();
    setCursor(undefined);
    const searchPagination = { ...paginationRef.current, after: undefined };
    await loadServices(filtersRef.current, searchPagination, query);
  }, [loadServices]);

  const applyFilters = useCallback(async (filters: ServiceFilters) => {
    setCursor(undefined);
    const filterPagination = { ...paginationRef.current, after: undefined };
    await loadServices(filters, filterPagination, lastQueryRef.current);
  }, [loadServices]);

  const clearServices = useCallback(() => {
    setServices([]);
    setTotalCount(0);
    setHasNextPage(false);
    setCursor(undefined);
    setError(null);
    cacheRef.current.clear();
    lastQueryRef.current = '';
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadServices();
    }
  }, [autoLoad, loadServices]);

  useEffect(() => {
    return () => {
      cacheRef.current.clear();
    };
  }, []);

  return {
    services,
    loading,
    error,
    totalCount,
    hasNextPage,
    refresh,
    loadMore,
    search,
    applyFilters,
    clearServices,
  };
};