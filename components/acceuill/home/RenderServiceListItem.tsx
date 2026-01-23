// RenderServiceListItem.tsx - Affichage liste des services
import React, { useCallback, memo } from "react";
import { TouchableOpacity, Dimensions, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ExtendedItemTypes } from "@/types/ItemType";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/contexts/theme/themehook";

const { width } = Dimensions.get("window");

type Props = {
  item: ExtendedItemTypes;
  index: number;
  setAnimatingElement: (id: string | null) => void;
  navigateToInfo: (item: ExtendedItemTypes) => void;
  favorites: string[];
};

const RenderServiceListItem: React.FC<Props> = ({
  item,
  index,
  setAnimatingElement,
  navigateToInfo,
  favorites,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const handlePress = useCallback(() => {
    console.log('🔗 [RenderServiceListItem] Navigating to service:', item.id, 'Full item:', item);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnimatingElement(item.id);

    setTimeout(() => {
      const serviceId = item.id;
      if (!serviceId || serviceId === '[serviceId]') {
        console.error('❌ Invalid service ID:', serviceId);
        return;
      }
      console.log('✅ Pushing to /service/' + serviceId);
      router.push(`/service/${serviceId}`);
      setTimeout(() => setAnimatingElement(null), 500);
    }, 200);
  }, [item.id, router, setAnimatingElement]);

  const isFavorite = favorites.includes(item.id);

  return (
    <ThemedView
      style={styles.container}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.5}>
          <ThemedView
            style={{...styles.gradient, borderColor: theme.outline}}
          >
            {/* Image section */}
            <ThemedView style={styles.imageSection}>
              <Image
                source={
                  typeof item.avatar === "string"
                    ? { uri: item.avatar }
                    : item.avatar
                }
                style={styles.image}
                contentFit="cover"
                transition={200}
                onError={(error) => {
                  console.warn(`⚠️ [RenderServiceListItem] Image failed to load for ${item.title}, using placeholder`);
                }}
              />

              {/* Service Badge */}
              <ThemedView style={styles.serviceBadge}>
                <MaterialCommunityIcons name="wrench" size={12} color="white" />
                <ThemedText type ="caption" intensity ="strong" style={styles.serviceBadgeText}>SERVICE</ThemedText>
              </ThemedView>

              {/* Favorite */}
              <TouchableOpacity style={styles.favoriteBtn}>
                <MaterialIcons
                  name={isFavorite ? "favorite" : "favorite-border"}
                  size={20}
                  color={isFavorite ? theme.error : "white"}
                />
              </TouchableOpacity>

              {/* Price Badge */}
              <ThemedView style={styles.priceBadge}>
                <ThemedText type ="caption" intensity ="strong" style={styles.priceText}>{item.price} FCFA</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Content section */}
            <ThemedView style={styles.content}>
              {/* Title */}
              <ThemedText type ="normaltitle" intensity ="light" style={styles.title} numberOfLines={2}>
                {item.title}
              </ThemedText>

              {/* Category & Location */}
              <ThemedView style={styles.row}>
                <ThemedView style={styles.infoItem}>
                  <MaterialCommunityIcons name="shape" size={14} color={theme.subtext} />
                  <ThemedText type ="caption" style={styles.infoText}>{item.type}</ThemedText>
                </ThemedView>
:                <ThemedView style={styles.infoItem}>
                  <MaterialIcons name="location-on" size={14} color={theme.subtext} />
                  <ThemedText type ="caption" style={styles.infoText} numberOfLines={1}>
                    {item.location}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Rating */}
              <ThemedView style={[styles.row, { marginTop: 8 }]}>
                <ThemedView style={styles.infoItem}>
                  <FontAwesome5 name="star" size={12} color={theme.star} />
                  <ThemedText style={styles.ratingText}>
                    {item.stars ||0}
                  </ThemedText>
                  <ThemedText type ="caption"  style={styles.ratingCount}>
                    ({item.review ? '1+' : '0'} avis)
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Description */}
              {item.description && (
                <ThemedText type ="normal" intensity ="light" style={styles.description} numberOfLines={2}>
                  {item.description}
                </ThemedText>
              )}

              {/* Status */}
              <ThemedView style={styles.footer}>
                <ThemedView style={styles.statusContainer}>
                  <ThemedView
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          item.availibility === "available"
                            ? theme.success
                            : theme.error,
                      },
                    ]}
                  />
                  <ThemedText style={styles.statusText}>
                    {item.availibility === "available" ? "Actif" : "Inactif"}
                  </ThemedText>
                </ThemedView>

                {/* Action button */}
                <ThemedView style={styles.actionBtn}>
                  <ThemedText style={styles.actionText}>Voir détails</ThemedText>
                  <MaterialIcons name="arrow-forward" size={14} color={theme.primary} />
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
};

export default memo(RenderServiceListItem);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 6,
    marginBottom: 10,
  },
  gradient: {
    flexDirection: "row",
    borderWidth:1,
    borderRadius: 16,
    overflow: "hidden",

  },
  imageSection: {
    width: 160, 
    height: 160,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  serviceBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(99,102,241,0.95)",
    gap: 4,
  },
  serviceBadgeText: {
    color: "white",
  },
  favoriteBtn: {
    position: "absolute",
    top: 8,
    right: 4,
    padding: 4,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  priceBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(99,102,241,0.9)",
  },
  priceText: {
    color: "white",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "800",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    flex: 1,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  infoText: {
    opacity: 0.7,
    fontWeight: "500",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  ratingCount: {
    opacity: 0.6,
  },
  description: {
    opacity: 0.7,
    marginTop: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(99,102,241,0.1)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 50,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6366f1",
  },
});
