import React from 'react';
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Service, ServiceCategory, ServiceStatus } from '../../services/api/serviceMarketplaceService';
import { useLanguage } from '../contexts/language';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '@/hooks/themehook';

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
  const { t } = useLanguage();
  const {theme} = useTheme()
  const getCategoryIcon = (category: ServiceCategory): string => {
    const iconMap: Record<ServiceCategory, string> = {
      [ServiceCategory.MAINTENANCE]: 'construct',
      [ServiceCategory.CLEANING]: 'sparkles',
      [ServiceCategory.GARDENING]: 'leaf',
      [ServiceCategory.SECURITY]: 'shield-checkmark',
      [ServiceCategory.PROPERTY_MANAGEMENT]: 'business',
      [ServiceCategory.CONSTRUCTION]: 'hammer',
      [ServiceCategory.RENOVATION]: 'build',
      [ServiceCategory.AGRICULTURE]: 'leaf-outline',
      [ServiceCategory.UTILITIES]: 'flash',
      [ServiceCategory.WASTE_MANAGEMENT]: 'trash',
      [ServiceCategory.PEST_CONTROL]: 'bug',
      [ServiceCategory.HEALTHCARE_HOME]: 'medical',
      [ServiceCategory.CHILDCARE_HOME]: 'happy',
      [ServiceCategory.ELDERCARE_HOME]: 'accessibility',
      [ServiceCategory.TRANSPORT_LOGISTICS]: 'car',
      [ServiceCategory.INSPECTION]: 'search',
      [ServiceCategory.LEGAL_ADMIN]: 'document-text',
      [ServiceCategory.EMERGENCY]: 'alert-circle',
      [ServiceCategory.ECO_SERVICES]: 'earth',
      [ServiceCategory.HOSPITALITY_SERVICES]: 'bed',
      [ServiceCategory.OFFICE_SERVICES]: 'briefcase',
      [ServiceCategory.COMMERCIAL_SERVICES]: 'storefront',
      [ServiceCategory.OTHER]: 'ellipsis-horizontal',
    };
    return iconMap[category] || 'help-circle';
  };

  const getCategoryColor = (category: ServiceCategory): string => {
    const colorMap: Record<ServiceCategory, string> = {
      [ServiceCategory.MAINTENANCE]: '#FF6B35',
      [ServiceCategory.CLEANING]: '#4ECDC4',
      [ServiceCategory.GARDENING]: '#96CEB4',
      [ServiceCategory.SECURITY]: '#45B7D1',
      [ServiceCategory.PROPERTY_MANAGEMENT]: '#6C5CE7',
      [ServiceCategory.CONSTRUCTION]: '#E17055',
      [ServiceCategory.RENOVATION]: '#FDCB6E',
      [ServiceCategory.AGRICULTURE]: '#00B894',
      [ServiceCategory.UTILITIES]: '#FD79A8',
      [ServiceCategory.WASTE_MANAGEMENT]: '#636E72',
      [ServiceCategory.PEST_CONTROL]: '#D63031',
      [ServiceCategory.HEALTHCARE_HOME]: '#0984E3',
      [ServiceCategory.CHILDCARE_HOME]: '#FFEAA7',
      [ServiceCategory.ELDERCARE_HOME]: '#A29BFE',
      [ServiceCategory.TRANSPORT_LOGISTICS]: '#2D3436',
      [ServiceCategory.INSPECTION]: '#00CEC9',
      [ServiceCategory.LEGAL_ADMIN]: '#6C5CE7',
      [ServiceCategory.EMERGENCY]: '#E17055',
      [ServiceCategory.ECO_SERVICES]: '#00B894',
      [ServiceCategory.HOSPITALITY_SERVICES]: '#74B9FF',
      [ServiceCategory.OFFICE_SERVICES]: '#B2BEC3',
      [ServiceCategory.COMMERCIAL_SERVICES]: '#FDCB6E',
      [ServiceCategory.OTHER]: '#DFE6E9',
    };
    return colorMap[category] || '#74B9FF';
  };

  const getStatusBadge = (status: ServiceStatus) => {
    const statusConfig = {
      [ServiceStatus.ACTIVE]: { color: '#00B894', text: t('services.status.active') },
      [ServiceStatus.INACTIVE]: { color: '#636E72', text: t('services.status.inactive') },
      [ServiceStatus.PENDING]: { color: '#FDCB6E', text: t('services.status.pending') },
      [ServiceStatus.SUSPENDED]: { color: '#E17055', text: t('services.status.suspended') },
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
      style={[styles.container, style, {borderWidth:1, borderColor:theme.outline + "80"}]}
      onPress={() => onPress?.(service)}
      activeOpacity={0.7}
    >
      <ThemedView backgroundColor = "transparent" style={styles.header}>
        <ThemedView style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Ionicons name={categoryIcon as any} size={20} color="white" />
        </ThemedView>

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
      </ThemedView>

      {service.media.photos.length > 0 && (
        <ThemedView style={styles.imageContainer}>
          <Image
            source={{ uri: service.media.photos[0] }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        </ThemedView>
      )}

      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleRow}>
          <ThemedText type = "normaltitle" style={styles.title} numberOfLines={2}>
            {service.title}
          </ThemedText>
          <ThemedView style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
            <ThemedText type ="caption" style={{...styles.statusText,  color:"white"}}>{statusBadge.text}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedText type = "normal" style={styles.description} numberOfLines={3}>
          {service.description}
        </ThemedText>

        {service.provider && (
          <ThemedView style={styles.providerRow}>
            <Ionicons name="business" size={16} color= {theme.text + "90"}/>
            <ThemedText type = "normal" style={styles.providerName}>
              {service.provider.companyName || t('services.provider')}
            </ThemedText>
            {service.provider.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#00B894" />
            )}
          </ThemedView>
        )}

        <ThemedView style={styles.footer}>
          <ThemedView style={styles.priceContainer}>
            <ThemedText type = "subtitle" style={styles.price}>
              {formatPrice(service.pricing.basePrice, service.pricing.currency)}
            </ThemedText>
            <ThemedText type ="normal" style={{...styles.billingPeriod, color:theme.text + "80"}}>
              /{service.pricing.billingPeriod}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FDCB6E" />
            <ThemedText type = "normal" style={styles.rating}>{service.rating.toFixed(1)}</ThemedText>
            <ThemedText type ="caption" style={styles.reviewCount}>({service.totalReviews})</ThemedText>
          </ThemedView>
        </ThemedView>

        {service.tags.length > 0 && (
          <ThemedView style={styles.tagsContainer}>
            {service.tags.slice(0, 3).map((tag, index) => (
              <ThemedView key={index} style={styles.tag}>
                <ThemedText type ="caption">{tag}</ThemedText>
              </ThemedView>
            ))}
            {service.tags.length > 3 && (
              <ThemedText type = "caption" style={styles.moreTagsText}>+{service.tags.length - 3}</ThemedText>
            )}
          </ThemedView>
        )}

        {service.availability.isEmergency && (
          <ThemedView style={styles.emergencyBadge}>
            <Ionicons name="flash" size={14} color="#E17055" />
            <ThemedText type = "caption" style={styles.emergencyText}>{t('services.emergency')}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
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
    elevation: 1,
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
    // backgroundColor: '#F8F9FA',
  } as ViewStyle,

  serviceImage: {
    width: '100%',
    height: '100%',
  } ,

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
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    fontWeight: '500',
    color: 'white',
  } as TextStyle,

  description: {
    lineHeight: 20,
    marginBottom: 8,
  } as TextStyle,

  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  providerName: {
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
    fontWeight: '700',
  } as TextStyle,

  billingPeriod: {
    marginLeft: 2,
  } as TextStyle,

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  rating: {
    fontWeight: '600',
    marginLeft: 4,
  } as TextStyle,

  reviewCount: {
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

 
  moreTagsText: {
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
    color: '#E17055',
    fontWeight: '500',
    marginLeft: 4,
  } as TextStyle,
});

export default ServiceCard;