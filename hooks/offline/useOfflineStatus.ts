/**
 * useOfflineStatus - Hook pour le statut de connectivité
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface OfflineStatus {
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
}

export function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    isConnected: true,
    connectionType: null,
    isInternetReachable: null,
  });

  useEffect(() => {
    // Récupérer l'état initial
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isOnline: state.isConnected ?? false,
        isConnected: state.isConnected ?? false,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // S'abonner aux changements
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isOnline: state.isConnected ?? false,
        isConnected: state.isConnected ?? false,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => unsubscribe();
  }, []);

  return status;
}

export default useOfflineStatus;
