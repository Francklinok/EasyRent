import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';
import { MotiView, AnimatePresence } from 'moti';

export interface Notification {
  id: string;
  type: 'visit_request' | 'visit_accepted' | 'visit_rejected' | 'booking_confirmed' | 'general';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'accept' | 'reject' | 'view' | 'dismiss';
  onPress: () => void;
}

interface NotificationSystemProps {
  visible: boolean;
  onClose: () => void;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'visit_request',
    title: 'Nouvelle demande de visite',
    message: 'Jean Dupont souhaite visiter votre appartement le 15/01/2024 à 14:00',
    timestamp: new Date().toISOString(),
    isRead: false,
    data: {
      clientName: 'Jean Dupont',
      propertyTitle: 'Appartement 3P - Marais',
      visitDate: '15/01/2024',
      visitTime: '14:00'
    },
    actions: [
      {
        id: 'accept',
        label: 'Accepter',
        type: 'accept',
        onPress: () => console.log('Visit accepted')
      },
      {
        id: 'reject',
        label: 'Refuser',
        type: 'reject',
        onPress: () => console.log('Visit rejected')
      }
    ]
  },
  {
    id: '2',
    type: 'visit_accepted',
    title: 'Visite confirmée',
    message: 'Votre visite a été acceptée par le propriétaire',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: true,
    data: {}
  }
];

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  visible, 
  onClose, 
  notifications: propNotifications,
  onMarkAsRead: propMarkAsRead 
}) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>(propNotifications || mockNotifications);
  
  React.useEffect(() => {
    if (propNotifications) {
      setNotifications(propNotifications);
    }
  }, [propNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'visit_request': return 'calendar-clock';
      case 'visit_accepted': return 'calendar-check';
      case 'visit_rejected': return 'calendar-remove';
      case 'booking_confirmed': return 'home-check';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'visit_request': return theme.primary;
      case 'visit_accepted': return theme.success;
      case 'visit_rejected': return theme.error;
      case 'booking_confirmed': return theme.success;
      default: return theme.onSurface;
    }
  };

  const markAsRead = (id: string) => {
    if (propMarkAsRead) {
      propMarkAsRead(id);
    } else {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    }
  };

  const handleAction = (notification: Notification, action: NotificationAction) => {
    markAsRead(notification.id);
    action.onPress();
    
    if (action.type === 'accept') {
      Alert.alert('Visite acceptée', 'La visite a été confirmée. Le client recevra une notification.');
    } else if (action.type === 'reject') {
      Alert.alert('Visite refusée', 'La demande de visite a été refusée.');
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <MotiView
      from={{ opacity: 0, translateX: -50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <TouchableOpacity
        onPress={() => markAsRead(item.id)}
        style={{
          backgroundColor: item.isRead ? theme.surface : theme.primary + '10',
          marginHorizontal: 16,
          marginVertical: 6,
          borderRadius: 12,
          padding: 16,
          borderLeftWidth: 4,
          borderLeftColor: getNotificationColor(item.type),
        }}
      >
        <ThemedView style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'transparent' }}>
          <ThemedView style={{
            backgroundColor: getNotificationColor(item.type) + '20',
            borderRadius: 20,
            padding: 8,
            marginRight: 12
          }}>
            <MaterialCommunityIcons 
              name={getNotificationIcon(item.type) as any} 
              size={20} 
              color={getNotificationColor(item.type)} 
            />
          </ThemedView>
          
          <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
              <ThemedText style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: theme.onSurface,
                flex: 1
              }}>
                {item.title}
              </ThemedText>
              {!item.isRead && (
                <ThemedView style={{
                  backgroundColor: theme.primary,
                  borderRadius: 6,
                  width: 12,
                  height: 12
                }} />
              )}
            </ThemedView>
            
            <ThemedText style={{ 
              fontSize: 14, 
              color: theme.onSurface + '80',
              marginTop: 4,
              lineHeight: 20
            }}>
              {item.message}
            </ThemedText>
            
            <ThemedText style={{ 
              fontSize: 12, 
              color: theme.onSurface + '60',
              marginTop: 8
            }}>
              {new Date(item.timestamp).toLocaleString('fr-FR')}
            </ThemedText>
            
            {item.actions && item.actions.length > 0 && (
              <ThemedView style={{ 
                flexDirection: 'row', 
                gap: 8, 
                marginTop: 12,
                backgroundColor: 'transparent'
              }}>
                {item.actions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => handleAction(item, action)}
                    style={{
                      backgroundColor: action.type === 'accept' ? theme.success : 
                                     action.type === 'reject' ? theme.error : theme.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      flex: 1,
                      alignItems: 'center'
                    }}
                  >
                    <ThemedText style={{ 
                      color: 'white', 
                      fontWeight: '600',
                      fontSize: 12
                    }}>
                      {action.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </MotiView>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ThemedView style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.outline + '20'
        }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
            <ThemedText style={{ fontSize: 20, fontWeight: '700', color: theme.onSurface }}>
              Notifications
            </ThemedText>
            {unreadCount > 0 && (
              <ThemedView style={{
                backgroundColor: theme.error,
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 8
              }}>
                <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  {unreadCount}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={theme.onSurface} />
          </TouchableOpacity>
        </ThemedView>
        
        {notifications.length === 0 ? (
          <ThemedView style={{ 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 32
          }}>
            <MaterialCommunityIcons name="bell-off" size={64} color={theme.onSurface + '40'} />
            <ThemedText style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: theme.onSurface + '60',
              marginTop: 16,
              textAlign: 'center'
            }}>
              Aucune notification
            </ThemedText>
            <ThemedText style={{ 
              fontSize: 14, 
              color: theme.onSurface + '40',
              marginTop: 8,
              textAlign: 'center'
            }}>
              Vous recevrez ici toutes vos notifications importantes
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

// Notification Badge Component
export const NotificationBadge: React.FC<{ count: number; onPress: () => void }> = ({ count, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity onPress={onPress} style={{ position: 'relative' }}>
      <MaterialCommunityIcons name="bell" size={24} color={theme.onSurface} />
      {count > 0 && (
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: theme.error,
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: theme.background
          }}
        >
          <ThemedText style={{ 
            color: 'white', 
            fontSize: 10, 
            fontWeight: '700' 
          }}>
            {count > 99 ? '99+' : count}
          </ThemedText>
        </MotiView>
      )}
    </TouchableOpacity>
  );
};

export default NotificationSystem;