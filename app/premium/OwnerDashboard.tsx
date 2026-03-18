import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useUser } from '@/components/contexts/user/UserContext';
import { useLanguage } from '@/components/contexts/language';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { getGraphQLService } from '@/services/api/graphqlService';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OWNER_DASHBOARD_QUERY = `
  query OwnerDashboard {
    ownerDashboard {
      overview {
        totalProperties
        activeProperties
        boostedProperties
        rentedProperties
        occupancyRate
        totalMonthlyRevenue
      }
      analytics {
        totalViews
        totalClicks
        totalImpressions
        totalContactRequests
        totalFavorites
        avgClickThroughRate
        avgContactRate
      }
      properties
    }
  }
`;

interface OverviewData {
  totalProperties: number;
  activeProperties: number;
  boostedProperties: number;
  rentedProperties: number;
  occupancyRate: number;
  totalMonthlyRevenue: number;
}

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalImpressions: number;
  totalContactRequests: number;
  totalFavorites: number;
  avgClickThroughRate: number;
  avgContactRate: number;
}

interface DashboardProperty {
  _id: string;
  title: string;
  status: string;
  views?: number;
  clicks?: number;
  isBoosted?: boolean;
}

interface DashboardData {
  overview: OverviewData;
  analytics: AnalyticsData;
  properties: DashboardProperty[];
}

// -- Stat Card --
const StatCard = ({
  icon,
  label,
  value,
  color,
  theme,
  index,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  theme: any;
  index: number;
}) => (
  <MotiView
    from={{ opacity: 0, translateY: 16 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ delay: index * 80, type: 'timing', duration: 400 }}
    style={{
      width: (SCREEN_WIDTH - 52) / 2,
      marginBottom: 12,
    }}
  >
    <ThemedView
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.outline + '15',
      }}
    >
      <ThemedView
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color + '18',
          marginBottom: 10,
        }}
      >
        <Ionicons name={icon as any} size={18} color={color} />
      </ThemedView>
      <ThemedText style={{ fontSize: 22, fontWeight: '800' }}>{value}</ThemedText>
      <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{label}</ThemedText>
    </ThemedView>
  </MotiView>
);

// -- Analytics Card (horizontal scroll) --
const AnalyticsCard = ({
  icon,
  label,
  value,
  color,
  theme,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  theme: any;
}) => (
  <ThemedView
    style={{
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 14,
      marginRight: 12,
      width: 140,
      borderWidth: 1,
      borderColor: theme.outline + '10',
    }}
  >
    <Ionicons name={icon as any} size={20} color={color} />
    <ThemedText style={{ fontSize: 20, fontWeight: '800', marginTop: 8 }}>{value}</ThemedText>
    <ThemedText style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{label}</ThemedText>
  </ThemedView>
);

