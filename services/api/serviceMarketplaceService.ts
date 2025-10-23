import { getGraphQLService } from './graphqlService';

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  contractTypes: ContractType[];
  pricing: ServicePricing;
  requirements: ServiceRequirements;
  availability: ServiceAvailability;
  media: ServiceMedia;
  tags: string[];
  status: ServiceStatus;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  provider?: ServiceProvider;
  subscriptions?: ServiceSubscription[];
  reviews?: ServiceReview[];

  // Computed fields
  isAvailableForProperty?: boolean;
  estimatedPrice?: number;
}

export interface ServiceProvider {
  id: string;
  userId: string;
  companyName?: string;
  description: string;
  certifications: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  availableZones: string[];
  contactInfo: ContactInfo;
  businessInfo: BusinessInfo;
  createdAt: string;
  updatedAt: string;

  // Relations
  services?: Service[];
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export interface BusinessInfo {
  siret?: string;
  insurance?: string;
  license?: string;
}

export interface ServicePricing {
  basePrice: number;
  currency: string;
  billingPeriod: BillingPeriod;
  discounts?: ServiceDiscounts;
}

export interface ServiceDiscounts {
  longTerm?: number;
  seasonal?: number;
  bulk?: number;
}

export interface ServiceRequirements {
  propertyTypes: string[];
  minContractDuration?: number;
  maxContractDuration?: number;
  isMandatory: boolean;
  isOptional: boolean;
}

export interface ServiceAvailability {
  zones: string[];
  schedule: ServiceSchedule;
  isEmergency: boolean;
}

export interface ServiceSchedule {
  days: string[];
  hours: string;
}

export interface ServiceMedia {
  photos: string[];
  videos: string[];
  documents: string[];
}

export interface ServiceSubscription {
  id: string;
  userId: string;
  propertyId: string;
  serviceId: string;
  contractType: ContractType;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  pricing: SubscriptionPricing;
  autoRenewal: boolean;
  sharedWith: string[];
  paymentHistory: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPricing {
  amount: number;
  currency: string;
  billingPeriod: string;
}

export interface PaymentRecord {
  date: string;
  amount: number;
  status: PaymentStatus;
}

export interface ServiceReview {
  id: string;
  userId: string;
  serviceId: string;
  subscriptionId: string;
  rating: number;
  comment: string;
  photos: string[];
  isVerified: boolean;
  providerResponse?: ProviderResponse;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderResponse {
  comment: string;
  date: string;
}

export enum ServiceCategory {
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning',
  SECURITY = 'security',
  GARDENING = 'gardening',
  INSURANCE = 'insurance',
  UTILITIES = 'utilities',
  WELLNESS = 'wellness',
  EMERGENCY = 'emergency',
  ECO = 'eco',
  TECH = 'tech',
  COLLABORATIVE = 'collaborative'
}

export enum ContractType {
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term',
  SEASONAL = 'seasonal',
  ON_DEMAND = 'on_demand',
  EMERGENCY = 'emergency'
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum BillingPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ONE_TIME = 'one_time'
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  FAILED = 'failed'
}

export interface ServiceFilters {
  category?: ServiceCategory;
  location?: string;
  propertyType?: string;
  contractType?: ContractType;
  priceRange?: PriceRangeInput;
  isEmergency?: boolean;
  tags?: string[];
  rating?: number;
}

export interface PriceRangeInput {
  min: number;
  max: number;
}

export interface CreateServiceProviderInput {
  companyName?: string;
  description: string;
  certifications?: string[];
  availableZones: string[];
  contactInfo?: ContactInfo;
  businessInfo?: BusinessInfo;
}

export interface CreateServiceInput {
  title: string;
  description: string;
  category: ServiceCategory;
  contractTypes: ContractType[];
  pricing: ServicePricingInput;
  requirements: ServiceRequirementsInput;
  availability: ServiceAvailabilityInput;
  tags?: string[];
}

export interface ServicePricingInput {
  basePrice: number;
  currency?: string;
  billingPeriod: BillingPeriod;
  discounts?: ServiceDiscountsInput;
}

export interface ServiceDiscountsInput {
  longTerm?: number;
  seasonal?: number;
  bulk?: number;
}

export interface ServiceRequirementsInput {
  propertyTypes: string[];
  minContractDuration?: number;
  maxContractDuration?: number;
  isMandatory?: boolean;
  isOptional?: boolean;
}

export interface ServiceAvailabilityInput {
  zones: string[];
  schedule: ServiceScheduleInput;
  isEmergency?: boolean;
}

export interface ServiceScheduleInput {
  days: string[];
  hours: string;
}

export interface UpdateServiceInput {
  title?: string;
  description?: string;
  category?: ServiceCategory;
  contractTypes?: ContractType[];
  pricing?: ServicePricingInput;
  requirements?: ServiceRequirementsInput;
  availability?: ServiceAvailabilityInput;
  tags?: string[];
  status?: ServiceStatus;
}

export interface ServiceConnection {
  edges: Array<{
    node: Service;
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

export interface PaginationInput {
  first?: number;
  after?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

/**
 * Service pour les opérations liées au marketplace de services
 */
export class ServiceMarketplaceService {
  private graphqlService = getGraphQLService();

  /**
   * Récupère un service par son ID
   */
  async getService(id: string): Promise<Service | null> {
    const query = `
      query GetService($id: ID!) {
        service(id: $id) {
          id
          providerId
          title
          description
          category
          contractTypes
          pricing {
            basePrice
            currency
            billingPeriod
            discounts {
              longTerm
              seasonal
              bulk
            }
          }
          requirements {
            propertyTypes
            minContractDuration
            maxContractDuration
            isMandatory
            isOptional
          }
          availability {
            zones
            schedule {
              days
              hours
            }
            isEmergency
          }
          media {
            photos
            videos
            documents
          }
          tags
          status
          rating
          totalReviews
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ service: Service }>(
        query,
        { id }
      );
      return response.service;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les services avec filtres et pagination
   */
  async getServices(
    filters?: ServiceFilters,
    pagination?: PaginationInput
  ): Promise<ServiceConnection> {
    const query = `
      query GetServices($filters: ServiceFilters, $pagination: PaginationInput) {
        services(filters: $filters, pagination: $pagination) {
          edges {
            node {
              id
              providerId
              title
              description
              category
              contractTypes
              pricing {
                basePrice
                currency
                billingPeriod
              }
              requirements {
                propertyTypes
                isMandatory
                isOptional
              }
              availability {
                zones
                isEmergency
              }
              tags
              status
              rating
              totalReviews
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
      const response = await this.graphqlService.query<{ services: ServiceConnection }>(
        query,
        { filters, pagination }
      );
      return response.services;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau fournisseur de services
   */
  async createServiceProvider(input: CreateServiceProviderInput): Promise<ServiceProvider> {
    const mutation = `
      mutation CreateServiceProvider($input: CreateServiceProviderInput!) {
        createServiceProvider(input: $input) {
          id
          userId
          companyName
          description
          certifications
          rating
          totalReviews
          isVerified
          availableZones
          contactInfo {
            phone
            email
            website
          }
          businessInfo {
            siret
            insurance
            license
          }
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ createServiceProvider: ServiceProvider }>(
        mutation,
        { input }
      );
      return response.createServiceProvider;
    } catch (error) {
      console.error('Error creating service provider:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau service
   */
  async createService(input: CreateServiceInput): Promise<Service> {
    const mutation = `
      mutation CreateService($input: CreateServiceInput!) {
        createService(input: $input) {
          id
          providerId
          title
          description
          category
          contractTypes
          pricing {
            basePrice
            currency
            billingPeriod
            discounts {
              longTerm
              seasonal
              bulk
            }
          }
          requirements {
            propertyTypes
            minContractDuration
            maxContractDuration
            isMandatory
            isOptional
          }
          availability {
            zones
            schedule {
              days
              hours
            }
            isEmergency
          }
          media {
            photos
            videos
            documents
          }
          tags
          status
          rating
          totalReviews
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ createService: Service }>(
        mutation,
        { input }
      );
      return response.createService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Met à jour un service existant
   */
  async updateService(id: string, input: UpdateServiceInput): Promise<Service> {
    const mutation = `
      mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
        updateService(id: $id, input: $input) {
          id
          providerId
          title
          description
          category
          contractTypes
          pricing {
            basePrice
            currency
            billingPeriod
            discounts {
              longTerm
              seasonal
              bulk
            }
          }
          requirements {
            propertyTypes
            minContractDuration
            maxContractDuration
            isMandatory
            isOptional
          }
          availability {
            zones
            schedule {
              days
              hours
            }
            isEmergency
          }
          media {
            photos
            videos
            documents
          }
          tags
          status
          rating
          totalReviews
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ updateService: Service }>(
        mutation,
        { id, input }
      );
      return response.updateService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  /**
   * Supprime un service
   */
  async deleteService(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteService($id: ID!) {
        deleteService(id: $id)
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ deleteService: boolean }>(
        mutation,
        { id }
      );
      return response.deleteService;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  /**
   * Récupère les services d'un fournisseur
   */
  async getProviderServices(providerId: string): Promise<Service[]> {
    const query = `
      query GetProviderServices($providerId: ID!) {
        providerServices(providerId: $providerId) {
          id
          providerId
          title
          description
          category
          contractTypes
          pricing {
            basePrice
            currency
            billingPeriod
          }
          status
          rating
          totalReviews
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ providerServices: Service[] }>(
        query,
        { providerId }
      );
      return response.providerServices;
    } catch (error) {
      console.error('Error fetching provider services:', error);
      throw error;
    }
  }

  /**
   * Recherche des services par query text
   */
  async searchServices(
    searchQuery: string,
    filters?: ServiceFilters,
    pagination?: PaginationInput
  ): Promise<ServiceConnection> {
    const query = `
      query SearchServices($query: String, $filters: ServiceFilters, $pagination: PaginationInput) {
        searchServices(query: $query, filters: $filters, pagination: $pagination) {
          edges {
            node {
              id
              providerId
              title
              description
              category
              contractTypes
              pricing {
                basePrice
                currency
                billingPeriod
              }
              requirements {
                propertyTypes
                isMandatory
                isOptional
              }
              availability {
                zones
                isEmergency
              }
              tags
              status
              rating
              totalReviews
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
      const response = await this.graphqlService.query<{ searchServices: ServiceConnection }>(
        query,
        { query: searchQuery, filters, pagination }
      );
      return response.searchServices;
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  }

  /**
   * Récupère les recommandations de services
   */
  async getServiceRecommendations(input: any): Promise<any[]> {
    const query = `
      query GetServiceRecommendations($input: RecommendationInput!) {
        serviceRecommendations(input: $input) {
          serviceId
          score
          reason
          urgency
          category
          estimatedPrice
          service {
            id
            title
            description
            rating
            pricing {
              basePrice
              currency
            }
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ serviceRecommendations: any[] }>(
        query,
        { input }
      );
      return response.serviceRecommendations;
    } catch (error) {
      console.error('Error fetching service recommendations:', error);
      throw error;
    }
  }
}

// Instance unique du service
let serviceMarketplaceServiceInstance: ServiceMarketplaceService | null = null;

/**
 * Récupère l'instance du service ServiceMarketplace
 */
export function getServiceMarketplaceService(): ServiceMarketplaceService {
  if (!serviceMarketplaceServiceInstance) {
    serviceMarketplaceServiceInstance = new ServiceMarketplaceService();
  }
  return serviceMarketplaceServiceInstance;
}