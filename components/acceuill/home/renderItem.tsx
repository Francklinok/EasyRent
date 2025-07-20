import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
  MutableRefObject,
} from "react";
import {
  TouchableOpacity,
  Animated,
  Dimensions,
  View,
  InteractionManager,
} from "react-native";
import FastImage, { Source } from "react-native-fast-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import RenderNeighborhoodInfo from "./renderNeighborhoodInfo";
import toggleFavorite from "@/components/utils/homeUtils/toggleFavorite";
import { useTheme } from "@/components/contexts/theme/themehook";
import { ItemType } from "@/types/ItemType";

const { width } = Dimensions.get("window");

// ---- Types ----
interface RenderItemProps {
  item: ItemType;
  index: number;
  lottieRef: MutableRefObject<LottieView | null>;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  animatingElement: string | null;
  setAnimatingElement: (id: string | null) => void;
  navigateToInfo: (item: ItemType) => void;
}

interface FavoriteButtonProps {
  onPress: () => void;
  isFavorite: boolean;
  theme: any;
  scaleAnim: Animated.Value;
}

interface PriceTagProps {
  price: string | number;
  theme: any;
}

interface LocationHeaderProps {
  location: string;
  item: ItemType;
  theme: any;
}

interface ReviewTextProps {
  review?: string;
  theme: any;
}

// ---- Caches d'image ----
const imageCache = {
  priority: FastImage.priority.high,
  cache: FastImage.cacheControl.immutable,
};

// ---- Styles pré-calculés ----
const styles = {
  imageContainer: { width: "100%", height: 220 },
  cardContainer: { marginBottom: 10, paddingHorizontal: 8 },
  favoriteButton: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  priceTag: {
    position: "absolute" as const,
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discoverButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center" as const,
    marginTop: 8,
  },
  locationRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold" as const,
  },
};

// ---- FavoriteButton ----
const FavoriteButton = memo<FavoriteButtonProps>(
  ({ onPress, isFavorite, theme, scaleAnim }) => {
    const buttonStyle = useMemo(
      () => ({
        ...styles.favoriteButton,
        backgroundColor: isFavorite ? theme.error : theme.surface,
        transform: [{ scale: scaleAnim }],
      }),
      [isFavorite, theme.error, theme.surface, scaleAnim]
    );

    return (
      <Animated.View style={buttonStyle}>
        <TouchableOpacity
          onPress={onPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? theme.surface : theme.onSurface}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// ---- PriceTag ----
const PriceTag = memo<PriceTagProps>(({ price, theme }) => {
  const tagStyle = useMemo(
    () => ({
      ...styles.priceTag,
      backgroundColor: theme.surface,
    }),
    [theme.surface]
  );

  return (
    <ThemedView style={tagStyle}>
      <ThemedText
        style={{ color: theme.onSurface, fontSize: 16, fontWeight: "bold" }}
      >
        {price}
      </ThemedText>
    </ThemedView>
  );
});

// ---- LoadingPlaceholder ----
const LoadingPlaceholder = memo(() => (
  <BlurView
    intensity={20}
    tint="light"
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      
    }}
  >
    <LottieView
      source={require("@/assets/lottie/loading.json")}
      autoPlay
      loop
      style={{ width: 50, height: 50 }}
    />
  </BlurView>
));

// ---- LocationHeader ----
const LocationHeader = memo<LocationHeaderProps>(({ location, item, theme }) => (
  <ThemedView style={styles.locationRow}>
    <ThemedView style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
      <MaterialIcons name="location-on" size={20} color={theme.error} />
      <ThemedText
        style={[styles.locationText, { color: theme.onSurface }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {location}
      </ThemedText>
    </ThemedView>
    <RenderNeighborhoodInfo item={item} />
  </ThemedView>
));

// ---- ReviewText ----
const ReviewText = memo<ReviewTextProps>(({ review, theme }) => {
  const truncatedReview = useMemo(() => {
    if (!review) return "";
    return review.length > 100 ? `${review.substring(0, 100)}...` : review;
  }, [review]);

  if (!review) return null;

  return (
    <ThemedText
      style={{
        fontSize: 14,
        color: theme.onSurface,
        opacity: 0.8,
        marginBottom: 8,
        lineHeight: 20,
      }}
      numberOfLines={3}
      ellipsizeMode="tail"
    >
      {truncatedReview}
    </ThemedText>
  );
});

// ---- Hook animations ----
const useOptimizedAnimations = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateFavorite = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  return { scaleAnim, animateFavorite };
};

// ---- RenderItem ----
const RenderItem: React.FC<RenderItemProps> = memo(
  ({
    item,
    index,
    lottieRef,
    favorites,
    setFavorites,
    animatingElement,
    setAnimatingElement,
    navigateToInfo,
  }) => {
    const { theme } = useTheme();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { scaleAnim, animateFavorite } = useOptimizedAnimations();

    const isFavorite = useMemo(
      () => favorites.includes(item.id),
      [favorites, item.id]
    );

    const cardStyle = useMemo(
      () => ({
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.outline,
      }),
      [theme.outline]
    );

    const handleToggleFavorite = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateFavorite();
      InteractionManager.runAfterInteractions(() => {
        toggleFavorite({ id: item.id, lottieRef, favorites, setFavorites });
        setAnimatingElement(item.id);
      });
    }, [
      item.id,
      lottieRef,
      favorites,
      setFavorites,
      setAnimatingElement,
      animateFavorite,
    ]);

    const handleNavigateToInfo = useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        navigateToInfo(item);
      });
    }, [item, navigateToInfo]);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(true);
    }, []);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const imageSource: Source = useMemo(
      () => ({
        uri: imageError ?  item.avatar : item.avatar,
        ...imageCache,
      }),
      [item.avatar,  imageError]
    );

    return (
      <ThemedView style={styles.cardContainer}>
        <ThemedView style={cardStyle}>
          <LinearGradient colors={theme.cardGradient} style={{ position: "relative" }}>
            <ThemedView style={{ position: "relative" }}>
              <FastImage
                style={styles.imageContainer}
                source={imageSource}
                resizeMode={FastImage.resizeMode.cover}
                onLoadEnd={handleImageLoad}
                onError={handleImageError}
                fallback={true}
              />
              {!imageLoaded && <LoadingPlaceholder />}
              <FavoriteButton
                onPress={handleToggleFavorite}
                isFavorite={isFavorite}
                theme={theme}
                scaleAnim={scaleAnim}
              />
              <PriceTag price={item.price} theme={theme} />
            </ThemedView>
            <ThemedView style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <LocationHeader location={item.location} item={item} theme={theme} />
              <ReviewText review={item.review} theme={theme} />
              <TouchableOpacity
                onPress={handleNavigateToInfo}
                style={styles.discoverButton}
                activeOpacity={0.8}
              >
                <ThemedText style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 16 }}>
                  Découvrir
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </LinearGradient>
        </ThemedView>
      </ThemedView>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.favorites === nextProps.favorites &&
    prevProps.animatingElement === nextProps.animatingElement &&
    prevProps.item.avatar === nextProps.item.avatar &&
    prevProps.item.price === nextProps.item.price
);

RenderItem.displayName = "RenderItem";

export default RenderItem;

