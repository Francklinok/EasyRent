import { useState, useEffect, useCallback } from 'react';
import {
  getWalletService,
  Wallet,
  Transaction,
  PaymentMethod,
  WalletStats,
  TransactionFilters,
  NotificationFilters,
  Notification
} from '@/services/api/walletService';

interface UseWalletResult {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  createTransaction: (input: any) => Promise<Transaction | null>;
  transferMoney: (input: any) => Promise<Transaction | null>;
}

interface UsePaymentMethodsResult {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addPaymentMethod: (input: any) => Promise<PaymentMethod | null>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
}

interface UseNotificationsResult {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  unreadCount: number;
  hasNextPage: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

/**
 * Hook pour gérer le wallet principal
 */
export function useWallet(): UseWalletResult {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletService = getWalletService();

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await walletService.getWallet();
      setWallet(result);
    } catch (err) {
      console.error('Error loading wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, [walletService]);

  const refresh = useCallback(async () => {
    await loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  return {
    wallet,
    loading,
    error,
    refresh
  };
}

/**
 * Hook pour gérer les transactions
 */
export function useTransactions(
  filters?: TransactionFilters,
  limit: number = 20
): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const walletService = getWalletService();

  const loadTransactions = useCallback(async (
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await walletService.getTransactions(filters, {
        page,
        limit
      });

      const newTransactions = result.edges.map(edge => edge.node);

      if (append) {
        setTransactions(prev => [...prev, ...newTransactions]);
      } else {
        setTransactions(newTransactions);
      }

      setTotalCount(result.totalCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [walletService, filters, limit]);

  const refresh = useCallback(async () => {
    await loadTransactions(1, false);
  }, [loadTransactions]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;
    await loadTransactions(currentPage + 1, true);
  }, [hasNextPage, loading, currentPage, loadTransactions]);

  const createTransaction = useCallback(async (input: any): Promise<Transaction | null> => {
    try {
      setLoading(true);
      const transaction = await walletService.createTransaction(input);

      // Rafraîchir la liste
      await refresh();

      return transaction;
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      return null;
    } finally {
      setLoading(false);
    }
  }, [walletService, refresh]);

  const transferMoney = useCallback(async (input: any): Promise<Transaction | null> => {
    try {
      setLoading(true);
      const transaction = await walletService.transferMoney(input);

      // Rafraîchir la liste
      await refresh();

      return transaction;
    } catch (err) {
      console.error('Error transferring money:', err);
      setError(err instanceof Error ? err.message : 'Failed to transfer money');
      return null;
    } finally {
      setLoading(false);
    }
  }, [walletService, refresh]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    totalCount,
    hasNextPage,
    refresh,
    loadMore,
    createTransaction,
    transferMoney
  };
}

/**
 * Hook pour gérer les méthodes de paiement
 */
export function usePaymentMethods(): UsePaymentMethodsResult {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletService = getWalletService();

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await walletService.getPaymentMethods();
      setPaymentMethods(result);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, [walletService]);

  const refresh = useCallback(async () => {
    await loadPaymentMethods();
  }, [loadPaymentMethods]);

  const addPaymentMethod = useCallback(async (input: any): Promise<PaymentMethod | null> => {
    try {
      setLoading(true);
      const paymentMethod = await walletService.addPaymentMethod(input);

      // Rafraîchir la liste
      await refresh();

      return paymentMethod;
    } catch (err) {
      console.error('Error adding payment method:', err);
      setError(err instanceof Error ? err.message : 'Failed to add payment method');
      return null;
    } finally {
      setLoading(false);
    }
  }, [walletService, refresh]);

  const deletePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await walletService.deletePaymentMethod(id);

      if (success) {
        // Rafraîchir la liste
        await refresh();
      }

      return success;
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete payment method');
      return false;
    } finally {
      setLoading(false);
    }
  }, [walletService, refresh]);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    refresh,
    addPaymentMethod,
    deletePaymentMethod
  };
}

/**
 * Hook pour gérer les notifications
 */
export function useNotifications(
  filters?: NotificationFilters,
  limit: number = 20
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const walletService = getWalletService();

  const loadNotifications = useCallback(async (
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await walletService.getNotifications(filters, {
        page,
        limit
      });

      const newNotifications = result.edges.map(edge => edge.node);

      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setTotalCount(result.totalCount);
      setUnreadCount(result.unreadCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [walletService, filters, limit]);

  const refresh = useCallback(async () => {
    await loadNotifications(1, false);
  }, [loadNotifications]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;
    await loadNotifications(currentPage + 1, true);
  }, [hasNextPage, loading, currentPage, loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await walletService.markNotificationAsRead(id);

      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [walletService]);

  const markAllAsRead = useCallback(async () => {
    try {
      await walletService.markAllNotificationsAsRead();

      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [walletService]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    error,
    totalCount,
    unreadCount,
    hasNextPage,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead
  };
}

/**
 * Hook pour récupérer les statistiques du wallet
 */
export function useWalletStats(dateFrom?: string, dateTo?: string) {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletService = getWalletService();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await walletService.getWalletStats(dateFrom, dateTo);
      setStats(result);
    } catch (err) {
      console.error('Error loading wallet stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet stats');
    } finally {
      setLoading(false);
    }
  }, [walletService, dateFrom, dateTo]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats
  };
}