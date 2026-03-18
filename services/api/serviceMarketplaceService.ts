import { getGraphQLService } from './graphqlService';


export interface SubscribeServiceInput {
  serviceId: string;
  propertyId?: string;
  contractType?: ContractType;
  startDate?: string;
  autoRenewal?: boolean;
}

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
  GARDENING = 'gardening',
  SECURITY = 'security',
  PROPERTY_MANAGEMENT = 'property_management',
  CONSTRUCTION = 'construction',
  RENOVATION = 'renovation',
  AGRICULTURE = 'agriculture',
  UTILITIES = 'utilities',
  WASTE_MANAGEMENT = 'waste_management',
  PEST_CONTROL = 'pest_control',
  HEALTHCARE_HOME = 'healthcare_home',
  CHILDCARE_HOME = 'childcare_home',
  ELDERCARE_HOME = 'eldercare_home',
  TRANSPORT_LOGISTICS = 'transport_logistics',
  INSPECTION = 'inspection',
  LEGAL_ADMIN = 'legal_admin',
  EMERGENCY = 'emergency',
  ECO_SERVICES = 'eco_services',
  HOSPITALITY_SERVICES = 'hospitality_services',
  OFFICE_SERVICES = 'office_services',
  COMMERCIAL_SERVICES = 'commercial_services',
  OTHER = 'other'
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

export enum PaymentMethod {
  BANK_CARD = 'bank_card',
  MOBILE_MONEY = 'mobile_money',
  PAYPAL = 'paypal',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer'
}

export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  XAF = 'XAF'
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
  images?: string[];
  acceptedPaymentMethods: PaymentMethod[];
  verificationDocuments?: string[];
}

