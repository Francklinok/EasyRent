/**
 * rentalGuarantee/subscribe.tsx — subscribe a lease to a rental guarantee.
 * Protects the landlord against tenant non-payment via a pooled premium
 * reserve, funded by a recurring premium instead of a heavy security deposit.
 */
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getRentalGuaranteeClient } from '@/services/api/rentalGuaranteeClient';

const DEFAULT_PREMIUM_PCT = '5';
const DEFAULT_COVERAGE_CAP = '3';
const DEFAULT_GRACE_DAYS = '10';

export default function SubscribeGuaranteeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { leaseId, monthlyRent, currency } = useLocalSearchParams<{ leaseId: string; monthlyRent?: string; currency?: string }>();

  const [premiumPct, setPremiumPct] = useState(DEFAULT_PREMIUM_PCT);
  const [coverageCapMultiple, setCoverageCapMultiple] = useState(DEFAULT_COVERAGE_CAP);
  const [gracePeriodDays, setGracePeriodDays] = useState(DEFAULT_GRACE_DAYS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rentValue = monthlyRent ? parseFloat(monthlyRent) : undefined;
  const pct = parseFloat(premiumPct) || 0;
  const estimatedPremium = rentValue ? (rentValue * pct) / 100 : undefined;

  const handleSubmit = async () => {
    if (!leaseId) { setError('Bail introuvable.'); return; }
    const pctVal = parseFloat(premiumPct);
    const capVal = parseFloat(coverageCapMultiple);
    const graceVal = parseInt(gracePeriodDays, 10);
    if (!pctVal || pctVal <= 0 || pctVal > 20) {
      setError('La prime doit être comprise entre 0.1 et 20% du loyer mensuel.');
      return;
    }
    if (!capVal || capVal < 1) {
      setError('Le plafond de couverture doit être au moins 1x le loyer mensuel.');
      return;
    }
    if (!graceVal || graceVal < 1) {
      setError('Le délai de grâce doit être d\'au moins 1 jour.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const guarantee = await getRentalGuaranteeClient().subscribe({
        leaseId,
        premiumPct: pctVal,
        coverageCapMultiple: capVal,
        gracePeriodDays: graceVal,
      });
      router.replace({ pathname: '/rentalGuarantee/[guaranteeId]', params: { guaranteeId: guarantee.guaranteeId } } as any);
    } catch (err: any) {
      setError(err?.message || 'Impossible de souscrire la garantie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Garantie locative</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color={theme.primary} />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Protégez-vous contre les impayés de loyer. Une prime mensuelle alimente une réserve mutualisée
            qui vous indemnise si votre locataire est en défaut au-delà du délai de grâce.
          </ThemedText>
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>Prime (% du loyer mensuel)</ThemedText>
          <TextInput
            value={premiumPct} onChangeText={setPremiumPct} keyboardType="decimal-pad"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Plafond de couverture (x loyer mensuel)</ThemedText>
          <TextInput
            value={coverageCapMultiple} onChangeText={setCoverageCapMultiple} keyboardType="decimal-pad"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Délai de grâce (jours)</ThemedText>
          <ThemedText style={{ fontSize: 11, color: theme.onSurface + '50', marginBottom: 4 }}>
            Nombre de jours de retard avant qu'une réclamation soit possible
          </ThemedText>
          <TextInput
            value={gracePeriodDays} onChangeText={setGracePeriodDays} keyboardType="number-pad"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />
        </ThemedView>

        {estimatedPremium !== undefined && (
          <ThemedView style={[s.card, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}>
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>Prime mensuelle estimée</ThemedText>
            <ThemedText style={{ fontSize: 20, fontWeight: '900', color: theme.success, marginTop: 2 }}>
              {estimatedPremium.toLocaleString()} {currency || 'XOF'}
            </ThemedText>
          </ThemedView>
        )}

        {error !== '' && (
          <ThemedView style={[s.box, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={theme.error} />
            <ThemedText style={{ color: theme.error, flex: 1, fontSize: 13 }}>{error}</ThemedText>
          </ThemedView>
        )}

        <TouchableOpacity
          style={[s.cta, { backgroundColor: loading ? theme.outline : theme.primary }]}
          onPress={handleSubmit} disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <MaterialCommunityIcons name="shield-check" size={18} color="#fff" />
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Souscrire la garantie</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  label: { fontWeight: '800', fontSize: 14 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
});
