import React from 'react';
import {
  TouchableOpacity,
  Modal,
  TextInput
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
  onClose
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <ThemedView className="flex-1 justify-end bg-black/50">
        <ThemedView className="bg-white rounded-t-3xl p-6">
          <ThemedText className="text-2xl font-bold mb-4">Advanced Filters</ThemedText>
          
          {/* Price Range */}
          <ThemedView className="mb-4">
            <ThemedText>Price Range: {filters.minPrice}€ - {filters.maxPrice}€</ThemedText>
            <ThemedView className="flex-row">
              <TextInput
                placeholder="Min Price"
                keyboardType="numeric"
                value={filters.minPrice.toString()}
                onChangeText={(val) => setFilters(prev => ({ ...prev, minPrice: Number(val) || 0 }))}
                className="flex-1 border p-2 rounded mr-2"
              />
              <TextInput
                placeholder="Max Price"
                keyboardType="numeric"
                value={filters.maxPrice.toString()}
                onChangeText={(val) => setFilters(prev => ({ ...prev, maxPrice: Number(val) || 10000 }))}
                className="flex-1 border p-2 rounded"
              />
            </ThemedView>
          </ThemedView>

          {/* Surface Range */}
          <ThemedView className="mb-4">
            <ThemedText>Minimum Surface: {filters.minSurface} m²</ThemedText>
            <TextInput
              placeholder="Minimum Surface"
              keyboardType="numeric"
              value={filters.minSurface.toString()}
              onChangeText={(val) => setFilters(prev => ({ ...prev, minSurface: Number(val) || 20 }))}
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
              onChangeText={(val) => setFilters(prev => ({ ...prev, rooms: Number(val) || 1 }))}
              className="border p-2 rounded"
            />
          </ThemedView>

          {/* Type Selection (Optional) */}
          <ThemedView className="mb-4">
            <ThemedText>Property Type</ThemedText>
            {/* Add dropdown or selection logic for property type */}
          </ThemedView>

          {/* Country Selection (Optional) */}
          <ThemedView className="mb-4">
            <ThemedText>Country</ThemedText>
            {/* Add dropdown or selection logic for country */}
          </ThemedView>
          
          <TouchableOpacity
            onPress={applyFilters}
            className="bg-blue-500 p-3 rounded-xl mt-4"
          >
            <ThemedText className="text-white text-center">Apply Filters</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

export default FilterModal;