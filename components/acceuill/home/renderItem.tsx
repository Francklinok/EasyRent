// RenderItem.tsx - Ultra High Performance Version (Expo Compatible)
import React, { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { TouchableOpacity, Animated, Dimensions, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { FontAwesome5, MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView, MotiText } from "moti";
import * as Animatable from "react-native-animatable";
// import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import renderEnergyScore from "./renderEnergieScore";
import RenderNeighborhoodInfo from "./renderNeighborhoodInfo";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { MutableRefObject } from "react";
import toggleFavorite from "@/components/utils/homeUtils/toggleFavorite";
import { useTheme } from "@/components/contexts/theme/themehook";
import { ThemeColors } from "@/components/contexts/theme/themeTypes";
import { Availability } from "@/types/ItemType";
import { ExtendedItemTypes } from "@/types/ItemType";

const { width } = Dimensions.get('window');

// Performance: Pre-calculate constants
const IMAGE_HEIGHT = 240;
const ANIMATION_DURATION_SHORT = 100;
const ANIMATION_DURATION_MEDIUM = 300;
const ANIMATION_DURATION_LONG = 500;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width / 2) - (ITEM_MARGIN * 2);


type Props = {
  item: ExtendedItemTypes;
  index: number;
  lottieRef: MutableRefObject<any>;
  setAnimatingElement: (id: string | null) => void;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  animatingElement: string | null;
  navigateToInfo: (item: ExtendedItemTypes) => void;
};

interface StatusBadgeProps {
  availibility: Availability;
  theme: ThemeColors;
}

interface PriceTagProps {
  price: string | number;
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
}

//  Create animated component once using expo-image
const AnimatedImage = Animated.createAnimatedComponent(Image);

//  Memoized status badge with optimized animations
// Enhanced Status Badge with premium styling
const StatusBadge = React.memo(({ availibility, theme }: StatusBadgeProps) => {
  const isAvailable = availibility === "available";

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10, scale: 0.8 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ delay: 200, type: "spring", damping: 15 }}
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10
      }}
    >
      <LinearGradient
        colors={isAvailable ? [theme.success, theme.success + '90'] : [theme.error, theme.error + '90']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: isAvailable ? theme.success : theme.error,
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
          {isAvailable ? "DISPONIBLE" : "RÉSERVÉ"}
        </ThemedText>
      </LinearGradient>
    </MotiView>
  );
});

// Enhanced Price Tag positioned at bottom-right corner of image
const PriceTag = React.memo(({ price, theme }: PriceTagProps) => (
  <MotiView
    from={{ opacity: 0, translateY: 20, scale: 0.8 }}
    animate={{ opacity: 1, translateY: 0, scale: 1 }}
    transition={{ delay: 400, type: "spring", damping: 15 }}
    style={{
      position: 'absolute',
      bottom: 12,
      right: 12,
      zIndex: 15
    }}
  >
    <LinearGradient
      colors={[theme.primary, theme.secondary || theme.primary + '80']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <ThemedText
        style={{
          color: 'white',
          fontWeight: '900',
          fontSize: 15,
          letterSpacing: -0.3,
        }}
      >
        {price}
      </ThemedText>
    </LinearGradient>
  </MotiView>
));

// Performance: Optimized favorite button positioned in top-right corner
const FavoriteButton = React.memo(({ 
  onPress, 
  isFavorite, 
  theme, 
  rotateAnim 
}: FavoriteButtonProps) => {
  const buttonStyle: ViewStyle = useMemo(() => ({
    backgroundColor: isFavorite ? theme.error : theme.surface,
    shadowColor: theme.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  }), [isFavorite, theme]);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 500, type: "spring" }}
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          ...buttonStyle
        }}
        accessibilityLabel="Toggle favorite"
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [{
              scale: rotateAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.2, 1],
              })
            }]
          }}
        >
          {isFavorite ? (
            <Ionicons name="heart" size={24} color={theme.surface} />
          ) : (
            <Ionicons name="heart-outline" size={24} color={theme.typography.caption} />
          )}
        </Animated.View>
      </TouchableOpacity>
    </MotiView>
  );
});

// Enhanced Features Badge with multiple features display
const FeaturesBadge = React.memo(({ features, energyScore, theme }: FeaturesBadgeProps) => {
  if (!features || features.length === 0) return null;
  
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: 300, type: "spring" }}
      style={{
        position: 'absolute',
        top: 70,
        left: 12,
        flexDirection: 'row',
        gap: 6
      }}
    >
      {/* Energy Score Badge */}
      <BlurView intensity={80} tint="light" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <ThemedView
          style={{
            backgroundColor: theme.surfaceVariant + '90',
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
          }}
        >
          <MaterialCommunityIcons name="leaf" size={12} color={theme.success} />
          <ThemedText
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: theme.typography.body,
            }}
          >
            {energyScore}/10
          </ThemedText>
        </ThemedView>
      </BlurView>
      
      {/* Features Count Badge */}
      <BlurView intensity={80} tint="light" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <ThemedView
          style={{
            backgroundColor: theme.primary + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
          }}
        >
          <MaterialCommunityIcons name="star-outline" size={12} color={theme.primary} />
          <ThemedText
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: theme.primary,
            }}
          >
            {features.length}+
          </ThemedText>
        </ThemedView>
      </BlurView>
    </MotiView>
  );
});

