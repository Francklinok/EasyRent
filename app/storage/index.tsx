import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, ScrollView, ActivityIndicator, Alert, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import {
  unifiedCacheService,
  unifiedDatabase,
  offlineQueueService,
} from '@/services/offline';

interface StorageCategory {
  label: string;
  size: number;
  icon: string;
  color: string;
  directory?: string;
  type?: 'files' | 'cache' | 'database' | 'queue';
}

interface StorageInfo {
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  categories: StorageCategory[];
}

interface OfflineStats {
  cacheEntries: number;
  cacheSize: number;
  dbEntities: number;
  queuePending: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const StorageSettings = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const getDirectorySize = async (directory: string): Promise<number> => {
    try {
      const info = await FileSystem.getInfoAsync(directory);
      if (!info.exists) return 0;

      if (!info.isDirectory) {
        return info.size || 0;
      }

      const files = await FileSystem.readDirectoryAsync(directory);
      let totalSize = 0;

      for (const file of files) {
        const filePath = `${directory}/${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (fileInfo.exists) {
          if (fileInfo.isDirectory) {
            totalSize += await getDirectorySize(filePath);
          } else {
            totalSize += fileInfo.size || 0;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error getting directory size:', error);
      return 0;
    }
  };

  // Load offline services statistics
  const loadOfflineStats = useCallback(async (): Promise<OfflineStats> => {
    try {
      const [cacheStats, queueItems] = await Promise.all([
        unifiedCacheService.getStats(),
        offlineQueueService.getQueueItems(),
      ]);

      // Use memoryEntries from CacheStats and estimated memory bytes
      const cacheEntries = cacheStats.memoryEntries;
      const estimatedCacheSize = cacheStats.estimatedMemoryBytes || (cacheEntries * 5 * 1024);

      return {
        cacheEntries,
        cacheSize: estimatedCacheSize,
        dbEntities: 0,
        queuePending: queueItems.length,
      };
    } catch (error) {
      console.error('Error loading offline stats:', error);
      return { cacheEntries: 0, cacheSize: 0, dbEntities: 0, queuePending: 0 };
    }
  }, []);

  const loadStorageInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const cacheDir = FileSystem.cacheDirectory || '';
      const documentDir = FileSystem.documentDirectory || '';

      // Get sizes for different categories and offline stats in parallel
      const [cacheSize, documentsSize, offStats] = await Promise.all([
        getDirectorySize(cacheDir),
        getDirectorySize(documentDir),
        loadOfflineStats(),
      ]);

      setOfflineStats(offStats);

      // Try to get image cache size
      let imagesSize = 0;
      const ultraImagesDir = `${cacheDir}ultra-images/`;
      const ultraImagesInfo = await FileSystem.getInfoAsync(ultraImagesDir);
      if (ultraImagesInfo.exists) {
        imagesSize = await getDirectorySize(ultraImagesDir);
      }

      // Calculate total used space including offline data
      const totalUsed = cacheSize + documentsSize + offStats.cacheSize;

      // Estimate total available space (this is an approximation since
      // expo-file-system doesn't provide total device storage)
      const estimatedTotal = 5 * 1024 * 1024 * 1024; // 5 GB estimation for app storage quota

      const categories: StorageCategory[] = [
        {
          label: 'Images',
          size: imagesSize,
          icon: 'image',
          color: theme.primary,
          directory: ultraImagesDir,
          type: 'files',
        },
        {
          label: 'Documents',
          size: documentsSize - imagesSize,
          icon: 'file-document',
          color: theme.success,
          directory: documentDir,
          type: 'files',
        },
        {
          label: 'Cache App',
          size: offStats.cacheSize,
          icon: 'memory',
          color: '#9b59b6',
          type: 'cache',
        },
        {
          label: 'Base locale',
          size: 0, // SQLite size estimation would require file access
          icon: 'database',
          color: '#3498db',
          type: 'database',
        },
        {
          label: 'Cache Fichiers',
          size: cacheSize - imagesSize,
          icon: 'cached',
          color: theme.warning,
          directory: cacheDir,
          type: 'files',
        },
      ];

      setStorageInfo({
        totalSpace: estimatedTotal,
        freeSpace: estimatedTotal - totalUsed,
        usedSpace: totalUsed,
        categories: categories.filter(cat => cat.size >= 0),
      });
    } catch (error) {
      console.error('Error loading storage info:', error);
      Alert.alert(t('common.error'), t('storage.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    loadStorageInfo();
  }, [loadStorageInfo]);

  const handleClearAppCache = async () => {
    const cacheEntries = offlineStats?.cacheEntries || 0;

    Alert.alert(
      'Vider le cache application',
      `Cette action va supprimer ${cacheEntries} entrées du cache mémoire et AsyncStorage.\n\nLes données seront rechargées depuis le serveur.`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await unifiedCacheService.clearAll();
              Alert.alert(t('common.success'), 'Cache application vidé avec succès');
              setRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Error clearing app cache:', error);
              Alert.alert(t('common.error'), 'Impossible de vider le cache application');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  // Clear local database (SQLite)
  const handleClearDatabase = async () => {
    Alert.alert(
      'Vider la base locale',
      'Cette action va supprimer toutes les données stockées localement (propriétés, activités, favoris, etc.).\n\n⚠️ Les données non synchronisées seront perdues.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await unifiedDatabase.clearAll();
              Alert.alert(t('common.success'), 'Base de données locale vidée');
              setRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Error clearing database:', error);
              Alert.alert(t('common.error'), 'Impossible de vider la base de données');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  // Clear offline queue
  const handleClearQueue = async () => {
    const queueCount = offlineStats?.queuePending || 0;

    if (queueCount === 0) {
      Alert.alert('Info', 'Aucune action en attente dans la file');
      return;
    }

    Alert.alert(
      'Vider la file d\'attente',
      `${queueCount} action(s) en attente de synchronisation.\n\n⚠️ Ces actions ne seront pas envoyées au serveur.`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await offlineQueueService.clearQueue();
              Alert.alert(t('common.success'), 'File d\'attente vidée');
              setRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Error clearing queue:', error);
              Alert.alert(t('common.error'), 'Impossible de vider la file d\'attente');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleClearCache = async () => {
    const cacheSize = storageInfo?.categories.find(c => c.label === 'Cache Fichiers')?.size || 0;

    Alert.alert(
      t('storage.clearCache'),
      t('storage.clearCacheMsg', { size: formatBytes(cacheSize) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('storage.clear'),
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              const cacheDir = FileSystem.cacheDirectory || '';

              // List all items in cache
              const cacheContents = await FileSystem.readDirectoryAsync(cacheDir);

              // Delete each item
              for (const item of cacheContents) {
                const itemPath = `${cacheDir}${item}`;
                await FileSystem.deleteAsync(itemPath, { idempotent: true });
              }

              Alert.alert(t('common.success'), t('storage.cacheCleared'));
              setRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert(t('common.error'), t('storage.clearCacheError'));
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleClearImages = async () => {
    const imagesSize = storageInfo?.categories.find(c => c.label === 'Images')?.size || 0;

    if (imagesSize === 0) {
      Alert.alert('Info', t('storage.noImages'));
      return;
    }

    Alert.alert(
      t('storage.clearImages'),
      t('storage.clearImagesMsg', { size: formatBytes(imagesSize) }),
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              const ultraImagesDir = `${FileSystem.cacheDirectory}ultra-images/`;
              await FileSystem.deleteAsync(ultraImagesDir, { idempotent: true });

              Alert.alert(t('common.success'), t('storage.imagesCleared'));
              setRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Error clearing images:', error);
              Alert.alert(t('common.error'), t('storage.clearImagesError'));
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleClearAll = async () => {
    const totalUsed = storageInfo?.usedSpace || 0;
    const queueCount = offlineStats?.queuePending || 0;

    Alert.alert(
      t('storage.clearAll'),
      `${t('storage.clearAllMsg', { size: formatBytes(totalUsed) })}\n\n⚠️ Cette action inclut:\n• Cache fichiers\n• Cache application\n• Base de données locale\n${queueCount > 0 ? `• ${queueCount} action(s) en attente` : ''}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: t('storage.clearAll'),
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              const cacheDir = FileSystem.cacheDirectory || '';
              const documentDir = FileSystem.documentDirectory || '';

              // Clear all offline services
              await Promise.all([
                unifiedCacheService.clearAll(),
                unifiedDatabase.clearAll(),
                offlineQueueService.clearQueue(),
              ]);

              // Clear file cache
              const cacheContents = await FileSystem.readDirectoryAsync(cacheDir);
              for (const item of cacheContents) {
                await FileSystem.deleteAsync(`${cacheDir}${item}`, { idempotent: true });
              }

              // Clear documents
              const docContents = await FileSystem.readDirectoryAsync(documentDir);
              for (const item of docContents) {
                await FileSystem.deleteAsync(`${documentDir}${item}`, { idempotent: true });
              }

              Alert.alert(t('common.success'), t('storage.allDataCleared'));
              setRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Error clearing all data:', error);
              Alert.alert(t('common.error'), t('storage.clearAllError'));
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const usagePercentage = storageInfo
    ? Math.round((storageInfo.usedSpace / storageInfo.totalSpace) * 100)
    : 0;

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type ="normal" intensity ="light" style={{ marginTop: 12 }}>
          Analyse du stockage...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <ThemedView style={{ padding: 16 }}>
          {/* Storage Overview Card */}
          <ThemedView style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: theme.outline + "50"
          }}>
            <ThemedText type="normal" intensity="light" style={{ marginBottom: 1 }}>
              Espace utilisé
            </ThemedText>
            <ThemedText type="subtitle" intensity="strong" style={{ color: theme.primary, marginBottom: 4 }}>
              {storageInfo ? formatBytes(storageInfo.usedSpace) : '0 B'}
            </ThemedText>
            <ThemedText type="caption" intensity="light">
              sur {storageInfo ? formatBytes(storageInfo.totalSpace) : '0 B'} disponibles
            </ThemedText>

            {/* Progress Bar */}
            <ThemedView style={{
              height: 10,
              backgroundColor: theme.outline + '30',
              borderRadius: 5,
              marginTop: 16,
              overflow: 'hidden'
            }}>
              <ThemedView style={{
                width: `${usagePercentage}%`,
                height: '100%',
                backgroundColor: usagePercentage > 80 ? theme.error : theme.primary,
                borderRadius: 5
              }} />
            </ThemedView>

            <ThemedText style={{ fontSize: 12, color: theme.typography.caption, marginTop: 8, textAlign: 'right' }}>
              {usagePercentage}% utilisé
            </ThemedText>
          </ThemedView>

          {/* Details Section */}
          <ThemedText type="normal" intensity="light" style={{ marginBottom: 12 }}>
            DÉTAILS DU STOCKAGE
          </ThemedText>

          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: theme.outline,
            overflow: 'hidden'
          }}>
            {storageInfo?.categories.map((item, index) => {
              const canClear = item.label !== 'Documents' && (item.size > 0 || item.type === 'cache' || item.type === 'database');
              const getDescription = () => {
                if (item.type === 'cache') return `${offlineStats?.cacheEntries || 0} entrées`;
                if (item.type === 'database') return 'SQLite';
                if (item.size > 0) return 'Appuyez pour libérer';
                return '';
              };

              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => {
                    if (item.label === 'Images') handleClearImages();
                    else if (item.label === 'Cache Fichiers') handleClearCache();
                    else if (item.type === 'cache') handleClearAppCache();
                    else if (item.type === 'database') handleClearDatabase();
                  }}
                  disabled={!canClear}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: index < (storageInfo?.categories.length || 0) - 1 ? 1 : 0,
                    borderBottomColor: theme.outline + '20',
                    opacity: !canClear ? 0.5 : 1
                  }}
                >
                  <ThemedView style={{
                    backgroundColor: item.color + '20',
                    borderRadius: 12,
                    padding: 10,
                    marginRight: 14
                  }}>
                    <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                  </ThemedView>

                  <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                      {item.label}
                    </ThemedText>
                    {getDescription() && (
                      <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                        {getDescription()}
                      </ThemedText>
                    )}
                  </ThemedView>

                  <ThemedText style={{ fontSize: 15, color: theme.typography.caption, fontWeight: '600' }}>
                    {item.type === 'cache' ? `${offlineStats?.cacheEntries || 0}` :
                     item.type === 'database' ? '—' : formatBytes(item.size)}
                  </ThemedText>

                  {canClear && (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={theme.typography.caption}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ThemedView>

          {/* Offline Queue Section */}
          {(offlineStats?.queuePending || 0) > 0 && (
            <>
              <ThemedText type="normal" intensity="light" style={{ marginBottom: 12 }}>
                FILE D'ATTENTE OFFLINE
              </ThemedText>
              <TouchableOpacity
                onPress={handleClearQueue}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: theme.warning + '50',
                }}
              >
                <ThemedView style={{
                  backgroundColor: theme.warning + '20',
                  borderRadius: 12,
                  padding: 10,
                  marginRight: 14
                }}>
                  <MaterialCommunityIcons name="cloud-sync" size={22} color={theme.warning} />
                </ThemedView>
                <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                    Actions en attente
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.typography.caption }}>
                    Seront synchronisées à la reconnexion
                  </ThemedText>
                </ThemedView>
                <ThemedView style={{
                  backgroundColor: theme.warning,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                    {offlineStats?.queuePending}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            </>
          )}

          {/* Actions Section */}
          <ThemedText type="normal" intensity="light" style={{ marginBottom: 12 }}>
            ACTIONS
          </ThemedText>

          <TouchableOpacity
            onPress={handleClearAppCache}
            disabled={isClearing}
            style={{
              backgroundColor: '#9b59b6',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12,
              opacity: isClearing ? 0.7 : 1
            }}
          >
            {isClearing ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', gap: 8 }}>
                <MaterialCommunityIcons name="memory" size={20} color="white" />
                <ThemedText type ="normal" intensity = "strong" style={{ color: 'white'}}>
                  Vider le cache application
                </ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCache}
            disabled={isClearing}
            style={{
              backgroundColor: theme.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12,
              opacity: isClearing ? 0.7 : 1
            }}
          >
            {isClearing ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', gap: 8 }}>
                <MaterialCommunityIcons name="cached" size={20} color="white" />
                <ThemedText type ="normal" intensity = "strong" style={{ color: 'white'}}>
                  Vider le cache fichiers
                </ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearAll}
            disabled={isClearing}
            style={{
              backgroundColor: theme.error + '15',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.error,
              opacity: isClearing ? 0.7 : 1
            }}
          >
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', gap: 8 }}>
              <MaterialCommunityIcons name="delete-sweep" size={20} color={theme.error} />
              <ThemedText  type ="normal" intensity = "strong" style={{ color: theme.error }}>
                Tout effacer
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>

          {/* Refresh Button */}
          <TouchableOpacity
            onPress={() => setRefreshKey(prev => prev + 1)}
            disabled={isLoading || isClearing}
            style={{
              padding: 16,
              alignItems: 'center',
              marginTop: 8
            }}
          >
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', gap: 8 }}>
              <MaterialCommunityIcons name="refresh" size={18} color={theme.primary} />
              <ThemedText type ="normal" style={{ color: theme.primary }}>
                Actualiser
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>

          {/* Info Note */}
          <ThemedView style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: 16,
            borderRadius: 12,
            marginTop: 8,
            gap: 12,
            marginBottom: 30
          }}>
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={theme.primary}
            />
            <ThemedText type="caption" intensity="light" style={{
              flex: 1,
              lineHeight: 20
            }}>
              Le stockage affiché concerne uniquement les données de l'application.
              Vider le cache peut améliorer les performances mais nécessitera de retélécharger certains contenus.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Loading Overlay */}
      {isClearing && (
        <ThemedView style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ThemedView style={{
            backgroundColor: theme.surface,
            padding: 24,
            borderRadius: 16,
            alignItems: 'center',
            gap: 12
          }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText>Nettoyage en cours...</ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
};

export default StorageSettings;
