// Types pour le contrat

// Type pour une propriété
export interface Property {
    id:string,
    title: string;
    address: string;
    type: string;
    surface: number;
    rooms: number;
    depositAmount: number;
    amenities?: string[];
    energyRating?: string;
    yearBuilt?: number;
    rentalPrice?:number;
    securityDeposit?:number;
  }
  
  // Type pour un utilisateur (propriétaire ou locataire)
  export interface User {
    fullName: string;
    email: string;
    phone: string;
    id?: string;
    address?: string;
    idNumber?: string;
    birthDate?: string;
  }
  
  // Statut possible pour une réservation
  export type ReservationStatus = 
    | 'pending' 
    | 'payment_completed' 
    | 'contract_generated' 
    | 'contract_signed' 
    | 'active' 
    | 'completed' 
    | 'cancelled';
  
  // Type pour une réservation
  export interface Reservation {
    propertyId: string;
    landlordId: string;
    tenantId: string;
    startDate: Date | any; // Timestamp ou Date
    endDate: Date | any; // Timestamp ou Date
    monthlyRent: number;
    status: ReservationStatus;
    contractFileUri?: string;
    contractGenerationDate?: string;
    paymentHistory?: PaymentRecord[];
    includesUtilities?: boolean;
    hasInsurance?: boolean;
    notes?: string;
    signatureDate?: string;
  }
  
  // Type pour un historique de paiement
  export interface PaymentRecord {
    id: string;
    date: Date;
    amount: number;
    type: 'rent' | 'deposit' | 'fees' | 'repair';
    status: 'pending' | 'completed' | 'failed';
  }
  
  // Type pour les paramètres du code QR
  export interface QRCodeParams {
    contractId: string;
    propertyTitle: string;
    tenantName: string;
    startDate: string;
    endDate: string;
  }
  
  // Type pour les paramètres de génération du contrat HTML
  // export interface ContractHTMLParams {
  //   contractId: string;
  //   reservation: Reservation;
  //   property: Property;
  //   landlord: User;
  //   tenant: User;
  //   qrCodeSVG: string;
  //   watermarkSVG: string;
  //   formatDate: (date: any) => Date;
  // }
  
  // Type pour les paramètres des composants d'action
  export interface ContractActionProps {
    generateContract: () => Promise<string | null>;
    viewContract: () => Promise<void>;
    shareContract: () => Promise<void>;
    regenerateContract: () => Promise<void>;
    contractFileUri: string | null;
    generating: boolean;
  }
  export interface ContractHTMLParams {
    contractId: string;
    reservation: Reservation;
    property: Property;
    landlord: User;
    tenant: User;
    qrCodeSVG: string;
    watermarkSVG: string;
    formatDate: (date: any) => string;
    additionalClauses?: string[];
    includeDigitalSignature?: boolean;
    includeBlockchainVerification?: boolean;
    includeSmartContractTerms?: boolean;
    includeAIAssistance?: boolean;
    includeVirtualTour?: boolean;
    includeSustainabilityReport?: boolean;
    includeEnergyEfficiencyRating?: boolean;
  }
  