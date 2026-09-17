/**
 * SaleOfferClient — typed client for the sale-offer module
 * (backend_easyrent/src/saleOffer/, mounted at /api/sale-offers).
 * Disponibilité vente/location combinée : le flux d'achat passe désormais
 * par ce module dédié, indépendant du système de réservation générique
 * (voir Property.availabilityForSale/availabilityForRent).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type SaleOfferStatus = 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';

export interface SaleOffer {
  saleOfferId: string;
  propertyId: string;
  buyerId: string | { _id: string; name?: string; email?: string };
  sellerId: string | { _id: string; name?: string; email?: string };
  status: SaleOfferStatus;
  offerAmount: number;
  counterAmount?: number;
  currency: string;
  leaseDisclosureAcknowledged: boolean;
  acceptedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export class SaleOfferClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.SALE_OFFER_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(method: string, path: string, body?: any, retries = 3): Promise<T> {
    let lastError: Error = new Error('SaleOffer service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'SaleOffer service error');
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

  createOffer(data: { propertyId: string; buyerId: string; offerAmount: number; currency?: string }) {
    return this.request<SaleOffer>('POST', '/', data);
  }

  // Requis avant accept() si la propriété a un bail actif — l'acheteur
  // reconnaît explicitement qu'il en hérite après l'achat.
  acknowledgeDisclosure(saleOfferId: string) {
    return this.request<SaleOffer>('POST', `/${saleOfferId}/acknowledge-disclosure`);
  }

  counterOffer(saleOfferId: string, counterAmount: number) {
    return this.request<SaleOffer>('POST', `/${saleOfferId}/counter`, { counterAmount });
  }

  acceptOffer(saleOfferId: string) {
    return this.request<SaleOffer>('POST', `/${saleOfferId}/accept`);
  }

  rejectOffer(saleOfferId: string, reason?: string) {
    return this.request<SaleOffer>('POST', `/${saleOfferId}/reject`, { reason });
  }

  getOffer(saleOfferId: string) {
    return this.request<SaleOffer>('GET', `/${saleOfferId}`);
  }

  getOffersByProperty(propertyId: string) {
    return this.request<SaleOffer[]>('GET', `/property/${propertyId}`);
  }

  getOffersByBuyer(buyerId: string) {
    return this.request<SaleOffer[]>('GET', `/buyer/${buyerId}`);
  }
}

let _sharedClient: SaleOfferClient | null = null;
export const getSaleOfferClient = (): SaleOfferClient => {
  if (!_sharedClient) _sharedClient = new SaleOfferClient();
  return _sharedClient;
};
