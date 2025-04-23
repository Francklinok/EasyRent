import React, { useState, useEffect, useRef, useCallback } from "react";
import { Image, TouchableOpacity, Dimensions, Animated, StatusBar, View } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, Entypo, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { MotiView, MotiText } from "moti";
// import { SharedElement } from "react-navigation-shared-element";
import * as Animatable from "react-native-animatable";
import LottieView from "lottie-react-native";
import data from "@/assets/data/data";

import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useThemeColors, useDarkMode, useThemeControls } from "../contexts/theme/themehook";
import { ThemedText } from "../ui/ThemedText";
import { ThemedView } from "../ui/ThemedView";
import { ThemedScrollView } from "../ui/ScrolleView";

// Interface for our internally extended data
interface ExtendedItemType extends ItemType {
  features: FeatureIcon[];
  energyScore: number; // Score énergétique de 0 à 100
  virtualTourAvailable: boolean;
  distanceToAmenities: {
    schools: number;
    healthcare: number;
    shopping: number;
    transport: number;
  };
  aiRecommendation: string; // Recommandation personnalisée par IA
}

// Function to associate features with each property type with enhanced options
const getFeaturesByLocation = (location: string): FeatureIcon[] => {
  const baseFeatures = [{ icon: "wifi", name: "Wi-Fi" }];
  
  switch (location) {
    case "Florida":
      return [
        ...baseFeatures,
        { icon: "snowflake", name: "Climatisation" },
        { icon: "umbrella-beach", name: "Plage" },
        { icon: "hot-tub", name: "Spa" }
      ];
    case "Texas":
      return [
        ...baseFeatures,
        { icon: "robot", name: "Assistant IA" },
        { icon: "horse", name: "Ranch" },
        { icon: "solar-panel", name: "Panneaux solaires" }
      ];
    case "New York City":
      return [
        ...baseFeatures,
        { icon: "subway", name: "Métro" },
        { icon: "city", name: "Centre-ville" },
        { icon: "concierge-bell", name: "Conciergerie" }
      ];
    case "California":
      return [
        ...baseFeatures,
        { icon: "mountain", name: "Vue" },
        { icon: "tree", name: "Nature" },
        { icon: "wine-glass-alt", name: "Vignoble" }
      ];
    default:
      return [
        ...baseFeatures,
        { icon: "home", name: "Confort" },
        { icon: "parking", name: "Parking" }
      ];
  }
};

// Generate energy score for each property
const getEnergyScore = (location: string): number => {
  const baseScore = Math.floor(Math.random() * 40) + 60; // Between 60-100
  
  // Location-specific adjustments
  switch (location) {
    case "California":
      return Math.min(100, baseScore + 15); // California has better energy scores
    case "Texas":
      return Math.max(60, baseScore - 10); // Texas has worse energy scores
    default:
      return baseScore;
  }
};

// Extend data with more information
const extendedData: ExtendedItemType[] = data.map(item => {
  const energyScore = getEnergyScore(item.location);
  const hasTour = Math.random() > 0.3; // 70% chance of having virtual tour
  
  return {
    ...item,
    features: getFeaturesByLocation(item.location),
    energyScore,
    virtualTourAvailable: hasTour,
    distanceToAmenities: {
      schools: Math.floor(Math.random() * 5) + 1,
      healthcare: Math.floor(Math.random() * 8) + 1,
      shopping: Math.floor(Math.random() * 4) + 1,
      transport: Math.floor(Math.random() * 3) + 1
    },
    aiRecommendation: [
      "Parfait pour une famille de 4 personnes",
      "Idéal pour les télétravailleurs",
      "Excellent investissement locatif",
      "Coup de cœur pour les amoureux de nature",
      "Recommandé pour votre style de vie urbain"
    ][Math.floor(Math.random() * 5)]
  };
});

const { width, height } = Dimensions.get('window');

