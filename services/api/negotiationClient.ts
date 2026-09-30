/**
 * NegotiationClient — typed client for the shared negotiation engine
 * (backend_easyrent/src/negotiation/, mounted at /api/negotiations).
 * Domain-agnostic: used today for property sale (SaleOffer), and meant to
 * be reused as-is for lease/dormantLand/urbanReuse/vacancyBridge once those
 * are wired server-side — never for hotel-style room/date bookings (see
 * Property.ownerCriteria.allowNegotiation, never exposed for that case).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type NegotiationDomain = 'sale' | 'lease' | 'dormant_land' | 'urban_reuse' | 'vacancy_bridge';
export type NegotiationStatus = 'OPEN' | 'AGREED' | 'CANCELLED';

export interface NegotiationOffer {
  amount: number;
  author: 'buyer' | 'seller';
  authorId: string;
  message?: string;
  createdAt: string;
}

export interface Negotiation {
  negotiationId: string;
  domain: NegotiationDomain;
  referenceId: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  currency: string;
  originalAmount: number;
  offers: NegotiationOffer[];
  status: NegotiationStatus;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  confirmedAmount?: number | null;
  confirmedAt?: string | null;
  version: number;
  cancelledAt?: string | null;
  cancelReason?: string;
}

export interface ConfirmNegotiationResult {
  negotiation: Negotiation;
  justAgreed: boolean;
  finalizationError?: string;
}

export class NegotiationClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.NEGOTIATION_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(method: string, path: string, body?: any, retries = 3): Promise<any> {
    let lastError: Error = new Error('Negotiation service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string; justAgreed?: boolean; finalizationError?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Negotiation service error');
        return json;
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

  async getNegotiation(negotiationId: string): Promise<Negotiation> {
    const json = await this.request<Negotiation>('GET', `/${negotiationId}`);
    return json.data;
  }

  async addOffer(negotiationId: string, amount: number, message?: string): Promise<Negotiation> {
    const json = await this.request<Negotiation>('POST', `/${negotiationId}/offer`, { amount, message });
    return json.data;
  }

  // justAgreed=true veut dire que la transaction sous-jacente vient d'être
  // finalisée côté serveur (ex: SaleOfferService.acceptOfferWithNegotiatedAmount)
  // — plus besoin de cliquer sur un quelconque bouton "Accepter" séparé.
  async confirm(negotiationId: string): Promise<ConfirmNegotiationResult> {
    const json = await this.request<Negotiation>('POST', `/${negotiationId}/confirm`);
    return { negotiation: json.data, justAgreed: !!json.justAgreed, finalizationError: json.finalizationError };
  }

  async cancel(negotiationId: string, reason?: string): Promise<Negotiation> {
    const json = await this.request<Negotiation>('POST', `/${negotiationId}/cancel`, { reason });
    return json.data;
  }
}

let _sharedClient: NegotiationClient | null = null;
export const getNegotiationClient = (): NegotiationClient => {
  if (!_sharedClient) _sharedClient = new NegotiationClient();
  return _sharedClient;
};
