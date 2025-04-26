
// ========== SYSTÈME DE FILE D'ATTENTE ==========

// src/services/queueManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { QueuedAction } from '../types';

const QUEUE_STORAGE_KEY = 'offline_action_queue';

export class QueueManager {
  private queue: QueuedAction[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing queue:', error);
      this.queue = [];
    }
  }

  async addToQueue<T>(action: Omit<QueuedAction<T>, 'id' | 'timestamp' | 'retries' | 'priority'>): Promise<string> {
    await this.initialize();
    
    const queueItem: QueuedAction<T> = {
      ...action,
      id: uuidv4(),
      timestamp: Date.now(),
      retries: 0,
      priority: this.getPriorityForAction(action.type),
    };
    
    this.queue.push(queueItem);
    await this.persistQueue();
    
    return queueItem.id;
  }

  async getQueue(): Promise<QueuedAction[]> {
    await this.initialize();
    return [...this.queue].sort((a, b) => b.priority - a.priority);
  }

  async removeFromQueue(id: string): Promise<void> {
    await this.initialize();
    this.queue = this.queue.filter(item => item.id !== id);
    await this.persistQueue();
  }

  async updateActionRetry(id: string): Promise<void> {
    await this.initialize();
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.queue[index].retries += 1;
      await this.persistQueue();
    }
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error persisting queue:', error);
    }
  }

  private getPriorityForAction(type: string): number {
    // Définir des priorités pour différents types d'actions
    switch (type) {
      case 'CREATE_CONTRACT':
      case 'UPDATE_CONTRACT':
        return 100; // Priorité la plus élevée
      case 'CREATE_MESSAGE':
      case 'UPDATE_MESSAGE':
        return 80;
      case 'CREATE_PROPERTY':
      case 'UPDATE_PROPERTY':
        return 60;
      case 'UPLOAD_IMAGE':
        return 40;
      default:
        return 50;
    }
  }
}

export const queueManager = new QueueManager();
