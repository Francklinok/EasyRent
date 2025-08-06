import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Container, SearchBar, FilterButton } from '@/components/ui';
import HousingMap from '@/components/utils/map';
import { Housing } from '@/types/HousingType';
import { SearchFilters } from '@/types/FilterType';
import renderHousingCard from '@/components/search/renderHousingcard';
import FilterModal from '@/components/search/renderFilter';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { ThemedScrollView } from '../ui/ScrolleView';
import { useTheme } from '../contexts/theme/themehook';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AdvancedHousingSearch = () => {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [housings, setHousings] = useState<Housing[]>([]);
  const [filteredHousings, setFilteredHousings] = useState<Housing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: 0,
    maxPrice: 10000,
    minSurface: 20,
    rooms: 1,
    type: null,
    country: null,
  });

  const { theme } = useTheme();

  useEffect(() => {
    const initializeLocationAndData = async () => {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);

        const mockHousings: Housing[] = [
          {
            id: '1',
            title: 'Modern Apartment in Paris',
            description: 'Spacious apartment in the heart of Paris with stunning city views',
            price: 2500,
            surface: 85,
            rooms: 3,
            bathrooms: 2,
            country: 'France',
            city: 'Paris',
            type: 'apartment',
            amenities: ['Balcony', 'Gym', 'Parking', 'WiFi'],
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
              'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
            ],
          },
          {
            id: '2',
            title: 'Luxury Villa in Nice',
            description: 'Beautiful villa with sea view and private pool',
            price: 4500,
            surface: 150,
            rooms: 5,
            bathrooms: 3,
            country: 'France',
            city: 'Nice',
            type: 'house',
            amenities: ['Pool', 'Garden', 'Sea View', 'Parking'],
            location: {
              latitude: 43.7102,
              longitude: 7.2620,
            },
            proximityScore: {
              transport: 4.0,
              schools: 4.5,
              healthcare: 4.3,
              shopping: 4.6,
            },
            images: [
              'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80',
            ],
          },
          {
            id: '3',
            title: 'Cozy Studio in Lyon',
            description: 'Perfect for students or young professionals',
            price: 800,
            surface: 35,
            rooms: 1,
            bathrooms: 1,
            country: 'France',
            city: 'Lyon',
            type: 'studio',
            amenities: ['WiFi', 'Furnished'],
            location: {
              latitude: 45.7640,
              longitude: 4.8357,
            },
            proximityScore: {
              transport: 4.8,
              schools: 4.0,
              healthcare: 4.2,
              shopping: 4.4,
            },
            images: [
              'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80',
            ],
          },
        ];

        setHousings(mockHousings);
        setFilteredHousings(mockHousings);
      }
      setIsLoading(false);
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
      const matchesQuery = housing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          housing.city.toLowerCase().includes(searchQuery.toLowerCase());

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

  useEffect(() => {
    applyFilters();
  }, [searchQuery, applyFilters]);

  const renderHeader = () => (
    <ThemedView style={{
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: 'transparent'
    }}>
      <ThemedText style={{
        fontSize: 28,
        fontWeight: '700',
        color: theme.onSurface,
        marginBottom: 8
      }}>
        Find Your Home
      </ThemedText>
      <ThemedText style={{
        fontSize: 16,
        color: theme.onSurface + '80',
        marginBottom: 20
      }}>
        Discover {filteredHousings.length} properties available
      </ThemedText>

      {/* Enhanced Search Bar */}
      <ThemedView style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 4,
        shadowColor: theme.onSurface,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: theme.outline + '20'
      }}>
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12
        }}>
          <Ionicons name="search" size={20} color={theme.primary} />
          <TextInput
            placeholder="Search by location, type..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: theme.onSurface
            }}
            placeholderTextColor={theme.onSurface + '60'}
          />
          <TouchableOpacity
            onPress={() => setIsFilterModalVisible(true)}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              padding: 8,
              marginLeft: 8
            }}
          >
            <Ionicons name="options" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* View Toggle */}
      <ThemedView style={{
        flexDirection: 'row',
        marginTop: 16,
        backgroundColor: theme.surfaceVariant,
        borderRadius: 12,
        padding: 4
      }}>
        <TouchableOpacity
          onPress={() => setViewMode('map')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: viewMode === 'map' ? theme.primary : 'transparent'
          }}
        >
          <Ionicons 
            name="map" 
            size={18} 
            color={viewMode === 'map' ? 'white' : theme.onSurface + '80'} 
          />
          <ThemedText style={{
            marginLeft: 6,
            fontWeight: '600',
            color: viewMode === 'map' ? 'white' : theme.onSurface + '80'
          }}>
            Map
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setViewMode('list')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: viewMode === 'list' ? theme.primary : 'transparent'
          }}
        >
          <Ionicons 
            name="list" 
            size={18} 
            color={viewMode === 'list' ? 'white' : theme.onSurface + '80'} 
          />
          <ThemedText style={{
            marginLeft: 6,
            fontWeight: '600',
            color: viewMode === 'list' ? 'white' : theme.onSurface + '80'
          }}>
            List
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const renderMapView = () => (
    <ThemedView style={{ flex: 1, position: 'relative' }}>
      <HousingMap housings={filteredHousings} currentLocation={currentLocation} />
      
      {/* Floating Results Counter */}
      <ThemedView style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 12,
        shadowColor: theme.onSurface,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
      }}>
        <ThemedText style={{
          textAlign: 'center',
          fontWeight: '600',
          color: theme.onSurface
        }}>
          {filteredHousings.length} properties found
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const renderListView = () => (
    <FlatList
      data={filteredHousings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => renderHousingCard(item)}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <ThemedView style={{ height: 12 }} />}
    />
  );

  if (isLoading) {
    return (
      <Container className="flex-1 justify-center items-center">
        <ThemedView style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}>
          <MaterialCommunityIcons 
            name="home-search" 
            size={64} 
            color={theme.primary} 
          />
          <ThemedText style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: '600',
            color: theme.onSurface
          }}>
            Finding properties...
          </ThemedText>
        </ThemedView>
      </Container>
    );
  }

  return (
    <Container className="flex-1">
      <LinearGradient
        colors={[theme.primary + '10', theme.surface]}
        style={{ flex: 1 }}
      >
        {renderHeader()}
        
        {viewMode === 'map' ? renderMapView() : renderListView()}

        {/* Filter Modal */}
        <FilterModal
          isVisible={isFilterModalVisible}
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          onClose={() => setIsFilterModalVisible(false)}
        />
      </LinearGradient>
    </Container>
  );
};

export default AdvancedHousingSearch;