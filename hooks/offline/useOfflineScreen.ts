/**
 * useOfflineScreen — Universal offline-first hook for any screen.
 *
 * Wraps useCachedQuery with a standardised API:
 *   - Shows cached data instantly while fetching in background
 *   - Provides isOffline flag so screens can render a banner
 *   - Provides offlineFallback: true when data comes from cache with no network
 *   - Retry on reconnect without extra setup
 *
 * Usage:
 *   const { data, loading, error, isOffline, refetch } = useOfflineScreen({
 *     queryKey: ['wallet', userId],
 *     queryFn: () => walletService.getWallet(),
 *     staleTime: 2 * 60 * 1000,
 *   });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getUnifiedCacheService } from '../../services/offline/core/UnifiedCacheService';

export interface OfflineScreenOptions<T> {
  queryKey: string | string[];
  queryFn: () => Promise<T>;
  /** ms before cached data is considered stale. Default: 5 min */
  staleTime?: number;
  /** If false the hook does nothing. Default: true */
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

export interface OfflineScreenResult<T> {
  data: T | null;
  loading: boolean;
  /** True only when fetching in background (data already displayed) */
  isFetching: boolean;
  error: Error | null;
  /** True when device has no internet */
  isOffline: boolean;
  /** True when data is served from cache because network is unavailable */
  offlineFallback: boolean;
  refetch: () => Promise<void>;
}

const keyString = (key: string | string[]) =>
  Array.isArray(key) ? key.join(':') : key;

// Global dedup map
const pending = new Map<string, Promise<any>>();

export function useOfflineScreen<T>(
  options: OfflineScreenOptions<T>
): OfflineScreenResult<T> {
  const {
    queryKey,
    queryFn,
    staleTime = 5 * 60 * 1000,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const cacheKey = keyString(queryKey);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineFallback, setOfflineFallback] = useState(false);

  const mounted = useRef(true);
  const reqId = useRef(0);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const cache = getUnifiedCacheService();

  const fetch = useCallback(
    async (force = false): Promise<void> => {
      if (!enabled) return;

      // Dedup
      if (!force && pending.has(cacheKey)) {
        try { await pending.get(cacheKey); } catch { /* ignore */ }
        return;
      }

      const id = ++reqId.current;

      const promise = (async () => {
        try {
          if (!mounted.current) return;

          // 1 — Serve cache immediately (first load only)
          if (!force) {
            try {
              const cached = await Promise.race([
                cache.get<T>(cacheKey),
                new Promise<null>(r => setTimeout(() => r(null), 800)),
              ]);
              if (cached !== null && mounted.current && id === reqId.current) {
                setData(cached);
                setLoading(false);
              }
            } catch { /* cache miss is fine */ }
          }

          // 2 — Check connectivity
          const netState = await NetInfo.fetch();
          const online = !!(netState.isConnected && netState.isInternetReachable !== false);
          if (mounted.current) setIsOffline(!online);

          if (!online) {
            // No network — keep cached data, flag as offline fallback
            if (mounted.current) {
              setOfflineFallback(true);
              setLoading(false);
              setIsFetching(false);
            }
            return;
          }

          // 3 — Network fetch
          if (mounted.current) setIsFetching(true);
          const result = await queryFnRef.current();

          if (id !== reqId.current || !mounted.current) return;

          setData(result);
          setError(null);
          setOfflineFallback(false);
          setLoading(false);

          // 4 — Persist to cache
          cache.set(cacheKey, result, { ttl: staleTime }).catch(() => {});

          onSuccess?.(result);
        } catch (err) {
          if (id !== reqId.current || !mounted.current) return;
          const e = err instanceof Error ? err : new Error(String(err));
          setError(e);
          setLoading(false);
          onError?.(e);
        } finally {
          pending.delete(cacheKey);
          if (id === reqId.current && mounted.current) setIsFetching(false);
        }
      })();

      pending.set(cacheKey, promise);
      await promise;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey, enabled, staleTime]
  );

  // Initial load
  useEffect(() => {
    mounted.current = true;
    if (enabled) fetch();
    return () => { mounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, enabled]);

  // Refetch on reconnect
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      if (mounted.current) setIsOffline(!online);
      if (online && offlineFallback && mounted.current) {
        fetch(true);
      }
    });
    return () => unsub();
  }, [fetch, offlineFallback]);

  const refetch = useCallback(() => fetch(true), [fetch]);

  return { data, loading, isFetching, error, isOffline, offlineFallback, refetch };
}

export default useOfflineScreen;
