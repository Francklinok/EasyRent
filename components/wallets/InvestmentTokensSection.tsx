import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getMicroservicesApi, SPVShareholder, RSTProject, RSTToken, RSTHolder } from '@/services/api/microservicesApi';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { TrendingUp, ArrowRightLeft } from 'lucide-react-native';

interface WalletToken {
  id: string;
  type: 'rst' | 'spv';
  symbol: string;
  name: string;
  tokensHeld: number;
  investedUsd: number;
  currentValueUsd: number;
  returnUsd: number;
  returnPct: number;
  status: string;
  projectId: string;
  // RST-specific
  capReached?: boolean;
  maxReturnPct?: number;
  revenueSharePct?: number;
  // SPV-specific
  kycLevel?: string;
  companyName?: string;
}

// ─────────────────────────────────────────
// DEMO data (fallback)
// ─────────────────────────────────────────
const DEMO_TOKENS: WalletToken[] = [
  {
    id: 'rst-001', type: 'rst',
    symbol: 'RST-SIPOA01', name: 'Cité SIPOA Lot 45, Dakar',
    tokensHeld: 2000, investedUsd: 2000,
    currentValueUsd: 2248, returnUsd: 248, returnPct: 12.4,
    status: 'distributing', projectId: 'rst-001',
    capReached: false, maxReturnPct: 130, revenueSharePct: 60,
  },
  {
    id: 'spv-001', type: 'spv',
    symbol: 'SPV-PARIS01', name: '12 Rue des Ambassadeurs, Paris 8e',
    tokensHeld: 50, investedUsd: 5000,
    currentValueUsd: 5320, returnUsd: 290, returnPct: 5.8,
    status: 'active', projectId: 'spv-001',
    kycLevel: 'verified', companyName: 'SCI Paris Prestige',
  },
];

// ─────────────────────────────────────────
// Main component
// ─────────────────────────────────────────
interface InvestmentTokensSectionProps {
  onNavigateToTrade?: (token: WalletToken) => void;
}

