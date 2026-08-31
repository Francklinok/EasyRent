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
    pros: [t('investIndex.spvTokenStandard'), t('invest.liquidity'), t('invest.legalStructure')],
    comparison: { ownership: '✅', revenue: '📈', risk: '⚖️', kyc: '✅' },
  },
  {
    id: 'rst',
    badge: t('invest.rstBadge'),
    title: t('invest.rstTitle'),
    subtitle: t('invest.rstSubtitle'),
    icon: 'currency-usd' as const,
    color: '#10B981',
    cardTitle: t('invest.rstCardTitle'),
    cardSubtitle: t('invest.rstCardSubtitle'),
    modelLabel: t('invest.rstModel'),
    modelDesc: t('invest.rstModelDesc'),
    target: t('invest.rstTarget'),
    ctaLabel: t('invest.investBtn'),
    route: '/invest/rst',
    pros: [t('investIndex.rstTokenStandard'), t('invest.revenue'), t('invest.returnCap')],
    comparison: { ownership: '❌', revenue: '🏠', risk: '📊', kyc: '✅' },
  },
];

const COMPARE_ROWS = (t: ReturnType<typeof useLanguage>['t']) => [
  { label: t('invest.propertyOwnership'), spv: t('investIndex.coShareholder'), rst: t('investIndex.no') },
  { label: t('invest.durationLabel'), spv: t('investIndex.unlimited'), rst: t('investIndex.duration1260') },
  { label: t('invest.revenue'), spv: t('investIndex.capitalGainDividends'), rst: t('investIndex.monthlyRents') },
  { label: t('invest.liquidity'), spv: t('investIndex.secondaryMarket'), rst: t('investIndex.lowLockup') },
  { label: t('invest.risk'), spv: t('investIndex.medium'), rst: t('investIndex.lowMedium') },
  { label: t('invest.legalStructure'), spv: t('investIndex.tokenizedShares'), rst: t('investIndex.rentClaim') },
  { label: t('invest.kycLabel'), spv: t('investIndex.yes'), rst: t('investIndex.yes') },
];

interface InvestIndexProps {
  /**
   * Rendered inline inside another screen's own SafeAreaView (e.g. the home
   * header's "Investir" tab, same mechanism as ServiceListScreen/
   * DormantLandListScreen) — skip this component's own SafeAreaView so the
   * insets aren't applied twice.
   */
  disableSafeArea?: boolean;
  /** Top padding for the content, e.g. the host header's measured height. */
  contentTopPadding?: number;
}

