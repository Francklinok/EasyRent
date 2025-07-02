import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView, useAnimationState } from "moti"; // Imported useAnimationState for more control
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/components/contexts/theme/themehook";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TransactionType = "VENTE" | "LOCATION";
const displayModes = ["grid", "list"] as const;

type DisplayMode = typeof displayModes[number];

type PropertyType =
  | "All"
  | "Villa"
  | "Appartement"
  | "Maison"
  | "Penthouse"
  | "Studio"
  | "Loft"
  | "Bureau"
  | "Chalet"
  | "Hôtel"
  | "Terrain"
  | "Commercial";

const transactionLabels: Record<TransactionType, string> = {
  LOCATION: "Location",
  VENTE: "Vente",
};

const propertyLabels: Record<PropertyType, string> = {
  All: "Tous",
  Villa: "Villa",
  Appartement: "Appartement",
  Maison: "Maison",
  Penthouse: "Penthouse",
  Studio: "Studio",
  Loft: "Loft",
  Bureau: "Bureau",
  Chalet: "Chalet",
  Hôtel: "Hôtel",
  Terrain: "Terrain",
  Commercial: "Commercial",
};

const getPropertyIcon = (type: PropertyType) => {
  const size = 16; // Slightly increased size for better visibility
  switch (type) {
    case "All": return <MaterialCommunityIcons name="apps" size={size} />;
    case "Villa": return <MaterialCommunityIcons name="home-city-outline" size={size} />;
    case "Maison": return <MaterialCommunityIcons name="home-outline" size={size} />;
    case "Appartement": return <MaterialCommunityIcons name="office-building-outline" size={size} />;
    case "Penthouse": return <MaterialCommunityIcons name="home-modern" size={size} />;
    case "Studio": return <MaterialCommunityIcons name="home-floor-1" size={size} />;
    case "Loft": return <MaterialCommunityIcons name="home-variant-outline" size={size} />;
    case "Bureau": return <MaterialCommunityIcons name="domain" size={size} />;
    case "Chalet": return <MaterialCommunityIcons name="home-group" size={size} />;
    case "Hôtel": return <MaterialCommunityIcons name="bed-outline" size={size} />;
    case "Terrain": return <MaterialCommunityIcons name="pine-tree" size={size} />;
    case "Commercial": return <MaterialCommunityIcons name="store-outline" size={size} />;
    default: return <MaterialCommunityIcons name="home-outline" size={size} />;
  }
};

const RenderCategoryTabs = () => {
  const { theme } = useTheme();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType>("VENTE");
  const [selectedProperty, setSelectedProperty] = useState<PropertyType>("All");
  const [viewMode, setViewMode] = useState<DisplayMode>("grid");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Animation state for property type selection underline
  const propertyUnderlineAnimation = useAnimationState({
    active: { opacity: 1, scaleX: 1 },
    inactive: { opacity: 0, scaleX: 0.8 },
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTransactionSelect = (transaction: TransactionType) => {
    setSelectedTransaction(transaction);
    setSelectedProperty("All"); // Reset property type when transaction changes
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePropertySelect = (property: PropertyType) => {
    setSelectedProperty(property);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const properties = Object.keys(propertyLabels) as PropertyType[];
    const index = properties.indexOf(property);
    // Scroll to center the selected property, with a slight offset for padding
    if (scrollRef.current && index !== -1) {
      // Calculate item width (approximate, adjust based on actual content and padding)
      const itemWidth = 100; // Average width of a property tab, you might need to fine-tune this
      const scrollPosition = (index * itemWidth) - (SCREEN_WIDTH / 2) + (itemWidth / 2);
      scrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Transaction & View Mode Aligned */}
      <ThemedView className="px-4 mb-2"> {/* Increased horizontal padding and margin-bottom */}
        <ThemedView className="flex-row items-center justify-between">
          <ThemedView className="flex-row gap-4"> {/* Increased gap for better visual separation */}
            {Object.entries(transactionLabels).map(([key, label]) => {
              const transaction = key as TransactionType;
              const isSelected = selectedTransaction === transaction;
              return (
                <TouchableOpacity
                  key={transaction}
                  onPress={() => handleTransactionSelect(transaction)}
                  activeOpacity={0.7} 
                  style={{
                    borderRadius: 25, 
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    backgroundColor: isSelected ? theme.surface : theme.surface, 
                  }}
                >
                  <ThemedView
                    className="flex-row items-center"
                    style={{ backgroundColor: 'transparent' }} // Ensure background is transparent to show parent TouchableOpacity's background
                  >
                    <MaterialCommunityIcons
                      name={transaction === "VENTE" ? "currency-usd" : "key-outline"}
                      size={20} 
                      color={isSelected ? theme.primary : theme.typography.body} // White for selected, body for unselected
                      style={{ marginRight: 4,   marginLeft:14 }} // Increased margin
                    />
                    <ThemedText
                      type="subtitle"
                      intensity={isSelected? "strong":'light'}
                      scaleFactor={0.005}
                      style={{ color: isSelected ? theme.primary: theme.typography.body }} 
                    >
                      {label}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
          <TouchableOpacity
            onPress={toggleViewMode}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.surface,
              padding: 8, // Increased padding
              borderRadius: 15, // Rounded edges
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name={viewMode === "grid" ? "view-grid-outline" : "view-list"}
              size={28} // Larger icon
              color={theme.typography.body}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Property type selection */}
      <ThemedView className="mb-4"> {/* Increased margin-bottom */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4" // Increased horizontal padding
          contentContainerStyle={{ gap: 10 }} // Increased gap between items
        >
          {Object.entries(propertyLabels).map(([key, label], index) => {
            const property = key as PropertyType;
            const isSelected = selectedProperty === property;
            return (
              <MotiView
                key={property}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 40, type: "timing", duration: 400 }} // Slightly increased delay for a smoother staggered animation
                // Add MotiView animation for press feedback on the inner TouchableOpacity instead
              >
                <TouchableOpacity
                  onPress={() => handlePropertySelect(property)}
                  activeOpacity={0.8}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 20, // More rounded pills
                    backgroundColor: theme.surfaceVariant, // Consistent background
                    // No direct background change here, let the inner MotiView handle visual feedback
                  }}
                >
                  <MotiView
                    from={{ scale: 1 }}
                    animate={{ scale: isSelected ? 1.05 : 1 }} // Slight scale up when selected
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ThemedView className="mr-2" style={{ backgroundColor: 'transparent' }}> {/* Increased margin */}
                      {React.cloneElement(getPropertyIcon(property), {
                        color: isSelected ? theme.primary : theme.typography.body, // Primary color for selected icon
                      })}
                    </ThemedView>
                    <ThemedText
                      type="caption"
                      intensity="normal"
                      style={{ color: isSelected ? theme.primary : theme.typography.body, fontWeight: isSelected ? 'bold' : 'normal' }} // Bold text for selected
                    >
                      {label}
                    </ThemedText>
                  </MotiView>
                  {isSelected && (
                    <MotiView
                      from={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      style={{
                        height: 2,
                        backgroundColor: theme.primary, // Underline color
                        position: 'absolute',
                        bottom: 0,
                        left: '10%', // Adjust to center under the text/icon
                        right: '10%', // Adjust to center under the text/icon
                        borderRadius: 1,
                      }}
                    />
                  )}
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </ScrollView>
      </ThemedView>
    </Animated.View>
  );
};

export default RenderCategoryTabs;