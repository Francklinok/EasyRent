/**
 * invest/rst/[projectId].tsx — Détail projet RST
 * 3 onglets : Aperçu / Distributions / IA & Assurance
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, RSTProject, RSTDistribution } from '@/services/api/microservicesApi';

const TABS = ['Aperçu', 'Distributions', 'IA & Assurance'];

export default function RSTDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const api = getMicroservicesApi();

  const [project, setProject] = useState<RSTProject | null>(null);
  const [distributions, setDistributions] = useState<RSTDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.getRSTProjectById(projectId),
      api.getRSTDistributions(projectId),
    ])
      .then(([p, d]) => { setProject(p); setDistributions(d); })
      .catch(() => { setProject(DEMO_RST); setDistributions(DEMO_DIST); })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#10b981" size="large" />
      </SafeAreaView>
    );
  }
  if (!project) return null;

  const pct = Math.min(100, (project.raisedAmountUsd / project.targetAmountUsd) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />

      <View style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: theme.text }]} numberOfLines={1}>{project.propertyAddress}</Text>
          <Text style={[s.headerSub, { color: '#10b981' }]}>RST · Partage de loyers · {project.jurisdiction}</Text>
        </View>
      </View>

      <View style={[s.tabs, { borderBottomColor: theme.outline + '20' }]}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} onPress={() => setTab(i)} style={s.tab}>
            <Text style={[s.tabText, { color: i === tab ? '#10b981' : theme.onSurface + '60' }]}>{t}</Text>
            {i === tab && <View style={[s.tabIndicator, { backgroundColor: '#10b981' }]} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* ── Onglet 0 : Aperçu ── */}
        {tab === 0 && (
          <>
            {/* Modèle expliqué pour ce projet */}
            <View style={[s.modelCard, { backgroundColor: '#10b981' + '10', borderColor: '#10b981' + '30' }]}>
              <View style={s.modelCardHeader}>
                <MaterialCommunityIcons name="home-analytics" size={20} color="#10b981" />
                <Text style={[s.modelCardTitle, { color: '#10b981' }]}>Plan de financement RST</Text>
              </View>
              <Text style={[s.modelCardText, { color: theme.onSurface + '80' }]}>
                Le propriétaire <Text style={{ fontWeight: '800' }}>conserve son bien</Text> et lève{' '}
                <Text style={{ fontWeight: '800', color: '#10b981' }}>${project.targetAmountUsd.toLocaleString()}</Text> pour le financer.
                En échange, il partage <Text style={{ fontWeight: '800', color: '#10b981' }}>{project.revenueSharePct}% de ses loyers mensuels</Text>{' '}
                pendant <Text style={{ fontWeight: '800' }}>{project.durationMonths} mois</Text>.
                Les tokens RST sont <Text style={{ fontWeight: '800' }}>brûlés automatiquement</Text> quand le retour atteint{' '}
                <Text style={{ fontWeight: '800', color: '#f59e0b' }}>{project.maxReturnPct}%</Text> du capital investi.
              </Text>
            </View>

            {/* Progression */}
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <Text style={[s.cardTitle, { color: theme.text }]}>Levée de fonds</Text>
              <View style={s.progressHeaderRow}>
                <Text style={[s.progressLabel, { color: theme.onSurface + '60' }]}>
                  ${project.raisedAmountUsd.toLocaleString()} levés
                </Text>
                <Text style={[s.progressPct, { color: '#10b981' }]}>{pct.toFixed(1)}%</Text>
              </View>
              <View style={[s.progressTrack, { backgroundColor: theme.outline + '25' }]}>
                <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: '#10b981' }]} />
              </View>
              <Text style={[s.progressSub, { color: theme.onSurface + '50' }]}>
                Objectif : ${project.targetAmountUsd.toLocaleString()} · {project.totalInvestors} investisseurs
              </Text>
            </View>

            {/* Métriques */}
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <Text style={[s.cardTitle, { color: theme.text }]}>Conditions d'investissement</Text>
              <View style={s.metricsGrid}>
                {[
                  { label: 'Rendement annuel cible', value: `${project.targetAnnualYield.toFixed(1)}%`, color: '#10b981' },
                  { label: 'Part des loyers partagée', value: `${project.revenueSharePct}%`, color: '#10b981' },
                  { label: 'Loyer mensuel de base', value: `$${project.baseMonthlyRent.toLocaleString()}`, color: theme.text },
                  { label: 'Durée du plan', value: `${project.durationMonths} mois`, color: theme.text },
                  { label: 'Plafond de retour', value: `${project.maxReturnPct}% du capital`, color: '#f59e0b' },
                  { label: 'Investissement minimum', value: `$${project.minInvestmentUsd}`, color: theme.text },
                  { label: 'Investissement maximum', value: `$${project.maxInvestmentUsd.toLocaleString()}`, color: theme.text },
                  { label: 'Occupation actuelle', value: `${project.currentOccupancy}%`, color: project.currentOccupancy >= 90 ? '#22c55e' : '#f59e0b' },
                ].map((m, i) => (
                  <View key={i} style={[s.metricBox, { backgroundColor: theme.background, borderColor: theme.outline + '15' }]}>
                    <Text style={[s.metricVal, { color: m.color }]}>{m.value}</Text>
                    <Text style={[s.metricLabel, { color: theme.onSurface + '55' }]}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Frais */}
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <Text style={[s.cardTitle, { color: theme.text }]}>Structure des frais</Text>
              {[
                ['Frais plateforme', `${(project.platformFeeBps / 100).toFixed(1)}%`],
                ['Frais de distribution', `${(project.distributionFeeBps / 100).toFixed(1)}%`],
                ['Frais de performance', `${(project.performanceFeeBps / 100).toFixed(1)}%`],
                ['KYC requis', project.kycRequired ? 'Oui' : 'Non'],
                ['Investisseurs accrédités', project.accreditedOnly ? 'Oui' : 'Non — ouvert à tous'],
              ].map(([label, value], i) => (
                <View key={i} style={[s.infoRow, { borderBottomColor: theme.outline + '10' }]}>
                  <Text style={[s.infoLabel, { color: theme.onSurface + '60' }]}>{label}</Text>
                  <Text style={[s.infoValue, { color: theme.text }]}>{value}</Text>
                </View>
              ))}
            </View>

            {project.status === 'active' && (
              <TouchableOpacity
                style={[s.ctaBtn, { backgroundColor: '#10b981' }]}
                onPress={() => router.push({ pathname: '/invest/rst/subscribe', params: { projectId: project.projectId } } as any)}
              >
                <MaterialCommunityIcons name="home-plus" size={20} color="#fff" />
                <Text style={s.ctaBtnText}>Investir — recevoir des loyers</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── Onglet 1 : Distributions ── */}
        {tab === 1 && (
          <>
            {distributions.length === 0 ? (
              <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20', alignItems: 'center', padding: 30 }]}>
                <MaterialCommunityIcons name="cash-clock" size={44} color={theme.onSurface + '30'} />
                <Text style={[s.emptyTitle, { color: theme.text }]}>Aucune distribution</Text>
                <Text style={[{ color: theme.onSurface + '55', fontSize: 13, textAlign: 'center' }]}>
                  Les distributions commenceront après le financement complet du projet.
                </Text>
              </View>
            ) : distributions.map((d, i) => (
              <View key={i} style={[s.distCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <View style={s.distHeader}>
                  <Text style={[s.distPeriod, { color: theme.text }]}>{d.periodMonth}</Text>
                  <View style={[s.distBadge, { backgroundColor: '#10b981' + '18' }]}>
                    <Text style={[s.distBadgeText, { color: '#10b981' }]}>Distribuée</Text>
                  </View>
                </View>
                <View style={s.distStats}>
                  <View style={s.distStat}>
                    <Text style={[s.distStatVal, { color: theme.text }]}>${d.grossRentCollected.toLocaleString()}</Text>
                    <Text style={[s.distStatLabel, { color: theme.onSurface + '55' }]}>Loyer collecté</Text>
                  </View>
                  <View style={s.distStat}>
                    <Text style={[s.distStatVal, { color: '#10b981' }]}>${d.netDistributable.toLocaleString()}</Text>
                    <Text style={[s.distStatLabel, { color: theme.onSurface + '55' }]}>Montant net</Text>
                  </View>
                  <View style={s.distStat}>
                    <Text style={[s.distStatVal, { color: '#6366f1' }]}>${d.perTokenAmount.toFixed(4)}</Text>
                    <Text style={[s.distStatLabel, { color: theme.onSurface + '55' }]}>Par token</Text>
                  </View>
                  <View style={s.distStat}>
                    <Text style={[s.distStatVal, { color: theme.text }]}>{d.occupancyRate}%</Text>
                    <Text style={[s.distStatLabel, { color: theme.onSurface + '55' }]}>Occupation</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Onglet 2 : IA & Assurance ── */}
        {tab === 2 && (
          <>
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <View style={s.cardTitleRow}>
                <MaterialCommunityIcons name="robot" size={16} color={theme.primary} />
                <Text style={[s.cardTitle, { color: theme.text }]}>Analyse IA du projet</Text>
              </View>
              {[
                ['Score de risque IA', `${project.aiRiskScore.toFixed(1)} / 10`, project.aiRiskScore <= 3 ? '#22c55e' : project.aiRiskScore <= 6 ? '#f59e0b' : '#ef4444'],
                ['Yield adaptatif IA', `${project.adaptiveYield.toFixed(1)}%`, '#10b981'],
                ['Part recommandée', `${project.aiRecommendedShare}%`, theme.text],
                ['Score ESG', `${project.esgScore} / 100`, '#6366f1'],
                ['Occupation prédite', `${project.currentOccupancy}%`, '#22c55e'],
              ].map(([label, value, color], i) => (
                <View key={i} style={[s.infoRow, { borderBottomColor: theme.outline + '10' }]}>
                  <Text style={[s.infoLabel, { color: theme.onSurface + '60' }]}>{label}</Text>
                  <Text style={[s.infoValue, { color: color as string }]}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <View style={s.cardTitleRow}>
                <MaterialCommunityIcons name="shield-home" size={16} color="#f59e0b" />
                <Text style={[s.cardTitle, { color: theme.text }]}>Assurance vacance locative</Text>
              </View>
              <View style={[s.insuranceBox, { backgroundColor: '#f59e0b' + '10', borderColor: '#f59e0b' + '25' }]}>
                <Text style={[s.insuranceText, { color: theme.onSurface + '80' }]}>
                  Ce projet inclut une <Text style={{ fontWeight: '800' }}>assurance vacance locative</Text>.
                  Si le taux d'occupation descend sous un seuil défini, la réserve d'assurance complète automatiquement la distribution mensuelle.
                  Les sinistres (dommages, impayés) peuvent aussi être couverts via vote des détenteurs de tokens.
                </Text>
              </View>
              {[
                { icon: 'home-off', text: 'Couverture vacance locative', color: '#f59e0b' },
                { icon: 'shield-account', text: 'Couverture impayés de loyer', color: '#f59e0b' },
                { icon: 'wrench', text: 'Couverture dommages (sur vote)', color: '#f59e0b' },
              ].map((d, i) => (
                <View key={i} style={s.rightRow}>
                  <MaterialCommunityIcons name={d.icon as any} size={16} color={d.color} />
                  <Text style={[s.rightText, { color: theme.onSurface + '80' }]}>{d.text}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const DEMO_RST: RSTProject = {
  id: '1', projectId: 'rst-001', ownerId: 'owner-1',
  propertyId: 'prop-10', propertyAddress: 'Cité SIPOA Lot 45, Dakar',
  propertyType: 'residential', estimatedValueUsd: 180000,
  targetAmountUsd: 50000, raisedAmountUsd: 32000,
  minInvestmentUsd: 500, maxInvestmentUsd: 10000,
  revenueSharePct: 60, durationMonths: 24,
  targetAnnualYield: 11.2, maxReturnPct: 130,
  baseMonthlyRent: 1200, platformFeeBps: 300,
  distributionFeeBps: 100, performanceFeeBps: 1000,
  totalInvestors: 28, totalRstIssued: 32000,
  currentOccupancy: 94, adaptiveYield: 11.8,
  esgScore: 72, aiRiskScore: 3.2, aiRecommendedShare: 55,
  status: 'active', kycRequired: true, accreditedOnly: false,
  jurisdiction: 'Senegal', campaignStart: '2026-01-15',
  campaignEnd: '2026-04-15', createdAt: '2026-01-10', updatedAt: '2026-03-01',
};

const DEMO_DIST: RSTDistribution[] = [
  {
    id: 'd1', distributionId: 'dist-001', projectId: 'rst-001',
    periodMonth: 'Février 2026', grossRentCollected: 1200, occupancyRate: 94,
    platformFee: 36, distributionFee: 12, performanceFee: 72, insuranceReserve: 60,
    netDistributable: 1020, perTokenAmount: 0.031875, totalHolders: 28,
    distributedAt: '2026-03-01',
  },
];

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800' },
  headerSub: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, position: 'relative' },
  tabText: { fontSize: 13, fontWeight: '700' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, borderRadius: 1 },
  modelCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  modelCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modelCardTitle: { fontSize: 14, fontWeight: '800' },
  modelCardText: { fontSize: 13, lineHeight: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: '800' },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12 },
  progressPct: { fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressSub: { fontSize: 10, marginTop: 4 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricBox: { width: '47%', borderRadius: 10, borderWidth: 1, padding: 10, gap: 4, alignItems: 'center' },
  metricVal: { fontSize: 15, fontWeight: '800' },
  metricLabel: { fontSize: 10, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1 },
  infoLabel: { fontSize: 12, flex: 1 },
  infoValue: { fontSize: 12, fontWeight: '700' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: 26 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  distCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  distHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distPeriod: { fontSize: 14, fontWeight: '800' },
  distBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  distBadgeText: { fontSize: 11, fontWeight: '700' },
  distStats: { flexDirection: 'row' },
  distStat: { flex: 1, alignItems: 'center' },
  distStatVal: { fontSize: 13, fontWeight: '800' },
  distStatLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  insuranceBox: { borderRadius: 10, borderWidth: 1, padding: 12 },
  insuranceText: { fontSize: 12, lineHeight: 18 },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  rightText: { flex: 1, fontSize: 13 },
});
