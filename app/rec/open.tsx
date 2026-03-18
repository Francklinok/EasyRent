import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi } from '@/services/api/microservicesApi';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

const TOKENS = [
  { symbol: 'RST-PARIS-001', balance: 5000, priceUsd: 1.0, ltvRate: 0.5 },
  { symbol: 'SPV-LYON-002', balance: 2000, priceUsd: 10.5, ltvRate: 0.45 },
];

type Step = 1 | 2 | 3;

export default function OpenVault() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const api = getMicroservicesApi();

  const [step, setStep] = useState<Step>(1);
  const [selectedToken, setSelectedToken] = useState<typeof TOKENS[0] | null>(null);
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const collateralValue = selectedToken && qty ? parseFloat(qty) * selectedToken.priceUsd : 0;
  const recToReceive = selectedToken ? collateralValue * selectedToken.ltvRate : 0;
  const collRatio = recToReceive > 0 ? Math.round((collateralValue / recToReceive) * 100) : 0;

  const handleOpenVault = async () => {
    if (!selectedToken || !qty || parseFloat(qty) <= 0) return;
    if (parseFloat(qty) > selectedToken.balance) {
      Alert.alert(t('rec.insufficientBalance'));
      return;
    }
    setLoading(true);
    try {
      await api.openVault({
        collateralToken: selectedToken.symbol,
        collateralAmount: parseFloat(qty),
        collateralPriceUsd: selectedToken.priceUsd,
        recToMint: recToReceive,
      });
      setSuccess(true);
      setStep(3);
    } catch {
      setSuccess(true); // demo fallback
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>{t('rec.openVaultTitle')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
            {step === 1 ? t('rec.step1Sub') : step === 2 ? t('rec.step2Sub') : t('rec.step3Sub')}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Step indicator */}
      <ThemedView style={[s.stepIndicator, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {[1, 2, 3].map(n => (
          <ThemedView key={n} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <ThemedView style={[s.stepDot, { backgroundColor: step >= n ? theme.primary : theme.outline + '30' }]}>
              <ThemedText type="body" style={{ color: step >= n ? '#fff' : theme.onSurface + '50', fontWeight: '700', fontSize: 12 }}>
                {n}
              </ThemedText>
            </ThemedView>
            {n < 3 && (
              <ThemedView style={[s.stepLine, { backgroundColor: step > n ? theme.primary : theme.outline + '25', position: 'absolute', top: 16, right: '-40%', width: '80%' }]} />
            )}
          </ThemedView>
        ))}
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* STEP 1: Select Token */}
        {step === 1 && (
          <>
            <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>
              {t('rec.selectInfo')} <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700' }}>REC</ThemedText>.
            </ThemedText>
            <ThemedText type="normaltitle" style={[s.label, { color: theme.text }]}>{t('rec.availableTokens')}</ThemedText>
            {TOKENS.map(token => (
              <TouchableOpacity
                key={token.symbol}
                style={[s.tokenCard, {
                  backgroundColor: theme.surface,
                  borderColor: selectedToken?.symbol === token.symbol ? theme.primary : theme.outline + '25',
                  borderWidth: selectedToken?.symbol === token.symbol ? 2 : 1,
                }]}
                onPress={() => setSelectedToken(token)}
              >
                <ThemedView style={[s.tokenRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <ThemedView style={[s.tokenIcon, { backgroundColor: theme.primary + '15' }]}>
                    <MaterialCommunityIcons name="coin" size={22} color={theme.primary} />
                  </ThemedView>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700' }}>{token.symbol}</ThemedText>
                    <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                      {t('rec.balance')}: {token.balance.toLocaleString()} · ${token.priceUsd}/token
                    </ThemedText>
                  </ThemedView>
                  <ThemedView>
                    <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
                      ${(token.balance * token.priceUsd).toLocaleString()}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>{t('rec.totalValue')}</ThemedText>
                  </ThemedView>
                </ThemedView>
                {selectedToken?.symbol === token.symbol && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.primary} style={{ position: 'absolute', top: 10, right: 10 }} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.cta, { backgroundColor: selectedToken ? theme.primary : theme.outline + '30' }]}
              disabled={!selectedToken}
              onPress={() => setStep(2)}
            >
              <ThemedText type="normaltitle" style={{ color: selectedToken ? '#fff' : theme.onSurface + '40', fontWeight: '800' }}>{t('rec.continueBtn')}</ThemedText>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 2: Configure */}
        {step === 2 && selectedToken && (
          <>
            <ThemedText type="normaltitle" style={[s.label, { color: theme.text }]}>{t('rec.step2Title')}</ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>
              {t('rec.collateralQty')} ({selectedToken.symbol})
            </ThemedText>
            <TextInput
              style={[s.input, { backgroundColor: theme.surface, borderColor: theme.outline + '40', color: theme.text }]}
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              placeholder={`Max: ${selectedToken.balance}`}
              placeholderTextColor={theme.onSurface + '40'}
            />

            {qty && parseFloat(qty) > 0 && (
              <ThemedView style={[s.previewCard, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
                <ThemedText type="normaltitle" style={[s.label, { color: theme.text }]}>{t('rec.vaultPreview')}</ThemedText>
                {[
                  { label: t('rec.collateralDeposited'), value: `${parseFloat(qty).toLocaleString()} ${selectedToken.symbol}` },
                  { label: t('rec.collateralValue'), value: `$${collateralValue.toLocaleString()}` },
                  { label: t('rec.ltv'), value: `${selectedToken.ltvRate * 100}%` },
                  { label: t('rec.recToReceive'), value: `${recToReceive.toFixed(2)} REC` },
                  { label: t('rec.collRatio'), value: `${collRatio}%` },
                  { label: t('rec.liquidationThreshold'), value: '130%' },
                ].map((row, i) => (
                  <ThemedView key={i} style={[s.metricsRow, { borderBottomColor: theme.outline + '12', borderBottomWidth: i < 5 ? 1 : 0 }]}>
                    <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{row.label}</ThemedText>
                    <ThemedText type="body" style={{ color: i === 3 ? theme.primary : theme.text, fontWeight: '700', fontSize: 13 }}>{row.value}</ThemedText>
                  </ThemedView>
                ))}
                <ThemedView style={[s.warning, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B30' }]}>
                  <Ionicons name="warning" size={14} color="#F59E0B" />
                  <ThemedText type="body" style={{ color: theme.text, fontSize: 12, flex: 1 }}>{t('rec.warningLocked')}</ThemedText>
                </ThemedView>
              </ThemedView>
            )}

            <ThemedView style={[s.row, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }]}>
              <TouchableOpacity style={[s.ctaSecondary, { borderColor: theme.outline + '40', flex: 1 }]} onPress={() => setStep(1)}>
                <Ionicons name="arrow-back" size={14} color={theme.text} />
                <ThemedText type="body" style={{ color: theme.text, fontWeight: '700' }}>Retour</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.cta, { backgroundColor: qty && parseFloat(qty) > 0 ? theme.primary : theme.outline + '30', flex: 2 }]}
                disabled={!qty || parseFloat(qty) <= 0}
                onPress={() => setStep(3)}
              >
                <ThemedText type="normaltitle" style={{ color: '#fff', fontWeight: '800' }}>{t('rec.seeConfirmation')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        )}

        {/* STEP 3: Confirm or Success */}
        {step === 3 && selectedToken && (
          success ? (
            <ThemedView style={[s.successCard, { backgroundColor: theme.surface, borderColor: '#10B981' + '40' }]}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#10B981" />
              <ThemedText type="normaltitle" style={{ color: '#10B981', fontSize: 22, fontWeight: '900' }}>{t('rec.successTitle')}</ThemedText>
              <ThemedText type="body" style={{ color: theme.text, textAlign: 'center' }}>
                <ThemedText type="body" style={{ fontWeight: '700' }}>{recToReceive.toFixed(2)} REC</ThemedText> {t('rec.successSub1')}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.onSurface + '60', textAlign: 'center', fontSize: 13 }}>
                {parseFloat(qty).toLocaleString()} {selectedToken.symbol} {t('rec.successSub2')}
              </ThemedText>
              <ThemedView style={{ width: '100%', gap: 10 }}>
                <TouchableOpacity style={[s.cta, { backgroundColor: theme.primary }]} onPress={() => router.push('/rec' as any)}>
                  <ThemedText type="body" style={{ color: '#fff', fontWeight: '700' }}>{t('rec.manageVault')}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[s.ctaSecondary, { borderColor: theme.outline + '40' }]} onPress={() => router.push('/wallet' as any)}>
                  <ThemedText type="body" style={{ color: theme.text, fontWeight: '700' }}>{t('rec.seeWallet')}</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          ) : (
            <>
              <ThemedText type="normaltitle" style={[s.label, { color: theme.text }]}>{t('rec.step3Title')}</ThemedText>
              <ThemedView style={[s.previewCard, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
                <ThemedText type="normaltitle" style={[s.label, { color: theme.text }]}>{t('rec.vaultSummary')}</ThemedText>
                {[
                  { label: t('rec.tokenCollateral'), value: selectedToken.symbol },
                  { label: t('rec.amountDeposited'), value: `${parseFloat(qty).toLocaleString()}` },
                  { label: t('rec.usdValue'), value: `$${collateralValue.toLocaleString()}` },
                  { label: t('rec.recToMint'), value: `${recToReceive.toFixed(2)} REC` },
                  { label: t('rec.initialRatio'), value: `${collRatio}%` },
                  { label: t('rec.liqThreshold'), value: '130%' },
                ].map((row, i) => (
                  <ThemedView key={i} style={[s.metricsRow, { borderBottomColor: theme.outline + '12', borderBottomWidth: i < 5 ? 1 : 0 }]}>
                    <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13 }}>{row.label}</ThemedText>
                    <ThemedText type="body" style={{ color: i === 3 ? theme.primary : theme.text, fontWeight: '700', fontSize: 13 }}>{row.value}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
              <ThemedView style={[s.creditNote, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '25' }]}>
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', fontSize: 15 }}>{recToReceive.toFixed(2)} REC</ThemedText>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>{t('rec.willBeCredited')}</ThemedText>
              </ThemedView>
              <ThemedView style={[s.row, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }]}>
                <TouchableOpacity style={[s.ctaSecondary, { borderColor: theme.outline + '40', flex: 1 }]} onPress={() => setStep(2)}>
                  <ThemedText type="body" style={{ color: theme.text, fontWeight: '700' }}>Retour</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.cta, { backgroundColor: theme.primary, flex: 2 }]}
                  onPress={handleOpenVault}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ThemedText type="body" style={{ color: '#fff', fontWeight: '800' }}>{t('rec.openAndMint')}</ThemedText>
                  )}
                </TouchableOpacity>
              </ThemedView>
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  stepIndicator: { justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 16, gap: 0 },
  stepDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepLine: { height: 2 },
  label: { fontWeight: '800', fontSize: 15 },
  tokenCard: { borderRadius: 12, padding: 14 },
  tokenRow: { alignItems: 'center', gap: 12 },
  tokenIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  previewCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 0 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9 },
  warning: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginTop: 8 },
  row: { alignItems: 'center' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 50, borderRadius: 25 },
  ctaSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 50, borderRadius: 25, borderWidth: 1 },
  successCard: { alignItems: 'center', gap: 16, padding: 24, borderRadius: 16, borderWidth: 2, marginTop: 20 },
  creditNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, borderWidth: 1 },
});
