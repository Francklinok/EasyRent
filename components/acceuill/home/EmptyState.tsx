import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/components/contexts/theme/themehook';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

interface EmptyStateProps {
  message?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = "Aucune propriété disponible",
  icon = "home-search",
  actionText = "Actualiser",
  onAction
}) => {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 200 }}
        style={styles.content}
      >
        <LinearGradient
          colors={[theme.primary + '20', theme.secondary + '20']}
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons name={icon} size={64} color={theme.primary} />
        </LinearGradient>

        <ThemedText type="heading" style={[styles.message, { color: theme.typography.heading }]}>
          {message}
        </ThemedText>

        <ThemedText type="body" style={[styles.description, { color: theme.typography.caption }]}>
          Essayez de modifier vos filtres ou de rafraîchir la page
        </ThemedText>

        {onAction && (
          <TouchableOpacity
            onPress={onAction}
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
          >
            <ThemedText style={{ color: theme.surface, fontWeight: '600' }}>
              {actionText}
            </ThemedText>
          </TouchableOpacity>
        )}
      </MotiView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default EmptyState;
