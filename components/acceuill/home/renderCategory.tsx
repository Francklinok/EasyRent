import React, { useState, useRef, useEffect } from "react";
import { TouchableOpacity, Animated, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/components/contexts/theme/themehook";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Example for icons

const categoryIcons = {
  All: "view-grid",
  Luxury: "crown",
  "Smart Home": "lightbulb-group",
  "Eco-Friendly": "leaf",
  "Space View": "galaxy",
  Family: "home-group",
  Investment: "chart-line",
  Vacation: "airplane",
};

const RenderCategoryTabs = () => {
  const { theme } = useTheme();
  const categories = Object.keys(categoryIcons); // Use keys for consistency

  const [selectedCategory, setSelectedCategory] = useState("All");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const index = categories.indexOf(selectedCategory);
    if (scrollRef.current && index !== -1) {
      // You might need to measure actual item width for precise scrolling
      scrollRef.current.scrollTo({
        x: index * 100, // Still an assumption for now
        animated: true,
      });
    }
  }, [selectedCategory, categories]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0], // Slightly less aggressive entry animation
            }),
          },
        ],
      }}
    >
      <ThemedView className="flex-row px-2 mt-4">
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }} // Increased gap and padding
        >
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category;
            const iconName = categoryIcons[category];

            return (
              <MotiView
                key={category}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: isSelected ? 1.02 : 1 }} // Slight scale up on select
                transition={{
                  delay: index * 40,
                  type: "spring", // Spring animation for a bouncier feel
                  damping: 15,
                  stiffness: 150,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(category);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`flex-row items-center justify-center py-1 px-4 rounded-full border ${
                    isSelected ? "border-primary" : "border-white/10"
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? theme.primary
                      : "rgba(255,255,255,0.08)", // Slightly darker non-selected background
                  }}
                >
                  {iconName && (
                    <MaterialCommunityIcons
                      name={iconName}
                      size={16}
                      color={isSelected ? "#FFFFFF" : theme.text}
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <ThemedText
                    type="caption"
                    style={{
                      color: isSelected ? "#FFFFFF" : theme.text,
                      fontWeight: isSelected ? "700" : "600", // Slightly bolder for selected
                    }}
                  >
                    {category}
                  </ThemedText>
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