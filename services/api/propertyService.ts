import { getGraphQLService } from './graphqlService';
import { getPropertyServiceDev } from './propertyService.dev';
import { API_CONFIG } from '@/constants/apiConfig';

export interface Property {
  id: string;
  propertyId: string;
  ownerId: string;
  actionType: 'rent' | 'sell';
  propertyType: 'villa' | 'apartment' | 'home' | 'penthouse' | 'studio' | 'loft' | 'bureau' | 'chalet' | 'hotel' | 'terrain' | 'commercial';
  title: string;
  description: string;
  address: string;
  generalHInfo?: {
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    toilets?: number;
    surface: number;
    area: string;
    furnished: boolean;
    pets: boolean;
    smoking: boolean;
    maxOccupants: number;
  };
  generalLandinfo?: {
    surface: number;
  };
  images: Array<{ url: string; publicId?: string }> | string[];
  amenities: string[];
  atouts?: Array<{
    id: string;
    type: string;
    text: string;
    icon?: string;
    lib?: string;
    category?: string;
    priority?: number;
    verified?: boolean;
  }>;
  equipments?: Array<{
    id: string;
    name: string;
    icon: string;
    lib: string;
    category: string;
  }>;
  availableFrom: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE';
  isActive: boolean;
  ownerCriteria: {
    monthlyRent: number;
    isGarantRequired: boolean;
    depositAmount: number;
    minimumDuration: string;
    solvability: string;
    guarantorRequired: boolean;
    guarantorLocation?: string;
    acceptedSituations: string[];
    isdocumentRequired: boolean;
  };
  services?: Array<{ serviceId: string; [key: string]: any }>;
  virtualTours?: any[];
  createdAt: string;
  updatedAt: string;

  // Computed fields
  pricePerSquareMeter?: number;
  isAvailable?: boolean;
  performanceScore?: number;
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

export interface CreatePropertyInput {
  title: string;
  description: string;
  address: string;
  actionType: 'rent' | 'sell';
  propertyType: 'villa' | 'apartment' | 'home' | 'penthouse' | 'studio' | 'loft' | 'bureau' | 'chalet' | 'hotel' | 'terrain' | 'commercial';
  generalLandinfo: {
    surface: number;
  };
  generalHInfo?: {
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    toilets?: number;
    surface: number;
    area: string;
    furnished: boolean;
    pets: boolean;
    smoking: boolean;
    maxOccupants: number;
  };
  images: string[];
  amenities: string[];
  availableFrom?: string;
  ownerCriteria: {
    monthlyRent: number;
    isGarantRequired: boolean;
    depositAmount: number;
    minimumDuration: number;
    solvability: 'instant' | 'date';
    guarantorRequired: boolean;
    guarantorLocation: 'same' | 'different';
    acceptedSituations: string[];
    isdocumentRequired: boolean;
  };
  services?: Array<{
    serviceId: string;
  }>;
  iserviceAvalaible?: boolean;
  cryptoEnabled?: boolean;
}

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  address?: string;
  actionType?: 'rent' | 'sell';
  propertyType?: 'villa' | 'apartment' | 'home' | 'penthouse' | 'studio' | 'loft' | 'bureau' | 'chalet' | 'hotel' | 'terrain' | 'commercial';
  generalLandinfo?: {
    surface: number;
  };
  generalHInfo?: Partial<{
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    toilets?: number;
    surface: number;
    area: string;
    furnished: boolean;
    pets: boolean;
    smoking: boolean;
    maxOccupants: number;
  }>;
  images?: string[];
  amenities?: string[];
  availableFrom?: string;
  status?: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE';
  ownerCriteria?: Partial<CreatePropertyInput['ownerCriteria']>;
}

export interface PropertyConnection {
  edges: Array<{
    node: Property;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount: number;
}

/**
 * Service pour les opérations liées aux propriétés
 */
export class PropertyService {
  private graphqlService = getGraphQLService();

