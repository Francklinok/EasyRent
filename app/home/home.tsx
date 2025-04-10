

// import { View, Text, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { LinearGradient } from "expo-linear-gradient";
// import { BlurView } from "expo-blur";
// import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
// import { MotiView } from 'moti';
// import * as Haptics from 'expo-haptics';
// import Header from '@/components/ui/header';
// import RenHouseAcceuil from '@/components/acceuill/RenHouseAcceuil';
// import houseSelleAcceuil from '@/components/acceuill/houseSelleAcceuil';
// import landSelleAcceuill from '@/components/acceuill/landSelleAcceuill';

// interface ComponentProps {
//   itemId: string | string[];
// }

// // Définition des catégories avec icônes et descriptions
// const categories = [
//   {
//     key: "RentHouse",
//     label: "Louer",
//     description: "Propriétés à louer",
//     icon: "home"
//   },
//   {
//     key: "SelleHouse",
//     label: "Acheter",
//     description: "Maisons à vendre",
//     icon: "business-outline"
//   },
//   {
//     key: "SelleLand",
//     label: "Terrains",
//     description: "Parcelles disponibles",
//     icon: "map-outline"
//   }
// ];

// const { width } = Dimensions.get('window');

// const Home = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const { id } = params;
//   const [activeComponent, setActiveComponent] = useState<string>("RentHouse");
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(categories[0].key);
//   const currentTheme = "light"; // Or integrate with your theme system if you have one
  
//   const componentMap: { [key: string]: React.ComponentType<ComponentProps> } = {
//     "RentHouse": RenHouseAcceuil,
//     "SelleHouse": houseSelleAcceuil,
//     "SelleLand": landSelleAcceuill
//   };
  
//   const ActiveComponent = componentMap[activeComponent];
  
//   useEffect(() => {
//     // Animation d'entrée
//     setIsLoaded(true);
//   }, []);
  
//   const handleSetActiveComponent = (key: string) => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setActiveComponent(key);
//     setSelectedCategory(key);
//   };

//   // const renderCategoryFilter = () => (
//   //   <View className="mb-6 px-4">  
//   //     {/* Category Filters */}
//   //     <View className="mt-6">
//   //       <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
//   //         {categories.map((category) => (
//   //           <TouchableOpacity
//   //             key={category.key}
//   //             onPress={() => handleSetActiveComponent(category.key)}
//   //             className={`mr-3 px-4 py-2 rounded-full border
//   //               ${selectedCategory === category.key
//   //                 ? currentTheme === "light" ? 'bg-blue-500 border-blue-400' : 'bg-indigo-600 border-indigo-400'
//   //                 : currentTheme === "light" ? 'bg-white/70 border-gray-200' : 'bg-gray-800/40 border-gray-700'}`}
//   //           >
//   //             <View className="flex-row items-center">
//   //               <Ionicons 
//   //                 name={category.icon as any} 
//   //                 size={16} 
//   //                 color={selectedCategory === category.key ? "white" : currentTheme === "light" ? "#374151" : "#D1D5DB"} 
//   //                 style={{ marginRight: 6 }}
//   //               />
//   //               <Text className={`font-medium ${selectedCategory === category.key
//   //                 ? 'text-white'
//   //                 : currentTheme === "light" ? 'text-gray-700' : 'text-gray-300'}`}>
//   //                 {category.label}
//   //               </Text>
//   //             </View>
//   //           </TouchableOpacity>
//   //         ))}
//   //       </ScrollView>
//   //     </View>
//   //   </View>
//   // );

//   return (
//     <MotiView 
//       from={{ opacity: 0 }}
//       animate={{ opacity: isLoaded ? 1 : 0 }}
//       transition={{ type: 'timing', duration: 800 }}
//       className="flex"
//     >
//       <View className="mb-2">
//         {/* Header avec effet subtil */}
//         <MotiView
//           from={{ translateY: -20, opacity: 0 }}
//           animate={{ translateY: 0, opacity: 1 }}
//           transition={{ delay: 200, type: 'spring', stiffness: 100 }}
//         >
//           <Header />
//         </MotiView>
        
