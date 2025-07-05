import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ThemedText } from './ThemedText';
import { useTheme, useThemeTransition } from '../contexts/theme/themehook';

type ElevationLevel = 'small' | 'medium' | 'large';
type IntensityLevel = 'light' | 'normal' | 'strong';
type Variant = 'primary' | 'secondary' | 'accent' | 'default' | 'surface' | 'surfaceVariant';

type SettingsItemProps = {
  label: string;
  icon: string;
  onPress: () => void;
  iconColor?: string;
  elevated?: boolean | ElevationLevel;
  bordered?: boolean;
  intensity?: IntensityLevel;
  variant?: Variant;
  customBackgroundColor?: string;
  showArrow?: 'on' | 'off';
  type?: 'heading' | 'body' | 'caption' | 'title' | 'subtitle' | 'link' | 'normal' | 'default';
  size?: number;
};

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  onPress,
  iconColor,
  customBackgroundColor,
  showArrow = 'off',
  bordered = true,
  elevated = false,
  intensity = 'normal',
  variant = 'default',
  type = 'default',
  size,
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

  const getElevationStyle = (): ViewStyle => {
    if (!elevated) return {};
    const level = typeof elevated === 'string' ? elevated : 'small';
    const shadowColor = theme.shadow?.color || '#000';
    const shadowOpacity = theme.shadow?.opacity || 0.1;

    return {
      shadowColor,
      shadowOffset: { width: 0, height: level === 'small' ? 1 : level === 'medium' ? 2 : 4 },
      shadowOpacity,
      shadowRadius: level === 'small' ? 2 : level === 'medium' ? 4 : 6,
      elevation: level === 'small' ? 2 : level === 'medium' ? 4 : 8,
    };
  };

  const getBorderStyle = (): ViewStyle => {
    if (!bordered) return {};
    return {
      borderBottomWidth: 1,
      borderBottomColor: theme.outline,
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
        },
        getElevationStyle(),
        getBorderStyle(),
        isAnimatingTheme && getTransitionStyle(),
      ]}
    >
      <Ionicons name={icon as any} size={22} color={iconColor || theme.text} />
      <ThemedText
        type={type}
        size={size}
        style={styles.label}
      >
        {label}
      </ThemedText>
      {showArrow === 'on' && (
        <AntDesign name="right" size={18} color={theme.outline} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  label: {
    flex: 1,
  },
});
