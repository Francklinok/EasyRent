import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getNotificationService,
  NotificationType,
  NotificationPayload,
} from '@/services/api/notificationService';
import { useRouter } from 'expo-router';
import { cacheService, CACHE_KEYS } from '@/services/cache/cacheService';

// Conditional import to avoid Expo Go SDK 53+ error
let Notifications: any;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('⚠️ expo-notifications not available in this environment');
  Notifications = null;
}

export interface UseNotificationsReturn {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  sendNotification: (userId: string | string[], payload: NotificationPayload) => Promise<boolean>;
  sendLocalNotification: (payload: NotificationPayload) => Promise<string>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  clearBadge: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les notifications
 */
export function useNotifications(userId?: string): UseNotificationsReturn {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationService = useRef(getNotificationService()).current;
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const initialLoadDone = useRef(false);

  // Load cached notifications instantly on mount (offline-first)
  useEffect(() => {
    const loadCached = async () => {
      const [cachedNotifs, cachedCount] = await Promise.all([
        cacheService.get<any[]>(CACHE_KEYS.NOTIFICATIONS_LIST),
        cacheService.get<number>(CACHE_KEYS.NOTIFICATIONS_UNREAD),
      ]);
      if (!initialLoadDone.current) {
        if (cachedNotifs && cachedNotifs.length > 0) {
          setNotifications(cachedNotifs);
        }
        if (cachedCount !== null) {
          setUnreadCount(cachedCount);
        }
      }
    };
    loadCached();
  }, []);

  /**
   * Load user notifications
   */
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      if (notifications.length === 0) {
        setLoading(true);
      }
      const [notifs, count] = await Promise.all([
        notificationService.getUserNotifications(userId, 50),
        notificationService.getUnreadCount(userId),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
      initialLoadDone.current = true;

      // Persist to cache
      await Promise.all([
        cacheService.set(CACHE_KEYS.NOTIFICATIONS_LIST, notifs),
        cacheService.set(CACHE_KEYS.NOTIFICATIONS_UNREAD, count),
      ]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, notificationService, notifications.length]);

  /**
   * Send a notification
   */
  const sendNotification = useCallback(
    async (targetUserId: string | string[], payload: NotificationPayload): Promise<boolean> => {
      try {
        const success = await notificationService.sendNotification(targetUserId, payload);
        if (success) {
          console.log('✅ Notification sent:', payload.title);
        }
        return success;
      } catch (error) {
        console.error('Error sending notification:', error);
        return false;
      }
    },
    [notificationService]
  );

  /**
   * Send a local notification
   */
  const sendLocalNotification = useCallback(
    async (payload: NotificationPayload): Promise<string> => {
      try {
        const id = await notificationService.sendLocalNotification(payload);
        console.log('✅ Local notification sent:', id);
        return id;
      } catch (error) {
        console.error('Error sending local notification:', error);
        throw error;
      }
    },
    [notificationService]
  );

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [notificationService]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId, notificationService]);

  /**
   * Clear application badge
   */
  const clearBadge = useCallback(async () => {
    await notificationService.clearBadge();
  }, [notificationService]);

  /**
   * Refresh notifications
   */
  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  /**
   * Handle navigation when clicking on a notification
   */
  const handleNotificationResponse = useCallback(
    (response: any) => {
      if (!response?.notification?.request?.content?.data) {
        return;
      }

      const data = response.notification.request.content.data;

      console.log('📱 Notification clicked:', data);

      // Navigation based on notification type
      if (data.type === NotificationType.PROPERTY_VIEWED && data.propertyId) {
        router.push(`/info/${data.propertyId}`);
      } else if (data.type === NotificationType.MESSAGE_RECEIVED && data.conversationId) {
        router.push(`/(tabs)/ChatList?conversationId=${data.conversationId}`);
      } else if (data.type === NotificationType.BOOKING_REQUEST && data.propertyId) {
        router.push(`/info/${data.propertyId}`);
      } else if (data.type === NotificationType.VISIT_SCHEDULED && data.visitId) {
        router.push('/Activity' as any);
      } else if (data.type === NotificationType.PAYMENT_RECEIVED && data.transactionId) {
        router.push('/wallet/Wallet' as any);
      } else if (data.actionUrl) {
        // Custom URL
        router.push(data.actionUrl as any);
      }

      // Mark as read
      if (data.notificationId) {
        markAsRead(data.notificationId);
      }
    },
    [router, markAsRead]
  );

