import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from './ThemedView';

interface FormInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  required = false,
  error,
  hint,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.labelContainer}>
        <ThemedText style={[styles.label, { color: theme.onBackground }]}>
          {label}
          {required && <ThemedText style={{ color: theme.error }}> *</ThemedText>}
        </ThemedText>
        {hint && (
          <ThemedText style={[styles.hint, { color: theme.onSurface + '60' }]}>
            {hint}
          </ThemedText>
        )}
      </ThemedView>

      <TextInput
        placeholderTextColor={theme.onSurface + '50'}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            color: theme.onSurface,
            borderColor: error ? theme.error : theme.outline + '30',
            borderWidth: error ? 2 : 1,
          },
          style,
        ]}
        {...props}
      />

      {error && (
        <ThemedText style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default FormInput;
