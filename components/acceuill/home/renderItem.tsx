
import React, { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Image, TouchableOpacity, Animated, Dimensions} from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView, MotiText } from "moti";
import * as Animatable from "react-native-animatable";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import renderEnergyScore from "./renderEnergieScore";
import RenderNeighborhoodInfo from "./renderNeighborhoodInfo";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { MutableRefObject } from "react";
import toggleFavorite from "@/components/utils/homeUtils/toggleFavorite";
import { useTheme } from "@/components/contexts/theme/themehook";

const { width } = Dimensions.get('window');

interface ExtendedItemType extends ItemType {
  features: FeatureIcon[];
  energyScore: number;
  virtualTourAvailable: boolean;
  distanceToAmenities: {
    schools: number;
    healthcare: number;
    shopping: number;
    transport: number;
  };
  aiRecommendation: string;
  review: string;
}

type Props = {
  item: ExtendedItemType;
  index: number;
  lottieRef: MutableRefObject<any>;
  setAnimatingElement: (id: string | null) => void;
  favorites: string[];
  animatingElement: string | null;
  navigateToInfo: (item: ExtendedItemType) => void;
};

const RenderItem: React.FC<Props> = ({
  item,
  index,
  lottieRef,
  favorites,
  animatingElement,
  setAnimatingElement,
  navigateToInfo
}) => {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Animations avancées
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;
  
  // Animation de pulsation sophistiquée
  const pulseAnim = useMemo(() => {
    const anim = new Animated.Value(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    return anim;
  }, []);

  // Animation de shimmer
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Animation de respiration
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.02,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Animation de lueur
  useEffect(() => {
    if (item.availibility === "available") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [item.availibility]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPressed(true);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPressed(false);
      navigateToInfo(item);
    });
  }, [item, navigateToInfo, scaleAnim]);

  const handleToggleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    toggleFavorite(item.id);
    setAnimatingElement(item.id);
  }, [item.id, setAnimatingElement, rotateAnim]);

  // Badge de statut ultra-moderne
  const StatusBadge = useMemo(() => (
    <MotiView
      from={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 200 }}
    >
      <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
        <BlurView intensity={30} tint="light" className="rounded-full overflow-hidden">
          <LinearGradient
            colors={
              item.availibility === "available"
                ? ['rgba(52, 211, 153, 0.9)', 'rgba(16, 185, 129, 0.9)']
                : ['rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 0.9)']
            }
            className="px-3 py-2 flex-row items-center gap-2"
          >
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 300, type: "spring" }}
            >
              <ThemedView
                className="h-2 w-2 rounded-full relative"
                style={{
                  backgroundColor: "#ffffff",
                  shadowColor: item.availibility === "available" ? "#34d399" : "#ef4444",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 8,
                }}
              >
                {item.availibility === "available" && (
                  <Animated.View
                    className="absolute h-4 w-4 rounded-full"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.3)',
                      transform: [{ scale: pulseAnim }],
                      top: -4,
                      left: -4,
                    }}
                  />
                )}
              </ThemedView>
            </MotiView>
            <MotiText
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 400 }}
              style={{
                fontWeight: "700",
                color: "#ffffff",
                fontSize: 11,
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {item.availibility === "available" ? "DISPONIBLE" : "RÉSERVÉ"}
            </MotiText>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </MotiView>
  ), [item.availibility, pulseAnim, breatheAnim]);

  // Features avec style moderne minimaliste
  const Features = useMemo(() => (
    <ThemedView className="flex-row gap-2 mt-2">
      {item.features?.slice(0, 3).map((feature, idx) => (
        <MotiView
          key={idx}
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: idx * 100 + 400, 
            type: "spring",
            damping: 15,
            stiffness: 200
          }}
        >
          <ThemedView
            className="px-2 py-1 rounded-lg flex-row items-center gap-1"
            style={{
              backgroundColor: 'rgba(156, 163, 175, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(156, 163, 175, 0.2)',
            }}
          >
            <FontAwesome5
              name={feature.icon}
              size={12}
              color={theme.subtext}
            />
            <ThemedText
              style={{
                fontSize: 10,
                fontWeight: "500",
                color: theme.subtext,
              }}
            >
              {feature.name || feature.icon}
            </ThemedText>
          </ThemedView>
        </MotiView>
      ))}
    </ThemedView>
  ), [item.features, theme.subtext]);

  // Badges AI avec effet néon
  const AiBadges = useMemo(() => (
    <ThemedView className="flex-row justify-center flex-wrap gap-2 my-2">
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 600, type: "spring" }}
      >
        <BlurView intensity={40} tint="dark" className="rounded-lg overflow-hidden">
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.3)', 'rgba(124, 58, 237, 0.2)']}
            className="px-3 py-1 border border-violet-400/30"
          >
            <ThemedText
              style={{
                fontWeight: "800",
                fontSize: 9,
                color: "#a78bfa",
                textShadowColor: 'rgba(139, 92, 246, 0.5)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
            >
              ✨ IA OPTIMISÉ
            </ThemedText>
          </LinearGradient>
        </BlurView>
      </MotiView>

      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 700, type: "spring" }}
      >
        <BlurView intensity={40} tint="dark" className="rounded-lg overflow-hidden">
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.3)', 'rgba(21, 128, 61, 0.2)']}
            className="px-3 py-1 border border-green-400/30"
          >
            <ThemedText
              style={{
                fontWeight: "800",
                fontSize: 9,
                color: "#4ade80",
                textShadowColor: 'rgba(34, 197, 94, 0.5)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
            >
              🚀 SMART TECH
            </ThemedText>
          </LinearGradient>
        </BlurView>
      </MotiView>
    </ThemedView>
  ), []);

  // Boutons d'action ultra-dynamiques
  const ActionButtons = useMemo(() => (
    <ThemedView className="flex-row gap-3 mb-1 px-2 ">
      <TouchableOpacity
        onPress={handlePress}
        className="flex-1 rounded-2xl overflow-hidden"
        accessibilityLabel="Explorer la propriété"
        accessibilityRole="button"
        style={{
          // shadowColor: "#4338ca",
          shadowOffset: { width: 0, height: 8 },
          // shadowOpacity: 0.3,
          // shadowRadius: 16,
          // elevation: 12,
        }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <BlurView intensity={20} tint="light" className="overflow-hidden">
            <LinearGradient
              colors={['#6366f1', '#8b5cf6', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-4 items-center relative"
            >
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#ffffff',
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.1, 0],
                  }),
                  transform: [{
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-width, width],
                    }),
                  }],
                }}
              />
              <ThemedView className="flex-row items-center gap-2 " style={{ backgroundColor: "transparent" }}>
                <MaterialCommunityIcons name="rocket-launch" size={20} color="white" />
                <ThemedText
                  style={{
                    color: 'white',
                    fontWeight: '900',
                    fontSize: 14,
                    textShadowColor: 'rgba(0,0,0,0.3)',
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 4,
                  }}
                >
                  DÉCOUVRIR
                </ThemedText>
                <Entypo name="chevron-right" size={20} color="white" />
              </ThemedView>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
      
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 400, type: "spring" }}
      >
        <TouchableOpacity
          className="rounded-2xl overflow-hidden p-3"
          accessibilityLabel="Partager"
          accessibilityRole="button"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            // shadowColor: "#ffffff",
            // shadowOffset: { width: 0, height: 4 },
            // shadowOpacity: 0.1,
            shadowRadius: 8,
            // elevation: 6,
          }}
        >
          <MaterialIcons name="share" size={24} color="#000" />
        </TouchableOpacity>
      </MotiView>
      
      {item.virtualTourAvailable && (
        <MotiView
          from={{ opacity: 0, scale: 0, rotateY: "90deg" }}
          animate={{ opacity: 1, scale: 1, rotateY: "0deg" }}
          transition={{ delay: 500, type: "spring" }}
        >
          <TouchableOpacity
            className="rounded-2xl overflow-hidden p-3 relative"
            accessibilityLabel="Visite virtuelle VR"
            accessibilityRole="button"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(59, 130, 246, 0.4)',
              // shadowColor: "#3b82f6",
              // shadowOffset: { width: 0, height: 6 },
              // shadowOpacity: 0.3,
              // shadowRadius: 12,
              // elevation: 8,
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale: breatheAnim }]
              }}
            >
              <MaterialCommunityIcons name="virtual-reality" size={24} color="#3b82f6" />
            </Animated.View>
            <ThemedView
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{
                backgroundColor: '#ef4444',
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 4,
              }}
            />
          </TouchableOpacity>
        </MotiView>
      )}
    </ThemedView>
  ), [handlePress, scaleAnim, shimmerAnim, breatheAnim, item.virtualTourAvailable]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 100, scale: 0.8 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ 
        delay: index * 200, 
        type: "spring",
        damping: 20,
        stiffness: 100
      }}
      className="mb-6 px-2"
    >
      <Animatable.View
        animation={animatingElement === item.id ? "pulse" : undefined}
        duration={800}
      >
        <Animated.View
          style={{
            transform: [{ scale: breatheAnim }],
            shadowColor: item.availibility === "available" ? "#34d399" : "#64748b",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.15,
            shadowRadius: 30,
            elevation: 20,
          }}
        >
          <ThemedView className="rounded-3xl overflow-hidden">
            <LinearGradient
              colors={theme.cardGradient}
              className="overflow-hidden relative"
            >
              {/* Effet de lueur animée */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 24,
                  borderWidth: 2,
                  borderColor: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(52, 211, 153, 0)', 'rgba(52, 211, 153, 0.6)'],
                  }),
                  zIndex: 1,
                }}
              />

              {/* Section Image inspirée du design moderne */}
              <ThemedView className="relative overflow-hidden">
                <MotiView
                  from={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: imageLoaded ? 1 : 0 }}
                  transition={{ duration: 800, type: "timing" }}
                  className="relative"
                >
                  <Image
                    source={item.avatar}
                    className="w-full rounded-t-3xl"
                    resizeMode="cover"
                    style={{ height: 220 }}
                    onLoad={() => setImageLoaded(true)}
                  />
                  
                  {/* Overlay subtle pour le contraste */}
                  <LinearGradient
                    colors={[
                      "rgba(0,0,0,0)",
                      "rgba(0,0,0,0.05)",
                      "rgba(0,0,0,0.15)"
                    ]}
                    locations={[0, 0.7, 1]}
                    className="absolute inset-0"
                  />
                </MotiView>

                {/* Badge de statut - Style moderne minimaliste */}
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 300, type: "spring" }}
                  className="absolute top-3 left-3"
                >
                  <BlurView intensity={80} tint="light" className="rounded-full overflow-hidden">
                    <ThemedView
                      className="px-3 py-1.5 flex-row items-center gap-1.5"
                      style={{
                        backgroundColor: item.availibility === "available" 
                          ? 'rgba(34, 197, 94, 0.9)' 
                          : 'rgba(156, 163, 175, 0.9)',
                      }}
                    >
                      <ThemedView
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: "#ffffff",
                        }}
                      />
                      <ThemedText
                        style={{
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: "600",
                          letterSpacing: 0.5,
                        }}
                      >
                        {item.availibility === "available" ? "Active" : "Sold"}
                      </ThemedText>
                    </ThemedView>
                  </BlurView>
                </MotiView>

                {/* Boutons d'action rapide - Style moderne clean */}
                <ThemedView className="absolute bottom-3 left-3 flex-row gap-2">
                  {/* Bouton partager */}
                  <MotiView
                    from={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 400, type: "spring" }}
                  >
                    <TouchableOpacity
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <MaterialIcons name="share" size={18} color="#374151" />
                    </TouchableOpacity>
                  </MotiView>

                  {/* Bouton lien */}
                  <MotiView
                    from={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 450, type: "spring" }}
                  >
                    <TouchableOpacity
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <MaterialIcons name="link" size={18} color="#374151" />
                    </TouchableOpacity>
                  </MotiView>
                </ThemedView>

                {/* Prix - Style épuré en bas à droite */}
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 600, type: "spring" }}
                  className="absolute bottom-4 right-4"
                >
                  <BlurView intensity={95} tint="light" className="rounded-2xl overflow-hidden">
                    <ThemedView
                      className="px-4 py-2"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                    >
                      <ThemedText
                        style={{
                          color: '#111827',
                          fontWeight: '800',
                          fontSize: 18,
                          letterSpacing: -0.5,
                        }}
                      >
                        {item.price}
                      </ThemedText>
                    </ThemedView>
                  </BlurView>
                </MotiView>

                {/* Bouton favori repositionné */}
                <MotiView
                  from={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 500, type: "spring" }}
                  className="absolute top-3 right-3"
                >
                  <TouchableOpacity
                    onPress={handleToggleFavorite}
                    className="w-12 h-12 rounded-full items-center justify-center"
                    accessibilityLabel="Toggle favorite"
                    accessibilityRole="button"
                    style={{
                      backgroundColor: favorites.includes(item.id) 
                        ? 'rgba(239, 68, 68, 0.9)' 
                        : 'rgba(255, 255, 255, 0.9)',
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Animated.View
                      style={{
                        transform: [
                          {
                            scale: rotateAnim.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [1, 1.2, 1],
                            })
                          }
                        ]
                      }}
                    >
                      {favorites.includes(item.id) ? (
                        <Ionicons
                          name="heart"
                          size={24}
                          color="#ffffff"
                        />
                      ) : (
                        <Ionicons
                          name="heart-outline"
                          size={24}
                          color="#374151"
                        />
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                </MotiView>

                {/* Features avec style minimaliste */}
                {item.features && item.features.length > 0 && (
                  <ThemedView className="absolute top-16 left-3">
                    <MotiView
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: 700, type: "spring" }}
                    >
                      <BlurView intensity={60} tint="light" className="rounded-xl overflow-hidden">
                        <ThemedView backgroundColor="elevation"
                          className="px-2 py-1.5 flex-row items-center gap-1"
                          // style={{
                          //   backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          // }}
                        >
                          <FontAwesome5 
                            name={item.features[0]?.icon || "home"} 
                            size={12} 
                            color="#6b7280" 
                          />
                          <ThemedText
                            style={{
                              fontSize: 10,
                              fontWeight: "600",
                              color: "#6b7280",
                              letterSpacing: 0.3,
                            }}
                          >
                            {item.energyScore}/10
                          </ThemedText>
                        </ThemedView>
                      </BlurView>
                    </MotiView>
                  </ThemedView>
                )}
              </ThemedView>

              {/* Section contenu */}
              <ThemedView className="px-5 py-2 gap-1">
                {/* En-tête avec localisation */}
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 300, type: "spring" }}
                  className="flex-row justify-between items-center"
                >
                  <ThemedView className="flex-row items-center gap-2 flex-1">
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color="#ef4444"
                      style={{
                        textShadowColor: 'rgba(239, 68, 68, 0.3)',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 8,
                      }}
                    />
                    <ThemedText
                      className="text-base font-bold flex-1"
                      style={{ fontSize: 16 }}
                    >
                      {item.location}
                    </ThemedText>
                  </ThemedView>

                  <MotiView
                    from={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 400, type: "spring" }}
                  >
                    <BlurView intensity={30} tint="light" className="rounded-xl overflow-hidden">
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.8)']}
                        className="flex-row items-center gap-2 px-3 py-2 border border-yellow-400/30"
                      >
                        <FontAwesome5 name="star" size={16} color="#fcd34d" />
                        <ThemedText className="text-lg font-bold" style={{ color: '#fcd34d' }}>
                          {item.stars}
                        </ThemedText>
                      </LinearGradient>
                    </BlurView>
                  </MotiView>
                </MotiView>

                {/* {AiBadges} */}

                {/* Informations de quartier */}
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 500, type: "spring" }}
                >
                  <RenderNeighborhoodInfo item={item} />
                </MotiView>

                {/* Avis avec style moderne */}
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 600, type: "spring" }}
                >
                  <BlurView intensity={20} tint="light" className="rounded-2xl overflow-hidden">
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      className="p-2 border border-white/10"
                    >
                      <ThemedText
                        className="text-base leading-6"
                        style={{ 
                          fontSize: 13,
                          lineHeight: 20,
                          color: theme.text
                        }}
                      >
                        {item.review?.length > 120 ? `${item.review.substring(0, 120)}...` : item.review}
                      </ThemedText>
                    </LinearGradient>
                  </BlurView>
                </MotiView>

                {/* Boutons d'action */}
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 700, type: "spring" }}
                >
                  {ActionButtons}
                </MotiView>
              </ThemedView>
            </LinearGradient>
          </ThemedView>
        </Animated.View>
      </Animatable.View>
    </MotiView>
  );
};

export default React.memo(RenderItem);