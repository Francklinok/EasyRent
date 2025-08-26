import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.70:3000/api';

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
  preferences?: Record<string, any>;
  isPremium?:boolean;
  premiumExpiry?:Date
}

export interface SearchUsersData {
  query?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details?: Record<string, any>;
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

  // Récupérer l'utilisateur connecté
  async getCurrentUser(): Promise<UserData> {
    return this.makeRequest<UserData>('/users/me');
  }

  // Liste des utilisateurs (pour admin)
  async getUsers(page: number = 1, limit: number = 10): Promise<{users: UserData[], total: number}> {
    return this.makeRequest<{users: UserData[], total: number}>(`/users?page=${page}&limit=${limit}`);
  }

  // Détails d'un utilisateur par ID
  async getUserById(userId: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/users/${userId}`);
  }

  // Recherche avancée d'utilisateurs
  async searchUsers(searchData: SearchUsersData): Promise<{users: UserData[], total: number}> {
    return this.makeRequest<{users: UserData[], total: number}>('/users/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  // Mise à jour de l'utilisateur connecté
  async updateCurrentUser(data: UpdateUserData): Promise<UserData> {
    return this.makeRequest<UserData>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Mise à jour d'un utilisateur par ID (pour admin)
  async updateUser(userId: string, data: UpdateUserData): Promise<UserData> {
    return this.makeRequest<UserData>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Activer un utilisateur
  async activateUser(userId: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/users/${userId}/activate`, {
      method: 'PUT',
    });
  }

  // Désactiver un utilisateur
  async deactivateUser(userId: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/users/${userId}/deactivate`, {
      method: 'PUT',
    });
  }

  // Upload de photo de profil
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

  // Supprimer l'utilisateur connecté
  async deleteCurrentUser(): Promise<{ success: boolean }> {
    return this.makeRequest('/users/me', {
      method: 'DELETE',
    });
  }

  // Supprimer un utilisateur par ID (pour admin)
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Mettre à jour les préférences
  async updatePreferences(preferences: Record<string, any>): Promise<UserData> {
    return this.makeRequest<UserData>('/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  }

  // Récupérer les logs d'activité d'un utilisateur
  async getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
    return this.makeRequest<ActivityLog[]>(`/users/${userId}/activity-logs`);
  }

  // Récupérer ses propres logs d'activité
  async getCurrentUserActivityLogs(): Promise<ActivityLog[]> {
    const currentUser = await this.getCurrentUser();
    return this.getUserActivityLogs(currentUser.id);
  }
}

export const userService = new UserService();