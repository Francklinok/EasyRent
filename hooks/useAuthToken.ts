import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_access_token';

/** Read the stored JWT access token. Returns null if not authenticated. */
export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}
