import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ThemeProvider } from '@/components/contexts/theme/themeContext';
import { NotificationProvider } from '@/components/contexts/notifications/NotificationContext';
import { FavoritesProvider } from '@/components/contexts/favorites/FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Charger la police
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        if (!fontsLoaded) return; // Attendre que les fonts soient prêtes

        // Vérifier token
        const token = await AsyncStorage.getItem('token');
        if (token) {
          console.log('✅ Token trouvé → Home');
          router.replace('/(tabs)');
        } else {
          console.log('❌ Pas de token → Login');
          router.replace('/Auth/Login');
        }
      } catch (error) {
        console.error('Erreur auth:', error);
      } finally {
        setLoadingAuth(false);
        await SplashScreen.hideAsync();
      }
    };

    initApp();
  }, [fontsLoaded]);

  if (!fontsLoaded || loadingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ThemeProvider initialTheme="system">
      <NotificationProvider>
        <FavoritesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="Auth/Login" options={{ headerShown: false }} />
            <Stack.Screen name="Auth/Register" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: 'Page Introuvable' }} />
          </Stack>
          <StatusBar style="auto" />
        </FavoritesProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
