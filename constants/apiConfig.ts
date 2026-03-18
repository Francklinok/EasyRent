/**
 * Configuration centralisée des URLs API pour l'application
 * Utilisez les variables d'environnement pour personnaliser selon l'environnement
 */

// Configuration par défaut - ajustez l'IP selon votre machine
// IMPORTANT: Remplacez 'localhost' par l'IP de votre machine backend si nécessaire
// Pour trouver votre IP:
//   - Windows: ipconfig (cherchez "Adresse IPv4")
//   - Mac/Linux: ifconfig ou ip addr
//   - Ou utilisez 'localhost' si le backend est sur la même machine
const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST || '192.168.1.72'; // IP de votre machine (remplacez si différente)
const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3000';
const DEFAULT_WS_PORT = process.env.EXPO_PUBLIC_WS_PORT || '3000'; // WebSocket utilise le même port que HTTP

/**
 * Configuration des URLs API
 */
export const API_CONFIG = {
  // Flags de développement
  // PRODUCTION MODE: Mode mock désactivé - connexion au backend réel
  USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true' || false, // Mode production par défaut

  // URL de base pour l'API REST
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}`,

  // URLs spécifiques pour chaque service
  AUTH_URL: process.env.EXPO_PUBLIC_AUTH_URL || `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}/api/v1/auth`,
  CHAT_URL: process.env.EXPO_PUBLIC_CHAT_URL || `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}/api/chat`,
  GRAPHQL_URL: process.env.EXPO_PUBLIC_GRAPHQL_URL || `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}/graphql`,
  PROPERTY_URL: process.env.EXPO_PUBLIC_PROPERTY_URL || `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}/api/properties`,
  WALLET_URL: process.env.EXPO_PUBLIC_WALLET_URL || `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}/api/wallet`,
  SERVICES_URL: process.env.EXPO_PUBLIC_SERVICES_URL || `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}/api/services`,

  // URL WebSocket pour le temps réel
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || `ws://${DEFAULT_API_HOST}:${DEFAULT_WS_PORT}`,

  // Configuration Socket.IO (si différent)
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}`,

  // Timeouts et limites
  REQUEST_TIMEOUT: 30000,
  WS_RECONNECT_ATTEMPTS: 5,
  WS_RECONNECT_DELAY: 1000,
};

/**
 * Validation de la configuration
 */
export const validateApiConfig = (): boolean => {
  const requiredUrls = [
    API_CONFIG.BASE_URL,
    API_CONFIG.AUTH_URL,
    API_CONFIG.CHAT_URL,
    API_CONFIG.GRAPHQL_URL,
    API_CONFIG.WS_URL,
  ];

  return requiredUrls.every(url => url && url.trim() !== '');
};

/**
 * Utilitaires pour construire des URLs
 */
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

export const buildChatUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.CHAT_URL}/${cleanEndpoint}`;
};

export const buildGraphQLUrl = (): string => {
  return API_CONFIG.GRAPHQL_URL;
};

export const buildWebSocketUrl = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.WS_URL}${cleanPath}`;
};

/**
 * Logs de configuration pour le debug
 */
export const logApiConfig = (): void => {
  console.log('=== API Configuration ===');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Auth URL:', API_CONFIG.AUTH_URL);
  console.log('Chat URL:', API_CONFIG.CHAT_URL);
  console.log('GraphQL URL:', API_CONFIG.GRAPHQL_URL);
  console.log('WebSocket URL:', API_CONFIG.WS_URL);
  console.log('Socket.IO URL:', API_CONFIG.SOCKET_URL);
  console.log('========================');
};