import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { useTheme, useThemeTransition } from '../contexts/theme/themehook';
import { ThemedView } from './ThemedView';
type SearchBarProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary' | 'accent' | 'default' | 'surface' | 'surfaceVariant';
  bordered?: boolean;
  elevated?: 'small' | 'medium' | 'large' | boolean;
  intensity?: 'light' | 'normal' | 'strong';
  backgroundColor?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({
  children,
  style,
  variant = 'default',
  bordered = false,
  elevated = false,
  intensity = 'normal',
  backgroundColor: customBackgroundColor,
}) => {
  const { theme } = useTheme();
  const { isAnimatingTheme, getTransitionStyle } = useThemeTransition();

  const getBackgroundColor = () => {
    if (customBackgroundColor) return customBackgroundColor;
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.secondary;
      case 'accent': return theme.accent;
      case 'surface': return theme.surface;
      case 'surfaceVariant': return theme.surfaceVariant;
      default:
        return Array.isArray(theme.background) ? theme.background[0] : theme.background;
    }
  };

  const getElevation = (): StyleProp<ViewStyle> => {
    if (!elevated) return {};
    const shadowColor = theme.shadow?.color || '#000';
    const shadowOpacity = theme.shadow?.opacity || 0.1;
    const level = typeof elevated === 'string' ? elevated : 'small';

    const config = {
      small: { offset: 1, radius: 2, elevation: 2 },
      medium: { offset: 2, radius: 4, elevation: 4 },
      large: { offset: 4, radius: 8, elevation: 8 },
    }[level];

    return {
      shadowColor,
      shadowOffset: { width: 0, height: config.offset },
      shadowOpacity,
      shadowRadius: config.radius,
      elevation: config.elevation,
    };
  };

  const getBorder = (): StyleProp<ViewStyle> => {
    if (!bordered) return {};
    return {
      borderWidth: 1,
      borderColor: theme.outline || '#e2e8f0',
    };
  };

  const getIntensity = (): StyleProp<ViewStyle> => {
    switch (intensity) {
      case 'light': return { opacity: 0.7 };
      case 'strong': return { opacity: 1 };
      default: return {};
    }
  };

  return (
    <ThemedView
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          backgroundColor: customBackgroundColor ?? getBackgroundColor(),

        },
        getBorder(),
        getElevation(),
        getIntensity(),
        isAnimatingTheme && getTransitionStyle(),
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
};

export default SearchBar;
