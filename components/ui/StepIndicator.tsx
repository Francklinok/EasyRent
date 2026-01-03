import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/components/contexts/theme/themehook';
import { MaterialIcons } from '@expo/vector-icons';

interface Step {
  number: number;
  title: string;
  subtitle: string;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  const { theme } = useTheme();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.outline + '20',
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={[styles.mainTitle, { color: theme.onSurface }]}>
          Créer une annonce
        </ThemedText>

        <View style={styles.stepBadge}>
          <MaterialIcons name="info-outline" size={14} color={theme.primary} />
          <ThemedText style={[styles.stepText, { color: theme.primary }]}>
            Étape {currentStep}/{totalSteps}
          </ThemedText>
        </View>
      </View>

      {/* Current Step Info */}
      <View style={styles.currentStepInfo}>
        <ThemedText style={[styles.stepTitle, { color: theme.onBackground }]}>
          {steps[currentStep - 1]?.title}
        </ThemedText>
        <ThemedText style={[styles.stepSubtitle, { color: theme.onSurface + '70' }]}>
          {steps[currentStep - 1]?.subtitle}
        </ThemedText>
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressBarContainer,
          { backgroundColor: theme.surfaceVariant },
        ]}
      >
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: theme.primary,
              width: `${(currentStep / totalSteps) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Mini Steps */}
      <View style={styles.miniSteps}>
        {steps.map((step) => (
          <View
            key={step.number}
            style={[
              styles.miniStep,
              {
                backgroundColor:
                  step.number <= currentStep
                    ? theme.primary
                    : theme.surfaceVariant,
              },
            ]}
          >
            {step.number < currentStep ? (
              <MaterialIcons name="check" size={12} color="white" />
            ) : (
              <ThemedText
                style={[
                  styles.miniStepText,
                  {
                    color: step.number === currentStep ? 'white' : theme.onSurface + '40',
                  },
                ]}
              >
                {step.number}
              </ThemedText>
            )}
          </View>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
  },
  currentStepInfo: {
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressBarContainer: {
    borderRadius: 8,
    height: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
  },
  miniSteps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  miniStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStepText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StepIndicator;
