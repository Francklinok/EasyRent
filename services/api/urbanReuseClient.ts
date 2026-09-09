/**
 * UrbanReuseClient — typed client for the "réemploi d'actifs urbains
 * sous-utilisés" module (backend_easyrent/src/urbanReuse/, mounted at
 * /api/urban-reuse). A dormant building/land is put to temporary community
 * use (market, daycare, training space) for reduced/no rent in exchange for
 * a documented maintenance commitment — revocable once a real project is
 * financed, never a permanent right.
 */



import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type OccupancyConsiderationType = 'cash' | 'maintenance_inkind' | 'mixed';
// 'requested': a client submitted a candidacy from the property page, not
// yet reviewed. 'rejected': owner declined it. Both new — createAgreement()
// stays owner-initiated and lands directly in 'active'; requestOccupancy()
// is the client-initiated entry point that lands in 'requested'.
export type OccupancyStatus = 'requested' | 'active' | 'revoked_for_project' | 'ended' | 'rejected';

export interface OccupancyAgreement {
  agreementId: string;
  propertyId: string;
  ownerId: string;
  occupantUserId: string;
  organizationName: string;
  organizationType: string;
  considerationType: OccupancyConsiderationType;
  monthlyRent: number;
  currency: string;
  maintenanceObligation: string;
  status: OccupancyStatus;
  requestMessage?: string;
  rejectionReason?: string;
  startedAt: string;
  revokedAt?: string;
  revocationNoticeDays: number;
  revocationReason?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UpkeepCheckInStatus = 'reported' | 'verified' | 'disputed';

export interface UpkeepCheckIn {
  checkInId: string;
  agreementId: string;
  description: string;
  evidenceUrl?: string;
  reportedBy: string;
  status: UpkeepCheckInStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  disputeNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export class UrbanReuseClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.URBAN_REUSE_URL) {
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
    let lastError: Error = new Error('Urban reuse service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Urban reuse service error');
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

  // ── Agreements ────────────────────────────────────────────────────────
  createAgreement(data: {
    propertyId: string; ownerId: string; occupantUserId: string;
    organizationName: string; organizationType: string;
    considerationType: OccupancyConsiderationType;
    monthlyRent?: number; currency?: string;
    maintenanceObligation: string; revocationNoticeDays?: number;
  }) {
    return this.request<OccupancyAgreement>('POST', '/agreements', data);
  }
  getAgreement(agreementId: string) {
    return this.request<OccupancyAgreement>('GET', `/agreements/${agreementId}`);
  }
  getAgreementsByOwner(ownerId: string) {
    return this.request<OccupancyAgreement[]>('GET', `/agreements/owner/${ownerId}`);
  }
  getAgreementsByOccupant(occupantUserId: string) {
    return this.request<OccupancyAgreement[]>('GET', `/agreements/occupant/${occupantUserId}`);
  }
  /** Active occupancy of a property, if any — null otherwise. Mirrors
   * landClient.getTitleByProperty()'s on-demand pattern used on the
   * property detail page. */
  getActiveAgreementByProperty(propertyId: string) {
    return this.request<OccupancyAgreement | null>('GET', `/agreements/property/${propertyId}/active`);
  }
  /** Pending candidacies on a property — surfaced to the owner. */
  getRequestedAgreementsByProperty(propertyId: string) {
    return this.request<OccupancyAgreement[]>('GET', `/agreements/property/${propertyId}/requested`);
  }
  /** The current user's own in-flight request on this property (requested/active), null otherwise. */
  getMyAgreementForProperty(propertyId: string) {
    return this.request<OccupancyAgreement | null>('GET', `/agreements/property/${propertyId}/mine`);
  }
  /** Client-initiated candidacy, submitted from the property detail page. */
  requestOccupancy(data: {
    propertyId: string; ownerId: string; occupantUserId: string;
    organizationName: string; organizationType: string;
    considerationType: OccupancyConsiderationType;
    monthlyRent?: number; currency?: string;
    maintenanceObligation: string; requestMessage?: string;
  }) {
    return this.request<OccupancyAgreement>('POST', '/agreements/request', data);
  }
  acceptRequest(agreementId: string, adjustedTerms?: {
    monthlyRent?: number; considerationType?: OccupancyConsiderationType;
    maintenanceObligation?: string; revocationNoticeDays?: number;
  }) {
    return this.request<OccupancyAgreement>('POST', `/agreements/${agreementId}/accept`, adjustedTerms);
  }
  rejectRequest(agreementId: string, reason: string) {
    return this.request<OccupancyAgreement>('POST', `/agreements/${agreementId}/reject`, { reason });
  }
  payMonthlyRent(agreementId: string) {
    return this.request<OccupancyAgreement>('POST', `/agreements/${agreementId}/pay-rent`);
  }
  revokeForProject(agreementId: string, reason: string) {
    return this.request<OccupancyAgreement>('POST', `/agreements/${agreementId}/revoke`, { reason });
  }
  endAgreement(agreementId: string) {
    return this.request<OccupancyAgreement>('POST', `/agreements/${agreementId}/end`);
  }
  getCheckInsByAgreement(agreementId: string) {
    return this.request<UpkeepCheckIn[]>('GET', `/agreements/${agreementId}/check-ins`);
  }

  // ── Upkeep check-ins ────────────────────────────────────────────────────
  reportCheckIn(data: { agreementId: string; description: string; evidenceUrl?: string; reportedBy: string }) {
    return this.request<UpkeepCheckIn>('POST', '/check-ins', data);
  }
  verifyCheckIn(checkInId: string, verifiedBy: string) {
    return this.request<UpkeepCheckIn>('POST', `/check-ins/${checkInId}/verify`, { verifiedBy });
  }
  disputeCheckIn(checkInId: string, disputeNotes: string) {
    return this.request<UpkeepCheckIn>('POST', `/check-ins/${checkInId}/dispute`, { disputeNotes });
  }
}

let _sharedClient: UrbanReuseClient | null = null;
export const getUrbanReuseClient = (): UrbanReuseClient => {
  if (!_sharedClient) _sharedClient = new UrbanReuseClient();
  return _sharedClient;
};
