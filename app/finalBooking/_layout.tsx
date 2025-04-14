
import React from 'react';
import { Stack } from "expo-router";

export default function FinalBookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "white",
        },
      }}
    />
  );
}