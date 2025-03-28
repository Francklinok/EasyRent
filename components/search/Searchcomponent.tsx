

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { Container, SearchBar, FilterButton, HousingCard } from '../ui';
import HousingMap from '../utils/map';
import { Housing } from '@/types/HousingType';
import { SearchFilters } from '@/types/FilterType';
import renderHousingCard from './renderHousingcard';
import FilterModal from './renderFilter';

// Advanced Housing Search Component
const AdvancedHousingSearch = () => {

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [housings, setHousings] = useState<Housing[]>([]);
  const [filteredHousings, setFilteredHousings] = useState<Housing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: 0,
    maxPrice: 10000,
    minSurface: 20,
    rooms: 1,
    type: null,
    country: null
  });

  // Location and Initial Data Fetch
  useEffect(() => {
    const initializeLocationAndData = async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
        
        // Mock data fetch - replace with actual API call
        const mockHousings: Housing[] = [
          {
            id: '1',
            title: 'Modern Apartment in Paris',
            description: 'Spacious apartment in the heart of Paris',
            price: 2500,
            surface: 85,
            rooms: 3,
            bathrooms: 2,
            country: 'France',
            city: 'Paris',
            type: 'apartment',
            amenities: ['Balcony', 'Gym', 'Parking'],
            location: { 
              latitude: 48.8566, 
              longitude: 2.3522 
            },
            proximityScore: {
              transport: 4.5,
              schools: 4.2,
              healthcare: 4.7,
              shopping: 4.8
            },
            images: ['https://example.com/apartment1.jpg']
          },
          // Add more mock housing data
        ];

        setHousings(mockHousings);
        setFilteredHousings(mockHousings);
      }
    };

    initializeLocationAndData();
  }, []);

  // Advanced Search and Filter Logic
  const applyFilters = useCallback(() => {
    const results = housings.filter(housing => {
      const matchesPrice = 
        housing.price >= filters.minPrice && 
        housing.price <= filters.maxPrice;
      
      const matchesSurface = housing.surface >= filters.minSurface;
      const matchesRooms = housing.rooms >= filters.rooms;
      const matchesType = !filters.type || housing.type === filters.type;
      const matchesCountry = !filters.country || housing.country === filters.country;
      const matchesQuery = housing.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesPrice && 
             matchesSurface && 
             matchesRooms && 
             matchesType && 
             matchesCountry && 
             matchesQuery;
    });

    setFilteredHousings(results);
    setIsFilterModalVisible(false);
  }, [housings, filters, searchQuery]);

  return (
    <Container>
      {/* Search Bar */}
      <SearchBar>
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Ionicons name="search" size={20} color="#4B5563" className="mr-2" />
          <TextInput
            placeholder="Search housing"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1"
          />
        </View>
        <FilterButton onPress={() => setIsFilterModalVisible(true)}>
          <Ionicons name="filter" size={24} color="white" />
        </FilterButton>
      </SearchBar>

      {/* Housing Map */}
      <HousingMap 
        housings={filteredHousings} 
        currentLocation={currentLocation} 
      />

      {/* Housing List */}
      <ScrollView className="p-8">
        {filteredHousings.map(housing => renderHousingCard(housing))}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal 
        isVisible={isFilterModalVisible}
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
        onClose={() => setIsFilterModalVisible(false)}
      />
    </Container>
  );
};

export default AdvancedHousingSearch;
