import { useState, useEffect, useCallback } from 'react';
import {
  getActivityService,
  Activity,
  ActivityFilters,
  ActivityStats,
  ActivityStatus,
  ActivityType,
  CreateActivityInput,
  UpdateActivityInput,
  ActivityConnection,
  PaginationInput,
  TimeRangeInput
} from '@/services/api/activityService';

interface UseActivitiesResult {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  createActivity: (input: CreateActivityInput) => Promise<Activity | null>;
  updateActivity: (id: string, input: UpdateActivityInput) => Promise<Activity | null>;
  updateActivityStatus: (id: string, status: ActivityStatus, reason?: string) => Promise<Activity | null>;
  processPayment: (activityId: string, amount: number, paymentMethod?: string) => Promise<Activity | null>;
  cancelActivity: (id: string, reason: string) => Promise<Activity | null>;
}

interface UseActivityResult {
  activity: Activity | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateActivity: (input: UpdateActivityInput) => Promise<Activity | null>;
  updateStatus: (status: ActivityStatus, reason?: string) => Promise<Activity | null>;
}

interface UseActivityStatsResult {
  stats: ActivityStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseRecentActivitiesResult {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  pendingCount: number;
}

/**
 * Hook pour gérer plusieurs activités avec filtres et pagination
 */
export function useActivities(
  filters?: ActivityFilters,
  pagination?: PaginationInput
): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const activityService = getActivityService();

