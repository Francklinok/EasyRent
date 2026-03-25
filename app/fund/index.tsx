import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, FundPortfolio, UserFundShare } from '@/services/api/microservicesApi';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/hooks/useLanguage';

export default function FundHome() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const api = getMicroservicesApi();
  const {t} = useLanguage()

  const [funds, setFunds] = useState<FundPortfolio[]>([]);
  const [myShares, setMyShares] = useState<UserFundShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, s] = await Promise.all([
        api.getFunds(),
        user?.id ? api.getMyFundShares(user.id) : Promise.resolve([]),
      ]);
      setFunds(f.length > 0 ? f : DEMO_FUNDS);
      setMyShares(s);
    } catch {
      setFunds(DEMO_FUNDS);
      setMyShares([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const totalInvested = myShares.reduce((s, sh) => s + sh.investedUsd, 0);
  const totalValue = myShares.reduce((s, sh) => s + sh.currentValueUsd, 0);
  const totalPnl = totalValue - totalInvested;

  const strategyIcon = (s: string) => ({
    balanced: 'scale-balance',
    growth: 'trending-up',
    income: 'cash-multiple',
    defensive: 'shield',
  }[s] || 'chart-pie') as any;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />

      <ThemedView style={[f.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={[f.backBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type ="subtitle" style={[f.headerTitle, { color: theme.text }]}>{t('fund.title')}</ThemedText>
          <ThemedText style={[f.headerSub, { color: theme.onSurface + '70' }]}>{t('fund.subtitle')}</ThemedText>
        </ThemedView>
        <TouchableOpacity
          onPress={() => router.push('/fund/proposals' as any)}
          style={[f.daoBtn, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '40' }]}
        >
          <MaterialCommunityIcons name="vote" size={16} color={theme.primary} />
          <ThemedText type="body" style={[f.daoBtnText, { color: theme.primary }]}>{t('fund.daoBtn')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {/* My investment summary */}
        {myShares.length > 0 && (
          <ThemedView style={[f.myCard, { backgroundColor: theme.primary }]}>
            <ThemedText style={f.myCardTitle}>{t('fund.myInvestment')}</ThemedText>
            <ThemedView style={f.myRow}>
              <ThemedView style={f.myItem}>
                <ThemedText style={f.myVal}>${totalInvested.toLocaleString()}</ThemedText>
                <ThemedText style={f.myLabel}>{t('fund.invested')}</ThemedText>
              </ThemedView>
              <ThemedView style={f.myItem}>
                <ThemedText style={f.myVal}>${totalValue.toLocaleString()}</ThemedText>
                <ThemedText style={f.myLabel}>{t('fund.currentValue')}</ThemedText>
              </ThemedView>
              <ThemedView style={f.myItem}>
                <ThemedText style={[f.myVal, { color: totalPnl >= 0 ? '#86efac' : '#fca5a5' }]}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}$
                </ThemedText>
                <ThemedText style={f.myLabel}>{t('fund.pnl')}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        <ThemedText type ="normaltitle" style={[f.sectionTitle, { color: theme.text }]}>{t('fund.availableFunds')}</ThemedText>

        {loading ? <ActivityIndicator color={theme.primary} /> : (
          funds.map(fund => {
            const myShare = myShares.find(s => s.portfolioId === fund.portfolioId);
            return (
              <TouchableOpacity
                key={fund.portfolioId}
                style={[f.card, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}
                onPress={() => router.push({ pathname: '/fund/[portfolioId]', params: { portfolioId: fund.portfolioId } } as any)}
              >
                {/* Strategy */}
                <ThemedView style={f.stratRow}>
                  <ThemedView style={[f.stratIcon, { backgroundColor: theme.primary + '20' }]}>
                    <MaterialCommunityIcons name={strategyIcon(fund.strategy)} size={20} color={theme.primary} />
                  </ThemedView>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText style={[f.fundName, { color: theme.text }]}>{fund.fundName}</ThemedText>
                    <ThemedText style={[f.fundStrategy, { color: theme.onSurface + '70' }]}>
                      {t('fund.strategy')} {fund.strategy} · {fund.investors} {t('fund.investors')}
                    </ThemedText>
                  </ThemedView>
                  {myShare && (
                    <ThemedView style={[f.myBadge, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '40' }]}>
                      <ThemedText style={[f.myBadgeText, { color: theme.primary }]}>{t('fund.invested_badge')}</ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>

                {/* Performance */}
                <ThemedView style={f.perfRow}>
                  <ThemedView style={f.perf}>
                    <ThemedText type ="normal" style={[f.perfVal, { color: fund.performanceYtd >= 0 ? '#22c55e' : '#ef4444' }]}>
                      {fund.performanceYtd >= 0 ? '+' : ''}{fund.performanceYtd.toFixed(1)}%
                    </ThemedText>
                    <ThemedText style={[f.perfLabel, { color: theme.onSurface + '60' }]}>{t('fund.ytd')}</ThemedText>
                  </ThemedView>
                  <ThemedView style={[f.perfDiv, { backgroundColor: theme.outline + '30' }]} />
                  <ThemedView style={f.perf}>
                    <ThemedText type ="normal" style={[f.perfVal, { color: theme.text }]}>{fund.sharpeRatio.toFixed(2)}</ThemedText>
                    <ThemedText style={[f.perfLabel, { color: theme.onSurface + '60' }]}>{t('fund.sharpe')}</ThemedText>
                  </ThemedView>
                  <ThemedView style={[f.perfDiv, { backgroundColor: theme.outline + '30' }]} />
                  <ThemedView style={f.perf}>
                    <ThemedText type ="normal" style={[f.perfVal, { color: theme.text }]}>${(fund.navPerShare).toFixed(2)}</ThemedText>
                    <ThemedText style={[f.perfLabel, { color: theme.onSurface + '60' }]}>{t('fund.navPerShare')}</ThemedText>
                  </ThemedView>
                  <ThemedView style={[f.perfDiv, { backgroundColor: theme.outline + '30' }]} />
                  <ThemedView style={f.perf}>
                    <ThemedText type ="normal" style={[f.perfVal, { color: theme.text }]}>${(fund.totalAum / 1e6).toFixed(1)}M</ThemedText>
                    <ThemedText style={[f.perfLabel, { color: theme.onSurface + '60' }]}>{t('fund.aum')}</ThemedText>
                  </ThemedView>
                </ThemedView>

                {/* AI Rebalance */}
                <ThemedView style={[f.rebalBox, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  <MaterialCommunityIcons name="robot" size={14} color={theme.primary} />
                  <ThemedText style={ { color: theme.onSurface + '70' }}>
                    {t('fund.autoRebalance')} {new Date(fund.nextRebalance).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>

                {/* Fees */}
                <ThemedView style={f.feesRow}>
                  <ThemedText style={ { color: theme.onSurface + '60' }}>
                    {t('fund.managementFee')} {fund.managementFeeBps / 100}% · {t('fund.performanceFee')} {fund.performanceFeeBps / 100}%
                  </ThemedText>
                  <TouchableOpacity
                    style={[f.investBtn, { backgroundColor: theme.primary }]}
                    onPress={() => router.push({ pathname: '/fund/invest', params: { portfolioId: fund.portfolioId } } as any)}
                  >
                    <ThemedText type ="body" style={f.investBtnText}>{t('fund.investBtn')}</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DEMO_FUNDS: FundPortfolio[] = [
  {
    id: '1', portfolioId: 'fund-001', fundName: 'EasyRent AI Fund I',
    strategy: 'balanced', totalAum: 4200000, totalShares: 420000,
    navPerShare: 10.05, performanceYtd: 12.4, performanceAll: 28.7,
    sharpeRatio: 1.82, maxDrawdown: 3.2, volatility: 4.1,
    managementFeeBps: 50, performanceFeeBps: 2000,
    minInvestment: 500, investors: 1240, status: 'active',
    autoRebalance: true, lastRebalance: '2026-02-15',
    nextRebalance: '2026-03-15', positions: [], createdAt: '2025-01-01',
  },
  {
    id: '2', portfolioId: 'fund-002', fundName: 'EasyRent Growth Fund',
    strategy: 'growth', totalAum: 1800000, totalShares: 150000,
    navPerShare: 12.0, performanceYtd: 18.9, performanceAll: 42.1,
    sharpeRatio: 1.45, maxDrawdown: 8.5, volatility: 9.2,
    managementFeeBps: 50, performanceFeeBps: 2000,
    minInvestment: 1000, investors: 380, status: 'active',
    autoRebalance: true, lastRebalance: '2026-02-20',
    nextRebalance: '2026-03-20', positions: [], createdAt: '2025-06-01',
  },
];

const DEMO_SHARES: UserFundShare[] = [
  {
    userId: 'user-1', portfolioId: 'fund-001',
    sharesOwned: 200, investedUsd: 2000, currentValueUsd: 2248.8,
    unrealizedPnl: 248.8, returnPct: 12.44, investedAt: '2025-06-15',
  },
];

const f = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontWeight: '800' },
  headerSub: { fontSize: 11 },
  daoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  daoBtnText: {fontWeight: '700' },
  myCard: { borderRadius: 16, padding: 20 },
  myCardTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 12 },
  myRow: { flexDirection: 'row' },
  myItem: { flex: 1, alignItems: 'center' },
  myVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  myLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4 },
  sectionTitle: { fontWeight: '800' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  stratRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stratIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  fundName: { fontSize: 15, fontWeight: '800' },
  fundStrategy: { marginTop: 2 },
  myBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  myBadgeText: { fontSize: 11, fontWeight: '700' },
  perfRow: { flexDirection: 'row', alignItems: 'center' },
  perf: { flex: 1, alignItems: 'center' },
  perfVal: {fontWeight: '800' },
  perfLabel: { fontSize: 10, marginTop: 2 },
  perfDiv: { width: 1, height: 30 },
  rebalBox: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, borderWidth: 1, padding: 8 },
 
  feesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  
  investBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  investBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
