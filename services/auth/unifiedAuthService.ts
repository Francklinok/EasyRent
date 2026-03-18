import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService as restAuthService, User, RegisterData, LoginResponse } from '../restApiService/authService';
import { getAuthService as getGraphQLAuthService } from '@/services/api/authService';

// Clés de stockage pour REST Auth
const REST_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  SESSION_ID: 'sessionId',
  USER: 'user',
};

// Clés de stockage pour GraphQL Auth
const GRAPHQL_STORAGE_KEYS = {
  ACCESS_TOKEN: '@auth_access_token',
  REFRESH_TOKEN: '@auth_refresh_token',
  USER_DATA: '@auth_user_data',
  TOKEN_EXPIRY: '@auth_token_expiry',
};

/**
 * Service d'authentification unifié
 * Synchronise REST et GraphQL
 */
export class UnifiedAuthService {
  private restAuth = restAuthService;
  private graphqlAuth = getGraphQLAuthService();

  /**
   * Initialise le service d'authentification
   */
  async initialize(): Promise<void> {
    try {
      await this.restAuth.initialize();
      console.log('✅ [UnifiedAuth] Service initialized');
    } catch (error) {
      console.error('❌ [UnifiedAuth] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Connexion utilisateur
   * Synchronise les tokens entre REST et GraphQL
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 [UnifiedAuth] Login attempt for:', email);

      // 1. Login via REST API
      const response = await this.restAuth.login(email, password);

      // 2. Si 2FA requis, on s'arrête là
      if (response.requireTwoFactor) {
        return response;
      }

      // 3. Synchroniser les tokens pour GraphQL
      await this.syncTokensToGraphQL(response);

      console.log('✅ [UnifiedAuth] Login successful and tokens synchronized');
      return response;
    } catch (error) {
      console.error('❌ [UnifiedAuth] Login failed:', error);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<{ userId?: string; verificationTokenGenerated?: boolean; emailSent?: boolean }> {
    try {
      console.log('📝 [UnifiedAuth] Registration attempt for:', data.email);

      const response = await this.restAuth.register(data);

      console.log('✅ [UnifiedAuth] Registration successful');
      return response;
    } catch (error) {
      console.error('❌ [UnifiedAuth] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Déconnexion utilisateur
   * Nettoie TOUS les tokens (REST + GraphQL)
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 [UnifiedAuth] Logout initiated...');

      // 1. Logout via REST API (appelle le backend)
      try {
        await this.restAuth.logout();
      } catch (error) {
        console.error('⚠️ [UnifiedAuth] REST logout failed, continuing cleanup:', error);
      }

      // 2. Nettoyer TOUS les tokens locaux
      await this.clearAllAuthData();

      console.log('✅ [UnifiedAuth] Logout completed - all data cleared');
    } catch (error) {
      console.error('❌ [UnifiedAuth] Logout error:', error);
      // Même en cas d'erreur, on nettoie quand même les données locales
      await this.clearAllAuthData();
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.restAuth.isAuthenticated();
  }

  /**
   * Récupère l'utilisateur actuel
   */
  async getUser(): Promise<User | null> {
    return this.restAuth.getUser();
  }

  /**
   * Récupère le profil depuis le backend
   * GraphQL en priorité, REST en fallback
   */
  async getProfile(): Promise<User> {
    try {
      // Try GraphQL first for fresh data including isOwner
      const graphqlUser = await this.graphqlAuth.fetchCurrentUser();
      if (graphqlUser) {
        const user: User = {
          id: graphqlUser.id,
          email: graphqlUser.email,
          fullName: `${graphqlUser.firstName || ''} ${graphqlUser.lastName || ''}`.trim(),
          firstName: graphqlUser.firstName || '',
          lastName: graphqlUser.lastName || '',
          phone: graphqlUser.phone || undefined,
          avatar: graphqlUser.avatar || undefined,
          role: (graphqlUser.role as User['role']) || 'user',
          isOwner: graphqlUser.isOwner || false,
          isVerified: graphqlUser.isEmailVerified || false,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem('user', JSON.stringify(user));
        console.log('✅ [UnifiedAuth] Profile loaded via GraphQL');
        return user;
      }
    } catch (error) {
      console.warn('⚠️ [UnifiedAuth] GraphQL profile fetch failed, falling back to REST:', error);
    }

    // Fallback to REST
    return this.restAuth.getProfile();
  }

  /**
   * Vérification du compte
   */
  async verifyAccount(email: string, code: string): Promise<{ success?: boolean; message?: string; autoLogin?: LoginResponse }> {
    try {
      const response = await this.restAuth.verifyAccount(email, code);

      // Si auto-login, synchroniser les tokens
      if (response.autoLogin) {
        await this.syncTokensToGraphQL(response.autoLogin);
      }

      return response;
    } catch (error) {
      console.error('❌ [UnifiedAuth] Account verification failed:', error);
      throw error;
    }
  }

  /**
   * Vérification 2FA
   */
  async verifyTwoFactor(code: string): Promise<LoginResponse> {
    try {
      const response = await this.restAuth.verifyTwoFactor(code);

      // Synchroniser les tokens pour GraphQL
      await this.syncTokensToGraphQL(response);

      return response;
    } catch (error) {
      console.error('❌ [UnifiedAuth] 2FA verification failed:', error);
      throw error;
    }
  }

  /**
   * Mot de passe oublié
   */
  async forgotPassword(email: string): Promise<{ resetTokenSent: boolean }> {
    return this.restAuth.forgotPassword(email);
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    return this.restAuth.resetPassword(token, newPassword);
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return this.restAuth.changePassword(currentPassword, newPassword);
  }

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerification(email: string): Promise<{ sent: boolean }> {
    return this.restAuth.resendVerification(email);
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.restAuth.updateProfile(profileData);
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Synchronise les tokens REST vers GraphQL storage
   */
  private async syncTokensToGraphQL(loginResponse: LoginResponse): Promise<void> {
    try {
      const { accessToken, refreshToken, user } = loginResponse.data;

      console.log('🔄 [UnifiedAuth] Synchronizing tokens to GraphQL storage...');

      // Sauvegarder les tokens dans le format GraphQL
      await AsyncStorage.setItem(GRAPHQL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(GRAPHQL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await AsyncStorage.setItem(GRAPHQL_STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      // Calculer l'expiration (30 jours par défaut)
      const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
      await AsyncStorage.setItem(GRAPHQL_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

      console.log('✅ [UnifiedAuth] Tokens synchronized to GraphQL storage');
    } catch (error) {
      console.error('❌ [UnifiedAuth] Failed to sync tokens to GraphQL:', error);
    }
  }

  /**
   * Nettoie TOUTES les données d'authentification (REST + GraphQL)
   */
  private async clearAllAuthData(): Promise<void> {
    try {
      console.log('🧹 [UnifiedAuth] Clearing all auth data...');

      // Nettoyer tous les tokens dans un seul appel
      const allKeys = [
        // REST keys
        REST_STORAGE_KEYS.ACCESS_TOKEN,
        REST_STORAGE_KEYS.REFRESH_TOKEN,
        REST_STORAGE_KEYS.SESSION_ID,
        REST_STORAGE_KEYS.USER,
        // GraphQL keys
        GRAPHQL_STORAGE_KEYS.ACCESS_TOKEN,
        GRAPHQL_STORAGE_KEYS.REFRESH_TOKEN,
        GRAPHQL_STORAGE_KEYS.USER_DATA,
        GRAPHQL_STORAGE_KEYS.TOKEN_EXPIRY,
      ];

      await AsyncStorage.multiRemove(allKeys);

      console.log('✅ [UnifiedAuth] All auth data cleared');
    } catch (error) {
      console.error('❌ [UnifiedAuth] Error clearing auth data:', error);
      throw error;
    }
  }

  /**
   * Debug: affiche l'état actuel de l'authentification
   */
  async debugAuthState(): Promise<void> {
    console.log('\n=== 🔍 UNIFIED AUTH DEBUG ===');

    const restToken = await AsyncStorage.getItem(REST_STORAGE_KEYS.ACCESS_TOKEN);
    const graphqlToken = await AsyncStorage.getItem(GRAPHQL_STORAGE_KEYS.ACCESS_TOKEN);
    const user = await AsyncStorage.getItem(REST_STORAGE_KEYS.USER);

    console.log('REST Token:', restToken ? '✅ EXISTS' : '❌ MISSING');
    console.log('GraphQL Token:', graphqlToken ? '✅ EXISTS' : '❌ MISSING');
    console.log('User Data:', user ? '✅ EXISTS' : '❌ MISSING');
    console.log('Is Authenticated:', this.isAuthenticated() ? '✅ YES' : '❌ NO');
    console.log('=== END DEBUG ===\n');
  }
}

// Instance unique du service unifié
let unifiedAuthServiceInstance: UnifiedAuthService | null = null;

/**
 * Récupère l'instance du service d'authentification unifié
 */
export function getUnifiedAuthService(): UnifiedAuthService {
  if (!unifiedAuthServiceInstance) {
    unifiedAuthServiceInstance = new UnifiedAuthService();
  }
  return unifiedAuthServiceInstance;
}

// Export de l'instance par défaut
export const unifiedAuthService = getUnifiedAuthService();
