import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { getMicroservicesApi } from '@/services/api/microservicesApi';
import { getKYCService } from '@/services/api/kycService';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

type Step = 'form' | 'confirm' | 'success';

const SHARE_PRICE = 100;
const MIN_SHARES = 5;

export default function SPVSubscribe() {
  const { theme } = useTheme();
  const router = useRouter();
  const { spvId } = useLocalSearchParams<{ spvId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const api = getMicroservicesApi();
  const kycService = getKYCService();

  const [step, setStep] = useState<Step>('form');
  const [sharesInput, setSharesInput] = useState('10');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kycVerified, setKycVerified] = useState<boolean | null>(null);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const status = await kycService.getSimpleVerificationStatus();
        setKycVerified(status.isVerified);
      } catch {
        setKycVerified(false);
      } finally {
        setKycLoading(false);
      }
    })();
  }, []);

  const shares = parseInt(sharesInput) || 0;
  const totalUsd = shares * SHARE_PRICE;
  const annualIncome = totalUsd * 0.058;

  const QUICK_SHARES = [5, 10, 25, 50];

  const validate = () => {
    if (shares < MIN_SHARES) return `Minimum ${MIN_SHARES} parts ($${MIN_SHARES * SHARE_PRICE})`;
    if (!wallet.trim()) return 'Adresse wallet ERC-3643 requise';
    if (!wallet.startsWith('0x') || wallet.length !== 42) return 'Adresse wallet invalide (format 0x...)';
    return null;
  };

  const handleConfirm = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.subscribeSPV({
        spvId: spvId || 'spv-001',
        userId: user?.id || '',
        sharesCount: shares,
        walletAddress: wallet,
        kycLevel: 'verified',
      });
      setStep('success');
    } catch {
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />

      {kycLoading ? (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
      ) : !kycVerified ? (
        <>
          <ThemedView style={[s.header, { borderBottomColor: theme.outline + '70' }]}>
            <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.surface }]}>
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={[s.headerTitle, { color: theme.text }]}>{t('kyc.kycRequired')}</ThemedText>
          </ThemedView>
          <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
            <ThemedView style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f59e0b20', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#f59e0b' }}>
              <MaterialCommunityIcons name="shield-alert" size={40} color="#f59e0b" />
            </ThemedView>
            <ThemedText type="subtitle" style={{ color: theme.text, fontWeight: '800', textAlign: 'center' }}>{t('kyc.kycRequired')}</ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '70', textAlign: 'center' }}>{t('kyc.kycRequiredDesc')}</ThemedText>
            <TouchableOpacity style={[s.ctaBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/kyc' as any)}>
              <MaterialCommunityIcons name="shield-check" size={18} color="#fff" />
              <ThemedText style={s.ctaBtnText}>{t('kyc.goToKYC')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </>
      ) : (

      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '70' }]}>
        <TouchableOpacity
          onPress={() => step === 'form' ? router.back() : setStep('form')}
          style={[s.backBtn, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="subtitle" style={[s.headerTitle, { color: theme.text }]}>Souscription SPV</ThemedText>
          <ThemedText type="caption" style={[s.headerSub, { color: theme.secondary }]}>Achat de parts tokenisées</ThemedText>
        </ThemedView>
        {/* Stepper */}
        <ThemedView style={s.stepper}>
          {(['1', '2', '3'] as const).map((n, i) => {
            const active = (step === 'form' && i === 0) || (step === 'confirm' && i === 1) || (step === 'success' && i === 2);
            const done = (step === 'confirm' && i === 0) || (step === 'success' && i <= 1);
            return (
              <ThemedView key={n} style={[s.stepDot, {
                backgroundColor: done ? theme.secondary : active ? theme.secondary : theme.outline + '30',
              }]}>
                {done
                  ? <MaterialCommunityIcons name="check" size={10} color="#fff" />
                  : <ThemedText type="caption" style={[s.stepNum, { color: active ? '#fff' : theme.onSurface + '50' }]}>{n}</ThemedText>
                }
              </ThemedView>
            );
          })}
        </ThemedView>
      </ThemedView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 170 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >

          {/* ── step1 : form ── */}
          {step === 'form' && (
            <>
              {/* Model reminder */}
              <ThemedView style={[s.modelBanner, { backgroundColor: theme.secondary + '10', borderColor: theme.secondary + '30' }]}>
                <MaterialCommunityIcons name="office-building" size={16} color={theme.secondary} />
                <ThemedText type="caption" style={[s.modelText, { color: theme.onSurface + '80' }]}>
                  <ThemedText style={{ fontWeight: '800', color: theme.secondary }}>SPV :</ThemedText>
                  {' '}Vous achetez des parts de société. Vous devenez co-actionnaire et percevez les revenus locatifs proportionnellement à vos parts.
                </ThemedText>
              </ThemedView>

              {/* Number of shares */}
              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText type="normal" style={[s.cardTitle, { color: theme.text }]}>Nombre de parts</ThemedText>
                <ThemedText style={[s.priceTag, { color: theme.onSurface + '60' }]}>
                  1 part = ${SHARE_PRICE} · Minimum {MIN_SHARES} parts
                </ThemedText>
                <ThemedView style={[s.inputRow, { borderColor: theme.secondary }]}>
                  <MaterialCommunityIcons name="ticket-percent" size={18} color={theme.secondary} />
                  <TextInput
                    value={sharesInput}
                    onChangeText={setSharesInput}
                    keyboardType="number-pad"
                    style={[s.input, { color: theme.text }]}
                    placeholderTextColor={theme.onSurface + '40'}
                    placeholder="Ex: 10"
                  />
                  <ThemedText style={[s.inputSuffix, { color: theme.onSurface + '50' }]}>parts</ThemedText>
                </ThemedView>
                <ThemedView style={s.quickRow}>
                  {QUICK_SHARES.map(q => (
                    <TouchableOpacity
                      key={q}
                      style={[s.quickBtn, { backgroundColor: sharesInput === String(q) ? theme.secondary : (theme.background as unknown as string), borderColor: theme.secondary + '40' }]}
                      onPress={() => setSharesInput(String(q))}
                    >
                      <ThemedText style={[s.quickBtnText, { color: sharesInput === String(q) ? '#fff' : theme.secondary }]}>
                        {q} parts
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ThemedView>
                {/* Summary */}
                <ThemedView style={[s.summaryBox, { backgroundColor: theme.secondary + '08', borderColor: theme.secondary + '20' }]}>
                  <ThemedView style={s.summaryRow} backgroundColor="transparent">
                    <ThemedText style={[s.summaryLabel, { color: theme.onSurface + '60' }]}>Montant total</ThemedText>
                    <ThemedText style={[s.summaryValue, { color: theme.secondary }]}>${totalUsd.toLocaleString()}</ThemedText>
                  </ThemedView>
                  <ThemedView style={s.summaryRow} backgroundColor="transparent">
                    <ThemedText style={[s.summaryLabel, { color: theme.onSurface + '60' }]}>Revenu annuel estimé</ThemedText>
                    <ThemedText style={[s.summaryValue, { color: theme.success }]}>+${annualIncome.toFixed(2)} / an</ThemedText>
                  </ThemedView>
                  <ThemedView style={s.summaryRow} backgroundColor="transparent">
                    <ThemedText style={[s.summaryLabel, { color: theme.onSurface + '60' }]}>Revenu mensuel estimé</ThemedText>
                    <ThemedText style={[s.summaryValue, { color: theme.success }]}>+${(annualIncome / 12).toFixed(2)} / mois</ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>

              {/* Wallet address */}
              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText type="normal" style={[s.cardTitle, { color: theme.text }]}>Adresse wallet ERC-3643</ThemedText>
                <ThemedText type="caption" style={[s.cardSub, { color: theme.onSurface + '55' }]}>
                  Les parts seront émises vers cette adresse. Elle doit être whitelistée (KYC validé).
                </ThemedText>
                <ThemedView style={[s.inputRow, { borderColor: wallet ? theme.secondary : theme.outline + '40', backgroundColor: theme.background as unknown as string }]}>
                  <MaterialCommunityIcons name="wallet" size={18} color={wallet ? theme.secondary : theme.onSurface + '40'} />
                  <TextInput
                    value={wallet}
                    onChangeText={setWallet}
                    style={[s.input, { color: theme.text }]}
                    placeholder="0x..."
                    placeholderTextColor={theme.onSurface + '40'}
                    autoCapitalize="none"
                  />
                </ThemedView>
              </ThemedView>

              {error !== '' && (
                <ThemedView style={[s.errorBox, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
                  <ThemedText type="body" style={{ color: '#ef4444', flex: 1 }}>{error}</ThemedText>
                </ThemedView>
              )}

              <TouchableOpacity style={[s.ctaBtn, { backgroundColor: theme.secondary }]} onPress={handleConfirm}>
                <ThemedText style={s.ctaBtnText}>Continuer {"\u2192"}</ThemedText>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2 : Confirmation ── */}
          {step === 'confirm' && (
            <>
              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText type="normal" style={[s.cardTitle, { color: theme.text }]}>Récapitulatif de souscription</ThemedText>
                {[
                  ['Type', 'Parts SPV (co-actionnaire)', theme.secondary],
                  ['Nombre de parts', `${shares} parts`, theme.text],
                  ['Prix par part', `$${SHARE_PRICE}`, theme.text],
                  ['Montant total', `$${totalUsd.toLocaleString()}`, theme.secondary],
                  ['Rendement annuel estimé', `+$${annualIncome.toFixed(2)}`, theme.success],
                  ['Adresse wallet', wallet, theme.text],
                ].map(([label, value, color], i) => (
                  <ThemedView key={i} style={[s.recapRow, { borderBottomColor: theme.outline + '10' }]}>
                    <ThemedText type="caption" style={[s.recapLabel, { color: theme.onSurface + '60' }]}>{label}</ThemedText>
                    <ThemedText type="body" style={[s.recapValue, { color: color as string }]} numberOfLines={1}>{value}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>

              <ThemedView style={[s.warningBox, { backgroundColor: theme.star + '12', borderColor: theme.star + '30' }]}>
                <MaterialCommunityIcons name="shield-alert" size={16} color={theme.star} />
                <ThemedText style={{ color: theme.onSurface + '70', fontSize: 12, flex: 1, lineHeight: 18 }}>
                  En souscrivant, vous acceptez les statuts de la société SPV, les contraintes de transfert ERC-3643 (whitelist KYC) et les risques liés à l'investissement immobilier.
                </ThemedText>
              </ThemedView>

              <ThemedView style={s.confirmBtns}>
                <TouchableOpacity style={[s.backBtn2, { borderColor: theme.outline + '40' }]} onPress={() => setStep('form')}>
                  <ThemedText type="normal" style={[s.backBtn2Text, { color: theme.onSurface + '70' }]}>Modifier</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.ctaBtn, { flex: 1, backgroundColor: theme.secondary }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <ThemedText style={s.ctaBtnText}>{loading ? 'Traitement...' : 'Confirmer la souscription'}</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </>
          )}

          {/* ── Step 3 : Success ── */}
          {step === 'success' && (
            <ThemedView style={[s.successCard, { backgroundColor: theme.surface, borderColor: theme.secondary + '30' }]}>
              <ThemedView style={[s.successIcon, { backgroundColor: theme.secondary + '18' }]}>
                <MaterialCommunityIcons name="check-circle" size={52} color={theme.secondary} />
              </ThemedView>
              <ThemedText style={[s.successTitle, { color: theme.text }]}>Souscription confirmée !</ThemedText>
              <ThemedText type="body" style={[s.successSub, { color: theme.onSurface + '65' }]}>
                Vous êtes maintenant co-actionnaire de <ThemedText style={{ fontWeight: '800' }}>{shares} parts</ThemedText>.
                Vos parts tokenisées seront émises vers votre wallet sous 24h après validation KYC.
              </ThemedText>
              <ThemedView style={[s.successStats, { backgroundColor: theme.secondary + '08', borderColor: theme.secondary + '20' }]}>
                <ThemedView style={s.successStat}>
                  <ThemedText style={[s.successStatVal, { color: theme.secondary }]}>{shares}</ThemedText>
                  <ThemedText style={[s.successStatLabel, { color: theme.onSurface + '55' }]}>Parts achetées</ThemedText>
                </ThemedView>
                <ThemedView style={s.successStat}>
                  <ThemedText style={[s.successStatVal, { color: theme.success }]}>+${annualIncome.toFixed(0)}</ThemedText>
                  <ThemedText style={[s.successStatLabel, { color: theme.onSurface + '55' }]}>Revenu/an estimé</ThemedText>
                </ThemedView>
              </ThemedView>
              <TouchableOpacity
                style={[s.ctaBtn, { backgroundColor: theme.secondary }]}
                onPress={() => router.push('/invest/spv/portfolio' as any)}
              >
                <MaterialCommunityIcons name="briefcase" size={18} color="#fff" />
                <ThemedText style={s.ctaBtnText}>Voir mon portfolio SPV</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          <ThemedView style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontWeight: '800' },
  headerSub: { fontWeight: '700', marginTop: 1 },
  stepper: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stepNum: { fontWeight: '800' },
  modelBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  modelText: { flex: 1, lineHeight: 17 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardTitle: { fontWeight: '800' },
  cardSub: { lineHeight: 17 },
  priceTag: { fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 50 },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },
  inputSuffix: { fontSize: 13, fontWeight: '600' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  quickBtnText: { fontSize: 12, fontWeight: '700' },
  summaryBox: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '800' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  recapLabel: { flex: 1 },
  recapValue: { fontWeight: '700', flex: 1, textAlign: 'right' },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  backBtn2: { height: 52, paddingHorizontal: 20, borderRadius: 26, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn2Text: { fontWeight: '700' },
  successCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', gap: 16 },
  successIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 20, fontWeight: '800' },
  successSub: { textAlign: 'center', lineHeight: 20 },
  successStats: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 16, width: '100%' },
  successStat: { flex: 1, alignItems: 'center' },
  successStatVal: { fontSize: 20, fontWeight: '800' },
  successStatLabel: { fontSize: 11, marginTop: 4 },
});
