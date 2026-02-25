import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useFavorites } from './FavoritesContext';

/**
 * Syncs favorites with backend when user authenticates.
 * Must be placed inside both AuthProvider and FavoritesProvider.
 */
export const FavoritesSyncManager = () => {
  const { user, isAuthenticated } = useAuth();
  const { syncWithBackend, clearFavorites } = useFavorites();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id && user.id !== lastUserId.current) {
      lastUserId.current = user.id;
      syncWithBackend(user.id);
    }

    if (!isAuthenticated && lastUserId.current) {
      lastUserId.current = null;
      clearFavorites();
    }
  }, [isAuthenticated, user?.id, syncWithBackend, clearFavorites]);

  return null;
};
