

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
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

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

  return (
    <MotiView 
      from={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ type: 'timing', duration: 800 }}
      className="flex bg-gray-50"
    >
      <ThemedView className="mb-0">
        {/* Header avec effet subtil */}
        <MotiView
          from={{ translateY: -20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 200, type: 'spring', stiffness: 100 }}
        >
          {/* <Header /> */}
        </MotiView>
        
        {/* Section compacte combinée */}
        <MotiView
          from={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 300, type: 'spring', stiffness: 100 }}
          className=" rounded-2xl overflow-hidden shadow-md"
        >
          {/* <Image
            source={{ uri: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000" }}
            className="w-full h-22 absolute"
            resizeMode="cover"
          /> */}
          {/* <LinearGradient
            colors={['rgba(79, 70, 229, 0.85)', 'rgba(109, 40, 217, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-10"
          > */}
            {/* En-tête et contenu */}
            {/* <View className="px-4 pt-3 pb-2">
              <Text className="text-white text-xl font-bold mb-1">
                Trouvez votre bien idéal
              </Text>
              {/* <Text className="text-white/80 text-sm mb-3">
                Des propriétés sélectionnées pour vous
              </Text> 
            </View> */}
            
            {/* Catégories à l'intérieur du dégradé */}
            <ThemedView className="mx-1 bg-white rounded-xl p-1 ">
              <ThemedView className="flex-row justify-between">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    onPress={() => handleSetActiveComponent(category.key)}
                    style={{ width: (width - 48) / categories.length - 6 }}
                    className={` px-1 rounded-lg items-center ${
                      selectedCategory === category.key 
                        ? 'bg-white' 
                        : 'bg-transparent'
                    }`}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={18} 
                      color={selectedCategory === category.key ? "green" : "blue"} 
                    />
                    <ThemedText className={`text-10 ${
                      selectedCategory === category.key
                        ? 'text-indigo-400 font-medium'
                        : 'text-blue-600'
                    }`}>
                      {category.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>
            
            {/* Actions secondaires */}
            {/* <View className="flex-row justify-between px-4 pb-2">
              <TouchableOpacity className="bg-white/20 rounded-full px-3 py-1 flex-row items-center">
                <MaterialCommunityIcons name="filter-variant" size={16} color="white" />
                <Text className="text-white text-xs ml-1">Filtres</Text>
              </TouchableOpacity>
              
              <View className="flex-row">
                <TouchableOpacity className="bg-white/20 rounded-full px-3 py-1 flex-row items-center mr-2">
                  <MaterialCommunityIcons name="sort" size={16} color="white" />
                  <Text className="text-white text-xs ml-1">Trier</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="bg-white/20 rounded-full px-3 py-1 flex-row items-center">
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color="white" />
                  <Text className="text-white text-xs ml-1">Carte</Text>
                </TouchableOpacity>
              </View>
            </View> */}
          {/* </LinearGradient> */}
        </MotiView>
        
        {/* Content Section with Animation */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 800, type: 'timing' }}
          className=""
        >
          {ActiveComponent ? (
            <ActiveComponent itemId={id} />
          ) : (
            <ThemedView className="p-12 items-center justify-center">
              <ThemedView className="bg-indigo-100 p-4 rounded-full mb-3">
                <Ionicons name="alert-circle-outline" size={36} color="#6366f1" />
              </ThemedView>
              <ThemedText className="text-gray-700 font-medium text-base mb-2 text-center">
                Aucun résultat trouvé
              </ThemedText>
              <ThemedText className="text-gray-500 text-sm text-center">
                Aucune donnée disponible pour cette catégorie
              </ThemedText>
              <TouchableOpacity 
                className="mt-4 bg-indigo-500 py-2 px-4 rounded-full"
                onPress={() => handleSetActiveComponent("RentHouse")}
              >
                <Text className="text-white text-sm font-medium">Retour</Text>
              </TouchableOpacity>
            </ThemedView>
          )}
        </MotiView>
      </ThemedView>
    </MotiView>
  );
};

export default Home;