// Compact action buttons with professional styling
const ActionButtons = React.memo(({
  onPress,
  scaleAnim,
  shimmerAnim,
  virtualTourAvailable,
  breatheAnim,
  theme
}: ActionButtonsProps) => {
  const gradientStyle = useMemo(() => ({
    start: { x: 0, y: 1 },
    end: { x: 1, y: 1 }
  }), []);

  return (
    <ThemedView style={{ flexDirection: 'row', gap: 8, paddingTop: 4 }}>
      <TouchableOpacity
        onPress={onPress}
        style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}
        accessibilityLabel="Explorer la propriété"
        accessibilityRole="button"
        activeOpacity={0.9}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={theme.buttonGradient}
            start={gradientStyle.start}
            end={gradientStyle.end}
            style={{ paddingVertical: 10, alignItems: 'center', position: 'relative' }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.surface,
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.1, 0],
                }),
                transform: [{
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-width, width],
                  }),
                }],
              }}
            />
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
              <MaterialCommunityIcons name="rocket-launch" size={16} color={theme.surface} />
              <ThemedText
                style={{
                  color: theme.surface,
                  fontWeight: '800',
                  fontSize: 12,
                  letterSpacing: 0.5
                }}
              >
                DÉCOUVRIR
              </ThemedText>
            </ThemedView>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
      
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 400, type: "spring" }}
      >
        <TouchableOpacity
          style={{
            borderRadius: 16,
            padding: 10,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}
          accessibilityLabel="Partager"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <MaterialIcons name="share" size={18} color={theme.onSurface} />
        </TouchableOpacity>
      </MotiView>
      
      {virtualTourAvailable && (
        <MotiView
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 500, type: "spring" }}
        >
          <TouchableOpacity
            style={{
              borderRadius: 16,
              padding: 10,
              backgroundColor: theme.primary + '10',
              borderWidth: 1,
              borderColor: theme.primary + '30',
              position: 'relative'
            }}
            accessibilityLabel="Visite virtuelle VR"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
              <MaterialCommunityIcons name="virtual-reality" size={18} color={theme.primary} />
            </Animated.View>
            <ThemedView
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.error
              }}
            />
          </TouchableOpacity>
        </MotiView>
      )}
    </ThemedView>
  );
});

