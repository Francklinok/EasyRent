import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FilterButtonProps {
  onPress?: () => void;
  children: React.ReactNode; // Accepte du contenu à l'intérieur

}

export const FilterButton: React.FC<FilterButtonProps> = ({ onPress }) => (
  <TouchableOpacity style={styles.filterButton} onPress={onPress}>
    <Text style={styles.text}>Filtrer</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 9999,
    marginLeft: 8
  },
  text: {
    color: 'white',
    fontWeight: 'bold'
  }
});
