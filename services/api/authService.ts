import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGraphQLService } from './graphqlService';

// ========== TYPES ==========
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isPremium: boolean;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  tokens: AuthTokens;
  message?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ========== STORAGE KEYS ==========
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@auth_access_token',
  REFRESH_TOKEN: '@auth_refresh_token',
  USER_DATA: '@auth_user_data',
  TOKEN_EXPIRY: '@auth_token_expiry',
};

/**
 * Service d'authentification avec GraphQL
 */
export class AuthService {
  private graphqlService?: ReturnType<typeof getGraphQLService>;

  private getGraphQL() {
    if (!this.graphqlService) {
      this.graphqlService = getGraphQLService();
    }
    return this.graphqlService;
  }

  // ========== LOGIN ==========

  /**
   * Connexion utilisateur
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const mutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          success
          user {
            id
            email
            firstName
            lastName
            phone
            role
            isEmailVerified
            isPhoneVerified
            isPremium
            avatar
          }
          tokens {
            accessToken
            refreshToken
            expiresIn
          }
          message
        }
      }
    `;

    try {
      const response = await this.getGraphQL().mutate<{ login: AuthResponse }>(
        mutation,
        input
      );

      if (response.login.success) {
        // Sauvegarder les tokens et les données utilisateur
        await this.saveAuthData(response.login);
      }

      return response.login;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // ========== REGISTER ==========

  /**
   * Inscription utilisateur
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const mutation = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          success
          user {
            id
            email
            firstName
            lastName
            phone
            role
            isEmailVerified
            isPhoneVerified
            isPremium
            avatar
          }
          tokens {
            accessToken
            refreshToken
            expiresIn
          }
          message
        }
      }
    `;

    try {
      const response = await this.getGraphQL().mutate<{ register: AuthResponse }>(
        mutation,
        { input }
      );

      if (response.register.success) {
        await this.saveAuthData(response.register);
      }

      return response.register;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // ========== LOGOUT ==========

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    const mutation = `
      mutation Logout {
        logout {
          success
          message
        }
      }
    `;

    try {
      // Appeler le backend pour invalider le token côté serveur
      await this.getGraphQL().mutate(mutation);
    } catch (error) {
      console.error('Logout error (backend):', error);
      // Continue même en cas d'erreur backend
    } finally {
      // Supprimer les données locales dans tous les cas
      await this.clearAuthData();
    }
  }

  // ========== TOKEN MANAGEMENT ==========

  /**
   * Récupérer le token d'accès
   */
  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (token) {
        // Vérifier si le token est expiré
        const isExpired = await this.isTokenExpired();
        if (isExpired) {
          // Essayer de rafraîchir le token
          const newToken = await this.refreshToken();
          return newToken;
        }
      }

      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const mutation = `
      mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          success
          tokens {
            accessToken
            refreshToken
            expiresIn
          }
        }
      }
    `;

    try {
      const response = await this.getGraphQL().mutate<{ refreshToken: { success: boolean; tokens: AuthTokens } }>(
        mutation,
        { refreshToken }
      );

      if (response.refreshToken.success) {
        const { tokens } = response.refreshToken;

        // Sauvegarder les nouveaux tokens
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

        const expiryTime = Date.now() + tokens.expiresIn * 1000;
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

        return tokens.accessToken;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      // Si le refresh échoue, déconnecter l'utilisateur
      await this.clearAuthData();
      throw error;
    }
  }

