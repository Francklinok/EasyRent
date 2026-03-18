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
    const tier = planId || 'premium';
    const paymentMethodId = paymentDetails?.paymentMethodId || `pm_${paymentMethod}_${Date.now()}`;
    const promoCode = paymentDetails?.promoCode || null;
    const billingCycle = paymentDetails?.billingCycle || 'monthly';

    const mutation = `
      mutation UpgradePremium(
        $tier: PremiumTier!,
        $paymentMethodId: String!,
        $promoCode: String
      ) {
        upgradePremium(
          tier: $tier,
          paymentMethodId: $paymentMethodId,
          promoCode: $promoCode
        ) {
          tier
          status
          startDate
          endDate
          autoRenew
          paymentMethod
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, {
      tier,
      paymentMethodId,
      ...(promoCode ? { promoCode } : {})
    });

    const settings = response.upgradePremium;
    return {
      success: settings.status === 'active',
      subscriptionId: `sub_${Date.now()}`,
      transactionId: paymentMethodId,
      startDate: settings.startDate || new Date().toISOString(),
      endDate: settings.endDate || '',
    };
  }

  async cancelSubscription(userId: string, reason?: string): Promise<boolean> {
    // Backend: cancelPremium: PremiumSettings! (no args)
    const mutation = `
      mutation CancelPremium {
        cancelPremium {
          tier
          status
          startDate
          endDate
          autoRenew
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation);
    return response.cancelPremium.status === 'cancelled';
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
  // ============================
  // NEW PREMIUM ENDPOINTS
  // ============================

  async getPremiumStatus(userId: string): Promise<{
    isPremium: boolean;
    plan: string | null;
    tier: string | null;
    expiry: string | null;
    autoRenew: boolean | null;
    isExpired: boolean;
  }> {
    const query = `
      query PremiumStatus($userId: ID!) {
        premiumStatus(userId: $userId) {
          isPremium
          plan
          tier
          expiry
          autoRenew
          isExpired
        }
      }
    `;
    const response = await this.graphqlService.query(query, { userId });
    return response.premiumStatus;
  }

  async getOwnerDashboard(): Promise<any> {
    const query = `
      query OwnerDashboard {
        ownerDashboard {
          overview {
            totalProperties
            activeProperties
            boostedProperties
            rentedProperties
            occupancyRate
            totalMonthlyRevenue
          }
          analytics {
            totalViews
            totalClicks
            totalImpressions
            totalContactRequests
            totalFavorites
            avgClickThroughRate
            avgContactRate
          }
          properties
        }
      }
    `;
    const response = await this.graphqlService.query(query);
    return response.ownerDashboard;
  }

  async getPremiumPropertyStats(propertyId: string, period?: string): Promise<any> {
    const query = `
      query PremiumPropertyStats($propertyId: ID!, $period: String) {
        premiumPropertyStats(propertyId: $propertyId, period: $period) {
          propertyId
          period
          totalViews
          totalClicks
          totalImpressions
          totalContactRequests
          totalFavorites
          totalShares
          clickThroughRate
          contactRate
          viewSources {
            search
            recommendation
            direct
            boost
            share
          }
          averageViewDuration
          lastViewedAt
          dailyBreakdown {
            date
            views
            clicks
            impressions
            contactRequests
          }
        }
      }
    `;
    const response = await this.graphqlService.query(query, { propertyId, period });
    return response.premiumPropertyStats;
  }

  async getMarketAnalysis(area?: string): Promise<any> {
    const query = `
      query MarketAnalysis($area: String) {
        marketAnalysis(area: $area) {
          areaAnalysis {
            area
            avgRent
            minRent
            maxRent
            avgSurface
            avgPricePerSqm
            totalListings
            availableListings
          }
          typeDistribution {
            type
            count
            avgRent
          }
          priceTrends {
            period
            avgRent
            count
          }
          generatedAt
        }
      }
    `;
    const response = await this.graphqlService.query(query, { area });
    return response.marketAnalysis;
  }

  async getTenantScreening(tenantId: string): Promise<any> {
    const query = `
      query TenantScreening($tenantId: ID!) {
        tenantScreening(tenantId: $tenantId) {
          tenant {
            id
            firstName
            lastName
            email
            phoneNumber
            memberSince
            lastActive
            isVerified
          }
          activitySummary {
            totalActivities
            completedVisits
          }
          reliabilityScore
        }
      }
    `;
    const response = await this.graphqlService.query(query, { tenantId });
    return response.tenantScreening;
  }

  async getSmartRecommendations(page: number = 1, limit: number = 20): Promise<any> {
    const query = `
      query SmartRecommendations($page: Int, $limit: Int) {
        smartRecommendations(page: $page, limit: $limit) {
          properties
          total
          page
          limit
          totalPages
        }
      }
    `;
    const response = await this.graphqlService.query(query, { page, limit });
    return response.smartRecommendations;
  }

  async getPriceHistory(area: string, propertyType?: string, months?: number): Promise<any> {
    const query = `
      query PriceHistory($area: String!, $propertyType: String, $months: Int) {
        priceHistory(area: $area, propertyType: $propertyType, months: $months) {
          area
          propertyType
          months
          data {
            period
            avgRent
            minRent
            maxRent
            count
            avgSurface
            avgPricePerSqm
          }
        }
      }
    `;
    const response = await this.graphqlService.query(query, { area, propertyType, months });
    return response.priceHistory;
  }

  async getNeighborhoodInsights(area: string): Promise<any> {
    const query = `
      query NeighborhoodInsights($area: String!) {
        neighborhoodInsights(area: $area) {
          area
          overview {
            totalListings
            availableListings
            avgRent
            minRent
            maxRent
            avgSurface
            avgPricePerSqm
          }
          propertyTypeBreakdown {
            type
            count
            avgRent
            percentage
          }
          priceRangeDistribution {
            range
            count
            percentage
          }
          trends {
            listingsGrowth
            avgRentChange
          }
          nearbyAreas {
            area
            avgRent
            totalListings
          }
        }
      }
    `;
    const response = await this.graphqlService.query(query, { area });
    return response.neighborhoodInsights;
  }

  async getPriceHeatmap(): Promise<any[]> {
    const query = `
      query PriceHeatmap {
        priceHeatmap {
          area
          avgRent
          minRent
          maxRent
          count
          avgPricePerSqm
        }
      }
    `;
    const response = await this.graphqlService.query(query);
    return response.priceHeatmap;
  }

  async getEarlyAccessProperties(page: number = 1, limit: number = 20): Promise<any> {
    const query = `
      query EarlyAccessProperties($page: Int, $limit: Int) {
        earlyAccessProperties(page: $page, limit: $limit) {
          properties
          total
          page
          limit
          totalPages
        }
      }
    `;
    const response = await this.graphqlService.query(query, { page, limit });
    return response.earlyAccessProperties;
  }

  async getAvailableAreas(): Promise<string[]> {
    const query = `
      query AvailableAreas {
        availableAreas
      }
    `;
    const response = await this.graphqlService.query(query);
    return response.availableAreas;
  }

  async boostProperty(propertyId: string, boostType?: string, durationDays?: number): Promise<any> {
    const mutation = `
      mutation BoostProperty($propertyId: ID!, $boostType: BoostStatus, $durationDays: Int) {
        boostProperty(propertyId: $propertyId, boostType: $boostType, durationDays: $durationDays) {
          success
          boostStatus
          boostedUntil
        }
      }
    `;
    const response = await this.graphqlService.mutate(mutation, { propertyId, boostType, durationDays });
    return response.boostProperty;
  }

  async removeBoost(propertyId: string): Promise<any> {
    const mutation = `
      mutation RemoveBoost($propertyId: ID!) {
        removeBoost(propertyId: $propertyId) {
          success
        }
      }
    `;
    const response = await this.graphqlService.mutate(mutation, { propertyId });
    return response.removeBoost;
  }

  async generateRentReceipt(
    propertyId: string,
    tenantId: string,
    month: number,
    year: number,
    amount: number,
    currency?: string
  ): Promise<any> {
    const mutation = `
      mutation GenerateRentReceipt(
        $propertyId: ID!,
        $tenantId: ID!,
        $month: Int!,
        $year: Int!,
        $amount: Float!,
        $currency: String
      ) {
        generateRentReceipt(
          propertyId: $propertyId,
          tenantId: $tenantId,
          month: $month,
          year: $year,
          amount: $amount,
          currency: $currency
        ) {
          receiptId
          generatedAt
          period { month year }
          owner { name email phone }
          tenant { name email phone }
          property { id title address }
          payment { amount currency monthlyRent }
        }
      }
    `;
    const response = await this.graphqlService.mutate(mutation, {
      propertyId, tenantId, month, year, amount, currency
    });
    return response.generateRentReceipt;
  }

  // activatePremium and cancelPremiumSubscription are handled by
  // subscribeToPlan (→ upgradePremium) and cancelSubscription (→ cancelPremium) above

  async trackView(propertyId: string, source?: string, duration?: number): Promise<boolean> {
    // TODO: Implement trackView mutation on backend
    // For now, return true silently to avoid errors
    console.debug('[PremiumService] trackView called for:', propertyId, '- mutation not implemented on backend');
    return true;
  }

  async trackClick(propertyId: string): Promise<boolean> {
    // TODO: Implement trackClick mutation on backend
    // For now, return true silently to avoid errors
    console.debug('[PremiumService] trackClick called for:', propertyId, '- mutation not implemented on backend');
    return true;
  }

  async trackContactRequest(propertyId: string): Promise<boolean> {
    const mutation = `
      mutation TrackContactRequest($propertyId: ID!) {
        trackContactRequest(propertyId: $propertyId)
      }
    `;
    const response = await this.graphqlService.mutate(mutation, { propertyId });
    return response.trackContactRequest;
  }
}

// Export singleton instance
export const premiumService = new PremiumService();