/**
 * DAO Proposals — Propositions de gouvernance + vote
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, DAOProposal } from '@/services/api/microservicesApi';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/hooks/useLanguage';

export default function DAOProposals() {
  const { theme } = useTheme();
  const router = useRouter();
  const { portfolioId } = useLocalSearchParams<{ portfolioId?: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const api = getMicroservicesApi();

  const STATUS_MAP: Record<string, { color: string; label: string }> = {
    active: { color: '#22c55e', label: t('dao.statusActive') },
    pending: { color: '#f59e0b', label: t('dao.statusPending') },
    passed: { color: '#3b82f6', label: t('dao.statusPassed') },
    rejected: { color: '#ef4444', label: t('dao.statusRejected') },
    executed: { color: '#8b5cf6', label: t('dao.statusExecuted') },
    cancelled: { color: '#6b7280', label: t('dao.statusCancelled') },
  };

  const TYPE_MAP: Record<string, string> = {
    buy: t('dao.typeBuy'),
    sell: t('dao.typeSell'),
    rebalance: t('dao.typeRebalance'),
    strategy_change: t('dao.typeStrategyChange'),
    fee_update: t('dao.typeFeeUpdate'),
  };

  const [proposals, setProposals] = useState<DAOProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);

  const pId = portfolioId || 'fund-001';

  const load = useCallback(async () => {
    try {
      const data = await api.getDAOProposals(pId);
      setProposals(data);
    } catch {
      setProposals(DEMO_PROPOSALS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pId]);

  useEffect(() => { load(); }, [load]);

  const handleVote = async (proposalId: string, vote: 'for' | 'against' | 'abstain') => {
    setVoting(proposalId);
    try {
      await api.voteOnProposal({
        proposalId,
        voterId: user?.id || '',
        vote,
        votingPower: 1,
      });
      Alert.alert(t('dao.voteRegistered'), t('dao.voteRegisteredMsg').replace('{vote}', vote));
      load();
    } catch {
      Alert.alert(t('dao.voteError'), t('dao.voteErrorMsg'));
    } finally {
      setVoting(null);
    }
  };

  const totalVotes = (p: DAOProposal) => p.votesFor + p.votesAgainst + p.votesAbstain;
  const forPct = (p: DAOProposal) => {
    const t = totalVotes(p);
    return t > 0 ? (p.votesFor / t) * 100 : 0;
  };
  const againstPct = (p: DAOProposal) => {
    const t = totalVotes(p);
    return t > 0 ? (p.votesAgainst / t) * 100 : 0;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />

      <ThemedView style={[dp.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={[dp.backBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView>
          <ThemedText style={[dp.headerTitle, { color: theme.text }]}>{t('dao.title')}</ThemedText>
          <ThemedText style={[dp.headerSub, { color: theme.onSurface + '70' }]}>{t('dao.subtitle')}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 14 }}
      >
        {loading ? <ActivityIndicator color={theme.primary} /> : (
          proposals.map(p => {
            const s = STATUS_MAP[p.status] || { color: '#6b7280', label: p.status };
            const fPct = forPct(p);
            const aPct = againstPct(p);
            const total = totalVotes(p);
            const quorumReached = total >= p.quorumRequired;

            return (
              <ThemedView key={p.proposalId} style={[dp.card, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
                {/* Header */}
                <ThemedView style={dp.propHeader}>
                  <ThemedView style={[dp.typeBadge, { backgroundColor: theme.primary + '15' }]}>
                    <ThemedText style={[dp.typeText, { color: theme.primary }]}>{TYPE_MAP[p.proposalType] || p.proposalType}</ThemedText>
                  </ThemedView>
                  <ThemedView style={[dp.statusBadge, { backgroundColor: s.color + '20' }]}>
                    <ThemedText style={[dp.statusText, { color: s.color }]}>{s.label}</ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedText style={dp.title}>{p.title}</ThemedText>
                <ThemedText type="body" style={[dp.desc, { color: theme.onSurface + '70' }]} numberOfLines={3}>
                  {p.description}
                </ThemedText>

                {/* AI Recommendation */}
                {p.aiRecommendation && (
                  <ThemedView style={[dp.aiBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                    <ThemedView style={dp.aiHeader}>
                      <MaterialCommunityIcons name="robot" size={16} color={theme.primary} />
                      <ThemedText style={[dp.aiTitle, { color: theme.primary }]}>
                        {t('dao.aiRecommendation').replace('{confidence}', (p.aiRecommendation.confidence * 100).toFixed(0))}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={dp.aiText} numberOfLines={2}>
                      {p.aiRecommendation.rationale}
                    </ThemedText>
                    <ThemedView style={dp.aiStats}>
                      <ThemedText style={[dp.aiStat, { color: theme.success }]}>
                        {t('dao.expectedReturn').replace('{value}', p.aiRecommendation.expectedReturn.toFixed(1))}
                      </ThemedText>
                      <ThemedText style={[dp.aiStat, { color: theme.star}]}>
                        {t('dao.riskScore').replace('{value}', (p.aiRecommendation.riskScore * 100).toFixed(0))}
                      </ThemedText>
                    </ThemedView>
                    {/* Market signals */}
                    <ThemedView style={dp.signalsRow}>
                      {p.aiRecommendation.marketSignals.slice(0, 3).map((sig, i) => (
                        <ThemedView key={i} style={[dp.signal, {
                          backgroundColor: sig.direction === 'bullish' ? '#22c55e20' : sig.direction === 'bearish' ? '#ef444420' : '#f59e0b20'
                        }]}>
                          <ThemedText style={{ fontSize: 10, color: sig.direction === 'bullish' ?  theme.success: sig.direction === 'bearish' ? theme.error : theme.star, fontWeight: '600' }}>
                            {sig.direction === 'bullish' ? '▲' : sig.direction === 'bearish' ? '▼' : '—'} {sig.signalType}
                          </ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </ThemedView>
                )}

                {/* Vote bars */}
                <ThemedView style={{ gap: 6 }}>
                  <ThemedView style={dp.voteRow}>
                    <ThemedText style={[dp.voteLabel, { color:theme.success }]}>{t('dao.voteFor')} {p.votesFor}</ThemedText>
                    <ThemedText style={[dp.voteLabel, { color: theme.onSurface + '60' }]}>{total} votes</ThemedText>
                    <ThemedText style={[dp.voteLabel, { color: theme.error }]}>{t('dao.voteAgainst')} {p.votesAgainst}</ThemedText>
                  </ThemedView>
                  <ThemedView style={[dp.voteTrack, { backgroundColor: theme.outline + '30' }]}>
                    <ThemedView style={[dp.voteFillFor, { width: `${fPct}%` }]} />
                    <ThemedView style={[dp.voteFillAgainst, { width: `${aPct}%` }]} />
                  </ThemedView>
                  <ThemedText style={[dp.quorumText, { color: quorumReached ? theme.success : theme.onSurface + '60' }]}>
                    {quorumReached ? t('dao.quorumReached') : t('dao.quorumProgress').replace('{current}', String(total)).replace('{required}', String(p.quorumRequired))}
                  </ThemedText>
                </ThemedView>

                {/* Vote dates */}
                <ThemedText style={[dp.dates, { color: theme.onSurface + '50' }]}>
                  {t('dao.voteEnd')} {new Date(p.votingEnd).toLocaleDateString()}
                </ThemedText>

                {/* Vote buttons */}
                {p.status === 'active' && (
                  <ThemedView style={dp.voteActions}>
                    {(['for', 'against', 'abstain'] as const).map(v => (
                      <TouchableOpacity
                        key={v}
                        style={[dp.voteBtn, {
                          backgroundColor: v === 'for' ? '#22c55e20' : v === 'against' ? '#ef444420' : theme.surface,
                          borderColor: v === 'for' ? '#22c55e60' : v === 'against' ? '#ef444460' : theme.outline + '40',
                        }]}
                        onPress={() => handleVote(p.proposalId, v)}
                        disabled={voting === p.proposalId}
                      >
                        {voting === p.proposalId
                          ? <ActivityIndicator size="small" color={theme.primary} />
                          : <ThemedText style={[dp.voteBtnText, {
                              color: v === 'for' ?theme.success : v === 'against' ? theme.error : theme.onSurface + '70'
                            }]}>
                              {v === 'for' ? t('dao.voteFor') : v === 'against' ? t('dao.voteAgainst') : t('dao.voteAbstain')}
                            </ThemedText>
                        }
                      </TouchableOpacity>
                    ))}
                  </ThemedView>
                )}
              </ThemedView>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DEMO_PROPOSALS: DAOProposal[] = [
  {
    id: '1', proposalId: 'prop-001', portfolioId: 'fund-001',
    proposalType: 'buy', title: 'Acquisition Immeuble Rue Victor Hugo, Nice',
    description: 'L\'IA recommande l\'acquisition d\'un immeuble résidentiel de 8 appartements à Nice pour renforcer le rendement locatif du fonds. Valeur estimée : 1.2M€.',
    status: 'active', votesFor: 847, votesAgainst: 123, votesAbstain: 56,
    quorumRequired: 500, votingStart: '2026-02-28', votingEnd: '2026-03-10',
    aiRecommendation: {
      algorithm: 'GPT-RE-v3', confidence: 0.87, expectedReturn: 9.2, riskScore: 0.22,
      rationale: 'Marché niçois en forte croissance. Rendement brut estimé à 7.8%. Zone A - forte demande locative.',
      marketSignals: [
        { signalType: 'price_trend', direction: 'bullish', strength: 0.82, description: 'Prix en hausse +4.2% sur 12 mois' },
        { signalType: 'yield_opportunity', direction: 'bullish', strength: 0.75, description: 'Rendement supérieur à la moyenne' },
        { signalType: 'macro_indicator', direction: 'neutral', strength: 0.5, description: 'Taux directeur stable' },
      ],
    },
    actions: [{ actionType: 'buy', propertyId: 'prop-nice-001', amountUsd: 1380000, expectedYield: 9.2 }],
    createdAt: '2026-02-25',
  },
];

const dp = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  propHeader: { flexDirection: 'row', gap: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeText: { fontSize: 11, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '800', lineHeight: 22 },
  desc: { lineHeight: 19 },
  aiBox: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 8 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiTitle: { fontWeight: '700' },
  aiText: { lineHeight: 18 },
  aiStats: { flexDirection: 'row', gap: 16 },
  aiStat: { fontWeight: '700' },
  signalsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  signal: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between' },
  voteLabel: { fontWeight: '600' },
  voteTrack: { height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden' },
  voteFillFor: { height: '100%', backgroundColor: '#22c55e' },
  voteFillAgainst: { height: '100%', backgroundColor: '#ef4444' },
  quorumText: { fontSize: 11 },
  dates: { fontSize: 11 },
  voteActions: { flexDirection: 'row', gap: 8 },
  voteBtn: { flex: 1, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  voteBtnText: { fontSize: 12, fontWeight: '700' },
});
