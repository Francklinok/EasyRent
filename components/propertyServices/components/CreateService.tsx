import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { propertyServiceAPI } from '../services/PropertyServiceAPI';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
const categories = [
  { id: 'jardinage', name: 'Jardinage', icon: '🌱' },
  { id: 'menage', name: 'Ménage', icon: '🧹' },
  { id: 'securite', name: 'Sécurité', icon: '🔒' },
  { id: 'assurance', name: 'Assurance', icon: '🛡️' },
  { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
  { id: 'conciergerie', name: 'Conciergerie', icon: '🎩' }
];

export const CreateService: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    basePrice: '',
    priceType: 'fixed' as const,
    images: [] as string[],
    tags: '',
    zones: ''
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5)
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.categoryId || !formData.basePrice) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.categoryId);
      formDataToSend.append('price', formData.basePrice);
      formDataToSend.append('priceType', formData.priceType);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('zones', formData.zones);

      formData.images.forEach((uri, index) => {
        formDataToSend.append('photos', {
          uri,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`,
        } as any);
      });

      await propertyServiceAPI.createService(formDataToSend);
      Alert.alert('Succès', 'Votre service a été créé et est en attente de validation');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le service');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>Créer un service</ThemedText>
      
      <ThemedView style={styles.section}>
        <ThemedText style={styles.label}>Titre du service *</ThemedText>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Ex: Jardinage professionnel"
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.label}>Description *</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Décrivez votre service..."
          multiline
          numberOfLines={4}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.label}>Catégorie *</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                formData.categoryId === category.id && styles.categoryButtonSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
            >
              <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
              <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.label}>Photos (recommandé pour prouver votre service)</ThemedText>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Ionicons name="camera" size={24} color="#666" />
          <ThemedText style={styles.imageButtonText}>Ajouter des photos</ThemedText>
        </TouchableOpacity>
        <ScrollView horizontal style={styles.imagePreview}>
          {formData.images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.previewImage} />
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.row}>
        <ThemedView style={styles.halfWidth}>
          <ThemedText style={styles.label}>Prix *</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.basePrice}
            onChangeText={(text) => setFormData(prev => ({ ...prev, basePrice: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
        </ThemedView>
        <ThemedView style={styles.halfWidth}>
          <ThemedText style={styles.label}>Type</ThemedText>
          <ThemedView style={styles.priceTypeContainer}>
            {['fixed', 'hourly', 'monthly'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.priceTypeButton,
                  formData.priceType === type && styles.priceTypeButtonSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, priceType: type as any }))}
              >
                <ThemedText style={styles.priceTypeText}>
                  {type === 'fixed' ? 'Fixe' : type === 'hourly' ? '/h' : '/mois'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <ThemedText style={styles.submitButtonText}>Créer le service</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: 'white' },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  halfWidth: { flex: 1 },
  categoryButton: { padding: 12, margin: 4, borderRadius: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', alignItems: 'center', minWidth: 80 },
  categoryButtonSelected: { backgroundColor: '#25D366', borderColor: '#25D366' },
  categoryIcon: { fontSize: 20, marginBottom: 4 },
  categoryText: { fontSize: 12, textAlign: 'center' },
  imageButton: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  imageButtonText: { marginLeft: 8, color: '#666' },
  imagePreview: { marginTop: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  priceTypeContainer: { flexDirection: 'row', gap: 4 },
  priceTypeButton: { flex: 1, padding: 8, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  priceTypeButtonSelected: { backgroundColor: '#25D366', borderColor: '#25D366' },
  priceTypeText: { fontSize: 12 },
  submitButton: { backgroundColor: '#25D366', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});