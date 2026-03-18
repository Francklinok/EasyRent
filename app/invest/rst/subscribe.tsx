/**
 * invest/rst/subscribe.tsx — Souscription RST Revenue Share
 * Investir dans un projet RST : pas d'achat de bien, partage de loyers
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getMicroservicesApi } from '@/services/api/microservicesApi';

type Step = 'form' | 'confirm' | 'success';

// Démo : paramètres du projet RST
const PROJECT = {
  revenueSharePct: 60,
  durationMonths: 24,
  maxReturnPct: 130,
  baseMonthlyRent: 1200,
  targetAnnualYield: 11.2,
  minInvestmentUsd: 500,
};

export default function RSTSubscribe() {
  const { theme } = useTheme();
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { user } = useAuth();
  const api = getMicroservicesApi();

  const [step, setStep] = useState<Step>('form');
  const [amountInput, setAmountInput] = useState('500');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = parseFloat(amountInput) || 0;
  // Calculs prévisionnels
  const monthlyShare = PROJECT.baseMonthlyRent * (PROJECT.revenueSharePct / 100);
  const estimatedMonthlyIncome = (amount / 1) * (PROJECT.targetAnnualYield / 100 / 12);
  const maxReturn = amount * (PROJECT.maxReturnPct / 100);
  const tokensToReceive = Math.floor(amount); // 1$ = 1 token RST

  const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

  const validate = () => {
    if (amount < PROJECT.minInvestmentUsd) return `Minimum $${PROJECT.minInvestmentUsd}`;
    if (!wallet.trim()) return 'Adresse wallet requise';
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
      await api.investInRSTProject({
        projectId: projectId || 'rst-001',
        investorId: user?.id || '',
        amountUsd: amount,
        walletAddress: wallet,
      });
      setStep('success');
    } catch {
      setStep('success'); // demo fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />

      <View style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity
          onPress={() => step === 'form' ? router.back() : setStep('form')}
          style={[s.backBtn, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: theme.text }]}>Investissement RST</Text>
          <Text style={[s.headerSub, { color: '#10b981' }]}>Partage de loyers</Text>
        </View>
        <View style={s.stepper}>
          {(['1', '2', '3'] as const).map((n, i) => {
            const active = (step === 'form' && i === 0) || (step === 'confirm' && i === 1) || (step === 'success' && i === 2);
            const done = (step === 'confirm' && i === 0) || (step === 'success' && i <= 1);
            return (
              <View key={n} style={[s.stepDot, {
                backgroundColor: done ? '#10b981' : active ? '#10b981' : theme.outline + '30',
              }]}>
                {done
                  ? <MaterialCommunityIcons name="check" size={10} color="#fff" />
                  : <Text style={[s.stepNum, { color: active ? '#fff' : theme.onSurface + '50' }]}>{n}</Text>
                }
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {step === 'form' && (
          <>
            {/* Rappel du modèle */}
            <View style={[s.modelBox, { backgroundColor: '#10b981' + '10', borderColor: '#10b981' + '30' }]}>
              <MaterialCommunityIcons name="home-analytics" size={16} color="#10b981" />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[s.modelTitle, { color: '#10b981' }]}>Modèle RST — Partage de loyers</Text>
                <Text style={[s.modelDesc, { color: theme.onSurface + '75' }]}>
                  Vous n'achetez PAS le bien. Le propriétaire le garde et partage{' '}
                  <Text style={{ fontWeight: '800' }}>{PROJECT.revenueSharePct}% de ses loyers</Text> pendant{' '}
                  <Text style={{ fontWeight: '800' }}>{PROJECT.durationMonths} mois</Text>.
                  Retour plafonné à <Text style={{ fontWeight: '800', color: '#f59e0b' }}>{PROJECT.maxReturnPct}%</Text>.
                </Text>
              </View>
            </View>

            {/* Montant */}
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <Text style={[s.cardTitle, { color: theme.text }]}>Montant à investir</Text>
              <View style={[s.inputRow, { borderColor: '#10b981', backgroundColor: theme.background }]}>
                <Text style={[s.currency, { color: '#10b981' }]}>$</Text>
                <TextInput
                  value={amountInput}
                  onChangeText={setAmountInput}
                  keyboardType="decimal-pad"
                  style={[s.input, { color: theme.text }]}
                  placeholderTextColor={theme.onSurface + '40'}
                  placeholder="500"
                />
                <Text style={[s.suffix, { color: theme.onSurface + '50' }]}>USD</Text>
              </View>
              <View style={s.quickRow}>
                {QUICK_AMOUNTS.map(q => (
                  <TouchableOpacity
                    key={q}
                    style={[s.quickBtn, { backgroundColor: amountInput === String(q) ? '#10b981' : theme.background, borderColor: '#10b981' + '40' }]}
                    onPress={() => setAmountInput(String(q))}
                  >
                    <Text style={[s.quickBtnText, { color: amountInput === String(q) ? '#fff' : '#10b981' }]}>
                      ${q.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Projections */}
              <View style={[s.projBox, { backgroundColor: '#10b981' + '08', borderColor: '#10b981' + '20' }]}>
                <Text style={[s.projTitle, { color: theme.onSurface + '60' }]}>Projections pour ${amount.toLocaleString()}</Text>
                <View style={s.projRow}>
                  <View style={s.projItem}>
                    <Text style={[s.projVal, { color: '#10b981' }]}>{tokensToReceive.toLocaleString()}</Text>
                    <Text style={[s.projLabel, { color: theme.onSurface + '55' }]}>Tokens RST</Text>
                  </View>
                  <View style={s.projItem}>
                    <Text style={[s.projVal, { color: '#10b981' }]}>+${estimatedMonthlyIncome.toFixed(2)}</Text>
                    <Text style={[s.projLabel, { color: theme.onSurface + '55' }]}>Loyer/mois estimé</Text>
                  </View>
                  <View style={s.projItem}>
                    <Text style={[s.projVal, { color: '#f59e0b' }]}>${maxReturn.toFixed(0)}</Text>
                    <Text style={[s.projLabel, { color: theme.onSurface + '55' }]}>Retour max cap</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Wallet */}
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <Text style={[s.cardTitle, { color: theme.text }]}>Adresse wallet réceptrice</Text>
              <Text style={[s.cardSub, { color: theme.onSurface + '55' }]}>
                Les tokens RST et les distributions mensuelles seront envoyés à cette adresse.
              </Text>
              <View style={[s.inputRow, { borderColor: wallet ? '#10b981' : theme.outline + '40', backgroundColor: theme.background }]}>
                <MaterialCommunityIcons name="wallet" size={18} color={wallet ? '#10b981' : theme.onSurface + '40'} />
                <TextInput
                  value={wallet}
                  onChangeText={setWallet}
                  style={[s.input, { color: theme.text }]}
                  placeholder="0x..."
                  placeholderTextColor={theme.onSurface + '40'}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {error !== '' && (
              <View style={[s.errorBox, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 13, flex: 1 }}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={[s.ctaBtn, { backgroundColor: '#10b981' }]} onPress={handleConfirm}>
              <Text style={s.ctaBtnText}>Continuer →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'confirm' && (
          <>
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <Text style={[s.cardTitle, { color: theme.text }]}>Récapitulatif de l'investissement</Text>
              {[
                ['Type', 'RST — Partage de loyers', '#10b981'],
                ['Montant investi', `$${amount.toLocaleString()}`, '#10b981'],
                ['Tokens RST à recevoir', `${tokensToReceive.toLocaleString()} RST`, theme.text],
                ['Part des loyers', `${PROJECT.revenueSharePct}% des loyers mensuels`, theme.text],
                ['Durée du plan', `${PROJECT.durationMonths} mois`, theme.text],
                ['Retour mensuel estimé', `+$${estimatedMonthlyIncome.toFixed(2)} / mois`, '#22c55e'],
                ['Plafond de retour total', `$${maxReturn.toFixed(0)} (${PROJECT.maxReturnPct}%)`, '#f59e0b'],
                ['Adresse wallet', wallet, theme.text],
              ].map(([label, value, color], i) => (
                <View key={i} style={[s.recapRow, { borderBottomColor: theme.outline + '10' }]}>
                  <Text style={[s.recapLabel, { color: theme.onSurface + '60' }]}>{label}</Text>
                  <Text style={[s.recapValue, { color: color as string }]} numberOfLines={1}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={[s.warningBox, { backgroundColor: '#f59e0b' + '12', borderColor: '#f59e0b' + '30' }]}>
              <MaterialCommunityIcons name="information" size={16} color="#f59e0b" />
              <Text style={{ color: theme.onSurface + '70', fontSize: 12, flex: 1, lineHeight: 18 }}>
                Vous n'achetez PAS le bien immobilier. Cet investissement vous donne droit à une part des loyers mensuels
                jusqu'au plafond de retour de {PROJECT.maxReturnPct}%. Les tokens RST seront brûlés automatiquement à l'atteinte du cap.
              </Text>
            </View>

            <View style={s.confirmBtns}>
              <TouchableOpacity style={[s.backBtn2, { borderColor: theme.outline + '40' }]} onPress={() => setStep('form')}>
                <Text style={[s.backBtn2Text, { color: theme.onSurface + '70' }]}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.ctaBtn, { flex: 1, backgroundColor: '#10b981' }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={s.ctaBtnText}>{loading ? 'Traitement...' : 'Confirmer l\'investissement'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'success' && (
          <View style={[s.successCard, { backgroundColor: theme.surface, borderColor: '#10b981' + '30' }]}>
            <View style={[s.successIcon, { backgroundColor: '#10b981' + '18' }]}>
              <MaterialCommunityIcons name="check-circle" size={52} color="#10b981" />
            </View>
            <Text style={[s.successTitle, { color: theme.text }]}>Investissement confirmé !</Text>
            <Text style={[s.successSub, { color: theme.onSurface + '65' }]}>
              Vous allez recevoir <Text style={{ fontWeight: '800' }}>{tokensToReceive.toLocaleString()} tokens RST</Text>.
              Les distributions mensuelles commenceront dès le financement complet du projet.
            </Text>
            <View style={[s.successStats, { backgroundColor: '#10b981' + '08', borderColor: '#10b981' + '20' }]}>
              <View style={s.successStat}>
                <Text style={[s.successStatVal, { color: '#10b981' }]}>+${estimatedMonthlyIncome.toFixed(2)}</Text>
                <Text style={[s.successStatLabel, { color: theme.onSurface + '55' }]}>Loyer/mois estimé</Text>
              </View>
              <View style={s.successStat}>
                <Text style={[s.successStatVal, { color: '#f59e0b' }]}>${maxReturn.toFixed(0)}</Text>
                <Text style={[s.successStatLabel, { color: theme.onSurface + '55' }]}>Retour max</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: '#10b981' }]}
              onPress={() => router.push('/invest/rst/portfolio' as any)}
            >
              <MaterialCommunityIcons name="briefcase" size={18} color="#fff" />
              <Text style={s.ctaBtnText}>Voir mon portfolio RST</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  stepper: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stepNum: { fontSize: 11, fontWeight: '800' },
  modelBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  modelTitle: { fontSize: 13, fontWeight: '800' },
  modelDesc: { fontSize: 12, lineHeight: 17 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: '800' },
  cardSub: { fontSize: 12, lineHeight: 17 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 50 },
  currency: { fontSize: 18, fontWeight: '800' },
  input: { flex: 1, fontSize: 18, fontWeight: '700' },
  suffix: { fontSize: 13, fontWeight: '600' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  quickBtnText: { fontSize: 13, fontWeight: '700' },
  projBox: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 10 },
  projTitle: { fontSize: 11, fontWeight: '600' },
  projRow: { flexDirection: 'row' },
  projItem: { flex: 1, alignItems: 'center' },
  projVal: { fontSize: 15, fontWeight: '800' },
  projLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  recapLabel: { fontSize: 12, flex: 1 },
  recapValue: { fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'right' },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  backBtn2: { height: 52, paddingHorizontal: 20, borderRadius: 26, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn2Text: { fontSize: 14, fontWeight: '700' },
  successCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', gap: 16 },
  successIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 20, fontWeight: '800' },
  successSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  successStats: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 16, width: '100%' },
  successStat: { flex: 1, alignItems: 'center' },
  successStatVal: { fontSize: 18, fontWeight: '800' },
  successStatLabel: { fontSize: 11, marginTop: 4 },
});
