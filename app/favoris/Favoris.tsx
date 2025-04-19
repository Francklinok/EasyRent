import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedText } from '@/components/ui/ThemedText';
import FavoriteItem from '@/components/favoris/Favoritecomponent';
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

// Données simulées
const DUMMY_FAVORITES: FavoriteItemType[] = [
  {
    id: '1',
    title: 'Villa Moderne',
    type: 'Maison',
    location: 'Paris, France',
    price: '625,000 €',
    surface: '180 m²',
    rooms: 5,
    imageUrl: 'https://example.com/house1.jpg',
  },
  {
    id: '2',
    title: 'Appartement Centre-Ville',
    type: 'Appartement',
    location: 'Lyon, France',
    price: '320,000 €',
    surface: '95 m²',
    rooms: 3,
    imageUrl: 'https://example.com/apartment1.jpg',
  },
  {
    id: '3',
    title: 'Terrain Constructible',
    type: 'Terrain',
    location: 'Bordeaux, France',
    price: '185,000 €',
    surface: '750 m²',
    rooms: null,
    imageUrl: 'https://example.com/land1.jpg',
  },
];

// Composant principal
const FavoritesScreen = () => {
  const { theme } = useTheme();
  const [favorites, setFavorites] = useState<FavoriteItemType[]>(DUMMY_FAVORITES);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ThemedView variant="default" style={{ flex: 1 , paddingTop:40}}>
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.onSurface,
            marginBottom: 8,
          }}
        >
          Vos Favoris
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme.onSurface || theme.onSurfaceVariant,
            marginBottom: 16,
          }}
        >
          Gérez vos propriétés sauvegardées
        </Text>
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <FavoriteItem key={item.id} item={item} onRemove={removeFavorite} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
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
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.onSurface,
              marginTop: 16,
            }}
          >
            Aucun favori pour le moment
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              color: theme.onSurface,
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            Ajoutez des propriétés à vos favoris pour les retrouver ici
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: theme.onSurface, fontWeight: 'bold' }}>
              EXPLORER LES PROPRIÉTÉS
            </Text>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
};
export default FavoritesScreen