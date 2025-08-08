import React from 'react';
import { Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useFavorites, FavoriteItem as FavoriteItemType } from '@/components/contexts/favorites/FavoritesContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  item: FavoriteItemType;
  onRemove: (id: string) => void;
};

const FavoriteItemCard = ({ item, onRemove }: Props) => {
  const { theme } = useTheme();

  if (!item) return null; // Sécurité

  const onSurface = theme.onSurface as string;
  const onSurfaceVariant = theme.onSurfaceVariant as string;
  const primary = theme.primary as string;
  const error = (theme.error ?? '#ff4444') as string;

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.surface as string }]}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <ThemedText
        type="normal"
        intensity="strong"
        style={[styles.title, { color: onSurface }]}
      >
        {item.title}
      </ThemedText>

      <ThemedText >
        {item.type} - {item.location}
      </ThemedText>

      <ThemedText style={[ { color: primary }]}>
        {item.price}€
      </ThemedText>

      <ThemedText style={[styles.details, { color: onSurfaceVariant }]}>
        {item.area && `Surface : ${item.area}m²`} {item.bedrooms && `• ${item.bedrooms} ch.`} {item.bathrooms && `• ${item.bathrooms} sdb`}
      </ThemedText>

      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        style={[styles.removeButton, { backgroundColor: error }]}
      >
        <ThemedText intensity="strong" style={styles.removeText}>
          Supprimer
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  itemContainer: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    marginBottom: 4,
  },
  details: {
    marginBottom: 8,
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeText: {
    color: '#fff',
  },
});

export { FavoriteItemCard };

const FavoritesComponent = () => {
  const { theme } = useTheme();
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();

  const renderFavoriteItem = ({ item }: { item: FavoriteItemType }) => (
    <FavoriteItemCard item={item} onRemove={removeFromFavorites} />
  );

  if (favorites.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <MaterialCommunityIcons 
          name="heart-outline" 
          size={64} 
          color={theme.onSurface + '40'} 
        />
        <ThemedText style={[styles.emptyTitle, { color: theme.onSurface }]}>
          Aucun favori
        </ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: theme.onSurface + '60' }]}>
          Ajoutez des propriétés à vos favoris en cliquant sur le cœur
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: theme.onSurface }]}>
          Mes Favoris ({favorites.length})
        </ThemedText>
        {favorites.length > 0 && (
          <TouchableOpacity 
            onPress={clearFavorites}
            style={[styles.clearButton, { backgroundColor: theme.error + '20' }]}
          >
            <ThemedText style={[styles.clearText, { color: theme.error }]}>
              Tout supprimer
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
      
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  );
};

export default FavoritesComponent;
