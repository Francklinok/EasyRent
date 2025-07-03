import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ThemeProvider } from '@/components/contexts/theme/themeContext';
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
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
    <ThemeProvider initialTheme="system">
      <Stack screenOptions={screenOptions}>

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Page Introuvable' }} />
        
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>

  );
}
