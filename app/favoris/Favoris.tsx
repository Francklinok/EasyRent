import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../contexts/theme/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Données simulées pour les favoris
const DUMMY_FAVORITES = [
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

// Composant pour les plans premium
const PremiumPlans = [
  {
    id: 'basic',
    title: 'Découverte',
    price: '4,99 €/mois',
    color: '#5865F2', // Couleur Discord bleu
    features: [
      'Alertes personnalisées',
      'Suppression des publicités',
      'Sauvegarde jusqu'à 20 favoris'
    ]
  },
  {
    id: 'premium',
    title: 'Premium',
    price: '9,99 €/mois',
    color: '#FEE75C', // Couleur Discord jaune
    popular: true,
    features: [
      'Alertes personnalisées',
      'Suppression des publicités',
      'Sauvegarde illimitée des favoris',
      'Accès aux statistiques du marché',
      'Contact direct avec les vendeurs'
    ]
  },
  {
    id: 'pro',
    title: 'Professionnel',
    price: '19,99 €/mois',
    color: '#ED4245', 
    features: [
      'Toutes les fonctionnalités Premium',
      'Signature virtuelle de documents',
      'Visites virtuelles illimitées',
      'Outil d'évaluation de biens',
      'Support client prioritaire'
    ]
  }
];

// Composant d'un élément de la liste des favoris
const FavoriteItem = ({ item, onRemove }) => {
  const { theme } = useTheme();
  
  return (
    <ThemedView 
      variant="surface" 
      elevated="small" 
      style={{
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden'
      }}
    >
      <View style={{ flexDirection: 'row', height: 120 }}>
        {/* Image de la propriété */}
        <View style={{ width: 120, height: '100%', backgroundColor: theme.surfaceVariant }}>
          <Image 
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            defaultSource={require('../assets/placeholder-property.png')}
          />
        </View>

        {/* Détails de la propriété */}
        <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.onSurface }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 14, color: theme.onSurfaceVariant, marginTop: 2 }}>
              {item.location}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', color: theme.primary, fontSize: 16 }}>
              {item.price}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: theme.onSurfaceVariant, marginRight: 8 }}>
                {item.surface}
              </Text>
              {item.rooms && (
                <Text style={{ color: theme.onSurfaceVariant }}>
                  {item.rooms} pièces
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Bouton de suppression des favoris */}
        <TouchableOpacity 
          style={{ 
            padding: 10, 
            justifyContent: 'flex-start', 
            alignItems: 'center' 
          }}
          onPress={() => onRemove(item.id)}
        >
          <Icon name="heart" size={24} color={theme.error || '#ED4245'} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

