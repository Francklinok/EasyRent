// // Fichier: components/ThemedPropertyCard.tsx
// import React from 'react';
// import { View, Text, Image } from 'react-native';
// import { Property } from '@/types/property';
// import { ThemedCard } from './ThemedCard';
// import { useTheme } from '@/context/ThemeContext'; // adapte ce chemin si nécessaire

// interface ThemedPropertyCardProps {
//   property: Property;
//   compact?: boolean;
//   withGradient?: boolean;
//   withShadow?: boolean;
//   withBorder?: boolean;
// }

// const ThemedPropertyCard: React.FC<ThemedPropertyCardProps> = ({
//   property,
//   compact = false,
//   withGradient = false,
//   withShadow = true,
//   withBorder = true,
// }) => {
//   const { theme } = useTheme();

//   const mainImage = property?.images?.[0] || 'https://via.placeholder.com/300x200?text=Pas+d%27image';

//   const formatDate = (date: Date) => {
//     return date?.toLocaleDateString('fr-FR', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   return (
//     <ThemedCard
//       withGradient={withGradient}
//       withShadow={withShadow}
//       withBorder={withBorder}
//       style={{ marginBottom: compact ? 8 : 16 }}
//     >
//       <Image
//         source={{ uri: mainImage }}
//         style={{ width: '100%', height: 192, borderRadius: 8, marginBottom: 12 }}
//         resizeMode="cover"
//       />

//       <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
//         {property?.title}
//       </Text>

//       <Text style={{ color: theme.subtext, marginBottom: 8 }}>{property?.address}</Text>

//       {!compact && (
//         <Text style={{ color: theme.text, marginBottom: 12 }} numberOfLines={2}>
//           {property?.description}
//         </Text>
//       )}

//       <View style={{ flexDirection: 'row', marginBottom: 8 }}>
//         <View style={{ flex: 1 }}>
//           <Text style={{ color: theme.subtext }}>Loyer</Text>
//           <Text style={{ color: theme.text, fontWeight: 'bold' }}>{property?.monthlyRent} €/mois</Text>
//         </View>

//         <View style={{ flex: 1 }}>
//           <Text style={{ color: theme.subtext }}>Superficie</Text>
//           <Text style={{ color: theme.text, fontWeight: 'bold' }}>{property?.area} m²</Text>
//         </View>
//       </View>

//       <View style={{ flexDirection: 'row', marginBottom: 8 }}>
//         <View style={{ flex: 1 }}>
//           <Text style={{ color: theme.subtext }}>Chambres</Text>
//           <Text style={{ color: theme.text, fontWeight: 'bold' }}>{property?.bedrooms}</Text>
//         </View>

//         <View style={{ flex: 1 }}>
//           <Text style={{ color: theme.subtext }}>Salles de bain</Text>
//           <Text style={{ color: theme.text, fontWeight: 'bold' }}>{property?.bathrooms}</Text>
//         </View>
//       </View>

//       {!compact && (
//         <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: theme.cardBorder, paddingTop: 8 }}>
//           <Text style={{ color: theme.subtext }}>Disponible à partir du</Text>
//           <Text style={{ color: theme.text, fontWeight: 'bold' }}>{formatDate(property?.availableFrom)}</Text>
//         </View>
//       )}
//     </ThemedCard>
//   );
// };

// export default ThemedPropertyCard;



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
  const mainImage = property?.images && property?.images.length > 0
    ? property.images[0]
    : 'https://via.placeholder.com/300x200?text=Pas+d%27image';

  const formatDate = (date: Date) => {
    return date?.toLocaleDateString('fr-FR', {
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
        <Text className="text-xl font-bold mb-1">{property?.title}</Text>
        <Text className="text-gray-600 mb-2">{property?.address}</Text>
        
        {!compact && (
          <Text className="text-gray-700 mb-3" numberOfLines={2}>
            {property?.description}
          </Text>
        )}
        
        <View className="flex-row mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-gray-500">Loyer</Text>
            <Text className="font-bold">{property?.monthlyRent} €/mois</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-gray-500">Superficie</Text>
            <Text className="font-bold">{property?.area} m²</Text>
          </View>
        </View>
        
        <View className="flex-row mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-gray-500">Chambres</Text>
            <Text className="font-bold">{property?.bedrooms}</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-gray-500">Salles de bain</Text>
            <Text className="font-bold">{property?.bathrooms}</Text>
          </View>
        </View>
        
        {!compact && (
          <View className="mt-2 pb-2 border-t border-gray-200 pt-2">
            <Text className="text-gray-500">Disponible à partir du</Text>
            <Text className="font-bold">{formatDate(property?.availableFrom)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PropertyCard;