const RenderItem: React.FC<Props> = ({
  item,
  index,
  lottieRef,
  favorites,
  setFavorites,
  animatingElement,
  setAnimatingElement,
  navigateToInfo
}) => {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Performance: Memoize expensive computations
  const isFavorite = useMemo(() => favorites.includes(item.id), [favorites, item.id]);
  
  const truncatedReview = useMemo(() => 
    item.review?.length > 120 ? `${item.review.substring(0, 120)}...` : item.review,
    [item.review]
  );

  // Performance: Create stable animation refs with cleanup
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

  // Performance: Optimized image source configuration for expo-image
  const imageSource = useMemo(() => {
    const primarySource = item.imageAvif || item.imageWebP || item.avatar;
    return {
      uri: primarySource,
      blurhash: item.blurhash, // If you have blurhash data
    };
  }, [item.imageAvif, item.imageWebP, item.avatar, item.blurhash]);

  // Performance: Stable callbacks
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    Animated.timing(animRefs.imageFadeAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION_LONG,
      useNativeDriver: true,
    }).start();
  }, [animRefs.imageFadeAnim]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPressed(true);

    Animated.sequence([
      Animated.timing(animRefs.scaleAnim, {
        toValue: 0.95,
        duration: ANIMATION_DURATION_SHORT,
        useNativeDriver: true,
      }),
      Animated.timing(animRefs.scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPressed(false);
      navigateToInfo(item);
    });
  }, [item, navigateToInfo, animRefs.scaleAnim]);

  const handleToggleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(animRefs.rotateAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION_MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(animRefs.rotateAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION_MEDIUM,
        useNativeDriver: true,
      }),
    ]).start();

    toggleFavorite({
      id: item.id,
      lottieRef,
      favorites,
      setFavorites,
    });

    setAnimatingElement(item.id);
  }, [item.id, setAnimatingElement, animRefs.rotateAnim, lottieRef, favorites, setFavorites]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50, scale: 0.9 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ delay: index * 100, type: 'spring', damping: 15 }}
      style={{ marginBottom: 16, paddingHorizontal: 2 }}
    >
      <ThemedView
        style={{
          borderRadius: 3,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.outline + '50',
          shadowColor: theme.shadowColor || '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <LinearGradient colors={theme.cardGradient} style={{ overflow: 'hidden', position: 'relative' }}>
          {/* Image Section - Performance Optimized with expo-image */}
          <ThemedView className="relative overflow-hidden">
            <MotiView
              from={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 800, type: 'timing' }}
              className="relative"
            >
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
                cachePolicy="memory-disk"
                priority="high"
              />
            </MotiView>

            {/* Overlay subtil pour contraste */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.15)']}
              locations={[0, 0.7, 1]}
              className="absolute inset-0"
            />
            
            {/* Price Tag positioned at bottom-right of image */}
            <PriceTag price={item.price} theme={theme} />
          </ThemedView>

          {/* Badges et infos */}
          <StatusBadge availibility={item.availibility} theme={theme} />
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

          {/* Compact Content Section */}
          <ThemedView style={{ padding: 12, gap: 8 }}>
            {/* Compact Header: Type, Location & Rating in one row */}

            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 500, type: 'spring' }}
            >
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedView style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <ThemedView style={{
                    backgroundColor: theme.primary + '20',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginRight: 6
                  }}>
                    <ThemedText style={{
                      fontSize: 9,
                      fontWeight: '700',
                      color: theme.primary,
                      textTransform: 'uppercase'
                    }}>
                      {item.type}
                    </ThemedText>

                  </ThemedView>
                  <MaterialIcons name="location-on" size={14} color={theme.error} />
                  <ThemedText style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: theme.typography.body,
                    marginLeft: 2,
                    flex: 1
                  }} numberOfLines={1}>
                    {item.location}
                  </ThemedText>

                </ThemedView>

                <LinearGradient
                  colors={[theme.star + '20', theme.star + '10']}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                    gap: 3
                  }}
                >
                  <FontAwesome5 name="star" size={12} color={theme.star} />
                  <ThemedText style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: theme.star
                  }}>
                    {item.stars}
                  </ThemedText>
                </LinearGradient>
                
              </ThemedView>
            </MotiView>
            
            {/* Compact Property Stats */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 600, type: 'spring' }}
            >
              
              <ThemedView style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: theme.surfaceVariant + '25',
                borderRadius: 10,
                paddingVertical: 2,
                paddingHorizontal: 12
              }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <MaterialCommunityIcons name="bed" size={14} color={theme.primary} />
                  <ThemedText style={{ fontSize: 11, fontWeight: '600', color: theme.typography.body }}>
                    {item.generalInfo?.bedrooms || 'N/A'}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <MaterialCommunityIcons name="shower" size={14} color={theme.primary} />
                  <ThemedText style={{ fontSize: 11, fontWeight: '600', color: theme.typography.body }}>
                    {item.generalInfo?.bathrooms || 'N/A'}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <MaterialCommunityIcons name="ruler-square" size={14} color={theme.primary} />
                  <ThemedText style={{ fontSize: 11, fontWeight: '600', color: theme.typography.body }}>
                    {item.generalInfo?.surface}m²
                  </ThemedText>
                </ThemedView>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <MaterialCommunityIcons name="home-group" size={14} color={theme.primary} />
                  <ThemedText style={{ fontSize: 11, fontWeight: '600', color: theme.typography.body }}>
                    {item.generalInfo?.rooms}P
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </MotiView>

            {/* Compact Review Section */}
            {truncatedReview && (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 700, type: 'spring' }}
              >
                <ThemedView style={{
                  backgroundColor: theme.surface + '60',
                  borderRadius: 6,
                  padding: 8,
                  borderLeftWidth: 2,
                  borderLeftColor: theme.primary
                }}>
                  <ThemedText style={{
                    fontSize: 12,
                    lineHeight: 16,
                    color: theme.typography.body,
                    fontStyle: 'italic'
                  }} numberOfLines={2}>
                    {truncatedReview}
                  </ThemedText>
                </ThemedView>
              </MotiView>
            )}

            {/* Compact Action Buttons */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 800, type: 'spring' }}
            >
              <ActionButtons
                onPress={handlePress}
                scaleAnim={animRefs.scaleAnim}
                shimmerAnim={animRefs.shimmerAnim}
                virtualTourAvailable={item.virtualTourAvailable}
                breatheAnim={animRefs.breatheAnim}
                theme={theme}
              />
            </MotiView>
          </ThemedView>
        </LinearGradient>
      </ThemedView>
    </MotiView>
  );
};

export default React.memo(RenderItem);