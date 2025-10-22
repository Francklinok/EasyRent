import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { getServiceMarketplaceService } from '@/services/api/serviceMarketplaceService';

export default function ServicesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    try {
      const serviceMarketplace = getServiceMarketplaceService();
      const result = await serviceMarketplace.getServices();
      console.log('Services result:', result);
      const servicesList = result.edges ? result.edges.map(edge => edge.node) : [];
      setServices(servicesList);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const renderServiceItem = (service: any) => {
    const serviceId = service._id || service.id;
    return (
    <TouchableOpacity
      key={serviceId}
      onPress={() => router.push(`/services/${serviceId}`)}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.outline + '20'
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {service.images?.[0] ? (
          <Image
            source={{ uri: service.images[0] }}
            style={{ width: 80, height: 80, borderRadius: 10 }}
          />
        ) : (
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 10,
            backgroundColor: theme.primary + '20',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MaterialIcons name="build" size={32} color={theme.primary} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
            {service.title}
          </ThemedText>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MaterialIcons name="category" size={14} color={theme.onSurface + '60'} />
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', marginLeft: 4 }}>
              {service.category}
            </ThemedText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialIcons name="euro" size={14} color={theme.success} />
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.success, marginLeft: 2 }}>
              {service.pricing?.basePrice} {service.pricing?.currency}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60', marginLeft: 4 }}>
              / {service.pricing?.billingPeriod}
            </ThemedText>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {service.contractTypes?.slice(0, 2).map((type: string, i: number) => (
              <View
                key={i}
                style={{
                  backgroundColor: theme.primary + '15',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 3
                }}
              >
                <ThemedText style={{ fontSize: 10, color: theme.primary, fontWeight: '600' }}>
                  {type}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <MaterialIcons name="chevron-right" size={20} color={theme.onSurface + '40'} />
      </View>

      {service.description && (
        <ThemedText
          style={{ fontSize: 12, color: theme.onSurface + '70', marginTop: 8 }}
          numberOfLines={2}
        >
          {service.description}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <ThemedView style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.outline + '20',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={{ fontSize: 18, fontWeight: '700' }}>
            Mes Services
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push('/creation/service')}>
          <MaterialIcons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadServices} />
        }
      >
        {services.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <MaterialIcons name="work-outline" size={64} color={theme.onSurface + '30'} />
            <ThemedText style={{ fontSize: 16, color: theme.onSurface + '60', marginTop: 16, textAlign: 'center' }}>
              Aucun service créé
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/creation/service')}
              style={{
                backgroundColor: theme.primary,
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 12,
                marginTop: 20
              }}
            >
              <ThemedText style={{ color: 'white', fontWeight: '600' }}>
                Créer un service
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          services.map(renderServiceItem)
        )}
      </ScrollView>
    </View>
  );
}
