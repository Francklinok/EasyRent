import React from 'react';
import { Alert } from 'react-native';
import { SelectPaymentMethod } from '@/components/wallets/payment/SelectPaymentMethod';
import { router } from 'expo-router';

export default function SelectPaymentMethodPage() {
  const handleSelect = (method: any) => {
    try {
      //show confirmation then go back to previous screen.
      Alert.alert('Méthode sélectionnée', method?.name || method?.type || 'OK');
      router.back();
    } catch (err) {
      console.error('SelectPaymentMethodPage:onSelect', err);
      Alert.alert('Erreur', 'Impossible de sélectionner la méthode.');
    }
  };

  return (
    <SelectPaymentMethod
      action={'payment'}
      onSelect={handleSelect}
      onBack={() => router.back()}
    />
  );
}
