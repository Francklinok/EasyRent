// import React from "react";
// import { View, Text, FlatList, Image, TouchableOpacity, Dimensions } from "react-native";
// import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// // import Header from "@/components/head/HeadFile";
// import data from "@/assets/data/data";
// import { ItemType } from "@/types/ItemType";


// const { width } = Dimensions.get('window');

// const RenHouseAcceuil= () => {
//   const router = useRouter();
  
//   const navigateToInfo = (item: ItemType) => {
//     router.push({
//       pathname: "/info/[infoId]",
//       params: { 
//         id: item.id
//       }
//     }); 
//   };

//   const renderItem = ({ item }: { item: ItemType }) => (
//     <View className="mb-4 px-0">
//       <View className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
//         {/* Image Section with Overlay */}
//         <View className="relative">
//           <Image 
//             source={item.avatar} 
//             className="w-full h-80" 
//             resizeMode="cover" 
//           />
//           <LinearGradient
//             colors={["transparent", "rgba(0,0,0,0.7)"]}
//             className="absolute bottom-0 left-0 right-0 h-1/2"
//           />
//           <View className="absolute top-4 left-4 right-4 flex-row justify-between">
//             <View className={`px-3 py-1 rounded-full ${item.availibility ? "bg-green-500/80" : "bg-red-500/80"}`}>
//               <Text className="text-white font-semibold">
//                 {item.availibility ? "Available" : "Unavailable"}
//               </Text>
//             </View>
//             <TouchableOpacity className="bg-white/30 p-2 rounded-full">
//               <Ionicons name="heart" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Content Section */}
//         <View className=" flex gap-2 p-4 space-y-2 bg-white">
//           {/* Location and Rating */}
//           <View className="flex-row  justify-between items-center">
//             <View className="flex-row items-center space-x-2">
//               <MaterialIcons name="location-on" size={24} color="#374151" />
//               <Text className="text-base font-semibold text-gray-700">{item.location}</Text>
//             </View>
//             <View className="flex-row items-center space-x-1">
//               <FontAwesome5 name="star" size={18} color="#FFD700" />
//               <Text className="text-lg font-bold text-yellow-500">{item.stars}</Text>
//             </View>
//             <View className="bg-purple-500/20 px-3 py-1 rounded-full">
//               <Text className="text-purple-700 font-semibold">Proximity Services</Text>
//             </View>
//             <View className="flex-row items-center bg-blue-500 px-4 py-2 rounded-full space-x-2">
//               <FontAwesome5 name="dollar-sign" size={16} color="white" />
//               <Text className="text-white font-bold">{item.price}</Text>
//             </View>
//           </View>

//           {/* Price and Service */}
//           <View className="flex-row justify-between items-center">
          
// {/*           
//             <View className="bg-purple-500/20 px-3 py-1 rounded-full">
//               <Text className="text-purple-700 font-semibold">Resrevation</Text>
//             </View> */}
//           </View>

//           {/* Review */}
//           <Text className="text-gray-600 text-base leading-relaxed mb-4">
//             {item.review}
//           </Text>

//           {/* Action Button */}
//           {/* <TouchableOpacity 
//             onPress={() => navigateToInfo(item)}
//             className="bg-gradient-to-r from-blue-500 to-purple-600 py-4 rounded-xl shadow-lg"
//           >
//             <Text className="text-white text-center text-lg font-bold">
//               Learn More
//             </Text>
//           </TouchableOpacity> */}
//           <TouchableOpacity
//               onPress={() => navigateToInfo(item)}
//               className="rounded-xl shadow-lg overflow-hidden"
//             >
//               <LinearGradient
//                 colors={['#3882F6', '#8B5CF6']} // Bleu à Violet
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 className="py-4 items-center"
//               >
//                 <Text className="text-white text-center text-lg font-bold">
//                   Learn More
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <View className="flex bg-gray-50">
//       {/* <Header /> */}
//       <LinearGradient
//         colors={["rgba(240,240,240,0.3)", "rgba(255,255,255,0.5)"]}
//         className="flex"
//       >
//         <FlatList
//           data={data}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingVertical: 20 }}
//         />
//       </LinearGradient>
//     </View>
//   );
// };

// export default RenHouseAcceuil;




import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions, Animated, ScrollView, StatusBar } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import data from "@/assets/data/data";
import { ItemType, FeatureIcon } from "@/types/ItemType";

// Interface pour nos données étendues en interne du composant
interface ExtendedItemType extends ItemType {
  features: FeatureIcon[];
}

// Fonction pour associer des features à chaque type de propriété
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

// Étendre les données
const extendedData: ExtendedItemType[] = data.map(item => ({
  ...item,
  features: getFeaturesByLocation(item.location)
}));

const { width, height } = Dimensions.get('window');

