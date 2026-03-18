import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildGraphQLUrl } from '../../constants/apiConfig';

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
}

export class GraphQLError extends Error {
  code: string;
  originalError: any;

  constructor(message: string, code: string, originalError?: any) {
    super(message);
    this.name = 'GraphQLError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Service GraphQL pour effectuer des requêtes GraphQL
 */
export class GraphQLService {
  private endpoint: string;
  private client: AxiosInstance;

  constructor() {
    // Use environment variable or default URL
    let graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    // Si l'URL contient déjà /graphql, on l'utilise directement
    if (graphqlUrl.endsWith('/graphql')) {
      this.endpoint = '';
      this.client = axios.create({
        baseURL: graphqlUrl,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
    } else {
      // Sinon on ajoute /graphql comme endpoint
      this.endpoint = '/graphql';
      this.client = axios.create({
        baseURL: graphqlUrl,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
    }

    console.log('🔧 [GraphQL] Configuration:', {
      url: graphqlUrl,
      endpoint: this.endpoint,
      fullUrl: this.endpoint ? `${graphqlUrl}${this.endpoint}` : graphqlUrl
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(async (config) => {
      try {
        // Try to get token from GraphQL auth service first, then fall back to REST auth service
        let token = await AsyncStorage.getItem('@auth_access_token');

        if (!token) {
          // Fall back to REST auth service token key
          token = await AsyncStorage.getItem('accessToken');
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 [GraphQL] Auth token added to request');
        } else {
          console.warn('⚠️ [GraphQL] No auth token found in storage');
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    });
  }

  /**
   * Exécute une requête GraphQL
   */
  async query<T = any>(
    query: string,
    variables?: Record<string, any>,
    operationName?: string
  ): Promise<T> {
    const request: GraphQLRequest = {
      query,
      variables,
      operationName,
    };

    try {
      console.log('🔵 [GraphQL] Executing query:', operationName || 'unnamed');
      console.log('🔵 [GraphQL] Variables:', JSON.stringify(variables, null, 2));

      const response = await this.client.post<GraphQLResponse<T>>(this.endpoint, request);

      console.log('✅ [GraphQL] Response status:', response.status);

      if (response.data.errors && response.data.errors.length > 0) {
        const error = response.data.errors[0];
        console.error('❌ [GraphQL] GraphQL Error:', error);
        console.error('❌ [GraphQL] Full error details:', JSON.stringify(error, null, 2));

        // Détection spécifique des erreurs d'authentification
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('authentication required') ||
            errorMessage.includes('not authenticated') ||
            errorMessage.includes('unauthorized') ||
            error.extensions?.code === 'UNAUTHENTICATED') {
          throw new GraphQLError(error.message, 'UNAUTHENTICATED', error);
        }

        // Détection des erreurs de permissions
        if (errorMessage.includes('forbidden') ||
            errorMessage.includes('permission denied') ||
            error.extensions?.code === 'FORBIDDEN') {
          throw new GraphQLError(error.message, 'FORBIDDEN', error);
        }

        // Erreur générique
        throw new GraphQLError(error.message, 'GRAPHQL_ERROR', error);
      }

      if (!response.data.data) {
        console.error('❌ [GraphQL] No data in response');
        throw new Error('No data returned from GraphQL query');
      }

      console.log('✅ [GraphQL] Query successful');
      return response.data.data;
    } catch (error) {
      console.error('❌ [GraphQL] Query failed:', error);

      // Log more details for axios errors
      if (axios.isAxiosError(error)) {
        console.error('❌ [GraphQL] Response status:', error.response?.status);
        console.error('❌ [GraphQL] Response data:', error.response?.data);
        console.error('❌ [GraphQL] Request headers:', error.config?.headers);
      }

      // En mode développement, si c'est une vraie erreur réseau (pas de réponse), utiliser les données mockées
      const isDev = __DEV__ || process.env.NODE_ENV === 'development';
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Uniquement les vraies erreurs réseau (pas de réponse du serveur), pas les erreurs HTTP (401, 500...)
      const isNetworkError =
        (axios.isAxiosError(error) && !error.response) ||
        (error && (error as any).code === 'ERR_NETWORK') ||
        (error && (error as any).code === 'ECONNREFUSED') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('Network request failed');

      if (isDev && isNetworkError) {
        console.log('🔧 [GraphQL] Network error detected (no response), falling back to mock data service');
        throw new Error('NETWORK_ERROR_USE_MOCK');
      }

      throw error;
    }
  }

  /**
   * Exécute une mutation GraphQL
   */
  async mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>,
    operationName?: string
  ): Promise<T> {
    return this.query<T>(mutation, variables, operationName);
  }
}

// Instance unique du service GraphQL
let graphqlServiceInstance: GraphQLService | null = null;

/**
 * Récupère l'instance du service GraphQL
 */
export function getGraphQLService(): GraphQLService {
  if (!graphqlServiceInstance) {
    graphqlServiceInstance = new GraphQLService();
  }
  return graphqlServiceInstance;
}