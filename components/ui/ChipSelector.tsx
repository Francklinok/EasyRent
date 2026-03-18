import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';

interface ChipSelectorProps {
  label?: string;
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
  multiSelect?: boolean;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  label,
  options,
  selectedOptions,
  onToggle,
  multiSelect = true,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={[styles.label, { color: theme.onBackground }]}>
          {label}
        </ThemedText>
      )}

      <View style={styles.chipsContainer}>
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);

          return (
            <TouchableOpacity
              key={option}
              onPress={() => onToggle(option)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primary : theme.outline + '30',
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? 'white' : theme.onSurface,
                  },
                ]}
              >
                {option}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ChipSelector;
