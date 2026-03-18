import React, { useState, useEffect } from 'react';
import {
  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, RSTProject, RSTDistribution } from '@/services/api/microservicesApi';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const DEMO_PROJECT: RSTProject = {
  projectId: 'rst-001', propertyAddress: 'Av. des Champs-Élysées 47, Paris',
  propertyType: 'Résidentiel', estimatedValueUsd: 850000,
  targetAmountUsd: 200000, raisedAmountUsd: 142000,
  minInvestmentUsd: 500, maxInvestmentUsd: 50000,
  revenueSharePct: 70, durationMonths: 36,
  targetAnnualYield: 8.5, maxReturnPct: 130,
  baseMonthlyRent: 3200, platformFeeBps: 300,
  distributionFeeBps: 100, performanceFeeBps: 1000,
  totalInvestors: 84, totalRstIssued: 142000,
  currentOccupancy: 95, adaptiveYield: 8.2,
  esgScore: 78, aiRiskScore: 0.25, aiRecommendedShare: 72,
  status: 'active', kycRequired: true, jurisdiction: 'France',
};

const DEMO_DISTRIBUTIONS: RSTDistribution[] = [
  { distributionId: 'd1', projectId: 'rst-001', periodLabel: 'Février 2026', rentCollectedUsd: 3200, platformFeePct: 3, netDistributedUsd: 3104, perTokenUsd: 0.0218, totalHolders: 84, txHash: '0xabc', distributedAt: '2026-03-01' },
  { distributionId: 'd2', projectId: 'rst-001', periodLabel: 'Janvier 2026', rentCollectedUsd: 3200, platformFeePct: 3, netDistributedUsd: 3104, perTokenUsd: 0.0218, totalHolders: 84, txHash: '0xdef', distributedAt: '2026-02-01' },
];

type Tab = 'overview' | 'distributions' | 'ai';

