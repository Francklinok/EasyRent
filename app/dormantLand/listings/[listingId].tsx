/**
 * dormantLand/listings/[listingId].tsx — listing detail + booking request.
 * Date-range conflicts are enforced server-side
 * (DormantLandService.hasConflict) — this screen just surfaces the error if
 * a requested slot overlaps an existing non-terminal booking.
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
import { getDormantLandClient, DormantListing, DormantUsageType } from '@/services/api/dormantLandClient';

const RATE_UNIT_LABEL: Record<string, string> = { hour: '/heure', day: '/jour', month: '/mois' };
const USAGE_LABELS: Record<string, string> = {
  storage: 'Stockage', event: 'Événementiel', urban_agriculture: 'Agriculture urbaine',
  parking: 'Parking', pop_up_retail: 'Pop-up retail', other: 'Autre',
};

export default function DormantListingDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();

  const [listing, setListing] = useState<DormantListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [usageType, setUsageType] = useState<DormantUsageType | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [landTitleTokenId, setLandTitleTokenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!listingId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const l = await getDormantLandClient().getListing(listingId);
      setListing(l);
      setUsageType(l.allowedUsageTypes[0] || null);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger l'annonce.");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => { load(); }, [load]);

  // Titre foncier lié à la propriété source de cette annonce, s'il existe —
  // même logique que components/info/index.tsx : 404 attendu pour la
  // plupart des annonces (pas de propertyId, ou propriété sans titre
  // tokenisé), donc échec silencieux, pas un vrai état d'erreur à afficher.
  useEffect(() => {
    if (!listing?.propertyId) { setLandTitleTokenId(null); return; }
    let cancelled = false;
    import('@/services/api/landClient').then(({ getLandClient }) => {
      getLandClient()
        .getTitleByProperty(listing.propertyId!)
        .then((title) => { if (!cancelled) setLandTitleTokenId(title.token_id); })
        .catch(() => { if (!cancelled) setLandTitleTokenId(null); });
    });
    return () => { cancelled = true; };
  }, [listing?.propertyId]);

  const handleRequestBooking = async () => {
    if (!listingId || !user?.id || !usageType) return;
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert('Dates requises', 'Indiquez la date de début et de fin.');
      return;
    }
    setBusy(true);
    try {
      const booking = await getDormantLandClient().requestBooking({
        listingId, renterId: user.id, usageType,
        startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString(),
      });
      router.push({ pathname: '/dormantLand/bookings/[bookingId]', params: { bookingId: booking.bookingId } } as any);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de demander cette réservation.');
    } finally {
      setBusy(false);
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
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }} numberOfLines={1}>
            {listing?.title || 'Annonce'}
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

          {listing && (
            <>
              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText style={{ fontSize: 13, color: theme.onSurface + '80', lineHeight: 19 }}>{listing.description}</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', marginTop: 8 }}>{listing.address}</ThemedText>
                {listing.areaSqm && (
                  <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', marginTop: 2 }}>{listing.areaSqm} m²</ThemedText>
                )}
                <ThemedText style={{ fontSize: 18, fontWeight: '900', color: theme.primary, marginTop: 10 }}>
                  {listing.rate.toLocaleString()} {listing.currency}{RATE_UNIT_LABEL[listing.rateUnit]}
                </ThemedText>
                <ThemedText style={{ fontSize: 11, color: theme.onSurface + '50', marginTop: 2 }}>
                  Durée minimale : {listing.minDurationUnits} {listing.rateUnit}(s)
                </ThemedText>
              </ThemedView>

              {/* Titre foncier de la propriété source — même composant que
                  la fiche propriété classique (components/info/index.tsx) :
                  le module land s'applique à tout terrain, qu'il soit géré
                  comme une propriété classique ou loué temporairement ici. */}
              {landTitleTokenId && (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/land/titles/[tokenId]', params: { tokenId: landTitleTokenId } } as any)}
                  style={[s.card, {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.outline + '20',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }]}
                >
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, backgroundColor: 'transparent' }}>
                    <MaterialCommunityIcons name="file-certificate-outline" size={22} color={theme.primary} />
                    <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <ThemedText style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>Titre foncier</ThemedText>
                      <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60' }}>
                        Référence cadastrale, charges, historique de transfert
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <Ionicons name="chevron-forward" size={20} color={theme.onSurface as string} />
                </TouchableOpacity>
              )}

              <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>Usage prévu</ThemedText>
                <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {listing.allowedUsageTypes.map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setUsageType(u)}
                      style={[
                        s.chip,
                        usageType === u
                          ? { backgroundColor: theme.primary }
                          : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
                      ]}
                    >
                      <ThemedText style={{ color: usageType === u ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '600' }}>
                        {USAGE_LABELS[u] || u}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ThemedView>

                <ThemedText style={[s.label, { color: theme.text, marginTop: 12 }]}>Date de début (AAAA-MM-JJ)</ThemedText>
                <TextInput
                  value={startDate} onChangeText={setStartDate} placeholder="2026-08-01" placeholderTextColor={theme.onSurface + '40'}
                  style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                />

                <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Date de fin (AAAA-MM-JJ)</ThemedText>
                <TextInput
                  value={endDate} onChangeText={setEndDate} placeholder="2026-08-03" placeholderTextColor={theme.onSurface + '40'}
                  style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
                />
              </ThemedView>

              <TouchableOpacity
                style={[s.cta, { backgroundColor: busy ? theme.outline : theme.primary }]}
                onPress={handleRequestBooking} disabled={busy}
              >
                {busy ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <MaterialCommunityIcons name="calendar-check-outline" size={18} color="#fff" />
                    <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Demander cette réservation</ThemedText>
                  </>
                )}
              </TouchableOpacity>
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
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
});
