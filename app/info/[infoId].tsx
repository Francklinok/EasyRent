

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ItemData from '@/components/info/index';
import Atout from '@/components/info/atoutFils';
import Criteria from '@/components/info/criteriaFile';
import Services from '@/components/info/servicesFiles';
import Equipment from '@/components/info/equipmentFiles';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
// Définir le type pour les props des composants
interface ComponentProps {
  itemId: string | string[];
}

export default function Info (){
  const router = useRouter();
  // Récupérer les paramètres de la route
  const params = useLocalSearchParams();
  const { id, name } = params;
  
  // Définir un état initial correct
  const [activeComponent, setActiveComponent] = useState<string>('Description');
  
  // Mapper les noms aux composants
  const componentMap: { [key: string]: React.ComponentType<ComponentProps> } = {
    Description: ItemData,
    Criteria: Criteria,
    Atout: Atout,
    Equipment: Equipment,
    Services: Services
  };
  
  const ActiveComponent = componentMap[activeComponent];
  
  return (
    <SafeAreaView className="bg-white" style={{ paddingTop: StatusBar.currentHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ThemedView className="flex flex-col gap-4">
        {/* En-tête avec bouton retour */}
        <ThemedView className="flex-row p-2 justify-between bg-white shadow-md rounded-t-lg">
         
          <ThemedView className="flex-row gap-2 justify-between bg-white">
          <TouchableOpacity onPress={() => router.back()} className="p-2 pr-6 ">
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>

            <ThemedView className="p-2">
              <Image
                source={{ uri: 'https://via.placeholder.com/150' }}
                className="w-16 h-16 rounded-full mr-6 border"
              />
            </ThemedView>
            <ThemedView className="flex flex-col justify-center">
              <ThemedText className="text-lg font-semibold">{name}</ThemedText>
              <ThemedText className="text-[12px] font-semibold pr-4">
                Taux de réponse{' '}
                <Text className="text-green-600 text-[14px] font-bold">100%</Text>
              </ThemedText>
            </ThemedView>
            <ThemedView className="flex flex-row gap-6 items-center pr-4">
              <Octicons name="verified" size={24} color="black" />
              <AntDesign name="message1" size={24} color="black" />
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        {/* ID de l'élément (pour le débogage, à supprimer en production) */}
        <ThemedText className="px-4 text-gray-500">ID: {id}</ThemedText>
        
        {/* Boutons de navigation */}
        <ThemedView className="flex flex-row flex-wrap gap-2 p-2">
          {Object.keys(componentMap).map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveComponent(key)}
              style={{
                backgroundColor: activeComponent === key ? '#e0e0e0' : '#f5f5f5',
                paddingVertical: 6,
                paddingHorizontal: 13,
                borderRadius: 20,
              }}
            >
              <ThemedText className="text-[14px]">{key}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
        
        {/* Contenu dynamique */}
        <ThemedView className="p-2">
          {ActiveComponent ? (
            <ActiveComponent itemId={id} />
          ) : (
            <Text>Aucune donnée disponible</Text>
          )}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

