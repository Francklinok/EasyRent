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

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: '#22c55e', label: 'Vote en cours' },
  pending: { color: '#f59e0b', label: 'En attente' },
  passed: { color: '#3b82f6', label: 'Adopté' },
  rejected: { color: '#ef4444', label: 'Rejeté' },
  executed: { color: '#8b5cf6', label: 'Exécuté' },
  cancelled: { color: '#6b7280', label: 'Annulé' },
};

const TYPE_MAP: Record<string, string> = {
  buy: 'Acheter un actif',
  sell: 'Vendre un actif',
  rebalance: 'Rééquilibrer',
  strategy_change: 'Changer stratégie',
  fee_update: 'Modifier frais',
};

export default function DAOProposals() {
  const { theme } = useTheme();
  const router = useRouter();
  const { portfolioId } = useLocalSearchParams<{ portfolioId?: string }>();
  const { user } = useAuth();
  const api = getMicroservicesApi();

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
      Alert.alert('Vote enregistré', `Votre vote "${vote}" a été soumis.`);
      load();
    } catch {
      Alert.alert('Erreur', 'Vote impossible. Vérifiez votre connexion.');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />

      <View style={[dp.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={[dp.backBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View>
          <Text style={[dp.headerTitle, { color: theme.text }]}>Gouvernance DAO</Text>
          <Text style={[dp.headerSub, { color: theme.onSurface + '70' }]}>Propositions & votes</Text>
        </View>
      </View>

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
              <View key={p.proposalId} style={[dp.card, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
                {/* Header */}
                <View style={dp.propHeader}>
                  <View style={[dp.typeBadge, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[dp.typeText, { color: theme.primary }]}>{TYPE_MAP[p.proposalType] || p.proposalType}</Text>
                  </View>
                  <View style={[dp.statusBadge, { backgroundColor: s.color + '20' }]}>
                    <Text style={[dp.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>

                <Text style={[dp.title, { color: theme.text }]}>{p.title}</Text>
                <Text style={[dp.desc, { color: theme.onSurface + '70' }]} numberOfLines={3}>
                  {p.description}
                </Text>

                {/* AI Recommendation */}
                {p.aiRecommendation && (
                  <View style={[dp.aiBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                    <View style={dp.aiHeader}>
                      <MaterialCommunityIcons name="robot" size={16} color={theme.primary} />
                      <Text style={[dp.aiTitle, { color: theme.primary }]}>
                        Recommandation IA — Confiance {(p.aiRecommendation.confidence * 100).toFixed(0)}%
                      </Text>
                    </View>
                    <Text style={[dp.aiText, { color: theme.text }]} numberOfLines={2}>
                      {p.aiRecommendation.rationale}
                    </Text>
                    <View style={dp.aiStats}>
                      <Text style={[dp.aiStat, { color: '#22c55e' }]}>
                        Retour attendu : +{p.aiRecommendation.expectedReturn.toFixed(1)}%
                      </Text>
                      <Text style={[dp.aiStat, { color: '#f59e0b' }]}>
                        Risque : {(p.aiRecommendation.riskScore * 100).toFixed(0)}%
                      </Text>
                    </View>
                    {/* Market signals */}
                    <View style={dp.signalsRow}>
                      {p.aiRecommendation.marketSignals.slice(0, 3).map((sig, i) => (
                        <View key={i} style={[dp.signal, {
                          backgroundColor: sig.direction === 'bullish' ? '#22c55e20' : sig.direction === 'bearish' ? '#ef444420' : '#f59e0b20'
                        }]}>
                          <Text style={{ fontSize: 10, color: sig.direction === 'bullish' ? '#22c55e' : sig.direction === 'bearish' ? '#ef4444' : '#f59e0b', fontWeight: '600' }}>
                            {sig.direction === 'bullish' ? '▲' : sig.direction === 'bearish' ? '▼' : '—'} {sig.signalType}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Vote bars */}
                <View style={{ gap: 6 }}>
                  <View style={dp.voteRow}>
                    <Text style={[dp.voteLabel, { color: '#22c55e' }]}>Pour {p.votesFor}</Text>
                    <Text style={[dp.voteLabel, { color: theme.onSurface + '60' }]}>{total} votes</Text>
                    <Text style={[dp.voteLabel, { color: '#ef4444' }]}>Contre {p.votesAgainst}</Text>
                  </View>
                  <View style={[dp.voteTrack, { backgroundColor: theme.outline + '30' }]}>
                    <View style={[dp.voteFillFor, { width: `${fPct}%` }]} />
                    <View style={[dp.voteFillAgainst, { width: `${aPct}%` }]} />
                  </View>
                  <Text style={[dp.quorumText, { color: quorumReached ? '#22c55e' : theme.onSurface + '60' }]}>
                    {quorumReached ? '✓ Quorum atteint' : `Quorum : ${total}/${p.quorumRequired} votes`}
                  </Text>
                </View>

                {/* Vote dates */}
                <Text style={[dp.dates, { color: theme.onSurface + '50' }]}>
                  Fin du vote : {new Date(p.votingEnd).toLocaleDateString('fr-FR')}
                </Text>

                {/* Vote buttons */}
                {p.status === 'active' && (
                  <View style={dp.voteActions}>
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
                          : <Text style={[dp.voteBtnText, {
                              color: v === 'for' ? '#22c55e' : v === 'against' ? '#ef4444' : theme.onSurface + '70'
                            }]}>
                              {v === 'for' ? 'Pour' : v === 'against' ? 'Contre' : 'Abstention'}
                            </Text>
                        }
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
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
  headerSub: { fontSize: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  propHeader: { flexDirection: 'row', gap: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeText: { fontSize: 11, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '800', lineHeight: 22 },
  desc: { fontSize: 13, lineHeight: 19 },
  aiBox: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 8 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiTitle: { fontSize: 12, fontWeight: '700' },
  aiText: { fontSize: 12, lineHeight: 18 },
  aiStats: { flexDirection: 'row', gap: 16 },
  aiStat: { fontSize: 12, fontWeight: '700' },
  signalsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  signal: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between' },
  voteLabel: { fontSize: 12, fontWeight: '600' },
  voteTrack: { height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden' },
  voteFillFor: { height: '100%', backgroundColor: '#22c55e' },
  voteFillAgainst: { height: '100%', backgroundColor: '#ef4444' },
  quorumText: { fontSize: 11 },
  dates: { fontSize: 11 },
  voteActions: { flexDirection: 'row', gap: 8 },
  voteBtn: { flex: 1, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  voteBtnText: { fontSize: 12, fontWeight: '700' },
});
