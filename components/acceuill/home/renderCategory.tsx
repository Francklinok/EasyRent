import React, { useEffect, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/components/contexts/theme/themehook";
import Svg, { Path, Rect, Circle } from "react-native-svg";

type PropertyType =
  | "All"
  | "Villa"
  | "Appartement"
  | "Hôtel"
  | "Maison"
  | "Penthouse"
  | "Studio"
  | "Loft"
  | "Bureau"
  | "Chalet";

const propertyLabels: Record<PropertyType, string> = {
  All: "Tous",
  Villa: "Villa",
  Appartement: "Appartement",
  Hôtel: "Hôtel",
  Maison: "Maison",
  Penthouse: "Penthouse",
  Studio: "Studio",
  Loft: "Loft",
  Bureau: "Bureau",
  Chalet: "Chalet",
};

const getIcon = (type: PropertyType, isSelected: boolean, color: string) => {
  const stroke = color;
  const fill = isSelected ? color : "none";

  switch (type) {
    case "All":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" stroke={stroke} strokeWidth="2" fill={fill} />
        </Svg>
      );
    case "Villa":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M3 21h18M4 21V10l8-6 8 6v11M9 21v-8h6v8" stroke={stroke} strokeWidth="2" />
          <Path d="M12 4l-8 6h16l-8-6z" fill={fill} stroke={stroke} />
        </Svg>
      );
    case "Appartement":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="18" height="18" rx="2" stroke={stroke} strokeWidth="2" fill={fill} />
          <Path d="M9 9h6M9 13h6M9 17h6" stroke={stroke} strokeWidth="1.5" />
        </Svg>
      );
    case "Hôtel":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="6" width="18" height="15" rx="2" stroke={stroke} strokeWidth="2" fill={fill} />
          <Path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke={stroke} strokeWidth="2" />
          <Path d="M8 11h1M11 11h1M14 11h1M8 15h1M11 15h1M14 15h1" stroke={stroke} strokeWidth="1.5" />
        </Svg>
      );
    case "Maison":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M3 21h18M5 21V7l7-4 7 4v14M10 21V15h4v6" stroke={stroke} strokeWidth="2" />
          <Circle cx="12" cy="11" r="2" stroke={stroke} strokeWidth="1.5" fill={fill} />
        </Svg>
      );
    case "Penthouse":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M2 20h20M4 20V8l8-6 8 6v12" stroke={stroke} strokeWidth="2" />
          <Path d="M12 2l-8 6h16l-8-6z" fill={fill} stroke={stroke} />
          <Rect x="9" y="13" width="6" height="7" stroke={stroke} strokeWidth="1.5" fill={fill} />
        </Svg>
      );
    case "Studio":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect x="4" y="4" width="16" height="16" rx="2" stroke={stroke} strokeWidth="2" fill={fill} />
          <Path d="M8 8h8M8 12h8M8 16h4" stroke={stroke} strokeWidth="1.5" />
        </Svg>
      );
    case "Loft":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="8" width="18" height="13" stroke={stroke} strokeWidth="2" fill={fill} />
          <Path d="M3 8l9-5 9 5" stroke={stroke} strokeWidth="2" />
        </Svg>
      );
    case "Bureau":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="4" width="18" height="16" rx="2" stroke={stroke} strokeWidth="2" fill={fill} />
          <Path d="M3 10h18M9 4v16M15 4v16" stroke={stroke} strokeWidth="1.5" />
        </Svg>
      );
    case "Chalet":
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M3 20h18M4 20V12l8-8 8 8v8" stroke={stroke} strokeWidth="2" />
          <Path d="M12 4L4 12h16L12 4z" fill={fill} stroke={stroke} />
        </Svg>
      );
    default:
      return null;
  }
};

const RenderCategoryTabs = () => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<PropertyType>("All");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const index = Object.keys(propertyLabels).indexOf(selectedCategory);
    if (scrollRef.current && index !== -1) {
      scrollRef.current.scrollTo({ x: index * 45 - 40, animated: true });
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category: PropertyType) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, -10],
            }),
          },
        ],
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 6 }}
      >
        {Object.entries(propertyLabels).map(([key, label], index) => {
          const category = key as PropertyType;
          const isSelected = selectedCategory === category;
          const color = isSelected ?theme.input.focus  : theme.input.text;

          return (
            <MotiView
              key={category}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 50, type: "spring" }}
              className="items-center"
            >
              <TouchableOpacity onPress={() => handleCategorySelect(category)} activeOpacity={0.8}>
                <ThemedView className="items-center">
                  <ThemedView className="rounded-full p-2" style={{ borderColor: color }}>
                    {getIcon(category, isSelected, color)}
                  </ThemedView>
                  <ThemedText type = "caption" style={{ color, marginTop: 2, textAlign: "center" }}>
                    {label}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

export default RenderCategoryTabs;
