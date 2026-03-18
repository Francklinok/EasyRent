import React, { useState, useEffect } from 'react';
import {
  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, AMMPool } from '@/services/api/microservicesApi';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const DEMO_POOLS: AMMPool[] = [
  {
    poolId: 'pool-rst-rec', tokenA: 'RST-PARIS-001', tokenB: 'REC',
    reserveA: 142000, reserveB: 284000,
    totalLiquidityUsd: 426000, volume24hUsd: 38500,
    feeBps: 30, apy: 12.4, createdAt: '2026-01-15',
  },
  {
    poolId: 'pool-spv-rec', tokenA: 'SPV-LYON-002', tokenB: 'REC',
    reserveA: 85000, reserveB: 170000,
    totalLiquidityUsd: 255000, volume24hUsd: 21000,
    feeBps: 30, apy: 9.8, createdAt: '2026-02-01',
  },
];

export default function TradeIndex() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const api = getMicroservicesApi();

  const [pools, setPools] = useState<AMMPool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getAMMPools();
        setPools(data.length > 0 ? data : DEMO_POOLS);
      } catch {
        setPools(DEMO_POOLS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalTVL = pools.reduce((sum, p) => sum + p.totalLiquidityUsd, 0);
  const totalVol = pools.reduce((sum, p) => sum + p.volume24hUsd, 0);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <ThemedView>
          <ThemedText type="normaltitle" style={[s.headerTitle, { color: theme.text }]}>{t('trade.title')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{t('trade.subtitle')}</ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={[s.swapBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/trade/swap' as any)}
        >
          <MaterialCommunityIcons name="swap-horizontal" size={18} color="#fff" />
          <ThemedText type="body" style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{t('trade.swap')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Stats */}
        <ThemedView style={[s.statsRow]}>
          {[
            { label: t('trade.totalTVL'), value: `$${(totalTVL / 1000).toFixed(0)}k`, icon: 'bank-outline' as const, color: theme.primary },
            { label: t('trade.volume24h'), value: `$${(totalVol / 1000).toFixed(0)}k`, icon: 'chart-line' as const, color: '#10B981' },
            { label: t('trade.activePools'), value: `${pools.length}`, icon: 'water' as const, color: '#F59E0B' },
          ].map((stat, i) => (
            <ThemedView key={i} style={[s.statCard, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
              <MaterialCommunityIcons name={stat.icon} size={20} color={stat.color} />
              <ThemedText type="normaltitle" style={[s.statVal, { color: stat.color }]}>{stat.value}</ThemedText>
              <ThemedText type="body" style={[s.statLabel, { color: theme.onSurface + '60' }]}>{stat.label}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Quick Swap CTA */}
        <TouchableOpacity
          style={[s.quickSwap, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '30' }]}
          onPress={() => router.push('/trade/swap' as any)}
        >
          <MaterialCommunityIcons name="swap-horizontal-bold" size={24} color={theme.primary} />
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="normaltitle" style={{ color: theme.primary, fontWeight: '800' }}>{t('trade.swapTokens')}</ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{t('trade.subtitle')}</ThemedText>
          </ThemedView>
          <Ionicons name="arrow-forward-circle" size={28} color={theme.primary} />
        </TouchableOpacity>

        {/* Pools */}
        <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('trade.liquidityPools')}</ThemedText>
        {pools.map(pool => (
          <ThemedView key={pool.poolId} style={[s.poolCard, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
            <ThemedView style={[s.poolHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <ThemedView style={[s.pairBadge, { backgroundColor: theme.primary + '12' }]}>
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: '800', fontSize: 13 }}>
                  {(pool.tokenA || pool.tokenASymbol)} / {(pool.tokenB || pool.tokenBSymbol)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={[s.apyBadge, { backgroundColor: '#10B981' + '15' }]}>
                <ThemedText type="body" style={{ color: '#10B981', fontWeight: '700', fontSize: 12 }}>
                  APY {pool.apy}%
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={s.poolStats}>
              {[
                { label: 'TVL', value: `$${(pool.totalLiquidityUsd / 1000).toFixed(0)}k` },
                { label: t('trade.volume24h'), value: `$${(pool.volume24hUsd / 1000).toFixed(0)}k` },
                { label: `${t('trade.feeLabel')} (0.3%)`, value: `${pool.feeBps / 100}%` },
              ].map((st, i) => (
                <ThemedView key={i} style={s.poolStat}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 11 }}>{st.label}</ThemedText>
                  <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{st.value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* Reserves */}
            <ThemedView style={[s.reserves, { backgroundColor: theme.outline + '08', borderRadius: 10, padding: 10 }]}>
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{pool.tokenA}</ThemedText>
                <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 12 }}>
                  {pool.reserveA.toLocaleString()}
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{pool.tokenB}</ThemedText>
                <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 12 }}>
                  {pool.reserveB.toLocaleString()}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={[s.poolActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[s.poolActionBtn, { backgroundColor: theme.primary, flex: 1 }]}
                onPress={() => router.push({ pathname: '/trade/swap', params: { poolId: pool.poolId } } as any)}
              >
                <MaterialCommunityIcons name="swap-horizontal" size={16} color="#fff" />
                <ThemedText type="body" style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t('trade.swap')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[s.poolActionBtn, { backgroundColor: theme.outline + '15', flex: 1 }]}>
                <MaterialCommunityIcons name="water-plus" size={16} color={theme.text} />
                <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{t('trade.addLiquidity')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontWeight: '900' },
  swapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', gap: 4, padding: 12, borderRadius: 12, borderWidth: 1 },
  statVal: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  quickSwap: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  sectionTitle: { fontWeight: '800', marginTop: 4 },
  poolCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  poolHeader: { alignItems: 'center', gap: 8 },
  pairBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  apyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  poolStats: { flexDirection: 'row', justifyContent: 'space-between' },
  poolStat: { alignItems: 'center', gap: 2 },
  reserves: {},
  poolActions: { gap: 8 },
  poolActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20 },
});
