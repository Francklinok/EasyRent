
// export default Chat;
import React from 'react';
import { View, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import MessageHeader from '@/components/messages/chat/MessageHeade';
import MessageDisplay from '@/components/messages/chat/MessageBody';
import MessageFooter from '@/components/messages/chat/MessageFooter';
import message from '@/components/messages/messagedata';
import { RootStackParamList } from '../navigator/RouteYpe';
import { RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const Chat = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>(); 

  const { id } = route.params; // Utilise uniquement l'ID passé

  // Filtrer les messages par chatId
  const chatMessages = message.filter(msg => msg.id === id); // Assure-toi que tes messages ont une propriété chatId

  // Fonction vide pour l'instant
  const handleSend = () => {
    return ;
  }

  return (
    <View className="flex-1 ">
      {/* Header avec les données du chat */}
      <View className="h-[15%]">
        <MessageHeader name={route.params.name} image={route.params.image} />
      </View>
      <StatusBar hidden={true}/>

      {/* Liste des messages du chat correspondant */}
      <View className="h-[75%]">
        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageDisplay message={item} />}
          inverted
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Footer pour l'envoi de messages */}
      <View className="h-[15%] p-5">
        <MessageFooter onSend={handleSend} />
      </View>
    </View>
  );  
};

export default Chat;
