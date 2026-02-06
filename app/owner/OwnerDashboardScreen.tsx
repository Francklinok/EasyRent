import React, { useMemo } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useOwnerDashboard, OwnerActivity, OwnerProperty } from '@/hooks/useOwnerDashboard';
import { router } from 'expo-router';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.65;

const OwnerDashboardScreen = () => {
  const { theme } = useTheme();
  const { user, activeMode, setActiveMode } = useAuth();
  const { stats, properties, loading, refresh } = useOwnerDashboard();

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Propriétés actives',
        value: stats.activeProperties,
        icon: 'home-city' as const,
        color: theme.primary,
      },
      {
        label: 'Visites en attente',
        value: stats.pendingVisits,
        icon: 'calendar-clock' as const,
        color: '#FF9800',
        badge: stats.pendingVisits > 0,
      },
      {
        label: 'Réservations',
        value: stats.pendingReservations,
        icon: 'bookmark-check' as const,
        color: '#4CAF50',
        badge: stats.pendingReservations > 0,
      },
      {
        label: 'Revenus',
        value: `${stats.totalRevenue.toLocaleString()} XAF`,
        icon: 'cash-multiple' as const,
        color: '#2196F3',
      },
    ];
  }, [stats, theme.primary]);

  const quickActions = useMemo(() => [
    {
      label: 'Mes propriétés',
      icon: 'home-group' as const,
      onPress: () => router.push('/inventory/Inventory'),
      color: theme.primary,
    },
    {
      label: 'Demandes',
      icon: 'clipboard-text-clock' as const,
      onPress: () => router.push('/owner/RequestsManagementScreen'),
      color: '#FF9800',
    },
    {
      label: 'Mes services',
      icon: 'tools' as const,
      onPress: () => router.push('/inventory/Inventory'),
      color: '#9C27B0',
    },
    {
      label: 'Paiements',
      icon: 'wallet' as const,
      onPress: () => router.push('/wallet/Wallet'),
      color: '#4CAF50',
    },
  ], [theme.primary]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#FF9800';
      default: return theme.onSurface + '60';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getPropertyStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return '#4CAF50';
      case 'RENTED': return '#2196F3';
      case 'MAINTENANCE': return '#FF9800';
      default: return theme.onSurface + '60';
    }
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={{ marginTop: 12, color: theme.onSurface + '70' }}>
            Chargement du dashboard...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView>
            <ThemedText type="title" style={styles.headerTitle}>
              Mon Dashboard
            </ThemedText>
            <ThemedView style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
              <ThemedText style={[styles.badgeText, { color: theme.primary }]}>
                PROPRIÉTAIRE
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Mode Toggle */}
          <ThemedView style={[styles.modeToggle, { backgroundColor: theme.surfaceVariant }]}>
            <TouchableOpacity
              onPress={() => setActiveMode('client')}
              style={[
                styles.modeButton,
                activeMode === 'client' && { backgroundColor: theme.primary },
              ]}
            >
              <ThemedText style={[
                styles.modeButtonText,
                { color: activeMode === 'client' ? '#fff' : theme.onSurface + '80' },
              ]}>
                Client
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveMode('owner')}
              style={[
                styles.modeButton,
                activeMode === 'owner' && { backgroundColor: theme.primary },
              ]}
            >
              <ThemedText style={[
                styles.modeButtonText,
                { color: activeMode === 'owner' ? '#fff' : theme.onSurface + '80' },
              ]}>
                Propriétaire
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Stats Cards */}
        <ThemedView style={styles.statsContainer}>
          {statCards.map((card, index) => (
            <ThemedView
              key={index}
              style={[styles.statCard, { backgroundColor: theme.surfaceVariant }]}
            >
              <ThemedView style={[styles.statIconContainer, { backgroundColor: card.color + '15' }]}>
                <MaterialCommunityIcons name={card.icon} size={22} color={card.color} />
              </ThemedView>
              <ThemedText style={[styles.statValue, { color: theme.onSurface }]}>
                {card.value}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.onSurface + '70' }]}>
                {card.label}
              </ThemedText>
              {card.badge && (
                <ThemedView style={[styles.statBadge, { backgroundColor: '#F44336' }]}>
                  <ThemedText style={styles.statBadgeText}>{String(card.value)}</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          ))}
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Actions rapides
          </ThemedText>
          <ThemedView style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                style={[styles.actionCard, { backgroundColor: theme.surfaceVariant }]}
              >
                <ThemedView style={[styles.actionIconContainer, { backgroundColor: action.color + '15' }]}>
                  <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
                </ThemedView>
                <ThemedText style={[styles.actionLabel, { color: theme.onSurface }]}>
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Activité récente
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/owner/RequestsManagementScreen')}>
                <ThemedText style={{ color: theme.primary, fontSize: 14 }}>
                  Voir tout
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {stats.recentActivity.map((activity: OwnerActivity) => (
              <ThemedView
                key={activity.id}
                style={[styles.activityItem, { backgroundColor: theme.surfaceVariant }]}
              >
                <ThemedView style={[
                  styles.activityIcon,
                  { backgroundColor: (activity.type === 'visit' ? '#FF9800' : '#4CAF50') + '15' }
                ]}>
                  <MaterialCommunityIcons
                    name={activity.type === 'visit' ? 'eye' : 'bookmark'}
                    size={18}
                    color={activity.type === 'visit' ? '#FF9800' : '#4CAF50'}
                  />
                </ThemedView>
                <ThemedView style={styles.activityContent}>
                  <ThemedText style={[styles.activityTitle, { color: theme.onSurface }]}>
                    {activity.title}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
                    {activity.clientName} - {activity.propertyTitle}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 11, color: theme.onSurface + '50', marginTop: 2 }}>
                    {new Date(activity.date).toLocaleDateString('fr-FR')}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.activityStatus, { backgroundColor: getStatusColor(activity.status) + '20' }]}>
                  <ThemedText style={[styles.activityStatusText, { color: getStatusColor(activity.status) }]}>
                    {getStatusLabel(activity.status)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Properties Preview */}
        {properties.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Mes propriétés
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/inventory/Inventory')}>
                <ThemedText style={{ color: theme.primary, fontSize: 14 }}>
                  Gérer
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={properties}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }: { item: OwnerProperty }) => (
                <TouchableOpacity
                  style={[styles.propertyCard, { backgroundColor: theme.surfaceVariant }]}
                  onPress={() => router.push(`/property/${item.id}` as any)}
                >
                  <Image
                    source={{ uri: item.images?.[0] }}
                    style={styles.propertyImage}
                    contentFit="cover"
                  />
                  <ThemedView style={styles.propertyInfo}>
                    <ThemedText numberOfLines={1} style={[styles.propertyTitle, { color: theme.onSurface }]}>
                      {item.title}
                    </ThemedText>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <ThemedView style={[
                        styles.propertyStatusBadge,
                        { backgroundColor: getPropertyStatusColor(item.status) + '20' }
                      ]}>
                        <ThemedText style={{ fontSize: 10, color: getPropertyStatusColor(item.status) }}>
                          {item.status}
                        </ThemedText>
                      </ThemedView>
                      <ThemedText style={{ fontSize: 13, fontWeight: '600', color: theme.primary }}>
                        {item.ownerCriteria?.monthlyRent?.toLocaleString()} {item.ownerCriteria?.currency || 'XAF'}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        )}

        {/* Empty state when no data */}
        {!stats && !loading && (
          <ThemedView style={styles.emptyState}>
            <MaterialCommunityIcons name="home-city-outline" size={64} color={theme.onSurface + '30'} />
            <ThemedText style={{ fontSize: 16, color: theme.onSurface + '60', marginTop: 16, textAlign: 'center' }}>
              Commencez par créer une propriété ou un service pour voir vos statistiques ici.
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/creation')}
              style={[styles.emptyButton, { backgroundColor: theme.primary }]}
            >
              <ThemedText style={{ color: '#fff', fontWeight: '600' }}>
                Créer une propriété
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginTop: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    borderRadius: 14,
    padding: 14,
    position: 'relative',
  },
  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  activityStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  propertyCard: {
    width: CARD_WIDTH,
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 120,
  },
  propertyInfo: {
    padding: 10,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  propertyStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default OwnerDashboardScreen;
