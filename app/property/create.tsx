import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import PropertyCreationForm from '@/components/creation/PropertyCreationForm';

const CreatePropertyScreen = () => {
  const handleSuccess = () => {
    Alert.alert(
      'Succès',
      'Propriété créée avec succès',
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
      'Voulez-vous vraiment annuler la création de cette propriété ?',
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
      <PropertyCreationForm
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </ThemedView>
  );
};

export default CreatePropertyScreen;
