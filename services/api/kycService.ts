/**
 * KYC Service — Frontend connecté au microservice KYC du backend_easyrent
 * Utilise GraphQL via graphqlService
 */

import { getGraphQLService } from './graphqlService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type KYCStatus =
  | 'unverified'
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'suspended';

export type KYCLevel = 'basic' | 'standard' | 'enhanced' | 'premium';
export type KYCDocumentType =
  | 'national_id'
  | 'passport'
  | 'drivers_license'
  | 'residence_permit'
  | 'utility_bill'
  | 'bank_statement'
  | 'other';

export type KYCDocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'requires_resubmission';

export interface KYCProgress {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  addressVerified: boolean;
  livenessVerified: boolean;
  overallProgress: number;
}

export interface KYCDocument {
  id: string;
  type: KYCDocumentType;
  status: KYCDocumentStatus;
  documentNumber?: string;
  issuingCountry: string;
  frontImageUrl: string;
  backImageUrl?: string;
  selfieImageUrl?: string;
  uploadedAt: string;
  rejectionReason?: string;
}

export interface KYCPersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phoneNumber: string;
  occupation?: string;
}

export interface KYCStatusResponse {
  status: KYCStatus;
  verificationLevel: KYCLevel;
  progress: KYCProgress;
  nextSteps: string[];
  estimatedReviewTime?: string;
  expiresAt?: string;
}

export interface KYCVerificationResult {
  success: boolean;
  status: KYCStatus;
  verificationLevel: KYCLevel;
  message: string;
  errors?: string[];
  nextSteps?: string[];
}

export interface KYCDocumentUploadResponse {
  documentId: string;
  status: KYCDocumentStatus;
  message: string;
}

export interface SimpleVerificationStatus {
  status: KYCStatus;
  level: KYCLevel;
  isVerified: boolean;
}

// ─── GraphQL Queries/Mutations ────────────────────────────────────────────────

const GET_MY_KYC_STATUS = `
  query GetMyKYCStatus {
    myKYCStatus {
      status
      verificationLevel
      progress {
        emailVerified
        phoneVerified
        identityVerified
        addressVerified
        livenessVerified
        overallProgress
      }
      nextSteps
      estimatedReviewTime
      expiresAt
    }
  }
`;

const GET_SIMPLE_VERIFICATION_STATUS = `
  query GetSimpleVerificationStatus {
    mySimpleVerificationStatus {
      status
      level
      isVerified
    }
  }
`;

const GET_MY_KYC_VERIFICATION = `
  query GetMyKYCVerification {
    myKYCVerification {
      id
      userId
      status
      verificationLevel
      riskLevel
      personalInfo {
        firstName
        lastName
        dateOfBirth
        nationality
        gender
        phoneNumber
        occupation
      }
      documents {
        id
        type
        status
        documentNumber
        issuingCountry
        frontImageUrl
        backImageUrl
        selfieImageUrl
        uploadedAt
        rejectionReason
      }
      progress {
        emailVerified
        phoneVerified
        identityVerified
        addressVerified
        livenessVerified
        overallProgress
      }
      submittedAt
      verifiedAt
      expiresAt
      isExpired
      daysUntilExpiry
    }
  }
`;

const CHECK_USER_VERIFIED = `
  query CheckUserVerified($userId: ID!) {
    isUserVerified(userId: $userId)
  }
`;

const SUBMIT_KYC_PERSONAL_INFO = `
  mutation SubmitKYCPersonalInfo($input: SubmitKYCPersonalInfoInput!) {
    submitKYCPersonalInfo(input: $input) {
      success
      status
      verificationLevel
      message
      errors
      nextSteps
    }
  }
`;

const SUBMIT_KYC_DOCUMENT = `
  mutation SubmitKYCDocument($input: SubmitKYCDocumentInput!) {
    submitKYCDocument(input: $input) {
      documentId
      status
      message
    }
  }
`;

const SUBMIT_KYC_ADDRESS = `
  mutation SubmitKYCAddress($input: SubmitKYCAddressInput!) {
    submitKYCAddress(input: $input) {
      success
      status
      verificationLevel
      message
      errors
      nextSteps
    }
  }
`;

// ─── Service Class ────────────────────────────────────────────────────────────

class KYCService {
  private gql = getGraphQLService();

  async getMyKYCStatus(): Promise<KYCStatusResponse> {
    const data = await this.gql.query<{ myKYCStatus: KYCStatusResponse }>(
      GET_MY_KYC_STATUS
    );
    return data.myKYCStatus;
  }

  async getSimpleVerificationStatus(): Promise<SimpleVerificationStatus> {
    const data = await this.gql.query<{ mySimpleVerificationStatus: SimpleVerificationStatus }>(
      GET_SIMPLE_VERIFICATION_STATUS
    );
    return data.mySimpleVerificationStatus;
  }

  async getMyKYCVerification(): Promise<any> {
    const data = await this.gql.query<{ myKYCVerification: any }>(
      GET_MY_KYC_VERIFICATION
    );
    return data.myKYCVerification;
  }

  async isUserVerified(userId: string): Promise<boolean> {
    const data = await this.gql.query<{ isUserVerified: boolean }>(
      CHECK_USER_VERIFIED,
      { userId }
    );
    return data.isUserVerified;
  }

  async submitPersonalInfo(input: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    gender: string;
    phoneNumber: string;
    occupation?: string;
    employer?: string;
  }): Promise<KYCVerificationResult> {
    const data = await this.gql.mutate<{ submitKYCPersonalInfo: KYCVerificationResult }>(
      SUBMIT_KYC_PERSONAL_INFO,
      { input }
    );
    return data.submitKYCPersonalInfo;
  }

  async submitDocument(input: {
    type: KYCDocumentType;
    issuingCountry: string;
    frontImageUrl: string;
    backImageUrl?: string;
    selfieImageUrl?: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
  }): Promise<KYCDocumentUploadResponse> {
    const data = await this.gql.mutate<{ submitKYCDocument: KYCDocumentUploadResponse }>(
      SUBMIT_KYC_DOCUMENT,
      { input }
    );
    return data.submitKYCDocument;
  }

  async submitAddress(input: {
    type: 'residential' | 'mailing' | 'business';
    streetAddress: string;
    city: string;
    country: string;
    postalCode?: string;
    state?: string;
    isPrimary?: boolean;
  }): Promise<KYCVerificationResult> {
    const data = await this.gql.mutate<{ submitKYCAddress: KYCVerificationResult }>(
      SUBMIT_KYC_ADDRESS,
      { input }
    );
    return data.submitKYCAddress;
  }

  /** Retourne true si le statut est 'verified' */
  isVerified(status: KYCStatus): boolean {
    return status === 'verified';
  }

  /** Retourne la couleur associée au statut KYC */
  getStatusColor(status: KYCStatus): string {
    const colors: Record<KYCStatus, string> = {
      verified: '#22c55e',
      pending: '#f59e0b',
      under_review: '#3b82f6',
      rejected: '#ef4444',
      expired: '#6b7280',
      suspended: '#dc2626',
      unverified: '#9ca3af',
    };
    return colors[status] || '#9ca3af';
  }
}

let instance: KYCService | null = null;

export function getKYCService(): KYCService {
  if (!instance) instance = new KYCService();
  return instance;
}

export default getKYCService;
