import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useRecentActivities } from '@/hooks/useActivity';
import { Activity, ActivityStatus, ActivityType } from '@/services/api/activityService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityNotificationCenterProps {
  userId: string;
  onActivityPress?: (activity: Activity) => void;
  onClose?: () => void;
  isVisible?: boolean;
}

const ActivityNotificationCenter: React.FC<ActivityNotificationCenterProps> = ({
  userId,
  onActivityPress,
  onClose,
  isVisible = true
}) => {
  const { theme } = useTheme();
  const { activities, loading, error, refresh, pendingCount } = useRecentActivities(userId, 20);
  const [filter, setFilter] = useState<'all' | 'pending' | 'recent'>('all');

  const filteredActivities = activities.filter(activity => {
    switch (filter) {
      case 'pending':
        return activity.status === ActivityStatus.PENDING;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(activity.createdAt) > oneWeekAgo;
      default:
        return true;
    }
  });

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case ActivityType.VISIT:
        return activity.isVisitAccepted ? 'calendar-check' : 'calendar-clock';
      case ActivityType.RESERVATION:
        return activity.isReservationAccepted ? 'home-check' : 'home-clock';
      default:
        return 'information';
    }
  };

  const getActivityColor = (activity: Activity) => {
    switch (activity.status) {
      case ActivityStatus.PENDING:
        return theme.warning;
      case ActivityStatus.ACCEPTED:
        return theme.success;
      case ActivityStatus.REFUSED:
        return theme.error;
      case ActivityStatus.COMPLETED:
        return theme.primary;
      default:
        return theme.onSurface + '60';
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case ActivityType.VISIT:
        if (activity.status === ActivityStatus.PENDING) {
          return 'Demande de visite';
        } else if (activity.status === ActivityStatus.ACCEPTED) {
          return 'Visite confirmée';
        } else if (activity.status === ActivityStatus.REFUSED) {
          return 'Visite refusée';
        }
        return 'Visite programmée';
      case ActivityType.RESERVATION:
        if (activity.status === ActivityStatus.PENDING) {
          return 'Demande de réservation';
        } else if (activity.status === ActivityStatus.ACCEPTED) {
          return 'Réservation acceptée';
        } else if (activity.status === ActivityStatus.REFUSED) {
          return 'Réservation refusée';
        }
        return 'Réservation';
      default:
        return 'Activité';
    }
  };

  const getActivityDescription = (activity: Activity) => {
    const propertyTitle = activity.property?.title || 'Propriété';
    const clientName = activity.client?.fullName || 'Client';

    switch (activity.type) {
      case ActivityType.VISIT:
        if (activity.visitDate) {
          const visitDate = new Date(activity.visitDate);
          return `${clientName} - ${propertyTitle}\nVisite prévue le ${visitDate.toLocaleDateString()}`;
        }
        return `${clientName} - ${propertyTitle}`;
      case ActivityType.RESERVATION:
        if (activity.amount > 0) {
          return `${clientName} - ${propertyTitle}\nMontant: ${activity.amount}€`;
        }
        return `${clientName} - ${propertyTitle}`;
      default:
        return activity.message || `${clientName} - ${propertyTitle}`;
    }
  };

  const handleActivityPress = (activity: Activity) => {
    if (onActivityPress) {
      onActivityPress(activity);
    } else {
      // Default behavior based on activity type and status
      if (activity.type === ActivityType.VISIT && activity.status === ActivityStatus.PENDING) {
        Alert.alert(
          'Demande de visite',
          `Accepter la visite de ${activity.client?.fullName} pour ${activity.property?.title} ?`,
          [
            { text: 'Refuser', style: 'destructive' },
            { text: 'Reporter', style: 'cancel' },
            { text: 'Accepter', style: 'default' }
          ]
        );
      } else if (activity.type === ActivityType.RESERVATION && activity.status === ActivityStatus.PENDING) {
        Alert.alert(
          'Demande de réservation',
          `Examiner la demande de réservation de ${activity.client?.fullName} ?`,
          [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Examiner', style: 'default' }
          ]
        );
      }
    }
  };

  const renderActivityItem = ({ item, index }: { item: Activity; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: -50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 100, type: 'spring' }}
    >
      <TouchableOpacity
        onPress={() => handleActivityPress(item)}
        style={{
          marginHorizontal: 16,
          marginVertical: 6,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: theme.surface,
          shadowColor: theme.onSurface,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4
        }}
      >
        <ThemedView style={{
          flexDirection: 'row',
          padding: 16,
          alignItems: 'flex-start'
        }}>
          {/* Activity Icon */}
          <ThemedView style={{
            backgroundColor: getActivityColor(item) + '20',
            borderRadius: 24,
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
          }}>
            <MaterialCommunityIcons
              name={getActivityIcon(item) as any}
              size={24}
              color={getActivityColor(item)}
            />
          </ThemedView>

          {/* Activity Content */}
          <ThemedView style={{ flex: 1 }}>
            <ThemedView style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 4
            }}>
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.onSurface,
                flex: 1
              }}>
                {getActivityTitle(item)}
              </ThemedText>

              {item.status === ActivityStatus.PENDING && (
                <ThemedView style={{
                  backgroundColor: theme.warning + '20',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginLeft: 8
                }}>
                  <ThemedText style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: theme.warning
                  }}>
                    NOUVEAU
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            <ThemedText style={{
              fontSize: 14,
              color: theme.onSurface + '80',
              lineHeight: 18,
              marginBottom: 8
            }}>
              {getActivityDescription(item)}
            </ThemedText>

            <ThemedView style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <ThemedText style={{
                fontSize: 12,
                color: theme.onSurface + '60'
              }}>
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  locale: fr
                })}
              </ThemedText>

              {item.urgency === 'urgent' && (
                <MaterialIcons
                  name="priority-high"
                  size={16}
                  color={theme.error}
                />
              )}
            </ThemedView>
          </ThemedView>

          {/* Action Indicator */}
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={theme.onSurface + '40'}
            style={{ marginLeft: 8 }}
          />
        </ThemedView>

        {/* Progress Bar for ongoing activities */}
        {(item.status === ActivityStatus.PENDING || item.type === ActivityType.RESERVATION) && (
          <ThemedView style={{ height: 3, backgroundColor: theme.surfaceVariant }}>
            <ThemedView style={{
              height: 3,
              backgroundColor: getActivityColor(item),
              width: item.status === ActivityStatus.COMPLETED ? '100%' :
                     item.status === ActivityStatus.ACCEPTED ? '75%' :
                     item.status === ActivityStatus.PENDING ? '25%' : '0%'
            }} />
          </ThemedView>
        )}
      </TouchableOpacity>
    </MotiView>
  );

  const renderHeader = () => (
    <ThemedView style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <ThemedText style={{
          fontSize: 20,
          fontWeight: '700',
          color: theme.onSurface
        }}>
          Activités récentes
        </ThemedText>

        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.onSurface} />
          </TouchableOpacity>
        )}
      </ThemedView>

      {pendingCount > 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            backgroundColor: theme.warning + '15',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: theme.warning
          }}
        >
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="bell-alert"
              size={20}
              color={theme.warning}
              style={{ marginRight: 8 }}
            />
            <ThemedText style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.warning,
              flex: 1
            }}>
              {pendingCount} activité{pendingCount > 1 ? 's' : ''} en attente de votre attention
            </ThemedText>
          </ThemedView>
        </MotiView>
      )}

      {/* Filter Tabs */}
      <ThemedView style={{
        flexDirection: 'row',
        backgroundColor: theme.surfaceVariant,
        borderRadius: 12,
        padding: 4
      }}>
        {[
          { key: 'all', label: 'Toutes', count: activities.length },
          { key: 'pending', label: 'En attente', count: pendingCount },
          { key: 'recent', label: 'Récentes', count: filteredActivities.length }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setFilter(tab.key as any)}
            style={{
              flex: 1,
              backgroundColor: filter === tab.key ? theme.primary : 'transparent',
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              alignItems: 'center'
            }}
          >
            <ThemedText style={{
              fontSize: 14,
              fontWeight: '600',
              color: filter === tab.key ? 'white' : theme.onSurface + '80'
            }}>
              {tab.label}
            </ThemedText>
            {tab.count > 0 && (
              <ThemedText style={{
                fontSize: 10,
                color: filter === tab.key ? 'white' : theme.onSurface + '60',
                marginTop: 2
              }}>
                {tab.count}
              </ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );

  const renderEmptyState = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64
      }}
    >
      <MaterialCommunityIcons
        name="calendar-check"
        size={64}
        color={theme.onSurface + '30'}
        style={{ marginBottom: 16 }}
      />
      <ThemedText style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.onSurface + '60',
        textAlign: 'center',
        marginBottom: 8
      }}>
        Aucune activité {filter !== 'all' ? filter : ''}
      </ThemedText>
      <ThemedText style={{
        fontSize: 14,
        color: theme.onSurface + '40',
        textAlign: 'center',
        lineHeight: 20
      }}>
        Les nouvelles demandes de visite et réservations apparaîtront ici
      </ThemedText>
    </MotiView>
  );

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: 20 }}
        style={{
          flex: 1,
          backgroundColor: theme.background
        }}
      >
        <LinearGradient
          colors={[theme.primary + '05', theme.background]}
          style={{ flex: 1 }}
        >
          <FlatList
            data={filteredActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 20
            }}
          />
        </LinearGradient>
      </MotiView>
    </AnimatePresence>
  );
};

export default ActivityNotificationCenter;