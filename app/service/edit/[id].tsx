import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { getServiceMarketplaceService, Service } from '@/services/api/serviceMarketplaceService';
import ServiceCreationForm from '@/components/creation/ServiceCreationForm';

const EditServiceScreen = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  const serviceMarketplaceService = getServiceMarketplaceService();

  useEffect(() => {
    if (!id) {
      Alert.alert('Erreur', 'ID de service manquant');
      router.back();
      return;
    }
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const data = await serviceMarketplaceService.getService(id);
      setService(data);
    } catch (error) {
      console.error('Error loading service:', error);
      Alert.alert('Erreur', 'Impossible de charger le service');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    Alert.alert(
      'Succès',
      'Service modifié avec succès',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Annuler les modifications',
      'Voulez-vous vraiment annuler les modifications ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: 16 }}>Chargement du service...</ThemedText>
      </ThemedView>
    );
  }

  if (!service) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialIcons name="error-outline" size={64} color={theme.error} />
        <ThemedText type="subtitle" style={{ marginTop: 16, textAlign: 'center' }}>
          Service introuvable
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: theme.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
        >
          <ThemedText style={{ color: 'white' }}>Retour</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ServiceCreationForm
        onClose={handleClose}
        onSuccess={handleSuccess}
        editMode={true}
        initialData={service}
      />
    </ThemedView>
  );
};

export default EditServiceScreen;
