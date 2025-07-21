// OptimizedFlashList.tsx
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import { Dimensions } from "react-native";
import RenderItem from "./renderItem";
import { ItemType } from "@/types/ItemType";
import { MutableRefObject } from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import LottieView from "lottie-react-native";
import FastImage from 'react-native-fast-image'; // Import FastImage
import { ExtendedItemTypes } from "@/types/ItemType";
const { width: screenWidth } = Dimensions.get("window");

type OptimizedFlashListProps = {
  data: ExtendedItemTypes[];
  lottieRef: MutableRefObject<LottieView | null>;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  animatingElement: string | null;
  setAnimatingElement: (id: string | null) => void;
  navigateToInfo: (item: ExtendedItemTypes) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onScroll?: any;
  ListHeaderComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
  contentContainerStyle?: any;
};

const OptimizedFlashList: React.FC<OptimizedFlashListProps> = ({
  data = [],
  lottieRef,
  favorites,
  setFavorites,
  animatingElement,
  setAnimatingElement,
  navigateToInfo,
  refreshing = false,
  onRefresh,
  onEndReached,
  onScroll,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
}) => {
  const flashListRef = useRef<FlashList<ExtendedItemTypes>>(null);

  // Configuration optimisée pour les performances
  const flashListConfig = useMemo(
    () => ({
      estimatedItemSize: 320,
      removeClippedSubviews: true,
      maxToRenderPerBatch: 8,
      windowSize: 118,
      initialNumToRender: 6,
      updateCellsBatchingPeriod: 100,
      getItemType: () => 'item',
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ExtendedItemTypes; index: number }) => (
      <RenderItem
        item={item}
        index={index}
        lottieRef={lottieRef}
        favorites={favorites}
        setFavorites={setFavorites}
        animatingElement={animatingElement}
        setAnimatingElement={setAnimatingElement}
        navigateToInfo={navigateToInfo}
      />
    ),
    [lottieRef, favorites, setFavorites, animatingElement, setAnimatingElement, navigateToInfo]
  );

  const keyExtractor = useCallback(
    (item: ItemType, index: number) => `${item.id}-${index}`,
    []
  );

  const ListEmptyComponent = useCallback(
    () => (
      <ThemedView
        style={{
          // flex: 1,
          minHeight: 400,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 50,
        }}
      >
        <ThemedText
          style={{
            opacity: 0.6,
            textAlign: "center",
            marginBottom: 8
          }}
        >
          Aucun élément à afficher
        </ThemedText>
        <ThemedText
          style={{
            opacity: 0.4,
            textAlign: "center"
          }}
        >
          Vérifiez vos filtres ou réessayez plus tard
        </ThemedText>
      </ThemedView>
    ),
    []
  );

  // Debug amélioré
  console.log("🔍 OptimizedFlashList Debug:", {
    dataLength: data?.length || 0,
    hasData: Array.isArray(data) && data.length > 0,
    firstItem: data?.[0]?.id,
    favoritesCount: favorites?.length || 0
  });

  // Vérification de sécurité des données
  const safeData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.warn("⚠️ Data is not an array:", data);
      return [];
    }
    return data.filter(item => item && item.id);
  }, [data]);

  // Preload images for the first few items
  useEffect(() => {
    if (safeData.length > 0) {
      const imagesToPreload = safeData
        .slice(0, flashListConfig.initialNumToRender + flashListConfig.maxToRenderPerBatch)
        .map(item => ({
          uri: (item as any).imageAvif || (item as any).imageWebP || item.avatar,
        }));

      FastImage.preload(imagesToPreload);
    }
  }, [safeData, flashListConfig.initialNumToRender, flashListConfig.maxToRenderPerBatch]);


  return (
    <ThemedView style={{ width: screenWidth, flex: 1 }}>
      <FlashList
        ref={flashListRef}
        data={safeData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        {...flashListConfig}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          paddingVertical: 8,
          paddingBottom: 120,
          ...(safeData.length === 0 ? { flexGrow: 1 } : {}),
          ...contentContainerStyle,
        }}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled={true}
        bounces={true}
        alwaysBounceVertical={false}
        style={{ flex: 1 }}
      />
    </ThemedView>
  );
};

export default React.memo(OptimizedFlashList);