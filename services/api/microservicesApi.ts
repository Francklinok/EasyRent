/**
 * Microservices GraphQL API
 * Centralized GraphQL queries/mutations for all microservices
 * (RST, AMM, Stablecoin, AI Fund, Wallet extended, Crypto payments)
 */

import { getGraphQLService } from './graphqlService';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

// RST (Revenue Share Token)
export interface RSTProject {
  id?: string;
  projectId: string;
  ownerId?: string;
  propertyId?: string;
  propertyAddress: string;
  propertyType?: string;
  estimatedValueUsd?: number;
  targetAmountUsd: number;
  raisedAmountUsd: number;
  minInvestmentUsd: number;
  maxInvestmentUsd?: number;
  revenueSharePct: number;
  durationMonths: number;
  targetAnnualYield: number;
  maxReturnPct: number;
  baseMonthlyRent?: number;
  platformFeeBps?: number;
  distributionFeeBps?: number;
  performanceFeeBps?: number;
  totalInvestors: number;
  totalRstIssued?: number;
  currentOccupancy?: number;
  adaptiveYield?: number;
  esgScore?: number;
  aiRiskScore?: number;
  aiRecommendedShare?: number;
  status: 'draft' | 'active' | 'funded' | 'distributing' | 'completed' | 'cancelled';
  kycRequired?: boolean;
  accreditedOnly?: boolean;
  jurisdiction?: string;
  campaignStart?: string;
  campaignEnd?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RSTToken {
  id: string;
  tokenId: string;
  projectId: string;
  tokenSymbol: string;
  tokenName: string;
  standard: string;
  totalSupply: number;
  circulatingSupply: number;
  tokenPriceUsd: number;
  currentPriceUsd: number;
  maxReturnPct: number;
  totalDistributedUsd: number;
  expiryDate: string;
  isTransferable: boolean;
  whitelistOnly: boolean;
  holders: RSTHolder[];
  createdAt: string;
}

export interface RSTHolder {
  holderId: string;
  walletAddress: string;
  tokensHeld: number;
  tokensBurned: number;
  totalReceivedUsd: number;
  returnPct: number;
  capReached: boolean;
  kycVerified: boolean;
  acquiredAt: string;
  lastDistribution?: string;
}

export interface RSTDistribution {
  id: string;
  distributionId: string;
  projectId: string;
  periodMonth: string;
  grossRentCollected: number;
  occupancyRate: number;
  platformFee: number;
  distributionFee: number;
  performanceFee: number;
  insuranceReserve: number;
  netDistributable: number;
  perTokenAmount: number;
  totalHolders: number;
  distributedAt: string;
}

// SPV (Special Purpose Vehicle — Tokenisation via société)
export interface SPVProject {
  id?: string;
  spvId?: string;
  projectId?: string;
  propertyId?: string;
  propertyAddress: string;
  propertyType?: string;
  totalValue?: number;
  estimatedValueUsd?: number;
  currency?: string;
  totalShares: number;
  availableShares?: number;
  sharePrice?: number;
  pricePerShareUsd?: number;
  sharesSold?: number;
  minimumInvestment?: number;
  minInvestmentUsd?: number;
  maxInvestmentUsd?: number;
  maxInvestors?: number;
  currentInvestors?: number;
  jurisdiction: string;
  tokenStandard: string;
  status: 'draft' | 'active' | 'open' | 'fully_subscribed' | 'full' | 'closed';
  companyName?: string;
  companyRegistration?: string;
  esgScore?: number;
  annualYieldPct?: number;
  annualDividendYield?: number;
  occupancyRate?: number;
  kycRequired?: boolean;
  raisedAmountUsd?: number;
  targetAmountUsd?: number;
  createdAt?: string;
  activatedAt?: string;
}

export interface SPVShareholder {
  userId: string;
  spvId: string;
  sharesOwned: number;
  investedAmount: number;
  currency: string;
  shareValueUsd: number;
  returnToDate: number;
  kycLevel: string;
  acquiredAt: string;
}

// AMM
export interface AMMPool {
  id?: string;
  poolId: string;
  propertyId?: string;
  tokenA: string;
  tokenB: string;
  tokenASymbol?: string;
  tokenBSymbol?: string;
  reserveA: number;
  reserveB: number;
  kInvariant?: number;
  totalLpTokens?: number;
  totalLiquidityUsd: number;
  volume24hUsd: number;
  feeBps: number;
  swapFeeBps?: number;
  protocolFeeBps?: number;
  status?: 'active' | 'paused' | 'deprecated';
  volume24h?: number;
  volumeTotal?: number;
  feesCollected?: number;
  apy: number;
  lpIncentiveApy?: number;
  rewardPool?: number;
  priceHistory?: PricePoint[];
  createdAt: string;
}

export interface PricePoint {
  price: number;
  volume: number;
  recordedAt: string;
}

export interface SwapQuote {
  poolId: string;
  tokenIn?: string;
  tokenOut?: string;
  amountIn: number;
  amountOut: number;
  priceImpact: number;
  fee?: number;
  feeAmount?: number;
  rate: number;
  minAmountOut?: number;
}

// Stablecoin REC
export interface RECVault {
  id?: string;
  vaultId: string;
  ownerId?: string;
  userId?: string;
  propertyId?: string;
  collateralToken: string;
  collateralAmount: number;
  collateralValueUsd?: number;
  collateralPriceUsd?: number;
  recMinted: number;
  ltvApplied?: number;
  collateralizationRatio: number;
  liquidationThreshold: number;
  status: 'active' | 'liquidated' | 'closed';
  openedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// AI Fund
export interface FundPortfolio {
  id: string;
  portfolioId: string;
  fundName: string;
  strategy: 'balanced' | 'growth' | 'income' | 'defensive';
  totalAum: number;
  totalShares: number;
  navPerShare: number;
  performanceYtd: number;
  performanceAll: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  managementFeeBps: number;
  performanceFeeBps: number;
  minInvestment: number;
  investors: number;
  status: 'active' | 'paused' | 'closed';
  autoRebalance: boolean;
  lastRebalance: string;
  nextRebalance: string;
  positions: FundPosition[];
  createdAt: string;
}

export interface FundPosition {
  propertyId: string;
  propertyAddress: string;
  assetType: 'residential' | 'commercial' | 'industrial' | 'land';
  allocationPct: number;
  valueUsd: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  annualYield: number;
  esgScore: number;
  aiConfidence: number;
  openedAt: string;
}

export interface DAOProposal {
  id: string;
  proposalId: string;
  portfolioId: string;
  proposalType: 'buy' | 'sell' | 'rebalance' | 'strategy_change' | 'fee_update';
  title: string;
  description: string;
  status: 'pending' | 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorumRequired: number;
  votingStart: string;
  votingEnd: string;
  executedAt?: string;
  aiRecommendation?: AIRecommendation;
  actions: ProposalAction[];
  createdAt: string;
}

export interface AIRecommendation {
  algorithm: string;
  confidence: number;
  expectedReturn: number;
  riskScore: number;
  rationale: string;
  marketSignals: MarketSignal[];
}

export interface MarketSignal {
  signalType: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  description: string;
}

export interface ProposalAction {
  actionType: string;
  propertyId?: string;
  amountUsd?: number;
  targetPct?: number;
  expectedYield?: number;
  notes?: string;
}

export interface UserFundShare {
  userId: string;
  portfolioId: string;
  sharesOwned: number;
  investedUsd: number;
  currentValueUsd: number;
  unrealizedPnl: number;
  returnPct: number;
  investedAt: string;
}

// ─────────────────────────────────────────────
// GRAPHQL QUERIES — RST
// ─────────────────────────────────────────────

const RST_PROJECT_FIELDS = `
  id projectId ownerId propertyId propertyAddress propertyType
  estimatedValueUsd targetAmountUsd raisedAmountUsd
  minInvestmentUsd maxInvestmentUsd revenueSharePct
  durationMonths targetAnnualYield maxReturnPct baseMonthlyRent
  platformFeeBps distributionFeeBps performanceFeeBps
  totalInvestors totalRstIssued currentOccupancy adaptiveYield
  esgScore aiRiskScore aiRecommendedShare status
  kycRequired accreditedOnly jurisdiction
  campaignStart campaignEnd createdAt updatedAt
`;

const RST_TOKEN_FIELDS = `
  id tokenId projectId tokenSymbol tokenName standard
  totalSupply circulatingSupply tokenPriceUsd currentPriceUsd
  maxReturnPct totalDistributedUsd expiryDate
  isTransferable whitelistOnly createdAt
  holders {
    holderId walletAddress tokensHeld tokensBurned
    totalReceivedUsd returnPct capReached kycVerified
    acquiredAt lastDistribution
  }
`;

const RST_DISTRIBUTION_FIELDS = `
  id distributionId projectId periodMonth
  grossRentCollected occupancyRate platformFee distributionFee
  performanceFee insuranceReserve netDistributable
  perTokenAmount totalHolders distributedAt
`;

// ─────────────────────────────────────────────
// GRAPHQL QUERIES — AMM
// ─────────────────────────────────────────────

const AMM_POOL_FIELDS = `
  id poolId propertyId tokenASymbol tokenBSymbol
  reserveA reserveB kInvariant totalLpTokens
  swapFeeBps protocolFeeBps status
  volume24h volumeTotal feesCollected lpIncentiveApy rewardPool
  priceHistory { price volume recordedAt }
  createdAt
`;

// ─────────────────────────────────────────────
// GRAPHQL QUERIES — Vault REC
// ─────────────────────────────────────────────

const VAULT_FIELDS = `
  id vaultId ownerId propertyId collateralToken
  collateralAmount collateralPriceUsd recMinted
  collateralizationRatio liquidationThreshold
  status createdAt updatedAt
`;

// ─────────────────────────────────────────────
// GRAPHQL QUERIES — AI Fund
// ─────────────────────────────────────────────

const FUND_FIELDS = `
  id portfolioId fundName strategy
  totalAum totalShares navPerShare
  performanceYtd performanceAll sharpeRatio maxDrawdown volatility
  managementFeeBps performanceFeeBps minInvestment investors
  status autoRebalance lastRebalance nextRebalance
  positions {
    propertyId propertyAddress assetType allocationPct valueUsd
    entryPrice currentPrice unrealizedPnl annualYield esgScore aiConfidence openedAt
  }
  createdAt
`;

const DAO_PROPOSAL_FIELDS = `
  id proposalId portfolioId proposalType title description status
  votesFor votesAgainst votesAbstain quorumRequired
  votingStart votingEnd executedAt createdAt
  aiRecommendation {
    algorithm confidence expectedReturn riskScore rationale
    marketSignals { signalType direction strength description }
  }
  actions { actionType propertyId amountUsd targetPct expectedYield notes }
`;

// ─────────────────────────────────────────────
// SERVICE CLASS
// ─────────────────────────────────────────────

class MicroservicesApiService {
  private gql = getGraphQLService();

