import { getGraphQLService } from './graphqlService';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
  cryptoBalances: CryptoBalance[];
  createdAt: string;
  updatedAt: string;

  // Computed fields
  totalBalance: number;
  formattedBalance: string;
  recentTransactions: Transaction[];
}

export interface CryptoBalance {
  currency: 'BTC' | 'ETH' | 'LTC' | 'BCH' | 'XRP' | 'ADA' | 'DOT';
  amount: number;
  value: number;
  formattedValue: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'payment' | 'received' | 'crypto' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethodId?: string;
  cryptoCurrency?: 'BTC' | 'ETH' | 'LTC' | 'BCH' | 'XRP' | 'ADA' | 'DOT';
  recipientId?: string;
  metadata?: TransactionMetadata;
  createdAt: string;
  updatedAt: string;

  // Computed fields
  formattedAmount: string;
  isIncoming: boolean;
  statusColor: string;
}

export interface TransactionMetadata {
  propertyId?: string;
  serviceId?: string;
  subscriptionId?: string;
  reservationId?: string;
  contractId?: string;
  fees?: TransactionFees;
  exchangeRate?: number;
  originalAmount?: number;
  originalCurrency?: string;
  reference?: string;
  notes?: string;
}

export interface TransactionFees {
  platform: number;
  payment: number;
  conversion: number;
  total: number;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank' | 'paypal' | 'mobile_money' | 'crypto';
  name: string;
  details: PaymentMethodDetails;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;

  // Computed fields
  displayName: string;
  maskedDetails: string;
}

export interface PaymentMethodDetails {
  last4?: string;
  expiry?: string;
  iban?: string;
  email?: string;
  phoneNumber?: string;
  cryptoAddress?: string;
  brand?: string;
  country?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'wallet' | 'property' | 'service' | 'general' | 'security' | 'reminder';
  category: 'transaction' | 'payment' | 'transfer' | 'rent' | 'reservation' | 'maintenance' | 'message' | 'alert';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  type?: 'payment' | 'received' | 'crypto' | 'deposit' | 'withdrawal';
  status?: 'completed' | 'pending' | 'failed' | 'cancelled';
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethodId?: string;
}

