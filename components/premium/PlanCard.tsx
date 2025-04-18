import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


// Composant pour le plan d'abonnement
const PlanCard = ({ plan, onSelect, isSelected }) => {
    const { theme } = useTheme();
    const borderColor = isSelected ? plan.color : 'transparent';
    
    return (
      <ThemedView
        variant="surface"
        elevated={isSelected ? "medium" : "small"}
        style={{
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 8,
          borderWidth: 2,
          borderColor,
          width: Dimensions.get('window').width - 64,
          maxWidth: 300,
          alignSelf: 'center',
          marginVertical: 8,
        }}
      >
        {plan.popular && (
          <View style={{
            position: 'absolute',
            top: -10,
            right: 20,
            backgroundColor: plan.color,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 16,
            zIndex: 1
          }}>
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
              POPULAIRE
            </Text>
          </View>
        )}
        
        <Text style={{ 
          fontSize: 20, 
          fontWeight: 'bold', 
          color: theme.onSurface,
          marginBottom: 4 
        }}>
          {plan.title}
        </Text>
        
        <Text style={{ 
          fontSize: 22, 
          fontWeight: 'bold', 
          color: plan.color,
          marginBottom: 16 
        }}>
          {plan.price}
        </Text>
        
        {/* Liste des fonctionnalités */}
        {plan.features.map((feature, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="check-circle" size={18} color={plan.color} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.onSurfaceVariant }}>{feature}</Text>
          </View>
        ))}
        
        <TouchableOpacity
          style={{
            backgroundColor: isSelected ? plan.color : theme.surfaceVariant,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: 'center',
            marginTop: 16
          }}
          onPress={() => onSelect(plan.id)}
        >
          <Text style={{ 
            color: isSelected ? '#FFFFFF' : theme.onSurfaceVariant, 
            fontWeight: 'bold' 
          }}>
            {isSelected ? 'SÉLECTIONNÉ' : 'CHOISIR'}
          </Text>
        </TouchableOpacity>
      </ThemedView>
    );
  };
  
  // Composant principal des Favoris
  export const FavoritesScreen = () => {
    const { theme } = useTheme();
    const [favorites, setFavorites] = useState(DUMMY_FAVORITES);
  
    const removeFavorite = (id) => {
      setFavorites(favorites.filter(item => item.id !== id));
    };
  
    return (
      <ThemedView 
        variant="default" 
        style={{ flex: 1 }}
      >
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.onBackground, marginBottom: 8 }}>
            Vos Favoris
          </Text>
          <Text style={{ fontSize: 16, color: theme.onBackgroundVariant || theme.onSurfaceVariant, marginBottom: 16 }}>
            Gérez vos propriétés sauvegardées
          </Text>
        </View>
  
        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={({ item }) => <FavoriteItem item={item} onRemove={removeFavorite} />}
            keyExtractor={item => item.id}
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
              padding: 24
            }}
          >
            <Icon name="heart-outline" size={64} color={theme.onSurfaceVariant} />
            <Text style={{ 
              textAlign: 'center', 
              fontSize: 18, 
              fontWeight: 'bold',
              color: theme.onSurface,
              marginTop: 16 
            }}>
              Aucun favori pour le moment
            </Text>
            <Text style={{ 
              textAlign: 'center', 
              fontSize: 16,
              color: theme.onSurfaceVariant,
              marginTop: 8,
              marginBottom: 16
            }}>
              Ajoutez des propriétés à vos favoris pour les retrouver ici
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: theme.primary,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8
              }}
            >
              <Text style={{ color: theme.onPrimary, fontWeight: 'bold' }}>
                EXPLORER LES PROPRIÉTÉS
              </Text>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    );
  };
  
export default PlanCard