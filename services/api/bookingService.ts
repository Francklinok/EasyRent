import { GraphQLService, getGraphQLService } from './graphqlService';
import { getActivityService } from './activityService';
import { getChatService, ConversationType } from './chatService';
import { getNotificationService, NotificationType } from './notificationService';

// Types
export interface BookingRequest {
  propertyId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  numberOfOccupants: number;
  hasGuarantor: boolean;
  monthlyIncome?: number;
  visitCompleted?: boolean;
  // For sale properties
  budget?: number;
  financingType?: string;
  timeframe?: string;
  currentSituation?: string;
}

export type ActivityStatus =
  | "DRAFT"
  | "PENDING"
  | "ACCEPTED"
  | "REFUSED"
  | "PAYMENT_REQUIRED"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type ActivityType =
  | "INQUIRY"
  | "VISIT"
  | "RESERVATION";

  export interface Activity {
  id: string;
  status: ActivityStatus;
  type: ActivityType;
  message: string;
  createdAt: string;
  updatedAt: string;
  visiteStatus: ActivityStatus;
  reservationStatus: ActivityStatus;
}


export type VisitStatus = 'pending' | 'accepted' | 'rejected' | 'failed';
export type VisitType = 'physical' | 'virtual' | 'self-guided';

export interface VisitRequest {
  propertyId: string;
  clientId: string;
  visitDate: string;
  visitTime: string;
  visitType?: VisitType;
  numberOfVisitors?: number;
  message?: string;
}

export interface VisitResponse {
  success: boolean;
  visitId: string;
  status?: VisitStatus;
  message?: string;
}

export interface VisitStatusResponse {
  visitId: string;
  status: VisitStatus;
  propertyId: string;
  clientId: string;
  visitDate: string;
  visitTime: string;
  visitType: VisitType;
  rejectionReason?: string;
  updatedAt: string;
  
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

  // Generate professional visit request message
  private generateVisitRequestMessage(request: VisitRequest, propertyTitle: string, clientName: string): string {
    const visitDate = new Date(request.visitDate);
    const formattedDate = visitDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const visitTypeText = {
      physical: 'visite physique',
      virtual: 'visite virtuelle',
      'self-guided': 'visite autonome'
    }[request.visitType || 'physical'];

    const visitorsText = request.numberOfVisitors && request.numberOfVisitors > 1
      ? ` (${request.numberOfVisitors} personnes)`
      : '';

    return `📋 **Nouvelle demande de visite**

Bonjour,

Je souhaiterais planifier une ${visitTypeText} pour le bien "${propertyTitle}".

📅 **Date souhaitée :** ${formattedDate}
🕐 **Heure :** ${request.visitTime}${visitorsText}

${request.message ? `💬 **Message :** ${request.message}\n\n` : ''}Merci de me confirmer votre disponibilité pour ce créneau.

Cordialement,
${clientName}`;
  }

