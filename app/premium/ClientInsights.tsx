import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
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

// ─── GraphQL Queries ─────────────────────────────────────────────

const SMART_RECOMMENDATIONS_QUERY = `
  query SmartRecommendations($page: Int, $limit: Int) {
    smartRecommendations(page: $page, limit: $limit) {
      properties
      total
      page
      totalPages
    }
  }
`;

const PRICE_HISTORY_QUERY = `
  query PriceHistory($area: String!, $months: Int) {
    priceHistory(area: $area, months: $months) {
      area
      data {
        period
        avgRent
        minRent
        maxRent
        count
      }
    }
  }
`;

const NEIGHBORHOOD_INSIGHTS_QUERY = `
  query NeighborhoodInsights($area: String!) {
    neighborhoodInsights(area: $area) {
      area
      overview {
        totalListings
        availableListings
        avgRent
        minRent
        maxRent
        avgSurface
        avgPricePerSqm
      }
      propertyTypeBreakdown {
        type
        count
        avgRent
        percentage
      }
      priceRangeDistribution {
        range
        count
        percentage
      }
      trends {
        listingsGrowth
        avgRentChange
      }
      nearbyAreas {
        area
        avgRent
        totalListings
      }
    }
  }
`;

const AVAILABLE_AREAS_QUERY = `
  query AvailableAreas {
    availableAreas
  }
`;

// ─── Types ───────────────────────────────────────────────────────

type TabKey = 'recommendations' | 'prix' | 'quartier';

interface PriceDataPoint {
  period: string;
  avgRent: number;
  minRent: number;
  maxRent: number;
  count: number;
}

interface NeighborhoodOverview {
  totalListings: number;
  availableListings: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  avgSurface: number;
  avgPricePerSqm: number;
}

interface PropertyTypeBreakdown {
  type: string;
  count: number;
  avgRent: number;
  percentage: number;
}

interface PriceRangeDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface NeighborhoodTrends {
  listingsGrowth: number;
  avgRentChange: number;
}

interface NearbyArea {
  area: string;
  avgRent: number;
  totalListings: number;
}

interface NeighborhoodData {
  area: string;
  overview: NeighborhoodOverview;
  propertyTypeBreakdown: PropertyTypeBreakdown[];
  priceRangeDistribution: PriceRangeDistribution[];
  trends: NeighborhoodTrends;
  nearbyAreas: NearbyArea[];
}

interface RecommendationProperty {
  id?: string;
  title?: string;
  area?: string;
  price?: number;
  image?: string;
  type?: string;
  surface?: number;
  [key: string]: any;
}

// ─── Component ───────────────────────────────────────────────────

