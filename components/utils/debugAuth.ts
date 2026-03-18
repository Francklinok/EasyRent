/**
 * Utilitaire de debug pour l'authentification
 * Permet de vérifier l'état du stockage AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugAuthStorage = async (): Promise<void> => {
  console.log('\n=== 🔍 DEBUG AUTH STORAGE ===');

  try {
    // Récupérer toutes les clés
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 All storage keys:', allKeys);

    // Clés d'authentification importantes
    const authKeys = [
      'accessToken',
      'refreshToken',
      'sessionId',
      'user',
      '@auth_access_token',
      '@auth_refresh_token',
      '@auth_user_data',
      '@auth_token_expiry'
    ];

    console.log('\n🔑 Auth-related values:');
    for (const key of authKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        // Pour les tokens, afficher juste les premiers caractères
        if (key.includes('token') || key.includes('Token')) {
          console.log(`  ${key}: ${value.substring(0, 20)}...`);
        }
        // Pour l'utilisateur, parser et afficher l'email
        else if (key === 'user' || key === '@auth_user_data') {
          try {
            const userData = JSON.parse(value);
            console.log(`  ${key}: { id: ${userData.id}, email: ${userData.email} }`);
          } catch {
            console.log(`  ${key}: [Invalid JSON]`);
          }
        }
        else {
          console.log(`  ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
        }
      } else {
        console.log(`  ${key}: [NOT SET]`);
      }
    }

  } catch (error) {
    console.error('❌ Error debugging auth storage:', error);
  }

  console.log('=== END DEBUG ===\n');
};

/**
 * Nettoie complètement toutes les données d'authentification
 * ATTENTION: À utiliser uniquement pour le debug !
 */
export const clearAllAuthData = async (): Promise<void> => {
  console.log('🧹 Clearing ALL auth data...');

  const authKeys = [
    'accessToken',
    'refreshToken',
    'sessionId',
    'user',
    '@auth_access_token',
    '@auth_refresh_token',
    '@auth_user_data',
    '@auth_token_expiry'
  ];

  try {
    await AsyncStorage.multiRemove(authKeys);
    console.log('✅ All auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};
