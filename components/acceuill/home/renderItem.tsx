import React, { useMemo, useCallback } from "react";
import { Image, TouchableOpacity, Animated } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import * as Animatable from "react-native-animatable";
import LottieView from "lottie-react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import renderEnergyScore from "./renderEnergieScore";
import renderVirtualTourBadge from "./renderVirtualTourBadge";
import RenderNeighborhoodInfo from "./renderNeighborhoodInfo";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { MutableRefObject } from "react";
import toggleFavorite from "@/components/utils/homeUtils/toggleFavorite";
import { useTheme } from "@/components/contexts/theme/themehook";


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
  
  const pulseAnim = useMemo(() => {
    const anim = new Animated.Value(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    return anim;
  }, []);

  // Function pour gérer le clic sur le bouton favori
  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(item.id);
    setAnimatingElement(item.id);
  }, [item.id, setAnimatingElement]);

  // Statut badge memoized
  const StatusBadge = useMemo(() => (
    <ThemedView
      className="px-2 py-1 rounded-full flex-row items-center gap-2"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
      }}
    >
      <ThemedView
        className="h-2 w-2 rounded-full relative"
        style={{
          backgroundColor:
            item.availibility === "available"
              ? "#34d399"
              : "#ef4444",
        }}
      >
        {item.availibility === "available" && (
          <Animated.View
            className="absolute h-2 w-2 rounded-full bg-green-400/50"
            style={{ transform: [{ scale: pulseAnim }] }}
          />
        )}
      </ThemedView>
      <ThemedText
        style={{
          fontWeight: "600",
          color:
            item.availibility === "available"
              ? "#34d399"
              : "#ef4444",
          fontSize: 10,
        }}
      >
        {item.availibility === "available"
          ? "Disponible"
          : "Indisponible"}
      </ThemedText>
    </ThemedView>
  ), [item.availibility, pulseAnim]);

  // Features memoized
  const Features = useMemo(() => (
    <ThemedView className="absolute bottom-4 left-4 flex-row gap-2">
      {item.features?.map((feature, idx) => (
        <MotiView
          key={idx}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: idx * 100 + 300, type: "spring" }}
        >
          <ThemedView
            className="p-1 rounded-lg border"
          >
            <FontAwesome5
              name={feature.icon}
              size={16}
              color={theme.subtext}
            />
          </ThemedView>
        </MotiView>
      ))}
    </ThemedView>
  ), [item.features, theme.subtext]);

  // Badges AI memoized
  const AiBadges = useMemo(() => (
    <ThemedView className="flex-row justify-center flex-wrap gap-2 my-1">
      <ThemedView
        className={`px-2 py-1 rounded-lg border ${
          
            "bg-violet-500/20 border-violet-500/30"
        }`}
      >
        <ThemedText
          style={{
            fontWeight: "600",
            fontSize: 9,
          }}
        >
          AI MANAGED
        </ThemedText>
      </ThemedView>

      <ThemedView
        className="px-2 py-1 rounded-lg border "
      >
        <ThemedText
          style={{
            fontWeight: "600",
            fontSize: 9,
          }}
        >
          NEURAL CONTROLS
        </ThemedText>
      </ThemedView>
    </ThemedView>
  ), []);

  // Boutons d'action memoized
  const ActionButtons = useMemo(() => (
    <ThemedView className="flex-row gap-2 mt-1 mb-2">
      <TouchableOpacity
        onPress={() => navigateToInfo(item)}
        className="flex-1 rounded-xl overflow-hidden"
        accessibilityLabel="Explorer la propriété"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={['#4338ca', '#3b82f6'] }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="py-2 items-center"
        >
          <ThemedView className="flex-row items-center gap-2"
            style={{ backgroundColor: "transparent" }}>
            <ThemedText type="body" className="text-white text-center font-bold">
              EXPLORER
            </ThemedText>
            <Entypo name="chevron-right" size={18} color="white" />
          </ThemedView>
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Quick actions */}
      <TouchableOpacity
        className={`rounded-xl overflow-hidden p-2 border ${
          "border-gray-700/50 bg-gray-800/30" 
        }`}
        accessibilityLabel="Partager"
        accessibilityRole="button"
      >
        <MaterialIcons name="share" size={22} color={theme.subtext} />
      </TouchableOpacity>
      
      {item.virtualTourAvailable && (
        <TouchableOpacity
          className="rounded-xl overflow-hidden p-2 border"
          accessibilityLabel="Visite virtuelle"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="rotate-3d-variant" size={22} color={'#93c5fd'} />
        </TouchableOpacity>
      )}
    </ThemedView>
  ), [item, navigateToInfo, theme, theme.subtext]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: "timing" }}
      className="mb-6 px-1"
    >
      <Animatable.View
        animation={animatingElement === item.id ? "pulse" : undefined}
        duration={500}
      >
        <ThemedView elevated="medium" className="rounded-3xl overflow-hidden">
          <BlurView
            intensity={theme ? 20 : 70}
            tint={"dark" }
            className="border rounded-3xl overflow-hidden "
          >
            <LinearGradient
              colors={theme.cardGradient}
              className="overflow-hidden"
            >
              {/* Image Section */}
              <ThemedView className="relative">
                <MotiView id={`item.${item.id}.image`}>
                  <Image
                    source={item.avatar}
                    className="w-full h-80"
                    resizeMode="cover"
                  />
                </MotiView>
                <LinearGradient
                  colors={  ["transparent", "rgba(20,20,40,0.5)", "rgba(10,10,30,0.9)"]
                  }
                  className="absolute bottom-0 left-0 right-0 h-3/4"
                />

                {/* Indicators & Buttons */}
                <ThemedView className="absolute top-3 left-1 right-4 flex-row justify-between items-center"
                style={{
                  backgroundColor: theme.elevation,
                  
                }}>
                  {StatusBadge}
                  {renderEnergyScore(item.energyScore)}
                  {renderVirtualTourBadge(item.virtualTourAvailable)}

                  {/* Heart / Favorite */}
                  <TouchableOpacity
                    className="p-3 rounded-full border"
                    onPress={handleToggleFavorite}
                    accessibilityLabel="Toggle favorite"
                    accessibilityRole="button"
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
                        color={ "#ffffff" }
                      />
                    )}
                  </TouchableOpacity>
                </ThemedView>

                {Features}

                {/* Price */}
                <ThemedView
                  className="absolute p-2 rounded-3xl bottom-4 right-4"
                  style={{
                    backgroundColor: theme.elevation,
                      borderColor: theme.backdrop
                    
                  }}
                >
                  <ThemedText className="text-white font-bold text-lg">
                    {item.price}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Content Section */}
              <ThemedView className="pl-4 pr-4 gap-2">
                <ThemedView className="flex-row justify-between items-center">
                  <ThemedView className="flex-row items-center gap-2">
                    <MaterialIcons
                      name="location-on"
                      size={18}
                      color={theme.subtext}
                    />
                    <ThemedText
                      className="text-base font-semibold"
                      style={{ fontSize: 14 }}
                    >
                      {item.location}
                    </ThemedText>
                  </ThemedView>

                  {AiBadges}

                  <ThemedView
                    className="flex-row items-center gap-1 px-3 py-1 rounded-lg border "
                  >
                    <FontAwesome5 name="star" size={16} color="#fcd34d" />
                    <ThemedText className="text-lg font-bold">
                      {item.stars}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                {/* Neighborhood info */}
                <RenderNeighborhoodInfo
                  item={item}
                />

                {/* Review summary with enhanced styling */}
                <ThemedView 
                  variant="surfaceVariant"
                  className="p-2 rounded-xl border">
                  <ThemedText className="text-base leading-6"
                    style={{ fontSize: 12 }}>
                    {item.review?.length > 120 ? `${item.review.substring(0, 120)}...` : item.review}
                  </ThemedText>
                </ThemedView>

                {/* Action Buttons - Enhanced with multiple options */}
                {ActionButtons}
              </ThemedView>
            </LinearGradient>
          </BlurView>
        </ThemedView>
      </Animatable.View>
    </MotiView>
  );
};

export default React.memo(RenderItem);