/**
 * RentalGuaranteeClient — typed client for the "garantie locative" module
 * (backend_easyrent/src/rentalGuarantee/, mounted at /api/rental-guarantee).
 * Protects landlords against tenant non-payment via a pooled premium
 * reserve, without requiring a heavy security deposit from the tenant.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type RentalGuaranteeStatus = 'active' | 'suspended' | 'cancelled' | 'expired';

export interface RentalGuarantee {
  guaranteeId: string;
  leaseId: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  monthlyRent: number;
  currency: string;
  premiumPct: number;
  coverageCapMultiple: number;
  gracePeriodDays: number;
  status: RentalGuaranteeStatus;
  totalPremiumsCollected: number;
  totalClaimsPaid: number;
  activatedAt: string;
  cancelledAt?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus = 'filed' | 'under_review' | 'approved' | 'rejected' | 'paid';

export interface GuaranteeClaim {
  claimId: string;
  guaranteeId: string;
  leaseId: string;
  periodMonth: string;
  amountClaimed: number;
  amountApproved?: number;
  currency: string;
  status: ClaimStatus;
  filedBy: string;
  reviewedBy?: string;
  reviewNotes?: string;
  filedAt: string;
  reviewedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class RentalGuaranteeClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.RENTAL_GUARANTEE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async authHeaders(): Promise<Record<string, string>> {
    // Clé canonique du token stocké après login (voir apiService.ts /
    // graphqlService.ts) — 'token' n'a jamais été écrit nulle part, donc ce
    // header restait toujours vide et le backend rejetait la requête.
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(method: string, path: string, body?: unknown, retries = 3): Promise<T> {
    let lastError: Error = new Error('Rental guarantee service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Rental guarantee service error');
        return json.data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 300;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  // ── Guarantee ─────────────────────────────────────────────────────────
  subscribe(data: { leaseId: string; premiumPct?: number; coverageCapMultiple?: number; gracePeriodDays?: number }) {
    return this.request<RentalGuarantee>('POST', '/', data);
  }
  getGuarantee(guaranteeId: string) {
    return this.request<RentalGuarantee>('GET', `/${guaranteeId}`);
  }
  getGuaranteeByLease(leaseId: string) {
    return this.request<RentalGuarantee | null>('GET', `/lease/${leaseId}`);
  }
  getGuaranteesByLandlord(landlordId: string) {
    return this.request<RentalGuarantee[]>('GET', `/landlord/${landlordId}`);
  }
  cancel(guaranteeId: string, reason: string) {
    return this.request<RentalGuarantee>('POST', `/${guaranteeId}/cancel`, { reason });
  }
  collectPremium(guaranteeId: string) {
    return this.request<RentalGuarantee>('POST', `/${guaranteeId}/collect-premium`);
  }

  // ── Claims ────────────────────────────────────────────────────────────
  fileClaim(guaranteeId: string, data: { periodMonth: string; filedBy: string }) {
    return this.request<GuaranteeClaim>('POST', `/${guaranteeId}/claims`, data);
  }
  getClaim(claimId: string) {
    return this.request<GuaranteeClaim>('GET', `/claims/${claimId}`);
  }
  getClaimsByGuarantee(guaranteeId: string) {
    return this.request<GuaranteeClaim[]>('GET', `/${guaranteeId}/claims`);
  }
  startReview(claimId: string, reviewerId: string) {
    return this.request<GuaranteeClaim>('POST', `/claims/${claimId}/review`, { reviewerId });
  }
  decideClaim(claimId: string, data: { approved: boolean; reviewerId: string; notes: string; amountApproved?: number }) {
    return this.request<GuaranteeClaim>('POST', `/claims/${claimId}/decide`, data);
  }
  payoutClaim(claimId: string) {
    return this.request<GuaranteeClaim>('POST', `/claims/${claimId}/payout`);
  }
}

let _sharedClient: RentalGuaranteeClient | null = null;
export const getRentalGuaranteeClient = (): RentalGuaranteeClient => {
  if (!_sharedClient) _sharedClient = new RentalGuaranteeClient();
  return _sharedClient;
};
