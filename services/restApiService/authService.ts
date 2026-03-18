import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';


import { API_CONFIG } from '../../constants/apiConfig';

const API_BASE_URL = API_CONFIG.AUTH_URL;

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName: string;     // ajoute ceci
  lastName: string; 
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'agent';
  isOwner: boolean;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    user: User;
  };
  message: string;
  requireTwoFactor: boolean;
  success: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface TwoFactorSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private sessionId: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private readonly maxRetries = 3;
  private readonly timeout = 30000;

  // Rate limiting
  private requestQueue: Map<string, number[]> = new Map();
  private readonly rateLimitWindow = 60000; // 1 minute
  private readonly maxRequestsPerWindow = 10; // Max 10 requests per minute
  private retryAfter: number | null = null;

  async initialize(): Promise<void> {
    try {
      const [token, refresh, session] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        SecureStore.getItemAsync('refreshToken'),
        AsyncStorage.getItem('sessionId')
      ]);
      
      this.accessToken = token;
      // this.refreshToken = refresh;
      this.sessionId = session;
      if (refresh && !token) {
        // Si accessToken absent mais refreshToken présent → auto-refresh
        await this.refreshTokens();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await this.clearSession();
    }
  }

  private async checkRateLimit(endpoint: string): Promise<void> {
    // Check if we need to wait due to previous rate limit
    if (this.retryAfter && Date.now() < this.retryAfter) {
      const waitTime = this.retryAfter - Date.now();
      console.log(`⏳ Rate limited. Waiting ${Math.ceil(waitTime / 1000)}s before retry...`);
      await this.delay(waitTime);
      this.retryAfter = null;
    }

    // Clean old requests from queue
    const now = Date.now();
    const requests = this.requestQueue.get(endpoint) || [];
    const recentRequests = requests.filter(time => now - time < this.rateLimitWindow);

    // Check if we're over the limit
    if (recentRequests.length >= this.maxRequestsPerWindow) {
      const oldestRequest = recentRequests[0];
      const waitTime = this.rateLimitWindow - (now - oldestRequest);
      console.log(`⏳ Rate limit reached for ${endpoint}. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await this.delay(waitTime);
      return this.checkRateLimit(endpoint); // Recheck after waiting
    }

    // Add current request to queue
    recentRequests.push(now);
    this.requestQueue.set(endpoint, recentRequests);
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    // Check rate limit before making request
    await this.checkRateLimit(endpoint);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making request to:', url);
      console.log('Request body:', options.body);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': '1.0.0',
        ...options.headers as Record<string, string>,
      };

      if (this.accessToken && this.requiresAuth(endpoint)) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      if (this.sessionId) {
        headers['X-Session-ID'] = this.sessionId;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);

      // Handle 429 Too Many Requests
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterMs = retryAfterHeader
          ? parseInt(retryAfterHeader) * 1000
          : Math.pow(2, retryCount + 1) * 1000; // Exponential backoff

        this.retryAfter = Date.now() + retryAfterMs;

        console.log(`⚠️ Rate limit hit (429). Retry after ${Math.ceil(retryAfterMs / 1000)}s`);

        if (retryCount < this.maxRetries) {
          await this.delay(retryAfterMs);
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        throw new Error('Trop de requêtes, veuillez réessayer plus tard');
      }

      if (response.status === 401 && this.requiresAuth(endpoint)) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed && retryCount < this.maxRetries) {
          return this.makeRequest(endpoint, options, retryCount + 1);
        }
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        console.error('API Error:', error);
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Request failed:', error.message, 'URL:', `${API_BASE_URL}${endpoint}`);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      // Retry on rate limit or network errors
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        const backoffTime = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying request (${retryCount + 1}/${this.maxRetries}) after ${backoffTime}ms...`);
        await this.delay(backoffTime);
        return this.makeRequest(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  private requiresAuth(endpoint: string): boolean {
    const publicEndpoints = ['/login', '/register', '/verify-account', '/forgot-password', '/reset-password'];
    return !publicEndpoints.some(ep => endpoint.includes(ep));
  }

  private isRetryableError(error: any): boolean {
    return error.message?.includes('network') || 
           error.message?.includes('timeout') ||
           error.code === 'NETWORK_ERROR';
  }

  private async handleTokenRefresh(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshTokens();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public method to reset rate limit if needed
  public resetRateLimit(endpoint?: string): void {
    if (endpoint) {
      this.requestQueue.delete(endpoint);
      console.log(`✅ Rate limit reset for ${endpoint}`);
    } else {
      this.requestQueue.clear();
      this.retryAfter = null;
      console.log('✅ All rate limits reset');
    }
  }

  // Public method to check current rate limit status
  public getRateLimitStatus(endpoint: string): {
    requestsInWindow: number;
    maxRequests: number;
    canMakeRequest: boolean
  } {
    const now = Date.now();
    const requests = this.requestQueue.get(endpoint) || [];
    const recentRequests = requests.filter(time => now - time < this.rateLimitWindow);

    return {
      requestsInWindow: recentRequests.length,
      maxRequests: this.maxRequestsPerWindow,
      canMakeRequest: recentRequests.length < this.maxRequestsPerWindow && (!this.retryAfter || Date.now() >= this.retryAfter)
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email.toLowerCase().trim(), 
        password,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version
        }
      }),
    });
    
    if (data.requireTwoFactor) {
      this.accessToken = data.data.accessToken;
      await AsyncStorage.setItem('sessionId', data.data.accessToken);
      return data;
    }

    await this.storeSession(data);
    return data;
  }

  async register(userData: RegisterData): Promise<{ userId?: string; verificationTokenGenerated?: boolean; emailSent?: boolean }> {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        email: userData.email.toLowerCase().trim(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version
        }
      }),
    });
  }

  async verifyAccount(email: string, code: string): Promise<{ success?: boolean; message?: string; autoLogin?: LoginResponse }> {
    const result = await this.makeRequest('/verify-email?token=${token}', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email.toLowerCase().trim(), 
        code: code 
      }),
    });

    if (result.autoLogin) {
      await this.storeSession(result.autoLogin);
    }

    return result;
  }

  async forgotPassword(email: string): Promise<{ resetTokenSent: boolean }> {
    return this.makeRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    return this.makeRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return this.makeRequest('/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async setupTwoFactor(): Promise<TwoFactorSetup> {
    return this.makeRequest('/2fa/setup', { method: 'POST' });
  }

  async verifyTwoFactor(code: string): Promise<LoginResponse> {
    const data = await this.makeRequest<LoginResponse>('/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ 
        code: code.replace(/\s/g, ''),
        sessionId: this.sessionId 
      }),
    });

    await this.storeSession(data);
    return data;
  }

  async disableTwoFactor(password: string): Promise<{ success: boolean }> {
    return this.makeRequest('/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async getProfile(): Promise<User> {
    const response = await this.makeRequest<{ success: boolean; data: { user: any } }>('/get-profile');

    // Le backend retourne { success: true, data: { user: {...} } }
    // On extrait l'utilisateur et on le mappe au format attendu
    const backendUser = response.data.user;

    const user: User = {
      id: backendUser.id,
      email: backendUser.email,
      fullName: `${backendUser.firstName} ${backendUser.lastName}`,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      phone: backendUser.phoneNumber,
      avatar: backendUser.profilePicture,
      role: backendUser.role || 'user',
      isOwner: backendUser.isOwner || false,
      isVerified: backendUser.emailVerified || false,
      twoFactorEnabled: backendUser.twoFactorEnabled || false,
      createdAt: backendUser.createdAt || new Date().toISOString(),
      lastLoginAt: backendUser.lastLoginAt
    };

    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const user = await this.makeRequest<User>('/updateProfile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await this.makeRequest('/logout', { 
          method: 'POST',
          body: JSON.stringify({ sessionId: this.sessionId })
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      await this.clearSession();
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  async resendVerification(email: string): Promise<{ sent: boolean }> {
    return this.makeRequest('/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const data = await this.makeRequest<AuthTokens>('/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ 
          refreshToken: this.refreshToken,
          sessionId: this.sessionId 
        }),
      });

      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      await Promise.all([
        AsyncStorage.setItem('accessToken', data.accessToken),
        AsyncStorage.setItem('refreshToken', data.refreshToken)
      ]);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearSession();
      return false;
    }
  }

 private async storeSession(loginResponse: LoginResponse): Promise<void> {
  const { accessToken, refreshToken, sessionId, user } = loginResponse.data;

  // Nettoyer les anciennes données d'abord
  await this.clearSession();

  this.accessToken = accessToken;
  this.refreshToken = refreshToken;
  this.sessionId = sessionId;

  console.log("✅ [AuthService] Storing new session for user:", user.email);
  console.log("👤 [AuthService] User data received:", {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    id: user.id
  });

  await Promise.all([
    AsyncStorage.setItem('accessToken', accessToken),
    AsyncStorage.setItem('refreshToken', refreshToken),
    AsyncStorage.setItem('sessionId', sessionId),
    AsyncStorage.setItem('user', JSON.stringify(user))
  ]);

  console.log("✅ [AuthService] Session stored successfully for:", user.email);
}


  private async clearSession(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.sessionId = null;
    
    await AsyncStorage.multiRemove([
      'accessToken', 
      'refreshToken', 
      'sessionId', 
      'user'
    ]);
  }
}

export const authService = new AuthService();