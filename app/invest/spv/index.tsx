import React, { useState, useEffect } from 'react';
import {
  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, SPVProject } from '@/services/api/microservicesApi';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const DEMO_SPV: SPVProject[] = [
  {
    projectId: 'spv-001', companyName: 'SCI Lumière Paris',
    propertyAddress: 'Rue du Faubourg Saint-Honoré 82, Paris',
    propertyType: 'Résidentiel Premium', estimatedValueUsd: 1200000,
    targetAmountUsd: 480000, raisedAmountUsd: 312000,
    pricePerShareUsd: 100, totalShares: 4800, sharesSold: 3120,
    minInvestmentUsd: 1000, maxInvestmentUsd: 100000,
    annualDividendYield: 6.8, tokenStandard: 'ERC-3643',
    jurisdiction: 'France', kycRequired: true,
    status: 'open',
  },
];

type Filter = 'all' | 'open' | 'full' | 'closed';

export default function SPVIndex() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const api = getMicroservicesApi();

  const [projects, setProjects] = useState<SPVProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getSPVProjects();
        setProjects(data.length > 0 ? data : DEMO_SPV);
      } catch {
        setProjects(DEMO_SPV);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('invest.rstFilterAll') },
    { key: 'open', label: t('invest.spvFilter1') },
    { key: 'full', label: t('invest.spvFilter2') },
    { key: 'closed', label: t('invest.spvFilter3') },
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
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>{t('invest.spvTitle')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{t('invest.spvSubtitle')}</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Model Banner */}
      <ThemedView style={[s.banner, { backgroundColor: '#6C63FF' + '10', borderColor: '#6C63FF' + '30' }]}>
        <ThemedText type="body" style={{ color: '#6C63FF', fontWeight: '700', fontSize: 12 }}>{t('invest.spvModel')}</ThemedText>
        <ThemedText type="body" style={{ color: theme.text, fontSize: 12, marginTop: 2 }}>{t('invest.spvModelDesc')}</ThemedText>
      </ThemedView>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.chip, { backgroundColor: filter === f.key ? '#6C63FF' : theme.surface, borderColor: filter === f.key ? '#6C63FF' : theme.outline + '30' }]}
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
            <MaterialCommunityIcons name="office-building" size={48} color={theme.onSurface + '30'} />
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
                {/* Header row */}
                <ThemedView style={[s.statusRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <ThemedView style={[s.statusBadge, { backgroundColor: project.status === 'open' ? '#6C63FF18' : theme.outline + '15' }]}>
                    <ThemedText type="body" style={{ color: project.status === 'open' ? '#6C63FF' : theme.onSurface + '60', fontSize: 11, fontWeight: '700' }}>
                      {project.status.toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>{project.tokenStandard}</ThemedText>
                </ThemedView>

                <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800' }}>{project.companyName}</ThemedText>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{project.propertyAddress}</ThemedText>

                {/* Stats */}
                <ThemedView style={[s.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {[
                    { label: t('invest.annualYield'), value: `${project.annualDividendYield}%`, color: '#10B981' },
                    { label: t('invest.pricePerShare'), value: `$${project.pricePerShareUsd}`, color: '#6C63FF' },
                    { label: t('invest.minInvestment'), value: `$${project.minInvestmentUsd.toLocaleString()}`, color: theme.text },
                  ].map((st, i) => (
                    <ThemedView key={i} style={{ alignItems: 'center', flex: 1 }}>
                      <ThemedText type="normaltitle" style={{ color: st.color, fontWeight: '900', fontSize: 15 }}>{st.value}</ThemedText>
                      <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 10 }}>{st.label}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>

                {/* Additional infos */}
                <ThemedView style={[s.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                    {project.sharesSold.toLocaleString()} / {project.totalShares.toLocaleString()} {t('invest.sharesSold')}
                  </ThemedText>
                  <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                    {t('invest.totalValuation')}: ${(project.estimatedValueUsd / 1000).toFixed(0)}k
                  </ThemedText>
                </ThemedView>

                {/* Progress */}
                <ThemedView style={{ gap: 6 }}>
                  <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                      ${project.raisedAmountUsd.toLocaleString()} {t('invest.raised')}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: '#6C63FF', fontWeight: '700', fontSize: 12 }}>{progress}%</ThemedText>
                  </ThemedView>
                  <ThemedView style={[s.track, { backgroundColor: theme.outline + '25' }]}>
                    <ThemedView style={[s.fill, { width: `${progress}%` as any, backgroundColor: '#6C63FF' }]} />
                  </ThemedView>
                </ThemedView>

                <ThemedView style={s.metaRow}>
                  {[
                    { icon: 'map-marker' as const, label: project.jurisdiction },
                    { icon: 'shield-check' as const, label: project.kycRequired ? t('invest.kycReq') : 'No KYC' },
                  ].map((m, i) => (
                    <ThemedView key={i} style={s.metaChip}>
                      <MaterialCommunityIcons name={m.icon} size={12} color={theme.onSurface + '60'} />
                      <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 11 }}>{m.label}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>

                <ThemedView style={[s.cta, { backgroundColor: project.status === 'open' ? '#6C63FF' : theme.outline + '20' }]}>
                  <ThemedText type="body" style={{ color: project.status === 'open' ? '#fff' : theme.onSurface + '50', fontWeight: '700', fontSize: 13 }}>
                    {project.status === 'open' ? t('invest.buyShares') : t('invest.subscriptionClosed')}
                  </ThemedText>
                  {project.status === 'open' && <Ionicons name="arrow-forward" size={14} color="#fff" />}
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
  statsRow: { justifyContent: 'space-between' },
  infoRow: { justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  metaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderRadius: 21 },
});
