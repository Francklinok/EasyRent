/**
 * vacancyBridge/create.tsx — owner offers a vacant property for temporary
 * occupancy while still actively searching for a real tenant/buyer.
 * DELIBERATELY separate from urbanReuse/create.tsx (see
 * services/api/vacancyBridgeClient.ts header for the full rationale) — no
 * maintenance obligation, no organization pitch, just a plain stopgap fee,
 * and it closes itself automatically the moment a real reservation is paid.
 *
 * Classic properties: the owner decides alone, straight to 'active'.
 * RST/SPV properties: this screen is not the entry point — the DAO must
 * vote AND the owner must separately approve (rst-service
 * proposal_type="temporary_vacancy_bridge") before offer() can be called;
 * that governance flow isn't built here yet, so this screen blocks with an
 * explanatory message rather than silently bypassing it.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getVacancyBridgeClient, VacancyBridgePropertyPurpose } from '@/services/api/vacancyBridgeClient';
import { getPropertyService } from '@/services/api/propertyService';
import { AuthRequiredScreen } from '@/components/auth/AuthRequiredScreen';

const PURPOSE_OPTIONS: { value: VacancyBridgePropertyPurpose; label: string }[] = [
  { value: 'rent', label: 'Je cherche un locataire' },
  { value: 'sale', label: 'Je cherche un acheteur' },
];

export default function CreateTemporaryOccupancyScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, initializing } = useAuth();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();

  const [loadingProperty, setLoadingProperty] = useState(true);
  const [isInvestmentProperty, setIsInvestmentProperty] = useState(false);
  const [propertyTitle, setPropertyTitle] = useState('');

  const [occupantUserId, setOccupantUserId] = useState('');
  const [propertyPurpose, setPropertyPurpose] = useState<VacancyBridgePropertyPurpose>('rent');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!propertyId) { setLoadingProperty(false); return; }
    let cancelled = false;
    getPropertyService()
      .getProperty(propertyId)
      .then((property: any) => {
        if (cancelled) return;
        setPropertyTitle(property?.title || '');
        setIsInvestmentProperty(property?.actionCategory === 'investment' || property?.actionCategory === 'hybrid');
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingProperty(false); });
    return () => { cancelled = true; };
  }, [propertyId]);

  const handleSubmit = async () => {
    if (!user?.id) { setError('Utilisateur non authentifié.'); return; }
    if (!propertyId) { setError('Propriété introuvable.'); return; }
    if (!occupantUserId.trim()) { setError("Merci d'indiquer l'identifiant de l'occupant."); return; }

    setLoading(true);
    setError('');
    try {
      const occupancy = await getVacancyBridgeClient().offer({
        propertyId,
        ownerId: user.id,
        occupantUserId: occupantUserId.trim(),
        propertyPurpose,
        monthlyFee: monthlyFee ? parseFloat(monthlyFee) : 0,
      });
      router.replace({ pathname: '/vacancyBridge/[occupancyId]', params: { occupancyId: occupancy.occupancyId } } as any);
    } catch (err: any) {
      setError(err?.message || "Impossible d'activer le comblement temporaire.");
    } finally {
      setLoading(false);
    }
  };

  if (!initializing && !isAuthenticated) {
    return <AuthRequiredScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Comblement temporaire</ThemedText>
        </ThemedView>
      </ThemedView>

      {loadingProperty ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.primary} />
        </ThemedView>
      ) : isInvestmentProperty ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          <ThemedView style={[s.infoBox, { backgroundColor: theme.warning + '10', borderColor: theme.warning + '30' }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={theme.warning} />
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
              Ce bien est financé en investissement (RST/SPV). Un comblement temporaire nécessite
              l'approbation du DAO des investisseurs ET du propriétaire — cette décision se prend
              depuis l'espace investissement du projet, pas ici.
            </ThemedText>
          </ThemedView>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.primary} />
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
              Occupez temporairement{propertyTitle ? ` "${propertyTitle}"` : ' ce bien'} en attendant de trouver
              un vrai bailleur — dès qu'une réservation classique est payée, ce comblement se termine
              automatiquement.
            </ThemedText>
          </ThemedView>

          <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>Ce bien est recherché pour</ThemedText>
            <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
              {PURPOSE_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setPropertyPurpose(p.value)}
                  style={[
                    s.chip, { flex: 1, alignItems: 'center' },
                    propertyPurpose === p.value ? { backgroundColor: theme.primary } : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
                  ]}
                >
                  <ThemedText style={{ color: propertyPurpose === p.value ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '600' }}>{p.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>

            <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Identifiant de l'occupant</ThemedText>
            <TextInput
              value={occupantUserId} onChangeText={setOccupantUserId}
              style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
            />

            <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Redevance mensuelle (optionnel)</ThemedText>
            <TextInput
              value={monthlyFee} onChangeText={setMonthlyFee} keyboardType="decimal-pad"
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
                <MaterialCommunityIcons name="home-clock-outline" size={18} color="#fff" />
                <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Activer le comblement temporaire</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
});
