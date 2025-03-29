// Fichier: components/PropertyCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, compact = false }) => {
  // Utilise l'image principale ou une image de remplacement
  const mainImage = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://via.placeholder.com/300x200?text=Pas+d%27image';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View className={`bg-white rounded-lg shadow-md overflow-hidden ${compact ? 'mb-2' : 'mb-4'}`}>
      <Image
        source={{ uri: mainImage }}
        className="w-full h-48"
        resizeMode="cover"
      />
      
      <View className="p-4">
        <Text className="text-xl font-bold mb-1">{property.title}</Text>
        <Text className="text-gray-600 mb-2">{property.address}</Text>
        
        {!compact && (
          <Text className="text-gray-700 mb-3" numberOfLines={2}>
            {property.description}
          </Text>
        )}
        
        <View className="flex-row mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-gray-500">Loyer</Text>
            <Text className="font-bold">{property.monthlyRent} €/mois</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-gray-500">Superficie</Text>
            <Text className="font-bold">{property.area} m²</Text>
          </View>
        </View>
        
        <View className="flex-row mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-gray-500">Chambres</Text>
            <Text className="font-bold">{property.bedrooms}</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-gray-500">Salles de bain</Text>
            <Text className="font-bold">{property.bathrooms}</Text>
          </View>
        </View>
        
        {!compact && (
          <View className="mt-2 pb-2 border-t border-gray-200 pt-2">
            <Text className="text-gray-500">Disponible à partir du</Text>
            <Text className="font-bold">{formatDate(property.availableFrom)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PropertyCard;