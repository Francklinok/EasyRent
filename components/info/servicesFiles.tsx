import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../../hooks/themehook';
import { getServiceMarketplaceService } from '@/services/api/serviceMarketplaceService';
import { useLanguage } from '../contexts/language';

type ServicesProps = {
  itemData?: {
    services?: Array<{
      serviceId: string;
    }>;
    _selectedUnit?: {
      roomName?: string;
      price?: number;
      currency?: string;
      capacity?: number;
    };
  };
};

const ServiceCard = ({ service }: { service: any; index: number }) => {
  const scaleValue = new Animated.Value(1);
  const { theme } = useTheme();

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 150,
      friction: 7,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 7,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        marginBottom: 11,
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <ThemedView variant="surfaceVariant" className="p-3 flex-row gap-4 items-center rounded-2xl">
          <ThemedView
            variant="primary"
            className="rounded-2xl mr-2"
            style={{
              padding: 14,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 1,
            }}>
            <MaterialCommunityIcons
              name={service.icon}
              size={24}
              color={theme.surface}
            />
          </ThemedView>

          {/* Service content */}
          <ThemedView variant="surfaceVariant" className="flex-1">
            <ThemedText type="normal" intensity="strong" className="pb-2">
              {service.title}
            </ThemedText>
            <ThemedText type="caption" >
              {service.description}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = () => {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <ThemedView className="flex-1 justify-center items-center px-6 py-2">
      {/* Icon with animation */}
      <ThemedView
        variant="surfaceVariant"
        className="rounded-full p-8 mb-6"
        style={{
          borderWidth: 2,
          borderColor: '#E2E8F0',
          borderStyle: 'dashed',
        }}
      >
        <MaterialCommunityIcons
          name="cog-outline"
          size={34}
          color="#CBD5E0"
        />
      </ThemedView>

      {/* Empty state title */}
      <ThemedText
        type="normaltitle"
        intensity="light"
        className="text-center mb-3" style = {{fontWeight:800}}
      >
        {t('services.noServices')}
      </ThemedText>

      {/* Empty state description */}
      <ThemedText
        type="body"
        
        className="text-center leading-6 mb-8 max-w-sm"
      >
        {t('services.subscribeAfterBooking')}
      </ThemedText>

      {/* Call to action button */}
      <TouchableOpacity
        className="rounded-xl px-8 py-4"
        onPress={() => router.push('/services')}
        style={{
          backgroundColor: '#4A90E2',
          shadowColor: '#4A90E2',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <ThemedText type="body" color="white">
          {t('services.discover')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const Services = ({ itemData }: ServicesProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    const loadServices = async () => {
      console.log('🔍 [Services] itemData received:', itemData);
      console.log('🔍 [Services] itemData.services:', itemData?.services);

      if (!itemData?.services || itemData.services.length === 0) {
        console.log('⚠️ [Services] No services to display');
        setServices([]);
        return;
      }

      try {
        setLoading(true);
        console.log('📥 [Services] Loading', itemData.services.length, 'services');
        const serviceMarketplace = getServiceMarketplaceService();
        console.log('🔧 [Services] Marketplace service instance obtained', serviceMarketplace);

        // Load details for each service
        const servicePromises = itemData.services.map(async (serviceRef) => {
          try {
            const service = await serviceMarketplace.getService(serviceRef.serviceId);
            return service;
          } catch (error) {
            console.error(`Error loading service ${serviceRef.serviceId}:`, error);
            return null;
          }
        });

        const loadedServices = await Promise.all(servicePromises);
        // Filter out null services (those that failed to load)
        const validServices = loadedServices.filter(s => s !== null);
        console.log('✅ [Services] Services loaded successfully:', validServices.length);
        setServices(validServices);
      } catch (error) {
        console.error('Error loading services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [itemData?.services]);

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type="body"  className="mt-4">{t('services.loading')}</ThemedText>
      </ThemedView>
    );
  }

  if (services.length === 0) {
    return <EmptyState />;
  }

  // Convert marketplace services to ServiceCard format
  const formattedServices = services.map(service => ({
    key: service.id,
    title: service.title,
    description: service.description || 'Service disponible',
    icon: getCategoryIcon(service.category),
    available: service.status === 'approved' && service.isActive
  }));

  return (
    <ThemedView className="flex-1">
      {/* Selected room context banner */}
      {itemData?._selectedUnit && (
        <ThemedView
          className="mx-6 mt-2 mb-1 px-3 py-2 rounded-xl flex-row items-center"
          style={{ backgroundColor: theme.primary + '10', borderWidth: 1, borderColor: theme.primary + '20' }}
        >
          <MaterialCommunityIcons name="door-open" size={16} color={theme.primary as string} />
          <ThemedText type="caption" intensity="strong" style={{ marginLeft: 6, color: theme.primary as string }}>
            {itemData._selectedUnit.roomName}
          </ThemedText>
          {itemData._selectedUnit.price != null && itemData._selectedUnit.price > 0 && (
            <ThemedText type="caption" style={{ marginLeft: 'auto', color: theme.primary as string, fontWeight: '700' }}>
              {itemData._selectedUnit.price.toLocaleString()} {itemData._selectedUnit.currency || 'XAF'}
            </ThemedText>
          )}
        </ThemedView>
      )}

      <ThemedView className="px-6 pt-2 pb-0">
        <ThemedText type="subtitle" intensity="strong" className="mb-2">
          {t('services.available')}
        </ThemedText>
        <ThemedText type="caption" >
          {t('services.count', { count: formattedServices.length })}
        </ThemedText>
      </ThemedView>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {formattedServices.map((service, index) => (
          <ServiceCard
            key={service.key}
            service={service}
            index={index}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
};

// Helper function to get icon based on category
const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'cleaning': 'broom',
    'maintenance': 'tools',
    'security': 'shield-check',
    'moving': 'truck-delivery',
    'gardening': 'flower',
    'plumbing': 'pipe-wrench',
    'electricity': 'lightning-bolt',
    'painting': 'format-paint',
    'renovation': 'home-edit',
    'other': 'wrench'
  };

  return iconMap[category] || 'wrench';
};

export default Services;