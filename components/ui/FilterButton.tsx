import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '../contexts/theme/themehook';
interface FilterButtonProps {
  onPress?: () => void;
  children: React.ReactNode; // Accepte du contenu à l'intérieur

}

const   {theme} = useTheme()
 const FilterButton: React.FC<FilterButtonProps> = ({ onPress }) => (
  <TouchableOpacity style={styles.filterButton} onPress={onPress}>
    <ThemedText style={styles.text}>Filtrer</ThemedText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor:theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 9999,
    marginLeft: 8
  },
  text: {
    color:theme.surface
  }
});

export default FilterButton