  // ── RST ────────────────────────────────────

  async createRSTProject(input: {
    propertyId: string;
    propertyAddress: string;
    targetAmountUsd: number;
    revenueSharePct: number;
    durationMonths: number;
    targetAnnualYield: number;
    maxReturnPct: number;
    baseMonthlyRent: number;
    minInvestmentUsd: number;
    jurisdiction: string;
  }): Promise<RSTProject> {
    const data = await this.gql.mutate<{ createRSTProject: RSTProject }>(`
      mutation CreateRSTProject($input: CreateRSTProjectInput!) {
        createRSTProject(input: $input) { ${RST_PROJECT_FIELDS} }
      }
    `, { input });
    return data.createRSTProject;
  }

  async createSPVProject(input: {
    propertyId: string;
    propertyAddress: string;
    totalValue: number;
    currency: string;
    totalShares: number;
    sharePrice: number;
    minimumInvestment: number;
    maxInvestors: number;
    jurisdiction: string;
    tokenStandard: string;
    companyName: string;
    companyRegistration: string;
    annualYieldPct: number;
    occupancyRate: number;
  }): Promise<SPVProject> {
    const data = await this.gql.mutate<{ createSPVProject: SPVProject }>(`
      mutation CreateSPVProject($input: CreateSPVProjectInput!) {
        createSPVProject(input: $input) {
          id spvId propertyId propertyAddress totalValue currency
          totalShares availableShares sharePrice minimumInvestment
          maxInvestors currentInvestors jurisdiction tokenStandard status
          companyName companyRegistration esgScore annualYieldPct
          occupancyRate createdAt activatedAt
        }
      }
    `, { input });
    return data.createSPVProject;
  }

