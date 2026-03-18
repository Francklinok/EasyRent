import React from 'react';
import { Slot } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets().top;

  const renderHeader = () => (
    <ThemedView
      style={{
        paddingHorizontal: 20,
        paddingTop: insets + 10,
        paddingBottom: 10,
      }}
    >
      <ThemedView style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent'
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color= {theme.text} />
          </TouchableOpacity>
          <ThemedText type="subtitle" intensity="strong" style={{ color: theme.text }}>
            Confidentialité
          </ThemedText>
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
