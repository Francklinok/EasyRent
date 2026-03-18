import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Alert, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService as restAuthService, User, RegisterData, TwoFactorSetup } from "@/services/restApiService/authService";;
import { unifiedAuthService } from "@/services/auth/unifiedAuthService";
import { cleanupOfflineServices } from "@/services/offline";

export interface AuthState {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  isAuthenticated: boolean;
  requiresTwoFactor: boolean;
  sessionExpired: boolean;
  lastActivity: number;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; requireTwoFactor?: boolean }>;
  register: (data: RegisterData) => Promise<{ success: boolean; verificationRequired: boolean }>;
  logout: () => Promise<void>;
  verifyAccount: (email: string, code: string) => Promise<{ success: boolean; autoLogin?: boolean }>;
  resendVerification: (email: string) => Promise<{ success: boolean }>;
  forgotPassword: (email: string) => Promise<{ success: boolean }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean }>;
  setupTwoFactor: () => Promise<TwoFactorSetup>;
  verifyTwoFactor: (code: string) => Promise<{ success: boolean }>;
  disableTwoFactor: (password: string) => Promise<{ success: boolean }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; user: User }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  checkSession: () => Promise<boolean>;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

type ActiveMode = 'client' | 'owner';

type AuthContextType = AuthState & AuthActions & {
  error: AuthError | null;
  isOwner: boolean;
  setIsOwner: (value: boolean) => void;
  activeMode: ActiveMode;
  setActiveMode: (mode: ActiveMode) => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Session persistante - pas d'expiration automatique
const SESSION_TIMEOUT = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    initializing: true,
    isAuthenticated: false,
    requiresTwoFactor: false,
    sessionExpired: false,
    lastActivity: Date.now()
  });
  
  const [error, setError] = useState<AuthError | null>(null);
  const [activeMode, setActiveModeState] = useState<ActiveMode>('client');
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const isOwner = state.user?.isOwner ?? false;

  const setIsOwner = useCallback((value: boolean) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, isOwner: value };
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  }, []);

  const setActiveMode = useCallback((mode: ActiveMode) => {
    setActiveModeState(mode);
    AsyncStorage.setItem('activeMode', mode);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((code: string, message: string, field?: string) => {
    setError({ code, message, field });
  }, []);

  const updateActivity = useCallback(() => {
    setState(prev => ({ ...prev, lastActivity: Date.now() }));
  }, []);

  const clearSessionTimer = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!unifiedAuthService.isAuthenticated()) return false;

      const user = await unifiedAuthService.getProfile();
      setState(prev => ({ ...prev, user }));
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🚪 [AuthContext] Logout initiated...');
      setState(prev => ({ ...prev, loading: true }));

      // Utiliser le service unifié qui nettoie TOUS les tokens
      await unifiedAuthService.logout();

      // Nettoyer les services offline (cache, database, sync)
      await cleanupOfflineServices();
      console.log('✅ [AuthContext] Offline services cleaned up');

      // Reset complet du state
      setState({
        user: null,
        loading: false,
        initializing: false,
        isAuthenticated: false,
        requiresTwoFactor: false,
        sessionExpired: false,
        lastActivity: Date.now()
      });

      clearError();
      clearSessionTimer();

      console.log('✅ [AuthContext] Logout completed - user state cleared');
    } catch (error: any) {
      console.error('❌ [AuthContext] Logout error:', error);
      // Même en cas d'erreur, on nettoie le state local
      setState({
        user: null,
        loading: false,
        initializing: false,
        isAuthenticated: false,
        requiresTwoFactor: false,
        sessionExpired: false,
        lastActivity: Date.now()
      });
      clearError();
      clearSessionTimer();
      console.log('⚠️ [AuthContext] Logout completed with errors - user state cleared anyway');
    }
  }, [clearError, clearSessionTimer]);

  const handleSessionExpired = useCallback(async () => {
    setState(prev => ({ ...prev, sessionExpired: true }));
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [{ text: 'OK', onPress: logout }]
    );
  }, [logout]);

  const startSessionTimer = useCallback(() => {
    // Session persistante - pas de timer d'expiration
    clearSessionTimer();
  }, [clearSessionTimer]);

  const setupAppStateListener = useCallback(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        if (state.isAuthenticated) {
          checkSession();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [state.isAuthenticated, checkSession]);

  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, initializing: true }));

      await unifiedAuthService.initialize();

      // Restore persisted activeMode
      const savedMode = await AsyncStorage.getItem('activeMode');
      if (savedMode === 'owner' || savedMode === 'client') {
        setActiveModeState(savedMode);
      }

      if (unifiedAuthService.isAuthenticated()) {
        try {
          // Charger le profil frais depuis le backend
          const freshProfile = await unifiedAuthService.getProfile();
          console.log('✅ [AuthContext] Fresh profile loaded on init:');
          console.log('   - Email:', freshProfile.email);
          console.log('   - FirstName:', freshProfile.firstName);
          console.log('   - LastName:', freshProfile.lastName);
          console.log('   - FullName:', freshProfile.fullName);
          console.log('   - ID:', freshProfile.id);
          
          setState(prev => ({
            ...prev,
            user: freshProfile,
            isAuthenticated: true,
            lastActivity: Date.now()
          }));
          
          console.log('✅ [AuthContext] User state updated');
        } catch (error) {
          console.error('⚠️ [AuthContext] Failed to load profile, clearing session:', error);
          await unifiedAuthService.logout();
        }
      } else {
        console.log('ℹ️ [AuthContext] User not authenticated');
      }
    } catch (error: any) {
      console.error('Auth initialization failed:', error);
      handleError('INIT_ERROR', 'Failed to initialize authentication');
    } finally {
      setState(prev => ({ ...prev, initializing: false }));
    }
  }, [handleError]);

  useEffect(() => {
    initializeAuth();
    const cleanup = setupAppStateListener();
    return () => {
      clearSessionTimer();
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      startSessionTimer();
    } else {
      clearSessionTimer();
    }
  }, [state.isAuthenticated, state.lastActivity, startSessionTimer, clearSessionTimer]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 [AuthContext] Login attempt for:', email);
      setState(prev => ({ ...prev, loading: true }));
      clearError();

      const response = await unifiedAuthService.login(email, password);
      console.log("✅ [AuthContext] Login response:", response);

      if (response.requireTwoFactor) {
        setState(prev => ({
          ...prev,
          requireTwoFactor: true,
          loading: false
        }));
        return { success: true, requireTwoFactor: true };
      }

      // Récupérer le profil frais depuis le backend pour éviter les données cached
      const freshProfile = await unifiedAuthService.getProfile();
      console.log('🔄 [AuthContext] Fresh profile loaded after login:');
      console.log('   - Email:', freshProfile.email);
      console.log('   - FirstName:', freshProfile.firstName);
      console.log('   - LastName:', freshProfile.lastName);
      console.log('   - FullName:', freshProfile.fullName);
      console.log('   - ID:', freshProfile.id);

      setState(prev => ({
        ...prev,
        user: freshProfile,
        isAuthenticated: true,
        requireTwoFactor: false,
        loading: false,
        lastActivity: Date.now()
      }));

      updateActivity();
      return { success: true };
    } catch (error: any) {
      console.error('❌ [AuthContext] Login error:', error);
      setState(prev => ({ ...prev, loading: false }));
      handleError('LOGIN_ERROR', error.message);
      throw error;
    }
  }, [clearError, updateActivity, handleError]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      console.log('📝 [AuthContext] Registration attempt for:', data.email);
      setState(prev => ({ ...prev, loading: true }));
      clearError();

      const response:any = await unifiedAuthService.register(data);

      setState(prev => ({ ...prev, loading: false }));

      if (response.verificationRequired || response.verificationTokenGenerated) {
        Alert.alert(
          'Inscription réussie',
          'Veuillez vérifier votre email pour activer votre compte.'
        );
      }

      return { success: true, verificationRequired: response.verificationRequired || response.verificationTokenGenerated };
    } catch (error: any) {
      console.error('❌ [AuthContext] Registration error:', error);
      setState(prev => ({ ...prev, loading: false }));
      handleError('REGISTER_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError]);

  const verifyAccount = useCallback(async (email: string, code: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      clearError();

      const response = await unifiedAuthService.verifyAccount(email, code);

      if (response.autoLogin) {
        setState(prev => ({
          ...prev,
          user: response.autoLogin?.data.user??null,
          isAuthenticated: true,
          loading: false,
          lastActivity: Date.now()
        }));

        Alert.alert('Compte vérifié', 'Bienvenue! Vous êtes automatiquement connecté.');
        return { success: true, autoLogin: true };
      }

      setState(prev => ({ ...prev, loading: false }));
      Alert.alert('Compte vérifié', 'Votre compte a été activé avec succès.');
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      handleError('VERIFY_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError]);

  const resendVerification = useCallback(async (email: string) => {
    try {
      clearError();
      const response:any = await unifiedAuthService.resendVerification(email);

      if (response.sent) {
        Alert.alert('Code envoyé', 'Un nouveau code de vérification a été envoyé à votre email.');
      }

      return { success: response.sent };
    } catch (error: any) {
      handleError('RESEND_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      clearError();
      const response:any = await unifiedAuthService.forgotPassword(email);

      if (response.resetTokenSent) {
        Alert.alert(
          'Email envoyé',
          'Consultez votre email pour les instructions de réinitialisation.'
        );
      }

      return { success: response.resetTokenSent };
    } catch (error: any) {
      handleError('FORGOT_PASSWORD_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      clearError();
      const response:any = await unifiedAuthService.resetPassword(token, newPassword);

      if (response.success) {
        Alert.alert('Mot de passe réinitialisé', 'Votre mot de passe a été changé avec succès.');
      }

      return { success: response.success };
    } catch (error: any) {
      handleError('RESET_PASSWORD_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      clearError();
      const response:any= await unifiedAuthService.changePassword(currentPassword, newPassword);

      if (response.success) {
        Alert.alert('Mot de passe changé', 'Votre mot de passe a été mis à jour avec succès.');
        updateActivity();
      }

      return { success: response.success };
    } catch (error: any) {
      handleError('CHANGE_PASSWORD_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError, updateActivity]);

  const setupTwoFactor = useCallback(async (): Promise<TwoFactorSetup> => {
    try {
      clearError();
      const setup = await restAuthService.setupTwoFactor();
      updateActivity();
      return setup;
    } catch (error: any) {
      handleError('2FA_SETUP_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError, updateActivity]);

  const verifyTwoFactor = useCallback(async (code: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      clearError();

      const response = await unifiedAuthService.verifyTwoFactor(code);

      // Récupérer le profil frais depuis le backend pour éviter les données cached
      const freshProfile = await unifiedAuthService.getProfile();
      console.log('🔄 [AuthContext] Fresh profile loaded after 2FA:', freshProfile.email);

      setState(prev => ({
        ...prev,
        user: freshProfile,
        isAuthenticated: true,
        requiresTwoFactor: false,
        loading: false,
        lastActivity: Date.now()
      }));

      updateActivity();
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      handleError('2FA_VERIFY_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError, updateActivity]);

  const disableTwoFactor = useCallback(async (password: string) => {
    try {
      clearError();
      const response:any = await restAuthService.disableTwoFactor(password);

      if (response.success && state.user) {
        setState(prev => ({
          ...prev,
          user: { ...prev.user!, twoFactorEnabled: false }
        }));

        Alert.alert('2FA désactivé', 'L\'authentification à deux facteurs a été désactivée.');
        updateActivity();
      }

      return { success: response.success };
    } catch (error: any) {
      handleError('2FA_DISABLE_ERROR', error.message);
      throw error;
    }
  }, [state.user, clearError, handleError, updateActivity]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      clearError();

      const updatedUser = await unifiedAuthService.updateProfile(data);

      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false
      }));

      updateActivity();
      return { success: true, user: updatedUser };
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      handleError('UPDATE_PROFILE_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError, updateActivity]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      if (!state.isAuthenticated) return;

      const updatedUser = await unifiedAuthService.getProfile();
      setState(prev => ({ ...prev, user: updatedUser }));
      updateActivity();
    } catch (error: any) {
      console.error('Failed to refresh profile:', error);
      handleError('REFRESH_PROFILE_ERROR', 'Failed to refresh profile');
    }
  }, [state.isAuthenticated, handleError, updateActivity]);

  const contextValue: AuthContextType = {
    ...state,
    error,
    isOwner,
    setIsOwner,
    activeMode,
    setActiveMode,
    login,
    register,
    logout,
    verifyAccount,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    updateProfile,
    refreshProfile,
    clearError,
    checkSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const useAuthUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

export const useAuthStatus = () => {
  const { isAuthenticated, loading, initializing, requiresTwoFactor } = useAuth();
  return { isAuthenticated, loading, initializing, requiresTwoFactor };
};

export const useAuthError = () => {
  const { error, clearError } = useAuth();
  return { error, clearError };
};