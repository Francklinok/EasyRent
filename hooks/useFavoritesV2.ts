import { useCallback, useMemo } from 'react';
import { useCachedQuery, useMutation } from './offline';
import { getFavoriteRepository, Favorite } from '../services/offline/repositories';

// ============================================================================
// USE FAVORITES HOOK (all — properties + services)
// ============================================================================

export function useFavoritesV2() {
  const repository = useMemo(() => getFavoriteRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['favorites', 'all'],
    queryFn: () => repository.getAllFavorites(),
    staleTime: 10 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    favorites: data || [],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

// ============================================================================
// USE FAVORITE PROPERTIES / SERVICES (filtered views)
// ============================================================================

export function useFavoritePropertiesV2() {
  const repository = useMemo(() => getFavoriteRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['favorites', 'properties'],
    queryFn: () => repository.getFavoriteProperties(),
    staleTime: 10 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    favorites: data || [],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

export function useFavoriteServicesV2() {
  const repository = useMemo(() => getFavoriteRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['favorites', 'services'],
    queryFn: () => repository.getFavoriteServices(),
    staleTime: 10 * 60 * 1000,
    refetchOnReconnect: true,
  });

  return {
    favorites: data || [],
    loading,
    error: error?.message || null,
    isStale,
    reload: refetch,
  };
}

// ============================================================================
// USE IS FAVORITE (single-item check, e.g. on a property/service card)
// ============================================================================

export function useIsPropertyFavoriteV2(propertyId: string) {
  const repository = useMemo(() => getFavoriteRepository(), []);

  const { data, loading, refetch } = useCachedQuery({
    queryKey: ['favorites', 'is-property', propertyId],
    queryFn: () => repository.isPropertyFavorite(propertyId),
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
  });

  return { isFavorite: !!data, loading, reload: refetch };
}

export function useIsServiceFavoriteV2(serviceId: string) {
  const repository = useMemo(() => getFavoriteRepository(), []);

  const { data, loading, refetch } = useCachedQuery({
    queryKey: ['favorites', 'is-service', serviceId],
    queryFn: () => repository.isServiceFavorite(serviceId),
    enabled: !!serviceId,
    staleTime: 10 * 60 * 1000,
  });

  return { isFavorite: !!data, loading, reload: refetch };
}

// ============================================================================
// USE TOGGLE FAVORITE MUTATIONS
// ============================================================================

export function useToggleFavoriteProperty() {
  const repository = useMemo(() => getFavoriteRepository(), []);

  return useMutation({
    mutationFn: ({ userId, propertyId }: { userId: string; propertyId: string }) =>
      repository.toggleFavoriteProperty(userId, propertyId),
    invalidateQueries: ['favorites'],
  });
}

export function useToggleFavoriteService() {
  const repository = useMemo(() => getFavoriteRepository(), []);

  return useMutation({
    mutationFn: (serviceId: string) => repository.toggleFavoriteService(serviceId),
    invalidateQueries: ['favorites'],
  });
}

export function useBulkRemoveFavoriteProperties() {
  const repository = useMemo(() => getFavoriteRepository(), []);

  return useMutation({
    mutationFn: ({ userId, propertyIds }: { userId: string; propertyIds: string[] }) =>
      repository.bulkRemoveFavoriteProperties(userId, propertyIds),
    invalidateQueries: ['favorites'],
  });
}

export default useFavoritesV2;
