import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const LegalNoticeSection: React.FC = () => {
  return (
    <View className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
      <View className="flex-row items-center mb-2">
        <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />
        <Text className="text-blue-800 font-medium ml-2">Protection juridique</Text>
      </View>
      
      <Text className="text-blue-700 mb-2">
        Ce contrat est légalement valide et conforme à la législation en vigueur sur les baux d'habitation.
      </Text>
      
      <Text className="text-blue-700">
        Il inclut toutes les clauses obligatoires et respecte les droits du locataire et du propriétaire.
      </Text>
      
      <View className="mt-3 pt-3 border-t border-blue-200">
        <Text className="text-blue-700 text-sm">
          Le contrat génère une signature numérique sécurisée et un code QR de vérification pour garantir 
          son authenticité.
        </Text>
      </View>
    </View>
  );
};