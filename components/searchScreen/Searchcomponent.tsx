import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Container, SearchBar, FilterButton } from '@/components/ui';
import HousingMap from '@/components/utils/map';
import { Housing } from '@/types/HousingType';
import { SearchFilters } from '@/types/FilterType';
import renderHousingCard from '@/components/search/renderHousingcard';
import FilterModal from '@/components/search/renderFilter';
import { ThemedView } from '../ui/ThemedView';
import { ThemedScrollView } from '../ui/ScrolleView';
import { useTheme } from '../contexts/theme/themehook';
const screenHeight = Dimensions.get('window').height;

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
    country: null,
  });
const  {theme} = useTheme()
  useEffect(() => {
    const initializeLocationAndData = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);

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
              longitude: 2.3522,
            },
            proximityScore: {
              transport: 4.5,
              schools: 4.2,
              healthcare: 4.7,
              shopping: 4.8,
            },
              images: [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
              ],
          },
        ];

        setHousings(mockHousings);
        setFilteredHousings(mockHousings);
      }
    };

    initializeLocationAndData();
  }, []);

  const applyFilters = useCallback(() => {
    const results = housings.filter((housing) => {
      const matchesPrice = housing.price >= filters.minPrice && housing.price <= filters.maxPrice;
      const matchesSurface = housing.surface >= filters.minSurface;
      const matchesRooms = housing.rooms >= filters.rooms;
      const matchesType = !filters.type || housing.type === filters.type;
      const matchesCountry = !filters.country || housing.country === filters.country;
      const matchesQuery = housing.title.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchesPrice &&
        matchesSurface &&
        matchesRooms &&
        matchesType &&
        matchesCountry &&
        matchesQuery
      );
    });

    setFilteredHousings(results);
    setIsFilterModalVisible(false);
  }, [housings, filters, searchQuery]);

  return (
    <Container   className="flex-1 h-screen">
      {/* Zone carte + recherche centrée */}
      <ThemedView style={{ height: screenHeight * 0.6, position: 'relative' , backgroundColor: "transparent" }}>
        <HousingMap housings={filteredHousings} currentLocation={currentLocation} />

        <SearchBar   backgroundColor={theme.input.background}
          style={{
          position: 'absolute',
          top: '40%', 
          left: 10,
          right: 10,
          zIndex: 100,
          shadowColor: 'transparent'
        }}>
          <ThemedView
            className="flex-1 flex-row items-center rounded-xl px-2 py-1"
            style={{ backgroundColor:'transparent' }}
          >
            <Ionicons name="search" size={20} color={theme.success} className="mr-2" />
            <TextInput
              placeholder="Search housing"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1"
              style = {{ backgroundColor: 'transparent'}}
            />
          </ThemedView>

          <FilterButton onPress={() => setIsFilterModalVisible(true)}>
            <Ionicons name="filter" size={24} color={theme.success} />
          </FilterButton>
        </SearchBar>
      </ThemedView>

      {/* Résultats listés */}
      <ThemedScrollView className=" p-2">
        {filteredHousings.map((housing) => renderHousingCard(housing))}
      </ThemedScrollView>

      {/* Modal filtre */}
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
