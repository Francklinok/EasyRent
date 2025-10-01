import { getGraphQLService } from './graphqlService';

export interface Activity {
  id: string;
  propertyId: string;
  clientId: string;
  isVisited: boolean;
  visitDate?: string;
  isVisitAccepted: boolean;
  isReservation: boolean;
  message: string;
  reservationDate?: string;
  isReservationAccepted: boolean;
  booking: boolean;
  isFileRequired: boolean;
  documentsUploaded: boolean;
  uploadedFiles: UploadedFile[];
  isBookingAccepted?: boolean;
  isPayment?: boolean;
  amount: number;
  paymentDate?: string;
  conversationId?: string;
  reason?: string;
  refusDate?: string;
  acceptedDate?: string;
  activityId: string;
  createdAt: string;
  updatedAt: string;

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

export interface Property {
  id: string;
  title: string;
  address: string;
  ownerId: string;
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
          amount
          paymentDate
          conversationId
          reason
          refusDate
          acceptedDate
          activityId
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
              conversationId
              reason
              refusDate
              acceptedDate
              activityId
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
        userActivities(userId: $userId, pagination: $pagination, filters: $filters) {
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
      const response = await this.graphqlService.query<{ userActivities: ActivityConnection }>(
        query,
        { userId, pagination, filters }
      );
      return response.userActivities;
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
          conversationId
          reason
          refusDate
          acceptedDate
          activityId
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
          conversationId
          reason
          refusDate
          acceptedDate
          activityId
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
          reason
          refusDate
          acceptedDate
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
  async processPayment(
    activityId: string,
    amount: number,
    paymentMethod?: string
  ): Promise<Activity> {
    const mutation = `
      mutation ProcessPayment($activityId: ID!, $amount: Float!, $paymentMethod: String) {
        processPayment(activityId: $activityId, amount: $amount, paymentMethod: $paymentMethod) {
          id
          isPayment
          amount
          paymentDate
          status
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ processPayment: Activity }>(
        mutation,
        { activityId, amount, paymentMethod }
      );
      return response.processPayment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
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
          reason
          refusDate
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