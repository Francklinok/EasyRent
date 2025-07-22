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
const IMAGE_HEIGHT = 220;
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
const StatusBadge = React.memo(({ availibility, theme }: StatusBadgeProps) => {
  // Use single animation instance
  const pulseAnim = useMemo(() => {
    const anim = new Animated.Value(1);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    
    return { anim, animation };
  }, []);

  useEffect(() => {
    return () => {
      pulseAnim.animation.stop();
    };
  }, [pulseAnim.animation]);

  const isAvailable = availibility === "available";

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 300, type: "spring" }}
      className="absolute top-3 left-3"
    >
      <BlurView intensity={80} tint="light" className="rounded-full overflow-hidden">
        <ThemedView
          className="px-3 py-1.5 flex-row items-center gap-1.5"
          style={{
            backgroundColor: isAvailable ? theme.success : theme.elevation.large,
          }}
        >
          <ThemedView
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: theme.surface }}
          />
          <ThemedText
            style={{
              color: theme.surface,
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            {isAvailable ? "Active" : "Sold"}
          </ThemedText>
        </ThemedView>
      </BlurView>
    </MotiView>
  );
});

// Performance: Memoized price tag
const PriceTag = React.memo(({ price, theme }: PriceTagProps) => (
  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ delay: 600, type: "spring" }}
    className="absolute bottom-4 right-4"
  >
    <BlurView intensity={95} tint="light" className="rounded-2xl overflow-hidden">
      <ThemedView
        className="px-4 py-2"
        style={{
          backgroundColor: theme.surface,
          shadowColor: theme.elevation.large,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <ThemedText
          style={{
            color: theme.onSurface,
            fontWeight: '800',
            fontSize: 18,
            letterSpacing: -0.5,
          }}
        >
          {price}
        </ThemedText>
      </ThemedView>
    </BlurView>
  </MotiView>
));

// Performance: Optimized favorite button with single animation
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
      className="absolute top-3 right-3"
    >
      <TouchableOpacity
        onPress={onPress}
        className="w-12 h-12 rounded-full items-center justify-center"
        accessibilityLabel="Toggle favorite"
        accessibilityRole="button"
        style={buttonStyle}
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

const FeaturesBadge = React.memo(({ features, energyScore, theme }: FeaturesBadgeProps) => {
  if (!features || features.length === 0) return null;
  
  return (
    <ThemedView className="absolute top-16 left-3 rounded-2xl">
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: 700, type: "spring" }}
      >
        <BlurView intensity={60} tint="light" className="rounded-xl overflow-hidden">
          <ThemedView
            backgroundColor="elevation"
            className="px-2 py-1.5 flex-row items-center gap-1"
          >
            <FontAwesome5 
              name={features[0] || "home"} 
              size={12} 
              color={theme.typography.caption}
            />
            <ThemedText
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: theme.typography.caption,
                letterSpacing: 0.3,
              }}
            >
              {energyScore}/10
            </ThemedText>
          </ThemedView>
        </BlurView>
      </MotiView>
    </ThemedView>
  );
});

