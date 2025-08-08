import React, { createContext, useContext, useState, useCallback } from 'react';

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
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

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

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearFavorites
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