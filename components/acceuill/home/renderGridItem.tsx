import React, { useCallback, memo } from "react";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ExtendedItemTypes } from "@/types/ItemType";
import renderEnergyScore from "./renderEnergieScore";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import toggleFavorite from "@/components/utils/homeUtils/toggleFavorite";
import { useTheme } from "@/components/contexts/theme/themehook";

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

const RenderGridItem: React.FC<Props> = ({
  item,
  index,
  width,
  setAnimatingElement,
  favorites,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const navigateToInfo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnimatingElement(item.id);

    setTimeout(() => {
      router.push({ pathname: "/info/[infoId]", params: { id: item.id } });
      setTimeout(() => setAnimatingElement(null), 500);
    }, 300);
  }, [item.id]);

  const isFavorite = favorites.includes(item.id);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 60, type: "timing" }}
      style={[
        styles.cardContainer,
        {
          width: width / 2 - 24,
          marginLeft: index % 2 === 0 ? 16 : 8,
          marginRight: index % 2 === 0 ? 8 : 16,
        },
      ]}
    >
      <TouchableOpacity onPress={navigateToInfo} activeOpacity={0.9}>
        <ThemedView elevated="medium"  style={styles.card}>
          <BlurView intensity={70} tint="dark" style={styles.blurContainer}>
            {/* Image */}
            <ThemedView style={styles.imageContainer}>
              <Image source={
                  typeof item.avatar === "string"
                    ? { uri: item.avatar }
                    : item.avatar
                } style={styles.image} resizeMode="cover" />

              {/* Favorite */}
              <TouchableOpacity
                style={styles.favoriteBtn}
                onPress={() => toggleFavorite(item.id)}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={16}
                  color={isFavorite ? theme.error : theme.surface}
                />
              </TouchableOpacity>

              {/* Price */}
              <ThemedView style={styles.priceContainer}>
                <ThemedView style={styles.priceBox}>
                  <ThemedText style={styles.priceText}>{item.price}</ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Energy Score */}
              <ThemedView style={styles.energyScore}>
                {renderEnergyScore(item.energyScore)}
              </ThemedView>
            </ThemedView>

            {/* Content */}
            <ThemedView style={styles.content}>
              {/* Location */}
              <ThemedView style={styles.row}>
                <MaterialIcons name="location-on" size={12} color={theme.subtext} />
                <ThemedText numberOfLines={1} style={styles.location}>
                  {item.location}
                </ThemedText>
              </ThemedView>

              {/* Rating */}
              <ThemedView style={styles.row}>
                <FontAwesome5 name="star" size={10} color={theme.star} />
                <ThemedText style={styles.rating}>{item.stars}</ThemedText>
              </ThemedView>

              {/* Features */}
              <ThemedView style={styles.featuresRow}>
                {item.features.slice(0, 3).map((feature, idx) => (
                  <ThemedView key={idx} style={styles.featureBox}>
                    <FontAwesome5 name={feature.icon} size={8} color={theme.subtext} />
                  </ThemedView>
                ))}
              </ThemedView>

              {/* Availability */}
              <ThemedView style={styles.availabilityRow}>
                <ThemedView style={styles.availability}>
                  <ThemedView
                    style={[
                      styles.dot,
                      { backgroundColor: item.availibility === "available" ? theme.success : theme.error },
                    ]}
                  />
                  <ThemedText
                    style={{
                      color: item.availibility === "available" ? theme.success : theme.error,
                      fontSize: 10,
                      fontWeight: "500",
                    }}
                  >
                    {item.availibility === "available" ? "Disponible" : "Indisponible"}
                  </ThemedText>
                </ThemedView>

                {/* Virtual tour badge */}
                {item.virtualTourAvailable && (
                  <ThemedView style={styles.virtualTourBadge}>
                    <MaterialCommunityIcons name="rotate-3d-variant" size={10} color={theme.blue200} />
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
          </BlurView>
        </ThemedView>
      </TouchableOpacity>
    </MotiView>
  );
};

export default memo(RenderGridItem);

const styles = StyleSheet.create({
  cardContainer: { marginBottom: 16 },
  card: { borderRadius: 16, overflow: "hidden" },
  blurContainer: { borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 100 },
  favoriteBtn: { position: "absolute", top: 2, right: 2, padding: 2, borderRadius: 50, backgroundColor: "rgba(0,0,0,0.3)" },
  priceContainer: { position: "absolute", bottom: 2, right: 2 },
  priceBox: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.6)" },
  priceText: { color: "white", fontSize: 10, fontWeight: "bold" },
  energyScore: { position: "absolute", bottom: 2, left: 2 },
  content: { padding: 6 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  location: { fontSize: 10, marginLeft: 3, fontWeight: "500" },
  rating: { fontSize: 10, marginLeft: 3, fontWeight: "bold" },
  featuresRow: { flexDirection: "row", marginTop: 4, gap: 4 },
  featureBox: { padding: 2, borderRadius: 4, backgroundColor: "rgba(55,65,81,0.3)" },
  availabilityRow: { marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  availability: { flexDirection: "row", alignItems: "center" },
  dot: { width: 5, height: 5, borderRadius: 50, marginRight: 3 },
  virtualTourBadge: { padding: 2, borderRadius: 4, backgroundColor: "rgba(59,130,246,0.2)" },
});
