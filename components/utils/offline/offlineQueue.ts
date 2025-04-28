// src/utils/offlineQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';
import { logger } from './logger';

const QUEUE_STORAGE_KEY = '@offline_requests_queue';

export interface OfflineRequest {
  id: string;
  method: string;
  endpoint: string;
  data?: any;
  config?: AxiosRequestConfig;
  timestamp: number;
}

class OfflineQueue {
  private queue: OfflineRequest[] = [];
  private initialized: boolean = false;
  
  /**
   * Initialise la file d'attente depuis le stockage persistant
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
        logger.info(`File d'attente offline chargée: ${this.queue.length} requêtes`);
      }
      this.initialized = true;
    } catch (error) {
      logger.error('Erreur lors du chargement de la file d\'attente offline', error);
      this.queue = [];
      this.initialized = true;
    }
  }
  
  /**
   * Persiste la file d'attente dans le stockage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde de la file d\'attente offline', error);
    }
  }
  
  /**
   * Récupère la file d'attente complète
   */
  async getQueue(): Promise<OfflineRequest[]> {
    await this.initialize();
    return [...this.queue];
  }
  
  /**
   * Ajoute une requête à la file d'attente
   */
  async addToQueue(request: OfflineRequest): Promise<void> {
    await this.initialize();
    
    // Ne pas dupliquer les requêtes
    const existingIndex = this.queue.findIndex(
      item => item.endpoint === request.endpoint && item.method === request.method
    );
    
    if (existingIndex !== -1) {
      // Remplacer l'existante par la plus récente
      this.queue[existingIndex] = request;
    } else {
      this.queue.push(request);
    }
    
    // Limiter la taille de la file à 100 requêtes
    if (this.queue.length > 100) {
      // Supprimer les plus anciennes
      this.queue = this.queue.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
    }
    
    await this.saveQueue();
  }
  
  /**
   * Supprime une requête de la file d'attente
   */
  async removeFromQueue(requestId: string): Promise<void> {
    await this.initialize();
    this.queue = this.queue.filter(request => request.id !== requestId);
    await this.saveQueue();
  }
  
  /**
   * Vide complètement la file d'attente
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    logger.info('File d\'attente offline vidée');
  }
  
  /**
   * Récupère les requêtes expirées (plus anciennes qu'une durée spécifiée)
   * @param maxAgeMs Âge maximum en millisecondes (par défaut 7 jours)
   */
  async getExpiredRequests(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<OfflineRequest[]> {
    await this.initialize();
    const now = Date.now();
    return this.queue.filter(request => now - request.timestamp > maxAgeMs);
  }
  
  /**
   * Nettoie les requêtes expirées
   * @param maxAgeMs Âge maximum en millisecondes (par défaut 7 jours)
   */
  async cleanExpiredRequests(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    await this.initialize();
    const expiredRequests = await this.getExpiredRequests(maxAgeMs);
    if (expiredRequests.length === 0) return 0;
    
    this.queue = this.queue.filter(request => {
      const isExpired = Date.now() - request.timestamp > maxAgeMs;
      return !isExpired;
    });
    
    await this.saveQueue();
    logger.info(`${expiredRequests.length} requêtes expirées ont été supprimées`);
    return expiredRequests.length;
  }
}

export const offlineQueue = new OfflineQueue();