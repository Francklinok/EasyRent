import { getGraphQLService } from './graphqlService';

export interface PremiumPlan {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
  limits: {
    properties: number | 'unlimited';
    walletLimit: number | 'unlimited';
    cryptoAccess: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    exclusiveProperties: boolean;
    noAds: boolean;
    apiAccess: boolean;
  };
  popular?: boolean;
  discount?: {
    percentage: number;
    originalPrice: number;
  };
  cryptoPricing: {
    BTC: number;
    ETH: number;
    USDT: number;
  };
}

export interface PremiumSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: PremiumPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: 'card' | 'crypto' | 'wallet';
  transactionId: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'trading' | 'properties' | 'support' | 'ai';
  requiredPlan: string[];
  enabled: boolean;
  usageLimit?: number;
  usageCount?: number;
}

export interface SubscriptionUsage {
  userId: string;
  planId: string;
  period: string;
  features: Array<{
    featureId: string;
    featureName: string;
    usageCount: number;
    limit: number | 'unlimited';
    percentage: number;
  }>;
  totalUsage: {
    apiCalls: number;
    dataExported: number;
    propertiesListed: number;
    analyticsReports: number;
  };
}

export class PremiumService {
  private graphqlService = getGraphQLService();

  async getAvailablePlans(): Promise<PremiumPlan[]> {
    const query = `
      query GetPremiumPlans {
        premiumPlans {
          id
          name
          title
          description
          price
          currency
          duration
          features
          limits {
            properties
            walletLimit
            cryptoAccess
            prioritySupport
            advancedAnalytics
            exclusiveProperties
            noAds
            apiAccess
          }
          popular
          discount {
            percentage
            originalPrice
          }
          cryptoPricing {
            BTC
            ETH
            USDT
          }
        }
      }
    `;

    const response = await this.graphqlService.query(query);
    return response.premiumPlans;
  }

