import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'renter' | 'owner' | 'agent' | 'developer';
  isPremium: boolean;
  premiumExpiry?: string;
  createdAt: string;
}

export interface WalletData {
  balance: number;
  currency: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

interface UserContextType {
  user: UserProfile | null;
  wallet: WalletData;
  favorites: string[];
  isLoading: boolean;
  
  // User functions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Wallet functions
  addFunds: (amount: number) => Promise<boolean>;
  withdrawFunds: (amount: number) => Promise<boolean>;
  makePayment: (amount: number, description: string) => Promise<boolean>;
  
  // Favorites functions
  toggleFavorite: (itemId: string) => Promise<void>;
  isFavorite: (itemId: string) => boolean;
  
  // Premium functions
  upgradeToPremium: () => Promise<boolean>;
  checkPremiumStatus: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    currency: 'EUR',
    transactions: []
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const walletData = await AsyncStorage.getItem('wallet');
      const favoritesData = await AsyncStorage.getItem('favorites');

      if (userData) setUser(JSON.parse(userData));
      if (walletData) setWallet(JSON.parse(walletData));
      if (favoritesData) setFavorites(JSON.parse(favoritesData));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (userData: UserProfile) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const saveWalletData = async (walletData: WalletData) => {
    await AsyncStorage.setItem('wallet', JSON.stringify(walletData));
  };

  const saveFavorites = async (favoritesData: string[]) => {
    await AsyncStorage.setItem('favorites', JSON.stringify(favoritesData));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const mockUser: UserProfile = {
        id: '1',
        name: 'John Doe',
        email,
        phone: '+33 6 12 34 56 78',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
        role: 'buyer',
        isPremium: false,
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      await saveUserData(mockUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(['user', 'wallet', 'favorites']);
      setUser(null);
      setWallet({ balance: 0, currency: 'EUR', transactions: [] });
      setFavorites([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await saveUserData(updatedUser);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    
    const updatedWallet = {
      ...wallet,
      transactions: [newTransaction, ...wallet.transactions]
    };
    
    setWallet(updatedWallet);
    saveWalletData(updatedWallet);
  };

  const addFunds = async (amount: number): Promise<boolean> => {
    try {
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance + amount
      };
      
      setWallet(updatedWallet);
      await saveWalletData(updatedWallet);
      
      addTransaction({
        type: 'deposit',
        amount,
        description: 'Ajout de fonds',
        date: new Date().toISOString(),
        status: 'completed'
      });
      
      return true;
    } catch (error) {
      console.error('Add funds error:', error);
      return false;
    }
  };

  const withdrawFunds = async (amount: number): Promise<boolean> => {
    try {
      if (wallet.balance < amount) return false;
      
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance - amount
      };
      
      setWallet(updatedWallet);
      await saveWalletData(updatedWallet);
      
      addTransaction({
        type: 'withdrawal',
        amount,
        description: 'Retrait de fonds',
        date: new Date().toISOString(),
        status: 'completed'
      });
      
      return true;
    } catch (error) {
      console.error('Withdraw funds error:', error);
      return false;
    }
  };

  const makePayment = async (amount: number, description: string): Promise<boolean> => {
    try {
      if (wallet.balance < amount) return false;
      
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance - amount
      };
      
      setWallet(updatedWallet);
      await saveWalletData(updatedWallet);
      
      addTransaction({
        type: 'payment',
        amount,
        description,
        date: new Date().toISOString(),
        status: 'completed'
      });
      
      return true;
    } catch (error) {
      console.error('Payment error:', error);
      return false;
    }
  };

  const toggleFavorite = async (itemId: string): Promise<void> => {
    try {
      const updatedFavorites = favorites.includes(itemId)
        ? favorites.filter(id => id !== itemId)
        : [...favorites, itemId];
      
      setFavorites(updatedFavorites);
      await saveFavorites(updatedFavorites);
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const isFavorite = (itemId: string): boolean => {
    return favorites.includes(itemId);
  };

  const upgradeToPremium = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const premiumPrice = 29.99;
      if (wallet.balance < premiumPrice) return false;
      
      const success = await makePayment(premiumPrice, 'Abonnement Premium');
      if (!success) return false;
      
      const updatedUser = {
        ...user,
        isPremium: true,
        premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setUser(updatedUser);
      await saveUserData(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Premium upgrade error:', error);
      return false;
    }
  };

  const checkPremiumStatus = (): boolean => {
    if (!user || !user.isPremium) return false;
    
    if (user.premiumExpiry && new Date(user.premiumExpiry) < new Date()) {
      updateProfile({ isPremium: false, premiumExpiry: undefined });
      return false;
    }
    
    return true;
  };

  const value: UserContextType = {
    user,
    wallet,
    favorites,
    isLoading,
    login,
    logout,
    updateProfile,
    addFunds,
    withdrawFunds,
    makePayment,
    toggleFavorite,
    isFavorite,
    upgradeToPremium,
    checkPremiumStatus
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};