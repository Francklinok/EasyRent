import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from "@/components/ui/ThemedView";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ui/ThemedText";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useTheme } from "@/components/contexts/theme/themehook";
import { LinearGradient } from 'expo-linear-gradient';

interface ExtendedItemType extends ItemType {
  features: FeatureIcon[];
  energyScore: number;
  virtualTourAvailable: boolean;
  distanceToAmenities?: {
    schools: number;
    healthcare: number;
    shopping: number;
    transport: number;
  };
  aiRecommendation: string;
}

const RenderNeighborhoodInfo = (item: ExtendedItemType) => {
  const { theme } = useTheme();
  
  const amenities = [
    {
      icon: 'school',
      iconSet: 'MaterialIcons',
      distance: item.distanceToAmenities?.schools ?? 0,
      color: '#4F46E5',
    },
    {
      icon: 'medical-services',
      iconSet: 'MaterialIcons',
      distance: item.distanceToAmenities?.healthcare ?? 0,
      color: '#EF4444',
    },
    {
      icon: 'shopping-bag',
      iconSet: 'FontAwesome5',
      distance: item.distanceToAmenities?.shopping ?? 0,
      color: '#10B981',
    },
    {
      icon: 'train',
      iconSet: 'FontAwesome5',
      distance: item.distanceToAmenities?.transport ?? 0,
      color: '#8B5CF6',
    }
  ];

 
  const isDark = theme.dark;

  return (
    <ThemedView style={styles.compactContainer}>
      <ThemedView style={styles.compactRow}>
             <ThemedView style={styles.compactAmenities}>
          {amenities.slice(0, 4).map((amenity, index) => (
            <ThemedView key={index} style={[
              styles.compactAmenityItem,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}>
              {amenity.iconSet === 'FontAwesome5' ? (
                <FontAwesome5 
                  name={amenity.icon} 
                  size={10} 
                  color={amenity.color} 
                />
              ) : (
                <MaterialIcons 
                  name={amenity.icon} 
                  size={12} 
                  color={amenity.color} 
                />
              )}
              <ThemedText  type = "caption">
                {amenity.distance > 0 ? `${amenity.distance}km` : '-'}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Badge visite virtuelle compact */}
        {item.virtualTourAvailable && (
          <ThemedView style={styles.compactVRBadge}>
            <MaterialIcons name="360" size={12} color="#6366F1" />
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    marginVertical: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  compactAmenities: {
    flexDirection: 'row',
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  compactAmenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    minWidth: 40,
  },
  compactDistance: {
    fontSize: 9,
    fontWeight: '600',
  },
  compactVRBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default RenderNeighborhoodInfo;