/**
 * ConnectivityManager - Gestionnaire de connectivité réseau
 *
 * Utilise SyncEngine pour la synchronisation automatique lors de la reconnexion.
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { syncEngine } from '@/services/offline';

export class ConnectivityManager {
  private unsubscribe: NetInfoSubscription | null = null;
  private isOnline: boolean = false;
  private lastOnlineCheck: number = 0;
  private syncInProgress: boolean = false;

  initialize(): void {
    this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);

    // Vérification initiale de la connectivité
    NetInfo.fetch().then((state) => {
      this.isOnline = state.isConnected && state.isInternetReachable === true;
      this.lastOnlineCheck = Date.now();

      // Si connecté au démarrage, démarrer le background sync
      if (this.isOnline) {
        syncEngine.startBackgroundSync();
      }
    });
  }

  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    syncEngine.stopBackgroundSync();
  }

  private handleConnectivityChange = async (state: NetInfoState): Promise<void> => {
    const previousOnlineStatus = this.isOnline;
    this.isOnline = state.isConnected && state.isInternetReachable === true;
    this.lastOnlineCheck = Date.now();

    console.log(
      `[ConnectivityManager] État réseau: ${this.isOnline ? 'en ligne' : 'hors ligne'}`
    );

    // Si la connexion vient d'être restaurée
    if (!previousOnlineStatus && this.isOnline) {
      console.log('[ConnectivityManager] Connexion restaurée - démarrage de la synchronisation');
      await this.triggerSync();
      syncEngine.startBackgroundSync();
    }

    // Si la connexion est perdue
    if (previousOnlineStatus && !this.isOnline) {
      console.log('[ConnectivityManager] Connexion perdue - arrêt du background sync');
      syncEngine.stopBackgroundSync();
    }
  };

  async triggerSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    try {
      this.syncInProgress = true;
      console.log('[ConnectivityManager] Déclenchement de la synchronisation delta...');

      // Utiliser SyncEngine pour la synchronisation
      const result = await syncEngine.synchronize();

      if (result.success) {
        console.log(
          `[ConnectivityManager] Sync terminée: pushed=${result.pushed}, pulled=${result.pulled}`
        );
      } else {
        console.warn('[ConnectivityManager] Sync avec erreurs:', result.errors);
      }
    } catch (error) {
      console.error('[ConnectivityManager] Erreur de synchronisation:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async isConnected(): Promise<boolean> {
    // Si la dernière vérification est récente, utilisez la valeur mise en cache
    if (Date.now() - this.lastOnlineCheck < 30000) {
      return this.isOnline;
    }

    // Sinon, vérifiez à nouveau
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected && state.isInternetReachable === true;
    this.lastOnlineCheck = Date.now();
    return this.isOnline;
  }

  /**
   * Obtient le statut de synchronisation actuel
   */
  getSyncStatus() {
    return syncEngine.getSyncStatus();
  }

  /**
   * Force une synchronisation complète (pas seulement delta)
   */
  async forceFullSync(): Promise<void> {
    if (!this.isOnline) {
      console.warn('[ConnectivityManager] Impossible de sync - hors ligne');
      return;
    }

    try {
      this.syncInProgress = true;
      // Lancer une sync complète
      await syncEngine.synchronize();
    } finally {
      this.syncInProgress = false;
    }
  }
}

export const connectivityManager = new ConnectivityManager();