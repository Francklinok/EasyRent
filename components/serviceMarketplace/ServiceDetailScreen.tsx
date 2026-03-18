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
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useLanguage } from '../contexts/language';
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
  const { t } = useLanguage();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

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
        t('services.loadError'),
        [{ text: t('common.back'), onPress: onBack }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (contractType: ContractType) => {
    if (!service || !userId || !propertyId) {
      Alert.alert('Erreur', t('services.subscribeError'));
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
        t('common.success'),
        t('services.subscribeSuccess'),
        [{ text: 'OK', onPress: () => onSubscribe?.(subscription) }]
      );
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
      Alert.alert(
        t('common.error'),
        t('services.subscribeRetry'),
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

    options.push({ text: t('common.cancel'), onPress: () => { } });

    Alert.alert(
      t('services.chooseContract'),
      t('services.contractType'),
      options
    );
  };

  // Obtenir le label d'un type de contrat
  const getContractTypeLabel = (type: ContractType): string => {
    const labels = {
      [ContractType.SHORT_TERM]: t('services.contract.shortTerm'),
      [ContractType.LONG_TERM]: t('services.contract.longTerm'),
      [ContractType.SEASONAL]: t('services.contract.seasonal'),
      [ContractType.ON_DEMAND]: t('services.contract.onDemand'),
      [ContractType.EMERGENCY]: t('services.contract.emergency'),
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
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D3436" />
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>{t('common.loading')}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!service) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D3436" />
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#E17055" />
          <ThemedText style={styles.errorTitle}>{t('services.notFound')}</ThemedText>
          <ThemedText style={styles.errorSubtitle}>
            {t('services.notFoundMsg')}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {service.title}
        </ThemedText>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#2D3436" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* Galerie d'images */}
        {service.media.photos.length > 0 && (
          <ThemedView style={styles.imageGallery}>
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
              <ThemedView style={styles.imageIndicators}>
                {service.media.photos.map((_, index) => (
                  <ThemedView
                    key={index}
                    style={[
                      styles.imageIndicator,
                      index === currentImageIndex && styles.imageIndicatorActive
                    ]}
                  />
                ))}
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Informations principales */}
        <ThemedView style={styles.mainInfo}>
          <ThemedView style={styles.titleRow}>
            <ThemedText style={styles.title}>{service.title}</ThemedText>
            <ThemedView style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{service.category}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.ratingRow}>
            <ThemedView style={styles.rating}>
              <Ionicons name="star" size={16} color="#FDCB6E" />
              <ThemedText style={styles.ratingText}>{service.rating.toFixed(1)}</ThemedText>
              <ThemedText style={styles.reviewCount}>({service.totalReviews} avis)</ThemedText>
            </ThemedView>
            {service.availability.isEmergency && (
              <ThemedView style={styles.emergencyBadge}>
                <Ionicons name="flash" size={14} color="#E17055" />
                <ThemedText style={styles.emergencyText}>Urgence</ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.priceRow}>
            <ThemedText style={styles.price}>
              {formatPrice(service.pricing.basePrice, service.pricing.currency)}
            </ThemedText>
            <ThemedText style={styles.billingPeriod}>
              /{service.pricing.billingPeriod}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Fournisseur */}
        {service.provider && (
          <ThemedView style={styles.providerSection}>
            <ThemedText style={styles.sectionTitle}>Prestataire</ThemedText>
            <ThemedView style={styles.providerInfo}>
              <ThemedView style={styles.providerHeader}>
                <ThemedText style={styles.providerName}>
                  {service.provider.companyName || 'Prestataire'}
                </ThemedText>
                {service.provider.isVerified && (
                  <ThemedView style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#00B894" />
                    <ThemedText style={styles.verifiedText}>Vérifié</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
              <ThemedText style={styles.providerDescription}>
                {service.provider.description}
              </ThemedText>
              <ThemedView style={styles.providerStats}>
                <ThemedText style={styles.providerStat}>
                  ⭐ {service.provider.rating.toFixed(1)} ({service.provider.totalReviews} avis)
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Description */}
        <ThemedView style={styles.descriptionSection}>
          <ThemedText style={styles.sectionTitle}>Description</ThemedText>
          <ThemedText
            style={styles.description}
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {service.description}
          </ThemedText>
          <TouchableOpacity
            onPress={() => setShowFullDescription(!showFullDescription)}
          >
            <ThemedText style={styles.showMoreText}>
              {showFullDescription ? 'Voir moins' : 'Voir plus'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Informations pratiques */}
        <ThemedView style={styles.practicalInfo}>
          <ThemedText style={styles.sectionTitle}>Informations pratiques</ThemedText>

          {/* Types de contrat disponibles */}
          <ThemedView style={styles.infoItem}>
            <Ionicons name="document-text" size={20} color="#636E72" />
            <ThemedView style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Types de contrat</ThemedText>
              <ThemedText style={styles.infoValue}>
                {service.contractTypes.map(getContractTypeLabel).join(', ')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Zones de service */}
          <ThemedView style={styles.infoItem}>
            <Ionicons name="location" size={20} color="#636E72" />
            <ThemedView style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Zones de service</ThemedText>
              <ThemedText style={styles.infoValue}>
                {service.availability.zones.join(', ')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Horaires */}
          <ThemedView style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#636E72" />
            <ThemedView style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Horaires</ThemedText>
              <ThemedText style={styles.infoValue}>
                {service.availability.schedule.days.join(', ')} - {service.availability.schedule.hours}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Types de propriété */}
          <ThemedView style={styles.infoItem}>
            <Ionicons name="home" size={20} color="#636E72" />
            <ThemedView style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Types de propriété</ThemedText>
              <ThemedText style={styles.infoValue}>
                {service.requirements.propertyTypes.join(', ')}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Tags */}
        {service.tags.length > 0 && (
          <ThemedView style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <ThemedView style={styles.tagsContainer}>
              {service.tags.map((tag, index) => (
                <ThemedView key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>

      {/* Footer avec bouton d'abonnement */}
      {userId && propertyId && (
        <ThemedView style={styles.footer}>
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
        </ThemedView>
      )}
    </ThemedView>
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
    paddingHorizontal: 10,
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