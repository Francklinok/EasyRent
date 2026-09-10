/**
 * LandClient — typed client for the land title / succession-foncière module
 * (backend_easyrent/src/land/, mounted at /api/land on the main Node
 * backend). Bridges to property-engine's existing legal-token engine (Rust)
 * — reused, not duplicated — extended with succession tracking per the
 * master document's §3.2 (unblocking dormant land tied up in unresolved
 * successions).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

// ── Title ────────────────────────────────────────────────────────────────────
export interface Encumbrance {
  encumbrance_id: string;
  encumbrance_type: string; // mortgage, easement, lien
  amount?: number;
  creditor?: string;
  expires_at?: string;
  registered_at: string;
}

export interface TransferRecord {
  record_id: string;
  from_owner: string;
  to_owner: string;
  transfer_price?: number;
  transaction_hash?: string;
  transferred_at: string;
}

export interface LandTitle {
  token_id: string;
  spv_id?: string;
  property_id: string;
  nft_standard: string;
  blockchain: string;
  contract_address?: string;
  token_uri?: string;
  deed_hash: string;
  deed_url: string;
  notary_id?: string;
  notary_signature?: string;
  jurisdiction: string;
  property_address: string;
  property_area_sqm: number;
  cadastral_reference?: string;
  encumbrances: Encumbrance[];
  transfer_history: TransferRecord[];
  is_valid: boolean;
  minted_at?: string;
  created_at: string;
  updated_at: string;
}

// ── Succession (architecture doc §3.2) ────────────────────────────────────────
export type SuccessionStatus =
  | 'open' | 'heirs_identified' | 'partially_recognized'
  | 'fully_recognized' | 'resolved' | 'disputed';

export type HeirRecognitionStatus = 'claimed' | 'documented' | 'recognized' | 'rejected';

export interface Heir {
  heir_id: string;
  full_name: string;
  relationship_to_deceased: string;
  recognition_status: HeirRecognitionStatus;
  supporting_document_url?: string;
  declared_share_pct?: number;
  added_at: string;
  recognized_at?: string;
}

export interface SuccessionRecord {
  succession_id: string;
  token_id: string;
  deceased_owner_name: string;
  deceased_owner_reference?: string;
  status: SuccessionStatus;
  heirs: Heir[];
  notes?: string;
  opened_at: string;
  resolved_at?: string;
  updated_at: string;
}

// ── Community Land Trust ──────────────────────────────────────────────────
export type CltMembershipStatus = 'active' | 'resale_in_progress' | 'transferred' | 'terminated';

export interface ResaleCap {
  original_purchase_price: number;
  appreciation_cap_pct_per_year: number;
  computed_max_resale_price: number;
  computed_at: string;
}

export interface CltMembership {
  membership_id: string;
  token_id: string;
  trust_entity_name: string;
  household_owner_id: string;
  ground_lease_reference: string;
  ground_lease_annual_fee: number;
  original_purchase_price: number;
  appreciation_cap_pct_per_year: number;
  status: CltMembershipStatus;
  resale_history: ResaleCap[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type CltEligibilityStatus = 'pending' | 'approved' | 'rejected';

export interface CltEligibilityApplication {
  applicationId: string;
  applicantUserId: string;
  householdSize: number;
  monthlyHouseholdIncome: number;
  currency: string;
  employmentStatus: string;
  areaMedianIncomePct?: number;
  status: CltEligibilityStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Parcel consolidation ──────────────────────────────────────────────────
export type ConsolidationStatus = 'proposed' | 'voting' | 'consolidated' | 'dissolved';
export type ContributionStatus = 'pending' | 'committed' | 'exited';

export interface ParcelContribution {
  contribution_id: string;
  token_id: string;
  owner_id: string;
  parcel_valuation: number;
  ownership_pct: number;
  status: ContributionStatus;
  committed_at?: string;
  exited_at?: string;
  exit_reason?: string;
}

export interface ConsolidationVote {
  voter_owner_id: string;
  approve: boolean;
  voted_at: string;
}

export interface ParcelConsolidationProject {
  project_id: string;
  project_name: string;
  description: string;
  initiated_by: string;
  contributions: ParcelContribution[];
  status: ConsolidationStatus;
  approval_threshold_pct: number;
  votes: ConsolidationVote[];
  resulting_spv_id?: string;
  created_at: string;
  updated_at: string;
}

// ── Formalisation progressive de l'habitat informel ───────────────────────
export type FormalizationStage =
  | 'occupancy_declared' | 'occupancy_documented' | 'social_survey_completed'
  | 'provisional_permit_issued' | 'cadastral_surveyed' | 'dispute_window_cleared' | 'fully_recognized';

export type StageStatus = 'pending' | 'evidence_submitted' | 'verified' | 'rejected';

export interface StageEvidence {
  evidence_id: string;
  evidence_type: string;
  url: string;
  description: string;
  submitted_by: string;
  submitted_at: string;
}

export interface StageRecord {
  stage: FormalizationStage;
  status: StageStatus;
  evidence: StageEvidence[];
  reviewed_by?: string;
  review_notes?: string;
  verified_at?: string;
}

export interface InformalHousingFormalization {
  formalization_id: string;
  occupant_user_id: string;
  property_id?: string;
  property_address: string;
  jurisdiction: string;
  current_stage: FormalizationStage;
  stages: StageRecord[];
  resulting_token_id?: string;
  is_disputed: boolean;
  dispute_notes?: string;
  created_at: string;
  updated_at: string;
}

// ── Client ────────────────────────────────────────────────────────────────────
export class LandClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.LAND_URL) {
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
    let lastError: Error = new Error('Land service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Land service error');
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

  // ── Title ───────────────────────────────────────────────────────────────
  registerTitle(data: {
    propertyId: string; blockchain?: string; deedUrl: string; deedContent: string;
    notaryId?: string; jurisdiction: string; propertyAddress: string; propertyAreaSqm: number;
    cadastralReference?: string;
  }) {
    return this.request<LandTitle>('POST', '/titles', data);
  }
  getTitle(tokenId: string) {
    return this.request<LandTitle>('GET', `/titles/${tokenId}`);
  }
  getTitleByProperty(propertyId: string) {
    return this.request<LandTitle>('GET', `/titles/property/${propertyId}`);
  }
  addEncumbrance(tokenId: string, data: { encumbranceType: string; amount?: number; creditor?: string }) {
    return this.request<LandTitle>('POST', `/titles/${tokenId}/encumbrance`, data);
  }

  // ── Succession ──────────────────────────────────────────────────────────
  openSuccession(tokenId: string, data: { deceasedOwnerName: string; deceasedOwnerReference?: string }) {
    return this.request<SuccessionRecord>('POST', `/titles/${tokenId}/succession`, data);
  }
  getSuccessionByToken(tokenId: string) {
    return this.request<SuccessionRecord>('GET', `/titles/${tokenId}/succession`);
  }
  getSuccession(successionId: string) {
    return this.request<SuccessionRecord>('GET', `/successions/${successionId}`);
  }
  addHeir(successionId: string, data: { fullName: string; relationshipToDeceased: string }) {
    return this.request<SuccessionRecord>('POST', `/successions/${successionId}/heirs`, data);
  }
  submitHeirDocument(successionId: string, heirId: string, data: { documentUrl: string }) {
    return this.request<SuccessionRecord>('POST', `/successions/${successionId}/heirs/${heirId}/document`, data);
  }
  recognizeHeir(successionId: string, heirId: string, data: { recognized: boolean; declaredSharePct?: number }) {
    return this.request<SuccessionRecord>('POST', `/successions/${successionId}/heirs/${heirId}/recognize`, data);
  }
  disputeSuccession(successionId: string, data: { notes: string }) {
    return this.request<SuccessionRecord>('POST', `/successions/${successionId}/dispute`, data);
  }
  resolveSuccession(successionId: string, data: { transferToOwner?: string }) {
    return this.request<SuccessionRecord>('POST', `/successions/${successionId}/resolve`, data);
  }

  // ── Community Land Trust ──────────────────────────────────────────────
  openCltMembership(tokenId: string, data: {
    trustEntityName: string; householdOwnerId: string; groundLeaseReference: string;
    groundLeaseAnnualFee: number; originalPurchasePrice: number; appreciationCapPctPerYear: number;
  }) {
    return this.request<CltMembership>('POST', `/titles/${tokenId}/clt-membership`, data);
  }
  getCltMembershipByToken(tokenId: string) {
    return this.request<CltMembership>('GET', `/titles/${tokenId}/clt-membership`);
  }
  getCltMembership(membershipId: string) {
    return this.request<CltMembership>('GET', `/clt-memberships/${membershipId}`);
  }
  getCltMembershipsByHousehold(householdOwnerId: string) {
    return this.request<CltMembership[]>('GET', `/clt-memberships/household/${householdOwnerId}`);
  }
  requestCltResale(membershipId: string) {
    return this.request<CltMembership>('POST', `/clt-memberships/${membershipId}/resale/request`);
  }
  completeCltResale(membershipId: string, data: { newHouseholdOwnerId: string; txHash?: string }) {
    return this.request<CltMembership>('POST', `/clt-memberships/${membershipId}/resale/complete`, data);
  }
  terminateCltMembership(membershipId: string, data: { reason: string }) {
    return this.request<CltMembership>('POST', `/clt-memberships/${membershipId}/terminate`, data);
  }

  // ── CLT eligibility (means test) ───────────────────────────────────────
  applyForCltEligibility(data: {
    applicantUserId: string; householdSize: number; monthlyHouseholdIncome: number;
    currency?: string; employmentStatus: string; areaMedianIncomePct?: number;
  }) {
    return this.request<CltEligibilityApplication>('POST', '/clt-eligibility', data);
  }
  getCltEligibilityApplication(applicationId: string) {
    return this.request<CltEligibilityApplication>('GET', `/clt-eligibility/${applicationId}`);
  }
  getCltEligibilityApplicationsByApplicant(applicantUserId: string) {
    return this.request<CltEligibilityApplication[]>('GET', `/clt-eligibility/applicant/${applicantUserId}`);
  }
  getPendingCltEligibilityApplications() {
    return this.request<CltEligibilityApplication[]>('GET', '/clt-eligibility/pending');
  }
  reviewCltEligibilityApplication(applicationId: string, data: { approved: boolean; reviewerId: string; notes: string }) {
    return this.request<CltEligibilityApplication>('POST', `/clt-eligibility/${applicationId}/review`, data);
  }

  // ── Consolidation de parcelles ──────────────────────────────────────────
  createConsolidationProject(data: { projectName: string; description: string; initiatedBy: string; approvalThresholdPct: number }) {
    return this.request<ParcelConsolidationProject>('POST', '/consolidation', data);
  }
  getConsolidationProject(projectId: string) {
    return this.request<ParcelConsolidationProject>('GET', `/consolidation/${projectId}`);
  }
  getConsolidationProjectsByOwner(ownerId: string) {
    return this.request<ParcelConsolidationProject[]>('GET', `/consolidation/owner/${ownerId}`);
  }
  inviteContribution(projectId: string, data: { tokenId: string; ownerId: string; parcelValuation: number }) {
    return this.request<ParcelConsolidationProject>('POST', `/consolidation/${projectId}/contributions`, data);
  }
  commitContribution(projectId: string, contributionId: string) {
    return this.request<ParcelConsolidationProject>('POST', `/consolidation/${projectId}/contributions/${contributionId}/commit`);
  }
  exitContribution(projectId: string, contributionId: string, data: { reason: string }) {
    return this.request<ParcelConsolidationProject>('POST', `/consolidation/${projectId}/contributions/${contributionId}/exit`, data);
  }
  openConsolidationVote(projectId: string) {
    return this.request<ParcelConsolidationProject>('POST', `/consolidation/${projectId}/vote/open`);
  }
  castConsolidationVote(projectId: string, data: { voterOwnerId: string; approve: boolean }) {
    return this.request<ParcelConsolidationProject>('POST', `/consolidation/${projectId}/vote`, data);
  }
  finalizeConsolidation(projectId: string) {
    return this.request<ParcelConsolidationProject>('POST', `/consolidation/${projectId}/finalize`);
  }
  linkConsolidationToSpv(projectId: string, data: { spvId: string }) {
    return this.request<ParcelConsolidationProject>('POST', `/consolidation/${projectId}/link-spv`, data);
  }

  // ── Formalisation habitat informel ──────────────────────────────────────
  startInformalFormalization(data: { occupantUserId: string; propertyId?: string; propertyAddress: string; jurisdiction: string }) {
    return this.request<InformalHousingFormalization>('POST', '/informal-formalization', data);
  }
  getInformalFormalization(formalizationId: string) {
    return this.request<InformalHousingFormalization>('GET', `/informal-formalization/${formalizationId}`);
  }
  getInformalFormalizationsByOccupant(occupantUserId: string) {
    return this.request<InformalHousingFormalization[]>('GET', `/informal-formalization/occupant/${occupantUserId}`);
  }
  submitFormalizationEvidence(formalizationId: string, data: { evidenceType: string; url: string; description: string; submittedBy: string }) {
    return this.request<InformalHousingFormalization>('POST', `/informal-formalization/${formalizationId}/evidence`, data);
  }
  reviewFormalizationStage(formalizationId: string, data: { approved: boolean; reviewedBy: string; reviewNotes: string }) {
    return this.request<InformalHousingFormalization>('POST', `/informal-formalization/${formalizationId}/review`, data);
  }
  disputeInformalFormalization(formalizationId: string, data: { notes: string }) {
    return this.request<InformalHousingFormalization>('POST', `/informal-formalization/${formalizationId}/dispute`, data);
  }
  resolveInformalDispute(formalizationId: string) {
    return this.request<InformalHousingFormalization>('POST', `/informal-formalization/${formalizationId}/dispute/resolve`);
  }
}

let _sharedClient: LandClient | null = null;
export const getLandClient = (): LandClient => {
  if (!_sharedClient) _sharedClient = new LandClient();
  return _sharedClient;
};