export interface NotificationFilters {
  type?: 'wallet' | 'property' | 'service' | 'general' | 'security' | 'reminder';
  category?: 'transaction' | 'payment' | 'transfer' | 'rent' | 'reservation' | 'maintenance' | 'message' | 'alert';
  isRead?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationInput {
  first?: number;
  after?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface WalletStats {
  totalTransactions: number;
  totalVolume: number;
  averageTransaction: number;
  transactionsByType: Array<{
    type: string;
    count: number;
    volume: number;
    percentage: number;
  }>;
  transactionsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyVolume: Array<{
    month: string;
    volume: number;
    transactions: number;
  }>;
  topPaymentMethods: Array<{
    method: string;
    count: number;
    volume: number;
    percentage: number;
  }>;
}

// Enhanced wallet interfaces for crypto integration
export interface EnhancedWallet {
  id: string;
  userId: string;
  fiatCurrencies: FiatCurrency[];
  cryptoCurrencies: CryptoCurrency[];
  paymentMethods: EnhancedPaymentMethod[];
  transactions: EnhancedTransaction[];
  stats: WalletStats;
  settings: WalletSettings;
  security: WalletSecurity;
  compliance: ComplianceInfo;
  createdAt: string;
  updatedAt: string;
}

export interface FiatCurrency {
  code: string;
  name: string;
  balance: number;
  isDefault: boolean;
  lastUpdated: string;
}

export interface CryptoCurrency {
  symbol: string;
  name: string;
  balance: number;
  balanceUSD: number;
  balanceEUR: number;
  walletAddress?: string;
  lastUpdated: string;
  priceData?: CryptoPriceData;
}

export interface CryptoPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
}

export interface EnhancedPaymentMethod {
  id: string;
  type: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE' | 'CRYPTO_WALLET';
  provider: string;
  accountInfo: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface EnhancedTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'CRYPTO_PURCHASE' | 'CRYPTO_SALE' | 'PROPERTY_PAYMENT' | 'RENT_PAYMENT' | 'REFUND' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'FEE_PAYMENT' | 'EXCHANGE';
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'UNDER_REVIEW';
  description?: string;
  fromAddress?: string;
  toAddress?: string;
  externalTransactionId?: string;
  paymentMethod?: string;
  fees: number;
  exchangeRate?: number;
  originalAmount?: number;
  originalCurrency?: string;
  timestamp: string;
  confirmations?: number;
  blockHash?: string;
  metadata?: TransactionMetadata;
  riskScore?: number;
  securityChecks?: SecurityCheck;
}

export interface WalletSettings {
  defaultCurrency: string;
  enableNotifications: boolean;
  autoConvertSmallAmounts: boolean;
  preferredPaymentMethod?: string;
  maxDailyLimit: number;
  enableTwoFactor: boolean;
  language: string;
  timezone: string;
}

export interface WalletSecurity {
  isKYCVerified: boolean;
  verificationLevel: 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'PHONE_VERIFIED' | 'ID_VERIFIED' | 'FULLY_VERIFIED';
  lastSecurityCheck?: string;
  suspiciousActivityCount: number;
  isLocked: boolean;
  lockReason?: string;
  trustedDevices: string[];
  loginAttempts: number;
  lastLogin?: string;
}

export interface ComplianceInfo {
  kycStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'EXPIRED';
  amlChecks: AMLCheck[];
  sanctionScreening?: SanctionScreening;
  riskProfile: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'PROHIBITED';
  reportingThreshold: number;
  lastComplianceCheck?: string;
}

export interface AMLCheck {
  id: string;
  type: string;
  status: string;
  result: string;
  timestamp: string;
  details?: string;
}

export interface SanctionScreening {
  isClean: boolean;
  lastCheck: string;
  sources: string[];
  alerts: string[];
}

export interface SecurityCheck {
  passed: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  recommendations: string[];
  blockTransaction: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
  propertyId?: string;
  bookingId?: string;
  toAddress?: string;
  metadata?: PaymentMetadataInput;
}

export interface PaymentMetadataInput {
  propertyId?: string;
  bookingId?: string;
  contractId?: string;
  userAgent?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  geolocation?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'UNDER_REVIEW';
  amount: number;
  currency: string;
  fees: number;
  estimatedCompletion?: string;
  confirmationRequired: boolean;
  confirmationUrl?: string;
  error?: string;
  securityCheck?: SecurityCheck;
}

export interface PriceConversion {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: string;
  provider: string;
}

// Mobile Money interfaces
export interface MobileMoneyProvider {
  id: string;
  name: string;
  shortCode: string;
  country: string;
  countryCode: string;
  currency: string;
  logo?: string;
  isActive: boolean;
  supportedOperations: ('deposit' | 'withdrawal' | 'transfer')[];
  fees: {
    deposit: number;
    withdrawal: number;
    transfer: number;
    minimum: number;
    maximum: number;
  };
  limits: {
    minTransaction: number;
    maxTransaction: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
}

export interface MobileMoneyAccount {
  id: string;
  providerId: string;
  providerName: string;
  phoneNumber: string;
  accountName: string;
  countryCode: string;
  currency: string;
  isVerified: boolean;
  isDefault: boolean;
  balance?: number;
  lastSyncAt?: string;
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    currentDailyUsage: number;
    currentMonthlyUsage: number;
  };
  fees: {
    deposit: number;
    withdrawal: number;
    transfer: number;
  };
  metadata: {
    lastTransactionAt?: string;
    totalTransactions: number;
    totalVolume: number;
    averageTransactionAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PhoneNumberValidation {
  isValid: boolean;
  formattedNumber?: string;
  suggestedProvider?: string;
  error?: string;
}

export interface MobileMoneyFees {
  feeAmount: number;
  feePercentage: number;
  totalAmount: number;
}

export interface CountryInfo {
  name: string;
  currency: string;
  flag: string;
}

export interface SupportedCountries {
  [countryCode: string]: CountryInfo;
}

/**
 * Service pour les opérations liées au wallet
 */
export class WalletService {
  private graphqlService = getGraphQLService();

  /**
   * Récupère les informations du wallet de l'utilisateur connecté
   */
  async getWallet(): Promise<Wallet> {
    const query = `
      query GetWallet {
        wallet {
          id
          userId
          balance
          pendingBalance
          currency
          cryptoBalances {
            currency
            amount
            value
            formattedValue
          }
          createdAt
          updatedAt
          totalBalance
          formattedBalance
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ wallet: Wallet }>(query);
      return response.wallet;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  }

  /**
   * Récupère une transaction par son ID
   */
  async getTransaction(id: string): Promise<Transaction | null> {
    const query = `
      query GetTransaction($id: ID!) {
        transaction(id: $id) {
          id
          userId
          type
          amount
          currency
          description
          status
          paymentMethodId
          cryptoCurrency
          recipientId
          metadata {
            propertyId
            serviceId
            subscriptionId
            reservationId
            contractId
            reference
            notes
          }
          createdAt
          updatedAt
          formattedAmount
          isIncoming
          statusColor
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ transaction: Transaction }>(
        query,
        { id }
      );
      return response.transaction;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Récupère les transactions avec filtres et pagination
   */
  async getTransactions(
    filters?: TransactionFilters,
    pagination?: PaginationInput
  ): Promise<{
    edges: Array<{ node: Transaction; cursor: string }>;
    pageInfo: any;
    totalCount: number;
  }> {
    const query = `
      query GetTransactions($filters: TransactionFilters, $pagination: PaginationInput) {
        transactions(filters: $filters, pagination: $pagination) {
          edges {
            node {
              id
              userId
              type
              amount
              currency
              description
              status
              paymentMethodId
              cryptoCurrency
              recipientId
              createdAt
              updatedAt
              formattedAmount
              isIncoming
              statusColor
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ transactions: any }>(
        query,
        { filters, pagination }
      );
      return response.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Récupère les méthodes de paiement
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const query = `
      query GetPaymentMethods {
        paymentMethods {
          id
          userId
          type
          name
          details {
            last4
            expiry
            iban
            email
            phoneNumber
            cryptoAddress
            brand
            country
          }
          isDefault
          isActive
          createdAt
          displayName
          maskedDetails
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ paymentMethods: PaymentMethod[] }>(query);
      return response.paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques du wallet
   */
  async getWalletStats(dateFrom?: string, dateTo?: string): Promise<WalletStats> {
    const query = `
      query GetWalletStats($dateFrom: String, $dateTo: String) {
        walletStats(dateFrom: $dateFrom, dateTo: $dateTo) {
          totalTransactions
          totalVolume
          averageTransaction
          transactionsByType {
            type
            count
            volume
            percentage
          }
          transactionsByStatus {
            status
            count
            percentage
          }
          monthlyVolume {
            month
            volume
            transactions
          }
          topPaymentMethods {
            method
            count
            volume
            percentage
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ walletStats: WalletStats }>(
        query,
        { dateFrom, dateTo }
      );
      return response.walletStats;
    } catch (error) {
      console.error('Error fetching wallet stats:', error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle transaction
   */
  async createTransaction(input: {
    type: 'payment' | 'received' | 'crypto' | 'deposit' | 'withdrawal';
    amount: number;
    currency?: string;
    description: string;
    paymentMethodId?: string;
    cryptoCurrency?: 'BTC' | 'ETH' | 'LTC' | 'BCH' | 'XRP' | 'ADA' | 'DOT';
    recipientId?: string;
    metadata?: any;
  }): Promise<Transaction> {
    const mutation = `
      mutation CreateTransaction($input: CreateTransactionInput!) {
        createTransaction(input: $input) {
          id
          userId
          type
          amount
          currency
          description
          status
          paymentMethodId
          cryptoCurrency
          recipientId
          createdAt
          updatedAt
          formattedAmount
          isIncoming
          statusColor
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ createTransaction: Transaction }>(
        mutation,
        { input }
      );
      return response.createTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Effectue un transfert d'argent
   */
  async transferMoney(input: {
    recipientId: string;
    amount: number;
    currency?: string;
    description: string;
    paymentMethodId?: string;
  }): Promise<Transaction> {
    const mutation = `
      mutation TransferMoney($input: TransferMoneyInput!) {
        transferMoney(input: $input) {
          id
          userId
          type
          amount
          currency
          description
          status
          recipientId
          createdAt
          updatedAt
          formattedAmount
          isIncoming
          statusColor
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ transferMoney: Transaction }>(
        mutation,
        { input }
      );
      return response.transferMoney;
    } catch (error) {
      console.error('Error transferring money:', error);
      throw error;
    }
  }

  /**
   * Ajoute une méthode de paiement
   */
  async addPaymentMethod(input: {
    type: 'card' | 'bank' | 'paypal' | 'mobile_money' | 'crypto';
    name: string;
    details: PaymentMethodDetails;
    isDefault?: boolean;
  }): Promise<PaymentMethod> {
    const mutation = `
      mutation AddPaymentMethod($input: CreatePaymentMethodInput!) {
        addPaymentMethod(input: $input) {
          id
          userId
          type
          name
          details {
            last4
            expiry
            iban
            email
            phoneNumber
            cryptoAddress
            brand
            country
          }
          isDefault
          isActive
          createdAt
          displayName
          maskedDetails
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ addPaymentMethod: PaymentMethod }>(
        mutation,
        { input }
      );
      return response.addPaymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Supprime une méthode de paiement
   */
  async deletePaymentMethod(id: string): Promise<boolean> {
    const mutation = `
      mutation DeletePaymentMethod($id: ID!) {
        deletePaymentMethod(id: $id)
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ deletePaymentMethod: boolean }>(
        mutation,
        { id }
      );
      return response.deletePaymentMethod;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  /**
   * Récupère les notifications
   */
  async getNotifications(
    filters?: NotificationFilters,
    pagination?: PaginationInput
  ): Promise<{
    edges: Array<{ node: Notification; cursor: string }>;
    pageInfo: any;
    totalCount: number;
    unreadCount: number;
  }> {
    const query = `
      query GetNotifications($filters: NotificationFilters, $pagination: PaginationInput) {
        notifications(filters: $filters, pagination: $pagination) {
          edges {
            node {
              id
              userId
              type
              category
              title
              message
              isRead
              priority
              createdAt
              updatedAt
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
          unreadCount
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ notifications: any }>(
        query,
        { filters, pagination }
      );
      return response.notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markNotificationAsRead(id: string): Promise<Notification> {
    const mutation = `
      mutation MarkNotificationAsRead($id: ID!) {
        markNotificationAsRead(id: $id) {
          id
          isRead
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ markNotificationAsRead: Notification }>(
        mutation,
        { id }
      );
      return response.markNotificationAsRead;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllNotificationsAsRead(): Promise<number> {
    const mutation = `
      mutation MarkAllNotificationsAsRead {
        markAllNotificationsAsRead
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ markAllNotificationsAsRead: number }>(
        mutation
      );
      return response.markAllNotificationsAsRead;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  async getUnreadNotificationsCount(): Promise<number> {
    const query = `
      query GetUnreadNotificationsCount {
        unreadNotificationsCount
      }
    `;

    try {
      const response = await this.graphqlService.query<{ unreadNotificationsCount: number }>(query);
      return response.unreadNotificationsCount;
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      throw error;
    }
  }

  // Enhanced wallet methods for crypto integration

  /**
   * Récupère le wallet amélioré avec crypto
   */
  async getEnhancedWallet(): Promise<EnhancedWallet> {
    const query = `
      query GetEnhancedWallet {
        enhancedWallet {
          id
          userId
          fiatCurrencies {
            code
            name
            balance
            isDefault
            lastUpdated
          }
          cryptoCurrencies {
            symbol
            name
            balance
            balanceUSD
            balanceEUR
            walletAddress
            lastUpdated
            priceData {
              symbol
              name
              price
              change24h
              marketCap
              volume24h
              lastUpdated
            }
          }
          paymentMethods {
            id
            type
            provider
            accountInfo
            isDefault
            isVerified
            createdAt
            lastUsed
          }
          stats {
            totalTransactions
            totalVolume
            averageTransaction
          }
          settings {
            defaultCurrency
            enableNotifications
            autoConvertSmallAmounts
            preferredPaymentMethod
            maxDailyLimit
            enableTwoFactor
            language
            timezone
          }
          security {
            isKYCVerified
            verificationLevel
            lastSecurityCheck
            suspiciousActivityCount
            isLocked
            lockReason
            trustedDevices
            loginAttempts
            lastLogin
          }
          compliance {
            kycStatus
            riskProfile
            reportingThreshold
            lastComplianceCheck
          }
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ enhancedWallet: EnhancedWallet }>(query);
      return response.enhancedWallet;
    } catch (error) {
      console.error('Error fetching enhanced wallet:', error);
      throw error;
    }
  }

  /**
   * Traite un paiement via le système unifié
   */
  async processUnifiedPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const mutation = `
      mutation ProcessUnifiedPayment($request: PaymentRequest!) {
        processUnifiedPayment(request: $request) {
          success
          transactionId
          status
          amount
          currency
          fees
          estimatedCompletion
          confirmationRequired
          confirmationUrl
          error
          securityCheck {
            passed
            riskLevel
            reasons
            recommendations
            blockTransaction
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ processUnifiedPayment: PaymentResponse }>(
        mutation,
        { request }
      );
      return response.processUnifiedPayment;
    } catch (error) {
      console.error('Error processing unified payment:', error);
      throw error;
    }
  }

  /**
   * Achète de la crypto via le système unifié
   */
  async purchaseCryptoUnified(input: {
    amount: number;
    currency: string;
    cryptoCurrency: string;
    paymentMethod: string;
  }): Promise<PaymentResponse> {
    const mutation = `
      mutation PurchaseCryptoUnified($input: CryptoPurchaseInput!) {
        purchaseCryptoUnified(input: $input) {
          success
          transactionId
          status
          amount
          currency
          fees
          estimatedCompletion
          confirmationRequired
          confirmationUrl
          error
          securityCheck {
            passed
            riskLevel
            reasons
            recommendations
            blockTransaction
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ purchaseCryptoUnified: PaymentResponse }>(
        mutation,
        { input }
      );
      return response.purchaseCryptoUnified;
    } catch (error) {
      console.error('Error purchasing crypto:', error);
      throw error;
    }
  }

  /**
   * Convertit une devise
   */
  async convertCurrency(
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<PriceConversion> {
    const query = `
      query ConvertCurrency($fromCurrency: String!, $toCurrency: String!, $amount: Float!) {
        convertCurrency(fromCurrency: $fromCurrency, toCurrency: $toCurrency, amount: $amount) {
          fromCurrency
          toCurrency
          fromAmount
          toAmount
          rate
          timestamp
          provider
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ convertCurrency: PriceConversion }>(
        query,
        { fromCurrency, toCurrency, amount }
      );
      return response.convertCurrency;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }

  /**
   * Récupère les prix des cryptomonnaies
   */
  async getCryptoPrices(symbols: string[]): Promise<CryptoPriceData[]> {
    const query = `
      query GetCryptoPrices($symbols: [String!]!) {
        cryptoPrices(symbols: $symbols) {
          symbol
          name
          price
          change24h
          marketCap
          volume24h
          lastUpdated
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ cryptoPrices: CryptoPriceData[] }>(
        query,
        { symbols }
      );
      return response.cryptoPrices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      throw error;
    }
  }

  /**
   * Valide une transaction avant exécution
   */
  async validateTransaction(
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<SecurityCheck> {
    const query = `
      query ValidateTransaction($amount: Float!, $currency: String!, $paymentMethod: String!) {
        validateTransaction(amount: $amount, currency: $currency, paymentMethod: $paymentMethod) {
          passed
          riskLevel
          reasons
          recommendations
          blockTransaction
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ validateTransaction: SecurityCheck }>(
        query,
        { amount, currency, paymentMethod }
      );
      return response.validateTransaction;
    } catch (error) {
      console.error('Error validating transaction:', error);
      throw error;
    }
  }

  /**
   * Récupère le solde d'une devise spécifique
   */
  async getWalletBalance(currency?: string): Promise<number> {
    const query = `
      query GetWalletBalance($currency: String) {
        getWalletBalance(currency: $currency)
      }
    `;

    try {
      const response = await this.graphqlService.query<{ getWalletBalance: number }>(
        query,
        { currency }
      );
      return response.getWalletBalance;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Met à jour les paramètres du wallet
   */
  async updateWalletSettings(input: Partial<WalletSettings>): Promise<EnhancedWallet> {
    const mutation = `
      mutation UpdateWalletSettings($input: WalletSettingsInput!) {
        updateWalletSettings(input: $input) {
          id
          settings {
            defaultCurrency
            enableNotifications
            autoConvertSmallAmounts
            preferredPaymentMethod
            maxDailyLimit
            enableTwoFactor
            language
            timezone
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.mutate<{ updateWalletSettings: EnhancedWallet }>(
        mutation,
        { input }
      );
      return response.updateWalletSettings;
    } catch (error) {
      console.error('Error updating wallet settings:', error);
      throw error;
    }
  }

  // Mobile Money methods

  /**
   * Récupère les providers mobile money par pays
   */
  async getMobileMoneyProviders(countryCode?: string): Promise<MobileMoneyProvider[]> {
    const query = `
      query GetMobileMoneyProviders($countryCode: String) {
        getMobileMoneyProviders(countryCode: $countryCode) {
          id
          name
          shortCode
          country
          countryCode
          currency
          logo
          isActive
          supportedOperations
          fees {
            deposit
            withdrawal
            transfer
            minimum
            maximum
          }
          limits {
            minTransaction
            maxTransaction
            dailyLimit
            monthlyLimit
          }
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ getMobileMoneyProviders: MobileMoneyProvider[] }>(
        query,
        { countryCode }
      );
      return response.getMobileMoneyProviders;
    } catch (error) {
      console.error('Error fetching mobile money providers:', error);
      throw error;
    }
  }

  /**
   * Valide un numéro de téléphone pour mobile money
   */
  async validatePhoneNumber(phoneNumber: string, countryCode: string): Promise<PhoneNumberValidation> {
    const query = `
      query ValidatePhoneNumber($phoneNumber: String!, $countryCode: String!) {
        validatePhoneNumber(phoneNumber: $phoneNumber, countryCode: $countryCode) {
          isValid
          formattedNumber
          suggestedProvider
          error
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ validatePhoneNumber: PhoneNumberValidation }>(
        query,
        { phoneNumber, countryCode }
      );
      return response.validatePhoneNumber;
    } catch (error) {
      console.error('Error validating phone number:', error);
      throw error;
    }
  }

  /**
   * Calcule les frais mobile money
   */
  async calculateMobileMoneyFees(
    providerId: string,
    amount: number,
    type: 'deposit' | 'withdrawal' | 'transfer'
  ): Promise<MobileMoneyFees> {
    const query = `
      query CalculateMobileMoneyFees($providerId: String!, $amount: Float!, $type: String!) {
        calculateMobileMoneyFees(providerId: $providerId, amount: $amount, type: $type) {
          feeAmount
          feePercentage
          totalAmount
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ calculateMobileMoneyFees: MobileMoneyFees }>(
        query,
        { providerId, amount, type }
      );
      return response.calculateMobileMoneyFees;
    } catch (error) {
      console.error('Error calculating mobile money fees:', error);
      throw error;
    }
  }

  /**
   * Traite un paiement mobile money
   */
  async processPaymentWithMobileMoney(input: {
    amount: number;
    currency: string;
    description: string;
    phoneNumber: string;
    providerId: string;
    countryCode: string;
    accountName?: string;
    propertyId?: string;
    bookingId?: string;
  }): Promise<PaymentResponse> {
    const mutation = `
      mutation ProcessUnifiedPayment($request: PaymentRequest!) {
        processUnifiedPayment(request: $request) {
          success
          transactionId
          status
          amount
          currency
          fees
          estimatedCompletion
          confirmationRequired
          confirmationUrl
          error
          securityCheck {
            passed
            riskLevel
            reasons
            recommendations
            blockTransaction
          }
        }
      }
    `;

    const request = {
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      mobileMoneyData: {
        phoneNumber: input.phoneNumber,
        providerId: input.providerId,
        countryCode: input.countryCode,
        accountName: input.accountName
      },
      propertyId: input.propertyId,
      bookingId: input.bookingId
    };

    try {
      const response = await this.graphqlService.mutate<{ processUnifiedPayment: PaymentResponse }>(
        mutation,
        { request }
      );
      return response.processUnifiedPayment;
    } catch (error) {
      console.error('Error processing mobile money payment:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les pays supportés pour mobile money
   */
  async getSupportedCountries(): Promise<SupportedCountries> {
    const query = `
      query GetSupportedCountries {
        getSupportedCountries
      }
    `;

    try {
      const response = await this.graphqlService.query<{ getSupportedCountries: string }>(query);
      return JSON.parse(response.getSupportedCountries);
    } catch (error) {
      console.error('Error fetching supported countries:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations d'un pays spécifique
   */
  async getCountryInfo(countryCode: string): Promise<CountryInfo> {
    const query = `
      query GetCountryInfo($countryCode: String!) {
        getCountryInfo(countryCode: $countryCode) {
          name
          currency
          flag
        }
      }
    `;

    try {
      const response = await this.graphqlService.query<{ getCountryInfo: CountryInfo }>(
        query,
        { countryCode }
      );
      return response.getCountryInfo;
    } catch (error) {
      console.error('Error fetching country info:', error);
      throw error;
    }
  }
}

// Instance unique du service
let walletServiceInstance: WalletService | null = null;

/**
 * Récupère l'instance du service Wallet
 */
export function getWalletService(): WalletService {
  if (!walletServiceInstance) {
    walletServiceInstance = new WalletService();
  }
  return walletServiceInstance;
}