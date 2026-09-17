/**
 * RSTClient — typed client for rst-service (Revenue Share Token Platform), port 8089.
 *
 * Ported 1:1 from microservices/client-sdk/src/rst-client.ts so the app talks to
 * the exact same request/response shapes the Rust backend expects — including
 * the v2 investor-protection features:
 *   - UsageType (Achat / FinancementTravaux) & transferability enforcement
 *   - Cap-feasibility guard + supply×price consistency at issuance
 *   - Performance reserve (§7 niveau 1) + floor guarantee (§7 niveau 2)
 *   - 4-level end-of-term mechanism (§7)
 *   - Private buyback facility (§8)
 *   - Mandatory pre-investment simulator (§9)
 *
 * Not a cross-repo import of the backend's client-sdk (Metro has no workspace
 * link to backend_easyrent), so this file is kept in sync manually whenever
 * the SDK changes.
 */

import { API_CONFIG } from '@/constants/apiConfig';

// ── Usage type (architecture v2 §3/§5) ────────────────────────────────────────
export type UsageType =
  | { kind: 'achat' }
  | { kind: 'financement_travaux'; max_months_to_cap: number; early_exit_facility_enabled: boolean };

// ── Project ──────────────────────────────────────────────────────────────────
export interface CreateProjectRequest {
  owner_id: string;
  property_id: string;
  property_address: string;
  property_type: 'residential' | 'commercial' | 'industrial';
  estimated_value_usd: number;
  purpose: 'renovation' | 'furnishing' | 'solar' | 'expansion';
  purpose_description: string;
  usage_type?: UsageType;
  target_amount_usd: number;
  min_investment_usd: number;
  max_investment_usd: number;
  platform_fee_bps: number;
  revenue_share_pct: number;
  duration_months: number;
  target_annual_yield: number;
  max_return_pct: number;
  floor_guarantee_pct?: number;
  performance_reserve_pct?: number;
  max_extensions?: number;
  occupancy_estimate?: number;
  base_monthly_rent: number;
  currency: string;
  campaign_end_days: number;
  kyc_required: boolean;
  accredited_only: boolean;
  jurisdiction: string;
}

// ── Simulator — mandatory before financing (§9) ───────────────────────────────
export interface SimulateRequest {
  amount_usd: number;
}

export interface ScenarioSet {
  optimistic: number;
  base: number;
  pessimistic: number | null;
}

export interface SimulationResult {
  project_id: string;
  amount_usd: number;
  tokens_obtained: number;
  revenue_share_pct: number;
  target_cap_usd: number;
  floor_guarantee_usd: number | null;
  monthly_payout_estimate_net: number;
  months_to_cap: ScenarioSet;
  annualized_yield_equivalent: number;
  lockup_warning: string;
  is_transferable: boolean;
}

// ── Private buyback facility (§8) ─────────────────────────────────────────────
export interface RequestBuybackRequest {
  holder_id: string;
  residual_value_estimate_usd: number;
  months_remaining: number;
}

export interface PrivateBuybackOffer {
  offer_id: string;
  project_id: string;
  holder_id: string;
  residual_value_estimate_usd: number;
  discount_pct: number;
  months_remaining: number;
  offer_price_usd: number;
  platform_liquidity_available: boolean;
  status: 'offered' | 'accepted' | 'declined' | 'expired';
}

// ── End-of-term 4-level mechanism (§7) ────────────────────────────────────────
export type EndOfTermOutcome =
  | { outcome: 'cap_reached' }
  | { outcome: 'floor_covered_by_reserve'; covered_usd: number }
  | { outcome: 'buyback_accepted'; offer_id: string; offer_price: number }
  | { outcome: 'extension_approved'; new_expiry: string; compensation_bps: number; extensions_used: number }
  | { outcome: 'default'; seizure_triggered: boolean; remaining_gap_usd: number };

export interface EndOfTermResolution {
  resolution_id: string;
  project_id: string;
  holder_id: string;
  invested_usd: number;
  total_received_usd: number;
  target_return_usd: number;
  floor_usd: number;
  gap_usd: number;
  outcome: EndOfTermOutcome;
  resolved_at: string;
}

// ── Project reserve (§7 niveau 1) ─────────────────────────────────────────────
export interface ProjectReserveAccount {
  reserve_id: string;
  project_id: string;
  balance_usd: number;
  total_deposited: number;
  total_drawn: number;
}

// ── Client ────────────────────────────────────────────────────────────────────
export class RSTClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.RST_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(method: string, path: string, body?: unknown, retries = 3): Promise<T> {
    let lastError: Error = new Error('RST service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = (await res.json()) as { success: boolean; data: T; error?: string };
        if (!json.success) throw new Error(json.error || 'RST service error');
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

  // ── Projects ────────────────────────────────────────────────────────────
  getProject(project_id: string) {
    return this.request<any>('GET', `/api/projects/${project_id}`);
  }

  // ── Simulator — mandatory before financing (§9) ──────────────────────────
  simulate(project_id: string, data: SimulateRequest): Promise<SimulationResult> {
    return this.request<SimulationResult>('POST', `/api/simulator/${project_id}`, data);
  }

  // ── Project reserve (§7 niveau 1) ────────────────────────────────────────
  getProjectReserve(project_id: string): Promise<ProjectReserveAccount> {
    return this.request<ProjectReserveAccount>('GET', `/api/reserve/${project_id}`);
  }

  // ── Private buyback facility (§8) ────────────────────────────────────────
  requestBuyback(project_id: string, data: RequestBuybackRequest): Promise<PrivateBuybackOffer> {
    return this.request<PrivateBuybackOffer>('POST', `/api/buyback/${project_id}/request`, data);
  }
  getBuybackOffer(offer_id: string): Promise<PrivateBuybackOffer> {
    return this.request<PrivateBuybackOffer>('GET', `/api/buyback/offers/${offer_id}`);
  }
  acceptBuybackOffer(offer_id: string): Promise<PrivateBuybackOffer> {
    return this.request<PrivateBuybackOffer>('POST', `/api/buyback/offers/${offer_id}/accept`);
  }
  declineBuybackOffer(offer_id: string): Promise<PrivateBuybackOffer> {
    return this.request<PrivateBuybackOffer>('POST', `/api/buyback/offers/${offer_id}/decline`);
  }

  // ── End-of-term 4-level mechanism (§7) ───────────────────────────────────
  resolveEndOfTerm(project_id: string, investor_id: string): Promise<EndOfTermResolution> {
    return this.request<EndOfTermResolution>('POST', `/api/end-of-term/${project_id}/${investor_id}/resolve`);
  }
  recordBuybackOutcome(project_id: string, data: { investor_id: string; offer_id: string; offer_price: number }) {
    return this.request<EndOfTermResolution>('POST', `/api/end-of-term/${project_id}/buyback-outcome`, data);
  }
  getEndOfTermResolutions(project_id: string): Promise<EndOfTermResolution[]> {
    return this.request<EndOfTermResolution[]>('GET', `/api/end-of-term/${project_id}/resolutions`);
  }

  // ── Health ───────────────────────────────────────────────────────────────
  health() {
    return this.request<any>('GET', '/health');
  }
}

let _sharedClient: RSTClient | null = null;
export const getRSTClient = (): RSTClient => {
  if (!_sharedClient) _sharedClient = new RSTClient();
  return _sharedClient;
};
