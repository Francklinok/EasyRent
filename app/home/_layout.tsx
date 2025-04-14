import React from 'react';
import { Stack } from "expo-router";
import { useThemeColors } from '@/components/contexts/theme/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, StatusBar as RNStatusBar } from 'react-native';

export default function HomeLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  
  // Utilisez l'importation correcte de StatusBar et accédez à currentHeight de manière sécurisée
  const statusBarHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;
  
  // Calculer la hauteur correcte du header en fonction de la plateforme
  const headerHeight = Platform.OS === 'android' 
    ? 70 + statusBarHeight 
    : 0 + insets.top;

  return (
    <Stack
      screenOptions={{
        headerShown: false,

        headerStyle: {
          backgroundColor: colors.background, 
        },

        contentStyle: { 
        },
        
        headerTransparent: false,
      }}
    />
  );
}