export interface ServicePricingInput {
  basePrice: number;
  currency?: Currency;
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
          provider {
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
              media {
                photos
                videos
                documents
              }
              provider {
                id
                companyName
                rating
                contactInfo {
                  email
                  phone
                }
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
      console.log('🔍 GetServices: Calling GraphQL with filters:', filters);
      const response = await this.graphqlService.query<{ services: ServiceConnection }>(
        query,
        { filters, pagination }
      );
      console.log('✅ GetServices: Response received, total:', response.services.totalCount);
      return response.services;
    } catch (error) {
      console.error('❌ GetServices: Error fetching services:', error);
      // Retourner une structure vide en cas d'erreur
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        totalCount: 0
      };
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
    try {
      // D'abord récupérer tous les services
      const allServices = await this.getServices(filters, { ...pagination, first: 1000 });
      
      console.log('🔍 SearchServices: Total services from backend:', allServices.totalCount);
      console.log('🔍 SearchServices: Services data:', allServices.edges.slice(0, 3).map(e => ({ id: e.node.id, title: e.node.title })));
      
      if (!searchQuery || !searchQuery.trim()) {
        return allServices;
      }

      const query = searchQuery.toLowerCase().trim();
      // console.log('🔍 SearchServices: Filtering with query:', query);
      
      // Filtrer les services selon la recherche textuelle
      const filteredEdges = allServices.edges.filter(edge => {
        const service = edge.node;
        const matches = (
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.tags.some(tag => tag.toLowerCase().includes(query)) ||
          (service.provider?.companyName && service.provider.companyName.toLowerCase().includes(query)) ||
          service.availability.zones.some(zone => zone.toLowerCase().includes(query))
        );
        
        if (matches) {
          console.log('✅ Service matches:', service.title);
        }
        
        return matches;
      });
      
      console.log('🔍 SearchServices: Filtered results:', filteredEdges.length);

      // Appliquer la pagination sur les résultats filtrés
      const startIndex = pagination?.after ? 
        filteredEdges.findIndex(edge => edge.cursor === pagination.after) + 1 : 0;
      const limit = pagination?.first || 20;
      const paginatedEdges = filteredEdges.slice(startIndex, startIndex + limit);

      return {
        edges: paginatedEdges,
        pageInfo: {
          hasNextPage: startIndex + limit < filteredEdges.length,
          hasPreviousPage: startIndex > 0,
          startCursor: paginatedEdges[0]?.cursor,
          endCursor: paginatedEdges[paginatedEdges.length - 1]?.cursor
        },
        totalCount: filteredEdges.length
      };
    } catch (error) {
      console.error('❌ SearchServices error:', error);
      // Retourner une structure vide en cas d'erreur
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        totalCount: 0
      };
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

  /**
   * Souscrit à un service
   */
  async subscribeToService(
    input: SubscribeServiceInput
  ): Promise<{ success: boolean; subscription?: ServiceSubscription; message?: string }> {
    const { serviceId, propertyId, contractType } = input;

    const mutation = `
      mutation SubscribeToService($serviceId: ID!, $propertyId: ID, $contractType: ContractType) {
        subscribeToService(serviceId: $serviceId, propertyId: $propertyId, contractType: $contractType) {
          success
          message
          subscription {
            id
            userId
            propertyId
            serviceId
            contractType
            status
            startDate
            endDate
            pricing {
              amount
              currency
              billingPeriod
            }
            autoRenewal
            createdAt
            updatedAt
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{
        subscribeToService: { success: boolean; subscription?: ServiceSubscription; message?: string };
      }>(mutation, { serviceId, propertyId, contractType });

      return response.subscribeToService;
    } catch (error) {
      console.error('Error subscribing to service:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
      };
    }
  }

  /**
   * Récupère les souscriptions de l'utilisateur
   */
  async getUserSubscriptions(userId: string): Promise<ServiceSubscription[]> {
    const query = `
      query GetUserSubscriptions($userId: ID!) {
        userSubscriptions(userId: $userId) {
          id
          userId
          propertyId
          serviceId
          contractType
          status
          startDate
          endDate
          pricing {
            amount
            currency
            billingPeriod
          }
          autoRenewal
          sharedWith
          paymentHistory {
            date
            amount
            status
          }
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ userSubscriptions: ServiceSubscription[] }>(
        query,
        { userId }
      );
      return response.userSubscriptions;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }
  }

  /**
   * Annule une souscription
   */
  async unsubscribeFromService(subscriptionId: string): Promise<{ success: boolean; message?: string }> {
    const mutation = `
      mutation CancelSubscription($subscriptionId: ID!) {
        cancelSubscription(subscriptionId: $subscriptionId) {
          id
          status
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{
        cancelSubscription: { id: string; status: string };
      }>(mutation, { subscriptionId });

      return { success: !!response.cancelSubscription };
    } catch (error) {
      console.error('Error unsubscribing from service:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
      };
    }
  }

  async pauseSubscription(subscriptionId: string): Promise<ServiceSubscription | null> {
    const mutation = `
      mutation PauseSubscription($subscriptionId: ID!) {
        pauseSubscription(subscriptionId: $subscriptionId) {
          id
          status
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ pauseSubscription: ServiceSubscription }>(
        mutation,
        { subscriptionId }
      );
      return response.pauseSubscription;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      return null;
    }
  }

  async resumeSubscription(subscriptionId: string): Promise<ServiceSubscription | null> {
    const mutation = `
      mutation ResumeSubscription($subscriptionId: ID!) {
        resumeSubscription(subscriptionId: $subscriptionId) {
          id
          status
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ resumeSubscription: ServiceSubscription }>(
        mutation,
        { subscriptionId }
      );
      return response.resumeSubscription;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      return null;
    }
  }

  /**
   * Met à jour une souscription (pause, renouvellement auto, etc.)
   */
  async updateSubscription(
    subscriptionId: string,
    updates: {
      status?: SubscriptionStatus;
      autoRenewal?: boolean;
      endDate?: string;
    }
  ): Promise<{ success: boolean; subscription?: ServiceSubscription; message?: string }> {
    const mutation = `
      mutation UpdateSubscription($subscriptionId: ID!, $updates: UpdateSubscriptionInput!) {
        updateSubscription(subscriptionId: $subscriptionId, updates: $updates) {
          success
          message
          subscription {
            id
            status
            autoRenewal
            endDate
            updatedAt
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{
        updateSubscription: { success: boolean; subscription?: ServiceSubscription; message?: string };
      }>(mutation, { subscriptionId, updates });

      return response.updateSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
      };
    }
  }

  /**
   * Enregistre un paiement pour une souscription
   */
  async recordPayment(
    subscriptionId: string,
    amount: number,
    paymentMethod?: string
  ): Promise<{ success: boolean; payment?: PaymentRecord; message?: string }> {
    const mutation = `
      mutation RecordPayment($subscriptionId: ID!, $amount: Float!, $paymentMethod: String) {
        recordPayment(subscriptionId: $subscriptionId, amount: $amount, paymentMethod: $paymentMethod) {
          success
          message
          payment {
            date
            amount
            status
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{
        recordPayment: { success: boolean; payment?: PaymentRecord; message?: string };
      }>(mutation, { subscriptionId, amount, paymentMethod });

      return response.recordPayment;
    } catch (error) {
      console.error('Error recording payment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
      };
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