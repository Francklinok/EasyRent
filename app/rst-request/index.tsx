import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { getInvestmentPipelineService, RSTRequest } from '@/services/api/investmentPipelineService';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { getUnifiedCacheService } from '@/services/offline/core/UnifiedCacheService';

const STATUS_CONFIG = {
  pending_review: { color: '#F59E0B', icon: 'clock-outline' },
  analyzing: { color: '#3B82F6', icon: 'magnify' },
  approved: { color: '#10B981', icon: 'check-circle-outline' },
  rejected: { color: '#EF4444', icon: 'close-circle-outline' },
  published: { color: '#8B5CF6', icon: 'rocket-launch-outline' },
} as const;

const RSTRequestsListScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [requests, setRequests] = useState<RSTRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    const cache = getUnifiedCacheService();
    const cacheKey = 'owner:rst-requests';
    if (!isRefresh) {
      const cached = await cache.get<RSTRequest[]>(cacheKey);
      if (cached) { setRequests(cached); setLoading(false); }
    }
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getInvestmentPipelineService().getMyRSTRequests();
      setRequests(data);
      cache.set(cacheKey, data, { ttl: 5 * 60 * 1000 }).catch(() => {});
    } catch {
      // silent — cached data still shown
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const renderItem = ({ item }: { item: RSTRequest }) => {
    const cfg = STATUS_CONFIG[item.status];
    const statusLabel = {
      pending_review: t('rstRequestsList.statusPending'),
      analyzing: t('rstRequestsList.statusAnalyzing'),
      approved: t('rstRequestsList.statusApproved'),
      rejected: t('rstRequestsList.statusRejected'),
      published: t('rstRequestsList.statusPublished'),
    }[item.status] ?? item.status;
    return (
      <ThemedView
        style={{
          marginHorizontal: 20,
          marginBottom: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.outline + '20',
          backgroundColor: theme.surface,
          padding: 16,
          gap: 10,
        }}
      >
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="normal" intensity="strong" numberOfLines={1}>
              {t('rstRequestsList.requestLabel')}
            </ThemedText>
            <ThemedText type="caption" intensity="light">
              {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </ThemedText>
          </ThemedView>
          <ThemedView
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
              backgroundColor: cfg.color + '15',
            }}
          >
            <MaterialCommunityIcons name={cfg.icon as any} size={12} color={cfg.color} />
            <ThemedText style={{ fontSize: 11, fontWeight: '700', color: cfg.color }}>{statusLabel}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={{ flexDirection: 'row', gap: 16 }}>
          <ThemedView>
            <ThemedText type="caption" intensity="light">{t('rstRequestsList.workCost')}</ThemedText>
            <ThemedText type="normal" intensity="strong">
              {item.workCostEstimate.toLocaleString()} {item.currency}
            </ThemedText>
          </ThemedView>
          <ThemedView>
            <ThemedText type="caption" intensity="light">{t('rstRequestsList.objective')}</ThemedText>
            <ThemedText type="normal" intensity="strong">
              {item.objective === 'rental' ? t('rstRequestsList.objRental') : t('rstRequestsList.objSale')}
            </ThemedText>
          </ThemedView>
          <ThemedView>
            <ThemedText type="caption" intensity="light">{t('rstRequestsList.duration')}</ThemedText>
            <ThemedText type="normal" intensity="strong">
              {`${item.renovationDurationMonths} ${t('rstRequestsList.months')}`}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {item.status === 'rejected' && item.rejectionReason && (
          <ThemedView
            style={{
              padding: 10, borderRadius: 8,
              backgroundColor: '#EF4444' + '10',
              flexDirection: 'row', gap: 6,
            }}
          >
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#EF4444" />
            <ThemedText style={{ fontSize: 12, color: '#EF4444', flex: 1 }}>
              {item.rejectionReason}
            </ThemedText>
          </ThemedView>
        )}

        {item.status === 'published' && (
          <ThemedView
            style={{
              padding: 10, borderRadius: 8,
              backgroundColor: '#8B5CF6' + '10',
              flexDirection: 'row', gap: 6, alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="rocket-launch-outline" size={14} color="#8B5CF6" />
            <ThemedText style={{ fontSize: 12, color: '#8B5CF6', fontWeight: '700' }}>
              {t('rstRequestsList.publishedMsg')}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.outline + '20',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" intensity="strong">{t('rstRequestsList.title')}</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.primary as string} size="large" />
        </ThemedView>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <ThemedView style={{ alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 40 }}>
              <MaterialCommunityIcons name="home-analytics" size={56} color={theme.onSurface + '30'} />
              <ThemedText type="normaltitle" intensity="strong" style={{ textAlign: 'center' }}>
                {t('rstRequestsList.emptyTitle')}
              </ThemedText>
              <ThemedText type="caption" intensity="light" style={{ textAlign: 'center' }}>
                {t('rstRequestsList.emptyDesc')}
              </ThemedText>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
};

export default RSTRequestsListScreen;
