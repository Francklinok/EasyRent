// Types for contract

// Type for a property
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
    estimatedValue?:number;
  }
  
  // Type for a user (owner or tenant)
  export interface User {
    fullName: string;
    email: string;
    phone: string;
    id?: string;
    address?: string;
    idNumber?: string;
    birthDate?: string;
  }
  
  // Possible status for a reservation
  export type ReservationStatus = 
    | 'pending' 
    | 'payment_completed' 
    | 'contract_generated' 
    | 'contract_signed' 
    | 'active' 
    | 'completed' 
    | 'cancelled';
  
  // Type for a reservation
  export interface Reservation {
    propertyId: string;
    landlordId: string;
    tenantId: string;
    startDate: Date | any; // Timestamp or Date
    endDate: Date | any; // Timestamp or Date
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
  
  // Type for payment history
  export interface PaymentRecord {
    id: string;
    date: Date;
    amount: number;
    type: 'rent' | 'deposit' | 'fees' | 'repair';
    status: 'pending' | 'completed' | 'failed';
  }
  
  // Type for QR code parameters
  export interface QRCodeParams {
    contractId: string;
    propertyTitle: string;
    tenantName: string;
    startDate: string;
    endDate: string;
  }
  
  // Type for contract HTML generation parameters
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
  