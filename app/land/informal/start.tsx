/**
 * land/informal/start.tsx — start a progressive informal-housing
 * formalization journey. Every household starts at OccupancyDeclared — a
 * self-declared claim, no documents required yet. Nothing here demands a
 * perfect title upfront (architecture doc §3.6's core principle).
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

export default function StartInformalFormalizationScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [propertyAddress, setPropertyAddress] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user?.id) { setError('Utilisateur non authentifié.'); return; }
    if (!propertyAddress.trim() || !jurisdiction.trim()) {
      setError("Merci de renseigner l'adresse et la juridiction.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formalization = await getLandClient().startInformalFormalization({
        occupantUserId: user.id,
        propertyAddress: propertyAddress.trim(),
        jurisdiction: jurisdiction.trim(),
      });
      router.replace({ pathname: '/land/informal/[formalizationId]', params: { formalizationId: formalization.formalization_id } } as any);
    } catch (err: any) {
      setError(err?.message || 'Impossible de démarrer le parcours.');
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
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Formaliser mon logement</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="home-outline" size={16} color={theme.primary} />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Un parcours progressif vers un titre reconnu, étape par étape — aucun document requis pour
            commencer. Chaque étape franchie reste acquise, même si les suivantes prennent du temps.
          </ThemedText>
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>Adresse du logement</ThemedText>
          <TextInput value={propertyAddress} onChangeText={setPropertyAddress} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Juridiction</ThemedText>
          <TextInput
            value={jurisdiction} onChangeText={setJurisdiction} placeholder="ex: Côte d'Ivoire"
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
              <MaterialCommunityIcons name="home-outline" size={18} color="#fff" />
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Démarrer le parcours</ThemedText>
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
