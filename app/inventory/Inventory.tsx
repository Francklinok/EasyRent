import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ScrolleView';
import { 
  Home, 
  Plus, 
  Search, 
  Filter, 
  Map, 
  ChevronDown,
  Grid, 
  List as ListIcon,
  Edit,
  Share2,
  Tag,
  DollarSign,
  Calendar,
  Settings,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Sliders,
  X,
  Info
} from 'lucide-react-native';
import { useInventory } from '@/hooks/useInventory';
import { useTheme } from '@/components/contexts/theme/themehook';
import { PropertyItem } from '@/types/property';
import { getStatusColor, getStatusLabel, getPropertyTypeIcon, formatAmount } from '@/utils/inventory';
import { QuickView } from '@/components/inventory/QuickView';
import { PropertyCard } from '@/components/inventory/PropertyCard';
import { FilterPanel } from '@/components/inventory/FilterPanel';
// Exemple de données pour l'inventaire
const sampleInventory: PropertyItem[] = [
  {
    id: '1',
    name: 'Villa Moderne',
    type: 'house',
    status: 'available',
    surface: 220,
    location: {
      address: '123 Avenue du Soleil',
      city: 'Nice',
      postalCode: '06000',
      country: 'France',
      coordinates: {
        latitude: 43.7102,
        longitude: 7.2620
      }
    },
    price: {
      sale: 750000,
      rent: 3500,
      rentPeriod: 'monthly'
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      garages: 2,
      yearBuilt: 2020,
      additionalFeatures: ['Piscine', 'Jardin', 'Terrasse']
    },
    media: {
      thumbnailUrl: '/api/placeholder/400/300',
      images: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
      videos: ['/api/placeholder/video'],
      virtualTour: '/api/placeholder/tour'
    },
    documents: [
      {
        title: 'Titre de propriété',
        url: '/documents/title.pdf',
        type: 'pdf'
      }
    ],
    createdAt: '2025-01-15T12:00:00Z',
    updatedAt: '2025-04-01T10:30:00Z'
  },
  {
    id: '2',
    name: 'Appartement Centre-Ville',
    type: 'apartment',
    status: 'rented',
    surface: 85,
    location: {
      address: '45 Rue de la République',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France'
    },
    price: {
      sale: 320000,
      rent: 1200,
      rentPeriod: 'monthly'
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      floors: 1,
      yearBuilt: 2015,
      additionalFeatures: ['Balcon', 'Ascenseur', 'Parking']
    },
    media: {
      thumbnailUrl: '/api/placeholder/400/300',
      images: ['/api/placeholder/800/600', '/api/placeholder/800/600']
    },
    documents: [],
    createdAt: '2025-02-20T14:00:00Z',
    updatedAt: '2025-03-15T09:45:00Z'
  },
  {
    id: '3',
    name: 'Terrain Constructible',
    type: 'land',
    status: 'available',
    surface: 800,
    location: {
      address: 'Route des Collines',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      country: 'France'
    },
    price: {
      sale: 250000
    },
    features: {
      additionalFeatures: ['Viabilisé', 'Vue dégagée']
    },
    media: {
      thumbnailUrl: '/api/placeholder/400/300',
      images: ['/api/placeholder/800/600']
    },
    documents: [],
    createdAt: '2025-03-10T10:00:00Z',
    updatedAt: '2025-03-10T10:00:00Z'
  }
];