const RenHouseAcceuil = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Animation pour l'effet de pulsation
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
      // Cleanup animation if needed
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

  const renderItem = ({ item, index }: { item: ExtendedItemType, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing' }}
      className="mb-6 px-2"
    >
      <View className="rounded-3xl overflow-hidden">
        <BlurView intensity={10} tint="light" className="border border-gray-200 rounded-3xl overflow-hidden">
          <LinearGradient
            colors={["rgba(18,18,25,0.9)", "rgba(30,30,45,0.95)"]}
            className="overflow-hidden"
          >
            {/* Image Section with Holographic Overlay */}
            <View className="relative">
              <Image 
                source={item.avatar} 
                className="w-full h-72" 
                resizeMode="cover" 
              />
              <LinearGradient
                colors={["transparent", "rgba(20,20,40,0.7)", "rgba(10,10,30,0.9)"]}
                className="absolute bottom-0 left-0 right-0 h-3/4"
              />
              
              {/* Futuristic Status Indicators */}
              <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center">
                <View className={`px-4 py-2 rounded-full flex-row items-center space-x-2
                  ${item.availibility === "available" 
                    ? "bg-emerald-500/20 border border-emerald-400/40" 
                    : "bg-red-500/20 border border-red-400/40"}`
                }>
                  <View className={`h-3 w-3 rounded-full ${item.availibility === "available" ? "bg-emerald-400" : "bg-red-400"}`}>
                    {item.availibility === "available" && (
                      <Animated.View 
                        className="absolute h-3 w-3 rounded-full bg-emerald-400/50"
                        style={{
                          transform: [{ scale: pulseAnim }]
                        }}
                      />
                    )}
                  </View>
                  <Text className={`font-semibold ${item.availibility === "available" ? "text-emerald-300" : "text-red-300"}`}>
                    {item.availibility === "available" ? "AVAILABLE" : "UNAVAILABLE"}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  className="bg-gray-800/40 p-3 rounded-full border border-gray-700/50"
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Ionicons 
                    name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
                    size={22} 
                    color={favorites.includes(item.id) ? "#f43f5e" : "#ffffff"} 
                  />
                </TouchableOpacity>
              </View>

              {/* Futuristic Icons */}
              <View className="absolute bottom-4 left-4 flex-row space-x-2">
                {item.features?.map((feature, idx) => (
                  <View key={idx} className="bg-gray-800/40 p-2 rounded-lg border border-gray-700/30">
                    <FontAwesome5 name={feature.icon} size={16} color="#a5b4fc" />
                  </View>
                ))}
              </View>

              {/* Digital Price Tag */}
              <View className="absolute bottom-4 right-4">
                <LinearGradient
                  colors={['#3b82f6', '#6366f1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="px-4 py-2 rounded-xl border border-indigo-400/30"
                >
                  <Text className="text-white font-bold text-lg">{item.price}</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Content Section */}
            <View className="p-5 space-y-3">
              {/* Location and Rating */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2">
                  <MaterialIcons name="location-on" size={18} color="#a5b4fc" />
                  <Text className="text-base font-semibold text-gray-300">{item.location}</Text>
                </View>
                <View className="flex-row items-center space-x-1 bg-gray-800/40 px-3 py-1 rounded-lg border border-gray-700/30">
                  <FontAwesome5 name="star" size={16} color="#fcd34d" />
                  <Text className="text-lg font-bold text-gray-200">{item.stars}</Text>
                </View>
              </View>

              {/* Smart Tags */}
              <View className="flex-row flex-wrap gap-2">
                <View className="bg-violet-500/20 px-3 py-1 rounded-lg border border-violet-400/30">
                  <Text className="text-violet-300 font-medium text-sm">AI MANAGED</Text>
                </View>
                <View className="bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-400/30">
                  <Text className="text-blue-300 font-medium text-sm">NEURAL CONTROLS</Text>
                </View>
                <View className="bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-400/30">
                  <Text className="text-emerald-300 font-medium text-sm">ECO MATRIX</Text>
                </View>
              </View>

              {/* Review summary */}
              <View className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/30">
                <Text className="text-gray-300 text-base leading-relaxed">
                  {item.review.length > 120 ? `${item.review.substring(0, 120)}...` : item.review}
                </Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => navigateToInfo(item)}
                className="rounded-xl overflow-hidden"
              >
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6', '#d946ef']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 items-center"
                >
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-white text-center text-lg font-bold">EXPLORE</Text>
                    <Entypo name="chevron-right" size={20} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </MotiView>
  );

  const renderHeader = () => (
    <View className="mb-6 px-4">
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-5 rounded-3xl"
      >
        <Text className="text-white text-2xl font-bold mb-2">Neo Residences</Text>
        <Text className="text-gray-200 mb-4">Discover futuristic living spaces</Text>
        
        <View className="flex-row">
          <View className="flex-row items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
            <MaterialIcons name="search" size={20} color="#e2e8f0" />
            <Text className="text-gray-200">Search future homes...</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Category Filters */}
      <View className="mt-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(category)}
              className={`mr-3 px-4 py-2 rounded-full border 
                ${selectedCategory === category 
                  ? 'bg-indigo-600 border-indigo-400' 
                  : 'bg-gray-800/40 border-gray-700'}`}
            >
              <Text className={`font-medium ${selectedCategory === category ? 'text-white' : 'text-gray-300'}`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        className="flex-1 pt-12"
      >
        <Animated.FlatList
          data={extendedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20 }}
          ListHeaderComponent={renderHeader}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        />
      </LinearGradient>
    </View>
  );
};

export default RenHouseAcceuil;