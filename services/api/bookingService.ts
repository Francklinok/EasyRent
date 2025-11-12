import { GraphQLService, getGraphQLService } from './graphqlService';
import { getActivityService } from './activityService';
import { getChatService } from './chatService';
import { getNotificationService } from './notificationService';

// Types
export interface BookingRequest {
  propertyId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  numberOfOccupants: number;
  hasGuarantor: boolean;
  monthlyIncome: number;
  visitCompleted?: boolean;
  // For sale properties
  budget?: number;
  financingType?: string;
  timeframe?: string;
  currentSituation?: string;
}

export interface VisitRequest {
  propertyId: string;
  clientId: string;
  visitDate: string;
  visitTime: string;
  message?: string;
}

export interface DocumentUpload {
  reservationId: string;
  documentType: string;
  documentUrl: string;
  uploadedBy: string;
}

export interface DocumentApproval {
  reservationId: string;
  ownerId: string;
  approved: boolean;
  reason?: string;
}

export interface PaymentRequest {
  reservationId: string;
  amount: number;
  paymentMethod: string;
  clientId: string;
}

export interface ContractRequest {
  reservationId: string;
  contractType: 'rent' | 'sale';
  clientInfo: ClientLegalInfo;
  ownerInfo: OwnerLegalInfo;
}

export interface ClientLegalInfo {
  fullName: string;
  age: number;
  phone: string;
  originCountry: string;
  residenceCountry: string;
  profession: string;
  idDocument: string;
  // Additional legal info
  civilStatus?: string;
  birthDate?: string;
  birthPlace?: string;
  address: string;
}

export interface OwnerLegalInfo {
  fullName: string;
  country: string;
  profession: string;
  idDocument: string;
  address: string;
}

export type BookingStatus =
  | 'pending'
  | 'visit_requested'
  | 'visit_confirmed'
  | 'visit_completed'
  | 'documents_submitted'
  | 'documents_approved'
  | 'documents_rejected'
  | 'approved'
  | 'rejected'
  | 'payment_pending'
  | 'payment_completed'
  | 'contract_generated'
  | 'admin_verification_pending'
  | 'admin_verified'
  | 'title_deed_requested'
  | 'completed';

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  monthlyRent?: number;
  salePrice?: number;
  depositAmount?: number;
  numberOfOccupants: number;
  hasGuarantor: boolean;
  monthlyIncome: number;
  status: BookingStatus;
  documentsSubmitted: boolean;
  documentsApproved: boolean;
  documents?: Document[];
  visitDate?: string;
  visitTime?: string;
  visitCompleted?: boolean;
  paymentCompleted?: boolean;
  contractUrl?: string;
  titleDeedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

class BookingService {
  private graphql: GraphQLService;
  private activityService = getActivityService();
  private chatService = getChatService();
  private notificationService = getNotificationService();

  constructor() {
    this.graphql = getGraphQLService();
  }

