/**
 * land/clt/[membershipId].tsx — CLT membership detail: ground lease terms
 * and the resale workflow (request → locks in the capped price, computed
 * server-side from the original price + fixed annual appreciation cap →
 * complete → transfers to a new eligible household at that price).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getLandClient, CltMembership } from '@/services/api/landClient';

const STATUS_META: Record<CltMembership['status'], { label: string; color: (t: any) => string }> = {
  active: { label: 'Active', color: (t) => t.success },
  resale_in_progress: { label: 'Revente en cours', color: (t) => t.warning },
  transferred: { label: 'Transférée', color: (t) => t.onSurface },
  terminated: { label: 'Résiliée', color: (t) => t.error },
};

export default function CltMembershipDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { membershipId } = useLocalSearchParams<{ membershipId: string }>();

  const [membership, setMembership] = useState<CltMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [newHouseholdOwnerId, setNewHouseholdOwnerId] = useState('');

  const load = useCallback(async () => {
    if (!membershipId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setMembership(await getLandClient().getCltMembership(membershipId));
    } catch (err: any) {
      setError(err?.message || "Impossible de charger l'adhésion.");
    } finally {
      setLoading(false);
    }
  }, [membershipId]);

  useEffect(() => { load(); }, [load]);

  const handleRequestResale = async () => {
    if (!membershipId) return;
    Alert.alert(
      'Demander une revente',
      'Le prix de revente maximum sera calculé selon la formule plafonnée du trust (prix initial + plafond d\'appréciation annuel). Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: async () => {
            setBusy(true);
            try {
              const updated = await getLandClient().requestCltResale(membershipId);
              setMembership(updated);
            } catch (err: any) {
              Alert.alert('Erreur', err?.message || 'Impossible de demander la revente.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleCompleteResale = async () => {
    if (!membershipId || !newHouseholdOwnerId.trim()) {
      Alert.alert('Identifiant requis', "Indiquez l'identifiant du nouveau foyer acquéreur.");
      return;
    }
    setBusy(true);
    try {
      await getLandClient().completeCltResale(membershipId, { newHouseholdOwnerId: newHouseholdOwnerId.trim() });
      await load();
      setShowCompleteForm(false);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de finaliser la revente.');
    } finally {
      setBusy(false);
    }
  };

  const statusMeta = membership ? STATUS_META[membership.status] : null;
  const statusColor = statusMeta ? statusMeta.color(theme) : theme.text;
  const latestCap = membership?.resale_history[membership.resale_history.length - 1];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Adhésion CLT</ThemedText>
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

          {membership && (
            <>
              <ThemedView style={[s.card, { backgroundColor: statusColor + '10', borderColor: statusColor + '30' }]}>
                <ThemedText style={{ fontWeight: '900', color: statusColor, fontSize: 15, textAlign: 'center' }}>
                  {statusMeta?.label.toUpperCase()}
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '70', textAlign: 'center', marginTop: 6 }}>
                  {membership.trust_entity_name}
                </ThemedText>
              </ThemedView>

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText style={s.rowLabel}>Bail emphytéotique</ThemedText>
                <ThemedText style={s.rowValue}>{membership.ground_lease_reference}</ThemedText>

                <ThemedText style={[s.rowLabel, { marginTop: 10 }]}>Redevance annuelle du bail</ThemedText>
                <ThemedText style={s.rowValue}>{membership.ground_lease_annual_fee.toLocaleString()}</ThemedText>

                <ThemedText style={[s.rowLabel, { marginTop: 10 }]}>Prix d'achat initial</ThemedText>
                <ThemedText style={s.rowValue}>{membership.original_purchase_price.toLocaleString()}</ThemedText>

                <ThemedText style={[s.rowLabel, { marginTop: 10 }]}>Plafond d'appréciation annuel</ThemedText>
                <ThemedText style={s.rowValue}>{membership.appreciation_cap_pct_per_year}% / an</ThemedText>
              </ThemedView>

              {latestCap && (
                <ThemedView style={[s.card, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}>
                  <ThemedText style={{ fontSize: 12, color: theme.onSurface + '70' }}>Prix de revente plafonné calculé</ThemedText>
                  <ThemedText style={{ fontSize: 20, fontWeight: '900', color: theme.success, marginTop: 2 }}>
                    {latestCap.computed_max_resale_price.toLocaleString()}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 11, color: theme.onSurface + '50', marginTop: 4 }}>
                    Calculé le {new Date(latestCap.computed_at).toLocaleDateString('fr-FR')}
                  </ThemedText>
                </ThemedView>
              )}

              {membership.status === 'active' && (
                <TouchableOpacity
                  style={[s.cta, { backgroundColor: busy ? theme.outline : theme.primary }]}
                  onPress={handleRequestResale} disabled={busy}
                >
                  {busy ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <MaterialCommunityIcons name="calculator-variant-outline" size={18} color="#fff" />
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Demander une revente</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {membership.status === 'resale_in_progress' && !showCompleteForm && (
                <TouchableOpacity style={[s.cta, { backgroundColor: theme.success }]} onPress={() => setShowCompleteForm(true)}>
                  <MaterialCommunityIcons name="check-decagram-outline" size={18} color="#fff" />
                  <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Finaliser la revente</ThemedText>
                </TouchableOpacity>
              )}

              {showCompleteForm && (
                <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>Nouveau foyer acquéreur</ThemedText>
                  <TextInput
                    value={newHouseholdOwnerId} onChangeText={setNewHouseholdOwnerId}
                    placeholder="Identifiant du nouveau foyer" placeholderTextColor={theme.onSurface + '40'}
                    style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                  />
                  <TouchableOpacity
                    style={[s.cta, { backgroundColor: busy ? theme.outline : theme.success, marginTop: 10 }]}
                    onPress={handleCompleteResale} disabled={busy}
                  >
                    {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Confirmer le transfert</ThemedText>}
                  </TouchableOpacity>
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
  rowLabel: { fontSize: 11, opacity: 0.55 },
  rowValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 24 },
});
