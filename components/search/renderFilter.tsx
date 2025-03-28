import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput
} from 'react-native';
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
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-2xl font-bold mb-4">Advanced Filters</Text>
          
          {/* Price Range */}
          <View className="mb-4">
            <Text>Price Range: {filters.minPrice}€ - {filters.maxPrice}€</Text>
            <View className="flex-row">
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
            </View>
          </View>

          {/* Surface Range */}
          <View className="mb-4">
            <Text>Minimum Surface: {filters.minSurface} m²</Text>
            <TextInput
              placeholder="Minimum Surface"
              keyboardType="numeric"
              value={filters.minSurface.toString()}
              onChangeText={(val) => setFilters(prev => ({ ...prev, minSurface: Number(val) || 20 }))}
              className="border p-2 rounded"
            />
          </View>

          {/* Rooms */}
          <View className="mb-4">
            <Text>Minimum Rooms: {filters.rooms}</Text>
            <TextInput
              placeholder="Minimum Rooms"
              keyboardType="numeric"
              value={filters.rooms.toString()}
              onChangeText={(val) => setFilters(prev => ({ ...prev, rooms: Number(val) || 1 }))}
              className="border p-2 rounded"
            />
          </View>

          {/* Type Selection (Optional) */}
          <View className="mb-4">
            <Text>Property Type</Text>
            {/* Add dropdown or selection logic for property type */}
          </View>

          {/* Country Selection (Optional) */}
          <View className="mb-4">
            <Text>Country</Text>
            {/* Add dropdown or selection logic for country */}
          </View>
          
          <TouchableOpacity
            onPress={applyFilters}
            className="bg-blue-500 p-3 rounded-xl mt-4"
          >
            <Text className="text-white text-center">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;