  async getRSTProjects(filters?: { status?: string; ownerId?: string }): Promise<RSTProject[]> {
    const data = await this.gql.query<{ rstProjects: RSTProject[] }>(`
      query GetRSTProjects($filters: RSTProjectFilters) {
        rstProjects(filters: $filters) { ${RST_PROJECT_FIELDS} }
      }
    `, { filters });
    return data.rstProjects;
  }

  async getRSTProjectById(projectId: string): Promise<RSTProject> {
    const data = await this.gql.query<{ rstProject: RSTProject }>(`
      query GetRSTProject($projectId: ID!) {
        rstProject(projectId: $projectId) { ${RST_PROJECT_FIELDS} }
      }
    `, { projectId });
    return data.rstProject;
  }

  async investInRSTProject(input: {
    projectId: string;
    investorId: string;
    amountUsd: number;
    walletAddress: string;
  }): Promise<RSTToken> {
    const data = await this.gql.mutate<{ investInRSTProject: RSTToken }>(`
      mutation InvestInRST($input: RSTInvestInput!) {
        investInRSTProject(input: $input) { ${RST_TOKEN_FIELDS} }
      }
    `, { input });
    return data.investInRSTProject;
  }

  async getMyRSTHoldings(investorId: string): Promise<{ project: RSTProject; token: RSTToken; holder: RSTHolder }[]> {
    const data = await this.gql.query<{ myRSTHoldings: { project: RSTProject; token: RSTToken; holder: RSTHolder }[] }>(`
      query GetMyRSTHoldings($investorId: ID!) {
        myRSTHoldings(investorId: $investorId) {
          project { ${RST_PROJECT_FIELDS} }
          token { ${RST_TOKEN_FIELDS} }
          holder { holderId tokensHeld totalReceivedUsd returnPct capReached }
        }
      }
    `, { investorId });
    return data.myRSTHoldings;
  }

