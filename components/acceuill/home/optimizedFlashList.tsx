import React, { useCallback, useMemo, useRef, useEffect, memo } from "react";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Dimensions, InteractionManager, Image as RNImage, StyleSheet } from "react-native";
import RenderItem from "./renderItem";
import RenderServiceListItem from "./RenderServiceListItem";
import { MutableRefObject } from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import LottieView from "lottie-react-native";
import { ExtendedItemTypes } from "@/types/ItemType";
import { Image } from "expo-image";
import { useLanguage } from '@/components/contexts/language';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Constants optimisées basées sur les bonnes pratiques FlashList
const PERFORMANCE_CONFIG = {
  estimatedItemSize: 480,
  removeClippedSubviews: true,
  maxToRenderPerBatch: 6,
  windowSize: 10,
  initialNumToRender: 4,
  updateCellsBatchingPeriod: 50,
  onEndReachedThreshold: 0.5,
  scrollEventThrottle: 32,
  PRELOAD_BATCH_SIZE: 8,
} as const;

// Component Empty mémorisé
const ListEmptyComponent = memo(() => {
  const { t } = useLanguage();
  return (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>
        {t('homeComponents.noItemsToDisplay')}
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        {t('homeComponents.checkFiltersOrRetry')}
      </ThemedText>
    </ThemedView>
  );
});

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
  onVirtualTourPress?: (tour: any) => void;
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
  onVirtualTourPress,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
}) => {
  const flashListRef = useRef<FlashList<ExtendedItemTypes>>(null);

  // Validation stricte des données
  const safeData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data.filter((item, index) => {
      const isValid =
        item &&
        typeof item.id !== "undefined" &&
        item.id !== null &&
        item.id !== "";

      if (!isValid && __DEV__) {
        console.warn(`⚠️ Invalid item at index ${index}:`, item);
      }
      return isValid;
    });
  }, [data]);

  // RenderItem optimisé avec support des services
  const renderItem: ListRenderItem<ExtendedItemTypes> = useCallback(
    ({ item, index }) => {
      // Utiliser le composant approprié selon le type
      if (item.itemType === 'service' || item.listType === 'service') {
        return (
          <RenderServiceListItem
            item={item}
            index={index}
            setAnimatingElement={setAnimatingElement}
            navigateToInfo={navigateToInfo}
            favorites={favorites}
          />
        );
      }

      return (
        <RenderItem
          item={item}
          setAnimatingElement={setAnimatingElement}
          navigateToInfo={navigateToInfo}
          onVirtualTourPress={onVirtualTourPress}
        />
      );
    },
    [lottieRef, favorites, setFavorites, animatingElement, setAnimatingElement, navigateToInfo, onVirtualTourPress]
  );

  const keyExtractor = useCallback(
    (item: ExtendedItemTypes, index: number) =>
      item.id?.toString() || `fallback-${index}`,
    []
  );

  const getItemType = useCallback(() => "standard-item", []);

  // Préchargement des images avec expo-image / RN Image.prefetch
  useEffect(() => {
    if (safeData.length === 0) return;

    const task = InteractionManager.runAfterInteractions(() => {
      const imagesToPreload = safeData
        .slice(0, PERFORMANCE_CONFIG.PRELOAD_BATCH_SIZE)
        .map((item) => {
          return (
            (item as any).imageAvif ||
            (item as any).imageWebP ||
            item.avatar ||
            null
          );
        })
        .filter(Boolean);

      imagesToPreload.forEach((uri) => {
        RNImage.prefetch(uri as string).catch(() => {
          if (__DEV__) {
            console.warn(`⚠️ Failed to prefetch image: ${uri}`);
          }
        });
      });

    
    });

    return () => task.cancel();
  }, [safeData]);

  // Style container
  const containerStyle = useMemo(
    () => ({
      paddingVertical: 1,
      paddingBottom: 120,
      ...(safeData.length === 0 ? { flexGrow: 1 } : {}),
      ...contentContainerStyle,
    }),
    [safeData.length, contentContainerStyle]
  );

  const debouncedOnEndReached = useCallback(() => {
    if (onEndReached) {
      InteractionManager.runAfterInteractions(onEndReached);
    }
  }, [onEndReached]);

  return (
    <ThemedView style={styles.container}>
      <FlashList
        ref={flashListRef}
        data={safeData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        estimatedItemSize={PERFORMANCE_CONFIG.estimatedItemSize}
        removeClippedSubviews={PERFORMANCE_CONFIG.removeClippedSubviews}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={debouncedOnEndReached}
        onEndReachedThreshold={PERFORMANCE_CONFIG.onEndReachedThreshold}
        onScroll={onScroll}
        scrollEventThrottle={PERFORMANCE_CONFIG.scrollEventThrottle}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
        disableAutoLayout={false}
        nestedScrollEnabled={true}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    

  },
  emptyContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    opacity: 0.4,
    textAlign: 'center',
  },
});

export default memo(OptimizedFlashList);