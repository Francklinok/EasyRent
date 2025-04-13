import React, { useState, useEffect, useRef, useCallback } from "react";
import { Image, TouchableOpacity, Dimensions, Animated, StatusBar } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import data from "@/assets/data/data";

import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useThemeColors, useDarkMode, useThemeControls } from "../contexts/theme/themehook";
import { ThemedText } from "../ui/ThemedText";
import { ThemedView } from "../ui/ThemedView";
import { ThemedScrollView } from "../ui/ScrolleView";

// Interface for our internally extended data
interface ExtendedItemType extends ItemType {
  features: FeatureIcon[];
}

// Function to associate features with each property type
const getFeaturesByLocation = (location: string): FeatureIcon[] => {
  switch (location) {
    case "Florida":
      return [
        { icon: "wifi", name: "Wi-Fi" },
        { icon: "snowflake", name: "Climatisation" },
        { icon: "umbrella-beach", name: "Plage" }
      ];
    case "Texas":
      return [
        { icon: "wifi", name: "Wi-Fi" },
        { icon: "robot", name: "Assistant IA" },
        { icon: "horse", name: "Ranch" }
      ];
    case "New York City":
      return [
        { icon: "wifi", name: "Wi-Fi" },
        { icon: "subway", name: "Métro" },
        { icon: "city", name: "Centre-ville" }
      ];
    case "California":
      return [
        { icon: "wifi", name: "Wi-Fi" },
        { icon: "mountain", name: "Vue" },
        { icon: "tree", name: "Nature" }
      ];
    default:
      return [
        { icon: "wifi", name: "Wi-Fi" },
        { icon: "home", name: "Confort" }
      ];
  }
};

// Extend data
const extendedData: ExtendedItemType[] = data.map(item => ({
  ...item,
  features: getFeaturesByLocation(item.location)
}));

const { width } = Dimensions.get('window');

