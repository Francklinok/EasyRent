/**
 * climateRisk/add/[propertyId].tsx — register a climate hazard record.
 * Estimates require a confidence percentage — enforced client-side here and
 * again server-side (ClimateRiskService::add_record in Rust), since an
 * unlabeled uncertain estimate is exactly what the fact-vs-prediction rule
 * prohibits.
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
import { getClimateRiskClient, HazardType, ClimateDataType, ClimateRiskLevel } from '@/services/api/climateRiskClient';

const HAZARD_TYPES: { value: HazardType; label: string }[] = [
  { value: 'flood', label: 'Inondation' },
  { value: 'erosion', label: 'Érosion' },
  { value: 'drought', label: 'Sécheresse' },
  { value: 'wildfire', label: 'Incendie' },
  { value: 'sea_level_rise', label: 'Montée des eaux' },
  { value: 'landslide', label: 'Glissement de terrain' },
  { value: 'extreme_heat', label: 'Chaleur extrême' },
  { value: 'other', label: 'Autre' },
];

const RISK_LEVELS: { value: ClimateRiskLevel; label: string }[] = [
  { value: 'low', label: 'Faible' },
  { value: 'moderate', label: 'Modéré' },
  { value: 'high', label: 'Élevé' },
  { value: 'severe', label: 'Sévère' },
];

export default function AddClimateRiskRecordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();

  const [hazardType, setHazardType] = useState<HazardType>('flood');
  const [dataType, setDataType] = useState<ClimateDataType>('historical_record');
  const [riskLevel, setRiskLevel] = useState<ClimateRiskLevel>('moderate');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [confidencePct, setConfidencePct] = useState('');
  const [marginOfErrorNote, setMarginOfErrorNote] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!propertyId || !user?.id) { setError('Utilisateur non authentifié.'); return; }
    if (!description.trim() || !source.trim()) {
      setError('Merci de renseigner la description et la source.');
      return;
    }
    if (dataType === 'estimate' && !confidencePct.trim()) {
      setError('Une estimation doit obligatoirement indiquer un niveau de confiance (%).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await getClimateRiskClient().addRecord(propertyId, {
        hazardType, dataType, riskLevel,
        description: description.trim(),
        source: source.trim(),
        confidencePct: confidencePct ? parseFloat(confidencePct) : undefined,
        marginOfErrorNote: marginOfErrorNote.trim() || undefined,
        eventDate: eventDate.trim() ? new Date(eventDate.trim()).toISOString() : undefined,
        recordedBy: user.id,
      });
      router.replace({ pathname: '/climateRisk/[propertyId]', params: { propertyId } } as any);
    } catch (err: any) {
      setError(err?.message || "Impossible d'ajouter l'enregistrement.");
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
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Ajouter un risque</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>Type de risque</ThemedText>
          <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {HAZARD_TYPES.map((h) => (
              <TouchableOpacity
                key={h.value}
                onPress={() => setHazardType(h.value)}
                style={[
                  s.chip,
                  hazardType === h.value ? { backgroundColor: theme.primary } : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
                ]}
              >
                <ThemedText style={{ color: hazardType === h.value ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '600' }}>{h.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>Nature de la donnée</ThemedText>
          <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setDataType('historical_record')}
              style={[
                s.chip, { flex: 1, alignItems: 'center' },
                dataType === 'historical_record' ? { backgroundColor: theme.success } : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
              ]}
            >
              <ThemedText style={{ color: dataType === 'historical_record' ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '700' }}>
                Historique vérifié
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDataType('estimate')}
              style={[
                s.chip, { flex: 1, alignItems: 'center' },
                dataType === 'estimate' ? { backgroundColor: theme.warning } : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
              ]}
            >
              <ThemedText style={{ color: dataType === 'estimate' ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '700' }}>
                Estimation
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedText style={[s.label, { color: theme.text, marginTop: 12, marginBottom: 8 }]}>Niveau de risque</ThemedText>
          <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
            {RISK_LEVELS.map((r) => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRiskLevel(r.value)}
                style={[
                  s.chip, { flex: 1, alignItems: 'center' },
                  riskLevel === r.value ? { backgroundColor: theme.primary } : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
                ]}
              >
                <ThemedText style={{ color: riskLevel === r.value ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '600' }}>{r.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>Description</ThemedText>
          <TextInput
            value={description} onChangeText={setDescription} multiline
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30', minHeight: 70, paddingTop: 10 }]}
          />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Source</ThemedText>
          <TextInput
            value={source} onChangeText={setSource} placeholder="ex: registre national des inondations, carte des aléas locale"
            placeholderTextColor={theme.onSurface + '40'}
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />

          {dataType === 'estimate' && (
            <>
              <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Confiance (%) — obligatoire</ThemedText>
              <TextInput
                value={confidencePct} onChangeText={setConfidencePct} keyboardType="decimal-pad"
                style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
              />

              <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Marge d'incertitude (optionnel)</ThemedText>
              <TextInput
                value={marginOfErrorNote} onChangeText={setMarginOfErrorNote} placeholder="ex: ±1 catégorie, projection à 30 ans"
                placeholderTextColor={theme.onSurface + '40'}
                style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
              />
            </>
          )}

          {dataType === 'historical_record' && (
            <>
              <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Date de l'événement (AAAA-MM-JJ, optionnel)</ThemedText>
              <TextInput
                value={eventDate} onChangeText={setEventDate} placeholder="2023-09-12"
                placeholderTextColor={theme.onSurface + '40'}
                style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
              />
            </>
          )}
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
              <MaterialCommunityIcons name="shield-plus-outline" size={18} color="#fff" />
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Enregistrer</ThemedText>
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
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  label: { fontWeight: '800', fontSize: 14 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
});
