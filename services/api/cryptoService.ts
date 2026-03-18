import { getGraphQLService } from './graphqlService';

// ========== CRYPTO PAYMENTS ==========
export interface CryptoPayment {
  id: string;
  paymentId: string;
  userId: string;
  propertyId: string;
  paymentType: PaymentType;
  cryptocurrency: Cryptocurrency;
  network: BlockchainNetwork;
  amount: number;
  amountFiat: number;
  fiatCurrency: string;
  exchangeRate: number;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  blockHeight?: number;
  confirmations: number;
  gasUsed?: number;
  gasPrice?: number;
  status: PaymentStatus;
  confirmationsRequired: number;
  smartContractAddress?: string;
  smartContractFunction?: string;
  contractInteractionData?: any;
  escrow?: EscrowInfo;
  recurring?: RecurringInfo;
  metadata: PaymentMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowInfo {
  isEscrow: boolean;
  escrowAddress?: string;
  releaseConditions: string[];
  releaseDate?: string;
  isReleased: boolean;
  releasedAt?: string;
  releasedTo?: string;
}

export interface RecurringInfo {
  isRecurring: boolean;
  frequency?: RecurringFrequency;
  nextPaymentDate?: string;
  endDate?: string;
  totalPayments?: number;
  completedPayments: number;
}

export interface PaymentMetadata {
  propertyAddress: string;
  landlordId: string;
  leaseId?: string;
  paymentDescription: string;
  invoiceNumber?: string;
}

// ========== PROPERTY TOKENS ==========
export interface PropertyToken {
  id: string;
  tokenId: string;
  propertyId: string;
  propertyDetails: PropertyDetails;
  tokenomics: PropertyTokenomics;
  blockchain: BlockchainDetails;
  ownership: OwnershipInfo;
  revenueSharing: RevenueSharing;
  trading: TradingInfo;
  governance: GovernanceInfo;
  compliance: ComplianceInfo;
  legal: LegalInfo;
  status: TokenStatus;
  valueMetrics: ValueMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDetails {
  address: string;
  propertyType: PropertyType;
  totalValue: number;
  currency: string;
  lastValuation: string;
}

export interface PropertyTokenomics {
  tokenSymbol: string;
  tokenName: string;
  totalSupply: number;
  circulatingSupply: number;
  tokenPrice: number;
  priceHistory: PriceHistoryPoint[];
  minimumInvestment: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  volume: number;
  marketCap: number;
}

export interface BlockchainDetails {
  network: BlockchainNetwork;
  contractAddress?: string;
  tokenStandard: TokenStandard;
  deploymentCost: number;
  gasOptimization: boolean;
}

export interface OwnershipInfo {
  totalOwners: number;
  ownershipDistribution: OwnershipDistribution[];
}

export interface OwnershipDistribution {
  ownerId: string;
  tokensOwned: number;
  ownershipPercentage: number;
  acquisitionDate: string;
  averagePurchasePrice: number;
  investmentAmount: number;
  kycStatus: KYCStatus;
  accreditedInvestor: boolean;
}

export interface RevenueSharing {
  enabled: boolean;
  distributionFrequency: DistributionFrequency;
  nextDistribution: string;
  totalRevenueDistributed: number;
  distributionHistory: RevenueDistribution[];
  reservePercentage: number;
  managementFee: number;
  expectedAnnualReturn: number;
}

export interface RevenueDistribution {
  period: string;
  totalRevenue: number;
  distributableAmount: number;
  managementFee: number;
  reserveAmount: number;
  distributionDate: string;
  distributions: IndividualDistribution[];
}

export interface IndividualDistribution {
  ownerId: string;
  amount: number;
  tokensOwned: number;
  ownershipPercentage: number;
  distributionDate: string;
  period: string;
  transactionHash: string;
}

export interface TradingInfo {
  isTradeEnabled: boolean;
  dexListings: DexListing[];
  tradingVolume24h: number;
  totalTradingVolume: number;
  priceDiscovery: PriceDiscoveryMethod;
  liquidityPool: LiquidityPoolInfo;
  orderBook: OrderBook;
}

export interface DexListing {
  exchange: string;
  pair: string;
  liquidity: number;
  volume24h: number;
  apr: number;
}

export interface LiquidityPoolInfo {
  totalLiquidity: number;
  providers: LiquidityProvider[];
  rewardRate: number;
}

export interface LiquidityProvider {
  providerId: string;
  liquidityProvided: number;
  rewardsEarned: number;
  joinDate: string;
}

export interface OrderBook {
  buyOrders: TradingOrder[];
  sellOrders: TradingOrder[];
  lastTrade?: LastTrade;
}

export interface TradingOrder {
  orderId: string;
  listingId?: string;
  sellerId?: string;
  buyerId?: string;
  tokensAmount: number;
  pricePerToken: number;
  totalValue: number;
  orderType: OrderType;
  status: OrderStatus;
  createdAt: string;
  expiresAt?: string;
  minimumBid?: number;
  reservePrice?: number;
  bids: Bid[];
  views: number;
  favorites: number;
}

export interface Bid {
  bidId: string;
  bidderId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  timestamp: string;
  status: BidStatus;
  escrowTxHash: string;
}

export interface LastTrade {
  price: number;
  quantity: number;
  timestamp: string;
  buyer: string;
  seller: string;
}

export interface GovernanceInfo {
  enabled: boolean;
  votingRights: VotingRights;
  quorum: number;
  proposals: Proposal[];
  votingHistory: Vote[];
}

export interface Proposal {
  proposalId: string;
  title: string;
  description: string;
  proposalType: ProposalType;
  proposer: string;
  createdAt: string;
  votingStart: string;
  votingEnd: string;
  status: ProposalStatus;
  votes: VoteTally;
  voters: Voter[];
  quorumReached: boolean;
  executed: boolean;
}

export interface VoteTally {
  for: number;
  against: number;
  abstain: number;
}

export interface Voter {
  userId: string;
  vote: VoteChoice;
  votingPower: number;
  timestamp: string;
}

export interface Vote {
  proposalId: string;
  vote: VoteChoice;
  votingPower: number;
  timestamp: string;
}

export interface ComplianceInfo {
  isCompliant: boolean;
  jurisdiction: string;
  regulations: string[];
  auditTrail: AuditEntry[];
  kycRequirement: boolean;
  accreditedInvestorOnly: boolean;
}

export interface AuditEntry {
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface LegalInfo {
  propertyDeed: string;
  operatingAgreement: string;
  prospectus: string;
  legalDocuments: LegalDocument[];
  custodian: string;
  propertyManager: string;
}

export interface LegalDocument {
  type: string;
  url: string;
  hash: string;
}

export interface ValueMetrics {
  currentValuation: number;
  occupancyRate: number;
  netOperatingIncome: number;
  capRate: number;
  appreciationRate: number;
  totalReturn: number;
  cashFlow: CashFlow;
}

export interface CashFlow {
  monthly: number;
  quarterly: number;
  annual: number;
}

// ========== UTILITY TOKENS ==========
export interface UtilityToken {
  id: string;
  tokenId: string;
  name: string;
  symbol: string;
  contractAddress?: string;
  blockchain: BlockchainNetwork;
  decimals: number;
  totalSupply: number;
  circulatingSupply: number;
  tokenomics: UtilityTokenomics;
  utilities: TokenUtilities;
  userBalances: UserBalance[];
  transactions: TokenTransaction[];
  platform: PlatformIntegration;
  economics: TokenEconomics;
  liquidity: LiquidityInfo;
  status: TokenStatus;
  launchDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UtilityTokenomics {
  initialPrice: number;
  currentPrice: number;
  priceHistory: PriceHistoryPoint[];
  distribution: TokenDistribution;
  vestingSchedules: VestingSchedule[];
}

export interface TokenDistribution {
  ecosystem: number;
  team: number;
  investors: number;
  platform: number;
  users: number;
}

export interface VestingSchedule {
  category: VestingCategory;
  totalTokens: number;
  releasedTokens: number;
  vestingPeriod: number;
  cliffPeriod: number;
  nextRelease: string;
  releaseAmount: number;
}

export interface TokenUtilities {
  feeDiscounts: FeeDiscounts;
  priorityAccess: PriorityAccess;
  staking: StakingUtility;
  governance: GovernanceUtility;
  cashback: CashbackUtility;
}

export interface FeeDiscounts {
  enabled: boolean;
  tiers: DiscountTier[];
}

export interface DiscountTier {
  minTokens: number;
  discountPercentage: number;
  description: string;
}

export interface PriorityAccess {
  enabled: boolean;
  minTokensRequired: number;
  benefits: string[];
}

export interface StakingUtility {
  enabled: boolean;
  apy: number;
  minStakeAmount: number;
  lockupPeriods: LockupPeriod[];
}

export interface LockupPeriod {
  duration: number;
  multiplier: number;
}

export interface GovernanceUtility {
  enabled: boolean;
  minTokensForProposal: number;
  votingPower: VotingPowerType;
  proposalDuration: number;
  proposals?: Proposal[];
}

export interface CashbackUtility {
  enabled: boolean;
  rate: number;
  maxCashbackPerTransaction: number;
  applicableServices: string[];
}

export interface UserBalance {
  userId: string;
  balance: number;
  stakedBalance: number;
  lockedBalance: number;
  lastUpdate: string;
  stakingInfo: StakingPosition[];
}

export interface StakingPosition {
  amount: number;
  startDate: string;
  lockupPeriod: number;
  rewardsAccrued: number;
  rewardsClaimed: number;
  lastClaimDate?: string;
}

export interface TokenTransaction {
  transactionId: string;
  type: TransactionType;
  from: string;
  to: string;
  amount: number;
  fee?: number;
  reason: string;
  metadata?: any;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
}

export interface PlatformIntegration {
  acceptedServices: AcceptedService[];
  usage: UsageMetrics;
}

export interface AcceptedService {
  serviceType: ServiceType;
  discountRate: number;
  acceptanceRate: number;
}

export interface UsageMetrics {
  totalTransactions: number;
  totalVolume: number;
  activeUsers: number;
  averageHoldingTime: number;
  utilityUsage: UtilityUsage;
}

export interface UtilityUsage {
  staking: number;
  feePayments: number;
  governance: number;
  cashback: number;
}

export interface TokenEconomics {
  burnMechanisms: BurnMechanisms;
  revenueStreams: RevenueStreams;
  buyback: BuybackProgram;
}

export interface BurnMechanisms {
  transactionBurn: TransactionBurn;
  periodicBurn: PeriodicBurn;
}

export interface TransactionBurn {
  enabled: boolean;
  burnRate: number;
}

export interface PeriodicBurn {
  enabled: boolean;
  frequency: BurnFrequency;
  burnAmount: number;
  nextBurn: string;
}

export interface RevenueStreams {
  platformFees: number;
  premiumSubscriptions: number;
  transactionFees: number;
  stakingFees: number;
}

export interface BuybackProgram {
  enabled: boolean;
  frequency: BuybackFrequency;
  percentage: number;
  lastBuyback: string;
  nextBuyback: string;
  totalBoughtBack: number;
}

export interface LiquidityInfo {
  dexListings: DexListing[];
  liquidityMining: LiquidityMining;
}

export interface LiquidityMining {
  enabled: boolean;
  pools: LiquidityMiningPool[];
}

export interface LiquidityMiningPool {
  pair: string;
  rewardRate: number;
  totalLiquidity: number;
  participants: number;
}

// ========== MARKETPLACE ==========
export interface MarketplaceListing {
  listingId: string;
  token: TokenInfo;
  sellerId: string;
  quantity: number;
  pricePerToken: number;
  currency: string;
  listingType: ListingType;
  highestBid?: number;
  bidCount: number;
  views: number;
  favorites: number;
  createdAt: string;
  expiresAt: string;
}

export interface TokenInfo {
  tokenId: string;
  name: string;
  symbol?: string;
  type: string;
  propertyType?: PropertyType;
  location?: string;
}

export interface TradingHistory {
  type: TradeType;
  tokenId: string;
  tokenName: string;
  quantity: number;
  pricePerToken: number;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  listingId?: string;
  bidId?: string;
}

// ========== PRICE DATA ==========
export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  lastUpdate: string;
  source: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
  source: string;
}

export interface MarketIndicators {
  cryptoMarket: CryptoMarketData;
  realEstateMarket: RealEstateMarketData;
  defiMetrics: DeFiMetrics;
}

export interface CryptoMarketData {
  totalMarketCap: number;
  fearGreedIndex: number;
  dominance: number;
}

export interface RealEstateMarketData {
  averageCapRate: number;
  priceAppreciation: number;
  rentalYield: number;
}

export interface DeFiMetrics {
  totalValueLocked: number;
  averageApy: number;
  liquidityIndex: number;
}

export interface HistoricalDataPoint {
  timestamp: string;
  price: number;
  volume: number;
}

// ========== DEFI POSITIONS ==========
export interface DeFiPosition {
  positionId: string;
  userId: string;
  poolId: string;
  type: PositionType;
  amount: number;
  asset?: string;
  collateralTokenId?: string;
  collateralAmount?: number;
  interestRate: number;
  createdAt: string;
  lastUpdate: string;
  interestAccrued: number;
  isActive: boolean;
  healthFactor?: number;
}

export interface UserDeFiSummary {
  totalValue: number;
  totalRewards: number;
  positionsCount: number;
  yieldFarming: number;
  lending: number;
  positions: DeFiPosition[];
}

export interface YieldFarmingPool {
  poolId: string;
  name: string;
  tokenA: string;
  tokenB: string;
  totalLiquidity: number;
  apy: number;
  totalStaked: number;
  rewardToken: string;
  rewardRate: number;
  participants: number;
  lockupPeriod: number;
  multiplier: number;
  isActive: boolean;
  createdAt: string;
}

export interface LendingPool {
  poolId: string;
  asset: string;
  totalSupply: number;
  totalBorrow: number;
  supplyRate: number;
  borrowRate: number;
  collateralFactor: number;
  liquidationThreshold: number;
  utilizationRate: number;
  isActive: boolean;
}

// ========== ANALYTICS ==========
export interface CryptoAnalytics {
  totalPortfolioValue: number;
  totalPayments: number;
  totalRevenue: number;
  activeTokens: number;
  stakingRewards: number;
  portfolioBreakdown: PortfolioItem[];
}

export interface PortfolioItem {
  type: string;
  name: string;
  value: number;
  percentage: number;
}

export interface UserPropertyToken {
  propertyToken: PropertyToken;
  tokensOwned: number;
  ownershipPercentage: number;
  investmentAmount: number;
  currentValue: number;
  unrealizedGains: number;
}

export interface UserUtilityToken {
  token: UtilityTokenInfo;
  balance: number;
  stakedBalance: number;
  pendingRewards: number;
  totalValue: number;
}

export interface UtilityTokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  currentPrice: number;
}

// ========== ENUMS ==========
export enum PaymentType {
  RENT = 'rent',
  PURCHASE = 'purchase',
  DEPOSIT = 'deposit',
  SECURITY_DEPOSIT = 'security_deposit',
  SERVICE_FEE = 'service_fee'
}

export enum Cryptocurrency {
  BTC = 'BTC',
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  MATIC = 'MATIC',
  BNB = 'BNB'
}

export enum BlockchainNetwork {
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BSC = 'bsc',
  AVALANCHE = 'avalanche'
}

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum RecurringFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  LAND = 'land'
}

export enum TokenStandard {
  ERC_20 = 'ERC_20',
  ERC_721 = 'ERC_721',
  ERC_1155 = 'ERC_1155'
}

export enum TokenStatus {
  DEVELOPMENT = 'development',
  TOKENIZED = 'tokenized',
  DEPLOYED = 'deployed',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export enum KYCStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum DistributionFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

export enum PriceDiscoveryMethod {
  ORACLE_BASED = 'oracle_based',
  AMM_BASED = 'amm_based',
  ORDER_BOOK = 'order_book',
  HYBRID = 'hybrid'
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  FIXED_PRICE = 'fixed_price',
  AUCTION = 'auction',
  DUTCH_AUCTION = 'dutch_auction'
}

export enum OrderStatus {
  OPEN = 'open',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SOLD = 'sold'
}

export enum BidStatus {
  ACTIVE = 'active',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum VotingRights {
  PROPORTIONAL = 'proportional',
  EQUAL = 'equal',
  WEIGHTED = 'weighted'
}

export enum ProposalType {
  PARAMETER_CHANGE = 'parameter_change',
  FEATURE_REQUEST = 'feature_request',
  TREASURY_ALLOCATION = 'treasury_allocation',
  PARTNERSHIP = 'partnership'
}

export enum ProposalStatus {
  ACTIVE = 'active',
  PASSED = 'passed',
  REJECTED = 'rejected',
  EXECUTED = 'executed',
  EXPIRED = 'expired'
}

export enum VoteChoice {
  FOR = 'for',
  AGAINST = 'against',
  ABSTAIN = 'abstain'
}

export enum VestingCategory {
  TEAM = 'team',
  INVESTORS = 'investors',
  ECOSYSTEM = 'ecosystem'
}

export enum VotingPowerType {
  LINEAR = 'linear',
  QUADRATIC = 'quadratic',
  WEIGHTED = 'weighted'
}

export enum TransactionType {
  MINT = 'mint',
  BURN = 'burn',
  TRANSFER = 'transfer',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  REWARD = 'reward',
  PURCHASE = 'purchase',
  REDEMPTION = 'redemption'
}

export enum ServiceType {
  RENTAL = 'rental',
  PURCHASE = 'purchase',
  MARKETPLACE = 'marketplace',
  PREMIUM_FEATURES = 'premium_features'
}

export enum BurnFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export enum BuybackFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export enum ListingType {
  FIXED_PRICE = 'fixed_price',
  AUCTION = 'auction',
  DUTCH_AUCTION = 'dutch_auction'
}

export enum TradeType {
  BUY = 'buy',
  SELL = 'sell'
}

export enum PositionType {
  SUPPLY = 'supply',
  BORROW = 'borrow',
  STAKE = 'stake',
  LIQUIDITY = 'liquidity'
}

// ========== INPUTS ==========
export interface CreateCryptoPaymentInput {
  userId: string;
  propertyId: string;
  paymentType: PaymentType;
  cryptocurrency: Cryptocurrency;
  network: BlockchainNetwork;
  amountFiat: number;
  fiatCurrency: string;
  fromAddress: string;
  toAddress: string;
  metadata: PaymentMetadataInput;
  recurring?: RecurringInfoInput;
  escrow?: EscrowInfoInput;
}

export interface PaymentMetadataInput {
  propertyAddress: string;
  landlordId: string;
  leaseId?: string;
  paymentDescription: string;
  invoiceNumber?: string;
}

export interface RecurringInfoInput {
  frequency: RecurringFrequency;
  endDate?: string;
  totalPayments: number;
}

export interface EscrowInfoInput {
  releaseConditions: string[];
  releaseDate?: string;
}

export interface TokenizePropertyInput {
  propertyId: string;
  propertyAddress: string;
  propertyValue: number;
  currency: string;
  totalTokens: number;
  tokenSymbol: string;
  tokenName: string;
  blockchain: BlockchainNetwork;
  ownerId: string;
  minimumInvestment: number;
  expectedAnnualReturn: number;
  propertyType: PropertyType;
  legalDocuments: LegalDocumentInput[];
}

export interface LegalDocumentInput {
  type: string;
  url: string;
  hash: string;
}

export interface BuyTokensInput {
  propertyTokenId: string;
  buyerId: string;
  tokensAmount: number;
  paymentMethod: string;
  walletAddress?: string;
}

export interface CreateUtilityTokenInput {
  name: string;
  symbol: string;
  totalSupply: number;
  initialPrice: number;
  blockchain: BlockchainNetwork;
  distribution: TokenDistributionInput;
}

export interface TokenDistributionInput {
  ecosystem: number;
  team: number;
  investors: number;
  platform: number;
  users: number;
}

export interface StakeTokensInput {
  userId: string;
  tokenId: string;
  amount: number;
  lockupPeriod: number;
}

export interface CreateProposalInput {
  proposerId: string;
  tokenId: string;
  title: string;
  description: string;
  proposalType: ProposalType;
  votingPeriod?: number;
}

export interface ListTokenInput {
  sellerId: string;
  tokenType: string;
  tokenId: string;
  quantity: number;
  pricePerToken: number;
  currency: string;
  listingType: ListingType;
  duration?: number;
  minimumBid?: number;
  reservePrice?: number;
}

export interface PlaceBidInput {
  bidderId: string;
  listingId: string;
  bidAmount: number;
  currency: string;
  walletAddress: string;
}

export interface CryptoFiltersInput {
  paymentType?: PaymentType;
  cryptocurrency?: Cryptocurrency;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface PropertyTokenFiltersInput {
  propertyType?: PropertyType;
  blockchain?: BlockchainNetwork;
  status?: TokenStatus;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export interface MarketplaceFiltersInput {
  tokenType?: string;
  priceRange?: PriceRangeInput;
  location?: string;
  propertyType?: PropertyType;
  sortBy?: string;
  limit?: number;
}

export interface PriceRangeInput {
  min: number;
  max: number;
}

export interface YieldFarmingStakeInput {
  userId: string;
  poolId: string;
  amount: number;
  lockupPeriod?: number;
}

export interface LendingActionInput {
  userId: string;
  poolId: string;
  amount: number;
  action: string;
  collateralTokenId?: string;
  collateralAmount?: number;
}

// ========== RESPONSE TYPES ==========
export interface CryptoPaymentList {
  payments: CryptoPayment[];
  total: number;
  hasMore: boolean;
}

export interface TokenPurchaseResult {
  success: boolean;
  transactionHash: string;
  tokensOwned: number;
  totalCost: number;
  newOwnershipPercentage: number;
}

export interface TokenSaleResult {
  success: boolean;
  orderId: string;
  orderType: OrderType;
  status: string;
}

/**
 * Service pour gérer les fonctionnalités crypto (paiements, tokens, DeFi)
 */
export class CryptoService {
  private graphql = getGraphQLService();

  // ========== CRYPTO PAYMENTS ==========

  /**
   * Récupère un paiement crypto par son ID
   */
  async getCryptoPayment(paymentId: string): Promise<CryptoPayment | null> {
    const query = `
      query GetCryptoPayment($paymentId: String!) {
        getCryptoPayment(paymentId: $paymentId) {
          id
          paymentId
          userId
          propertyId
          paymentType
          cryptocurrency
          network
          amount
          amountFiat
          fiatCurrency
          exchangeRate
          transactionHash
          fromAddress
          toAddress
          blockHeight
          confirmations
          gasUsed
          gasPrice
          status
          confirmationsRequired
          smartContractAddress
          smartContractFunction
          escrow {
            isEscrow
            escrowAddress
            releaseConditions
            releaseDate
            isReleased
            releasedAt
            releasedTo
          }
          recurring {
            isRecurring
            frequency
            nextPaymentDate
            endDate
            totalPayments
            completedPayments
          }
          metadata {
            propertyAddress
            landlordId
            leaseId
            paymentDescription
            invoiceNumber
          }
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphql.query<{ getCryptoPayment: CryptoPayment }>(
      query,
      { paymentId }
    );
    return result.getCryptoPayment;
  }

  /**
   * Récupère les paiements crypto d'un utilisateur
   */
  async getUserCryptoPayments(
    userId: string,
    filters?: CryptoFiltersInput
  ): Promise<CryptoPaymentList> {
    const query = `
      query GetUserCryptoPayments($userId: String!, $filters: CryptoFiltersInput) {
        getUserCryptoPayments(userId: $userId, filters: $filters) {
          payments {
            id
            paymentId
            userId
            propertyId
            paymentType
            cryptocurrency
            network
            amount
            amountFiat
            fiatCurrency
            status
            transactionHash
            confirmations
            confirmationsRequired
            createdAt
            metadata {
              propertyAddress
              paymentDescription
            }
          }
          total
          hasMore
        }
      }
    `;

    const result = await this.graphql.query<{ getUserCryptoPayments: CryptoPaymentList }>(
      query,
      { userId, filters }
    );
    return result.getUserCryptoPayments;
  }

  /**
   * Crée un nouveau paiement crypto
   */
  async createCryptoPayment(input: CreateCryptoPaymentInput): Promise<CryptoPayment> {
    const mutation = `
      mutation CreateCryptoPayment($input: CreateCryptoPaymentInput!) {
        createCryptoPayment(input: $input) {
          id
          paymentId
          userId
          propertyId
          paymentType
          cryptocurrency
          network
          amount
          amountFiat
          fiatCurrency
          exchangeRate
          transactionHash
          fromAddress
          toAddress
          status
          confirmations
          confirmationsRequired
          metadata {
            propertyAddress
            landlordId
            paymentDescription
          }
          createdAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ createCryptoPayment: CryptoPayment }>(
      mutation,
      { input }
    );
    return result.createCryptoPayment;
  }

  /**
   * Traite un paiement crypto
   */
  async processCryptoPayment(
    paymentId: string,
    transactionHash: string
  ): Promise<CryptoPayment> {
    const mutation = `
      mutation ProcessCryptoPayment($paymentId: String!, $transactionHash: String!) {
        processCryptoPayment(paymentId: $paymentId, transactionHash: $transactionHash) {
          id
          paymentId
          status
          transactionHash
          confirmations
          updatedAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ processCryptoPayment: CryptoPayment }>(
      mutation,
      { paymentId, transactionHash }
    );
    return result.processCryptoPayment;
  }

  // ========== PROPERTY TOKENS ==========

  /**
   * Récupère un token de propriété par son ID
   */
  async getPropertyToken(tokenId: string): Promise<PropertyToken | null> {
    const query = `
      query GetPropertyToken($tokenId: String!) {
        getPropertyToken(tokenId: $tokenId) {
          id
          tokenId
          propertyId
          propertyDetails {
            address
            propertyType
            totalValue
            currency
            lastValuation
          }
          tokenomics {
            tokenSymbol
            tokenName
            totalSupply
            circulatingSupply
            tokenPrice
            minimumInvestment
            priceHistory {
              date
              price
              volume
              marketCap
            }
          }
          blockchain {
            network
            contractAddress
            tokenStandard
            deploymentCost
            gasOptimization
          }
          ownership {
            totalOwners
            ownershipDistribution {
              ownerId
              tokensOwned
              ownershipPercentage
              acquisitionDate
              investmentAmount
            }
          }
          revenueSharing {
            enabled
            distributionFrequency
            nextDistribution
            totalRevenueDistributed
            expectedAnnualReturn
          }
          trading {
            isTradeEnabled
            tradingVolume24h
            totalTradingVolume
            priceDiscovery
          }
          status
          valueMetrics {
            currentValuation
            occupancyRate
            netOperatingIncome
            capRate
            appreciationRate
            totalReturn
            cashFlow {
              monthly
              quarterly
              annual
            }
          }
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphql.query<{ getPropertyToken: PropertyToken }>(
      query,
      { tokenId }
    );
    return result.getPropertyToken;
  }

  /**
   * Récupère la liste des tokens de propriété
   */
  async getPropertyTokens(filters?: PropertyTokenFiltersInput): Promise<PropertyToken[]> {
    const query = `
      query GetPropertyTokens($filters: PropertyTokenFiltersInput) {
        getPropertyTokens(filters: $filters) {
          id
          tokenId
          propertyId
          propertyDetails {
            address
            propertyType
            totalValue
            currency
          }
          tokenomics {
            tokenSymbol
            tokenName
            tokenPrice
            minimumInvestment
          }
          blockchain {
            network
            tokenStandard
          }
          status
          valueMetrics {
            currentValuation
            occupancyRate
            totalReturn
          }
          createdAt
        }
      }
    `;

    const result = await this.graphql.query<{ getPropertyTokens: PropertyToken[] }>(
      query,
      { filters }
    );
    return result.getPropertyTokens;
  }

  /**
   * Récupère les tokens de propriété d'un utilisateur
   */
  async getUserPropertyTokens(userId: string): Promise<UserPropertyToken[]> {
    const query = `
      query GetUserPropertyTokens($userId: String!) {
        getUserPropertyTokens(userId: $userId) {
          propertyToken {
            id
            tokenId
            propertyDetails {
              address
              propertyType
              totalValue
            }
            tokenomics {
              tokenSymbol
              tokenName
              tokenPrice
            }
            valueMetrics {
              currentValuation
              totalReturn
            }
          }
          tokensOwned
          ownershipPercentage
          investmentAmount
          currentValue
          unrealizedGains
        }
      }
    `;

    const result = await this.graphql.query<{ getUserPropertyTokens: UserPropertyToken[] }>(
      query,
      { userId }
    );
    return result.getUserPropertyTokens;
  }

  /**
   * Tokenise une propriété
   */
  async tokenizeProperty(input: TokenizePropertyInput): Promise<PropertyToken> {
    const mutation = `
      mutation TokenizeProperty($input: TokenizePropertyInput!) {
        tokenizeProperty(input: $input) {
          id
          tokenId
          propertyId
          propertyDetails {
            address
            propertyType
            totalValue
            currency
          }
          tokenomics {
            tokenSymbol
            tokenName
            totalSupply
            tokenPrice
            minimumInvestment
          }
          blockchain {
            network
            contractAddress
            tokenStandard
          }
          status
          createdAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ tokenizeProperty: PropertyToken }>(
      mutation,
      { input }
    );
    return result.tokenizeProperty;
  }

  /**
   * Achète des tokens de propriété
   */
  async buyPropertyTokens(input: BuyTokensInput): Promise<TokenPurchaseResult> {
    const mutation = `
      mutation BuyPropertyTokens($input: BuyTokensInput!) {
        buyPropertyTokens(input: $input) {
          success
          transactionHash
          tokensOwned
          totalCost
          newOwnershipPercentage
        }
      }
    `;

    const result = await this.graphql.mutate<{ buyPropertyTokens: TokenPurchaseResult }>(
      mutation,
      { input }
    );
    return result.buyPropertyTokens;
  }

  // ========== UTILITY TOKENS ==========

  /**
   * Récupère un utility token par son ID
   */
  async getUtilityToken(tokenId: string): Promise<UtilityToken | null> {
    const query = `
      query GetUtilityToken($tokenId: String!) {
        getUtilityToken(tokenId: $tokenId) {
          id
          tokenId
          name
          symbol
          contractAddress
          blockchain
          decimals
          totalSupply
          circulatingSupply
          tokenomics {
            initialPrice
            currentPrice
            distribution {
              ecosystem
              team
              investors
              platform
              users
            }
          }
          utilities {
            feeDiscounts {
              enabled
              tiers {
                minTokens
                discountPercentage
                description
              }
            }
            staking {
              enabled
              apy
              minStakeAmount
            }
            governance {
              enabled
              minTokensForProposal
              votingPower
            }
          }
          status
          launchDate
          createdAt
        }
      }
    `;

    const result = await this.graphql.query<{ getUtilityToken: UtilityToken }>(
      query,
      { tokenId }
    );
    return result.getUtilityToken;
  }

  /**
   * Récupère les utility tokens d'un utilisateur
   */
  async getUserUtilityTokens(userId: string): Promise<UserUtilityToken[]> {
    const query = `
      query GetUserUtilityTokens($userId: String!) {
        getUserUtilityTokens(userId: $userId) {
          token {
            tokenId
            name
            symbol
            currentPrice
          }
          balance
          stakedBalance
          pendingRewards
          totalValue
        }
      }
    `;

    const result = await this.graphql.query<{ getUserUtilityTokens: UserUtilityToken[] }>(
      query,
      { userId }
    );
    return result.getUserUtilityTokens;
  }

  /**
   * Stake des utility tokens
   */
  async stakeUtilityTokens(input: StakeTokensInput): Promise<boolean> {
    const mutation = `
      mutation StakeUtilityTokens($input: StakeTokensInput!) {
        stakeUtilityTokens(input: $input)
      }
    `;

    const result = await this.graphql.mutate<{ stakeUtilityTokens: boolean }>(
      mutation,
      { input }
    );
    return result.stakeUtilityTokens;
  }

  /**
   * Récupère les récompenses de staking
   */
  async claimStakingRewards(userId: string, tokenId: string): Promise<number> {
    const mutation = `
      mutation ClaimStakingRewards($userId: String!, $tokenId: String!) {
        claimStakingRewards(userId: $userId, tokenId: $tokenId)
      }
    `;

    const result = await this.graphql.mutate<{ claimStakingRewards: number }>(
      mutation,
      { userId, tokenId }
    );
    return result.claimStakingRewards;
  }

  // ========== MARKETPLACE ==========

  /**
   * Récupère les listings du marketplace
   */
  async getMarketplaceListings(filters?: MarketplaceFiltersInput): Promise<MarketplaceListing[]> {
    const query = `
      query GetMarketplaceListings($filters: MarketplaceFiltersInput) {
        getMarketplaceListings(filters: $filters) {
          listingId
          token {
            tokenId
            name
            symbol
            type
            propertyType
            location
          }
          sellerId
          quantity
          pricePerToken
          currency
          listingType
          highestBid
          bidCount
          views
          favorites
          createdAt
          expiresAt
        }
      }
    `;

    const result = await this.graphql.query<{ getMarketplaceListings: MarketplaceListing[] }>(
      query,
      { filters }
    );
    return result.getMarketplaceListings;
  }

  /**
   * Met en vente des tokens
   */
  async listTokensForSale(input: ListTokenInput): Promise<string> {
    const mutation = `
      mutation ListTokensForSale($input: ListTokenInput!) {
        listTokensForSale(input: $input)
      }
    `;

    const result = await this.graphql.mutate<{ listTokensForSale: string }>(
      mutation,
      { input }
    );
    return result.listTokensForSale;
  }

  /**
   * Place une enchère
   */
  async placeBid(input: PlaceBidInput): Promise<boolean> {
    const mutation = `
      mutation PlaceBid($input: PlaceBidInput!) {
        placeBid(input: $input)
      }
    `;

    const result = await this.graphql.mutate<{ placeBid: boolean }>(mutation, { input });
    return result.placeBid;
  }

  // ========== DEFI ==========

  /**
   * Récupère les pools de yield farming
   */
  async getYieldFarmingPools(): Promise<YieldFarmingPool[]> {
    const query = `
      query GetYieldFarmingPools {
        getYieldFarmingPools {
          poolId
          name
          tokenA
          tokenB
          totalLiquidity
          apy
          totalStaked
          rewardToken
          rewardRate
          participants
          lockupPeriod
          multiplier
          isActive
          createdAt
        }
      }
    `;

    const result = await this.graphql.query<{ getYieldFarmingPools: YieldFarmingPool[] }>(query);
    return result.getYieldFarmingPools;
  }

  /**
   * Récupère les pools de lending
   */
  async getLendingPools(): Promise<LendingPool[]> {
    const query = `
      query GetLendingPools {
        getLendingPools {
          poolId
          asset
          totalSupply
          totalBorrow
          supplyRate
          borrowRate
          collateralFactor
          liquidationThreshold
          utilizationRate
          isActive
        }
      }
    `;

    const result = await this.graphql.query<{ getLendingPools: LendingPool[] }>(query);
    return result.getLendingPools;
  }

  /**
   * Récupère les positions DeFi d'un utilisateur
   */
  async getUserDeFiPositions(userId: string): Promise<UserDeFiSummary> {
    const query = `
      query GetUserDeFiPositions($userId: String!) {
        getUserDeFiPositions(userId: $userId) {
          totalValue
          totalRewards
          positionsCount
          yieldFarming
          lending
          positions {
            positionId
            userId
            poolId
            type
            amount
            asset
            interestRate
            interestAccrued
            isActive
            createdAt
            lastUpdate
          }
        }
      }
    `;

    const result = await this.graphql.query<{ getUserDeFiPositions: UserDeFiSummary }>(
      query,
      { userId }
    );
    return result.getUserDeFiPositions;
  }

  /**
   * Stake dans un pool de yield farming
   */
  async stakeInYieldFarm(input: YieldFarmingStakeInput): Promise<boolean> {
    const mutation = `
      mutation StakeInYieldFarm($input: YieldFarmingStakeInput!) {
        stakeInYieldFarm(input: $input)
      }
    `;

    const result = await this.graphql.mutate<{ stakeInYieldFarm: boolean }>(mutation, { input });
    return result.stakeInYieldFarm;
  }

  // ========== PRICE DATA ==========

  /**
   * Récupère les prix des cryptomonnaies
   */
  async getCryptoPrices(symbols: string[]): Promise<PriceData[]> {
    const query = `
      query GetCryptoPrices($symbols: [String!]!) {
        getCryptoPrices(symbols: $symbols) {
          symbol
          price
          change24h
          volume24h
          marketCap
          lastUpdate
          source
        }
      }
    `;

    const result = await this.graphql.query<{ getCryptoPrices: PriceData[] }>(
      query,
      { symbols }
    );
    return result.getCryptoPrices;
  }

  /**
   * Récupère le taux de change entre deux devises
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const query = `
      query GetExchangeRate($from: String!, $to: String!) {
        getExchangeRate(from: $from, to: $to) {
          from
          to
          rate
          timestamp
          source
        }
      }
    `;

    const result = await this.graphql.query<{ getExchangeRate: ExchangeRate }>(
      query,
      { from, to }
    );
    return result.getExchangeRate;
  }

  /**
   * Récupère les indicateurs de marché
   */
  async getMarketIndicators(): Promise<MarketIndicators> {
    const query = `
      query GetMarketIndicators {
        getMarketIndicators {
          cryptoMarket {
            totalMarketCap
            fearGreedIndex
            dominance
          }
          realEstateMarket {
            averageCapRate
            priceAppreciation
            rentalYield
          }
          defiMetrics {
            totalValueLocked
            averageApy
            liquidityIndex
          }
        }
      }
    `;

    const result = await this.graphql.query<{ getMarketIndicators: MarketIndicators }>(query);
    return result.getMarketIndicators;
  }

  /**
   * Récupère les analytics crypto d'un utilisateur
   */
  async getCryptoAnalytics(userId: string): Promise<CryptoAnalytics> {
    const query = `
      query GetCryptoAnalytics($userId: String!) {
        getCryptoAnalytics(userId: $userId) {
          totalPortfolioValue
          totalPayments
          totalRevenue
          activeTokens
          stakingRewards
          portfolioBreakdown {
            type
            name
            value
            percentage
          }
        }
      }
    `;

    const result = await this.graphql.query<{ getCryptoAnalytics: CryptoAnalytics }>(
      query,
      { userId }
    );
    return result.getCryptoAnalytics;
  }
}

// Instance unique du service crypto
let cryptoServiceInstance: CryptoService | null = null;

/**
 * Récupère l'instance du service crypto
 */
export function getCryptoService(): CryptoService {
  if (!cryptoServiceInstance) {
    cryptoServiceInstance = new CryptoService();
  }
  return cryptoServiceInstance;
}