const RenHouseAcceuil = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Use theme hooks
  const colors = useThemeColors();
  const isDark = useDarkMode();
  const { toggleTheme } = useThemeControls();
  
  // Animation for pulsation effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const pulsate = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.8,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    ]).start(() => pulsate());
  }, [pulseAnim]);
  
  useEffect(() => {
    pulsate();
    return () => {
      // Cleanup animation
      pulseAnim.setValue(1);
    };
  }, [pulsate]);
  
  const navigateToInfo = (item: ExtendedItemType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/info/[infoId]",
      params: { 
        id: item.id
      }
    });
  };

  const toggleFavorite = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  const categories = ["All", "Luxury", "Smart Home", "Eco-Friendly", "Space View"];

  const renderCategoryTabs = () => (
    <ThemedView className="flex-row px-4 py-3 mt-12">
      <ThemedScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {categories.map((category) => (
          <TouchableOpacity 
            key={category}
            onPress={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-2xl border ${
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
                  : colors.text 
              }}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedScrollView>
    </ThemedView>
  );

  const renderHeader = () => (
    <ThemedView>
      <ThemedView className="flex-row justify-between items-center p-4 pt-12">
        <ThemedView>
          <ThemedText type="heading">Découvrez</ThemedText>
          <ThemedText type="subtitle" variant="primary">Propriétés immobilières</ThemedText>
        </ThemedView>
        
        <TouchableOpacity 
          onPress={toggleTheme}
          className={`p-2.5 rounded-full border ${
            isDark ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5"
          }`}
        >
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </ThemedView>
      
      {renderCategoryTabs()}
      
      <ThemedView className="px-4 py-2">
        <ThemedText type="body" intensity="light">
          {extendedData.length} propriétés disponibles
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const renderItem = ({ item, index }: { item: ExtendedItemType, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing' }}
      className="mb-6 px-1"
    >
      <ThemedView 
        elevated="medium"
        className="rounded-3xl overflow-hidden"
      >
        <BlurView 
          intensity={isDark ? 10 : 60} 
          tint={isDark ? "dark" : "light"} 
          className={`border rounded-3xl overflow-hidden ${
            isDark ? "border-white/10" : "border-black/5"
          }`}
        >
          <LinearGradient
            colors={colors.cardGradient}
            className="overflow-hidden"
          >
            {/* Image Section with Overlay */}
            <ThemedView className="relative">
              <Image 
                source={item.avatar} 
                className="w-full h-80" 
                resizeMode="cover" 
              />
              <LinearGradient
                colors={isDark 
                  ? ["transparent", "rgba(20,20,40,0.5)", "rgba(10,10,30,0.9)"] 
                  :["transparent", "rgba(20,20,20,0.2)", "rgba(10,10,10,0.1)"] 

                  // : ["transparent", "rgba(255,255,255,0.0)", "rgba(255,255,255,0.8)"]
                }
                className="absolute bottom-0 left-0 right-0 h-3/4"
              />
              
              {/* Status Indicators */}
              <ThemedView className="absolute top-4 left-4 right-4 flex-row justify-between items-center"
               style={{
                backgroundColor: isDark
                  ? 'transparent'  // fond sombre semi-transparent
                  : 'transparent ', // fond clair semi-transparent
                borderWidth: 0,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}>
                <ThemedView 
                  className="px-4 py-2 rounded-full flex-row items-center gap-2 "
                  style={{
                    // borderColor: item.availibility === "available" ? '#34d399' : '#ef4444',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'

                  }}
                >
                  <ThemedView className="h-3 w-3 rounded-full relative"
                    style={{ 
                      backgroundColor: item.availibility === "available" ? '#34d399' : '#ef4444',
                    }}
                  >
                    {item.availibility === "available" && (
                      <Animated.View 
                        className="absolute h-2 w-3 rounded-full bg-green-400/50"
                        style={{
                          transform: [{ scale: pulseAnim }]
                        }}
                      />
                    )}
                  </ThemedView>
                  <ThemedText 
                    style={{ 
                      fontWeight: '600',
                      color: item.availibility === "available" ? '#34d399' : '#ef4444' 
                    }}
                  >
                    {item.availibility === "available" ? "AVAILABLE" : "UNAVAILABLE"}
                  </ThemedText>
                </ThemedView>
                
                <TouchableOpacity 
                  className={`p-3 rounded-full border ${
                    isDark ? "bg-gray-800/40 border-gray-700/50" : "bg-white/50 border-gray-200/50"
                  }`}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Ionicons 
                    name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
                    size={22} 
                    color={favorites.includes(item.id) ? "#f43f5e" : isDark ? "#ffffff" : "#3b82f6"} 
                  />
                </TouchableOpacity>
              </ThemedView>

              {/* Feature Icons */}
              <ThemedView className="absolute bottom-4 left-4 flex-row gap-2"
              style = {{
                backgroundColor:"transparent"
              }}>
                {item.features?.map((feature, idx) => (
                  <ThemedView 
                    key={idx} 
                    className="p-2 rounded-lg border"
                      style={{
                        backgroundColor:isDark? 'rgba(255, 255, 255, 0.1)':'rgba(255, 255, 255, 0.4)',
                        borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.6)',
                      }}
                  >
                    <FontAwesome5 name={feature.icon} size={16} color={colors.subtext} />
                  </ThemedView>
                ))}
              </ThemedView>

              {/* Price Tag */}
              <ThemedView className="absolute bottom-4 right-4">
                <LinearGradient
                  colors={colors.priceGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="px-4 py-2 rounded-xl border border-indigo-500/30"
                >
                  <ThemedText className="text-white font-bold text-lg">
                    {item.price}
                  </ThemedText>
                </LinearGradient>
              </ThemedView>
            </ThemedView>

            {/* Content Section */}
            <ThemedView className="p-5 gap-3">
              {/* Location and Rating */}
              <ThemedView className="flex-row justify-between items-center">
                <ThemedView className="flex-row items-center gap-2">
                  <MaterialIcons name="location-on" size={18} color={colors.subtext} />
                  <ThemedText className="text-base font-semibold">
                    {item.location}
                  </ThemedText>
                </ThemedView>
                <ThemedView 
                  className={`flex-row items-center gap-1 px-3 py-1 rounded-lg border ${
                    isDark ? "bg-gray-800/40 border-gray-700/30" : "bg-white/70 border-gray-200/60"
                  }`}
                >
                  <FontAwesome5 name="star" size={16} color="#fcd34d" />
                  <ThemedText className="text-lg font-bold">
                    {item.stars}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Smart Tags */}
              <ThemedView className="flex-row justify-center flex-wrap gap-2">
                <ThemedView 
                  className={`px-4 py-1 rounded-lg border ${
                    isDark 
                      ? "bg-violet-500/20 border-violet-500/30" 
                      : "bg-violet-100 border-violet-200"
                  }`}
                >
                  <ThemedText 
                    style={{ 
                      color: isDark ? 'rgba(196, 181, 253, 1)' : 'rgba(109, 40, 217, 1)', 
                      fontWeight: '500', 
                      fontSize: 14 
                    }}
                  >
                    AI MANAGED
                  </ThemedText>
                </ThemedView>
                <ThemedView 
                  className={`px-3 py-1 rounded-lg border ${
                    isDark 
                      ? "bg-blue-500/20 border-blue-500/30" 
                      : "bg-blue-100 border-blue-200"
                  }`}
                >
                  <ThemedText 
                    style={{ 
                      color: isDark ? 'rgba(147, 197, 253, 1)' : 'rgba(29, 78, 216, 1)', 
                      fontWeight: '500', 
                      fontSize: 14 
                    }}
                  >
                    NEURAL CONTROLS
                  </ThemedText>
                </ThemedView>
                <ThemedView 
                  className={`px-3 py-1 rounded-lg border ${
                    isDark 
                      ? "bg-green-500/20 border-green-500/30" 
                      : "bg-green-100 border-green-200"
                  }`}
                >
                  <ThemedText 
                    style={{ 
                      color: isDark ? 'rgba(167, 243, 208, 1)' : 'rgba(6, 95, 70, 1)', 
                      fontWeight: '500', 
                      fontSize: 14 
                    }}
                  >
                    ECO MATRIX
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Review summary */}
              <ThemedView 
                variant="surfaceVariant"
                className={`p-3 rounded-xl border ${
                  isDark ? "border-gray-700/30" : "border-gray-200/60"
                }`}
              >
                <ThemedText className="text-base leading-6">
                  {item.review.length > 120 ? `${item.review.substring(0, 120)}...` : item.review}
                </ThemedText>
              </ThemedView>

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => navigateToInfo(item)}
                className="rounded-xl overflow-hidden"
              >
                <LinearGradient
                  colors={colors.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 items-center"
                >
                  <ThemedView className="flex-row items-center gap-2"
                    style = {{backgroundColor:"transparent"}}
>
                    <ThemedText className="text-white text-center text-lg font-bold">
                      EXPLORE
                    </ThemedText>
                    <Entypo name="chevron-right" size={20} color="white" />
                  </ThemedView>
                </LinearGradient>
              </TouchableOpacity>
            </ThemedView>

          </LinearGradient>
        </BlurView>
      </ThemedView>
    </MotiView>
  );

  return (
    <ThemedView variant="default" className="flex">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={colors.background}
        className="flex"
      >
        <Animated.FlatList
          data={extendedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          // ListHeaderComponent={renderHeader}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        />
      </LinearGradient>
    </ThemedView>
  );
};

export default RenHouseAcceuil;




