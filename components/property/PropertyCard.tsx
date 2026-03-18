import React from 'react';
import { TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { Property } from '@/services/api/propertyService';

const { width } = Dimensions.get('window');

interface PropertyCardProps {
  property: Property;
  index: number;
  style?: 'list' | 'grid';
  onPress?: (property: Property) => void;
  onFavoriteToggle?: (property: Property) => void;
  isFavorite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  index,
  style = 'list',
  onPress,
  onFavoriteToggle,
  isFavorite = false
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(property);
    } else {
      router.push(`/info/${property.id}`);
    }
  };

  const handleFavoritePress = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(property);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'villa':
      case 'home':
        return 'home';
      case 'apartment':
        return 'apartment';
      case 'studio':
        return 'business';
      case 'penthouse':
        return 'location-city';
      case 'loft':
        return 'warehouse';
      case 'bureau':
        return 'work';
      case 'hotel':
        return 'hotel';
      case 'terrain':
        return 'terrain';
      case 'commercial':
        return 'store';
      default:
        return 'home';
    }
  };

  const getActionTypeColor = (actionType: string) => {
    return actionType === 'rent' ? theme.primary : theme.success;
  };

  // Per-unit room availability
  const hasRooms = property.propertyRooms && property.propertyRooms.length > 0;
  const isPerUnit = property.rentalStrategy === 'per_unit' || property.rentalStrategy === 'both';
  const isSaleProperty = property.actionType === 'sell' || property.actionType === 'sale';
  const roomAvailability = property.roomAvailability;
  const showRoomInfo = hasRooms && isPerUnit && !isSaleProperty;

  const getRoomAvailabilityBadge = () => {
    if (!showRoomInfo || !roomAvailability) return null;
    const { total, available } = roomAvailability;
    if (available === 0) return { text: 'Complet', color: theme.error };
    if (available === total) return { text: `${total} dispo`, color: theme.success };
    return { text: `${available}/${total} dispo`, color: theme.warning };
  };

  const roomBadge = getRoomAvailabilityBadge();

  // Build room images for horizontal scroll
  const roomImages = hasRooms
    ? property.propertyRooms!.map((room: any) => {
        const img = room.images?.[0];
        const uri = typeof img === 'string' ? img : img?.variants?.small || img?.variants?.thumbnail || img?.originalUrl || null;
        return { uri, roomName: room.roomName, price: room.price, currency: room.currency, isAvailable: room.isAvailable !== false };
      }).filter((r: any) => r.uri)
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return theme.success;
      case 'RENTED':
        return theme.warning;
      case 'MAINTENANCE':
        return theme.warning;
      case 'UNAVAILABLE':
        return theme.error;
      default:
        return theme.onSurface + '60';
    }
  };

  if (style === 'grid') {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 100, type: 'spring' }}
        style={{
          width: (width - 48) / 2,
          marginBottom: 16,
          marginHorizontal: 4
        }}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <ThemedView
            style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: theme.onSurface,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: theme.outline + '20'
            }}
          >
            {/* Image with horizontal room scroll */}
            <ThemedView style={{ position: 'relative' }}>
              {showRoomInfo && roomImages.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled={false}
                  contentContainerStyle={{ gap: 0 }}
                  style={{ height: 120 }}
                >
                  {/* Main property image */}
                  <Image
                    source={{ uri: property.images[0] || 'https://via.placeholder.com/300' }}
                    style={{
                      width: (width - 48) / 2,
                      height: 120,
                      backgroundColor: theme.surfaceVariant
                    }}
                    resizeMode="cover"
                  />
                  {/* Room images */}
                  {roomImages.map((room: any, idx: number) => (
                    <ThemedView key={idx} style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: room.uri }}
                        style={{
                          width: (width - 48) / 2 - 20,
                          height: 120,
                          backgroundColor: theme.surfaceVariant
                        }}
                        resizeMode="cover"
                      />
                      <ThemedView style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                      }}>
                        <ThemedText style={{ color: 'white', fontSize: 9, fontWeight: '700' }} numberOfLines={1}>
                          {room.roomName}
                        </ThemedText>
                        {room.price > 0 && (
                          <ThemedText style={{ color: '#34D399', fontSize: 8, fontWeight: '600' }}>
                            {room.price?.toLocaleString()} {room.currency || 'XAF'}
                          </ThemedText>
                        )}
                      </ThemedView>
                      {!room.isAvailable && (
                        <ThemedView style={{
                          position: 'absolute', top: 4, right: 4,
                          backgroundColor: '#ef444490', borderRadius: 4,
                          paddingHorizontal: 4, paddingVertical: 1,
                        }}>
                          <ThemedText style={{ color: 'white', fontSize: 7, fontWeight: '700' }}>Réservée</ThemedText>
                        </ThemedView>
                      )}
                    </ThemedView>
                  ))}
                </ScrollView>
              ) : (
                <Image
                  source={{ uri: property.images[0] || 'https://via.placeholder.com/300' }}
                  style={{
                    width: '100%',
                    height: 120,
                    backgroundColor: theme.surfaceVariant
                  }}
                  resizeMode="cover"
                />
              )}

              {/* Status Badge */}
              <ThemedView
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: getStatusColor(property.status),
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4
                }}
              >
                <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                  {property.status}
                </ThemedText>
              </ThemedView>

              {/* Favorite Button */}
              <TouchableOpacity
                onPress={handleFavoritePress}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 16,
                  padding: 6
                }}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={16}
                  color={isFavorite ? '#ff6b6b' : 'white'}
                />
              </TouchableOpacity>

              {/* Room availability badge */}
              {roomBadge && (
                <ThemedView
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    backgroundColor: roomBadge.color,
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2
                  }}
                >
                  <ThemedText style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>
                    {roomBadge.text}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            {/* Content */}
            <ThemedView style={{ padding: 12 }}>
              <ThemedText
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.onSurface,
                  marginBottom: 4
                }}
                numberOfLines={2}
              >
                {property.title}
              </ThemedText>

              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="location-outline" size={12} color={theme.onSurface + '80'} />
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: theme.onSurface + '80',
                    marginLeft: 4
                  }}
                  numberOfLines={1}
                >
                  {property.generalHInfo?.area}
                </ThemedText>
              </ThemedView>

              {/* Room count indicator for per_unit properties */}
              {showRoomInfo && roomAvailability && (
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 }}>
                  <MaterialCommunityIcons name="door-open" size={12} color={theme.onSurface + '70'} />
                  <ThemedText style={{ fontSize: 10, color: theme.onSurface + '70' }}>
                    {roomAvailability.available === 0
                      ? `${roomAvailability.total} chambre${roomAvailability.total > 1 ? 's' : ''} - Complet`
                      : roomAvailability.available === roomAvailability.total
                        ? `${roomAvailability.total} chambre${roomAvailability.total > 1 ? 's' : ''} disponible${roomAvailability.total > 1 ? 's' : ''}`
                        : `${roomAvailability.available} sur ${roomAvailability.total} chambre${roomAvailability.total > 1 ? 's' : ''} disponible${roomAvailability.available > 1 ? 's' : ''}`
                    }
                  </ThemedText>
                </ThemedView>
              )}

              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: getActionTypeColor(property.actionType)
                  }}
                >
                  {formatPrice(property.ownerCriteria?.monthlyRent || 0)}
                </ThemedText>

                <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons
                    name={getPropertyTypeIcon(property.propertyType)}
                    size={14}
                    color={theme.onSurface + '60'}
                  />
                  <ThemedText style={{ fontSize: 12, marginLeft: 4, color: theme.onSurface + '60' }}>
                    {property.generalHInfo?.rooms}ch
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </MotiView>
    );
  }
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 50, type: 'spring' }}
      style={{ marginBottom: 8, marginHorizontal: 16 }}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <ThemedView className = "flex flex-row"
          style={{
            backgroundColor: theme.surface,
            borderRadius: 8,
            overflow: 'hidden',
            shadowColor: theme.onSurface,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            borderWidth: 1,
            borderColor: theme.outline + '20',
            flexDirection: 'row',
            height: 80,
            alignItems: 'center'
          }}
        >
          {/* Image */}
          <ThemedView style={{ position: 'relative', width: 80, height: 80 }}>
            <Image
              source={{ uri: property.images[0] || 'https://via.placeholder.com/80x80' }}
              style={{
                width: 80,
                height: 80,
                backgroundColor: theme.surfaceVariant
              }}
              resizeMode="cover"
            />

            {/* Status Badge */}
            <ThemedView
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                backgroundColor: getStatusColor(property.status),
                borderRadius: 4,
                paddingHorizontal: 3,
                paddingVertical: 1
              }}
            >
              <ThemedText style={{ color: 'white', fontSize: 6, fontWeight: '600' }}>
                {property.status}
              </ThemedText>
            </ThemedView>

            {/* Favorite Button */}
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 8,
                padding: 2
              }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={10}
                color={isFavorite ? '#ff6b6b' : theme.onSurface}
              />
            </TouchableOpacity>
          </ThemedView>

          {/* Content */}
          <ThemedView style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 6 }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <ThemedView style={{ flex: 1, marginRight: 8 }}>
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: theme.onSurface,
                    marginBottom: 2
                  }}
                  numberOfLines={1}
                >
                  {property.title}
                </ThemedText>

                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Ionicons name="location-outline" size={8} color={theme.onSurface + '80'} />
                  <ThemedText
                    style={{
                      fontSize: 8,
                      color: theme.onSurface + '80',
                      marginLeft: 2,
                      flex: 1
                    }}
                    numberOfLines={1}
                  >
                    {property.address}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="bed" size={8} color={theme.primary} />
                  <ThemedText style={{ fontSize: 8, marginLeft: 1, color: theme.onSurface, marginRight: 4 }}>
                    {property.generalHInfo?.bedrooms}
                  </ThemedText>
                  <MaterialCommunityIcons name="shower" size={8} color={theme.primary} />
                  <ThemedText style={{ fontSize: 8, marginLeft: 1, color: theme.onSurface, marginRight: 4 }}>
                    {property.generalHInfo?.bathrooms}
                  </ThemedText>
                  <MaterialCommunityIcons name="ruler-square" size={8} color={theme.primary} />
                  <ThemedText style={{ fontSize: 8, marginLeft: 1, color: theme.onSurface }}>
                    {property.generalHInfo?.surface}m²
                  </ThemedText>
                  {showRoomInfo && roomBadge && (
                    <>
                      <MaterialCommunityIcons name="door-open" size={8} color={roomBadge.color} style={{ marginLeft: 4 }} />
                      <ThemedText style={{ fontSize: 8, marginLeft: 1, color: roomBadge.color, fontWeight: '700' }}>
                        {roomBadge.text}
                      </ThemedText>
                    </>
                  )}
                </ThemedView>
              </ThemedView>

              <ThemedView style={{ alignItems: 'flex-end' }}>
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: '800',
                    color: getActionTypeColor(property.actionType),
                    marginBottom: 2
                  }}
                >
                  {formatPrice(property.ownerCriteria.monthlyRent)}
                  {property.actionType === 'rent' && (
                    <ThemedText style={{ fontSize: 8, fontWeight: '600' }}>/mois</ThemedText>
                  )}
                </ThemedText>

                <ThemedView
                  style={{
                    backgroundColor: getActionTypeColor(property.actionType),
                    borderRadius: 4,
                    paddingHorizontal: 4,
                    paddingVertical: 1
                  }}
                >
                  <ThemedText style={{ color: 'white', fontSize: 6, fontWeight: '600' }}>
                    {property.actionType === 'rent' ? 'À louer' : 'À vendre'}
                  </ThemedText>
                </ThemedView>
                {roomBadge && (
                  <ThemedView
                    style={{
                      backgroundColor: roomBadge.color + '20',
                      borderRadius: 4,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      marginTop: 2
                    }}
                  >
                    <ThemedText style={{ color: roomBadge.color, fontSize: 6, fontWeight: '700' }}>
                      {roomBadge.text}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </MotiView>
  );
};

export default PropertyCard;