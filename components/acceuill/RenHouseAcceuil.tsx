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
  Platform,
  FlatList,
  ScrollView,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { BlurView } from "expo-blur";
import { useTheme } from "../../hooks/themehook";
import { ThemedText } from "../ui/ThemedText";
import { ThemedView } from "../ui/ThemedView";
import { FilterState, DEFAULT_FILTERS } from "./home/RenderHeader";
import RenderGridItem from "./home/renderGridItem";
import RenderServiceCard from "./home/RenderServiceCard";
import RenderCategoryTabs from "./home/renderCategory";
import OptimizedFlashList from "./home/optimizedFlashList";
import { ExtendedItemTypes } from "@/types/ItemType";
import LottieView from "lottie-react-native";
import VirtualTourViewer from "@/components/virtualTour/VirtualTourViewer";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilters } from "@/services/api/propertyService";
import RenderHeader from "./home/RenderHeader";
import StatsBar from "./home/StatsBar";
import EmptyState from "./home/EmptyState";
import { useServices } from "@/hooks/useServices";
import { useFavorites,FavoriteItem } from "../contexts/favorites/FavoritesContext";
import  { useAuth } from "../contexts/authContext/AuthContext";


const { width } = Dimensions.get("window");

export type ActionType ="ALL" |"RENT" | "SELL"