  /**
   * Récupère une propriété par son ID
   */
  async getProperty(id: string): Promise<Property | null> {
    const query = `
      query GetProperty($id: ID!) {
        property(id: $id) {
          id
          propertyId
          actionType
          propertyType
          title
          description
          address
          generalLandinfo {
            surface
          }
          generalHInfo {
            rooms
            bedrooms
            bathrooms
            toilets
            surface
            area
            furnished
            pets
            smoking
            maxOccupants
          }
          images
          amenities
          atouts {
            id
            type
            text
            icon
            lib
            category
            priority
            verified
          }
          equipments {
            id
            name
            icon
            lib
            category
          }
          availableFrom
          status
          isActive
          ownerCriteria {
            monthlyRent
            isGarantRequired
            depositAmount
            minimumDuration
            solvability
            guarantorRequired
            guarantorLocation
            acceptedSituations
            isdocumentRequired
          }
          createdAt
          updatedAt
          pricePerSquareMeter
          isAvailable
          performanceScore
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ property: Property }>(
        query,
        { id }
      );
      return response.property;
    } catch (error) {
      // Fallback to dev service with mock data if network error
      if (error instanceof Error && error.message === 'NETWORK_ERROR_USE_MOCK') {
        console.log('🔧 [PropertyService] Falling back to development service with mock data');
        const devService = getPropertyServiceDev();
        return await devService.getProperty(id);
      }

      console.error('Error fetching property:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les propriétés avec filtres et pagination
   */
  async getProperties(
    filters?: PropertyFilters,
    pagination?: PaginationInput
  ): Promise<PropertyConnection> {
    const query = `
      query GetProperties($filters: PropertyFilters, $pagination: PaginationInput) {
        properties(filters: $filters, pagination: $pagination) {
          edges {
            node {
              id
              propertyId
              actionType
              propertyType
              title
              description
              address
              generalLandinfo {
                surface
              }
              generalHInfo {
                rooms
                bedrooms
                bathrooms
                toilets
                surface
                area
                furnished
                pets
                smoking
                maxOccupants
              }
              images
              amenities
              availableFrom
              status
              isActive
              ownerCriteria {
                monthlyRent
                isGarantRequired
                depositAmount
                minimumDuration
                solvability
                guarantorRequired
                guarantorLocation
                acceptedSituations
                isdocumentRequired
              }
              createdAt
              updatedAt
              pricePerSquareMeter
              isAvailable
              performanceScore
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ properties: PropertyConnection }>(
        query,
        { filters, pagination }
      );
      return response.properties;
    } catch (error) {
      console.error('Error fetching properties:', error);

      // Si erreur réseau en mode dev, utiliser le service dev
      if (error instanceof Error && error.message === 'NETWORK_ERROR_USE_MOCK') {
        console.log('🔧 [PropertyService] Falling back to development service with mock data');
        const devService = getPropertyServiceDev();
        return await devService.getProperties(filters, pagination);
      }

      throw error;
    }
  }

  /**
   * Recherche des propriétés par query text
   */
  async searchProperties(
    searchQuery: string,
    filters?: PropertyFilters,
    pagination?: PaginationInput
  ): Promise<PropertyConnection> {
    const query = `
      query SearchProperties($query: String, $filters: PropertyFilters, $pagination: PaginationInput) {
        searchProperties(query: $query, filters: $filters, pagination: $pagination) {
          edges {
            node {
              id
              propertyId
              actionType
              propertyType
              title
              description
              address
              generalLandinfo {
                surface
              }
              generalHInfo {
                rooms
                bedrooms
                bathrooms
                toilets
                surface
                area
                furnished
                pets
                smoking
                maxOccupants
              }
              images
              amenities
              availableFrom
              status
              isActive
              ownerCriteria {
                monthlyRent
                isGarantRequired
                depositAmount
                minimumDuration
                solvability
                guarantorRequired
                guarantorLocation
                acceptedSituations
                isdocumentRequired
              }
              createdAt
              updatedAt
              pricePerSquareMeter
              isAvailable
              performanceScore
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ searchProperties: PropertyConnection }>(
        query,
        { query: searchQuery, filters, pagination }
      );
      return response.searchProperties;
    } catch (error) {
      console.error('Error searching properties:', error);

      // Si erreur réseau en mode dev, utiliser le service dev
      if (error instanceof Error && error.message === 'NETWORK_ERROR_USE_MOCK') {
        console.log('🔧 [PropertyService] Falling back to development service with mock data for search');
        const devService = getPropertyServiceDev();
        return await devService.searchProperties(searchQuery, filters, pagination);
      }

      throw error;
    }
  }

  /**
   * Récupère les propriétés similaires
   */
  async getSimilarProperties(propertyId: string, limit: number = 5): Promise<Property[]> {
    const query = `
      query GetSimilarProperties($propertyId: ID!, $limit: Int) {
        similarProperties(propertyId: $propertyId, limit: $limit) {
          id
          propertyId
          title
          description
          address
          generalLandinfo {
            surface
          }
          images
          ownerCriteria {
            monthlyRent
          }
          pricePerSquareMeter
          isAvailable
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ similarProperties: Property[] }>(
        query,
        { propertyId, limit }
      );
      return response.similarProperties;
    } catch (error) {
      console.error('Error fetching similar properties:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des propriétés
   */
  async getPropertyStats(): Promise<any> {
    const query = `
      query GetPropertyStats {
        propertyStats {
          totalProperties
          availableProperties
          rentedProperties
          averageRent
          averageSize
          propertiesByArea {
            area
            count
            averageRent
          }
          propertiesByStatus {
            status
            count
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ propertyStats: any }>(query);
      return response.propertyStats;
    } catch (error) {
      console.error('Error fetching property stats:', error);
      throw error;
    }
  }

  /**
   * Récupère les propriétés d'un propriétaire
   */
  async getPropertiesByOwner(
    ownerId?: string,
    pagination?: PaginationInput,
    status?: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE'
  ): Promise<PropertyConnection> {
    const query = `
      query GetPropertiesByOwner($ownerId: ID, $pagination: PaginationInput, $status: PropertyStatus) {
        propertiesByOwner(ownerId: $ownerId, pagination: $pagination, status: $status) {
          edges {
            node {
              id
              propertyId
              actionType
              propertyType
              title
              description
              address
              generalLandinfo {
                surface
              }
              images
              status
              isActive
              ownerCriteria {
                monthlyRent
              }
              createdAt
              updatedAt
              pricePerSquareMeter
              isAvailable
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ propertiesByOwner: PropertyConnection }>(
        query,
        { ownerId, pagination, status }
      );
      return response.propertiesByOwner;
    } catch (error) {
      console.error('Error fetching properties by owner:', error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle propriété
   */
  async createProperty(input: CreatePropertyInput): Promise<Property> {
    const mutation = `
      mutation CreateProperty($input: CreatePropertyInput!) {
        createProperty(input: $input) {
          id
          propertyId
          actionType
          propertyType
          title
          description
          address
          generalLandinfo {
            surface
          }
          generalHInfo {
            rooms
            bedrooms
            bathrooms
            toilets
            surface
            area
            furnished
            pets
            smoking
            maxOccupants
          }
          images
          amenities
          atouts {
            id
            type
            text
            icon
            lib
            category
            priority
            verified
          }
          equipments {
            id
            name
            icon
            lib
            category
          }
          availableFrom
          status
          isActive
          ownerCriteria {
            monthlyRent
            isGarantRequired
            depositAmount
            minimumDuration
            solvability
            guarantorRequired
            guarantorLocation
            acceptedSituations
            isdocumentRequired
          }
          createdAt
          updatedAt
          pricePerSquareMeter
          isAvailable
          performanceScore
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ createProperty: Property }>(
        mutation,
        { input }
      );
      return response.createProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Met à jour une propriété existante
   */
  async updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
    const mutation = `
      mutation UpdateProperty($id: ID!, $input: UpdatePropertyInput!) {
        updateProperty(id: $id, input: $input) {
          id
          propertyId
          actionType
          propertyType
          title
          description
          address
          generalLandinfo {
            surface
          }
          images
          amenities
          availableFrom
          status
          isActive
          ownerCriteria {
            monthlyRent
            isGarantRequired
            depositAmount
            minimumDuration
            solvability
            guarantorRequired
            guarantorLocation
            acceptedSituations
            isdocumentRequired
          }
          createdAt
          updatedAt
          pricePerSquareMeter
          isAvailable
          performanceScore
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ updateProperty: Property }>(
        mutation,
        { id, input }
      );
      return response.updateProperty;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * Supprime une propriété
   */
  async deleteProperty(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteProperty($id: ID!) {
        deleteProperty(id: $id)
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ deleteProperty: boolean }>(
        mutation,
        { id }
      );
      return response.deleteProperty;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }
}

// Instance unique du service
let propertyServiceInstance: PropertyService | null = null;

/**
 * Récupère l'instance du service Property
 * En mode développement sans backend, utilise le service de dev avec données mockées
 */
export function getPropertyService(): PropertyService | any {
  // Utiliser les données mockées si configuré pour le développement
  if (API_CONFIG.USE_MOCK_DATA) {
    console.log('🔧 Using development property service with mock data');
    return getPropertyServiceDev();
  }

  if (!propertyServiceInstance) {
    propertyServiceInstance = new PropertyService();
  }
  return propertyServiceInstance;
}