import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utility to check authentication state
 */
export const debugAuthState = async () => {
  console.log('\n=== 🔍 AUTH DEBUG INFO ===');

  try {
    // Check all possible token storage keys
    const graphqlToken = await AsyncStorage.getItem('@auth_access_token');
    const restToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const sessionId = await AsyncStorage.getItem('sessionId');
    const userData = await AsyncStorage.getItem('user');

    console.log('GraphQL Token (@auth_access_token):', graphqlToken ? `${graphqlToken.substring(0, 20)}...` : 'NOT FOUND');
    console.log('REST Token (accessToken):', restToken ? `${restToken.substring(0, 20)}...` : 'NOT FOUND');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NOT FOUND');
    console.log('Session ID:', sessionId ? 'EXISTS' : 'NOT FOUND');
    console.log('User Data:', userData ? 'EXISTS' : 'NOT FOUND');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('User:', {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`
        });
      } catch (e) {
        console.log('Failed to parse user data');
      }
    }

    console.log('=== END AUTH DEBUG ===\n');

    return {
      hasGraphqlToken: !!graphqlToken,
      hasRestToken: !!restToken,
      hasRefreshToken: !!refreshToken,
      hasSession: !!sessionId,
      hasUser: !!userData
    };
  } catch (error) {
    console.error('Error checking auth state:', error);
    return null;
  }
};

/**
 * Get the active auth token (checking both locations)
 */
export const getActiveAuthToken = async (): Promise<string | null> => {
  try {
    // Try GraphQL auth token first
    let token = await AsyncStorage.getItem('@auth_access_token');

    if (!token) {
      // Fall back to REST auth token
      token = await AsyncStorage.getItem('accessToken');
    }

    return token;
  } catch (error) {
    console.error('Error getting active auth token:', error);
    return null;
  }
};
