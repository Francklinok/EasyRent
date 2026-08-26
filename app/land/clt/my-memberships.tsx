/**
 * land/clt/my-memberships.tsx — a household's Community Land Trust
 * memberships: the building they own under a ground lease, with the trust
 * retaining perpetual title to the land.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getLandClient, CltMembership } from '@/services/api/landClient';

const STATUS_META: Record<CltMembership['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: '#10B981' },
  resale_in_progress: { label: 'Revente en cours', color: '#F59E0B' },
  transferred: { label: 'Transférée', color: '#6B7280' },
  terminated: { label: 'Résiliée', color: '#EF4444' },
};

export default function MyCltMembershipsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<CltMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getLandClient().getCltMembershipsByHousehold(user.id);
      setMemberships(data);
    } catch (err) {
      console.error('[MyCltMemberships] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        <ThemedView style={[styles.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={theme.primary} />
          <ThemedText style={{ fontSize: 12, color: theme.onSurface + '75', flex: 1, lineHeight: 18 }}>
            Vous possédez le bâti sous un bail emphytéotique — le terrain reste détenu par le trust, ce qui
            plafonne le prix de revente pour garantir l'accessibilité au prochain acquéreur.
          </ThemedText>
        </ThemedView>

        <TouchableOpacity
          style={[styles.smallCta, { backgroundColor: theme.primary, alignSelf: 'flex-start', paddingHorizontal: 16 }]}
          onPress={() => router.push('/land/clt/eligibility' as any)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Candidater pour un logement CLT</ThemedText>
        </TouchableOpacity>

        {memberships.length === 0 ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 50 }}>
            <MaterialCommunityIcons name="home-city-outline" size={48} color={theme.onSurface + '30'} />
            <ThemedText style={{ marginTop: 12, opacity: 0.5, textAlign: 'center' }}>
              Aucune adhésion CLT pour le moment.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={{ gap: 12 }}>
            {memberships.map((m) => {
              const meta = STATUS_META[m.status];
              return (
                <TouchableOpacity
                  key={m.membership_id}
                  onPress={() => router.push({ pathname: '/land/clt/[membershipId]', params: { membershipId: m.membership_id } } as any)}
                  style={[styles.card, { borderColor: meta.color + '30', borderLeftColor: meta.color, borderLeftWidth: 4 }]}
                >
                  <ThemedText style={styles.trustName} numberOfLines={1}>{m.trust_entity_name}</ThemedText>
                  <ThemedText style={styles.metaText}>
                    Achat initial : {m.original_purchase_price.toLocaleString()}
                  </ThemedText>
                  <ThemedText style={[styles.statusText, { color: meta.color }]}>{meta.label}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  smallCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  trustName: { fontSize: 15, fontWeight: '700' },
  metaText: { fontSize: 12, opacity: 0.6 },
  statusText: { fontSize: 12, fontWeight: '700', marginTop: 4 },
});
