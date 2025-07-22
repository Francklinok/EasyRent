import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/components/contexts/theme/themehook";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEMS_PER_SCREEN = 6;

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

// ---- MarqueeText ----
const MarqueeText = ({ text, style, duration = 3000 }: { text: string; style?: any; duration?: number }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (textWidth > containerWidth) {
      const loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, { toValue: -textWidth + containerWidth, duration, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
      loopAnim.start();
      return () => loopAnim.stop();
    } else {
      translateX.setValue(0);
    }
  }, [textWidth, containerWidth]);

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} style={{ overflow: "hidden", width: "100%" }}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <Text onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)} style={style} numberOfLines={1}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

// ---- Icon Getter ----
const getPropertyIcon = (type: PropertyType, size: number) => {
  const icons: Record<PropertyType, string> = {
    All: "apps",
    Villa: "home-city-outline",
    Maison: "home-outline",
    Appartement: "office-building-outline",
    Penthouse: "home-modern",
    Studio: "home-floor-1",
    Loft: "home-variant-outline",
    Bureau: "domain",
    Chalet: "home-group",
    Hôtel: "bed-outline",
    Terrain: "pine-tree",
    Commercial: "store-outline",
  };
  return <MaterialCommunityIcons name={icons[type]} size={size} />;
};

// ---- Main Component ----
const RenderCategoryTabs = ({
  onChange,
  viewType,
  onToggleView,
}: {
  onChange?: (type: PropertyType) => void;
  viewType: "list" | "grid";
  onToggleView: () => void;
}) => {
  const { theme } = useTheme();
  const [selectedProperty, setSelectedProperty] = useState<PropertyType>("All");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const properties = useMemo(() => Object.keys(propertyLabels) as PropertyType[], []);
  const itemWidth = useMemo(() => SCREEN_WIDTH / ITEMS_PER_SCREEN, []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handlePropertySelect = useCallback(
    (property: PropertyType) => {
      if (property === selectedProperty) return;
      setSelectedProperty(property);
      onChange?.(property);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const index = properties.indexOf(property);
      if (scrollRef.current && index !== -1) {
        const scrollPosition = index * itemWidth - SCREEN_WIDTH / 2 + itemWidth / 2;
        scrollRef.current.scrollTo({ x: scrollPosition, animated: true });
      }
    },
    [selectedProperty, properties, itemWidth]
  );

  return (
    <Animated.View style={{ opacity: fadeAnim, flexDirection: "row", alignItems: "center" }}>
      {/* ScrollView 75% */}
      <ThemedView  style={{ flex: 3 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 8,
            gap: 12,
          }}
        >
          {properties.map((property, index) => {
            const isSelected = selectedProperty === property;
            return (
              <MotiView
                key={property}
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 40, type: "timing", duration: 300 }}
                style={{ width: itemWidth - 15 }}
              >
                <TouchableOpacity
                  onPress={() => handlePropertySelect(property)}
                  activeOpacity={0.8}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 4,
                    borderRadius: 14,
                    backgroundColor: isSelected ? theme.surfaceVariant : "transparent",
                    alignItems: "center",
                    minHeight: 50,
                  }}
                >
                  {React.cloneElement(getPropertyIcon(property, 18), {
                    color: isSelected ? theme.primary : theme.typography.body,
                  })}
                  <MarqueeText
                    text={propertyLabels[property]}
                    style={{
                      color: isSelected ? theme.primary : theme.typography.body,
                      fontWeight: isSelected ? "600" : "normal",
                      marginTop: 4,
                      fontSize: 11,
                      textAlign: "center",
                    }}
                  />
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </ScrollView>
      </ThemedView>

      {/* Bouton 25% */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <TouchableOpacity
          onPress={onToggleView}
          activeOpacity={0.7}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 25,
            padding: 6,
            elevation: 1,
          }}
        >
          <MaterialCommunityIcons
            name={viewType === "list" ? "view-grid" : "view-list"}
            size={26}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default RenderCategoryTabs;
