import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';

interface SelectableCardProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SelectableCard: React.FC<SelectableCardProps> = ({
  label,
  icon,
  selected,
  onPress,
  disabled = false,
  size = 'medium',
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    small: { padding: 10, iconSize: 18, fontSize: 13 },
    medium: { padding: 14, iconSize: 24, fontSize: 15 },
    large: { padding: 16, iconSize: 28, fontSize: 16 },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.outline + '30',
          borderWidth: selected ? 2 : 1,
          padding: currentSize.padding,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={currentSize.iconSize}
          color={selected ? 'white' : theme.onSurface}
          style={styles.icon}
        />
      )}
      <ThemedText
        style={[
          styles.label,
          {
            color: selected ? 'white' : theme.onSurface,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 85,
  },
  icon: {
    marginBottom: 6,
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default SelectableCard;
