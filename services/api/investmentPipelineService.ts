import { buildApiUrl } from '@/constants/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token =
    (await AsyncStorage.getItem('@auth_access_token')) ||
    (await AsyncStorage.getItem('token')) ||
    '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── RST Request ─────────────────────────────────────────────────────────────

export interface RSTProposedTerms {
  revenueSharePct?: number;
  targetAnnualYield?: number;
  maxReturnPct?: number;
}

export interface RSTRequestInput {
  propertyId: string;
  workCostEstimate: number;
  currency: 'XAF' | 'USD' | 'EUR';
  estimatedMonthlyRent: number;
  estimatedSalePrice?: number;
  objective: 'rental' | 'sale';
  renovationDurationMonths: number;
  projectDescription: string;
  documents?: Array<{ type: string; name: string; base64?: string }>;
  proposedTerms?: RSTProposedTerms;
}

export interface RSTRequest extends RSTRequestInput {
  _id: string;
  status: 'pending_review' | 'analyzing' | 'approved' | 'rejected' | 'published';
  ownerId: string;
  platformNotes?: string;
  scoringResult?: {
    riskLevel: 'low' | 'medium' | 'high';
    legalValidation: boolean;
    rentabilityScore: number;
    aiRiskScore?: number;
  };
  approvedTerms?: {
    revenueSharePct: number;
    targetAnnualYield: number;
    maxReturnPct: number;
  };
  rejectionReason?: string;
  rstProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── DEV Proposal ────────────────────────────────────────────────────────────

export interface DEVProposalInput {
  propertyId?: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: { latitude: number; longitude: number };
  };
  proposedProjectType:
    | 'hotel' | 'apartment_complex' | 'commercial' | 'mixed'
    | 'industrial' | 'healthcare' | 'education' | 'agricultural'
    | 'infrastructure' | 'tourism' | 'other';
  projectTypeOther?: string;
  // Un projet à contribution volontaire (ex: école communautaire) ne peut
  // être converti qu'en SPV — voir POST /dev-proposals/:id/convert.
  nature?: 'for_profit' | 'community_contribution';
  // Uniquement pertinent quand nature==='for_profit' — comment l'actif
  // génère un revenu (une usine/hôpital n'a pas de "loyer" au sens
  // classique). Informatif, ne bloque aucune validation.
  revenueModel?: {
    type: 'rental' | 'lease_to_operator' | 'subsidy' | 'ppp' | 'direct_sale' | 'other';
    description?: string;
  };
  // Uniquement pertinent quand nature==='community_contribution' ET
  // propertyId défini (bien existant lié) — obligatoire avant conversion
  // dans ce cas. 'buyout' : le propriétaire est payé au déblocage de
  // l'escrow SPV. 'donation' : cession gratuite, le donateur devient
  // actionnaire de la SPV. Voir POST /dev-proposals/:id/convert.
  acquisitionMode?: 'buyout' | 'donation';
  // Prix demandé par le proposeur pour un rachat — informatif, l'admin peut
  // fixer un purchasePrice différent à la conversion.
  askingPrice?: number;
  constructionStage: 'raw_land' | 'in_progress' | 'built_needs_renovation';
  constructionProgressPct?: number;
  budgetAlreadySpent?: number;
  description: string;
  estimatedBudget?: number;
  currency: 'XAF' | 'USD' | 'EUR';
  siteSurfaceM2?: number;
  projectTimelineMonths?: number;
  sponsorProfile?: {
    organizationName?: string;
    yearsExperience?: number;
    trackRecord?: string;
  };
  identifiedPartners?: Array<{ name: string; role: string; contact?: string }>;
  documents?: Array<{ type: string; name: string; base64?: string }>;
}