//         {/* New Category Filter Header */}
//         <MotiView
//           from={{ opacity: 0, translateY: 10 }}
//           animate={{ opacity: 1, translateY: 0 }}
//           transition={{ delay: 400, type: 'spring', stiffness: 100 }}
//         >
//           {/* {renderCategoryFilter()} */}
//         </MotiView>
        
//         {/* Background Image Section */}
//         <MotiView
//           from={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ delay: 300, type: 'spring', stiffness: 100 }}
//           className="mx-4 mt-2 rounded-3xl overflow-hidden shadow-lg"
//         >
//           <View className="relative rounded-3xl overflow-hidden">
//             {/* <Image
//               source={{ uri: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000" }}
//               className="w-full h-48 absolute"
//               resizeMode="cover"
//             /> */}
//             <LinearGradient
//               colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.9)' ]}

//               // colors={['rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.9)']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               className="w-full h-10 p-0"
//             >
//               <View className="flex justify-between h-full">
//                 {/* <View>
//                   <Text className="text-white text-2xl font-bold mb-1">Trouvez votre bien idéal</Text>
//                   <Text className="text-white/70">Des propriétés sélectionnées pour vous</Text>
//                 </View> */}
                
//                 {/* Alternative visual selector (optional - you can remove if using only the ScrollView) */}
//                 <View className="flex flex-row justify-center flex-wrap gap-8 mt-1">
//                   {categories.map((category) => (
//                     <MotiView
//                       key={category.key}
//                       from={{ opacity: 0, translateY: 10 }}
//                       animate={{ opacity: 1, translateY: 0 }}
//                       transition={{ delay: categories.findIndex(c => c.key === category.key) * 150 + 500 }}
//                     >
//                       <BlurView intensity={10} tint="light" className="overflow-hidden rounded-2xl">
//                         <TouchableOpacity
//                           onPress={() => handleSetActiveComponent(category.key)}
//                           className={`flex-row items-center py-2 px-4 border ${
//                             activeComponent === category.key 
//                               ? 'border-white/40 bg-white/10' 
//                               : 'border-white/10 bg-white/10'
//                           } rounded-2xl`}
//                         >
//                           <Ionicons 
//                             name={category.icon as any} 
//                             size={16} 
//                             color="white" 
//                             style={{ opacity: activeComponent === category.key ? 1 : 0.7 }}
//                           />
//                           <Text className={`text-white text-sm ml-2 ${
//                             activeComponent === category.key ? 'font-bold' : 'font-medium opacity-70'
//                           }`}>
//                             {category.label}
//                           </Text>
//                         </TouchableOpacity>
//                       </BlurView>
//                     </MotiView>
//                   ))}
//                 </View>
//               </View>
//             </LinearGradient>
//           </View>
//         </MotiView>
        
//         {/* Content Section with Animation */}
//         <MotiView
//           from={{ opacirty: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 800, type: 'timing' }}
//           className="px-1"
//         >
//           {ActiveComponent ? (
//             <ActiveComponent itemId={id} />
//           ) : (
//             <View className="p-20 items-center justify-center">
//               <Ionicons name="alert-circle-outline" size={48} color="#6366f1" />
//               <Text className="text-gray-500 mt-4 text-center">
//                 Aucune donnée disponible pour cette catégorie
//               </Text>
//             </View>
//           )}
//         </MotiView>
//       </View>
//     </MotiView>
//   );
// };

// export default Home;

