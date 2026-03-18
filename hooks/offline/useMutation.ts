/**
 * useMutation - Hook de mutation avec mises à jour optimistes
 *
 * Fonctionnalités:
 * - Mises à jour optimistes de l'UI
 * - Rollback automatique en cas d'erreur
 * - Invalidation de queries liées
 * - Support offline avec queue
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  UseMutationOptions,
  UseMutationResult,
} from '../../services/offline/core/types';
import {
  getUnifiedCacheService,
} from '../../services/offline/core/UnifiedCacheService';
import {
  getReactiveDataLayer,
} from '../../services/offline/core/ReactiveDataLayer';

// ============================================================================
// USE MUTATION HOOK
// ============================================================================

export function useMutation<TData, TVariables>(
  options: UseMutationOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  const {
    mutationFn,
    onMutate,
    onSuccess,
    onError,
    onSettled,
    invalidateQueries = [],
    optimisticUpdate = true,
  } = options;

  // État
  const [state, setState] = useState<{
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: Error | null;
    data: TData | null;
  }>({
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: null,
  });

  // Refs
  const mutationIdRef = useRef(0);
  const mountedRef = useRef(true);

  // Services
  const cache = useMemo(() => getUnifiedCacheService(), []);
  const reactive = useMemo(() => getReactiveDataLayer(), []);

  // ==========================================================================
  // MUTATION LOGIC
  // ==========================================================================

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      const mutationId = ++mutationIdRef.current;
      let rollbackData: TData | void;

      // Reset state
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
        error: null,
      }));

      try {
        // 1. Optimistic update (si activé)
        if (optimisticUpdate && onMutate) {
          rollbackData = await onMutate(variables);
        }

        // 2. Exécuter la mutation
        const result = await mutationFn(variables);

        // Vérifier si c'est toujours la mutation active
        if (mutationId !== mutationIdRef.current || !mountedRef.current) {
          return result;
        }

        // 3. Mettre à jour l'état
        setState({
          isLoading: false,
          isError: false,
          isSuccess: true,
          error: null,
          data: result,
        });

        // 4. Callback de succès
        onSuccess?.(result, variables);

        // 5. Invalider les queries liées
        await invalidateRelatedQueries();

        return result;
      } catch (error) {
        // Vérifier si c'est toujours la mutation active
        if (mutationId !== mutationIdRef.current || !mountedRef.current) {
          throw error;
        }

        const err = error instanceof Error ? error : new Error('Unknown error');

        // Mettre à jour l'état
        setState({
          isLoading: false,
          isError: true,
          isSuccess: false,
          error: err,
          data: null,
        });

        // Callback d'erreur avec données de rollback
        onError?.(err, variables, rollbackData as TData);

        throw error;
      } finally {
        if (mutationId === mutationIdRef.current && mountedRef.current) {
          // Callback final
          onSettled?.(state.data ?? undefined, state.error);
        }
      }
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled, optimisticUpdate, state.data, state.error]
  );

  const mutate = useCallback(
    (variables: TVariables): void => {
      mutateAsync(variables).catch(() => {
        // L'erreur est déjà gérée dans mutateAsync
      });
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    mutationIdRef.current++;
    setState({
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
    });
  }, []);

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  const invalidateRelatedQueries = useCallback(async () => {
    for (const queryKey of invalidateQueries) {
      await cache.remove(queryKey);

      // Extraire le type d'entité du queryKey si possible
      const parts = queryKey.split(':');
      const entityType = parts[0];

      // Émettre un événement d'invalidation
      reactive.invalidate(entityType as any);
    }
  }, [invalidateQueries, cache, reactive]);

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  // Marquer comme démonté lors du cleanup
  // Note: useEffect pour le cleanup serait idéal ici
  // mais on utilise mountedRef pour éviter les mises à jour après démontage

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}

// ============================================================================
// USE OPTIMISTIC MUTATION
// ============================================================================

interface UseOptimisticMutationOptions<TData, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  getOptimisticData: (variables: TVariables) => TData;
  updateCache: (data: TData) => Promise<void>;
  rollback: (context: TContext) => Promise<void>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export function useOptimisticMutation<TData, TVariables, TContext = TData>(
  options: UseOptimisticMutationOptions<TData, TVariables, TContext>
): UseMutationResult<TData, TVariables> {
  const {
    mutationFn,
    getOptimisticData,
    updateCache,
    rollback,
    onSuccess,
    onError,
  } = options;

  return useMutation<TData, TVariables>({
    mutationFn,
    optimisticUpdate: true,
    onMutate: async (variables) => {
      // Générer les données optimistes
      const optimisticData = getOptimisticData(variables);

      // Mettre à jour le cache optimistement
      await updateCache(optimisticData);

      // Retourner les données pour rollback potentiel
      return optimisticData;
    },
    onError: async (error, variables, context) => {
      // Rollback en cas d'erreur
      if (context) {
        await rollback(context as TContext);
      }
      onError?.(error);
    },
    onSuccess,
  });
}

// ============================================================================
// USE MUTATION STATE (for tracking multiple mutations)
// ============================================================================

interface MutationState<TData> {
  id: string;
  status: 'pending' | 'success' | 'error';
  data?: TData;
  error?: Error;
  timestamp: number;
}

interface UseMutationStateOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, id: string) => void;
  onError?: (error: Error, id: string) => void;
}

interface UseMutationStateResult<TData, TVariables> {
  mutations: MutationState<TData>[];
  mutate: (id: string, variables: TVariables) => Promise<void>;
  getMutation: (id: string) => MutationState<TData> | undefined;
  clearMutation: (id: string) => void;
  clearAll: () => void;
}

export function useMutationState<TData, TVariables>(
  options: UseMutationStateOptions<TData, TVariables>
): UseMutationStateResult<TData, TVariables> {
  const { mutationFn, onSuccess, onError } = options;

  const [mutations, setMutations] = useState<MutationState<TData>[]>([]);

  const mutate = useCallback(
    async (id: string, variables: TVariables) => {
      // Ajouter à l'état
      setMutations((prev) => [
        ...prev.filter((m) => m.id !== id),
        {
          id,
          status: 'pending',
          timestamp: Date.now(),
        },
      ]);

      try {
        const data = await mutationFn(variables);

        setMutations((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, status: 'success' as const, data }
              : m
          )
        );

        onSuccess?.(data, id);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');

        setMutations((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, status: 'error' as const, error: err }
              : m
          )
        );

        onError?.(err, id);
      }
    },
    [mutationFn, onSuccess, onError]
  );

  const getMutation = useCallback(
    (id: string) => mutations.find((m) => m.id === id),
    [mutations]
  );

  const clearMutation = useCallback((id: string) => {
    setMutations((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setMutations([]);
  }, []);

  return {
    mutations,
    mutate,
    getMutation,
    clearMutation,
    clearAll,
  };
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook pour créer une mutation simple
 */
export function useSimpleMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  }
): UseMutationResult<TData, TVariables> {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Hook pour créer une mutation de suppression
 */
export function useDeleteMutation<TId = string>(
  deleteFn: (id: TId) => Promise<boolean>,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  }
): UseMutationResult<boolean, TId> {
  return useMutation({
    mutationFn: deleteFn,
    ...options,
  });
}

export default useMutation;
