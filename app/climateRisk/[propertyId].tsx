/**
 * climateRisk/[propertyId].tsx — climate risk profile display. Each record
 * renders its data_type badge prominently (Historique vérifié vs.
 * Estimation) — deliberately never collapsed into one score, per the
 * architecture doc's repeated warning against presenting a prediction as a
 * fact. Estimates always show their confidence/margin note alongside.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getClimateRiskClient, ClimateRiskProfile, HazardType, ClimateRiskLevel } from '@/services/api/climateRiskClient';

const HAZARD_META: Record<HazardType, { label: string; icon: string }> = {
  flood: { label: 'Inondation', icon: 'waves' },
  erosion: { label: 'Érosion', icon: 'terrain' },
  drought: { label: 'Sécheresse', icon: 'weather-sunny-alert' },
  wildfire: { label: 'Incendie', icon: 'fire' },
  sea_level_rise: { label: 'Montée des eaux', icon: 'wave' },
  landslide: { label: 'Glissement de terrain', icon: 'image-filter-hdr' },
  extreme_heat: { label: 'Chaleur extrême', icon: 'thermometer-high' },
  other: { label: 'Autre risque', icon: 'alert-outline' },
};

const RISK_LEVEL_META: Record<ClimateRiskLevel, { label: string; color: (t: any) => string }> = {
  low: { label: 'Faible', color: (t) => t.success },
  moderate: { label: 'Modéré', color: (t) => t.primary },
  high: { label: 'Élevé', color: (t) => t.warning },
  severe: { label: 'Sévère', color: (t) => t.error },
};

export default function ClimateRiskProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();

  const [profile, setProfile] = useState<ClimateRiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!propertyId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setProfile(await getClimateRiskClient().getProfile(propertyId));
    } catch (err: any) {
      setProfile(null);
      setError(err?.message || 'Aucune donnée de risque climatique disponible.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Risques climatiques</ThemedText>
        </ThemedView>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/climateRisk/add/[propertyId]', params: { propertyId } } as any)}
          style={s.backBtn}
        >
          <Ionicons name="add" size={22} color={theme.primary} />
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
            <MaterialCommunityIcons name="shield-alert-outline" size={16} color={theme.primary} />
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
              Chaque risque est présenté séparément, avec sa source et sa nature exacte : un fait historique
              vérifié, ou une estimation avec sa marge d'incertitude — jamais une prédiction présentée comme
              certaine.
            </ThemedText>
          </ThemedView>

          {(!profile || profile.records.length === 0) && (
            <ThemedView style={{ alignItems: 'center', paddingVertical: 50 }}>
              <MaterialCommunityIcons name="shield-check-outline" size={48} color={theme.onSurface + '30'} />
              <ThemedText style={{ marginTop: 12, opacity: 0.5, textAlign: 'center' }}>
                {error || 'Aucune donnée de risque climatique enregistrée pour cette propriété.'}
              </ThemedText>
            </ThemedView>
          )}

          {profile?.records.map((record) => {
            const hazardMeta = HAZARD_META[record.hazard_type];
            const riskMeta = RISK_LEVEL_META[record.risk_level];
            const riskColor = riskMeta.color(theme);
            const isHistorical = record.data_type === 'historical_record';

            return (
              <ThemedView
                key={record.record_id}
                style={[s.card, { borderColor: riskColor + '30', borderLeftColor: riskColor, borderLeftWidth: 4 }]}
              >
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name={hazardMeta.icon as any} size={18} color={theme.onSurface + '70'} />
                  <ThemedText style={{ fontWeight: '700', fontSize: 15, color: theme.text, flex: 1 }}>
                    {hazardMeta.label}
                  </ThemedText>
                  <ThemedView style={[s.riskChip, { backgroundColor: riskColor + '18' }]}>
                    <ThemedText style={{ color: riskColor, fontSize: 10, fontWeight: '800' }}>
                      {riskMeta.label.toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView
                  style={[
                    s.dataTypeBadge,
                    { backgroundColor: isHistorical ? theme.success + '15' : theme.warning + '15', marginTop: 8 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isHistorical ? 'check-decagram-outline' : 'chart-timeline-variant'}
                    size={13}
                    color={isHistorical ? theme.success : theme.warning}
                  />
                  <ThemedText style={{ fontSize: 11, fontWeight: '800', color: isHistorical ? theme.success : theme.warning }}>
                    {isHistorical ? 'HISTORIQUE VÉRIFIÉ' : 'ESTIMATION'}
                  </ThemedText>
                  {!isHistorical && record.confidence_pct != null && (
                    <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60' }}>
                      · Confiance {record.confidence_pct}%
                    </ThemedText>
                  )}
                </ThemedView>

                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80', marginTop: 8, lineHeight: 18 }}>
                  {record.description}
                </ThemedText>

                {record.margin_of_error_note && (
                  <ThemedText style={{ fontSize: 11, color: theme.onSurface + '55', marginTop: 6, fontStyle: 'italic' }}>
                    {record.margin_of_error_note}
                  </ThemedText>
                )}

                <ThemedText style={{ fontSize: 11, color: theme.onSurface + '50', marginTop: 8 }}>
                  Source : {record.source}
                  {record.event_date ? ` · Événement : ${new Date(record.event_date).toLocaleDateString('fr-FR')}` : ''}
                </ThemedText>
              </ThemedView>
            );
          })}
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
  riskChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  dataTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});
