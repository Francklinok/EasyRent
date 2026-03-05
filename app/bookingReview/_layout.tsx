import React from 'react';
import { Slot } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets().top;

  const renderHeader = () => (
    <ThemedView
      style={{
        paddingHorizontal: 20,
        paddingTop: insets + 10,
        paddingBottom: 10,
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.outline + '30',
      }}
    >
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText type="subtitle" intensity="strong">
            booking Review
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/help')}
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="help-circle" size={20} color={theme.onSurface} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {renderHeader()}
      <Slot />
    </ThemedView>
  );
}