  async getRSTDistributions(projectId: string): Promise<RSTDistribution[]> {
    const data = await this.gql.query<{ rstDistributions: RSTDistribution[] }>(`
      query GetRSTDistributions($projectId: ID!) {
        rstDistributions(projectId: $projectId) { ${RST_DISTRIBUTION_FIELDS} }
      }
    `, { projectId });
    return data.rstDistributions;
  }

  // ── SPV ────────────────────────────────────

  async getSPVProjects(filters?: { status?: string }): Promise<SPVProject[]> {
    const data = await this.gql.query<{ spvProjects: SPVProject[] }>(`
      query GetSPVProjects($filters: SPVFilters) {
        spvProjects(filters: $filters) {
          id spvId propertyId propertyAddress totalValue currency
          totalShares availableShares sharePrice minimumInvestment
          maxInvestors currentInvestors jurisdiction tokenStandard status
          companyName companyRegistration esgScore annualYieldPct
          occupancyRate createdAt activatedAt
        }
      }
    `, { filters });
    return data.spvProjects;
  }

  async getSPVProject(spvId: string): Promise<SPVProject> {
    const data = await this.gql.query<{ spvProject: SPVProject }>(`
      query GetSPVProject($spvId: ID!) {
        spvProject(spvId: $spvId) {
          id spvId propertyId propertyAddress totalValue currency
          totalShares availableShares sharePrice minimumInvestment
          maxInvestors currentInvestors jurisdiction tokenStandard status
          companyName companyRegistration esgScore annualYieldPct
          occupancyRate createdAt activatedAt
        }
      }
    `, { spvId });
    return data.spvProject;
  }

  async subscribeSPV(input: {
    spvId: string;
    userId: string;
    sharesCount: number;
    walletAddress: string;
    kycLevel: string;
  }): Promise<SPVShareholder> {
    const data = await this.gql.mutate<{ subscribeSPV: SPVShareholder }>(`
      mutation SubscribeSPV($input: SPVSubscribeInput!) {
        subscribeSPV(input: $input) {
          userId spvId sharesOwned investedAmount currency
          shareValueUsd returnToDate kycLevel acquiredAt
        }
      }
    `, { input });
    return data.subscribeSPV;
  }

  async getMySPVShares(userId: string): Promise<SPVShareholder[]> {
    const data = await this.gql.query<{ mySPVShares: SPVShareholder[] }>(`
      query GetMySPVShares($userId: ID!) {
        mySPVShares(userId: $userId) {
          userId spvId sharesOwned investedAmount currency
          shareValueUsd returnToDate kycLevel acquiredAt
        }
      }
    `, { userId });
    return data.mySPVShares;
  }

