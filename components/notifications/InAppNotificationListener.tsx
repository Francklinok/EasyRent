import React, { useEffect } from 'react';
import { useInAppNotifications } from '../../hooks/useInAppNotifications';

/**
 * Composant invisible qui écoute les notifications in-app
 * À placer dans _layout.tsx pour écouter les notifications globalement
 */
export function InAppNotificationListener() {
  const { notifications, unreadCount, isConnected } = useInAppNotifications();

  useEffect(() => {
    console.log('📱 InAppNotificationListener actif');
    console.log('   - Socket connecté:', isConnected);
    console.log('   - Notifications non lues:', unreadCount);
  }, [isConnected, unreadCount]);

  // Composant invisible - ne rend rien
  return null;
}
