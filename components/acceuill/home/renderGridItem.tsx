import React, { useCallback, memo, useState, useMemo } from "react";
import { TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ExtendedItemTypes } from "@/types/ItemType";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useToggleFavorite } from "@/hooks/useToggleFavorite";
import { useTheme } from "@/hooks/themehook";
import PropertyStarRating from "@/components/ui/PropertyStarRating";

import type { MutableRefObject } from "react";



type Props = {
  item: ExtendedItemTypes;
  index: number;
  width: number;
  lottieRef: MutableRefObject<any>;
  setAnimatingElement: (id: string | null) => void;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  onStarRatingChange?: (itemId: string, rating: number) => void;
};

const RenderGridItem: React.FC<Props> = ({
  item,
  index,
  width,
  setAnimatingElement,
  favorites,
  onStarRatingChange,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  // Compute unit availability for per_unit/both rental strategy OR hotels
  const unitAvailability = useMemo(() => {
    const strategy = (item as any).rentalStrategy;

    // Hotels always show per-unit availability
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

    if (item.propertyRooms && item.propertyRooms.length > 0) {
      if ((item as any).roomAvailability) {
        return (item as any).roomAvailability;
      }
      const total = item.propertyRooms.length;
      const available = item.propertyRooms.filter((r: any) => r.isAvailable !== false).length || total;
      return { total, available };
    }

    return null;
  }, [item.propertyRooms, item.hotelRoomTypes, (item as any).rentalStrategy]);

  const { isFavorite, handleToggleFavorite } = useToggleFavorite({
    item,
    setAnimatingElement,
  });

  const navigateToInfo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnimatingElement(item.id);

    setTimeout(() => {
      router.push({ pathname: "/info/[infoId]", params: { id: item.id } });
      setTimeout(() => setAnimatingElement(null), 500);
    }, 300);
  }, [item.id]);

  // Availability badge config
  const availBadge = useMemo(() => {
    if (unitAvailability && unitAvailability.total > 0) {
      const { total, available } = unitAvailability;
      if (available === 0) return { label: 'Complet', color: theme.error as string };
      if (available === total) return { label: `${total} dispo.`, color: theme.success as string };
      return { label: `${available}/${total} dispo.`, color: '#F59E0B' };
    }
    const rawStatus = (item as any).rawStatus;
    let label: string;
    if (item.availibility === "available") {
      label = "Disponible";
    } else if (rawStatus === 'RENTED') {
      label = "Loué";
    } else if (rawStatus === 'SOLD') {
      label = "Vendu";
    } else if (rawStatus === 'MAINTENANCE') {
      label = "Maintenance";
    } else if (rawStatus === 'ON_HOLD' || rawStatus === 'RESERVED' || rawStatus === 'RESERVER') {
      label = "Réservé";
    } else {
      label = "Indisponible";
    }
    return {
      label,
      color: item.availibility === "available" ? theme.success as string : theme.error as string,
    };
  }, [unitAvailability, item.availibility, theme]);

  // Image source
  const imageUri = useMemo(() => {
    if (item.images && item.images.length > 0) {
      const uri = typeof item.images[0] === 'string' ? item.images[0] : null;
      if (uri && !uri.includes('placeholder')) return uri;
    }
    return typeof item.avatar === 'string' ? item.avatar : 'https://via.placeholder.com/400x300';
  }, [item.images, item.avatar]);

  return (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: theme.surface as string,
        borderColor: theme.outline + '30',
      }]}
      onPress={navigateToInfo}
      activeOpacity={0.85}
    >
      {/* Image section */}
      <ThemedView style={styles.imageWrap}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.imageOverlay}
        />

        {/* Status chip - top left */}
        <ThemedView style={[styles.statusChip, { backgroundColor: availBadge.color }]}>
          <ThemedView style={styles.statusDot} />
          <ThemedText style={styles.statusText}>{availBadge.label}</ThemedText>
        </ThemedView>

        {/* Favorite - top right */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={handleToggleFavorite}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? '#EF4444' : 'rgba(255,255,255,0.9)'}
          />
        </TouchableOpacity>

        {/* Price overlay - bottom right of image */}
        <ThemedView style={styles.priceChip}>
          <ThemedText style={styles.priceText}>{item.price}</ThemedText>
          <ThemedText style={styles.currencyText}>{item.currency || 'XAF'}</ThemedText>
        </ThemedView>

        {/* Rent/Sell badge - bottom left of image */}
        <ThemedView style={[styles.listTypeBadge, {
          backgroundColor: item.listType === 'rent' ? '#3B82F6' : '#F59E0B',
        }]}>
          <ThemedText style={styles.listTypeText}>
            {item.listType === 'rent' ? 'Location' : 'Vente'}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Body */}
      <ThemedView style={styles.body}>
        {/* Title */}
        <ThemedText type="normal" intensity="strong" numberOfLines={1} style={styles.title}>
          {item.title || item.type}
        </ThemedText>

        {/* Location */}
        <ThemedView style={styles.locationRow}>
          <MaterialIcons name="location-on" size={13} color={theme.error as string} />
          <ThemedText type="caption" numberOfLines={1} style={{ flex: 1, marginLeft: 2 }}>
            {item.location}
          </ThemedText>
        </ThemedView>

        {/* Footer: type + rating */}
        <ThemedView style={styles.footer}>
          <ThemedView style={styles.typeWrap}>
            <MaterialCommunityIcons name="tag-outline" size={12} color={theme.onSurfaceVariant as string} />
            <ThemedText type="caption" style={{ color: theme.onSurfaceVariant as string }}>
              {item.type}
            </ThemedText>
          </ThemedView>
          <PropertyStarRating
            rating={item.stars}
            reviewCount={item.reviewCount || 0}
            size="small"
            interactive={true}
            onRatingChange={(newRating) => onStarRatingChange?.(item.id, newRating)}
            showReviewCount={false}
          />
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default memo(RenderGridItem);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  statusChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceChip: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  priceText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  currencyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '600',
  },
  listTypeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  listTypeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  body: {
    padding: 8,
    gap: 3,
  },
  title: {
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  typeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
