import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getNotificationService } from '@/services/api/notificationService';
import { useAuthUser } from '@/components/contexts/authContext/AuthContext';

export interface GlobalNotification {
  id: string;
  type: 'visit_request' | 'visit_accepted' | 'visit_rejected' | 'booking_confirmed' | 'booking_request' | 'payment_received' | 'document_uploaded' | 'general' | 'interest_request' | 'property_published' | 'custom';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  userId?: string;
  data?: any;
  actions?: NotificationAction[];
  createdAt?: string;
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'accept' | 'reject' | 'view' | 'dismiss';
  onPress: () => void;
}

interface NotificationContextType {
  notifications: Array<GlobalNotification & { read?: boolean; createdAt?: string }>;
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthUser();
  const notificationService = getNotificationService();

  // Charger les notifications depuis le backend au montage
  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      console.log('🔴 [NotificationContext] No user ID, skipping load');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔔 [NotificationContext] Loading notifications for user:', user.id);

      const [serverNotifications, unreadCountFromServer] = await Promise.all([
        notificationService.getUserNotifications(user.id, 50),
        notificationService.getUnreadCount(user.id)
      ]);

      console.log('📥 [NotificationContext] Loaded notifications:', serverNotifications?.length || 0);
      console.log('📥 [NotificationContext] Unread count from server:', unreadCountFromServer);

      if (serverNotifications && serverNotifications.length > 0) {
        // Mapper les notifications du serveur vers le format GlobalNotification
        const mappedNotifications: GlobalNotification[] = serverNotifications.map((n: any) => ({
          id: n.id || n._id,
          type: n.type || 'general',
          title: n.title,
          message: n.message,
          timestamp: n.createdAt || new Date().toISOString(),
          isRead: n.isRead || false,
          userId: n.userId,
          data: n.data || n.metadata,
          createdAt: n.createdAt
        }));

        setNotifications(mappedNotifications);
        console.log('✅ [NotificationContext] Notifications set:', mappedNotifications.length);
      }
    } catch (error) {
      console.error('❌ [NotificationContext] Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, notificationService]);

  // Charger les notifications quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id, loadNotifications]);

  const addNotification = useCallback((notificationData: Omit<GlobalNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: GlobalNotification = {
      ...notificationData,
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => {
      // Éviter les doublons
      const exists = prev.some(n =>
        n.type === newNotification.type &&
        n.data?.visitId === newNotification.data?.visitId &&
        n.data?.propertyId === newNotification.data?.propertyId
      );

      if (exists) {
        console.log('⚠️ Notification déjà existante, ignorée');
        return prev;
      }

      return [newNotification, ...prev];
    });
    console.log('✅ Notification ajoutée:', newNotification.title);
  }, []);

  // Définir le handler global au montage
  useEffect(() => {
    setGlobalNotificationHandler(addNotification);
    return () => {
      globalNotificationHandler = null;
    };
  }, [addNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Support both isRead and read properties for compatibility
  const unreadCount = notifications.filter(n => !n.isRead && !(n as any).read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading: isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    refresh: loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Global notification functions for external components
let globalNotificationHandler: ((notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'isRead'>) => void) | null = null;

export const sendGlobalNotification = (notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'isRead'>) => {
  if (globalNotificationHandler) {
    globalNotificationHandler(notification);
    console.log('✅ Notification globale envoyée:', notification.title);
  } else {
    console.warn('⚠️ Handler de notification non défini');
  }
};

export const setGlobalNotificationHandler = (handler: (notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'isRead'>) => void) => {
  globalNotificationHandler = handler;
  console.log('✅ Handler de notification défini');
};