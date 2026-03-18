import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Service,
  getServiceMarketplaceService,
  SubscribeServiceInput,
  ContractType,
} from '../../services/api/serviceMarketplaceService';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ServiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const { serviceId } = useLocalSearchParams();
  const id = Array.isArray(serviceId) ? serviceId[0] : serviceId;
  const serviceMarketplace = getServiceMarketplaceService();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const serviceData = await serviceMarketplace.getService(id as string);
      setService(serviceData);
    } catch (error) {
      console.error('Error loading service:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les détails du service.',
        [{ text: 'Retour', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const processSubscription = async (contractType: any) => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez etre connecte pour vous abonner a un service.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login' as any) },
        ]
      );
      return;
    }

    if (!service) return;

    try {
      setSubscribing(true);

      const subscribeInput: SubscribeServiceInput = {
        serviceId: service.id,
        contractType: contractType as ContractType,
        startDate: new Date().toISOString(),
        autoRenewal: false,
      };

      const result = await serviceMarketplace.subscribeToService(subscribeInput);

      if (result.success) {
        Alert.alert(
          'Félicitations !',
          'Vous êtes maintenant abonné à ce service premium.',
          [{ text: 'Voir mon wallet', onPress: () => router.push('/wallet/Wallet') }]
        );
      } else {
        throw new Error(result.message || 'Échec de l\'abonnement');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert(
        'Oups',
        'Une erreur est survenue lors de la souscription. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscribe = (contractType: any) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment vous abonner à ce service ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          onPress: () => processSubscription(contractType),
          style: 'default',
        },
      ]
    );
  };

  const showSubscribeOptions = () => {
    if (!service) return;

    // Use contractTypes from service or fallback
    const types = service.contractTypes || [];

    if (types.length === 0) {
      // Default if no types
      handleSubscribe(undefined);
      return;
    }

    if (types.length === 1) {
      handleSubscribe(types[0]);
      return;
    }

    Alert.alert(
      'Choisissez votre plan',
      'Sélectionnez le type de contrat qui vous convient le mieux',
      [
        ...types.map((type: string) => ({
          text: getContractTypeLabel(type),
          onPress: () => handleSubscribe(type),
        })),
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const getContractTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'short_term': 'Court terme',
      'long_term': 'Long terme',
      'seasonal': 'Saisonnier',
      'on_demand': 'À la demande',
      'emergency': 'Urgence',
    };
    return labels[type] || type;
  };

  const formatPrice = (price?: number, currency?: string): string => {
    if (price === undefined) return 'Sur devis';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleContact = (type: 'phone' | 'email' | 'website', value: string) => {
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'website':
        Linking.openURL(value.startsWith('http') ? value : `https://${value}`);
        break;
    }
  };

  if (loading) return (
    <ThemedView style={[styles.loadingContainer, { paddingTop: insets.top }]}>
      <ActivityIndicator size="large" color={theme.primary as string} />
      <Text style={{ marginTop: 12, color: theme.onSurfaceVariant as string }}>Chargement du service...</Text>
    </ThemedView>
  );

  if (!service) return (
    <ThemedView style={[styles.loadingContainer, { paddingTop: insets.top }]}>
      <Text>Service introuvable</Text>
    </ThemedView>
  );

  const photos = service.media?.photos || service.images || [];

  return (
    <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.headerContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(newIndex);
            }}
          >
            {photos.length > 0 ? (
              photos.map((photo: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.headerImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <ThemedView style={[styles.headerImage, styles.placeholderHeader]}>
                <Ionicons name="image-outline" size={64} color="#ccc" />
              </ThemedView>
            )}
          </ScrollView>

          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          />

          {/* Title Overlay */}
          <ThemedView style={styles.headerOverlay}>
              <ThemedView style={styles.categoryTag}>
                <ThemedText style={styles.categoryText}>{service.category}</ThemedText>
              </ThemedView>
              <ThemedText type ="subtitle" intensity ="strong" style={styles.headerTitle}>{service.title}</ThemedText>
              <ThemedView style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={theme.star} />
                <ThemedText type ="normal">{service.rating?.toFixed(1) || 'N/A'}</ThemedText>
                <ThemedText type ="caption" className ="pl-2">({service.totalReviews || 0} avis)</ThemedText>
              </ThemedView>
          </ThemedView>

          {/* Image Indicators */}
          {photos.length > 1 && (
            <ThemedView style={styles.indicatorsContainer}>
              {photos.map((_: any, index: number) => (
                <ThemedView
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator
                  ]}
                />
              ))}
            </ThemedView>
          )}
        </ThemedView>

        {/* Content Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        bounces={false}
      >
        <ThemedView style={styles.contentContainer}>

          {/* Pricing Card */}
          <ThemedView
            style={styles.pricingCard}
          >
            <ThemedView>
              <ThemedText type ="caption" intensity ="light" style={styles.priceLabel}>À partir de</ThemedText>
              <ThemedView style={styles.priceRow}>
                <ThemedText type ="normal" intensity ="strong" style={styles.priceValue}>
                  {formatPrice(service.pricing?.basePrice, service.pricing?.currency)}
                </ThemedText>
                <ThemedText type ="caption" intensity ="light" style={styles.pricePeriod}>/{service.pricing?.billingPeriod || 'mois'}</ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={[styles.availabilityBadge, { backgroundColor: service.status === 'active' ? theme.success  : '#FFEBEE' }]}>
              <ThemedView style={[styles.statusDot, { backgroundColor: service.status === 'active' ? theme.surface :theme.error }]} />
              <ThemedText style={[styles.statusText, { color: service.status === 'active' ?theme.surface :theme.error }]}>
                {service.status === 'active' ? 'Disponible' : 'Indisponible'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Provider Section */}
          {service.provider && (
            <TouchableOpacity style={styles.sectionCard}>
              <ThemedView style={styles.sectionHeader}>
                <ThemedText type = "normal" style={styles.sectionTitle}>Fournisseur</ThemedText>
              </ThemedView>
              <ThemedView style={{...styles.providerRow, borderWidth:1, borderColor:theme.outline + "40"}}>
                <ThemedView style={styles.providerAvatar}>
                  <ThemedText type ="normal" intensity = "strong" style = {{color:theme.primary}}>
                    {(service.provider.companyName || 'P').charAt(0)}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.providerInfo}>
                  <ThemedView style={styles.verifiedRow}>
                    <ThemedText type ="normal" intensity = "strong" style = {{color:theme.primary}}>
                      {service.provider.companyName || 'Prestataire inconnu'}
                    </ThemedText>
                    {service.provider.isVerified && (
                      <MaterialCommunityIcons name="check-decagram" size={16} color= {theme.primary} style={{ marginLeft: 4 }} />
                    )}
                  </ThemedView>
                  <ThemedText type ="caption" intensity = "light">Professionnel certifié</ThemedText>
                </ThemedView>

                {service.provider.contactInfo?.phone && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleContact('phone', service.provider.contactInfo.phone)}
                  >
                    <Ionicons name="call-outline" size={20} color={theme.primary}  />
                  </TouchableOpacity>
                )}
              </ThemedView>
            </TouchableOpacity>
          )}

          {/* Description */}
          <ThemedView style={styles.sectionCard}>
            <ThemedText type ="normal" style={styles.sectionTitle}>À propos</ThemedText>
            <ThemedText type = "normal" intensity = "light"
              style={styles.descriptionText}
              numberOfLines={showFullDescription ? undefined : 2}
            >
              {service.description}
            </ThemedText>
            {service.description.length > 100 && (
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={styles.readMoreButton}
              >
                <ThemedText type ="normal" style={styles.readMoreText}>
                  {showFullDescription ? 'Voir moins' : 'Voir plus'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>

          {/* Details Grid */}
          <ThemedView style={styles.gridContainer}>
            <ThemedView style={styles.gridItem}>
              <ThemedView style={styles.iconBox}>
                <MaterialCommunityIcons name="clock-outline" size={24} color={theme.primary}/>
              </ThemedView>
              <ThemedText type = "caption" intensity ="light">Horaires</ThemedText>
              <ThemedText type ="normal" intensity ='strong'>{service.availability?.schedule?.hours || '09:00 - 18:00'}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.gridItem}>
              <ThemedView style={styles.iconBox}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={24} color={theme.success} />
              </ThemedView>
              <ThemedText type = "caption" intensity ="light">Zones</ThemedText>
              <ThemedText type= "normal" intensity ="strong" numberOfLines={1}>
                {service.availability?.zones?.length || 0} zones
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.gridItem}>
              <ThemedView style={styles.iconBox}>
                <MaterialCommunityIcons name="file-document-outline" size={24} color= {theme.error} />
              </ThemedView>
              <ThemedText type = "caption" intensity ="light">Contrats</ThemedText>
              <ThemedText type= "normal" intensity ="strong">{service.contractTypes?.length || 0} types</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Tags */}
          {service.tags && (
            <ThemedView style={styles.tagsRow}>
              {service.tags.map((tag: string, index: number) => (
                <ThemedView key={index} style={styles.tagChip}>
                  <ThemedText type = "normal" intensity ="light">#{tag}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}

        </ThemedView>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <ThemedView style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={[styles.subscribeButton, { opacity: subscribing || service.status !== 'active' ? 0.7 : 1, backgroundColor:theme.onSurface }]}
          onPress={showSubscribeOptions}
          disabled={subscribing || service.status !== 'active'}
          activeOpacity={0.8}
        >
          {subscribing ? (
            <ActivityIndicator color= {theme.surface} />
          ) : (
            <ThemedText style={styles.subscribeText}>
              {service.status === 'active' ? "S'abonner maintenant" : 'Non disponible'}
            </ThemedText>
          )}
          {service.status === 'active' && !subscribing && (
            <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      </ThemedView>
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
  headerContainer: {
    height: screenHeight * 0.45,
    width: screenWidth,
    position: 'relative',
  },
  headerImage: {
    width: screenWidth,
    height: screenHeight * 0.45,
  },
  placeholderHeader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },

  headerOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  headerTitle: {
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    alignSelf: 'center',
  },
  ratingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
  },

  indicatorsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: 'white',
    width: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
    marginTop: -2,
  },
  pricingCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 8,
  },
  priceLabel: {
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    color: '#1C1C1E',
  },
  pricePeriod: {
    marginLeft: 2,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 10,
    marginBottom: 2,
    paddingTop:8
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  sectionTitle: {
    marginBottom: 8,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding:10,
    borderRadius:10,
    paddingHorizontal:18
    
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionText: {
    lineHeight: 22,
  },
  readMoreButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#007AFF',
    fontWeight: '600',
    
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gridItem: {
    width: '31%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  gridLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  subscribeButton: {
    borderRadius: 16,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
