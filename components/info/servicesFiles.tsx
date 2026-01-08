import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { useTheme } from '../contexts/theme/themehook';
import { getServiceMarketplaceService } from '@/services/api/serviceMarketplaceService';

type ServicesProps = {
  itemData?: {
    services?: Array<{
      serviceId: string;
    }>;
  };
};

const ServiceCard = ({ service, index }: { service: any; index: number }) => {
  const scaleValue = new Animated.Value(1);
  const  {theme} = useTheme()

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
        <ThemedView variant = "surfaceVariant" className="p-3 flex-row gap-4 items-center rounded-2xl">
          <ThemedView  
            className="rounded-2xl mr-2"
            style={{
              backgroundColor: theme.primary,
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
              color= {theme.surface}
            />
          </ThemedView>

          {/* Service content */}
          <ThemedView variant = "surfaceVariant" className="flex-1">
            <ThemedText type = "body" className = "pb-2">
              {service.title}
            </ThemedText>
            <ThemedText >
              {service.description}
            </ThemedText>
          </ThemedView>

          {/* Arrow indicator (commented out) */}
          {/* <ThemedView 
            className="rounded-full p-2 ml-3"
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.onSurface}
            />
          </ThemedView> */}
        </ThemedView>

        {/* Subtle bottom accent (commented out) */}
        {/* <ThemedView 
          className="h-1 rounded-b-2xl"
          style={{
            backgroundColor: '#4A90E2',
            opacity: 0.1,
          }}
        /> */}
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = () => {
  const router = useRouter();

  return (
  <ThemedView className="flex-1 justify-center items-center px-6 py-20 ">
    {/* Icon with animation */}
    <ThemedView 
      className="rounded-full p-8 mb-6"
      style={{
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
      }}
    >
      <MaterialCommunityIcons
        name="cog-outline"
        size={64}
        color="#CBD5E0"
      />
    </ThemedView>

    {/* Empty state title */}
    <ThemedText 
      className="text-2xl font-bold text-center mb-3"
      style={{ color: '#1A202C' }}
    >
      Aucun service disponible
    </ThemedText>

    {/* Empty state description */}
    <ThemedText 
      className="text-center text-base leading-6 mb-8 max-w-sm"
      style={{ color: '#718096' }}
    >
      Vous pourrez souscrire aux services dans votre{" "}
      <ThemedText 
        type="body" 
        intensity="strong"
        style={{ color: '#4A90E2' }}
      >
        profil
      </ThemedText>
      {" "}une fois votre location confirmée
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
      <ThemedText
      >
        Découvrir les services
      </ThemedText>
    </TouchableOpacity>
  </ThemedView>
  );
};

const Services = ({ itemData }: ServicesProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

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
        <ThemedText className="mt-4">Chargement des services...</ThemedText>
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
      <ThemedView
        className="px-6 pt-2 pb-0 "
      >
        <ThemedText type = "subtitle" intensity='strong'
          className=" mb-2  text-"
        >
          Services disponibles
        </ThemedText>
        <ThemedText
        >
          {formattedServices.length} service{formattedServices.length > 1 ? 's' : ''} à votre disposition
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