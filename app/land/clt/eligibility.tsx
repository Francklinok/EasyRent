/**
 * land/clt/eligibility.tsx — Community Land Trust means-test application.
 * CLT membership is reserved for households under an affordability
 * threshold (standard: household income ≤ 80% of area median income) — this
 * is a transparent, documented criterion, never an opaque score. A human
 * still makes the final approval call (LandTitleController.
 * reviewCltEligibilityApplication) — this screen never auto-decides.
 */
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getLandClient } from '@/services/api/landClient';

export default function CltEligibilityScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [householdSize, setHouseholdSize] = useState('');
  const [monthlyHouseholdIncome, setMonthlyHouseholdIncome] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [areaMedianIncomePct, setAreaMedianIncomePct] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) { setError('Utilisateur non authentifié.'); return; }
    const sizeVal = parseInt(householdSize, 10);
    const incomeVal = parseFloat(monthlyHouseholdIncome);
    if (!sizeVal || sizeVal < 1 || !incomeVal || incomeVal < 0 || !employmentStatus.trim()) {
      setError('Merci de renseigner la taille du foyer, le revenu mensuel et la situation professionnelle.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await getLandClient().applyForCltEligibility({
        applicantUserId: user.id,
        householdSize: sizeVal,
        monthlyHouseholdIncome: incomeVal,
        employmentStatus: employmentStatus.trim(),
        areaMedianIncomePct: areaMedianIncomePct ? parseFloat(areaMedianIncomePct) : undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Impossible de déposer la candidature.');
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
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Éligibilité CLT</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="home-city-outline" size={16} color={theme.primary} />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Un Community Land Trust réserve l'accession à la propriété aux foyers sous un seuil de revenu —
            vous n'achetez que le bâti, le terrain reste détenu collectivement, ce qui réduit fortement le
            prix d'entrée.
          </ThemedText>
        </ThemedView>

        {submitted ? (
          <ThemedView style={[s.card, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={32} color={theme.success} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <ThemedText style={{ textAlign: 'center', color: theme.text, fontWeight: '700' }}>
              Candidature déposée avec succès
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', color: theme.onSurface + '70', fontSize: 13, marginTop: 6 }}>
              Elle sera examinée par l'équipe du CLT. Vous serez notifié de la décision.
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
              <ThemedText style={[s.label, { color: theme.text }]}>Taille du foyer</ThemedText>
              <TextInput
                value={householdSize} onChangeText={setHouseholdSize} keyboardType="number-pad"
                style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
              />

              <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Revenu mensuel du foyer</ThemedText>
              <TextInput
                value={monthlyHouseholdIncome} onChangeText={setMonthlyHouseholdIncome} keyboardType="decimal-pad"
                style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
              />

              <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Situation professionnelle</ThemedText>
              <TextInput
                value={employmentStatus} onChangeText={setEmploymentStatus} placeholder="ex: salarié, indépendant, sans emploi"
                placeholderTextColor={theme.onSurface + '40'}
                style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
              />

              <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>
                Revenu en % du revenu médian local (optionnel, si connu)
              </ThemedText>
              <TextInput
                value={areaMedianIncomePct} onChangeText={setAreaMedianIncomePct} keyboardType="decimal-pad"
                placeholder="ex: 65"
                placeholderTextColor={theme.onSurface + '40'}
                style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
              />
            </ThemedView>

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
                  <MaterialCommunityIcons name="file-document-check-outline" size={18} color="#fff" />
                  <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Déposer ma candidature</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
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
