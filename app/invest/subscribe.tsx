import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { getMicroservicesApi } from '@/services/api/microservicesApi';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { getKYCService } from '@/services/api/kycService';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

export default function RSTSubscribe() {
  const { theme } = useTheme();
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const api = getMicroservicesApi();
  const kycService = getKYCService();

  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
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

  const amountNum = parseFloat(amount) || 0;
  const tokenPrice = 1;
  const tokensToReceive = Math.floor(amountNum / tokenPrice);

  const handleSubmit = async () => {
    if (amountNum < 500) {
      Alert.alert(t('investSubscribe.minError', { min: '500' }), t('investSubscribe.minError', { min: '500' }));
      return;
    }
    if (!wallet.trim()) {
      Alert.alert(t('investSubscribe.walletRequired'), t('investSubscribe.walletRequiredMsg'));
      return;
    }
    if (step === 'form') { setStep('confirm'); return; }

    setLoading(true);
    try {
      await api.investInRSTProject({
        projectId,
        investorId: user?.id || '',
        amountUsd: amountNum,
        walletAddress: wallet,
      });
      setStep('success');
    } catch (e) {
      Alert.alert(t('common.error'), t('investSubscribe.walletRequired'));
    } finally {
      setLoading(false);
    }
  };

  if (kycLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (!kycVerified) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
        <ThemedView style={[ss.header, { borderBottomColor: theme.outline + '20' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[ss.backBtn, { backgroundColor: theme.surface }]}>
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={{ color: theme.text, fontWeight: '800' }}>{t('kyc.kycRequired')}</ThemedText>
        </ThemedView>
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
          <ThemedView style={[ss.successCircle, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' }]}>
            <MaterialCommunityIcons name="shield-alert" size={48} color="#f59e0b" />
          </ThemedView>
          <ThemedText type="subtitle" style={{ color: theme.text, fontWeight: '800', textAlign: 'center' }}>
            {t('kyc.kycRequired')}
          </ThemedText>
          <ThemedText type="normal" style={{ color: theme.onSurface + '80', textAlign: 'center' }}>
            {t('kyc.kycRequiredDesc')}
          </ThemedText>
          <TouchableOpacity
            style={[ss.cta, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/kyc' as any)}
          >
            <MaterialCommunityIcons name="shield-check" size={18} color="#fff" />
            <ThemedText style={ss.ctaText}>{t('kyc.goToKYC')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (step === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
          <ThemedView style={[ss.successCircle, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
            <MaterialCommunityIcons name="check" size={48} color={theme.primary} />
          </ThemedView>
          <ThemedText type = "subtitle" style={[ss.successTitle, { color: theme.text }]}>{t('investSubscribe.subscriptionConfirmed')}</ThemedText>
          <ThemedText type = "normal" style={[ss.successSub, { color: theme.onSurface + '80' }]}>
            {t('investSubscribe.tokensReceived', { tokens: String(tokensToReceive) })}
          </ThemedText>
          <TouchableOpacity
            style={[ss.cta, { backgroundColor: theme.primary }]}
            onPress={() => router.replace('/invest/portfolio' as any)}
          >
            <ThemedText style={ss.ctaText}>{t('investSubscribe.viewPortfolio')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />

      <ThemedView style={[ss.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => step === 'confirm' ? setStep('form') : router.back()}
          style={[ss.backBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type ="subtitle" style={[ss.headerTitle, { color: theme.text }]}>
          {step === 'form' ? t('investSubscribe.investTitle') : t('investSubscribe.confirmTitle')}
        </ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        {step === 'form' ? (
          <>
            {/* Amount */}
            <ThemedView style={[ss.section, { backgroundColor: theme.surface, borderColor: theme.outline + '30' }]}>
              <ThemedText style={[ss.sectionTitle, { color: theme.text }]}>{t('investSubscribe.amountTitle')}</ThemedText>
              <ThemedView style={[ss.inputWrap, { borderColor: theme.outline + '50', backgroundColor: theme.surface }]}>
                <ThemedText style={[ss.currency, { color: theme.primary }]}>$</ThemedText>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="500"
                  placeholderTextColor={theme.onSurface + '50'}
                  style={[ss.input, { color: theme.text }]}
                />
                <ThemedText type ="normal" style={[ss.usdt, { color: theme.onSurface + '60' }]}>USD</ThemedText>
              </ThemedView>

              {/* Quick amounts */}
              <ThemedView style={ss.quickRow}>
                {[500, 1000, 5000, 10000].map(v => (
                  <TouchableOpacity key={v}
                    style={[ss.quickBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '40' }]}
                    onPress={() => setAmount(String(v))}
                  >
                    <ThemedText type ="body" style={[ss.quickText, { color: theme.primary }]}>${v.toLocaleString()}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>

              {amountNum >= 500 && (
                <ThemedView style={[ss.tokensBox, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '30' }]}>
                  <MaterialCommunityIcons name="coin" size={18} color={theme.primary} />
                  <ThemedText type ="normal" style={[ss.tokensText, { color: theme.primary }]}>
                    {t('investSubscribe.tokensWillReceive', { tokens: String(tokensToReceive.toLocaleString()) })}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            {/* Wallet */}
            <ThemedView style={[ss.section, { backgroundColor: theme.surface, borderColor: theme.outline + '30' }]}>
              <ThemedText style={[ss.sectionTitle, { color: theme.text }]}>{t('investSubscribe.walletTitle')}</ThemedText>
              <TextInput
                value={wallet}
                onChangeText={setWallet}
                placeholder="0x..."
                placeholderTextColor={theme.onSurface + '50'}
                style={[ss.walletInput, { color: theme.text, borderColor: theme.outline + '50', backgroundColor: theme.surface }]}
                autoCapitalize="none"
              />
              <ThemedText style={[ss.walletHint, { color: theme.onSurface + '60' }]}>
                {t('investSubscribe.walletHint')}
              </ThemedText>
            </ThemedView>

            {/* Info */}
            <ThemedView style={[ss.infoBox, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedView style={ss.infoRow}>
                <MaterialCommunityIcons name="calendar-month" size={16} color={theme.primary} />
                <ThemedText type ="body" style={ { color: theme.onSurface + '80' }}>{t('investSubscribe.monthlyDistrib')}</ThemedText>
              </ThemedView>
              <ThemedView style={ss.infoRow}>
                <MaterialCommunityIcons name="shield-check" size={16} color={theme.primary} />
                <ThemedText type ="body" style={{ color: theme.onSurface + '80' }}>{t('investSubscribe.kycRequired')}</ThemedText>
              </ThemedView>
              <ThemedView style={ss.infoRow}>
                <MaterialCommunityIcons name="fire" size={16} color={theme.primary} />
                <ThemedText type ="body" style={{ color: theme.onSurface + '80' }}>{t('investSubscribe.autoBurn')}</ThemedText>
              </ThemedView>
            </ThemedView>
          </>
        ) : (
          /* Confirmation */
          <ThemedView style={[ss.section, { backgroundColor: theme.surface, borderColor: theme.outline + '30' }]}>
            <ThemedText style={[ss.sectionTitle, { color: theme.text, marginBottom: 16 }]}>{t('investSubscribe.recapTitle')}</ThemedText>
            {[
              [t('investSubscribe.amountLabel'), `$${amountNum.toLocaleString()}`],
              [t('investSubscribe.tokensRST'), `${tokensToReceive.toLocaleString()}`],
              [t('investSubscribe.pricePerToken'), '$1.00'],
              [t('investSubscribe.walletLabel'), wallet.substring(0, 10) + '...' + wallet.slice(-6)],
              [t('investSubscribe.standard'), 'ERC-3643'],
            ].map(([label, val]) => (
              <ThemedView key={label} style={[ss.confirmRow, { borderBottomColor: theme.outline + '20' }]}>
                <ThemedText type= "normal"  style={ { color: theme.onSurface + '70' }}>{label}</ThemedText>
                <ThemedText type= "normal" style={[ss.confirmValue, { color: theme.text }]}>{val}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        <TouchableOpacity
          style={[ss.cta, { backgroundColor: loading ? theme.outline : theme.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <ThemedText style={ss.ctaText}>{step === 'form' ? t('investSubscribe.continueBtn') : t('investSubscribe.confirmBtn')}</ThemedText>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {fontWeight: '800' },
  section: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 54 },
  currency: { fontSize: 20, fontWeight: '800', marginRight: 4 },
  input: { flex: 1, fontSize: 24, fontWeight: '800' },
  usdt: { fontWeight: '600' },
  quickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  quickText: { fontWeight: '700' },
  tokensBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  tokensText: {fontWeight: '700' },
  walletInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 13 },
  walletHint: { fontSize: 11 },
  infoBox: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1 },
  confirmValue: {fontWeight: '700' },
  cta: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  successCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  successTitle: {fontWeight: '800', textAlign: 'center' },
  successSub: { textAlign: 'center', lineHeight: 22 },
});