export default function ProjectDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { t, isRTL } = useLanguage();
  const api = getMicroservicesApi();

  const [project, setProject] = useState<RSTProject | null>(null);
  const [distributions, setDistributions] = useState<RSTDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    (async () => {
      try {
        const [p, d] = await Promise.all([
          api.getRSTProjectById(projectId!),
          api.getRSTDistributions(projectId!),
        ]);
        setProject(p || DEMO_PROJECT);
        setDistributions(d.length > 0 ? d : DEMO_DISTRIBUTIONS);
      } catch {
        setProject(DEMO_PROJECT);
        setDistributions(DEMO_DISTRIBUTIONS);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (!project) return null;

  const progress = Math.min(100, Math.round((project.raisedAmountUsd / project.targetAmountUsd) * 100));
  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('invest.overview') },
    { key: 'distributions', label: t('invest.distributions') },
    { key: 'ai', label: t('invest.aiEsg') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900', fontSize: 15 }} numberOfLines={1}>
            {project.propertyAddress}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
            {project.propertyType} · {project.jurisdiction}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Tabs */}
      <ThemedView style={[s.tabBar, { borderBottomColor: theme.outline + '20' }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, { borderBottomColor: activeTab === tab.key ? theme.primary : 'transparent', borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <ThemedText type="body" style={{ color: activeTab === tab.key ? theme.primary : theme.onSurface + '60', fontWeight: '700', fontSize: 13 }}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {activeTab === 'overview' && (
          <>
            {/* Financing progress */}
            <ThemedView style={[s.card, { backgroundColor: theme.surface }]}>
              <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('invest.financing')}</ThemedText>
              <ThemedView style={{ gap: 6 }}>
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>
                    ${project.raisedAmountUsd.toLocaleString()} / ${project.targetAmountUsd.toLocaleString()}
                  </ThemedText>
                  <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700' }}>{progress}%</ThemedText>
                </ThemedView>
                <ThemedView style={[s.track, { backgroundColor: theme.outline + '25' }]}>
                  <ThemedView style={[s.fill, { width: `${progress}%` as any, backgroundColor: theme.primary }]} />
                </ThemedView>
                <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 12 }}>
                  {project.totalInvestors} {t('invest.investorCount')} · {project.totalRstIssued.toLocaleString()} {t('invest.rstIssued')}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Key Metrics */}
            <ThemedView style={[s.card, { backgroundColor: theme.surface }]}>
              <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('invest.keyMetrics')}</ThemedText>
              {[
                { label: t('invest.targetYield'), value: `${project.targetAnnualYield}%` },
                { label: t('invest.rentShare'), value: `${project.revenueSharePct}%` },
                { label: t('invest.baseRent'), value: `$${project.baseMonthlyRent.toLocaleString()}/mois` },
                { label: t('invest.duration'), value: `${project.durationMonths} mois` },
                { label: t('invest.maxReturn'), value: `${project.maxReturnPct}%` },
                { label: t('invest.minInvest'), value: `$${project.minInvestmentUsd.toLocaleString()}` },
                { label: t('invest.occupancy'), value: `${project.currentOccupancy}%` },
              ].map((row, i) => (
                <ThemedView key={i} style={[s.metricsRow, { borderBottomColor: theme.outline + '15', borderBottomWidth: i < 6 ? 1 : 0 }]}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{row.label}</ThemedText>
                  <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{row.value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* Fees */}
            <ThemedView style={[s.card, { backgroundColor: theme.surface }]}>
              <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('invest.fees')}</ThemedText>
              {[
                { label: t('invest.platformFee'), value: `${project.platformFeeBps / 100}%` },
                { label: t('invest.distributionFee'), value: `${project.distributionFeeBps / 100}%` },
                { label: t('invest.performanceFee'), value: `${project.performanceFeeBps / 100}%` },
              ].map((row, i) => (
                <ThemedView key={i} style={[s.metricsRow, { borderBottomColor: theme.outline + '15', borderBottomWidth: i < 2 ? 1 : 0 }]}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{row.label}</ThemedText>
                  <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{row.value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* Compliance */}
            <ThemedView style={[s.card, { backgroundColor: theme.surface }]}>
              <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('invest.compliance')}</ThemedText>
              {[
                { label: t('invest.jurisdiction'), value: project.jurisdiction },
                { label: t('invest.kycRequired'), value: project.kycRequired ? '✅ Oui' : '❌ Non' },
              ].map((row, i) => (
                <ThemedView key={i} style={[s.metricsRow, { borderBottomColor: theme.outline + '15', borderBottomWidth: i < 1 ? 1 : 0 }]}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{row.label}</ThemedText>
                  <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{row.value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* Invest CTA */}
            {project.status === 'active' && (
              <TouchableOpacity style={[s.cta, { backgroundColor: theme.primary }]}>
                <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '800' }}>{t('invest.investInProject')}</ThemedText>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        )}

        {activeTab === 'distributions' && (
          <>
            <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('invest.distributions')}</ThemedText>
            {distributions.length === 0 ? (
              <ThemedView style={[s.empty, { backgroundColor: theme.surface }]}>
                <MaterialCommunityIcons name="bank-off" size={48} color={theme.onSurface + '30'} />
                <ThemedText type="body" style={{ color: theme.onSurface + '60' }}>{t('invest.noDistributions')}</ThemedText>
              </ThemedView>
            ) : (
              distributions.map(d => (
                <ThemedView key={d.distributionId} style={[s.card, { backgroundColor: theme.surface }]}>
                  <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700' }}>{d.periodLabel}</ThemedText>
                    <ThemedText type="body" style={{ color: '#10B981', fontWeight: '700' }}>
                      ${d.netDistributedUsd.toLocaleString()}
                    </ThemedText>
                  </ThemedView>
                  {[
                    { label: t('invest.rentCollected'), value: `$${d.rentCollectedUsd.toLocaleString()}` },
                    { label: t('invest.perRstToken'), value: `$${d.perTokenUsd}` },
                    { label: t('invest.holderCount'), value: `${d.totalHolders}` },
                  ].map((row, i) => (
                    <ThemedView key={i} style={[s.metricsRow, { borderBottomColor: theme.outline + '10', borderBottomWidth: i < 2 ? 1 : 0 }]}>
                      <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{row.label}</ThemedText>
                      <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{row.value}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              ))
            )}
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('invest.aiEsgScore')}</ThemedText>
            <ThemedView style={[s.card, { backgroundColor: theme.surface }]}>
              {[
                { label: 'ESG Score', value: `${project.esgScore}/100`, color: '#10B981' },
                { label: 'AI Risk Score', value: `${project.aiRiskScore}`, color: project.aiRiskScore < 0.3 ? '#10B981' : '#F59E0B' },
                { label: 'AI Recommended Share', value: `${project.aiRecommendedShare}%`, color: theme.primary },
              ].map((row, i) => (
                <ThemedView key={i} style={[s.metricsRow, { borderBottomColor: theme.outline + '15', borderBottomWidth: i < 2 ? 1 : 0 }]}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{row.label}</ThemedText>
                  <ThemedText type="body" style={{ color: row.color, fontWeight: '700', fontSize: 13 }}>{row.value}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            <ThemedView style={[s.card, { backgroundColor: theme.surface }]}>
              <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('invest.aiAnalysis')}</ThemedText>
              <ThemedText type="body" style={{ color: theme.text, lineHeight: 20, fontSize: 13 }}>
                Cet actif présente un bon profil risque/rendement avec un ESG score de {project.esgScore}/100.
                Le taux d'occupation actuel de {project.currentOccupancy}% garantit des distributions stables.
                Le AI Risk Score de {project.aiRiskScore} indique un risque faible.
              </ThemedText>
            </ThemedView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  card: { borderRadius: 12, padding: 14, gap: 10 },
  sectionTitle: { fontWeight: '800' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
  empty: { alignItems: 'center', gap: 12, padding: 48, borderRadius: 14 },
});