  // ── AMM ────────────────────────────────────

  async getAMMPools(): Promise<AMMPool[]> {
    const data = await this.gql.query<{ ammPools: AMMPool[] }>(`
      query GetAMMPools {
        ammPools { ${AMM_POOL_FIELDS} }
      }
    `);
    // Normalize tokenASymbol/tokenBSymbol -> tokenA/tokenB
    return (data.ammPools || []).map(p => ({
      ...p,
      tokenA: p.tokenA || p.tokenASymbol || '',
      tokenB: p.tokenB || p.tokenBSymbol || '',
      totalLiquidityUsd: p.totalLiquidityUsd ?? 0,
      volume24hUsd: p.volume24hUsd ?? p.volume24h ?? 0,
      feeBps: p.feeBps ?? p.swapFeeBps ?? 30,
      apy: p.apy ?? p.lpIncentiveApy ?? 0,
    }));
  }

  async getAMMPool(poolId: string): Promise<AMMPool> {
    const data = await this.gql.query<{ ammPool: AMMPool }>(`
      query GetAMMPool($poolId: ID!) {
        ammPool(poolId: $poolId) { ${AMM_POOL_FIELDS} }
      }
    `, { poolId });
    return data.ammPool;
  }

  async getSwapQuote(input: {
    poolId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
  }): Promise<SwapQuote> {
    const data = await this.gql.query<{ swapQuote: SwapQuote }>(`
      query GetSwapQuote($poolId: ID!, $amountIn: Float!, $direction: SwapDirection!) {
        swapQuote(poolId: $poolId, amountIn: $amountIn, direction: AtoB) {
          poolId amountIn amountOut priceImpact fee rate
        }
      }
    `, { poolId: input.poolId, amountIn: input.amountIn, direction: 'AtoB' });
    return data.swapQuote;
  }

  async executeSwap(input: {
    poolId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    minAmountOut: number;
    userId?: string;
  }): Promise<{ txHash: string; amountOut: number; fee: number }> {
    const data = await this.gql.mutate<{ executeSwap: { txHash: string; amountOut: number; fee: number } }>(`
      mutation ExecuteSwap($input: SwapInput!) {
        executeSwap(input: $input) { txHash amountOut fee }
      }
    `, { input });
    return data.executeSwap;
  }

  async addLiquidity(input: {
    poolId: string;
    userId: string;
    amountA: number;
    amountB: number;
  }): Promise<{ lpTokensReceived: number; sharePercent: number }> {
    const data = await this.gql.mutate<{ addLiquidity: { lpTokensReceived: number; sharePercent: number } }>(`
      mutation AddLiquidity($input: AddLiquidityInput!) {
        addLiquidity(input: $input) { lpTokensReceived sharePercent }
      }
    `, { input });
    return data.addLiquidity;
  }

  async removeLiquidity(input: {
    poolId: string;
    userId: string;
    lpTokens: number;
  }): Promise<{ amountA: number; amountB: number }> {
    const data = await this.gql.mutate<{ removeLiquidity: { amountA: number; amountB: number } }>(`
      mutation RemoveLiquidity($input: RemoveLiquidityInput!) {
        removeLiquidity(input: $input) { amountA amountB }
      }
    `, { input });
    return data.removeLiquidity;
  }

  // ── Stablecoin REC ─────────────────────────

  async getMyVaults(userId?: string): Promise<RECVault[]> {
    const data = await this.gql.query<{ myVaults: RECVault[] }>(`
      query GetMyVaults($userId: ID!) {
        myVaults(userId: $userId) { ${VAULT_FIELDS} }
      }
    `, { userId: userId || '' });
    return data.myVaults;
  }

  async getVault(vaultId: string): Promise<RECVault> {
    const data = await this.gql.query<{ vault: RECVault }>(`
      query GetVault($vaultId: ID!) {
        vault(vaultId: $vaultId) { ${VAULT_FIELDS} }
      }
    `, { vaultId });
    return data.vault;
  }

  async openVault(input: {
    propertyId?: string;
    ownerId?: string;
    collateralToken: string;
    collateralAmount: number;
    collateralPriceUsd?: number;
    recToMint?: number;
  }): Promise<RECVault> {
    const data = await this.gql.mutate<{ openVault: RECVault }>(`
      mutation OpenVault($input: OpenVaultInput!) {
        openVault(input: $input) { ${VAULT_FIELDS} }
      }
    `, { input });
    return data.openVault;
  }

