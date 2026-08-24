/**
 * vacancyBridge/[occupancyId].tsx — temporary occupancy detail. No
 * maintenance check-in log here (unlike urbanReuse) — this is a plain
 * stopgap fee arrangement, not a community upkeep exchange. The only
 * manual action is cancelling before a tenant is found; ending on a real
 * reservation being paid is automatic (VacancyBridgeService.closeOnTenantFound,
 * server-side) and never appears as a button here.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getVacancyBridgeClient, TemporaryOccupancy } from '@/services/api/vacancyBridgeClient';

const STATUS_META: Record<TemporaryOccupancy['status'], { label: string; color: (t: any) => string }> = {
  requested: { label: 'Demande en attente', color: (t) => t.warning },
  active: { label: 'Actif', color: (t) => t.success },
  rejected: { label: 'Demande refusée', color: (t) => t.error },
  ended_tenant_found: { label: 'Terminé — locataire trouvé', color: (t) => t.primary },
  ended_owner_cancelled: { label: 'Annulé par le propriétaire', color: (t) => t.onSurface },
};

const PURPOSE_LABEL: Record<string, string> = { rent: 'Location recherchée', sale: 'Vente recherchée' };

export default function TemporaryOccupancyDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { occupancyId } = useLocalSearchParams<{ occupancyId: string }>();

  const [occupancy, setOccupancy] = useState<TemporaryOccupancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!occupancyId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const o = await getVacancyBridgeClient().getOccupancy(occupancyId);
      setOccupancy(o);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger le comblement temporaire.");
    } finally {
      setLoading(false);
    }
  }, [occupancyId]);

  useEffect(() => { load(); }, [load]);

  const isOwner = occupancy && user?.id === occupancy.ownerId;
  // Seul l'occupant paie la redevance mensuelle — aucune vérification
  // n'existait jusqu'ici (ni auth, ni identité), le bouton était donc
  // actionnable par n'importe quel visiteur atteignant cette page.
  const isOccupant = occupancy && user?.id === occupancy.occupantUserId;

  const handlePayFee = async () => {
    if (!occupancyId) return;
    if (!user?.id) {
      Alert.alert('Connexion requise', 'Connectez-vous pour effectuer ce paiement.');
      return;
    }
    if (!isOccupant) {
      Alert.alert('Action non autorisée', 'Seul l\'occupant de ce comblement temporaire peut effectuer ce paiement.');
      return;
    }
    setBusy(true);
    try {
      await getVacancyBridgeClient().payMonthlyFee(occupancyId);
      await load();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de payer.');
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async () => {
    if (!occupancyId) return;
    setBusy(true);
    try {
      await getVacancyBridgeClient().acceptRequest(occupancyId);
      await load();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible d'accepter la demande.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!occupancyId) return;
    Alert.alert(
      'Refuser la demande',
      'Un motif de refus est requis.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser', style: 'destructive', onPress: async () => {
            setBusy(true);
            try {
              await getVacancyBridgeClient().rejectRequest(occupancyId, 'Candidature non retenue');
              await load();
            } catch (err: any) {
              Alert.alert('Erreur', err?.message || 'Impossible de refuser la demande.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = async () => {
    if (!occupancyId) return;
    Alert.alert(
      'Annuler le comblement temporaire',
      'Le bien redevient simplement vacant, en attente de bailleur.',
      [
        { text: 'Garder', style: 'cancel' },
        {
          text: 'Annuler', style: 'destructive', onPress: async () => {
            setBusy(true);
            try {
              await getVacancyBridgeClient().cancel(occupancyId);
              await load();
            } catch (err: any) {
              Alert.alert('Erreur', err?.message || "Impossible d'annuler.");
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const statusMeta = occupancy ? STATUS_META[occupancy.status] : null;
  const statusColor = statusMeta ? statusMeta.color(theme) : theme.text;

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

          {occupancy && (
            <>
              <ThemedView style={[s.card, { backgroundColor: statusColor + '10', borderColor: statusColor + '30' }]}>
                <ThemedText style={{ fontWeight: '900', color: statusColor, fontSize: 15, textAlign: 'center' }}>
                  {statusMeta?.label.toUpperCase()}
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '70', textAlign: 'center', marginTop: 6 }}>
                  {PURPOSE_LABEL[occupancy.propertyPurpose]}
                </ThemedText>
                {occupancy.monthlyFee > 0 && (
                  <ThemedText style={{ fontSize: 13, color: theme.onSurface + '70', textAlign: 'center', marginTop: 4 }}>
                    Redevance : {occupancy.monthlyFee.toLocaleString()} {occupancy.currency}/mois
                  </ThemedText>
                )}
                {occupancy.status === 'rejected' && occupancy.rejectionReason && (
                  <ThemedText style={{ fontSize: 12, color: theme.onSurface + '55', textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>
                    {occupancy.rejectionReason}
                  </ThemedText>
                )}
              </ThemedView>

              {occupancy.requestMessage && (
                <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  <ThemedText style={{ fontWeight: '800', fontSize: 14, color: theme.text, marginBottom: 6 }}>Message du candidat</ThemedText>
                  <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80', lineHeight: 18, fontStyle: 'italic' }}>
                    "{occupancy.requestMessage}"
                  </ThemedText>
                </ThemedView>
              )}

              {/* Demande en attente — le propriétaire accepte (active
                  l'occupation telle quelle) ou refuse avec motif. Un client
                  candidat voit le même statut mais sans ces actions. */}
              {isOwner && occupancy.status === 'requested' && (
                <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[s.cta, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.error + '40' }]}
                    onPress={handleReject} disabled={busy}
                  >
                    <ThemedText style={{ color: theme.error, fontWeight: '700', fontSize: 13 }}>Refuser</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.cta, { flex: 1, backgroundColor: busy ? theme.outline : theme.success }]}
                    onPress={handleAccept} disabled={busy}
                  >
                    {busy ? <ActivityIndicator color="#fff" /> : (
                      <>
                        <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
                        <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Accepter</ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                </ThemedView>
              )}

              {occupancy.status === 'ended_tenant_found' && (
                <ThemedView style={[s.card, { backgroundColor: theme.primary + '08', borderColor: theme.primary + '20' }]}>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="check-circle-outline" size={18} color={theme.primary} />
                    <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80', flex: 1 }}>
                      Un vrai locataire/acheteur a été trouvé — ce comblement s'est terminé automatiquement.
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}

              {occupancy.status === 'active' && occupancy.monthlyFee > 0 && isOccupant && (
                <TouchableOpacity style={[s.cta, { backgroundColor: theme.primary }]} onPress={handlePayFee} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <MaterialCommunityIcons name="cash-plus" size={18} color="#fff" />
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Payer la redevance du mois</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {isOwner && occupancy.status === 'active' && (
                <TouchableOpacity
                  style={[s.cta, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.error + '40' }]}
                  onPress={handleCancel} disabled={busy}
                >
                  <ThemedText style={{ color: theme.error, fontWeight: '700', fontSize: 13 }}>Annuler le comblement</ThemedText>
                </TouchableOpacity>
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
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
});
