 
import React from 'react';
import { View, Text, Image, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';

// Définir les types pour message et sender
type Sender = {
  name: string;
  avatar: string;
};

type Message = {
  sender: Sender;
  isOnline: boolean;
};

type MessageHeaderProps = {
  message: Message;
};

const MessageHeader: React.FC<MessageHeaderProps> = ({ message }) => {
  return (
    <SafeAreaView style={{ backgroundColor: 'white', paddingTop: StatusBar.currentHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="flex-row p-4 justify-between bg-white shadow-md rounded-t-lg">
        {/* Partie Avatar à gauche */}
        <View className="p-2">
          <Image 
            source={{ uri: message.sender.avatar }} 
            className="w-12 h-12 rounded-full mr-4" 
          />
        </View>

        {/* Partie Nom et Status au centre */}
        <View className="flex justify-center">
          <Text className="text-lg font-semibold">{message.sender.name}</Text>
          <Text className="text-sm text-gray-500">{message.isOnline ? "Online" : "Offline"}</Text>
        </View>

        {/* Partie Icônes à droite */}
        <View className="flex flex-row gap-8 items-center space-x-8 pr-5">
          <Ionicons name="call-sharp" size={24} color="black" />
          <MaterialIcons name="video-call" size={24} color="black" />
          <Feather name="more-vertical" size={24} color="black" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MessageHeader;
