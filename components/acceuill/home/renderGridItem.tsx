import React from "react";
import { Image, TouchableOpacity } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons,MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import renderEnergyScore from "./renderEnergieScore";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import toggleFavorite from "@/components/utils/homeUtils/toggleFavorite";
import { useTheme } from "@/components/contexts/theme/themehook";

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
  
  import type { MutableRefObject } from "react";

  type Props = {
    item: ExtendedItemType;
    index: number;
    width: number;
    lottieRef: MutableRefObject<any>; // ou lottieRef: MutableRefObject<LottieView | null> si tu as typé ton ref
    setAnimatingElement: (id: string | null) => void;
    favorites: string[];
    setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  };
  
  
  const RenderGridItem:React.FC<Props> = ({   
    item,
    index,
    setAnimatingElement,
    setFavorites,
    favorites,
    lottieRef,
    width,}) => {

      const {theme} = useTheme()
    const router = useRouter()

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

    return  (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
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
            tint={ "dark"} 
            className={`border rounded-2xl overflow-hidden ${
               "border-white/10"
            }`}
          >
            {/* Image */}
            <ThemedView className="relative">
              <Image 
                source={item.avatar} 
                style={{ width: '100%', height: 100 }}
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
                <MaterialIcons name="location-on" size={12} color={theme.subtext} />
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
                    style={{ backgroundColor: 'rgba(55, 65, 81, 0.3)'  }}
                  >
                    <FontAwesome5 name={feature.icon} size={8} color={theme.subtext} />
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
                    <MaterialCommunityIcons name="rotate-3d-variant" size={10} color= {'#93c5fd'} />
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
          </BlurView>
        </ThemedView>
      </TouchableOpacity>
    </MotiView>
  )}

  export  default RenderGridItem;