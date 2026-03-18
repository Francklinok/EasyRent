import React, { useState, useCallback, useEffect } from "react";
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { FontAwesome5, AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/hooks/themehook";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Filter State Type ───
export interface FilterState {
  priceRange: [number, number];
  propertyType: string | null;
  bedrooms: number | null;
  amenities: string[];
  actionType: "rent" | "sell" | null;
}

export const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 5000000],
  propertyType: null,
  bedrooms: null,
  amenities: [],
  actionType: null,
};

// ─── Constants ───
const PROPERTY_TYPES = [
  { key: "house", label: "Maison", icon: "home" as const },
  { key: "apartment", label: "Appartement", icon: "building" as const },
  { key: "villa", label: "Villa", icon: "hotel" as const },
  { key: "land", label: "Terrain", icon: "map" as const },
] as const;

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5] as const;

const AMENITIES = [
  { key: "pool", label: "Piscine", icon: "swimming-pool" as const },
  { key: "parking", label: "Parking", icon: "parking" as const },
  { key: "garden", label: "Jardin", icon: "tree" as const },
  { key: "security", label: "Sécurité", icon: "shield-alt" as const },
  { key: "wifi", label: "Wi-Fi", icon: "wifi" as const },
  { key: "ac", label: "Climatisation", icon: "snowflake" as const },
  { key: "furnished", label: "Meublé", icon: "couch" as const },
  { key: "elevator", label: "Ascenseur", icon: "arrow-up" as const },
] as const;

const PRICE_STEPS = [0, 50000, 100000, 250000, 500000, 1000000, 2500000, 5000000];

type Props = {
  fadeAnim: Animated.Value;
  filterModalVisible: boolean;
  setFilterModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onApplyFilters?: (filters: FilterState) => void;
  activeFilters?: FilterState;
};

