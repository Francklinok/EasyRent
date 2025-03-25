
import React from 'react';
import { Stack } from "expo-router";
import ChatHeader from '@/components/messages/chat/MessageHeader';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => <ChatHeader />,
        headerStyle: {
          backgroundColor: "white",
        },
      }}
    />
  );
}