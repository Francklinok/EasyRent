
import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { useTheme, useThemeControls,useThemeConfig } from '../contexts/theme/themehook';
import { ThemeType } from '../contexts/theme/ThemeTypes';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { ThemedButton } from './ThemedButton';
import { ThemedCard } from './ThemeCard';
import { ThemedDivider } from './ThemeDivided';

// Dimensions de l'écran pour le modal

// Type pour les props du sélecteur de thème
type ThemeSelectorProps = {
  onClose?: () => void;
  compact?: boolean;
  showSystemOption?: boolean;
  modalTitle?: string;
  actionButtonTitle?: string;
};

// Composant principal du sélecteur de thème
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onClose,
  compact = false,
  showSystemOption = true,
  modalTitle = "Choisir un thème",
  actionButtonTitle = "Fermer",
}) => {
  const { themes, setTheme, currentTheme } = useThemeControls();
  const themeContext = useTheme();
  
  // Calculer les thèmes disponibles
  const availableThemes = Object.entries(themes).filter(([name]) => {
    // Filtrer l'option système si demandé
    if (name === 'system' && !showSystemOption) return false;
    return true;
  });
  
  // Rendu d'un élément de thème
  const renderThemeItem = ([name, themeColors]: [string, any]) => (
    <TouchableOpacity
      key={name}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: compact ? 8 : 12,
        marginBottom: 8,
        backgroundColor: themeColors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: currentTheme === name ? themeColors.primary : 'transparent'
      }}
      onPress={() => {
        setTheme(name as ThemeType);
        if (compact) onClose?.();
      }}
    >
      <View 
        style={{ 
          width: 24, 
          height: 24, 
          borderRadius: 12, 
          backgroundColor: themeColors.primary,
          marginRight: 12 
        }} 
      />
      
      <ThemedText style={{ color: themeColors.text, flex: 1 }}>
        {name === 'system' ? 'Système' : name.charAt(0).toUpperCase() + name.slice(1)}
      </ThemedText>
      
      {currentTheme === name && (
        <View style={{ 
          width: 20, 
          height: 20, 
          borderRadius: 10, 
          backgroundColor: themeColors.primary, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <ThemedText style={{ color: '#fff' }}>✓</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  // Version compacte (liste simple)
  if (compact) {
    return (
      <View style={{ padding: 8 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
          {availableThemes.map(renderThemeItem)}
        </ScrollView>
      </View>
    );
  }
  
  // Version complète (avec preview)
  return (
    <View style={{ padding: 16 }}>
      <ThemedText type="heading" style={{ marginBottom: 16 }}>
        {modalTitle}
      </ThemedText>
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
        {availableThemes.map(renderThemeItem)}
      </ScrollView>
      
      <ThemedDivider style={{ marginVertical: 16 }} />
      
      <ThemedButton
        title={actionButtonTitle}
        variant="primary"
        onPress={onClose}
        withGradient
      />
    </View>
  );
};