export interface DEVProposal extends DEVProposalInput {
  _id: string;
  proposerId: string;
  status: 'submitted' | 'analyzing' | 'validated' | 'launched' | 'rejected';
  opportunityScore?: number;
  aiAnalysis?: {
    zonePotential: number;
    suggestedProjectType?: string;
    predictedROI?: number;
  };
  // Vérification humaine de la propriété du terrain par un admin — requise
  // pour valider une proposition sans propertyId (terrain jamais listé sur
  // la plateforme). Voir POST /dev-proposals/:id/convert côté backend.
  ownershipVerified?: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── SPV Project (partner only) ──────────────────────────────────────────────

export interface SPVProjectInput {
  companyName: string;
  companyRegistration?: string;
  jurisdiction?: string;
  totalShares: number;
  sharePrice: number;
  currency?: 'XAF' | 'USD' | 'EUR';
  minimumInvestment?: number;
  maximumInvestment?: number;
  maxInvestors?: number;
  tokenStandard?: string;
  annualYieldPct?: number;
  occupancyRate?: number;
  // Transmis tel quel au microservice property-engine (CreateSPVRequest.
  // kyc_required/accredited_only) — pas de durationMonths : une SPV n'a pas
  // d'horizon fixe (contrairement au RST), elle détient l'actif jusqu'à
  // liquidation votée en gouvernance DAO.
  kycRequired?: boolean;
  accreditedOnly?: boolean;
  // Secteur de l'actif principal (industrial, healthcare, education,
  // agricultural, infrastructure, tourism, hotel...) et comment il génère
  // un revenu — transmis tel quel au microservice property-engine
  // (CreateSPVRequest.asset_category/revenue_model, chaînes libres côté
  // Rust). Informatif, ne bloque aucune validation.
  assetCategory?: string;
  revenueModel?: string;
  // Une SPV peut posséder des biens déjà listés sur EasyRent ('easyrent',
  // liés via propertyRef à un vrai Property — nom/adresse/photos viennent
  // alors de ce bien) et/ou des actifs externes sans fiche EasyRent
  // ('external', ex: pharmacie, clinique, entrepôt — saisis manuellement).
  // Un seul actif de type 'easyrent' peut être désigné comme actif
  // principal (voir propertyId ci-dessous) : c'est le seul transmis au
  // microservice property-engine, qui n'accepte qu'un property_id.
  spvProperties?: Array<{
    type: 'easyrent' | 'external';
    propertyRef?: string;
    name: string;
    address: string;
    assetCategory?: string;
    legalReference?: string;
    estimatedValue?: number;
    images?: string[];
  }>;
  projectDescription: string;
  documents?: Array<{ type: string; name: string }>;
  // Bien EasyRent désigné comme actif principal — doit correspondre au
  // propertyRef d'un item spvProperties de type 'easyrent'. Optionnel : une
  // SPV composée uniquement d'actifs externes n'en a pas (le bridge
  // microservice est alors simplement non déclenché côté backend).
  propertyId?: string;
}

export interface SPVProject extends SPVProjectInput {
  _id: string;
  partnerId: string;
  status: 'draft' | 'submitted' | 'analyzing' | 'approved' | 'rejected' | 'published';
  platformNotes?: string;
  legalValidation?: boolean;
  rejectionReason?: string;
  spvId?: string;
  // Présent uniquement quand cette SPV provient d'une conversion DEV
  // community_contribution sur un bien existant (rachat ou don).
  landAcquisition?: {
    mode: 'buyout' | 'donation';
    ownerId: string;
    propertyId: string;
    purchasePrice?: number;
    currency: 'XAF' | 'USD' | 'EUR';
    status: 'pending_payment' | 'paid' | 'donated' | 'failed';
    shareholderTokensGranted?: number;
    paidAt?: string;
    failureReason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Partner Application (KYB) ───────────────────────────────────────────────

export interface PartnerApplicationInput {
  companyName: string;
  companyRegistration?: string;
  jurisdiction?: string;
  businessType: 'promoter' | 'developer' | 'fund' | 'other';
  businessTypeOther?: string;
  contactFullName: string;
  contactPhone?: string;
  contactEmail: string;
  projectDescription: string;
  estimatedProjectCount?: number;
  averageProjectBudget?: number;
  currency?: 'XAF' | 'USD' | 'EUR';
  documents?: Array<{ type: string; name: string; url?: string; base64?: string }>;
}

export interface PartnerApplication extends PartnerApplicationInput {
  _id: string;
  applicantId: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  platformNotes?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

// ─── Admin status update payload ─────────────────────────────────────────────

export interface RSTStatusUpdate {
  status: RSTRequest['status'];
  platformNotes?: string;
  rejectionReason?: string;
  scoringResult?: RSTRequest['scoringResult'];
  rstProjectId?: string;
}

export interface SPVStatusUpdate {
  status: SPVProject['status'];
  platformNotes?: string;
  rejectionReason?: string;
  legalValidation?: boolean;
  spvId?: string;
}

export interface DEVStatusUpdate {
  status: DEVProposal['status'];
  platformNotes?: string;
  rejectionReason?: string;
  opportunityScore?: number;
  aiAnalysis?: DEVProposal['aiAnalysis'];
  devProjectId?: string;
  // Requis pour passer à 'validated' quand la proposition n'a pas de
  // propertyId lié — voir PATCH /dev-proposals/:id/status côté backend.
  ownershipVerified?: boolean;
}

// ─── Paginated list response ──────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
}

class InvestmentPipelineService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = buildApiUrl('api/investment');
  }

