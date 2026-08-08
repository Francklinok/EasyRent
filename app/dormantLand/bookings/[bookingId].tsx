/**
 * dormantLand/bookings/[bookingId].tsx — booking workflow: requested →
 * confirmed (owner action, collects payment via WalletGateway) → active →
 * completed, or rejected/cancelled (refunds if already paid).
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
import { getDormantLandClient, UsageBooking } from '@/services/api/dormantLandClient';

const STATUS_META: Record<UsageBooking['status'], { label: string; color: (t: any) => string }> = {
  requested: { label: 'Demandée', color: (t) => t.primary },
  confirmed: { label: 'Confirmée', color: (t) => t.success },
  active: { label: 'En cours', color: (t) => t.warning },
  completed: { label: 'Terminée', color: (t) => t.success },
  cancelled: { label: 'Annulée', color: (t) => t.onSurface },
  rejected: { label: 'Rejetée', color: (t) => t.error },
};

export default function BookingDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<UsageBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [agreementNotes, setAgreementNotes] = useState('');
  const [showConfirmForm, setShowConfirmForm] = useState(false);

  const load = useCallback(async () => {
    if (!bookingId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setBooking(await getDormantLandClient().getBooking(bookingId));
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger la réservation.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { load(); }, [load]);

  const isOwner = booking && user?.id === booking.ownerId;

  const handleConfirm = async () => {
    if (!bookingId) return;
    setBusy(true);
    try {
      const updated = await getDormantLandClient().confirmBooking(bookingId, agreementNotes.trim());
      setBooking(updated);
      setShowConfirmForm(false);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de confirmer la réservation.');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!bookingId) return;
    setBusy(true);
    try {
      setBooking(await getDormantLandClient().rejectBooking(bookingId, "Rejetée par le propriétaire"));
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de rejeter la réservation.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId) return;
    Alert.alert('Annuler la réservation', booking?.status === 'confirmed' ? 'Vous serez remboursé intégralement. Continuer ?' : 'Confirmer l\'annulation ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Annuler', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            setBooking(await getDormantLandClient().cancelBooking(bookingId, 'Annulée par le demandeur'));
          } catch (err: any) {
            Alert.alert('Erreur', err?.message || "Impossible d'annuler.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const handleActivate = async () => {
    if (!bookingId) return;
    setBusy(true);
    try {
      setBooking(await getDormantLandClient().activateBooking(bookingId));
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible d'activer.");
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async () => {
    if (!bookingId) return;
    setBusy(true);
    try {
      setBooking(await getDormantLandClient().completeBooking(bookingId));
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de finaliser.');
    } finally {
      setBusy(false);
    }
  };

  const statusMeta = booking ? STATUS_META[booking.status] : null;
  const statusColor = statusMeta ? statusMeta.color(theme) : theme.text;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Réservation</ThemedText>
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

          {booking && (
            <>
              <ThemedView style={[s.card, { backgroundColor: statusColor + '10', borderColor: statusColor + '30' }]}>
                <ThemedText style={{ fontWeight: '900', color: statusColor, fontSize: 15, textAlign: 'center' }}>
                  {statusMeta?.label.toUpperCase()}
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '70', textAlign: 'center', marginTop: 6 }}>
                  {new Date(booking.startDate).toLocaleDateString('fr-FR')} → {new Date(booking.endDate).toLocaleDateString('fr-FR')}
                </ThemedText>
                <ThemedText style={{ fontSize: 18, fontWeight: '900', color: theme.text, textAlign: 'center', marginTop: 6 }}>
                  {booking.totalAmount.toLocaleString()} {booking.currency}
                </ThemedText>
                {booking.usageAgreementNotes && (
                  <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                    {booking.usageAgreementNotes}
                  </ThemedText>
                )}
              </ThemedView>

              {isOwner && booking.status === 'requested' && !showConfirmForm && (
                <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[s.cta, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.error + '40' }]}
                    onPress={handleReject} disabled={busy}
                  >
                    <ThemedText style={{ color: theme.error, fontWeight: '700', fontSize: 13 }}>Rejeter</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.cta, { flex: 2, backgroundColor: theme.success }]}
                    onPress={() => setShowConfirmForm(true)} disabled={busy}
                  >
                    <MaterialCommunityIcons name="check-decagram-outline" size={18} color="#fff" />
                    <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Confirmer</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              )}

              {showConfirmForm && (
                <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>
                    Cadre contractuel de cet usage temporaire
                  </ThemedText>
                  <TextInput
                    value={agreementNotes} onChangeText={setAgreementNotes} multiline
                    placeholder="ex: autorisation d'usage temporaire, statut foncier confirmé, durée non-renouvelable"
                    placeholderTextColor={theme.onSurface + '40'}
                    style={[s.input, { color: theme.text, borderColor: theme.outline + '30', minHeight: 70, paddingTop: 10 }]}
                  />
                  <TouchableOpacity
                    style={[s.cta, { backgroundColor: busy ? theme.outline : theme.success, marginTop: 10 }]}
                    onPress={handleConfirm} disabled={busy}
                  >
                    {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Confirmer et encaisser</ThemedText>}
                  </TouchableOpacity>
                </ThemedView>
              )}

              {booking.status === 'confirmed' && (
                <TouchableOpacity style={[s.cta, { backgroundColor: theme.warning }]} onPress={handleActivate} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <MaterialCommunityIcons name="play" size={18} color="#fff" />
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Marquer comme en cours</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {(booking.status === 'active' || booking.status === 'confirmed') && (
                <TouchableOpacity style={[s.cta, { backgroundColor: theme.success }]} onPress={handleComplete} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Marquer comme terminée</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {(booking.status === 'requested' || booking.status === 'confirmed') && !showConfirmForm && (
                <TouchableOpacity
                  style={[s.cta, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.error + '40' }]}
                  onPress={handleCancel} disabled={busy}
                >
                  <ThemedText style={{ color: theme.error, fontWeight: '700', fontSize: 13 }}>Annuler la réservation</ThemedText>
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
  label: { fontWeight: '800', fontSize: 14 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
});
