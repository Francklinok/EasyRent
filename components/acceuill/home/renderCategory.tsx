import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Text,
  View,
  TextInput,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedView } from "@/components/ui/ThemedView";
import { useTheme } from "@/components/contexts/theme/themehook";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemedText } from "@/components/ui/ThemedText";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEMS_PER_SCREEN = 4;

type PropertyType =
  | "All"
  | "Villa"
  | "Appartement"
  | "Maison"
  | "Penthouse"
  | "Studio"
  | "Loft"
  | "Bureau"
  | "Chalet"
  | "Hôtel"
  | "Terrain"
  | "Commercial";

const propertyLabels: Record<PropertyType, string> = {
  All: "Tous",
  Villa: "Villa",
  Appartement: "Appartement",
  Maison: "Maison",
  Penthouse: "Penthouse",
  Studio: "Studio",
  Loft: "Loft",
  Bureau: "Bureau",
  Chalet: "Chalet",
  Hôtel: "Hôtel",
  Terrain: "Terrain",
  Commercial: "Commercial",
};

// ---- MarqueeText ----
const MarqueeText = ({ text, style, duration = 3000 }: { text: string; style?: any; duration?: number }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (textWidth > containerWidth) {
      const loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, { toValue: -textWidth + containerWidth, duration, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
      loopAnim.start();
      return () => loopAnim.stop();
    } else {
      translateX.setValue(0);
    }
  }, [textWidth, containerWidth]);

  return (
    <ThemedView onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} style={{ overflow: "hidden", width: "80%" }}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <ThemedText onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)} style={style} numberOfLines={1}>
          {text}
        </ThemedText>
      </Animated.View>
    </ThemedView>
  );
};

// ---- Icon Getter ----
const getPropertyIcon = (type: PropertyType, size: number) => {
  const icons: Record<PropertyType, string> = {
    All: "apps",
    Villa: "home-city-outline",
    Maison: "home-outline",
    Appartement: "office-building-outline",
    Penthouse: "home-modern",
    Studio: "home-floor-1",
    Loft: "home-variant-outline",
    Bureau: "domain",
    Chalet: "home-group",
    Hôtel: "bed-outline",
    Terrain: "pine-tree",
    Commercial: "store-outline",
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
  viewType: "list" | "grid";
  onToggleView: () => void;
}) => {
  const { theme } = useTheme();
  const [selectedProperty, setSelectedProperty] = useState<PropertyType>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const properties = useMemo(() => Object.keys(propertyLabels) as PropertyType[], []);
  const itemWidth = useMemo(() => SCREEN_WIDTH / ITEMS_PER_SCREEN, []);
  
  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties;
    return properties.filter(property => 
      propertyLabels[property].toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [properties, searchQuery]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

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
    [selectedProperty, properties, itemWidth]
  );

  return (
    <Animated.View style={{ opacity: fadeAnim, paddingVertical: 1, backgroundColor:theme.surfaceVariant, paddingBottom:2 }}>
      {/* Search Bar */}
      {/* <ThemedView style={{ alignItems: "center", marginBottom: 8 }}>
        <ThemedView style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          paddingHorizontal: 18,
          backgroundColor: theme.surfaceVariant,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: theme.outline,
          width: 280,
        }}>
        <MaterialCommunityIcons name="magnify" size={18} color={theme.typography.body} style={{ marginRight: 8 }} />
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 8,
            fontSize: 14,
            color: theme.typography.body,
          }}
          placeholder="Rechercher un type..."
          placeholderTextColor={theme.typography.caption}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
            <MaterialCommunityIcons name="close" size={18} color={theme.typography.body} />
          </TouchableOpacity>
        ) : null}
        </ThemedView>
      </ThemedView> */}
      
      {/* Categories and View Toggle */}
      <ThemedView  className="flex-row items-center pb-1" style={{ backgroundColor:theme.surface + '90' }}>
        {/* ScrollView 75% */}
        <ThemedView  style={{ flex: 3, marginRight: 12, backgroundColor:theme.surface + '80'  }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 0, 
            gap: 0, 
          }}
        >
          {filteredProperties.map((property, index) => {
            const isSelected = selectedProperty === property;
            return (
              <MotiView
                key={property}
                from={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: isSelected ? 1.08 : 1 }}
                transition={{ delay: index * 40, type: "timing", duration: 300 }}
                style={{ width: itemWidth * 0.4, alignItems: "center", justifyContent: "center", marginHorizontal: 8,paddingLeft:18}}
              >
                <TouchableOpacity
                  onPress={() => handlePropertySelect(property)}
                  activeOpacity={0.8}
                  style={{
                    paddingVertical: 6,
                    // borderRadius: 18,
                    // backgroundColor:theme.outline,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 44,
                    width: 44,
                    flexDirection: "column",
                    // borderWidth:  1,
                    // borderColor:  theme.outline,
                    shadowColor: isSelected ? theme.primary : theme.shadowColor || "#000",
                    shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                    shadowOpacity: isSelected ? 0.25 : 0.1,
                    shadowRadius: isSelected ? 8 : 4,
                    // elevation: isSelected ? 6 : 2,
                  }}
                >
                  {React.cloneElement(getPropertyIcon(property, 18), {
                    color: isSelected ? theme.primary : theme.text,
                  })}
                  <View style={{ marginTop: 1, width: "100%", alignItems: "center" }}>
                    <ThemedText
                      style={{
                        color: isSelected ? theme.text : theme.typography.body,
                        fontWeight: isSelected ? "700" : "600",
                        fontSize: 9,
                        textAlign: "center",
                        width: "100%",
                        letterSpacing: 0.2,
                      }}
                      numberOfLines={1}
                    >
                      {propertyLabels[property]}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </ScrollView>
      </ThemedView>

        {/* Bouton 25% */}
        <ThemedView  style={{ flex: 0.5, alignItems: "center", justifyContent: "center", paddingLeft: 1, marginRight:6,backgroundColor: theme.surface + "90", }}>
          <TouchableOpacity
            onPress={onToggleView}
            activeOpacity={0.8}
            style={{
              backgroundColor: theme.success + '10',
              borderRadius: 20,
              padding: 8,
              // elevation: 4,
              // shadowColor: theme.primary,
              // shadowOffset: { width: 0, height: 3 },
              // shadowOpacity: 0.3,
              // shadowRadius: 6,
              // borderWidth: 1,
              // borderColor: theme.outline,
            }}
          >
            <MaterialCommunityIcons
              name={viewType === "list" ? "view-grid" : "view-list"}
              size={22}
              color={theme.text + '80'}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Animated.View>
  );
};

export default RenderCategoryTabs;
