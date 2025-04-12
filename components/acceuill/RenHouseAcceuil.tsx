import React, { useState, useEffect, useRef, useCallback } from "react";
import { Image, TouchableOpacity, Dimensions, Animated, StatusBar } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import housingSelledata from "@/assets/data/houseselle";
import data from "@/assets/data/data";

import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useThemeColors, useDarkMode, useThemeControls } from "../contexts/theme/themehook";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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

const HouseSelleAcceuil = () => {
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
      className="mb-6 px-2"
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
                  ? ["transparent", "rgba(20,20,40,0.7)", "rgba(10,10,30,0.9)"] 
                  : ["transparent", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.4)"]}
                className="absolute bottom-0 left-0 right-0 h-3/4"
              />
              
              {/* Status Indicators */}
              <ThemedView className="absolute top-4 left-4 right-4 flex-row justify-between items-center"
               style={{
                backgroundColor: isDark
                  ? 'rgba(20,20,40,0.6)'  // fond sombre semi-transparent
                  : 'transparent ', // fond clair semi-transparent
                borderWidth: 0,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}>
                <ThemedView 
                  className="px-4 py-2 rounded-full flex-row items-center gap-2 border"
                  style={{
                    borderColor: item.availibility === "available" ? '#34d399' : '#ef4444',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)'

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
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.6)',
                      }}


                    // className={`p-2 rounded-lg border ${
                    //   isDark ? "bg-gray-800/40 border-gray-700/30" : "bg-transparent border-gray-200/60"
                    // }`}
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
              <ThemedView className="flex-row flex-wrap gap-2">
                <ThemedView 
                  className={`px-3 py-1 rounded-lg border ${
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
                  <ThemedView className="flex-row items-center gap-2">
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

export default HouseSelleAcceuil;






// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { View, Image, TouchableOpacity, Dimensions, Animated, StatusBar } from "react-native";
// import { FontAwesome5, MaterialIcons, Ionicons, Entypo, Feather } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import { BlurView } from "expo-blur";
// import * as Haptics from "expo-haptics";
// import { MotiView } from "moti";
// import housingSelledata from "@/assets/data/houseselle";

// import { ItemType, FeatureIcon } from "@/types/ItemType";
// import { useThemeColors, useDarkMode, useThemeControls } from "../contexts/theme/themehook";
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { ThemedScrollView } from "../ui/ScrolleView";

// // Interface pour nos données étendues en interne du composant
// interface ExtendedItemType extends ItemType {
//   features: FeatureIcon[];
// }

// // Fonction pour associer des features à chaque type de propriété
// const getFeaturesByLocation = (location: string): FeatureIcon[] => {
//   switch (location) {
//     case "Florida":
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "snowflake", name: "Climatisation" },
//         { icon: "umbrella-beach", name: "Plage" }
//       ];
//     case "Texas":
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "robot", name: "Assistant IA" },
//         { icon: "horse", name: "Ranch" }
//       ];
//     case "New York City":
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "subway", name: "Métro" },
//         { icon: "city", name: "Centre-ville" }
//       ];
//     case "California":
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "mountain", name: "Vue" },
//         { icon: "tree", name: "Nature" }
//       ];
//     default:
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "home", name: "Confort" }
//       ];
//   }
// };

// // Étendre les données
// const extendedData: ExtendedItemType[] = housingSelledata.map(item => ({
//   ...item,
//   features: getFeaturesByLocation(item.location)
// }));

// const { width, height } = Dimensions.get('window');

// const HouseSelleAcceuil = () => {
//   const router = useRouter();
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [scrollY] = useState(new Animated.Value(0));
//   const [favorites, setFavorites] = useState<string[]>([]);
  
//   // Utiliser les hooks de thème
//   const colors = useThemeColors();
//   const isDark = useDarkMode();
//   const { toggleTheme, currentTheme } = useThemeControls();
  
//   // Animation pour l'effet de pulsation
//   const pulseAnim = useRef(new Animated.Value(1)).current;
  
//   const pulsate = useCallback(() => {
//     Animated.sequence([
//       Animated.timing(pulseAnim, {
//         toValue: 1.8,
//         duration: 1000,
//         useNativeDriver: true
//       }),
//       Animated.timing(pulseAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true
//       })
//     ]).start(() => pulsate());
//   }, [pulseAnim]);
  
//   useEffect(() => {
//     pulsate();
//     return () => {
//       // Cleanup animation if needed
//       pulseAnim.setValue(1);
//     };
//   }, [pulsate]);
  
//   const navigateToInfo = (item: ExtendedItemType) => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     router.push({
//       pathname: "/info/[infoId]",
//       params: { 
//         id: item.id
//       }
//     });
//   };

//   const toggleFavorite = (id: string) => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setFavorites(prev => 
//       prev.includes(id) 
//         ? prev.filter(itemId => itemId !== id) 
//         : [...prev, id]
//     );
//   };

//   const categories = ["All", "Luxury", "Smart Home", "Eco-Friendly", "Space View"];

//   const renderCategoryTabs = () => (
//     <ThemedView style={{ 
//       flexDirection: 'row', 
//       paddingHorizontal: 16, 
//       paddingVertical: 12,
//       marginTop: 50
//     }}>
//       <ThemedScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ gap: 10 }}
//       >
//         {categories.map((category) => (
//           <TouchableOpacity 
//             key={category}
//             onPress={() => setSelectedCategory(category)}
//             style={{
//               backgroundColor: selectedCategory === category 
//                 ? colors.primary 
//                 : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
//               paddingHorizontal: 16,
//               paddingVertical: 8,
//               borderRadius: 16,
//               borderWidth: 1,
//               borderColor: selectedCategory === category 
//                 ? colors.primary 
//                 : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
//             }}
//           >
//             <ThemedText 
//               style={{ 
//                 color: selectedCategory === category 
//                   ? '#FFFFFF' 
//                   : colors.text 
//               }}
//             >
//               {category}
//             </ThemedText>
//           </TouchableOpacity>
//         ))}
//       </ThemedScrollView>

//     </ThemedView>
//   );

//   const renderHeader = () => (
//     <ThemedView>
//       <ThemedView style={{ 
//         flexDirection: 'row', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         padding: 16, 
//         paddingTop: 50
//       }}>
//         <ThemedView>
//           <ThemedText type="heading">Découvrez</ThemedText>
//           <ThemedText type="subtitle" variant="primary">Propriétés immobilières</ThemedText>
//         </ThemedView>
        
//         <TouchableOpacity 
//           onPress={toggleTheme}
//           style={{
//             padding: 10,
//             borderRadius: 20,
//             backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
//             borderWidth: 1,
//             borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
//           }}
//         >
//           <Ionicons 
//             name={isDark ? 'sunny' : 'moon'} 
//             size={24} 
//             color={colors.text} 
//           />
//         </TouchableOpacity>
//       </ThemedView>
      
//       {renderCategoryTabs()}
      
//       <ThemedView style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
//         <ThemedText type="body" intensity="light">
//           {extendedData.length} propriétés disponibles
//         </ThemedText>
//       </ThemedView>
//     </ThemedView>
//   );

//   const renderItem = ({ item, index }: { item: ExtendedItemType, index: number }) => (
//     <MotiView
//       from={{ opacity: 0, translateY: 50 }}
//       animate={{ opacity: 1, translateY: 0 }}
//       transition={{ delay: index * 100, type: 'timing' }}
//       style={{ marginBottom: 24, paddingHorizontal: 16 }}
//     >
//       <ThemedView style={{ 
//         borderRadius: 24, 
//         overflow: 'hidden',
//         shadowColor: isDark ? '#000000' : '#000000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: isDark ? 0.3 : 0.1,
//         shadowRadius: 8,
//         elevation: 5,
//       }}>
//         <BlurView 
//           intensity={isDark ? 10 : 60} 
//           tint={isDark ? "dark" : "light"} 
//           style={{
//             borderWidth: 1,
//             borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
//             borderRadius: 24,
//             overflow: 'hidden'
//           }}
//         >
//           <LinearGradient
//             colors={colors.cardGradient}
//             style={{ overflow: 'hidden' }}
//           >
//             {/* Image Section with Overlay */}
//             <View style={{ position: 'relative' }}>
//               <Image 
//                 source={item.avatar} 
//                 style={{ width: '100%', height: 320 }} 
//                 resizeMode="cover" 
//               />
//               <LinearGradient
//                 colors={isDark 
//                   ? ["transparent", "rgba(20,20,40,0.7)", "rgba(10,10,30,0.9)"] 
//                   : ["transparent", "rgba(255,255,255,0.7)", "rgba(255,255,255,0.9)"]}
//                 style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%' }}
//               />
              
//               {/* Status Indicators */}
//               <View style={{ 
//                 position: 'absolute', 
//                 top: 16, 
//                 left: 16, 
//                 right: 16, 
//                 flexDirection: 'row', 
//                 justifyContent: 'space-between', 
//                 alignItems: 'center' 
//               }}>
//                 <View style={{
//                   paddingHorizontal: 16,
//                   paddingVertical: 8,
//                   borderRadius: 20,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   gap: 8,
//                   backgroundColor: item.availibility === "available" 
//                     ? 'rgba(52, 211, 153, 0.2)' 
//                     : 'rgba(239, 68, 68, 0.2)',
//                   borderWidth: 1,
//                   borderColor: item.availibility === "available" 
//                     ? 'rgba(52, 211, 153, 0.4)' 
//                     : 'rgba(239, 68, 68, 0.4)',
//                 }}>
//                   <View style={{ 
//                     height: 12, 
//                     width: 12, 
//                     borderRadius: 6, 
//                     backgroundColor: item.availibility === "available" ? '#34d399' : '#ef4444',
//                     position: 'relative'
//                   }}>
//                     {item.availibility === "available" && (
//                       <Animated.View 
//                         style={{
//                           position: 'absolute',
//                           height: 12,
//                           width: 12,
//                           borderRadius: 6,
//                           backgroundColor: 'rgba(52, 211, 153, 0.5)',
//                           transform: [{ scale: pulseAnim }]
//                         }}
//                       />
//                     )}
//                   </View>
//                   <ThemedText 
//                     style={{ 
//                       fontWeight: '600',
//                       color: item.availibility === "available" ? '#34d399' : '#ef4444' 
//                     }}
//                   >
//                     {item.availibility === "available" ? "AVAILABLE" : "UNAVAILABLE"}
//                   </ThemedText>
//                 </View>
                
//                 <TouchableOpacity 
//                   style={{
//                     backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.5)',
//                     padding: 12,
//                     borderRadius: 20,
//                     borderWidth: 1,
//                     borderColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
//                   }}
//                   onPress={() => toggleFavorite(item.id)}
//                 >
//                   <Ionicons 
//                     name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
//                     size={22} 
//                     color={favorites.includes(item.id) ? "#f43f5e" : isDark ? "#ffffff" : "#3b82f6"} 
//                   />
//                 </TouchableOpacity>
//               </View>

//               {/* Feature Icons */}
//               <View style={{ 
//                 position: 'absolute', 
//                 bottom: 16, 
//                 left: 16, 
//                 flexDirection: 'row', 
//                 gap: 8 
//               }}>
//                 {item.features?.map((feature, idx) => (
//                   <View 
//                     key={idx} 
//                     style={{
//                       backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.7)',
//                       padding: 8,
//                       borderRadius: 8,
//                       borderWidth: 1,
//                       borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.6)',
//                     }}
//                   >
//                     <FontAwesome5 name={feature.icon} size={16} color={colors.subtext} />
//                   </View>
//                 ))}
//               </View>

//               {/* Price Tag */}
//               <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
//                 <LinearGradient
//                   colors={colors.priceGradient}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={{
//                     paddingHorizontal: 16,
//                     paddingVertical: 8,
//                     borderRadius: 12,
//                     borderWidth: 1,
//                     borderColor: 'rgba(99, 102, 241, 0.3)',
//                   }}
//                 >
//                   <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
//                     {item.price}
//                   </ThemedText>
//                 </LinearGradient>
//               </View>
//             </View>

//             {/* Content Section */}
//             <ThemedView style={{ padding: 20, gap: 12 }}>
//               {/* Location and Rating */}
//               <ThemedView style={{ 
//                 flexDirection: 'row', 
//                 justifyContent: 'space-between', 
//                 alignItems: 'center' 
//               }}>
//                 <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                   <MaterialIcons name="location-on" size={18} color={colors.subtext} />
//                   <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
//                     {item.location}
//                   </ThemedText>
//                 </ThemedView>
//                 <ThemedView style={{ 
//                   flexDirection: 'row', 
//                   alignItems: 'center', 
//                   gap: 4,
//                   backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.7)',
//                   paddingHorizontal: 12,
//                   paddingVertical: 4,
//                   borderRadius: 8,
//                   borderWidth: 1,
//                   borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.6)',
//                 }}>
//                   <FontAwesome5 name="star" size={16} color="#fcd34d" />
//                   <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
//                     {item.stars}
//                   </ThemedText>
//                 </ThemedView>
//               </ThemedView>

//               {/* Smart Tags */}
//               <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//                 <ThemedView style={{
//                   backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(237, 233, 254, 1)',
//                   paddingHorizontal: 12,
//                   paddingVertical: 4,
//                   borderRadius: 8,
//                   borderWidth: 1,
//                   borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(196, 181, 253, 1)',
//                 }}>
//                   <ThemedText style={{ 
//                     color: isDark ? 'rgba(196, 181, 253, 1)' : 'rgba(109, 40, 217, 1)', 
//                     fontWeight: '500', 
//                     fontSize: 14 
//                   }}>
//                     AI MANAGED
//                   </ThemedText>
//                 </ThemedView>
//                 <ThemedView style={{
//                   backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(219, 234, 254, 1)',
//                   paddingHorizontal: 12,
//                   paddingVertical: 4,
//                   borderRadius: 8,
//                   borderWidth: 1,
//                   borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(147, 197, 253, 1)',
//                 }}>
//                   <ThemedText style={{ 
//                     color: isDark ? 'rgba(147, 197, 253, 1)' : 'rgba(29, 78, 216, 1)', 
//                     fontWeight: '500', 
//                     fontSize: 14 
//                   }}>
//                     NEURAL CONTROLS
//                   </ThemedText>
//                 </ThemedView>
//                 <ThemedView style={{
//                   backgroundColor: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(209, 250, 229, 1)',
//                   paddingHorizontal: 12,
//                   paddingVertical: 4,
//                   borderRadius: 8,
//                   borderWidth: 1,
//                   borderColor: isDark ? 'rgba(52, 211, 153, 0.3)' : 'rgba(167, 243, 208, 1)',
//                 }}>
//                   <ThemedText style={{ 
//                     color: isDark ? 'rgba(167, 243, 208, 1)' : 'rgba(6, 95, 70, 1)', 
//                     fontWeight: '500', 
//                     fontSize: 14 
//                   }}>
//                     ECO MATRIX
//                   </ThemedText>
//                 </ThemedView>
//               </ThemedView>

//               {/* Review summary */}
//               <ThemedView style={{
//                 backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.6)',
//                 padding: 12,
//                 borderRadius: 12,
//                 borderWidth: 1,
//                 borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.6)',
//               }}>
//                 <ThemedText style={{ fontSize: 16, lineHeight: 24 }}>
//                   {item.review.length > 120 ? `${item.review.substring(0, 120)}...` : item.review}
//                 </ThemedText>
//               </ThemedView>

//               {/* Action Button */}
//               <TouchableOpacity
//                 onPress={() => navigateToInfo(item)}
//                 style={{ borderRadius: 12, overflow: 'hidden' }}
//               >
//                 <LinearGradient
//                   colors={colors.buttonGradient}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                   style={{ paddingVertical: 16, alignItems: 'center' }}
//                 >
//                   <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                     <ThemedText style={{ 
//                       color: 'white', 
//                       textAlign: 'center', 
//                       fontSize: 18, 
//                       fontWeight: 'bold' 
//                     }}>
//                       EXPLORE
//                     </ThemedText>
//                     <Entypo name="chevron-right" size={20} color="white" />
//                   </ThemedView>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </ThemedView>
//           </LinearGradient>
//         </BlurView>
//       </ThemedView>
//     </MotiView>
//   );

//   return (
//     <ThemedView>
//       <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
//       <LinearGradient
//         colors={colors.background}
//         // style={{ flex: 1 }}
//       >
//         <Animated.FlatList
//           data={extendedData}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingVertical: 8 }}
//           ListHeaderComponent={renderHeader}
//           onScroll={Animated.event(
//             [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//             { useNativeDriver: true }
//           )}
//         />
//       </LinearGradient>
//     </ThemedView>
//   );
// };

// export default HouseSelleAcceuil;












// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { View, Text, FlatList, Image, TouchableOpacity, Dimensions, Animated, ScrollView, StatusBar } from "react-native";
// import { FontAwesome5, MaterialIcons, Ionicons, Entypo, Feather } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import { BlurView } from "expo-blur";
// import * as Haptics from "expo-haptics";
// import { MotiView } from "moti";
// import data from "@/assets/data/data";
// import { ItemType, FeatureIcon } from "@/types/ItemType";
// import { ThemedText } from "../ui/ThemedText";
// import { ThemedView } from "../ui/ThemedView";
// interface ExtendedItemType extends ItemType {
//   features: FeatureIcon[];
// }

// // Fonction pour associer des features à chaque type de propriété
// const getFeaturesByLocation = (location: string): FeatureIcon[] => {
//   switch (location) {
//     case "Florida":
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "snowflake", name: "Climatisation" },
//         { icon: "umbrella-beach", name: "Plage" }
//       ];
//     case "Texas":
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "robot", name: "Assistant IA" },
//         { icon: "horse", name: "Ranch" }
//       ];
//     case "New York City":
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "subway", name: "Métro" },
//         { icon: "city", name: "Centre-ville" }
//       ];
//     case "California":
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "mountain", name: "Vue" },
//         { icon: "tree", name: "Nature" }
//       ];
//     default:
//       return [
//         { icon: "wifi", name: "Wi-Fi" },
//         { icon: "home", name: "Confort" }
//       ];
//   }
// };

// // Étendre les données
// const extendedData: ExtendedItemType[] = data.map(item => ({
//   ...item,
//   features: getFeaturesByLocation(item.location)
// }));

// const { width, height } = Dimensions.get('window');

// // Définition des thèmes
// // const themes = {
// //   dark: {
// //     background: ["#0f172a", "#1e293b"],
// //     cardGradient: ["rgba(18,18,25,0.9)", "rgba(30,30,45,0.95)"],
// //     text: "#ffffff",
// //     subtext: "#a5b4fc",
// //     cardBorder: "border-gray-700/30",
// //     buttonGradient: ['#3b82f6', '#8b5cf6', '#d946ef'],
// //     priceGradient: ['#3b82f6', '#6366f1'],
// //     statusBar: "light-content",
// //     tagBg: "bg-gray-800/40",
// //     reviewBg: "bg-gray-800/40"
// //   },
// //   light: {
// //     background: ["#ffffff", "#f8fafc"],
// //     cardGradient: ["rgba(255,255,255,0.7)", "rgba(248,250,252,0.8)"],
// //     text: "#0f172a",
// //     subtext: "#3b82f6",
// //     cardBorder: "border-gray-200/60",
// //     buttonGradient: ['#60a5fa', '#818cf8', '#c084fc'],
// //     priceGradient: ['#60a5fa', '#818cf8'],
// //     statusBar: "dark-content",
// //     tagBg: "bg-white/70",
// //     reviewBg: "bg-white/60"
// //   }
// // };

// const RenHouseAcceuil = () => {
//   const router = useRouter();
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [scrollY] = useState(new Animated.Value(0));
//   const [favorites, setFavorites] = useState<string[]>([]);
//   const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("dark");
  
//   // const theme = themes[currentTheme];
  
//   // Animation pour l'effet de pulsation
//   const pulseAnim = useRef(new Animated.Value(1)).current;
  
//   const pulsate = useCallback(() => {
//     Animated.sequence([
//       Animated.timing(pulseAnim, {
//         toValue: 1.8,
//         duration: 1000,
//         useNativeDriver: true
//       }),
//       Animated.timing(pulseAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true
//       })
//     ]).start(() => pulsate());
//   }, [pulseAnim]);
  
//   useEffect(() => {
//     pulsate();
//     return () => {
//       // Cleanup animation if needed
//       pulseAnim.setValue(1);
//     };
//   }, [pulsate]);
  
//   const navigateToInfo = (item: ExtendedItemType) => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     router.push({
//       pathname: "/info/[infoId]",
//       params: { 
//         id: item.id
//       }
//     });
//   };

//   const toggleFavorite = (id: string) => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setFavorites(prev => 
//       prev.includes(id) 
//         ? prev.filter(itemId => itemId !== id) 
//         : [...prev, id]
//     );
//   };

//   const toggleTheme = () => {
//     setCurrentTheme(prev => prev === "dark" ? "light" : "dark");
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//   };

//   const categories = ["All", "Luxury", "Smart Home", "Eco-Friendly", "Space View"];

//   const renderItem = ({ item, index }: { item: ExtendedItemType, index: number }) => (
//     <MotiView
//       from={{ opacity: 0, translateY: 50 }}
//       animate={{ opacity: 1, translateY: 0 }}
//       transition={{ delay: index * 100, type: 'timing' }}
//       className="mb-6 px-2"
//     >
//       <View className="rounded-3xl overflow-hidden shadow-lg">
//         <BlurView intensity={currentTheme === "light" ? 60 : 10} tint={currentTheme === "light" ? "light" : "dark"} className={`border rounded-3xl overflow-hidden ${currentTheme === "light" ? "border-gray-200/60" : "border-gray-700/30"}`}>
//           <LinearGradient
//             colors={theme.cardGradient}
//             className="overflow-hidden"
//           >
//             {/* Image Section with Overlay */}
//             <View className="relative">
//               <Image 
//                 source={item.avatar} 
//                 className="w-full h-80" 
//                 resizeMode="cover" 
//               />
//               <LinearGradient
//                 colors={currentTheme === "light" 
//                   ? ["transparent", "rgba(255,255,255,0.7)", "rgba(255,255,255,0.9)"] 
//                   : ["transparent", "rgba(20,20,40,0.7)", "rgba(10,10,30,0.9)"]}
//                 className="absolute bottom-0 left-0 right-0 h-3/4"
//               />
              
//               {/* Status Indicators */}
//               <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center">
//                 <View className={`px-4 py-2 rounded-full flex-row items-center space-x-2
//                   ${item.availibility === "available" 
//                     ? "bg-emerald-500/20 border border-emerald-400/40" 
//                     : "bg-red-500/20 border border-red-400/40"}`
//                 }>
//                   <View className={`h-3 w-3 rounded-full ${item.availibility === "available" ? "bg-emerald-400" : "bg-red-400"}`}>
//                     {item.availibility === "available" && (
//                       <Animated.View 
//                         className="absolute h-3 w-3 rounded-full bg-emerald-400/50"
//                         style={{
//                           transform: [{ scale: pulseAnim }]
//                         }}
//                       />
//                     )}
//                   </View>
//                   <Text className={`font-semibold ${item.availibility === "available" ? "text-emerald-300" : "text-red-300"}`}>
//                     {item.availibility === "available" ? "AVAILABLE" : "UNAVAILABLE"}
//                   </Text>
//                 </View>
                
//                 <TouchableOpacity 
//                   className={`${currentTheme === "light" ? "bg-white/50" : "bg-gray-800/40"} p-3 rounded-full border ${currentTheme === "light" ? "border-gray-200/50" : "border-gray-700/50"}`}
//                   onPress={() => toggleFavorite(item.id)}
//                 >
//                   <Ionicons 
//                     name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
//                     size={22} 
//                     color={favorites.includes(item.id) ? "#f43f5e" : currentTheme === "light" ? "#3b82f6" : "#ffffff"} 
//                   />
//                 </TouchableOpacity>
//               </View>

//               {/* Feature Icons */}
//               <View className="absolute bottom-4 left-4 flex-row space-x-2">
//                 {item.features?.map((feature, idx) => (
//                   <View key={idx} className={`${theme.tagBg} p-2 rounded-lg border ${theme.cardBorder}`}>
//                     <FontAwesome5 name={feature.icon} size={16} color={theme.subtext} />
//                   </View>
//                 ))}
//               </View>

//               {/* Price Tag */}
//               <View className="absolute bottom-4 right-4">
//                 <LinearGradient
//                   colors={theme.priceGradient}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   className="px-4 py-2 rounded-xl border border-indigo-400/30"
//                 >
//                   <Text className="text-white font-bold text-lg">{item.price}</Text>
//                 </LinearGradient>
//               </View>
//             </View>

//             {/* Content Section */}
//             <View className="p-5 space-y-3">
//               {/* Location and Rating */}
//               <View className="flex-row justify-between items-center">
//                 <View className="flex-row items-center space-x-2">
//                   <MaterialIcons name="location-on" size={18} color={theme.subtext} />
//                   <Text className={`text-base font-semibold ${currentTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{item.location}</Text>
//                 </View>
//                 <View className={`flex-row items-center space-x-1 ${theme.tagBg} px-3 py-1 rounded-lg border ${theme.cardBorder}`}>
//                   <FontAwesome5 name="star" size={16} color="#fcd34d" />
//                   <Text className={`text-lg font-bold ${currentTheme === "light" ? "text-gray-700" : "text-gray-200"}`}>{item.stars}</Text>
//                 </View>
//               </View>

//               {/* Smart Tags */}
//               <View className="flex-row flex-wrap gap-2">
//                 <View className={`${currentTheme === "light" ? "bg-violet-100" : "bg-violet-500/20"} px-3 py-1 rounded-lg border ${currentTheme === "light" ? "border-violet-200" : "border-violet-400/30"}`}>
//                   <Text className={`${currentTheme === "light" ? "text-violet-700" : "text-violet-300"} font-medium text-sm`}>AI MANAGED</Text>
//                 </View>
//                 <View className={`${currentTheme === "light" ? "bg-blue-100" : "bg-blue-500/20"} px-3 py-1 rounded-lg border ${currentTheme === "light" ? "border-blue-200" : "border-blue-400/30"}`}>
//                   <Text className={`${currentTheme === "light" ? "text-blue-700" : "text-blue-300"} font-medium text-sm`}>NEURAL CONTROLS</Text>
//                 </View>
//                 <View className={`${currentTheme === "light" ? "bg-emerald-100" : "bg-emerald-500/20"} px-3 py-1 rounded-lg border ${currentTheme === "light" ? "border-emerald-200" : "border-emerald-400/30"}`}>
//                   <Text className={`${currentTheme === "light" ? "text-emerald-700" : "text-emerald-300"} font-medium text-sm`}>ECO MATRIX</Text>
//                 </View>
//               </View>

//               {/* Review summary */}
//               <View className={`${theme.reviewBg} p-3 rounded-xl border ${theme.cardBorder}`}>
//                 <Text className={`${currentTheme === "light" ? "text-gray-700" : "text-gray-300"} text-base leading-relaxed`}>
//                   {item.review.length > 120 ? `${item.review.substring(0, 120)}...` : item.review}
//                 </Text>
//               </View>

//               {/* Action Button */}
//               <TouchableOpacity
//                 onPress={() => navigateToInfo(item)}
//                 className="rounded-xl overflow-hidden"
//               >
//                 <LinearGradient
//                   colors={theme.buttonGradient}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                   className="py-4 items-center"
//                 >
//                   <View className="flex-row items-center space-x-2">
//                     <Text className="text-white text-center text-lg font-bold">EXPLORE</Text>
//                     <Entypo name="chevron-right" size={20} color="white" />
//                   </View>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>
//           </LinearGradient>
//         </BlurView>
//       </View>
//     </MotiView>
//   );

//   // const renderHeader = () => (
//   //   <View className="mb-6 px-4">
//   //     {/* Theme Toggle Button */}
//   //     <View className="flex-row justify-end mb-2">
//   //       <TouchableOpacity 
//   //         onPress={toggleTheme}
//   //         className={`p-3 rounded-full ${currentTheme === "light" ? "bg-white/70" : "bg-gray-800/70"} border ${currentTheme === "light" ? "border-gray-200" : "border-gray-700"}`}
//   //       >
//   //         {currentTheme === "light" ? (
//   //           <Feather name="moon" size={20} color="#3b82f6" />
//   //         ) : (
//   //           <Feather name="sun" size={20} color="#f59e0b" />
//   //         )}
//   //       </TouchableOpacity>
//   //     </View>
      
//   //     <LinearGradient
//   //       colors={theme.background}
//   //       start={{ x: 0, y: 0 }}
//   //       end={{ x: 1, y: 0 }}
//   //       className={`p-5 rounded-3xl border ${currentTheme === "light" ? "border-gray-200/60" : "border-gray-700/30"}`}
//   //     >
//   //       <Text className={`${currentTheme === "light" ? "text-gray-800" : "text-white"} text-2xl font-bold mb-2`}>Neo Residences</Text>
//   //       <Text className={`${currentTheme === "light" ? "text-gray-600" : "text-gray-200"} mb-4`}>Discover futuristic living spaces</Text>
        
//   //       <View className="flex-row">
//   //         <View className={`flex-row items-center space-x-2 ${currentTheme === "light" ? "bg-gray-100/70" : "bg-white/10"} px-4 py-2 rounded-full`}>
//   //           <MaterialIcons name="search" size={20} color={currentTheme === "light" ? "#6b7280" : "#e2e8f0"} />
//   //           <Text className={`${currentTheme === "light" ? "text-gray-600" : "text-gray-200"}`}>Search future homes...</Text>
//   //         </View>
//   //       </View>
//   //     </LinearGradient>

//   //     {/* Category Filters */}
//   //     <View className="mt-6">
//   //       <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
//   //         {categories.map((category, index) => (
//   //           <TouchableOpacity
//   //             key={index}
//   //             onPress={() => setSelectedCategory(category)}
//   //             className={`mr-3 px-4 py-2 rounded-full border 
//   //               ${selectedCategory === category 
  //                 ? currentTheme === "light" ? 'bg-blue-500 border-blue-400' : 'bg-indigo-600 border-indigo-400' 
//   //                 : currentTheme === "light" ? 'bg-white/70 border-gray-200' : 'bg-gray-800/40 border-gray-700'}`}
//   //           >
//   //             <Text className={`font-medium ${selectedCategory === category 
//   //               ? 'text-white' 
//   //               : currentTheme === "light" ? 'text-gray-700' : 'text-gray-300'}`}>
//   //               {category}
//   //             </Text>
//   //           </TouchableOpacity>
//   //         ))}
//   //       </ScrollView>
//   //     </View>
//   //   </View>
//   // );

//   return (
//     <View className="flex">
//       <StatusBar barStyle={theme.statusBar as any} />
//       <LinearGradient
//         colors={theme.background}
//         className="flex"
//       >
//         <Animated.FlatList
//           data={extendedData}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingVertical: 8 }}
//           // ListHeaderComponent={renderHeader}
//           onScroll={Animated.event(
//             [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//             { useNativeDriver: true }
//           )}
//         />
//       </LinearGradient>
//     </View>
//   );
// };

// export default RenHouseAcceuil;