import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { useUser } from '@/components/contexts/user/UserContext';
import data from '@/assets/data/data';

export const FavoritesComponent: React.FC = () => {
  const { theme } = useTheme();
  const { favorites, toggleFavorite } = useUser();

  const favoriteItems = data.filter(item => favorites.includes(item.id));

  const renderFavoriteItem = ({ item, index }: { item: any; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'spring' }}
      style={{ marginBottom: 16 }}
    >
      <ThemedView style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: theme.shadowColor || '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <ThemedView style={{ flexDirection: 'row' }}>
          <Image
            source={{ uri: item.avatar }}
            style={{ width: 120, height: 120 }}
            contentFit="cover"
          />
          
          <ThemedView style={{ flex: 1, padding: 16, gap: 8 }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <ThemedView style={{ flex: 1 }}>
                <ThemedView style={{
                  backgroundColor: theme.primary + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  marginBottom: 4
                }}>
                  <ThemedText style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: theme.primary,
                    textTransform: 'uppercase'
                  }}>
                    {item.type}
                  </ThemedText>
                </ThemedView>
                
                <ThemedText style={{ fontWeight: '700', fontSize: 16 }} numberOfLines={1}>
                  {item.location}
                </ThemedText>
                
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <MaterialCommunityIcons name="star" size={14} color={theme.star} />
                  <ThemedText style={{ fontSize: 12, marginLeft: 4, color: theme.typography.caption }}>
                    {item.stars} • {item.generalInfo?.bedrooms}ch • {item.generalInfo?.surface}m²
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <TouchableOpacity
                onPress={() => toggleFavorite(item.id)}
                style={{
                  backgroundColor: theme.error,
                  borderRadius: 20,
                  padding: 8
                }}
              >
                <MaterialCommunityIcons name="heart" size={16} color="white" />
              </TouchableOpacity>
            </ThemedView>
            
            <ThemedText style={{
              fontSize: 18,
              fontWeight: '900',
              color: theme.primary
            }}>
              {item.price}
            </ThemedText>
            
            {item.review && (
              <ThemedText 
                style={{ 
                  fontSize: 12, 
                  color: theme.typography.caption,
                  fontStyle: 'italic'
                }} 
                numberOfLines={2}
              >
                {item.review}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </MotiView>
  );

  if (favorites.length === 0) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
          style={{ alignItems: 'center', gap: 16 }}
        >
          <MaterialCommunityIcons name="heart-outline" size={80} color={theme.typography.caption} />
          <ThemedText style={{ fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
            Aucun favori
          </ThemedText>
          <ThemedText style={{ 
            fontSize: 16, 
            color: theme.typography.caption, 
            textAlign: 'center',
            lineHeight: 24
          }}>
            Ajoutez des propriétés à vos favoris en appuyant sur le cœur
          </ThemedText>
        </MotiView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={{ padding: 20, paddingBottom: 0 }}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring' }}
        >
          <ThemedText style={{ fontSize: 24, fontWeight: '900', marginBottom: 8 }}>
            Mes Favoris
          </ThemedText>
          <ThemedText style={{ fontSize: 16, color: theme.typography.caption }}>
            {favorites.length} propriété{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
          </ThemedText>
        </MotiView>
      </ThemedView>
      
      <FlatList
        data={favoriteItems}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};