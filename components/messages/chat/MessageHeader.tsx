import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/components/navigator/RouteType';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


export default function ChatHeader() {
  
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();

  const { name, image, status = 'En ligne', chatId } = route.params;
  const insets = useSafeAreaInsets();

  const statusColor = status.includes('écrire') ? '#FAA61A' : '#3BA55D';

  const handleOpenContactInfo = () => {
    navigation.navigate('ContactInfo', {
      name,
      image,
      status,
      chatId,
    });
  };

  return (
    <ThemedView
      className="flex-row items-center justify-between w-full px-3 py-2.5 border-b border-[#2C2F33] bg-[#36393F]"
      style={{ paddingTop: insets.top }}
    >
      {/* ⬅️ Retour */}
      <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 mr-2">
        <Ionicons name="arrow-back" size={22} color="#B9BBBE" />
      </TouchableOpacity>

      {/* 👤 Avatar + Nom + Statut */}
      <TouchableOpacity onPress={handleOpenContactInfo} className="flex-row items-center flex-1">
        <View className="relative mr-3">
          <Image
            source={{ uri: image || 'https://i.pravatar.cc/150' }}
            className="w-10 h-10 rounded-full"
          />
          <View
            className="absolute right-0 bottom-0 w-3 h-3 rounded-full border-2 border-[#36393F]"
            style={{ backgroundColor: statusColor }}
          />
        </View>

        <ThemedView>
          <ThemedText className="font-bold text-white text-base">{name}</ThemedText>
          <ThemedText className="text-xs" style={{ color: statusColor }}>
            {status}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

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
