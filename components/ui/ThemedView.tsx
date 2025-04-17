import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme, useThemeTransition } from "../contexts/theme/themehook";

// Type for themed component base props
type ThemedComponentProps = {
  variant?: 'primary' | 'secondary' | 'accent' | 'default' | 'surface' | 'surfaceVariant';
  bordered?: boolean;
  elevated?: 'small' | 'medium' | 'large' | boolean;
  intensity?: 'light' | 'normal' | 'strong';
};

// Complete type for themed view
export type ThemedViewProps = ViewProps & ThemedComponentProps & {
  backgroundColor?: string; // Custom background color that overrides variant
};

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  children,
  variant = 'default',
  bordered = false,
  elevated = false,
  intensity = 'normal',
  backgroundColor: customBackgroundColor,
  ...props
}) => {
  const { theme } = useTheme();
  const { isAnimatingTheme, getTransitionStyle } = useThemeTransition();

  // Determine background color based on variant
  const getBackgroundColor = () => {
    if (customBackgroundColor) return customBackgroundColor;
    
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.secondary;
      case 'accent': return theme.accent;
      case 'surface': return theme.surface;
      case 'surfaceVariant': return theme.surfaceVariant;
      case 'default':
      default:
        // Use the first background color if it's an array
        return Array.isArray(theme.background) ? theme.background[0] : theme.background;
    }
  };

  // Apply elevation shadow if needed
  const getElevation = () => {
    if (!elevated) return {};

    let shadowColor = theme.shadow?.color || '#000000';
    let shadowOpacity = theme.shadow?.opacity || 0.1;
    let elevationLevel: 'small' | 'medium' | 'large' = 'small';

    if (typeof elevated === 'string') {
      elevationLevel = elevated;
    }

    const shadowValue = theme.elevation?.[elevationLevel] || 
      (elevationLevel === 'small' ? 'rgba(0, 0, 0, 0.1)' : 
       elevationLevel === 'medium' ? 'rgba(0, 0, 0, 0.15)' : 
       'rgba(0, 0, 0, 0.2)');
    
    return {
      shadowColor,
      shadowOffset: { width: 0, height: elevationLevel === 'small' ? 1 : elevationLevel === 'medium' ? 2 : 4 },
      shadowOpacity,
      shadowRadius: elevationLevel === 'small' ? 2 : elevationLevel === 'medium' ? 4 : 8,
      elevation: elevationLevel === 'small' ? 2 : elevationLevel === 'medium' ? 4 : 8,
      backgroundColor: shadowValue // This is needed for Android elevation
    };
  };

  // Apply border if needed
  const getBorder = () => {
    if (!bordered) return {};

    return {
      borderWidth: 1,
      borderColor: theme.outline || '#e2e8f0',
    };
  };

  // Apply intensity modifications
  const getIntensity = () => {
    switch (intensity) {
      case 'light': return { opacity: 0.7 };
      case 'strong': return { opacity: 1 };
      default: return {};
    }
  };

  return (
    <View
      style={[
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        getElevation(),
        getIntensity(),
        isAnimatingTheme && getTransitionStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

