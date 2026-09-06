import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { getInvestmentPipelineService, DEVProposal } from '@/services/api/investmentPipelineService';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const STATUS_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  submitted:  { color: '#6B7280', bg: '#6B728015', icon: 'send-clock' },
  analyzing:  { color: '#F59E0B', bg: '#F59E0B15', icon: 'robot-outline' },
  validated:  { color: '#10B981', bg: '#10B98115', icon: 'check-circle' },
  launched:   { color: '#8B5CF6', bg: '#8B5CF615', icon: 'rocket-launch' },
  rejected:   { color: '#EF4444', bg: '#EF444415', icon: 'close-circle' },
};

export default function DEVProposalsListScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [proposals, setProposals] = useState<DEVProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getInvestmentPipelineService().getMyDEVProposals();
      setProposals(data);
    } catch {
      setProposals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: { item: DEVProposal }) => {
    const cfg = STATUS_COLORS[item.status] || STATUS_COLORS.submitted;
    const statusLabel = t(`devProposals.status.${item.status}` as any) || item.status;
    const typeLabel = t(`devProposals.projectType.${item.proposedProjectType}` as any) || item.proposedProjectType;
    const date = new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <ThemedView style={{
        marginHorizontal: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1,
        borderColor: theme.outline + '20', padding: 14, gap: 10,
      }}>
        {/* Header row */}
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemedView style={{ width: 36, height: 36, borderRadius: 18, backgroundColor:theme.star + '15', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="city-variant-outline" size={18} color={theme.star} />
            </ThemedView>
            <ThemedView>
              <ThemedText style={{ color: theme.text, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
                {item.location?.city}, {item.location?.country}
              </ThemedText>
              <ThemedText style={{ color: theme.onSurface + '60', fontSize: 11 }}>
                {typeLabel} · {date}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12, backgroundColor: cfg.bg }}>
            <ThemedText style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{statusLabel}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Description preview */}
        <ThemedText style={{ color: theme.onSurface + '80', fontSize: 13, lineHeight: 18 }} numberOfLines={2}>
          {item.description}
        </ThemedText>

        {/* Budget if set */}
        {item.estimatedBudget && (
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="cash" size={14} color={theme.onSurface + '50'} />
            <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>
              {t('devProposals.budgetLabel')} : {item.estimatedBudget.toLocaleString()} {item.currency}
            </ThemedText>
          </ThemedView>
        )}

        {/* AI analysis score if available */}
        {item.opportunityScore != null && (
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#8B5CF6' + '0A', padding: 8, borderRadius: 8 }}>
            <MaterialCommunityIcons name="robot-outline" size={14} color={theme.secondary}/>
            <ThemedText style={{ color: theme.secondary, fontSize: 12, fontWeight: '600' }}>
              {t('devProposals.aiScore')} : {item.opportunityScore}/100
            </ThemedText>
          </ThemedView>
        )}

        {/* Rejection reason */}
        {item.status === 'rejected' && item.rejectionReason && (
          <ThemedView style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: theme.error + '08', padding: 8, borderRadius: 8 }}>
            <MaterialCommunityIcons name="information-outline" size={14} color= {theme.error} style={{ marginTop: 1 }} />
            <ThemedText style={{ flex: 1, color: theme.error, fontSize: 12, lineHeight: 17 }}>
              {item.rejectionReason}
            </ThemedText>
          </ThemedView>
        )}

        {/* Launched message */}
        {item.status === 'launched' && (
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.secondary + '10', padding: 8, borderRadius: 8 }}>
            <MaterialCommunityIcons name="rocket-launch" size={14} color= {theme.secondary} />
            <ThemedText style={{ flex: 1, color:theme.secondary, fontSize: 12 }}>
              {t('devProposals.launchedMsg')}
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
          <ThemedText style={{ color: theme.text, fontWeight: '900', fontSize: 16 }}>{t('devProposals.title')}</ThemedText>
          <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>{t('devProposals.subtitle')}</ThemedText>
        </ThemedView>
        <TouchableOpacity
          onPress={() => router.push('/dev/ProposeDevScreen' as any)}
          style={{ backgroundColor:theme.star, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <MaterialCommunityIcons name="plus" size={16} color="white" />
          <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t('devProposals.newBtn')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.star} size="large" />
        </ThemedView>
      ) : (
        <FlatList
          data={proposals}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#F59E0B" />}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <ThemedView style={{ alignItems: 'center', padding: 48, gap: 14 }}>
              <MaterialCommunityIcons name="city-variant-outline" size={56} color={theme.onSurface + '25'} />
              <ThemedText style={{ color: theme.onSurface + '60', fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
                {t('devProposals.emptyTitle')}
              </ThemedText>
              <ThemedText style={{ color: theme.onSurface + '45', fontSize: 13, textAlign: 'center' }}>
                {t('devProposals.emptyDesc')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push('/dev/ProposeDevScreen' as any)}
                style={{ backgroundColor: theme.star, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <MaterialCommunityIcons name="city-variant-outline" size={18} color="white" />
                <ThemedText style={{ color: 'white', fontWeight: '700' }}>{t('devProposals.createBtn')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}
