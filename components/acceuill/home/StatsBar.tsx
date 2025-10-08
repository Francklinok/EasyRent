import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/components/contexts/theme/themehook';
import { MotiView } from 'moti';

interface StatsBarProps {
  totalProperties: number;
  availableProperties: number;
  newThisWeek?: number;
}

const StatsBar: React.FC<StatsBarProps> = ({
  totalProperties,
  availableProperties,
  newThisWeek = 0
}) => {
  const { theme } = useTheme();

  const stats = [
    {
      icon: 'home-city',
      value: totalProperties,
      label: 'Propriétés',
      color: theme.primary,
    },
    {
      icon: 'check-circle',
      value: availableProperties,
      label: 'Disponibles',
      color: theme.success,
    },
    {
      icon: 'star',
      value: newThisWeek,
      label: 'Nouveautés',
      color: theme.star,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      {stats.map((stat, index) => (
        <MotiView
          key={stat.label}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: index * 100, type: 'spring' }}
          style={[styles.statCard, { backgroundColor: theme.surfaceVariant }]}
        >
          <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
          <ThemedView variant="surfaceVariant" style={{ marginLeft: 8 }}>
            <ThemedText type="heading" style={[styles.value, { color: theme.typography.heading }]}>
              {stat.value}
            </ThemedText>
            <ThemedText type="caption" style={[styles.label, { color: theme.typography.caption }]}>
              {stat.label}
            </ThemedText>
          </ThemedView>
        </MotiView>
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    fontSize: 10,
    marginTop: 1,
  },
});

export default StatsBar;
