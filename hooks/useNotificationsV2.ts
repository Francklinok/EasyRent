import { useMemo, useCallback } from 'react';
import { useCachedQuery, useMutation } from './offline';
import { getNotificationRepository, GlobalNotification } from '../services/offline/repositories';

export function useNotificationsV2(userId: string | undefined, limit = 50) {
  const repository = useMemo(() => getNotificationRepository(), []);

  const { data, loading, error, isStale, refetch } = useCachedQuery({
    queryKey: ['notifications', 'user', userId || '', String(limit)],
    queryFn: () => repository.getUserNotifications(userId as string, limit),
    enabled: !!userId,
    staleTime: 60 * 1000,
    refetchOnReconnect: true,
  });

  const notifications = (data || []) as GlobalNotification[];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const { mutateAsync: markAsReadMutation } = useMutation({
    mutationFn: ({ id }: { id: string; userId?: string }) => repository.markAsRead(id, userId),
    invalidateQueries: ['notifications'],
  });

  const { mutateAsync: markAllAsReadMutation } = useMutation({
    mutationFn: (uid: string) => repository.markAllAsRead(uid),
    invalidateQueries: ['notifications'],
  });

  const { mutateAsync: removeNotificationMutation } = useMutation({
    mutationFn: ({ id }: { id: string; userId?: string }) => repository.removeNotification(id, userId),
    invalidateQueries: ['notifications'],
  });

  const markAsRead = useCallback((id: string) => markAsReadMutation({ id, userId }), [markAsReadMutation, userId]);
  const markAllAsRead = useCallback(() => {
    if (userId) markAllAsReadMutation(userId);
  }, [markAllAsReadMutation, userId]);
  const removeNotification = useCallback((id: string) => removeNotificationMutation({ id, userId }), [removeNotificationMutation, userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error: error?.message || null,
    isStale,
    refresh: refetch,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}

export default useNotificationsV2;
