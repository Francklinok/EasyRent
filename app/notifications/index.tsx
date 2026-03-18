import React, { useState, useEffect } from 'react';
import { TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { useTheme } from '@/hooks/themehook';
import { BackButton } from '@/components/ui/BackButton';
import { useNotifications } from '@/components/contexts/notifications/NotificationContext';
import { MotiView } from 'moti';
import { router } from 'expo-router';

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read && !n.isRead);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'calendar-check';
      case 'payment': return 'cash';
      case 'message': return 'message-text';
      case 'property': return 'home';
      case 'visit': return 'eye';
      case 'contract': return 'file-document';
      case 'system': return 'bell';
      default: return 'information';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return theme.primary;
      case 'payment': return theme.success;
      case 'message': return theme.info;
      case 'property': return theme.secondary;
      case 'visit': return theme.warning;
      case 'contract': return '#9b59b6';
      case 'system': return theme.outline;
      default: return theme.typography.caption;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <LinearGradient
        colors={[theme.primary, theme.secondary || theme.primary + '80']}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24
        }}
      >
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' }}>
          <BackButton iconColor="white" />
          <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
              Notifications
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
            </ThemedText>
          </ThemedView>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: 10
              }}
            >
              <MaterialCommunityIcons name="check-all" size={20} color="white" />
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Filter Tabs */}
        <ThemedView style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 12,
          padding: 4,
          marginTop: 16,
          gap: 4
        }}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={{
              flex: 1,
              backgroundColor: filter === 'all' ? 'white' : 'transparent',
              borderRadius: 10,
              padding: 10,
              alignItems: 'center'
            }}
          >
            <ThemedText style={{
              fontSize: 14,
              fontWeight: '600',
              color: filter === 'all' ? theme.primary : 'white'
            }}>
              Toutes
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('unread')}
            style={{
              flex: 1,
              backgroundColor: filter === 'unread' ? 'white' : 'transparent',
              borderRadius: 10,
              padding: 10,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <ThemedText style={{
              fontSize: 14,
              fontWeight: '600',
              color: filter === 'unread' ? theme.primary : 'white'
            }}>
              Non lues
            </ThemedText>
            {unreadCount > 0 && (
              <ThemedView style={{
                backgroundColor: filter === 'unread' ? theme.error : 'white',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 6
              }}>
                <ThemedText style={{
                  fontSize: 11,
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {unreadCount}
                </ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>
        </ThemedView>
      </LinearGradient>

      <ThemedScrollView
        style={{ flex: 1, marginTop: -15 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <ThemedView style={{ padding: 40, alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="bell-off"
              size={64}
              color={theme.outline + '40'}
            />
            <ThemedText style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.typography.caption,
              marginTop: 16
            }}>
              Aucune notification
            </ThemedText>
            <ThemedText style={{
              fontSize: 14,
              color: theme.typography.caption,
              marginTop: 8,
              textAlign: 'center'
            }}>
              {filter === 'unread'
                ? 'Vous avez tout lu !'
                : 'Vous recevrez ici vos notifications'}
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={{ padding: 16, gap: 8 }}>
            {filteredNotifications.map((notification, index) => (
              <MotiView
                key={notification.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: index * 50 }}
              >
                <TouchableOpacity
                  onPress={() => {
                    markAsRead(notification.id);
                    // Navigate based on notification type
                    if (notification.type === 'visit_request' || notification.type === 'booking_request') {
                      router.push('/owner/RequestsManagementScreen');
                    }
                  }}
                  style={{
                    backgroundColor: (notification.read || notification.isRead) ? theme.surface : theme.primary + '10',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: (notification.read || notification.isRead) ? theme.outline + '20' : theme.primary + '30',
                    overflow: 'hidden'
                  }}
                >
                  <ThemedView style={{
                    flexDirection: 'row',
                    padding: 16,
                    gap: 12
                  }}>
                    <ThemedView style={{
                      backgroundColor: getNotificationColor(notification.type) + '20',
                      borderRadius: 12,
                      padding: 10,
                      alignSelf: 'flex-start'
                    }}>
                      <MaterialCommunityIcons
                        name={getNotificationIcon(notification.type) as any}
                        size={24}
                        color={getNotificationColor(notification.type)}
                      />
                    </ThemedView>

                    <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <ThemedView style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 4,
                        backgroundColor: 'transparent'
                      }}>
                        <ThemedText style={{
                          fontSize: 15,
                          fontWeight: '700',
                          color: theme.typography.heading,
                          flex: 1
                        }}>
                          {notification.title}
                        </ThemedText>

                        {!(notification.read || notification.isRead) && (
                          <ThemedView style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.primary,
                            marginLeft: 8,
                            marginTop: 4
                          }} />
                        )}
                      </ThemedView>

                      <ThemedText style={{
                        fontSize: 14,
                        color: theme.typography.body,
                        marginBottom: 8,
                        lineHeight: 20
                      }}>
                        {notification.message}
                      </ThemedText>

                      <ThemedView style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'transparent'
                      }}>
                        <ThemedText style={{
                          fontSize: 12,
                          color: theme.typography.caption
                        }}>
                          {formatTime(notification.createdAt || notification.timestamp)}
                        </ThemedText>

                        <TouchableOpacity
                          onPress={() => removeNotification(notification.id)}
                          style={{
                            backgroundColor: theme.error + '10',
                            borderRadius: 8,
                            padding: 6
                          }}
                        >
                          <MaterialCommunityIcons
                            name="delete"
                            size={16}
                            color={theme.error}
                          />
                        </TouchableOpacity>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>
              </MotiView>
            ))}
          </ThemedView>
        )}

        <ThemedView style={{ height: 32 }} />
      </ThemedScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