// Composant principal pour la gestion de l'inventaire immobilier
const RenderInventoryManagement = () => {
  const { theme } = useTheme();
  const {
    inventory,
    currentSection,
    setCurrentSection,
    viewMode,
    setViewMode,
    filtersPanelVisible,
    setFiltersPanelVisible,
    activeFilters,
    toggleFilter,
    clearAllFilters,
    selectedProperty,
    quickViewVisible,
    openQuickView,
    closeQuickView,
    filteredInventory,
    inventoryByType,
    currency
  } = useInventory(sampleInventory);

  

  

  {/* Panneau de filtres */}
      <FilterPanel 
        visible={filtersPanelVisible} 
        onClose={() => setFiltersPanelVisible(false)} 
        activeFilters={activeFilters} 
        toggleFilter={toggleFilter} 
        clearAllFilters={clearAllFilters} 
      />

  {/* Vue rapide */}
      <QuickView 
        visible={quickViewVisible} 
        onClose={closeQuickView} 
        property={selectedProperty} 
        onEdit={() => setCurrentSection(`edit-property-${selectedProperty?.id}`)} 
        onShare={() => setCurrentSection(`share-property-${selectedProperty?.id}`)} 
        onViewDetails={() => setCurrentSection(`property-detail-${selectedProperty?.id}`)} 
      />

  

  // Rendu du contenu principal pour la vue grille
  const renderGridView = () => {
    return (
      <ThemedScrollView style={styles.inventoryContent}>
        {/* Section maisons */}
        {inventoryByType.house.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <Home size={18} color={theme.primary} />
              <ThemedText variant="default" style={styles.sectionTitle}>
                Maisons ({inventoryByType.house.length})
              </ThemedText>
            </ThemedView>
            
            <ThemedScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {inventoryByType.house.map(property => <PropertyCard key={property.id} property={property} onPress={() => openQuickView(property)} onEdit={() => setCurrentSection(`edit-property-${property.id}`)} onShare={() => setCurrentSection(`share-property-${property.id}`)} />)}
            </ThemedScrollView>
          </ThemedView>
        )}
        
        {/* Section appartements */}
        {inventoryByType.apartment.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <Home size={18} color={theme.secondary} />
              <ThemedText variant="default" style={styles.sectionTitle}>
                Appartements ({inventoryByType.apartment.length})
              </ThemedText>
            </ThemedView>
            
            <ThemedScrollView 
              horizontal={true} 
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {inventoryByType.apartment.map(property => <PropertyCard key={property.id} property={property} onPress={() => openQuickView(property)} onEdit={() => setCurrentSection(`edit-property-${property.id}`)} onShare={() => setCurrentSection(`share-property-${property.id}`)} />)}
            </ThemedScrollView>
          </ThemedView>
        )}
        
        {/* Section terrains */}
        {inventoryByType.land.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <Map size={18} color={theme.accent} />
              <ThemedText variant="default" style={styles.sectionTitle}>
                Terrains ({inventoryByType.land.length})
              </ThemedText>
            </ThemedView>
            
            <ThemedScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {inventoryByType.land.map(property => <PropertyCard key={property.id} property={property} onPress={() => openQuickView(property)} onEdit={() => setCurrentSection(`edit-property-${property.id}`)} onShare={() => setCurrentSection(`share-property-${property.id}`)} />)}
            </ThemedScrollView>
          </ThemedView>
        )}
        
        {/* Section commercial */}
        {inventoryByType.commercial.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedView style={styles.sectionHeader}>
              <DollarSign size={18} color={theme.onSurface} />
              <ThemedText variant="default" style={styles.sectionTitle}>
                Commercial ({inventoryByType.commercial.length})
              </ThemedText>
            </ThemedView>
            
            <ThemedScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {inventoryByType.commercial.map(property => <PropertyCard key={property.id} property={property} onPress={() => openQuickView(property)} onEdit={() => setCurrentSection(`edit-property-${property.id}`)} onShare={() => setCurrentSection(`share-property-${property.id}`)} />)}
            </ThemedScrollView>
          </ThemedView>
        )}
        
        {/* Afficher un message si aucune propriété ne correspond aux filtres */}
        {filteredInventory.length === 0 && (
          <ThemedView style={styles.emptyState}>
            <ThemedText variant="secondary" style={styles.emptyStateText}>
              Aucune propriété ne correspond à vos critères de recherche.
            </ThemedText>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <ThemedText variant="primary" style={styles.clearFiltersText}>
                Effacer les filtres
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedScrollView>
    );
  };

  // Rendu du contenu principal pour la vue liste
  const renderListView = () => {
    return (
      <ThemedScrollView style={styles.inventoryContent}>
        <ThemedView style={styles.listContainer}>
          {filteredInventory.length > 0 ? (
            filteredInventory.map(property => (
              <TouchableOpacity
                key={property.id}
                onPress={() => openQuickView(property)}
              >
                <ThemedView
                  variant="surface"
                  style={styles.listItem}
                  bordered
                >
                  <View 
                    style={[
                      styles.listItemStatusIndicator, 
                      { backgroundColor: getStatusColor(property.status) }
                    ]} 
                  />
                  
                  <ThemedView style={styles.listItemContent}>
                    <ThemedView style={styles.listItemMain}>
                      <ThemedText variant="default" style={styles.listItemTitle}>
                        {property.name}
                      </ThemedText>
                      
                      <ThemedView style={styles.listItemMeta}>
                        {getPropertyTypeIcon(property.type)}
                        <ThemedText variant="secondary" style={styles.listItemLocation}>
                          {property.location.city}, {property.location.postalCode}
                        </ThemedText>
                        <ThemedView style={styles.listItemDot} />
                        <ThemedText variant="secondary" style={styles.listItemSurface}>
                          {property.surface} m²
                        </ThemedText>
                        
                        {property.features.bedrooms && (
                          <>
                            <ThemedView style={styles.listItemDot} />
                            <ThemedText variant="secondary" style={styles.listItemFeatures}>
                              {property.features.bedrooms} ch • {property.features.bathrooms} sdb
                            </ThemedText>
                          </>
                        )}
                      </ThemedView>
                    </ThemedView>
                    
                    <ThemedView style={styles.listItemPrice}>
                      <ThemedText variant="accent" style={styles.listItemPriceText}>
                        {property.price.sale ? formatAmount(property.price.sale, 'EURO') : ''}
                      </ThemedText>
                      
                      {property.price.rent && (
                        <ThemedText variant="secondary" style={styles.listItemRentText}>
                          {formatAmount(property.price.rent, 'EURO')}/mois
                        </ThemedText>
                      )}
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={styles.listItemActions}>
                    <TouchableOpacity 
                      style={styles.listItemActionButton}
                      onPress={() => setCurrentSection(`edit-property-${property.id}`)}
                    >
                      <Edit size={18} color={theme.primary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.listItemActionButton}
                      onPress={() => setCurrentSection(`share-property-${property.id}`)}
                    >
                      <Share2 size={18} color={theme.secondary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.listItemActionButton, styles.infoButton]}
                      onPress={() => openQuickView(property)}
                    >
                      <Info size={18} color="#fff" />
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            ))
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText variant="secondary" style={styles.emptyStateText}>
                Aucune propriété ne correspond à vos critères de recherche.
              </ThemedText>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearAllFilters}
              >
                <ThemedText variant="primary" style={styles.clearFiltersText}>
                  Effacer les filtres
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* En-tête */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.filterToggleButton}
            onPress={() => setFiltersPanelVisible(!filtersPanelVisible)}
          >
            <Sliders size={20} color={filtersPanelVisible ? theme.primary : theme.onSurface} />
          </TouchableOpacity>
          
          <ThemedText variant="primary" style={styles.headerTitle}>
            Inventaire Immobilier
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.headerRight}>
          <TouchableOpacity style={styles.viewToggleButton} onPress={() => setViewMode('grid')}>
            <Grid size={20} color={viewMode === 'grid' ? theme.primary : theme.onSurface} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.viewToggleButton} onPress={() => setViewMode('list')}>
            <ListIcon size={20} color={viewMode === 'list' ? theme.primary : theme.onSurface} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color={theme.onSurface} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setCurrentSection('add-property')}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      
      {/* Chips de filtres actifs */}
      <ThemedScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.activeFiltersScrollView}
        contentContainerStyle={styles.activeFiltersContainer}
      >
        {activeFilters.status.map(status => (
          <TouchableOpacity 
            key={`status-${status}`}
            style={[styles.activeFilterChip, { backgroundColor: getStatusColor(status) }]}
            onPress={() => toggleFilter('status', status)}
          >
            <ThemedText style={styles.activeFilterChipText}>
              {getStatusLabel(status)}
            </ThemedText>
            <X size={14} color="#fff" />
          </TouchableOpacity>
        ))}
        
        {activeFilters.type.map(type => (
          <TouchableOpacity 
            key={`type-${type}`}
            style={[
              styles.activeFilterChip,
              { 
                backgroundColor: 
                  type === 'house' ? theme.primary : 
                  type === 'apartment' ? theme.secondary :
                  type === 'land' ? theme.accent : theme.onSurface
              }
            ]}
            onPress={() => toggleFilter('type', type)}
          >
            <ThemedText style={styles.activeFilterChipText}>
              {type === 'house' ? 'Maison' : 
               type === 'apartment' ? 'Appartement' : 
               type === 'land' ? 'Terrain' : 'Commercial'}
            </ThemedText>
            <X size={14} color="#fff" />
          </TouchableOpacity>
        ))}
        
        {activeFilters.price.map(price => (
          <TouchableOpacity 
            key={`price-${price}`}
            style={[
              styles.activeFilterChip,
              { 
                backgroundColor: 
                  price === 'low' ? theme.primary : 
                  price === 'medium' ? theme.secondary : theme.accent
              }
            ]}
            onPress={() => toggleFilter('price', price)}
          >
            <ThemedText style={styles.activeFilterChipText}>
              {price === 'low' ? '< 250k€' : 
               price === 'medium' ? '250k€ - 500k€' : '> 500k€'}
            </ThemedText>
            <X size={14} color="#fff" />
          </TouchableOpacity>
        ))}
        
        {(activeFilters.status.length > 0 || 
          activeFilters.type.length > 0 || 
          activeFilters.price.length > 0) && (
          <TouchableOpacity 
            style={styles.clearAllChip}
            onPress={clearAllFilters}
          >
            <ThemedText variant="primary" style={styles.clearAllChipText}>
              Tout effacer
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedScrollView>
      
      {/* Contenu principal - Onglets et inventaire */}
      <ThemedView style={styles.mainContent}>
        {viewMode === 'grid' ? renderGridView() : renderListView()}
      </ThemedView>
      
      {/* Panneau de filtres
      {renderFiltersPanel()}
      
      //vue  rapide
      {renderQuickView()} */}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  activeFiltersScrollView: {
    maxHeight: 50,
    backgroundColor: '#f8f8f8',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChipText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 6,
  },
  clearAllChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: 'transparent',
  },
  clearAllChipText: {
    fontSize: 12,
  },
  mainContent: {
    flex: 1,
  },
  inventoryContent: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  horizontalScroll: {
    paddingLeft: 8,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  propertyCard: {
    width: 300,
    marginLeft: 8,
  },
  propertyCardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 160,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyLocation: {
    marginLeft: 8,
    fontSize: 14,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  propertySurface: {
    fontSize: 14,
  },
  propertyFeatures: {
    marginTop: 4,
  },
  featureText: {
    fontSize: 12,
  },
  cardQuickActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 8,
    justifyContent: 'flex-end',
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  infoButton: {
    backgroundColor: '#007bff',
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  listItemStatusIndicator: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  listItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  listItemMain: {
    flex: 1,
    marginRight: 16,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  listItemLocation: {
    marginLeft: 8,
    fontSize: 14,
  },
  listItemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    marginHorizontal: 8,
  },
  listItemSurface: {
    fontSize: 14,
  },
  listItemFeatures: {
    fontSize: 14,
  },
  listItemPrice: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  listItemPriceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemRentText: {
    fontSize: 14,
  },
  listItemActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  listItemActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  filtersPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    zIndex: 100,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  filtersPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersPanelContent: {
    flex: 1,
    padding: 16,
  },
  filterCategory: {
    marginBottom: 24,
  },
  filterCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 14,
    marginLeft: 6,
  },
  filtersPanelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  clearFiltersText: {
    fontWeight: '500',
  },
  applyFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#007bff',
  },
  applyFiltersText: {
    color: '#fff',
    fontWeight: '500',
  },
  quickView: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 380,
    height: '100%',
    zIndex: 100,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  quickViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  quickViewContent: {
    flex: 1,
  },
  quickViewImageContainer: {
    height: 200,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickViewImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  quickViewStatusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    zIndex: 1,
  },
  quickViewStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  quickViewSection: {
    padding: 16,
  },
  quickViewProperty: {
    marginBottom: 16,
  },
  quickViewLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  quickViewValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickViewValueText: {
    fontSize: 16,
    marginLeft: 8,
  },
  priceContainer: {
    marginTop: 4,
  },
  quickViewPrice: {
    fontSize: 16,
    marginBottom: 4,
  },
  quickViewFeatures: {
    marginTop: 4,
  },
  quickViewFeature: {
    fontSize: 16,
    marginBottom: 4,
  },
  quickViewFeaturesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  featureTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureTagText: {
    fontSize: 14,
  },
  quickViewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickViewActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  quickViewActionText: {
    marginLeft: 6,
  },
  quickViewMainButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickViewMainButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default RenderInventoryManagement;