/**
 * Script pour nettoyer manuellement TOUTES les données d'authentification
 * À utiliser en cas de problème de cache persistant
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllAuthDataManually = async (): Promise<void> => {
  console.log('🧹 [MANUAL CLEAR] Starting complete auth data cleanup...');

  try {
    // 1. Obtenir TOUTES les clés
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 [MANUAL CLEAR] All storage keys:', allKeys);

    // 2. Filtrer les clés liées à l'auth
    const authRelatedKeys = allKeys.filter(key =>
      key.includes('auth') ||
      key.includes('token') ||
      key.includes('Token') ||
      key.includes('user') ||
      key.includes('User') ||
      key.includes('session') ||
      key.includes('Session')
    );

    console.log('🔑 [MANUAL CLEAR] Auth-related keys to delete:', authRelatedKeys);

    // 3. Supprimer TOUTES les clés d'auth
    if (authRelatedKeys.length > 0) {
      await AsyncStorage.multiRemove(authRelatedKeys);
      console.log('✅ [MANUAL CLEAR] Deleted', authRelatedKeys.length, 'auth-related keys');
    }

    // 4. Vérification finale
    const remainingKeys = await AsyncStorage.getAllKeys();
    const remainingAuthKeys = remainingKeys.filter(key =>
      key.includes('auth') ||
      key.includes('token') ||
      key.includes('user')
    );

    if (remainingAuthKeys.length === 0) {
      console.log('✅ [MANUAL CLEAR] All auth data successfully cleared!');
    } else {
      console.warn('⚠️ [MANUAL CLEAR] Some auth keys still remain:', remainingAuthKeys);
    }

  } catch (error) {
    console.error('❌ [MANUAL CLEAR] Error during cleanup:', error);
    throw error;
  }
};

/**
 * Affiche toutes les données d'auth actuelles
 */
export const debugAllAuthData = async (): Promise<void> => {
  console.log('\n=== 🔍 COMPLETE AUTH DEBUG ===');

  try {
    const allKeys = await AsyncStorage.getAllKeys();

    for (const key of allKeys) {
      if (key.includes('auth') || key.includes('token') || key.includes('user')) {
        const value = await AsyncStorage.getItem(key);

        if (value) {
          if (key.includes('user') || key.includes('User')) {
            try {
              const parsed = JSON.parse(value);
              console.log(`\n📦 ${key}:`);
              console.log('  - ID:', parsed.id);
              console.log('  - Email:', parsed.email);
              console.log('  - FirstName:', parsed.firstName);
              console.log('  - LastName:', parsed.lastName);
              console.log('  - FullName:', parsed.fullName);
            } catch {
              console.log(`${key}: [Invalid JSON]`);
            }
          } else {
            console.log(`${key}: ${value.substring(0, 30)}...`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error debugging:', error);
  }

  console.log('\n=== END DEBUG ===\n');
};
