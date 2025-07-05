import React from 'react';
import { Stack } from "expo-router";

export default function ParamsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#fff", // couleur des icônes/texte
      }}
    >
    </Stack>
  );
}
