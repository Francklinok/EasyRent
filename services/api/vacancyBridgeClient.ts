/**
 * VacancyBridgeClient — typed client for the "comblement locatif éphémère"
 * module (backend_easyrent/src/vacancyBridge/, mounted at
 * /api/vacancy-bridge). DELIBERATELY separate from urbanReuseClient.ts —
 * ce n'est pas une variante d'urban reuse : c'est une occupation temporaire
 * d'un bien vacant PENDANT que le propriétaire continue activement de
 * chercher un vrai locataire/acheteur classique.
 *
 * Refonte (voir doc produit "VacancyBridge — modèle de coexistence") :
 * VacancyBridge NE bloque PLUS le commercial classique et NE se coupe PLUS
 * instantanément quand un vrai locataire/acheteur est trouvé — la fin passe
 * désormais par une transition avec préavis (statut 'termination_requested',
 * voir requestTermination/finalizeTermination). La vente d'un bien occupé
 * déclenche en plus un transfert de propriété explicite que le NOUVEAU
 * propriétaire doit résoudre (MAINTAIN/TERMINATE, voir
 * requestOwnershipTransfer/resolveOwnershipTransfer côté backend).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type VacancyBridgePropertyPurpose = 'rent' | 'sale';
export type TemporaryOccupancyStatus =
  | 'requested' | 'active' | 'termination_requested' | 'rejected' | 'cancelled'
  | 'ended_tenant_found' | 'ended_owner_cancelled';
export type TerminationReason = 'tenant_found' | 'owner_request';

export interface VacancyBridgeGovernance {
  proposalId: string;
  ownerApproved: boolean;
  ownerApprovedAt?: string;
}

export interface OwnershipTransfer {
  previousOwnerId: string;
  newOwnerId: string;
  transferredAt: string;
  resolution?: 'maintain' | 'terminate';
  resolvedAt?: string;
}

export interface TemporaryOccupancy {
  occupancyId: string;
  propertyId: string;
  ownerId: string;
  occupantUserId: string;
  propertyPurpose: VacancyBridgePropertyPurpose;
  monthlyFee: number;
  currency: string;
  status: TemporaryOccupancyStatus;
  requestMessage?: string;
  rejectionReason?: string;
  governance?: VacancyBridgeGovernance;
  startedAt: string;
  endedAt?: string;
  terminationReason?: TerminationReason;
  terminationRequestedAt?: string;
  terminationEffectiveAt?: string;
  noticePeriodDays: number;
  ownershipTransfer?: OwnershipTransfer;
  createdAt: string;
  updatedAt: string;
  // URL du PDF de convention généré automatiquement côté serveur dès que
  // l'occupation passe 'active' (VacancyBridgeService.generateVacancyBridgeContract),
  // qu'il y ait ou non une redevance — absent tant que la génération n'a pas
  // encore abouti (best-effort, asynchrone).
  contractUrl?: string | null;
}

export class VacancyBridgeClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.VACANCY_BRIDGE_URL) {
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
    let lastError: Error = new Error('Vacancy bridge service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Vacancy bridge service error');
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

  // ── Occupancies ───────────────────────────────────────────────────────
  offer(data: {
    propertyId: string; ownerId: string; occupantUserId: string;
    propertyPurpose: VacancyBridgePropertyPurpose;
    monthlyFee?: number; currency?: string;
    governance?: { proposalId: string; ownerApproved: boolean };
  }) {
    return this.request<TemporaryOccupancy>('POST', '/occupancies', data);
  }
  getOccupancy(occupancyId: string) {
    return this.request<TemporaryOccupancy>('GET', `/occupancies/${occupancyId}`);
  }
  getOccupanciesByOwner(ownerId: string) {
    return this.request<TemporaryOccupancy[]>('GET', `/occupancies/owner/${ownerId}`);
  }
  getOccupanciesByOccupant(occupantUserId: string) {
    return this.request<TemporaryOccupancy[]>('GET', `/occupancies/occupant/${occupantUserId}`);
  }
  /** Mirrors urbanReuseClient.getActiveAgreementByProperty's on-demand pattern. */
  getActiveOccupancyByProperty(propertyId: string) {
    return this.request<TemporaryOccupancy | null>('GET', `/occupancies/property/${propertyId}/active`);
  }
  /** Pending candidacies on a property — surfaced to the owner. */
  getRequestedOccupanciesByProperty(propertyId: string) {
    return this.request<TemporaryOccupancy[]>('GET', `/occupancies/property/${propertyId}/requested`);
  }
  /** The current user's own in-flight request on this property (requested/active), null otherwise. */
  getMyOccupancyForProperty(propertyId: string) {
    return this.request<TemporaryOccupancy | null>('GET', `/occupancies/property/${propertyId}/mine`);
  }
  /** Client-initiated candidacy, submitted from the property detail page. */
  requestOccupancy(data: {
    propertyId: string; ownerId: string; occupantUserId: string;
    propertyPurpose: VacancyBridgePropertyPurpose;
    monthlyFee?: number; currency?: string; requestMessage?: string;
  }) {
    return this.request<TemporaryOccupancy>('POST', '/occupancies/request', data);
  }
  acceptRequest(occupancyId: string, adjustedTerms?: { monthlyFee?: number }) {
    return this.request<TemporaryOccupancy>('POST', `/occupancies/${occupancyId}/accept`, adjustedTerms);
  }
  rejectRequest(occupancyId: string, reason: string) {
    return this.request<TemporaryOccupancy>('POST', `/occupancies/${occupancyId}/reject`, { reason });
  }
  payMonthlyFee(occupancyId: string) {
    return this.request<TemporaryOccupancy>('POST', `/occupancies/${occupancyId}/pay-fee`);
  }
  /** The REQUESTER withdraws their own still-'requested' candidacy — distinct from requestTermination below (owner ending an ACTIVE occupancy, with notice). */
  cancelRequest(occupancyId: string) {
    return this.request<TemporaryOccupancy>('POST', `/occupancies/${occupancyId}/cancel-request`);
  }

  // ── Transition avec préavis / transfert de propriété ───────────────────
  requestTermination(occupancyId: string, data: { reasonText: string; noticePeriodDays?: number }) {
    return this.request<TemporaryOccupancy>('POST', `/occupancies/${occupancyId}/request-termination`, data);
  }
  finalizeTermination(occupancyId: string) {
    return this.request<TemporaryOccupancy>('POST', `/occupancies/${occupancyId}/finalize-termination`);
  }
  getPendingOwnershipTransfers(newOwnerId: string) {
    return this.request<TemporaryOccupancy[]>('GET', `/occupancies/ownership-transfers/${newOwnerId}/pending`);
  }
  resolveOwnershipTransfer(occupancyId: string, resolution: 'maintain' | 'terminate', reasonText?: string) {
    return this.request<TemporaryOccupancy>('POST', `/occupancies/${occupancyId}/resolve-ownership-transfer`, { resolution, reasonText });
  }
}

let _sharedClient: VacancyBridgeClient | null = null;
export const getVacancyBridgeClient = (): VacancyBridgeClient => {
  if (!_sharedClient) _sharedClient = new VacancyBridgeClient();
  return _sharedClient;
};
