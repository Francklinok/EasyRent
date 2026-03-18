/**
 * Network Utilities
 * Détecte automatiquement l'environnement (émulateur vs device physique)
 * et retourne la bonne URL API
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Détecte si l'app tourne sur un émulateur Android
 */
export const isAndroidEmulator = (): boolean => {
  if (Platform.OS !== 'android') return false;

  // Vérifie plusieurs indicateurs d'émulateur
  const { isDevice } = Constants;
  const brand = Constants.platform?.android?.brand?.toLowerCase() || '';
  const model = Constants.platform?.android?.model?.toLowerCase() || '';

  // Sur émulateur: isDevice = false ou model/brand contient "emulator", "sdk", "google"
  if (isDevice === false) return true;
  if (model.includes('sdk') || model.includes('emulator')) return true;
  if (brand.includes('generic') || brand.includes('google')) return true;

  return false;
};

/**
 * Retourne l'adresse IP locale correcte selon l'environnement
 */
export const getApiHost = (defaultHost: string = '192.168.1.72'): string => {
  // Sur émulateur Android, localhost est accessible via 10.0.2.2
  if (isAndroidEmulator()) {
    console.log('[Network] Detected Android Emulator - Using 10.0.2.2');
    return '10.0.2.2';
  }

  // Sur device physique ou iOS simulator, utilise l'IP du backend
  console.log(`[Network] Detected Physical Device - Using ${defaultHost}`);
  return defaultHost;
};

/**
 * Construit l'URL complète de l'API
 */
export const buildApiUrl = (
  endpoint: string,
  port: string = '3000',
  host?: string
): string => {
  const apiHost = host || getApiHost();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `http://${apiHost}:${port}${cleanEndpoint}`;
};

/**
 * Test de connectivité avec le backend
 */
export const testBackendConnection = async (
  baseUrl?: string
): Promise<{ success: boolean; url: string; error?: string }> => {
  const url = baseUrl || buildApiUrl('/', '3000');

  try {
    console.log(`[Network] Testing connection to: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[Network] Connection test result: ${response.status}`);

    return {
      success: response.ok,
      url,
    };
  } catch (error: any) {
    console.error('[Network] Connection test failed:', error.message);

    return {
      success: false,
      url,
      error: error.message,
    };
  }
};

/**
 * Affiche les informations de debug réseau
 */
export const logNetworkInfo = () => {
  console.log('=== NETWORK INFO ===');
  console.log('Platform:', Platform.OS);
  console.log('Is Device:', Constants.isDevice);
  console.log('Is Android Emulator:', isAndroidEmulator());
  console.log('API Host:', getApiHost());

  if (Platform.OS === 'android') {
    console.log('Android Brand:', Constants.platform?.android?.brand);
    console.log('Android Model:', Constants.platform?.android?.model);
  }

  console.log('==================');
};
