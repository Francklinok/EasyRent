import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { getServiceMarketplaceService } from '@/services/api/serviceMarketplaceService';

export default function ServiceDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      const serviceMarketplace = getServiceMarketplaceService();
      const data = await serviceMarketplace.getService(id as string);
      setService(data);
    } catch (error) {
      console.error('Error loading service:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le service',
      'Êtes-vous sûr de vouloir supprimer ce service ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const serviceMarketplace = getServiceMarketplaceService();
              await serviceMarketplace.deleteService(id as string);
              router.back();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le service');
            }
          }
        }
      ]
    );
  };

  if (!service) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>Chargement...</ThemedText>
      </View>
    );
  }

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
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 16, fontWeight: '700' }}>
          Détails du service
        </ThemedText>
        <TouchableOpacity onPress={handleDelete}>
          <MaterialIcons name="delete" size={24} color={theme.error} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {service.images?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {service.images.map((img: string, i: number) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={{ width: 200, height: 150, borderRadius: 12, marginRight: 10 }}
              />
            ))}
          </ScrollView>
        )}

        <ThemedText style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
          {service.title}
        </ThemedText>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <MaterialIcons name="category" size={18} color={theme.onSurface + '60'} />
          <ThemedText style={{ fontSize: 14, color: theme.onSurface + '60', marginLeft: 6 }}>
            {service.category}
          </ThemedText>
        </View>

        <View style={{
          backgroundColor: theme.primary + '15',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <ThemedText style={{ fontSize: 28, fontWeight: '700', color: theme.primary }}>
            {service.pricing?.basePrice} {service.pricing?.currency}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: theme.onSurface + '70', marginTop: 4 }}>
            par {service.pricing?.billingPeriod}
          </ThemedText>
        </View>

        <ThemedView style={{ marginBottom: 16 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
            Description
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: theme.onSurface + '80', lineHeight: 20 }}>
            {service.description}
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: 16 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
            Types de contrat
          </ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {service.contractTypes?.map((type: string, i: number) => (
              <View
                key={i}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: theme.outline + '30'
                }}
              >
                <ThemedText style={{ fontSize: 12, fontWeight: '600' }}>
                  {type}
                </ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={{ marginBottom: 16 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
            Zones d'intervention
          </ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {service.availability?.zones?.map((zone: string, i: number) => (
              <View
                key={i}
                style={{
                  backgroundColor: theme.success + '15',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6
                }}
              >
                <ThemedText style={{ fontSize: 12, color: theme.success, fontWeight: '600' }}>
                  {zone}
                </ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        {service.tags?.length > 0 && (
          <ThemedView style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              Mots-clés
            </ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {service.tags.map((tag: string, i: number) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: theme.primary + '15',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5
                  }}
                >
                  <ThemedText style={{ fontSize: 11, color: theme.primary }}>
                    #{tag}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>
        )}
      </ScrollView>
    </View>
  );
}
