import { mockProperties, getPropertiesByType, searchProperties } from '@/data/mockProperties';
import { Property as MockProperty } from '@/types/property';

// Convert mock property to API property format
const convertMockToApiProperty = (mockProp: MockProperty): any => {
  return {
    id: mockProp.id,
    propertyId: mockProp.id,
    ownerId: mockProp.owner.id,
    actionType: mockProp.priceType === 'rent' ? 'rent' : 'sell',
    propertyType: mockProp.propertyType,
    title: mockProp.title,
    description: mockProp.description,
    address: mockProp.location.address,
    generalHInfo: {
      rooms: mockProp.features.bedrooms + 1, // Assuming living room
      bedrooms: mockProp.features.bedrooms,
      bathrooms: mockProp.features.bathrooms,
      toilets: mockProp.features.bathrooms,
      surface: mockProp.features.area,
      area: mockProp.location.city,
      furnished: true,
      pets: false,
      smoking: false,
      maxOccupants: mockProp.features.bedrooms * 2,
    },
    generalLandinfo: {
      surface: mockProp.features.area,
    },
    images: mockProp.images,
    amenities: mockProp.amenities,
    atouts: [
      {
        id: '1',
        type: 'predefined',
        text: 'Vue panoramique',
        icon: 'eye',
        lib: 'FontAwesome5',
        category: 'comfort',
        priority: 5,
        verified: true,
      },
      {
        id: '2',
        type: 'predefined',
        text: 'Proche commerces',
        icon: 'shopping-cart',
        lib: 'FontAwesome5',
        category: 'location',
        priority: 4,
        verified: true,
      },
      {
        id: '3',
        type: 'predefined',
        text: 'Quartier calme',
        icon: 'volume-mute',
        lib: 'FontAwesome5',
        category: 'location',
        priority: 4,
        verified: true,
      },
    ],
    equipments: [
      {
        id: '1',
        name: 'Climatisation',
        icon: 'snowflake',
        lib: 'FontAwesome5',
        category: 'comfort',
      },
      {
        id: '2',
        name: 'Cuisine équipée',
        icon: 'blender',
        lib: 'MaterialCommunityIcons',
        category: 'kitchen',
      },
      {
        id: '3',
        name: 'Internet haut débit',
        icon: 'wifi',
        lib: 'FontAwesome5',
        category: 'utilities',
      },
      {
        id: '4',
        name: 'Parking privé',
        icon: 'car',
        lib: 'FontAwesome5',
        category: 'access',
      },
    ],
    availableFrom: mockProp.createdAt,
    status: 'AVAILABLE',
    isActive: true,
    ownerCriteria: {
      monthlyRent: mockProp.price,
      isGarantRequired: false,
      depositAmount: mockProp.price * 0.1,
      minimumDuration: '6 mois',
      solvability: 'instant',
      guarantorRequired: false,
      guarantorLocation: 'same',
      acceptedSituations: ['employed', 'student'],
      isdocumentRequired: true,
    },
    services: [],
    virtualTours: [],
    createdAt: mockProp.createdAt,
    updatedAt: mockProp.updatedAt,
    pricePerSquareMeter: Math.round(mockProp.price / mockProp.features.area),
    isAvailable: true,
    performanceScore: 85,
  };
};

export interface PropertyConnection {
  edges: Array<{
    node: any;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
  totalCount: number;
}

export interface PropertyFilters {
  actionType?: 'rent' | 'sell';
  propertyType?: string;
  status?: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE';
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minSurface?: number;
  maxSurface?: number;
  area?: string;
  furnished?: boolean;
  pets?: boolean;
  smoking?: boolean;
  amenities?: string[];
  availableFrom?: string;
}

export interface PaginationInput {
  first?: number;
  after?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

/**
 * Service de propriétés en mode développement avec données mockées
 */
export class PropertyServiceDev {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Récupère une propriété par son ID
   */
  async getProperty(id: string): Promise<any> {
    console.log('🔧 [DEV MODE] Fetching property:', id);
    await this.delay(300);

    let mockProp = mockProperties.find(p => p.id === id);

    // Si l'ID n'est pas trouvé, utiliser la première propriété disponible comme fallback
    if (!mockProp) {
      console.warn(`⚠️ [DEV MODE] Property with id ${id} not found in mocks, using first available property as fallback`);
      mockProp = mockProperties[0];

      if (!mockProp) {
        throw new Error('No mock properties available');
      }
    }

    return convertMockToApiProperty(mockProp);
  }