  async depositCollateral(vaultId: string, additionalAmount: number, priceUsd: number): Promise<RECVault> {
    const data = await this.gql.mutate<{ depositCollateral: RECVault }>(`
      mutation DepositCollateral($vaultId: ID!, $additionalAmount: Float!, $priceUsd: Float!) {
        depositCollateral(vaultId: $vaultId, additionalAmount: $additionalAmount, priceUsd: $priceUsd) { ${VAULT_FIELDS} }
      }
    `, { vaultId, additionalAmount, priceUsd });
    return data.depositCollateral;
  }

  async repayREC(vaultId: string, recToRepay: number, priceUsd: number): Promise<RECVault> {
    const data = await this.gql.mutate<{ repayREC: RECVault }>(`
      mutation RepayREC($vaultId: ID!, $recToRepay: Float!, $priceUsd: Float!) {
        repayREC(vaultId: $vaultId, recToRepay: $recToRepay, priceUsd: $priceUsd) { ${VAULT_FIELDS} }
      }
    `, { vaultId, recToRepay, priceUsd });
    return data.repayREC;
  }

  async withdrawCollateral(vaultId: string): Promise<RECVault> {
    const data = await this.gql.mutate<{ withdrawCollateral: RECVault }>(`
      mutation WithdrawCollateral($vaultId: ID!) {
        withdrawCollateral(vaultId: $vaultId) { ${VAULT_FIELDS} }
      }
    `, { vaultId });
    return data.withdrawCollateral;
  }

  // ── AI Fund ────────────────────────────────

  async getFunds(): Promise<FundPortfolio[]> {
    const data = await this.gql.query<{ fundPortfolios: FundPortfolio[] }>(`
      query GetFundPortfolios {
        fundPortfolios { ${FUND_FIELDS} }
      }
    `);
    return data.fundPortfolios;
  }

  async getFund(portfolioId: string): Promise<FundPortfolio> {
    const data = await this.gql.query<{ fundPortfolio: FundPortfolio }>(`
      query GetFundPortfolio($portfolioId: ID!) {
        fundPortfolio(portfolioId: $portfolioId) { ${FUND_FIELDS} }
      }
    `, { portfolioId });
    return data.fundPortfolio;
  }

  async getDAOProposals(portfolioId: string): Promise<DAOProposal[]> {
    const data = await this.gql.query<{ daoProposals: DAOProposal[] }>(`
      query GetDAOProposals($portfolioId: ID!) {
        daoProposals(portfolioId: $portfolioId) { ${DAO_PROPOSAL_FIELDS} }
      }
    `, { portfolioId });
    return data.daoProposals;
  }

  async voteOnProposal(input: {
    proposalId: string;
    voterId: string;
    vote: 'for' | 'against' | 'abstain';
    votingPower: number;
    reason?: string;
  }): Promise<DAOProposal> {
    const data = await this.gql.mutate<{ voteOnProposal: DAOProposal }>(`
      mutation VoteOnProposal($input: VoteInput!) {
        voteOnProposal(input: $input) { ${DAO_PROPOSAL_FIELDS} }
      }
    `, { input });
    return data.voteOnProposal;
  }

  async getMyFundShares(userId: string): Promise<UserFundShare[]> {
    const data = await this.gql.query<{ myFundShares: UserFundShare[] }>(`
      query GetMyFundShares($userId: ID!) {
        myFundShares(userId: $userId) {
          userId portfolioId sharesOwned investedUsd
          currentValueUsd unrealizedPnl returnPct investedAt
        }
      }
    `, { userId });
    return data.myFundShares;
  }

  async investInFund(input: {
    portfolioId: string;
    userId: string;
    amountUsd: number;
  }): Promise<UserFundShare> {
    const data = await this.gql.mutate<{ investInFund: UserFundShare }>(`
      mutation InvestInFund($input: FundInvestInput!) {
        investInFund(input: $input) {
          userId portfolioId sharesOwned investedUsd
          currentValueUsd unrealizedPnl returnPct investedAt
        }
      }
    `, { input });
    return data.investInFund;
  }
}

let instance: MicroservicesApiService | null = null;

export function getMicroservicesApi(): MicroservicesApiService {
  if (!instance) instance = new MicroservicesApiService();
  return instance;
}
