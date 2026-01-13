import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getSocketIOService } from '../services/realtime/socketIOService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  createdAt: string;
  isRead: boolean;
}

export function useInAppNotifications() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const socketService = getSocketIOService();

    const initializeSocket = async () => {
      try {
        await socketService.connect();

        if (!isMounted) return;

        setIsConnected(true);
        console.log('✅ Socket.IO connecté pour les notifications');

        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          socketService.emit('authenticate', {
            userId: userData.id,
            token: await AsyncStorage.getItem('accessToken')
          });
          console.log('🔐 Authentification Socket.IO envoyée');
        }

        const unsubscribeNewNotif = socketService.on('new_notification', (notification) => {
          if (!isMounted) return;

          console.log('🔔 Nouvelle notification reçue:', notification);

          setNotifications(prev => [notification, ...prev]);

          if (notification.type === 'visit_request' || notification.type === 'visit_response') {
            Alert.alert(
              notification.title,
              notification.message,
              [
                { text: 'OK', style: 'default' },
                notification.data?.activityId && {
                  text: 'Voir',
                  onPress: () => handleNotificationPress(notification)
                }
              ].filter(Boolean) as any
            );
          }
        });

        const unsubscribeCount = socketService.on('unread_count_updated', ({ count }) => {
          if (!isMounted) return;
          console.log('📊 Compteur notifications mis à jour:', count);
          setUnreadCount(count);
        });

        const unsubscribeAuth = socketService.on('authenticated', (data) => {
          console.log('✅ Authentification Socket.IO réussie:', data);
        });

        const unsubscribeAuthError = socketService.on('authentication_error', (error) => {
          console.error('❌ Erreur d\'authentification Socket.IO:', error);
        });

        return () => {
          unsubscribeNewNotif();
          unsubscribeCount();
          unsubscribeAuth();
          unsubscribeAuthError();
        };
      } catch (error) {
        console.error('❌ Erreur initialisation Socket.IO:', error);
        setIsConnected(false);
      }
    };

    const cleanup = initializeSocket();

    return () => {
      isMounted = false;
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const handleNotificationPress = (notification: InAppNotification) => {
    markAsRead(notification.id);

    if (notification.type === 'visit_request' && notification.data?.conversationId) {
      console.log('Navigate to chat:', notification.data.conversationId);
    } else if (notification.type === 'visit_response' && notification.data?.activityId) {
      console.log('Navigate to activity:', notification.data.activityId);
    }
  };

  const markAsRead = (notificationId: string) => {
    const socketService = getSocketIOService();
    socketService.emit('mark_as_read', { notificationId });

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    const socketService = getSocketIOService();
    socketService.emit('mark_all_as_read', {});

    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  };
}
