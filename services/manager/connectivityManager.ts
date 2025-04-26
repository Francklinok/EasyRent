
// src/services/connectivityManager.ts
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { syncManager } from './syncManager';

export class ConnectivityManager {
  private unsubscribe: NetInfoSubscription | null = null;
  private isOnline: boolean = false;
  private lastOnlineCheck: number = 0;
  private syncInProgress: boolean = false;

  initialize(): void {
    this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
    
    // Vérifier immédiatement l'état de la connexion
    NetInfo.fetch().then(state => {
      this.isOnline = state.isConnected && state.isInternetReachable === true;
      this.lastOnlineCheck = Date.now();
    });
  }

  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private handleConnectivityChange = async (state: NetInfoState): Promise<void> => {
    const previousOnlineStatus = this.isOnline;
    this.isOnline = state.isConnected && state.isInternetReachable === true;
    this.lastOnlineCheck = Date.now();

    // Si la connexion vient d'être restaurée
    if (!previousOnlineStatus && this.isOnline) {
      await this.triggerSync();
    }
  };

  async triggerSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    try {
      this.syncInProgress = true;
      await syncManager.synchronize();
    } catch (error) {
      console.error('Sync error:', error);
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
}

export const connectivityManager = new ConnectivityManager();
