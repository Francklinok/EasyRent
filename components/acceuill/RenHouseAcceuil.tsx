// RenHouseAcceuil.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  InteractionManager,
  StyleSheet,
} from "react-native";
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
import OptimizedFlashList from "./home/optimizedFlashList";
import { ExtendedItemTypes } from "@/types/ItemType";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");
// const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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

// --- Navigation Bar ---
const NavigationBar = React.memo(({ theme }: { theme: any }) => (
  <BlurView
    intensity={40}
    tint="dark"
    style={[styles.navigationBar, { borderColor: "rgba(255,255,255,0.1)" }]}
  >
    <ThemedView style={[styles.navigationContent, { backgroundColor: "transparent" }]}>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
        <MaterialIcons name="home" size={24} color="#3b82f6" />
        <ThemedText style={[styles.navText, { color: "#3b82f6" }]}>Accueil</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
        <MaterialIcons name="search" size={24} color={theme.subtext} />
        <ThemedText style={[styles.navText, { color: theme.subtext }]}>Recherche</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
        <MaterialIcons name="favorite-border" size={24} color={theme.subtext} />
        <ThemedText style={[styles.navText, { color: theme.subtext }]}>Favoris</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
        <MaterialIcons name="person-outline" size={24} color={theme.subtext} />
        <ThemedText style={[styles.navText, { color: theme.subtext }]}>Profil</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  </BlurView>
));

const RenHouseAcceuil = () => {
  const router = useRouter();
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [animatingElement, setAnimatingElement] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PropertyType>("All");
  const [isReady, setIsReady] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const { theme } = useTheme();

  // --- Extended Data ---
  const extendedData = useMemo<ExtendedItemTypes[]>(() => {
    console.log("🔄 Processing extended data...");
    return enrichItems(data);
  }, []);

  const filteredData = useMemo(() => {
    console.log(`🔍 Filtering data for category: ${selectedCategory}`);
    return selectedCategory === "All"
      ? extendedData
      : extendedData.filter((item) => item.type === selectedCategory);
  }, [selectedCategory, extendedData]);

  // --- Pulsation Animation ---
  const pulsate = useCallback(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseAnimation.start();
    return pulseAnimation;
  }, [pulseAnim]);

  // --- Navigation ---
  const navigateToInfo = useCallback((item: ExtendedItemTypes) => {
      router.push({ pathname: "/item/[itemId]", params: { itemId: item.id } });


  }, [router]);

  // --- Category Change ---
  const handleCategoryChange = useCallback((category: PropertyType) => {
    if (category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [selectedCategory]);

  // --- Refresh & Pagination ---
  const handleRefresh = useCallback(() => console.log("🔄 Refresh triggered"), []);
  const handleEndReached = useCallback(() => console.log("📄 End reached - loading more data"), []);

  // --- Effects ---
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      pulseAnimation = pulsate();
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
      lottieRef.current && setTimeout(() => lottieRef.current?.play(), 500);
      setIsReady(true);
    });
    return () => {
      interactionHandle.cancel();
      pulseAnimation?.stop();
      pulseAnim.setValue(1);
      fadeAnim.setValue(0);
    };
  }, [pulsate, fadeAnim, pulseAnim]);

  if (!isReady) {
    return (
      <ThemedView variant="default" style={styles.loadingContainer}>
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="h-full mt-2" variant="default" >
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.background} style={styles.gradient}>
        {/* FlashList with Header for Categories */}
        <RenderCategoryTabs
            onChange={handleCategoryChange}
            viewType={viewType}
            onToggleView={() => setViewType(viewType === "list" ? "grid" : "list")}
          />
        {viewType === "list" ? (
          
          <OptimizedFlashList
            data={filteredData}
            lottieRef={lottieRef}
            favorites={favorites}
            setFavorites={setFavorites}
            animatingElement={animatingElement}
            setAnimatingElement={setAnimatingElement}
            navigateToInfo={navigateToInfo}
            refreshing={false}
            onRefresh={handleRefresh}
            onEndReached={handleEndReached}
            contentContainerStyle={{ paddingBottom: 30 }}
            ListFooterComponent={<ThemedView style={{ height: 250 }} />}

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
            contentContainerStyle={{ paddingBottom: 30 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            initialNumToRender={6}
            getItemLayout={(data, index) => ({ length: 200, offset: 200 * index, index })}
            style={styles.flatList}            
          />
        )}

        <RenderFilterModal
          fadeAnim={fadeAnim}
          filterModalVisible={filterModalVisible}
          setFilterModalVisible={setFilterModalVisible}
        />
        {/* <NavigationBar theme={theme} /> */}
      </LinearGradient>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  gradient: { flex: 1,width: "100%" },
  flatList: { flex: 1},
  navigationBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  navigationContent: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16 },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 2 },
});

export default React.memo(RenHouseAcceuil);
