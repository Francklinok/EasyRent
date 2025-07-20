import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { TouchableOpacity, Dimensions, Animated, StatusBar, InteractionManager } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { FlashList } from "@shopify/flash-list";
import data from "@/assets/data/data";
import { ItemType, FeatureIcon } from "@/types/ItemType";
import { useTheme } from "../contexts/theme/themehook";
import { ThemedText } from "../ui/ThemedText";
import { ThemedView } from "../ui/ThemedView";
import RenderHeader from "./home/RenderHeader";
import RenderFilterModal from "./home/renderFilterModal";
import RenderItem from "./home/renderItem";
import RenderGridItem from "./home/renderGridItem";
import enrichItems from "../utils/homeUtils/extendData";
import RenderCategoryTabs from "./home/renderCategory";
import OptimizedFlashList from "./home/optimizedFlashList";
const { width, height } = Dimensions.get('window');

// Configuration optimisée pour FlashList
const ITEM_HEIGHT = 300;
const GRID_ITEM_HEIGHT = 250;

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

const RenHouseAcceuil = () => {
  const router = useRouter();
  const { theme } = useTheme();
  
  // States optimisés
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [animatingElement, setAnimatingElement] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PropertyType>("All");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs optimisés
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Données enrichies memorizées
  const extendedData = useMemo(() => {
    const enrichedData = enrichItems(data);
    console.log("Extended data length:", enrichedData?.length);
    console.log("First item:", enrichedData?.[0]);
    return enrichedData;
  }, []);

  // Données filtrées memoizées
  const filteredData = useMemo(() => {
    const filtered = selectedCategory === "All"
      ? extendedData
      : extendedData.filter((item) => item.type === selectedCategory);
    console.log("Filtered data length:", filtered?.length);
    return filtered;
  }, [selectedCategory, extendedData]);

  // Animation de pulsation optimisée
  const pulsate = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.5,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]).start(() => {
      InteractionManager.runAfterInteractions(pulsate);
    });
  }, [pulseAnim]);

  // Navigation optimisée vers les détails
  const navigateToInfo = useCallback((item: ItemType) => {
    console.log("Navigating to item:", item.id);
    InteractionManager.runAfterInteractions(() => {
      router.push(`/property/${item.id}`);
    });
  }, [router]);

  // Pull to refresh optimisé
  const onRefresh = useCallback(() => {
    console.log("Refreshing...");
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Pagination optimisée
  const onEndReached = useCallback(() => {
    if (!loading) {
      console.log("Loading more...");
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [loading]);

  // Fonction de rendu pour la grille (fallback si besoin)
  const renderGridItem = useCallback(({ item, index }: { item: ItemType; index: number }) => (
    <RenderGridItem
      item={item}
      index={index}
      width={width}
      lottieRef={lottieRef}
      setAnimatingElement={setAnimatingElement}
      favorites={favorites}
      setFavorites={setFavorites}
      navigateToInfo={navigateToInfo}
    />
  ), [favorites, navigateToInfo]);

  // Key extractor pour le mode grille
  const keyExtractor = useCallback((item: ItemType, index: number) => `${item.id}-${index}`, []);

  // Header Component memoizé (optionnel)
  // const ListHeaderComponent = useMemo(() => (
  //   <ThemedView style={{ paddingBottom: 10 }}>
  //     <ThemedText style={{ textAlign: 'center', padding: 10 }}>
  //       {filteredData.length} propriétés trouvées
  //     </ThemedText>
  //   </ThemedView>
  // ), [filteredData.length]);

  // Initialisation des animations
  useEffect(() => {
    pulsate();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
    
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 500);
    }
    
    return () => {
      pulseAnim.setValue(1);
      fadeAnim.setValue(0);
    };
  }, [pulsate, fadeAnim]);

  // Gestion du scroll optimisée
  const onScroll = useMemo(() => 
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: true }
    ), [scrollY]
  );

  return (
    <ThemedView  >
      <StatusBar barStyle={ "light-content"}  />
      <LinearGradient colors={theme.background} >
        
        {/* Header Component */}
        <RenderCategoryTabs
          onChange={(category) => {
            console.log("Category changed:", category);
            setSelectedCategory(category);
          }}
        />
        
        {/* Debug Info */}
        {/* <ThemedView style={{ padding: 10, backgroundColor: 'rgba(255,0,0,0.1)' }}>
          <ThemedText>Data: {extendedData?.length} | Filtered: {filteredData?.length}</ThemedText>
        </ThemedView> */}
        
        {/* Main Content avec FlashList optimisé */}
        <Animated.View 
          style={{ 
            flex: 1,
            opacity: fadeAnim,
          }}
        >
          

          {viewType === "list" ? (
            <OptimizedFlashList
              data={filteredData}
              lottieRef={lottieRef}
              favorites={favorites}
              setFavorites={setFavorites}
              animatingElement={animatingElement}
              setAnimatingElement={setAnimatingElement}
              navigateToInfo={navigateToInfo}
              onScroll={onScroll}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onEndReached={onEndReached}
              // ListHeaderComponent={ListHeaderComponent}
            />
           
          ) : (
            // Mode grille - FlashList standard pour éviter les complications
            <FlashList
              data={filteredData}
              keyExtractor={keyExtractor}
              renderItem={renderGridItem}
              numColumns={2}
              estimatedItemSize={GRID_ITEM_HEIGHT}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ 
                paddingTop: 8, 
                paddingBottom: 100, 
 }}
              // ListHeaderComponent={ListHeaderComponent}
              onScroll={onScroll}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              directionalLockEnabled={true}
              bounces={true}
            />
          )}
        </Animated.View>

        {/* Modal de filtre */}
        <RenderFilterModal
          fadeAnim={fadeAnim}
          filterModalVisible={filterModalVisible}
          setFilterModalVisible={setFilterModalVisible}
        />
      </LinearGradient>
    </ThemedView>
  );
};

export default React.memo(RenHouseAcceuil);