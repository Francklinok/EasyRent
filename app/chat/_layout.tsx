import React from 'react';
import { Stack } from 'expo-router';
import ChatHeader from '@/components/messages/chat/MessageHeader';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[chatId]"
        options={{
          header: () => <ChatHeader />,
          headerShown: true,
        }}
      />
    </Stack>
  );
}
