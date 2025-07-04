import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Modal,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { ThemedView } from '../ui/ThemedView';
import { SearchFilters } from '@/types/FilterType';

interface FilterModalProps {
  isVisible: boolean;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  applyFilters: () => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  filters,
  setFilters,
  applyFilters,
  onClose,
}) => {
  const scrollOffsetY = useRef(0);
  const [draggingDown, setDraggingDown] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    scrollOffsetY.current = offset;
    if (offset < -40) {
      setDraggingDown(true);
    }
  };

  const handleScrollEndDrag = () => {
    if (draggingDown) {
      onClose();
      setDraggingDown(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/30">
          {/* Zone cliquable en haut pour fermer */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
          >
            <ThemedView className="max-h-[85%] bg-background rounded-t-3xl p-4">
              <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                onScrollEndDrag={handleScrollEndDrag}
                scrollEventThrottle={16}
              >
                <ThemedText type="title" intensity="normal" className="mb-4">
                  Advanced Filters
                </ThemedText>

                {/* Price Range */}
                <ThemedView className="mb-4">
                  <ThemedText>
                    Price Range: {filters.minPrice}€ - {filters.maxPrice}€
                  </ThemedText>
                  <ThemedView className="flex-row">
                    <TextInput
                      placeholder="Min Price"
                      keyboardType="numeric"
                      value={filters.minPrice.toString()}
                      onChangeText={(val) =>
                        setFilters((prev) => ({
                          ...prev,
                          minPrice: Number(val) || 0,
                        }))
                      }
                      className="flex-1 border p-2 rounded mr-2"
                    />
                    <TextInput
                      placeholder="Max Price"
                      keyboardType="numeric"
                      value={filters.maxPrice.toString()}
                      onChangeText={(val) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxPrice: Number(val) || 10000,
                        }))
                      }
                      className="flex-1 border p-2 rounded"
                    />
                  </ThemedView>
                </ThemedView>

                {/* Surface */}
                <ThemedView className="mb-4">
                  <ThemedText>
                    Minimum Surface: {filters.minSurface} m²
                  </ThemedText>
                  <TextInput
                    placeholder="Minimum Surface"
                    keyboardType="numeric"
                    value={filters.minSurface.toString()}
                    onChangeText={(val) =>
                      setFilters((prev) => ({
                        ...prev,
                        minSurface: Number(val) || 20,
                      }))
                    }
                    className="border p-2 rounded"
                  />
                </ThemedView>

                {/* Rooms */}
                <ThemedView className="mb-4">
                  <ThemedText>Minimum Rooms: {filters.rooms}</ThemedText>
                  <TextInput
                    placeholder="Minimum Rooms"
                    keyboardType="numeric"
                    value={filters.rooms.toString()}
                    onChangeText={(val) =>
                      setFilters((prev) => ({
                        ...prev,
                        rooms: Number(val) || 1,
                      }))
                    }
                    className="border p-2 rounded"
                  />
                </ThemedView>

                {/* Property Type */}
                <ThemedView className="mb-4">
                  <ThemedText>Property Type</ThemedText>
                </ThemedView>

                {/* Country */}
                <ThemedView className="mb-4">
                  <ThemedText>Country</ThemedText>
                </ThemedView>

                <TouchableOpacity
                  onPress={applyFilters}
                  className="bg-blue-500 p-3 rounded-xl mt-4"
                >
                  <ThemedText className="text-white text-center">
                    Apply Filters
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>
            </ThemedView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FilterModal;
