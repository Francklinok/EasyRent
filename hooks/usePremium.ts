import { useState, useEffect, useCallback } from 'react';
import {
  premiumService,
  PremiumPlan,
  PremiumSubscription,
  SubscriptionUsage,
  PremiumFeature
} from '@/services/api/premiumService';

interface UsePremiumResult {
  plans: PremiumPlan[];
  subscription: PremiumSubscription | null;
  usage: SubscriptionUsage | null;
  features: PremiumFeature[];
  loading: boolean;
  error: string | null;
  subscribeToPlan: (planId: string, paymentMethod: 'card' | 'crypto' | 'wallet', paymentDetails: any) => Promise<boolean>;
  cancelSubscription: (reason?: string) => Promise<boolean>;
  changePlan: (newPlanId: string) => Promise<boolean>;
  toggleAutoRenew: (autoRenew: boolean) => Promise<boolean>;
  checkFeatureAccess: (featureId: string) => Promise<{ hasAccess: boolean; usageCount: number; limit: number | 'unlimited'; remainingUsage: number; }>;
  processCryptoPayment: (planId: string, cryptoCurrency: 'BTC' | 'ETH' | 'USDT', amount: number, walletAddress: string) => Promise<any>;
  validateDiscountCode: (code: string, planId: string) => Promise<any>;
  refresh: () => Promise<void>;
}

export function usePremium(userId: string): UsePremiumResult {
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPremiumData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [plansData, subscriptionData, featuresData] = await Promise.all([
        premiumService.getAvailablePlans(),
        premiumService.getUserSubscription(userId),
        premiumService.getPremiumFeatures(userId)
      ]);

      setPlans(plansData);
      setSubscription(subscriptionData);
      setFeatures(featuresData);

      // Load usage data if user has subscription
      if (subscriptionData) {
        const usageData = await premiumService.getSubscriptionUsage(userId);
        setUsage(usageData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load premium data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const subscribeToPlan = useCallback(async (
    planId: string,
    paymentMethod: 'card' | 'crypto' | 'wallet',
    paymentDetails: any
  ): Promise<boolean> => {
    try {
      setError(null);
      const result = await premiumService.subscribeToPlan(userId, planId, paymentMethod, paymentDetails);

      if (result.success) {
        await loadPremiumData(); // Refresh data
        return true;
      } else {
        setError('Subscription failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      return false;
    }
  }, [userId, loadPremiumData]);

  const cancelSubscription = useCallback(async (reason?: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await premiumService.cancelSubscription(userId, reason);

      if (success) {
        await loadPremiumData(); // Refresh data
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      return false;
    }
  }, [userId, loadPremiumData]);

  const changePlan = useCallback(async (newPlanId: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await premiumService.changePlan(userId, newPlanId);

      if (result.success) {
        await loadPremiumData(); // Refresh data
        return true;
      } else {
        setError('Plan change failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change plan');
      return false;
    }
  }, [userId, loadPremiumData]);

  const toggleAutoRenew = useCallback(async (autoRenew: boolean): Promise<boolean> => {
    try {
      setError(null);
      const success = await premiumService.toggleAutoRenew(userId, autoRenew);

      if (success) {
        await loadPremiumData(); // Refresh data
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle auto renew');
      return false;
    }
  }, [userId, loadPremiumData]);

  const checkFeatureAccess = useCallback(async (featureId: string) => {
    try {
      setError(null);
      return await premiumService.checkFeatureAccess(userId, featureId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check feature access');
      throw err;
    }
  }, [userId]);

  const processCryptoPayment = useCallback(async (
    planId: string,
    cryptoCurrency: 'BTC' | 'ETH' | 'USDT',
    amount: number,
    walletAddress: string
  ) => {
    try {
      setError(null);
      return await premiumService.processCryptoPayment(userId, planId, cryptoCurrency, amount, walletAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process crypto payment');
      throw err;
    }
  }, [userId]);

  const validateDiscountCode = useCallback(async (code: string, planId: string) => {
    try {
      setError(null);
      return await premiumService.validateDiscountCode(code, planId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate discount code');
      throw err;
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await loadPremiumData();
  }, [loadPremiumData]);

  useEffect(() => {
    if (userId) {
      loadPremiumData();
    }
  }, [userId, loadPremiumData]);

  return {
    plans,
    subscription,
    usage,
    features,
    loading,
    error,
    subscribeToPlan,
    cancelSubscription,
    changePlan,
    toggleAutoRenew,
    checkFeatureAccess,
    processCryptoPayment,
    validateDiscountCode,
    refresh
  };
}

interface UseSubscriptionHistoryResult {
  history: PremiumSubscription[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSubscriptionHistory(userId: string): UseSubscriptionHistoryResult {
  const [history, setHistory] = useState<PremiumSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await premiumService.getSubscriptionHistory(userId);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId, loadHistory]);

  return {
    history,
    loading,
    error,
    refresh
  };
}

interface UseInvoicesResult {
  invoices: Array<{
    id: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed';
    issueDate: string;
    dueDate: string;
    downloadUrl: string;
  }>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useInvoices(userId: string): UseInvoicesResult {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await premiumService.getInvoices(userId);
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    if (userId) {
      loadInvoices();
    }
  }, [userId, loadInvoices]);

  return {
    invoices,
    loading,
    error,
    refresh
  };
}