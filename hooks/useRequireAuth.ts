import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language/LanguageContext';

/**
 * Contextual auth gate for guest-mode browsing — the app itself no longer
 * force-redirects to /Auth/Login on boot (see app/_layout.tsx); a guest can
 * freely browse the home feed, search, and view property/service details.
 * Call requireAuth() right before any action that actually needs an
 * identity (booking, visit request, contact owner, favorites, wallet,
 * creation, premium checkout...). Returns true if the user is already
 * authenticated (caller proceeds), false if a sign-in prompt was shown
 * instead (caller must stop).
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const requireAuth = useCallback(
    (message?: string): boolean => {
      if (isAuthenticated) return true;

      Alert.alert(
        t('auth.loginRequired'),
        message || t('auth.loginRequiredMsg'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('auth.loginAction'), onPress: () => router.push('/Auth/Login') },
        ]
      );
      return false;
    },
    [isAuthenticated, t, router]
  );

  return { isAuthenticated, requireAuth };
}
