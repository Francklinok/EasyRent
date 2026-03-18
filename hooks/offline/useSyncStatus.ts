/**
 * useSyncStatus - Hook pour le statut de synchronisation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSyncEngine } from '../../services/offline/core/SyncEngine';
import { getOfflineQueueService } from '../../services/offline/core/OfflineQueueService';
import { getReactiveDataLayer } from '../../services/offline/core/ReactiveDataLayer';
import { SyncStatus, SyncState } from '../../services/offline/core/types';

interface UseSyncStatusResult extends SyncStatus {
  sync: () => Promise<void>;
  isSyncing: boolean;
}

export function useSyncStatus(): UseSyncStatusResult {
  const syncEngine = useMemo(() => getSyncEngine(), []);
  const queue = useMemo(() => getOfflineQueueService(), []);
  const reactive = useMemo(() => getReactiveDataLayer(), []);

  const [status, setStatus] = useState<SyncStatus>({
    state: 'idle',
    lastSyncTime: null,
    pendingCount: 0,
    failedCount: 0,
  });

  // Charger le statut initial
  useEffect(() => {
    const loadStatus = async () => {
      const engineStatus = syncEngine.getSyncStatus();
      const queueStats = await queue.getStats();

      setStatus({
        ...engineStatus,
        pendingCount: queueStats.total,
        failedCount: queueStats.total - queueStats.readyToProcess,
      });
    };

    loadStatus();
  }, [syncEngine, queue]);

  // S'abonner aux changements de statut
  useEffect(() => {
    const unsubscribe = reactive.subscribe('metadata', (event) => {
      if (event.entityId === 'syncStatus') {
        setStatus(event.data as SyncStatus);
      }
    });

    return () => unsubscribe();
  }, [reactive]);

  // Fonction de sync manuelle
  const sync = useCallback(async () => {
    await syncEngine.synchronize();
  }, [syncEngine]);

  return {
    ...status,
    sync,
    isSyncing: status.state === 'syncing',
  };
}

export default useSyncStatus;
