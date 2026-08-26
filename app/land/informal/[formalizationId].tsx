/**
 * land/informal/[formalizationId].tsx — formalization journey detail: the
 * full stage timeline (verified/pending/rejected), evidence submission for
 * the next stage, and review actions. On reaching FullyRecognized, a real
 * LegalTokenDoc is minted server-side (resulting_token_id appears).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getLandClient, InformalHousingFormalization, FormalizationStage, StageStatus } from '@/services/api/landClient';

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

const STATUS_META: Record<StageStatus, { label: string; color: (t: any) => string }> = {
  pending: { label: 'À venir', color: (t) => t.onSurface },
  evidence_submitted: { label: 'En attente de revue', color: (t) => t.warning },
  verified: { label: 'Validée', color: (t) => t.success },
  rejected: { label: 'Rejetée', color: (t) => t.error },
};

export default function InformalFormalizationDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { formalizationId } = useLocalSearchParams<{ formalizationId: string }>();

  const [formalization, setFormalization] = useState<InformalHousingFormalization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidenceType, setEvidenceType] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');

  const load = useCallback(async () => {
    if (!formalizationId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setFormalization(await getLandClient().getInformalFormalization(formalizationId));
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger le parcours.');
    } finally {
      setLoading(false);
    }
  }, [formalizationId]);

  useEffect(() => { load(); }, [load]);

  const nextStage = (): FormalizationStage | null => {
    if (!formalization) return null;
    const idx = STAGE_ORDER.indexOf(formalization.current_stage);
    return STAGE_ORDER[idx + 1] || null;
  };

  const handleSubmitEvidence = async () => {
    if (!formalizationId || !user?.id) return;
    if (!evidenceType.trim() || !evidenceUrl.trim() || !evidenceDescription.trim()) {
      Alert.alert('Champs requis', "Renseignez le type, l'URL et la description de la preuve.");
      return;
    }
    setBusy(true);
    try {
      await getLandClient().submitFormalizationEvidence(formalizationId, {
        evidenceType: evidenceType.trim(), url: evidenceUrl.trim(), description: evidenceDescription.trim(), submittedBy: user.id,
      });
      setShowEvidenceForm(false);
      setEvidenceType(''); setEvidenceUrl(''); setEvidenceDescription('');
      await load();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible de soumettre la preuve.");
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async (approved: boolean) => {
    if (!formalizationId || !user?.id) return;
    setBusy(true);
    try {
      await getLandClient().reviewFormalizationStage(formalizationId, {
        approved, reviewedBy: user.id, reviewNotes: approved ? 'Validée' : 'Rejetée',
      });
      await load();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible de traiter la revue.");
    } finally {
      setBusy(false);
    }
  };

  const pendingNext = nextStage();
  const nextStageRecord = formalization?.stages.find((s) => s.stage === pendingNext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }} numberOfLines={1}>
            {formalization?.property_address || 'Parcours'}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {loading ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          {error !== '' && (
            <ThemedView style={[s.box, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={theme.error} />
              <ThemedText style={{ color: theme.error, flex: 1, fontSize: 13 }}>{error}</ThemedText>
            </ThemedView>
          )}

          {formalization && (
            <>
              {formalization.resulting_token_id && (
                <ThemedView style={[s.card, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}>
                  <MaterialCommunityIcons name="certificate-outline" size={24} color={theme.success} style={{ alignSelf: 'center', marginBottom: 6 }} />
                  <ThemedText style={{ textAlign: 'center', color: theme.success, fontWeight: '800' }}>
                    Titre reconnu — un acte a été émis
                  </ThemedText>
                </ThemedView>
              )}

              {formalization.is_disputed && (
                <ThemedView style={[s.box, { backgroundColor: theme.error + '10', borderColor: theme.error + '30' }]}>
                  <MaterialCommunityIcons name="alert-decagram-outline" size={16} color={theme.error} />
                  <ThemedText style={{ color: theme.error, flex: 1, fontSize: 13 }}>
                    Ce parcours est contesté : {formalization.dispute_notes}
                  </ThemedText>
                </ThemedView>
              )}

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText style={[s.label, { color: theme.text, marginBottom: 10 }]}>Étapes du parcours</ThemedText>
                {STAGE_ORDER.map((stage) => {
                  const record = formalization.stages.find((st) => st.stage === stage);
                  const status = record?.status || 'pending';
                  const meta = STATUS_META[status];
                  const color = meta.color(theme);
                  return (
                    <ThemedView key={stage} style={s.stageRow}>
                      <MaterialCommunityIcons
                        name={status === 'verified' ? 'check-circle' : status === 'rejected' ? 'close-circle' : status === 'evidence_submitted' ? 'clock-outline' : 'circle-outline'}
                        size={18} color={color}
                      />
                      <ThemedView style={{ flex: 1 }}>
                        <ThemedText style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{STAGE_LABELS[stage]}</ThemedText>
                        <ThemedText style={{ fontSize: 11, color, fontWeight: '600' }}>{meta.label}</ThemedText>
                      </ThemedView>
                    </ThemedView>
                  );
                })}
              </ThemedView>

              {pendingNext && !formalization.is_disputed && (
                <>
                  {(!nextStageRecord || nextStageRecord.status === 'rejected') && !showEvidenceForm && (
                    <TouchableOpacity style={[s.cta, { backgroundColor: theme.primary }]} onPress={() => setShowEvidenceForm(true)}>
                      <MaterialCommunityIcons name="file-upload-outline" size={18} color="#fff" />
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
                        Soumettre une preuve — {STAGE_LABELS[pendingNext]}
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {showEvidenceForm && (
                    <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                      <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>
                        Preuve pour : {STAGE_LABELS[pendingNext]}
                      </ThemedText>
                      <TextInput
                        value={evidenceType} onChangeText={setEvidenceType}
                        placeholder="Type (ex: facture, attestation, rapport d'enquête)" placeholderTextColor={theme.onSurface + '40'}
                        style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                      />
                      <TextInput
                        value={evidenceUrl} onChangeText={setEvidenceUrl} autoCapitalize="none"
                        placeholder="URL du document" placeholderTextColor={theme.onSurface + '40'}
                        style={[s.input, { color: theme.text, borderColor: theme.outline + '30', marginTop: 8 }]}
                      />
                      <TextInput
                        value={evidenceDescription} onChangeText={setEvidenceDescription} multiline
                        placeholder="Description" placeholderTextColor={theme.onSurface + '40'}
                        style={[s.input, { color: theme.text, borderColor: theme.outline + '30', minHeight: 60, paddingTop: 10, marginTop: 8 }]}
                      />
                      <TouchableOpacity
                        style={[s.cta, { backgroundColor: busy ? theme.outline : theme.primary, marginTop: 10 }]}
                        onPress={handleSubmitEvidence} disabled={busy}
                      >
                        {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Soumettre</ThemedText>}
                      </TouchableOpacity>
                    </ThemedView>
                  )}

                  {nextStageRecord?.status === 'evidence_submitted' && (
                    <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={[s.cta, { flex: 1, backgroundColor: theme.error }]}
                        onPress={() => handleReview(false)} disabled={busy}
                      >
                        <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Rejeter</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.cta, { flex: 1, backgroundColor: theme.success }]}
                        onPress={() => handleReview(true)} disabled={busy}
                      >
                        <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Valider</ThemedText>
                      </TouchableOpacity>
                    </ThemedView>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  label: { fontWeight: '800', fontSize: 14 },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
});