import { View, Text, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Header from '@/components/ui/header';
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
  const [selectedCategory, setSelectedCategory] = useState(categories[0].key);
  const currentTheme = "light"; // Or integrate with your theme system if you have one
  
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
    setSelectedCategory(key);
  };

  // Modern tab-style category filter
  const renderCategoryFilter = () => (
    <View className="px-4 pt-2 pb-1">
      <View className="flex-row justify-around bg-gray-50 rounded-2xl p-1 shadow-sm border border-gray-100">
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() => handleSetActiveComponent(category.key)}
            style={{ 
              width: (width - 48) / categories.length,
              shadowOffset: { width: 0, height: selectedCategory === category.key ? 1 : 0 },
              shadowOpacity: selectedCategory === category.key ? 0.1 : 0,
              shadowRadius: 4,
              elevation: selectedCategory === category.key ? 2 : 0
            }}
            className={`py-3 rounded-xl items-center ${
              selectedCategory === category.key 
                ? 'bg-white' 
                : 'bg-transparent'
            }`}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.key ? "#6366f1" : "#9ca3af"} 
              className="mb-1"
            />
            <Text className={`text-sm ${
              selectedCategory === category.key
                ? 'text-gray-800 font-medium'
                : 'text-gray-500'
            }`}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <MotiView 
      from={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ type: 'timing', duration: 800 }}
      className="flex bg-gray-50"
    >
      <View className="mb-2">
        {/* Header avec effet subtil */}
        <MotiView
          from={{ translateY: -20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 200, type: 'spring', stiffness: 100 }}
        >
          <Header />
        </MotiView>
        
        {/* Featured Banner Section */}
        <MotiView
          from={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 300, type: 'spring', stiffness: 100 }}
          className="mx-4 mt-2 mb-4 rounded-2xl overflow-hidden shadow-md"
        >
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000" }}
            className="w-full h-36 absolute"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(79, 70, 229, 0.85)', 'rgba(109, 40, 217, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-36 px-5 py-4"
          >
            <View className="flex justify-between h-full">
              <View>
                <MotiView
                  from={{ translateX: -20, opacity: 0 }}
                  animate={{ translateX: 0, opacity: 1 }}
                  transition={{ delay: 500, type: 'spring', stiffness: 100 }}
                >
                  <Text className="text-white text-xl font-bold mb-1">
                    Trouvez votre bien idéal
                  </Text>
                  <Text className="text-white/80 text-sm">
                    Des propriétés sélectionnées pour vous
                  </Text>
                </MotiView>
              </View>
              
              <View className="self-end">
                <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  <Text className="text-white font-medium text-sm">Découvrir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </MotiView>
        
        {/* Modern Category Filter */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, type: 'spring', stiffness: 100 }}
        >
          {renderCategoryFilter()}
        </MotiView>
        
        {/* Secondary Actions */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 600, type: 'timing' }}
          className="flex-row justify-between px-4 py-3"
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="filter-variant" size={18} color="#4b5563" />
            <Text className="text-gray-600 ml-2 font-medium">Filtres</Text>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity className="mr-4 flex-row items-center">
              <MaterialCommunityIcons name="sort" size={18} color="#4b5563" />
              <Text className="text-gray-600 ml-1">Trier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center">
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#4b5563" />
              <Text className="text-gray-600 ml-1">Carte</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Content Divider */}
        <View className="border-b border-gray-200 mx-4 mb-2" />
        
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
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.2)']}
                className="p-4 rounded-full mb-3"
              >
                <Ionicons name="alert-circle-outline" size={48} color="#6366f1" />
              </LinearGradient>
              <Text className="text-gray-700 font-medium text-lg mb-2 text-center">
                Aucun résultat trouvé
              </Text>
              <Text className="text-gray-500 text-center px-8">
                Aucune donnée disponible pour cette catégorie pour le moment
              </Text>
              <TouchableOpacity 
                className="mt-6 bg-indigo-500 py-2 px-6 rounded-full"
                onPress={() => handleSetActiveComponent("RentHouse")}
              >
                <Text className="text-white font-medium">Retour à l'accueil</Text>
              </TouchableOpacity>
            </View>
          )}
        </MotiView>
      </View>
    </MotiView>
  );
};

export default Home;