const RenderFilterModal: React.FC<Props> = ({
  fadeAnim,
  filterModalVisible,
  setFilterModalVisible,
  onApplyFilters,
  activeFilters,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Local filter state (only committed on "Appliquer")
  const [filters, setFilters] = useState<FilterState>(activeFilters ?? DEFAULT_FILTERS);

  // Sync when modal opens with current active filters
  useEffect(() => {
    if (filterModalVisible && activeFilters) {
      setFilters(activeFilters);
    }
  }, [filterModalVisible, activeFilters]);

  // Animation for modal open/close
  useEffect(() => {
    if (filterModalVisible) {
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [filterModalVisible, fadeAnim]);

  const activeFilterCount = useCallback(() => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.bedrooms) count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000) count++;
    if (filters.actionType) count++;
    return count;
  }, [filters]);

  const toggleAmenity = useCallback((key: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((a) => a !== key)
        : [...prev.amenities, key],
    }));
  }, []);

  const setPropertyType = useCallback((key: string) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: prev.propertyType === key ? null : key,
    }));
  }, []);

  const setBedrooms = useCallback((num: number) => {
    setFilters((prev) => ({
      ...prev,
      bedrooms: prev.bedrooms === num ? null : num,
    }));
  }, []);

  const setPriceMin = useCallback((val: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [val, Math.max(val, prev.priceRange[1])],
    }));
  }, []);

  const setPriceMax = useCallback((val: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [Math.min(prev.priceRange[0], val), val],
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleApply = useCallback(() => {
    onApplyFilters?.(filters);
    setFilterModalVisible(false);
  }, [filters, onApplyFilters, setFilterModalVisible]);

  const handleClose = useCallback(() => {
    setFilterModalVisible(false);
  }, [setFilterModalVisible]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
    return `${price}`;
  };

  if (!filterModalVisible) return null;

  return (
    <Modal
      visible={filterModalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdropInner,
            { opacity: fadeAnim },
          ]}
        />
      </Pressable>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            paddingBottom: insets.bottom + 16,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SCREEN_HEIGHT, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Handle bar */}
        <ThemedView style={styles.handleBarContainer} backgroundColor="transparent">
          <ThemedView style={styles.handleBar} />
        </ThemedView>

        {/* Header */}
        <ThemedView style={styles.header} backgroundColor="transparent">
          <ThemedView backgroundColor="transparent">
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
              Filtres
            </ThemedText>
            {activeFilterCount() > 0 && (
              <ThemedText style={styles.activeCount}>
                {activeFilterCount()} actif{activeFilterCount() > 1 ? "s" : ""}
              </ThemedText>
            )}
          </ThemedView>
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.closeButton, { backgroundColor: theme.card }]}
            activeOpacity={0.7}
          >
            <AntDesign name="close" size={18} color={theme.text} />
          </TouchableOpacity>
        </ThemedView>

        {/* Scrollable filter content */}
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* ─── Price Range ─── */}
          <ThemedView style={styles.section} backgroundColor="transparent">
            <ThemedView style={styles.sectionHeader} backgroundColor="transparent">
              <Ionicons name="cash-outline" size={20} color={theme.primary} />
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Budget
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.priceDisplay} backgroundColor="transparent">
              <ThemedView
                style={[styles.priceChip, { backgroundColor: theme.primary + "15", borderColor: theme.primary + "30" }]}
              >
                <ThemedText style={[styles.priceChipLabel, { color: theme.subtext }]}>Min</ThemedText>
                <ThemedText style={[styles.priceChipValue, { color: theme.primary }]}>
                  {formatPrice(filters.priceRange[0])} FCFA
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.priceDash} backgroundColor="transparent">
                <AntDesign name="arrowright" size={16} color={theme.subtext} />
              </ThemedView>
              <ThemedView
                style={[styles.priceChip, { backgroundColor: theme.primary + "15", borderColor: theme.primary + "30" }]}
              >
                <ThemedText style={[styles.priceChipLabel, { color: theme.subtext }]}>Max</ThemedText>
                <ThemedText style={[styles.priceChipValue, { color: theme.primary }]}>
                  {formatPrice(filters.priceRange[1])} FCFA
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Min price steps */}
            <ThemedText style={[styles.priceStepLabel, { color: theme.subtext }]}>
              Prix minimum
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceStepRow}>
              {PRICE_STEPS.slice(0, -1).map((step) => {
                const isActive = filters.priceRange[0] === step;
                return (
                  <TouchableOpacity
                    key={`min-${step}`}
                    onPress={() => setPriceMin(step)}
                    style={[
                      styles.priceStep,
                      isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                      !isActive && { borderColor: theme.border || "#333" },
                    ]}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.priceStepText,
                        { color: isActive ? "#fff" : theme.text },
                      ]}
                    >
                      {formatPrice(step)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Max price steps */}
            <ThemedText style={[styles.priceStepLabel, { color: theme.subtext, marginTop: 12 }]}>
              Prix maximum
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceStepRow}>
              {PRICE_STEPS.slice(1).map((step) => {
                const isActive = filters.priceRange[1] === step;
                return (
                  <TouchableOpacity
                    key={`max-${step}`}
                    onPress={() => setPriceMax(step)}
                    style={[
                      styles.priceStep,
                      isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                      !isActive && { borderColor: theme.border || "#333" },
                    ]}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.priceStepText,
                        { color: isActive ? "#fff" : theme.text },
                      ]}
                    >
                      {formatPrice(step)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ThemedView>

          {/* ─── Property Type ─── */}
          <ThemedView style={styles.section} backgroundColor="transparent">
            <ThemedView style={styles.sectionHeader} backgroundColor="transparent">
              <MaterialCommunityIcons name="home-city-outline" size={20} color={theme.primary} />
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Type de propriété
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.propertyTypeGrid} backgroundColor="transparent">
              {PROPERTY_TYPES.map((type) => {
                const isActive = filters.propertyType === type.key;
                return (
                  <TouchableOpacity
                    key={type.key}
                    onPress={() => setPropertyType(type.key)}
                    style={[
                      styles.propertyTypeCard,
                      {
                        backgroundColor: isActive ? theme.primary + "15" : theme.card,
                        borderColor: isActive ? theme.primary : theme.border || "#222",
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5
                      name={type.icon}
                      size={22}
                      color={isActive ? theme.primary : theme.subtext}
                    />
                    <ThemedText
                      style={[
                        styles.propertyTypeLabel,
                        { color: isActive ? theme.primary : theme.text },
                        isActive && styles.propertyTypeLabelActive,
                      ]}
                    >
                      {type.label}
                    </ThemedText>
                    {isActive && (
                      <ThemedView style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                        <AntDesign name="check" size={10} color="#fff" />
                      </ThemedView>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          </ThemedView>

          {/* ─── Bedrooms ─── */}
          <ThemedView style={styles.section} backgroundColor="transparent">
            <ThemedView style={styles.sectionHeader} backgroundColor="transparent">
              <Ionicons name="bed-outline" size={20} color={theme.primary} />
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Chambres
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.bedroomRow} backgroundColor="transparent">
              {BEDROOM_OPTIONS.map((num) => {
                const isActive = filters.bedrooms === num;
                return (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setBedrooms(num)}
                    style={[
                      styles.bedroomChip,
                      {
                        backgroundColor: isActive ? theme.primary : theme.card,
                        borderColor: isActive ? theme.primary : theme.border || "#222",
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.bedroomText,
                        { color: isActive ? "#fff" : theme.text },
                        isActive && styles.bedroomTextActive,
                      ]}
                    >
                      {num === 5 ? "5+" : num}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          </ThemedView>

          {/* ─── Amenities ─── */}
          <ThemedView style={styles.section} backgroundColor="transparent">
            <ThemedView style={styles.sectionHeader} backgroundColor="transparent">
              <Ionicons name="sparkles-outline" size={20} color={theme.primary} />
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Équipements
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.amenitiesGrid} backgroundColor="transparent">
              {AMENITIES.map((amenity) => {
                const isActive = filters.amenities.includes(amenity.key);
                return (
                  <TouchableOpacity
                    key={amenity.key}
                    onPress={() => toggleAmenity(amenity.key)}
                    style={[
                      styles.amenityChip,
                      {
                        backgroundColor: isActive ? theme.primary + "15" : theme.card,
                        borderColor: isActive ? theme.primary : theme.border || "#222",
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5
                      name={amenity.icon}
                      size={14}
                      color={isActive ? theme.primary : theme.subtext}
                    />
                    <ThemedText
                      style={[
                        styles.amenityLabel,
                        { color: isActive ? theme.primary : theme.text },
                        isActive && styles.amenityLabelActive,
                      ]}
                    >
                      {amenity.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          </ThemedView>
        </ScrollView>

        {/* ─── Action Buttons ─── */}
        <ThemedView style={styles.actionBar} backgroundColor="transparent">
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: theme.border || "#333" }]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color={theme.text} />
            <ThemedText style={[styles.resetText, { color: theme.text }]}>
              Réinitialiser
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: theme.primary }]}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={18} color="#fff" />
            <ThemedText style={styles.applyText}>
              Appliquer
              {activeFilterCount() > 0 ? ` (${activeFilterCount()})` : ""}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: "#111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  // Handle
  handleBarContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  activeCount: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  // Scroll
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  // Section
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Price
  priceDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  priceChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  priceChipLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  priceChipValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  priceDash: {
    width: 24,
    alignItems: "center",
  },
  priceStepLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  priceStepRow: {
    flexDirection: "row",
  },
  priceStep: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  priceStepText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Property Type
  propertyTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  propertyTypeCard: {
    width: "47%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    position: "relative",
  },
  propertyTypeLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  propertyTypeLabelActive: {
    fontWeight: "700",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // Bedrooms
  bedroomRow: {
    flexDirection: "row",
    gap: 10,
  },
  bedroomChip: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  bedroomText: {
    fontSize: 16,
    fontWeight: "500",
  },
  bedroomTextActive: {
    fontWeight: "700",
  },

  // Amenities
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  amenityLabel: {
    fontSize: 13,
    fontWeight: "400",
  },
  amenityLabelActive: {
    fontWeight: "600",
  },

  // Actions
  actionBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  resetText: {
    fontSize: 15,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  applyText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default RenderFilterModal;
