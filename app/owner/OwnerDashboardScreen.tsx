import React, { useMemo } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  FlatList,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useOwnerDashboard, OwnerActivity, OwnerProperty } from '@/hooks/useOwnerDashboard';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROPERTY_CARD_WIDTH = SCREEN_WIDTH * 0.7;

const OwnerDashboardScreen = () => {
  const { theme } = useTheme();
  const { user, activeMode, setActiveMode } = useAuth();
  const { stats, properties, loading, refresh } = useOwnerDashboard();
  const insets = useSafeAreaInsets();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  const firstName = useMemo(() => {
    return user?.firstName?.split(' ')[0] || user?.firstName || 'Propriétaire';
  }, [user?.firstName]);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Propriétés',
        value: stats.activeProperties,
        icon: 'home-city-outline' as const,
        color: '#6366F1',
        bgColor: '#EEF2FF',
      },
      {
        label: 'Visites',
        value: stats.pendingVisits,
        icon: 'calendar-clock-outline' as const,
        color: '#F59E0B',
        bgColor: '#FFFBEB',
        badge: stats.pendingVisits > 0,
      },
      {
        label: 'Réservations',
        value: stats.pendingReservations,
        icon: 'bookmark-check-outline' as const,
        color: '#10B981',
        bgColor: '#ECFDF5',
        badge: stats.pendingReservations > 0,
      },
      {
        label: 'Occupation',
        value: `${stats.occupancyRate || 0}%`,
        icon: 'chart-arc' as const,
        color: '#8B5CF6',
        bgColor: '#F5F3FF',
      },
    ];
  }, [stats]);

  const quickActions = useMemo(() => [
    {
      label: 'Propriétés',
      icon: 'home-group' as const,
      onPress: () => router.push('/inventory/Inventory'),
      color: '#6366F1',
      gradient: ['#6366F1', '#818CF8'] as [string, string],
    },
    {
      label: 'Demandes',
      icon: 'clipboard-text-clock-outline' as const,
      onPress: () => router.push('/owner/RequestsManagementScreen'),
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'] as [string, string],
    },
    {
      label: 'Services',
      icon: 'wrench-outline' as const,
      onPress: () => router.push('/inventory/Inventory'),
      color: '#EC4899',
      gradient: ['#EC4899', '#F472B6'] as [string, string],
    },
    {
      label: 'Paiements',
      icon: 'wallet-outline' as const,
      onPress: () => router.push('/wallet/Wallet'),
      color: '#10B981',
      gradient: ['#10B981', '#34D399'] as [string, string],
    },
  ], []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
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

  const getStatusIcon = (status: string): any => {
    switch (status) {
      case 'accepted': return 'check-circle-outline';
      case 'rejected': return 'close-circle-outline';
      case 'pending': return 'clock-outline';
      default: return 'help-circle-outline';
    }
  };

  const getPropertyStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return theme.success;
      case 'RENTED': return theme.primary;
      case 'MAINTENANCE': return theme.star;
      default: return theme.onSurface + '60';
    }
  };

  const getPropertyStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return 'Disponible';
      case 'RENTED': return 'Loué';
      case 'MAINTENANCE': return 'Maintenance';
      default: return status;
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView
        style={{ paddingHorizontal: 20, paddingTop: insets.top + 10, paddingBottom: 10 }}
      >
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText style={[styles.greeting, { color:theme.text }]}>
              {greeting},
            </ThemedText>
            <ThemedText type ="subtitle" intensity ="strong" style={[styles.userName, { color: theme.text }]}>
              {firstName}
            </ThemedText>
          </ThemedView>
          <TouchableOpacity
            onPress={() => router.push('/property/create' as any)}
            style={{ backgroundColor:theme.surfaceVariant, width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={20} color= {theme.text} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* ---- REVENUE HIGHLIGHT CARD ---- */}
        {stats && (
          <ThemedView style={styles.revenueCardContainer}>
            <ThemedView
              style={styles.revenueCard}
            >
              <ThemedView style={styles.revenueCardInner}>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText type ="normal" style={styles.revenueLabel}>Revenus totaux</ThemedText>
                  <ThemedText type ="title" intensity ="strong" style={styles.revenueValue}>
                    {stats.totalRevenue.toLocaleString()}
                  </ThemedText>
                  <ThemedText type ="caption" style={styles.revenueCurrency}>XAF</ThemedText>
                </ThemedView>
                <ThemedView style={styles.revenueIconCircle}>
                  <MaterialCommunityIcons name="trending-up" size={28} color= {theme.text} />
                </ThemedView>
              </ThemedView>
              <ThemedView style={styles.revenueFooter}>
                <ThemedView style={styles.revenueFooterItem}>
                  <MaterialCommunityIcons name="home-outline" size={14} color= {theme.text} />
                  <ThemedText type = "normal" style={styles.revenueFooterText}>
                    {stats.totalProperties} propriété{stats.totalProperties > 1 ? 's' : ''}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.revenueDivider} />
                <ThemedView style={styles.revenueFooterItem}>
                  <MaterialCommunityIcons name="briefcase-outline" size={14} color= {theme.text} />
                  <ThemedText type = "normal" style={styles.revenueFooterText}>
                    {stats.totalServices} service{stats.totalServices > 1 ? 's' : ''}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* ---- STAT CARDS ---- */}
        {statCards.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
          >
            {statCards.map((card, index) => (
              <ThemedView
                key={index}
                style={[styles.statCard, {
                  backgroundColor: theme.surface as string,
                  borderColor: theme.outline + '15',
                }]}
              >
                <ThemedView style={[styles.statIconWrap, { backgroundColor: card.bgColor }]}>
                  <MaterialCommunityIcons name={card.icon} size={20} color={card.color} />
                </ThemedView>
                <ThemedText style={[styles.statValue, { color: theme.onSurface }]}>
                  {card.value}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.onSurface + '60' }]}>
                  {card.label}
                </ThemedText>
                {card.badge && (
                  <ThemedView style={styles.statBadgeDot}>
                    <ThemedView style={[styles.statBadgeDotInner, { backgroundColor: card.color }]} />
                  </ThemedView>
                )}
              </ThemedView>
            ))}
          </ScrollView>
        )}

        {/* ---- QUICK ACTIONS ---- */}
        <ThemedView style={styles.section}>
          <ThemedText type="normaltitle" intensity = "strong" style={[styles.sectionTitle, { color: theme.onSurface }]}>
            Actions rapides
          </ThemedText>
          <ThemedView style={styles.actionsRow}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                style={styles.actionItem}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.actionIconCircle}
                >
                  <MaterialCommunityIcons name={action.icon} size={22} color= {theme.text} />
                </LinearGradient>
                <ThemedText style={[styles.actionLabel, { color: theme.onSurface }]} numberOfLines={1}>
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* ---- RECENT ACTIVITY ---- */}
        {stats && stats.recentActivity.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.sectionHeaderRow}>
              <ThemedText type="normaltitle" intensity = "strong" style={[styles.sectionTitle, { color: theme.onSurface }]}>
                Activité récente
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push('/owner/RequestsManagementScreen')}
                style={[styles.seeAllBtn, { backgroundColor: theme.primary + '10' }]}
              >
                <ThemedText style={[styles.seeAllText, { color: theme.primary as string }]}>
                  Voir tout
                </ThemedText>
                <MaterialCommunityIcons name="chevron-right" size={16} color={theme.primary as string} />
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.activityList}>
              {[...stats.recentActivity]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((activity: OwnerActivity) => (
                <ThemedView
                  key={activity.id}
                  style={[styles.activityCard, {
                    backgroundColor: theme.surface as string,
                    borderColor: theme.outline + '10',
                  }]}
                >
                  <ThemedView style={styles.activityLeftAccent}>
                    <ThemedView style={[
                      styles.activityAccentLine,
                      { backgroundColor: getStatusColor(activity.status) }
                    ]} />
                  </ThemedView>
                  <ThemedView style={[
                    styles.activityIconWrap,
                    { backgroundColor: (activity.type === 'visit' ? '#FEF3C7' : '#D1FAE5') }
                  ]}>
                    <MaterialCommunityIcons
                      name={activity.type === 'visit' ? 'eye-outline' : 'bookmark-outline'}
                      size={16}
                      color={activity.type === 'visit' ? theme.star : theme.success}
                    />
                  </ThemedView>
                  <ThemedView backgroundColor = "transparent" style={styles.activityBody}>
                    <ThemedText type ="normal" style={[styles.activityTitle, { color: theme.onSurface }]} numberOfLines={1}>
                      {activity.title}
                    </ThemedText>
                    <ThemedText type = "body" intensity = "light" style={styles.activitySub} numberOfLines={1}>
                      {activity.clientName}{activity.propertyTitle ? ` · ${activity.propertyTitle}` : ''}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView backgroundColor = "transparent"style={styles.activityRight}>
                    <ThemedView style={[styles.statusChip, { backgroundColor: getStatusColor(activity.status) + '15' }]}>
                      <MaterialCommunityIcons
                        name={getStatusIcon(activity.status)}
                        size={12}
                        color={getStatusColor(activity.status)}
                      />
                      <ThemedText style={[styles.statusChipText, { color: getStatusColor(activity.status) }]}>
                        {getStatusLabel(activity.status)}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.activityDate}>
                      {new Date(activity.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        {/* ---- PROPERTIES CAROUSEL ---- */}
        {properties.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.sectionHeaderRow}>
              <ThemedText type="normaltitle" intensity = "strong" style={[styles.sectionTitle, { color: theme.onSurface }]}>
                Mes propriétés
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push('/inventory/Inventory')}
                style={[styles.seeAllBtn, { backgroundColor: theme.primary + '10' }]}
              >
                <ThemedText style={[styles.seeAllText, { color: theme.primary as string }]}>
                  Gérer
                </ThemedText>
                <MaterialCommunityIcons name="chevron-right" size={16} color={theme.primary as string} />
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={properties}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item: prop }: { item: OwnerProperty }) => (
                <TouchableOpacity
                  style={[styles.propCard, {
                    backgroundColor: theme.surface as string,
                    borderColor: theme.outline + '80',
                  }]}
                  onPress={() => router.push(`/property/${prop.id}` as any)}
                  activeOpacity={0.85}
                >
                  <ThemedView style={styles.propImageWrap}>
                    <Image
                      source={{ uri: prop.images?.[0] }}
                      style={styles.propImage}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.5)']}
                      style={styles.propImageOverlay}
                    />
                    <ThemedView style={[
                      styles.propStatusChip,
                      { backgroundColor: getPropertyStatusColor(prop.status) }
                    ]}>
                      <ThemedText style={styles.propStatusText}>
                        {getPropertyStatusLabel(prop.status)}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedView style={styles.propBody}>
                    <ThemedText type ="normal" intensity ="strong" numberOfLines={1} style={[styles.propTitle, { color: theme.onSurface }]}>
                      {prop.title}
                    </ThemedText>
                    <ThemedView style={styles.propFooter}>
                      <ThemedView style={styles.propTypeWrap}>
                        <MaterialCommunityIcons name="tag-outline" size={13} color={theme.text + '80'} />
                        <ThemedText type ="caption">
                          {prop.propertyType}
                        </ThemedText>
                      </ThemedView>
                      <ThemedText  type ="body" style={[styles.propPrice, { color: theme.primary as string }]}>
                        {prop.ownerCriteria?.monthlyRent?.toLocaleString()} {prop.ownerCriteria?.currency || 'XAF'}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        )}

        {/* ---- EMPTY STATE ---- */}
        {!stats && !loading && (
          <ThemedView style={styles.emptyContainer}>
            <ThemedView style={[styles.emptyIconCircle, { backgroundColor: theme.primary + '10' }]}>
              <MaterialCommunityIcons name="home-plus-outline" size={48} color={theme.primary as string} />
            </ThemedView>
            <ThemedText style={[styles.emptyTitle, { color: theme.onSurface }]}>
              Bienvenue sur votre Dashboard
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: theme.onSurface + '60' }]}>
              Créez votre première propriété pour commencer à gérer vos biens et suivre vos revenus.
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/creation')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.primary as string, (theme.secondary || theme.primary + 'CC') as string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButton}
              >
                <MaterialCommunityIcons name="plus" size={20} color={theme.text} />
                <ThemedText style={styles.emptyButtonText}>
                  Créer une propriété
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  // ---- Header ----
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    letterSpacing: 0.2,
  },
  userName: {
    letterSpacing: -0.5,
    marginTop: 2,
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  modeBtnActive: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- Revenue Card ----
  revenueCardContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  revenueCard: {
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  revenueCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  revenueLabel: {
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  revenueValue: {
    letterSpacing: -1,
    marginTop: 4,
  },
  revenueCurrency: {
    fontWeight: '600',
    marginTop: 2,
  },
  revenueIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  revenueFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revenueFooterText: {
    fontWeight: '500',
  },
  revenueDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },

  // ---- Stat Cards ----
  statsScrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 6,
  },
  statCard: {
    width: (SCREEN_WIDTH - 70) / 4,
    minWidth: 80,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  statBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statBadgeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ---- Quick Actions ----
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    letterSpacing: -0.2,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 0,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
    width: (SCREEN_WIDTH - 80) / 4,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ---- Activity ----
  activityList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityLeftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  activityAccentLine: {
    flex: 1,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  activityIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityBody: {
    flex: 1,
    marginRight: 8,
  },
  activityTitle: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  activitySub: {
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activityDate: {
    fontWeight: '500',
  },

  // ---- Property Cards ----
  propCard: {
    width: PROPERTY_CARD_WIDTH,
    borderRadius: 16,
    marginRight: 14,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  propImageWrap: {
    position: 'relative',
  },
  propImage: {
    width: '100%',
    height: 140,
  },
  propImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  propStatusChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  propStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  propBody: {
    padding: 12,
    gap: 6,
  },
  propTitle: {
    letterSpacing: -0.2,
  },
  propFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  propTypeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propType: {
    fontSize: 11,
    fontWeight: '500',
  },
  propPrice: {
    letterSpacing: -0.3,
  },

  // ---- Empty State ----
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default OwnerDashboardScreen;
