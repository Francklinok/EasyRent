import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { getPropertyService, Property } from '@/services/api/propertyService';
import PropertyCreationForm from '@/components/creation/PropertyCreationForm';

const EditPropertyScreen = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const propertyService = getPropertyService();

  useEffect(() => {
    if (!id) {
      Alert.alert('Erreur', 'ID de propriété manquant');
      router.back();
      return;
    }
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getProperty(id);
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
      Alert.alert('Erreur', 'Impossible de charger la propriété');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    Alert.alert(
      'Succès',
      'Propriété modifiée avec succès',
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
        <ThemedText style={{ marginTop: 16 }}>Chargement de la propriété...</ThemedText>
      </ThemedView>
    );
  }

  if (!property) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialIcons name="error-outline" size={64} color={theme.error} />
        <ThemedText type="subtitle" style={{ marginTop: 16, textAlign: 'center' }}>
          Propriété introuvable
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
      <PropertyCreationForm
        onClose={handleClose}
        onSuccess={handleSuccess}
        editMode={true}
        initialData={property}
      />
    </ThemedView>
  );
};

export default EditPropertyScreen;
