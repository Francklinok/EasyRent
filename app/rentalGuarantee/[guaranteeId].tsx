/**
 * rentalGuarantee/[guaranteeId].tsx — guarantee detail: status, running
 * totals, and the claim workflow (file → review → approve/reject → payout).
 * Filing is gated server-side by the grace period (RentalGuaranteeService.
 * fileClaim) — this screen surfaces that constraint but never bypasses it.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import {
  getRentalGuaranteeClient, RentalGuarantee, GuaranteeClaim, ClaimStatus,
} from '@/services/api/rentalGuaranteeClient';

const GUARANTEE_STATUS_META: Record<RentalGuarantee['status'], { label: string; color: (t: any) => string }> = {
  active: { label: 'Active', color: (t) => t.success },
  suspended: { label: 'Suspendue', color: (t) => t.warning },
  cancelled: { label: 'Annulée', color: (t) => t.onSurface },
  expired: { label: 'Expirée', color: (t) => t.onSurface },
};

const CLAIM_STATUS_META: Record<ClaimStatus, { label: string; color: (t: any) => string }> = {
  filed: { label: 'Déposée', color: (t) => t.primary },
  under_review: { label: 'En examen', color: (t) => t.warning },
  approved: { label: 'Approuvée', color: (t) => t.success },
  rejected: { label: 'Rejetée', color: (t) => t.error },
  paid: { label: 'Indemnisée', color: (t) => t.success },
};

export default function GuaranteeDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { guaranteeId } = useLocalSearchParams<{ guaranteeId: string }>();

  const [guarantee, setGuarantee] = useState<RentalGuarantee | null>(null);
  const [claims, setClaims] = useState<GuaranteeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [periodMonth, setPeriodMonth] = useState('');

  const load = useCallback(async () => {
    if (!guaranteeId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const client = getRentalGuaranteeClient();
      const [g, c] = await Promise.all([
        client.getGuarantee(guaranteeId),
        client.getClaimsByGuarantee(guaranteeId),
      ]);
      setGuarantee(g);
      setClaims(c);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger la garantie.');
    } finally {
      setLoading(false);
    }
  }, [guaranteeId]);

  useEffect(() => { load(); }, [load]);

  const handleFileClaim = async () => {
    if (!guaranteeId || !guarantee) return;
    if (!/^\d{4}-\d{2}$/.test(periodMonth.trim())) {
      Alert.alert('Format invalide', 'Indiquez la période au format AAAA-MM (ex: 2026-07).');
      return;
    }
    setBusy(true);
    try {
      await getRentalGuaranteeClient().fileClaim(guaranteeId, {
        periodMonth: periodMonth.trim(),
        filedBy: guarantee.landlordId,
      });
      setShowClaimForm(false);
      setPeriodMonth('');
      await load();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de déposer la réclamation.');
    } finally {
      setBusy(false);
    }
  };

  const handleStartReview = async (claim: GuaranteeClaim) => {
    if (!guarantee) return;
    setBusy(true);
    try {
      await getRentalGuaranteeClient().startReview(claim.claimId, guarantee.landlordId);
      await load();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || "Impossible de démarrer l'examen.");
    } finally {
      setBusy(false);
    }
  };

  const handleDecide = async (claim: GuaranteeClaim, approved: boolean) => {
    if (!guarantee) return;
    Alert.alert(
      approved ? 'Approuver la réclamation' : 'Rejeter la réclamation',
      approved
        ? `Approuver l'indemnisation de ${claim.amountClaimed.toLocaleString()} ${claim.currency} ?`
        : 'Confirmer le rejet de cette réclamation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: async () => {
            setBusy(true);
            try {
              await getRentalGuaranteeClient().decideClaim(claim.claimId, {
                approved, reviewerId: guarantee.landlordId, notes: approved ? 'Approuvée' : 'Rejetée',
              });
              await load();
            } catch (err: any) {
              Alert.alert('Erreur', err?.message || 'Impossible de statuer sur la réclamation.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const handlePayout = async (claim: GuaranteeClaim) => {
    Alert.alert(
      'Verser l\'indemnisation',
      `Verser ${(claim.amountApproved ?? claim.amountClaimed).toLocaleString()} ${claim.currency} au propriétaire ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Verser', onPress: async () => {
            setBusy(true);
            try {
              await getRentalGuaranteeClient().payoutClaim(claim.claimId);
              await load();
            } catch (err: any) {
              Alert.alert('Erreur', err?.message || "Impossible de verser l'indemnisation.");
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = async () => {
    if (!guaranteeId) return;
    Alert.alert('Annuler la garantie', 'Cette action est définitive. Continuer ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Annuler la garantie', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            await getRentalGuaranteeClient().cancel(guaranteeId, 'Annulée par le propriétaire');
            await load();
          } catch (err: any) {
            Alert.alert('Erreur', err?.message || "Impossible d'annuler la garantie.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const statusMeta = guarantee ? GUARANTEE_STATUS_META[guarantee.status] : null;
  const statusColor = statusMeta ? statusMeta.color(theme) : theme.text;
  const isActive = guarantee?.status === 'active';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Garantie locative</ThemedText>
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

          {guarantee && (
            <>
              <ThemedView style={[s.card, { backgroundColor: statusColor + '10', borderColor: statusColor + '30' }]}>
                <ThemedText style={{ fontWeight: '900', color: statusColor, fontSize: 15, textAlign: 'center' }}>
                  {statusMeta?.label.toUpperCase()}
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '70', textAlign: 'center', marginTop: 6 }}>
                  {guarantee.monthlyRent.toLocaleString()} {guarantee.currency}/mois · prime {guarantee.premiumPct}%
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.onSurface + '55', textAlign: 'center', marginTop: 2 }}>
                  Plafond: {(guarantee.monthlyRent * guarantee.coverageCapMultiple).toLocaleString()} {guarantee.currency}
                  {' · '}Délai de grâce: {guarantee.gracePeriodDays}j
                </ThemedText>
              </ThemedView>

              <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                <ThemedView style={[s.statCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60' }}>Primes collectées</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginTop: 2 }}>
                    {guarantee.totalPremiumsCollected.toLocaleString()} {guarantee.currency}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={[s.statCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60' }}>Indemnisations versées</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginTop: 2 }}>
                    {guarantee.totalClaimsPaid.toLocaleString()} {guarantee.currency}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {isActive && (
                <TouchableOpacity
                  style={[s.cta, { backgroundColor: theme.primary }]}
                  onPress={() => getRentalGuaranteeClient().collectPremium(guaranteeId!).then(load).catch((e) => Alert.alert('Erreur', e?.message))}
                >
                  <MaterialCommunityIcons name="cash-plus" size={18} color="#fff" />
                  <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Collecter la prime du mois</ThemedText>
                </TouchableOpacity>
              )}

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <ThemedText style={[s.label, { color: theme.text }]}>Réclamations ({claims.length})</ThemedText>
                  {isActive && !showClaimForm && (
                    <TouchableOpacity onPress={() => setShowClaimForm(true)} style={s.smallBtn}>
                      <Ionicons name="add" size={14} color={theme.primary} />
                      <ThemedText style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>Déposer</ThemedText>
                    </TouchableOpacity>
                  )}
                </ThemedView>

                {showClaimForm && (
                  <ThemedView style={{ marginBottom: 10, gap: 8 }}>
                    <TextInput
                      value={periodMonth} onChangeText={setPeriodMonth}
                      placeholder="Période (AAAA-MM, ex: 2026-07)" placeholderTextColor={theme.onSurface + '40'}
                      style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                    />
                    <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={[s.cta, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.outline + '40', height: 44 }]}
                        onPress={() => { setShowClaimForm(false); setPeriodMonth(''); }}
                      >
                        <ThemedText style={{ color: theme.onSurface + '70', fontWeight: '700', fontSize: 13 }}>Annuler</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.cta, { flex: 1, backgroundColor: busy ? theme.outline : theme.primary, height: 44 }]}
                        onPress={handleFileClaim} disabled={busy}
                      >
                        {busy ? <ActivityIndicator color="#fff" /> : (
                          <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Confirmer</ThemedText>
                        )}
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>
                )}

                {claims.length === 0 && !showClaimForm && (
                  <ThemedText style={{ color: theme.onSurface + '50', fontSize: 13 }}>
                    Aucune réclamation pour le moment.
                  </ThemedText>
                )}

                {claims.map((claim) => {
                  const meta = CLAIM_STATUS_META[claim.status];
                  const color = meta.color(theme);
                  return (
                    <ThemedView key={claim.claimId} style={[s.claimCard, { borderColor: theme.outline + '20' }]}>
                      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ThemedView style={{ flex: 1 }}>
                          <ThemedText style={{ fontWeight: '700', color: theme.text, fontSize: 14 }}>
                            Période {claim.periodMonth}
                          </ThemedText>
                          <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                            {claim.amountClaimed.toLocaleString()} {claim.currency}
                            {claim.amountApproved != null && claim.amountApproved !== claim.amountClaimed
                              ? ` → approuvé: ${claim.amountApproved.toLocaleString()} ${claim.currency}`
                              : ''}
                          </ThemedText>
                        </ThemedView>
                        <ThemedView style={[s.statusChip, { backgroundColor: color + '18' }]}>
                          <ThemedText style={{ color, fontSize: 10, fontWeight: '800' }}>{meta.label.toUpperCase()}</ThemedText>
                        </ThemedView>
                      </ThemedView>

                      <ThemedView style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        {claim.status === 'filed' && (
                          <TouchableOpacity
                            style={[s.smallBtn, { borderColor: theme.primary + '40' }]}
                            onPress={() => handleStartReview(claim)} disabled={busy}
                          >
                            <MaterialCommunityIcons name="magnify" size={14} color={theme.primary} />
                            <ThemedText style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>Examiner</ThemedText>
                          </TouchableOpacity>
                        )}
                        {(claim.status === 'filed' || claim.status === 'under_review') && (
                          <>
                            <TouchableOpacity
                              style={[s.smallBtn, { borderColor: theme.success + '40' }]}
                              onPress={() => handleDecide(claim, true)} disabled={busy}
                            >
                              <Ionicons name="checkmark" size={14} color={theme.success} />
                              <ThemedText style={{ color: theme.success, fontSize: 12, fontWeight: '700' }}>Approuver</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[s.smallBtn, { borderColor: theme.error + '40' }]}
                              onPress={() => handleDecide(claim, false)} disabled={busy}
                            >
                              <Ionicons name="close" size={14} color={theme.error} />
                              <ThemedText style={{ color: theme.error, fontSize: 12, fontWeight: '700' }}>Rejeter</ThemedText>
                            </TouchableOpacity>
                          </>
                        )}
                        {claim.status === 'approved' && (
                          <TouchableOpacity
                            style={[s.smallBtn, { borderColor: theme.success + '40' }]}
                            onPress={() => handlePayout(claim)} disabled={busy}
                          >
                            <MaterialCommunityIcons name="cash-check" size={14} color={theme.success} />
                            <ThemedText style={{ color: theme.success, fontSize: 12, fontWeight: '700' }}>Verser l'indemnisation</ThemedText>
                          </TouchableOpacity>
                        )}
                      </ThemedView>
                    </ThemedView>
                  );
                })}
              </ThemedView>

              {isActive && (
                <TouchableOpacity
                  style={[s.cta, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.error + '40' }]}
                  onPress={handleCancel} disabled={busy}
                >
                  <ThemedText style={{ color: theme.error, fontWeight: '700', fontSize: 13 }}>Annuler la garantie</ThemedText>
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
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14 },
  label: { fontWeight: '800', fontSize: 14 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  claimCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
});
