import React from 'react';
import { View, Text } from 'react-native';

export const FooterSection: React.FC = () => {
  const currentDate = new Date();
  
  return (
    <View className="border-t border-gray-200 pt-4 pb-10">
      <Text className="text-center text-gray-500 text-sm mb-2">
        © {currentDate.getFullYear()} RentalHub • Tous droits réservés
      </Text>
      <Text className="text-center text-gray-400 text-xs">
        Document généré le {currentDate.toLocaleDateString('fr-FR')} à {currentDate.toLocaleTimeString('fr-FR')}
      </Text>
      <Text className="text-center text-gray-400 text-xs mt-1">
        Version 2.3.0 • Contrats à valeur juridique
      </Text>
    </View>
  );
};