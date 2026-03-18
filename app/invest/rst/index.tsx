import React, { useState, useEffect } from 'react';
import {
  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, RSTProject } from '@/services/api/microservicesApi';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const DEMO_RST: RSTProject[] = [
  {
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
  },
];

type Filter = 'all' | 'active' | 'distributing' | 'funded' | 'completed';

export default function RSTIndex() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const api = getMicroservicesApi();

  const [projects, setProjects] = useState<RSTProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getRSTProjects();
        setProjects(data.length > 0 ? data : DEMO_RST);
      } catch {
        setProjects(DEMO_RST);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('invest.rstFilterAll') },
    { key: 'active', label: t('invest.rstFilter1') },
    { key: 'distributing', label: t('invest.rstFilter2') },
    { key: 'funded', label: t('invest.rstFilter3') },
    { key: 'completed', label: t('invest.rstFilter4') },
  ];

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>{t('invest.rstTitle')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{t('invest.rstSubtitle')}</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Model Banner */}
      <ThemedView style={[s.banner, { backgroundColor: '#10B981' + '10', borderColor: '#10B981' + '30' }]}>
        <ThemedText type="body" style={{ color: '#10B981', fontWeight: '700', fontSize: 12 }}>{t('invest.rstModel')}</ThemedText>
        <ThemedText type="body" style={{ color: theme.text, fontSize: 12, marginTop: 2 }}>{t('invest.rstModelDesc')}</ThemedText>
      </ThemedView>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.chip, { backgroundColor: filter === f.key ? theme.primary : theme.surface, borderColor: filter === f.key ? theme.primary : theme.outline + '30' }]}
            onPress={() => setFilter(f.key)}
          >
            <ThemedText type="body" style={{ color: filter === f.key ? '#fff' : theme.text, fontSize: 13, fontWeight: '600' }}>
              {f.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Projects */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {filtered.length === 0 ? (
          <ThemedView style={[s.empty, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="home-city" size={48} color={theme.onSurface + '30'} />
            <ThemedText type="body" style={{ color: theme.onSurface + '60' }}>{t('invest.noProject')}</ThemedText>
          </ThemedView>
        ) : (
          filtered.map(project => {
            const progress = Math.min(100, Math.round((project.raisedAmountUsd / project.targetAmountUsd) * 100));
            return (
              <TouchableOpacity
                key={project.projectId}
                style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}
                onPress={() => router.push({ pathname: '/invest/[projectId]', params: { projectId: project.projectId } } as any)}
                activeOpacity={0.85}
              >
                {/* Status */}
                <ThemedView style={[s.statusRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <ThemedView style={[s.statusBadge, { backgroundColor: project.status === 'active' ? '#10B98118' : theme.outline + '15' }]}>
                    <ThemedText type="body" style={{ color: project.status === 'active' ? '#10B981' : theme.onSurface + '60', fontSize: 11, fontWeight: '700' }}>
                      {project.status.toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>{project.propertyType}</ThemedText>
                </ThemedView>

                <ThemedText type="normaltitle" style={[s.address, { color: theme.text }]}>{project.propertyAddress}</ThemedText>

                {/* Key stats row */}
                <ThemedView style={[s.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {[
                    { label: t('invest.targetYield'), value: `${project.targetAnnualYield}%`, color: '#10B981' },
                    { label: t('invest.rentShare'), value: `${project.revenueSharePct}%`, color: theme.primary },
                    { label: t('invest.minInvest'), value: `$${project.minInvestmentUsd.toLocaleString()}`, color: theme.text },
                  ].map((st, i) => (
                    <ThemedView key={i} style={{ alignItems: 'center', flex: 1 }}>
                      <ThemedText type="normaltitle" style={{ color: st.color, fontWeight: '900', fontSize: 15 }}>{st.value}</ThemedText>
                      <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 10 }}>{st.label}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>

                {/* Progress bar */}
                <ThemedView style={{ gap: 6 }}>
                  <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                      ${project.raisedAmountUsd.toLocaleString()} {t('invest.raised')}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>{progress}%</ThemedText>
                  </ThemedView>
                  <ThemedView style={[s.track, { backgroundColor: theme.outline + '25' }]}>
                    <ThemedView style={[s.fill, { width: `${progress}%` as any, backgroundColor: theme.primary }]} />
                  </ThemedView>
                  <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>
                      {project.totalInvestors} {t('invest.investorCount')}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>
                      {t('invest.duration')}: {project.durationMonths} mois
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={[s.cta, { backgroundColor: project.status === 'active' ? theme.primary : theme.outline + '20' }]}>
                  <ThemedText type="body" style={{ color: project.status === 'active' ? '#fff' : theme.onSurface + '50', fontWeight: '700', fontSize: 13 }}>
                    {project.status === 'active' ? t('invest.investBtn') : t('invest.subscriptionClosed')}
                  </ThemedText>
                  {project.status === 'active' && <Ionicons name="arrow-forward" size={14} color="#fff" />}
                </ThemedView>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  banner: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  filterBar: { flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  empty: { alignItems: 'center', gap: 12, padding: 48, borderRadius: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  statusRow: { alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  address: { fontWeight: '800', fontSize: 15 },
  statsRow: { justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderRadius: 21 },
});
