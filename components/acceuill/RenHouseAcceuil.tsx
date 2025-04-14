import React, { useState, useEffect, useRef, useCallback } from "react";
import { Image, TouchableOpacity, Dimensions, Animated, StatusBar, View } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, Entypo, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { SharedElement } from "react-navigation-shared-element";
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
  energyScore?: number; // Nouvelle propriété pour un score d'efficacité énergétique
  futuristicTags?: string[]; // Tags futuristes pour la propriété
  holographicModel?: boolean; // Si un modèle holographique est disponible
}

// Données des caractéristiques enrichies avec des icônes futuristes
const getFeaturesByLocation = (location: string): FeatureIcon[] => {
  switch (location) {
    case "Florida":
      return [
        { icon: "wifi", name: "Ultra-WiFi" },
        { icon: "snowflake", name: "Nano-Climat" },
        { icon: "umbrella-beach", name: "HydroVue" }
      ];
    case "Texas":
      return [
        { icon: "wifi", name: "QuantumNet" },
        { icon: "robot", name: "NeuroAssist" },
        { icon: "horse", name: "BioSpace" }
      ];
    case "New York City":
      return [
        { icon: "wifi", name: "MegaConnect" },
        { icon: "subway", name: "HyperTransit" },
        { icon: "city", name: "UrbanNexus" }
      ];
    case "California":
      return [
        { icon: "wifi", name: "SolarNet" },
        { icon: "mountain", name: "PanoVistaa" },
        { icon: "tree", name: "EcoSphere" }
      ];
    default:
      return [
        { icon: "wifi", name: "SmartMesh" },
        { icon: "home", name: "NeoComfort" }
      ];
  }
};

// Nouvelles données futuristes
const futuristicTags = [
  ["HOLO-READY", "QUANTUM SECURED", "BIO-ADAPTIVE"],
  ["NEURO-LINKED", "SOLAR FUSION", "CLIMATE POSITIVE"],
  ["AR IMMERSION", "NANO-MATERIALS", "SELF-SUFFICIENT"],
  ["SMART MATRIX", "CRYO-ENABLED", "GRAVITY OPTIMIZED"]
];

// Extend data with futuristic elements
const extendedData: ExtendedItemType[] = data.map((item, index) => ({
  ...item,
  features: getFeaturesByLocation(item.location),
  energyScore: Math.floor(80 + Math.random() * 20), // Score entre 80 et 99
  futuristicTags: futuristicTags[index % futuristicTags.length],
  holographicModel: Math.random() > 0.3 // 70% de chances d'avoir un modèle holographique
}));

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = height * 0.75; // Carte plus haute pour un effet plus impressionnant

