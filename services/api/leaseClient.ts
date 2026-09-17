/**
 * LeaseClient — typed client for the lease module (backend_easyrent/src/lease/,
 * mounted at /api/leases). Minimal surface: only what's needed to let a
 * landlord pick one of their real leases (e.g. when subscribing to a rental
 * guarantee), rather than a full lease-management client.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type LeaseStatus = 'DRAFT' | 'ACTIVE' | 'OVERDUE' | 'NOTICE_GIVEN' | 'TERMINATED' | 'EXPIRED' | 'ENDED';

export interface Lease {
  leaseId: string;
  propertyId: string;
  tenantId: string | { _id: string; name?: string; email?: string };
  ownerId: string;
  status: LeaseStatus;
  monthlyRent: number;
  currency: string;
  startDate: string;
  endDate: string;
  saleDisclosureAcknowledged?: boolean;
  noticeGivenAt?: string;
  noticeType?: 'sale' | 'own_use' | 'legitimate_reason';
  noticeDeadline?: string;
}

export class LeaseClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.LEASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async authHeaders(): Promise<Record<string, string>> {
    // Clé canonique du token stocké après login (voir apiService.ts /
    // graphqlService.ts) — 'token' n'a jamais été écrit nulle part, donc ce
    // header restait toujours vide et le backend rejetait la requête.
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(method: string, path: string, retries = 3): Promise<T> {
    let lastError: Error = new Error('Lease service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Lease service error');
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

  getLeasesByOwner(ownerId: string) {
    return this.request<Lease[]>('GET', `/owner/${ownerId}`);
  }

  // Bail actif sur une propriété, s'il en existe un — pilote l'affichage
  // du bouton "Louer"/"Acheter" et du bandeau "bien vendu occupé" (page
  // détail propriété, disponibilité vente/location combinée).
  getLeaseByProperty(propertyId: string) {
    return this.request<Lease | null>('GET', `/property/${propertyId}`);
  }
}

let _sharedClient: LeaseClient | null = null;
export const getLeaseClient = (): LeaseClient => {
  if (!_sharedClient) _sharedClient = new LeaseClient();
  return _sharedClient;
};
