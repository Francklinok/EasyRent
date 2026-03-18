import React from 'react';
import { Slot } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';

export default function PremiumLayout() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Slot />
    </ThemedView>
  );
}
