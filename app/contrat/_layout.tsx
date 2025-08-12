
import React from 'react';
import { Stack } from "expo-router";

export default function ContratLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "white",
        },
      }}
    />
  );
}