export default function InvestIndex({ disableSafeArea = false, contentTopPadding }: InvestIndexProps = {}) {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  const Container = disableSafeArea ? ThemedView : SafeAreaView;

  return (
    <Container style={{ flex: 1, backgroundColor: theme.surface }}>
      {!disableSafeArea && (
        <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20',backgroundColor: "transparent" }]}>
          <ThemedText type="normaltitle" style={s.headerTitle}>
            {t('invest.title')}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/wallet' as any)} style={[s.walletBtn, { backgroundColor: theme.primary + '15' }]}>
            <MaterialCommunityIcons name="wallet-outline" size={18} color={theme.primary} />
            <ThemedText type="normal" style={{ color: theme.primary, fontWeight: '700' }}>
              {t('invest.wallet')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      <ScrollView contentContainerStyle={{ padding: 15, paddingTop: contentTopPadding ?? 0, gap: 8 }}>
        {/* Hero */}
        <ThemedView style={[s.hero, { backgroundColor: "transparent", borderColor: theme.outline + '60' }]}>
          <MaterialCommunityIcons name="city" size={36} color={theme.primary} />
          <ThemedView style={{ flex: 1, backgroundColor:"transparent" }}>
            <ThemedText type="normal" >
              {t('invest.twoModels')}{' '}
              <ThemedText type="normal" style={{ color: theme.primary }}>{t('invest.twoModelsHighlight')}</ThemedText>{' '}
              {t('invest.twoModelsDesc')}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Model Cards */}
        {MODELS(t).map(m => (
          <ThemedView key={m.id} style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '65' }]}>
            <ThemedView style={[s.badge, { backgroundColor: m.color + '18' }]}>
              <ThemedText type="normal" style={[s.badgeText, { color: m.color }]}>{m.badge}</ThemedText>
            </ThemedView>

            <ThemedView style={[s.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row',backgroundColor: "transparent"}]}>
              <ThemedView style={[s.iconWrap, { backgroundColor: m.color + '15' }]}>
                <MaterialCommunityIcons name={m.icon} size={28} color={m.color} />
              </ThemedView>
              <ThemedView style={{ flex: 1,backgroundColor: "transparent" }}>
                <ThemedText type="normaltitle" style={[s.cardTitle, { color: theme.text }]}>{m.title}</ThemedText>
                <ThemedText type="body" intensity="light">{m.subtitle}</ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={[s.descBox, { backgroundColor: m.color + '0A', borderColor: m.color + '25' }]}>
              <ThemedText type="normal" style={{ color: m.color, fontWeight: '800', marginBottom: 4 }}>{m.modelLabel}</ThemedText>
              <ThemedText type="body" style={{ color: theme.text, lineHeight: 20 }}>{m.modelDesc}</ThemedText>
            </ThemedView>

            <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4,backgroundColor: "transparent"}}>
              {m.pros.map((p, i) => (
                <ThemedView key={i} style={[s.chip, { backgroundColor: theme.outline + '12' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={m.color} />
                  <ThemedText type="caption" style={{ color: theme.text }}>{p}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            <ThemedView style={[s.targetRow, { backgroundColor: theme.outline + '08' }]}>
              <Ionicons name="people" size={15} color={theme.onSurface + '60'} />
              <ThemedText type="body" intensity="light">{m.target}</ThemedText>
            </ThemedView>

            <TouchableOpacity
              style={[s.cta, { backgroundColor: m.color }]}
              onPress={() => router.push(m.route as any)}
            >
              <ThemedText type="normal" style={{ color: '#fff', fontWeight: '800' }}>{m.ctaLabel}</ThemedText>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </ThemedView>
        ))}

        {/* Quick Compare */}
        <ThemedView style={[s.cmpCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText type="normaltitle" style={[s.cmpTitle, { color: theme.text }]}>{t('invest.quickComparison')}</ThemedText>
          <ThemedView style={[s.cmpHead, { backgroundColor: theme.outline + '10' }]}>
            <ThemedText type="normal" style={[s.cmpHCell, { color: theme.onSurface + '60' }]}>{t('invest.criteria')}</ThemedText>
            <ThemedText type="normal" style={[s.cmpHCell, { color: theme.secondary, textAlign: 'center' }]}>SPV</ThemedText>
            <ThemedText type="normal" style={[s.cmpHCell, { color: theme.success, textAlign: 'center' }]}>RST</ThemedText>
          </ThemedView>
          {COMPARE_ROWS(t).map((row, i) => (
            <ThemedView key={i} style={[s.cmpRow, { borderBottomColor: theme.outline + '15', backgroundColor: i % 2 === 0 ? 'transparent' : theme.outline + '05' }]}>
              <ThemedText type="body" intensity="light" style={[s.cmpCell]}>{row.label}</ThemedText>
              <ThemedText type="body" style={[s.cmpCell, { color: theme.text, textAlign: 'center' }]}>{row.spv}</ThemedText>
              <ThemedText type="body" style={[s.cmpCell, { color: theme.text, textAlign: 'center' }]}>{row.rst}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>
    </Container>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontWeight: '900' },
  walletBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, borderWidth: 1 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontWeight: '700' },
  cardHeader: { alignItems: 'center', gap: 12 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '800' },
  descBox: { borderRadius: 10, padding: 12, borderWidth: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
  cmpCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 0 },
  cmpTitle: { fontWeight: '800', marginBottom: 10 },
  cmpHead: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8, marginBottom: 4 },
  cmpHCell: { flex: 1, fontWeight: '700' },
  cmpRow: { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 4, borderBottomWidth: 1 },
  cmpCell: { flex: 1 },
});
