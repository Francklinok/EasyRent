import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import {
  Edit,
  Share2,
  Info,
  ImageIcon,
} from 'lucide-react-native';
import { useTheme } from '@/components/contexts/theme/themehook';
import { PropertyItem } from '@/types/property';
import { getStatusColor, getStatusLabel, getPropertyTypeIcon, formatAmount } from '@/utils/inventory';

interface PropertyCardProps {
  property: PropertyItem;
  onPress: () => void;
  onEdit: () => void;
  onShare: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onPress, 
  onEdit, 
  onShare 
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      className="w-[300px] ml-2"
      onPress={onPress}
    >
      <ThemedView
        variant="surface"
        className="rounded-xl overflow-hidden"
        bordered
      >
        <ThemedView className="h-40 bg-gray-200 items-center justify-center relative">
          <View
            className="absolute top-3 right-3 py-1 px-2 rounded z-10"
            style={{ backgroundColor: getStatusColor(property.status, theme) }}
          >
            <ThemedText className="text-white text-xs font-medium">
              {getStatusLabel(property.status)}
            </ThemedText>
          </View>
          <View className="items-center justify-center w-full h-full">
            <ImageIcon size={32} color={theme.onSurface} />
          </View>
        </ThemedView>

        <ThemedView className="p-4">
          <ThemedText 
            variant="default" 
            className="text-base font-bold mb-2"
            numberOfLines={1}
          >
            {property.name}
          </ThemedText>

          <ThemedView className="flex-row items-center mb-2">
            {getPropertyTypeIcon(property.type, theme)}
            <ThemedText 
              variant="secondary" 
              className="ml-2 text-sm"
              numberOfLines={1}
            >
              {property.location.city}
            </ThemedText>
          </ThemedView>

          <ThemedView className="flex-row justify-between items-center mb-1">
            <ThemedText variant="accent" className="text-base font-semibold">
              {property.price.sale ? formatAmount(property.price.sale, 'EUR') : ''}
            </ThemedText>

            <ThemedText variant="secondary" className="text-sm">
              {property.surface} m²
            </ThemedText>
          </ThemedView>

          {property.features.bedrooms && (
            <ThemedView className="mt-1">
              <ThemedText variant="secondary" className="text-xs">
                {property.features.bedrooms} ch • {property.features.bathrooms} sdb
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView className="flex-row border-t border-gray-200 p-2 justify-end">
          <TouchableOpacity
            className="w-8 h-8 rounded-full items-center justify-center ml-2"
            onPress={onEdit}
          >
            <Edit size={16} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-8 h-8 rounded-full items-center justify-center ml-2"
            onPress={onShare}
          >
            <Share2 size={16} color={theme.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-8 h-8 rounded-full items-center justify-center ml-2 bg-blue-500"
            onPress={onPress}
          >
            <Info size={16} color="#fff" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};