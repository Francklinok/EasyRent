import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import ServiceCreationForm from '@/components/creation/ServiceCreationForm';

const CreateServiceScreen = () => {
  const handleSuccess = (service: any) => {
    Alert.alert(
      'Succès',
      'Service créé avec succès',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Annuler la création',
      'Voulez-vous vraiment annuler la création de ce service ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ServiceCreationForm
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </ThemedView>
  );
};

export default CreateServiceScreen;
