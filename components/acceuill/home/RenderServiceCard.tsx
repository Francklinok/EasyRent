import React, { useCallback, memo, useMemo } from "react";
import { TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ExtendedItemTypes } from "@/types/ItemType";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/themehook";
import type { MutableRefObject } from "react";

type Props = {
  item: ExtendedItemTypes;
  index: number;
  width: number;
  lottieRef: MutableRefObject<any>;
  setAnimatingElement: (id: string | null) => void;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
};

const CARD_HEIGHT = 90;
const IMAGE_SIZE = 65;

const RenderServiceCard: React.FC<Props> = ({
  item,
  index,
  width,
  setAnimatingElement,
  favorites,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const navigateToService = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnimatingElement(item.id);

    setTimeout(() => {
      const serviceId = item.id;
      if (!serviceId || serviceId === '[serviceId]') return;
      router.push(`/service/${serviceId}`);
      setTimeout(() => setAnimatingElement(null), 500);
    }, 300);
  }, [item.id, router, setAnimatingElement]);

  const isFavorite = favorites.includes(item.id);

  // Pick best available image
  const imageUri = useMemo(() => {
    if (item.images && item.images.length > 0) {
      const uri = typeof item.images[0] === 'string' ? item.images[0] : null;
      if (uri && !uri.includes('placeholder')) return uri;
    }
    return typeof item.avatar === 'string' ? item.avatar : 'https://via.placeholder.com/400x300';
  }, [item.images, item.avatar]);

  return (
    <TouchableOpacity
      style={{...styles.card, backgroundColor: theme.surface as string,
        borderColor: (theme.outline as string) + '65',
      }}
      onPress={navigateToService}
      activeOpacity={0.85}
    >
      {/* Image left */}
      <ThemedView style={styles.imageWrap}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {/* Service badge */}
        <ThemedView style={styles.serviceBadge}>
          <MaterialCommunityIcons name="wrench" size={8} color="white" />
        </ThemedView>
      </ThemedView>

      {/* Info right */}
      <ThemedView style={styles.body}>
        {/* Title + status */}
        <ThemedView style={styles.titleRow}>
          <ThemedText type="caption" intensity="strong" numberOfLines={1} style={styles.title}>
            {item.title}
          </ThemedText>
          <ThemedView style={[styles.statusDot, {
            backgroundColor: item.availibility === "available" ? (theme.success as string) : (theme.error as string),
          }]} />
        </ThemedView>

        {/* Category */}
        <ThemedView style={styles.row}>
          <MaterialCommunityIcons name="shape" size={10} color={theme.subtext as string} />
          <ThemedText type="caption" numberOfLines={1} style={styles.category}>
            {item.type}
          </ThemedText>
        </ThemedView>

        {/* Location */}
        <ThemedView style={styles.row}>
          <MaterialIcons name="location-on" size={10} color={theme.subtext as string} />
          <ThemedText type="caption" numberOfLines={1} style={styles.location}>
            {item.location}
          </ThemedText>
        </ThemedView>

        {/* Price + Rating */}
        <ThemedView style={styles.footer}>
          <ThemedView style={styles.priceChip}>
            <ThemedText style={styles.priceText}>{item.price} FCFA</ThemedText>
          </ThemedView>
          <ThemedView style={styles.ratingWrap}>
            <FontAwesome5 name="star" size={9} color={theme.star as string} />
            <ThemedText style={styles.rating}>{item.stars || 4.0}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Favorite button */}
      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={() => {}}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons
          name={isFavorite ? "favorite" : "favorite-border"}
          size={16}
          color={isFavorite ? (theme.error as string) : (theme.outline as string)}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default memo(RenderServiceCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    gap: 10,
  },
  imageWrap: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  serviceBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(99,102,241,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  category: {
    opacity: 0.7,
    fontSize: 10,
  },
  location: {
    opacity: 0.7,
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceChip: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '700',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 10,
    fontWeight: '700',
  },
  favoriteBtn: {
    padding: 4,
    alignSelf: 'flex-start',
  },
});