  async getUserSubscription(userId: string): Promise<PremiumSubscription | null> {
    const query = `
      query GetUserSubscription($userId: ID!) {
        userSubscription(userId: $userId) {
          id
          userId
          planId
          plan {
            id
            name
            title
            description
            price
            currency
            duration
            features
            limits {
              properties
              walletLimit
              cryptoAccess
              prioritySupport
              advancedAnalytics
              exclusiveProperties
              noAds
              apiAccess
            }
            cryptoPricing {
              BTC
              ETH
              USDT
            }
          }
          status
          startDate
          endDate
          autoRenew
          paymentMethod
          transactionId
          nextBillingDate
          cancelledAt
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    return response.userSubscription;
  }

  async subscribeToPlan(
    userId: string,
    planId: string,
    paymentMethod: 'card' | 'crypto' | 'wallet',
    paymentDetails: any
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    transactionId: string;
    startDate: string;
    endDate: string;
  }> {
    const mutation = `
      mutation SubscribeToPlan(
        $userId: ID!,
        $planId: ID!,
        $paymentMethod: PaymentMethod!,
        $paymentDetails: PaymentDetailsInput!
      ) {
        subscribeToPlan(
          userId: $userId,
          planId: $planId,
          paymentMethod: $paymentMethod,
          paymentDetails: $paymentDetails
        ) {
          success
          subscriptionId
          transactionId
          startDate
          endDate
          errors
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, {
      userId,
      planId,
      paymentMethod,
      paymentDetails
    });

    return response.subscribeToPlan;
  }

  async cancelSubscription(userId: string, reason?: string): Promise<boolean> {
    const mutation = `
      mutation CancelSubscription($userId: ID!, $reason: String) {
        cancelSubscription(userId: $userId, reason: $reason) {
          success
          cancelledAt
          refundAmount
          refundStatus
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, reason });
    return response.cancelSubscription.success;
  }

  async changePlan(userId: string, newPlanId: string): Promise<{
    success: boolean;
    prorationAmount: number;
    effectiveDate: string;
  }> {
    const mutation = `
      mutation ChangePlan($userId: ID!, $newPlanId: ID!) {
        changePlan(userId: $userId, newPlanId: $newPlanId) {
          success
          prorationAmount
          effectiveDate
          transactionId
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, newPlanId });
    return response.changePlan;
  }

  async toggleAutoRenew(userId: string, autoRenew: boolean): Promise<boolean> {
    const mutation = `
      mutation ToggleAutoRenew($userId: ID!, $autoRenew: Boolean!) {
        toggleAutoRenew(userId: $userId, autoRenew: $autoRenew) {
          success
          nextBillingDate
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, { userId, autoRenew });
    return response.toggleAutoRenew.success;
  }

  async getSubscriptionUsage(userId: string, period: string = 'current'): Promise<SubscriptionUsage> {
    const query = `
      query GetSubscriptionUsage($userId: ID!, $period: String!) {
        subscriptionUsage(userId: $userId, period: $period) {
          userId
          planId
          period
          features {
            featureId
            featureName
            usageCount
            limit
            percentage
          }
          totalUsage {
            apiCalls
            dataExported
            propertiesListed
            analyticsReports
          }
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId, period });
    return response.subscriptionUsage;
  }

  async getPremiumFeatures(userId: string): Promise<PremiumFeature[]> {
    const query = `
      query GetPremiumFeatures($userId: ID!) {
        premiumFeatures(userId: $userId) {
          id
          name
          description
          category
          requiredPlan
          enabled
          usageLimit
          usageCount
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    return response.premiumFeatures;
  }

  async checkFeatureAccess(userId: string, featureId: string): Promise<{
    hasAccess: boolean;
    usageCount: number;
    limit: number | 'unlimited';
    remainingUsage: number;
  }> {
    const query = `
      query CheckFeatureAccess($userId: ID!, $featureId: String!) {
        featureAccess(userId: $userId, featureId: $featureId) {
          hasAccess
          usageCount
          limit
          remainingUsage
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId, featureId });
    return response.featureAccess;
  }

  async getSubscriptionHistory(userId: string): Promise<PremiumSubscription[]> {
    const query = `
      query GetSubscriptionHistory($userId: ID!) {
        subscriptionHistory(userId: $userId) {
          id
          planId
          plan {
            name
            title
            price
            currency
          }
          status
          startDate
          endDate
          paymentMethod
          transactionId
          createdAt
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    return response.subscriptionHistory;
  }

  async processCryptoPayment(
    userId: string,
    planId: string,
    cryptoCurrency: 'BTC' | 'ETH' | 'USDT',
    amount: number,
    walletAddress: string
  ): Promise<{
    success: boolean;
    paymentAddress: string;
    requiredAmount: number;
    expiresAt: string;
    transactionId: string;
  }> {
    const mutation = `
      mutation ProcessCryptoPayment(
        $userId: ID!,
        $planId: ID!,
        $cryptoCurrency: CryptoCurrency!,
        $amount: Float!,
        $walletAddress: String!
      ) {
        processCryptoPayment(
          userId: $userId,
          planId: $planId,
          cryptoCurrency: $cryptoCurrency,
          amount: $amount,
          walletAddress: $walletAddress
        ) {
          success
          paymentAddress
          requiredAmount
          expiresAt
          transactionId
          qrCode
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, {
      userId,
      planId,
      cryptoCurrency,
      amount,
      walletAddress
    });

    return response.processCryptoPayment;
  }

  async validateDiscountCode(code: string, planId: string): Promise<{
    valid: boolean;
    discount: {
      type: 'percentage' | 'fixed';
      value: number;
      maxDiscount?: number;
    };
    expiresAt: string;
  }> {
    const query = `
      query ValidateDiscountCode($code: String!, $planId: ID!) {
        validateDiscountCode(code: $code, planId: $planId) {
          valid
          discount {
            type
            value
            maxDiscount
          }
          expiresAt
        }
      }
    `;

    const response = await this.graphqlService.query(query, { code, planId });
    return response.validateDiscountCode;
  }

  async getInvoices(userId: string): Promise<Array<{
    id: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed';
    issueDate: string;
    dueDate: string;
    downloadUrl: string;
  }>> {
    const query = `
      query GetInvoices($userId: ID!) {
        invoices(userId: $userId) {
          id
          subscriptionId
          amount
          currency
          status
          issueDate
          dueDate
          downloadUrl
        }
      }
    `;

    const response = await this.graphqlService.query(query, { userId });
    return response.invoices;
  }
}

// Export singleton instance
export const premiumService = new PremiumService();