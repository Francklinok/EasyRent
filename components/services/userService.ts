import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://api.yourapp.com';

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  photo?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: Record<string, any>;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  photo?: string;
  preferences?: Record<string, any>;
}

class UserService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async getCurrentUser(): Promise<UserData> {
    return this.makeRequest<UserData>('/users/me');
  }

  async updateUser(data: UpdateUserData): Promise<UserData> {
    return this.makeRequest<UserData>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async uploadProfilePicture(imageUri: string): Promise<{ photo: string }> {
    const token = await this.getAuthToken();
    
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await fetch(`${API_BASE_URL}/users/me/photo`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async deleteAccount(): Promise<{ success: boolean }> {
    return this.makeRequest('/users/me', {
      method: 'DELETE',
    });
  }

  async updatePreferences(preferences: Record<string, any>): Promise<UserData> {
    return this.makeRequest<UserData>('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ preferences }),
    });
  }
}

export const userService = new UserService();