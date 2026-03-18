import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TextInput, TouchableOpacity, SectionList, RefreshControl, ActivityIndicator, View, Text, Image, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Container } from '@/components/ui';
import HousingMap from '@/components/utils/map';
import FilterModal from '@/components/search/renderFilter';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../../hooks/themehook';
import ServiceCard from '../serviceMarketplace/ServiceCard';
import { SearchFilters, UnifiedSearchFilters } from '@/types/FilterType';
import { useSearch } from '@/hooks/useHybridSearch';
import { favoritesService } from '@/services/api/favoritesService';
import { useLanguage } from '@/components/contexts/language';
import { SearchPropertyCard } from './SearchPropertyCard';
import { StatusBar } from 'expo-status-bar';



const AdvancedHousingSearch = () => {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [serviceFavorites, setServiceFavorites] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchType, setSearchType] = useState<'properties' | 'services' | 'both'>('both');
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: 0,
    maxPrice: 999999,
    minSurface: 0,
    rooms: 0,
    type: null,
    country: null,
  });

  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  const unifiedFilters = useMemo((): UnifiedSearchFilters => ({
    searchType,
    property: {
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minSurface: filters.minSurface,
      rooms: filters.rooms,
      type: filters.type,
      country: filters.country,
      actionType: 'rent',
    },
    service: {
      category: null,
      minPrice: 0,
      maxPrice: 5000,
      contractType: null,
      isEmergency: false,
      rating: 0,
      location: null,
    },
  }), [filters, searchType]);

 
  const {
    properties,
    services,
    loading,
    error,
    totalCount,
    search,
    applyFilters,
    refresh
  } = useSearch(unifiedFilters);

  console.log('Properties  search:', properties.length);
  // Initialize location 
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          console.log('📍 [SearchComponent] Location granted:',location,  location.coords);
          setCurrentLocation(location);
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    initializeLocation();
  }, []);

  // Favorites manager
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const items = await favoritesService.getFavoriteItems();
        setFavorites(items.map(item => item.propertyId));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // filters
  const handleApplyFilters = useCallback(async () => {
    setIsFilterModalVisible(false);
    if (searchQuery.trim()) {
      setHasSearched(true);
      await search(searchQuery.trim());
    } else if (hasSearched) {
      await applyFilters();
    }
  }, [applyFilters, search, searchQuery, hasSearched]);

  const handleFavoriteToggle = useCallback(async (property: any) => {
    const isFav = favorites.includes(property.id);
    setFavorites(prev => isFav
      ? prev.filter(id => id !== property.id)
      : [...prev, property.id]
    );
    try {
      if (isFav) {
        await favoritesService.removeFromFavorites('', property.id);
      } else {
        await favoritesService.addToFavorites('', property.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setFavorites(prev => isFav
        ? [...prev, property.id]
        : prev.filter(id => id !== property.id)
      );
    }
  }, [favorites]);

  const handleServiceFavoriteToggle = useCallback((service: any) => {
    setServiceFavorites(prev => prev.includes(service.id)
      ? prev.filter(id => id !== service.id) 
      : [...prev, service.id]
    );
  }, []);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search manager — debounce 400ms
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setHasSearched(false);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🔍 [SearchComponent] Searching:', trimmedQuery);
      setHasSearched(true);
      search(trimmedQuery);
    }, 400);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, search]);

  // When search type changes, re-run if a query is active
  useEffect(() => {
    if (searchQuery.trim() && hasSearched) {
      search(searchQuery.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType]);

  const renderHeader = () => (
    <ThemedView style={{
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: 'transparent'
    }}>
      <ThemedText type="title" intensity="strong" style={{
        color: theme.onSurface,
        marginBottom: 8
      }}>
        {t('search.unifiedSearch')}
      </ThemedText>
      <ThemedText type="body" style={{
        color: theme.onSurface + '80',
        marginBottom: 20
      }}>
        {loading
          ? t('search.searchInProgress')
          : hasSearched
            ? t('search.resultsFound', { properties: properties.length, services: services.length })
            : t('search.searchPropertiesAndServices')}
      </ThemedText>

      {/* Search Bar */}
      <ThemedView style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.outline + '80',

      }}>
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 6,
          backgroundColor: theme.surfaceVariant,
          borderRadius:12

        }}>
          <Ionicons name="search" size={20} color={theme.primary} />
          <TextInput
            placeholder={t('search.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: theme.text,
            }}
            placeholderTextColor={theme.text}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setHasSearched(false);
              }}
              style={{
                backgroundColor: theme.surfaceVariant,
                borderRadius: 12,
                padding: 6,
                marginRight: 8
              }}
            >
              <Ionicons name="close" size={16} color={theme.onSurface} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setIsFilterModalVisible(true)}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              padding: 8
            }}
          >
            <Ionicons name="options" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Search Type Selector */}
      <ThemedView style={{
        flexDirection: 'row',
        marginTop: 16,
        backgroundColor: theme.surfaceVariant,
        borderRadius: 12,
        padding: 4
      }}>
        {[
          { id: 'both', label: t('search.both'), icon: 'apps' },
          { id: 'properties', label: t('search.properties'), icon: 'home' },
          { id: 'services', label: t('search.services'), icon: 'construct' }
        ].map((type) => (
          <TouchableOpacity
            key={type.id}
            onPress={() => setSearchType(type.id as any)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: searchType === type.id ? theme.primary : 'transparent'
            }}
          >
            <Ionicons 
              name={type.icon as any} 
              size={16} 
              color={searchType === type.id ? 'white' : theme.onSurface + '80'} 
            />
            <ThemedText style={{
              marginLeft: 4,
              fontSize: 12,
              fontWeight: '600',
              color: searchType === type.id ? 'white' : theme.onSurface + '80'
            }}>
              {type.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
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
            {t('search.map')}
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
            {t('search.list')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const renderMapView = () => (
    <ThemedView style={{ flex: 1, position: 'relative' }}>
      {
        properties.length > 0 && (
        <HousingMap
          properties={hasSearched ? properties : []}
          currentLocation={currentLocation}
        />
        )
      }
      
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
          {hasSearched
            ? t('search.resultsCount', { properties: properties.length, services: services.length })
            : t('search.searchToSeeResults')}
        </ThemedText>
        {loading && (
          <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 8 }} />
        )}
      </ThemedView>
    </ThemedView>
  );

  const renderUnifiedList = () => {
    const sections:any = [];
    console.log('section  part', sections);

    if ((searchType === 'properties' || searchType === 'both') && properties.length > 0) {
      sections.push({
        title: t('search.propertiesCount', { count: properties.length }),
        data: properties,
        type: 'properties'
      });
    }

    if ((searchType === 'services' || searchType === 'both') && services.length > 0) {
      sections.push({
        title: t('search.servicesCount', { count: services.length }),
        data: services,
        type: 'services'
      });
    }

    if (sections.length === 0 && !loading) {
      return (
        <ThemedView style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 60
        }}>
          <MaterialCommunityIcons
            name={hasSearched ? "magnify-close" : "magnify"}
            size={64}
            color={theme.onSurface + '40'}
          />
          <ThemedText style={{
            fontSize: 18,
            fontWeight: '600',
            marginTop: 16,
            marginBottom: 8,
            textAlign: 'center'
          }}>
            {hasSearched ? t('emptyStates.noResults') : t('search.startSearch')}
          </ThemedText>
          <ThemedText style={{
            fontSize: 14,
            textAlign: 'center',
            opacity: 0.7,
            paddingHorizontal: 40
          }}>
            {hasSearched
              ? t('search.tryDifferentKeywords')
              : t('search.typeToSearch')}
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, section }) => {
          if (section.type === 'properties') {
            return (
              <SearchPropertyCard
                property={item}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={favorites.includes(item.id)}
              />
            );
          } else {
            return (
              <ServiceCard
                service={item}
                onPress={(service) => console.log('Navigate to service:', service.id)}
                onFavorite={handleServiceFavoriteToggle}
                isFavorite={serviceFavorites.includes(item.id)}
              />
            );
          }
        }}
        renderSectionHeader={({ section }) => (
          <ThemedView style={{
            backgroundColor: theme.surface,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.outline + '20'
          }}>
            <ThemedText style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.onSurface
            }}>
              {section.title}
            </ThemedText>
          </ThemedView>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.primary}
          />
        }
        ListFooterComponent={
          loading ? (
            <ThemedView style={{
              paddingVertical: 20,
              alignItems: 'center'
            }}>
              <ActivityIndicator size="small" color={theme.primary} />
              <ThemedText style={{
                marginTop: 8,
                fontSize: 14,
                color: theme.onSurface + '80'
              }}>
                {t('common.loading')}
              </ThemedText>
            </ThemedView>
          ) : null
        }
      />
    );
  };

  if (error) {
    return (
      <Container className="flex-1 justify-center items-center">
        <ThemedView style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: 20
        }}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={theme.error}
          />
          <ThemedText style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: '600',
            color: theme.error,
            textAlign: 'center'
          }}>
            {t('search.searchError')}
          </ThemedText>
          <ThemedText style={{
            marginTop: 8,
            fontSize: 14,
            color: theme.onSurface + '80',
            textAlign: 'center'
          }}>
            {error}
          </ThemedText>
          <TouchableOpacity
            onPress={refresh}
            style={{
              marginTop: 20,
              backgroundColor: theme.primary,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: '600' }}>
              {t('common.retry')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Container>
    );
  }

  return (
    <Container className="flex-1">
      <LinearGradient
        colors= {isDark? [theme.surface, theme.surface] : [ "transparent","transparent" ]}
        style={{ flex: 1 }}
      >
        {renderHeader()}
        {viewMode === 'map' ? renderMapView() : renderUnifiedList()}
        <FilterModal
          isVisible={isFilterModalVisible}
          filters={filters}
          setFilters={setFilters}
          applyFilters={handleApplyFilters}
          onClose={() => setIsFilterModalVisible(false)}
        />
      </LinearGradient>
    </Container>
  );
};

export default AdvancedHousingSearch;