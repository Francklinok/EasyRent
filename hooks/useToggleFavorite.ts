import { useMemo, useCallback } from 'react';
import { Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFavorites, FavoriteItem } from '@/components/contexts/favorites/FavoritesContext';
import { useFavorites as useFavoritesAPI } from '@/hooks/useFavorites';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { ExtendedItemTypes } from '@/types/ItemType';
import { favoritesService } from '@/services/api/favoritesService';

const ANIMATION_DURATION_MEDIUM = 300;

interface UseToggleFavoriteOptions {
  item: ExtendedItemTypes;
  rotateAnim?: Animated.Value;
  setAnimatingElement?: (id: string | null) => void;
}

export function useToggleFavorite({ item, rotateAnim, setAnimatingElement }: UseToggleFavoriteOptions) {
  const favoritesContext = useFavorites();
  const { toggleFavorite: toggleFav, isFavorite: checkIsFavorite } = favoritesContext || {};

  const { user } = useAuth();
  const { addToFavorites: addToFavoritesAPI, removeFromFavorites: removeFromFavoritesAPI } = useFavoritesAPI(user?.id || '');

  const isFavorite = useMemo(() => {
    if (!checkIsFavorite) return false;
    return checkIsFavorite(item.id);
  }, [checkIsFavorite, item.id]);

  const handleToggleFavorite = useCallback(async () => {
    if (!toggleFav) {
      console.warn('Favorites context not available');
      return;
    }

    if (!user?.id) {
      Alert.alert('Authentification requise', 'Veuillez vous connecter pour ajouter des favoris');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (rotateAnim) {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION_MEDIUM,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION_MEDIUM,
          useNativeDriver: true,
        }),
      ]).start();
    }

    const favoriteItem: FavoriteItem = {
      id: item.id,
      title: item.title || 'Property',
      price: typeof item.price === 'string' ? parseFloat((item.price as string).replace(/[^0-9.]/g, '')) : (item.price as number),
      location: item.location,
      image: item.imageAvif || item.imageWebP || item.avatar,
      type: item.type,
      bedrooms: item.generalInfo?.bedrooms,
      bathrooms: item.generalInfo?.bathrooms,
      area: item.generalInfo?.surface,
      addedAt: new Date().toISOString()
    };

    try {
      const isFav = checkIsFavorite(item.id);
      const isService = item.itemType === 'service';

      if (isFav) {
        const success = isService
          ? await favoritesService.removeServiceFromFavorites(item.id)
          : await removeFromFavoritesAPI(item.id);
        if (success) {
          toggleFav(favoriteItem);
        }
      } else {
        const success = isService
          ? await favoritesService.addServiceToFavorites(item.id)
          : await addToFavoritesAPI(item.id);
        if (success) {
          toggleFav(favoriteItem);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }

    if (setAnimatingElement) {
      setAnimatingElement(item.id);
    }
  }, [item, toggleFav, checkIsFavorite, user?.id, addToFavoritesAPI, removeFromFavoritesAPI, setAnimatingElement, rotateAnim]);

  return { isFavorite, handleToggleFavorite };
}
