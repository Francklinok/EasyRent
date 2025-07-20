import React, { useCallback, useMemo, useRef } from "react";
import { FlashList, FlashListProps } from "@shopify/flash-list";
import { Dimensions } from "react-native";
import RenderItem from "./renderItem";
import { ItemType } from "@/types/ItemType";
import { MutableRefObject } from "react";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import LottieView from "lottie-react-native";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const ITEM_HEIGHT = 300; // Hauteur estimée de chaque item

type OptimizedFlashListProps = {
  data: ItemType[];
  lottieRef: MutableRefObject<LottieView | null>;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  animatingElement: string | null;
  setAnimatingElement: (id: string | null) => void;
  navigateToInfo: (item: ItemType) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onScroll?: any;
  ListHeaderComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
  contentContainerStyle?: any;
};

const OptimizedFlashList: React.FC<OptimizedFlashListProps> = ({
  data,
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
  const flashListRef = useRef<FlashList<ItemType>>(null);

  // Configuration FlashList simplifiée
  const flashListConfig = useMemo(
    () => ({
      estimatedItemSize: 250,
      removeClippedSubviews: false,
      maxToRenderPerBatch: 10,
      windowSize: 10,
      initialNumToRender:5,
      updateCellsBatchingPeriod: 50,
      debug: __DEV__,
      // Retirer overrideItemLayout et getItemType pour éviter les conflits
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ItemType; index: number }) => (
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
    [
      lottieRef,
      favorites,
      setFavorites,
      animatingElement,
      setAnimatingElement,
      navigateToInfo,
    ]
  );

  const keyExtractor = useCallback(
    (item: ItemType, index: number) => `${item.id}-${index}`,
    []
  );

  const ListEmptyComponent = useCallback(
    () => (
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 50,
        }}
      >
        <ThemedText
          style={{
            fontSize: 14,
            opacity: 0.6,
            textAlign: "center",
          }}
        >
          Aucun élément à afficher
        </ThemedText>
      </ThemedView>
    ),
    []
  );

  // Debug: Afficher le nombre d'éléments
  console.log("FlashList data length:", data?.length);

  return (
    <ThemedView style={{ width: screenWidth, flex:1}}>
      <FlashList
        ref={flashListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        {...flashListConfig}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          paddingVertical: 8,
          paddingBottom: 100,
          flexGrow: 1,


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