  // Generate professional booking/reservation request message
  private generateBookingRequestMessage(
    request: BookingRequest,
    propertyTitle: string,
    clientName: string,
    listType: 'rent' | 'sale'
  ): string {
    const isForSale = listType === 'sale';

    if (isForSale) {
      // Message pour achat
      return `🎯 **Nouvelle manifestation d'intérêt**

Bonjour,

Je suis très intéressé(e) par l'acquisition de votre bien "${propertyTitle}".

💰 **Budget :** ${request.budget?.toLocaleString() || 'À définir'} €
🏦 **Type de financement :** ${request.financingType || 'À définir'}
⏰ **Délai souhaité :** ${request.timeframe || 'Flexible'}
${request.currentSituation ? `\n💬 **Message :**\n${request.currentSituation}\n` : ''}
Je reste à votre disposition pour organiser une visite ou discuter des modalités.

Cordialement,
${clientName}`;
    } else {
      // Message pour location
      const formattedStartDate = new Date(request.startDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const formattedEndDate = new Date(request.endDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      return `🏠 **Nouvelle demande de réservation**

Bonjour,

Je souhaiterais réserver votre bien "${propertyTitle}".

📅 **Période souhaitée :** Du ${formattedStartDate} au ${formattedEndDate}
👥 **Nombre d'occupants :** ${request.numberOfOccupants}
💵 **Revenu mensuel :** ${request.monthlyIncome?.toLocaleString() || 'N/A'} €/mois
🛡️ **Garant :** ${request.hasGuarantor ? 'Oui' : 'Non'}
${request.visitCompleted ? '✅ **Visite effectuée**\n' : ''}
${request.currentSituation ? `\n💬 **Message :**\n${request.currentSituation}\n` : ''}
Je suis disponible pour fournir tous les justificatifs nécessaires et répondre à vos questions.

Cordialement,
${clientName}`;
    }
  }

  // Create a visit request
  async createVisitRequest(
    request: VisitRequest,
    propertyTitle?: string,
    clientName?: string
  ): Promise<{ success: boolean; visitId: string }> {
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
      // Vérifier s'il existe déjà une visite pour cette propriété et ce client
      const existingVisit = await this.getUserVisitForProperty(request.propertyId, request.clientId);
      if (existingVisit) {
        throw new Error('Une demande de visite existe déjà pour cette propriété');
      }

      // Obtenir les détails de la propriété pour récupérer l'ownerId
      const property = await this.getPropertyDetails(request.propertyId);

      // Generate  message
      const professionalMessage = this.generateVisitRequestMessage(
        request,
        propertyTitle || 'la propriété',
        clientName || 'Le client'
      );

      const result = await this.graphql.mutate(mutation, {
        input: {
          propertyId: request.propertyId,
          message: professionalMessage,
          isVisited: true,
          visitDate: request.visitDate
        }
      });

      const visitId = result.createActivity.id;

      // Le backend s'occupe de créer la conversation et d'envoyer le message
      console.log('✅ Demande de visite créée, le backend gère la conversation');

      // Envoyer notification push + in-app au propriétaire
      await this.sendVisitRequestNotification(
        result.createActivity.propertyId,
        request.clientId,
        visitId,
        request.visitDate,
        request.visitTime || '',
        request.visitType || 'physical',
        propertyTitle,
        request.numberOfVisitors,
        request.message
      );

      return {
        success: true,
        visitId
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
    console.log('🔵 respondToVisitRequest called:', { visitId, ownerId, accepted, reason });
    
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.107:3000';
      const endpoint = accepted ? 'accept' : 'reject';
      const url = `${apiUrl}/api/visits/${visitId}/${endpoint}`;
      
      console.log('🔵 Fetching:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, ownerId })
      });

      console.log('🔵 Response status:', response.status);
      
      const result = await response.json();
      console.log('🔵 Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to respond to visit request');
      }

      return { success: result.success };
    } catch (error) {
      console.error('❌ Error responding to visit request:', error);
      throw error;
    }
  }