const RenHouseAcceuil = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Use theme hooks
  const colors = useThemeColors();
  const isDark = useDarkMode();
  const { toggleTheme } = useThemeControls();
  
  // Animation references
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animations complexes
  const startComplexAnimations = useCallback(() => {
    // Animation de pulsation
    Animated.loop(
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
      ])
    ).start();

    // Animation de rotation pour les éléments 3D
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true
      })
    ).start();

    // Animation de scale pour les effets de hover
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [pulseAnim, rotateAnim, scaleAnim]);
  
  useEffect(() => {
    startComplexAnimations();
    
    // Effet d'entrée
    setTimeout(() => {
      setShowAnimation(true);
    }, 500);
    
    return () => {
      // Cleanup animations
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
    };
  }, [startComplexAnimations]);
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const navigateToInfo = (item: ExtendedItemType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: "/info/[infoId]",
      params: { 
        id: item.id
      }
    });
  };

  const toggleFavorite = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  // Nouveau rendu des éléments avec effet magnétique
  const renderItem = ({ item, index }: { item: ExtendedItemType, index: number }) => {
    // Couleurs dynamiques basées sur l'indice pour une variété visuelle
    const dynamicColors = [
      ['#4f46e5', '#7c3aed'], // Indigo à Violet
      ['#0891b2', '#0ea5e9'], // Cyan à Sky
      ['#059669', '#10b981'], // Emerald à Green
      ['#c026d3', '#db2777']  // Fuchsia à Pink
    ];
    
    const colorPair = dynamicColors[index % dynamicColors.length];
    
    return (
      <AnimatePresence>
        <MotiView
          from={{ opacity: 0, translateY: 100, scale: 0.8 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ 
            type: 'timing', 
            duration: 800,
            delay: index * 150,
            overshootClamping: true
          }}
          style={{ marginBottom: 24, paddingHorizontal: 16 }}
        >
          <Animated.View
            style={{
              transform: [{ scale: index % 2 === 0 ? scaleAnim : 1 }]
            }}
          >
            <ThemedView 
              elevated="high"
              className="rounded-3xl overflow-hidden"
              style={{ height: ITEM_HEIGHT }}
            >
              <BlurView 
                intensity={isDark ? 30 : 80} 
                tint={isDark ? "dark" : "light"} 
                className="border rounded-3xl overflow-hidden border-white/20"
              >
                <LinearGradient
                  colors={isDark 
                    ? ['rgba(15,23,42,0.7)', 'rgba(30,41,59,0.8)']
                    : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.95)']}
                  className="overflow-hidden h-full"
                >
                  {/* Section image avec effet holographique */}
                  <ThemedView className="relative">
                    <SharedElement id={`item.${item?.id}.image`}>
                      <Image 
                        source={item?.avatar} 
                        className="w-full h-96" 
                        resizeMode="cover" 
                      />
                    </SharedElement>
                    
                    {/* Overlay holographique */}
                    <LinearGradient
                      colors={isDark 
                        ? ["transparent", `rgba(${colorPair[0].replace('#', '')},0.2)`, `rgba(${colorPair[1].replace('#', '')},0.4)`]
                        : ["transparent", `rgba(${colorPair[0].replace('#', '')},0.1)`, `rgba(${colorPair[1].replace('#', '')},0.2)`]
                      }
                      className="absolute bottom-0 left-0 right-0 h-full"
                    />
                    
                    {/* Grille futuriste sur l'image */}
                    <ThemedView className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                      <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ type: 'timing', duration: 1000 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.2)',
                          borderRadius: 24,
                        }}
                      >
                        {Array.from({ length: 10 }).map((_, i) => (
                          <View 
                            key={`grid-h-${i}`} 
                            style={{ 
                              position: 'absolute', 
                              left: 0, 
                              right: 0, 
                              height: 1, 
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              top: (i + 1) * (ITEM_HEIGHT / 10)
                            }} 
                          />
                        ))}
                        {Array.from({ length: 5 }).map((_, i) => (
                          <View 
                            key={`grid-v-${i}`} 
                            style={{ 
                              position: 'absolute', 
                              top: 0, 
                              bottom: 0, 
                              width: 1, 
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              left: (i + 1) * (width / 5)
                            }} 
                          />
                        ))}
                      </MotiView>
                    </ThemedView>
                    
                    {/* Indicateur de statut avec animation pulse */}
                    <ThemedView 
                      className="absolute top-4 left-4 right-4 flex-row justify-between items-center"
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <MotiView
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', delay: 300 }}
                        className="flex-row items-center gap-2"
                      >
                        <LinearGradient
                          colors={item.availibility === "available" 
                            ? ['rgba(16, 185, 129, 0.7)', 'rgba(5, 150, 105, 0.9)']
                            : ['rgba(239, 68, 68, 0.7)', 'rgba(220, 38, 38, 0.9)']}
                          className="px-4 py-2 rounded-full flex-row items-center gap-2"
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <ThemedView 
                            className="h-3 w-3 rounded-full relative"
                            style={{ backgroundColor: item?.availibility === "available" ? '#34d399' : '#ef4444' }}
                          >
                            {item?.availibility === "available" && (
                              <Animated.View 
                                className="absolute h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: 'rgba(52, 211, 153, 0.5)',
                                  transform: [{ scale: pulseAnim }]
                                }}
                              />
                            )}
                          </ThemedView>
                          <ThemedText 
                            style={{ 
                              fontWeight: '600',
                              color: '#ffffff',
                              fontSize: 12,
                              letterSpacing: 0.5,
                              textTransform: 'uppercase'
                            }}
                          >
                            {item?.availibility === "available" ? "Available Now" : "Reserved"}
                          </ThemedText>
                        </LinearGradient>
                        
                        {/* Indicateur holographique */}
                        {item?.holographicModel && (
                          <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 500 }}
                          >
                            <LinearGradient
                              colors={isDark 
                                ? ['rgba(139, 92, 246, 0.7)', 'rgba(124, 58, 237, 0.9)']
                                : ['rgba(167, 139, 250, 0.7)', 'rgba(139, 92, 246, 0.9)']}
                              className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
                            >
                              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <Feather name="box" size={12} color="#ffffff" />
                              </Animated.View>
                              <ThemedText style={{ color: '#ffffff', fontSize: 10, fontWeight: '600' }}>
                                3D TOUR
                              </ThemedText>
                            </LinearGradient>
                          </MotiView>
                        )}
                      </MotiView>
                      
                      {/* Bouton favoris avec effet tactile avancé */}
                      <TouchableOpacity 
                        onPress={() => toggleFavorite(item.id)}
                        className={`p-3 rounded-full`}
                        style={{
                          backgroundColor: favorites.includes(item.id) 
                            ? 'rgba(239, 68, 68, 0.2)' 
                            : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                          borderWidth: 1,
                          borderColor: favorites.includes(item.id) 
                            ? 'rgba(239, 68, 68, 0.5)'
                            : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        <Animatable.View
                          animation={favorites.includes(item.id) ? "pulse" : undefined}
                          iterationCount={favorites.includes(item.id) ? 1 : undefined}
                          duration={500}
                        >
                          <Ionicons 
                            name={favorites.includes(item?.id) ? "heart" : "heart-outline"} 
                            size={22} 
                            color={favorites.includes(item?.id) ? "#f43f5e" : isDark ? "#ffffff" : "#3b82f6"} 
                          />
                        </Animatable.View>
                      </TouchableOpacity>
                    </ThemedView>

                    {/* Score d'énergie */}
                    <ThemedView className="absolute top-16 left-4">
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 0.9)']}
                        className="px-3 py-1.5 rounded-xl"
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <ThemedView className="flex-row items-center gap-1.5">
                          <FontAwesome5 name="leaf" size={12} color="#ffffff" />
                          <ThemedText className="text-white font-bold text-xs">
                            ENERGY {item?.energyScore}%
                          </ThemedText>
                        </ThemedView>
                      </LinearGradient>
                    </ThemedView>

                    {/* Étiquettes de prix futuristes */}
                    <ThemedView className="absolute bottom-4 right-4">
                      <LinearGradient
                        colors={[colorPair[0], colorPair[1]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="px-4 py-2 rounded-xl"
                      >
                        <MotiText
                          from={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            loop: true,
                            repeatReverse: true,
                            duration: 2000,
                            type: 'timing'
                          }}
                          style={{
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: 18,
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2
                          }}
                        >
                          {item?.price}
                        </MotiText>
                      </LinearGradient>
                    </ThemedView>

                    {/* Icônes de caractéristiques flottantes */}
                    <ThemedView className="absolute bottom-5 left-4 flex-row gap-2">
                      {item?.features?.map((feature, idx) => (
                        <MotiView
                          key={idx}
                          from={{ opacity: 0, translateY: 10 }}
                          animate={{ opacity: 1, translateY: 0 }}
                          transition={{ delay: 200 + (idx * 100), type: 'timing' }}
                        >
                          <LinearGradient
                            colors={[
                              isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                              isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)'
                            ]}
                            className="p-2 rounded-lg"
                            style={{
                              borderWidth: 1,
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
                              <FontAwesome5 
                                name={feature?.icon} 
                                size={18} 
                                color={isDark ? "#e2e8f0" : "#1e40af"} 
                              />
                            </Animatable.View>
                          </LinearGradient>
                        </MotiView>
                      ))}
                    </ThemedView>
                  </ThemedView>

                  {/* Section de contenu avec glassmorphism */}
                  <ThemedView className="p-4 gap-3">
                    {/* Titre et localisation avec style futuriste */}
                    <MotiView
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: 300, type: 'timing' }}
                    >
                      <ThemedText 
                        className="text-2xl font-bold mb-1"
                        style={{ 
                          color: isDark ? "#ffffff" : "#1e293b",
                          textShadowColor: 'rgba(0, 0, 0, 0.1)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2
                        }}
                      >
                        {item?.name}
                      </ThemedText>
                      
                      <ThemedView className="flex-row justify-between items-center">
                        <ThemedView className="flex-row items-center gap-2">
                          <MaterialIcons name="location-on" size={16} color={colorPair[0]} />
                          <ThemedText 
                            style={{ 
                              fontSize: 14,
                              color: isDark ? "#d1d5db" : "#475569",
                            }}
                          >
                            {item?.location}
                          </ThemedText>
                        </ThemedView>
                        
                        <ThemedView className="flex-row items-center gap-1 px-3 py-1 rounded-lg border border-yellow-400/30 bg-yellow-400/10">
                          <FontAwesome5 name="star" size={14} color="#fbbf24" />
                          <ThemedText className="text-base font-bold" style={{ color: "#fbbf24" }}>
                            {item?.stars}
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </MotiView>

                    {/* Tags futuristes */}
                    <MotiView
                      from={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 400, type: 'timing' }}
                      className="flex-row justify-center flex-wrap gap-2 py-2"
                    >
                      {item?.futuristicTags?.map((tag, idx) => (
                        <Animated.View
                          key={idx}
                          style={{ 
                            transform: [{ scale: idx === 0 ? scaleAnim : 1 }]
                          }}
                        >
                          <LinearGradient
                            colors={idx === 0 
                              ? [colorPair[0], colorPair[1]] 
                              : isDark 
                                ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                                : ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                            className="px-3 py-1.5 rounded-lg"
                            style={{
                              borderWidth: 1,
                              borderColor: idx === 0 
                                ? colorPair[0].replace(')', ', 0.5)').replace('rgb', 'rgba')
                                : isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(203, 213, 225, 0.8)',
                            }}
                          >
                            <ThemedText 
                              style={{ 
                                color: idx === 0 ? '#ffffff' : isDark ? '#e2e8f0' : '#334155',
                                fontWeight: '600',
                                fontSize: 11,
                                letterSpacing: 0.5
                              }}
                            >
                              {tag}
                            </ThemedText>
                          </LinearGradient>
                        </Animated.View>
                      ))}
                    </MotiView>

                    {/* Description en glassmorphism */}
                    <MotiView
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: 500, type: 'timing' }}
                    >
                      <BlurView
                        intensity={isDark ? 40 : 60}
                        tint={isDark ? "dark" : "light"}
                        className="rounded-xl overflow-hidden border"
                        style={{
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.5)',
                        }}
                      >
                        <ThemedView className="p-3">
                          <ThemedText 
                            className="leading-5"
                            style={{ 
                              fontSize: 13,
                              color: isDark ? "#d1d5db" : "#334155",
                            }}
                          >
                            {item?.review.length > 130 ? `${item?.review.substring(0, 130)}...` : item?.review}
                          </ThemedText>
                        </ThemedView>
                      </BlurView>
                    </MotiView>

                    {/* Bouton d'action avec animation */}
                    <MotiView
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 600, type: 'spring' }}
                      className="mt-2"
                    >
                      <TouchableOpacity
                        onPress={() => navigateToInfo(item)}
                        activeOpacity={0.8}
                        className="rounded-xl overflow-hidden"
                      >
                        <LinearGradient
                          colors={[colorPair[0], colorPair[1]]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="py-3 items-center"
                        >
                          <ThemedView 
                            className="flex-row items-center gap-3"
                            style={{ backgroundColor: "transparent" }}
                          >
                            <ThemedText 
                              className="text-white text-center font-bold"
                              style={{
                                fontSize: 16,
                                letterSpacing: 1,
                                textTransform: 'uppercase'
                              }}
                            >
                              EXPLORE NEXUS
                            </ThemedText>
                            <Feather name="arrow-right" size={18} color="white" />
                          </ThemedView>
                        </LinearGradient>
                      </TouchableOpacity>
                    </MotiView>
                  </ThemedView>
                </LinearGradient>
              </BlurView>
            </ThemedView>
          </Animated.View>
        </MotiView>
      </AnimatePresence>
    );
  };

  // Animation d'entrée pour la liste
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <ThemedView variant="default" className="flex">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      {/* Fond avec motif de grille légère */}
      <ThemedView 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0,
          bottom: 0,
          opacity: 0.4
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View 
            key={`bg-grid-h-${i}`} 
            style={{ 
              position: 'absolute', 
              left: 0, 
              right: 0, 
              height: 1, 
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              top: i * (height / 20)
            }} 
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <View 
            key={`bg-grid-v-${i}`} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              width: 1, 
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              left: i * (width / 10)
            }} 
          />
        ))}
      </ThemedView>
      
      <LinearGradient
        colors={isDark 
          ? ['#0f172a', '#1e293b'] 
          : ['#f8fafc', '#f1f5f9']}
        className="flex"
      >
        {/* Animation d'initialisation */}
        {showAnimation && (
          <MotiView
            from={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ type: 'timing', duration: 1000 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
          >
            
              <LinearGradient
              colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <LottieView
                source={require('@/assets/animations/house-scan.json')}
                autoPlay
                loop={false}
                style={{ width: 200, height: 200 }}
              />
            </LinearGradient>
          </MotiView>
        )}

        {/* Header avec titre et boutons d'action */}
        <ThemedView className="pt-12 pb-4 px-4 flex-row justify-between items-center">
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <ThemedText className="text-3xl font-bold">
              NEXUS<ThemedText className="text-blue-500">HOME</ThemedText>
            </ThemedText>
          </MotiView>
          
          <ThemedView className="flex-row gap-3">
            <TouchableOpacity 
              onPress={toggleTheme}
              className="p-2 rounded-full"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <Ionicons 
                name={isDark ? "sunny-outline" : "moon-outline"} 
                size={24} 
                color={isDark ? "#ffffff" : "#0f172a"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="p-2 rounded-full"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={isDark ? "#ffffff" : "#0f172a"} 
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
        
        {/* Filtres de catégories */}
        <ThemedView className="px-4 pb-4">
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 200, type: 'timing' }}
          >
            <ThemedScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20, gap: 10 }}
            >
              {['All', 'Premium', 'Sustainable', 'Smart', 'Urban'].map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => {
                    setSelectedCategory(category);
                    Haptics.selectionAsync();
                  }}
                  className="py-2 px-4 rounded-xl mr-2"
                  style={{
                    backgroundColor: selectedCategory === category 
                      ? isDark ? '#3b82f6' : '#2563eb'
                      : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 1,
                    borderColor: selectedCategory === category 
                      ? isDark ? '#60a5fa' : '#3b82f6'
                      : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <ThemedText 
                    style={{ 
                      color: selectedCategory === category ? '#ffffff' : isDark ? '#e5e7eb' : '#334155',
                      fontWeight: selectedCategory === category ? '600' : '400'
                    }}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedScrollView>
          </MotiView>
        </ThemedView>
        
        {/* Liste principale des propriétés */}
        <Animated.View style={{ opacity: animatedOpacity, flex: 1 }}>
          <Animated.FlatList
            data={extendedData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
          />
        </Animated.View>
        
        {/* Menu de navigation inférieur */}
        <ThemedView className="absolute bottom-0 left-0 right-0">
          <BlurView 
            intensity={isDark ? 40 : 60} 
            tint={isDark ? "dark" : "light"}
            className="overflow-hidden border-t"
            style={{ 
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.5)'
            }}
          >
            <ThemedView className="py-4 px-6 flex-row justify-around items-center">
              {[
                { icon: "home", name: "Home" },
                { icon: "search", name: "Search" },
                { icon: "map", name: "Map" },
                { icon: "user", name: "Profile" }
              ].map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  className="items-center"
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: index === 0 ? scaleAnim : 1 }]
                    }}
                  >
                    <ThemedView 
                      className="p-2 rounded-full mb-1"
                      style={{ 
                        backgroundColor: index === 0 
                          ? isDark ? '#3b82f6' : '#2563eb'
                          : 'transparent' 
                      }}
                    >
                      <Feather 
                        name={item?.icon} 
                        size={20} 
                        color={index === 0 
                          ? '#ffffff' 
                          : isDark ? '#d1d5db' : '#64748b'
                        } 
                      />
                    </ThemedView>
                  </Animated.View>
                  <ThemedText 
                    className="text-xs"
                    style={{ 
                      color: index === 0 
                        ? isDark ? '#3b82f6' : '#2563eb'
                        : isDark ? '#d1d5db' : '#64748b',
                      fontWeight: index === 0 ? '500' : '400'
                    }}
                  >
                    {item?.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </BlurView>
        </ThemedView>
      </LinearGradient>
    </ThemedView>
  );
};

export default RenHouseAcceuil;