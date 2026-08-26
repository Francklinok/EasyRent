/**
 * land/consolidation/[projectId].tsx — consolidation project management:
 * invite parcels, owners commit/exit, open the consensus vote, and
 * finalize. A single holdout can dissolve the project (and exit) — never
 * outvoted into a forced merge (DormantLandService.finalize_consolidation
 * enforces this server-side: every committed contributor must vote).
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
import { getLandClient, ParcelConsolidationProject } from '@/services/api/landClient';

const STATUS_META: Record<ParcelConsolidationProject['status'], { label: string; color: (t: any) => string }> = {
  proposed: { label: 'Proposé', color: (t) => t.primary },
  voting: { label: 'Vote en cours', color: (t) => t.warning },
  consolidated: { label: 'Consolidé', color: (t) => t.success },
  dissolved: { label: 'Dissous', color: (t) => t.onSurface },
};

const CONTRIBUTION_META: Record<string, { label: string; color: (t: any) => string }> = {
  pending: { label: 'En attente', color: (t) => t.onSurface },
  committed: { label: 'Engagée', color: (t) => t.success },
  exited: { label: 'Retirée', color: (t) => t.error },
};

export default function ConsolidationProjectDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const [project, setProject] = useState<ParcelConsolidationProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [tokenId, setTokenId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [parcelValuation, setParcelValuation] = useState('');

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setProject(await getLandClient().getConsolidationProject(projectId));
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger le projet.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async () => {
    if (!projectId) return;
    const valuationVal = parseFloat(parcelValuation);
    if (!tokenId.trim() || !ownerId.trim() || !valuationVal || valuationVal <= 0) {
      Alert.alert('Champs requis', 'Indiquez le titre foncier, le propriétaire et la valeur estimée.');
      return;
    }
    setBusy(true);
    try {
      const updated = await getLandClient().inviteContribution(projectId, {
        tokenId: tokenId.trim(), ownerId: ownerId.trim(), parcelValuation: valuationVal,
      });
      setProject(updated);
      setShowInviteForm(false);
      setTokenId(''); setOwnerId(''); setParcelValuation('');
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible d'inviter cette parcelle.");
    } finally {
      setBusy(false);
    }
  };

  const handleCommit = async (contributionId: string) => {
    if (!projectId) return;
    setBusy(true);
    try {
      setProject(await getLandClient().commitContribution(projectId, contributionId));
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible d'engager la parcelle.");
    } finally {
      setBusy(false);
    }
  };

  const handleExit = async (contributionId: string) => {
    if (!projectId) return;
    Alert.alert('Se retirer du projet', 'Confirmer le retrait de cette parcelle ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Se retirer', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            setProject(await getLandClient().exitContribution(projectId, contributionId, { reason: 'Retrait du propriétaire' }));
          } catch (err: any) {
            Alert.alert('Erreur', err?.message || "Impossible de se retirer.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const handleOpenVote = async () => {
    if (!projectId) return;
    setBusy(true);
    try {
      setProject(await getLandClient().openConsolidationVote(projectId));
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible d'ouvrir le vote.");
    } finally {
      setBusy(false);
    }
  };

  const handleVote = async (approve: boolean) => {
    if (!projectId || !user?.id) return;
    setBusy(true);
    try {
      setProject(await getLandClient().castConsolidationVote(projectId, { voterOwnerId: user.id, approve }));
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible d'enregistrer le vote.");
    } finally {
      setBusy(false);
    }
  };

  const handleFinalize = async () => {
    if (!projectId) return;
    setBusy(true);
    try {
      const updated = await getLandClient().finalizeConsolidation(projectId);
      setProject(updated);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de finaliser.');
    } finally {
      setBusy(false);
    }
  };

  const statusMeta = project ? STATUS_META[project.status] : null;
  const statusColor = statusMeta ? statusMeta.color(theme) : theme.text;
  const committedContributions = project?.contributions.filter((c) => c.status === 'committed') || [];
  const hasVoted = user?.id ? project?.votes.some((v) => v.voter_owner_id === user.id) : false;
  const isCommittedContributor = user?.id ? committedContributions.some((c) => c.owner_id === user.id) : false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }} numberOfLines={1}>
            {project?.project_name || 'Projet'}
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

          {project && (
            <>
              <ThemedView style={[s.card, { backgroundColor: statusColor + '10', borderColor: statusColor + '30' }]}>
                <ThemedText style={{ fontWeight: '900', color: statusColor, fontSize: 15, textAlign: 'center' }}>
                  {statusMeta?.label.toUpperCase()}
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '70', textAlign: 'center', marginTop: 6 }}>
                  {project.description}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.onSurface + '55', textAlign: 'center', marginTop: 6 }}>
                  Seuil de consensus : {project.approval_threshold_pct}%
                </ThemedText>
              </ThemedView>

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <ThemedText style={[s.label, { color: theme.text }]}>
                    Parcelles ({project.contributions.length})
                  </ThemedText>
                  {project.status === 'proposed' && !showInviteForm && (
                    <TouchableOpacity onPress={() => setShowInviteForm(true)} style={s.smallBtn}>
                      <Ionicons name="add" size={14} color={theme.primary} />
                      <ThemedText style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>Inviter</ThemedText>
                    </TouchableOpacity>
                  )}
                </ThemedView>

                {showInviteForm && (
                  <ThemedView style={{ marginBottom: 10, gap: 8 }}>
                    <TextInput
                      value={tokenId} onChangeText={setTokenId}
                      placeholder="Identifiant du titre foncier" placeholderTextColor={theme.onSurface + '40'}
                      style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                    />
                    <TextInput
                      value={ownerId} onChangeText={setOwnerId}
                      placeholder="Identifiant du propriétaire" placeholderTextColor={theme.onSurface + '40'}
                      style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                    />
                    <TextInput
                      value={parcelValuation} onChangeText={setParcelValuation} keyboardType="decimal-pad"
                      placeholder="Valeur estimée de la parcelle" placeholderTextColor={theme.onSurface + '40'}
                      style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                    />
                    <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={[s.cta, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.outline + '40', height: 44 }]}
                        onPress={() => setShowInviteForm(false)}
                      >
                        <ThemedText style={{ color: theme.onSurface + '70', fontWeight: '700', fontSize: 13 }}>Annuler</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.cta, { flex: 1, backgroundColor: busy ? theme.outline : theme.primary, height: 44 }]}
                        onPress={handleInvite} disabled={busy}
                      >
                        {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Inviter</ThemedText>}
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>
                )}

                {project.contributions.map((c) => {
                  const meta = CONTRIBUTION_META[c.status];
                  const color = meta.color(theme);
                  return (
                    <ThemedView key={c.contribution_id} style={[s.contributionCard, { borderColor: theme.outline + '20' }]}>
                      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ThemedView style={{ flex: 1 }}>
                          <ThemedText style={{ fontWeight: '700', color: theme.text, fontSize: 13 }}>
                            Valeur : {c.parcel_valuation.toLocaleString()}
                          </ThemedText>
                          {c.status === 'committed' && (
                            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
                              Part : {c.ownership_pct.toFixed(1)}%
                            </ThemedText>
                          )}
                        </ThemedView>
                        <ThemedView style={[s.statusChip, { backgroundColor: color + '18' }]}>
                          <ThemedText style={{ color, fontSize: 10, fontWeight: '800' }}>{meta.label.toUpperCase()}</ThemedText>
                        </ThemedView>
                      </ThemedView>

                      {c.status === 'pending' && c.owner_id === user?.id && (
                        <TouchableOpacity
                          style={[s.smallBtn, { borderColor: theme.success + '40', marginTop: 8, alignSelf: 'flex-start' }]}
                          onPress={() => handleCommit(c.contribution_id)} disabled={busy}
                        >
                          <Ionicons name="checkmark" size={14} color={theme.success} />
                          <ThemedText style={{ color: theme.success, fontSize: 12, fontWeight: '700' }}>Engager ma parcelle</ThemedText>
                        </TouchableOpacity>
                      )}
                      {c.status === 'committed' && c.owner_id === user?.id && project.status !== 'consolidated' && (
                        <TouchableOpacity
                          style={[s.smallBtn, { borderColor: theme.error + '40', marginTop: 8, alignSelf: 'flex-start' }]}
                          onPress={() => handleExit(c.contribution_id)} disabled={busy}
                        >
                          <Ionicons name="exit-outline" size={14} color={theme.error} />
                          <ThemedText style={{ color: theme.error, fontSize: 12, fontWeight: '700' }}>Se retirer</ThemedText>
                        </TouchableOpacity>
                      )}
                    </ThemedView>
                  );
                })}
              </ThemedView>

              {project.status === 'proposed' && committedContributions.length > 0 && (
                <TouchableOpacity style={[s.cta, { backgroundColor: theme.warning }]} onPress={handleOpenVote} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <MaterialCommunityIcons name="vote-outline" size={18} color="#fff" />
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Ouvrir le vote de consensus</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {project.status === 'voting' && (
                <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>
                    Votes ({project.votes.length}/{committedContributions.length})
                  </ThemedText>

                  {isCommittedContributor && !hasVoted && (
                    <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={[s.cta, { flex: 1, backgroundColor: theme.error, height: 44 }]}
                        onPress={() => handleVote(false)} disabled={busy}
                      >
                        <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Rejeter</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.cta, { flex: 1, backgroundColor: theme.success, height: 44 }]}
                        onPress={() => handleVote(true)} disabled={busy}
                      >
                        <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Approuver</ThemedText>
                      </TouchableOpacity>
                    </ThemedView>
                  )}
                  {hasVoted && (
                    <ThemedText style={{ fontSize: 13, color: theme.onSurface + '60', textAlign: 'center' }}>
                      Votre vote a été enregistré.
                    </ThemedText>
                  )}

                  {project.votes.length >= committedContributions.length && committedContributions.length > 0 && (
                    <TouchableOpacity
                      style={[s.cta, { backgroundColor: busy ? theme.outline : theme.primary, marginTop: 10 }]}
                      onPress={handleFinalize} disabled={busy}
                    >
                      {busy ? <ActivityIndicator color="#fff" /> : (
                        <>
                          <MaterialCommunityIcons name="check-decagram-outline" size={18} color="#fff" />
                          <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Finaliser</ThemedText>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </ThemedView>
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
  contributionCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
});
