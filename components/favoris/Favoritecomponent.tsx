import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedText } from '@/components/ui/ThemedText';

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

// Composant d’un favori
const FavoriteItem = ({
  item,
  onRemove,
}: {
  item: FavoriteItemType;
  onRemove: (id: string) => void;
}) => {
  const { theme } = useTheme();

  return (
    <ThemedView
      variant="surface"
      elevated="small"
      style={{
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <ThemedView style={{ flexDirection: 'row', height: 120 }}>
        {/* Image */}
        <ThemedView style={{ width: 120, height: '100%', backgroundColor: theme.surface}}>
          <Image
            source={
              item.imageUrl
                ? { uri: item.imageUrl }
                : require('@/assets/images/property.jpg')
            }
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </ThemedView>

        {/* Détails */}
        <ThemedView style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
          <ThemedView>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 16, color: theme.onSurface }}>
              {item.title}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: theme.onSurface, marginTop: 2 }}>
              {item.location}
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <ThemedText style={{ fontWeight: 'bold', color: theme.primary, fontSize: 16 }}>
              {item.price}
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row' }}>
              <ThemedText style={{ color: theme.onSurface, marginRight: 8 }}>
                {item.surface}
              </ThemedText>
              {item.rooms !== null && (
                <ThemedText style={{ color: theme.onSurface}}>
                  {item.rooms} pièces
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Bouton de suppression */}
        <TouchableOpacity
          style={{ padding: 10, justifyContent: 'flex-start', alignItems: 'center' }}
          onPress={() => onRemove(item.id)}
        >
          <Icon name="heart" size={24} color={theme.error || '#ED4245'} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};
export default FavoriteItem;