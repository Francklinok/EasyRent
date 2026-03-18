import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import ServiceCreationForm from '@/components/creation/ServiceCreationForm';

const ServiceCreationPage = () => {
  return (
    <View style={{ flex: 1 }}>
      <ServiceCreationForm
        onClose={() => router.back()}
        onSuccess={() => router.back()}
      />
    </View>
  );
};

export default ServiceCreationPage;
