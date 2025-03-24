
// export default MessageHeader;
import React from 'react';
import { View, Text, Image, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';

type MessageHeaderProps = {
  name: string; // Le nom du contact
  image: string; // L'avatar du contact
};

// type MessageHeaderProps = {
//   message: Message;
// };


const MessageHeader: React.FC<MessageHeaderProps> = ({ name, image }) => {
  return (
    <SafeAreaView style={{ backgroundColor: 'white'}}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="flex-row p-4 justify-between bg-white shadow-md rounded-t-lg">
        {/* Partie Avatar à gauche */}
        <View className="p-2">
          <Image 
            source={{ uri: image }} // Utilisation de l'image passée en prop
            className="w-12 h-12 rounded-full mr-4" 
          />
        </View>

        {/* Partie Nom au centre */}
        <View className="flex justify-center">
          <Text className="text-lg font-semibold">{name}</Text> {/* Utilisation du nom passé en prop */}
          {/* <Text className="text-sm text-gray-500">{message.isOnline ? "Online" : "Offline"}</Text> */}

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
