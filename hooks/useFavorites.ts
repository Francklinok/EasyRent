import { useState, useEffect, useCallback } from 'react';
import {
  favoritesService,
  FavoriteProperty,
  FavoriteStats,
  FavoriteFilters,
  PriceAlert
} from '@/services/api/favoritesService';

interface UseFavoritesResult {
  favorites: FavoriteProperty[];
  stats: FavoriteStats | null;
  loading: boolean;
  error: string | null;
  addToFavorites: (propertyId: string, notes?: string, tags?: string[]) => Promise<boolean>;
  removeFromFavorites: (propertyId: string) => Promise<boolean>;
  updateNotes: (propertyId: string, notes: string) => Promise<boolean>;
  updateTags: (propertyId: string, tags: string[]) => Promise<boolean>;
  updateNotificationSettings: (propertyId: string, notifications: FavoriteProperty['notifications']) => Promise<boolean>;
  trackView: (propertyId: string) => Promise<boolean>;
  bulkRemove: (propertyIds: string[]) => Promise<{ success: boolean; removedCount: number; failedIds: string[]; }>;
  exportFavorites: (format: 'json' | 'csv' | 'pdf') => Promise<{ downloadUrl: string; filename: string; expiresAt: string; }>;
  shareList: (recipientEmail: string, message?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  applyFilters: (filters: FavoriteFilters) => void;
  clearFilters: () => void;
  currentFilters: FavoriteFilters | null;
}

export function useFavorites(userId: string, initialFilters?: FavoriteFilters): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [stats, setStats] = useState<FavoriteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FavoriteFilters | null>(initialFilters || null);

