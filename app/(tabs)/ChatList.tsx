
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import NotificationBadge from '@/components/utils/Notification';
import Header from '@/components/ui/header';
import message from '@/components/messages/messagedata';
// import { RootStackParamList } from '../../components/navigator/RouteType';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import de la prop
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

export default function ChatList () {
  // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ChatList'>>();

  return (
    <ThemedView>
      <Header />
      <ThemedView className="flex gap-10 w-full h-full pl-4 pr-4">
        <FlatList
          data={message}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.navigate({
                  pathname:"/chat/[chatId]",
                  params:{
                    chatId: item.id,
                    name: item.sender.name,
                    image: item.sender.avatar,
                  }
                })
              }
            >
              <ThemedView className="mt-2">
                <ThemedView className="flex flex-row gap-5 items-center p-6 rounded-[20px] bg-white">
                  <ThemedView className="w-16 h-16 rounded-full overflow-hidden border border-gray-600">
                    <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
                  </ThemedView>
                  <ThemedView className="flex-1 ml-4">
                    <ThemedText className="font-bold text-lg">{item.sender.name}</ThemedText>
                    <ThemedText className="text-gray-500 text-sm">{item.content}</ThemedText>
                  </ThemedView>
                  <ThemedView className="items-end">
                    {/* {item.count > 0 && <NotificationBadge count={item.count} />} */}
                    <Text className="text-gray-600 text-xs mt-2">{item.timestamp}</Text>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          )}
        />
      </ThemedView>
    </ThemedView>
  );
};

