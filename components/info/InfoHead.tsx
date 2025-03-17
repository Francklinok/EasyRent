
// export default MessageHeader;
import React from 'react';
import { View, Text, Image, SafeAreaView, StatusBar } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import message from '../messages/messagedata';

// type MessageHeaderProps = {
//   name: string; // Le nom du contact
//   image: string; // L'avatar du contact
// }


const InfoHead = () => {
  return (
    <SafeAreaView style={{ backgroundColor: 'white', paddingTop: StatusBar.currentHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className = "flex, flex-col gap-8">

      <View className="flex-row p-4 justify-between bg-white shadow-md rounded-t-lg">
        {/* Partie Avatar à gauche */}
        <View className="p-2">
          <Image 
            // source={{ uri: message.image }} // Utilisation de l'image passée en prop
            className="w-12 h-12 rounded-full mr-4" 
          />
        </View>

        {/* Partie Nom au centre */}
        <View className="flex flex-col justify-center">
          <Text className="text-lg font-semibold">jacques</Text> 
          <Text className="text-[12px] font-semibold">Taux de response : 100%</Text> 
        </View>

        {/* Partie Icônes à droite */}
        <View className="flex flex-row gap-6 items-center space-x-8 pr-5">
        <Octicons name="verified" size={24} color="black" />
        <AntDesign name="message1" size={24} color="black" />
        </View>
      </View>

      <View className = "flex flex-row gap-8 p-2">
    
      <View className = "flex flex-row gap-4  mb-6 ">
        <Text className = "text-[14px] rounded-[20px] p-2 bg-blue-200 "> Description </Text>
      </View>
      <View className = "flex flex-row gap-4  mb-6 ">
        <Text className = "text-[14px] rounded-[20px] p-2 bg-blue-200"> Criter de logement </Text>
      </View>
      <View className = "flex flex-row gap-4  mb-6 ">
        <Text className = "text-[14px] rounded-[20px] p-2 bg-blue-200"> Atout du logement </Text>
      </View>
  
      </View>

      </View>

    </SafeAreaView>
  );
};

export default InfoHead ;