  // Get visit request status
  async getVisitRequestStatus(visitId: string, propertyId: string): Promise<VisitStatusResponse | null> {
    const query = `
      query GetVisitRequestStatus($visitId: ID!, $propertyId: ID!) {
        getVisitRequestStatus(visitId: $visitId, propertyId: $propertyId) {
          status
          rejectionReason
          visitDate
          message
        }
      }
    `;

    try {
      const result = await this.graphql.query(query, {
        visitId,
        propertyId
      });

      if (!result.getVisitRequestStatus) {
        return null;
      }

      return {
        visitId,
        status: result.getVisitRequestStatus.status as VisitStatus,
        propertyId,
        clientId: '', // Not returned by this query
        visitDate: result.getVisitRequestStatus.visitDate,
        visitTime: '', // Not returned by this query
        visitType: 'physical' as VisitType, // Default
        rejectionReason: result.getVisitRequestStatus.rejectionReason,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting visit status:', error);
      return null;
    }
  }

  async getPropertyActivityService (propertyId:string):Promise<Activity[]|null> {
    const query = `query GetPropertyActivity($propertyId: ID!) {
      getPropertyActivity(propertyId: $propertyId) {
       id
      status
      type
      message
      createdAt
      updatedAt
      visiteStatus
      reservationStatus
     }} `
   try{
    const result = await this.graphql.query(query, {propertyId})
    if(!result.getPropertyActivity){
      return [];
    }
    return result.getPropertyActivity;
   } catch (error) {
    console.error('Error fetching property activity:', error);
    return [];
   }
  }

  // Get user's existing visit for a property
  async getUserVisitForProperty(propertyId: string, clientId: string): Promise<any | null> {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  getUserVisitForProperty - DÉBUT                          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('📍 PropertyId:', propertyId);
    console.log('👤 ClientId:', clientId);

    try {

      const query = `
        query GetUserVisitForProperty($propertyId: ID!, $userId: ID!) {
          getUserVisitForProperty(propertyId: $propertyId, userId: $userId) {
            id
            propertyId
            clientId
            isVisited
            isVisiteAccepted
            status
            visitDate
            message
            rejectionReason
            createdAt
            updatedAt
          }
        }
      `;

      try {
        const result = await this.graphql.query(query, {
          propertyId,
          userId: clientId
        });

        if (result.getUserVisitForProperty) {
          return result.getUserVisitForProperty;
        } else {
          console.log('⚠️ GraphQL OK mais aucun résultat');
        }
      } catch (graphqlError: any) {
        console.log('❌ ÉCHEC GraphQL');
        console.log('Erreur:', graphqlError.message || graphqlError);
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.107:3000';
      const url = `${apiUrl}/api/visits/user/${clientId}/property/${propertyId}`;

      console.log('📡 URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📥 Status HTTP:', response.status);

      if (response.ok) {
        const visit = await response.json();
        console.log('📦 Réponse brute:', JSON.stringify(visit, null, 2));

        if (visit && !visit.error) {
          return visit;
        } else {
          console.log('⚠️ REST OK mais données vides ou erreur');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ ÉCHEC REST - Status:', response.status);
        console.log('⚠️  Cet endpoint n\'existe probablement pas sur votre backend');
        console.log('💡 Solution: Le backend doit utiliser GraphQL uniquement');
      }

      return null;
    } catch (error: any) {
      return null;
    }
  }

  // Check for time slot conflicts
  async checkTimeSlotConflict(
    propertyId: string,
    visitDate: string,
    visitTime: string
  ): Promise<{ hasConflict: boolean; conflictingVisitId?: string }> {
    const query = `
      query CheckTimeSlotConflict($propertyId: ID!, $visitDate: String!) {
        checkVisitTimeSlot(propertyId: $propertyId, visitDate: $visitDate)
      }
    `;

    try {
      const result = await this.graphql.query(query, {
        propertyId,
        visitDate
      });

      // checkVisitTimeSlot returns true if available, false if conflict exists
      // We need to invert it for hasConflict
      return {
        hasConflict: !result.checkVisitTimeSlot
      };
    } catch (error) {
      console.error('Error checking time slot conflict:', error);
      // En cas d'erreur, on suppose qu'il n'y a pas de conflit pour ne pas bloquer l'utilisateur
      return { hasConflict: false };
    }
  }

  // Get available time slots for a property on a specific date
  async getAvailableTimeSlots(propertyId: string, visitDate: string): Promise<string[]> {
    const query = `
      query GetAvailableTimeSlots($propertyId: ID!, $visitDate: String!) {
        getAvailableVisitSlots(propertyId: $propertyId, visitDate: $visitDate) {
          availableSlots
        }
      }
    `;

    try {
      const result = await this.graphql.query(query, {
        propertyId,
        visitDate
      });

      return result.getAvailableVisitSlots.availableSlots || [];
    } catch (error) {
      console.error('Error getting available time slots:', error);
      // Retourner des créneaux par défaut en cas d'erreur
      return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    }
  }

  // Create a booking/reservation
  async createBooking(
    request: BookingRequest,
    propertyTitle?: string,
    clientName?: string,
    listType?: 'rent' | 'sale'
  ): Promise<Booking> {
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
      // Déterminer les valeurs finales sans appel API si possibles
      const finalPropertyTitle = propertyTitle || 'la propriété';
      const finalClientName = clientName || 'Le client';
      const finalListType = listType || (request.budget && request.budget > 0 ? 'sale' : 'rent');

      // Generate professional message
      const professionalMessage = this.generateBookingRequestMessage(
        request,
        finalPropertyTitle,
        finalClientName,
        finalListType
      );

      console.log('📝 Message de réservation généré:', professionalMessage);

      const result = await this.graphql.mutate(mutation, {
        input: {
          propertyId: request.propertyId,
          message: professionalMessage,
          reservationDate: request.startDate,
          uploadedFiles: []
        }
      });

      const activity = result.createBooking;

      // Le backend s'occupe de créer la conversation et d'envoyer le message
      console.log('✅ Réservation créée, le backend gère la conversation et le message chat');

      // Map Activity to Booking
      const booking: Booking = {
        id: activity.id,
        propertyId: activity.propertyId,
        propertyTitle: finalPropertyTitle,
        ownerId: '', // Will be populated below
        clientId: activity.clientId,
        startDate: request.startDate,
        endDate: request.endDate,
        monthlyRent: request.budget, // Temporary
        depositAmount: 0,
        numberOfOccupants: request.numberOfOccupants,
        hasGuarantor: request.hasGuarantor,
        monthlyIncome: request.monthlyIncome ?? 0,
        status: 'pending',
        documentsSubmitted: false,
        documentsApproved: false,
        visitCompleted: request.visitCompleted || false,
        paymentCompleted: false,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt
      };

      // Get property details only for ownerId (needed for notification)
      try {
        const property = await this.getPropertyDetails(request.propertyId);
        booking.ownerId = property.ownerId;

        // Update propertyTitle if it wasn't provided
        if (!propertyTitle && property.title) {
          booking.propertyTitle = property.title;
        }

        // Send notification to owner
        await this.sendBookingRequestNotification(
          property.ownerId,
          request.propertyId,
          request.clientId,
          activity.id
        );
      } catch (propertyError) {
        console.error('⚠️ Erreur récupération détails propriété (notification non envoyée):', propertyError);
        // Ne pas bloquer la création de la réservation si l'appel échoue
        // La réservation est déjà créée, seule la notification échoue
        booking.ownerId = 'unknown';
      }

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
      await this.notificationService.sendNotification(
        booking.ownerId,
        {
          type: NotificationType.BOOKING_REQUEST,
          title: 'Nouveaux documents soumis',
          message: `Le client a soumis des documents pour la réservation`,
          data: {
            bookingId: upload.reservationId,
            propertyId: booking.propertyId,
            documentType: upload.documentType
          }
        }
      );

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
      await this.notificationService.sendNotification(
        booking.clientId,
        {
          type: NotificationType.BOOKING_CONFIRMED,
          title: approval.approved ? 'Documents approuvés' : 'Documents rejetés',
          message: approval.approved
            ? 'Vos documents ont été approuvés. Vous pouvez continuer le processus.'
            : `Vos documents ont été rejetés${approval.reason ? ': ' + approval.reason : ''}`,
          data: {
            bookingId: approval.reservationId,
            propertyId: booking.propertyId,
            approved: approval.approved
          }
        }
      );

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
      await this.notificationService.sendNotification(
        'admin',
        {
          type: NotificationType.BOOKING_REQUEST,
          title: 'Nouvelle demande de vérification',
          message: 'Une nouvelle transaction immobilière nécessite une vérification',
          data: {
            reservationId,
            type: 'sale'
          }
        }
      );

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
      await this.notificationService.sendNotification(
        booking.clientId,
        {
          type: NotificationType.BOOKING_CONFIRMED,
          title: approved ? 'Vérification approuvée' : 'Vérification rejetée',
          message: approved
            ? 'Votre dossier a été vérifié et approuvé par nos services'
            : 'Votre dossier a été rejeté. Veuillez contacter le support.',
          data: {
            reservationId,
            approved
          }
        }
      );

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
      await this.notificationService.sendNotification(
        'admin',
        {
          type: NotificationType.BOOKING_REQUEST,
          title: 'Demande de titre foncier',
          message: 'Un client demande le traitement de son titre foncier',
          data: {
            reservationId,
            clientId
          }
        }
      );

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
      await this.notificationService.sendNotification(
        booking.clientId,
        {
          type: NotificationType.BOOKING_CONFIRMED,
          title: 'Titre foncier disponible',
          message: 'Votre titre foncier est prêt et disponible au téléchargement',
          data: {
            reservationId,
            titleDeedUrl
          }
        }
      );

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

  // Get user's booking for a specific property (check if exists on server)
  async getUserBookingForProperty(propertyId: string, userId: string): Promise<any | null> {
    console.log('🔍 [BookingService] Checking server for existing booking:', { propertyId, userId });

    try {
      // Use the same query as getUserVisitForProperty but filter for reservations
      const query = `
        query GetUserBookingForProperty($propertyId: ID!, $userId: ID!) {
          getUserVisitForProperty(propertyId: $propertyId, userId: $userId) {
            id
            propertyId
            clientId
            isReservation
            isReservationAccepted
            status
            message
            reservationDate
            createdAt
            updatedAt
          }
        }
      `;

      const result = await this.graphql.query(query, {
        propertyId,
        userId
      });

      // Only return if it's actually a reservation (not a visit)
      if (result.getUserVisitForProperty && result.getUserVisitForProperty.isReservation) {
        console.log('✅ [BookingService] Booking found on server:', result.getUserVisitForProperty);
        return result.getUserVisitForProperty;
      }

      console.log('ℹ️ [BookingService] No booking found on server');
      return null;
    } catch (error) {
      console.error('❌ [BookingService] Error checking booking:', error);
      return null;
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
    visitId: string,
    visitDate: string,
    visitTime: string,
    visitType: VisitType,
    propertyTitle?: string,
    numberOfVisitors?: number,
    clientMessage?: string
  ): Promise<void> {
    try {
      // Get property and owner details
      const property = await this.getPropertyDetails(propertyId);

      // Format date professionally
      const formattedDate = new Date(visitDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const visitTypeText = {
        physical: 'visite physique',
        virtual: 'visite virtuelle',
        'self-guided': 'visite autonome'
      }[visitType];

      const visitorsText = numberOfVisitors && numberOfVisitors > 1
        ? ` (${numberOfVisitors} personnes)`
        : '';

      const notificationMessage = `${visitTypeText} demandée pour "${propertyTitle || 'votre propriété'}" le ${formattedDate} à ${visitTime}${visitorsText}`;

      // Send comprehensive notification (push + in-app)
      await this.notificationService.sendNotification(
        property.ownerId,
        {
          type: NotificationType.VISIT_SCHEDULED,
          title: '📅 Nouvelle demande de visite',
          message: notificationMessage,
          priority: 'high', // Priorité haute pour les visites
          propertyId,
          propertyTitle,
          data: {
            visitId,
            propertyId,
            clientId,
            visitDate,
            visitTime,
            visitType,
            numberOfVisitors,
            propertyTitle,
            clientMessage,
            // Type de notification pour la gestion côté app
            notificationType: 'visit_request',
            // Actions disponibles dans la notification
            actions: [
              {
                id: 'accept',
                title: 'Accepter',
                type: 'success'
              },
              {
                id: 'reject',
                title: 'Refuser',
                type: 'destructive'
              },
              {
                id: 'view_details',
                title: 'Voir détails',
                type: 'default'
              }
            ]
          }
        }
      );

      console.log('✅ Notification push + in-app envoyée au propriétaire');
    } catch (error) {
      console.error('Error sending visit request notification:', error);
      // Don't throw - notification failure shouldn't break visit creation
    }
  }

  private async sendBookingRequestNotification(
    ownerId: string,
    propertyId: string,
    clientId: string,
    bookingId: string
  ): Promise<void> {
    await this.notificationService.sendNotification(
      ownerId,
      {
        type: NotificationType.BOOKING_REQUEST,
        title: 'Nouvelle demande de réservation',
        message: 'Un client a soumis une demande de réservation pour votre propriété',
        data: {
          propertyId,
          clientId,
          bookingId
        }
      }
    );
  }

  private async sendPaymentConfirmationNotifications(
    ownerId: string,
    clientId: string,
    propertyId: string,
    amount: number
  ): Promise<void> {
    // Notification to owner
    await this.notificationService.sendNotification(
      ownerId,
      {
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Paiement reçu',
        message: `Le client a effectué le paiement de ${amount}€`,
        data: {
          propertyId,
          amount
        }
      }
    );

    // Notification to client
    await this.notificationService.sendNotification(
      clientId,
      {
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Paiement confirmé',
        message: `Votre paiement de ${amount}€ a été confirmé avec succès`,
        data: {
          propertyId,
          amount
        }
      }
    );
  }

  private async sendContractGeneratedNotifications(
    ownerId: string,
    clientId: string,
    contractUrl: string
  ): Promise<void> {
    // Notification to both parties
    await this.notificationService.sendNotification(
      ownerId,
      {
        type: NotificationType.CONTRACT_GENERATED,
        title: 'Contrat généré',
        message: 'Votre contrat est prêt et disponible au téléchargement',
        data: {
          contractUrl
        }
      }
    );

    await this.notificationService.sendNotification(
      clientId,
      {
        type: NotificationType.CONTRACT_GENERATED,
        title: 'Contrat généré',
        message: 'Votre contrat est prêt et disponible au téléchargement',
        data: {
          contractUrl
        }
      }
    );
  }

  // Get owner's pending requests (visits + reservations)
  async getOwnerRequests(ownerId: string): Promise<any[]> {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL 
      const response = await fetch(`${apiUrl}/api/visits/owner/${ownerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch owner requests');
      }

      const visits = await response.json();
      return visits || [];
    } catch (error) {
      console.error('Error getting owner requests:', error);
      return [];
    }
  }

  async getPropertyDetails(propertyId: string): Promise<any> {
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

  /**
   * Accepte une demande de visite
   * @param visitId - ID de la visite
   * @param propertyId - ID de la propriété
   * @param ownerId - ID du propriétaire
   */
  async acceptVisitRequest(visitId: string, propertyId: string, ownerId: string): Promise<{success: boolean, message: string}> {
    const mutation = `
      mutation UpdateActivityStatus($id: ID!, $status: ActivityStatus!) {
        updateActivityStatus(id: $id, status: $status) {
          id
          status
          isVisiteAccepted
          updatedAt
        }
      }
    `;

    try {
      console.log('🟢 Acceptation de la visite:', { visitId, propertyId, ownerId });

      const result = await this.graphql.mutate(mutation, {
        id: visitId,
        status: 'ACCEPTED'
      });

      if (result.updateActivityStatus) {
        console.log('✅ Visite acceptée avec succès:', result.updateActivityStatus);

        // Backend handles automatically:
        // 1. Sends push notification to client via IntegratedNotificationService
        // 2. Emits Socket.IO 'visit:updated' event for real-time update
        // 3. Sends chat message to conversation

        return {
          success: true,
          message: 'Visite acceptée avec succès'
        };
      }

      return {
        success: false,
        message: 'Erreur lors de l\'acceptation'
      };

    } catch (error) {
      console.error('❌ Erreur acceptation visite:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'acceptation de la visite'
      };
    }
  }

  /**
   * Refuse une demande de visite
   * @param visitId - ID de la visite
   * @param propertyId - ID de la propriété
   * @param ownerId - ID du propriétaire
   * @param reason - Raison du refus (optionnel)
   */
  async rejectVisitRequest(visitId: string, propertyId: string, ownerId: string, reason?: string): Promise<{success: boolean, message: string}> {
    const mutation = `
      mutation UpdateActivityStatus($id: ID!, $status: ActivityStatus!, $reason: String) {
        updateActivityStatus(id: $id, status: $status, reason: $reason) {
          id
          status
          isVisiteAccepted
          updatedAt
        }
      }
    `;

    try {
      console.log('🔴 Refus de la visite:', { visitId, propertyId, ownerId, reason });

      const result = await this.graphql.mutate(mutation, {
        id: visitId,
        status: 'REFUSED',
        reason: reason || undefined
      });

      if (result.updateActivityStatus) {
        console.log('✅ Visite refusée avec succès:', result.updateActivityStatus);

        // Backend handles automatically:
        // 1. Sends push notification to client via IntegratedNotificationService
        // 2. Emits Socket.IO 'visit:updated' event for real-time update
        // 3. Sends chat message to conversation

        return {
          success: true,
          message: 'Visite refusée'
        };
      }

      return {
        success: false,
        message: 'Erreur lors du refus'
      };

    } catch (error) {
      console.error('❌ Erreur refus visite:', error);
      return {
        success: false,
        message: 'Erreur lors du refus de la visite'
      };
    }
  }

  /**
   * Répond à une demande de réservation (accepter/refuser)
   * @param bookingId - ID de la réservation
   * @param ownerId - ID du propriétaire
   * @param accepted - true pour accepter, false pour refuser
   * @param reason - Raison du refus (optionnel)
   */
  async respondToBookingRequest(
    bookingId: string,
    ownerId: string,
    accepted: boolean,
    reason?: string
  ): Promise<{ success: boolean }> {
    console.log('🔵 respondToBookingRequest called:', { bookingId, ownerId, accepted, reason });

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.107:3000';
      const endpoint = accepted ? 'accept' : 'reject';
      const url = `${apiUrl}/api/bookings/${bookingId}/${endpoint}`;

      console.log('🔵 Fetching:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, ownerId })
      });

      console.log('🔵 Response status:', response.status);

      const result = await response.json();
      console.log('🔵 Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to respond to booking request');
      }

      return { success: result.success };
    } catch (error) {
      console.error('❌ Error responding to booking request:', error);
      throw error;
    }
  }

  /**
   * Envoie un message chat avec les détails de la réservation au propriétaire
   * @param propertyId - ID de la propriété
   * @param ownerId - ID du propriétaire
   * @param clientId - ID du client
   * @param bookingData - Données de la réservation
   */
  async sendBookingRequestChatMessage(
    propertyId: string,
    ownerId: string,
    clientId: string,
    bookingData: {
      id: string;
      startDate?: string;
      endDate?: string;
      numberOfOccupants?: number;
      monthlyIncome?: number;
      hasGuarantor?: boolean;
      budget?: number;
      financingType?: string;
      timeframe?: string;
      clientMessage?: string;
      listType?: 'rent' | 'sale';
      propertyTitle?: string;
      propertyPrice?: number;
      clientName?: string;
    }
  ): Promise<void> {
    try {
      const chatService = getChatService();
      const isForSale = bookingData.listType === 'sale';

      console.log('🔵 Envoi du message de réservation au propriétaire');

      // Créer ou récupérer la conversation
      const conversation = await chatService.createOrGetConversation({
        participantId: ownerId,
        type: ConversationType.PROPERTY_INQUIRY,
        propertyId: propertyId
      });

      console.log('✅ Conversation créée/récupérée:', conversation.id);

      // Construire le message texte
      let messageText = isForSale
        ? `🎯 Nouvelle manifestation d'intérêt pour votre propriété "${bookingData.propertyTitle}"!\n\n`
        : `🏠 Nouvelle demande de réservation pour votre propriété "${bookingData.propertyTitle}"!\n\n`;

      messageText += `👤 Client: ${bookingData.clientName || 'Client'}\n\n`;

      if (isForSale) {
        messageText += `💰 Budget: ${bookingData.budget?.toLocaleString() || 'N/A'} €\n`;
        messageText += `🏦 Financement: ${bookingData.financingType || 'Non spécifié'}\n`;
        messageText += `⏰ Délai: ${bookingData.timeframe || 'Non spécifié'}\n`;
      } else {
        messageText += `📅 Période: ${new Date(bookingData.startDate || '').toLocaleDateString('fr-FR')} - ${new Date(bookingData.endDate || '').toLocaleDateString('fr-FR')}\n`;
        messageText += `👥 Occupants: ${bookingData.numberOfOccupants || 1}\n`;
        messageText += `💵 Revenu: ${bookingData.monthlyIncome?.toLocaleString() || 'N/A'} €/mois\n`;
        messageText += `🛡️ Garant: ${bookingData.hasGuarantor ? 'Oui' : 'Non'}\n`;
      }

      if (bookingData.clientMessage) {
        messageText += `\n💬 Message du client:\n"${bookingData.clientMessage}"`;
      }

      messageText += `\n\nVous pouvez accepter ou refuser cette demande ci-dessous.`;

      // Envoyer le message avec les données de réservation
      await chatService.sendMessage({
        conversationId: conversation.id,
        content: messageText,
        messageType: 'TEXT' as any,
        // @ts-ignore - propriétés personnalisées
        bookingData: {
          id: bookingData.id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          numberOfOccupants: bookingData.numberOfOccupants,
          monthlyIncome: bookingData.monthlyIncome,
          hasGuarantor: bookingData.hasGuarantor,
          budget: bookingData.budget,
          financingType: bookingData.financingType,
          timeframe: bookingData.timeframe,
          status: 'pending'
        },
        propertyData: {
          title: bookingData.propertyTitle || '',
          address: '',
          price: bookingData.propertyPrice,
          listType: bookingData.listType
        }
      });

      console.log('✅ Message de réservation envoyé au propriétaire');
    } catch (error) {
      console.error('❌ Erreur envoi message chat de réservation:', error);
      // Ne pas throw - l'échec du message ne doit pas bloquer la réservation
    }
  }

  /**
   * Accepter une demande de réservation
   */
  async acceptReservation(reservationId: string): Promise<any> {
    const mutation = `
      mutation AcceptReservation($activityId: ID!) {
        acceptReservation(activityId: $activityId) {
          id
          status
          isReservationAccepted
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        activityId: reservationId
      });
      console.log('✅ Réservation acceptée:', result.acceptReservation);
      return result.acceptReservation;
    } catch (error) {
      console.error('❌ Erreur acceptation réservation:', error);
      throw error;
    }
  }

  /**
   * Refuser une demande de réservation
   */
  async rejectReservation(reservationId: string, reason: string): Promise<any> {
    const mutation = `
      mutation RefuseReservation($activityId: ID!, $reason: String!) {
        refuseReservation(activityId: $activityId, reason: $reason) {
          id
          status
          isReservationAccepted
          reason
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        activityId: reservationId,
        reason
      });
      console.log('✅ Réservation refusée:', result.refuseReservation);
      return result.refuseReservation;
    } catch (error) {
      console.error('❌ Erreur refus réservation:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique complet des activités de l'utilisateur
   */
  async getUserActivities(userId: string): Promise<any[]> {
    const query = `
      query GetUserActivities($userId: ID!) {
        getUserActivities(userId: $userId) {
          id
          propertyId
          propertyTitle
          propertyImage
          visitStatus
          visitId
          reservationStatus
          reservationId
          paymentStatus
          paymentId
          updatedAt
          currentStep
        }
      }
    `;

    try {
      // Note: currentStep n'est pas dans le schéma backend, mais on le calcule côté client
      // On demande les autres champs
      const queryNoStep = `
        query GetUserActivities($userId: ID!) {
          getUserActivities(userId: $userId) {
            id
            propertyId
            propertyTitle
            propertyImage
            visitStatus
            visitId
            reservationStatus
            reservationId
            paymentStatus
            paymentId
            updatedAt
          }
        }
      `;
      
      const response = await this.graphql.query(queryNoStep, { userId });
      return response.getUserActivities || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
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

