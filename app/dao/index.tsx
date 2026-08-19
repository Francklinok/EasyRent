import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import daoService, { DAOProposal, DAOTreasury, DAOMember, VoteChoice } from '@/services/api/daoService';
import { getMicroservicesApi } from '@/services/api/microservicesApi';
import { getAuthToken } from '@/hooks/useAuthToken';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

type Tab = 'proposals' | 'treasury' | 'members';
type ProposalFilter = 'all' | 'active' | 'passed' | 'failed';

const CATEGORY_ICONS: Record<string, string> = {
  financial: 'cash',
  maintenance: 'tools',
  management: 'office-building-cog',
  default: 'file-document',
};
const CATEGORY_COLORS: Record<string, string> = {
  financial: '#10B981',
  maintenance: '#F59E0B',
  management: '#8B5CF6',
  default: '#6366F1',
};

export default function DAOGovernance() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ projectId?: string }>();

  // projectId comes from navigation params (e.g. from the RST project detail screen)
  const projectId = params.projectId || '';

  const [activeTab, setActiveTab] = useState<Tab>('proposals');
  const [propFilter, setPropFilter] = useState<ProposalFilter>('all');
  const [proposals, setProposals] = useState<DAOProposal[]>([]);
  const [treasury, setTreasury] = useState<DAOTreasury | null>(null);
  const [members, setMembers] = useState<DAOMember[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<DAOProposal | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const [votingPower, setVotingPower] = useState({ tokens: 0, totalTokens: 1000, powerPct: 0, name: '' });

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('financial');
  const [submitting, setSubmitting] = useState(false);

  // Guard: if no projectId provided, show an error state
  const missingProject = !projectId;

  const loadData = useCallback(async () => {
    if (missingProject) {
      setLoading(false);
      return;
    }
    try {
      const [activeRes, historyRes, treasuryRes, membersRes] = await Promise.allSettled([
        daoService.getActiveProposals(projectId),
        daoService.getProposalHistory(projectId),
        daoService.getTreasury(projectId),
        daoService.getMembers(projectId),
      ]);

      const active = activeRes.status === 'fulfilled' ? activeRes.value : [];
      const history = historyRes.status === 'fulfilled' ? historyRes.value : [];
      const merged = [...active, ...history].reduce<DAOProposal[]>((acc, p) => {
        if (!acc.find(x => x.id === p.id)) acc.push(p);
        return acc;
      }, []);
      setProposals(merged);

      if (treasuryRes.status === 'fulfilled') setTreasury(treasuryRes.value);
      if (membersRes.status === 'fulfilled') setMembers(membersRes.value);

      // Load user voting power
      try {
        const projectRes = await getMicroservicesApi().getRSTProjectById(projectId);
        const userId = (user as any)?._id || (user as any)?.id || '';
        const holdings = await getMicroservicesApi().getMyRSTHoldings(userId).catch(() => []);
        const myHolding = holdings.find(h => h.project?.projectId === projectId || h.project?.id === projectId);
        const myTokens = myHolding?.holder?.tokensHeld || 0;
        const totalTokens = (projectRes as any).totalRstIssued || (projectRes as any).totalTokens || 1000;
        setVotingPower({
          name: (projectRes as any)._title || projectRes.propertyAddress || projectId,
          tokens: myTokens,
          totalTokens,
          powerPct: totalTokens > 0 ? Math.round((myTokens / totalTokens) * 1000) / 10 : 0,
        });
      } catch {
        setVotingPower(prev => ({ ...prev, name: projectId }));
      }
    } catch {
      Alert.alert('Erreur', t('daoGovernance.errLoadData'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId, user, missingProject]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleVote = async (proposalId: string, vote: VoteChoice) => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(t('daoGovernance.loginRequired'), t('daoGovernance.errLoginToVote'));
      return;
    }
    setVoting(proposalId);
    setShowVoteModal(false);
    setSelectedProposal(null);

    // Snapshot for rollback
    const snapshot = proposals.find(p => p.id === proposalId);

    // Optimistic update
    setProposals(prev => prev.map(p =>
      p.id === proposalId ? { ...p, myVote: vote } : p
    ));

    try {
      const voterAddress = (user as any)?.walletAddress || '0x0000';
      const result = await daoService.vote(token, proposalId, vote, voterAddress);
      // Reconcile with server counts
      setProposals(prev => prev.map(p =>
        p.id === proposalId
          ? { ...p, myVote: vote, votesFor: result.votesFor, votesAgainst: result.votesAgainst }
          : p
      ));
    } catch (err: any) {
      // Rollback optimistic update on error
      if (snapshot) {
        setProposals(prev => prev.map(p => p.id === proposalId ? snapshot : p));
      }
      if (!err.message?.includes('already voted')) {
        Alert.alert(t('daoGovernance.errVoteTitle') || 'Erreur', err.message || t('daoGovernance.errVoteMsg'));
      }
    } finally {
      setVoting(null);
    }
  };

  const handleCreateProposal = async () => {
    const token = await getAuthToken();
    if (!token) { Alert.alert(t('daoGovernance.loginRequired')); return; }
    if (!newTitle.trim() || !newDesc.trim()) {
      Alert.alert(t('daoGovernance.fieldsRequired'), t('daoGovernance.fillTitleDesc'));
      return;
    }
    setSubmitting(true);
    try {
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const proposal = await daoService.createProposal(token, {
        projectId,
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory,
        deadline,
        quorum: 50,
      });
      setProposals(prev => [proposal, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setShowNewProposalModal(false);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || t('daoGovernance.errCreateProposal'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProposals = proposals.filter(p =>
    propFilter === 'all' ||
    (propFilter === 'active' && p.status === 'active') ||
    (propFilter === 'passed' && p.status === 'passed') ||
    (propFilter === 'failed' && p.status === 'failed')
  );

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'proposals', label: t('daoGovernance.tabProposals'), icon: 'document-text' },
    { key: 'treasury', label: t('daoGovernance.tabTreasury'), icon: 'wallet' },
    { key: 'members', label: t('daoGovernance.tabMembers'), icon: 'people' },
  ];

  const PROP_FILTERS: { key: ProposalFilter; label: string }[] = [
    { key: 'all', label: t('daoGovernance.filterAll') },
    { key: 'active', label: t('daoGovernance.filterActive') },
    { key: 'passed', label: t('daoGovernance.filterPassed') },
    { key: 'failed', label: t('daoGovernance.filterFailed') },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'active') return theme.primary;
    if (status === 'passed' || status === 'executed') return '#10B981';
    return theme.error || '#EF4444';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return t('daoGovernance.statusActive');
    if (status === 'passed') return t('daoGovernance.statusPassed');
    if (status === 'executed') return t('daoGovernance.statusExecuted');
    if (status === 'cancelled') return t('daoGovernance.statusCancelled');
    return t('daoGovernance.statusFailed');
  };

  if (missingProject) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.[0] || theme.surface }}>
        <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>DAO Governance</ThemedText>
        </ThemedView>
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
          <MaterialCommunityIcons name="information-outline" size={48} color={theme.onSurface + '40'} />
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700', textAlign: 'center' }}>
            Aucun projet sélectionné
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', textAlign: 'center', lineHeight: 20 }}>
            Accédez à la gouvernance depuis la page de détail d'un projet RST.
          </ThemedText>
          <TouchableOpacity
            style={[{ backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }]}
            onPress={() => router.push('/invest/rst' as any)}
          >
            <ThemedText type="body" style={{ color: '#fff', fontWeight: '700' }}>Voir les projets RST</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.[0] || theme.surface }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>DAO Governance</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 11 }}>{votingPower.name || projectId}</ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={[s.newBtn, { backgroundColor: theme.primary }]}
          onPress={() => setShowNewProposalModal(true)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <ThemedText type="body" style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{t('daoGovernance.proposeBtn')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Voting Power Banner */}
      <ThemedView style={[s.powerBanner, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '25' }]}>
        <ThemedView style={[s.row, { justifyContent: 'space-between' }]}>
          <ThemedView>
            <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 12 }}>{t('daoGovernance.yourVotingPower')}</ThemedText>
            <ThemedText type="normaltitle" style={{ color: theme.primary, fontWeight: '900', fontSize: 18 }}>
              {votingPower.powerPct}%{' '}
              <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                ({votingPower.tokens} tokens)
              </ThemedText>
            </ThemedText>
          </ThemedView>
          <ThemedView style={{ alignItems: 'flex-end' }}>
            <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 11 }}>
              {t('daoGovernance.outOf').replace('{total}', String(votingPower.totalTokens))}
            </ThemedText>
            <ThemedView style={[s.row, { gap: 4, marginTop: 4 }]}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#10B981" />
              <ThemedText type="body" style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>{t('daoGovernance.kycVerified')}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        <ThemedView style={[s.powerTrack, { backgroundColor: theme.outline + '25', marginTop: 10 }]}>
          <ThemedView style={[s.powerFill, { width: `${Math.min(votingPower.powerPct, 100)}%` as any, backgroundColor: theme.primary }]} />
        </ThemedView>
      </ThemedView>

      {/* Tabs */}
      <ThemedView style={[s.tabBar, { borderBottomColor: theme.outline + '20', backgroundColor: theme.surface }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && { borderBottomWidth: 2, borderBottomColor: theme.primary }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? theme.primary : theme.onSurface + '50'} />
            <ThemedText type="body" style={{ color: activeTab === tab.key ? theme.primary : theme.onSurface + '60', fontSize: 12, fontWeight: activeTab === tab.key ? '700' : '500' }}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {loading ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.onSurface + '60', marginTop: 12 }}>{t('daoGovernance.loadingDAO')}</ThemedText>
        </ThemedView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          {/* ── PROPOSALS TAB ── */}
          {activeTab === 'proposals' && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {PROP_FILTERS.map(f => (
                  <TouchableOpacity
                    key={f.key}
                    style={[s.filterChip, { backgroundColor: propFilter === f.key ? theme.primary : theme.surface, borderColor: propFilter === f.key ? theme.primary : theme.outline + '30' }]}
                    onPress={() => setPropFilter(f.key)}
                  >
                    <ThemedText type="body" style={{ color: propFilter === f.key ? '#fff' : theme.text, fontSize: 12, fontWeight: '600' }}>
                      {f.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredProposals.length === 0 ? (
                <ThemedView style={[s.emptyState, { borderColor: theme.outline + '20' }]}>
                  <Ionicons name="document-text-outline" size={40} color={theme.onSurface + '30'} />
                  <ThemedText type="body" style={{ color: theme.onSurface + '50', textAlign: 'center', marginTop: 8 }}>
                    {t('daoGovernance.noProposals')}{propFilter !== 'all' ? ` ${PROP_FILTERS.find(f => f.key === propFilter)?.label.toLowerCase()}` : ''}
                  </ThemedText>
                </ThemedView>
              ) : (
                filteredProposals.map(proposal => {
                  const totalVoted = (proposal.votesFor || 0) + (proposal.votesAgainst || 0);
                  const total = proposal.totalVotes || Math.max(totalVoted, 1);
                  const forPct = Math.round(((proposal.votesFor || 0) / total) * 100);
                  const againstPct = Math.round(((proposal.votesAgainst || 0) / total) * 100);
                  const quorumReached = totalVoted >= (total * (proposal.quorum || 50) / 100);
                  const statusColor = getStatusColor(proposal.status);
                  const catColor = CATEGORY_COLORS[proposal.category] || CATEGORY_COLORS.default;
                  const catIcon = CATEGORY_ICONS[proposal.category] || CATEGORY_ICONS.default;
                  const isVoting = voting === proposal.id;

                  return (
                    <ThemedView key={proposal.id} style={[s.propCard, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
                      <ThemedView style={[s.row, { justifyContent: 'space-between' }]}>
                        <ThemedView style={[s.row, { gap: 8 }]}>
                          <ThemedView style={[s.catIcon, { backgroundColor: catColor + '18' }]}>
                            <MaterialCommunityIcons name={catIcon as any} size={14} color={catColor} />
                          </ThemedView>
                          <ThemedView style={[s.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '30' }]}>
                            <ThemedText type="body" style={{ color: statusColor, fontSize: 10, fontWeight: '700' }}>{getStatusLabel(proposal.status)}</ThemedText>
                          </ThemedView>
                        </ThemedView>
                        <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>
                          {proposal.status === 'active'
                            ? `⏰ ${new Date(proposal.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                            : new Date(proposal.deadline).toLocaleDateString('fr-FR')}
                        </ThemedText>
                      </ThemedView>

                      <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', fontSize: 14 }}>{proposal.title}</ThemedText>
                      <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 12, lineHeight: 17 }} numberOfLines={2}>
                        {proposal.description}
                      </ThemedText>

                      <ThemedView style={{ gap: 6 }}>
                        <ThemedView style={[s.row, { justifyContent: 'space-between' }]}>
                          <ThemedText type="body" style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>✓ {t('daoGovernance.voteFor')} {forPct}%</ThemedText>
                          <ThemedText type="body" style={{ color: theme.error || '#EF4444', fontSize: 12, fontWeight: '700' }}>✗ {t('daoGovernance.voteAgainst')} {againstPct}%</ThemedText>
                        </ThemedView>
                        <ThemedView style={[s.voteTrack, { backgroundColor: theme.outline + '25', overflow: 'hidden' }]}>
                          <ThemedView style={[s.voteFillFor, { width: `${forPct}%` as any }]} />
                          <ThemedView style={[s.voteFillAgainst, { width: `${againstPct}%` as any, position: 'absolute', right: 0 }]} />
                        </ThemedView>
                        <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>
                          {t('daoGovernance.quorum')} {quorumReached ? `✅ ${t('daoGovernance.quorumReached')}` : `${Math.round((totalVoted / total) * 100)}% / ${proposal.quorum || 50}%`}
                        </ThemedText>
                      </ThemedView>

                      {proposal.status === 'active' && (
                        <ThemedView style={[s.row, { gap: 8 }]}>
                          {isVoting ? (
                            <ThemedView style={[s.voteBtn, { flex: 1, borderColor: theme.outline + '30' }]}>
                              <ActivityIndicator size="small" color={theme.primary} />
                            </ThemedView>
                          ) : (
                            <>
                              <TouchableOpacity
                                style={[s.voteBtn, {
                                  backgroundColor: proposal.myVote === 'for' ? '#10B98120' : theme.surfaceVariant,
                                  borderColor: proposal.myVote === 'for' ? '#10B981' : theme.outline + '30',
                                  flex: 1,
                                }]}
                                onPress={() => { setSelectedProposal(proposal); setShowVoteModal(true); }}
                                disabled={!!proposal.myVote}
                              >
                                <Ionicons name="thumbs-up" size={14} color={proposal.myVote === 'for' ? '#10B981' : theme.onSurface + '60'} />
                                <ThemedText type="body" style={{ color: proposal.myVote === 'for' ? '#10B981' : theme.onSurface + '70', fontWeight: '700', fontSize: 13 }}>
                                  {proposal.myVote === 'for' ? t('daoGovernance.votedFor') : t('daoGovernance.labelFor')}
                                </ThemedText>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[s.voteBtn, {
                                  backgroundColor: proposal.myVote === 'against' ? (theme.error || '#EF4444') + '20' : theme.surfaceVariant,
                                  borderColor: proposal.myVote === 'against' ? (theme.error || '#EF4444') : theme.outline + '30',
                                  flex: 1,
                                }]}
                                onPress={() => handleVote(proposal.id, 'against')}
                                disabled={!!proposal.myVote}
                              >
                                <Ionicons name="thumbs-down" size={14} color={proposal.myVote === 'against' ? (theme.error || '#EF4444') : theme.onSurface + '60'} />
                                <ThemedText type="body" style={{ color: proposal.myVote === 'against' ? (theme.error || '#EF4444') : theme.onSurface + '70', fontWeight: '700', fontSize: 13 }}>
                                  {proposal.myVote === 'against' ? t('daoGovernance.votedAgainst') : t('daoGovernance.labelAgainst')}
                                </ThemedText>
                              </TouchableOpacity>
                            </>
                          )}
                        </ThemedView>
                      )}

                      <ThemedText type="body" style={{ color: theme.onSurface + '40', fontSize: 11 }}>
                        {t('daoGovernance.proposedBy')} {proposal.proposer}
                      </ThemedText>
                    </ThemedView>
                  );
                })
              )}
            </>
          )}

          {/* ── TREASURY TAB ── */}
          {activeTab === 'treasury' && (
            <>
              {treasury ? (
                <>
                  <ThemedView style={[s.treasuryCard, { backgroundColor: theme.primary }]}>
                    <ThemedText type="body" style={{ color: '#ffffff80', fontSize: 13 }}>{t('daoGovernance.treasuryTotal')}</ThemedText>
                    <ThemedText type="heading" style={{ color: '#fff', fontWeight: '900', fontSize: 26 }}>
                      {treasury.balance.toLocaleString('fr-FR')} {treasury.currency || 'XAF'}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: '#ffffff70', fontSize: 12 }}>
                      ≈ ${(treasury.balance / 600).toFixed(0)} USD
                    </ThemedText>
                  </ThemedView>

                  {[
                    { label: t('daoGovernance.monthlyRevenue'), value: `+${treasury.monthlyIncome.toLocaleString('fr-FR')} ${treasury.currency || 'XAF'}`, color: '#10B981', icon: 'trending-up' },
                    { label: t('daoGovernance.pendingPayments'), value: `-${treasury.pendingPayouts.toLocaleString('fr-FR')} ${treasury.currency || 'XAF'}`, color: theme.error || '#EF4444', icon: 'time' },
                    { label: t('daoGovernance.reserveFund'), value: `${treasury.reserveFund.toLocaleString('fr-FR')} ${treasury.currency || 'XAF'}`, color: '#8B5CF6', icon: 'shield' },
                  ].map((item, i) => (
                    <ThemedView key={i} style={[s.treasuryRow, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                      <ThemedView style={[s.row, { gap: 10 }]}>
                        <ThemedView style={[s.txIcon, { backgroundColor: item.color + '15' }]}>
                          <Ionicons name={item.icon as any} size={16} color={item.color} />
                        </ThemedView>
                        <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '600', fontSize: 14 }}>{item.label}</ThemedText>
                      </ThemedView>
                      <ThemedText type="normaltitle" style={{ color: item.color, fontWeight: '800' }}>{item.value}</ThemedText>
                    </ThemedView>
                  ))}
                </>
              ) : (
                <ThemedView style={[s.emptyState, { borderColor: theme.outline + '20' }]}>
                  <Ionicons name="wallet-outline" size={40} color={theme.onSurface + '30'} />
                  <ThemedText type="body" style={{ color: theme.onSurface + '50', textAlign: 'center', marginTop: 8 }}>
                    Données de trésorerie indisponibles
                  </ThemedText>
                </ThemedView>
              )}
            </>
          )}

          {/* ── MEMBERS TAB ── */}
          {activeTab === 'members' && (
            <>
              <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                {members.length} {t('daoGovernance.coOwners')} · {votingPower.totalTokens} {t('daoGovernance.tokensIssued')}
              </ThemedText>
              {members.length === 0 ? (
                <ThemedView style={[s.emptyState, { borderColor: theme.outline + '20' }]}>
                  <Ionicons name="people-outline" size={40} color={theme.onSurface + '30'} />
                  <ThemedText type="body" style={{ color: theme.onSurface + '50', textAlign: 'center', marginTop: 8 }}>
                    Aucun membre enregistré
                  </ThemedText>
                </ThemedView>
              ) : (
                members.map((member, i) => {
                  const isMe = member.userId === ((user as any)?._id || (user as any)?.id);
                  return (
                    <ThemedView key={member.userId || i} style={[s.memberCard, {
                      backgroundColor: isMe ? theme.primary + '12' : theme.surface,
                      borderColor: isMe ? theme.primary + '40' : theme.outline + '20',
                    }]}>
                      <ThemedView style={[s.row, { gap: 12 }]}>
                        <ThemedView style={[s.avatarCircle, { backgroundColor: theme.primary + '20' }]}>
                          <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>
                            {(member.name || '?').charAt(0).toUpperCase()}
                          </ThemedText>
                        </ThemedView>
                        <ThemedView style={{ flex: 1 }}>
                          <ThemedView style={[s.row, { gap: 6 }]}>
                            <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>{member.name}</ThemedText>
                            {isMe && (
                              <ThemedView style={[{ backgroundColor: theme.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }]}>
                                <ThemedText type="body" style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{t('daoGovernance.youLabel')}</ThemedText>
                              </ThemedView>
                            )}
                          </ThemedView>
                        </ThemedView>
                        <ThemedView style={{ alignItems: 'flex-end' }}>
                          <ThemedText type="normaltitle" style={{ color: theme.primary, fontWeight: '900', fontSize: 16 }}>{member.percentage}%</ThemedText>
                          <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>{member.tokens} tokens</ThemedText>
                        </ThemedView>
                      </ThemedView>
                      <ThemedView style={[s.voteTrack, { backgroundColor: theme.outline + '20', marginTop: 6 }]}>
                        <ThemedView style={[s.powerFill, { width: `${Math.min(member.percentage, 100)}%` as any, backgroundColor: isMe ? theme.primary : theme.onSurface + '40' }]} />
                      </ThemedView>
                    </ThemedView>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Vote Confirmation Modal */}
      <Modal visible={showVoteModal} transparent animationType="slide">
        <ThemedView style={[s.modalBackdrop]}>
          <ThemedView style={[s.voteModal, { backgroundColor: theme.surface }]}>
            <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', fontSize: 16, textAlign: 'center' }}>
              {t('daoGovernance.confirmVote')}
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
              {selectedProposal?.title}
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12, textAlign: 'center' }}>
              {t('daoGovernance.voteWithTokens')} {votingPower.tokens} {t('daoGovernance.tokens')} ({votingPower.powerPct}% {t('daoGovernance.ofTotal')})
            </ThemedText>
            <ThemedView style={[s.row, { gap: 12 }]}>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: '#10B98120', borderColor: '#10B981', flex: 1 }]}
                onPress={() => selectedProposal && handleVote(selectedProposal.id, 'for')}
              >
                <Ionicons name="thumbs-up" size={18} color="#10B981" />
                <ThemedText type="body" style={{ color: '#10B981', fontWeight: '800' }}>{t('daoGovernance.labelFor')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: (theme.error || '#EF4444') + '20', borderColor: theme.error || '#EF4444', flex: 1 }]}
                onPress={() => selectedProposal && handleVote(selectedProposal.id, 'against')}
              >
                <Ionicons name="thumbs-down" size={18} color={theme.error || '#EF4444'} />
                <ThemedText type="body" style={{ color: theme.error || '#EF4444', fontWeight: '800' }}>{t('daoGovernance.labelAgainst')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            <TouchableOpacity onPress={() => { setShowVoteModal(false); setSelectedProposal(null); }}>
              <ThemedText type="body" style={{ color: theme.onSurface + '60', textAlign: 'center', fontSize: 13 }}>{t('daoGovernance.cancel')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* New Proposal Modal */}
      <Modal visible={showNewProposalModal} transparent animationType="slide">
        <ThemedView style={[s.modalBackdrop]}>
          <ThemedView style={[s.voteModal, { backgroundColor: theme.surface, gap: 16 }]}>
            <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', fontSize: 16, textAlign: 'center' }}>
              {t('daoGovernance.newProposal')}
            </ThemedText>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder={t('daoGovernance.titlePlaceholder')}
              placeholderTextColor={theme.onSurface + '50'}
              style={[s.input, { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.outline + '30' }]}
              maxLength={120}
            />
            <TextInput
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder={t('daoGovernance.descPlaceholder')}
              placeholderTextColor={theme.onSurface + '50'}
              style={[s.input, { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.outline + '30', height: 80, textAlignVertical: 'top' }]}
              multiline
              maxLength={1000}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['financial', 'maintenance', 'management'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[s.filterChip, { backgroundColor: newCategory === cat ? CATEGORY_COLORS[cat] : theme.surface, borderColor: CATEGORY_COLORS[cat] + '60' }]}
                  onPress={() => setNewCategory(cat)}
                >
                  <ThemedText type="body" style={{ color: newCategory === cat ? '#fff' : CATEGORY_COLORS[cat], fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                    {cat}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12, textAlign: 'center' }}>
              {t('daoGovernance.voteRequirements')}
            </ThemedText>
            <TouchableOpacity
              style={[s.modalBtn, { backgroundColor: submitting ? theme.primary + '70' : theme.primary, borderColor: theme.primary, flex: 0 }]}
              onPress={handleCreateProposal}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText type="body" style={{ color: '#fff', fontWeight: '800' }}>{t('daoGovernance.submitProposal')}</ThemedText>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowNewProposalModal(false)}>
              <ThemedText type="body" style={{ color: theme.onSurface + '60', textAlign: 'center', fontSize: 13 }}>{t('daoGovernance.cancel')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  backBtn: { padding: 4 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  powerBanner: { margin: 16, borderRadius: 14, borderWidth: 1, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  powerTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  powerFill: { height: '100%', borderRadius: 4 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 3 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  propCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  catIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  voteTrack: { height: 8, borderRadius: 4 },
  voteFillFor: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#10B981', borderRadius: 4 },
  voteFillAgainst: { top: 0, bottom: 0, backgroundColor: '#EF4444', borderRadius: 4 },
  voteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 12, borderWidth: 1 },
  treasuryCard: { borderRadius: 20, padding: 20, gap: 4 },
  treasuryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, padding: 14 },
  txIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  memberCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: '#000000aa', alignItems: 'center', justifyContent: 'flex-end' },
  voteModal: { width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 16, borderWidth: 1.5 },
  input: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 16, borderWidth: 1 },
});
