import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Alert, AppState, AppStateStatus } from 'react-native';
import { authService, User, RegisterData, TwoFactorSetup } from "@/components/services/authService";

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

type AuthContextType = AuthState & AuthActions & {
  error: AuthError | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const SESSION_TIMEOUT = 30 * 60 * 1000;

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
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

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
      if (!authService.isAuthenticated()) return false;
      
      const user = await authService.getProfile();
      setState(prev => ({ ...prev, user }));
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await authService.logout();
      
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
    } catch (error: any) {
      console.error('Logout error:', error);
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
    clearSessionTimer();
    const timeUntilExpiry = SESSION_TIMEOUT - (Date.now() - state.lastActivity);
    
    if (timeUntilExpiry > 0) {
      sessionTimeoutRef.current = setTimeout(() => {
        handleSessionExpired();
      }, timeUntilExpiry);
    } else {
      handleSessionExpired();
    }
  }, [state.lastActivity, handleSessionExpired, clearSessionTimer]);

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
      
      await authService.initialize();
      const storedUser = await authService.getUser();
      
      if (storedUser && authService.isAuthenticated()) {
        const isValidSession = await checkSession();
        if (isValidSession) {
          setState(prev => ({
            ...prev,
            user: storedUser,
            isAuthenticated: true,
            lastActivity: Date.now()
          }));
        }
      }
    } catch (error: any) {
      console.error('Auth initialization failed:', error);
      handleError('INIT_ERROR', 'Failed to initialize authentication');
    } finally {
      setState(prev => ({ ...prev, initializing: false }));
    }
  }, [checkSession, handleError]);

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
      setState(prev => ({ ...prev, loading: true }));
      clearError();
      
      const response = await authService.login(email, password);
      console.log("user response  for the  first  attempt  for  login is  ",  response)
      
      if (response.requireTwoFactor) {
        setState(prev => ({ 
          ...prev, 
          requireTwoFactor: true,
          loading: false 
        }));
        return { success: true, requireTwoFactor: true };
      }
      
      setState(prev => ({
        ...prev,
        user: response.data.user,
        isAuthenticated: true,
        requireTwoFactor: false,
        loading: false,
        lastActivity: Date.now()
      }));
      
      updateActivity();
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      handleError('LOGIN_ERROR', error.message);
      throw error;
    }
  }, [clearError, updateActivity, handleError]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      clearError();
      
      const response:any = await authService.register(data);
      
      setState(prev => ({ ...prev, loading: false }));
      
      if (response.verificationRequired) {
        Alert.alert(
          'Registration Successful', 
          'Please check your email to verify your account.'
        );
      }
      
      return { success: true, verificationRequired: response.verificationRequired };
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      handleError('REGISTER_ERROR', error.message);
      throw error;
    }
  }, [clearError, handleError]);

  const verifyAccount = useCallback(async (email: string, code: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      clearError();
      
      const response = await authService.verifyAccount(email, code);
      
      if (response.autoLogin) {
        setState(prev => ({
          ...prev,
          user: response.autoLogin?.data.user??null,
          isAuthenticated: true,
          loading: false,
          lastActivity: Date.now()
        }));
        
        Alert.alert('Account Verified', 'Welcome! You have been automatically logged in.');
        return { success: true, autoLogin: true };
      }
      
      setState(prev => ({ ...prev, loading: false }));
      Alert.alert('Account Verified', 'Your account has been successfully activated.');
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
      const response:any = await authService.resendVerification(email);
      
      if (response.sent) {
        Alert.alert('Verification Sent', 'A new verification code has been sent to your email.');
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
      const response:any = await authService.forgotPassword(email);
      
      if (response.resetTokenSent) {
        Alert.alert(
          'Reset Email Sent', 
          'Please check your email for password reset instructions.'
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
      const response:any = await authService.resetPassword(token, newPassword);
      
      if (response.success) {
        Alert.alert('Password Reset', 'Your password has been successfully changed.');
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
      const response:any= await authService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        Alert.alert('Password Changed', 'Your password has been updated successfully.');
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
      const setup = await authService.setupTwoFactor();
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
      
      const response = await authService.verifyTwoFactor(code);
      
      setState(prev => ({
        ...prev,
        user: response.data.user,
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
      const response:any = await authService.disableTwoFactor(password);
      
      if (response.success && state.user) {
        setState(prev => ({
          ...prev,
          user: { ...prev.user!, twoFactorEnabled: false }
        }));
        
        Alert.alert('2FA Disabled', 'Two-factor authentication has been disabled.');
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
      
      const updatedUser = await authService.updateProfile(data);
      
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
      
      const updatedUser = await authService.getProfile();
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