// -- Property Row --
const PropertyRow = ({
  property,
  theme,
  t,
}: {
  property: DashboardProperty;
  theme: any;
  t: (key: any, params?: Record<string, string>) => string;
}) => {
  const statusColors: Record<string, string> = {
    active: '#00B894',
    rented: '#6C5CE7',
    inactive: '#B2BEC3',
    boosted: '#FDCB6E',
  };
  const badgeColor = statusColors[property.status] || theme.primary;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/property/${property._id}` as any)}
      activeOpacity={0.7}
    >
      <ThemedView
        style={{
          backgroundColor: theme.surface,
          borderRadius: 14,
          padding: 16,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.outline + '10',
        }}
      >
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
            {property.title}
          </ThemedText>
          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 6,
              gap: 12,
            }}
            backgroundColor="transparent"
          >
            <ThemedView
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
              backgroundColor="transparent"
            >
              <Ionicons name="eye-outline" size={14} color={theme.primary} />
              <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                {property.views ?? 0}
              </ThemedText>
            </ThemedView>
            <ThemedView
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
              backgroundColor="transparent"
            >
              <Ionicons name="hand-left-outline" size={14} color="#FDCB6E" />
              <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                {property.clicks ?? 0}
              </ThemedText>
            </ThemedView>
            {property.isBoosted && (
              <ThemedView
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                }}
                backgroundColor="transparent"
              >
                <Ionicons name="rocket" size={12} color="#FDCB6E" />
                <ThemedText style={{ fontSize: 11, color: '#FDCB6E', fontWeight: '600' }}>
                  Boost
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>

        <ThemedView
          style={{
            backgroundColor: badgeColor + '20',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <ThemedText style={{ fontSize: 11, fontWeight: '700', color: badgeColor }}>
            {(t as any)(`premium.dashboard.status.${property.status}`)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

// ===== MAIN COMPONENT =====
const OwnerDashboard = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { isPremium, hasMultiPropertyDashboard } = usePremiumFeatures();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await getGraphQLService().query<{ ownerDashboard: DashboardData }>(
        OWNER_DASHBOARD_QUERY,
        undefined,
        'OwnerDashboard'
      );

      if (result?.ownerDashboard) {
        setDashboardData(result.ownerDashboard);
      }
    } catch (err: any) {
      console.error('[OwnerDashboard] Fetch error:', err);
      setError(err?.message || (t as any)('premium.dashboard.fetchError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (isPremium && hasMultiPropertyDashboard) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [isPremium, hasMultiPropertyDashboard, fetchDashboard]);

  const onRefresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  // -- Premium gate --
  if (!isPremium || !hasMultiPropertyDashboard) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <LinearGradient
            colors={['#6C5CE7', '#a29bfe']}
            style={{
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              shadowColor: '#6C5CE7',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Ionicons name="lock-closed" size={48} color="white" />
            <ThemedText
              style={{
                color: 'white',
                fontSize: 20,
                fontWeight: '800',
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              {(t as any)('premium.dashboard.premiumRequired')}
            </ThemedText>
            <ThemedText
              style={{
                color: 'white',
                opacity: 0.85,
                textAlign: 'center',
                marginTop: 10,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {(t as any)('premium.dashboard.premiumRequiredDesc')}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/premium/Premium')}
              style={{
                marginTop: 20,
                backgroundColor: 'white',
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 14,
              }}
            >
              <ThemedText style={{ color: '#6C5CE7', fontWeight: '800', fontSize: 15 }}>
                {(t as any)('premium.upgradeToPremium')}
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        </MotiView>
      </ThemedView>
    );
  }

  // -- Loading state --
  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: 12, opacity: 0.6 }}>
          {(t as any)('premium.dashboard.loading')}
        </ThemedText>
      </ThemedView>
    );
  }

  // -- Error state --
  if (error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Ionicons name="cloud-offline-outline" size={56} color={theme.primary} />
        <ThemedText
          style={{ fontSize: 16, fontWeight: '700', marginTop: 16, textAlign: 'center' }}
        >
          {(t as any)('premium.dashboard.errorTitle')}
        </ThemedText>
        <ThemedText style={{ opacity: 0.6, textAlign: 'center', marginTop: 8, fontSize: 13 }}>
          {error}
        </ThemedText>
        <TouchableOpacity
          onPress={() => fetchDashboard()}
          style={{
            marginTop: 20,
            backgroundColor: theme.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <ThemedText style={{ color: 'white', fontWeight: '700' }}>
            {(t as any)('premium.dashboard.retry')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const overview = dashboardData?.overview;
  const analytics = dashboardData?.analytics;
  const properties = dashboardData?.properties ?? [];

  // -- Overview stat cards config --
  const overviewCards = [
    {
      icon: 'home-outline',
      label: (t as any)('premium.dashboard.totalProperties'),
      value: overview?.totalProperties ?? 0,
      color: theme.primary,
    },
    {
      icon: 'checkmark-circle-outline',
      label: (t as any)('premium.dashboard.activeProperties'),
      value: overview?.activeProperties ?? 0,
      color: '#00B894',
    },
    {
      icon: 'rocket-outline',
      label: (t as any)('premium.dashboard.boostedProperties'),
      value: overview?.boostedProperties ?? 0,
      color: '#FDCB6E',
    },
    {
      icon: 'key-outline',
      label: (t as any)('premium.dashboard.rentedProperties'),
      value: overview?.rentedProperties ?? 0,
      color: '#6C5CE7',
    },
    {
      icon: 'pie-chart-outline',
      label: (t as any)('premium.dashboard.occupancyRate'),
      value: `${Math.round(overview?.occupancyRate ?? 0)}%`,
      color: '#00CEC9',
    },
    {
      icon: 'cash-outline',
      label: (t as any)('premium.dashboard.monthlyRevenue'),
      value: `${(overview?.totalMonthlyRevenue ?? 0).toLocaleString()}`,
      color: '#E17055',
    },
  ];

  // -- Analytics cards config --
  const analyticsCards = [
    {
      icon: 'eye-outline',
      label: (t as any)('premium.dashboard.totalViews'),
      value: analytics?.totalViews ?? 0,
      color: '#0984E3',
    },
    {
      icon: 'hand-left-outline',
      label: (t as any)('premium.dashboard.totalClicks'),
      value: analytics?.totalClicks ?? 0,
      color: '#6C5CE7',
    },
    {
      icon: 'layers-outline',
      label: (t as any)('premium.dashboard.totalImpressions'),
      value: analytics?.totalImpressions ?? 0,
      color: '#00CEC9',
    },
    {
      icon: 'chatbubble-ellipses-outline',
      label: (t as any)('premium.dashboard.contactRequests'),
      value: analytics?.totalContactRequests ?? 0,
      color: '#E17055',
    },
    {
      icon: 'heart-outline',
      label: (t as any)('premium.dashboard.totalFavorites'),
      value: analytics?.totalFavorites ?? 0,
      color: '#E84393',
    },
  ];

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* ===== Header Gradient Card ===== */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18 }}
          style={{ paddingHorizontal: 16, paddingTop: 16 }}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 24,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#FFD700',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons name="medal-outline" size={40} color="white" />
            <ThemedView
              style={{ marginLeft: 16, flex: 1 }}
              backgroundColor="transparent"
            >
              <ThemedText style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>
                {(t as any)('premium.dashboard.title')}
              </ThemedText>
              <ThemedText style={{ color: 'white', opacity: 0.85, fontSize: 13, marginTop: 4 }}>
                {(t as any)('premium.dashboard.subtitle')}
              </ThemedText>
            </ThemedView>
          </LinearGradient>
        </MotiView>

        {/* ===== Overview Section ===== */}
        <ThemedView style={{ paddingHorizontal: 16, marginTop: 24 }} backgroundColor="transparent">
          <ThemedText style={{ fontSize: 17, fontWeight: '800', marginBottom: 14 }}>
            {(t as any)('premium.dashboard.overviewTitle')}
          </ThemedText>
          <ThemedView
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
            backgroundColor="transparent"
          >
            {overviewCards.map((card, index) => (
              <StatCard
                key={card.icon}
                icon={card.icon}
                label={card.label}
                value={card.value}
                color={card.color}
                theme={theme}
                index={index}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {/* ===== Analytics Section ===== */}
        <ThemedView style={{ marginTop: 12 }} backgroundColor="transparent">
          <ThemedText
            style={{ fontSize: 17, fontWeight: '800', marginBottom: 14, paddingHorizontal: 16 }}
          >
            {(t as any)('premium.dashboard.analyticsTitle')}
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {analyticsCards.map((card) => (
              <AnalyticsCard
                key={card.icon}
                icon={card.icon}
                label={card.label}
                value={card.value}
                color={card.color}
                theme={theme}
              />
            ))}
          </ScrollView>
        </ThemedView>

        {/* ===== Properties Section ===== */}
        <ThemedView
          style={{ paddingHorizontal: 16, marginTop: 24 }}
          backgroundColor="transparent"
        >
          <ThemedView
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
            backgroundColor="transparent"
          >
            <ThemedText style={{ fontSize: 17, fontWeight: '800' }}>
              {(t as any)('premium.dashboard.propertiesTitle')}
            </ThemedText>
            <ThemedText style={{ fontSize: 13, color: theme.primary, fontWeight: '600' }}>
              {properties.length} {(t as any)('premium.dashboard.propertiesCount')}
            </ThemedText>
          </ThemedView>

          {properties.length === 0 ? (
            <ThemedView
              style={{
                backgroundColor: theme.surface,
                borderRadius: 16,
                padding: 32,
                alignItems: 'center',
              }}
            >
              <Ionicons name="home-outline" size={40} color={theme.primary + '60'} />
              <ThemedText style={{ marginTop: 12, opacity: 0.5, textAlign: 'center' }}>
                {(t as any)('premium.dashboard.noProperties')}
              </ThemedText>
            </ThemedView>
          ) : (
            properties.map((property: any) => (
              <PropertyRow
                key={property._id}
                property={property}
                theme={theme}
                t={t}
              />
            ))
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

export default OwnerDashboard;
