import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/themehook';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/contexts/theme/themeContext';
import { LanguageProvider } from '@/components/contexts/language';
import { NotificationProvider } from '@/components/contexts/notifications/NotificationContext';
import { FavoritesProvider } from '@/components/contexts/favorites/FavoritesContext';
import { BookingProvider } from '@/components/contexts/booking/BookingContext';
import { ActivityProvider } from '@/components/contexts/activity/ActivityContext';
import { AuthProvider } from '@/components/contexts/authContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { UserProvider } from '@/components/contexts/user/UserContext';
import { initApiService } from '@/services/api/apiService';
import { API_CONFIG } from '@/constants/apiConfig';
import { InAppNotificationListener } from '@/components/notifications/InAppNotificationListener';
import { PrivacyProvider } from '@/components/contexts/privacy/PrivacyContext';
import { FavoritesSyncManager } from '@/components/contexts/favorites/FavoritesSyncManager';
import { initializeOfflineServices } from '@/services/offline';


SplashScreen.preventAutoHideAsync();

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        if (!fontsLoaded) return; // Attendre que les fonts soient prêtes

        // Initialize offline services (cache, database, sync)
        await initializeOfflineServices();
        console.log('✅ Offline Services initialized');

        // Initialize API service
        initApiService(null, API_CONFIG.BASE_URL);
        console.log('✅ API Service initialized');

        // Check authentication with AuthContext
        const token = await AsyncStorage.getItem('token');
        if (token) {
          console.log('✅ Token found → Home');
          router.replace('/(tabs)');
        } else {
          console.log('❌ No token → Login');
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
    <SafeAreaProvider>
      <ThemeProvider initialTheme="system">
        <LanguageProvider defaultLanguage="fr">
          <AuthProvider>
            <UserProvider>
              <PrivacyProvider>
                <NotificationProvider>
                  <FavoritesProvider>
                    <FavoritesSyncManager />
                    <BookingProvider>
                      <ActivityProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                          <Stack.Screen name="Auth/Login" options={{ headerShown: false }} />
                          <Stack.Screen name="Auth/Register" options={{ headerShown: false }} />
                          <Stack.Screen
                            name="creation"
                            options={{
                              headerShown: false,
                              presentation: 'card',
                              animation: 'slide_from_right'
                            }}
                          />
                          <Stack.Screen name="+not-found" options={{ title: 'Page Introuvable' }} />
                        </Stack>
                        <InAppNotificationListener />
                        <ThemedStatusBar />
                      </ActivityProvider>
                    </BookingProvider>
                  </FavoritesProvider>
                </NotificationProvider>
              </PrivacyProvider>
            </UserProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
