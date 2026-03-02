import { ThemedView } from "../ui/ThemedView";
import { ThemedText } from "../ui/ThemedText";
import { useRouter } from "expo-router";
import { TouchableOpacity,StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTheme } from "@/hooks/themehook";

// ─── Property card styled like ServiceCard ───────────────────────────────────

interface SearchPropertyCardProps {
  property: any;
  onPress?: () => void;
  onFavoriteToggle?: (property: any) => void;
  isFavorite?: boolean;
}

export  const SearchPropertyCard: React.FC<SearchPropertyCardProps> = ({
  property,
  onPress,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) onPress();
    else router.push(`/info/${property.id}`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);

  const typeColorMap: Record<string, string> = {
    villa: '#6C5CE7',
    apartment: '#45B7D1',
    studio: '#00B894',
    penthouse: '#E17055',
    loft: '#FDCB6E',
    bureau: '#0984E3',
    hotel: '#FD79A8',
    terrain: '#96CEB4',
    commercial: '#FF6B35',
  };

  const typeIconMap: Record<string, string> = {
    villa: 'home',
    apartment: 'business',
    studio: 'cube',
    penthouse: 'layers',
    loft: 'grid',
    bureau: 'briefcase',
    hotel: 'bed',
    terrain: 'map',
    commercial: 'storefront',
  };

  const propType = (property.propertyType || property.type || 'apartment').toLowerCase();
  const cardColor = typeIconMap[propType] ? typeColorMap[propType] : '#45B7D1';
  const cardIcon = typeIconMap[propType] || 'home';

  const statusConfig: Record<string, { color: string; label: string }> = {
    AVAILABLE:    { color: theme.success, label: 'Disponible' },
    RENTED:       { color: theme.star, label: 'Loué' },
    MAINTENANCE:  { color: theme.warning, label: 'Maintenance' },
    UNAVAILABLE:  { color: theme.outline, label: 'Indisponible' },
  };
  const statusCfg = statusConfig[property.status] || { color: '#636E72', label: property.status || '—' };

  const imageUri = property.images?.[0] || null;
  const area = property.generalHInfo?.area || property.address || '';
  const bedrooms = property.generalHInfo?.bedrooms ?? property.bedrooms ?? null;
  const bathrooms = property.generalHInfo?.bathrooms ?? property.bathrooms ?? null;
  const surface = property.generalHInfo?.surface ?? property.surface ?? null;
  const price = property.ownerCriteria?.monthlyRent ?? property.monthlyRent ?? 0;
  const isRent = property.actionType === 'rent' || !property.actionType;

  return (
    <TouchableOpacity
      style={propCardStyles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Floating badge + favorite — absolute over image */}
      <ThemedView backgroundColor = "transparent" style={propCardStyles.headerOverlay}>
        <ThemedView style={[propCardStyles.categoryBadge, { backgroundColor: cardColor }]}>
          <Ionicons name={cardIcon as any} size={20} color="white" />
        </ThemedView>
        <TouchableOpacity
          style={propCardStyles.favoriteButton}
          onPress={() => onFavoriteToggle?.(property)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#E17055' : '#636E72'}
          />
        </TouchableOpacity>
      </ThemedView>

      {/* Image */}
      <ThemedView style={propCardStyles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={propCardStyles.image} resizeMode="cover" />
        ) : (
          <ThemedView style={[propCardStyles.imagePlaceholder, { backgroundColor: cardColor + '22' }]}>
            <Ionicons name={cardIcon as any} size={40} color={cardColor} />
          </ThemedView>
        )}
      </ThemedView>

      {/* Content */}
      <ThemedView style={propCardStyles.content}>
        {/* Title + status badge */}
        <ThemedView style={propCardStyles.titleRow}>
          <ThemedText type = "subtitle" style={{...propCardStyles.title}} numberOfLines={2}>
            {property.title || 'Propriété'}
          </ThemedText>
          <ThemedView style={[propCardStyles.statusBadge, { backgroundColor: statusCfg.color }]}>
            <ThemedText type = "caption" style={propCardStyles.statusText}>{statusCfg.label}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Location */}
        {area ? (
          <ThemedView style={propCardStyles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#636E72" />
            <ThemedText type = "normal" style={propCardStyles.locationText} numberOfLines={1}>{area}</ThemedText>
          </ThemedView>
        ) : null}

        {/* Stats row: bedrooms, bathrooms, surface */}
        <ThemedView style={propCardStyles.statsRow}>
          {bedrooms != null && (
            <ThemedView style={propCardStyles.statItem}>
              <MaterialCommunityIcons name="bed-outline" size={14} color={cardColor} />
              <ThemedText type = "body" style={propCardStyles.statText}>{bedrooms} ch</ThemedText>
            </ThemedView>
          )}
          {bathrooms != null && (
            <ThemedView style={propCardStyles.statItem}>
              <MaterialCommunityIcons name="shower" size={14} color={cardColor} />
              <ThemedText type = "body" style={propCardStyles.statText}>{bathrooms} sdb</ThemedText>
            </ThemedView>
          )}
          {surface != null && (
            <ThemedView style={propCardStyles.statItem}>
              <MaterialCommunityIcons name="ruler-square" size={14} color={cardColor} />
              <ThemedText  type= "body" style={propCardStyles.statText}>{surface} m²</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Price + action type */}
        <ThemedView style={propCardStyles.footer}>
          <ThemedView style={propCardStyles.priceContainer}>
            <ThemedText type = "normaltitle" style={[propCardStyles.price, { color: isRent ? '#6C5CE7' : '#00B894' }]}>
              {formatPrice(price)}
            </ThemedText>
            {isRent && (
              <ThemedText type = "body" style={propCardStyles.billingPeriod}>/mois</ThemedText>
            )}
          </ThemedView>
          <ThemedView style={[propCardStyles.actionBadge, { backgroundColor: isRent ? '#6C5CE7' : '#00B894' }]}>
            <ThemedText type = "caption" style={propCardStyles.actionBadgeText}>
              {isRent ? 'À louer' : 'À vendre'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

const propCardStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 6,
  },
  imageContainer: {
    height: 160,
    // backgroundColor: '#F8F9FA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontWeight: '500',
    color: 'white',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    color: '#636E72',
    marginLeft: 4,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#2D3436',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontWeight: '700',
  },
  billingPeriod: {
    color: '#636E72',
    marginLeft: 2,
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontWeight: '600',
    color: 'white',
  },
});