  // Create a visit request
  async createVisitRequest(request: VisitRequest): Promise<{ success: boolean; visitId: string }> {
    const mutation = `
      mutation CreateActivity($input: CreateActivityInput!) {
        createActivity(input: $input) {
          id
          propertyId
          clientId
          visitDate
          message
          status
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        input: {
          propertyId: request.propertyId,
          message: request.message || `Demande de visite pour le ${request.visitDate} à ${request.visitTime}`,
          isVisited: true,
          visitDate: request.visitDate
        }
      });

      // Send notification to owner
      await this.sendVisitRequestNotification(
        result.createActivity.propertyId,
        request.clientId,
        request.visitDate,
        request.visitTime
      );

      return {
        success: true,
        visitId: result.createActivity.id
      };
    } catch (error) {
      console.error('Error creating visit request:', error);
      throw error;
    }
  }

  // Owner accepts/rejects visit request
  async respondToVisitRequest(
    visitId: string,
    ownerId: string,
    accepted: boolean,
    reason?: string
  ): Promise<{ success: boolean }> {
    const mutation = `
      mutation RespondToVisitRequest($visitId: ID!, $ownerId: ID!, $accepted: Boolean!, $reason: String) {
        respondToVisitRequest(visitId: $visitId, ownerId: $ownerId, accepted: $accepted, reason: $reason) {
          id
          status
          propertyId
          clientId
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        visitId,
        ownerId,
        accepted,
        reason
      });

      // Send notification to client
      await this.notificationService.sendNotification({
        userId: result.respondToVisitRequest.clientId,
        type: accepted ? 'VISIT_CONFIRMED' : 'VISIT_REJECTED',
        title: accepted ? 'Visite confirmée' : 'Visite refusée',
        message: accepted
          ? 'Votre demande de visite a été acceptée par le propriétaire'
          : `Votre demande de visite a été refusée${reason ? ': ' + reason : ''}`,
        data: {
          visitId,
          propertyId: result.respondToVisitRequest.propertyId,
          accepted
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error responding to visit request:', error);
      throw error;
    }
  }

  // Create a booking/reservation
  async createBooking(request: BookingRequest): Promise<Booking> {
    const mutation = `
      mutation CreateBooking($input: BookingInput!) {
        createBooking(input: $input) {
          id
          propertyId
          clientId
          message
          isReservation
          reservationDate
          status
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        input: {
          propertyId: request.propertyId,
          message: `Réservation pour ${request.numberOfOccupants} occupants`,
          reservationDate: request.startDate,
          uploadedFiles: []
        }
      });

      const activity = result.createBooking;

      // Map Activity to Booking
      const booking: Booking = {
        id: activity.id,
        propertyId: activity.propertyId,
        propertyTitle: '', // Will be populated by property query
        ownerId: '', // Will be populated by property query
        clientId: activity.clientId,
        startDate: request.startDate,
        endDate: request.endDate,
        monthlyRent: request.budget, // Temporary
        depositAmount: 0,
        numberOfOccupants: request.numberOfOccupants,
        hasGuarantor: request.hasGuarantor,
        monthlyIncome: request.monthlyIncome,
        status: 'pending',
        documentsSubmitted: false,
        documentsApproved: false,
        visitCompleted: request.visitCompleted || false,
        paymentCompleted: false,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt
      };

      // Get property details for ownerId
      const property = await this.getPropertyDetails(request.propertyId);
      booking.ownerId = property.ownerId;
      booking.propertyTitle = property.title;

      // Send notification to owner
      await this.sendBookingRequestNotification(
        property.ownerId,
        request.propertyId,
        request.clientId,
        activity.id
      );

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Upload documents for a booking
  async uploadDocument(upload: DocumentUpload): Promise<Document> {
    const mutation = `
      mutation UploadBookingDocument($input: DocumentUploadInput!) {
        uploadBookingDocument(input: $input) {
          id
          type
          url
          uploadedAt
          status
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        input: upload
      });

      // Get booking details
      const booking = await this.getBooking(upload.reservationId);

      // Send notification to owner
      await this.notificationService.sendNotification({
        userId: booking.ownerId,
        type: 'DOCUMENT_UPLOADED',
        title: 'Nouveaux documents soumis',
        message: `Le client a soumis des documents pour la réservation`,
        data: {
          bookingId: upload.reservationId,
          propertyId: booking.propertyId,
          documentType: upload.documentType
        }
      });

      // Create activity
      await this.activityService.createActivity({
        clientId: upload.uploadedBy,
        propertyId: booking.propertyId,
        message: `Document ${upload.documentType} téléchargé`,
        isFileRequired: true
      });

      return result.uploadBookingDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Owner approves/rejects documents
  async approveDocuments(approval: DocumentApproval): Promise<{ success: boolean }> {
    const mutation = `
      mutation ApproveDocuments($input: DocumentApprovalInput!) {
        approveDocuments(input: $input) {
          id
          status
          documentsApproved
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        input: approval
      });

      // Get booking details
      const booking = await this.getBooking(approval.reservationId);

      // Send notification to client
      await this.notificationService.sendNotification({
        userId: booking.clientId,
        type: approval.approved ? 'DOCUMENTS_APPROVED' : 'DOCUMENTS_REJECTED',
        title: approval.approved ? 'Documents approuvés' : 'Documents rejetés',
        message: approval.approved
          ? 'Vos documents ont été approuvés. Vous pouvez continuer le processus.'
          : `Vos documents ont été rejetés${approval.reason ? ': ' + approval.reason : ''}`,
        data: {
          bookingId: approval.reservationId,
          propertyId: booking.propertyId,
          approved: approval.approved
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error approving documents:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(payment: PaymentRequest): Promise<{ success: boolean; contractUrl?: string }> {
    const mutation = `
      mutation ProcessPayment($input: PaymentInput!) {
        processPayment(input: $input) {
          id
          status
          paymentCompleted
          contractUrl
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        input: payment
      });

      // Get booking details
      const booking = await this.getBooking(payment.reservationId);

      // Update property availability
      await this.updatePropertyAvailability(booking.propertyId, false);

      // Send notifications to both parties
      await this.sendPaymentConfirmationNotifications(
        booking.ownerId,
        booking.clientId,
        booking.propertyId,
        payment.amount
      );

      // Create activity
      await this.activityService.createActivity({
        clientId: payment.clientId,
        propertyId: booking.propertyId,
        message: `Paiement de ${payment.amount}€ effectué`,
        amount: payment.amount
      });

      return {
        success: true,
        contractUrl: result.processPayment.contractUrl
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Generate contract
  async generateContract(request: ContractRequest): Promise<{ contractUrl: string }> {
    const mutation = `
      mutation GenerateContract($input: ContractInput!) {
        generateContract(input: $input) {
          contractUrl
          bookingId
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        input: request
      });

      // Get booking details
      const booking = await this.getBooking(request.reservationId);

      // Send contract notifications
      await this.sendContractGeneratedNotifications(
        booking.ownerId,
        booking.clientId,
        result.generateContract.contractUrl
      );

      return {
        contractUrl: result.generateContract.contractUrl
      };
    } catch (error) {
      console.error('Error generating contract:', error);
      throw error;
    }
  }

  // Submit to admin for verification (for sale properties)
  async submitForAdminVerification(
    reservationId: string,
    legalInfo: ClientLegalInfo & OwnerLegalInfo
  ): Promise<{ success: boolean }> {
    const mutation = `
      mutation SubmitForAdminVerification($reservationId: ID!, $legalInfo: LegalInfoInput!) {
        submitForAdminVerification(reservationId: $reservationId, legalInfo: $legalInfo) {
          id
          status
        }
      }
    `;

    try {
      await this.graphql.mutate(mutation, {
        reservationId,
        legalInfo
      });

      // Send notification to admin
      await this.notificationService.sendNotification({
        userId: 'admin',
        type: 'ADMIN_VERIFICATION_REQUIRED',
        title: 'Nouvelle demande de vérification',
        message: 'Une nouvelle transaction immobilière nécessite une vérification',
        data: {
          reservationId,
          type: 'sale'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error submitting for admin verification:', error);
      throw error;
    }
  }

  // Admin approves verification
  async adminApproveVerification(
    reservationId: string,
    adminId: string,
    approved: boolean
  ): Promise<{ success: boolean }> {
    const mutation = `
      mutation AdminApproveVerification($reservationId: ID!, $adminId: ID!, $approved: Boolean!) {
        adminApproveVerification(reservationId: $reservationId, adminId: $adminId, approved: $approved) {
          id
          status
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        reservationId,
        adminId,
        approved
      });

      // Get booking details
      const booking = await this.getBooking(reservationId);

      // Send notification to client
      await this.notificationService.sendNotification({
        userId: booking.clientId,
        type: approved ? 'ADMIN_VERIFIED' : 'ADMIN_REJECTED',
        title: approved ? 'Vérification approuvée' : 'Vérification rejetée',
        message: approved
          ? 'Votre dossier a été vérifié et approuvé par nos services'
          : 'Votre dossier a été rejeté. Veuillez contacter le support.',
        data: {
          reservationId,
          approved
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error in admin verification:', error);
      throw error;
    }
  }

  // Request title deed (titre foncier)
  async requestTitleDeed(reservationId: string, clientId: string): Promise<{ success: boolean }> {
    const mutation = `
      mutation RequestTitleDeed($reservationId: ID!, $clientId: ID!) {
        requestTitleDeed(reservationId: $reservationId, clientId: $clientId) {
          id
          status
        }
      }
    `;

    try {
      await this.graphql.mutate(mutation, {
        reservationId,
        clientId
      });

      // Send notification to admin
      await this.notificationService.sendNotification({
        userId: 'admin',
        type: 'TITLE_DEED_REQUESTED',
        title: 'Demande de titre foncier',
        message: 'Un client demande le traitement de son titre foncier',
        data: {
          reservationId,
          clientId
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error requesting title deed:', error);
      throw error;
    }
  }

  // Admin delivers title deed
  async deliverTitleDeed(
    reservationId: string,
    adminId: string,
    titleDeedUrl: string
  ): Promise<{ success: boolean }> {
    const mutation = `
      mutation DeliverTitleDeed($reservationId: ID!, $adminId: ID!, $titleDeedUrl: String!) {
        deliverTitleDeed(reservationId: $reservationId, adminId: $adminId, titleDeedUrl: $titleDeedUrl) {
          id
          status
          titleDeedUrl
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        reservationId,
        adminId,
        titleDeedUrl
      });

      // Get booking details
      const booking = await this.getBooking(reservationId);

      // Send notification to client with download link
      await this.notificationService.sendNotification({
        userId: booking.clientId,
        type: 'TITLE_DEED_READY',
        title: 'Titre foncier disponible',
        message: 'Votre titre foncier est prêt et disponible au téléchargement',
        data: {
          reservationId,
          titleDeedUrl
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error delivering title deed:', error);
      throw error;
    }
  }

  // Get booking by ID
  async getBooking(bookingId: string): Promise<Booking> {
    const query = `
      query GetBooking($id: ID!) {
        booking(id: $id) {
          id
          propertyId
          propertyTitle
          ownerId
          clientId
          startDate
          endDate
          monthlyRent
          salePrice
          depositAmount
          numberOfOccupants
          hasGuarantor
          monthlyIncome
          status
          documentsSubmitted
          documentsApproved
          documents {
            id
            type
            url
            uploadedAt
            status
          }
          visitDate
          visitTime
          visitCompleted
          paymentCompleted
          contractUrl
          titleDeedUrl
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const result = await this.graphql.query(query, { id: bookingId });
      return result.booking;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  // Get user's bookings
  async getUserBookings(userId: string, role: 'client' | 'owner'): Promise<Booking[]> {
    const query = `
      query GetUserBookings($userId: ID!, $role: String!) {
        userBookings(userId: $userId, role: $role) {
          id
          propertyId
          propertyTitle
          ownerId
          clientId
          startDate
          endDate
          monthlyRent
          salePrice
          status
          documentsSubmitted
          documentsApproved
          visitCompleted
          paymentCompleted
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const result = await this.graphql.query(query, { userId, role });
      return result.userBookings;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  // Helper methods
  private async updatePropertyAvailability(propertyId: string, available: boolean): Promise<void> {
    const mutation = `
      mutation UpdatePropertyAvailability($propertyId: ID!, $available: Boolean!) {
        updatePropertyAvailability(propertyId: $propertyId, available: $available) {
          id
          status
        }
      }
    `;

    try {
      await this.graphql.mutate(mutation, {
        propertyId,
        available
      });
    } catch (error) {
      console.error('Error updating property availability:', error);
      throw error;
    }
  }

  private async sendVisitRequestNotification(
    propertyId: string,
    clientId: string,
    visitDate: string,
    visitTime: string
  ): Promise<void> {
    // Get property and owner details
    const property = await this.getPropertyDetails(propertyId);

    await this.notificationService.sendNotification({
      userId: property.ownerId,
      type: 'VISIT_REQUEST',
      title: 'Nouvelle demande de visite',
      message: `Un client souhaite visiter votre propriété le ${visitDate} à ${visitTime}`,
      data: {
        propertyId,
        clientId,
        visitDate,
        visitTime
      }
    });

    // Also send chat message
    const conversation = await this.chatService.createOrGetConversation({
      participantId: property.ownerId,
      type: 'PROPERTY_INQUIRY',
      propertyId
    });

    await this.chatService.sendMessage(conversation.id, {
      content: `Demande de visite pour le ${visitDate} à ${visitTime}`,
      senderId: clientId,
      messageType: 'VISIT_REQUEST',
      metadata: {
        visitDate,
        visitTime,
        propertyId
      }
    });
  }

  private async sendBookingRequestNotification(
    ownerId: string,
    propertyId: string,
    clientId: string,
    bookingId: string
  ): Promise<void> {
    await this.notificationService.sendNotification({
      userId: ownerId,
      type: 'BOOKING_REQUEST',
      title: 'Nouvelle demande de réservation',
      message: 'Un client a soumis une demande de réservation pour votre propriété',
      data: {
        propertyId,
        clientId,
        bookingId
      }
    });
  }

  private async sendPaymentConfirmationNotifications(
    ownerId: string,
    clientId: string,
    propertyId: string,
    amount: number
  ): Promise<void> {
    // Notification to owner
    await this.notificationService.sendNotification({
      userId: ownerId,
      type: 'PAYMENT_RECEIVED',
      title: 'Paiement reçu',
      message: `Le client a effectué le paiement de ${amount}€`,
      data: {
        propertyId,
        amount
      }
    });

    // Notification to client
    await this.notificationService.sendNotification({
      userId: clientId,
      type: 'PAYMENT_CONFIRMED',
      title: 'Paiement confirmé',
      message: `Votre paiement de ${amount}€ a été confirmé avec succès`,
      data: {
        propertyId,
        amount
      }
    });
  }

  private async sendContractGeneratedNotifications(
    ownerId: string,
    clientId: string,
    contractUrl: string
  ): Promise<void> {
    // Notification to both parties
    const notification = {
      type: 'CONTRACT_GENERATED',
      title: 'Contrat généré',
      message: 'Votre contrat est prêt et disponible au téléchargement',
      data: {
        contractUrl
      }
    };

    await this.notificationService.sendNotification({
      userId: ownerId,
      ...notification
    });

    await this.notificationService.sendNotification({
      userId: clientId,
      ...notification
    });
  }

  private async getPropertyDetails(propertyId: string): Promise<any> {
    const query = `
      query GetProperty($id: ID!) {
        property(id: $id) {
          id
          title
          ownerId
          actionType
          price
        }
      }
    `;

    try {
      const result = await this.graphql.query(query, { id: propertyId });
      return result.property;
    } catch (error) {
      console.error('Error getting property details:', error);
      throw error;
    }
  }
}

// Singleton instance
let bookingServiceInstance: BookingService | null = null;

export const getBookingService = (): BookingService => {
  if (!bookingServiceInstance) {
    bookingServiceInstance = new BookingService();
  }
  return bookingServiceInstance;
};

export default BookingService;
