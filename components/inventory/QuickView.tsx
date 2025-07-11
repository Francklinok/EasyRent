import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import {
  X,
  Edit,
  Share2,
  ImageIcon
} from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { PropertyItem } from '@/types/property';
import { getStatusColor, getStatusLabel, getPropertyTypeIcon, formatAmount } from '@/utils/inventory';

interface QuickViewProps {
  visible: boolean;
  onClose: () => void;
  property: PropertyItem | null;
  onEdit: () => void;
  onShare: () => void;
  onViewDetails: () => void;
}

export const QuickView: React.FC<QuickViewProps> = ({ 
  visible, 
  onClose, 
  property, 
  onEdit, 
  onShare, 
  onViewDetails 
}) => {
  const { theme } = useTheme();

  if (!property) return null;

  return (
    <ThemedView
      className={`absolute top-0 right-0 w-[380px] h-full z-[100] border-l border-gray-200 ${
        visible ? 'translate-x-0' : 'translate-x-[400px]'
      }`}
      style={{ 
        transform: [{ translateX: visible ? 0 : 400 }],
        transition: 'transform 0.3s ease-in-out'
      }}
      variant="default"
    >
      <ThemedView className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity
          className="w-9 h-9 rounded-full items-center justify-center"
          onPress={onClose}
        >
          <X size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <ThemedText 
          variant="default" 
          className="text-lg font-bold flex-1 ml-3"
        >
          {property.name}
        </ThemedText>
      </ThemedView>

      <ThemedScrollView className="flex-1">
        {/* Image et statut */}
        <ThemedView className="h-[200px] bg-gray-200 items-center justify-center relative">
          <View className="items-center justify-center w-full h-full">
            <ImageIcon size={32} color={theme.onSurface} />
          </View>
          <View
            className="absolute top-4 right-4 py-1.5 px-3 rounded z-10"
            style={{ backgroundColor: getStatusColor(property.status, theme) }}
          >
            <ThemedText className="text-white text-sm font-medium">
              {getStatusLabel(property.status)}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Détails principaux */}
        <ThemedView className="p-4">
          <ThemedView className="mb-4">
            <ThemedText variant="secondary" className="text-sm mb-1">
              Type
            </ThemedText>
            <ThemedView className="flex-row items-center">
              {getPropertyTypeIcon(property.type, theme)}
              <ThemedText variant="default" className="text-base ml-2">
                {property.type === 'house' ? 'Maison' :
                  property.type === 'apartment' ? 'Appartement' :
                    property.type === 'land' ? 'Terrain' : 'Commercial'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView className="mb-4">
            <ThemedText variant="secondary" className="text-sm mb-1">
              Adresse
            </ThemedText>
            <ThemedText variant="default" className="text-base">
              {property.location.address}
            </ThemedText>
            <ThemedText variant="default" className="text-base">
              {property.location.postalCode} {property.location.city}
            </ThemedText>
          </ThemedView>

          <ThemedView className="mb-4">
            <ThemedText variant="secondary" className="text-sm mb-1">
              Prix
            </ThemedText>
            <ThemedView className="mt-1">
              {property.price.sale && (
                <ThemedText variant="accent" className="text-base mb-1">
                  Vente: {formatAmount(property.price.sale, 'EUR')}
                </ThemedText>
              )}

              {property.price.rent && (
                <ThemedText variant="accent" className="text-base">
                  Location: {formatAmount(property.price.rent, 'EUR')}/mois
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>

          <ThemedView className="mb-4">
            <ThemedText variant="secondary" className="text-sm mb-1">
              Surface
            </ThemedText>
            <ThemedText variant="default" className="text-base">
              {property.surface} m²
            </ThemedText>
          </ThemedView>

          {(property.features.bedrooms || property.features.bathrooms) && (
            <ThemedView className="mb-4">
              <ThemedText variant="secondary" className="text-sm mb-1">
                Caractéristiques
              </ThemedText>
              <ThemedView className="mt-1">
                {property.features.bedrooms && (
                  <ThemedText variant="default" className="text-base mb-1">
                    {property.features.bedrooms} chambres
                  </ThemedText>
                )}

                {property.features.bathrooms && (
                  <ThemedText variant="default" className="text-base mb-1">
                    {property.features.bathrooms} salles de bain
                  </ThemedText>
                )}

                {property.features.floors && (
                  <ThemedText variant="default" className="text-base">
                    {property.features.floors} étages
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          )}

          {property.features.additionalFeatures.length > 0 && (
            <ThemedView className="mb-4">
              <ThemedText variant="secondary" className="text-sm mb-1">
                Équipements
              </ThemedText>
              <ThemedView className="flex-row flex-wrap mt-1">
                {property.features.additionalFeatures.map((feature, index) => (
                  <ThemedView 
                    key={index} 
                    className="py-1.5 px-3 bg-gray-100 rounded-full mr-2 mb-2"
                  >
                    <ThemedText className="text-sm">{feature}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedScrollView>

      <ThemedView className="flex-row items-center p-4 border-t border-gray-200">
        <TouchableOpacity
          className="flex-row items-center py-2 px-3 rounded mr-2"
          onPress={onEdit}
        >
          <Edit size={18} color={theme.primary} />
          <ThemedText variant="primary" className="ml-1.5">
            Modifier
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-2 px-3 rounded mr-2"
          onPress={onShare}
        >
          <Share2 size={18} color={theme.secondary} />
          <ThemedText variant="secondary" className="ml-1.5">
            Partager
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-2.5 rounded items-center justify-center"
          style={{ backgroundColor: theme.primary }}
          onPress={onViewDetails}
        >
          <ThemedText className="text-white font-medium">
            Détails complets
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};