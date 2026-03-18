import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../hooks/themehook';

type ElevationLevel = 'small' | 'medium' | 'large';
type IntensityLevel = 'light' | 'normal' | 'strong';
type Variant = 'primary' | 'secondary' | 'accent' | 'default' | 'surface' | 'surfaceVariant';

type SettingsItemProps = {
  label: string;
  icon: string;
  onPress?: () => void;
  iconColor?: string;
  elevated?: boolean | ElevationLevel;
  bordered?: boolean;
  intensity?: IntensityLevel;
  variant?: Variant;
  customBackgroundColor?: string;
  showArrow?: 'on' | 'off';
  type?: 'heading' | 'body' | 'caption' | 'title' | 'subtitle' | 'link' | 'normal' | 'default';
  size?: number;
  description?: string;
  rightElement?: React.ReactNode;
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
  description,
  rightElement,
}) => {
  const { theme } = useTheme();

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
      ]}
    >
      <Ionicons name={icon as any} size={22} color={iconColor || theme.text} />
      <View style={styles.textContainer}>
        <ThemedText
          type={type}
          size={size}
          style={styles.label}
        >
          {label}
        </ThemedText>
        {/* {description && (
          <ThemedText
            type="caption"
            style={styles.description}
          >
            {description}
          </ThemedText>
        )} */}
      </View>
      {rightElement}
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
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
    borderRadius: 0,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    opacity: 0.0,
  },
});
