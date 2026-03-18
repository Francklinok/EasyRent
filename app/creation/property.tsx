import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import PropertyCreationForm from '@/components/creation/PropertyCreationForm';
import { ThemedView } from '@/components/ui/ThemedView';
const PropertyCreationPage = () => {
  return (
    <ThemedView  style={{ flex: 1 }}>
      <PropertyCreationForm
        onClose={() => router.back()}
        onSuccess={() => router.back()}
      />
    </ThemedView>
  );
};

export default PropertyCreationPage;
