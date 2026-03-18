
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi } from '@/services/api/microservicesApi';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

export default function RSTPortfolio() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const api = getMicroservicesApi();

  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getMyRSTHoldings(user?.id || '');
      setHoldings(data);
    } catch {
      setHoldings(DEMO_HOLDINGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const totalInvested = holdings.reduce((s, h) => s + (h.holder?.tokensHeld || 0), 0);
  const totalReceived = holdings.reduce((s, h) => s + (h.holder?.totalReceivedUsd || 0), 0);
  const avgReturn = holdings.length
    ? holdings.reduce((s, h) => s + (h.holder?.returnPct || 0), 0) / holdings.length
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />

      <ThemedView style={[sp.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={[sp.backBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={[sp.title, { color: theme.text }]}>{t('investPortfolio.title')}</ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/invest' as any)}
          style={[sp.addBtn, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {/* Summary */}
        <ThemedView style={[sp.summary, { backgroundColor: theme.primary }]}>
          <ThemedView style={sp.summaryRow}>
            <ThemedView style={sp.summaryItem}>
              <ThemedText style={sp.summaryVal}>{totalInvested.toLocaleString()}</ThemedText>
              <ThemedText style={sp.summaryLabel}>{t('investPortfolio.tokensRST')}</ThemedText>
            </ThemedView>
            <ThemedView style={[sp.summaryDiv, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <ThemedView style={sp.summaryItem}>
              <ThemedText style={sp.summaryVal}>${totalReceived.toFixed(2)}</ThemedText>
              <ThemedText style={sp.summaryLabel}>{t('investPortfolio.totalReceived')}</ThemedText>
            </ThemedView>
            <ThemedView style={[sp.summaryDiv, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <ThemedView style={sp.summaryItem}>
              <ThemedText style={sp.summaryVal}>{avgReturn.toFixed(1)}%</ThemedText>
              <ThemedText style={sp.summaryLabel}>{t('investPortfolio.avgReturn')}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {loading ? (
          <ActivityIndicator color={theme.primary} />
        ) : holdings.length === 0 ? (
          <ThemedView style={[sp.empty, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="cash-multiple" size={52} color={theme.onSurface + '40'} />
            <ThemedText style={[sp.emptyTitle, { color: theme.text }]}>{t('investPortfolio.noInvestment')}</ThemedText>
            <ThemedText style={[sp.emptySub, { color: theme.onSurface + '60' }]}>
              {t('investPortfolio.noInvestmentDesc')}
            </ThemedText>
            <TouchableOpacity style={[sp.emptyBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/invest' as any)}>
              <ThemedText style={{ color: '#fff', fontWeight: '700' }}>{t('investPortfolio.exploreProjects')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          holdings.map((h, i) => (
            <TouchableOpacity
              key={i}
              style={[sp.card, { backgroundColor: theme.surface, borderColor: theme.outline + '30' }]}
              onPress={() => router.push({ pathname: '/invest/[projectId]', params: { projectId: h.project?.projectId } } as any)}
            >
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText style={[sp.cardTitle, { color: theme.text }]} numberOfLines={1}>
                    {h.project?.propertyAddress || 'Propriété'}
                  </ThemedText>
                  <ThemedText style={[sp.cardSub, { color: theme.onSurface + '70' }]}>
                    {h.token?.tokenSymbol} · {h.project?.status}
                  </ThemedText>
                </ThemedView>
                {h.holder?.capReached && (
                  <ThemedView style={[sp.capBadge, { backgroundColor: '#22c55e20', borderColor: '#22c55e50' }]}>
                    <ThemedText style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>{t('investPortfolio.capReached')}</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              <ThemedView style={sp.statsRow}>
                <ThemedView style={sp.stat}>
                  <ThemedText style={[sp.statVal, { color: theme.primary }]}>{h.holder?.tokensHeld?.toLocaleString() || 0}</ThemedText>
                  <ThemedText style={[sp.statLabel, { color: theme.onSurface + '60' }]}>{t('investPortfolio.tokens')}</ThemedText>
                </ThemedView>
                <ThemedView style={[sp.statDiv, { backgroundColor: theme.outline + '30' }]} />
                <ThemedView style={sp.stat}>
                  <ThemedText style={[sp.statVal, { color: '#22c55e' }]}>${h.holder?.totalReceivedUsd?.toFixed(2) || '0.00'}</ThemedText>
                  <ThemedText style={[sp.statLabel, { color: theme.onSurface + '60' }]}>{t('investPortfolio.received')}</ThemedText>
                </ThemedView>
                <ThemedView style={[sp.statDiv, { backgroundColor: theme.outline + '30' }]} />
                <ThemedView style={sp.stat}>
                  <ThemedText style={[sp.statVal, { color: theme.text }]}>{h.holder?.returnPct?.toFixed(1) || 0}%</ThemedText>
                  <ThemedText style={[sp.statLabel, { color: theme.onSurface + '60' }]}>{t('investPortfolio.returnLabel')}</ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Return progress toward cap */}
              <ThemedView style={{ marginTop: 8 }}>
                <ThemedView style={[sp.progressTrack, { backgroundColor: theme.outline + '30' }]}>
                  <ThemedView style={[sp.progressFill, {
                    width: `${Math.min(100, ((h.holder?.returnPct || 0) / (h.token?.maxReturnPct || 130)) * 100)}%`,
                    backgroundColor: theme.primary,
                  }]} />
                </ThemedView>
                <ThemedText style={[sp.progressLabel, { color: theme.onSurface + '60' }]}>
                  {h.holder?.returnPct?.toFixed(1) || 0}% / {h.token?.maxReturnPct || 130}% {t('investPortfolio.returnMax')}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DEMO_HOLDINGS = [
  {
    project: { projectId: 'rst-001', propertyAddress: 'Av. des Champs-Élysées 47', status: 'distributing' },
    token: { tokenSymbol: 'RST_APT_001', maxReturnPct: 130 },
    holder: { tokensHeld: 5000, tokensBurned: 0, totalReceivedUsd: 127.5, returnPct: 2.55, capReached: false },
  },
  {
    project: { projectId: 'rst-002', propertyAddress: 'Rue de la Paix 12, Lyon', status: 'distributing' },
    token: { tokenSymbol: 'RST_COM_002', maxReturnPct: 140 },
    holder: { tokensHeld: 10000, tokensBurned: 0, totalReceivedUsd: 540, returnPct: 5.4, capReached: false },
  },
];

const sp = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontSize: 18, fontWeight: '800' },
  addBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  summary: { borderRadius: 16, padding: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  summaryDiv: { width: 1, height: 36 },
  empty: { borderRadius: 16, alignItems: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: '800' },
  cardSub: { fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2 },
  statDiv: { width: 1, height: 30 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 10, marginTop: 4 },
  capBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
});
