import React, { useState, useEffect } from 'react';
import {
  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi, RECVault } from '@/services/api/microservicesApi';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const DEMO_VAULTS: RECVault[] = [
  {
    vaultId: 'vault-001', userId: 'demo', collateralToken: 'RST-PARIS-001',
    collateralAmount: 5000, collateralValueUsd: 5000,
    recMinted: 2500, ltvApplied: 0.5, collateralizationRatio: 200,
    liquidationThreshold: 130, status: 'active',
    openedAt: '2026-02-15',
  },
];

export default function RECIndex() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const api = getMicroservicesApi();

  const [vaults, setVaults] = useState<RECVault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getMyVaults(user?.id);
        setVaults(data.length > 0 ? data : DEMO_VAULTS);
      } catch {
        setVaults(DEMO_VAULTS);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  const totalCollateral = vaults.reduce((s, v) => s + (v.collateralValueUsd ?? v.collateralAmount * (v.collateralPriceUsd ?? 1)), 0);
  const totalRec = vaults.reduce((s, v) => s + v.recMinted, 0);
  const avgRatio = vaults.length > 0
    ? Math.round(vaults.reduce((s, v) => s + v.collateralizationRatio, 0) / vaults.length)
    : 0;

  const getRatioColor = (ratio: number) => {
    if (ratio >= 200) return '#10B981';
    if (ratio >= 150) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <ThemedView>
          <ThemedText type="normaltitle" style={[s.headerTitle, { color: theme.text }]}>{t('rec.title')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{t('rec.subtitle')}</ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={[s.openBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/rec/open' as any)}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <ThemedText type="body" style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>
            {t('rec.openVaultBtn')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Info Banner */}
        <ThemedView style={[s.infoBanner, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="information" size={20} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.text, fontSize: 13, flex: 1, lineHeight: 18 }}>
            {t('rec.explainText')}
          </ThemedText>
        </ThemedView>

        {/* Global Stats */}
        {vaults.length > 0 && (
          <ThemedView style={[s.statsRow]}>
            {[
              { label: t('rec.totalCollateral'), value: `$${totalCollateral.toLocaleString()}`, color: theme.primary },
              { label: t('rec.recMinted'), value: `${totalRec.toLocaleString()} REC`, color: '#10B981' },
              { label: t('rec.avgRatio'), value: `${avgRatio}%`, color: getRatioColor(avgRatio) },
            ].map((st, i) => (
              <ThemedView key={i} style={[s.statCard, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
                <ThemedText type="normaltitle" style={{ color: st.color, fontWeight: '900', fontSize: 14 }}>{st.value}</ThemedText>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 10, textAlign: 'center' }}>{st.label}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Vaults */}
        <ThemedText type="normaltitle" style={[s.sectionTitle, { color: theme.text }]}>{t('rec.myVaults')}</ThemedText>

        {vaults.length === 0 ? (
          <ThemedView style={[s.empty, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            <MaterialCommunityIcons name="safe" size={48} color={theme.onSurface + '30'} />
            <ThemedText type="normaltitle" style={{ color: theme.text }}>{t('rec.noVault')}</ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '60', textAlign: 'center', fontSize: 13 }}>
              {t('rec.noVaultDesc')}
            </ThemedText>
            <TouchableOpacity
              style={[s.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/rec/open' as any)}
            >
              <ThemedText type="body" style={{ color: '#fff', fontWeight: '700' }}>{t('rec.openVaultBtn')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          vaults.map(vault => {
            const ratioColor = getRatioColor(vault.collateralizationRatio);
            const progress = Math.min(100, Math.max(0, ((vault.collateralizationRatio - 100) / 200) * 100));

            return (
              <ThemedView key={vault.vaultId} style={[s.vaultCard, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
                <ThemedView style={[s.vaultHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <ThemedView style={[s.tokenBadge, { backgroundColor: theme.primary + '12' }]}>
                    <MaterialCommunityIcons name="coin" size={16} color={theme.primary} />
                    <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>
                      {vault.collateralToken}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={[s.statusBadge, { backgroundColor: vault.status === 'active' ? '#10B98115' : '#EF444415' }]}>
                    <ThemedText type="body" style={{ color: vault.status === 'active' ? '#10B981' : '#EF4444', fontWeight: '700', fontSize: 11 }}>
                      {vault.status.toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={s.vaultRow}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>
                    {t('rec.collateralTokens')}
                  </ThemedText>
                  <ThemedText type="body" style={{ color: theme.text, fontWeight: '700' }}>
                    {vault.collateralAmount.toLocaleString()} / ${(vault.collateralValueUsd ?? vault.collateralAmount * (vault.collateralPriceUsd ?? 1)).toLocaleString()}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={s.vaultRow}>
                  <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{t('rec.recMinted')}</ThemedText>
                  <ThemedText type="body" style={{ color: '#10B981', fontWeight: '700' }}>
                    {vault.recMinted.toLocaleString()} REC
                  </ThemedText>
                </ThemedView>

                {/* Health bar */}
                <ThemedView style={{ gap: 6 }}>
                  <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 12 }}>
                      {t('rec.avgRatio')}: {vault.collateralizationRatio}%
                    </ThemedText>
                    <ThemedText type="body" style={{ color: ratioColor, fontSize: 12, fontWeight: '700' }}>
                      {vault.collateralizationRatio >= 200 ? t('rec.safe') : `${t('rec.liquidation')}: ${vault.liquidationThreshold}%`}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={[s.track, { backgroundColor: theme.outline + '25' }]}>
                    <ThemedView style={[s.fill, { width: `${progress}%` as any, backgroundColor: ratioColor }]} />
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontWeight: '900' },
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 22 },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1 },
  sectionTitle: { fontWeight: '800' },
  empty: { alignItems: 'center', gap: 12, padding: 32, borderRadius: 14, borderWidth: 1 },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 22, marginTop: 4 },
  vaultCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  vaultHeader: { alignItems: 'center', gap: 8 },
  tokenBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  vaultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
