import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, UserData } from '@/components/services/userService';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  photo?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: Record<string, any>;
  // App-specific fields
  isPremium?: boolean;
  premiumExpiry?: string;
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
  
  // Backend user functions
  fetchUserFromBackend: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadProfilePicture: (imageUri: string) => Promise<void>;
  updatePreferences: (preferences: Record<string, any>) => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  
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
  
  // Helper functions
  getFullName: () => string;
  isUserActive: () => boolean;
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

  const fetchUserFromBackend = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const userData = await userService.getCurrentUser();
      
      const userProfile: UserProfile = {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        photo: userData.photo,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        preferences: userData.preferences,
        isPremium: user?.isPremium || false,
        premiumExpiry: user?.premiumExpiry
      };
      
      setUser(userProfile);
      await saveUserData(userProfile);
    } catch (error) {
      console.error('Error fetching user from backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const backendUpdates = {
        firstName: updates.firstName,
        lastName: updates.lastName,
        phoneNumber: updates.phoneNumber,
        preferences: updates.preferences
      };
      
      const updatedUserData = await userService.updateUser(backendUpdates);
      
      const updatedUser: UserProfile = {
        ...user,
        ...updates,
        firstName: updatedUserData.firstName,
        lastName: updatedUserData.lastName,
        phoneNumber: updatedUserData.phoneNumber,
        preferences: updatedUserData.preferences,
        updatedAt: updatedUserData.updatedAt
      };
      
      setUser(updatedUser);
      await saveUserData(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfilePicture = async (imageUri: string): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await userService.uploadProfilePicture(imageUri);
      
      if (user) {
        const updatedUser = { ...user, photo: result.photo };
        setUser(updatedUser);
        await saveUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: Record<string, any>): Promise<void> => {
    try {
      const updatedUserData = await userService.updatePreferences(preferences);
      
      if (user) {
        const updatedUser = { ...user, preferences: updatedUserData.preferences };
        setUser(updatedUser);
        await saveUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      const result = await userService.deleteAccount();
      
      if (result.success) {
        await AsyncStorage.multiRemove(['user', 'wallet', 'favorites']);
        setUser(null);
        setWallet({ balance: 0, currency: 'EUR', transactions: [] });
        setFavorites([]);
      }
      
      return result.success;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  };

  const getFullName = (): string => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const isUserActive = (): boolean => {
    return user?.isActive ?? false;
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
    fetchUserFromBackend,
    updateProfile,
    uploadProfilePicture,
    updatePreferences,
    deleteAccount,
    addFunds,
    withdrawFunds,
    makePayment,
    toggleFavorite,
    isFavorite,
    upgradeToPremium,
    checkPremiumStatus,
    getFullName,
    isUserActive
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

