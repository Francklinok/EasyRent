import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from "@/components/ui/ThemedView";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/components/contexts/theme/themehook";
import { ExtendedItemTypes } from '@/types/ItemType';

type  Props = {
  item:ExtendedItemTypes,
}


const RenderNeighborhoodInfo:React.FC<Props> = ({item} ) => {
  const { theme } = useTheme();
  type MaterialIconName = "school" | "medical-services";
type FontAwesome5IconName = "shopping-bag" | "train";

type Amenity = {
  iconSet: "MaterialIcons" | "FontAwesome5";
  icon: MaterialIconName | FontAwesome5IconName;
  distance: number;
  color: string;
};

const amenities: Amenity[] = [
  {
    icon: "school",
    iconSet: "MaterialIcons",
    distance: item.distanceToAmenities?.schools ?? 0,
    color: "#4F46E5",
  },
  {
    icon: "medical-services",
    iconSet: "MaterialIcons",
    distance: item.distanceToAmenities?.healthcare ?? 0,
    color: "#EF4444",
  },
  {
    icon: "shopping-bag",
    iconSet: "FontAwesome5",
    distance: item.distanceToAmenities?.shopping ?? 0,
    color: "#10B981",
  },
  {
    icon: "train",
    iconSet: "FontAwesome5",
    distance: item.distanceToAmenities?.transport ?? 0,
    color: "#8B5CF6",
  },
];

 
  return (
    <ThemedView style={styles.compactContainer}>
      <ThemedView style={styles.compactRow}>
             <ThemedView style={styles.compactAmenities}>
          {amenities.slice(0, 4).map((amenity, index) => (
            <ThemedView backgroundColor = "elevation.small" key={index} style={[
              styles.compactAmenityItem,
            ]}
            >
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
              <ThemedText variant='default'  intensity='normal' type = "caption">
                {amenity.distance > 0 ? `${amenity.distance}km` : '-'}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
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
    paddingHorizontal: 90,
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
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    minWidth: 40,
  },
  compactDistance: {
    fontSize: 9,
    fontWeight: '600',
  },
});

export default RenderNeighborhoodInfo;