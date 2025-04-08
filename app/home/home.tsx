

// import { View, Text, TouchableOpacity} from 'react-native'
// import React from 'react'
// import RenHouseAcceuil from '@/components/acceuill/RenHouseAcceuil'
// import houseSelleAcceuil from '@/components/acceuill/houseSelleAcceuil'
// import landSelleAcceuill from '@/components/acceuill/landSelleAcceuill'
// import { useState } from 'react'
// import { useLocalSearchParams, useRouter } from 'expo-router'
// import Header from '@/components/head/HeadFile'
// import { LinearGradient } from "expo-linear-gradient";

// interface ComponentProps {
//   itemId: string | string[];
// }

// const Home = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const {id} = params

//   const [activeComponent, setActiveComponent] = useState<string>("RenHouseAcceuil")

//   const componentMap:{[key:string]:React.ComponentType<ComponentProps> } = {
//   "RentHouse":RenHouseAcceuil,
//   "SelleHouse":houseSelleAcceuil,
//   "SelleLand":landSelleAcceuill
//   }

//   const ActiveComponent = componentMap[activeComponent]


//   return (
//     <View className="mb-6">
//       <Header/>
//       <LinearGradient
//         colors={['#3b82f6', '#8b5cf6']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//         className="p-5 rounded-3xl"
//       >
//       <View className="flex flex-row flex-wrap gap-2 ">
//       {Object.keys(componentMap).map((key) =>(
//          <TouchableOpacity
//             key={key}  
//             onPress={() => setActiveComponent(key)}
//             style={{
//               backgroundColor: activeComponent === key ? '#e0e0e0' : '#f5f5f5',
//               paddingVertical: 6,
//               paddingHorizontal: 13,
//               borderRadius: 20,
//             }}
//           >
//             <Text className="text-[14px] ">{key}</Text>
//           </TouchableOpacity>

//       ))}
//       </View>
//       </LinearGradient>

//       <View className="p-1">
//         {ActiveComponent?(
//          <ActiveComponent itemId={id} />
//         ):(<Text>Aucune donnée disponible</Text>
//         )}
//       </View>
//     </View>
//   )
// }

// export default Home


import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Header from '@/components/head/HeadFile';
import RenHouseAcceuil from '@/components/acceuill/RenHouseAcceuil';
import houseSelleAcceuil from '@/components/acceuill/houseSelleAcceuil';
import landSelleAcceuill from '@/components/acceuill/landSelleAcceuill';

interface ComponentProps {
  itemId: string | string[];
}

// Définition des catégories avec icônes et descriptions
const categories = [
  {
    key: "RentHouse",
    label: "Louer",
    description: "Propriétés à louer",
    icon: "home"
  },
  {
    key: "SelleHouse",
    label: "Acheter",
    description: "Maisons à vendre",
    icon: "business-outline"
  },
  {
    key: "SelleLand",
    label: "Terrains",
    description: "Parcelles disponibles",
    icon: "map-outline"
  }
];

const { width } = Dimensions.get('window');

const Home = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const [activeComponent, setActiveComponent] = useState<string>("RentHouse");
  const [isLoaded, setIsLoaded] = useState(false);
  
  const componentMap: { [key: string]: React.ComponentType<ComponentProps> } = {
    "RentHouse": RenHouseAcceuil,
    "SelleHouse": houseSelleAcceuil,
    "SelleLand": landSelleAcceuill
  };
  
  const ActiveComponent = componentMap[activeComponent];
  
  useEffect(() => {
    // Animation d'entrée
    setIsLoaded(true);
  }, []);
  
  const handleSetActiveComponent = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveComponent(key);
  };

  return (
    <MotiView 
      from={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ type: 'timing', duration: 800 }}
      className="flex"
    >
      <View className="mb-6">
        {/* Header avec effet subtil */}
        <MotiView
          from={{ translateY: -20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 200, type: 'spring', stiffness: 100 }}
        >
          <Header />
        </MotiView>
        
        {/* Background Image Section */}
        <MotiView
          from={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 300, type: 'spring', stiffness: 100 }}
          className="mx-4 mt-2 rounded-3xl overflow-hidden shadow-lg"
        >
          <View className="relative rounded-3xl overflow-hidden">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000" }}
              className="w-full h-48 absolute"
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.9)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-full h-48 p-6"
            >
              <View className="flex justify-between h-full">
                <View>
                  <Text className="text-white text-2xl font-bold mb-1">Trouvez votre bien idéal</Text>
                  <Text className="text-white/70">Des propriétés sélectionnées pour vous</Text>
                </View>
                
                {/* Category Tabs with elevated design */}
                <View className="flex flex-row flex-wrap gap-2 mt-2">
                  {categories.map((category) => (
                    <MotiView
                      key={category.key}
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: categories.findIndex(c => c.key === category.key) * 150 + 500 }}
                    >
                      <BlurView intensity={80} tint="light" className="overflow-hidden rounded-2xl">
                        <TouchableOpacity
                          onPress={() => handleSetActiveComponent(category.key)}
                          className={`flex-row items-center py-2 px-4 border ${
                            activeComponent === category.key 
                              ? 'border-white/40 bg-white/20' 
                              : 'border-white/10 bg-white/10'
                          } rounded-2xl`}
                        >
                          <Ionicons 
                            name={category.icon as any} 
                            size={16} 
                            color="white" 
                            style={{ opacity: activeComponent === category.key ? 1 : 0.7 }}
                          />
                          <Text className={`text-white text-sm ml-2 ${
                            activeComponent === category.key ? 'font-bold' : 'font-medium opacity-70'
                          }`}>
                            {category.label}
                          </Text>
                        </TouchableOpacity>
                      </BlurView>
                    </MotiView>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>
        </MotiView>
        
        {/* Stats Section */}
        {/* <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600, type: 'timing' }}
          className="mx-4 mt-4 mb-2"
        >
          <View className="flex-row justify-around">
            <View className="items-center">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="home-city-outline" size={16} color="#6366f1" />
                <Text className="text-gray-800 font-bold text-lg ml-1">240+</Text>
              </View>
              <Text className="text-gray-500 text-xs">Propriétés</Text>
            </View>
            
            <View className="items-center">
              <View className="flex-row items-center">
                <FontAwesome5 name="user-check" size={14} color="#6366f1" />
                <Text className="text-gray-800 font-bold text-lg ml-1">180+</Text>
              </View>
              <Text className="text-gray-500 text-xs">Clients satisfaits</Text>
            </View>
            
            <View className="items-center">
              <View className="flex-row items-center">
                <FontAwesome5 name="medal" size={14} color="#6366f1" />
                <Text className="text-gray-800 font-bold text-lg ml-1">15+</Text>
              </View>
              <Text className="text-gray-500 text-xs">Années d'exp.</Text>
            </View>
          </View>
        </MotiView> */}
        
        {/* Content Section with Animation */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 800, type: 'timing' }}
          className="px-1"
        >
          {ActiveComponent ? (
            <ActiveComponent itemId={id} />
          ) : (
            <View className="p-20 items-center justify-center">
              <Ionicons name="alert-circle-outline" size={48} color="#6366f1" />
              <Text className="text-gray-500 mt-4 text-center">
                Aucune donnée disponible pour cette catégorie
              </Text>
            </View>
          )}
        </MotiView>
      </View>
    </MotiView>
  );
};

export default Home;
