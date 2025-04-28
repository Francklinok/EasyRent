import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb/QueryDescription';
import { synchronize } from '@nozbe/watermelondb/sync';
import { connectivityManager } from '../manager/connectivityManager';
import { authService } from './authService';
import { offlineQueue, OfflineRequest } from '../utils/offlineQueue';
import { logger } from '../utils/logger';

// Types pour les réponses et requêtes
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
}

export interface SyncOptions {
  filter?: Record<string, any>;
  pullOnly?: boolean;
  pushOnly?: boolean;
  migrationsEnabledAtVersion?: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Service API avancé pour applications offline-first avec WatermelonDB
 */
export class ApiService {
  private api: AxiosInstance;
  private database: Database;
  private readonly requestTimeout: number = 30000;
  private isRefreshingToken: boolean = false;
  private refreshTokenPromise: Promise<string | null> | null = null;
  private pendingRequests: Array<() => void> = [];
  
  /**
   * Crée une nouvelle instance du service API
   * @param database La base de données WatermelonDB
   * @param baseURL L'URL de base de l'API
   */
  constructor(database: Database, baseURL: string) {
    this.database = database;
    
    // Configuration de l'instance Axios
    this.api = axios.create({
      baseURL,
      timeout: this.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    this.setupInterceptors();
    
    // Vérifier si des requêtes sont en attente au démarrage
    connectivityManager.onConnectivityChange(this.processOfflineQueue.bind(this));
  }
  
  /**
   * Configure les intercepteurs d'Axios
   */
  private setupInterceptors(): void {
    // Intercepteur de requête
    this.api.interceptors.request.use(async (config) => {
      const token = await authService.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Ajouter des en-têtes d'identification de l'appareil
      config.headers['X-Device-Id'] = await this.getDeviceId();
      config.headers['X-App-Version'] = process.env.APP_VERSION || '1.0.0';
      
      return config;
    }, error => Promise.reject(error));
    
    // Intercepteur de réponse
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Si token expiré et qu'on ne rafraîchit pas déjà le token
        if (error.response?.status === 401 && !this.isRefreshingToken) {
          return this.handleTokenRefresh(error);
        }
        
        // Si on rafraîchit déjà le token, mettre la requête en attente
        if (error.response?.status === 401 && this.isRefreshingToken) {
          return new Promise((resolve, reject) => {
            this.pendingRequests.push(() => {
              this.reExecuteFailedRequest(error.config)
                .then(resolve)
                .catch(reject);
            });
          });
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Récupère l'identifiant unique de l'appareil
   */
  private async getDeviceId(): Promise<string> {
    // Implémenter la logique pour obtenir un ID d'appareil persistant
    // Par exemple, utiliser AsyncStorage ou un autre mécanisme de stockage
    return 'device-id-placeholder';
  }
  
  /**
   * Gère le rafraîchissement du token
   */
  private async handleTokenRefresh(originalError: AxiosError): Promise<AxiosResponse> {
    try {
      this.isRefreshingToken = true;
      
      if (!this.refreshTokenPromise) {
        this.refreshTokenPromise = authService.refreshToken();
      }
      
      const newToken = await this.refreshTokenPromise;
      
      // Réinitialiser la promesse après obtention du résultat
      this.refreshTokenPromise = null;
      this.isRefreshingToken = false;
      
      if (!newToken) {
        await authService.logout();
        return Promise.reject(originalError);
      }
      
      // Réessayer toutes les requêtes en attente
      this.pendingRequests.forEach(callback => callback());
      this.pendingRequests = [];
      
      // Réessayer la requête originale
      return this.reExecuteFailedRequest(originalError.config);
    } catch (error) {
      this.isRefreshingToken = false;
      this.refreshTokenPromise = null;
      await authService.handleAuthError();
      return Promise.reject(originalError);
    }
  }
  
  /**
   * Ré-exécute une requête échouée avec un nouveau token
   */
  private async reExecuteFailedRequest(config: any): Promise<AxiosResponse> {
    const newToken = await authService.getAuthToken();
    config.headers.Authorization = `Bearer ${newToken}`;
    return this.api(config);
  }
  
  /**
   * Traite la file d'attente des requêtes offline
   */
  private async processOfflineQueue(): Promise<void> {
    if (await connectivityManager.isConnected()) {
      logger.info('Connexion internet rétablie, traitement de la file d\'attente...');
      
      const queue = await offlineQueue.getQueue();
      if (queue.length === 0) return;
      
      logger.info(`Traitement de ${queue.length} requêtes en attente`);
      
      for (const request of queue) {
        try {
          await this.executeRequest(
            request.method as HttpMethod,
            request.endpoint,
            request.data,
            request.config
          );
          await offlineQueue.removeFromQueue(request.id);
          logger.info(`Requête ${request.id} traitée avec succès`);
        } catch (error) {
          logger.error(`Échec du traitement de la requête ${request.id}`, error);
          // Réessayer plus tard si ce n'est pas une erreur côté client
          const statusCode = axios.isAxiosError(error) ? error.response?.status : null;
          if (!statusCode || statusCode >= 500) {
            continue;
          }
          // Supprimer de la file en cas d'erreur côté client (4xx)
          await offlineQueue.removeFromQueue(request.id);
        }
      }
    }
  }
  
  /**
   * Exécute une requête HTTP générique
   */
  private async executeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      let response: AxiosResponse;
      
      switch (method) {
        case 'GET':
          response = await this.api.get(endpoint, config);
          break;
        case 'POST':
          response = await this.api.post(endpoint, data, config);
          break;
        case 'PUT':
          response = await this.api.put(endpoint, data, config);
          break;
        case 'PATCH':
          response = await this.api.patch(endpoint, data, config);
          break;
        case 'DELETE':
          response = await this.api.delete(endpoint, config);
          break;
        default:
          throw new Error(`Méthode HTTP non supportée: ${method}`);
      }
      
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * Envoie une requête en tenant compte du mode offline
   */
  private async sendRequest<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
    offlineFallback: boolean = true
  ): Promise<ApiResponse<T>> {
    const isConnected = await connectivityManager.isConnected();
    
    if (!isConnected) {
      if (!offlineFallback) {
        throw new Error('Aucune connexion internet disponible');
      }
      
      // En mode offline, ajouter à la file d'attente
      if (method !== 'GET') {
        const request: OfflineRequest = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          method,
          endpoint,
          data,
          config,
          timestamp: Date.now()
        };
        
        await offlineQueue.addToQueue(request);
        logger.info(`Requête ajoutée à la file d'attente offline: ${request.id}`);
        
        return {
          data: null as unknown as T,
          status: 0,
          success: false,
          message: 'Requête mise en file d\'attente en mode offline'
        };
      }
      
      throw new Error('Impossible d\'exécuter une requête GET en mode offline');
    }
    
    // Si connecté, exécuter la requête normalement
    return this.executeRequest<T>(method, endpoint, data, config);
  }
  
  /**
   * Effectue une requête GET
   */
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.sendRequest<T>('GET', endpoint, undefined, config);
  }
  
  /**
   * Effectue une requête POST
   */
  async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.sendRequest<T>('POST', endpoint, data, config);
  }
  