// Performance: Optimized action buttons with single shimmer animation
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
    <ThemedView className="flex-row gap-3 pb-2 px-1">
      <TouchableOpacity
        onPress={onPress}
        className="flex-1 rounded-2xl overflow-hidden"
        accessibilityLabel="Explorer la propriété"
        accessibilityRole="button"
        activeOpacity={0.9}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <BlurView intensity={20} tint="light" className="overflow-hidden">
            <LinearGradient
              colors={theme.buttonGradient}
              start={gradientStyle.start}
              end={gradientStyle.end}
              className="py-2.5 items-center relative"
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
              <ThemedView className="flex-row items-center gap-2" style={{ backgroundColor: "transparent" }}>
                <MaterialCommunityIcons name="rocket-launch" size={20} color={theme.surface} />
                <ThemedText
                  style={{
                    color: theme.surface,
                    fontWeight: '900',
                    fontSize: 14,
                    textShadowColor: theme.elevation.large,
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 4,
                  }}
                >
                  DÉCOUVRIR
                </ThemedText>
                <Entypo name="chevron-right" size={20} color={theme.surface} />
              </ThemedView>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
      
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 400, type: "spring" }}
      >
        <TouchableOpacity
          className="rounded-2xl overflow-hidden p-1"
          accessibilityLabel="Partager"
          accessibilityRole="button"
          activeOpacity={0.8}
          style={{
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.surface,
            shadowRadius: 8,
          }}
        >
          <MaterialIcons name="share" size={24} color={theme.onSurface} />
        </TouchableOpacity>
      </MotiView>
      
      {virtualTourAvailable && (
        <MotiView
          from={{ opacity: 0, scale: 0, rotateY: "90deg" }}
          animate={{ opacity: 1, scale: 1, rotateY: "0deg" }}
          transition={{ delay: 500, type: "spring" }}
        >
          <TouchableOpacity
            className="rounded-full overflow-hidden p-1.5 relative"
            accessibilityLabel="Visite virtuelle VR"
            accessibilityRole="button"
            activeOpacity={0.8}
            style={{
              borderWidth: 1,
              borderColor: theme.outline,
            }}
          >
            <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
              <MaterialCommunityIcons name="virtual-reality" size={24} color={theme.primary} />
            </Animated.View>
            <ThemedView
              className="absolute -top-2 -right-1 w-3 h-3 rounded-full"
              style={{
                backgroundColor: theme.error,
                shadowColor: theme.error,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 4,
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
    <ThemedView className="mb-6 px-2 ">
      <ThemedView
        className="rounded-3xl overflow-hidden"
        style={{
          borderWidth: 1,
          borderColor: theme.outline,
        }}
      >
        <LinearGradient colors={theme.cardGradient} className="overflow-hidden relative">
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
          </ThemedView>

          {/* Badges et infos */}
          <StatusBadge availibility={item.availibility} theme={theme} />
          <PriceTag price={item.price} theme={theme} />
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

          {/* Section contenu */}
          <ThemedView className="px-3 py-2 gap-1">
            {/* En-tête localisation */}
            <ThemedView className="flex-row items-center justify-between">
              <ThemedView className="flex-row items-center gap-3 flex-1">
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={theme.error}
                  style={{
                    textShadowColor: theme.error,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 8,
                  }}
                />
                <ThemedText type="caption" className="text-base font-bold flex-1">
                  {item.location}
                </ThemedText>
              </ThemedView>

              <ThemedView className="flex-row items-center gap-2">
                <RenderNeighborhoodInfo item={item} />
                
                <MotiView
                  from={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 400, type: 'spring' }}
                >
                  <BlurView intensity={30} tint="light" className="rounded-xl overflow-hidden">
                    <ThemedView className="flex-row items-center gap-2 px-3 py-1 border border-yellow-400/30">
                      <FontAwesome5 name="star" size={16} color={theme.star} />
                      <ThemedText className="text-lg font-bold" style={{ color: theme.star }}>
                        {item.stars}
                      </ThemedText>
                    </ThemedView>
                  </BlurView>
                </MotiView>
              </ThemedView>
            </ThemedView>

            {/* Avis */}
            {truncatedReview && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 600, type: 'spring' }}
              >
                <BlurView intensity={20} tint="light" className="rounded-2xl overflow-hidden">
                  <ThemedView className="p-2">
                    <ThemedText
                      type="caption"
                      className="text-base leading-6"
                      style={{ color: theme.text }}
                    >
                      {truncatedReview}
                    </ThemedText>
                  </ThemedView>
                </BlurView>
              </MotiView>
            )}

            {/* Boutons d'action */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 700, type: 'spring' }}
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
    </ThemedView>
  );
};

export default React.memo(RenderItem);