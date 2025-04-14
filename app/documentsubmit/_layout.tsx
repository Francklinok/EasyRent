
import React from 'react';
import { Stack } from "expo-router";

export default function DocLayout() {
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