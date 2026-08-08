/**
 * dormantLand/listings/create.tsx — publish a temporary-use listing for
 * underused land/space.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getDormantLandClient, DormantUsageType, RateUnit } from '@/services/api/dormantLandClient';
import { getPropertyService } from '@/services/api/propertyService';

interface OwnedPropertyOption {
  id: string;
  title: string;
  address: string;
}

const USAGE_TYPES: { value: DormantUsageType; label: string }[] = [
  { value: 'storage', label: 'Stockage' },
  { value: 'event', label: 'Événementiel' },
  { value: 'urban_agriculture', label: 'Agriculture urbaine' },
  { value: 'parking', label: 'Parking' },
  { value: 'pop_up_retail', label: 'Pop-up retail' },
  { value: 'other', label: 'Autre' },
];

const RATE_UNITS: { value: RateUnit; label: string }[] = [
  { value: 'hour', label: 'Par heure' },
  { value: 'day', label: 'Par jour' },
  { value: 'month', label: 'Par mois' },
];

export default function CreateDormantListingScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [areaSqm, setAreaSqm] = useState('');
  const [selectedUsageTypes, setSelectedUsageTypes] = useState<DormantUsageType[]>([]);
  const [rate, setRate] = useState('');
  const [rateUnit, setRateUnit] = useState<RateUnit>('day');
  const [minDurationUnits, setMinDurationUnits] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lien optionnel vers une propriété existante — permet au module land
  // (titres fonciers) de s'appliquer aussi à cette annonce dormantLand,
  // via propertyId. Sans propriété liée, l'annonce reste publiable avec
  // l'adresse saisie librement ci-dessous.
  const [ownedProperties, setOwnedProperties] = useState<OwnedPropertyOption[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoadingProperties(false); return; }
    let cancelled = false;
    getPropertyService()
      .getPropertiesByOwner(user.id)
      .then((connection: any) => {
        if (cancelled) return;
        const options: OwnedPropertyOption[] = (connection?.edges || []).map((e: any) => ({
          id: e.node.id, title: e.node.title, address: e.node.address,
        }));
        setOwnedProperties(options);
      })
      .catch(() => { if (!cancelled) setOwnedProperties([]); })
      .finally(() => { if (!cancelled) setLoadingProperties(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const selectProperty = (propertyId: string) => {
    if (selectedPropertyId === propertyId) {
      setSelectedPropertyId(null);
      return;
    }
    setSelectedPropertyId(propertyId);
    const prop = ownedProperties.find((p) => p.id === propertyId);
    if (prop) setAddress(prop.address);
  };

  const toggleUsageType = (u: DormantUsageType) => {
    setSelectedUsageTypes((prev) => (prev.includes(u) ? prev.filter((v) => v !== u) : [...prev, u]));
  };

  const handleSubmit = async () => {
    if (!user?.id) { setError('Utilisateur non authentifié.'); return; }
    const rateVal = parseFloat(rate);
    if (!title.trim() || !description.trim() || !address.trim() || !rateVal || rateVal <= 0) {
      setError('Merci de renseigner le titre, la description, l\'adresse et le tarif.');
      return;
    }
    if (selectedUsageTypes.length === 0) {
      setError('Sélectionnez au moins un usage autorisé.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const listing = await getDormantLandClient().createListing({
        ownerId: user.id,
        propertyId: selectedPropertyId || undefined,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        areaSqm: areaSqm ? parseFloat(areaSqm) : undefined,
        allowedUsageTypes: selectedUsageTypes,
        rate: rateVal,
        rateUnit,
        minDurationUnits: parseInt(minDurationUnits, 10) || 1,
      });
      router.replace({ pathname: '/dormantLand/listings/[listingId]', params: { listingId: listing.listingId } } as any);
    } catch (err: any) {
      setError(err?.message || "Impossible de créer l'annonce.");
    } finally {
      setLoading(false);
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
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Publier une annonce</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <ThemedView style={[s.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={theme.primary} />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Ceci publie un usage temporaire de votre terrain/espace, jamais un bail. Le cadre juridique précis
            (statut foncier, autorisation) sera confirmé à chaque réservation.
          </ThemedText>
        </ThemedView>

        {!loadingProperties && ownedProperties.length > 0 && (
          <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>
              Lier à une de vos propriétés (optionnel)
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', marginBottom: 10, lineHeight: 17 }}>
              Si cette propriété a un titre foncier enregistré, il sera visible depuis cette annonce.
            </ThemedText>
            <ThemedView style={{ gap: 8 }}>
              {ownedProperties.map((p) => {
                const selected = selectedPropertyId === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => selectProperty(p.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? theme.primary : theme.outline + '30',
                      backgroundColor: selected ? theme.primary + '10' : theme.surfaceVariant,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={selected ? 'check-circle' : 'home-city-outline'}
                      size={18}
                      color={selected ? theme.primary : theme.onSurface + '70'}
                    />
                    <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <ThemedText style={{ fontSize: 13, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                        {p.title}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60' }} numberOfLines={1}>
                        {p.address}
                      </ThemedText>
                    </ThemedView>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>Titre</ThemedText>
          <TextInput value={title} onChangeText={setTitle} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Description</ThemedText>
          <TextInput
            value={description} onChangeText={setDescription} multiline
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30', minHeight: 70, paddingTop: 10 }]}
          />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Adresse</ThemedText>
          <TextInput value={address} onChangeText={setAddress} style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]} />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Surface (m², optionnel)</ThemedText>
          <TextInput
            value={areaSqm} onChangeText={setAreaSqm} keyboardType="decimal-pad"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text, marginBottom: 8 }]}>Usages autorisés</ThemedText>
          <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {USAGE_TYPES.map((u) => (
              <TouchableOpacity
                key={u.value}
                onPress={() => toggleUsageType(u.value)}
                style={[
                  s.chip,
                  selectedUsageTypes.includes(u.value)
                    ? { backgroundColor: theme.primary }
                    : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
                ]}
              >
                <ThemedText style={{ color: selectedUsageTypes.includes(u.value) ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '600' }}>
                  {u.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedText style={[s.label, { color: theme.text }]}>Tarif</ThemedText>
          <TextInput
            value={rate} onChangeText={setRate} keyboardType="decimal-pad"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10, marginBottom: 8 }]}>Unité tarifaire</ThemedText>
          <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
            {RATE_UNITS.map((r) => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRateUnit(r.value)}
                style={[
                  s.chip,
                  { flex: 1, alignItems: 'center' },
                  rateUnit === r.value
                    ? { backgroundColor: theme.primary }
                    : { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outline + '30' },
                ]}
              >
                <ThemedText style={{ color: rateUnit === r.value ? '#fff' : theme.onSurface + '80', fontSize: 12, fontWeight: '600' }}>
                  {r.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          <ThemedText style={[s.label, { color: theme.text, marginTop: 10 }]}>Durée minimale ({rateUnit === 'hour' ? 'heures' : rateUnit === 'day' ? 'jours' : 'mois'})</ThemedText>
          <TextInput
            value={minDurationUnits} onChangeText={setMinDurationUnits} keyboardType="number-pad"
            style={[s.input, { color: theme.text, borderColor: theme.outline + '30' }]}
          />
        </ThemedView>

        {error !== '' && (
          <ThemedView style={[s.box, { backgroundColor: '#ef444415', borderColor: '#ef444430' }]}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={theme.error} />
            <ThemedText style={{ color: theme.error, flex: 1, fontSize: 13 }}>{error}</ThemedText>
          </ThemedView>
        )}

        <TouchableOpacity
          style={[s.cta, { backgroundColor: loading ? theme.outline : theme.primary }]}
          onPress={handleSubmit} disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <MaterialCommunityIcons name="map-marker-plus-outline" size={18} color="#fff" />
              <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Publier l'annonce</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  label: { fontWeight: '800', fontSize: 14 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
});
