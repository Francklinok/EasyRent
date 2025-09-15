import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.75:3000/api/v1/services';

class PropertyServiceAPI {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createServiceProvider(providerData: {
    businessName: string;
    description: string;
    phone: string;
    address: string;
    categories: string[];
  }) {
    return this.makeRequest('/provider', {
      method: 'POST',
      body: JSON.stringify(providerData),
    });
  }

  async getProviderServices() {
    return this.makeRequest('/provider/services');
  }

  async createService(serviceData: FormData) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: serviceData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getServices(filters?: {
    category?: string;
    location?: string;
    priceMin?: number;
    priceMax?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    
    const endpoint = params.toString() ? `/?${params.toString()}` : '/';
    return this.makeRequest(endpoint);
  }

  async subscribeToService(subscriptionData: {
    serviceId: string;
    startDate: string;
    duration?: number;
    sharedWith?: string[];
  }) {
    return this.makeRequest('/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async getUserSubscriptions() {
    return this.makeRequest('/subscriptions');
  }

  async getRecommendations(recommendationData: {
    propertyType: string;
    location: string;
    budget?: number;
    preferences?: string[];
  }) {
    return this.makeRequest('/recommendations', {
      method: 'POST',
      body: JSON.stringify(recommendationData),
    });
  }
}

export const propertyServiceAPI = new PropertyServiceAPI();