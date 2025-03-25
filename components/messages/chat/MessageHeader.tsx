

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { RootStackParamList } from '@/components/navigator/RouteType';
import { RouteProp } from '@react-navigation/native';

export default function ChatHeader() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { name, image } = route.params;

  return (
    <View className="flex-row items-center gap-2 justify-between w-full bg-white px-5 pt-14 pb-4">
      {/* Bouton de retour */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        className="mr-1"
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Avatar et Nom */}
      <View className="flex-row items-center flex-1">
        <Image
          source={{ uri: image }}
          className="w-20 h-20 rounded-full mr-8 border"
        />
        <View className= "flex  pt-1">
          <Text className="text-lg font-semibold">{name}</Text>
          <Text className="text-lg font-semibold">online</Text>


        </View>
      </View>

      {/* Icônes d'action */}
      <View className="flex-row gap-8 space-x-8">
        <Ionicons name="call-sharp" size={30} color="black" />
        <MaterialIcons name="video-call" size={30} color="black" />
        <Feather name="more-vertical" size={30} color="black" />
      </View>
    </View>
  );
}