/**
 * vacancyBridge/my-occupancies.tsx — an owner's properties currently
 * bridging a vacancy while a real tenant/buyer is sought.
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
import { getVacancyBridgeClient, TemporaryOccupancy } from '@/services/api/vacancyBridgeClient';
import { AuthRequiredScreen } from '@/components/auth/AuthRequiredScreen';

const STATUS_META: Record<TemporaryOccupancy['status'], { label: string; color: string }> = {
  requested: { label: 'Demande en attente', color: '#F59E0B' },
  active: { label: 'Actif', color: '#10B981' },
  rejected: { label: 'Refusé', color: '#EF4444' },
  ended_tenant_found: { label: 'Locataire trouvé', color: '#6366F1' },
  ended_owner_cancelled: { label: 'Annulé', color: '#6B7280' },
};

export default function MyTemporaryOccupanciesScreen() {
  const { theme } = useTheme();
  const { user, isAuthenticated, initializing } = useAuth();
  const [occupancies, setOccupancies] = useState<TemporaryOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getVacancyBridgeClient().getOccupanciesByOwner(user.id);
      setOccupancies(data);
    } catch (err) {
      console.error('[MyTemporaryOccupancies] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Même garde que urbanReuse/my-agreements.tsx : sans lui, un invité voyait
  // un état "aucun comblement" indiscernable d'un vrai propriétaire sans
  // occupation en cours.
  if (!initializing && !isAuthenticated) {
    return <AuthRequiredScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Comblements temporaires</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.primary} />}
      >
        {loading ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 50 }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </ThemedView>
        ) : occupancies.length === 0 ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 50 }}>
            <MaterialCommunityIcons name="home-clock-outline" size={48} color={theme.onSurface + '30'} />
            <ThemedText style={{ marginTop: 12, opacity: 0.5, textAlign: 'center' }}>
              Aucun comblement temporaire pour le moment.
            </ThemedText>
          </ThemedView>
        ) : (
          occupancies.map((o) => {
            const meta = STATUS_META[o.status];
            return (
              <TouchableOpacity
                key={o.occupancyId}
                onPress={() => router.push({ pathname: '/vacancyBridge/[occupancyId]', params: { occupancyId: o.occupancyId } } as any)}
                style={[s.card, { borderColor: theme.outline + '20' }]}
              >
                <View style={s.cardHeader}>
                  <ThemedText style={s.cardTitle} numberOfLines={1}>
                    {o.propertyPurpose === 'rent' ? 'Location recherchée' : 'Vente recherchée'}
                  </ThemedText>
                  <View style={[s.statusChip, { backgroundColor: meta.color + '18' }]}>
                    <ThemedText style={{ color: meta.color, fontSize: 10, fontWeight: '800' }}>{meta.label.toUpperCase()}</ThemedText>
                  </View>
                </View>
                {o.monthlyFee > 0 && (
                  <ThemedText style={s.feeText}>{o.monthlyFee.toLocaleString()} {o.currency}/mois</ThemedText>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  feeText: { fontSize: 12, opacity: 0.6 },
});
