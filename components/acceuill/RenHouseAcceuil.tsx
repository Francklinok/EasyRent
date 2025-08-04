// RenHouseAcceuil.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  InteractionManager,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  Text,
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
  const [hasError, setHasError] = useState(false);

  // Animation refs - mais plus conservateur
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const { theme } = useTheme();

  // --- Extended Data avec gestion d'erreur ---
  const extendedData = useMemo<ExtendedItemTypes[]>(() => {
    try {
      console.log("🔄 Processing extended data...");
      const result = enrichItems(data);
      console.log("✅ Extended data processed:", result.length);
      return result;
    } catch (error) {
      console.error("❌ Error processing extended data:", error);
      setHasError(true);
      return [];
    }
  }, []);

  const filteredData = useMemo(() => {
    try {
      console.log(`🔍 Filtering data for category: ${selectedCategory}`);
      const result = selectedCategory === "All"
        ? extendedData
        : extendedData.filter((item) => item.type === selectedCategory);
      console.log("✅ Filtered data:", result.length);
      return result;
    } catch (error) {
      console.error("❌ Error filtering data:", error);
      return [];
    }
  }, [selectedCategory, extendedData]);

  // --- Scroll Handler simplifié ---
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    try {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const scrollDifference = currentScrollY - lastScrollY.current;
      
      const threshold = 10;
      
      if (Math.abs(scrollDifference) > threshold) {
        const newDirection = scrollDifference > 0 ? 'up' : 'down';
        
        if (newDirection !== scrollDirection.current) {
          scrollDirection.current = newDirection;
          
          if (newDirection === 'up') {
            // Scroll vers le haut - cacher
            Animated.parallel([
              Animated.timing(headerOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(headerTranslateY, {
                toValue: -80,
                duration: 300,
                useNativeDriver: true,
              })
            ]).start();
          } else {
            // Scroll vers le bas - afficher
            Animated.parallel([
              Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(headerTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              })
            ]).start();
          }
        }
      }
      
      lastScrollY.current = currentScrollY;
      scrollY.setValue(currentScrollY);
    } catch (error) {
      console.error("❌ Error in handleScroll:", error);
    }
  }, [headerOpacity, headerTranslateY, scrollY]);

  // --- Pulsation Animation ---
  const pulsate = useCallback(() => {
    try {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseAnimation.start();
      return pulseAnimation;
    } catch (error) {
      console.error("❌ Error in pulsate:", error);
      return null;
    }
  }, [pulseAnim]);

  // --- Navigation ---
  const navigateToInfo = useCallback((item: ExtendedItemTypes) => {
    try {
      router.push({ pathname: "/info/[infoId]", params: { id: item.id } });
    } catch (error) {
      console.error("❌ Error navigating:", error);
    }
  }, [router]);

  // --- Category Change ---
  const handleCategoryChange = useCallback((category: PropertyType) => {
    try {
      if (category !== selectedCategory) {
        setSelectedCategory(category);
        // Réafficher le header
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
        scrollDirection.current = 'down';
        lastScrollY.current = 0;
      }
    } catch (error) {
      console.error("❌ Error in category change:", error);
    }
  }, [selectedCategory, headerOpacity, headerTranslateY]);

  // --- Refresh & Pagination ---
  const handleRefresh = useCallback(() => {
    try {
      console.log("🔄 Refresh triggered");
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
      scrollDirection.current = 'down';
      lastScrollY.current = 0;
    } catch (error) {
      console.error("❌ Error in refresh:", error);
    }
  }, [headerOpacity, headerTranslateY]);

  const handleEndReached = useCallback(() => {
    console.log("📄 End reached - loading more data");
  }, []);

  // --- Effects ---
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    try {
      const interactionHandle = InteractionManager.runAfterInteractions(() => {
        pulseAnimation = pulsate();
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
        if (lottieRef.current) {
          setTimeout(() => lottieRef.current?.play(), 500);
        }
        setIsReady(true);
      });
      
      return () => {
        interactionHandle.cancel();
        if (pulseAnimation) {
          pulseAnimation.stop();
        }
        pulseAnim.setValue(1);
        fadeAnim.setValue(0);
      };
    } catch (error) {
      console.error("❌ Error in useEffect:", error);
      setIsReady(true); // Forcer l'affichage même en cas d'erreur
    }
  }, [pulsate, fadeAnim, pulseAnim]);

  // --- Error fallback ---
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Une erreur est survenue</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setHasError(false);
            setIsReady(false);
          }}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Loading fallback ---
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // --- Debug: afficher quelque chose de simple d'abord ---
  console.log("🎯 Rendering main component", {
    extendedDataLength: extendedData.length,
    filteredDataLength: filteredData.length,
    theme: !!theme,
    isReady
  });

  return (
    <ThemedView className="h-full" variant="default">
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.background || ['#000', '#111']} style={styles.gradient}>
        
        {/* Header fixe avec animation simple */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }
          ]}
        >
          <RenderCategoryTabs
            onChange={handleCategoryChange}
            viewType={viewType}
            onToggleView={() => setViewType(viewType === "list" ? "grid" : "list")}
          />
        </Animated.View>

        {/* Test: Afficher au moins quelque chose */}
        <View style={styles.testContainer}>
          <Text style={styles.testText}>Data: {filteredData.length} items</Text>
          <Text style={styles.testText}>View: {viewType}</Text>
          <Text style={styles.testText}>Category: {selectedCategory}</Text>
        </View>

        {/* Contenu principal */}
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
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ 
              paddingBottom: 30, 
              paddingTop: 62 
            }}
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
            contentContainerStyle={{ 
              paddingBottom: 30,
              paddingTop: 80
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { 
                useNativeDriver: true,
                listener: handleScroll
              }
            )}
            scrollEventThrottle={16}
            style={styles.flatList}
          />
        )}

        <RenderFilterModal
          fadeAnim={fadeAnim}
          filterModalVisible={filterModalVisible}
          setFilterModalVisible={setFilterModalVisible}
        />
      </LinearGradient>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#000'
  },
  loadingText: {
    color: '#fff',
    fontSize: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#000'
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryText: {
    color: '#fff',
    fontSize: 14
  },
  gradient: { 
    flex: 1, 
    width: "100%" 
  },
  headerContainer: {
    backgroundColor: "transparent",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 60,
    justifyContent: 'center',
  },
  testContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 999
  },
  testText: {
    color: '#fff',
    fontSize: 12
  },
  flatList: { 
    flex: 1
  },
  navigationBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  navigationContent: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    paddingVertical: 16 
  },
  navItem: { 
    alignItems: "center" 
  },
  navText: { 
    fontSize: 12, 
    marginTop: 2 
  },
});

export default React.memo(RenHouseAcceuil);