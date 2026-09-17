/**
 * MaintenanceClient — typed client for the "maintenance prédictive
 * mutualisée" module (backend_easyrent/src/maintenance/, mounted at
 * /api/maintenance). Aggregates equipment upkeep data across an owner's
 * whole portfolio to surface a risk-ranked view and anticipate failures,
 * rather than reacting to them after the fact.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type MaintenanceAssetCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';

export interface MaintenanceAsset {
  assetId: string;
  propertyId: string;
  ownerId: string;
  category: MaintenanceAssetCategory;
  label: string;
  installedAt?: string;
  expectedLifespanMonths?: number;
  lastServicedAt?: string;
  serviceIntervalMonths?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetRisk {
  asset: MaintenanceAsset;
  riskScore: number;
  reasons: string[];
}

export type InterventionStatus = 'reported' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type InterventionUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface MaintenanceIntervention {
  interventionId: string;
  assetId: string;
  propertyId: string;
  ownerId: string;
  urgency: InterventionUrgency;
  status: InterventionStatus;
  description: string;
  reportedBy: string;
  providerId?: string;
  cost?: number;
  currency: string;
  scheduledAt?: string;
  completedAt?: string;
  wasPredicted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Miroir de service-marketplace/models/Service.ts et ServiceProvider.ts —
// on ne reprend que les champs affichés lors du choix d'un prestataire.
export interface SuggestedServiceProvider {
  service: {
    _id: string;
    providerId: string;
    title: string;
    pricing: { basePrice: number; currency: string; billingPeriod: string };
    rating: number;
    totalReviews: number;
  };
  provider: {
    userId: string;
    companyName?: string;
    businessName?: string;
    isVerified: boolean;
    rating: number;
    contactInfo?: { phone?: string; email?: string };
  } | null;
}

export class MaintenanceClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.MAINTENANCE_URL) {
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
    let lastError: Error = new Error('Maintenance service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Maintenance service error');
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

  // ── Assets ────────────────────────────────────────────────────────────
  registerAsset(data: {
    propertyId: string; ownerId: string; category: MaintenanceAssetCategory; label: string;
    installedAt?: string; expectedLifespanMonths?: number; serviceIntervalMonths?: number;
  }) {
    return this.request<MaintenanceAsset>('POST', '/assets', data);
  }
  getAsset(assetId: string) {
    return this.request<MaintenanceAsset>('GET', `/assets/${assetId}`);
  }
  getAssetsByProperty(propertyId: string) {
    return this.request<MaintenanceAsset[]>('GET', `/assets/property/${propertyId}`);
  }
  recordService(assetId: string) {
    return this.request<MaintenanceAsset>('POST', `/assets/${assetId}/service`);
  }
  deactivateAsset(assetId: string) {
    return this.request<MaintenanceAsset>('POST', `/assets/${assetId}/deactivate`);
  }

  // ── Portfolio risk ────────────────────────────────────────────────────
  getPortfolioRisk(ownerId: string) {
    return this.request<AssetRisk[]>('GET', `/portfolio/${ownerId}/risk`);
  }

  // ── Interventions ─────────────────────────────────────────────────────
  reportIssue(data: { assetId: string; description: string; reportedBy: string; urgency?: InterventionUrgency }) {
    return this.request<MaintenanceIntervention>('POST', '/interventions', data);
  }
  getIntervention(interventionId: string) {
    return this.request<MaintenanceIntervention>('GET', `/interventions/${interventionId}`);
  }
  getInterventionsByOwner(ownerId: string) {
    return this.request<MaintenanceIntervention[]>('GET', `/interventions/owner/${ownerId}`);
  }
  getInterventionsByAsset(assetId: string) {
    return this.request<MaintenanceIntervention[]>('GET', `/interventions/asset/${assetId}`);
  }
  getSuggestedProviders(interventionId: string) {
    return this.request<SuggestedServiceProvider[]>('GET', `/interventions/${interventionId}/suggested-providers`);
  }
  scheduleIntervention(interventionId: string, data: { providerId: string; scheduledAt: string }) {
    return this.request<MaintenanceIntervention>('POST', `/interventions/${interventionId}/schedule`, data);
  }
  startIntervention(interventionId: string) {
    return this.request<MaintenanceIntervention>('POST', `/interventions/${interventionId}/start`);
  }
  completeIntervention(interventionId: string, data: { cost: number; currency?: string }) {
    return this.request<MaintenanceIntervention>('POST', `/interventions/${interventionId}/complete`, data);
  }
  cancelIntervention(interventionId: string) {
    return this.request<MaintenanceIntervention>('POST', `/interventions/${interventionId}/cancel`);
  }
}

let _sharedClient: MaintenanceClient | null = null;
export const getMaintenanceClient = (): MaintenanceClient => {
  if (!_sharedClient) _sharedClient = new MaintenanceClient();
  return _sharedClient;
};