export const InvestmentTokensSection: React.FC<InvestmentTokensSectionProps> = ({
  onNavigateToTrade,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const api = getMicroservicesApi();

  const [tokens, setTokens] = useState<WalletToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [rstData, spvData] = await Promise.allSettled([
        api.getMyRSTHoldings(user?.id || ''),
        api.getMySPVShares(user?.id || ''),
      ]);

      const rstTokens: WalletToken[] =
        rstData.status === 'fulfilled'
          ? rstData.value.map((d) => ({
              id: `rst-${d.project.projectId}`,
              type: 'rst' as const,
              symbol: d.token.tokenSymbol,
              name: d.project.propertyAddress,
              tokensHeld: d.holder.tokensHeld,
              investedUsd: d.holder.tokensHeld * d.token.tokenPriceUsd,
              currentValueUsd: d.holder.tokensHeld * d.token.currentPriceUsd,
              returnUsd: d.holder.totalReceivedUsd,
              returnPct: d.holder.returnPct,
              status: d.project.status,
              projectId: d.project.projectId,
              capReached: d.holder.capReached,
              maxReturnPct: d.project.maxReturnPct,
              revenueSharePct: d.project.revenueSharePct,
            }))
          : [];

      const spvTokens: WalletToken[] =
        spvData.status === 'fulfilled'
          ? spvData.value.map((s) => ({
              id: `spv-${s.spvId}`,
              type: 'spv' as const,
              symbol: s.spvId.toUpperCase(),
              name: s.spvId,
              tokensHeld: s.sharesOwned,
              investedUsd: s.investedAmount,
              currentValueUsd: s.shareValueUsd,
              returnUsd: s.returnToDate,
              returnPct: s.investedAmount > 0 ? (s.shareValueUsd - s.investedAmount) / s.investedAmount * 100 : 0,
              status: 'active',
              projectId: s.spvId,
              kycLevel: s.kycLevel,
            }))
          : [];

      const all = [...rstTokens, ...spvTokens];
      setTokens(all.length > 0 ? all : DEMO_TOKENS);
    } catch {
      setTokens(DEMO_TOKENS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const totalInvested = tokens.reduce((s, t) => s + t.investedUsd, 0);
  const totalCurrentValue = tokens.reduce((s, t) => s + t.currentValueUsd, 0);
  const totalReturn = tokens.reduce((s, t) => s + t.returnUsd, 0);
  const globalPnl = totalCurrentValue - totalInvested;

  const handleTrade = (token: WalletToken) => {
    if (onNavigateToTrade) {
      onNavigateToTrade(token);
    } else {
      router.push({
        pathname: '/trade',
        params: {
          tokenSymbol: token.symbol,
          tokenType: token.type,
          projectId: token.projectId,
          action: 'sell',
        },
      } as any);
    }
  };

  const handleViewProject = (token: WalletToken) => {
    if (token.type === 'rst') {
      router.push({ pathname: '/invest/rst/[projectId]', params: { projectId: token.projectId } } as any);
    } else {
      router.push({ pathname: '/invest/spv/[spvId]', params: { spvId: token.projectId } } as any);
    }
  };

  const handleBorrowREC = (token?: WalletToken) => {
    if (token) {
      router.push({
        pathname: '/rec/open',
        params: { tokenSymbol: token.symbol, tokenType: token.type, projectId: token.projectId },
      } as any);
    } else {
      router.push('/rec/open' as any);
    }
  };

  if (loading) {
    return (
      <ThemedView style={s.centered}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor={theme.secondary}
        />
      }
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Global summary ── */}
      {tokens.length > 0 && (
        <ThemedView style={[s.summaryCard, { backgroundColor: theme.secondary }]}>
          <ThemedText style={s.summaryTitle}>Tokens d'investissement</ThemedText>
          <ThemedView style={[s.summaryRow, { backgroundColor: 'transparent' }]}>
            <ThemedView style={[s.summaryItem, { backgroundColor: 'transparent' }]}>
              <ThemedText style={s.summaryVal}>${totalInvested.toLocaleString()}</ThemedText>
              <ThemedText style={s.summaryLabel}>Capital investi</ThemedText>
            </ThemedView>
            <ThemedView style={[s.summaryItem, { backgroundColor: 'transparent' }]}>
              <ThemedText style={s.summaryVal}>${totalCurrentValue.toLocaleString()}</ThemedText>
              <ThemedText style={s.summaryLabel}>Valeur actuelle</ThemedText>
            </ThemedView>
            <ThemedView style={[s.summaryItem, { backgroundColor: 'transparent' }]}>
              <ThemedText style={[s.summaryVal, { color: globalPnl >= 0 ? theme.success : '#fca5a5' }]}>
                {globalPnl >= 0 ? '+' : ''}{globalPnl.toFixed(0)}$
              </ThemedText>
              <ThemedText style={s.summaryLabel}>Plus-value</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={[s.summaryDivider, { backgroundColor: 'transparent' }]} />
          <ThemedView style={[s.summaryRow, { backgroundColor: 'transparent' }]}>
            <ThemedView style={[s.summaryItem, { backgroundColor: 'transparent' }]}>
              <ThemedText style={s.summaryVal}>{tokens.filter(t => t.type === 'rst').length}</ThemedText>
              <ThemedText style={s.summaryLabel}>Tokens RST</ThemedText>
            </ThemedView>
            <ThemedView style={[s.summaryItem, { backgroundColor: 'transparent' }]}>
              <ThemedText style={s.summaryVal}>{tokens.filter(t => t.type === 'spv').length}</ThemedText>
              <ThemedText style={s.summaryLabel}>Parts SPV</ThemedText>
            </ThemedView>
            <ThemedView style={[s.summaryItem, { backgroundColor: 'transparent' }]}>
              <ThemedText style={[s.summaryVal, { color: theme.success}]}>+${totalReturn.toFixed(0)}</ThemedText>
              <ThemedText style={s.summaryLabel}>Revenus reçus</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Quick nav */}
          <ThemedView style={[s.quickNav, { backgroundColor: 'transparent' }]}>
            <TouchableOpacity
              style={[s.quickNavBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
              onPress={() => router.push('/invest/rst' as any)}
            >
              <MaterialCommunityIcons name="home-analytics" size={14} color="#fff" />
              <ThemedText style={s.quickNavText}>+ RST</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.quickNavBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
              onPress={() => router.push('/invest/spv' as any)}
            >
              <MaterialCommunityIcons name="office-building" size={14} color="#fff" />
              <ThemedText style={s.quickNavText}>+ SPV</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.quickNavBtn, { backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }]}
              onPress={() => handleBorrowREC()}
            >
              <MaterialCommunityIcons name="bank-outline" size={14} color="#fff" />
              <ThemedText style={s.quickNavText}>Emprunter REC</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}

      {/* ── Borrow REC banner ── */}
      {tokens.length > 0 && (
        <TouchableOpacity
          style={[s.recBanner, { backgroundColor: theme.secondary + '15', borderColor:theme.secondary  + '30' }]}
          onPress={() => handleBorrowREC()}
          activeOpacity={0.8}
        >
          <ThemedView style={[s.recBannerIcon, { backgroundColor: theme.secondary + '20' }]}>
            <MaterialCommunityIcons name="bank-outline" size={22} color= {theme.secondary } />
          </ThemedView>
          <ThemedView style={{ flex: 1,   backgroundColor: "transparent" }}>
            <ThemedText style={[s.recBannerTitle, { color: theme.secondary  }]}>Emprunter des REC</ThemedText>
            <ThemedText style={[s.recBannerSub, { color: theme.onSurface + '70' }]}>
              Utilisez vos tokens comme collatéral · 70% LTV · Stablecoin immobilier
            </ThemedText>
          </ThemedView>
          <MaterialCommunityIcons name="chevron-right" size={20} color= { theme.secondary } />
        </TouchableOpacity>
      )}

      {/* ── Token list ── */}
      {tokens.length === 0 ? (
        <ThemedView style={[s.empty]}>
          <MaterialCommunityIcons name="wallet-outline" size={52} color={theme.onSurface + '30'} />
          <ThemedText style={[s.emptyTitle, { color: theme.text }]}>Aucun token d'investissement</ThemedText>
          <ThemedText style={[s.emptySub, { color: theme.onSurface + '55' }]}>
            Investissez dans un projet RST ou SPV pour voir vos tokens ici.
          </ThemedText>
          <TouchableOpacity
            style={[s.ctaBtn, { backgroundColor: theme.secondary }]}
            onPress={() => router.push('/invest' as any)}
          >
            <MaterialCommunityIcons name="trending-up" size={16} color="#fff" />
            <ThemedText style={s.ctaBtnText}>Explorer les investissements</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        tokens.map((token, idx) => {
          const isRST = token.type === 'rst';
          const color = isRST ? (theme.success ?? theme.success) : theme.secondary;
          const pnl = token.currentValueUsd - token.investedUsd;

          return (
            <MotiView
              key={token.id}
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', delay: idx * 60 }}
            >
              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: color + '25' }]}>
                {/* Header */}
                <ThemedView style={s.cardTop}>
                  <ThemedView style={[s.iconBox, { backgroundColor: color + '15' }]}>
                    <MaterialCommunityIcons
                      name={isRST ? 'home-analytics' : 'office-building'}
                      size={22}
                      color={color}
                    />
                  </ThemedView>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText style={[s.tokenSymbol, { color: theme.text }]}>{token.symbol}</ThemedText>
                    <ThemedText style={[s.tokenName, { color: theme.onSurface + '60' }]} numberOfLines={1}>
                      {token.name}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={[s.typeBadge, { backgroundColor: color + '15' }]}>
                    <ThemedText style={[s.typeBadgeText, { color }]}>{isRST ? 'RST' : 'SPV'}</ThemedText>
                  </ThemedView>
                </ThemedView>

                {/* RST cap banner */}
                {isRST && token.capReached && (
                  <ThemedView style={[s.capBanner, { backgroundColor: theme.star + '15' }]}>
                    <MaterialCommunityIcons name="flag-checkered" size={13} color = {theme.star } />
                    <ThemedText style={[s.capBannerText, { color: theme.star  }]}>
                      Plafond atteint — Tokens en cours de brûlage
                    </ThemedText>
                  </ThemedView>
                )}

                {/* RST plan tag */}
                {isRST && token.revenueSharePct && (
                  <ThemedView style={[s.planTag, { backgroundColor: color + '08', borderColor: color + '20' }]}>
                    <MaterialCommunityIcons name="calendar-clock" size={12} color={color} />
                    <ThemedText style={[s.planTagText, { color: theme.onSurface + '70' }]}>
                      Partage de{' '}
                      <ThemedText style={{ fontWeight: '800', color }}>
                        {token.revenueSharePct}% des loyers
                      </ThemedText>
                      {' '}· Cap à {token.maxReturnPct}%
                    </ThemedText>
                  </ThemedView>
                )}

                {/* SPV kyc tag */}
                {!isRST && token.kycLevel && (
                  <ThemedView style={[s.planTag, { backgroundColor: color + '08', borderColor: color + '20' }]}>
                    <MaterialCommunityIcons name="shield-check" size={12} color={color} />
                    <ThemedText style={[s.planTagText, { color: theme.onSurface + '70' }]}>
                      {token.kycLevel === 'verified'
                        ? <ThemedText style={{ fontWeight: '800', color }}>KYC vérifié</ThemedText>
                        : 'KYC en attente'}
                      {token.companyName ? ` · ${token.companyName}` : ''}
                    </ThemedText>
                  </ThemedView>
                )}

                {/* Stats */}
                <ThemedView style={s.statsRow}>
                  <ThemedView style={s.stat}>
                    <ThemedText style={[s.statVal, { color: theme.text }]}>
                      {token.tokensHeld.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={[s.statLabel, { color: theme.onSurface + '55' }]}>
                      {isRST ? 'Tokens RST' : 'Parts SPV'}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={[s.statDiv, { backgroundColor: theme.outline + '25' }]} />
                  <ThemedView style={s.stat}>
                    <ThemedText style={[s.statVal, { color: theme.text }]}>
                      ${token.investedUsd.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={[s.statLabel, { color: theme.onSurface + '55' }]}>Capital</ThemedText>
                  </ThemedView>
                  <ThemedView style={[s.statDiv, { backgroundColor: theme.outline + '25' }]} />
                  <ThemedView style={s.stat}>
                    <ThemedText style={[s.statVal, { color: color }]}>
                      +${token.returnUsd.toFixed(0)}
                    </ThemedText>
                    <ThemedText style={[s.statLabel, { color: theme.onSurface + '55' }]}>
                      {isRST ? 'Loyers reçus' : 'Revenus'}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={[s.statDiv, { backgroundColor: theme.outline + '25' }]} />
                  <ThemedView style={s.stat}>
                    <ThemedText style={[s.statVal, { color: pnl >= 0 ? color : theme.error ?? '#ef4444' }]}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}$
                    </ThemedText>
                    <ThemedText style={[s.statLabel, { color: theme.onSurface + '55' }]}>P&L</ThemedText>
                  </ThemedView>
                </ThemedView>

                {/* RST progress bar */}
                {isRST && token.maxReturnPct && (
                  <ThemedView>
                    <ThemedView style={s.progressHeader}>
                      <ThemedText style={[s.progressLabel, { color: theme.onSurface + '60' }]}>
                        Progression cap ({token.returnPct.toFixed(1)}% / {token.maxReturnPct}%)
                      </ThemedText>
                      <ThemedText style={[s.progressPct, { color: token.capReached ? theme.star  : color }]}>
                        {Math.min(100, (token.returnPct / token.maxReturnPct) * 100).toFixed(0)}%
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={[s.progressTrack, { backgroundColor: theme.outline + '25' }]}>
                      <ThemedView style={[s.progressFill, {
                        width: `${Math.min(100, (token.returnPct / token.maxReturnPct) * 100)}%`,
                        backgroundColor: token.capReached ? theme.star  : color,
                      }]} />
                    </ThemedView>
                  </ThemedView>
                )}

                {/* Actions */}
                <ThemedView style={s.actions}>
                  <TouchableOpacity
                    style={[s.btnOutline, { borderColor: color + '50' }]}
                    onPress={() => handleViewProject(token)}
                  >
                    <TrendingUp size={14} color={color} />
                    <ThemedText style={[s.btnOutlineText, { color }]}>Détails</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.btnTrade, { backgroundColor: color }]}
                    onPress={() => handleTrade(token)}
                  >
                    <ArrowRightLeft size={14} color="#fff" />
                    <ThemedText style={s.btnTradeText}>Trade</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.btnBorrow, { borderColor:theme.secondary + '60' }]}
                    onPress={() => handleBorrowREC(token)}
                  >
                    <MaterialCommunityIcons name="bank-outline" size={14} color=  {theme.secondary }/>
                    <ThemedText style={[s.btnBorrowText, { color: theme.secondary  }]}>REC</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </MotiView>
          );
        })
      )}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  summaryCard: { borderRadius: 16, padding: 18, gap: 10 },
  summaryTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { color: '#fff', fontSize: 15, fontWeight: '800' },
  summaryLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 3 },
  summaryDivider: { height: 1, marginVertical: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  quickNav: { flexDirection: 'row', gap: 8, marginTop: 4 },
  quickNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  quickNavText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  empty: { borderRadius: 14, alignItems: 'center', padding: 40, gap: 14, marginTop: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24, paddingHorizontal: 24, marginTop: 4 },
  ctaBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tokenSymbol: { fontSize: 14, fontWeight: '800' },
  tokenName: { fontSize: 11, marginTop: 2 },
  typeBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  capBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, padding: 8 },
  capBannerText: { fontSize: 12, fontWeight: '700' },
  planTag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, borderWidth: 1, padding: 8 },
  planTagText: { flex: 1, fontSize: 11, lineHeight: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 13, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  statDiv: { width: 1, height: 30, marginHorizontal: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontSize: 11 },
  progressPct: { fontSize: 11, fontWeight: '800' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  actions: { flexDirection: 'row', gap: 8 },
  btnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20, borderWidth: 1.5 },
  btnOutlineText: { fontSize: 13, fontWeight: '700' },
  btnTrade: { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20 },
  btnTradeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  btnBorrow: { flex: 0.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 40, borderRadius: 20, borderWidth: 1.5 },
  btnBorrowText: { fontSize: 13, fontWeight: '700' },
  recBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  recBannerIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recBannerTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  recBannerSub: { fontSize: 11, lineHeight: 16 },
});
