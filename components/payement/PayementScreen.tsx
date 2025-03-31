
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '../ui';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen({ route }) {
  const { reservationId } = route.params;
  const navigation = useNavigation();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto' | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handlePayment = () => {
    if (!paymentMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement');
      return;
    }
    Alert.alert(
      'Paiement',
      `Vous avez sélectionné ${paymentMethod}. Cette fonctionnalité serait intégrée dans une application réelle.`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Paiement</Text>
        
        <Text className="text-lg font-semibold mb-4">Méthode de paiement</Text>
        
        <TouchableOpacity
          className={`flex-row items-center p-4 border rounded-lg mb-3 ${
            paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onPress={() => setPaymentMethod('card')}
        >
          <Ionicons name="card-outline" size={24} color={paymentMethod === 'card' ? '#3B82F6' : '#6B7280'} />
          <View className="ml-3 flex-1">
            <Text className="font-medium">Carte bancaire</Text>
          </View>
          {paymentMethod === 'card' && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-row items-center p-4 border rounded-lg mb-3 ${
            paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onPress={() => setPaymentMethod('paypal')}
        >
          <Ionicons name="logo-paypal" size={24} color={paymentMethod === 'paypal' ? '#3B82F6' : '#6B7280'} />
          <View className="ml-3 flex-1">
            <Text className="font-medium">PayPal</Text>
          </View>
          {paymentMethod === 'paypal' && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-row items-center p-4 border rounded-lg mb-6 ${
            paymentMethod === 'crypto' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onPress={() => setPaymentMethod('crypto')}
        >
          <Ionicons name="logo-bitcoin" size={24} color={paymentMethod === 'crypto' ? '#3B82F6' : '#6B7280'} />
          <View className="ml-3 flex-1">
            <Text className="font-medium">Cryptomonnaie</Text>
          </View>
          {paymentMethod === 'crypto' && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
        </TouchableOpacity>
        
        <CustomButton
          title="Procéder au paiement"
          onPress={handlePayment}
          loading={paymentLoading}
          disabled={paymentLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
