


import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import ItemData from '../components/info';
import { useColorScheme } from '@/hooks/useColorScheme';

// Empêche l'écran de démarrage de se cacher automatiquement avant le chargement des ressources.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Chargement des polices personnalisées
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Masquer l'écran de démarrage lorsque les polices sont chargées
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Retourne null tant que les polices ne sont pas chargées
  }

  const screenOptions = {
    headerShown: false,
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* <Stack screenOptions={screenOptions}> */}
      <Stack>

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

         {/* <Stack.Screen name="Chat" options={{ title: 'Chat' }} /> */}
        <Stack.Screen name="+not-found" options={{ title: 'Page Introuvable' }} />
        
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
