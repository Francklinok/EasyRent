// src/services/apiService.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { connectivityManager } from '../manager/connectivityManager';
import { queueManager } from '../manager/queueManager';
import { authService } from './authService';

export class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL:,//Api here .exemple 'https://your-api-url.com/api'
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    // Intercepteurs pour ajouter le token d'authentification
    this.api.interceptors.request.use(async (config) => {
      const token = await authService.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const isConnected = await connectivityManager.isConnected();
    if (!isConnected) {
      throw new Error('No internet connection');
    }
    
    try {
      const response = await this.api.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const isConnected = await connectivityManager.isConnected();
    if (!isConnected) {
      throw new Error('No internet connection');
    }
    
    try {
      const response = await this.api.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const isConnected = await connectivityManager.isConnected();
    if (!isConnected) {
      throw new Error('No internet connection');
    }
    
    try {
      const response = await this.api.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  async patch<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const isConnected = await connectivityManager.isConnected();
    if (!isConnected) {
      throw new Error('No internet connection');
    }
    
    try {
      const response = await this.api.patch<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const isConnected = await connectivityManager.isConnected();
    if (!isConnected) {
      throw new Error('No internet connection');
    }
    
    try {
      const response = await this.api.delete<T>(endpoint, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  private handleApiError(error: any): void {
    if (axios.isAxiosError(error)) {
      // Gérer les erreurs d'authentification
      if (error.response?.status === 401) {
        authService.handleAuthError();
      }
      
      // Journaliser les erreurs
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      console.error('Unexpected API error:', error);
    }
  }
}

export const apiService = new ApiService();
