// RenHouseAcceuil.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { TouchableOpacity, Dimensions, Animated, StatusBar } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import data from "@/assets/data/data";
import { useTheme } from "../contexts/theme/themehook";
import { ThemedText } from "../ui/ThemedText";
import { ThemedView } from "../ui/ThemedView";
import RenderFilterModal from "./home/renderFilterModal";
import RenderGridItem from "./home/renderGridItem";
import enrichItems from "../utils/homeUtils/extendData";
import RenderCategoryTabs from "./home/renderCategory";
import OptimizedFlashList from "./home/OptimizedFlashList"; // <-- Import FlashList optimisée
import { ExtendedItemTypes } from "@/types/ItemType";

const { width } = Dimensions.get("window");

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

const RenHouseAcceuil = () => {
  const router = useRouter();
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [animatingElement, setAnimatingElement] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PropertyType>("All");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulsate = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start(() => pulsate());
  }, [pulseAnim]);

  useEffect(() => {
    pulsate();
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

    if (lottieRef.current) {
      setTimeout(() => lottieRef.current?.play(), 500);
    }

    return () => {
      pulseAnim.setValue(1);
      fadeAnim.setValue(0);
    };
  }, [pulsate, fadeAnim]);

  // On enrichit les données
  const extendedData: ExtendedItemTypes[] = enrichItems(data);

  // Filtrage des données
  const filteredData =
    selectedCategory === "All"
      ? extendedData
      : extendedData.filter((item) => item.type === selectedCategory);

  return (
    <ThemedView variant="default" className="flex">
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.background} className="flex">
        {/* Tabs de catégories */}
        <RenderCategoryTabs onChange={(category) => setSelectedCategory(category)} />

        {/* Liste des propriétés */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {viewType === "list" ? (
            <OptimizedFlashList
              data={filteredData}
              lottieRef={lottieRef}
              favorites={favorites}
              setFavorites={setFavorites}
              animatingElement={animatingElement}
              setAnimatingElement={setAnimatingElement}
              navigateToInfo={(item) => router.push(`/property/${item.id}`)}
              refreshing={false}
              onRefresh={() => console.log("Refresh triggered")}
              onEndReached={() => console.log("End reached")}
              contentContainerStyle={{ paddingTop: 1, paddingBottom: 30 }}
              ListHeaderComponent={<></>}
            />
          ) : (
            <Animated.FlatList
              data={filteredData}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <RenderGridItem
                  item={item}
                  index={index}
                  width={width}
                  lottieRef={lottieRef}
                  setAnimatingElement={setAnimatingElement}
                  favorites={favorites}
                  setFavorites={setFavorites}
                />
              )}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              contentContainerStyle={{ paddingTop: 120, paddingBottom: 30 }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
            />
          )}
        </Animated.View>

        {/* Modal de filtre */}
        <RenderFilterModal
          fadeAnim={fadeAnim}
          filterModalVisible={filterModalVisible}
          setFilterModalVisible={setFilterModalVisible}
        />

        {/* Barre de navigation */}
        <BlurView
          intensity={40}
          tint="dark"
          className="absolute bottom-0 left-0 right-0 border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <ThemedView className="flex-row justify-around py-4" style={{ backgroundColor: "transparent" }}>
            <TouchableOpacity className="items-center">
              <MaterialIcons name="home" size={24} color="#3b82f6" />
              <ThemedText style={{ fontSize: 12, color: "#3b82f6", marginTop: 2 }}>Accueil</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <MaterialIcons name="search" size={24} color={theme.subtext} />
              <ThemedText style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>Recherche</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <MaterialIcons name="favorite-border" size={24} color={theme.subtext} />
              <ThemedText style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>Favoris</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <MaterialIcons name="person-outline" size={24} color={theme.subtext} />
              <ThemedText style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>Profil</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </BlurView>
      </LinearGradient>
    </ThemedView>
  );
};

export default RenHouseAcceuil;