  // ── RST ────────────────────────────────────────────────────────────────────

  async submitRSTRequest(input: RSTRequestInput): Promise<RSTRequest> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/rst-requests`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission RST');
    return data.data;
  }

  async getMyRSTRequests(): Promise<RSTRequest[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/rst-requests/my`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  }

  async getRSTRequest(id: string): Promise<RSTRequest> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/rst-requests/${id}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  }

  // Admin
  async getAllRSTRequests(status?: string, page = 1, limit = 20): Promise<PaginatedResponse<RSTRequest>> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    const res = await fetch(`${this.baseUrl}/rst-requests?${params}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return { data: data.data, total: data.total, page: data.page };
  }

  async updateRSTStatus(id: string, update: RSTStatusUpdate): Promise<RSTRequest> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/rst-requests/${id}/status`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur mise à jour statut RST');
    return data.data;
  }

  // ── DEV Proposals ──────────────────────────────────────────────────────────

  async submitDEVProposal(input: DEVProposalInput): Promise<DEVProposal> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/dev-proposals`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission DEV');
    return data.data;
  }

  async getMyDEVProposals(): Promise<DEVProposal[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/dev-proposals/my`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  }

  // Admin
  async getAllDEVProposals(status?: string, page = 1, limit = 20): Promise<PaginatedResponse<DEVProposal>> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    const res = await fetch(`${this.baseUrl}/dev-proposals?${params}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return { data: data.data, total: data.total, page: data.page };
  }

  async updateDEVStatus(id: string, update: DEVStatusUpdate): Promise<DEVProposal> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/dev-proposals/${id}/status`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur mise à jour statut DEV');
    return data.data;
  }

  // ── SPV Projects (partner) ─────────────────────────────────────────────────

  async submitSPVProject(input: SPVProjectInput): Promise<SPVProject> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/spv-projects`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission SPV');
    return data.data;
  }

  async getMySPVProjects(): Promise<SPVProject[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/spv-projects/my`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  }

  // Listing public — toute SPV avec status==='published', consommé par
  // app/invest/spv/index.tsx. Ouvert à tout utilisateur authentifié (pas
  // besoin d'être partenaire/admin, contrairement à /my et à la liste admin).
  async getPublishedSPVProjects(): Promise<SPVProject[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/spv-projects/published`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  }

  // Ajoute un actif à une SPV déjà publiée (ex: acquisition après
  // lancement) — visible immédiatement, pas de revalidation admin. Rejeté
  // côté serveur si le projet n'est pas encore publié (voir POST
  // /spv-projects/:id/assets).
  async addSPVAsset(projectId: string, asset: {
    type: 'easyrent' | 'external';
    propertyRef?: string;
    name: string;
    address: string;
    assetCategory?: string;
    legalReference?: string;
    estimatedValue?: number;
    images?: string[];
  }): Promise<SPVProject> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/spv-projects/${projectId}/assets`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'ajout du bien');
    return data.data;
  }

  // Admin
  async getAllSPVProjects(status?: string, page = 1, limit = 20): Promise<PaginatedResponse<SPVProject>> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    const res = await fetch(`${this.baseUrl}/spv-projects?${params}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return { data: data.data, total: data.total, page: data.page };
  }

  async updateSPVStatus(id: string, update: SPVStatusUpdate): Promise<SPVProject> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/spv-projects/${id}/status`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur mise à jour statut SPV');
    return data.data;
  }

  // ── Partner Applications ───────────────────────────────────────────────────

  async submitPartnerApplication(input: PartnerApplicationInput): Promise<PartnerApplication> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/partner-applications`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission');
    return data.data;
  }

  async getMyPartnerApplications(): Promise<PartnerApplication[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/partner-applications/my`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  }

  // Admin
  async getAllPartnerApplications(status?: string, page = 1, limit = 20): Promise<PaginatedResponse<PartnerApplication>> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    const res = await fetch(`${this.baseUrl}/partner-applications?${params}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return { data: data.data, total: data.total, page: data.page };
  }

  async updatePartnerApplicationStatus(
    id: string,
    update: { status: PartnerApplication['status']; platformNotes?: string; rejectionReason?: string }
  ): Promise<PartnerApplication> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/partner-applications/${id}/status`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur mise à jour statut');
    return data.data;
  }
}

let _instance: InvestmentPipelineService | null = null;
export const getInvestmentPipelineService = () => {
  if (!_instance) _instance = new InvestmentPipelineService();
  return _instance;
};
