import React, { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FavoriteItem from '@/components/favoris/Favoritecomponent';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';

// Types
type FavoriteItemType = {
  id: string;
  title: string;
  type: string;
  location: string;
  price: string;
  surface: string;
  rooms: number | null;
  imageUrl: string;
};

// Données simulées avec URLs réelles
const DUMMY_FAVORITES: FavoriteItemType[] = [
  {
    id: '1',
    title: 'Villa Moderne',
    type: 'Maison',
    location: 'Paris, France',
    price: '625,000 €',
    surface: '180 m²',
    rooms: 5,
    imageUrl: 'https://images.unsplash.com/photo-1600585154437-19760bb0f78c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Appartement Centre-Ville',
    type: 'Appartement',
    location: 'Lyon, France',
    price: '320,000 €',
    surface: '95 m²',
    rooms: 3,
    imageUrl: 'https://images.unsplash.com/photo-1560448070-cb2f8aef94c6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Terrain Constructible',
    type: 'Terrain',
    location: 'Bordeaux, France',
    price: '185,000 €',
    surface: '750 m²',
    rooms: null,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
];

// Composant principal
const FavoritesScreen = () => {
  const { theme } = useTheme();
  const [favorites, setFavorites] = useState<FavoriteItemType[]>(DUMMY_FAVORITES);
  const insets = useSafeAreaInsets();

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ThemedView variant="default"
     style={{ flex: 1, paddingTop: insets.top + 4}}>
      <ThemedView style={{ padding: 16 }}>
        <ThemedView style={{ flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <BackButton />
          <ThemedText type="title" intensity="strong" style={{ color: theme.onSurface }}>
            Vos Favoris
          </ThemedText>
        </ThemedView>

        <ThemedText
          style={{
            color: theme.onSurface || theme.onSurfaceVariant,
            marginBottom: 16,
          }}
        >
          Gérez vos propriétés sauvegardées
        </ThemedText>

        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={({ item }) => (
              <ThemedView
                variant="surface"
                style={{
                  marginBottom: 12,
                  padding: 4,
                }}
              >
                <FavoriteItem item={item} onRemove={removeFavorite} />
              </ThemedView>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 55, // 
            }}
            showsVerticalScrollIndicator = {false}
          />
        ) : (
          <ThemedView
            variant="surface"
            style={{
              flex: 1,
              margin: 16,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
          >
            <Icon name="heart-outline" size={64} color={theme.onSurface} />
            <ThemedText type="normal" intensity="strong" style={{ color: theme.onSurface, marginTop: 16, textAlign: 'center' }}>
              Aucun favori pour le moment
            </ThemedText>
            <ThemedText style={{ color: theme.onSurface, marginTop: 8, marginBottom: 16, textAlign: 'center' }}>
              Ajoutez des propriétés à vos favoris pour les retrouver ici
            </ThemedText>
            <TouchableOpacity
              style={{
                backgroundColor: theme.primary,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
              }}
            >
              <ThemedText intensity="strong" style={{ color: theme.onSurface }}>
                EXPLORER LES PROPRIÉTÉS
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
};

export default FavoritesScreen;
