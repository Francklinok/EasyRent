import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
  Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.75:3000';
const { width } = Dimensions.get('window');

type Tab = 'overview' | 'milestones' | 'rent' | 'governance';

// ── Milestone status badge ────────────────────────────────────────────────────
function MilestoneBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, [string, string]> = {
    pending:            ['#374151', '#6b7280'],
    evidence_submitted: ['#1e3a5f', '#3b82f6'],
    under_review:       ['#3b2b00', '#f59e0b'],
    approved:           ['#14532d', '#22c55e'],
    released:           ['#14532d', '#10b981'],
    rejected:           ['#450a0a', '#ef4444'],
  };
  const [bg, text] = colors[status] || ['#374151', '#9ca3af'];
  return (
    <ThemedView style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
      <ThemedText type="normal" style={{ color: text }}>
        {label || status}
      </ThemedText>
    </ThemedView>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = '#6366f1' }: { pct: number; color?: string }) {
  const { theme } = useTheme();
  return (
    <ThemedView style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
      <ThemedView style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
    </ThemedView>
  );
}

export default function InvestorDashboard() {
  const { theme } = useTheme();
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');

  const translatedMilestoneLabels: Record<string, string> = {
    pending: t('investDashboard.milestonePending'),
    evidence_submitted: t('investDashboard.milestoneEvidence'),
    under_review: t('investDashboard.milestoneUnderReview'),
    approved: t('investDashboard.milestoneApproved'),
    released: t('investDashboard.milestoneReleased'),
    rejected: t('investDashboard.milestoneRejected'),
  };

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    try {
      const res = await fetch(
        `${API}/api/investment/investor/project/${projectId}/dashboard?investorId=${user?.id || ''}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.warn('Dashboard load failed', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId, user?.id]);

  useEffect(() => { load(); }, [load]);

  if (!projectId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <ThemedText type="normaltitle" style={{ fontWeight: '900', textAlign: 'center' }}>Projet introuvable</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}>
          <ThemedText type="normal" style={{ color: '#fff' }}>Retour</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleInvest = async () => {
    if (!data?.project) return;
    router.push({ pathname: '/invest/subscribe', params: { projectId } });
  };

  const openGroupChat = async () => {
    try {
      const res = await fetch(`${API}/api/investment/investor/project/${projectId}/group-chat`);
      const json = await res.json();
      if (json.success && json.data?.conversationId) {
        router.push({ pathname: '/chat/[chatId]', params: { chatId: json.data.conversationId } });
      } else {
        Alert.alert('Chat', t('investDashboard.chatUnavailable'));
      }
    } catch {
      Alert.alert('Erreur', t('investDashboard.chatError'));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color= {theme.secondary} />
          <ThemedText type="body" intensity="light" style={{ marginTop: 12 }}>{t('investDashboard.loading')}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const proj = data?.project;
  const myInv = data?.myInvestment;
  const fundraising = data?.fundraising;
  const milestones = data?.milestones;
  const rent = data?.rent;

  const raisedPct = fundraising
    ? Math.round((fundraising.raisedAmountUsd / fundraising.targetAmountUsd) * 100)
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      {/* Header */}
      <LinearGradient colors={['#1e1b4b', '#312e81']} style={{ padding: 16, paddingBottom: 12 }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#a5b4fc" />
          </TouchableOpacity>
          <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '700' }} numberOfLines={1}>
              {proj?.purpose_description || t('investDashboard.fallbackTitle')}
            </ThemedText>
            <ThemedText type="body" intensity="light" style={{ color: '#a5b4fc' }}>
              {proj?.property_address || ''}
            </ThemedText>
          </ThemedView>
          {/* Group chat button */}
          <TouchableOpacity
            onPress={openGroupChat}
            style={{
              backgroundColor: 'rgba(99,102,241,.3)', borderRadius: 20,
              padding: 8, borderWidth: 1, borderColor: 'rgba(165,180,252,.3)',
            }}
          >
            <Ionicons name="people-outline" size={20} color="#a5b4fc" />
          </TouchableOpacity>
        </ThemedView>

        {/* My investment quick stats */}
        {myInv && (
          <ThemedView style={{
            flexDirection: 'row', marginTop: 16, gap: 8, backgroundColor: 'transparent',
          }}>
            {[
              { label: t('investDashboard.labelInvestment'), value: `$${(myInv.investedAmountUsd || 0).toLocaleString()}` },
              { label: t('investDashboard.labelShare'), value: `${myInv.ownershipPct}%` },
              { label: t('investDashboard.labelROI'), value: myInv.roi },
            ].map((item) => (
              <ThemedView key={item.label} style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,.08)',
                borderRadius: 12, padding: 10, alignItems: 'center',
              }}>
                <ThemedText type="body" intensity="light" style={{ color: '#a5b4fc', marginBottom: 4 }}>{item.label}</ThemedText>
                <ThemedText type="normal" style={{ color: '#fff', fontWeight: '700' }}>{item.value}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </LinearGradient>

      {/* Tabs */}
      <ThemedView style={{
        flexDirection: 'row', backgroundColor: theme.cardBorder,
        borderBottomWidth: 1, borderBottomColor: theme.border,
      }}>
        {([
          { key: 'overview', label: t('investDashboard.tabOverview'), icon: 'view-dashboard' },
          { key: 'milestones', label: t('investDashboard.tabMilestones'), icon: 'progress-check' },
          { key: 'rent', label: t('investDashboard.tabRent'), icon: 'cash' },
          { key: 'governance', label: t('investDashboard.tabGovernance'), icon: 'vote' },
        ] as const).map((tabItem) => (
          <TouchableOpacity
            key={tabItem.key}
            onPress={() => setTab(tabItem.key)}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: 10,
              borderBottomWidth: 2,
              borderBottomColor: tab === tabItem.key ? theme.secondary : 'transparent',
            }}
          >
            <MaterialCommunityIcons
              name={tabItem.icon}
              size={18}
              color={tab === tabItem.key ? theme.secondary : theme.textSecondary}
            />
            <ThemedText type="normal" style={{
              marginTop: 2,
              color: tab === tabItem.key ? teme.secondary : theme.textSecondary,
              fontWeight: tab === tabItem.key ? '700' : '400',
            }}>
              {tabItem.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {/* ── Overview Tab ──────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            {/* Fundraising card */}
            <ThemedView style={{ backgroundColor: theme.cardBorder, borderRadius: 16, padding: 16 }}>
              <ThemedText type="normal" style={{ fontWeight: '700', marginBottom: 12 }}>{t('investDashboard.fundraisingTitle')}</ThemedText>
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary }}>
                  {t('investDashboard.collected')} <ThemedText type="normal" style={{ color: theme.text, fontWeight: '700' }}>
                    ${(fundraising?.raisedAmountUsd || 0).toLocaleString()}
                  </ThemedText>
                </ThemedText>
                <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary }}>
                  {t('investDashboard.target')} ${(fundraising?.targetAmountUsd || 0).toLocaleString()}
                </ThemedText>
              </ThemedView>
              <ProgressBar pct={raisedPct} color={raisedPct >= 80 ? theme.success : theme.secondary} />
              <ThemedText type="normal" style={{ textAlign: 'right', marginTop: 4, color:theme.secondary, fontWeight: '700' }}>
                {raisedPct}%
              </ThemedText>
              {fundraising?.thresholdReached && (
                <ThemedView style={{
                  flexDirection: 'row', alignItems: 'center', marginTop: 8,
                  backgroundColor: 'rgba(16,185,129,.1)', borderRadius: 8, padding: 8, gap: 6,
                }}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={theme.secondary} />
                  <ThemedText type="normal" style={{ color:theme.secondary }}>
                    {t('investDashboard.thresholdReached')}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            {/* Project info */}
            {proj && (
              <ThemedView style={{ backgroundColor: theme.cardBorder, borderRadius: 16, padding: 16, gap: 10 }}>
                <ThemedText type="normal" style={{ fontWeight: '700', marginBottom: 4 }}>{t('investDashboard.projectDetailsTitle')}</ThemedText>
                {[
                  { label: t('investDashboard.targetYield'), value: `${proj.target_annual_yield || 0}% / an` },
                  { label: t('investDashboard.duration'), value: `${proj.duration_months || 0} mois` },
                  { label: t('investDashboard.revenueShare'), value: `${proj.revenue_share_pct || 0}%` },
                  { label: t('investDashboard.jurisdiction'), value: proj.jurisdiction || 'N/A' },
                  { label: t('investDashboard.status'), value: proj.status || 'N/A' },
                ].map((item) => (
                  <ThemedView key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary }}>{item.label}</ThemedText>
                    <ThemedText type="normal">{item.value}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            )}

            {/* Invest button */}
            {(!myInv || myInv.investedAmountUsd === 0) && (
              <TouchableOpacity onPress={handleInvest}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={{ borderRadius: 14, padding: 16, alignItems: 'center' }}>
                  <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '700' }}>{t('investDashboard.investBtn')}</ThemedText>
                  <ThemedText type="body" intensity="light" style={{ color: 'rgba(255,255,255,.7)', marginTop: 2 }}>
                    Min. ${(proj?.min_investment_usd || 500).toLocaleString()}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── Milestones Tab ───────────────────────────────────────────── */}
        {tab === 'milestones' && (
          <>
            <ThemedView style={{ backgroundColor: theme.cardBorder, borderRadius: 16, padding: 16 }}>
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <ThemedText type="normal" style={{ fontWeight: '700' }}>{t('investDashboard.milestonesProgress')}</ThemedText>
                <ThemedText type="normaltitle" style={{ color: '#6366f1', fontWeight: '700' }}>
                  {milestones?.progressPct || 0}%
                </ThemedText>
              </ThemedView>
              <ProgressBar pct={milestones?.progressPct || 0} />
              <ThemedText type="body" intensity="light" style={{ marginTop: 6, color: theme.textSecondary }}>
                {milestones?.completed || 0} / {milestones?.total || 0} {t('investDashboard.phasesCompleted')}
              </ThemedText>
            </ThemedView>

            {(milestones?.items || []).map((m: any, i: number) => (
              <ThemedView key={m.milestone_id || i} style={{
                backgroundColor: theme.cardBorder, borderRadius: 14, padding: 14, gap: 8,
              }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <ThemedView style={{
                      width: 28, height: 28, borderRadius: 14, backgroundColor: '#312e81',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ThemedText type="normal" style={{ color: '#a5b4fc', fontWeight: '700' }}>{m.order}</ThemedText>
                    </ThemedView>
                    <ThemedText type="normal" style={{ flex: 1 }} numberOfLines={1}>
                      {m.title}
                    </ThemedText>
                  </ThemedView>
                  <MilestoneBadge status={m.status} label={translatedMilestoneLabels[m.status] || m.status} />
                </ThemedView>

                <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary }}>{m.description}</ThemedText>

                <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary }}>
                    {t('investDashboard.milestoneAmount')} <ThemedText type="normal" style={{ color: '#6366f1', fontWeight: '700' }}>
                      ${(m.amount_usd || 0).toLocaleString()}
                    </ThemedText>
                  </ThemedText>
                  {m.due_date && (
                    <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary }}>
                      {t('investDashboard.milestoneDeadline')} {new Date(m.due_date).toLocaleDateString('fr-FR')}
                    </ThemedText>
                  )}
                </ThemedView>

                {/* Evidence */}
                {m.evidence?.length > 0 && (
                  <ThemedView style={{
                    backgroundColor: 'rgba(99,102,241,.08)', borderRadius: 8, padding: 8,
                  }}>
                    <ThemedText type="normal" style={{ color: '#a5b4fc', marginBottom: 4 }}>
                      {m.evidence.length} {t('investDashboard.evidenceCount')}
                    </ThemedText>
                    {m.evidence.map((ev: any) => (
                      <ThemedText key={ev.id} type="body" intensity="light" style={{ color: theme.textSecondary }}>
                        • {ev.evidence_type} — {ev.description}
                      </ThemedText>
                    ))}
                  </ThemedView>
                )}

                {/* Votes */}
                {m.requires_vote && m.votes_for + m.votes_against > 0 && (
                  <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
                    <ThemedView style={{
                      flex: 1, backgroundColor: 'rgba(16,185,129,.1)', borderRadius: 8, padding: 6, alignItems: 'center',
                    }}>
                      <ThemedText type="normal" style={{ color: '#10b981', fontWeight: '700' }}>{m.votes_for} ✓</ThemedText>
                      <ThemedText type="body" intensity="light" style={{ color: '#10b981' }}>{t('investDashboard.voteFor')}</ThemedText>
                    </ThemedView>
                    <ThemedView style={{
                      flex: 1, backgroundColor: 'rgba(239,68,68,.1)', borderRadius: 8, padding: 6, alignItems: 'center',
                    }}>
                      <ThemedText type="normal" style={{ color: '#ef4444', fontWeight: '700' }}>{m.votes_against} ✗</ThemedText>
                      <ThemedText type="body" intensity="light" style={{ color: '#ef4444' }}>{t('investDashboard.voteAgainst')}</ThemedText>
                    </ThemedView>
                  </ThemedView>
                )}
              </ThemedView>
            ))}

            {(!milestones?.items || milestones.items.length === 0) && (
              <ThemedView style={{ alignItems: 'center', padding: 40 }}>
                <MaterialCommunityIcons name="progress-clock" size={48} color={theme.textSecondary} />
                <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary, marginTop: 12 }}>
                  {t('investDashboard.milestonesEmpty')}
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}

        {/* ── Rent Tab ─────────────────────────────────────────────────── */}
        {tab === 'rent' && (
          <>
            {rent ? (
              <>
                <ThemedView style={{ backgroundColor: theme.cardBorder, borderRadius: 16, padding: 16, gap: 10 }}>
                  <ThemedText type="normal" style={{ fontWeight: '700', marginBottom: 4 }}>{t('investDashboard.rentTitle')}</ThemedText>
                  {[
                    { label: t('investDashboard.activeLeases'), value: String(rent.activeLeases || 0), isOverdue: false },
                    { label: t('investDashboard.totalCollected'), value: `${(rent.totalRentCollected || 0).toLocaleString()} XAF`, isOverdue: false },
                    { label: t('investDashboard.redistributed'), value: `${(rent.totalInvestorsReceived || 0).toLocaleString()} XAF`, isOverdue: false },
                    { label: t('investDashboard.pendingPayments'), value: String(rent.pendingPayments || 0), isOverdue: false },
                    { label: t('investDashboard.overduePayments'), value: String(rent.overduePayments || 0), isOverdue: true },
                  ].map((item) => (
                    <ThemedView key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary }}>{item.label}</ThemedText>
                      <ThemedText type="normal" style={{ fontWeight: '700', color: item.isOverdue && parseInt(item.value) > 0 ? '#ef4444' : theme.text }}>
                        {item.value}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>

                {/* Next distribution */}
                {data?.distributions?.nextExpected && (
                  <ThemedView style={{
                    backgroundColor: 'rgba(99,102,241,.1)', borderRadius: 14,
                    padding: 14, borderWidth: 1, borderColor: 'rgba(99,102,241,.2)',
                  }}>
                    <ThemedText type="normal" style={{ fontWeight: '700', color: '#6366f1', marginBottom: 6 }}>
                      {t('investDashboard.nextDistribution')}
                    </ThemedText>
                    <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary }}>
                      {t('investDashboard.date')} {new Date(data.distributions.nextExpected.expectedDate).toLocaleDateString('fr-FR')}
                    </ThemedText>
                    <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700', marginTop: 4 }}>
                      ${(data.distributions.nextExpected.estimatedAmount || 0).toFixed(2)}
                    </ThemedText>
                  </ThemedView>
                )}
              </>
            ) : (
              <ThemedView style={{ alignItems: 'center', padding: 40 }}>
                <MaterialCommunityIcons name="cash-clock" size={48} color={theme.textSecondary} />
                <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary, marginTop: 12 }}>
                  {t('investDashboard.noActiveLease')}
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}

        {/* ── Governance Tab ───────────────────────────────────────────── */}
        {tab === 'governance' && (
          <ThemedView style={{ alignItems: 'center', padding: 40, gap: 16 }}>
            <MaterialCommunityIcons name="vote-outline" size={56} color="#6366f1" />
            <ThemedText type="subtitle" style={{ fontWeight: '700' }}>{t('investDashboard.governanceTitle')}</ThemedText>
            <ThemedText type="body" intensity="light" style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              {t('investDashboard.governanceDesc')}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/dao' as any, params: { projectId: projectId! } })}
            >
              <LinearGradient colors={['#6366f1', '#4f46e5']} style={{ borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
                <ThemedText type="normal" style={{ color: '#fff', fontWeight: '700' }}>{t('investDashboard.viewProposals')}</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
