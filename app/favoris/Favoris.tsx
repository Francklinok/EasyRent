import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { router } from 'expo-router';
import { useFavorites, usePriceAlerts } from '@/hooks/useFavorites';
import { useFavorites as useFavoritesContext } from '@/components/contexts/favorites/FavoritesContext';
import { favoritesService, FavoriteService } from '@/services/api/favoritesService';
import { cacheService, CACHE_KEYS } from '@/services/cache/cacheService';
import { useLanguage } from '@/components/contexts/language';

type TabType = 'property' | 'services';

const FavorisScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('property');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [favoriteServices, setFavoriteServices] = useState<FavoriteService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const servicesLoadedRef = useRef(false);
  const { removeFromFavorites: removeFromContext } = useFavoritesContext();

  const {
    favorites,
    stats,
    loading,
    removeFromFavorites,
    bulkRemove,
    refresh
  } = useFavorites(user?.id || '');

  const {
    alerts,
    createAlert,
    toggleAlert
  } = usePriceAlerts(user?.id || '');

  const loadFavoriteServices = useCallback(async () => {
    try {
      if (!servicesLoadedRef.current) {
        setServicesLoading(true);
      }
      const services = await favoritesService.getFavoriteServicesEnriched();
      setFavoriteServices(services);
      servicesLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading favorite services:', error);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // Load cached services instantly, then refresh from network
  useEffect(() => {
    const loadData = async () => {
      const cached = await cacheService.get<FavoriteService[]>(CACHE_KEYS.FAVORITES_SERVICES);
      if (cached && cached.length > 0) {
        setFavoriteServices(cached);
        servicesLoadedRef.current = true;
      }
      loadFavoriteServices();
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadFavoriteServices()]);
    setRefreshing(false);
  };

  // Build combined data list based on active tab
  const combinedData: any[] = activeTab === 'services'
    ? favoriteServices.map(s => ({ ...s, _itemType: 'service' }))
    : favorites.map(f => ({ ...f, _itemType: 'property' }));

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    Alert.alert(
      t('favoritesScreen.deleteFavorites'),
      t('favoritesScreen.deleteFavoritesMsg', { count: selectedItems.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await bulkRemove(selectedItems);
            if (result.success) {
              selectedItems.forEach(id => removeFromContext(id));
              setSelectedItems([]);
              setIsSelectionMode(false);
            }
          }
        }
      ]
    );
  };

  const handleRemoveService = async (serviceId: string) => {
    Alert.alert(
      t('favoritesScreen.removeFromFavorites'),
      t('favoritesScreen.removeServiceMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('favoritesScreen.remove'),
          style: 'destructive',
          onPress: async () => {
            const success = await favoritesService.removeServiceFromFavorites(serviceId);
            if (success) {
              setFavoriteServices(prev => prev.filter(s => s.serviceId !== serviceId));
              removeFromContext(serviceId);
            }
          }
        }
      ]
    );
  };

  // ─── Tab bar ──────────────────────────────────────────────────────────────

  const tabs = [
    {
      id: 'property' as TabType,
      label: t('favoritesScreen.all'),
      icon: 'home-heart' as const,
      count: favorites.length,
    },
    {
      id: 'services' as TabType,
      label: t('favoritesScreen.services'),
      icon: 'wrench-outline' as const,
      count: favoriteServices.length,
    },
  ];

  const renderTabs = () => (
    <ThemedView style={{
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      backgroundColor: 'transparent',
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
              gap: 6,
              marginBottom: -1,
              backgroundColor: activeTab ===tab.id? theme.surfaceVariant: 'transparent',
              borderRadius:10
            }}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={17}
              color={isActive ? theme.text : theme.text + '60'}
            />
            <ThemedText style={{
              fontSize: 13,
              fontWeight: isActive ? '700' : '500',
              color: isActive ? theme.text : theme.text + '70',
            }}>
              {tab.label}
            </ThemedText>
            {/* Count badge */}
            {tab.count > 0 && (
              <View style={{
                backgroundColor: isActive ? theme.primary + '18' : theme.surfaceVariant,
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 10,
                minWidth: 22,
                alignItems: 'center',
              }}>
                <ThemedText style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: isActive ? theme.text : theme.text + '60',
                }}>
                  {tab.count}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );

  // ─── Property card ────────────────────────────────────────────────────────

  const renderFavoriteItem = ({ item }: { item: any }) => {
    if (item._itemType === 'service') {
      return renderServiceCard(item);
    }
    return renderPropertyCard(item);
  };

  const renderPropertyCard = (item: any) => {
    const property = item.property;
    const imageUrl =
      property?.images?.[0]?.url ||
      property?.images?.[0] ||
      'https://via.placeholder.com/400x220';
    const isSelected = selectedItems.includes(item.propertyId);
    const hasAlert = alerts.some(a => a.propertyId === item.propertyId);
    const alertActive = alerts.some(a => a.propertyId === item.propertyId && a.isActive);
    const price = property?.ownerCriteria?.monthlyRent;
    const currency = property?.ownerCriteria?.currency || 'XOF';

    return (
      <ThemedView style={{ marginHorizontal: 16, marginBottom: 14 }}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {
            if (isSelectionMode) {
              toggleSelection(item.propertyId);
            } else {
              router.push({ pathname: '/property/[id]', params: { id: item.propertyId } } as any);
            }
          }}
          onLongPress={() => {
            if (!isSelectionMode) {
              setIsSelectionMode(true);
              toggleSelection(item.propertyId);
            }
          }}
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? theme.primary : theme.outline,
            backgroundColor: theme.surface,
          }}
        >
          {/* ── Hero image ── */}
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: 140 }}
              resizeMode="cover"
            />

            {/* Gradient overlay at the bottom of image */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.45)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
              }}
            />

            {/* Price tag — bottom-left of image */}
            {price != null && (
              <ThemedView style={{
                position: 'absolute',
                bottom: 10,
                left: 12,
                backgroundColor: theme.surfaceVariant,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
                <ThemedText type = "body" style={{
                  color: theme.text,
                  fontWeight: '700',
                  letterSpacing: 0.2,
                }}>
                  {price.toLocaleString()} {currency}
                </ThemedText>
              </ThemedView>
            )}

            {/* Selection circle */}
            {isSelectionMode && (
              <ThemedView style={{
                position: 'absolute',
                top: 10,
                left: 10,
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: isSelected ? theme.primary : 'rgba(255,255,255,0.88)',
                borderWidth: isSelected ? 0 : 2,
                borderColor: theme.outline,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isSelected && <MaterialCommunityIcons name="check" size={15} color="white" />}
              </ThemedView>
            )}

            {/* Heart icon — top-right */}
            <View style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: 20,
              padding: 6,
            }}>
              <MaterialCommunityIcons name="heart" size={18} color="#FF4D6D" />
            </View>
          </View>

          {/* ── Card body ── */}
          <ThemedView style={{ padding: 10, }}>
            <ThemedView style = {{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
             
              }}>
            {/* Title + address */}
            <ThemedText type = "normal" intensity = "strong"numberOfLines={1} style={{ marginBottom: 2 }}>
              {property?.title || 'Property'}
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8, backgroundColor: 'transparent' }}>
              <MaterialCommunityIcons name="map-marker-outline" size={12} color={theme.text } />
              <ThemedText type ="caption" numberOfLines={1} style={{ color: theme.text}}>
                {property?.address || t('favoritesScreen.addressUnavailable')}
              </ThemedText>
            </ThemedView>

            </ThemedView>
           

            {/* Specs + actions */}
            <ThemedView style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 8,
              borderTopWidth: 1,
              borderColor: theme.outline + '18',
              backgroundColor: 'transparent',
            }}>

              <ThemedView style={{ flexDirection: 'row', gap: 12, backgroundColor: 'transparent' }}>
                {property?.generalHInfo?.surface && (
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' }}>
                    <MaterialCommunityIcons name="ruler-square-compass" size={12} color={theme.text + '90'} />
                    <ThemedText style={{ fontSize: 11, color: theme.text + '90' }}>
                      {property.generalHInfo.surface}m²
                    </ThemedText>
                  </ThemedView>
                )}
                {property?.generalHInfo?.bedrooms && (
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' }}>
                    <MaterialCommunityIcons name="bed-outline" size={12} color={theme.text + '90'} />
                    <ThemedText style={{ fontSize: 11, color: theme.text + '90' }}>
                      {property.generalHInfo.bedrooms}bd
                    </ThemedText>
                  </ThemedView>
                )}
                {property?.generalHInfo?.bathrooms && (
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' }}>
                    <MaterialCommunityIcons name="shower" size={12} color={theme.text + '90'} />
                    <ThemedText style={{ fontSize: 11, color: theme.text + '90' }}>
                      {property.generalHInfo.bathrooms}ba
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              {/* Action icons */}
              <ThemedView style={{ flexDirection: 'row', gap: 6, backgroundColor: 'transparent' }}>
                {/* Price alert toggle */}
                <TouchableOpacity
                  onPress={async () => {
                    if (hasAlert) {
                      const al = alerts.find(a => a.propertyId === item.propertyId);
                      if (al) await toggleAlert(al.id, !al.isActive);
                    } else {
                      await createAlert(item.propertyId, 'decrease', property?.ownerCriteria?.monthlyRent || 0);
                    }
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: alertActive ? theme.warning + '80' : theme.outline + '80',
                    backgroundColor: alertActive ? theme.warning + '20' : 'transparent',
                    padding: 5,
                    borderRadius: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name={alertActive ? 'bell-ring' : 'bell-outline'}
                    size={14}
                    color={alertActive ? theme.warning : theme.text + '60'}
                  />
                </TouchableOpacity>

                {/* Remove from favorites */}
                <TouchableOpacity
                  onPress={async () => {
                    Alert.alert(
                      t('favoritesScreen.removeFromFavorites'),
                      t('favoritesScreen.removePropertyMsg'),
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        {
                          text: t('favoritesScreen.remove'),
                          style: 'destructive',
                          onPress: async () => {
                            await removeFromFavorites(item.propertyId);
                            removeFromContext(item.propertyId);
                          }
                        }
                      ]
                    );
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.error + '40',
                    backgroundColor: theme.error + '08',
                    padding: 5,
                    borderRadius: 8,
                  }}
                >
                  <MaterialCommunityIcons name="heart-remove-outline" size={14} color={theme.error} />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            {/* Tags row */}
            {item.tags && item.tags.length > 0 && (
              <ThemedView style={{ flexDirection: 'row', gap: 5, marginTop: 7, backgroundColor: 'transparent' }}>
                {item.tags.slice(0, 3).map((tag: string, i: number) => (
                  <View key={i} style={{
                    borderWidth: 1,
                    borderColor: theme.primary + '40',
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 5,
                  }}>
                    <ThemedText style={{ fontSize: 10, color: theme.primary }}>
                      {tag}
                    </ThemedText>
                  </View>
                ))}
              </ThemedView>
            )}
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  // ─── Service card ─────────────────────────────────────────────────────────

  const renderServiceCard = (item: any) => {
    const service = item.service;
    const imageUrl = service?.media?.photos?.[0] || 'https://via.placeholder.com/400x180';

    return (
      <ThemedView style={{ marginHorizontal: 16, marginBottom: 14 }}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {
            router.push({ pathname: '/service/[id]', params: { id: item.serviceId } } as any);
          }}
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.outline + '25',
            backgroundColor: theme.surface,
          }}
        >
          {/* ── Hero image ── */}
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: 130 }}
              resizeMode="cover"
            />

            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.40)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 70,
              }}
            />

            {/* Service type badge — top-left */}
            <View style={{
              position: 'absolute',
              top: 10,
              left: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(0,0,0,0.50)',
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <MaterialCommunityIcons name="wrench" size={11} color="white" />
              <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
                Service
              </ThemedText>
            </View>

            {/* Heart icon — top-right */}
            <View style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: 20,
              padding: 6,
            }}>
              <MaterialCommunityIcons name="heart" size={18} color="#FF4D6D" />
            </View>

            {/* Price — bottom-left */}
            {service?.pricing?.basePrice != null && (
              <View style={{
                position: 'absolute',
                bottom: 10,
                left: 12,
                backgroundColor: 'rgba(0,0,0,0.50)',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
                <ThemedText style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>
                  {service.pricing.basePrice.toLocaleString()} {service.pricing.currency}
                </ThemedText>
              </View>
            )}
          </View>

          {/* ── Card body ── */}
          <ThemedView style={{ padding: 10, backgroundColor: theme.surface }}>
            {/* Title + category */}
            <ThemedText numberOfLines={1} style={{ fontSize: 14, fontWeight: '700', marginBottom: 2 }}>
              {service?.title || 'Service'}
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8, backgroundColor: 'transparent' }}>
              <MaterialCommunityIcons name="tag-outline" size={12} color={theme.text + '70'} />
              <ThemedText numberOfLines={1} style={{ fontSize: 11, color: theme.text + '70' }}>
                {service?.category || t('favoritesScreen.categoryUnavailable')}
              </ThemedText>
            </ThemedView>

            {/* Rating + remove in one row */}
            <ThemedView style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 8,
              borderTopWidth: 1,
              borderColor: theme.outline + '18',
              backgroundColor: 'transparent',
            }}>
              <ThemedView style={{ flexDirection: 'row', gap: 12, backgroundColor: 'transparent' }}>
                {service?.rating != null && (
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' }}>
                    <MaterialCommunityIcons name="star" size={12} color={theme.warning} />
                    <ThemedText style={{ fontSize: 11, fontWeight: '600' }}>
                      {service.rating.toFixed(1)}
                    </ThemedText>
                  </ThemedView>
                )}
                {service?.totalReviews != null && (
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' }}>
                    <MaterialCommunityIcons name="comment-outline" size={12} color={theme.text + '70'} />
                    <ThemedText style={{ fontSize: 11, color: theme.text + '70' }}>
                      {service.totalReviews} {t('favoritesScreen.reviews')}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              <TouchableOpacity
                onPress={() => handleRemoveService(item.serviceId)}
                style={{
                  borderWidth: 1,
                  borderColor: theme.error + '40',
                  backgroundColor: theme.error + '08',
                  padding: 5,
                  borderRadius: 8,
                }}
              >
                <MaterialCommunityIcons name="heart-remove-outline" size={14} color={theme.error} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  // ─── Empty state ──────────────────────────────────────────────────────────

  const renderEmptyState = () => (
    <ThemedView style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      marginTop: 60,
    }}>
      {/* Soft gradient circle */}
      <LinearGradient
        colors={[theme.error + '18', theme.primary + '14']}
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <MaterialCommunityIcons name="heart-outline" size={44} color={theme.primary} />
      </LinearGradient>

      <ThemedText style={{ fontSize: 19, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
        {t('favoritesScreen.noFavorites')}
      </ThemedText>

      <ThemedText intensity="light" style={{
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 22,
        maxWidth: 270,
        fontSize: 13,
      }}>
        {t('favoritesScreen.noFavoritesMsg')}
      </ThemedText>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)' as any)}
        style={{
          backgroundColor: theme.primary,
          paddingVertical: 13,
          paddingHorizontal: 28,
          borderRadius: 26,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <MaterialCommunityIcons name="magnify" size={18} color="white" />
        <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
          {t('favoritesScreen.explore')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  // ─── Bulk selection bar ───────────────────────────────────────────────────

  const renderSelectionBar = () => {
    if (!isSelectionMode || selectedItems.length === 0) return null;

    return (
      <ThemedView style={{
        position: 'absolute',
        bottom: 28,
        left: 16,
        right: 16,
        backgroundColor: theme.surface,
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.outline + '25',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'transparent' }}>
          <View style={{
            backgroundColor: theme.primary + '18',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
          }}>
            <ThemedText style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>
              {selectedItems.length} selected
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={{ flexDirection: 'row', gap: 10, backgroundColor: 'transparent' }}>
          {/* Select all */}
          <TouchableOpacity
            onPress={() => setSelectedItems(favorites.map(f => f.propertyId))}
            style={{
              borderWidth: 1,
              borderColor: theme.primary + '50',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <ThemedText style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>
              {t('favoritesScreen.selectAll')}
            </ThemedText>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            onPress={handleBulkDelete}
            style={{
              backgroundColor: theme.error,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MaterialCommunityIcons name="delete-outline" size={16} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>
              {t('common.delete')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  };

  // ─── Root render ──────────────────────────────────────────────────────────

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <FlatList
          data={combinedData}
          keyExtractor={(item) =>
            item._itemType === 'service'
              ? `svc-${item.serviceId}`
              : `prop-${item.propertyId}`
          }
          ListHeaderComponent={
            <>
              {renderTabs()}
              <ThemedView style={{ height: 10 }} />
            </>
          }
          renderItem={renderFavoriteItem}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: isSelectionMode ? 120 : 100,
            flexGrow: combinedData.length === 0 ? 1 : undefined,
          }}
        />

        {renderSelectionBar()}
      </ThemedView>
    </ThemedView>
  );
};

export default FavorisScreen;
