import React, { createContext, useContext, useState, useCallback } from 'react';

export interface GlobalNotification {
  id: string;
  type: 'visit_request' | 'visit_accepted' | 'visit_rejected' | 'booking_confirmed' | 'booking_request' | 'payment_received' | 'document_uploaded' | 'general';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  userId?: string;
  data?: any;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'accept' | 'reject' | 'view' | 'dismiss';
  onPress: () => void;
}

interface NotificationContextType {
  notifications: GlobalNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([
    {
      id: 'demo-1',
      type: 'visit_request',
      title: 'Nouvelle demande de visite',
      message: 'Jean Dupont souhaite visiter votre appartement',
      timestamp: new Date().toISOString(),
      isRead: false,
      data: { clientName: 'Jean Dupont', propertyTitle: 'Appartement 3P' }
    }
  ]);

  const addNotification = useCallback((notificationData: Omit<GlobalNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: GlobalNotification = {
      ...notificationData,
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    console.log('Notification added:', newNotification);
  }, []);

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
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
export const sendGlobalNotification = (notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'isRead'>) => {
  if ((global as any).addGlobalNotification) {
    (global as any).addGlobalNotification(notification);
  }
};