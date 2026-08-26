/**
 * land/titles/[tokenId].tsx — land title detail: cadastral reference, deed
 * hash, encumbrances (mortgages/easements/liens), transfer history, and the
 * entry point into succession tracking if the registered owner is deceased.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getLandClient, LandTitle } from '@/services/api/landClient';

export default function LandTitleDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { tokenId } = useLocalSearchParams<{ tokenId: string }>();

  const [title, setTitle] = useState<LandTitle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showSuccessionForm, setShowSuccessionForm] = useState(false);
  const [deceasedOwnerName, setDeceasedOwnerName] = useState('');
  const [deceasedOwnerReference, setDeceasedOwnerReference] = useState('');
  const [openingSuccession, setOpeningSuccession] = useState(false);
  const [successionError, setSuccessionError] = useState('');
  const [checkingSuccession, setCheckingSuccession] = useState(false);

  const load = useCallback(async () => {
    if (!tokenId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setTitle(await getLandClient().getTitle(tokenId));
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger le titre.');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => { load(); }, [load]);

  const handleCheckSuccession = async () => {
    if (!tokenId) return;
    setCheckingSuccession(true);
    try {
      const succession = await getLandClient().getSuccessionByToken(tokenId);
      router.push({ pathname: '/land/successions/[successionId]', params: { successionId: succession.succession_id } } as any);
    } catch {
      // No unresolved succession exists yet — show the "open succession" form instead.
      setShowSuccessionForm(true);
    } finally {
      setCheckingSuccession(false);
    }
  };

  const handleOpenSuccession = async () => {
    if (!tokenId) return;
    if (!deceasedOwnerName.trim()) { setSuccessionError('Le nom du propriétaire décédé est requis.'); return; }
    setOpeningSuccession(true);
    setSuccessionError('');
    try {
      const succession = await getLandClient().openSuccession(tokenId, {
        deceasedOwnerName: deceasedOwnerName.trim(),
        deceasedOwnerReference: deceasedOwnerReference.trim() || undefined,
      });
      router.push({ pathname: '/land/successions/[successionId]', params: { successionId: succession.succession_id } } as any);
    } catch (err: any) {
      setSuccessionError(err?.message || "Impossible d'ouvrir la succession.");
    } finally {
      setOpeningSuccession(false);
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
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Titre foncier</ThemedText>
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

          {title && (
            <>
              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ThemedView style={[s.iconCircle, { backgroundColor: (title.is_valid ? theme.success : theme.error) + '18' }]}>
                    <MaterialCommunityIcons name="file-certificate-outline" size={22} color={title.is_valid ? theme.success : theme.error} />
                  </ThemedView>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText style={{ fontWeight: '800', color: theme.text, fontSize: 15 }} numberOfLines={2}>
                      {title.property_address}
                    </ThemedText>
                    <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                      {title.property_area_sqm} m² · {title.jurisdiction}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={[s.statusChip, {
                  backgroundColor: (title.is_valid ? theme.success : theme.error) + '18', alignSelf: 'flex-start', marginTop: 8,
                }]}>
                  <ThemedText style={{ color: title.is_valid ? theme.success : theme.error, fontSize: 11, fontWeight: '800' }}>
                    {title.is_valid ? 'TITRE VALIDE' : 'TITRE INVALIDÉ'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                {[
                  { label: 'Référence cadastrale', value: title.cadastral_reference || '—' },
                  { label: "Hash de l'acte", value: `${title.deed_hash.slice(0, 16)}…` },
                  { label: 'Notaire', value: title.notary_id || '—' },
                  { label: 'Enregistré le', value: new Date(title.created_at).toLocaleDateString() },
                ].map(({ label, value }, i) => (
                  <ThemedView key={i} style={[s.row, { borderBottomColor: theme.outline + '12' }]}>
                    <ThemedText style={{ color: theme.onSurface + '60', flex: 1, fontSize: 13 }}>{label}</ThemedText>
                    <ThemedText style={{ fontWeight: '700', color: theme.text, fontSize: 13 }} numberOfLines={1}>{value}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>
                  Servitudes & hypothèques ({title.encumbrances.length})
                </ThemedText>
                {title.encumbrances.length === 0 && (
                  <ThemedText style={{ color: theme.onSurface + '50', fontSize: 13 }}>Aucune servitude enregistrée.</ThemedText>
                )}
                {title.encumbrances.map((enc) => (
                  <ThemedView key={enc.encumbrance_id} style={[s.subRow, { borderBottomColor: theme.outline + '12' }]}>
                    <ThemedText style={{ fontWeight: '700', color: theme.text, fontSize: 13 }}>{enc.encumbrance_type}</ThemedText>
                    <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                      {enc.creditor ? `${enc.creditor} · ` : ''}{enc.amount ? `$${enc.amount.toFixed(2)}` : ''}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>
                  Historique de transfert ({title.transfer_history.length})
                </ThemedText>
                {title.transfer_history.length === 0 && (
                  <ThemedText style={{ color: theme.onSurface + '50', fontSize: 13 }}>Aucun transfert enregistré.</ThemedText>
                )}
                {title.transfer_history.map((t) => (
                  <ThemedView key={t.record_id} style={[s.subRow, { borderBottomColor: theme.outline + '12' }]}>
                    <ThemedText style={{ fontWeight: '700', color: theme.text, fontSize: 13 }}>
                      {t.from_owner} → {t.to_owner}
                    </ThemedText>
                    <ThemedText style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                      {new Date(t.transferred_at).toLocaleDateString()}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>

              <TouchableOpacity
                style={[s.cta, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.primary + '40' }]}
                onPress={() => router.push({ pathname: '/climateRisk/[propertyId]', params: { propertyId: title.property_id } } as any)}
              >
                <MaterialCommunityIcons name="shield-alert-outline" size={18} color={theme.primary} />
                <ThemedText style={{ color: theme.primary, fontWeight: '800', fontSize: 15 }}>Voir les risques climatiques</ThemedText>
              </TouchableOpacity>

              <ThemedView style={[s.infoBox, { backgroundColor: theme.warning + '10', borderColor: theme.warning + '30' }]}>
                <MaterialCommunityIcons name="account-group-outline" size={16} color={theme.warning} />
                <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
                  Si le propriétaire enregistré est décédé, ouvrez une succession pour identifier et
                  reconnaître les héritiers — sans cela, ce terrain reste bloqué indéfiniment.
                </ThemedText>
              </ThemedView>

              {!showSuccessionForm && (
                <TouchableOpacity
                  style={[s.cta, { backgroundColor: checkingSuccession ? theme.outline : theme.warning }]}
                  onPress={handleCheckSuccession} disabled={checkingSuccession}
                >
                  {checkingSuccession ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <MaterialCommunityIcons name="account-multiple-outline" size={18} color="#fff" />
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Gérer la succession</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {showSuccessionForm && (
                <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                  <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>Ouvrir une succession</ThemedText>
                  <ThemedText style={[s.label, { color: theme.text, fontSize: 13 }]}>Nom du propriétaire décédé</ThemedText>
                  <TextInput value={deceasedOwnerName} onChangeText={setDeceasedOwnerName} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />
                  <ThemedText style={[s.label, { color: theme.text, fontSize: 13, marginTop: 10 }]}>Référence acte de décès (optionnel)</ThemedText>
                  <TextInput value={deceasedOwnerReference} onChangeText={setDeceasedOwnerReference} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

                  {successionError !== '' && (
                    <ThemedView style={[s.box, { backgroundColor: '#ef444415', borderColor: '#ef444430', marginTop: 10 }]}>
                      <MaterialCommunityIcons name="alert-circle" size={16} color={theme.error} />
                      <ThemedText style={{ color: theme.error, flex: 1, fontSize: 13 }}>{successionError}</ThemedText>
                    </ThemedView>
                  )}

                  <TouchableOpacity
                    style={[s.cta, { backgroundColor: openingSuccession ? theme.outline : theme.warning, marginTop: 10 }]}
                    onPress={handleOpenSuccession} disabled={openingSuccession}
                  >
                    {openingSuccession ? <ActivityIndicator color="#fff" /> : (
                      <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Ouvrir la succession</ThemedText>
                    )}
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
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  label: { fontWeight: '800', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1 },
  subRow: { paddingVertical: 8, borderBottomWidth: 1, gap: 2 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14, marginTop: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
});