const RenHouseAcceuil = () => {
  const router = useRouter();
  const [scrollY] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [animatingElement, setAnimatingElement] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<ActionType>("ALL");
  const [hasError, setHasError] = useState(false);
  const [virtualTourVisible, setVirtualTourVisible] = useState(false);
  const [currentTour, setCurrentTour] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gridFilter, setGridFilter] = useState<string>('Tout');

  // Animation refs 
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const { theme } = useTheme();

  const {
    properties,
    loading,
    error: propertiesError,
    totalCount,
    hasNextPage,
    refresh,
    loadMore,
    applyFilters,
    availableCount, 
  } = useProperties({
    filters: {},
    pagination: { page: 1, limit: 20 },
    autoLoad: true
  });

  const { services, totalCount: servicesTotalCount } = useServices({
    filters: {},
    pagination: { first: 20 },
    autoLoad: true
  });

  const extendedData = useMemo<ExtendedItemTypes[]>(() => {
    //convert properties
    const propertiesData = properties.map((prop: any, idx: number) => {
      
      let allImages: string[] = [];

      if (Array.isArray(prop.images)) {
        allImages = prop.images.map((img: any) => {
          if (typeof img === 'string') {
            return img;
          } else if (img && typeof img === 'object' && img.url) {
            return img.url;
          }
          return null;
        }).filter((url: string | null) => url !== null) as string[];
      }

      // Fallback: if no general images, use the first room image as main avatar
      let roomFallbackImage: string | null = null;
      if (allImages.length === 0 && Array.isArray(prop.propertyRooms)) {
        for (const room of prop.propertyRooms) {
          if (room.images && room.images.length > 0) {
            const img = room.images[0];
            roomFallbackImage = img?.variants?.medium || img?.variants?.small || img?.originalUrl || null;
            if (roomFallbackImage) break;
          }
        }
      }
      const firstValidImage = allImages.length > 0 ? allImages[0] : (roomFallbackImage || 'https://via.placeholder.com/400x300?text=No+Image');

      return {
        id: prop.id,
        title: prop.title,
        location: prop.address || prop.generalHInfo?.area || 'Location',
        price: prop.ownerCriteria?.monthlyRent || 0,
        currency: prop.ownerCriteria?.currency || 'XAF',
        type: prop.propertyType || 'villa',
        listType: prop.actionType === 'rent' ? 'rent' : 'sale',
        propertyType: prop.propertyType || 'villa',
        actionType: prop.actionType || 'rent',
        avatar: firstValidImage,
        images: allImages, 
        imageAvif: firstValidImage,
        imageWebP: firstValidImage,
        thumbnail: firstValidImage,
        availibility: prop.status === 'AVAILABLE' ? 'available' : 'not available',
        rawStatus: prop.status,
        stars: 0,
        review: prop.description || '',
        description: prop.description || '',
        virtualTourAvailable: prop.virtualTours?.length > 0 || false,
        generalInfo: {
          bedrooms: prop.generalHInfo?.bedrooms || 0,
          bathrooms: prop.generalHInfo?.bathrooms || 0,
          surface: prop.generalLandinfo?.surface || prop.generalHInfo?.surface || 0,
          rooms: prop.generalHInfo?.rooms || 0,
          furnished: prop.generalHInfo?.furnished || false,
          pets: prop.generalHInfo?.pets || false,
          smoking: prop.generalHInfo?.smoking || false,
        },
        owner: {
          id: prop.ownerId || 'owner1',
          name: prop.ownerName || 'Propriétaire',
          phone: prop.ownerPhone || '+237 677 123 456',
          email: prop.ownerEmail || 'owner@email.com',
          avatar: prop.ownerAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
        },
        propertyAvailability: {
          startDate: prop.availableFrom || new Date().toISOString(),
          type: prop.availabilityType || 'available',
        },
        equipments: prop.equipments || [],
        ownerCriteria: {
          minimumDuration: prop.ownerCriteria?.minimumDuration || '6 mois',
          solvability: prop.ownerCriteria?.solvability || 'instant',
          currency: prop.ownerCriteria?.currency || 'XAF',
          guarantorRequired: prop.ownerCriteria?.guarantorRequired || false,
          acceptedSituations: prop.ownerCriteria?.acceptedSituations || ['employed', 'student'],
          monthlyRent: prop.ownerCriteria?.monthlyRent || 0,
          depositAmount: prop.ownerCriteria?.depositAmount || 0,
          isdocumentRequired: prop.ownerCriteria?.isdocumentRequired || false,
          requiredDocuments: prop.ownerCriteria?.requiredDocuments || {
            tenant: [],
            guarantor: []
          }
        },
        services: prop.services || [],
        features: prop.amenities || [],
        amenities: prop.amenities || [],
        atouts: prop.atouts || [],
        hotelRoomTypes: prop.hotelRoomTypes || [],
        propertyRooms: prop.propertyRooms || [],
        rentalStrategy: prop.rentalStrategy || 'global',
        roomAvailability: prop.roomAvailability || null,
        cryptoEnabled: prop.cryptoEnabled || false,
        energyScore: 7,
        distanceToAmenities: {
          schools: 500,
          healthcare: 1000,
          shopping: 300,
          transport: 200
        },
        itemType: 'property'
      };
    });

    const servicesData = services.map((service: any, idx: number) => {
      let allImages: string[] = [];

      const imageSources = [
        service.media?.photos,
        service.images,
        service.photos,
        service.media?.images
      ];

      for (const source of imageSources) {
        if (Array.isArray(source)) {
          const validUrls = source.map((img: any) => {
            if (typeof img === 'string') {
              return img;
            } else if (img && typeof img === 'object' && img.url) {
              return img.url;
            }
            return null;
          }).filter((url: string | null) => url !== null) as string[];

          allImages = allImages.concat(validUrls);
        }
      }

      const firstValidImage = allImages.length > 0 ? allImages[0] :
        (service.thumbnail || service.avatar || 'https://via.placeholder.com/400x300?text=Service');

      const serviceId = service._id || service.id;
      const convertedService = {
        id: serviceId?.toString() || `service-${idx}`,
        title: service.title,
        location: service.availability?.zones?.join(', ') || 'Partout',
        price: service.pricing?.basePrice || 0,
        currency: service.pricing?.currency || 'XAF',
        type: service.category || 'Service',
        listType: 'service' as const,
        avatar: firstValidImage,
        images: allImages.length > 0 ? allImages : [firstValidImage],
        imageAvif: firstValidImage,
        imageWebP: firstValidImage,
        thumbnail: firstValidImage,
        availibility: service.status === 'active' ? 'available' : 'not available',
        stars: service.rating || 4.0,
        review: service.description || '',
        description: service.description || '',
        virtualTourAvailable: false,
        generalInfo: {
          bedrooms: 0,
          bathrooms: 0,
          surface: 0,
          rooms: 0,
          furnished: false,
          pets: false,
          smoking: false,
        },
        owner: {
          id: service.provider?.id || 'provider1',
          name: service.provider?.companyName || 'Fournisseur',
          phone: service.provider?.contactInfo?.phone || '+237 677 123 456',
          email: service.provider?.contactInfo?.email || 'provider@email.com',
          avatar: 'https://via.placeholder.com/150'
        },
        propertyAvailability: {
          startDate: new Date().toISOString(),
          type: 'immediate'
        },
        equipments: [],
        ownerCriteria: {
          minimumDuration: '1 mois',
          solvability: 'instant',
          guarantorRequired: false,
          acceptedSituations: ['employed', 'student', 'retired'],
          monthlyRent: service.pricing?.basePrice || 0,
          depositAmount: 0,
          requiredDocuments: {
            tenant: [],
            guarantor: []
          }
        },
        services: [],
        features: [],
        energyScore: 0,
        distanceToAmenities: {
          schools: 0,
          healthcare: 0,
          shopping: 0,
          transport: 0
        },
        itemType: 'service',
        serviceCategory: service.category,
        serviceProvider: service.provider?.companyName
      };

      return convertedService;
    });

    const combined = [...propertiesData, ...servicesData];
    return combined as ExtendedItemTypes[];
  }, [properties, services]);

  const filteredData = useMemo(() => {
  if (!extendedData.length) return [];

  return extendedData.filter(item => {
    // Services always visible
    if (item.itemType === "service") return true;

    if (item.itemType === "property") {
      // Transaction type filter - skip if ALL is selected
      if (transactionType !== "ALL") {
        if (transactionType === "RENT" && item.listType !== "rent") return false;
        if (transactionType === "SELL" && item.listType !== "sale") return false;
      }

      // Price range filter
      const price = item.price || 0;
      if (price < activeFilters.priceRange[0] || price > activeFilters.priceRange[1]) return false;

      // Property type filter
      if (activeFilters.propertyType && item.type?.toLowerCase() !== activeFilters.propertyType) return false;

      // Bedrooms filter
      if (activeFilters.bedrooms && (item.generalInfo?.bedrooms || 0) < activeFilters.bedrooms) return false;

      return true;
    }

    return false;
  });
}, [extendedData, transactionType, activeFilters]);

  // Split filtered data into properties and services for grid view
  const gridPropertyItems = useMemo(() =>
    filteredData.filter(item => item.itemType !== 'service'),
    [filteredData]
  );
  const gridServiceItems = useMemo(() =>
    filteredData.filter(item => item.itemType === 'service'),
    [filteredData]
  );

  // Grid filter tabs: "Tout" + unique property types + "Service" (if services exist)
  const gridFilterTabs = useMemo(() => {
    const tabs: string[] = ['Tout'];
    const typeSet = new Set<string>();
    for (const item of filteredData) {
      if (item.itemType === 'service') {
        typeSet.add('Service');
      } else if (item.type) {
        typeSet.add(item.type);
      }
    }
    // Add property types first, then Service
    for (const t of typeSet) {
      if (t !== 'Service') tabs.push(t);
    }
    if (typeSet.has('Service')) tabs.push('Service');
    return tabs;
  }, [filteredData]);

  // Items filtered by gridFilter for the vertical list
  const gridFilteredItems = useMemo(() => {
    if (gridFilter === 'Tout') return filteredData;
    if (gridFilter === 'Service') return gridServiceItems;
    return filteredData.filter(item => item.itemType !== 'service' && item.type === gridFilter);
  }, [filteredData, gridFilter, gridServiceItems]);

 const onTransactionSelect = (type: "ALL" | "RENT" | "SELL") => {
  setTransactionType(type);
};

  const handleApplyFilters = useCallback((filters: FilterState) => {
    setActiveFilters(filters);
    // Map filter state to PropertyFilters for the API
    const propertyFilters: PropertyFilters = {};
    if (filters.propertyType) propertyFilters.propertyType = filters.propertyType;
    if (filters.priceRange[0] > 0) propertyFilters.minPrice = filters.priceRange[0];
    if (filters.priceRange[1] < 5000000) propertyFilters.maxPrice = filters.priceRange[1];
    if (filters.bedrooms) propertyFilters.minBedrooms = filters.bedrooms;
    if (filters.actionType) propertyFilters.actionType = filters.actionType;
    applyFilters(propertyFilters);
  }, [applyFilters]);

  // --- Scroll Handler avec dimensions dynamiques ---
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    try {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const scrollDifference = currentScrollY - lastScrollY.current;
      
      // Calcul dynamique des dimensions
      const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 10;
      const renderHeaderHeight = 80;
      const statsBarHeight = 62;
      const totalHeaderHeight = statusBarHeight + renderHeaderHeight + statsBarHeight;
      
      const threshold = 3;
      
      if (Math.abs(scrollDifference) > threshold) {
        const newDirection = scrollDifference > 0 ? 'up' : 'down';
        
        if (newDirection !== scrollDirection.current) {
          scrollDirection.current = newDirection;
          
          if (newDirection === 'up' && currentScrollY > totalHeaderHeight) {
            // Scroll vers le haut - cacher le header progressivement
            Animated.parallel([
              Animated.timing(headerOpacity, {
                toValue: 0.9,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(headerTranslateY, {
                toValue: -totalHeaderHeight,
                duration: 250,
                useNativeDriver: true,
              })
            ]).start();
          } else if (newDirection === 'down' || currentScrollY <= totalHeaderHeight) {
            Animated.parallel([
              Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(headerTranslateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              })
            ]).start();
          }
        }
      }
      
      lastScrollY.current = currentScrollY;
      scrollY.setValue(currentScrollY);
    } catch {
      // Scroll handling error
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
    } catch {
      return null;
    }
  }, [pulseAnim]);

  // --- Navigation ---
  const navigateToInfo = useCallback((item: ExtendedItemTypes) => {
    if (!item.id) return;

    // Pass item data directly for instant loading (no network request needed)
    router.push({
      pathname: `/info/[infoId]`,
      params: {
        infoId: item.id,
        itemData: JSON.stringify(item)
      }
    });
  }, [router]);

  // --- Refresh on focus (to reflect payment-triggered status changes) ---
  useFocusEffect(useCallback(() => {
    refresh();
  }, [refresh]));

  // --- Refresh & Pagination ---
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
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
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [headerOpacity, headerTranslateY, refresh]);

  const handleEndReached = useCallback(async () => {
    if (hasNextPage && !loading) {
      await loadMore();
    }
  }, [hasNextPage, loading, loadMore]);

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
      });

      return () => {
        interactionHandle.cancel();
        if (pulseAnimation) {
          pulseAnimation.stop();
        }
        pulseAnim.setValue(1);
        fadeAnim.setValue(0);
      };
    } catch {
      // Animations failed, content will still render
    }
  }, [pulsate, fadeAnim, pulseAnim]);

  // --- Error fallback ---
  if (hasError || propertiesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {propertiesError || "Une erreur est survenue"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setHasError(false);
            refresh();
          }}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Loading fallback (only on cold start with no cached data) ---
  if (loading && properties.length === 0) {
    return (
      <ThemedView className="h-full" style={styles.loadingContainer}>
        <LottieView
          ref={lottieRef}
          source={require('@/assets/lottie/loading.json')}
          style={{ width: 100, height: 100 }}
          autoPlay
          loop
        />
        <Text style={styles.loadingText}>Chargement des propriétés...</Text>
      </ThemedView>
    );
  }

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 40;
  const renderHeaderHeight = 68;
  const statsBarHeight = 89;
  const totalHeaderHeight = statusBarHeight + renderHeaderHeight + statsBarHeight;

  return (
    <ThemedView className="h-full">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Header */}
      <ThemedView
        style={[
          styles.headerContainer,
          
        ]}
      >
        <RenderHeader
          viewType={viewType}
          setViewType={setViewType}
          scrollY={scrollY}
          totalProperties={totalCount}
          availableProperties={availableCount}
          totalServices={servicesTotalCount}
          onTransactionSelect={onTransactionSelect}
          activeFilterCount={
            (activeFilters.propertyType ? 1 : 0) +
            (activeFilters.bedrooms ? 1 : 0) +
            activeFilters.amenities.length +
            (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 5000000 ? 1 : 0)
          }
          onApplyFilters={handleApplyFilters}
          activeFilters={activeFilters}
        />
      </ThemedView>

      {/* principal content  */}
      {filteredData.length === 0 && !loading ? (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            😔 Aucune propriété
          </ThemedText>
          <ThemedText style={{ fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
            Les données n'ont pas pu être chargées. Vérifiez votre configuration.
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
            Debug: {properties.length} propriétés brutes, {extendedData.length} converties
          </ThemedText>
          <TouchableOpacity
            onPress={handleRefresh}
            style={{
              marginTop: 24,
              paddingHorizontal: 30,
              paddingVertical: 12,
              backgroundColor: theme.primary,
              borderRadius: 24
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: '600' }}>
              Réessayer
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : viewType === "list" ? (
        <>
          <OptimizedFlashList
          data={filteredData}
          // lottieRef={lottieRef}
          // favorites={favorites}
          // setFavorites={setFavorites}
          // animatingElement={animatingElement}
          setAnimatingElement={setAnimatingElement}
          navigateToInfo={navigateToInfo}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          onEndReached={handleEndReached}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingBottom: 250,
            paddingTop: totalHeaderHeight 
          }}

          ListFooterComponent={
            <ThemedView style={{ height: 200 }} />
          }
          onVirtualTourPress={(tour: any) => {
            setCurrentTour(tour);
            setVirtualTourVisible(true);
          }}
        />
        </>
      ) : (
        <ThemedView style={[styles.flatList, { flex: 1, paddingTop: totalHeaderHeight + 6 }]}>
          {/* Properties - horizontal scroll */}
          {gridPropertyItems.length > 0 && (
            <ThemedView style={{ marginBottom: 12 }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={gridPropertyItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 8, gap: 10 }}
                renderItem={({ item, index }) => (
                  <ThemedView style={{ width: width * 0.6 }}>
                    <RenderGridItem
                      item={item}
                      index={index}
                      width={width}
                      lottieRef={lottieRef}
                      setAnimatingElement={setAnimatingElement}
                      favorites={favorites}
                      setFavorites={setFavorites}
                    />
                  </ThemedView>
                )}
              />
            </ThemedView>
          )}

          {/* Filter tabs - compact horizontal scroll */}
          <ThemedView style={{ marginBottom: 8 }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={gridFilterTabs}
              keyExtractor={(tab) => tab}
              contentContainerStyle={{ paddingHorizontal: 10, gap: 6 }}
              renderItem={({ item: tab }) => {
                const isActive = gridFilter === tab;
                return (
                  <TouchableOpacity
                    onPress={() => setGridFilter(tab)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 16,
                      backgroundColor: isActive ? (theme.primary as string) : 'transparent',
                      borderWidth: 1,
                      borderColor: isActive ? (theme.primary as string) : (theme.outline as string) + '25',
                    }}
                  >
                    <ThemedText style={{
                      fontSize: 11,
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? '#fff' : (theme.onSurfaceVariant as string),
                    }}>
                      {tab}
                    </ThemedText>
                  </TouchableOpacity>
                );
              }}
            />
          </ThemedView>

          {/* Filtered items - vertical scroll */}
          <FlatList
            data={gridFilteredItems}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 120, gap: 10 }}
            renderItem={({ item, index }) => {
              if (item.itemType === 'service') {
                return (
                  <RenderServiceCard
                    item={item}
                    index={index}
                    width={width}
                    lottieRef={lottieRef}
                    setAnimatingElement={setAnimatingElement}
                    favorites={favorites}
                    setFavorites={setFavorites}
                  />
                );
              }
              return (
                <RenderGridItem
                  item={item}
                  index={index}
                  width={width}
                  lottieRef={lottieRef}
                  setAnimatingElement={setAnimatingElement}
                  favorites={favorites}
                  setFavorites={setFavorites}
                />
              );
            }}
          />
        </ThemedView>
      )}

      {/* Virtual Tour Viewer Modal */}
      {currentTour && (
        <VirtualTourViewer
          tour={currentTour}
          visible={virtualTourVisible}
          onClose={() => {
            setVirtualTourVisible(false);
            setCurrentTour(null);
          }}
          onInteraction={() => {
            // Handle tour interaction
          }}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { 
    justifyContent: "center", 
    alignItems: "center",
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
    backgroundColor: "rgba(0,0,0,0.95)",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 0,
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