  /**
   * Effectue une requête PUT
   */
  async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.sendRequest<T>('PUT', endpoint, data, config);
  }
  
  /**
   * Effectue une requête PATCH
   */
  async patch<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.sendRequest<T>('PATCH', endpoint, data, config);
  }
  
  /**
   * Effectue une requête DELETE
   */
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.sendRequest<T>('DELETE', endpoint, config);
  }
  
  /**
   * Synchronise la base de données locale avec le serveur
   */
  async sync(options: SyncOptions = {}): Promise<void> {
    const isConnected = await connectivityManager.isConnected();
    if (!isConnected) {
      logger.warn('Synchronisation ignorée - aucune connexion internet');
      return;
    }
    
    try {
      logger.info('Début de la synchronisation...');
      
      await synchronize({
        database: this.database,
        pullChanges: async ({ lastPulledAt }) => {
          try {
            const response = await this.get('/sync', {
              params: {
                last_pulled_at: lastPulledAt,
                ...options.filter
              }
            });
            
            return {
              changes: response.data.changes,
              timestamp: response.data.timestamp
            };
          } catch (error) {
            logger.error('Erreur lors du pull des changements', error);
            throw error;
          }
        },
        pushChanges: async ({ changes, lastPulledAt }) => {
          try {
            if (options.pullOnly) return;
            
            await this.post('/sync', {
              changes,
              last_pulled_at: lastPulledAt
            });
          } catch (error) {
            logger.error('Erreur lors du push des changements', error);
            throw error;
          }
        },
        migrationsEnabledAtVersion: options.migrationsEnabledAtVersion
      });
      
      logger.info('Synchronisation terminée avec succès');
    } catch (error) {
      logger.error('Échec de la synchronisation', error);
      throw error;
    }
  }
  
  /**
   * Gère les erreurs API de manière centralisée
   */
  private handleApiError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      
      // Erreurs spécifiques
      switch (statusCode) {
        case 401:
          // Déjà géré par l'intercepteur
          break;
        case 403:
          logger.warn('Accès refusé', error.response?.data);
          break;
        case 404:
          logger.warn('Ressource non trouvée', error.config?.url);
          break;
        case 422:
          logger.warn('Données invalides', error.response?.data);
          break;
        case 429:
          logger.warn('Limite de débit dépassée', {
            retryAfter: error.response?.headers['retry-after']
          });
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          logger.error('Erreur serveur', {
            status: statusCode,
            url: error.config?.url
          });
          break;
        default:
          logger.error('Erreur API', {
            status: statusCode,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
          });
      }
    } else {
      logger.error('Erreur API inattendue', error);
    }
  }
}

// Pour le fichier offlineQueue.ts à créer dans utils/
export interface OfflineRequest {
  id: string;
  method: string;
  endpoint: string;
  data?: any;
  config?: AxiosRequestConfig;
  timestamp: number;
}

// Créer une instance unique
let apiServiceInstance: ApiService | null = null;

/**
 * Initialise le service API avec une base de données WatermelonDB
 * @param database La base de données WatermelonDB
 * @param baseURL L'URL de base de l'API
 */
export function initApiService(database: Database, baseURL: string): ApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService(database, baseURL);
  }
  return apiServiceInstance;
}

/**
 * Récupère l'instance du service API
 */
export function getApiService(): ApiService {
  if (!apiServiceInstance) {
    throw new Error('ApiService non initialisé. Appelez initApiService d\'abord.');
  }
  return apiServiceInstance;
}