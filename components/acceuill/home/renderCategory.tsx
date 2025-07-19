import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Text,
  View,
  LayoutChangeEvent,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
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

// ---- MarqueeText Component ----
const MarqueeText = ({
  text,
  style,
  duration = 3000,
}: {
  text: string;
  style?: any;
  duration?: number;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (textWidth > containerWidth) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -textWidth + containerWidth,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      translateX.setValue(0); // Reset si pas besoin d'animation
    }
  }, [textWidth, containerWidth]);

  const onTextLayout = (e: LayoutChangeEvent) => {
    setTextWidth(e.nativeEvent.layout.width);
  };

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onContainerLayout}
      style={{ overflow: "hidden", width: "100%" }}
    >
      <Animated.View style={{ transform: [{ translateX }] }}>
        <Text onLayout={onTextLayout} style={style} numberOfLines={1}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

// ---- Icon Getter ----
const getPropertyIcon = (type: PropertyType, size: number) => {
  switch (type) {
    case "All":
      return <MaterialCommunityIcons name="apps" size={size} />;
    case "Villa":
      return <MaterialCommunityIcons name="home-city-outline" size={size} />;
    case "Maison":
      return <MaterialCommunityIcons name="home-outline" size={size} />;
    case "Appartement":
      return (
        <MaterialCommunityIcons name="office-building-outline" size={size} />
      );
    case "Penthouse":
      return <MaterialCommunityIcons name="home-modern" size={size} />;
    case "Studio":
      return <MaterialCommunityIcons name="home-floor-1" size={size} />;
    case "Loft":
      return <MaterialCommunityIcons name="home-variant-outline" size={size} />;
    case "Bureau":
      return <MaterialCommunityIcons name="domain" size={size} />;
    case "Chalet":
      return <MaterialCommunityIcons name="home-group" size={size} />;
    case "Hôtel":
      return <MaterialCommunityIcons name="bed-outline" size={size} />;
    case "Terrain":
      return <MaterialCommunityIcons name="pine-tree" size={size} />;
    case "Commercial":
      return <MaterialCommunityIcons name="store-outline" size={size} />;
    default:
      return <MaterialCommunityIcons name="home-outline" size={size} />;
  }
};

// ---- Main Component ----
const RenderCategoryTabs = ({ onChange }: { onChange?: (type: PropertyType) => void }) => {
  const { theme } = useTheme();
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyType>("All");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const properties = Object.keys(propertyLabels) as PropertyType[];
  const itemWidth = SCREEN_WIDTH / ITEMS_PER_SCREEN;


  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePropertySelect = (property: PropertyType) => {
    setSelectedProperty(property);
    onChange?.(property);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const index = properties.indexOf(property);
    if (scrollRef.current && index !== -1) {
      const scrollPosition =
        index * itemWidth - SCREEN_WIDTH / 2 + itemWidth / 2;
      scrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <ThemedView className="mb-2">
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
            const label = propertyLabels[property];

            return (
              <MotiView
                key={property}
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  delay: index * 40,
                  type: "timing",
                  duration: 350,
                }}
                style={{ width: itemWidth - 15 }}
              >
                <TouchableOpacity
                  onPress={() => handlePropertySelect(property)}
                  activeOpacity={0.8}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 4,
                    borderRadius: 14,
                    backgroundColor: isSelected
                      ? theme.surfaceVariant
                      : "transparent",
                    alignItems: "center",
                    minHeight: 50,
                  }}
                >
                  {React.cloneElement(getPropertyIcon(property, 18), {
                    color: isSelected ? theme.primary : theme.typography.body,
                  })}
                  <MarqueeText
                    text={label}
                    style={{
                      color: isSelected
                        ? theme.primary
                        : theme.typography.body,
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
    </Animated.View>
  );
};

export default RenderCategoryTabs;
