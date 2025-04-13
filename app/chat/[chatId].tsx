import React from 'react';
import { View, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import MessageDisplay from '@/components/messages/chat/MessageBody';
import MessageFooter from '@/components/messages/chat/MessageFooter';
import message from '@/components/messages/messagedata';
import { RootStackParamList } from '@/components/navigator/RouteType';
import { RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/ui/ThemedView';
export default function ChatComponent() {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { id } = route.params;

  // Filtrer les messages par chatId
  const chatMessages = message.filter(msg => msg.id === id);

  // Fonction vide pour l'instant
  const handleSend = () => {
    return;
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar hidden={true} />
      <ThemedView className="h-[85%]">
        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageDisplay message={item} />}
          inverted
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
      <ThemedView className="h-[25%] p-5">
        <MessageFooter onSend={handleSend} />
      </ThemedView>
    </ThemedView>
  );
}