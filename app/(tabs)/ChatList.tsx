
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import Header from '@/components/ui/header';
import message from '@/components/messages/messagedata';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

export default function ChatList () {
  // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ChatList'>>();

  return (
    <ThemedView>
      <Header />
      <ThemedView  className="flex gap-4 mt-3 w-full h-full pl-3 pr-3">
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
              style = {{marginTop:4}}
            >
              <ThemedView >
                <ThemedView  className="flex flex-row gap-3 items-center p-1 ">
                  <ThemedView className="w-16 h-16 rounded-full overflow-hidden border border-gray-600">
                    <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
                  </ThemedView>
                  <ThemedView   className="flex-1 ml-1">
                    <ThemedText className="font-bold ">{item.sender.name}</ThemedText>
                    <ThemedText className="text-gray-800 text-sm">{item.content}</ThemedText>
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

