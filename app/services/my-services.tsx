import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import {
  getServiceMarketplaceService,
  ServiceSubscription,
  SubscriptionStatus,
} from '@/services/api/serviceMarketplaceService';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyServicesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [subscriptions, setSubscriptions] = useState<ServiceSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'paused' | 'cancelled'>('active');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const serviceMarketplace = getServiceMarketplaceService();
      const subs = await serviceMarketplace.getUserSubscriptions();
      setSubscriptions(subs);
    } catch (error) {
      console.error('Erreur chargement souscriptions:', error);
      Alert.alert('Erreur', 'Impossible de charger vos services');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  };

  const handleUnsubscribe = async (subscription: ServiceSubscription) => {
    Alert.alert(
      'Confirmer la résiliation',
      'Êtes-vous sûr de vouloir résilier ce service ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Résilier',
          style: 'destructive',
          onPress: async () => {
            try {
              const serviceMarketplace = getServiceMarketplaceService();
              const result = await serviceMarketplace.unsubscribeFromService(subscription.id);

              if (result.success) {
                Alert.alert('Succès', 'Vous avez bien résilié ce service');
                loadSubscriptions();
              } else {
                Alert.alert('Erreur', result.message || 'Impossible de résilier le service');
              }
            } catch (error) {
              console.error('Erreur résiliation:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          },
        },
      ]
    );
  };

  const handlePauseResume = async (subscription: ServiceSubscription) => {
    const newStatus =
      subscription.status === SubscriptionStatus.ACTIVE
        ? SubscriptionStatus.PAUSED
        : SubscriptionStatus.ACTIVE;

    try {
      const serviceMarketplace = getServiceMarketplaceService();
      const result = await serviceMarketplace.updateSubscription(subscription.id, {
        status: newStatus,
      });

      if (result.success) {
        Alert.alert(
          'Succès',
          newStatus === SubscriptionStatus.PAUSED
            ? 'Service mis en pause'
            : 'Service réactivé'
        );
        loadSubscriptions();
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de modifier le service');
      }
    } catch (error) {
      console.error('Erreur pause/reprise:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleToggleAutoRenewal = async (subscription: ServiceSubscription) => {
    try {
      const serviceMarketplace = getServiceMarketplaceService();
      const result = await serviceMarketplace.updateSubscription(subscription.id, {
        autoRenewal: !subscription.autoRenewal,
      });

      if (result.success) {
        Alert.alert(
          'Succès',
          subscription.autoRenewal
            ? 'Renouvellement automatique désactivé'
            : 'Renouvellement automatique activé'
        );
        loadSubscriptions();
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de modifier le service');
      }
    } catch (error) {
      console.error('Erreur renouvellement auto:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleMakePayment = async (subscription: ServiceSubscription) => {
    Alert.alert(
      'Paiement',
      `Montant à payer : ${subscription.pricing.amount}${subscription.pricing.currency}`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Payer',
          onPress: async () => {
            try {
              const serviceMarketplace = getServiceMarketplaceService();
              const result = await serviceMarketplace.recordPayment(
                subscription.id,
                subscription.pricing.amount
              );

              if (result.success) {
                Alert.alert('Succès', 'Paiement enregistré');
                loadSubscriptions();
              } else {
                Alert.alert('Erreur', result.message || 'Impossible d\'enregistrer le paiement');
              }
            } catch (error) {
              console.error('Erreur paiement:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          },
        },
      ]
    );
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (selectedTab === 'active') return sub.status === SubscriptionStatus.ACTIVE;
    if (selectedTab === 'paused') return sub.status === SubscriptionStatus.PAUSED;
    return sub.status === SubscriptionStatus.CANCELLED;
  });

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return theme.success;
      case SubscriptionStatus.PAUSED:
        return theme.warning || '#FFA500';
      case SubscriptionStatus.CANCELLED:
        return theme.error;
      default:
        return theme.onSurface;
    }
  };

  const getStatusText = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'Actif';
      case SubscriptionStatus.PAUSED:
        return 'En pause';
      case SubscriptionStatus.CANCELLED:
        return 'Résilié';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Mes Services</ThemedText>
        <View style={styles.headerButton} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && { borderBottomColor: theme.primary }]}
          onPress={() => setSelectedTab('active')}
        >
          <ThemedText
            style={[styles.tabText, selectedTab === 'active' && { color: theme.primary }]}
          >
            Actifs
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'paused' && { borderBottomColor: theme.primary }]}
          onPress={() => setSelectedTab('paused')}
        >
          <ThemedText
            style={[styles.tabText, selectedTab === 'paused' && { color: theme.primary }]}
          >
            En pause
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'cancelled' && { borderBottomColor: theme.primary }]}
          onPress={() => setSelectedTab('cancelled')}
        >
          <ThemedText
            style={[styles.tabText, selectedTab === 'cancelled' && { color: theme.primary }]}
          >
            Résiliés
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.primary]} />
        }
      >
        {filteredSubscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="subscriptions" size={64} color={theme.onSurface + '40'} />
            <ThemedText style={styles.emptyText}>
              Aucun service dans cette catégorie
            </ThemedText>
          </View>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <View
              key={subscription.id}
              style={[styles.subscriptionCard, { backgroundColor: theme.surface }]}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <ThemedText style={styles.serviceId}>Service #{subscription.serviceId.substring(0, 8)}</ThemedText>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(subscription.status) + '20' },
                    ]}
                  >
                    <ThemedText
                      style={[styles.statusText, { color: getStatusColor(subscription.status) }]}
                    >
                      {getStatusText(subscription.status)}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Details */}
              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="event" size={16} color={theme.onSurface + '80'} />
                  <ThemedText style={styles.detailText}>
                    Début : {new Date(subscription.startDate).toLocaleDateString()}
                  </ThemedText>
                </View>
                {subscription.endDate && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="event-busy" size={16} color={theme.onSurface + '80'} />
                    <ThemedText style={styles.detailText}>
                      Fin : {new Date(subscription.endDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <MaterialIcons name="euro" size={16} color={theme.success} />
                  <ThemedText style={[styles.detailText, { fontWeight: '600' }]}>
                    {subscription.pricing.amount}{subscription.pricing.currency} / {subscription.pricing.billingPeriod}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name={subscription.autoRenewal ? 'autorenew' : 'block'}
                    size={16}
                    color={theme.onSurface + '80'}
                  />
                  <ThemedText style={styles.detailText}>
                    Renouvellement automatique : {subscription.autoRenewal ? 'Oui' : 'Non'}
                  </ThemedText>
                </View>
              </View>

              {/* Payment History */}
              {subscription.paymentHistory && subscription.paymentHistory.length > 0 && (
                <View style={styles.paymentHistory}>
                  <ThemedText style={styles.paymentTitle}>Historique des paiements</ThemedText>
                  {subscription.paymentHistory.slice(0, 3).map((payment, index) => (
                    <View key={index} style={styles.paymentRow}>
                      <ThemedText style={styles.paymentDate}>
                        {new Date(payment.date).toLocaleDateString()}
                      </ThemedText>
                      <ThemedText style={styles.paymentAmount}>{payment.amount}€</ThemedText>
                      <MaterialIcons
                        name={payment.status === 'PAID' ? 'check-circle' : 'pending'}
                        size={16}
                        color={payment.status === 'PAID' ? theme.success : theme.warning || '#FFA500'}
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.cardActions}>
                {subscription.status === SubscriptionStatus.ACTIVE && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: theme.outline + '30' }]}
                      onPress={() => handlePauseResume(subscription)}
                    >
                      <MaterialIcons name="pause" size={18} color={theme.onSurface} />
                      <ThemedText style={styles.actionButtonText}>Mettre en pause</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: theme.primary + '40' }]}
                      onPress={() => handleMakePayment(subscription)}
                    >
                      <MaterialIcons name="payment" size={18} color={theme.primary} />
                      <ThemedText style={[styles.actionButtonText, { color: theme.primary }]}>
                        Payer
                      </ThemedText>
                    </TouchableOpacity>
                  </>
                )}

                {subscription.status === SubscriptionStatus.PAUSED && (
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: theme.success + '40' }]}
                    onPress={() => handlePauseResume(subscription)}
                  >
                    <MaterialIcons name="play-arrow" size={18} color={theme.success} />
                    <ThemedText style={[styles.actionButtonText, { color: theme.success }]}>
                      Reprendre
                    </ThemedText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: theme.outline + '30' }]}
                  onPress={() => handleToggleAutoRenewal(subscription)}
                >
                  <MaterialIcons name="autorenew" size={18} color={theme.onSurface} />
                  <ThemedText style={styles.actionButtonText}>
                    {subscription.autoRenewal ? 'Désactiver auto' : 'Activer auto'}
                  </ThemedText>
                </TouchableOpacity>

                {subscription.status !== SubscriptionStatus.CANCELLED && (
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: theme.error + '40' }]}
                    onPress={() => handleUnsubscribe(subscription)}
                  >
                    <MaterialIcons name="cancel" size={18} color={theme.error} />
                    <ThemedText style={[styles.actionButtonText, { color: theme.error }]}>
                      Résilier
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    opacity: 0.6,
  },
  subscriptionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceId: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },
  paymentHistory: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  paymentDate: {
    fontSize: 12,
    flex: 1,
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
