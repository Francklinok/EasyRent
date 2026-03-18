import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const MODELS = (t: ReturnType<typeof useLanguage>['t']) => [
  {
    id: 'spv',
    badge: t('invest.spvBadge'),
    title: t('invest.spvTitle'),
    subtitle: t('invest.spvSubtitle'),
    icon: 'office-building' as const,
    color: '#6C63FF',
    cardTitle: t('invest.spvCardTitle'),
    cardSubtitle: t('invest.spvCardSubtitle'),
    modelLabel: t('invest.spvModel'),
    modelDesc: t('invest.spvModelDesc'),
    target: t('invest.spvTarget'),
    ctaLabel: t('invest.buyShares'),
    route: '/invest/spv',
    pros: ['ERC-3643 Security Token', t('invest.liquidity'), t('invest.legalStructure')],
    comparison: { ownership: '✅', revenue: '📈', risk: '⚖️', kyc: '✅' },
  },
  {
    id: 'rst',
    badge: t('invest.rstBadge'),
    title: t('invest.rstTitle'),
    subtitle: t('invest.rstSubtitle'),
    icon: 'home-currency-usd' as const,
    color: '#10B981',
    cardTitle: t('invest.rstCardTitle'),
    cardSubtitle: t('invest.rstCardSubtitle'),
    modelLabel: t('invest.rstModel'),
    modelDesc: t('invest.rstModelDesc'),
    target: t('invest.rstTarget'),
    ctaLabel: t('invest.investBtn'),
    route: '/invest/rst',
    pros: ['RST Token (ERC-20)', t('invest.revenue'), t('invest.returnCap')],
    comparison: { ownership: '❌', revenue: '🏠', risk: '📊', kyc: '✅' },
  },
];

const COMPARE_ROWS = (t: ReturnType<typeof useLanguage>['t']) => [
  { label: t('invest.propertyOwnership'), spv: 'Co-actionnaire', rst: '❌ Non' },
  { label: t('invest.durationLabel'), spv: 'Illimité', rst: '12-60 mois' },
  { label: t('invest.revenue'), spv: 'Plus-value + dividendes', rst: 'Loyers mensuels' },
  { label: t('invest.liquidity'), spv: 'Marché secondaire', rst: 'Faible (lock-up)' },
  { label: t('invest.risk'), spv: 'Moyen', rst: 'Faible-Moyen' },
  { label: t('invest.legalStructure'), spv: 'Actions tokenisées', rst: 'Créance loyer' },
  { label: t('invest.kycLabel'), spv: '✅ Oui', rst: '✅ Oui' },
];

export default function InvestIndex() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <ThemedText type="normaltitle" style={[s.headerTitle, { color: theme.text }]}>
          {t('invest.title')}
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('/wallet' as any)} style={[s.walletBtn, { backgroundColor: theme.primary + '15' }]}>
          <MaterialCommunityIcons name="wallet-outline" size={18} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
            {t('invest.wallet')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {/* Hero */}
        <ThemedView style={[s.hero, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <MaterialCommunityIcons name="city" size={36} color={theme.primary} />
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="normaltitle" style={{ color: theme.text }}>
              {t('invest.twoModels')}{' '}
              <ThemedText type="normaltitle" style={{ color: theme.primary }}>{t('invest.twoModelsHighlight')}</ThemedText>{' '}
              {t('invest.twoModelsDesc')}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Model Cards */}
        {MODELS(t).map(m => (
          <ThemedView key={m.id} style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
            <ThemedView style={[s.badge, { backgroundColor: m.color + '18' }]}>
              <ThemedText type="body" style={[s.badgeText, { color: m.color }]}>{m.badge}</ThemedText>
            </ThemedView>

            <ThemedView style={[s.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <ThemedView style={[s.iconWrap, { backgroundColor: m.color + '15' }]}>
                <MaterialCommunityIcons name={m.icon} size={28} color={m.color} />
              </ThemedView>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText type="normaltitle" style={[s.cardTitle, { color: theme.text }]}>{m.title}</ThemedText>
                <ThemedText type="body" style={[s.cardSubtit, { color: theme.onSurface + '70' }]}>{m.subtitle}</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={[s.descBox, { backgroundColor: m.color + '0A', borderColor: m.color + '25' }]}>
              <ThemedText type="body" style={{ color: m.color, fontWeight: '800', marginBottom: 4 }}>{m.modelLabel}</ThemedText>
              <ThemedText type="body" style={{ color: theme.text, lineHeight: 20 }}>{m.modelDesc}</ThemedText>
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {m.pros.map((p, i) => (
                <ThemedView key={i} style={[s.chip, { backgroundColor: theme.outline + '12' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={m.color} />
                  <ThemedText type="body" style={{ color: theme.text, fontSize: 12 }}>{p}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            <ThemedView style={[s.targetRow, { backgroundColor: theme.outline + '08' }]}>
              <Ionicons name="people" size={15} color={theme.onSurface + '60'} />
              <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{m.target}</ThemedText>
            </ThemedView>

            <TouchableOpacity
              style={[s.cta, { backgroundColor: m.color }]}
              onPress={() => router.push(m.route as any)}
            >
              <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{m.ctaLabel}</ThemedText>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </ThemedView>
        ))}

        {/* Quick Compare */}
        <ThemedView style={[s.cmpCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText type="normaltitle" style={[s.cmpTitle, { color: theme.text }]}>{t('invest.quickComparison')}</ThemedText>
          <ThemedView style={[s.cmpHead, { backgroundColor: theme.outline + '10' }]}>
            <ThemedText type="body" style={[s.cmpHCell, { color: theme.onSurface + '60' }]}>{t('invest.criteria')}</ThemedText>
            <ThemedText type="body" style={[s.cmpHCell, { color: '#6C63FF', textAlign: 'center' }]}>SPV</ThemedText>
            <ThemedText type="body" style={[s.cmpHCell, { color: '#10B981', textAlign: 'center' }]}>RST</ThemedText>
          </ThemedView>
          {COMPARE_ROWS(t).map((row, i) => (
            <ThemedView key={i} style={[s.cmpRow, { borderBottomColor: theme.outline + '15', backgroundColor: i % 2 === 0 ? 'transparent' : theme.outline + '05' }]}>
              <ThemedText type="body" style={[s.cmpCell, { color: theme.onSurface + '70' }]}>{row.label}</ThemedText>
              <ThemedText type="body" style={[s.cmpCell, { color: theme.text, textAlign: 'center' }]}>{row.spv}</ThemedText>
              <ThemedText type="body" style={[s.cmpCell, { color: theme.text, textAlign: 'center' }]}>{row.rst}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontWeight: '900' },
  walletBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, borderWidth: 1 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardHeader: { alignItems: 'center', gap: 12 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  cardSubtit: { fontSize: 13 },
  descBox: { borderRadius: 10, padding: 12, borderWidth: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
  cmpCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 0 },
  cmpTitle: { fontWeight: '800', marginBottom: 10 },
  cmpHead: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8, marginBottom: 4 },
  cmpHCell: { flex: 1, fontSize: 12, fontWeight: '700' },
  cmpRow: { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 4, borderBottomWidth: 1 },
  cmpCell: { flex: 1, fontSize: 12 },
});
