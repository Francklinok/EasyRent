/**
 * vacancyBridge/request.tsx — client-initiated candidacy for a vacant
 * property flagged as open to temporary occupancy. Counterpart to
 * create.tsx (owner-initiated, lands directly in 'active'): this submits a
 * 'requested' candidacy that the owner reviews and accepts or rejects from
 * the occupancy detail screen. Mirrors urbanReuse/request.tsx exactly.
 */
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getVacancyBridgeClient, VacancyBridgePropertyPurpose } from '@/services/api/vacancyBridgeClient';
import { AuthRequiredScreen } from '@/components/auth/AuthRequiredScreen';

const PURPOSE_OPTIONS: { value: VacancyBridgePropertyPurpose; label: string }[] = [
  { value: 'rent', label: 'Le propriétaire cherche un locataire' },
  { value: 'sale', label: 'Le propriétaire cherche un acheteur' },
];

export default function RequestTemporaryOccupancyScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, initializing } = useAuth();
  const { propertyId, ownerId, propertyTitle } = useLocalSearchParams<{
    propertyId?: string; ownerId?: string; propertyTitle?: string;
  }>();

  const [propertyPurpose, setPropertyPurpose] = useState<VacancyBridgePropertyPurpose>('rent');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user?.id) { setError('Utilisateur non authentifié.'); return; }
    if (!propertyId || !ownerId) { setError('Propriété introuvable.'); return; }

    setLoading(true);
    setError('');
    try {
      const occupancy = await getVacancyBridgeClient().requestOccupancy({
        propertyId,
        ownerId,
        occupantUserId: user.id,
        propertyPurpose,
        monthlyFee: monthlyFee ? parseFloat(monthlyFee) : 0,
        requestMessage: requestMessage.trim() || undefined,
      });
      router.replace({ pathname: '/vacancyBridge/[occupancyId]', params: { occupancyId: occupancy.occupancyId } } as any);
    } catch (err: any) {
      setError(err?.message || "Impossible d'envoyer la demande.");
    } finally {
      setLoading(false);
    }
  };

  // Même raisonnement que urbanReuse/request.tsx : toute la page est un
  // formulaire de candidature, bloqué avant remplissage plutôt qu'à la
  // soumission.
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
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Proposer une occupation</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.infoBox, { backgroundColor: '#6366F1' + '10', borderColor: '#6366F1' + '30' }]}>
          <MaterialCommunityIcons name="home-clock-outline" size={16} color="#6366F1" />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Proposez d'occuper temporairement{propertyTitle ? ` "${propertyTitle}"` : ' ce bien'} pendant que le
            propriétaire cherche un vrai locataire ou acheteur. Dès qu'une réservation classique est acceptée,
            cette occupation se termine — un délai de préavis vous sera accordé par le propriétaire.
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
                  propertyPurpose === p.value ? { backgroundColor: '#6366F1' } : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
                ]}
              >
                <ThemedText style={{ color: propertyPurpose === p.value ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '600' }}>{p.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Redevance mensuelle proposée (optionnel)</ThemedText>
          <TextInput
            value={monthlyFee} onChangeText={setMonthlyFee} keyboardType="decimal-pad"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>Message au propriétaire (optionnel)</ThemedText>
          <TextInput
            value={requestMessage} onChangeText={setRequestMessage} multiline
            placeholder="Présentez votre besoin, la durée envisagée..."
            placeholderTextColor={theme.onSurface + '40'}
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30', minHeight: 70, paddingTop: 10 }]}
          />
        </ThemedView>

        {error !== '' && (
          <ThemedView style={[s.box, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={theme.error} />
            <ThemedText style={{ color: theme.error, flex: 1, fontSize: 13 }}>{error}</ThemedText>
          </ThemedView>
        )}

        <TouchableOpacity
          style={[s.cta, { backgroundColor: loading ? theme.outline : '#6366F1' }]}
          onPress={handleSubmit} disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <MaterialCommunityIcons name="send-outline" size={18} color="#fff" />
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Envoyer la candidature</ThemedText>
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
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
});