  const loadActivities = useCallback(async (
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const paginationInput = {
        ...pagination,
        page,
        limit: pagination?.limit || 20
      };

      const result = await activityService.getActivities(filters, paginationInput);
      const newActivities = result.edges.map(edge => edge.node);

      if (append) {
        setActivities(prev => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
      }

      setTotalCount(result.totalCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [activityService, filters, pagination]);

  const refresh = useCallback(async () => {
    await loadActivities(1, false);
  }, [loadActivities]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;
    await loadActivities(currentPage + 1, true);
  }, [hasNextPage, loading, currentPage, loadActivities]);

  const createActivity = useCallback(async (input: CreateActivityInput): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.createActivity(input);

      // Refresh the list
      await refresh();

      return activity;
    } catch (err) {
      console.error('Error creating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService, refresh]);

  const updateActivity = useCallback(async (id: string, input: UpdateActivityInput): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.updateActivity(id, input);

      // Update the local list
      setActivities(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...activity } : item
        )
      );

      return activity;
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  const updateActivityStatus = useCallback(async (
    id: string,
    status: ActivityStatus,
    reason?: string
  ): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.updateActivityStatus(id, status, reason);

      // Update the local list
      setActivities(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...activity } : item
        )
      );

      return activity;
    } catch (err) {
      console.error('Error updating activity status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  const processPayment = useCallback(async (
    activityId: string,
    amount: number,
    paymentMethod?: string
  ): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.processPayment(activityId, amount, paymentMethod);

      // Update the local list
      setActivities(prev =>
        prev.map(item =>
          item.id === activityId ? { ...item, ...activity } : item
        )
      );

      return activity;
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  const cancelActivity = useCallback(async (id: string, reason: string): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.cancelActivity(id, reason);

      // Update the local list
      setActivities(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...activity } : item
        )
      );

      return activity;
    } catch (err) {
      console.error('Error canceling activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel activity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    activities,
    loading,
    error,
    totalCount,
    hasNextPage,
    refresh,
    loadMore,
    createActivity,
    updateActivity,
    updateActivityStatus,
    processPayment,
    cancelActivity
  };
}

/**
 * Hook pour gérer une activité spécifique
 */
export function useActivity(id: string): UseActivityResult {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activityService = getActivityService();

  const loadActivity = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const result = await activityService.getActivity(id);
      setActivity(result);
    } catch (err) {
      console.error('Error loading activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [activityService, id]);

  const refresh = useCallback(async () => {
    await loadActivity();
  }, [loadActivity]);

  const updateActivity = useCallback(async (input: UpdateActivityInput): Promise<Activity | null> => {
    if (!id) return null;

    try {
      setLoading(true);
      const updatedActivity = await activityService.updateActivity(id, input);
      setActivity(updatedActivity);
      return updatedActivity;
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService, id]);

  const updateStatus = useCallback(async (
    status: ActivityStatus,
    reason?: string
  ): Promise<Activity | null> => {
    if (!id) return null;

    try {
      setLoading(true);
      const updatedActivity = await activityService.updateActivityStatus(id, status, reason);
      setActivity(prev => prev ? { ...prev, ...updatedActivity } : null);
      return updatedActivity;
    } catch (err) {
      console.error('Error updating activity status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService, id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  return {
    activity,
    loading,
    error,
    refresh,
    updateActivity,
    updateStatus
  };
}

/**
 * Hook pour récupérer les activités d'un utilisateur
 */
export function useUserActivities(
  userId: string,
  filters?: ActivityFilters,
  pagination?: PaginationInput
): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const activityService = getActivityService();

  const loadActivities = useCallback(async (
    page: number = 1,
    append: boolean = false
  ) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const paginationInput = {
        ...pagination,
        page,
        limit: pagination?.limit || 20
      };

      const result = await activityService.getUserActivities(userId, paginationInput, filters);
      const newActivities = result.edges.map(edge => edge.node);

      if (append) {
        setActivities(prev => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
      }

      setTotalCount(result.totalCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading user activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user activities');
    } finally {
      setLoading(false);
    }
  }, [activityService, userId, filters, pagination]);

  const refresh = useCallback(async () => {
    await loadActivities(1, false);
  }, [loadActivities]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;
    await loadActivities(currentPage + 1, true);
  }, [hasNextPage, loading, currentPage, loadActivities]);

  const createActivity = useCallback(async (input: CreateActivityInput): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.createActivity(input);
      await refresh();
      return activity;
    } catch (err) {
      console.error('Error creating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService, refresh]);

  const updateActivity = useCallback(async (id: string, input: UpdateActivityInput): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.updateActivity(id, input);

      setActivities(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...activity } : item
        )
      );

      return activity;
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  const updateActivityStatus = useCallback(async (
    id: string,
    status: ActivityStatus,
    reason?: string
  ): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.updateActivityStatus(id, status, reason);

      setActivities(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...activity } : item
        )
      );

      return activity;
    } catch (err) {
      console.error('Error updating activity status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  const processPayment = useCallback(async (
    activityId: string,
    amount: number,
    paymentMethod?: string
  ): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.processPayment(activityId, amount, paymentMethod);

      setActivities(prev =>
        prev.map(item =>
          item.id === activityId ? { ...item, ...activity } : item
        )
      );

      return activity;
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  const cancelActivity = useCallback(async (id: string, reason: string): Promise<Activity | null> => {
    try {
      setLoading(true);
      const activity = await activityService.cancelActivity(id, reason);

      setActivities(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...activity } : item
        )
      );

      return activity;
    } catch (err) {
      console.error('Error canceling activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel activity');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    activities,
    loading,
    error,
    totalCount,
    hasNextPage,
    refresh,
    loadMore,
    createActivity,
    updateActivity,
    updateActivityStatus,
    processPayment,
    cancelActivity
  };
}

/**
 * Hook pour récupérer les statistiques d'activités
 */
export function useActivityStats(
  userId?: string,
  propertyId?: string,
  timeRange?: TimeRangeInput
): UseActivityStatsResult {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activityService = getActivityService();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await activityService.getActivityStats(userId, propertyId, timeRange);
      setStats(result);
    } catch (err) {
      console.error('Error loading activity stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity stats');
    } finally {
      setLoading(false);
    }
  }, [activityService, userId, propertyId, timeRange]);

  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh
  };
}

/**
 * Hook pour récupérer les activités récentes et le nombre d'activités en attente
 */
export function useRecentActivities(
  userId: string,
  limit: number = 10
): UseRecentActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const activityService = getActivityService();

  const loadRecentActivities = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [recentActivities, pendingActivitiesCount] = await Promise.all([
        activityService.getRecentActivities(userId, limit),
        activityService.getPendingActivitiesCount(userId)
      ]);

      setActivities(recentActivities);
      setPendingCount(pendingActivitiesCount);
    } catch (err) {
      console.error('Error loading recent activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  }, [activityService, userId, limit]);

  const refresh = useCallback(async () => {
    await loadRecentActivities();
  }, [loadRecentActivities]);

  useEffect(() => {
    loadRecentActivities();
  }, [loadRecentActivities]);

  return {
    activities,
    loading,
    error,
    refresh,
    pendingCount
  };
}