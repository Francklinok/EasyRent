import date from '@nozbe/watermelondb/decorators/date';
import { getGraphQLService } from './graphqlService';

export interface Activity {
  id: string;
  propertyId: string;
  paymentId?: string;
  visitId?: string;
  visitStatus?: string;
  paymentStatus?: string;
  reservationId?: string;
  reservationStatus?: string;
  amount?: number;
  reservationDate?: string;
  createdAt: string;
  updatedAt: string;

  // Contract fields
  contractUrl?: string;
  contractGeneratedAt?: string;
  isPayment?: boolean;
  paymentDeadline?: string;
  isContratEnd?: boolean;
  contratEndDate?: string;
  currency?: string;

  // Relations
  property?: Property;
  client?: User;

  // Computed fields
  status?: ActivityStatus;
  type?: ActivityType;
  urgency?: ActivityUrgency;
}

export interface UploadedFile {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface GeneralHouseInfo {
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
}

export interface GeneralLandInfo {
  surface: number;
  constructible: boolean;
  cultivable: boolean;
  fence: boolean;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerAvatar?: string;
  actionType?: string;
  propertyType?: string;
  images?: string[];
  amenities?: string[];
  availableFrom?: string;
  status?: string;
  generalHInfo?: GeneralHouseInfo;
  generalLandinfo?: GeneralLandInfo;
  ownerCriteria?: {
    monthlyRent?: number;
    depositAmount?: number;
    currency?: string;
    minimumDuration?: number;
    acceptedPaymentMethods?: string[];
  };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export enum ActivityStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REFUSED = 'refused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ActivityType {
  VISIT = 'visit',
  RESERVATION = 'reservation',
  INQUIRY = 'inquiry'
}

export enum ActivityUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ActivityFilters {
  propertyId?: string;
  clientId?: string;
  status?: ActivityStatus;
  type?: ActivityType;
  urgency?: ActivityUrgency;
  dateFrom?: string;
  dateTo?: string;
  hasDocuments?: boolean;
  isPaymentPending?: boolean;
}

export interface CreateActivityInput {
  propertyId: string;
  clientId?: string;
  message: string;
  visitDate?: string;
  reservationDate?: string;
  amount?: number;
  isFileRequired?: boolean;
  type?: ActivityType;
}

export interface UpdateActivityInput {
  message?: string;
  visitDate?: string;
  isVisitAccepted?: boolean;
  isReservationAccepted?: boolean;
  isBookingAccepted?: boolean;
  isPayment?: boolean;
  amount?: number;
  paymentDate?: string;
  reason?: string;
  status?: ActivityStatus;
  documentsUploaded?: boolean;
  uploadedFiles?: UploadedFile[];
}

export interface ActivityConnection {
  edges: Array<{
    node: Activity;
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

export interface ActivityStats {
  totalActivities: number;
  pendingActivities: number;
  completedActivities: number;
  averageResponseTime: number;
  conversionRate: number;

  byStatus: Array<{
    status: ActivityStatus;
    count: number;
  }>;

  byType: Array<{
    type: ActivityType;
    count: number;
  }>;

  recentTrends: Array<{
    date: string;
    visits: number;
    reservations: number;
    payments: number;
  }>;
}

export interface PaginationInput {
  first?: number;
  after?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface TimeRangeInput {
  from: string;
  to: string;
}

/**
 * Service pour les opérations liées aux activités immobilières
 */
export class ActivityService {
  private graphqlService = getGraphQLService();

  /**
   * Récupère une activité par son ID
   */
  async getActivity(id: string): Promise<Activity | null> {
    const query = `
      query GetActivity($id: ID!) {
        activity(id: $id) {
          id
          propertyId
          clientId
          isVisited
          visitDate
          isVisitAccepted
          isReservation
          message
          reservationDate
          isReservationAccepted
          booking
          isFileRequired
          documentsUploaded
          uploadedFiles {
            fileName
            fileUrl
            uploadedAt
          }
          isBookingAccepted
          isPayment
          paymentStatus
          amount
          paymentDate
          paymentDeadline
          contractUrl
          contractGeneratedAt
          createdAt
          updatedAt
          status
          type
          urgency
          bookingInfo {
            fullName
            startDate
            endDate
            numberOfOccupants
            monthlyIncome
          }
          property {
            id
            title
            description
            address
            ownerId
            ownerName
            ownerEmail
            ownerPhone
            ownerAvatar
            actionType
            propertyType
            images
            amenities
            availableFrom
            status
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
            generalLandinfo {
              surface
              constructible
              cultivable
              fence
            }
            ownerCriteria {
              monthlyRent
              depositAmount
              currency
              minimumDuration
              acceptedPaymentMethods
            }
          }
          client {
            id
            fullName
            email
            avatar
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ activity: Activity }>(
        query,
        { id }
      );
      return response.activity;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les activités avec filtres et pagination
   */
  async getActivities(
    filters?: ActivityFilters,
    pagination?: PaginationInput
  ): Promise<ActivityConnection> {
    const query = `
      query GetActivities($filters: ActivityFilters, $pagination: PaginationInput) {
        activities(filters: $filters, pagination: $pagination) {
          edges {
            node {
              id
              propertyId
              clientId
              isVisited
              visitDate
              isVisitAccepted
              isReservation
              message
              reservationDate
              isReservationAccepted
              booking
              isFileRequired
              documentsUploaded
              uploadedFiles {
                fileName
                fileUrl
                uploadedAt
              }
              isBookingAccepted
              isPayment
              amount
              paymentDate
              createdAt
              updatedAt
              status
              type
              urgency
              property {
                id
                title
                address
                ownerId
              }
              client {
                id
                fullName
                email
                avatar
              }
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
      const response = await this.graphqlService.query<{ activities: ActivityConnection }>(
        query,
        { filters, pagination }
      );
      return response.activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Récupère les activités d'un utilisateur (client ou propriétaire)
   */
  async getUserActivities(
    userId: string,
    pagination?: PaginationInput,
    filters?: ActivityFilters
  ): Promise<ActivityConnection> {
    const query = `
      query GetUserActivities($userId: ID!, $pagination: PaginationInput, $filters: ActivityFilters) {
        activities(userId: $userId, pagination: $pagination, filters: $filters) {
          edges {
            node {
              id
              propertyId
              clientId
              isPayment
              paymentStatus
              visiteStatus
              reservationStatus
              amount
              reservationDate
              createdAt
              updatedAt
              status
              type
              urgency
              property {
                id
                title
                images
                address
                ownerId
                actionType
                ownerCriteria {
                  monthlyRent
                  depositAmount
                }
              }
              client {
                id
                fullName
                email
                avatar
              }
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
      console.log('🔍 [ActivityService] Fetching activities for user:', userId);
      const response = await this.graphqlService.query<{ activities: ActivityConnection }>(
        query,
        { userId, pagination, filters }
      );
      console.log('📥 [ActivityService] Activities response:', response?.activities?.edges?.length, 'items');
      return response.activities;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }

  /**
   * Récupère les activités d'une propriété
   */
  async getPropertyActivities(
    propertyId: string,
    pagination?: PaginationInput,
    filters?: ActivityFilters
  ): Promise<ActivityConnection> {
    const query = `
      query GetPropertyActivities($propertyId: ID!, $pagination: PaginationInput, $filters: ActivityFilters) {
        propertyActivities(propertyId: $propertyId, pagination: $pagination, filters: $filters) {
          edges {
            node {
              id
              propertyId
              clientId
              isVisited
              visitDate
              isVisitAccepted
              isReservation
              message
              reservationDate
              isReservationAccepted
              booking
              isFileRequired
              documentsUploaded
              isBookingAccepted
              isPayment
              amount
              paymentDate
              createdAt
              updatedAt
              status
              type
              urgency
              client {
                id
                fullName
                email
                avatar
              }
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
      const response = await this.graphqlService.query<{ propertyActivities: ActivityConnection }>(
        query,
        { propertyId, pagination, filters }
      );
      return response.propertyActivities;
    } catch (error) {
      console.error('Error fetching property activities:', error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle activité
   */
  async createActivity(input: CreateActivityInput): Promise<Activity> {
    const mutation = `
      mutation CreateActivity($input: CreateActivityInput!) {
        createActivity(input: $input) {
          id
          propertyId
          clientId
          isVisited
          visitDate
          isVisitAccepted
          isReservation
          message
          reservationDate
          isReservationAccepted
          booking
          isFileRequired
          documentsUploaded
          uploadedFiles {
            fileName
            fileUrl
            uploadedAt
          }
          isBookingAccepted
          isPayment
          amount
          paymentDate
          createdAt
          updatedAt
          status
          type
          urgency
          property {
            id
            title
            address
            ownerId
          }
          client {
            id
            fullName
            email
            avatar
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ createActivity: Activity }>(
        mutation,
        { input }
      );
      return response.createActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  /**
   * Met à jour une activité existante
   */
  async updateActivity(id: string, input: UpdateActivityInput): Promise<Activity> {
    const mutation = `
      mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
        updateActivity(id: $id, input: $input) {
          id
          propertyId
          clientId
          isVisited
          visitDate
          isVisitAccepted
          isReservation
          message
          reservationDate
          isReservationAccepted
          booking
          isFileRequired
          documentsUploaded
          uploadedFiles {
            fileName
            fileUrl
            uploadedAt
          }
          isBookingAccepted
          isPayment
          amount
          paymentDate
          createdAt
          updatedAt
          status
          type
          urgency
          property {
            id
            title
            address
            ownerId
          }
          client {
            id
            fullName
            email
            avatar
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ updateActivity: Activity }>(
        mutation,
        { id, input }
      );
      return response.updateActivity;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'une activité
   */
  async updateActivityStatus(
    id: string,
    status: ActivityStatus,
    reason?: string
  ): Promise<Activity> {
    const mutation = `
      mutation UpdateActivityStatus($id: ID!, $status: ActivityStatus!, $reason: String) {
        updateActivityStatus(id: $id, status: $status, reason: $reason) {
          id
          status
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ updateActivityStatus: Activity }>(
        mutation,
        { id, status, reason }
      );
      return response.updateActivityStatus;
    } catch (error) {
      console.error('Error updating activity status:', error);
      throw error;
    }
  }

  /**
   * Traite un paiement pour une activité
   */
  async processPayment(activityId: string, amount: number): Promise<Activity> {
    const mutation = `
      mutation ProcessPayment($activityId: ID!, $amount: Float!) {
        processPayment(activityId: $activityId, amount: $amount) {
          id
          isPayment
          amount
          paymentDate
          paymentStatus
          status
          updatedAt
          property {
            id
            title
            address
            actionType
            ownerCriteria {
              monthlyRent
              depositAmount
            }
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ processPayment: Activity }>(
        mutation,
        { activityId, amount }
      );
      return response.processPayment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde l'URL du contrat généré côté client dans la base de données
   */
  async saveContractUrl(activityId: string, contractUrl: string): Promise<Activity> {
    const mutation = `
      mutation SaveContractUrl($activityId: ID!, $contractUrl: String!) {
        saveContractUrl(activityId: $activityId, contractUrl: $contractUrl) {
          id
          contractUrl
          contractGeneratedAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ saveContractUrl: Activity }>(
        mutation,
        { activityId, contractUrl }
      );
      return response.saveContractUrl;
    } catch (error) {
      console.error('Error saving contract URL:', error);
      throw error;
    }
  }

  /**
   * Récupère les activités avec contrat généré pour un utilisateur
   */
  async getUserContracts(userId: string): Promise<Activity[]> {
    const query = `
      query GetUserContracts($userId: ID!) {
        activities(userId: $userId) {
          edges {
            node {
              id
              isPayment
              paymentStatus
              contractUrl
              contractGeneratedAt
              amount
              currency
              isContratEnd
              contratEndDate
              reservationDate
              createdAt
              updatedAt
              property {
                id
                title
                address
                actionType
                ownerCriteria {
                  monthlyRent
                  depositAmount
                }
              }
              client {
                id
                fullName
                email
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ activities: ActivityConnection }>(
        query,
        { userId }
      );
      return (response.activities?.edges || [])
        .map((e) => e.node)
        .filter((a) => a.isPayment && a.contractUrl);
    } catch (error) {
      console.error('Error fetching user contracts:', error);
      return [];
    }
  }

  /**
   * Annule une activité
   */
  async cancelActivity(id: string, reason: string): Promise<Activity> {
    const mutation = `
      mutation CancelActivity($id: ID!, $reason: String!) {
        cancelActivity(id: $id, reason: $reason) {
          id
          status
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ cancelActivity: Activity }>(
        mutation,
        { id, reason }
      );
      return response.cancelActivity;
    } catch (error) {
      console.error('Error canceling activity:', error);
      throw error;
    }
  }

  async activityEnded(activityId:string,  date:Date):Promise<Activity> {
    const mutation = `
      mutation EndActivitySession($activityId: ID!, $date: String!) {
        endActivitySession(activityId: $activityId, date: $date) {
          id
          status
          isContratEnd
          contratEndDate
          updatedAt
        }
      }
    `;
    try{
      const  result = await this.graphqlService.mutate<{ endActivitySession: Activity }>(
        mutation,
        { activityId, date: date.toISOString() }
      );
      return result.endActivitySession;
    }catch(error){
      console.error('Error ended activity:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des activités
   */
  async getActivityStats(
    userId?: string,
    propertyId?: string,
    timeRange?: TimeRangeInput
  ): Promise<ActivityStats> {
    const query = `
      query GetActivityStats($userId: ID, $propertyId: ID, $timeRange: TimeRangeInput) {
        activityStats(userId: $userId, propertyId: $propertyId, timeRange: $timeRange) {
          totalActivities
          pendingActivities
          completedActivities
          averageResponseTime
          conversionRate
          byStatus {
            status
            count
          }
          byType {
            type
            count
          }
          recentTrends {
            date
            visits
            reservations
            payments
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ activityStats: ActivityStats }>(
        query,
        { userId, propertyId, timeRange }
      );
      return response.activityStats;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  }

  /**
   * Recherche des activités par query text
   */
  async searchActivities(
    searchQuery: string,
    filters?: ActivityFilters,
    pagination?: PaginationInput
  ): Promise<ActivityConnection> {
    const query = `
      query SearchActivities($query: String!, $filters: ActivityFilters, $pagination: PaginationInput) {
        searchActivities(query: $query, filters: $filters, pagination: $pagination) {
          edges {
            node {
              id
              propertyId
              clientId
              message
              status
              type
              urgency
              createdAt
              updatedAt
              property {
                id
                title
                address
              }
              client {
                id
                fullName
                email
              }
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
      const response = await this.graphqlService.query<{ searchActivities: ActivityConnection }>(
        query,
        { query: searchQuery, filters, pagination }
      );
      return response.searchActivities;
    } catch (error) {
      console.error('Error searching activities:', error);
      throw error;
    }
  }

  /**
   * Récupère les activités récentes pour notifications
   */
  async getRecentActivities(
    userId: string,
    limit: number = 10
  ): Promise<Activity[]> {
    const query = `
      query GetRecentActivities($userId: ID!, $limit: Int) {
        recentActivities(userId: $userId, limit: $limit) {
          id
          propertyId
          clientId
          message
          status
          type
          urgency
          createdAt
          updatedAt
          property {
            id
            title
            address
          }
          client {
            id
            fullName
            avatar
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ recentActivities: Activity[] }>(
        query,
        { userId, limit }
      );
      return response.recentActivities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  /**
   * Récupère le nombre d'activités en attente pour un utilisateur
   */
  async getPendingActivitiesCount(userId: string): Promise<number> {
    const query = `
      query GetPendingActivitiesCount($userId: ID!) {
        pendingActivitiesCount(userId: $userId)
      }
    `;

    try {
      const response = await this.graphqlService.query<{ pendingActivitiesCount: number }>(
        query,
        { userId }
      );
      return response.pendingActivitiesCount;
    } catch (error) {
      console.error('Error fetching pending activities count:', error);
      throw error;
    }
  }
}

// Instance unique du service
let activityServiceInstance: ActivityService | null = null;

/**
 * Récupère l'instance du service Activity
 */
export function getActivityService(): ActivityService {
  if (!activityServiceInstance) {
    activityServiceInstance = new ActivityService();
  }
  return activityServiceInstance;
}