import React, { useMemo, useCallback, useEffect, useState } from "react";
import { TouchableOpacity, Animated, Dimensions, Share, Alert, ScrollView } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useTheme } from "@/hooks/themehook";
import { ThemeColors } from "@/types/themeTypes";
import { Availability } from "@/types/ItemType";
import { ExtendedItemTypes } from "@/types/ItemType";
import { useToggleFavorite } from "@/hooks/useToggleFavorite";
import { virtualTourService } from "@/services/api/virtualTourService";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { useLanguage } from "@/components/contexts/language";
import { premiumService } from "@/services/api/premiumService";
import StarRating from "@/components/ui/StarRating";
import PropertyStarRating from "@/components/ui/PropertyStarRating";
import { getRenderItemFacilities, getShareMessage } from "@/components/utils/propertyDisplayConfig";

const { width } = Dimensions.get('window');

// Design Constants
const IMAGE_HEIGHT = 220;
const ANIMATION_DURATION_MEDIUM = 300;
const ANIMATION_DURATION_LONG = 500;


type Props = {
  item: ExtendedItemTypes;
  setAnimatingElement: (id: string | null) => void;
  animatingElement: string | null;
  navigateToInfo: (item: ExtendedItemTypes) => void;
  onVirtualTourPress?: (tour: any) => void;
  onStarRatingChange?: (itemId: string, rating: number) => void;
  interactiveStars?: boolean;
};

interface StatusBadgeProps {
  availibility: Availability;
  theme: ThemeColors;
  unitAvailability?: { total: number; available: number } | null;
  rawStatus?: string;
}

interface PriceTagProps {
  price: string | number;
  currency:string;
  theme: ThemeColors;
}

interface FavoriteButtonProps {
  onPress: () => void;
  isFavorite: boolean;
  theme: ThemeColors;
  rotateAnim: Animated.Value;
}

interface FeaturesBadgeProps {
  features: FeatureIcon[];
  energyScore: number;
  theme: ThemeColors;
}

interface ActionButtonsProps {
  onPress: () => void;
  scaleAnim: Animated.Value;
  shimmerAnim: Animated.Value;
  virtualTourAvailable: boolean;
  breatheAnim: Animated.Value;
  theme: ThemeColors;
  onVirtualTourPress: () => void;
  onShare: () => void;
}

//  Create animated component once using expo-image
const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PropertyFacilitiesDisplayProps {
  type: string | undefined;
  generalInfo: any;
  theme: ThemeColors;
}

const PropertyFacilitiesDisplay = React.memo(({ type, generalInfo, theme }: PropertyFacilitiesDisplayProps) => {
  const facilities = getRenderItemFacilities(type, generalInfo);

  // display surface if no facilities
  if (facilities.length === 0 && generalInfo?.surface) {
    return (
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <MaterialCommunityIcons name="ruler-square" size={14} color={theme.typography.caption} />
        <ThemedText type ="normal" style={{ fontWeight: '600', color: theme.typography.body }}>
          {generalInfo.surface}m²
        </ThemedText>
      </ThemedView>
    );
  }

  const renderIcon = (facility: any) => {
    const iconColor = theme.typography.caption;
    if (facility.lib === 'Ionicons') {
      return <Ionicons name={facility.icon as any} size={14} color={iconColor} />;
    }
    return <MaterialCommunityIcons name={facility.icon as any} size={14} color={iconColor} />;
  };

  const formatValue = (facility: any) => {
    const value = facility.getValue(generalInfo);
    if (typeof value === 'boolean') {
      return facility.label;
    }
    if (facility.key === 'surface') {
      return `${value}m²`;
    }
    return value;
  };

  return (
    <>
      {facilities.map((facility) => (
        <ThemedView key={facility.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {renderIcon(facility)}
          <ThemedText type ="normal" style={{ fontWeight: '600', color: theme.typography.body }}>
            {formatValue(facility)}
          </ThemedText>
        </ThemedView>
      ))}
    </>
  );
});
PropertyFacilitiesDisplay.displayName = 'PropertyFacilitiesDisplay';

// Status Badge
const StatusBadge = React.memo(({ availibility, theme, unitAvailability, rawStatus }: StatusBadgeProps) => {
  const isAvailable = availibility === "available";

  // Determine label based on raw backend status for precise display
  let label: string;
  if (isAvailable) {
    label = "DISPONIBLE";
  } else if (rawStatus === 'RENTED') {
    label = "LOUÉ";
  } else if (rawStatus === 'SOLD') {
    label = "VENDU";
  } else if (rawStatus === 'MAINTENANCE') {
    label = "MAINTENANCE";
  } else if (rawStatus === 'ON_HOLD' || rawStatus === 'RESERVED' || rawStatus === 'RESERVER') {
    label = "RÉSERVÉ";
  } else {
    label = "INDISPONIBLE";
  }
  let badgeColors: [string, string] = isAvailable
    ? [theme.success, theme.success + '90']
    : [theme.error, theme.error + '90'];

  if (unitAvailability && unitAvailability.total > 0) {
    const { total, available } = unitAvailability;
    if (available === 0) {
      label = "COMPLET";
      badgeColors = [theme.error, theme.error + '90'];
    } else if (available === total) {
      label = `${total} chambre${total > 1 ? 's' : ''} dispo.`;
      badgeColors = [theme.success, theme.success + '90'];
    } else {
      label = `${available}/${total} dispo.`;
      badgeColors = ['#F59E0B', '#F59E0B90'];
    }
  }

  return (
    <ThemedView backgroundColor = "transparent"
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10
      }}
    >
      <LinearGradient
        colors={badgeColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: badgeColors[0],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <ThemedView
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: 'white',
            marginRight: 6,
            opacity: 0.9
          }}
        />
        <ThemedText
          style={{
            color: 'white',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.3,
          }}
        >
          {label}
        </ThemedText>
      </LinearGradient>
    </ThemedView>
  );
});
StatusBadge.displayName = 'StatusBadge';

