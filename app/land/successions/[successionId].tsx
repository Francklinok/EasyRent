/**
 * land/successions/[successionId].tsx — succession management: identify
 * heirs, submit supporting documents, recognize/reject after review, flag a
 * dispute, and resolve once every claim is settled. This is the "unblocking
 * mechanism" from the master document §3.2 — never an automatic outcome,
 * always a documented, auditable status per heir.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getLandClient, SuccessionRecord, SuccessionStatus, HeirRecognitionStatus } from '@/services/api/landClient';

const SUCCESSION_STATUS_META: Record<SuccessionStatus, { label: string; color: (t: any) => string }> = {
  open: { label: 'Ouverte', color: (t) => t.primary },
  heirs_identified: { label: 'Héritiers identifiés', color: (t) => t.primary },
  partially_recognized: { label: 'Partiellement reconnue', color: (t) => t.warning },
  fully_recognized: { label: 'Entièrement reconnue', color: (t) => t.success },
  resolved: { label: 'Résolue', color: (t) => t.success },
  disputed: { label: 'Contestée', color: (t) => t.error },
};

const HEIR_STATUS_META: Record<HeirRecognitionStatus, { label: string; color: (t: any) => string }> = {
  claimed: { label: 'Déclaré', color: (t) => t.onSurface },
  documented: { label: 'Document soumis', color: (t) => t.primary },
  recognized: { label: 'Reconnu', color: (t) => t.success },
  rejected: { label: 'Rejeté', color: (t) => t.error },
};

export default function SuccessionDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { successionId } = useLocalSearchParams<{ successionId: string }>();

  const [succession, setSuccession] = useState<SuccessionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [heirName, setHeirName] = useState('');
  const [heirRelationship, setHeirRelationship] = useState('');
  const [addingHeir, setAddingHeir] = useState(false);

  const [disputeNotes, setDisputeNotes] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const load = useCallback(async () => {
    if (!successionId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setSuccession(await getLandClient().getSuccession(successionId));
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger la succession.');
    } finally {
      setLoading(false);
    }
  }, [successionId]);

  useEffect(() => { load(); }, [load]);

  const isDisputed = succession?.status === 'disputed';
  const isResolved = succession?.status === 'resolved';

  const handleAddHeir = async () => {
    if (!successionId) return;
    if (!heirName.trim() || !heirRelationship.trim()) {
      Alert.alert('Champs requis', 'Le nom et le lien de parenté sont requis.');
      return;
    }
    setAddingHeir(true);
    try {
      const updated = await getLandClient().addHeir(successionId, {
        fullName: heirName.trim(), relationshipToDeceased: heirRelationship.trim(),
      });
      setSuccession(updated);
      setHeirName('');
      setHeirRelationship('');
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible d'ajouter l'héritier.");
    } finally {
      setAddingHeir(false);
    }
  };

  const handleSubmitDocument = async (heirId: string) => {
    if (!successionId) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (!file) return;

    setBusy(true);
    try {
      const updated = await getLandClient().submitHeirDocument(successionId, heirId, { documentUrl: file.uri });
      setSuccession(updated);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de soumettre le document.');
    } finally {
      setBusy(false);
    }
  };

  const handleRecognize = async (heirId: string, recognized: boolean) => {
    if (!successionId) return;
    setBusy(true);
    try {
      const updated = await getLandClient().recognizeHeir(successionId, heirId, { recognized });
      setSuccession(updated);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de mettre à jour le statut.');
    } finally {
      setBusy(false);
    }
  };

  const handleDispute = async () => {
    if (!successionId) return;
    if (disputeNotes.trim().length < 5) {
      Alert.alert('Détail requis', 'Merci de préciser la nature du litige.');
      return;
    }
    setBusy(true);
    try {
      const updated = await getLandClient().disputeSuccession(successionId, { notes: disputeNotes.trim() });
      setSuccession(updated);
      setShowDisputeForm(false);
      setDisputeNotes('');
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de signaler le litige.');
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async () => {
    if (!successionId || !succession) return;
    const recognizedHeirs = succession.heirs.filter((h) => h.recognition_status === 'recognized');
    if (recognizedHeirs.length === 0) {
      Alert.alert('Aucun héritier reconnu', 'Au moins un héritier doit être reconnu avant de résoudre la succession.');
      return;
    }
    Alert.alert(
      'Résoudre la succession',
      recognizedHeirs.length === 1
        ? `Transférer le titre à ${recognizedHeirs[0].full_name} ?`
        : `${recognizedHeirs.length} héritiers reconnus — la résolution nécessite un accord entre eux hors de cette application avant transfert.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: async () => {
            setBusy(true);
            try {
              const updated = await getLandClient().resolveSuccession(successionId, {
                transferToOwner: recognizedHeirs.length === 1 ? recognizedHeirs[0].full_name : undefined,
              });
              setSuccession(updated);
            } catch (err: any) {
              Alert.alert('Erreur', err?.message || 'Impossible de résoudre la succession.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const statusMeta = succession ? SUCCESSION_STATUS_META[succession.status] : null;
  const statusColor = statusMeta ? statusMeta.color(theme) : theme.text;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Succession</ThemedText>
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

          {succession && (
            <>
              <ThemedView style={[s.card, { backgroundColor: statusColor + '10', borderColor: statusColor + '30' }]}>
                <ThemedText style={{ fontWeight: '900', color: statusColor, fontSize: 15, textAlign: 'center' }}>
                  {statusMeta?.label.toUpperCase()}
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '70', textAlign: 'center', marginTop: 6 }}>
                  Propriétaire décédé : {succession.deceased_owner_name}
                </ThemedText>
                {succession.notes && (
                  <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>
                    {succession.notes}
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>
                  Héritiers ({succession.heirs.length})
                </ThemedText>
                {succession.heirs.length === 0 && (
                  <ThemedText style={{ color: theme.onSurface + '50', fontSize: 13, marginBottom: 8 }}>
                    Aucun héritier déclaré pour le moment.
                  </ThemedText>
                )}
                {succession.heirs.map((heir) => {
                  const heirMeta = HEIR_STATUS_META[heir.recognition_status];
                  const heirColor = heirMeta.color(theme);
                  return (
                    <ThemedView key={heir.heir_id} style={[s.heirCard, { borderColor: theme.outline + '20' }]}>
                      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ThemedView style={{ flex: 1 }}>
                          <ThemedText style={{ fontWeight: '700', color: theme.text, fontSize: 14 }}>{heir.full_name}</ThemedText>
                          <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>{heir.relationship_to_deceased}</ThemedText>
                        </ThemedView>
                        <ThemedView style={[s.statusChip, { backgroundColor: heirColor + '18' }]}>
                          <ThemedText style={{ color: heirColor, fontSize: 10, fontWeight: '800' }}>{heirMeta.label.toUpperCase()}</ThemedText>
                        </ThemedView>
                      </ThemedView>

                      {heir.declared_share_pct != null && (
                        <ThemedText style={{ fontSize: 12, color: theme.onSurface + '55', marginTop: 4 }}>
                          Part attribuée : {heir.declared_share_pct}%
                        </ThemedText>
                      )}

                      {!isResolved && !isDisputed && heir.recognition_status !== 'recognized' && heir.recognition_status !== 'rejected' && (
                        <ThemedView style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                          {heir.recognition_status === 'claimed' && (
                            <TouchableOpacity
                              style={[s.smallBtn, { borderColor: theme.primary + '40' }]}
                              onPress={() => handleSubmitDocument(heir.heir_id)} disabled={busy}
                            >
                              <MaterialCommunityIcons name="file-upload-outline" size={14} color={theme.primary} />
                              <ThemedText style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>Soumettre un document</ThemedText>
                            </TouchableOpacity>
                          )}
                          {heir.recognition_status === 'documented' && (
                            <>
                              <TouchableOpacity
                                style={[s.smallBtn, { borderColor: theme.success + '40' }]}
                                onPress={() => handleRecognize(heir.heir_id, true)} disabled={busy}
                              >
                                <Ionicons name="checkmark" size={14} color={theme.success} />
                                <ThemedText style={{ color: theme.success, fontSize: 12, fontWeight: '700' }}>Reconnaître</ThemedText>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[s.smallBtn, { borderColor: theme.error + '40' }]}
                                onPress={() => handleRecognize(heir.heir_id, false)} disabled={busy}
                              >
                                <Ionicons name="close" size={14} color={theme.error} />
                                <ThemedText style={{ color: theme.error, fontSize: 12, fontWeight: '700' }}>Rejeter</ThemedText>
                              </TouchableOpacity>
                            </>
                          )}
                        </ThemedView>
                      )}
                    </ThemedView>
                  );
                })}

                {!isResolved && !isDisputed && (
                  <ThemedView style={{ marginTop: 10, gap: 8 }}>
                    <TextInput
                      value={heirName} onChangeText={setHeirName}
                      placeholder="Nom complet de l'héritier" placeholderTextColor={theme.onSurface + '40'}
                      style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                    />
                    <TextInput
                      value={heirRelationship} onChangeText={setHeirRelationship}
                      placeholder="Lien de parenté (ex: fils, fille, conjoint(e))" placeholderTextColor={theme.onSurface + '40'}
                      style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                    />
                    <TouchableOpacity
                      style={[s.cta, { backgroundColor: addingHeir ? theme.outline : theme.primary }]}
                      onPress={handleAddHeir} disabled={addingHeir}
                    >
                      {addingHeir ? <ActivityIndicator color="#fff" /> : (
                        <>
                          <Ionicons name="person-add-outline" size={16} color="#fff" />
                          <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Ajouter un héritier</ThemedText>
                        </>
                      )}
                    </TouchableOpacity>
                  </ThemedView>
                )}
              </ThemedView>

              {!isResolved && (
                <>
                  {showDisputeForm ? (
                    <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.error + '30' }]}>
                      <ThemedText style={[s.label, { color: theme.error, marginBottom: 8 }]}>Signaler un litige</ThemedText>
                      <TextInput
                        value={disputeNotes} onChangeText={setDisputeNotes} multiline
                        placeholder="Décrivez la nature du litige (revendication concurrente, etc.)"
                        placeholderTextColor={theme.onSurface + '40'}
                        style={[s.input, { color: theme.text, borderColor: theme.error + '30', minHeight: 70, paddingTop: 10 }]}
                      />
                      <TouchableOpacity
                        style={[s.cta, { backgroundColor: busy ? theme.outline : theme.error, marginTop: 10 }]}
                        onPress={handleDispute} disabled={busy}
                      >
                        <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Confirmer le litige</ThemedText>
                      </TouchableOpacity>
                    </ThemedView>
                  ) : (
                    <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                      {!isDisputed && (
                        <TouchableOpacity
                          style={[s.cta, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.error + '40' }]}
                          onPress={() => setShowDisputeForm(true)}
                        >
                          <ThemedText style={{ color: theme.error, fontWeight: '700', fontSize: 13 }}>Signaler un litige</ThemedText>
                        </TouchableOpacity>
                      )}
                      {!isDisputed && (
                        <TouchableOpacity
                          style={[s.cta, { flex: 2, backgroundColor: busy ? theme.outline : theme.success }]}
                          onPress={handleResolve} disabled={busy}
                        >
                          {busy ? <ActivityIndicator color="#fff" /> : (
                            <>
                              <MaterialCommunityIcons name="check-decagram-outline" size={18} color="#fff" />
                              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Résoudre la succession</ThemedText>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
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
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  heirCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
});
