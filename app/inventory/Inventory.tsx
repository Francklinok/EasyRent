import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TouchableOpacity, FlatList, Image, RefreshControl, Alert, Dimensions, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { router } from 'expo-router';
import { getPropertyService, Property } from '@/services/api/propertyService';
import {
  getServiceMarketplaceService,
  Service,
  ServiceSubscription,
  SubscriptionStatus,
} from '@/services/api/serviceMarketplaceService';
import { cacheService, CACHE_KEYS } from '@/services/cache/cacheService';

const { width } = Dimensions.get('window');

type Tab = 'owner' | 'client' | 'services' | 'subscriptions';
type OwnerFilter = 'all' | 'AVAILABLE' | 'RENTED' | 'SOLD' | 'MAINTENANCE';

const InventoryScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('owner');
  const [ownerProperties, setOwnerProperties] = useState<Property[]>([]);
  const [acquiredProperties, setAcquiredProperties] = useState<Property[]>([]);
  const [ownerServices, setOwnerServices] = useState<Service[]>([]);
  const [clientSubscriptions, setClientSubscriptions] = useState<ServiceSubscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all');
  const [statusMenuVisible, setStatusMenuVisible] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const propertyService = getPropertyService();
  const serviceMarketplaceService = getServiceMarketplaceService();
  const cacheLoaded = useRef(false);
  const networkLoaded = useRef(false);

  // --- Loaders (no useCallback deps that change) ---
  const loadOwnerProperties = useCallback(async () => {
    if (!user?.id) return;
    try {
      const result = await propertyService.getPropertiesByOwner(user.id);
      const props = result?.edges?.map((edge: any) => edge.node) || [];
      setOwnerProperties(props);
      cacheService.set(CACHE_KEYS.INVENTORY_OWNER_PROPERTIES, props);
    } catch (error) {
      console.error('Error loading owner properties:', error);
    }
  }, [user?.id]);

  const loadAcquiredProperties = useCallback(async () => {
    if (!user?.id) return;
    try {
      const result = await propertyService.getPropertiesAcquiredBy(user.id);
      const props = result?.edges?.map((edge: any) => edge.node) || [];
      setAcquiredProperties(props);
      cacheService.set(CACHE_KEYS.INVENTORY_ACQUIRED_PROPERTIES, props);
    } catch (error) {
      console.error('Error loading acquired properties:', error);
    }
  }, [user?.id]);

  const loadOwnerServices = useCallback(async () => {
    if (!user?.id) return;
    try {
      const services = await serviceMarketplaceService.getProviderServices(user.id);
      setOwnerServices(services || []);
      cacheService.set(CACHE_KEYS.INVENTORY_OWNER_SERVICES, services || []);
    } catch (error) {
      console.error('Error loading owner services:', error);
    }
  }, [user?.id]);

  const loadClientSubscriptions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const subs = await serviceMarketplaceService.getUserSubscriptions(user.id);
      setClientSubscriptions(subs || []);
      cacheService.set(CACHE_KEYS.INVENTORY_CLIENT_SUBSCRIPTIONS, subs || []);
    } catch (error) {
      console.error('Error loading client subscriptions:', error);
    }
  }, [user?.id]);

  // Load cache first (instant), then prioritize active tab's network fetch
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      // 1. Load ALL cache instantly (offline-first, non-blocking)
      if (!cacheLoaded.current) {
        cacheLoaded.current = true;
        const [cachedOwner, cachedAcquired, cachedServices, cachedSubs] = await Promise.all([
          cacheService.get<Property[]>(CACHE_KEYS.INVENTORY_OWNER_PROPERTIES),
          cacheService.get<Property[]>(CACHE_KEYS.INVENTORY_ACQUIRED_PROPERTIES),
          cacheService.get<Service[]>(CACHE_KEYS.INVENTORY_OWNER_SERVICES),
          cacheService.get<ServiceSubscription[]>(CACHE_KEYS.INVENTORY_CLIENT_SUBSCRIPTIONS),
        ]);

        if (cachedOwner) setOwnerProperties(cachedOwner);
        if (cachedAcquired) setAcquiredProperties(cachedAcquired);
        if (cachedServices) setOwnerServices(cachedServices);
        if (cachedSubs) setClientSubscriptions(cachedSubs);

        if (cachedOwner || cachedAcquired || cachedServices || cachedSubs) {
          setInitialLoadDone(true);
        }
      }

      // 2. Fetch active tab data first, then rest in background
      if (!networkLoaded.current) {
        networkLoaded.current = true;

        // Load active tab data immediately
        const activeLoader = activeTab === 'owner' ? loadOwnerProperties
          : activeTab === 'client' ? loadAcquiredProperties
          : activeTab === 'services' ? loadOwnerServices
          : loadClientSubscriptions;

        await activeLoader();
        setInitialLoadDone(true);

        // Load remaining tabs in background (non-blocking)
        const remainingLoaders = [
          loadOwnerProperties,
          loadAcquiredProperties,
          loadOwnerServices,
          loadClientSubscriptions,
        ].filter(l => l !== activeLoader);

        Promise.all(remainingLoaders.map(l => l())).catch(() => {});
      }
    };

    loadData();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = async () => {
    setRefreshing(true);
    // On manual refresh, only reload the active tab for speed
    const activeLoader = activeTab === 'owner' ? loadOwnerProperties
      : activeTab === 'client' ? loadAcquiredProperties
      : activeTab === 'services' ? loadOwnerServices
      : loadClientSubscriptions;
    await activeLoader();
    setRefreshing(false);
  };

  // --- Helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return theme.success;
      case 'RENTED': return theme.warning;
      case 'SOLD': return theme.warning;
      case 'MAINTENANCE': return theme.error;
      default: return theme.primary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return t('inventoryScreen.available');
      case 'RENTED': return t('inventoryScreen.rented');
      case 'SOLD': return t('inventoryScreen.sold');
      case 'MAINTENANCE': return t('inventoryScreen.maintenance');
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'check-circle';
      case 'RENTED': return 'key';
      case 'SOLD': return 'tag-check';
      case 'MAINTENANCE': return 'wrench';
      default: return 'help-circle';
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    return actionType === 'sell' ? t('inventoryScreen.bought') : t('inventoryScreen.rented');
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.success;
      case 'inactive': return theme.outline;
      case 'pending': return theme.warning;
      case 'suspended': return theme.error;
      default: return theme.outline;
    }
  };

  const getServiceStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('inventoryScreen.active');
      case 'inactive': return t('inventoryScreen.inactive');
      case 'pending': return t('inventoryScreen.pending');
      case 'suspended': return t('inventoryScreen.suspended');
      default: return status;
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.success;
      case 'paused': return theme.warning;
      case 'cancelled': return theme.error;
      case 'completed': return theme.outline;
      default: return theme.outline;
    }
  };

  const getSubscriptionStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('inventoryScreen.active');
      case 'paused': return t('inventoryScreen.paused');
      case 'cancelled': return t('inventoryScreen.cancelled');
      case 'completed': return t('inventoryScreen.completed');
      default: return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      maintenance: t('inventoryScreen.categoryMaintenance'),
      cleaning: t('inventoryScreen.categoryCleaning'),
      gardening: t('inventoryScreen.categoryGardening'),
      security: t('inventoryScreen.categorySecurity'),
      property_management: t('inventoryScreen.categoryPropertyMgmt'),
      construction: t('inventoryScreen.categoryConstruction'),
      renovation: t('inventoryScreen.categoryRenovation'),
      emergency: t('inventoryScreen.categoryEmergency'),
    };
    return labels[category] || category;
  };

  const getBillingLabel = (period: string) => {
    const labels: Record<string, string> = {
      hourly: t('inventoryScreen.perHour'),
      daily: t('inventoryScreen.perDay'),
      weekly: t('inventoryScreen.perWeek'),
      monthly: t('inventoryScreen.perMonth'),
      yearly: t('inventoryScreen.perYear'),
      one_time: '',
    };
    return labels[period] || '';
  };

  const handleEdit = (propertyId: string) => {
    router.push(`/property/edit/${propertyId}` as any);
  };

  const handleDelete = (propertyId: string, title: string) => {
    Alert.alert(
      t('inventoryScreen.deleteProperty'),
      t('inventoryScreen.deletePropertyMsg', { title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.deleteProperty(propertyId);
              setOwnerProperties(prev => prev.filter(p => p.id !== propertyId));
            } catch (error) {
              console.error('Error deleting property:', error);
              Alert.alert(t('common.error'), t('inventoryScreen.deleteError'));
            }
          }
        }
      ]
    );
  };

  const handleChangeStatus = async (propertyId: string, newStatus: Property['status']) => {
    try {
      await propertyService.updatePropertyStatus(propertyId, newStatus);
      setOwnerProperties(prev =>
        prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p)
      );
      setStatusMenuVisible(null);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(t('common.error'), t('inventoryScreen.statusError'));
    }
  };

  const handleTerminateLease = (propertyId: string, title: string) => {
    Alert.alert(
      t('inventoryScreen.terminateLease'),
      t('inventoryScreen.terminateLeaseMsg', { title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('inventoryScreen.terminateAction'),
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.terminatePropertyLease(propertyId);
              setAcquiredProperties(prev => prev.filter(p => p.id !== propertyId));
              Alert.alert(t('common.success'), t('inventoryScreen.terminateSuccess'));
            } catch (error) {
              console.error('Error terminating lease:', error);
              Alert.alert(t('common.error'), t('inventoryScreen.terminateError'));
            }
          }
        }
      ]
    );
  };

  const handleDeleteService = (serviceId: string, title: string) => {
    Alert.alert(
      t('inventoryScreen.deleteService'),
      t('inventoryScreen.deleteServiceMsg', { title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceMarketplaceService.deleteService(serviceId);
              setOwnerServices(prev => prev.filter(s => s.id !== serviceId));
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert(t('common.error'), t('inventoryScreen.deleteServiceError'));
            }
          }
        }
      ]
    );
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      const result = await serviceMarketplaceService.pauseSubscription(subscriptionId);
      if (result) {
        setClientSubscriptions(prev =>
          prev.map(s => s.id === subscriptionId ? { ...s, status: 'paused' as SubscriptionStatus } : s)
        );
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
      Alert.alert(t('common.error'), t('inventoryScreen.pauseError'));
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      const result = await serviceMarketplaceService.resumeSubscription(subscriptionId);
      if (result) {
        setClientSubscriptions(prev =>
          prev.map(s => s.id === subscriptionId ? { ...s, status: 'active' as SubscriptionStatus } : s)
        );
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      Alert.alert(t('common.error'), t('inventoryScreen.resumeError'));
    }
  };

  const handleUnsubscribe = (subscriptionId: string) => {
    Alert.alert(
      t('inventoryScreen.unsubscribe'),
      t('inventoryScreen.unsubscribeMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('inventoryScreen.unsubscribe'),
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await serviceMarketplaceService.unsubscribeFromService(subscriptionId);
              if (result.success) {
                setClientSubscriptions(prev =>
                  prev.map(s => s.id === subscriptionId ? { ...s, status: 'cancelled' as SubscriptionStatus } : s)
                );
              } else {
                Alert.alert(t('common.error'), result.message || t('inventoryScreen.unsubscribeError'));
              }
            } catch (error) {
              console.error('Error unsubscribing:', error);
              Alert.alert(t('common.error'), t('inventoryScreen.unsubscribeError'));
            }
          }
        }
      ]
    );
  };

  // --- Filtered data ---
  const filteredOwnerProperties = ownerFilter === 'all'
    ? ownerProperties
    : ownerProperties.filter(p => p.status === ownerFilter);

  // --- Visible tabs ---
  const isOwnerOrProvider = ownerProperties.length > 0 || ownerServices.length > 0;
  const isClient = acquiredProperties.length > 0 || clientSubscriptions.length > 0;

  const allTabs: { key: Tab; label: string; icon: 'home-city' | 'key-variant' | 'briefcase' | 'card-account-details'; count: number }[] = [
    { key: 'owner', label: t('inventoryScreen.properties'), icon: 'home-city', count: ownerProperties.length },
    { key: 'services', label: t('inventoryScreen.services'), icon: 'briefcase', count: ownerServices.length },
    { key: 'client', label: t('inventoryScreen.assets'), icon: 'key-variant', count: acquiredProperties.length },
    { key: 'subscriptions', label: t('inventoryScreen.subscriptions'), icon: 'card-account-details', count: clientSubscriptions.length },
  ];

  const visibleTabs = initialLoadDone
    ? allTabs.filter(t => {
        if (t.key === 'owner' || t.key === 'services') {
          return isOwnerOrProvider || !isClient; 
        }
        if (t.key === 'client' || t.key === 'subscriptions') {
          return isClient;
        }
        return true;
      })
    : allTabs;

  // Auto-select first visible tab if current tab became hidden
  useEffect(() => {
    if (initialLoadDone && visibleTabs.length > 0 && !visibleTabs.find(t => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [initialLoadDone, visibleTabs.length]);

  // --- Tab switcher ---
  const renderTabs = () => {
    if (visibleTabs.length <= 1 && initialLoadDone) return null;

    return (
      <ThemedView style={{ marginTop: 8, marginBottom: 6 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 12, gap: 8 }}
        >
          <ThemedView style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
            {visibleTabs.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{
                    minWidth: 80,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginRight: 8,
                    gap: 8,
                    backgroundColor: isActive ? theme.primary : 'transparent',
                    borderRadius: 22,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: isActive ? 'transparent' : theme.outline + '30',
                    shadowColor: isActive ? theme.primary : undefined,
                    shadowOpacity: isActive ? 0.12 : 0,
                    shadowRadius: isActive ? 6 : 0,
                    elevation: isActive ? 2 : 0,
                  }}
                >
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={16}
                    color={isActive ? '#fff' : theme.text + 'C0'}
                  />
                  <ThemedText
                    type="body"
                    intensity={isActive ? 'strong' : 'normal'}
                    style={{
                      color: isActive ? '#fff' : theme.text + 'C0',
                      letterSpacing: 0.2,
                      marginRight: 6,
                    }}
                  >
                    {tab.label}
                  </ThemedText>
                  <ThemedView style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: isActive ? theme.surface : theme.surfaceVariant,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 6,
                  }}>
                    <ThemedText type='body' intensity='strong' style={{
                      color: isActive ? theme.primary : theme.text,
                      fontSize: 12,
                    }}>
                      {tab.count}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  };

  // --- Owner filters ---
  const filterLabels: Record<OwnerFilter, string> = {
    all: t('inventoryScreen.all'),
    AVAILABLE: getStatusLabel('AVAILABLE'),
    RENTED: getStatusLabel('RENTED'),
    SOLD: getStatusLabel('SOLD'),
    MAINTENANCE: getStatusLabel('MAINTENANCE'),
  };

  const renderOwnerFilters = () => (
    <ThemedView style={{ marginTop: 12, marginBottom: 6 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 10, alignItems: 'center' }}
      >
        {(['all', 'AVAILABLE', 'RENTED', 'SOLD', 'MAINTENANCE'] as OwnerFilter[]).map((f) => {
          const isActive = ownerFilter === f;
          const statusIcon = f === 'all' ? 'filter-outline' : getStatusIcon(f as string);
          const statusColor = f === 'all' ? theme.outline : getStatusColor(f as string);

          return (
            <TouchableOpacity
              key={f}
              onPress={() => setOwnerFilter(f)}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              style={{
                minWidth: 82,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: isActive ? 'transparent' : theme.outline + '30',
                backgroundColor: isActive ? theme.primary : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={statusIcon as any} size={14} color={isActive ? '#fff' : statusColor} />
              <ThemedText
                type="caption"
                intensity={isActive ? 'strong' : 'light'}
                style={{
                  color: isActive ? '#fff' : theme.text + 'C0',
                  fontSize: 13,
                  letterSpacing: 0.2,
                }}
              >
                {filterLabels[f]}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ThemedView>
  );

  // --- Status change modal ---
  const renderStatusMenu = (propertyId: string) => {
    const statuses: Property['status'][] = ['AVAILABLE', 'RENTED', 'MAINTENANCE'];
    return (
      <Modal
        visible={statusMenuVisible === propertyId}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusMenuVisible(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setStatusMenuVisible(null)}
        >
          <ThemedView style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 20,
            width: width * 0.75,
          }}>
            <ThemedText type="subtitle" intensity="strong" style={{ marginBottom: 16, textAlign: 'center' }}>
              {t('inventoryScreen.changeStatus')}
            </ThemedText>
            {statuses.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => handleChangeStatus(propertyId, s)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor: theme.surfaceVariant,
                  marginBottom: 8,
                }}
              >
                <MaterialCommunityIcons
                  name={getStatusIcon(s) as any}
                  size={20}
                  color={getStatusColor(s)}
                />
                <ThemedText type ="normal" intensity="strong" style={{ color: getStatusColor(s) }}>
                  {getStatusLabel(s)}
                </ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setStatusMenuVisible(null)}
              style={{ marginTop: 8, alignItems: 'center', paddingVertical: 10 }}
            >
              <ThemedText>{t('common.cancel')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    );
  };

  // --- Owner property card ---
  const renderOwnerPropertyItem = ({ item, index }: { item: Property; index: number }) => {
    const imageUrl = Array.isArray(item.images) && item.images.length > 0
      ? (typeof item.images[0] === 'string' ? item.images[0] : (item.images[0] as any)?.url)
      : 'https://via.placeholder.com/300';

    const statusColor = getStatusColor(item.status);

    return (
      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 70, type: 'timing', duration: 380 }}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push({ pathname: '/info/[infoId]/', params: { id: item.id } } as any)}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            marginHorizontal: 12,
            marginBottom: 14,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 1,
            borderWidth:1,
            borderColor:theme.outline,
            maxHeight:200
          }}
        >
          {/* Status accent bar */}
          {/* <ThemedView style={{ height: 3, backgroundColor: statusColor, borderTopLeftRadius: 20, borderTopRightRadius: 20 }} /> */}

          <ThemedView style={{ flexDirection: 'row' }}>
            {/* Image */}
            <ThemedView style={{ position: 'relative' }}>
              <Image
                source={{ uri: imageUrl }}
                style={{ width: 120, height: 148 }}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.45)']}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                }}
              />
              {/* Price badge on image */}
              <ThemedView style={{
                position: 'absolute',
                bottom: 8,
                left: 6,
                backgroundColor: 'rgba(0,0,0,0.62)',
                borderRadius: 8,
                paddingHorizontal: 6,
                paddingVertical: 3,
              }}>
                <ThemedText style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                  {item.ownerCriteria?.monthlyRent?.toLocaleString() || '---'} {item.ownerCriteria?.currency || ''}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Content */}
            <ThemedView style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' }}>
              {/* Header row */}
              <ThemedView>
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <ThemedText type="normal" numberOfLines={1} style={{ flex: 1, marginRight: 8, fontWeight: '600', fontSize: 14 }}>
                    {item.title}
                  </ThemedText>
                  <ThemedView style={{
                    backgroundColor: statusColor + '22',
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    borderWidth: 1,
                    borderColor: statusColor + '44',
                  }}>
                    <MaterialCommunityIcons name={getStatusIcon(item.status) as any} size={11} color={statusColor} />
                    <ThemedText type="caption" intensity="strong" style={{ color: statusColor, fontSize: 11 }}>
                      {getStatusLabel(item.status)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4}}>
                     <MaterialCommunityIcons name="map-marker-outline" size={13} color={theme.text + '70'} />
                    <ThemedText type="caption" numberOfLines={1} style={{ flex: 1 }}>
                      {item.address}
                    </ThemedText>
                  </ThemedView>
                
                {/* Meta chips row */}
                <ThemedView style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  {item.propertyType && (
                    <ThemedView style={{
                      flexDirection: 'row', alignItems: 'center', gap: 3,
                      backgroundColor: theme.primary + '12', borderRadius: 10,
                      paddingHorizontal: 7, paddingVertical: 2,
                    }}>
                      <MaterialCommunityIcons name="home-outline" size={14} color={theme.primary} />
                      <ThemedText type = "caption" style={{ color: theme.primary, fontWeight: '600' }}>
                        {item.propertyType}
                      </ThemedText>
                    </ThemedView>
                  )}
                  {item.ownerCriteria?.acceptedPaymentMethods && (
                    <ThemedView style={{
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                      backgroundColor: theme.outline + '15', borderRadius: 10,
                      paddingHorizontal: 7, paddingVertical: 2,
                    }}>
                      <MaterialCommunityIcons name="credit-card" size={14} color={theme.text + '70'} />
                      <ThemedText type = "caption"  intensity = "light" style={{ fontWeight: '500' }}>
                        {item.ownerCriteria.acceptedPaymentMethods} m²
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>

              {/* Action buttons */}
              <ThemedView style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
                <TouchableOpacity
                  onPress={() => handleEdit(item.id)}
                  style={{
                    backgroundColor: theme.primary + '18',
                    paddingHorizontal: 10, paddingVertical: 7,
                    borderRadius: 10,
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                  }}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={14} color={theme.primary} />
                  <ThemedText style={{ fontSize: 11, color: theme.primary, fontWeight: '600' }}>
                    {t('common.edit') || 'Edit'}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStatusMenuVisible(item.id)}
                  style={{
                    backgroundColor: theme.warning + '18',
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  <MaterialCommunityIcons name="swap-horizontal" size={15} color={theme.warning} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.title)}
                  style={{
                    backgroundColor: '#FF444418',
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  <MaterialCommunityIcons name="delete-outline" size={15} color="#FF4444" />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
        {renderStatusMenu(item.id)}
      </MotiView>
    );
  };

  // --- Client acquired property card (with contract termination) ---
  const renderAcquiredPropertyItem = ({ item, index }: { item: Property; index: number }) => {
    const imageUrl = Array.isArray(item.images) && item.images.length > 0
      ? (typeof item.images[0] === 'string' ? item.images[0] : (item.images[0] as any)?.url)
      : 'https://via.placeholder.com/300';

    const isRented = item.actionType !== 'sell';
    const typeLabel = getActionTypeLabel(item.actionType);
    const typeColor = isRented ? theme.success : theme.warning;
    const typeIcon = isRented ? 'key-variant' : 'tag-check';

    return (
      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 70, type: 'timing', duration: 380 }}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push({ pathname: '/info/[infoId]/', params: { id: item.id } } as any)}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            marginHorizontal: 12,
            marginBottom: 14,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* Type accent bar */}
          <LinearGradient
            colors={[typeColor, typeColor + 'AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          />

          <ThemedView style={{ flexDirection: 'row' }}>
            {/* Image with overlay */}
            <ThemedView style={{ position: 'relative' }}>
              <Image
                source={{ uri: imageUrl }}
                style={{ width: 120, height: 162 }}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: 70,
                }}
              />
              {/* Type badge on image */}
              <ThemedView style={{
                position: 'absolute',
                top: 8, left: 6,
                backgroundColor: typeColor,
                borderRadius: 10,
                paddingHorizontal: 7,
                paddingVertical: 3,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
              }}>
                <MaterialCommunityIcons name={typeIcon as any} size={11} color="#fff" />
                <ThemedText style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>
                  {typeLabel}
                </ThemedText>
              </ThemedView>
              {/* Price on image bottom */}
              <ThemedView style={{
                position: 'absolute',
                bottom: 8, left: 6,
                backgroundColor: 'rgba(0,0,0,0.62)',
                borderRadius: 8,
                paddingHorizontal: 6,
                paddingVertical: 3,
              }}>
                <ThemedText style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                  {isRented
                    ? `${item.ownerCriteria?.monthlyRent?.toLocaleString() || '---'} ${item.ownerCriteria?.currency || ''}`
                    : `${item.ownerCriteria?.depositAmount?.toLocaleString() || '---'}€`}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Content */}
            <ThemedView style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' }}>
              {/* Title */}
              <ThemedView>
                <ThemedText type="normal" numberOfLines={1} style={{ fontWeight: '600', fontSize: 14, marginBottom: 5 }}>
                  {item.title}
                </ThemedText>

                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color={theme.text + '70'} />
                  <ThemedText type="caption" numberOfLines={1} style={{ flex: 1, color: theme.text + '80', fontSize: 12 }}>
                    {item.address}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Info rows */}
              <ThemedView style={{ gap: 6 }}>
                {/* Date */}
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ThemedView style={{
                    backgroundColor: theme.primary + '14',
                    borderRadius: 8, padding: 5,
                  }}>
                    <MaterialCommunityIcons name="calendar-check-outline" size={13} color={theme.primary} />
                  </ThemedView>
                  <ThemedText type="caption" style={{ color: theme.text + '80', fontSize: 12 }}>
                    {item.updatedAt
                      ? new Date(Number(item.updatedAt)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '---'}
                  </ThemedText>
                </ThemedView>

                {/* Owner */}
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ThemedView style={{
                    backgroundColor: theme.outline + '18',
                    borderRadius: 8, padding: 5,
                  }}>
                    <MaterialCommunityIcons name="account-outline" size={13} color={theme.text + '80'} />
                  </ThemedView>
                  <ThemedText type="caption" numberOfLines={1} style={{ flex: 1, color: theme.text + '90', fontSize: 12 }}>
                    {item.ownerName || t('inventoryScreen.ownerLabel')}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Terminate button */}
              {isRented && (
                <TouchableOpacity
                  onPress={() => handleTerminateLease(item.id, item.title)}
                  style={{
                    backgroundColor: theme.error + '14',
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: theme.error + '30',
                  }}
                >
                  <MaterialCommunityIcons name="link-off" size={13} color={theme.error} />
                  <ThemedText style={{ fontSize: 12, color: theme.error, fontWeight: '600' }}>
                    {t('inventoryScreen.terminate')}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </MotiView>
    );
  };

  // --- Service card (owner) ---
  const renderServiceItem = ({ item, index }: { item: Service; index: number }) => {
    const statusColor = getServiceStatusColor(item.status);

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 80, type: 'timing', duration: 400 }}
      >
        <ThemedView style={{
          borderRadius: 16,
          marginHorizontal: 16,
          marginBottom: 12,
          padding: 16,
          borderWidth:1,
          borderColor:theme.outline
        }}>
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <ThemedView style={{ flex: 1, marginRight: 8 }}>
              <ThemedText type="normal" intensity="strong" numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons name="tag" size={14} color={theme.text + "90"} />
                <ThemedText type="caption" >
                  {getCategoryLabel(item.category)}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={{
              backgroundColor: statusColor + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <ThemedText type="caption" intensity="strong" style={{ color: statusColor }}>
                {getServiceStatusLabel(item.status)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText type="caption" numberOfLines={2} style={{ marginBottom: 10 }}>
            {item.description}
          </ThemedText>

          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary }}>
              {item.pricing?.basePrice?.toLocaleString() || '---'}€
              <ThemedText type="caption" style={{ color: theme.outline }}>
                {getBillingLabel(item.pricing?.billingPeriod || '')}
              </ThemedText>
            </ThemedText>

            <ThemedView style={{ flexDirection: 'row', gap: 8, backgroundColor: 'transparent' }}>
              <TouchableOpacity
                onPress={() => router.push(`/service/edit/${item.id}` as any)}
                style={{ backgroundColor: theme.primary + '15', padding: 7, borderRadius: 8 }}
              >
                <MaterialCommunityIcons name="pencil" size={16} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteService(item.id, item.title)}
                style={{ backgroundColor: '#FF444420', padding: 7, borderRadius: 8 }}
              >
                <MaterialCommunityIcons name="delete" size={16} color="#FF4444" />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </MotiView>
    );
  };

  // --- Subscription card (client) ---
  const renderSubscriptionItem = ({ item, index }: { item: ServiceSubscription; index: number }) => {
    const statusColor = getSubscriptionStatusColor(item.status);
    const isActive = item.status === 'active';
    const isPaused = item.status === 'paused';
    const canManage = isActive || isPaused;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 80, type: 'timing', duration: 400 }}
      >
        <ThemedView style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          marginHorizontal: 16,
          marginBottom: 12,
          padding: 16,
        }}>
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <ThemedView style={{ flex: 1, marginRight: 8 }}>
              <ThemedText type="normal" intensity="strong" numberOfLines={1}>
                {t('inventoryScreen.subscription')} #{item.id.slice(-6)}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.outline, marginTop: 2 }}>
                {item.contractType?.replace('_', ' ') || 'Standard'}
              </ThemedText>
            </ThemedView>
            <ThemedView style={{
              backgroundColor: statusColor + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <ThemedText type="caption" intensity="strong" style={{ color: statusColor }}>
                {getSubscriptionStatusLabel(item.status)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 16, marginBottom: 10, backgroundColor: 'transparent' }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' }}>
              <MaterialCommunityIcons name="calendar-start" size={14} color={theme.outline} />
              <ThemedText type="caption" style={{ color: theme.outline }}>
                {new Date(item.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </ThemedText>
            </ThemedView>
            {item.endDate && (
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons name="calendar-end" size={14} color={theme.outline} />
                <ThemedText type="caption" style={{ color: theme.outline }}>
                  {new Date(item.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </ThemedText>
              </ThemedView>
            )}
            {item.autoRenewal && (
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' }}>
                <MaterialCommunityIcons name="autorenew" size={14} color={theme.success} />
                <ThemedText type="caption" style={{ color: theme.success }}>Auto</ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary }}>
              {item.pricing?.amount?.toLocaleString() || '---'}€
              <ThemedText type="caption" style={{ color: theme.outline }}>
                {getBillingLabel(item.pricing?.billingPeriod || '')}
              </ThemedText>
            </ThemedText>

            {canManage && (
              <ThemedView style={{ flexDirection: 'row', gap: 8, backgroundColor: 'transparent' }}>
                {isActive && (
                  <TouchableOpacity
                    onPress={() => handlePauseSubscription(item.id)}
                    style={{ backgroundColor: theme.warning + '15', padding: 7, borderRadius: 8 }}
                  >
                    <MaterialCommunityIcons name="pause" size={16} color={theme.warning} />
                  </TouchableOpacity>
                )}
                {isPaused && (
                  <TouchableOpacity
                    onPress={() => handleResumeSubscription(item.id)}
                    style={{ backgroundColor: theme.success + '15', padding: 7, borderRadius: 8 }}
                  >
                    <MaterialCommunityIcons name="play" size={16} color={theme.success} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleUnsubscribe(item.id)}
                  style={{ backgroundColor: theme.error + '15', padding: 7, borderRadius: 8 }}
                >
                  <MaterialCommunityIcons name="close-circle" size={16} color={theme.error} />
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </MotiView>
    );
  };

  // --- Empty states ---
  const renderEmptyOwner = () => (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 }}>
      <LinearGradient
        colors={[theme.primary + '20', theme.secondary + '20']}
        style={{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
      >
        <MaterialCommunityIcons name="home-city-outline" size={50} color={theme.primary} />
      </LinearGradient>
      <ThemedText type="subtitle" intensity="strong" style={{ marginBottom: 8, textAlign: 'center' }}>
        {ownerFilter === 'all' ? t('inventoryScreen.noProperties') : t('inventoryScreen.noPropertiesFiltered')}
      </ThemedText>
      <ThemedText type="normal" intensity="light" style={{ textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
        {ownerFilter === 'all'
          ? t('inventoryScreen.startAddProperties')
          : t('inventoryScreen.changeFilters')
        }
      </ThemedText>
      <TouchableOpacity
        onPress={() => ownerFilter !== 'all' ? setOwnerFilter('all') : router.push('/property/create')}
        style={{
          backgroundColor: theme.primary,
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 25,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <MaterialCommunityIcons name={ownerFilter !== 'all' ? 'filter-remove' : 'plus'} size={20} color="white" />
        <ThemedText intensity="strong" style={{ color: 'white' }}>
          {ownerFilter !== 'all' ? t('inventoryScreen.viewAll') : t('inventoryScreen.addProperty')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const renderEmptyClient = () => (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 }}>
      <LinearGradient
        colors={[theme.primary + '20', theme.secondary + '20']}
        style={{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
      >
        <MaterialCommunityIcons name="key-variant" size={50} color={theme.primary} />
      </LinearGradient>
      <ThemedText type="subtitle" intensity="strong" style={{ marginBottom: 8, textAlign: 'center' }}>
        {t('inventoryScreen.noAcquired')}
      </ThemedText>
      <ThemedText type="normal" intensity="light" style={{ textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
        {t('inventoryScreen.noAcquiredMsg')}
      </ThemedText>
    </ThemedView>
  );

  const renderEmptyServices = () => (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 }}>
      <LinearGradient
        colors={[theme.primary + '20', theme.secondary + '20']}
        style={{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
      >
        <MaterialCommunityIcons name="briefcase-outline" size={50} color={theme.primary} />
      </LinearGradient>
      <ThemedText type="subtitle" intensity="strong" style={{ marginBottom: 8, textAlign: 'center' }}>
        {t('inventoryScreen.noServices')}
      </ThemedText>
      <ThemedText type="normal" intensity="light" style={{ textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
        {t('inventoryScreen.noServicesMsg')}
      </ThemedText>
      <TouchableOpacity
        onPress={() => router.push('/service/create')}
        style={{
          backgroundColor: theme.primary,
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 25,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <MaterialCommunityIcons name="plus" size={20} color="white" />
        <ThemedText intensity="strong" style={{ color: 'white' }}>
          {t('inventoryScreen.createService')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const renderEmptySubscriptions = () => (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 }}>
      <LinearGradient
        colors={[theme.primary + '20', theme.secondary + '20']}
        style={{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
      >
        <MaterialCommunityIcons name="card-account-details-outline" size={50} color={theme.primary} />
      </LinearGradient>
      <ThemedText type="subtitle" intensity="strong" style={{ marginBottom: 8, textAlign: 'center' }}>
        {t('inventoryScreen.noSubscriptions')}
      </ThemedText>
      <ThemedText type="normal" intensity="light" style={{ textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
        {t('inventoryScreen.noSubscriptionsMsg')}
      </ThemedText>
    </ThemedView>
  );

  // --- Main render ---
  const getListData = (): any[] => {
    switch (activeTab) {
      case 'owner': return filteredOwnerProperties;
      case 'client': return acquiredProperties;
      case 'services': return ownerServices;
      case 'subscriptions': return clientSubscriptions;
    }
  };

  const getRenderItem = () => {
    switch (activeTab) {
      case 'owner': return renderOwnerPropertyItem;
      case 'client': return renderAcquiredPropertyItem;
      case 'services': return renderServiceItem;
      case 'subscriptions': return renderSubscriptionItem;
    }
  };

  const getEmptyComponent = () => {
    switch (activeTab) {
      case 'owner': return renderEmptyOwner;
      case 'client': return renderEmptyClient;
      case 'services': return renderEmptyServices;
      case 'subscriptions': return renderEmptySubscriptions;
    }
  };

  const currentData = getListData();

  return (
    <ThemedView style={{ flex: 1,  paddingTop: 0 }}>
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {renderTabs()}
            {activeTab === 'owner' && renderOwnerFilters()}
            <ThemedView style={{ height: 8 }} />
          </>
        }
        renderItem={getRenderItem() as any}
        ListEmptyComponent={getEmptyComponent()}
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
          paddingBottom: 100,
          flexGrow: currentData.length === 0 ? 1 : undefined,
        }}
      />
    </ThemedView>
  );
};

export default InventoryScreen;
