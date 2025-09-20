export interface ContractTemplate {
  id: string;
  type: ContractType;
  name: string;
  description: string;
  template: string;
  variables: ContractVariable[];
  legalClauses: LegalClause[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'email' | 'phone';
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface LegalClause {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
  order: number;
}

export enum ContractType {
  RENTAL = 'rental',
  PURCHASE = 'purchase',
  LEASE = 'lease',
  SUBLEASE = 'sublease',
  COMMERCIAL_RENTAL = 'commercial_rental',
  VACATION_RENTAL = 'vacation_rental',
  RESERVATION = 'reservation'
}

export interface ContractData {
  id: string;
  templateId: string;
  type: ContractType;
  status: ContractStatus;
  parties: ContractParty[];
  variables: Record<string, any>;
  property?: Property;
  reservation?: Reservation;
  generatedFileUri?: string;
  signedFileUri?: string;
  qrCodeData?: string;
  watermarkData?: string;
  aiAnalysis?: {
    riskScore: number;
    complianceScore: number;
    marketAnalysis: string;
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
  expiresAt?: Date;
}

export enum ContractStatus {
  DRAFT = 'draft',
  GENERATED = 'generated',
  PENDING_SIGNATURE = 'pending_signature',
  SIGNED = 'signed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface ContractParty {
  id: string;
  role: PartyRole;
  user: User;
  signedAt?: Date;
  signature?: string;
  ipAddress?: string;
}

export enum PartyRole {
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  BUYER = 'buyer',
  SELLER = 'seller',
  AGENT = 'agent',
  GUARANTOR = 'guarantor'
}

export interface ContractGenerationRequest {
  templateId: string;
  type: ContractType;
  propertyId?: string;
  reservationId?: string;
  parties: {
    role: PartyRole;
    userId: string;
  }[];
  variables: Record<string, any>;
  autoGenerate?: boolean;
}

export interface ContractSigningRequest {
  contractId: string;
  partyId: string;
  signature: string;
  signedAt: Date;
  ipAddress: string;
  deviceInfo?: string;
}

// Import types existants
export interface Property {
  id: string;
  title: string;
  address: string;
  type: string;
  surface: number;
  rooms: number;
  depositAmount: number;
  [key: string]: any;
}

export interface Reservation {
  propertyId: string;
  landlordId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  status: string;
  [key: string]: any;
}

export interface User {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  [key: string]: any;
}