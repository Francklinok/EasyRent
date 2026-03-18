import { getGraphQLService } from './graphqlService';
import { getPropertyServiceDev } from './propertyService.dev';
import { API_CONFIG } from '@/constants/apiConfig';

export interface Property {
  id: string;
  propertyId: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAvatar: string;
  actionType: 'rent' | 'sell';
  rentalStrategy?: 'global' | 'per_unit' | 'both';
  propertyType: 'villa' | 'apartment' | 'home' | 'penthouse' | 'studio' | 'loft' | 'bureau' | 'chalet' | 'hotel' | 'terrain' | 'commercial';
  title: string;
  description: string;
  address: string;
  coordinates?: { latitude: number; longitude: number };
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
  hotelRoomTypes?: Array<{
    roomTypeId: string;
    name: string;
    category: string;
    capacity: number;
    pricePerNight: number;
    available: number;
    amenities: string[];
    description?: string;
    rooms?: Array<{
      roomId: string;
      roomName: string;
      images: Array<{
        publicId: string;
        originalUrl: string;
        variants: {
          thumbnail: string;
          small: string;
          medium: string;
          large: string;
          original: string;
        };
      }>;
      isAvailable: boolean;
    }>;
  }>;
  propertyRooms?: Array<{
    roomId: string;
    roomName: string;
    description?: string;
    images: Array<{
      publicId: string;
      originalUrl: string;
      variants: {
        thumbnail: string;
        small: string;
        medium: string;
        large: string;
        original: string;
      };
    }>;
    amenities?: string[];
    capacity?: number;
    price?: number;
    currency?: string;
    isRentable?: boolean;
    isAvailable?: boolean;
  }>;
  roomAvailability?: {
    total: number;
    available: number;
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
    currency?: 'XAF' | 'USD' | 'EUR' | 'CNY';
    acceptedPaymentMethods?: ('bank_card' | 'mobile_money' | 'paypal' | 'cash' | 'bank_transfer' | 'crypto' | 'other')[];
    isGarantRequired: boolean;
    depositAmount: number;
    minimumDuration: string;
    solvability: string;
    guarantorRequired: boolean;
    guarantorLocation?: string;
    acceptedSituations: string[];
    isdocumentRequired: boolean;
    requiredDocuments?: {
      client: string[];
      guarantor: string[];
    };
  };
  services?: Array<{ serviceId: string; [key: string]: any }>;
  virtualTours?: any[];
  cryptoEnabled?: boolean;
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
  coordinates?: { latitude: number; longitude: number };
  actionType: 'rent' | 'sell';
  rentalStrategy?: 'global' | 'per_unit' | 'both';
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
    currency?: 'XAF' | 'USD' | 'EUR' | 'CNY';
    acceptedPaymentMethods?: ('bank_card' | 'mobile_money' | 'paypal' | 'cash' | 'bank_transfer' | 'crypto' | 'other')[];
    isGarantRequired: boolean;
    depositAmount: number;
    minimumDuration: number;
    solvability: 'instant' | 'date';
    guarantorRequired: boolean;
    guarantorLocation: 'same' | 'different';
    acceptedSituations: string[];
    isdocumentRequired: boolean;
    requiredDocuments?: {
      client: string[];
      guarantor: string[];
    };
  };
  equipments?: Array<{
    id: string;
    name: string;
    icon: string;
    lib: string;
    category: string;
  }>;
  atouts?: Array<{
    id: string;
    type: string;
    text: string;
    icon?: string;
    lib?: string;
    category: string;
    verified?: boolean;
    priority?: number;
    customIcon?: boolean;
  }>;
  services?: Array<{
    serviceId: string;
  }>;
  iserviceAvalaible?: boolean;
  cryptoEnabled?: boolean;
  hotelRoomTypes?: Array<{
    roomTypeId: string;
    name: string;
    category: string;
    capacity: number;
    pricePerNight: number;
    available: number;
    amenities: string[];
    description?: string;
    rooms?: Array<{
      roomId: string;
      roomName: string;
      images: string[];
    }>;
  }>;
  propertyRooms?: Array<{
    roomId: string;
    roomName: string;
    description?: string;
    images: string[];
    amenities?: string[];
    capacity?: number;
    price?: number;
    currency?: string;
    isRentable?: boolean;
    isAvailable?: boolean;
  }>;
  roomAvailability?: {
    total: number;
    available: number;
  };
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
  hotelRoomTypes?: CreatePropertyInput['hotelRoomTypes'];
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
          ownerId
          actionType
          ownerName
          ownerPhone
          ownerEmail
          ownerId
          ownerAvatar
          propertyType
          title
          description
          address
          coordinates {
            latitude
            longitude
          }
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
          hotelRoomTypes {
            roomTypeId
            name
            category
            capacity
            pricePerNight
            available
            amenities
            description
            rooms {
              roomId
              roomName
              images {
                publicId
                originalUrl
                variants {
                  thumbnail
                  small
                  medium
                  large
                  original
                }
              }
              isAvailable
            }
          }
          propertyRooms {
            roomId
            roomName
            description
            images {
              publicId
              originalUrl
              variants {
                thumbnail
                small
                medium
                large
                original
              }
            }
            amenities
            capacity
            price
            currency
            isRentable
            isAvailable
          }
          roomAvailability {
            total
            available
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
          services {
            serviceId
          }
          availableFrom
          status
          isActive
          iserviceAvalaible
          rentalStrategy
          ownerCriteria {
            monthlyRent
            currency
            acceptedPaymentMethods
            isGarantRequired
            depositAmount
            minimumDuration
            solvability
            guarantorRequired
            guarantorLocation
            acceptedSituations
            isdocumentRequired
            requiredDocuments {
              client
              guarantor
            }
          }
          cryptoEnabled
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
              ownerId
              actionType
              ownerName
              ownerPhone
              ownerEmail
              ownerAvatar
              propertyType
              title
              description
              address
              coordinates {
                latitude
                longitude
              }
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
              hotelRoomTypes {
                roomTypeId
                name
                category
                capacity
                pricePerNight
                available
                amenities
                description
                rooms {
                  roomId
                  roomName
                  images {
                    publicId
                    originalUrl
                    variants {
                      thumbnail
                      small
                      medium
                      large
                      original
                    }
                  }
                  isAvailable
                }
              }
              propertyRooms {
                roomId
                roomName
                description
                images {
                  publicId
                  originalUrl
                  variants {
                    thumbnail
                    small
                    medium
                    large
                    original
                  }
                }
                amenities
                capacity
                price
                currency
                isRentable
                isAvailable
              }
              roomAvailability {
                total
                available
              }
              images
              amenities
              equipments {
                id
                name
                icon
                lib
                category
              }
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
              services {
                serviceId
              }
              availableFrom
              status
              isActive
              iserviceAvalaible
              rentalStrategy
              ownerCriteria {
                monthlyRent
                currency
                acceptedPaymentMethods
                isGarantRequired
                depositAmount
                minimumDuration
                solvability
                guarantorRequired
                guarantorLocation
                acceptedSituations
                isdocumentRequired
                requiredDocuments {
                  client
                  guarantor
                }
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
          availableCount
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
              ownerName
              ownerPhone
              ownerEmail
              ownerAvatar
              propertyType
              title
              description
              address
              coordinates {
                latitude
                longitude
              }
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
              hotelRoomTypes {
                roomTypeId
                name
                category
                capacity
                pricePerNight
                available
                amenities
                description
                rooms {
                  roomId
                  roomName
                  images {
                    publicId
                    originalUrl
                    variants {
                      thumbnail
                      small
                      medium
                      large
                      original
                    }
                  }
                  isAvailable
                }
              }
              propertyRooms {
                roomId
                roomName
                description
                images {
                  publicId
                  originalUrl
                  variants {
                    thumbnail
                    small
                    medium
                    large
                    original
                  }
                }
                amenities
                capacity
                price
                currency
                isRentable
                isAvailable
              }
              roomAvailability {
                total
                available
              }
              images
              amenities
              availableFrom
              status
              isActive
              rentalStrategy
              ownerCriteria {
                monthlyRent
                currency
                acceptedPaymentMethods
                isGarantRequired
                depositAmount
                minimumDuration
                solvability
                guarantorRequired
                guarantorLocation
                acceptedSituations
                isdocumentRequired
                requiredDocuments {
                  client
                  guarantor
                }
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
          ownerName
          ownerPhone
          ownerEmail
          ownerAvatar
          title
          description
          address
          coordinates {
            latitude
            longitude
          }
          generalLandinfo {
            surface
          }
          images
          ownerCriteria {
            monthlyRent
            currency
            acceptedPaymentMethods
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
              ownerName
              ownerPhone
              ownerEmail
              ownerAvatar
              propertyType
              title
              description
              address
              coordinates {
                latitude
                longitude
              }
              generalLandinfo {
                surface
              }
              images
              status
              isActive
              ownerCriteria {
                monthlyRent
                currency
                acceptedPaymentMethods
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
   * Récupère les propriétés acquises (louées/achetées) par un utilisateur
   */
  async getPropertiesAcquiredBy(
    userId?: string,
    pagination?: PaginationInput
  ): Promise<PropertyConnection> {
    const query = `
      query GetPropertiesAcquiredBy($userId: ID, $pagination: PaginationInput) {
        propertiesAcquiredBy(userId: $userId, pagination: $pagination) {
          edges {
            node {
              id
              propertyId
              actionType
              ownerName
              ownerPhone
              ownerEmail
              ownerAvatar
              propertyType
              title
              description
              address
              coordinates {
                latitude
                longitude
              }
              images
              status
              ownerCriteria {
                monthlyRent
                currency
                depositAmount
              }
              createdAt
              updatedAt
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
      const response = await this.graphqlService.query<{ propertiesAcquiredBy: PropertyConnection }>(
        query,
        { userId, pagination }
      );
      return response.propertiesAcquiredBy;
    } catch (error) {
      console.error('Error fetching acquired properties:', error);
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
          rentalStrategy
          ownerName
          ownerPhone
          ownerEmail
          ownerAvatar
          propertyType
          title
          description
          address
          coordinates {
            latitude
            longitude
          }
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
          hotelRoomTypes {
            roomTypeId
            name
            category
            capacity
            pricePerNight
            available
            amenities
            description
            rooms {
              roomId
              roomName
              images {
                publicId
                originalUrl
                variants {
                  thumbnail
                  small
                  medium
                  large
                  original
                }
              }
              isAvailable
            }
          }
          propertyRooms {
            roomId
            roomName
            description
            images {
              publicId
              originalUrl
              variants {
                thumbnail
                small
                medium
                large
                original
              }
            }
            amenities
            capacity
            price
            currency
            isRentable
            isAvailable
          }
          roomAvailability {
            total
            available
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
          rentalStrategy
          ownerCriteria {
            monthlyRent
            currency
            acceptedPaymentMethods
            isGarantRequired
            depositAmount
            minimumDuration
            solvability
            guarantorRequired
            guarantorLocation
            acceptedSituations
            isdocumentRequired
            requiredDocuments {
              client
              guarantor
            }
          }
          cryptoEnabled
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
   * update  an existing property
   */
  async updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
    const mutation = `
      mutation UpdateProperty($id: ID!, $input: UpdatePropertyInput!) {
        updateProperty(id: $id, input: $input) {
          id
          propertyId
          actionType
          ownerName
          ownerPhone
          ownerEmail
          ownerAvatar
          propertyType
          title
          description
          address
          coordinates {
            latitude
            longitude
          }
          generalLandinfo {
            surface
          }
          hotelRoomTypes {
            roomTypeId
            name
            category
            capacity
            pricePerNight
            available
            amenities
            description
            rooms {
              roomId
              roomName
              images {
                publicId
                originalUrl
                variants {
                  thumbnail
                  small
                  medium
                  large
                  original
                }
              }
              isAvailable
            }
          }
          propertyRooms {
            roomId
            roomName
            description
            images {
              publicId
              originalUrl
              variants {
                thumbnail
                small
                medium
                large
                original
              }
            }
            amenities
            capacity
            price
            currency
            isRentable
            isAvailable
          }
          roomAvailability {
            total
            available
          }
          images
          amenities
          availableFrom
          status
          isActive
          ownerCriteria {
            monthlyRent
            currency
            acceptedPaymentMethods
            isGarantRequired
            depositAmount
            minimumDuration
            solvability
            guarantorRequired
            guarantorLocation
            acceptedSituations
            isdocumentRequired
            requiredDocuments {
              client
              guarantor
            }
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
   * Met à jour le statut d'une propriété
   */
  async updatePropertyStatus(id: string, status: string): Promise<Property> {
    const mutation = `
      mutation UpdatePropertyStatus($id: ID!, $status: PropertyStatus!) {
        updatePropertyStatus(id: $id, status: $status) {
          id
          status
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ updatePropertyStatus: Property }>(
        mutation,
        { id, status }
      );
      return response.updatePropertyStatus;
    } catch (error) {
      console.error('Error updating property status:', error);
      throw error;
    }
  }

  async terminatePropertyLease(propertyId: string): Promise<Property> {
    const mutation = `
      mutation TerminatePropertyLease($propertyId: ID!) {
        terminatePropertyLease(propertyId: $propertyId) {
          id
          status
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ terminatePropertyLease: Property }>(
        mutation,
        { propertyId }
      );
      return response.terminatePropertyLease;
    } catch (error) {
      console.error('Error terminating property lease:', error);
      throw error;
    }
  }

  /**
   * delete a  property by ID
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