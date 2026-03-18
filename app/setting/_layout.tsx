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

export default function SettingLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets().top;

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.primary, theme.secondary || theme.primary + '80']}
      style={{
        paddingHorizontal: 20,
        paddingTop: insets + 10,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24
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
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <ThemedText type="subtitle" intensity="strong" style={{ color: 'white' }}>
            Paramètres
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ flexDirection: 'row', gap: 12, backgroundColor: 'transparent' }}>
          <TouchableOpacity
            onPress={() => router.push('/help')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 8
            }}
          >
            <MaterialCommunityIcons name="help-circle" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </LinearGradient>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {renderHeader()}
      <Slot />
    </ThemedView>
  );
}
