/**
 * dormantLand/my-listings.tsx — owner's view of their published listings
 * and incoming booking requests across all of them.
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
import { getDormantLandClient, DormantListing, UsageBooking } from '@/services/api/dormantLandClient';

const STATUS_COLOR: Record<string, string> = {
  active: '#10B981', paused: '#F59E0B', closed: '#6B7280',
};

export default function MyDormantListingsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [listings, setListings] = useState<DormantListing[]>([]);
  const [bookings, setBookings] = useState<UsageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (!user?.id) { setLoading(false); return; }
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const client = getDormantLandClient();
      const [l, b] = await Promise.all([
        client.getListingsByOwner(user.id),
        client.getBookingsByOwner(user.id),
      ]);
      setListings(l);
      setBookings(b.filter((booking) => booking.status === 'requested'));
    } catch (err) {
      console.error('[MyDormantListings] load error:', err);
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
        {bookings.length > 0 && (
          <ThemedView style={[styles.alertBanner, { borderColor: '#F59E0B40', backgroundColor: '#F59E0B10' }]}>
            <MaterialCommunityIcons name="bell-alert-outline" size={20} color="#F59E0B" />
            <ThemedText style={{ color: '#F59E0B', fontWeight: '600', flex: 1, fontSize: 13 }}>
              {bookings.length} demande{bookings.length > 1 ? 's' : ''} de réservation en attente.
            </ThemedText>
          </ThemedView>
        )}

        {bookings.map((b) => (
          <TouchableOpacity
            key={b.bookingId}
            onPress={() => router.push({ pathname: '/dormantLand/bookings/[bookingId]', params: { bookingId: b.bookingId } } as any)}
            style={[styles.bookingCard, { borderColor: theme.primary + '30' }]}
          >
            <ThemedText style={{ fontWeight: '700', fontSize: 13, color: theme.text }}>
              {new Date(b.startDate).toLocaleDateString('fr-FR')} → {new Date(b.endDate).toLocaleDateString('fr-FR')}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', marginTop: 2 }}>
              {b.totalAmount.toLocaleString()} {b.currency}
            </ThemedText>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.smallCta, { backgroundColor: theme.primary, alignSelf: 'flex-start', paddingHorizontal: 16 }]}
          onPress={() => router.push('/dormantLand/listings/create' as any)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Nouvelle annonce</ThemedText>
        </TouchableOpacity>

        {listings.length === 0 ? (
          <ThemedView style={{ alignItems: 'center', paddingVertical: 50 }}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={48} color={theme.onSurface + '30'} />
            <ThemedText style={{ marginTop: 12, opacity: 0.5, textAlign: 'center' }}>
              Vous n'avez publié aucune annonce pour le moment.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={{ gap: 12 }}>
            {listings.map((listing) => {
              const color = STATUS_COLOR[listing.status];
              return (
                <TouchableOpacity
                  key={listing.listingId}
                  onPress={() => router.push({ pathname: '/dormantLand/listings/[listingId]', params: { listingId: listing.listingId } } as any)}
                  style={[styles.card, { borderColor: color + '30', borderLeftColor: color, borderLeftWidth: 4 }]}
                >
                  <ThemedText style={styles.listingTitle} numberOfLines={1}>{listing.title}</ThemedText>
                  <ThemedText style={styles.addressText} numberOfLines={1}>{listing.address}</ThemedText>
                  <ThemedText style={{ fontSize: 12, color, fontWeight: '700', marginTop: 4 }}>
                    {listing.status === 'active' ? 'Active' : listing.status === 'paused' ? 'En pause' : 'Fermée'}
                  </ThemedText>
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
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  bookingCard: { borderRadius: 12, borderWidth: 1, padding: 12 },
  smallCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  listingTitle: { fontSize: 15, fontWeight: '700' },
  addressText: { fontSize: 12, opacity: 0.6 },
});
