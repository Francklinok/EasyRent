/**
 * useCachedQuery - Hook de requête avec Stale-While-Revalidate
 *
 * Fonctionnalités:
 * - Request deduplication (même queryKey = 1 requête)
 * - Stale-while-revalidate pattern
 * - Subscription automatique à ReactiveDataLayer
 * - Refetch on reconnect
 * - Support offline avec données cachées
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import {
  UseCachedQueryOptions,
  UseCachedQueryResult,
  EntityTable,
} from '../../services/offline/core/types';
import {
  getUnifiedCacheService,
} from '../../services/offline/core/UnifiedCacheService';
import {
  getReactiveDataLayer,
} from '../../services/offline/core/ReactiveDataLayer';

// ============================================================================
// REQUEST DEDUPLICATION
// ============================================================================

const pendingRequests = new Map<string, Promise<any>>();

function getQueryKeyString(queryKey: string | string[]): string {
  return Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
}

// ============================================================================
// USE CACHED QUERY HOOK
// ============================================================================

export function useCachedQuery<T>(
  options: UseCachedQueryOptions<T>
): UseCachedQueryResult<T> {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes par défaut
    cacheTime,
    refetchOnMount = true,
    refetchOnReconnect = true,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  // État
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Refs
  const requestIdRef = useRef(0);
  const initialLoadDone = useRef(false);
  const lastFetchTime = useRef<number>(0);
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Services
  const cache = useMemo(() => getUnifiedCacheService(), []);
  const reactive = useMemo(() => getReactiveDataLayer(), []);

  const queryKeyString = useMemo(
    () => getQueryKeyString(queryKey),
    [queryKey]
  );

  // ==========================================================================
  // FETCH LOGIC
  // ==========================================================================

  // Use ref for queryFn to avoid recreating fetchData on every render
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetchData = useCallback(
    async (force = false): Promise<T | null> => {
      if (!enabled) return null;

      // Vérifier si une requête est déjà en cours (deduplication)
      if (!force && pendingRequests.has(queryKeyString)) {
        try {
          return await pendingRequests.get(queryKeyString);
        } catch {
          // La requête a échoué, on réessaie
        }
      }

      const requestId = ++requestIdRef.current;

      const promise = (async () => {
        try {
          if (!mountedRef.current) return null;

          setIsFetching(true);

          // 1. Charger depuis le cache si pas de force refresh (avec timeout)
          if (!force && !initialLoadDone.current) {
            try {
              const cachePromise = cache.get<T>(queryKeyString);
              const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
              const cached = await Promise.race([cachePromise, timeoutPromise]);

              if (cached !== null && mountedRef.current) {
                setData(cached);
                setLoading(false);
                if (cache.isStale(queryKeyString, staleTime)) {
                  setIsStale(true);
                }
              }
            } catch (cacheErr) {
              // Cache error, continue with network fetch
            }
          }

          // 2. Récupérer les nouvelles données
          const result = await queryFnRef.current();

          // Vérifier si c'est toujours la requête active
          if (requestId !== requestIdRef.current || !mountedRef.current) {
            return result;
          }

          // 3. Mettre à jour l'état
          setData(result);
          setError(null);
          setIsStale(false);
          initialLoadDone.current = true;
          lastFetchTime.current = Date.now();

          // 4. Sauvegarder en cache
          await cache.set(queryKeyString, result, {
            ttl: cacheTime || staleTime,
          });

          // 5. Callback de succès
          onSuccess?.(result);

          return result;
        } catch (err) {
          if (requestId !== requestIdRef.current || !mountedRef.current) {
            return null;
          }

          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
          initialLoadDone.current = true; // Marquer comme terminé même en cas d'erreur
          onError?.(error);

          // Garder les anciennes données en cas d'erreur
          // (stale-while-revalidate)

          return null;
        } finally {
          pendingRequests.delete(queryKeyString);
          if (requestId === requestIdRef.current && mountedRef.current) {
            setLoading(false);
            setIsFetching(false);
          }
        }
      })();

      pendingRequests.set(queryKeyString, promise);
      return promise;
    },
    [queryKeyString, enabled, staleTime, cacheTime, cache, onSuccess, onError]
  );

  // ==========================================================================
  // REFETCH & INVALIDATE
  // ==========================================================================

  const refetch = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(async (): Promise<void> => {
    await cache.remove(queryKeyString);
    setIsStale(true);
    await fetchData(true);
  }, [cache, queryKeyString, fetchData]);

  // ==========================================================================
  // INITIAL LOAD
  // ==========================================================================

  useEffect(() => {
    mountedRef.current = true;

    if (enabled && refetchOnMount) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, refetchOnMount, fetchData]);

  // ==========================================================================
  // QUERY KEY CHANGE
  // ==========================================================================

  useEffect(() => {
    if (enabled && initialLoadDone.current) {
      // Reset et recharger pour le nouveau queryKey
      initialLoadDone.current = false;
      setLoading(true);
      fetchData();
    }
  }, [queryKeyString]);

  // ==========================================================================
  // STALE TIMER
  // ==========================================================================

  useEffect(() => {
    if (!data || !staleTime) return;

    const timeUntilStale = staleTime - (Date.now() - lastFetchTime.current);

    if (timeUntilStale <= 0) {
      setIsStale(true);
      return;
    }

    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setIsStale(true);
      }
    }, timeUntilStale);

    return () => clearTimeout(timer);
  }, [data, staleTime]);

  // ==========================================================================
  // REFETCH INTERVAL
  // ==========================================================================

  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    refetchIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchData(true);
      }
    }, refetchInterval);

    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData]);

  // ==========================================================================
  // NETWORK RECONNECT
  // ==========================================================================

  useEffect(() => {
    if (!refetchOnReconnect || !enabled) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && isStale && mountedRef.current) {
        fetchData(true);
      }
    });

    return () => unsubscribe();
  }, [refetchOnReconnect, enabled, isStale, fetchData]);

  // ==========================================================================
  // APP STATE (refetch on focus)
  // ==========================================================================

  useEffect(() => {
    if (!enabled) return;

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active' && isStale && mountedRef.current) {
        fetchData(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled, isStale, fetchData]);

  // ==========================================================================
  // REACTIVE SUBSCRIPTION
  // ==========================================================================

  useEffect(() => {
    if (!enabled) return;

    // Extraire le type d'entité du queryKey si possible
    const parts = queryKeyString.split(':');
    const entityType = parts[0] as EntityTable;

    const unsubscribe = reactive.subscribe(entityType, (event) => {
      if (event.eventType === 'invalidated' || event.eventType === 'updated') {
        // Marquer comme stale et refetch
        setIsStale(true);
        if (mountedRef.current) {
          fetchData(true);
        }
      }
    });

    return () => unsubscribe();
  }, [enabled, queryKeyString, reactive, fetchData]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    data,
    loading: loading && !initialLoadDone.current,
    error,
    isStale,
    isFetching,
    refetch,
    invalidate,
  };
}

// ============================================================================
// USE CACHED QUERIES (MULTIPLE)
// ============================================================================

interface UseCachedQueriesOptions<T> {
  queries: Array<{
    queryKey: string | string[];
    queryFn: () => Promise<T>;
    enabled?: boolean;
  }>;
  staleTime?: number;
}

interface UseCachedQueriesResult<T> {
  data: (T | null)[];
  loading: boolean;
  errors: (Error | null)[];
  isAnyStale: boolean;
  refetchAll: () => Promise<void>;
}

export function useCachedQueries<T>(
  options: UseCachedQueriesOptions<T>
): UseCachedQueriesResult<T> {
  const results = options.queries.map((query) =>
    useCachedQuery({
      queryKey: query.queryKey,
      queryFn: query.queryFn,
      enabled: query.enabled,
      staleTime: options.staleTime,
    })
  );

  const data = results.map((r) => r.data);
  const errors = results.map((r) => r.error);
  const loading = results.some((r) => r.loading);
  const isAnyStale = results.some((r) => r.isStale);

  const refetchAll = useCallback(async () => {
    await Promise.all(results.map((r) => r.refetch()));
  }, [results]);

  return {
    data,
    loading,
    errors,
    isAnyStale,
    refetchAll,
  };
}

// ============================================================================
// USE INFINITE QUERY
// ============================================================================

interface UseInfiniteQueryOptions<T> {
  queryKey: string | string[];
  queryFn: (page: number) => Promise<{ items: T[]; hasNextPage: boolean }>;
  enabled?: boolean;
  staleTime?: number;
}

interface UseInfiniteQueryResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInfiniteQuery<T>(
  options: UseInfiniteQueryOptions<T>
): UseInfiniteQueryResult<T> {
  const { queryKey, queryFn, enabled = true, staleTime } = options;

  const [pages, setPages] = useState<T[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const mountedRef = useRef(true);
  const initialLoadDone = useRef(false);
  const cache = useMemo(() => getUnifiedCacheService(), []);
  const queryKeyString = useMemo(() => getQueryKeyString(queryKey), [queryKey]);

  // Use ref for queryFn to avoid recreating fetchPage on every render
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetchPage = useCallback(
    async (page: number, append = false) => {
      if (!enabled) return;

      try {
        if (page === 0) {
          setLoading(true);
        } else {
          setIsFetchingNextPage(true);
        }

        const result = await queryFnRef.current(page);

        if (!mountedRef.current) return;

        if (append) {
          setPages((prev) => [...prev, result.items]);
        } else {
          setPages([result.items]);
        }

        setHasNextPage(result.hasNextPage);
        setCurrentPage(page);
        setError(null);
        initialLoadDone.current = true;

        // Cache la première page
        if (page === 0) {
          await cache.set(queryKeyString, result.items, {
            ttl: staleTime,
          });
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          initialLoadDone.current = true;
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setIsFetchingNextPage(false);
        }
      }
    },
    [enabled, cache, queryKeyString, staleTime]
  );

  // Initial load - only run once when enabled changes or queryKey changes
  useEffect(() => {
    if (!enabled) return;

    mountedRef.current = true;

    // Charger depuis le cache d'abord
    (async () => {
      try {
        const cached = await cache.get<T[]>(queryKeyString);
        if (cached && mountedRef.current && !initialLoadDone.current) {
          setPages([cached]);
          setLoading(false);
        }
      } catch {
        // Cache error, continue
      }
    })();

    // Only fetch if not already done
    if (!initialLoadDone.current) {
      fetchPage(0);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, queryKeyString]);

  // Reset when queryKey changes
  useEffect(() => {
    if (initialLoadDone.current) {
      initialLoadDone.current = false;
      setPages([]);
      setCurrentPage(0);
      setLoading(true);
      fetchPage(0);
    }
  }, [queryKeyString]);

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchPage(currentPage + 1, true);
  }, [hasNextPage, isFetchingNextPage, currentPage, fetchPage]);

  const refetch = useCallback(async () => {
    setPages([]);
    setCurrentPage(0);
    await fetchPage(0);
  }, [fetchPage]);

  const data = useMemo(() => pages.flat(), [pages]);

  return {
    data,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
}

export default useCachedQuery;
