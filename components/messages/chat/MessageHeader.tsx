
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { RootStackParamList } from '@/components/navigator/RouteType';
import { RouteProp } from '@react-navigation/native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

export default function ChatHeader() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { name, image } = route.params;
  
  return (
    <ThemedView className="flex-row items-center justify-between w-full px-3 py-2.5 border-b border-[#2C2F33] bg-[#36393F]">
      {/* Bouton de retour */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="p-1 mr-2"
      >
        <Ionicons name="arrow-back" size={22} color="#B9BBBE" />
      </TouchableOpacity>
      
      {/* Avatar et Nom */}
      <ThemedView className="flex-row items-center flex-1">
        <View className="relative">
          <Image
            source={{ uri:'https://i.pravatar.cc/150' }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View className="absolute right-3 bottom-0 w-3 h-3 rounded-full bg-[#3BA55D] border-2 border-[#36393F]" />
        </View>
        
        <ThemedView className="flex justify-center">
          <ThemedText className="font-bold text-white text-base">{name}</ThemedText>
          <ThemedText className="text-xs text-[#3BA55D]">En ligne</ThemedText>
        </ThemedView>
      </ThemedView>
      
      {/* Icônes d'action */}
      <ThemedView className="flex-row items-center">
        <TouchableOpacity className="p-2">
          <Ionicons name="call-sharp" size={20} color="#B9BBBE" />
        </TouchableOpacity>
        
        <TouchableOpacity className="p-2">
          <MaterialIcons name="video-call" size={22} color="#B9BBBE" />
        </TouchableOpacity>
        
        <TouchableOpacity className="p-2">
          <Feather name="more-vertical" size={20} color="#B9BBBE" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
