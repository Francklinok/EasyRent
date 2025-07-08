import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/components/contexts/theme/themehook';

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

type Props = {
  item: FavoriteItemType;
  onRemove: (id: string) => void;
};

const FavoriteItem = ({ item, onRemove }: Props) => {
  const { theme } = useTheme();

  if (!item) return null; // Sécurité

  const onSurface = theme.onSurface as string;
  const onSurfaceVariant = theme.onSurfaceVariant as string;
  const primary = theme.primary as string;
  const error = (theme.error ?? '#ff4444') as string;

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.surface as string }]}>
      <Image
        source={{ uri: item.imageUrl }}
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
        {item.price}
      </ThemedText>

      <ThemedText style={[styles.details, { color: onSurfaceVariant }]}>
        Surface : {item.surface} {item.rooms !== null ? `• ${item.rooms} pièce(s)` : ''}
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
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    // ombre iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // elevation Android
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

export default FavoriteItem;
