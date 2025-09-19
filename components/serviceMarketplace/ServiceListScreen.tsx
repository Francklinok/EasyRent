import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ServiceCard from './ServiceCard';
import ServiceFilters from './ServiceFilters';
import {
  Service,
  ServiceFilters as ServiceFiltersType,
  getServiceMarketplaceService,
  PaginationInput,
} from '../../services/api/serviceMarketplaceService';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';


interface ServiceListScreenProps {
  onServicePress: (service: Service) => void;
  initialFilters?: Partial<ServiceFiltersType>;
  headerTitle?: string;
  showFilters?: boolean;
}

const ServiceListScreen: React.FC<ServiceListScreenProps> = ({
  onServicePress,
  initialFilters = {},
  headerTitle = 'Services disponibles',
  showFilters = true,
}) => {
  const insets = useSafeAreaInsets();
  const serviceMarketplace = getServiceMarketplaceService();

  // États
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<ServiceFiltersType>(initialFilters);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();

  // Charger les services
  const loadServices = useCallback(async (
    newFilters?: ServiceFiltersType,
    loadMore = false
  ) => {
    try {
      if (!loadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const pagination: PaginationInput = {
        first: 20,
        after: loadMore ? cursor : undefined,
      };

      const result = await serviceMarketplace.getServices(
        newFilters || filters,
        pagination
      );

      if (loadMore) {
        setServices(prev => [...prev, ...result.edges.map(edge => edge.node)]);
      } else {
        setServices(result.edges.map(edge => edge.node));
      }

      setHasMore(result.pageInfo.hasNextPage);
      setCursor(result.pageInfo.endCursor);
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les services. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filters, cursor, serviceMarketplace]);

  // Actualiser la liste
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCursor(undefined);
    loadServices(filters, false);
  }, [filters, loadServices]);

  // Charger plus de services
  const loadMoreServices = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadServices(filters, true);
    }
  }, [loadingMore, hasMore, filters, loadServices]);

  // Appliquer les filtres
  const applyFilters = useCallback((newFilters: ServiceFiltersType) => {
    setFilters(newFilters);
    setCursor(undefined);
    setShowFiltersModal(false);
    loadServices(newFilters, false);
  }, [loadServices]);

  // Gérer les favoris
  const toggleFavorite = useCallback((service: Service) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(service.id)) {
        newFavorites.delete(service.id);
      } else {
        newFavorites.add(service.id);
      }
      return newFavorites;
    });
  }, []);

  // Effets
  useEffect(() => {
    loadServices();
  }, []);

  // Rendu d'un service
  const renderService = useCallback(({ item }: { item: Service }) => (
    <ServiceCard
      service={item}
      onPress={onServicePress}
      onFavorite={toggleFavorite}
      isFavorite={favorites.has(item.id)}
    />
  ), [onServicePress, toggleFavorite, favorites]);

  // Rendu du footer de la liste
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <ThemedView style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
      </ThemedView>
    );
  }, [loadingMore]);

  // Rendu de l'état vide
  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <ThemedView style={styles.emptyContainer}>
        <Ionicons name="search" size={64} color="#DDD" />
        <ThemedText style={styles.emptyTitle}>Aucun service trouvé</ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Essayez de modifier vos critères de recherche
        </ThemedText>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => applyFilters({})}
        >
          <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }, [loading, applyFilters]);

  // Compter les filtres actifs
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        {showFilters && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFiltersModal(true)}
          >
            <Ionicons name="filter" size={24} color="#007AFF" />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Statistiques */}
      {!loading && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {services.length} service{services.length > 1 ? 's' : ''} trouvé{services.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Liste des services */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des services...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          onEndReached={loadMoreServices}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de filtres */}
      {showFiltersModal && (
        <ServiceFilters
          visible={showFiltersModal}
          filters={filters}
          onApply={applyFilters}
          onClose={() => setShowFiltersModal(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  } as ViewStyle,

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
  } as TextStyle,

  filterButton: {
    position: 'relative',
    padding: 8,
  } as ViewStyle,

  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E17055',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  } as TextStyle,

  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  } as ViewStyle,

  statsText: {
    fontSize: 14,
    color: '#636E72',
  } as TextStyle,

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#636E72',
  } as TextStyle,

  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,
  } as ViewStyle,

  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  } as ViewStyle,

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  } as ViewStyle,

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,

  emptySubtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  } as TextStyle,

  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  } as ViewStyle,

  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  } as TextStyle,
});

export default ServiceListScreen;