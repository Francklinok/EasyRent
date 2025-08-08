
import React from 'react';
import { Stack } from "expo-router";
import { useTheme } from '@/components/contexts/theme/themehook';

export default function BookingLayout() {
  const  {theme} = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}