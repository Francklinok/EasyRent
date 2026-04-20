import { API_CONFIG } from '../../constants/apiConfig';

const RST = API_CONFIG.RST_URL;

export type ProposalStatus = 'active' | 'passed' | 'failed' | 'pending' | 'executed' | 'cancelled';
export type VoteChoice = 'for' | 'against' | 'abstain';

export interface DAOProposal {
  id: string;
  projectId: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  deadline: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  myVote?: VoteChoice | null;
  category: string;
  createdAt: string;
}

export interface DAOTreasury {
  balance: number;
  monthlyIncome: number;
  pendingPayouts: number;
  reserveFund: number;
  currency: string;
}

export interface DAOMember {
  userId: string;
  name: string;
  tokens: number;
  percentage: number;
  joinedAt: string;
}

export interface VotingPower {
  tokens: number;
  totalTokens: number;
  powerPct: number;
  projectName: string;
}

const daoService = {
  getActiveProposals: async (
    projectId: string
  ): Promise<DAOProposal[]> => {
    const res = await fetch(`${RST}/api/dao/projects/${projectId}/active`);
    if (!res.ok) throw new Error('Erreur chargement propositions');
    const json = await res.json();
    return (json.proposals || json.data || json) as DAOProposal[];
  },

  getProposalHistory: async (projectId: string): Promise<DAOProposal[]> => {
    const res = await fetch(`${RST}/api/dao/projects/${projectId}/history`);
    if (!res.ok) throw new Error('Erreur historique');
    const json = await res.json();
    return (json.proposals || json.data || json) as DAOProposal[];
  },

  getProposal: async (proposalId: string): Promise<DAOProposal> => {
    const res = await fetch(`${RST}/api/dao/proposals/${proposalId}`);
    if (!res.ok) throw new Error('Proposition introuvable');
    const json = await res.json();
    return (json.proposal || json) as DAOProposal;
  },

  vote: async (
    token: string,
    proposalId: string,
    vote: VoteChoice,
    voterAddress: string
  ): Promise<{ success: boolean; votesFor: number; votesAgainst: number }> => {
    const res = await fetch(`${RST}/api/dao/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ vote, voter_address: voterAddress }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Erreur vote');
    return json;
  },

  createProposal: async (
    token: string,
    data: {
      projectId: string;
      title: string;
      description: string;
      category: string;
      deadline: string;
      quorum: number;
    }
  ): Promise<DAOProposal> => {
    const res = await fetch(`${RST}/api/dao/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Erreur création proposition');
    return (json.proposal || json) as DAOProposal;
  },

  finalizeProposal: async (token: string, proposalId: string): Promise<void> => {
    const res = await fetch(`${RST}/api/dao/proposals/${proposalId}/finalize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erreur finalisation');
  },
};

export default daoService;
