/**
 * land/titles/register.tsx — register a land title for a property.
 * Reuses property-engine's existing legal-token engine (cadastre/deed/
 * encumbrance data) rather than a separate land-title model — spv_id is
 * intentionally omitted here since most land titles have no associated SPV.
 */
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getLandClient } from '@/services/api/landClient';

export default function RegisterTitleScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { propertyId, propertyAddress: initialAddress } = useLocalSearchParams<{ propertyId: string; propertyAddress?: string }>();

  const [propertyAddress, setPropertyAddress] = useState(initialAddress || '');
  const [propertyAreaSqm, setPropertyAreaSqm] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [cadastralReference, setCadastralReference] = useState('');
  const [notaryId, setNotaryId] = useState('');
  const [deedUrl, setDeedUrl] = useState('');
  const [deedContent, setDeedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!propertyId) { setError('Propriété introuvable.'); return; }
    const area = parseFloat(propertyAreaSqm);
    if (!propertyAddress.trim() || !jurisdiction.trim() || !area || area <= 0 || !deedUrl.trim() || !deedContent.trim()) {
      setError("Merci de renseigner l'adresse, la juridiction, la surface, et le document d'acte.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const title = await getLandClient().registerTitle({
        propertyId,
        deedUrl: deedUrl.trim(),
        deedContent: deedContent.trim(),
        notaryId: notaryId.trim() || undefined,
        jurisdiction: jurisdiction.trim(),
        propertyAddress: propertyAddress.trim(),
        propertyAreaSqm: area,
        cadastralReference: cadastralReference.trim() || undefined,
      });
      router.replace({ pathname: '/land/titles/[tokenId]', params: { tokenId: title.token_id } } as any);
    } catch (err: any) {
      setError(err?.message || "Impossible d'enregistrer le titre.");
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
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Enregistrer le titre foncier</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="file-certificate-outline" size={16} color={theme.primary} />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Ce registre est un outil de vérification, pas une valeur probante officielle tant qu'il n'est
            pas reconnu par les autorités foncières locales.
          </ThemedText>
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>Adresse de la propriété</ThemedText>
          <TextInput value={propertyAddress} onChangeText={setPropertyAddress} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Surface (m²)</ThemedText>
          <TextInput value={propertyAreaSqm} onChangeText={setPropertyAreaSqm} keyboardType="decimal-pad" style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Juridiction</ThemedText>
          <TextInput value={jurisdiction} onChangeText={setJurisdiction} placeholder="ex: Côte d'Ivoire" placeholderTextColor={theme.onSurface + '40'} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Référence cadastrale (optionnel)</ThemedText>
          <TextInput value={cadastralReference} onChangeText={setCadastralReference} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Notaire (optionnel)</ThemedText>
          <TextInput value={notaryId} onChangeText={setNotaryId} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>URL du document d'acte</ThemedText>
          <ThemedText style={{ fontSize: 11, color: theme.onSurface + '50', marginBottom: 4 }}>
            Lien vers le document hébergé (IPFS, Arweave, ou stockage cloud)
          </ThemedText>
          <TextInput
            value={deedUrl} onChangeText={setDeedUrl} autoCapitalize="none"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Contenu de l'acte</ThemedText>
          <ThemedText style={{ fontSize: 11, color: theme.onSurface + '50', marginBottom: 4 }}>
            Texte ou JSON de l'acte — sera haché (SHA-256) pour vérification d'intégrité
          </ThemedText>
          <TextInput
            value={deedContent} onChangeText={setDeedContent} multiline
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30', minHeight: 80, paddingTop: 10 }]}
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
              <MaterialCommunityIcons name="file-certificate" size={18} color="#fff" />
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Enregistrer le titre</ThemedText>
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
