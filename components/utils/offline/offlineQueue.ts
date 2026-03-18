import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineRequest {
  id: string;
  method: string;
  endpoint: string;
  data?: any;
  config?: any;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = '@offline_queue';

class OfflineQueue {
  private queue: OfflineRequest[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storedQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize offline queue:', error);
      this.queue = [];
      this.initialized = true;
    }
  }

  async addToQueue(request: OfflineRequest): Promise<void> {
    await this.initialize();
    
    this.queue.push(request);
    await this.saveQueue();
  }

  async removeFromQueue(requestId: string): Promise<void> {
    await this.initialize();
    
    this.queue = this.queue.filter(req => req.id !== requestId);
    await this.saveQueue();
  }

  async getQueue(): Promise<OfflineRequest[]> {
    await this.initialize();
    return [...this.queue];
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  async getQueueSize(): Promise<number> {
    await this.initialize();
    return this.queue.length;
  }

  async getOldestRequest(): Promise<OfflineRequest | null> {
    await this.initialize();
    
    if (this.queue.length === 0) return null;
    
    return this.queue.reduce((oldest, current) => 
      current.timestamp < oldest.timestamp ? current : oldest
    );
  }

  async removeOldRequests(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    await this.initialize();
    
    const now = Date.now();
    this.queue = this.queue.filter(req => now - req.timestamp < maxAge);
    await this.saveQueue();
  }
}

export const offlineQueue = new OfflineQueue();