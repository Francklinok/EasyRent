/**
 * SyncManager - Wrapper de compatibilité vers SyncEngine
 *
 * @deprecated Utilisez syncEngine depuis '@/services/offline' à la place.
 * Ce service est maintenu pour compatibilité descendante uniquement.
 *
 * MIGRATION: Les nouveaux composants devraient importer directement:
 * import { syncEngine } from '@/services/offline';
 */

import { syncEngine } from '@/services/offline';

/**
 * @deprecated Utilisez syncEngine depuis '@/services/offline' à la place
 */
export class SyncManager {
  private isSyncing: boolean = false;
  private syncTimeout: NodeJS.Timeout | null = null;

  /**
   * @deprecated Utilisez syncEngine.sync() à la place
   */
  async synchronize(): Promise<void> {
    if (this.isSyncing) return;

    try {
      this.isSyncing = true;
      console.log('[SyncManager] synchronize() called (wrapper mode - using SyncEngine)');

      // Déléguer au SyncEngine
      await syncEngine.sync();

    } catch (error) {
      console.error('[SyncManager] Synchronization error:', error);
    } finally {
      this.isSyncing = false;

      // Le background sync est géré par SyncEngine
      // mais on garde la compatibilité avec l'ancien comportement
      if (this.syncTimeout) {
        clearTimeout(this.syncTimeout);
      }
      this.syncTimeout = setTimeout(() => this.synchronize(), 5 * 60 * 1000);
    }
  }

  /**
   * Démarre la synchronisation en arrière-plan
   * @deprecated Utilisez syncEngine.startBackgroundSync() à la place
   */
  startBackgroundSync(): void {
    syncEngine.startBackgroundSync();
  }

  /**
   * Arrête la synchronisation en arrière-plan
   * @deprecated Utilisez syncEngine.stopBackgroundSync() à la place
   */
  stopBackgroundSync(): void {
    syncEngine.stopBackgroundSync();
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
  }

  /**
   * Obtient le statut de synchronisation
   * @deprecated Utilisez syncEngine.getSyncStatus() à la place
   */
  getSyncStatus() {
    return syncEngine.getSyncStatus();
  }

  /**
   * Vérifie si une synchronisation est en cours
   */
  isSynchronizing(): boolean {
    return this.isSyncing || syncEngine.getSyncStatus().isSyncing;
  }
}

/**
 * @deprecated Utilisez syncEngine depuis '@/services/offline' à la place
 */
export const syncManager = new SyncManager();