const RenHouseAcceuil = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [animatingElement, setAnimatingElement] = useState<string | null>(null);
  
  // Animations refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);
  
  // Use theme hooks
  const colors = useThemeColors();
  const isDark = useDarkMode();
  const { toggleTheme } = useThemeControls();
  
  // Animation for pulsation effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const pulsate = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.5,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]).start(() => pulsate());
  }, [pulseAnim]);
  
  useEffect(() => {
    pulsate();
    
    // Fade in the component
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
    
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 500);
    }
    
    return () => {
      // Cleanup animations
      pulseAnim.setValue(1);
      fadeAnim.setValue(0);
    };
  }, [pulsate, fadeAnim]);
  
  const navigateToInfo = (item: ExtendedItemType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnimatingElement(item.id);
    
    // Add slight delay for transition effect
    setTimeout(() => {
      router.push({
        pathname: "/info/[infoId]",
        params: { 
          id: item.id
        }
      });
      
      // Reset animating state
      setTimeout(() => setAnimatingElement(null), 500);
    }, 300);
  };

  const toggleFavorite = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
    
    // Play heart animation
    if (lottieRef.current && !favorites.includes(id)) {
      lottieRef.current.play(0, 60);
    }
  };

  // Expanded categories
  const categories = ["All", "Luxury", "Smart Home", "Eco-Friendly", "Space View", "Family", "Investment", "Vacation"];

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp'
  });
  
  // Header translation animation
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp'
  });

  const renderCategoryTabs = () => (
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
  );

  const renderHeader = () => (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        opacity: headerOpacity,
        transform: [{ translateY: headerTranslate }]
      }}
    >
      <BlurView
        intensity={isDark ? 40 : 80}
        tint={isDark ? "dark" : "light"}
        className="px-4 pt-4 pb-2"
      >
        <ThemedView className="flex-row justify-between items-center">
          <ThemedView className="flex-1">
            <MotiText
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 200, type: 'timing' }}
              className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              RenHouse
            </MotiText>
            <MotiText
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 300, type: 'timing' }}
              className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-600'}`}
            >
              Trouvez votre logement idéal
            </MotiText>
          </ThemedView>
          
          <ThemedView className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setViewType(viewType === "list" ? "grid" : "list");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`p-2.5 rounded-full border ${
                isDark ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5"
              }`}
            >
              <MaterialIcons
                name={viewType === "list" ? "grid-view" : "view-list"}
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setFilterModalVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              className={`p-2.5 rounded-full border ${
                isDark ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5"
              }`}
            >
              <Ionicons name="filter" size={22} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                toggleTheme();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`p-2.5 rounded-full border ${
                isDark ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5"
              }`}
            >
              <Ionicons 
                name={isDark ? 'sunny' : 'moon'} 
                size={22} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </BlurView>
    </Animated.View>
  );

  // INNOVATION 1: Carte de recommandation IA personnalisée
  const renderAIRecommendation = () => {
    if (!showAIRecommendations) return null;
    
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 300 }}
        className="mx-2 mb-6"
      >
        <TouchableOpacity
          onPress={() => setShowAIRecommendations(false)}
          activeOpacity={0.9}
        >
          <BlurView
            intensity={isDark ? 30 : 70}
            tint={isDark ? "dark" : "light"}
            className="rounded-3xl overflow-hidden border"
            style={{ borderColor: isDark ? 'rgba(147, 197, 253, 0.3)' : 'rgba(37, 99, 235, 0.2)' }}
          >
            <LinearGradient
              colors={isDark 
                ? ['rgba(30, 58, 138, 0.4)', 'rgba(37, 99, 235, 0.1)'] 
                : ['rgba(219, 234, 254, 0.8)', 'rgba(191, 219, 254, 0.4)']}
              className="px-4 py-4"
            >
              <ThemedView className="flex-row items-center gap-3" style={{ backgroundColor: 'transparent' }}>
                <ThemedView 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.1)' }}
                >
                  <MaterialCommunityIcons name="robot-excited" size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
                </ThemedView>
                <ThemedView style={{ backgroundColor: 'transparent' }}>
                  <ThemedText style={{ fontWeight: '700', color: isDark ? "#60a5fa" : "#2563eb" }}>
                    Assistant RenHome AI
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: isDark ? "#93c5fd" : "#3b82f6" }}>
                    Recommandations personnalisées
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView 
                className="mt-3 p-3 rounded-xl"
                style={{ backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : 'rgba(239, 246, 255, 0.8)' }}
              >
                <ThemedText className="leading-5" style={{ color: isDark ? "#bfdbfe" : "#1e40af" }}>
                  Basé sur vos préférences, nous avons sélectionné 3 propriétés qui correspondent à vos critères. 
                  Notre analyse IA suggère que la propriété à "California" correspond le mieux à votre style de vie.
                </ThemedText>
              </ThemedView>

              <ThemedView className="mt-3 flex-row justify-between" style={{ backgroundColor: 'transparent' }}>
                <TouchableOpacity 
                  className="px-3 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)'
                  }}
                >
                  <ThemedText style={{ color: isDark ? "#93c5fd" : "#2563eb", fontWeight: '600', fontSize: 12 }}>
                    Voir les suggestions
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.4)' : 'rgba(37, 99, 235, 0.8)',
                  }}
                >
                  <ThemedText style={{ color: '#ffffff', fontWeight: '600', fontSize: 12 }}>
                    Affiner mes critères
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </MotiView>
    );
  };

  // INNOVATION 2: Carte d'efficacité énergétique
  const renderEnergyScore = (score: number) => {
    let color = '#22c55e'; // Green for high scores
    if (score < 70) color = '#f59e0b'; // Yellow for medium scores
    if (score < 60) color = '#ef4444'; // Red for low scores
    
    return (
      <ThemedView 
        className="rounded-lg px-1 py-1 flex-row  gap-1"
        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)' }}
      >
        <MaterialCommunityIcons name="leaf" size={12} color={color} />
        <ThemedText style={{ color, fontWeight: '600', fontSize: 10 }}>
          {score}
        </ThemedText>
      </ThemedView>
    );
  };

  // INNOVATION 3: Virtual tour badge
  const renderVirtualTourBadge = (available: boolean) => {
    if (!available) return null;
    
    return (
      <ThemedView 
        className="absolute top-1 right-14 px-1 py-1 rounded-lg flex-row items-center gap-1"
        style={{ 
          backgroundColor: isDark ? 'rgba(30, 64, 175, 0.7)' : 'rgba(219, 234, 254, 0.9)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.2)',
        }}
      >
        <MaterialCommunityIcons 
          name="rotate-3d-variant" 
          size={14} 
          color={isDark ? '#93c5fd' : '#1e40af'} 
        />
        <ThemedText 
          style={{ 
            color: isDark ? '#93c5fd' : '#1e40af', 
            fontWeight: '600', 
            fontSize: 10 
          }}
        >
          VISITE 3D
        </ThemedText>
      </ThemedView>
    );
  };

  // INNOVATION 4: Social proof and neighborhood summary
  const renderNeighborhoodInfo = (item: ExtendedItemType) => (
    <ThemedView 
      className=" flex-row justify-between items-center p-1 rounded-lg border"
      style={{
        backgroundColor: isDark ? 'rgba(55, 65, 81, 0.2)' : 'rgba(243, 244, 246, 0.6)',
        borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
      }}
    >
      <ThemedView className="flex-row items-center gap-1">
        <MaterialIcons name="school" size={14} color={colors.subtext} />
        <ThemedText style={{ fontSize: 10, color: colors.subtext }}>
          {item.distanceToAmenities.schools}km
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row items-center gap-1">
        <FontAwesome5 name="hospital" size={14} color={colors.subtext} />
        <ThemedText style={{ fontSize: 10, color: colors.subtext }}>
          {item.distanceToAmenities.healthcare}km
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row items-center gap-1">
        <FontAwesome5 name="shopping-cart" size={14} color={colors.subtext} />
        <ThemedText style={{ fontSize: 10, color: colors.subtext }}>
          {item.distanceToAmenities.shopping}km
        </ThemedText>
      </ThemedView>
      
      <ThemedView className="flex-row items-center gap-1">
        <MaterialIcons name="train" size={14} color={colors.subtext} />
        <ThemedText style={{ fontSize: 10, color: colors.subtext }}>
          {item.distanceToAmenities.transport}km
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
      <Animatable.View
        animation={animatingElement === item.id ? "pulse" : undefined}
        duration={500}
      >
        <ThemedView 
          elevated="medium"
          className="rounded-3xl overflow-hidden"
        >
          <BlurView 
            intensity={isDark ? 20 : 70} 
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
                <MotiView id={`item.${item.id}.image`}>
                  <Image 
                    source={item.avatar} 
                    className="w-full h-80" 
                    resizeMode="cover" 
                  />
                </MotiView>
                <LinearGradient
                  colors={isDark 
                    ? ["transparent", "rgba(20,20,40,0.5)", "rgba(10,10,30,0.9)"] 
                    : ["transparent", "rgba(20,20,20,0.2)", "rgba(10,10,10,0.1)"]
                  }
                  className="absolute bottom-0 left-0 right-0 h-3/4"
                />
                
                {/* Status Indicators and Badges */}
                <ThemedView 
                  className="absolute top-3 left-1 right-4 flex-row justify-between items-center"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <ThemedView 
                    className="px-2 py-1 rounded-full flex-row items-center gap-2"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <ThemedView 
                      className="h-2 w-2 rounded-full relative"
                      style={{ 
                        backgroundColor: item.availibility === "available" ? '#34d399' : '#ef4444',
                      }}
                    >
                      {item.availibility === "available" && (
                        <Animated.View 
                          className="absolute h-2 w-2 rounded-full bg-green-400/50"
                          style={{
                            transform: [{ scale: pulseAnim }]
                          }}
                        />
                      )}
                    </ThemedView>
                    <ThemedText 
                      style={{ 
                        fontWeight: '600',
                        color: item.availibility === "available" ? '#34d399' : '#ef4444', 
                        fontSize: 10,
                        marginLeft: 2,
                      }}
                    >
                      {item.availibility === "available" ? "Disponible" : "Indisponible"}
                    </ThemedText>
                  </ThemedView>
                  
                  {/* Render energy score */}
                  {renderEnergyScore(item.energyScore)}

                  {/* Render virtual tour badge */}
                  {renderVirtualTourBadge(item.virtualTourAvailable)}
                  
                  <TouchableOpacity 
                    className={`p-3 rounded-full border ${
                      isDark ? "bg-gray-800/40 border-gray-700/50" : "bg-white/50 border-gray-200/50"
                    }`}
                    onPress={() => toggleFavorite(item.id)}
                  >
                    {favorites.includes(item.id) ? (
                      <LottieView
                        ref={lottieRef}
                        source={require("@/assets/animations/heart.json")}
                        style={{ width: 20, height: 20 }}
                        autoPlay={false}
                        loop={false}
                      />
                    ) : (
                      <Ionicons 
                        name="heart-outline" 
                        size={20} 
                        color={isDark ? "#ffffff" : "#3b82f6"} 
                      />
                    )}
                  </TouchableOpacity>
                </ThemedView>

                {/* Feature Icons - now with smooth animation */}
                <ThemedView 
                  className="absolute bottom-4 left-4 flex-row gap-2"
                  style={{ backgroundColor: "transparent" }}
                >
                  {item.features?.map((feature, idx) => (
                    <MotiView
                      key={idx}
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: idx * 100 + 300, type: 'spring' }}
                    >
                      <ThemedView 
                        className="p-1 rounded-lg border"
                        style={{
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                          borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.6)',
                        }}
                      >
                        <FontAwesome5 name={feature.icon} size={16} color={colors.subtext} />
                      </ThemedView>
                    </MotiView>
                  ))}
                </ThemedView>

                {/* Price Tag with enhanced styling */}
                <ThemedView className="absolute p-2 rounded-3xl bottom-4 right-4"
                 style={{ 
                  backgroundColor: isDark ? 'rgba(30, 64, 175, 0.7)' : 'rgba(219, 234, 254, 0.9)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.2)',
                }}
                  >
                    <ThemedText className="text-white font-bold text-lg">
                      {item.price}
                    </ThemedText>
                  {/* </LinearGradient> */}
                </ThemedView>
              </ThemedView>

              {/* Content Section */}
              <ThemedView className=" pl-4 pr-4 gap-2">
                {/* Location and Rating */}
                <ThemedView className="flex-row justify-between items-center">
                  <ThemedView className="flex-row items-center gap-2">
                    <MaterialIcons name="location-on" size={18} color={colors.subtext} />
                    <ThemedText className="text-base font-semibold"
                      style={{ fontSize: 14 }}>
                      {item.location}
                    </ThemedText>
                  </ThemedView>

                <ThemedView className="flex-row justify-center flex-wrap gap-2 my-1">
                  <ThemedView 
                    className={`px-2 py-1 rounded-lg border ${
                      isDark 
                        ? "bg-violet-500/20 border-violet-500/30" 
                        : "bg-violet-100 border-violet-200"
                    }`}
                  >
                    <ThemedText 
                      style={{ 
                        color: isDark ? 'rgba(196, 181, 253, 1)' : 'rgba(109, 40, 217, 1)', 
                        fontWeight: '600', 
                        fontSize: 9
                      }}
                    >
                      AI MANAGED
                    </ThemedText>
                  </ThemedView>
                  <ThemedView 
                    className={`px-2 py-1 rounded-lg border ${
                      isDark 
                        ? "bg-blue-500/20 border-blue-500/30" 
                        : "bg-blue-100 border-blue-200"
                    }`}
                  >
                    <ThemedText 
                      style={{ 
                        color: isDark ? 'rgba(147, 197, 253, 1)' : 'rgba(29, 78, 216, 1)', 
                        fontWeight: '600', 
                        fontSize: 9 
                      }}
                    >
                      NEURAL CONTROLS
                    </ThemedText>
                  </ThemedView>
                
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

                {/* Neighborhood info - INNOVATION 4 */}
                {renderNeighborhoodInfo(item)}

                {/* Smart Tags with enhanced styling */}
         

                {/* Personalized AI Recommendation */}
                {/* {renderPersonalizedRecommendation(item.aiRecommendation)} */}

                {/* Review summary with enhanced styling */}
                <ThemedView 
                  variant="surfaceVariant"
                  className={`p-2 rounded-xl border ${
                    isDark ? "border-gray-700/30" : "border-gray-200/60"
                  }`}
                  style={{
                    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.15)' : 'rgba(249, 250, 251, 0.8)'
                  }}
                >
                  <ThemedText className="text-base leading-6"
                    style={{ fontSize: 12 }}>
                    {item.review.length > 120 ? `${item.review.substring(0, 120)}...` : item.review}
                  </ThemedText>
                </ThemedView>

                {/* Action Buttons - Enhanced with multiple options */}
                <ThemedView className="flex-row gap-2 mt-1 mb-2">
                  <TouchableOpacity
                    onPress={() => navigateToInfo(item)}
                    className="flex-1 rounded-xl overflow-hidden"
                  >
                    <LinearGradient
                      colors={isDark 
                        ? ['#4338ca', '#3b82f6'] 
                        : ['#2563eb', '#3b82f6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="py-2 items-center"
                    >
                      <ThemedView className="flex-row items-center gap-2"
                        style={{ backgroundColor: "transparent" }}>
                        <ThemedText type ="body" className="text-white text-center font-bold">
                          EXPLORER
                        </ThemedText>
                        <Entypo name="chevron-right" size={18} color="white" />
                      </ThemedView>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {/* Quick actions */}
                  <TouchableOpacity
                    className={`rounded-xl overflow-hidden p-2 border ${
                      isDark ? "border-gray-700/50 bg-gray-800/30" : "border-gray-200/50 bg-gray-50/80"
                    }`}
                  >
                    <MaterialIcons name="share" size={22} color={colors.subtext} />
                  </TouchableOpacity>
                  
                  {item.virtualTourAvailable && (
                    <TouchableOpacity
                      className={`rounded-xl overflow-hidden p-2 border ${
                        isDark ? "border-blue-700/50 bg-blue-800/30" : "border-blue-200/50 bg-blue-50/80"
                      }`}
                    >
                      <MaterialCommunityIcons name="rotate-3d-variant" size={22} color={isDark ? '#93c5fd' : '#2563eb'} />
                    </TouchableOpacity>
                  )}
                </ThemedView>
              </ThemedView>

            </LinearGradient>
          </BlurView>
        </ThemedView>
      </Animatable.View>
    </MotiView>
  );

  // Render list item in grid format
  const renderGridItem = ({ item, index }: { item: ExtendedItemType, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing' }}
      style={{ 
        width: width / 2 - 24, 
        marginLeft: index % 2 === 0 ? 16 : 8,
        marginRight: index % 2 === 0 ? 8 : 16,
        marginBottom: 16 
      }}
    >
      <TouchableOpacity
        onPress={() => navigateToInfo(item)}
        activeOpacity={0.9}
      >
        <ThemedView 
          elevated="medium"
          className="rounded-2xl overflow-hidden"
        >
          <BlurView 
            intensity={isDark ? 20 : 70} 
            tint={isDark ? "dark" : "light"} 
            className={`border rounded-2xl overflow-hidden ${
              isDark ? "border-white/10" : "border-black/5"
            }`}
          >
            {/* Image */}
            <ThemedView className="relative">
              <Image 
                source={item.avatar} 
                style={{ width: '100%', height: 140 }}
                resizeMode="cover" 
              />
              
              {/* Favorite button */}
              <TouchableOpacity 
                className="absolute top-2 right-2 p-2 rounded-full bg-black/30"
                onPress={() => toggleFavorite(item.id)}
              >
                <Ionicons 
                  name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
                  size={16} 
                  color={favorites.includes(item.id) ? "#f43f5e" : "#ffffff"} 
                />
              </TouchableOpacity>
              
              {/* Price */}
              <ThemedView className="absolute bottom-2 right-2">
                <ThemedView 
                  className="px-2 py-1 rounded-lg"
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                  <ThemedText className="text-white font-bold text-xs">
                    {item.price}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              {/* Energy score */}
              <ThemedView className="absolute bottom-2 left-2">
                {renderEnergyScore(item.energyScore)}
              </ThemedView>
            </ThemedView>
            
            {/* Content */}
            <ThemedView className="p-2">
              {/* Location */}
              <ThemedView className="flex-row items-center">
                <MaterialIcons name="location-on" size={12} color={colors.subtext} />
                <ThemedText className="text-xs ml-1 font-medium" numberOfLines={1}>
                  {item.location}
                </ThemedText>
              </ThemedView>
              
              {/* Rating */}
              <ThemedView className="flex-row items-center mt-1">
                <FontAwesome5 name="star" size={10} color="#fcd34d" />
                <ThemedText className="text-xs ml-1 font-bold">
                  {item.stars}
                </ThemedText>
              </ThemedView>
              
              {/* Features */}
              <ThemedView className="flex-row mt-2 gap-1">
                {item.features.slice(0, 3).map((feature, idx) => (
                  <ThemedView 
                    key={idx} 
                    className="p-1 rounded-md"
                    style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(243, 244, 246, 0.8)' }}
                  >
                    <FontAwesome5 name={feature.icon} size={8} color={colors.subtext} />
                  </ThemedView>
                ))}
              </ThemedView>
              
              {/* Availability */}
              <ThemedView className="mt-2 flex-row justify-between items-center">
                <ThemedView className="flex-row items-center">
                  <ThemedView 
                    className="h-1.5 w-1.5 rounded-full mr-1"
                    style={{ backgroundColor: item.availibility === "available" ? '#34d399' : '#ef4444' }}
                  />
                  <ThemedText 
                    style={{ 
                      color: item.availibility === "available" ? '#34d399' : '#ef4444',
                      fontSize: 10,
                      fontWeight: '500'
                    }}
                  >
                    {item.availibility === "available" ? "Disponible" : "Indisponible"}
                  </ThemedText>
                </ThemedView>
                
                {/* Virtual tour badge mini */}
                {item.virtualTourAvailable && (
                  <ThemedView className="p-1 rounded-md bg-blue-500/20">
                    <MaterialCommunityIcons name="rotate-3d-variant" size={10} color={isDark ? '#93c5fd' : '#1e40af'} />
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
          </BlurView>
        </ThemedView>
      </TouchableOpacity>
    </MotiView>
  );

  // Filter modal
  const renderFilterModal = () => {
    if (!filterModalVisible) return null;
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 40,
          transform: [
            { translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [300, 0]
            })}
          ]
        }}
      >
        <BlurView 
          intensity={isDark ? 40 : 80}
          tint={isDark ? "dark" : "light"}
          className="rounded-t-3xl overflow-hidden border-t border-x"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <ThemedView className="p-2">
            <ThemedView className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-xl font-bold">Filtres</ThemedText>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                className="p-2"
              >
                <AntDesign name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </ThemedView>
            
            {/* Price Range */}
            <ThemedView className="mb-4">
              <ThemedText className="text-base font-semibold mb-2">Prix</ThemedText>
              <ThemedView className="h-2 bg-gray-300 rounded-full">
                <ThemedView 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: '60%', 
                    backgroundColor: isDark ? '#3b82f6' : '#2563eb'
                  }} 
                />
              </ThemedView>
              <ThemedView className="flex-row justify-between mt-1">
                <ThemedText className="text-xs">$0</ThemedText>
                <ThemedText className="text-xs">$5,000,000</ThemedText>
              </ThemedView>
            </ThemedView>
            
            {/* Property Type */}
            <ThemedView className="mb-4">
              <ThemedText className="text-base font-semibold mb-2">Type de propriété</ThemedText>
              <ThemedView className="flex-row flex-wrap gap-2">
                {['Maison', 'Appartement', 'Villa', 'Terrain'].map((type, idx) => (
                  <TouchableOpacity 
                    key={idx}
                    className={`px-3 py-2 rounded-lg border ${
                      idx === 0 ? 
                        (isDark ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-100 border-blue-200') :
                        (isDark ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white/70 border-gray-200/60')
                    }`}
                  >
                    <ThemedText 
                      style={{ 
                        color: idx === 0 ? 
                          (isDark ? '#93c5fd' : '#2563eb') : colors.text,
                        fontWeight: idx === 0 ? '600' : '400'
                      }}
                    >
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>
            
            {/* Bedrooms */}
            <ThemedView className="mb-4">
              <ThemedText className="text-base font-semibold mb-2">Chambres</ThemedText>
              <ThemedView className="flex-row gap-2">
                {[1, 2, 3, 4, '5+'].map((num, idx) => (
                  <TouchableOpacity 
                    key={idx}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                      idx === 1 ? 
                        (isDark ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-100 border-blue-200') :
                        (isDark ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white/70 border-gray-200/60')
                    }`}
                  >
                    <ThemedText 
                      style={{ 
                        color: idx === 1 ? 
                          (isDark ? '#93c5fd' : '#2563eb') : colors.text,
                        fontWeight: idx === 1 ? '600' : '400'
                      }}
                    >
                      {num}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>
            
            {/* Amenities */}
            <ThemedView className="mb-4">
              <ThemedText className="text-base font-semibold mb-2">Équipements</ThemedText>
              <ThemedView className="flex-row flex-wrap gap-2">
                {['Piscine', 'Parking', 'Jardin', 'Sécurité', 'Wi-Fi', 'Climatisation'].map((amenity, idx) => (
                  <TouchableOpacity 
                    key={idx}
                    className={`px-3 py-2 rounded-lg border flex-row items-center gap-1 ${
                      [0, 2, 5].includes(idx) ? 
                        (isDark ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-100 border-blue-200') :
                        (isDark ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white/70 border-gray-200/60')
                    }`}
                  >
                    <FontAwesome5 
                      name={
                        idx === 0 ? 'swimming-pool' : 
                        idx === 1 ? 'parking' : 
                        idx === 2 ? 'tree' : 
                        idx === 3 ? 'shield-alt' : 
                        idx === 4 ? 'wifi' : 'snowflake'
                      } 
                      size={14} 
                      color={[0, 2, 5].includes(idx) ? 
                        (isDark ? '#93c5fd' : '#2563eb') : colors.subtext
                      } 
                    />
                    <ThemedText 
                      style={{ 
                        color: [0, 2, 5].includes(idx) ? 
                          (isDark ? '#93c5fd' : '#2563eb') : colors.text,
                        fontWeight: [0, 2, 5].includes(idx) ? '600' : '400'
                      }}
                    >
                      {amenity}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>
            
            {/* Action Buttons */}
            <ThemedView className="flex-row gap-3 mt-4">
              <TouchableOpacity 
                className="flex-1 py-3 border rounded-xl"
                style={{ 
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                }}
                onPress={() => setFilterModalVisible(false)}
              >
                <ThemedText className="text-center font-semibold">Réinitialiser</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? '#3b82f6' : '#2563eb'
                }}
                onPress={() => setFilterModalVisible(false)}
              >
                <ThemedText className="text-center font-semibold text-white">Appliquer</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <ThemedView variant="default" className="flex">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={colors.background}
        className="flex"
      >
        {/* Header Component */}
        {renderHeader()}
        
        {/* Main Content */}
        <Animated.View 
          style={{ 
            // flex: 1,
            opacity: fadeAnim,
          }}
        >
          {viewType === "list" ? (
            <Animated.FlatList
              data={extendedData}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 120, paddingBottom: 30 }}
              ListHeaderComponent={
                <>
                  {renderCategoryTabs()}
                  {renderAIRecommendation()}
                </>
              }
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
            />
          ) : (
            <Animated.FlatList
              data={extendedData}
              keyExtractor={(item) => item.id}
              renderItem={renderGridItem}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              contentContainerStyle={{ paddingTop: 120, paddingBottom: 30 }}
              ListHeaderComponent={
                <>
                  {renderCategoryTabs()}
                  {renderAIRecommendation()}
                </>
              }
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
            />
          )}
        </Animated.View>
        
        {/* Filter Modal */}
        {renderFilterModal()}
        
        {/* Bottom Navigation Bar */}
        <BlurView
          intensity={isDark ? 40 : 80}
          tint={isDark ? "dark" : "light"}
          className="absolute bottom-0 left-0 right-0 border-t"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <ThemedView className="flex-row justify-around py-4" style={{ backgroundColor: 'transparent' }}>
            <TouchableOpacity className="items-center">
              <MaterialIcons name="home" size={24} color={isDark ? '#3b82f6' : '#2563eb'} />
              <ThemedText style={{ fontSize: 12, color: isDark ? '#3b82f6' : '#2563eb', marginTop: 2 }}>Accueil</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <MaterialIcons name="search" size={24} color={colors.subtext} />
              <ThemedText style={{ fontSize: 12, color: colors.subtext, marginTop: 2 }}>Recherche</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <MaterialIcons name="favorite-border" size={24} color={colors.subtext} />
              <ThemedText style={{ fontSize: 12, color: colors.subtext, marginTop: 2 }}>Favoris</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <MaterialIcons name="person-outline" size={24} color={colors.subtext} />
              <ThemedText style={{ fontSize: 12, color: colors.subtext, marginTop: 2 }}>Profil</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </BlurView>
      </LinearGradient>
    </ThemedView>
  );
};

export default RenHouseAcceuil;