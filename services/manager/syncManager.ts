
// src/services/syncManager.ts
import { database } from '../database';
import { queueManager } from './queueManager';
import { apiService } from './apiService';
import { QueuedAction } from '../types';

export class SyncManager {
  private isSyncing: boolean = false;
  private syncTimeout: NodeJS.Timeout | null = null;

  async synchronize(): Promise<void> {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      
      // 1. Traiter les actions en file d'attente
      await this.processQueue();
      
      // 2. Synchroniser les données du serveur
      await this.pullServerChanges();
      
    } catch (error) {
      console.error('Synchronization error:', error);
    } finally {
      this.isSyncing = false;
      
      // Planifier la prochaine synchronisation
      if (this.syncTimeout) {
        clearTimeout(this.syncTimeout);
      }
      this.syncTimeout = setTimeout(() => this.synchronize(), 5 * 60 * 1000); // 5 minutes
    }
  }

  private async processQueue(): Promise<void> {
    const queue = await queueManager.getQueue();
    
    for (const action of queue) {
      try {
        await this.processAction(action);
        await queueManager.removeFromQueue(action.id);
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
        
        // Mise à jour du nombre de tentatives
        await queueManager.updateActionRetry(action.id);
        
        // Si trop de tentatives, supprimer l'action
        if (action.retries >= 5) {
          await queueManager.removeFromQueue(action.id);
          
          // Mettre à jour le statut de l'entité locale si nécessaire
          if (action.entity && action.data?.id) {
            try {
              const collection = database.get(action.entity);
              const record = await collection.find(action.data.id);
              
              await database.action(async () => {
                await record.update((item: any) => {
                  item.syncStatus = 'error';
                  item.syncError = `Failed after ${action.retries} attempts`;
                });
              });
            } catch (findError) {
              console.error('Error updating failed sync status:', findError);
            }
          }
        }
      }
    }
  }

  private async processAction(action: QueuedAction): Promise<void> {
    switch (action.method) {
      case 'POST':
        return await apiService.post(action.endpoint, action.data);
      case 'PUT':
        return await apiService.put(`${action.endpoint}/${action.data.serverId || action.data.id}`, action.data);
      case 'PATCH':
        return await apiService.patch(`${action.endpoint}/${action.data.serverId || action.data.id}`, action.data);
      case 'DELETE':
        return await apiService.delete(`${action.endpoint}/${action.data.serverId || action.data.id}`);
      default:
        throw new Error(`Unsupported method: ${action.method}`);
    }
  }

  private async pullServerChanges(): Promise<void> {
    // Récupérer la dernière synchronisation
    const lastSyncTimestamp = await this.getLastSyncTimestamp();
    
    // Récupérer les changements depuis le serveur
    try {
      const changes = await apiService.get(`/sync?since=${lastSyncTimestamp}`);
      
      // Appliquer les changements à la base de données locale
      await database.action(async () => {
        // Traiter les entités mises à jour/créées
        for (const entityType in changes.entities) {
          const collection = database.get(entityType);
          const entities = changes.entities[entityType];
          
          for (const entity of entities) {
            try {
              // Vérifier si l'entité existe déjà
              const existingRecord = await collection
                .query(Q.where('server_id', entity.id))
                .fetch();
              
              if (existingRecord.length > 0) {
                // Mettre à jour l'entité existante
                await existingRecord[0].update((record: any) => {
                  this.mapServerEntityToLocal(record, entity);
                });
              } else {
                // Créer une nouvelle entité
                await collection.create((record: any) => {
                  this.mapServerEntityToLocal(record, entity);
                });
              }
            } catch (error) {
              console.error(`Error syncing ${entityType} entity:`, error);
            }
          }
        }
        
        // Traiter les suppressions
        if (changes.deletions) {
          for (const entityType in changes.deletions) {
            const collection = database.get(entityType);
            const deletedIds = changes.deletions[entityType];
            
            for (const serverId of deletedIds) {
              try {
                const records = await collection
                  .query(Q.where('server_id', serverId))
                  .fetch();
                
                for (const record of records) {
                  await record.markAsDeleted();
                }
              } catch (error) {
                console.error(`Error processing deletion for ${entityType}:`, error);
              }
            }
          }
        }
      });
      
      // Mettre à jour le timestamp de dernière synchronisation
      await this.setLastSyncTimestamp(Date.now());
    } catch (error) {
      console.error('Error pulling server changes:', error);
      throw error;
    }
  }

  private mapServerEntityToLocal(localRecord: any, serverEntity: any): void {
    // Mapper les propriétés du serveur vers les propriétés locales
    for (const [key, value] of Object.entries(serverEntity)) {
      if (key === 'id') {
        localRecord.serverId = value;
      } else if (key.endsWith('_id')) {
        // Gérer les clés étrangères (serverId -> id)
        const localKey = key.replace('_id', '_serverId');
        localRecord[localKey] = value;
      } else {
        // Convertir camelCase en snake_case si nécessaire
        const localKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        localRecord[localKey] = value;
      }
    }
    
    // Définir l'état de synchronisation
    localRecord.syncStatus = 'synced';
    localRecord.lastSyncAt = new Date();
    localRecord.syncError = null;
  }

  private async getLastSyncTimestamp(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem('last_sync_timestamp');
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return 0;
    }
  }

  private async setLastSyncTimestamp(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem('last_sync_timestamp', timestamp.toString());
    } catch (error) {
      console.error('Error setting last sync timestamp:', error);
    }
  }
}

export const syncManager = new SyncManager();
