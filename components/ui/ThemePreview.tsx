
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeType, Theme } from '../../context/theme/ThemeTypes';
import { ThemedText } from './ThemedComponents';

// Props du composant de prévisualisation de thème
type ThemePreviewProps = {
  theme: Theme;
  themeName: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  onPress?: () => void;
};

// Composant de prévisualisation de thème
export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  themeName,
  size = 'medium',
  showName = true,
  onPress,
}) => {
  // Déterminer les dimensions selon la taille choisie
  const getDimensions = () => {
    switch (size) {
      case 'small': return { width: 80, height: 80 };
      case 'large': return { width: 200, height: 200 };
      default: return { width: 120, height: 120 };
    }
  };
  
  const dimensions = getDimensions();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{ alignItems: 'center', margin: 8 }}
    >
      <LinearGradient
        colors={Array.isArray(theme.background) ? theme.background : [theme.background, theme.background]}
        style={[
          styles.container,
          dimensions,
          {
            borderRadius: size === 'small' ? 8 : size === 'large' ? 16 : 12,
            borderWidth: 1,
            borderColor: theme.outline,
          },
        ]}
      >
        {/* Éléments de prévisualisation */}
        <View style={styles.header}>
          <View
            style={{
              width: size === 'small' ? 12 : size === 'large' ? 24 : 16,
              height: size === 'small' ? 12 : size === 'large' ? 24 : 16,
              borderRadius: size === 'small' ? 6 : size === 'large' ? 12 : 8,
              backgroundColor: theme.primary,
            }}
          />
          
          <View
            style={{
              flex: 1,
              height: size === 'small' ? 6 : size === 'large' ? 12 : 8,
              marginHorizontal: size === 'small' ? 2 : size === 'large' ? 8 : 4,
              backgroundColor: theme.surface,
              borderRadius: 4,
            }}
          />
        </View>
        
        <View style={styles.content}>
          <View
            style={{
              width: '100%',
              height: size === 'small' ? 16 : size === 'large' ? 40 : 24,
              backgroundColor: theme.surface,
              borderRadius: size === 'small' ? 4 : size === 'large' ? 10 : 6,
              marginBottom: size === 'small' ? 4 : size === 'large' ? 12 : 8,
            }}
          />
          
          <View
            style={{
              width: '60%',
              height: size === 'small' ? 6 : size === 'large' ? 16 : 10,
              backgroundColor: theme.secondary,
              borderRadius: size === 'small' ? 2 : size === 'large' ? 8 : 4,
              marginBottom: size === 'small' ? 4 : size === 'large' ? 12 : 8,
            }}
          />
          
          <View
            style={{
              width: '40%',
              height: size === 'small' ? 6 : size === 'large' ? 16 : 10,
              backgroundColor: theme.accent,
              borderRadius: size === 'small' ? 2 : size === 'large' ? 8 : 4,
            }}
          />
        </View>
      </LinearGradient>
      
      {showName && (
        <ThemedText
          style={{
            marginTop: 8,
            fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14,
            fontWeight: '500',
          }}
        >
          {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});