  const loadFavorites = useCallback(async (filters?: FavoriteFilters) => {
    try {
      setLoading(true);
      setError(null);

      const [favoritesData, statsData] = await Promise.all([
        favoritesService.getFavorites(userId, filters),
        favoritesService.getFavoriteStats(userId)
      ]);

      setFavorites(favoritesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToFavorites = useCallback(async (
    propertyId: string,
    notes?: string,
    tags?: string[]
  ): Promise<boolean> => {
    try {
      setError(null);
      const newFavorite = await favoritesService.addToFavorites(userId, propertyId, notes, tags);
      setFavorites(prev => [newFavorite, ...prev]);

      // Update stats
      const updatedStats = await favoritesService.getFavoriteStats(userId);
      setStats(updatedStats);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to favorites');
      return false;
    }
  }, [userId]);

  const removeFromFavorites = useCallback(async (propertyId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await favoritesService.removeFromFavorites(userId, propertyId);

      if (success) {
        setFavorites(prev => prev.filter(fav => fav.propertyId !== propertyId));

        // Update stats
        const updatedStats = await favoritesService.getFavoriteStats(userId);
        setStats(updatedStats);
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from favorites');
      return false;
    }
  }, [userId]);

  const updateNotes = useCallback(async (propertyId: string, notes: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await favoritesService.updateFavoriteNotes(userId, propertyId, notes);

      if (success) {
        setFavorites(prev => prev.map(fav =>
          fav.propertyId === propertyId ? { ...fav, notes } : fav
        ));
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes');
      return false;
    }
  }, [userId]);

  const updateTags = useCallback(async (propertyId: string, tags: string[]): Promise<boolean> => {
    try {
      setError(null);
      const success = await favoritesService.updateFavoriteTags(userId, propertyId, tags);

      if (success) {
        setFavorites(prev => prev.map(fav =>
          fav.propertyId === propertyId ? { ...fav, tags } : fav
        ));
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tags');
      return false;
    }
  }, [userId]);

  const updateNotificationSettings = useCallback(async (
    propertyId: string,
    notifications: FavoriteProperty['notifications']
  ): Promise<boolean> => {
    try {
      setError(null);
      const success = await favoritesService.updateNotificationSettings(userId, propertyId, notifications);

      if (success) {
        setFavorites(prev => prev.map(fav =>
          fav.propertyId === propertyId ? { ...fav, notifications } : fav
        ));
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification settings');
      return false;
    }
  }, [userId]);

  const trackView = useCallback(async (propertyId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await favoritesService.trackPropertyView(userId, propertyId);

      if (success) {
        setFavorites(prev => prev.map(fav =>
          fav.propertyId === propertyId
            ? { ...fav, viewCount: fav.viewCount + 1, lastViewed: new Date().toISOString() }
            : fav
        ));
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track view');
      return false;
    }
  }, [userId]);

  const bulkRemove = useCallback(async (propertyIds: string[]) => {
    try {
      setError(null);
      const result = await favoritesService.bulkRemoveFavorites(userId, propertyIds);

      if (result.success) {
        setFavorites(prev => prev.filter(fav => !propertyIds.includes(fav.propertyId)));

        // Update stats
        const updatedStats = await favoritesService.getFavoriteStats(userId);
        setStats(updatedStats);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk remove favorites');
      throw err;
    }
  }, [userId]);

  const exportFavorites = useCallback(async (format: 'json' | 'csv' | 'pdf') => {
    try {
      setError(null);
      return await favoritesService.exportFavorites(userId, format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export favorites');
      throw err;
    }
  }, [userId]);

  const shareList = useCallback(async (recipientEmail: string, message?: string): Promise<boolean> => {
    try {
      setError(null);
      return await favoritesService.shareFavoritesList(userId, recipientEmail, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share favorites list');
      return false;
    }
  }, [userId]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadFavorites(currentFilters || undefined);
  }, [loadFavorites, currentFilters]);

  const applyFilters = useCallback((filters: FavoriteFilters) => {
    setCurrentFilters(filters);
    loadFavorites(filters);
  }, [loadFavorites]);

  const clearFilters = useCallback(() => {
    setCurrentFilters(null);
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    if (userId) {
      loadFavorites(currentFilters || undefined);
    }
  }, [userId, loadFavorites, currentFilters]);

  return {
    favorites,
    stats,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    updateNotes,
    updateTags,
    updateNotificationSettings,
    trackView,
    bulkRemove,
    exportFavorites,
    shareList,
    refresh,
    applyFilters,
    clearFilters,
    currentFilters
  };
}

interface UsePriceAlertsResult {
  alerts: PriceAlert[];
  loading: boolean;
  error: string | null;
  createAlert: (propertyId: string, type: 'decrease' | 'increase' | 'any', threshold: number, percentage?: number) => Promise<boolean>;
  toggleAlert: (alertId: string, isActive: boolean) => Promise<boolean>;
  deleteAlert: (alertId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function usePriceAlerts(userId: string): UsePriceAlertsResult {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoritesService.getPriceAlerts(userId);
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createAlert = useCallback(async (
    propertyId: string,
    type: 'decrease' | 'increase' | 'any',
    threshold: number,
    percentage?: number
  ): Promise<boolean> => {
    try {
      setError(null);
      const newAlert = await favoritesService.createPriceAlert(userId, propertyId, type, threshold, percentage);
      setAlerts(prev => [newAlert, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create price alert');
      return false;
    }
  }, [userId]);

  const toggleAlert = useCallback(async (alertId: string, isActive: boolean): Promise<boolean> => {
    try {
      setError(null);
      const success = await favoritesService.togglePriceAlert(userId, alertId, isActive);

      if (success) {
        setAlerts(prev => prev.map(alert =>
          alert.id === alertId ? { ...alert, isActive } : alert
        ));
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle price alert');
      return false;
    }
  }, [userId]);

  const deleteAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await favoritesService.deletePriceAlert(userId, alertId);

      if (success) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete price alert');
      return false;
    }
  }, [userId]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (userId) {
      loadAlerts();
    }
  }, [userId, loadAlerts]);

  return {
    alerts,
    loading,
    error,
    createAlert,
    toggleAlert,
    deleteAlert,
    refresh
  };
}

interface UseSimilarPropertiesResult {
  similarProperties: any[];
  loading: boolean;
  error: string | null;
  loadSimilar: (propertyId: string, limit?: number) => Promise<void>;
}

export function useSimilarProperties(userId: string): UseSimilarPropertiesResult {
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSimilar = useCallback(async (propertyId: string, limit: number = 5) => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoritesService.getSimilarProperties(userId, propertyId, limit);
      setSimilarProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load similar properties');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    similarProperties,
    loading,
    error,
    loadSimilar
  };
}