import { useState, useCallback, useMemo, useRef } from 'react';
import { UnifiedSearchFilters } from '@/types/FilterType';
import { getPropertyService, Property, PropertyFilters, PropertyConnection } from '@/services/api/propertyService';
import { getServiceMarketplaceService, ServiceFilters } from '@/services/api/serviceMarketplaceService';

interface SearchState {
  properties: Property[];
  services: any[];
  loading: boolean;
  error: string | null;
}

export const useSearch = (filters: UnifiedSearchFilters) => {
  const [state, setState] = useState<SearchState>({
    properties: [],
    services: [],
    loading: false,
    error: null
  });

  const [lastQuery, setLastQuery] = useState('');

  // Ref for canceling obsolete requests
  const searchIdRef = useRef(0);

  // Store filters in a ref
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // API services (instantiated once)
  const propertyService = useMemo(() => getPropertyService(), []);
  const serviceMarketplace = useMemo(() => getServiceMarketplaceService(), []);

  // Direct search function — reads filters from ref, never recreated
  const performDirectSearch = useCallback(async (
    query: string,
    searchId: number
  ): Promise<{ properties: Property[]; services: any[] } | null> => {
    const currentFilters = filtersRef.current;
    const searchType = currentFilters.searchType;

    console.log(`🔍 [HybridSearch] Search #${searchId} - query="${query}" type=${searchType}`);

    const results: { properties: Property[]; services: any[] } = {
      properties: [],
      services: []
    };

    try {
      const promises: Promise<void>[] = [];

      // Property search
      if (searchType === 'properties' || searchType === 'both') {
        const propertyPromise = (async () => {
          try {
            let propertyResult: PropertyConnection;

            if (query.trim().length > 0) {
              console.log('🏠 [HybridSearch] searchProperties query:', query);
              propertyResult = await propertyService.searchProperties(
                query.trim(),
                {},
                { page: 1, limit: 50 }
              );
            } else {
              console.log('🏠 [HybridSearch] getProperties with filters');
              const propFilters: PropertyFilters = {
                minPrice: currentFilters.property.minPrice || 0,
                maxPrice: currentFilters.property.maxPrice || 999999,
                minSurface: currentFilters.property.minSurface || 0,
                minRooms: currentFilters.property.rooms || 0,
                propertyType: currentFilters.property.type || undefined,
                actionType: (currentFilters.property.actionType === 'sale' ? 'sell' : 'rent') as 'rent' | 'sell',
              };
              propertyResult = await propertyService.getProperties(propFilters, { page: 1, limit: 50 });
            }

            if (searchIdRef.current !== searchId) return;

            results.properties = propertyResult?.edges?.map(edge => edge.node) ?? [];
            console.log(`✅ [HybridSearch] Properties: ${results.properties.length}`);
          } catch (err: any) {
            console.error('❌ [HybridSearch] Property error:', err?.message || err);
            if (err?.code === 'UNAUTHENTICATED' || err?.code === 'FORBIDDEN') throw err;
          }
        })();
        promises.push(propertyPromise);
      }

      // Service search
      if (searchType === 'services' || searchType === 'both') {
        const servicePromise = (async () => {
          try {
            let serviceResult: any;

            if (query.trim().length > 0) {
              console.log('🔧 [HybridSearch] searchServices query:', query);
              serviceResult = await serviceMarketplace.searchServices(query.trim());
            } else {
              console.log('🔧 [HybridSearch] getAllServices with filters');
              const servFilters: ServiceFilters = {};
              const sf = currentFilters.service;
              if (sf.category) servFilters.category = sf.category as any;
              if (sf.contractType) servFilters.contractType = sf.contractType as any;
              if (sf.location) servFilters.location = sf.location;
              if (sf.rating && sf.rating > 0) servFilters.rating = sf.rating;
              if (sf.isEmergency) servFilters.isEmergency = sf.isEmergency;
              serviceResult = await serviceMarketplace.getServices(servFilters);
            }

            if (searchIdRef.current !== searchId) return;

            if (serviceResult?.edges) {
              results.services = serviceResult.edges.map((edge: any) => edge.node);
            } else if (Array.isArray(serviceResult)) {
              results.services = serviceResult;
            } else if (serviceResult?.services) {
              results.services = serviceResult.services;
            }

            console.log(`✅ [HybridSearch] Services: ${results.services.length}`);
          } catch (err: any) {
            console.error('❌ [HybridSearch] Service error:', err?.message || err);
          }
        })();
        promises.push(servicePromise);
      }

      await Promise.all(promises);

      if (searchIdRef.current !== searchId) {
        console.log(`⏭️ [HybridSearch] Search #${searchId} discarded`);
        return null;
      }

      return results;

    } catch (error) {
      console.error('❌ [HybridSearch] Fatal error:', error);
      throw error;
    }
  }, [propertyService, serviceMarketplace]);

  const search = useCallback(async (query: string) => {
    const currentSearchId = ++searchIdRef.current;

    console.log(`🚀 [HybridSearch] New search #${currentSearchId} - "${query}"`);

    setLastQuery(query);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const results = await performDirectSearch(query, currentSearchId);

      if (results === null) return; // canceled

      setState({
        properties: results.properties,
        services: results.services,
        loading: false,
        error: null
      });

      console.log(`✅ [HybridSearch] #${currentSearchId} done — props:${results.properties.length} svcs:${results.services.length}`);

    } catch (error) {
      if (searchIdRef.current === currentSearchId) {
        setState({
          properties: [],
          services: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Erreur de recherche'
        });
      }
    }
  }, [performDirectSearch]);

  const applyFilters = useCallback(async () => {
    await search(lastQuery);
  }, [search, lastQuery]);

  const refresh = useCallback(async () => {
    await search(lastQuery);
  }, [search, lastQuery]);

  const totalCount = useMemo(() => {
    return state.properties.length + state.services.length;
  }, [state.properties.length, state.services.length]);

  return {
    properties: state.properties,
    services: state.services,
    totalCount,
    loading: state.loading,
    error: state.error,
    search,
    applyFilters,
    refresh
  };
};
