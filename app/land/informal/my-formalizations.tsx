/**
 * land/informal/my-formalizations.tsx — an occupant's informal-housing
 * formalization journeys and their current stage.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getLandClient, InformalHousingFormalization, FormalizationStage } from '@/services/api/landClient';

const STAGE_LABELS: Record<FormalizationStage, string> = {
  occupancy_declared: 'Occupation déclarée',
  occupancy_documented: 'Occupation documentée',
  social_survey_completed: 'Enquête sociale complétée',
  provisional_permit_issued: 'Permis provisoire délivré',
  cadastral_surveyed: 'Levé cadastral effectué',
  dispute_window_cleared: 'Fenêtre de contestation passée',
  fully_recognized: 'Pleinement reconnu',
};

const STAGE_ORDER: FormalizationStage[] = [
  'occupancy_declared', 'occupancy_documented', 'social_survey_completed',
  'provisional_permit_issued', 'cadastral_surveyed', 'dispute_window_cleared', 'fully_recognized',
];

export default function MyInformalFormalizationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formalizations, setFormalizations] = useState<InformalHousingFormalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getLandClient().getInformalFormalizationsByOccupant(user.id);
      setFormalizations(data);
    } catch (err) {
      console.error('[MyInformalFormalizations] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        <ThemedView style={[styles.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={theme.primary} />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Un accompagnement progressif vers un titre reconnu — chaque étape franchie reste acquise.
          </ThemedText>
        </ThemedView>

        <TouchableOpacity
          style={[styles.smallCta, { backgroundColor: theme.primary, alignSelf: 'flex-start', paddingHorizontal: 16 }]}
          onPress={() => router.push('/land/informal/start' as any)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Démarrer un parcours</ThemedText>
        </TouchableOpacity>

        {formalizations.length === 0 ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 50 }}>
            <MaterialCommunityIcons name="home-outline" size={48} color={theme.onSurface + '30'} />
            <ThemedText style={{ marginTop: 12, opacity: 0.5, textAlign: 'center' }}>
              Aucun parcours de formalisation pour le moment.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={{ gap: 12 }}>
            {formalizations.map((f) => {
              const stageIndex = STAGE_ORDER.indexOf(f.current_stage);
              const progressPct = ((stageIndex + 1) / STAGE_ORDER.length) * 100;
              const color = f.is_disputed ? theme.error : f.current_stage === 'fully_recognized' ? theme.success : theme.primary;
              return (
                <TouchableOpacity
                  key={f.formalization_id}
                  onPress={() => router.push({ pathname: '/land/informal/[formalizationId]', params: { formalizationId: f.formalization_id } } as any)}
                  style={[styles.card, { borderColor: color + '30', borderLeftColor: color, borderLeftWidth: 4 }]}
                >
                  <ThemedText style={styles.addressText} numberOfLines={1}>{f.property_address}</ThemedText>
                  <ThemedText style={[styles.stageText, { color }]}>{STAGE_LABELS[f.current_stage]}</ThemedText>
                  <ThemedView style={[styles.progressTrack, { backgroundColor: theme.outline + '20' }]}>
                    <ThemedView style={[styles.progressFill, { backgroundColor: color, width: `${progressPct}%` }]} />
                  </ThemedView>
                  {f.is_disputed && (
                    <ThemedText style={{ fontSize: 11, color: theme.error, fontWeight: '700', marginTop: 4 }}>
                      Contesté
                    </ThemedText>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  smallCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  addressText: { fontSize: 15, fontWeight: '700' },
  stageText: { fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
});