  /**
   * Vérifier si le token est expiré
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryTime = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      if (!expiryTime) {
        return true;
      }

      const expiry = parseInt(expiryTime, 10);
      const now = Date.now();

      // Considérer le token comme expiré 5 minutes avant l'expiration réelle
      return now >= (expiry - 5 * 60 * 1000);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  // ========== PASSWORD MANAGEMENT ==========

  /**
   * Demander la réinitialisation du mot de passe
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<{ success: boolean; message: string }> {
    const mutation = `
      mutation ForgotPassword($email: String!) {
        forgotPassword(email: $email) {
          success
          message
        }
      }
    `;

    try {
      const response = await this.getGraphQL().mutate<{ forgotPassword: { success: boolean; message: string } }>(
        mutation,
        input
      );

      return response.forgotPassword;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  async resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
    const mutation = `
      mutation ResetPassword($token: String!, $newPassword: String!) {
        resetPassword(token: $token, newPassword: $newPassword) {
          success
          message
        }
      }
    `;

    try {
      const response = await this.getGraphQL().mutate<{ resetPassword: { success: boolean; message: string } }>(
        mutation,
        input
      );

      return response.resetPassword;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Changer le mot de passe (utilisateur connecté)
   */
  async changePassword(input: ChangePasswordInput): Promise<{ success: boolean; message: string }> {
    const mutation = `
      mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
        changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
          success
          message
        }
      }
    `;

    try {
      const response = await this.getGraphQL().mutate<{ changePassword: { success: boolean; message: string } }>(
        mutation,
        input
      );

      return response.changePassword;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // ========== EMAIL VERIFICATION ==========

  /**
   * Vérifier l'email avec un token
   */
  async verifyEmail(input: VerifyEmailInput): Promise<{ success: boolean; message: string }> {
    const mutation = `
      mutation VerifyEmail($token: String!) {
        verifyEmail(token: $token) {
          success
          message
        }
      }
    `;

    try {
      const response = await this.getGraphQL().mutate<{ verifyEmail: { success: boolean; message: string } }>(
        mutation,
        input
      );

      // Mettre à jour les données utilisateur locales
      if (response.verifyEmail.success) {
        const userData = await this.getCurrentUser();
        if (userData) {
          userData.isEmailVerified = true;
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        }
      }

      return response.verifyEmail;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
    const mutation = `
      mutation ResendVerificationEmail {
        resendVerificationEmail {
          success
          message
        }
      }
    `;

    try {
      const response = await this.getGraphQL().mutate<{ resendVerificationEmail: { success: boolean; message: string } }>(mutation);
      return response.resendVerificationEmail;
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  }

  // ========== USER DATA ==========

  /**
   * Récupérer l'utilisateur actuellement connecté
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (userDataString) {
        return JSON.parse(userDataString);
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return token !== null;
  }

  /**
   * Récupérer les informations utilisateur depuis le backend
   */
  async fetchCurrentUser(): Promise<AuthUser> {
    const query = `
      query Me {
        me {
          id
          email
          firstName
          lastName
          phone
          role
          isEmailVerified
          isPhoneVerified
          isPremium
          avatar
        }
      }
    `;

    try {
      const response = await this.getGraphQL().query<{ me: AuthUser }>(query);

      // Sauvegarder les données mises à jour
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.me));

      return response.me;
    } catch (error) {
      console.error('Fetch current user error:', error);
      throw error;
    }
  }

  // ========== ERROR HANDLING ==========

  /**
   * Gérer les erreurs d'authentification
   */
  async handleAuthError(): Promise<void> {
    console.log('Handling auth error - clearing auth data');
    await this.clearAuthData();
  }

  // ========== HELPER METHODS ==========

  /**
   * Sauvegarder les données d'authentification
   */
  private async saveAuthData(authResponse: AuthResponse): Promise<void> {
    try {
      const { user, tokens } = authResponse;

      // Sauvegarder les tokens
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

      // Calculer et sauvegarder l'expiration
      const expiryTime = Date.now() + tokens.expiresIn * 1000;
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

      // Sauvegarder les données utilisateur
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      console.log('Auth data saved successfully');
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  }

  /**
   * Supprimer toutes les données d'authentification
   */
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.TOKEN_EXPIRY,
      ]);

      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }
}

// Instance unique du service
let authServiceInstance: AuthService | null = null;

/**
 * Récupère l'instance du service d'authentification
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

// Export de l'instance pour compatibilité avec l'ancienne API (lazy-loaded)
export const authService = getAuthService();
