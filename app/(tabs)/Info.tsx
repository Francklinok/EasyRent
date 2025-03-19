
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import ItemData from '@/components/info/index';
import Atout from '@/components/info/atoutFils';
import Criteria from '@/components/info/criteriaFile';
import Services from '@/components/info/servicesFiles';
import Equipment from '@/components/info/equipmentFiles';

const Info = () => {
  const router = useRouter();
  
  // Définir un état initial correct
  const [activeComponent, setActiveComponent] = useState<string>('Description');

  // Mapper les noms aux composants
  const componentMap: { [key: string]: React.ElementType } = {
    Description: ItemData,
    Criteria: Criteria,
    Atout: Atout,
    Equipment: Equipment,
    Services: Services
  };

  const ActiveComponent = componentMap[activeComponent];
  console.log(ActiveComponent)
  console.log("ActiveComponent à afficher :", ActiveComponent);


  return (
    <SafeAreaView className="bg-white" style={{ paddingTop: StatusBar.currentHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="flex flex-col gap-4">
        
        {/* En-tête */}
        <View className="flex-row p-4 justify-between bg-white shadow-md rounded-t-lg">
          <View className="p-2">
            <Image 
              source={{ uri: 'https://via.placeholder.com/150' }}
              className="w-12 h-12 rounded-full mr-4" 
            />
          </View>

          <View className="flex flex-col justify-center">
            <Text className="text-lg font-semibold">Jacques</Text> 
            <Text className="text-[12px] font-semibold">
              Taux de réponse{' '}
              <Text className="text-green-600 text-[14px] font-bold">100%</Text>
            </Text> 
          </View>

          <View className="flex flex-row gap-6 items-center pr-5">
            <Octicons name="verified" size={24} color="black" />
            <AntDesign name="message1" size={24} color="black" />
          </View>
        </View>

        {/* Boutons de navigation */}
        <View className="flex flex-row flex-wrap gap-2 p-2">
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
              <Text className="text-[14px]">{key}</Text>
            </TouchableOpacity>
          ))}
        </View> 

        {/* Contenu dynamique */}
        <View className="p-2">
          {ActiveComponent ?
          
           <ActiveComponent />
            :
             <Text>Aucune donnée disponible</Text>}
        </View>

      </View>
    </SafeAreaView>
  );
};

export default Info;
