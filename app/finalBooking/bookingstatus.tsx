import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getBookingService } from '@/services/api/bookingService';

interface ActivityItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reservationStatus: string;
  visitStatus: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  reservationDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',     color: '#F59E0B' },
  accepted:   { label: 'Acceptée',       color: '#10B981' },
  rejected:   { label: 'Refusée',        color: '#EF4444' },
  none:       { label: 'Non démarrée',   color: '#6B7280' },
};

export default function ReservationStatusScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [reservations, setReservations] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const bookingService = getBookingService();
      const activities: ActivityItem[] = await bookingService.getUserActivities(user.id);
      const filtered = activities.filter(a => a.reservationStatus && a.reservationStatus !== 'none');
      console.log('Fetched filter  activities:', filtered);
      setReservations(filtered);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Impossible de charger vos réservations.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handlePress = (item: ActivityItem) => {
    // If payment is completed, go directly to contract screen
    if (item.paymentStatus === 'completed') {
      router.push({
        pathname: '/contrat/ContratScreen',
        params: {
          activityId: item.id,
          paymentStatus: 'completed',
        }
      } as any);
      return;
    }
    router.push({
      pathname: '/bookingReview/bookingReview',
      params: {
        reservationId: item.id,
        propertyId: item.propertyId,
      }
    } as any);
  };

  const renderItem = ({ item }: { item: ActivityItem }) => {
    const isPaid = item.paymentStatus === 'completed';
    const status = STATUS_CONFIG[item.reservationStatus] || STATUS_CONFIG['pending'];
    const rawDate = item.reservationDate || item.createdAt || item.updatedAt;
    const date = rawDate
      ? new Date(rawDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';

    if (isPaid) {
      return (
        <TouchableOpacity
          style={[styles.card, {
            backgroundColor: '#F1F8E9',
            borderColor: '#A5D6A7',
            borderWidth: 1.5,
          }]}
          onPress={() => handlePress(item)}
          activeOpacity={0.75}
        >
          <ThemedView style={{
            backgroundColor: '#1B5E20',
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <ThemedText type="caption" style={{ color: 'white', fontWeight: '700', flex: 1 }}>
              Paiement effectué avec succès
            </ThemedText>
            <ThemedText type="caption" style={{ color: '#A5D6A7', fontWeight: '600' }}>
              {item.amount > 0 ? `${item.amount.toLocaleString('fr-FR')} ${item.currency || 'XOF'}` : ''}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.cardHeader}>
            <ThemedText type="normal" style={{ fontWeight: '700', flex: 1, color: '#1B5E20' }} numberOfLines={1}>
              {item.propertyTitle || 'Propriété'}
            </ThemedText>
            <ThemedView style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
              <ThemedText type="caption" style={{ color: '#1B5E20', fontWeight: '600' }}>
                Confirmée
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.cardBody}>
            <ThemedView style={styles.row}>
              <Ionicons name="calendar-outline" size={14} color="#388E3C" />
              <ThemedText type="caption" style={{ color: '#388E3C', marginLeft: 6 }}>
                Réservation du {item.reservationDate ? new Date(Number(item.reservationDate)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.cardFooter, { borderTopColor: '#C8E6C9', backgroundColor: '#E8F5E9' }]}>
            <ThemedText type="caption" style={{ color: '#1B5E20', fontWeight: '700' }}>
              📄 Voir / Générer le contrat
            </ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#1B5E20" />
          </ThemedView>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.outline }]}
        onPress={() => handlePress(item)}
        activeOpacity={0.75}
      >
        <ThemedView style={styles.cardHeader}>
          <ThemedText type="normal" style={{ fontWeight: '700', flex: 1 }} numberOfLines={1}>
            {item.propertyTitle || 'Propriété'}
          </ThemedText>
          <ThemedView style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <ThemedText type="caption" style={{ color: status.color, fontWeight: '600' }}>
              {status.label}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.cardBody}>
          <ThemedView style={styles.row}>
            <Ionicons name="calendar-outline" size={14} color={theme.text + '80'} />
            <ThemedText type="caption" style={{ color: theme.text + '80', marginLeft: 6 }}>
              Demande du {item.reservationDate ? new Date(Number(item.reservationDate)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </ThemedText>
          </ThemedView>

          {item.amount > 0 && (
            <ThemedView style={styles.row}>
              <Ionicons name="cash-outline" size={14} color={theme.text + '80'} />
              <ThemedText type="caption" style={{ color: theme.text + '80', marginLeft: 6 }}>
                Montant : {item.amount.toLocaleString('fr-FR')}  {item.currency ? ` ${item.currency}` : 'XOF'}
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.row}>
            <Ionicons name="wallet-outline" size={14} color={theme.text + '80'} />
            <ThemedText type="caption" style={{ color: theme.text + '80', marginLeft: 6 }}>
              Paiement : {item.paymentStatus === 'failed' ? '✗ Échoué' : 'En attente'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.cardFooter, { borderTopColor: theme.outline + '40' }]}>
          <ThemedText type="caption" style={{ color: theme.secondary, fontWeight: '600' }}>
            {item.reservationStatus === 'accepted' ? 'Procéder au paiement →' :
             item.reservationStatus === 'pending'  ? "En attente d'approbation" :
             item.reservationStatus === 'rejected' ? 'Demande refusée' :
             'Voir les détails →'}
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={theme.secondary} />
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: theme.surface }]}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <ThemedView style={styles.header}>
        <BackButton />
        <ThemedText type="normaltitle" intensity="strong" style={{ marginLeft: 12 }}>
          Mes réservations
        </ThemedText>
      </ThemedView>

      {error ? (
        <ThemedView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <ThemedText style={{ color: theme.error, marginTop: 12, textAlign: 'center' }}>{error}</ThemedText>
          <TouchableOpacity onPress={fetchReservations} style={[styles.retryBtn, { borderColor: theme.secondary }]}>
            <ThemedText style={{ color: theme.secondary, fontWeight: '600' }}>Réessayer</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : reservations.length === 0 ? (
        <ThemedView style={styles.centered}>
          <Ionicons name="calendar-outline" size={56} color={theme.text + '40'} />
          <ThemedText type="normal" style={{ color: theme.text + '80', marginTop: 16, textAlign: 'center' }}>
            Aucune réservation en cours
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.text + '50', marginTop: 6, textAlign: 'center', paddingHorizontal: 32 }}>
            Vos réservations apparaîtront ici une fois effectuées.
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)' as any)}
            style={[styles.retryBtn, { backgroundColor: theme.secondary, borderColor: theme.secondary }]}
          >
            <ThemedText style={{ color: 'white', fontWeight: '600' }}>Chercher un logement</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchReservations}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
});
