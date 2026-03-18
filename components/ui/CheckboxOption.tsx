import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';

interface CheckboxOptionProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}

const CheckboxOption: React.FC<CheckboxOptionProps> = ({
  label,
  description,
  checked,
  onToggle,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.outline + '30',
        },
      ]}
    >
      <MaterialIcons
        name={checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={checked ? theme.primary : theme.onSurface + '60'}
      />

      <View style={styles.textContainer}>
        <ThemedText style={[styles.label, { color: theme.onSurface }]}>
          {label}
        </ThemedText>
        {description && (
          <ThemedText style={[styles.description, { color: theme.onSurface + '70' }]}>
            {description}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default CheckboxOption;
