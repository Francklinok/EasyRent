import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/hooks/themehook";
import { useLanguage } from '@/components/contexts/language';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemedText } from "@/components/ui/ThemedText";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEMS_PER_SCREEN = 4;

type PropertyType =
  | "All"
  | "villa"
  | "apartment"
  | "home"
  | "penthouse"
  | "studio"
  | "loft"
  | "bureau"
  | "chalet"
  | "hotel"
  | "terrain"
  | "commercial";



// ---- Icon Getter ----
const getPropertyIcon = (type: PropertyType, size: number) => {
  const icons: Record<PropertyType, string> = {
    All: "apps",
    villa: "home-city-outline",
    home: "home-outline",
    apartment: "office-building-outline",
    penthouse: "home-modern",
    studio: "home-floor-1",
    loft: "home-variant-outline",
    bureau: "domain",
    chalet: "home-group",
    hotel: "bed-outline",
    terrain: "pine-tree",
    commercial: "store-outline"
  };
  return <MaterialCommunityIcons name={icons[type]} size={size} />;
};

// ---- Main Component ----
const RenderCategoryTabs = ({
  onChange,
  viewType,
  onToggleView,
}: {
  onChange?: (type: PropertyType) => void;
  viewType?: "list" | "grid";
  onToggleView?: () => void;
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [selectedProperty, setSelectedProperty] = useState<PropertyType>("All");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const propertyLabels: Record<PropertyType, string> = useMemo(() => ({
    All: t('homeComponents.all'),
    villa: t('homeComponents.villaLabel'),
    apartment: t('homeComponents.apartmentLabel'),
    home: t('homeComponents.homeLabel'),
    penthouse: t('homeComponents.penthouseLabel'),
    studio: t('homeComponents.studioLabel'),
    loft: t('homeComponents.loftLabel'),
    bureau: t('homeComponents.bureauLabel'),
    chalet: t('homeComponents.chaletLabel'),
    hotel: t('homeComponents.hotelLabel'),
    terrain: t('homeComponents.terrainLabel'),
    commercial: t('homeComponents.commercialLabel'),
  }), [t]);

  const properties = useMemo(() => Object.keys(propertyLabels) as PropertyType[], [propertyLabels]);
  const itemWidth = useMemo(() => SCREEN_WIDTH / ITEMS_PER_SCREEN, []);
  


  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handlePropertySelect = useCallback(
    (property: PropertyType) => {
      if (property === selectedProperty) return;
      setSelectedProperty(property);
      onChange?.(property);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const index = properties.indexOf(property);
      if (scrollRef.current && index !== -1) {
        const scrollPosition = index * itemWidth - SCREEN_WIDTH / 2 + itemWidth / 2;
        scrollRef.current.scrollTo({ x: scrollPosition, animated: true });
      }
    },
    [selectedProperty, properties, itemWidth, onChange]
  );

  return (
    <Animated.View style={{ opacity: fadeAnim, paddingVertical: 0,  paddingBottom:0 }}>     
      {/* Categories and View Toggle */}
      <ThemedView style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 4,
        paddingHorizontal: 12
      }}>
        {/* Categories ScrollView */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            alignItems: "center",
            paddingRight: 8,

          }}
        >
          {properties.map((property, index) => {
            const isSelected = selectedProperty === property;
            return (
              <TouchableOpacity
                key={property}
                onPress={() => handlePropertySelect(property)}
                activeOpacity={0.7}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  marginRight: 6,
                  borderRadius: 6,
                  gap:12,
                  backgroundColor: isSelected ? theme.primary:theme.surfaceVariant,
                }}
              >
                <ThemedText
                  style={{
                    color: isSelected ? '#FFFFFF' : theme.typography.body,
                    fontWeight: isSelected ? "600" : "400",
                    fontSize: 12,
                    gap:4
                  }}
                  numberOfLines={1}
                >
                  {propertyLabels[property]}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ThemedView>
    </Animated.View>
  );
};

export default RenderCategoryTabs;
