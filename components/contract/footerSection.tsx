import React from 'react';
import { View, Text } from 'react-native';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';

 const FooterSection: React.FC = () => {
  const currentDate = new Date();
  
  return (
    <ThemedView className="border-t border-gray-200 pt-4 pb-10">
      <ThemedText className="text-center text-gray-500 text-sm mb-2">
        © {currentDate.getFullYear()} RentalHub • Tous droits réservés
      </ThemedText>
      <ThemedText className="text-center text-gray-400 text-xs">
        Document généré le {currentDate.toLocaleDateString('fr-FR')} à {currentDate.toLocaleTimeString('fr-FR')}
      </ThemedText>
      <ThemedText className="text-center text-gray-400 text-xs mt-1">
        Version 2.3.0 • Contrats à valeur juridique
      </ThemedText>
    </ThemedView>
  );
};

export default FooterSection; 