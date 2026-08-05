import React from 'react';
import { Alert } from 'react-native';
import { SelectPaymentMethod } from '@/components/wallets/payment/SelectPaymentMethod';
import { UserAction } from '@/types/payment';
import { router } from 'expo-router';

const PLACEHOLDER_ACTION: UserAction = {
  id: 'payment',
  type: 'reservation',
  title: 'Paiement',
  amount: 0,
  currency: 'XOF',
  status: 'pending',
  createdAt: new Date(),
};

export default function SelectPaymentMethodPage() {
  const handleSelect = (method: any) => {
    try {
      Alert.alert('Méthode sélectionnée', method?.name || method?.type || 'OK');
      router.back();
    } catch (err) {
      console.error('SelectPaymentMethodPage:onSelect', err);
      Alert.alert('Erreur', 'Impossible de sélectionner la méthode.');
    }
  };

  return (
    <SelectPaymentMethod
      action={PLACEHOLDER_ACTION}
      onSelect={handleSelect}
      onBack={() => router.back()}
    />
  );
}
