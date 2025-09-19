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
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Service,
  ServiceSubscription,
  getServiceMarketplaceService,
  SubscribeServiceInput,
  ContractType,
} from '../../services/api/serviceMarketplaceService';

const { width: screenWidth } = Dimensions.get('window');

interface ServiceDetailScreenProps {
  serviceId: string;
  onBack: () => void;
  onSubscribe?: (subscription: ServiceSubscription) => void;
  userId?: string;
  propertyId?: string;
}

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  serviceId,
  onBack,
  onSubscribe,
  userId,
  propertyId,
}) => {
  const insets = useSafeAreaInsets();
  const serviceMarketplace = getServiceMarketplaceService();

  // États
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Charger le service
  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const serviceData = await serviceMarketplace.getService(serviceId);
      setService(serviceData);
    } catch (error) {
      console.error('Erreur lors du chargement du service:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les détails du service.',
        [{ text: 'Retour', onPress: onBack }]
      );
    } finally {
      setLoading(false);
    }
  };

  // S'abonner au service
  const handleSubscribe = async (contractType: ContractType) => {
    if (!service || !userId || !propertyId) {
      Alert.alert('Erreur', 'Informations manquantes pour s\'abonner au service.');
      return;
    }

    try {
      setSubscribing(true);

      const subscribeInput: SubscribeServiceInput = {
        serviceId: service.id,
        propertyId,
        contractType,
        startDate: new Date().toISOString(),
        autoRenewal: false,
      };

      const subscription = await serviceMarketplace.subscribeToService(subscribeInput);

      Alert.alert(
        'Succès',
        'Vous êtes maintenant abonné à ce service !',
        [{ text: 'OK', onPress: () => onSubscribe?.(subscription) }]
      );
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
      Alert.alert(
        'Erreur',
        'Impossible de s\'abonner au service. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubscribing(false);
    }
  };

  // Afficher les options d'abonnement
  const showSubscribeOptions = () => {
    if (!service) return;

    const options = service.contractTypes.map(type => ({
      text: getContractTypeLabel(type),
      onPress: () => handleSubscribe(type),
    }));

    options.push({ text: 'Annuler', onPress: () => {} });

    Alert.alert(
      'Choisir un type de contrat',
      'Quel type de contrat souhaitez-vous ?',
      options
    );
  };

  // Obtenir le label d'un type de contrat
  const getContractTypeLabel = (type: ContractType): string => {
    const labels = {
      [ContractType.SHORT_TERM]: 'Court terme',
      [ContractType.LONG_TERM]: 'Long terme',
      [ContractType.SEASONAL]: 'Saisonnier',
      [ContractType.ON_DEMAND]: 'À la demande',
      [ContractType.EMERGENCY]: 'Urgence',
    };
    return labels[type] || type;
  };

  // Formater le prix
  const formatPrice = (price: number, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D3436" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D3436" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#E17055" />
          <Text style={styles.errorTitle}>Service introuvable</Text>
          <Text style={styles.errorSubtitle}>
            Ce service n'existe pas ou n'est plus disponible.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {service.title}
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#2D3436" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Galerie d'images */}
        {service.media.photos.length > 0 && (
          <View style={styles.imageGallery}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / screenWidth
                );
                setCurrentImageIndex(newIndex);
              }}
            >
              {service.media.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {service.media.photos.length > 1 && (
              <View style={styles.imageIndicators}>
                {service.media.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.imageIndicator,
                      index === currentImageIndex && styles.imageIndicatorActive
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Informations principales */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{service.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FDCB6E" />
              <Text style={styles.ratingText}>{service.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({service.totalReviews} avis)</Text>
            </View>
            {service.availability.isEmergency && (
              <View style={styles.emergencyBadge}>
                <Ionicons name="flash" size={14} color="#E17055" />
                <Text style={styles.emergencyText}>Urgence</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(service.pricing.basePrice, service.pricing.currency)}
            </Text>
            <Text style={styles.billingPeriod}>
              /{service.pricing.billingPeriod}
            </Text>
          </View>
        </View>

        {/* Fournisseur */}
        {service.provider && (
          <View style={styles.providerSection}>
            <Text style={styles.sectionTitle}>Prestataire</Text>
            <View style={styles.providerInfo}>
              <View style={styles.providerHeader}>
                <Text style={styles.providerName}>
                  {service.provider.companyName || 'Prestataire'}
                </Text>
                {service.provider.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#00B894" />
                    <Text style={styles.verifiedText}>Vérifié</Text>
                  </View>
                )}
              </View>
              <Text style={styles.providerDescription}>
                {service.provider.description}
              </Text>
              <View style={styles.providerStats}>
                <Text style={styles.providerStat}>
                  ⭐ {service.provider.rating.toFixed(1)} ({service.provider.totalReviews} avis)
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text
            style={styles.description}
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {service.description}
          </Text>
          <TouchableOpacity
            onPress={() => setShowFullDescription(!showFullDescription)}
          >
            <Text style={styles.showMoreText}>
              {showFullDescription ? 'Voir moins' : 'Voir plus'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Informations pratiques */}
        <View style={styles.practicalInfo}>
          <Text style={styles.sectionTitle}>Informations pratiques</Text>

          {/* Types de contrat disponibles */}
          <View style={styles.infoItem}>
            <Ionicons name="document-text" size={20} color="#636E72" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Types de contrat</Text>
              <Text style={styles.infoValue}>
                {service.contractTypes.map(getContractTypeLabel).join(', ')}
              </Text>
            </View>
          </View>

          {/* Zones de service */}
          <View style={styles.infoItem}>
            <Ionicons name="location" size={20} color="#636E72" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Zones de service</Text>
              <Text style={styles.infoValue}>
                {service.availability.zones.join(', ')}
              </Text>
            </View>
          </View>

          {/* Horaires */}
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#636E72" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Horaires</Text>
              <Text style={styles.infoValue}>
                {service.availability.schedule.days.join(', ')} - {service.availability.schedule.hours}
              </Text>
            </View>
          </View>

          {/* Types de propriété */}
          <View style={styles.infoItem}>
            <Ionicons name="home" size={20} color="#636E72" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Types de propriété</Text>
              <Text style={styles.infoValue}>
                {service.requirements.propertyTypes.join(', ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        {service.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {service.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer avec bouton d'abonnement */}
      {userId && propertyId && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.subscribeButton, subscribing && styles.subscribeButtonDisabled]}
            onPress={showSubscribeOptions}
            disabled={subscribing}
          >
            {subscribing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.subscribeButtonText}>S'abonner</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  } as ViewStyle,

  backButton: {
    padding: 4,
  } as ViewStyle,

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
    marginHorizontal: 16,
  } as TextStyle,

  shareButton: {
    padding: 4,
  } as ViewStyle,

  content: {
    flex: 1,
  } as ViewStyle,

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#636E72',
  } as TextStyle,

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  } as ViewStyle,

  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,

  errorSubtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
  } as TextStyle,

  imageGallery: {
    position: 'relative',
  } as ViewStyle,

  serviceImage: {
    width: screenWidth,
    height: 250,
  } as ViewStyle,

  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  } as ViewStyle,

  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  } as ViewStyle,

  imageIndicatorActive: {
    backgroundColor: 'white',
  } as ViewStyle,

  mainInfo: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  } as ViewStyle,

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  } as ViewStyle,

  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginRight: 12,
  } as TextStyle,

  categoryBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  } as ViewStyle,

  categoryText: {
    fontSize: 12,
    color: '#636E72',
    textTransform: 'capitalize',
  } as TextStyle,

  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginLeft: 4,
  } as TextStyle,

  reviewCount: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 4,
  } as TextStyle,

  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  emergencyText: {
    fontSize: 12,
    color: '#E17055',
    fontWeight: '500',
    marginLeft: 4,
  } as TextStyle,

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  } as ViewStyle,

  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  } as TextStyle,

  billingPeriod: {
    fontSize: 16,
    color: '#636E72',
    marginLeft: 4,
  } as TextStyle,

  providerSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  } as ViewStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  } as TextStyle,

  providerInfo: {
    // Container styles
  } as ViewStyle,

  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    flex: 1,
  } as TextStyle,

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  verifiedText: {
    fontSize: 12,
    color: '#00B894',
    fontWeight: '500',
    marginLeft: 4,
  } as TextStyle,

  providerDescription: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 8,
  } as TextStyle,

  providerStats: {
    // Container styles
  } as ViewStyle,

  providerStat: {
    fontSize: 14,
    color: '#636E72',
  } as TextStyle,

  descriptionSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  } as ViewStyle,

  description: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
    marginBottom: 8,
  } as TextStyle,

  showMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  } as TextStyle,

  practicalInfo: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  } as ViewStyle,

  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,

  infoContent: {
    flex: 1,
    marginLeft: 12,
  } as ViewStyle,

  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636E72',
    marginBottom: 4,
  } as TextStyle,

  infoValue: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 22,
  } as TextStyle,

  tagsSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  } as ViewStyle,

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  } as ViewStyle,

  tag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    margin: 4,
  } as ViewStyle,

  tagText: {
    fontSize: 14,
    color: '#636E72',
  } as TextStyle,

  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  } as ViewStyle,

  subscribeButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  } as ViewStyle,

  subscribeButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  } as TextStyle,
});

export default ServiceDetailScreen;