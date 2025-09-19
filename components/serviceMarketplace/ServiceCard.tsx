import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Service, ServiceCategory, ServiceStatus } from '../../services/api/serviceMarketplaceService';

interface ServiceCardProps {
  service: Service;
  onPress?: (service: Service) => void;
  onFavorite?: (service: Service) => void;
  isFavorite?: boolean;
  style?: ViewStyle;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPress,
  onFavorite,
  isFavorite = false,
  style,
}) => {
  const getCategoryIcon = (category: ServiceCategory): string => {
    const iconMap: Record<ServiceCategory, string> = {
      [ServiceCategory.MAINTENANCE]: 'construct',
      [ServiceCategory.CLEANING]: 'sparkles',
      [ServiceCategory.SECURITY]: 'shield-checkmark',
      [ServiceCategory.GARDENING]: 'leaf',
      [ServiceCategory.INSURANCE]: 'umbrella',
      [ServiceCategory.UTILITIES]: 'flash',
      [ServiceCategory.WELLNESS]: 'heart',
      [ServiceCategory.EMERGENCY]: 'alert-circle',
      [ServiceCategory.ECO]: 'earth',
      [ServiceCategory.TECH]: 'laptop',
      [ServiceCategory.COLLABORATIVE]: 'people',
    };
    return iconMap[category] || 'help-circle';
  };

  const getCategoryColor = (category: ServiceCategory): string => {
    const colorMap: Record<ServiceCategory, string> = {
      [ServiceCategory.MAINTENANCE]: '#FF6B35',
      [ServiceCategory.CLEANING]: '#4ECDC4',
      [ServiceCategory.SECURITY]: '#45B7D1',
      [ServiceCategory.GARDENING]: '#96CEB4',
      [ServiceCategory.INSURANCE]: '#FFEAA7',
      [ServiceCategory.UTILITIES]: '#FD79A8',
      [ServiceCategory.WELLNESS]: '#A29BFE',
      [ServiceCategory.EMERGENCY]: '#E17055',
      [ServiceCategory.ECO]: '#00B894',
      [ServiceCategory.TECH]: '#6C5CE7',
      [ServiceCategory.COLLABORATIVE]: '#FDCB6E',
    };
    return colorMap[category] || '#74B9FF';
  };

  const getStatusBadge = (status: ServiceStatus) => {
    const statusConfig = {
      [ServiceStatus.ACTIVE]: { color: '#00B894', text: 'Actif' },
      [ServiceStatus.INACTIVE]: { color: '#636E72', text: 'Inactif' },
      [ServiceStatus.PENDING]: { color: '#FDCB6E', text: 'En attente' },
      [ServiceStatus.SUSPENDED]: { color: '#E17055', text: 'Suspendu' },
    };
    return statusConfig[status];
  };

  const formatPrice = (price: number, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const statusBadge = getStatusBadge(service.status);
  const categoryColor = getCategoryColor(service.category);
  const categoryIcon = getCategoryIcon(service.category);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(service)}
      activeOpacity={0.7}
    >
      {/* En-tête avec image et favoris */}
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Ionicons name={categoryIcon as any} size={20} color="white" />
        </View>

        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onFavorite(service)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#E17055' : '#636E72'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Image du service */}
      {service.media.photos.length > 0 && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: service.media.photos[0] }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Titre et statut */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {service.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {service.description}
        </Text>

        {/* Fournisseur */}
        {service.provider && (
          <View style={styles.providerRow}>
            <Ionicons name="business" size={16} color="#636E72" />
            <Text style={styles.providerName}>
              {service.provider.companyName || 'Prestataire'}
            </Text>
            {service.provider.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#00B894" />
            )}
          </View>
        )}

        {/* Prix et évaluation */}
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatPrice(service.pricing.basePrice, service.pricing.currency)}
            </Text>
            <Text style={styles.billingPeriod}>
              /{service.pricing.billingPeriod}
            </Text>
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FDCB6E" />
            <Text style={styles.rating}>{service.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({service.totalReviews})</Text>
          </View>
        </View>

        {/* Tags */}
        {service.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {service.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {service.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{service.tags.length - 3}</Text>
            )}
          </View>
        )}

        {/* Informations d'urgence */}
        {service.availability.isEmergency && (
          <View style={styles.emergencyBadge}>
            <Ionicons name="flash" size={14} color="#E17055" />
            <Text style={styles.emergencyText}>Service d'urgence</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 1,
  } as ViewStyle,

  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
  } as ViewStyle,

  imageContainer: {
    height: 160,
    backgroundColor: '#F8F9FA',
  } as ViewStyle,

  serviceImage: {
    width: '100%',
    height: '100%',
  } as ViewStyle,

  content: {
    padding: 16,
  } as ViewStyle,

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  } as ViewStyle,

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    flex: 1,
    marginRight: 8,
  } as TextStyle,

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  } as TextStyle,

  description: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 12,
  } as TextStyle,

  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  providerName: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 6,
    marginRight: 4,
    flex: 1,
  } as TextStyle,

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  } as ViewStyle,

  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
  } as TextStyle,

  billingPeriod: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 2,
  } as TextStyle,

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginLeft: 4,
  } as TextStyle,

  reviewCount: {
    fontSize: 12,
    color: '#636E72',
    marginLeft: 2,
  } as TextStyle,

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  tag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  } as ViewStyle,

  tagText: {
    fontSize: 12,
    color: '#636E72',
  } as TextStyle,

  moreTagsText: {
    fontSize: 12,
    color: '#636E72',
    fontStyle: 'italic',
  } as TextStyle,

  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  } as ViewStyle,

  emergencyText: {
    fontSize: 12,
    color: '#E17055',
    fontWeight: '500',
    marginLeft: 4,
  } as TextStyle,
});

export default ServiceCard;