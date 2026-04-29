import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { getInvestmentPipelineService, SPVProject } from '@/services/api/investmentPipelineService';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  draft:      { color: '#6B7280', bg: '#6B728015' },
  submitted:  { color: '#3B82F6', bg: '#3B82F615' },
  analyzing:  { color: '#F59E0B', bg: '#F59E0B15' },
  approved:   { color: '#10B981', bg: '#10B98115' },
  rejected:   { color: '#EF4444', bg: '#EF444415' },
  published:  { color: '#8B5CF6', bg: '#8B5CF615' },
};

export default function PartnerProjectsListScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [projects, setProjects] = useState<SPVProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isPartner = ['partner', 'admin', 'super_admin'].includes((user as any)?.role || '');

  const load = useCallback(async (isRefresh = false) => {
    if (!isPartner) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getInvestmentPipelineService().getMySPVProjects();
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPartner]);

  useEffect(() => { load(); }, [load]);

  if (!isPartner) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
        <MaterialCommunityIcons name="lock-outline" size={60} color={theme.onSurface + '30'} />
        <ThemedText style={{ color: theme.onSurface + '60', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
          {t('partnerProjects.accessDeniedTitle')}
        </ThemedText>
        <ThemedText style={{ color: theme.onSurface + '45', fontSize: 13, textAlign: 'center' }}>
          {t('partnerProjects.accessDeniedDesc')}
        </ThemedText>
      </ThemedView>
    );
  }

  const renderItem = ({ item }: { item: SPVProject }) => {
    const cfg = STATUS_COLORS[item.status] || STATUS_COLORS.submitted;
    const statusLabel = t(`partnerProjects.status.${item.status}` as any) || item.status;
    const totalValue = (item.totalShares || 0) * (item.sharePrice || 0);
    const date = new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <ThemedView style={{
        marginHorizontal: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1,
        borderColor: '#8B5CF6' + '25', padding: 14, gap: 10,
      }}>
        {/* Header */}
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <ThemedView style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#8B5CF6' + '18', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="office-building" size={18} color="#8B5CF6" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: theme.text, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
                {item.companyName}
              </ThemedText>
              <ThemedText style={{ color: theme.onSurface + '60', fontSize: 11 }}>
                {item.jurisdiction || 'France'} · {date}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12, backgroundColor: cfg.bg }}>
            <ThemedText style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{statusLabel}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Token structure */}
        <ThemedView style={{ flexDirection: 'row', gap: 0 }}>
          {[
            { label: t('partnerProjects.totalTokens'), value: (item.totalShares || 0).toLocaleString() },
            { label: t('partnerProjects.pricePerToken'), value: `${item.sharePrice} ${item.currency || 'USD'}` },
            { label: t('partnerProjects.valuation'), value: `$${(totalValue / 1000).toFixed(0)}k` },
          ].map((m, i) => (
            <ThemedView key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRightWidth: i < 2 ? 1 : 0, borderRightColor: theme.outline + '15' }}>
              <ThemedText style={{ color: '#8B5CF6', fontWeight: '900', fontSize: 14 }}>{m.value}</ThemedText>
              <ThemedText style={{ color: theme.onSurface + '55', fontSize: 10 }}>{m.label}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Yield */}
        {item.annualYieldPct && (
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="trending-up" size={14} color="#10B981" />
            <ThemedText style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>
              {t('partnerProjects.yieldLabel')} : {item.annualYieldPct}% / an
            </ThemedText>
          </ThemedView>
        )}

        {/* Platform notes */}
        {item.platformNotes && (
          <ThemedView style={{ backgroundColor: theme.surfaceVariant, padding: 8, borderRadius: 8, flexDirection: 'row', gap: 6 }}>
            <MaterialCommunityIcons name="message-text-outline" size={14} color={theme.onSurface + '60'} />
            <ThemedText style={{ flex: 1, color: theme.onSurface + '70', fontSize: 12, lineHeight: 17 }}>
              {item.platformNotes}
            </ThemedText>
          </ThemedView>
        )}

        {/* Rejection reason */}
        {item.status === 'rejected' && item.rejectionReason && (
          <ThemedView style={{ backgroundColor: '#EF4444' + '08', padding: 8, borderRadius: 8, flexDirection: 'row', gap: 6 }}>
            <MaterialCommunityIcons name="close-circle-outline" size={14} color="#EF4444" style={{ marginTop: 1 }} />
            <ThemedText style={{ flex: 1, color: '#EF4444', fontSize: 12, lineHeight: 17 }}>
              {item.rejectionReason}
            </ThemedText>
          </ThemedView>
        )}

        {/* Published indicator */}
        {item.status === 'published' && (
          <ThemedView style={{ backgroundColor: '#8B5CF6' + '10', padding: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="check-decagram" size={14} color="#8B5CF6" />
            <ThemedText style={{ color: '#8B5CF6', fontSize: 12, fontWeight: '600' }}>
              {t('partnerProjects.publishedMsg')}
              {item.spvId ? ` · ID: ${item.spvId}` : ''}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <ThemedView style={{
        paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderBottomWidth: 1, borderBottomColor: theme.outline + '20',
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ThemedText style={{ color: theme.text, fontWeight: '900', fontSize: 16 }}>{t('partnerProjects.title')}</ThemedText>
            <ThemedView style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
              <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{t('partnerProjects.badge')}</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>{t('partnerProjects.subtitle')}</ThemedText>
        </ThemedView>
        <TouchableOpacity
          onPress={() => router.push('/partner/PartnerProjectCreationForm' as any)}
          style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <MaterialCommunityIcons name="plus" size={16} color="white" />
          <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t('partnerProjects.newBtn')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#8B5CF6" size="large" />
        </ThemedView>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#8B5CF6" />}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <ThemedView style={{ alignItems: 'center', padding: 48, gap: 14 }}>
              <MaterialCommunityIcons name="office-building-outline" size={56} color={theme.onSurface + '25'} />
              <ThemedText style={{ color: theme.onSurface + '60', fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
                {t('partnerProjects.emptyTitle')}
              </ThemedText>
              <ThemedText style={{ color: theme.onSurface + '45', fontSize: 13, textAlign: 'center' }}>
                {t('partnerProjects.emptyDesc')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push('/partner/PartnerProjectCreationForm' as any)}
                style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <MaterialCommunityIcons name="plus-circle" size={18} color="white" />
                <ThemedText style={{ color: 'white', fontWeight: '700' }}>{t('partnerProjects.createBtn')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}
