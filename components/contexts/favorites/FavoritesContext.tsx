import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoritesService } from '@/services/api/favoritesService';

const FAVORITES_STORAGE_KEY = '@favorites_cache';

export interface FavoriteItem {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
  clearFavorites: () => void;
  syncWithBackend: (userId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const initialized = useRef(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as FavoriteItem[];
          setFavorites(parsed);
        }
      } catch (error) {
        console.error('Error loading favorites from storage:', error);
      }
      initialized.current = true;
    };
    loadFromStorage();
  }, []);

  // Persist to AsyncStorage whenever favorites change
  useEffect(() => {
    if (!initialized.current) return;
    const persist = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error persisting favorites:', error);
      }
    };
    persist();
  }, [favorites]);

  const syncWithBackend = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      // Fetch both properties and services from backend
      const [propertyItems, serviceItems] = await Promise.all([
        favoritesService.getFavoriteItems(),
        favoritesService.getFavoriteServiceItems()
      ]);

      const backendFavorites: FavoriteItem[] = [
        ...propertyItems.map(item => ({
          id: item.propertyId,
          title: '',
          price: item.priceAtSave || 0,
          location: '',
          image: '',
          type: 'property',
          addedAt: item.addedAt
        })),
        ...serviceItems.map(item => ({
          id: item.serviceId,
          title: '',
          price: 0,
          location: '',
          image: '',
          type: 'service',
          addedAt: item.addedAt
        }))
      ];

      setFavorites(prev => {
        // Merge: keep backend as source of truth for IDs, but preserve local metadata
        const mergedMap = new Map<string, FavoriteItem>();
        // Add backend items first
        for (const item of backendFavorites) {
          mergedMap.set(item.id, item);
        }
        // Override with local items that have richer data (title, image, etc.)
        for (const item of prev) {
          if (mergedMap.has(item.id)) {
            const backendItem = mergedMap.get(item.id)!;
            mergedMap.set(item.id, { ...backendItem, ...item, type: backendItem.type });
          }
        }
        return Array.from(mergedMap.values());
      });
    } catch (error) {
      console.error('Error syncing favorites with backend:', error);
    }
  }, []);

  const addToFavorites = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.some(fav => fav.id === item.id)) return prev;
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromFavorites = useCallback((id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.some(fav => fav.id === id);
  }, [favorites]);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  const clearFavorites = useCallback(async () => {
    setFavorites([]);
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing favorites storage:', error);
    }
  }, []);

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    syncWithBackend
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
