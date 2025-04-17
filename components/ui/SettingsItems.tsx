import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useTheme, useThemeTransition } from '../contexts/theme/themehook';
import AntDesign from '@expo/vector-icons/AntDesign';
type ElevationLevel = 'small' | 'medium' | 'large';
type IntensityLevel = 'light' | 'normal' | 'strong';
type Variant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'default'
  | 'surface'
  | 'surfaceVariant';

type SettingsItemProps = {
  label: string;
  icon: string;
  onPress: () => void;
  iconColor?: string;
  elevated?: boolean | ElevationLevel;
  bordered?: boolean;
  intensity?: IntensityLevel;
  variant?: Variant;
  customBackgroundColor?: string; // 👈 ici
  showArrow?: 'on' | 'off'; // Ajout de la prop showArrow
};

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  onPress,
  iconColor,
  customBackgroundColor,
  showArrow = 'off', // Valeur par défaut 'off'
}) => {
  const { theme } = useTheme();
  const { isAnimatingTheme, getTransitionStyle } = useThemeTransition();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: customBackgroundColor,
          borderRadius: 10,
        },
        isAnimatingTheme && getTransitionStyle(),
      ]}
    >
      <Ionicons name={icon} size={22} color={iconColor || theme.text} />
      <ThemedText style={styles.label}>{label}</ThemedText>
      {/* Si showArrow est 'on', on affiche l'icône ">" */}
      {showArrow === 'on' && (
        <AntDesign name="right" size={22} style={styles.iconL} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#475569",
    position: 'relative', // Important pour le positionnement absolu de l'icône
  },
  label: {
    fontSize: 16,
    flex: 1, // Permet au texte de prendre tout l'espace restant
  },
  iconL: {
    position: 'absolute', // Positionnement absolu
    right: 10, // Place l'icône à droite avec un petit espace
    color: '#475569', // Couleur de l'icône ">"
  }
});