//Price Tag 
const PriceTag = React.memo(({ price, currency }: PriceTagProps) => (
  <ThemedView
    style={{
      position: 'absolute',
      bottom: 14,
      right: 14,
      zIndex: 12,
      backgroundColor: 'transparent',
    }}
  >
    <BlurView intensity={90} tint="dark" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <ThemedView
        style={{
          paddingHorizontal: 8,
          paddingVertical: 6,
          flexDirection: 'row',
          alignItems: 'baseline',
           backgroundColor: 'rgba(255,255,255,0.1)',
           display: 'flex',
           gap:3
        }}
      >
        <ThemedText type = "subtitle"
          style={{
            color: '#FFFFFF',
            fontWeight: '900',
            letterSpacing: -0.5,
          }}
        >
          {price}
        </ThemedText>
        <ThemedText type = "caption"
          style={{
            color: 'rgba(255,255,255,0.7)',
            marginLeft:1,
          }}
        >
          {currency}
        </ThemedText>
      </ThemedView>
    </BlurView>
  </ThemedView>
));
PriceTag.displayName = 'PriceTag';

// Favorite Button 
const FavoriteButton = React.memo(({
  onPress,
  isFavorite,
  rotateAnim
}: FavoriteButtonProps) => {
  return (
    <ThemedView style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }} backgroundColor = "transparent">
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel="Toggle favorite"
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        <BlurView
          intensity={80}
          tint="dark"
          style={{
            borderRadius: 22,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: [{
                scale: rotateAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.25, 1],
                })
              }]
            }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? '#EF4444' : 'rgba(255,255,255,0.9)'}
            />
          </Animated.View>
        </BlurView>
      </TouchableOpacity>
    </ThemedView>
  );
});
FavoriteButton.displayName = "FavoriteButton"
//  Features Badge
const FeaturesBadge = React.memo(({ features, energyScore }: FeaturesBadgeProps) => {
  if (!features || features.length === 0) return null;

  return (
    <ThemedView backgroundColor = "transparent"
      style={{
        position: 'absolute',
        bottom: 60,
        left: 14,
        flexDirection: 'row',
        gap: 8,
      }}
    >
      {/* Energy Score Chip */}
      <BlurView intensity={80} tint="dark" style={{ borderRadius: 12, overflow: 'hidden' }}>
        <ThemedView
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
          }}
        >
          <MaterialCommunityIcons name="leaf" size={14} color="#22C55E" />
          <ThemedText
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: '#FFFFFF',
            }}
          >
            {energyScore}/10
          </ThemedText>
        </ThemedView>
      </BlurView>

      {/* Features Count Chip */}
      <BlurView intensity={80} tint="dark" style={{ borderRadius: 12, overflow: 'hidden' }}>
        <ThemedView
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
          }}
        >
          <MaterialCommunityIcons name="star-four-points" size={14} color="#818CF8" />
          <ThemedText
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: '#FFFFFF',
            }}
          >
            {features.length} équip.
          </ThemedText>
        </ThemedView>
      </BlurView>
    </ThemedView>
  );
});
FeaturesBadge.displayName = "FeaturesBadge"