const ClientInsightsScreen = () => {
  const { theme } = useTheme();
  const { user } = useUser();
  const { t } = useLanguage();
  const { isPremium, requirePremium, hasPriceHistory, hasNeighborhoodInsights, hasSmartRecommendation } = usePremiumFeatures();

  const [activeTab, setActiveTab] = useState<TabKey>('recommendations');
  const [refreshing, setRefreshing] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendationProperty[]>([]);
  const [recPage, setRecPage] = useState(1);
  const [recTotalPages, setRecTotalPages] = useState(1);
  const [recLoading, setRecLoading] = useState(false);

  // Price history state
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [priceArea, setPriceArea] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);

  // Neighborhood state
  const [neighborhoodData, setNeighborhoodData] = useState<NeighborhoodData | null>(null);
  const [neighborhoodArea, setNeighborhoodArea] = useState('');
  const [neighborhoodLoading, setNeighborhoodLoading] = useState(false);

  // Areas
  const [areas, setAreas] = useState<string[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [areaPickerTarget, setAreaPickerTarget] = useState<'prix' | 'quartier'>('prix');

  // Error state
  const [error, setError] = useState<string | null>(null);

  // ─── Data Fetching ─────────────────────────────────────────────

  const fetchAreas = async () => {
    setAreasLoading(true);
    try {
      const result = await getGraphQLService().query<{ availableAreas: string[] }>(
        AVAILABLE_AREAS_QUERY,
        {},
        'AvailableAreas'
      );
      if (result?.availableAreas) {
        setAreas(result.availableAreas);
        if (!priceArea && result.availableAreas.length > 0) {
          setPriceArea(result.availableAreas[0]);
        }
        if (!neighborhoodArea && result.availableAreas.length > 0) {
          setNeighborhoodArea(result.availableAreas[0]);
        }
      }
    } catch (err: any) {
      console.error('[ClientInsights] Error fetching areas:', err);
    } finally {
      setAreasLoading(false);
    }
  };

  const fetchRecommendations = async (page = 1) => {
    if (!hasSmartRecommendation) return;
    setRecLoading(true);
    setError(null);
    try {
      const result = await getGraphQLService().query<{
        smartRecommendations: {
          properties: any[];
          total: number;
          page: number;
          totalPages: number;
        };
      }>(SMART_RECOMMENDATIONS_QUERY, { page, limit: 10 }, 'SmartRecommendations');

      if (result?.smartRecommendations) {
        const props = result.smartRecommendations.properties || [];
        const parsed: RecommendationProperty[] = props.map((p: any) =>
          typeof p === 'string' ? JSON.parse(p) : p
        );
        setRecommendations(parsed);
        setRecPage(result.smartRecommendations.page);
        setRecTotalPages(result.smartRecommendations.totalPages);
      }
    } catch (err: any) {
      setError(err.message || t('common.error' as any));
    } finally {
      setRecLoading(false);
    }
  };

  const fetchPriceHistory = async (area: string) => {
    if (!hasPriceHistory || !area) return;
    setPriceLoading(true);
    setError(null);
    try {
      const result = await getGraphQLService().query<{
        priceHistory: { area: string; data: PriceDataPoint[] };
      }>(PRICE_HISTORY_QUERY, { area, months: 12 }, 'PriceHistory');

      if (result?.priceHistory?.data) {
        setPriceData(result.priceHistory.data);
      }
    } catch (err: any) {
      setError(err.message || t('common.error' as any));
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchNeighborhood = async (area: string) => {
    if (!hasNeighborhoodInsights || !area) return;
    setNeighborhoodLoading(true);
    setError(null);
    try {
      const result = await getGraphQLService().query<{
        neighborhoodInsights: NeighborhoodData;
      }>(NEIGHBORHOOD_INSIGHTS_QUERY, { area }, 'NeighborhoodInsights');

      if (result?.neighborhoodInsights) {
        setNeighborhoodData(result.neighborhoodInsights);
      }
    } catch (err: any) {
      setError(err.message || t('common.error' as any));
    } finally {
      setNeighborhoodLoading(false);
    }
  };

  // ─── Effects ───────────────────────────────────────────────────

  useEffect(() => {
    if (isPremium) {
      fetchAreas();
      fetchRecommendations(1);
    }
  }, [isPremium]);

  useEffect(() => {
    if (priceArea && activeTab === 'prix') {
      fetchPriceHistory(priceArea);
    }
  }, [priceArea, activeTab]);

  useEffect(() => {
    if (neighborhoodArea && activeTab === 'quartier') {
      fetchNeighborhood(neighborhoodArea);
    }
  }, [neighborhoodArea, activeTab]);

  // ─── Handlers ──────────────────────────────────────────────────

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAreas();
    if (activeTab === 'recommendations') {
      await fetchRecommendations(recPage);
    } else if (activeTab === 'prix') {
      await fetchPriceHistory(priceArea);
    } else {
      await fetchNeighborhood(neighborhoodArea);
    }
    setRefreshing(false);
  };

  const openAreaPicker = (target: 'prix' | 'quartier') => {
    setAreaPickerTarget(target);
    setShowAreaPicker(!showAreaPicker);
  };

  const selectArea = (area: string) => {
    if (areaPickerTarget === 'prix') {
      setPriceArea(area);
    } else {
      setNeighborhoodArea(area);
    }
    setShowAreaPicker(false);
  };

  // ─── Premium Gate ──────────────────────────────────────────────

  if (!isPremium) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <ThemedView style={{ alignItems: 'center' }} backgroundColor="transparent">
            <Ionicons name="lock-closed" size={64} color={theme.primary} />
            <ThemedText type="normaltitle" style={{ marginTop: 16, textAlign: 'center' }}>
              {t('premium.premiumRequired' as any)}
            </ThemedText>
            <ThemedText type="body" style={{ marginTop: 8, textAlign: 'center', opacity: 0.7 }}>
              {t('premium.premiumRequiredMsg' as any)}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/premium/Premium')}
              style={{ marginTop: 24 }}
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary || theme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
              >
                <ThemedText type="normal" style={{ color: 'white', fontWeight: '600' }}>
                  {t('premium.upgradeToPremium' as any)}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>
        </MotiView>
      </ThemedView>
    );
  }

  // ─── Tab Definitions ───────────────────────────────────────────

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'recommendations', label: t('premium.clientSmartRecommendation' as any), icon: 'sparkles' },
    { key: 'prix', label: t('premium.clientPriceHistory' as any), icon: 'bar-chart' },
    { key: 'quartier', label: t('premium.clientNeighborhoodInsights' as any), icon: 'location' },
  ];

  // ─── Subcomponents ─────────────────────────────────────────────

  const renderTabSwitcher = () => (
    <ThemedView
      style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}
      backgroundColor="transparent"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{ flex: 1 }}
          >
            <ThemedView
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderRadius: 10,
                backgroundColor: isActive ? theme.primary : theme.surface || theme.background,
                borderWidth: isActive ? 0 : 1,
                borderColor: theme.outline + '30',
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={isActive ? '#fff' : theme.text}
                style={{ marginRight: 4 }}
              />
              <ThemedText
                type="caption"
                style={{
                  color: isActive ? '#fff' : theme.text,
                  fontWeight: isActive ? '700' : '500',
                  fontSize: 11,
                }}
                numberOfLines={1}
              >
                {tab.label}
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );

  const renderAreaSelector = (
    currentArea: string,
    target: 'prix' | 'quartier'
  ) => (
    <ThemedView style={{ paddingHorizontal: 16, marginBottom: 12 }} backgroundColor="transparent">
      <TouchableOpacity onPress={() => openAreaPicker(target)}>
        <ThemedView
          variant="surface"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.outline + '30',
          }}
        >
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }} backgroundColor="transparent">
            <Ionicons name="location-outline" size={18} color={theme.primary} />
            <ThemedText type="body" style={{ marginLeft: 8 }}>
              {currentArea || t('premium.selectArea' as any)}
            </ThemedText>
          </ThemedView>
          <Ionicons
            name={showAreaPicker && areaPickerTarget === target ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.text}
          />
        </ThemedView>
      </TouchableOpacity>

      {showAreaPicker && areaPickerTarget === target && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 250 }}
        >
          <ThemedView
            variant="surface"
            style={{
              marginTop: 4,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.outline + '30',
              maxHeight: 200,
              overflow: 'hidden',
            }}
          >
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
              {areasLoading ? (
                <ActivityIndicator size="small" color={theme.primary} style={{ padding: 16 }} />
              ) : areas.length === 0 ? (
                <ThemedText type="caption" style={{ padding: 16, textAlign: 'center' }}>
                  {t('common.noData' as any)}
                </ThemedText>
              ) : (
                areas.map((area, idx) => (
                  <TouchableOpacity
                    key={area}
                    onPress={() => selectArea(area)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderBottomWidth: idx < areas.length - 1 ? 1 : 0,
                      borderBottomColor: theme.outline + '15',
                      backgroundColor: area === currentArea ? theme.primary + '15' : 'transparent',
                    }}
                  >
                    <ThemedText
                      type="body"
                      style={{
                        color: area === currentArea ? theme.primary : theme.text,
                        fontWeight: area === currentArea ? '600' : '400',
                      }}
                    >
                      {area}
                    </ThemedText>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </ThemedView>
        </MotiView>
      )}
    </ThemedView>
  );

  const renderLoading = () => (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }} backgroundColor="transparent">
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText type="caption" style={{ marginTop: 12, opacity: 0.6 }}>
        {t('common.loading' as any)}
      </ThemedText>
    </ThemedView>
  );

  const renderError = () => (
    <ThemedView style={{ padding: 20, alignItems: 'center' }} backgroundColor="transparent">
      <Ionicons name="alert-circle-outline" size={40} color="#E74C3C" />
      <ThemedText type="body" style={{ marginTop: 8, textAlign: 'center', color: '#E74C3C' }}>
        {error}
      </ThemedText>
      <TouchableOpacity onPress={onRefresh} style={{ marginTop: 12 }}>
        <ThemedText type="body" style={{ color: theme.primary }}>
          {t('common.retry' as any)}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  // ─── Tab 1: Recommendations ────────────────────────────────────

  const renderRecommendations = () => {
    if (recLoading) return renderLoading();
    if (error) return renderError();

    if (recommendations.length === 0) {
      return (
        <ThemedView style={{ padding: 32, alignItems: 'center' }} backgroundColor="transparent">
          <Ionicons name="sparkles-outline" size={48} color={theme.primary + '60'} />
          <ThemedText type="body" style={{ marginTop: 12, textAlign: 'center', opacity: 0.6 }}>
            {t('premium.noRecommendations' as any)}
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={{ paddingHorizontal: 16 }} backgroundColor="transparent">
        {recommendations.map((property, index) => (
          <MotiView
            key={property.id || index}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: index * 80 }}
          >
            <TouchableOpacity
              style={{ marginBottom: 12 }}
              activeOpacity={0.8}
              onPress={() => {
                if (property.id) {
                  router.push(`/property/${property.id}` as any);
                }
              }}
            >
              <ThemedView
                variant="surface"
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: theme.outline + '20',
                }}
              >
                {/* Image placeholder */}
                <ThemedView
                  style={{
                    height: 140,
                    backgroundColor: theme.primary + '12',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {property.image ? (
                    <ThemedView
                      style={{ width: '100%', height: '100%', backgroundColor: theme.primary + '08' }}
                    >
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color={theme.primary + '40'}
                        style={{ position: 'absolute', top: '35%', left: '45%' }}
                      />
                    </ThemedView>
                  ) : (
                    <Ionicons name="home-outline" size={40} color={theme.primary + '50'} />
                  )}
                  {/* Price badge */}
                  {property.price != null && (
                    <ThemedView
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: theme.primary,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                      }}
                    >
                      <ThemedText type="caption" style={{ color: '#fff', fontWeight: '700' }}>
                        {Number(property.price).toLocaleString()} FCFA
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>

                {/* Card content */}
                <ThemedView style={{ padding: 14 }} backgroundColor="transparent">
                  <ThemedText type="normal" intensity="strong" numberOfLines={1}>
                    {property.title || t('premium.untitledProperty' as any)}
                  </ThemedText>
                  <ThemedView
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                    backgroundColor="transparent"
                  >
                    <Ionicons name="location-outline" size={14} color={theme.primary} />
                    <ThemedText type="caption" style={{ marginLeft: 4, opacity: 0.7 }}>
                      {property.area || '-'}
                    </ThemedText>
                    {property.type && (
                      <>
                        <ThemedView
                          style={{
                            width: 3,
                            height: 3,
                            borderRadius: 1.5,
                            backgroundColor: theme.text + '40',
                            marginHorizontal: 8,
                          }}
                        />
                        <ThemedText type="caption" style={{ opacity: 0.7 }}>
                          {property.type}
                        </ThemedText>
                      </>
                    )}
                    {property.surface != null && (
                      <>
                        <ThemedView
                          style={{
                            width: 3,
                            height: 3,
                            borderRadius: 1.5,
                            backgroundColor: theme.text + '40',
                            marginHorizontal: 8,
                          }}
                        />
                        <ThemedText type="caption" style={{ opacity: 0.7 }}>
                          {property.surface} m²
                        </ThemedText>
                      </>
                    )}
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          </MotiView>
        ))}

        {/* Pagination */}
        {recTotalPages > 1 && (
          <ThemedView
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
              paddingVertical: 12,
            }}
            backgroundColor="transparent"
          >
            <TouchableOpacity
              disabled={recPage <= 1}
              onPress={() => fetchRecommendations(recPage - 1)}
              style={{ opacity: recPage <= 1 ? 0.3 : 1 }}
            >
              <Ionicons name="chevron-back-circle" size={36} color={theme.primary} />
            </TouchableOpacity>
            <ThemedText type="body">
              {recPage} / {recTotalPages}
            </ThemedText>
            <TouchableOpacity
              disabled={recPage >= recTotalPages}
              onPress={() => fetchRecommendations(recPage + 1)}
              style={{ opacity: recPage >= recTotalPages ? 0.3 : 1 }}
            >
              <Ionicons name="chevron-forward-circle" size={36} color={theme.primary} />
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  // ─── Tab 2: Price History ──────────────────────────────────────

  const renderPriceHistory = () => {
    if (priceLoading) return renderLoading();
    if (error) return renderError();

    return (
      <ThemedView style={{ paddingHorizontal: 16 }} backgroundColor="transparent">
        {renderAreaSelector(priceArea, 'prix')}

        {priceData.length === 0 ? (
          <ThemedView style={{ padding: 32, alignItems: 'center' }} backgroundColor="transparent">
            <Ionicons name="bar-chart-outline" size={48} color={theme.primary + '60'} />
            <ThemedText type="body" style={{ marginTop: 12, textAlign: 'center', opacity: 0.6 }}>
              {t('premium.noPriceData' as any)}
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            {/* Header row */}
            <ThemedView
              style={{
                flexDirection: 'row',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderBottomWidth: 2,
                borderBottomColor: theme.primary + '30',
                marginBottom: 4,
              }}
              backgroundColor="transparent"
            >
              <ThemedText type="caption" intensity="strong" style={{ flex: 2 }}>
                {t('premium.period' as any)}
              </ThemedText>
              <ThemedText type="caption" intensity="strong" style={{ flex: 2, textAlign: 'right' }}>
                {t('premium.avgRent' as any)}
              </ThemedText>
              <ThemedText type="caption" intensity="strong" style={{ flex: 1, textAlign: 'right' }}>
                {t('premium.count' as any)}
              </ThemedText>
            </ThemedView>

            {priceData.map((item, index) => (
              <MotiView
                key={item.period}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 300, delay: index * 50 }}
              >
                <ThemedView
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.outline + '15',
                    backgroundColor: index % 2 === 0 ? 'transparent' : theme.primary + '05',
                    borderRadius: 4,
                  }}
                >
                  <ThemedText type="body" style={{ flex: 2, fontSize: 13 }}>
                    {item.period}
                  </ThemedText>
                  <ThemedText type="body" intensity="strong" style={{ flex: 2, textAlign: 'right', fontSize: 13 }}>
                    {Number(item.avgRent).toLocaleString()} F
                  </ThemedText>
                  <ThemedText type="caption" style={{ flex: 1, textAlign: 'right' }}>
                    {item.count}
                  </ThemedText>
                </ThemedView>
              </MotiView>
            ))}

            {/* Min / Max summary */}
            {priceData.length > 0 && (
              <ThemedView
                variant="surface"
                style={{
                  flexDirection: 'row',
                  marginTop: 16,
                  borderRadius: 12,
                  padding: 14,
                  gap: 8,
                }}
              >
                <ThemedView style={{ flex: 1, alignItems: 'center' }} backgroundColor="transparent">
                  <Ionicons name="arrow-down-circle" size={20} color="#27AE60" />
                  <ThemedText type="caption" style={{ marginTop: 4, opacity: 0.6 }}>
                    Min
                  </ThemedText>
                  <ThemedText type="body" intensity="strong" style={{ fontSize: 13 }}>
                    {Math.min(...priceData.map((d) => d.minRent)).toLocaleString()} F
                  </ThemedText>
                </ThemedView>
                <ThemedView style={{ flex: 1, alignItems: 'center' }} backgroundColor="transparent">
                  <Ionicons name="arrow-up-circle" size={20} color="#E74C3C" />
                  <ThemedText type="caption" style={{ marginTop: 4, opacity: 0.6 }}>
                    Max
                  </ThemedText>
                  <ThemedText type="body" intensity="strong" style={{ fontSize: 13 }}>
                    {Math.max(...priceData.map((d) => d.maxRent)).toLocaleString()} F
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </>
        )}
      </ThemedView>
    );
  };

  // ─── Tab 3: Neighborhood Insights ─────────────────────────────

  const renderNeighborhood = () => {
    if (neighborhoodLoading) return renderLoading();
    if (error) return renderError();

    return (
      <ThemedView style={{ paddingHorizontal: 16 }} backgroundColor="transparent">
        {renderAreaSelector(neighborhoodArea, 'quartier')}

        {!neighborhoodData ? (
          <ThemedView style={{ padding: 32, alignItems: 'center' }} backgroundColor="transparent">
            <Ionicons name="location-outline" size={48} color={theme.primary + '60'} />
            <ThemedText type="body" style={{ marginTop: 12, textAlign: 'center', opacity: 0.6 }}>
              {t('premium.noNeighborhoodData' as any)}
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            {/* Overview Stats Cards */}
            <ThemedText type="normal" intensity="strong" style={{ marginBottom: 10 }}>
              {t('premium.overview' as any)}
            </ThemedText>
            <ThemedView
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}
              backgroundColor="transparent"
            >
              {[
                {
                  label: t('premium.totalListings' as any),
                  value: neighborhoodData.overview.totalListings,
                  icon: 'list',
                  color: '#6C5CE7',
                },
                {
                  label: t('premium.availableListings' as any),
                  value: neighborhoodData.overview.availableListings,
                  icon: 'checkmark-circle',
                  color: '#00B894',
                },
                {
                  label: t('premium.avgRent' as any),
                  value: `${Number(neighborhoodData.overview.avgRent).toLocaleString()} F`,
                  icon: 'cash',
                  color: '#FDCB6E',
                },
                {
                  label: t('premium.avgSurface' as any),
                  value: `${neighborhoodData.overview.avgSurface} m²`,
                  icon: 'resize',
                  color: '#0984E3',
                },
                {
                  label: t('premium.pricePerSqm' as any),
                  value: `${Number(neighborhoodData.overview.avgPricePerSqm).toLocaleString()} F`,
                  icon: 'calculator',
                  color: '#E17055',
                },
                {
                  label: 'Min - Max',
                  value: `${Number(neighborhoodData.overview.minRent).toLocaleString()} - ${Number(neighborhoodData.overview.maxRent).toLocaleString()} F`,
                  icon: 'swap-vertical',
                  color: '#636E72',
                },
              ].map((stat, idx) => (
                <MotiView
                  key={idx}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', duration: 350, delay: idx * 60 }}
                  style={{ width: (SCREEN_WIDTH - 48) / 2 }}
                >
                  <ThemedView
                    variant="surface"
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      borderLeftWidth: 3,
                      borderLeftColor: stat.color,
                    }}
                  >
                    <ThemedView
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                      backgroundColor="transparent"
                    >
                      <Ionicons name={stat.icon as any} size={16} color={stat.color} />
                      <ThemedText type="caption" style={{ marginLeft: 6, opacity: 0.7, fontSize: 11 }}>
                        {stat.label}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText type="body" intensity="strong" style={{ fontSize: 13 }}>
                      {stat.value}
                    </ThemedText>
                  </ThemedView>
                </MotiView>
              ))}
            </ThemedView>

            {/* Property Type Breakdown */}
            {neighborhoodData.propertyTypeBreakdown.length > 0 && (
              <>
                <ThemedText type="normal" intensity="strong" style={{ marginBottom: 10 }}>
                  {t('premium.propertyTypes' as any)}
                </ThemedText>
                {neighborhoodData.propertyTypeBreakdown.map((item, idx) => (
                  <MotiView
                    key={item.type}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: idx * 80 }}
                  >
                    <ThemedView
                      style={{ marginBottom: 10 }}
                      backgroundColor="transparent"
                    >
                      <ThemedView
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                        backgroundColor="transparent"
                      >
                        <ThemedText type="body" style={{ fontSize: 13 }}>
                          {item.type}
                        </ThemedText>
                        <ThemedText type="caption" style={{ opacity: 0.6 }}>
                          {item.count} ({item.percentage.toFixed(1)}%)
                        </ThemedText>
                      </ThemedView>
                      {/* Horizontal bar */}
                      <ThemedView
                        style={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.outline + '20',
                          overflow: 'hidden',
                        }}
                      >
                        <MotiView
                          from={{ width: '0%' }}
                          animate={{ width: `${Math.min(item.percentage, 100)}%` as any }}
                          transition={{ type: 'timing', duration: 600, delay: idx * 100 }}
                          style={{
                            height: '100%',
                            borderRadius: 4,
                            backgroundColor: theme.primary,
                          }}
                        />
                      </ThemedView>
                      <ThemedText type="caption" style={{ marginTop: 2, opacity: 0.5, fontSize: 11 }}>
                        {t('premium.avgRent' as any)}: {Number(item.avgRent).toLocaleString()} F
                      </ThemedText>
                    </ThemedView>
                  </MotiView>
                ))}
              </>
            )}

            {/* Trends */}
            {neighborhoodData.trends && (
              <ThemedView
                variant="surface"
                style={{
                  flexDirection: 'row',
                  marginTop: 12,
                  marginBottom: 20,
                  borderRadius: 12,
                  padding: 16,
                  gap: 16,
                }}
              >
                <ThemedView style={{ flex: 1, alignItems: 'center' }} backgroundColor="transparent">
                  <Ionicons
                    name={
                      neighborhoodData.trends.listingsGrowth >= 0
                        ? 'trending-up'
                        : 'trending-down'
                    }
                    size={24}
                    color={neighborhoodData.trends.listingsGrowth >= 0 ? '#27AE60' : '#E74C3C'}
                  />
                  <ThemedText type="caption" style={{ marginTop: 4, opacity: 0.6 }}>
                    {t('premium.listingsGrowth' as any)}
                  </ThemedText>
                  <ThemedText
                    type="body"
                    intensity="strong"
                    style={{
                      color:
                        neighborhoodData.trends.listingsGrowth >= 0 ? '#27AE60' : '#E74C3C',
                    }}
                  >
                    {neighborhoodData.trends.listingsGrowth >= 0 ? '+' : ''}
                    {neighborhoodData.trends.listingsGrowth.toFixed(1)}%
                  </ThemedText>
                </ThemedView>

                <ThemedView
                  style={{ width: 1, backgroundColor: theme.outline + '20' }}
                />

                <ThemedView style={{ flex: 1, alignItems: 'center' }} backgroundColor="transparent">
                  <Ionicons
                    name={
                      neighborhoodData.trends.avgRentChange >= 0
                        ? 'arrow-up-circle'
                        : 'arrow-down-circle'
                    }
                    size={24}
                    color={neighborhoodData.trends.avgRentChange >= 0 ? '#E74C3C' : '#27AE60'}
                  />
                  <ThemedText type="caption" style={{ marginTop: 4, opacity: 0.6 }}>
                    {t('premium.rentChange' as any)}
                  </ThemedText>
                  <ThemedText
                    type="body"
                    intensity="strong"
                    style={{
                      color:
                        neighborhoodData.trends.avgRentChange >= 0 ? '#E74C3C' : '#27AE60',
                    }}
                  >
                    {neighborhoodData.trends.avgRentChange >= 0 ? '+' : ''}
                    {neighborhoodData.trends.avgRentChange.toFixed(1)}%
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}

            {/* Nearby Areas */}
            {neighborhoodData.nearbyAreas.length > 0 && (
              <>
                <ThemedText type="normal" intensity="strong" style={{ marginBottom: 10 }}>
                  {t('premium.nearbyAreas' as any)}
                </ThemedText>
                {neighborhoodData.nearbyAreas.map((nearby, idx) => (
                  <MotiView
                    key={nearby.area}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 300, delay: idx * 60 }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setNeighborhoodArea(nearby.area);
                      }}
                    >
                      <ThemedView
                        variant="surface"
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 14,
                          borderRadius: 10,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: theme.outline + '15',
                        }}
                      >
                        <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }} backgroundColor="transparent">
                          <Ionicons name="navigate-outline" size={18} color={theme.primary} />
                          <ThemedText type="body" style={{ marginLeft: 10, fontSize: 13 }}>
                            {nearby.area}
                          </ThemedText>
                        </ThemedView>
                        <ThemedView style={{ alignItems: 'flex-end' }} backgroundColor="transparent">
                          <ThemedText type="body" intensity="strong" style={{ fontSize: 13 }}>
                            {Number(nearby.avgRent).toLocaleString()} F
                          </ThemedText>
                          <ThemedText type="caption" style={{ opacity: 0.5, fontSize: 11 }}>
                            {nearby.totalListings} {t('premium.listings' as any)}
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </>
            )}
          </>
        )}
      </ThemedView>
    );
  };

  // ─── Main Render ───────────────────────────────────────────────

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'recommendations':
        return renderRecommendations();
      case 'prix':
        return renderPriceHistory();
      case 'quartier':
        return renderNeighborhood();
      default:
        return null;
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <ThemedView style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }} backgroundColor="transparent">
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }} backgroundColor="transparent">
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="normaltitle" intensity="strong">
            {t('premium.clientInsights' as any)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Tabs */}
      {renderTabSwitcher()}

      {/* Content */}
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
        {renderActiveTab()}
      </ScrollView>
    </ThemedView>
  );
};

export default ClientInsightsScreen;