  /**
   * Récupère toutes les propriétés avec filtres et pagination
   */
  async getProperties(
    filters?: PropertyFilters,
    pagination?: PaginationInput
  ): Promise<PropertyConnection> {
    console.log('🔧 [DEV MODE] Fetching properties with filters:', filters);
    console.log('🔧 [DEV MODE] Total mock properties:', mockProperties.length);
    console.log('🔧 [DEV MODE] Mock properties IDs:', mockProperties.map(p => p.id));
    await this.delay(300);

    let filteredProperties = mockProperties;

    // Apply filters
    if (filters?.propertyType && filters.propertyType !== 'All') {
      filteredProperties = getPropertiesByType(filters.propertyType as any);
    }

    if (filters?.actionType) {
      filteredProperties = filteredProperties.filter(p =>
        p.priceType === (filters.actionType === 'rent' ? 'rent' : 'sale')
      );
    }

    if (filters?.minPrice) {
      filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice) {
      filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters?.minBedrooms) {
      filteredProperties = filteredProperties.filter(p => p.features.bedrooms >= filters.minBedrooms!);
    }

    if (filters?.maxBedrooms) {
      filteredProperties = filteredProperties.filter(p => p.features.bedrooms <= filters.maxBedrooms!);
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);
    const hasNextPage = endIndex < filteredProperties.length;
    const hasPreviousPage = page > 1;

    // Convert to API format
    const edges = paginatedProperties.map((prop, index) => ({
      node: convertMockToApiProperty(prop),
      cursor: `cursor_${startIndex + index}`
    }));

    console.log('✅ [DEV MODE] Returning properties:', {
      totalMock: mockProperties.length,
      filtered: filteredProperties.length,
      paginated: paginatedProperties.length,
      edges: edges.length,
      firstProperty: edges[0]?.node?.title || 'N/A'
    });

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor: edges[0]?.cursor || '',
        endCursor: edges[edges.length - 1]?.cursor || ''
      },
      totalCount: filteredProperties.length
    };
  }

  /**
   * Recherche des propriétés
   */
  async searchProperties(
    query: string,
    filters?: PropertyFilters,
    pagination?: PaginationInput
  ): Promise<PropertyConnection> {
    console.log('🔧 [DEV MODE] Searching properties:', query);
    await this.delay(600);

    let searchResults = searchProperties(query);

    // Apply additional filters if provided
    if (filters?.propertyType && filters.propertyType !== 'All') {
      searchResults = searchResults.filter(p => p.propertyType === filters.propertyType);
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedResults = searchResults.slice(startIndex, endIndex);
    const hasNextPage = endIndex < searchResults.length;
    const hasPreviousPage = page > 1;

    // Convert to API format
    const edges = paginatedResults.map((prop, index) => ({
      node: convertMockToApiProperty(prop),
      cursor: `search_cursor_${startIndex + index}`
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor: edges[0]?.cursor || '',
        endCursor: edges[edges.length - 1]?.cursor || ''
      },
      totalCount: searchResults.length
    };
  }

  /**
   * Crée une nouvelle propriété
   */
  async createProperty(input: any): Promise<any> {
    console.log('🔧 [DEV MODE] Creating property:', input.title);
    await this.delay(1000);

    // Simulate property creation
    const newProperty = {
      id: `mock_${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'AVAILABLE',
      isActive: true
    };

    return newProperty;
  }

  /**
   * Met à jour une propriété
   */
  async updateProperty(id: string, input: any): Promise<any> {
    console.log('🔧 [DEV MODE] Updating property:', id);
    await this.delay(800);

    const existingProperty = await this.getProperty(id);
    return {
      ...existingProperty,
      ...input,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Supprime une propriété
   */
  async deleteProperty(id: string): Promise<boolean> {
    console.log('🔧 [DEV MODE] Deleting property:', id);
    await this.delay(500);

    return true;
  }
}

// Instance unique du service en mode développement
let propertyServiceDevInstance: PropertyServiceDev | null = null;

/**
 * Récupère l'instance du service de propriétés en mode développement
 */
export function getPropertyServiceDev(): PropertyServiceDev {
  if (!propertyServiceDevInstance) {
    propertyServiceDevInstance = new PropertyServiceDev();
  }
  return propertyServiceDevInstance;
}