import React, { useState, useEffect, useRef, useCallback } from "react";
import { Image, TouchableOpacity, Dimensions, Animated, StatusBar, View } from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedScrollView } from "@/components/ui/ScrolleView";

type Props = {
  fadeAnim: Animated.Value,
  selectedCategory: string,
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>,
}
  const RenderCategoryTabs:React.FC<Props> = ({fadeAnim,selectedCategory,setSelectedCategory }) => {
    const categories = ["All", "Luxury", "Smart Home", "Eco-Friendly", "Space View", "Family", "Investment", "Vacation"];

    return(
    <Animated.View 
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0]
        }) }]
      }}
    >
      <ThemedView className="flex-row px-3 py-2 mt-1">
        <ThemedScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap:5 }}
        >
          {categories.map((category, index) => (
            <MotiView
              key={category}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 50, type: 'timing' }}
            >
              <TouchableOpacity 
                onPress={() => {
                  setSelectedCategory(category);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className={`px-4 py-1 rounded-2xl border ${
                  selectedCategory === category 
                    ? "border-primary" 
                    : isDark ? "border-white/20" : "border-black/10"
                }`}
                style={{
                  backgroundColor: selectedCategory === category 
                    ? colors.primary 
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }}
              >
                <ThemedText 
                  style={{ 
                    color: selectedCategory === category 
                      ? '#FFFFFF' 
                      : colors.text,
                    fontWeight: '600' 
                  }}
                >
                  {category}
                </ThemedText>
              </TouchableOpacity>
            </MotiView>
          ))}
        </ThemedScrollView>
      </ThemedView>
    </Animated.View>
  )}

  export  default  RenderCategoryTabs;