const RenderItem: React.FC<Props> = ({
  item,
  setAnimatingElement,
  navigateToInfo,
  onVirtualTourPress,
  onStarRatingChange,
  interactiveStars = false
}) => {
  const { theme } = useTheme();
  const { isPremium, hasVerifiedListings, hasEarlyAccess, hasBoostVisibility, isOwnerRole } = usePremiumFeatures();
  const { t } = useLanguage();
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingTour, setLoadingTour] = useState(false);

  const truncatedReview = useMemo(() =>
    item.review?.length > 120 ? `${item.review.substring(0, 120)}...` : item.review,
    [item.review]
  );

  // Create stable animation refs with cleanup
  const animRefs = useMemo(() => {
    const refs = {
      scaleAnim: new Animated.Value(1),
      rotateAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0),
      breatheAnim: new Animated.Value(1),
      imageFadeAnim: new Animated.Value(0),
    };

    // Start long-running animations
    const shimmerAnimation = Animated.loop(
      Animated.timing(refs.shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    const breatheAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(refs.breatheAnim, {
          toValue: 1.02,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(refs.breatheAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();
    breatheAnimation.start();

    return { ...refs, shimmerAnimation, breatheAnimation };
  }, []);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      animRefs.shimmerAnimation?.stop();
      animRefs.breatheAnimation?.stop();
    };
  }, [animRefs]);

  // Shared favorites hook
  const { isFavorite, handleToggleFavorite } = useToggleFavorite({
    item,
    rotateAnim: animRefs.rotateAnim,
    setAnimatingElement,
  });

  // Optimized image source configuration for expo-image
  const imageSource = useMemo(() => {
    const primarySource = item.imageAvif || item.imageWebP || item.avatar;


    return {
      uri: primarySource || 'https://via.placeholder.com/400x300',
      blurhash: item.blurhash, 
    };
  }, [item.imageAvif, item.imageWebP, item.avatar, item.blurhash]);

  // Compute unit availability for properties with per_unit/both rental strategy OR hotels
  const unitAvailability = useMemo(() => {
    const strategy = (item as any).rentalStrategy;

    // Hotels always show per-unit availability (they inherently have individual rooms)
    if (item.hotelRoomTypes && item.hotelRoomTypes.length > 0) {
      let total = 0;
      let available = 0;
      for (const rt of item.hotelRoomTypes) {
        if (rt.rooms && rt.rooms.length > 0) {
          for (const room of rt.rooms) {
            total++;
            if (room.isAvailable) available++;
          }
        } else {
          total += rt.available || 0;
          available += rt.available || 0;
        }
      }
      return total > 0 ? { total, available } : null;
    }

    // Non-hotel: only show for per_unit or both strategy
    if (!strategy || strategy === 'global') return null;

    // For non-hotel properties with propertyRooms
    if (item.propertyRooms && item.propertyRooms.length > 0) {
      // Use roomAvailability from backend if available (calculated via reservations)
      if ((item as any).roomAvailability) {
        return (item as any).roomAvailability;
      }
      // Fallback: all rooms are available by default until a reservation is made
      const total = item.propertyRooms.length;
      const available = item.propertyRooms.filter((r: any) => r.isAvailable !== false).length || total;
      return { total, available };
    }

    return null;
  }, [item.propertyRooms, item.hotelRoomTypes, (item as any).rentalStrategy]);

  // Collect all slides: main property image first, then room images
  const allRoomImages = useMemo(() => {
    const slides: Array<{ roomId: string; roomName: string; imageUri: string; isMain?: boolean }> = [];

    // 1. Main property image from item.images (general property photos)
    if (item.images && item.images.length > 0) {
      const mainUri = typeof item.images[0] === 'string' ? item.images[0] : null;
      if (mainUri && !mainUri.includes('placeholder')) {
        slides.push({ roomId: 'main', roomName: item.title || 'Propriété', imageUri: mainUri, isMain: true });
      }
    }

    // 2. From propertyRooms (non-hotel)
    if (item.propertyRooms && item.propertyRooms.length > 0) {
      for (const room of item.propertyRooms) {
        if (room.images && room.images.length > 0) {
          const img = room.images[0];
          slides.push({
            roomId: room.roomId,
            roomName: room.roomName,
            imageUri: img.variants?.medium || img.variants?.small || img.originalUrl,
          });
        }
      }
    }
    // 3. From hotelRoomTypes[].rooms[] (hotel)
    if (item.hotelRoomTypes && item.hotelRoomTypes.length > 0) {
      for (const rt of item.hotelRoomTypes) {
        if (rt.rooms && rt.rooms.length > 0) {
          for (const room of rt.rooms) {
            if (room.images && room.images.length > 0) {
              const img = room.images[0];
              slides.push({
                roomId: room.roomId,
                roomName: room.roomName,
                imageUri: img.variants?.medium || img.variants?.small || img.originalUrl,
              });
            }
          }
        }
      }
    }
    return slides;
  }, [item.images, item.propertyRooms, item.hotelRoomTypes]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    Animated.timing(animRefs.imageFadeAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION_LONG,
      useNativeDriver: true,
    }).start();
  }, [animRefs.imageFadeAnim]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Track click for analytics
    if (item.id) {
      premiumService.trackClick(item.id).catch(() => {});
    }
    navigateToInfo(item);
  }, [item, navigateToInfo]);

 
  const handleVirtualTourPress = useCallback(async () => {
    if (!item.virtualTourAvailable || !onVirtualTourPress) return;

    try {
      setLoadingTour(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Get virtual tour
      const tours = await virtualTourService.getPropertyVirtualTours(item.id);
      if (tours && tours.length > 0) {
        const fullTour = await virtualTourService.getVirtualTour(tours[0].id);
        onVirtualTourPress(fullTour);
      }
    } catch {
      // Virtual tour loading failed
    } finally {
      setLoadingTour(false);
    }
  }, [item.id, item.virtualTourAvailable, onVirtualTourPress]);

  const handleStarRatingChange = useCallback((newRating: number) => {
    if (onStarRatingChange) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onStarRatingChange(item.id, newRating);
    }
  }, [item.id, onStarRatingChange]);

  const handleShare = useCallback(async () => {
    try {
      const shareMessage = getShareMessage({
        title: item.title,
        location: item.location,
        price: item.price,
        type: item.type,
        listType: item.listType,
        generalInfo: item.generalInfo,
        description: item.description || item.review
      });

      const result = await Share.share({
        message: shareMessage,
        title: item.title || 'Propriété à découvrir',
      });

      // Share completed
    } catch {
      Alert.alert('Erreur', 'Impossible de partager cette propriété');
    }
  }, [item]);

  return (
    <ThemedView style={{ marginBottom: 8, paddingHorizontal: 0}}>
      <ThemedView
        style={{
          borderRadius: 4,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.outline,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <LinearGradient colors={theme.cardGradient} style={{ overflow: 'hidden', position: 'relative' }}>
          {/* Image Section*/}
          <ThemedView className="relative overflow-hidden">
            {allRoomImages.length > 1 ? (
              /* Scrollable images: main + room images */
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ height: IMAGE_HEIGHT }}
              >
                {allRoomImages.map((slide, idx) => {
                  const strategy = (item as any).rentalStrategy || 'global';
                  const isHotel = item.hotelRoomTypes && item.hotelRoomTypes.length > 0;
                  const roomOnly = allRoomImages.filter(s => !s.isMain);
                  const roomIndex = slide.isMain ? -1 : roomOnly.indexOf(slide);

                  // Counter logic per mode:
                  // - per_unit or hotel: main = "Aperçu", rooms count separately (1/3, 2/3...)
                  // - global / both: all slides count together (1/4, 2/4...)
                  const counterText = (strategy === 'per_unit' || isHotel)
                    ? (slide.isMain ? 'Aperçu' : `${roomIndex + 1}/${roomOnly.length}`)
                    : `${idx + 1}/${allRoomImages.length}`;

                  return (
                  <ThemedView key={slide.roomId} style={{ width, height: IMAGE_HEIGHT, position: 'relative' }}>
                    <Image
                      source={{ uri: slide.imageUri }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      transition={300}
                      cachePolicy="memory-disk"
                    />
                    {/* Slide label overlay */}
                    <ThemedView style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <MaterialCommunityIcons name={slide.isMain ? "home" : "door"} size={12} color="white" />
                      <ThemedText style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>
                        {slide.roomName}
                      </ThemedText>
                      <ThemedText style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>
                        {counterText}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  );
                })}
              </ScrollView>
            ) : (
              /* Single image (default) */
              <ThemedView className="relative">
                <AnimatedImage
                  source={imageSource}
                  style={{
                    height: IMAGE_HEIGHT,
                    opacity: animRefs.imageFadeAnim,
                    width: '100%'
                  }}
                  className="rounded-t-2xl"
                  contentFit="cover"
                  transition={300}
                  placeholder={item.thumbnail ? { uri: item.thumbnail } : undefined}
                  placeholderContentFit="cover"
                  onLoad={handleImageLoad}
                  onError={() => {
                    // Image loading failed, placeholder will be shown
                  }}
                  cachePolicy="memory-disk"
                  priority="high"
                />
              </ThemedView>
            )}

            {/* Overlay subtil */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.15)']}
              locations={[0, 0.7, 1]}
              className="absolute inset-0"
              pointerEvents="none"
            />

            {/* Rent/Sale Badge - Top Left on Image */}
            <ThemedView backgroundColor = "transparent"
              style={{
                position: 'absolute',
                top: 15,
                right: 82,
                zIndex: 8,
              }}
            >
              <LinearGradient
                colors={item.listType === 'rent'
                  ? [theme.primary, theme.primary + 'DD']
                  : [theme.star, theme.star + 'DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <ThemedText style={{
                  fontWeight: '800',
                  color: '#FFFFFF',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}>
                  {item.listType === 'rent' ? 'À Louer' : 'À Vendre'}
                </ThemedText>
              </LinearGradient>
            </ThemedView>

            {/* Crypto Payment Badge */}
            {(item as any).cryptoEnabled && (
              <ThemedView
                style={{
                  position: 'absolute',
                  bottom: 60,
                  left: 12,
                  zIndex: 9,
                }}
              >
                <LinearGradient
                  colors={['#F7931A', '#FF9F1C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    shadowColor: '#F7931A',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <MaterialIcons name="currency-bitcoin" size={12} color="white" />
                  <ThemedText style={{
                    fontSize: 9,
                    fontWeight: '700',
                    color: 'white',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase'
                  }}>
                    Crypto
                  </ThemedText>
                </LinearGradient>
              </ThemedView>
            )}

            {/* Price Tag positioned at bottom-right of image */}
            <PriceTag price={item.price} currency={item.currency ?? 'XAF'} theme={theme} />
          </ThemedView>

          {/* Badges + infos */}
          <StatusBadge availibility={item.availibility} theme={theme} unitAvailability={unitAvailability} rawStatus={(item as any).rawStatus} />

          {/* Premium badges */}
          {isPremium && hasVerifiedListings && (
            <ThemedView style={{
              position: 'absolute', top: 44, left: 12, flexDirection: 'row',
              alignItems: 'center', backgroundColor: '#00B894',
              paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 10,
            }}>
              <Ionicons name="shield-checkmark" size={10} color="white" />
              <ThemedText style={{ color: 'white', fontSize: 9, fontWeight: '600', marginLeft: 2 }}>
                {t('premium.verifiedListing')}
              </ThemedText>
            </ThemedView>
          )}
          {isPremium && hasEarlyAccess && item.createdAt && (Date.now() - new Date(item.createdAt).getTime() < 24 * 60 * 60 * 1000) && (
            <ThemedView style={{
              position: 'absolute', top: 44, right: 50, flexDirection: 'row',
              alignItems: 'center', backgroundColor: '#E17055',
              paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 10,
            }}>
              <Ionicons name="flash" size={10} color="white" />
              <ThemedText style={{ color: 'white', fontSize: 9, fontWeight: '600', marginLeft: 2 }}>
                {t('premium.newListingBadge')}
              </ThemedText>
            </ThemedView>
          )}
          {isPremium && isOwnerRole && hasBoostVisibility && (
            <ThemedView style={{
              position: 'absolute', top: 8, right: 50, flexDirection: 'row',
              alignItems: 'center', backgroundColor: '#6C5CE7',
              paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 10,
            }}>
              <Ionicons name="rocket" size={10} color="white" />
              <ThemedText style={{ color: 'white', fontSize: 9, fontWeight: '600', marginLeft: 2 }}>
                {t('premium.boostedProperty')}
              </ThemedText>
            </ThemedView>
          )}

          <FavoriteButton
            onPress={handleToggleFavorite}
            isFavorite={isFavorite}
            theme={theme}
            rotateAnim={animRefs.rotateAnim}
          />
          <FeaturesBadge
            features={item.features.map(f => f.icon)}
            energyScore={item.energyScore}
            theme={theme}
          />

          <ThemedView style={{ padding: 12, gap: 8 }}>
            {/* Header*/}
            <ThemedView
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap:8, paddingHorizontal:2 }}>
                <ThemedView style={{ flex: 1,}}>
                  <ThemedView style = {{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'  }}>
                    <ThemedView style= {{ flexDirection: 'row', alignItems: 'center', gap:8}}>
                    <ThemedText type="normaltitle" intensity ="light"
                     style={{
                    lineHeight: 18,
                    letterSpacing: -0.2,
                    fontWeight:800
                  }} numberOfLines={1}
                    > {item.type} -
                    </ThemedText>

                    <ThemedText type="normaltitle" intensity ="light" style={{
                    lineHeight: 18,
                    letterSpacing: -0.2,
                    fontWeight:800
                  }} numberOfLines={1}>
                    {item.title || 'Property'}
                  </ThemedText>

                    </ThemedView>
                   
                    <PropertyStarRating
                  rating={item.stars}
                  reviewCount={item.reviewCount || 0}
                  size="small"
                  interactive={interactiveStars}
                  onRatingChange={handleStarRatingChange}
                  showReviewCount={true}
                />

                  </ThemedView>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, justifyContent: 'space-between'  }}>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap :2 }}>
                     <MaterialIcons name="location-on" size={12} color={theme.error} />
                    <ThemedText type ="normal" style={{
                      color: theme.typography.body,
                      marginLeft: 2,
                      opacity: 0.8
                    }} numberOfLines={1}>
                      {item.location}
                    </ThemedText>
                    </ThemedView>
                   
                     <ThemedView style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft:4
                  }}>
                    <ThemedView style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 50
                    }}>
                      <PropertyFacilitiesDisplay
                        type={item.type}
                        generalInfo={item.generalInfo}
                        theme={theme}
                      />
                    </ThemedView>
                  </ThemedView>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView
            >
              {item.itemType === 'service' ? (
                <ThemedView style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 4
                }}>
                  <ThemedView style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.primary + '08',
                    paddingVertical: 6,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                  }}>
                    <MaterialCommunityIcons name="briefcase" size={14} color={theme.primary} />
                    <ThemedText style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: theme.primary,
                      marginLeft: 3
                    }}>
                      Service
                    </ThemedText>
                  </ThemedView>
                  <LinearGradient
                    colors={[theme.success + '15', theme.success + '08']}
                    style={{
                      flex: 1,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                  >
                    <ThemedText style={{
                      fontSize: 9,
                      fontWeight: '800',
                      color: theme.success,
                      textTransform: 'uppercase',
                      letterSpacing: 0.3
                    }}>
                      {item.serviceCategory || item.type}
                    </ThemedText>
                  </LinearGradient>
                </ThemedView>
              ) : (
                <ThemedView>
                 
                  {(item.description || item.review) && (
                    <ThemedText type ="normal"
                      numberOfLines={2}
                      style={{
                        color: theme.typography.caption,
                        lineHeight: 17,
                        paddingHorizontal:4
                        
                      }}
                    >
                      {item.description || item.review}
                    </ThemedText>
                  )}
                </ThemedView>
              )}
            </ThemedView>


            {/* Action Button compact */}
            <ThemedView
            >
              <TouchableOpacity
                onPress={handlePress}
                style={{ borderRadius: 10, overflow: 'hidden' }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={theme.buttonGradient}
                  style={{ 
                    paddingVertical: 10, 
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <MaterialCommunityIcons name="rocket-launch" size={16} color= "white" />
                  <ThemedText style={{
                    color: "white",
                    fontSize: 13,
                    fontWeight: '700',
                    letterSpacing: 0.5
                  }}>
                    DÉCOUVRIR
                  </ThemedText>
                  {item.virtualTourAvailable && (
                    <ThemedView style={{
                      backgroundColor: theme.error,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      marginLeft: 4
                    }} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </LinearGradient>
      </ThemedView>
    </ThemedView>
  );
};

export default React.memo(RenderItem);