  /**
   * Initialize notification listeners
   */
  useEffect(() => {
    // Initialize service
    notificationService.initialize();

    // Register push token if userId available
    if (userId) {
      notificationService.registerPushToken(userId);
      loadNotifications();
    }

    // Listen for notifications received in foreground
    notificationListener.current =
      notificationService.addNotificationReceivedListener((notification) => {
        console.log('📬 Notification received:', notification);
        // Refresh notification list
        if (userId) {
          loadNotifications();
        }
      });

    // Listen for notification clicks
    responseListener.current =
      notificationService.addNotificationResponseReceivedListener(handleNotificationResponse);

    // Cleanup
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId, notificationService, loadNotifications, handleNotificationResponse]);

  return {
    notifications,
    unreadCount,
    loading,
    sendNotification,
    sendLocalNotification,
    markAsRead,
    markAllAsRead,
    refresh,
    clearBadge,
  };
}

/**
 * Helper functions to quickly create notifications
 */
export const NotificationHelpers = {
  /**
   * Property viewed notification
   */
  propertyViewed: (propertyId: string, propertyTitle: string): NotificationPayload => ({
    type: NotificationType.PROPERTY_VIEWED,
    title: 'New view',
    message: `A user is viewing your property "${propertyTitle}"`,
    propertyId,
    propertyTitle,
    priority: 'normal',
  }),

  /**
   * Property created notification
   */
  propertyCreated: (propertyId: string, propertyTitle: string): NotificationPayload => ({
    type: NotificationType.PROPERTY_CREATED,
    title: 'Property created',
    message: `Your property "${propertyTitle}" has beenyTitle}" a été créée avec succès`,
    propertyId,
    propertyTitle,
    priority: 'normal',
  }),

  /**
   * Notification de création de service
   */
  serviceCreated: (serviceId: string, serviceTitle: string): NotificationPayload => ({
    type: NotificationType.SERVICE_CREATED,
    title: 'Service créé',
    message: `Votre service "${serviceTitle}" a été créé avec succès`,
    data: { serviceId, serviceTitle },
    priority: 'normal',
  }),

  /**
   * Notification de demande de visite
   */
  visitScheduled: (
    propertyId: string,
    propertyTitle: string,
    visitDate: string,
    clientName: string
  ): NotificationPayload => ({
    type: NotificationType.VISIT_SCHEDULED,
    title: 'Nouvelle demande de visite',
    message: `${clientName} souhaite visiter "${propertyTitle}" le ${visitDate}`,
    propertyId,
    propertyTitle,
    data: { visitDate, clientName },
    priority: 'high',
  }),

  /**
   * Notification de réservation
   */
  bookingRequest: (
    propertyId: string,
    propertyTitle: string,
    clientName: string,
    amount: number
  ): NotificationPayload => ({
    type: NotificationType.BOOKING_REQUEST,
    title: 'Nouvelle demande de réservation',
    message: `${clientName} souhaite réserver "${propertyTitle}" pour ${amount}€`,
    propertyId,
    propertyTitle,
    data: { clientName, amount },
    priority: 'high',
  }),

  /**
   * Notification de paiement reçu
   */
  paymentReceived: (
    amount: number,
    propertyId: string,
    propertyTitle: string
  ): NotificationPayload => ({
    type: NotificationType.PAYMENT_RECEIVED,
    title: 'Paiement reçu',
    message: `Vous avez reçu un paiement de ${amount}€ pour "${propertyTitle}"`,
    propertyId,
    propertyTitle,
    data: { amount },
    priority: 'high',
  }),

  /**
   * Notification de nouveau message
   */
  messageReceived: (
    conversationId: string,
    senderName: string,
    messagePreview: string
  ): NotificationPayload => ({
    type: NotificationType.MESSAGE_RECEIVED,
    title: `Nouveau message de ${senderName}`,
    message: messagePreview,
    data: { conversationId, senderName },
    priority: 'normal',
  }),

  /**
   * Notification de conversation démarrée
   */
  conversationStarted: (
    conversationId: string,
    propertyTitle: string,
    clientName: string
  ): NotificationPayload => ({
    type: NotificationType.CONVERSATION_STARTED,
    title: 'Nouvelle conversation',
    message: `${clientName} vous a contacté au sujet de "${propertyTitle}"`,
    data: { conversationId, clientName, propertyTitle },
    priority: 'high',
  }),
};
