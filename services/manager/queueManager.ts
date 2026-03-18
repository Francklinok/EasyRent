/**
 * QueueManager - Wrapper de compatibilité vers OfflineQueueService
 *
 * @deprecated Utilisez offlineQueueService depuis '@/services/offline' à la place.
 * Ce service est maintenu pour compatibilité descendante uniquement.
 *
 * MIGRATION: Les nouveaux composants devraient importer directement:
 * import { offlineQueueService } from '@/services/offline';
 */

import { offlineQueueService, QueuePriority, EntityTable } from '@/services/offline';
import type { QueuePriorityValue } from '@/services/offline';
import { QueuedAction } from '@/types/fotype';

/**
 * @deprecated Utilisez offlineQueueService.enqueue() à la place
 */
export class QueueManager {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    // OfflineQueueService s'initialise automatiquement
    this.isInitialized = true;
    console.log('[QueueManager] Initialized (wrapper mode - using OfflineQueueService)');
  }

  /**
   * @deprecated Utilisez offlineQueueService.enqueue() à la place
   */
  async addToQueue<T>(action: Omit<QueuedAction<T>, 'id' | 'timestamp' | 'retries' | 'priority'>): Promise<string> {
    await this.initialize();

    // Map old action types to entity types
    const entityType = this.mapActionTypeToEntity(action.type);
    const queueAction = this.mapActionTypeToAction(action.type);

    const id = await offlineQueueService.enqueue({
      entityType,
      entityId: (action.data as any)?.id || `temp_${Date.now()}`,
      action: queueAction,
      data: {
        ...action.data,
        endpoint: action.endpoint,
        method: action.method,
        entity: action.entity,
        originalType: action.type,
      },
      priority: this.getPriorityForAction(action.type),
    });

    return id;
  }

  /**
   * @deprecated Utilisez offlineQueueService.getQueue() à la place
   */
  async getQueue(): Promise<QueuedAction[]> {
    await this.initialize();
    const items = await offlineQueueService.getQueue();

    // Convert to legacy format
    return items.map((item) => ({
      id: item.id,
      type: item.data?.originalType || `${item.action}_${item.entityType}`.toUpperCase(),
      endpoint: item.data?.endpoint || `/${item.entityType}`,
      method: this.actionToMethod(item.action),
      data: item.data,
      entity: item.entityType,
      timestamp: item.createdAt,
      retries: item.retryCount,
      priority: item.priority,
    }));
  }

  /**
   * @deprecated Utilisez offlineQueueService.dequeue() à la place
   */
  async removeFromQueue(id: string): Promise<void> {
    await this.initialize();
    await offlineQueueService.dequeue(id);
  }

  /**
   * @deprecated Pas d'équivalent direct - géré automatiquement par OfflineQueueService
   */
  async updateActionRetry(id: string): Promise<void> {
    // OfflineQueueService gère automatiquement les retries
    console.log(`[QueueManager] updateActionRetry called for ${id} - handled automatically`);
  }

  /**
   * @deprecated Utilisez offlineQueueService.clearQueue() à la place
   */
  async clearQueue(): Promise<void> {
    await offlineQueueService.clearQueue();
  }

  private getPriorityForAction(type: string): QueuePriorityValue {
    switch (type) {
      case 'CREATE_CONTRACT':
      case 'UPDATE_CONTRACT':
        return QueuePriority.CRITICAL;
      case 'CREATE_MESSAGE':
      case 'UPDATE_MESSAGE':
        return QueuePriority.HIGH;
      case 'CREATE_PROPERTY':
      case 'UPDATE_PROPERTY':
        return QueuePriority.NORMAL;
      case 'UPLOAD_IMAGE':
        return QueuePriority.LOW;
      default:
        return QueuePriority.NORMAL;
    }
  }

  private mapActionTypeToEntity(type: string): EntityTable {
    if (type.includes('CONTRACT')) return 'activities';
    if (type.includes('MESSAGE')) return 'messages';
    if (type.includes('PROPERTY')) return 'properties';
    if (type.includes('SERVICE')) return 'services';
    if (type.includes('WALLET') || type.includes('TRANSACTION')) return 'transactions';
    if (type.includes('NOTIFICATION')) return 'notifications';
    if (type.includes('USER') || type.includes('PROFILE')) return 'users';
    return 'properties'; // Default
  }

  private mapActionTypeToAction(type: string): 'CREATE' | 'UPDATE' | 'DELETE' {
    if (type.startsWith('CREATE_')) return 'CREATE';
    if (type.startsWith('UPDATE_') || type.startsWith('UPLOAD_')) return 'UPDATE';
    if (type.startsWith('DELETE_')) return 'DELETE';
    return 'UPDATE';
  }

  private actionToMethod(action: string): 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
    switch (action) {
      case 'CREATE':
        return 'POST';
      case 'UPDATE':
        return 'PUT';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'PUT';
    }
  }
}

/**
 * @deprecated Utilisez offlineQueueService depuis '@/services/offline' à la place
 */
export const queueManager = new QueueManager();