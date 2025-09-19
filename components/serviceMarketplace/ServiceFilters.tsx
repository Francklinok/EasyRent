import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ServiceFilters as ServiceFiltersType,
  ServiceCategory,
  ContractType,
  PriceRangeInput,
} from '../../services/api/serviceMarketplaceService';

interface ServiceFiltersProps {
  visible: boolean;
  filters: ServiceFiltersType;
  onApply: (filters: ServiceFiltersType) => void;
  onClose: () => void;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  visible,
  filters,
  onApply,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  // États locaux des filtres
  const [localFilters, setLocalFilters] = useState<ServiceFiltersType>(filters);
  const [minPrice, setMinPrice] = useState(filters.priceRange?.min?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.priceRange?.max?.toString() || '');

  // Réinitialiser les filtres locaux quand le modal s'ouvre
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      setMinPrice(filters.priceRange?.min?.toString() || '');
      setMaxPrice(filters.priceRange?.max?.toString() || '');
    }
  }, [visible, filters]);

  // Catégories de services avec leurs labels
  const categories = [
    { value: ServiceCategory.MAINTENANCE, label: 'Maintenance', icon: 'construct' },
    { value: ServiceCategory.CLEANING, label: 'Nettoyage', icon: 'sparkles' },
    { value: ServiceCategory.SECURITY, label: 'Sécurité', icon: 'shield-checkmark' },
    { value: ServiceCategory.GARDENING, label: 'Jardinage', icon: 'leaf' },
    { value: ServiceCategory.INSURANCE, label: 'Assurance', icon: 'umbrella' },
    { value: ServiceCategory.UTILITIES, label: 'Services publics', icon: 'flash' },
    { value: ServiceCategory.WELLNESS, label: 'Bien-être', icon: 'heart' },
    { value: ServiceCategory.EMERGENCY, label: 'Urgence', icon: 'alert-circle' },
    { value: ServiceCategory.ECO, label: 'Écologique', icon: 'earth' },
    { value: ServiceCategory.TECH, label: 'Technologie', icon: 'laptop' },
    { value: ServiceCategory.COLLABORATIVE, label: 'Collaboratif', icon: 'people' },
  ];

  // Types de contrat avec leurs labels
  const contractTypes = [
    { value: ContractType.SHORT_TERM, label: 'Court terme' },
    { value: ContractType.LONG_TERM, label: 'Long terme' },
    { value: ContractType.SEASONAL, label: 'Saisonnier' },
    { value: ContractType.ON_DEMAND, label: 'À la demande' },
    { value: ContractType.EMERGENCY, label: 'Urgence' },
  ];

  // Mettre à jour un filtre
  const updateFilter = (key: keyof ServiceFiltersType, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Appliquer les filtres
  const handleApply = () => {
    const finalFilters: ServiceFiltersType = { ...localFilters };

    // Gérer la fourchette de prix
    const minPriceNum = parseFloat(minPrice);
    const maxPriceNum = parseFloat(maxPrice);

    if (!isNaN(minPriceNum) || !isNaN(maxPriceNum)) {
      finalFilters.priceRange = {
        min: isNaN(minPriceNum) ? 0 : minPriceNum,
        max: isNaN(maxPriceNum) ? 999999 : maxPriceNum,
      };

      // Valider que min <= max
      if (!isNaN(minPriceNum) && !isNaN(maxPriceNum) && minPriceNum > maxPriceNum) {
        Alert.alert(
          'Erreur',
          'Le prix minimum ne peut pas être supérieur au prix maximum.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    onApply(finalFilters);
  };

  // Réinitialiser tous les filtres
  const handleReset = () => {
    setLocalFilters({});
    setMinPrice('');
    setMaxPrice('');
  };

  // Compter les filtres actifs
  const activeFiltersCount = Object.values(localFilters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }).length + (minPrice || maxPrice ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#636E72" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtres</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Catégorie */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryButton,
                    localFilters.category === category.value && styles.categoryButtonActive
                  ]}
                  onPress={() => updateFilter('category',
                    localFilters.category === category.value ? undefined : category.value
                  )}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={localFilters.category === category.value ? 'white' : '#636E72'}
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    localFilters.category === category.value && styles.categoryButtonTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Type de contrat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de contrat</Text>
            <View style={styles.contractTypesContainer}>
              {contractTypes.map((contractType) => (
                <TouchableOpacity
                  key={contractType.value}
                  style={[
                    styles.contractTypeButton,
                    localFilters.contractType === contractType.value && styles.contractTypeButtonActive
                  ]}
                  onPress={() => updateFilter('contractType',
                    localFilters.contractType === contractType.value ? undefined : contractType.value
                  )}
                >
                  <Text style={[
                    styles.contractTypeButtonText,
                    localFilters.contractType === contractType.value && styles.contractTypeButtonTextActive
                  ]}>
                    {contractType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fourchette de prix */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fourchette de prix (€)</Text>
            <View style={styles.priceInputsContainer}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceInputLabel}>Min</Text>
                <TextInput
                  style={styles.priceInput}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="0"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.priceSeparator}>
                <Text style={styles.priceSeparatorText}>à</Text>
              </View>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceInputLabel}>Max</Text>
                <TextInput
                  style={styles.priceInput}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="∞"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          {/* Localisation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <TextInput
              style={styles.textInput}
              value={localFilters.location || ''}
              onChangeText={(value) => updateFilter('location', value || undefined)}
              placeholder="Ville, code postal, quartier..."
              returnKeyType="done"
            />
          </View>

          {/* Type de propriété */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de propriété</Text>
            <TextInput
              style={styles.textInput}
              value={localFilters.propertyType || ''}
              onChangeText={(value) => updateFilter('propertyType', value || undefined)}
              placeholder="Appartement, maison, bureau..."
              returnKeyType="done"
            />
          </View>

          {/* Note minimum */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note minimum</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={styles.ratingButton}
                  onPress={() => updateFilter('rating',
                    localFilters.rating === rating ? undefined : rating
                  )}
                >
                  <Ionicons
                    name="star"
                    size={24}
                    color={localFilters.rating && localFilters.rating >= rating ? '#FDCB6E' : '#DDD'}
                  />
                </TouchableOpacity>
              ))}
              {localFilters.rating && (
                <Text style={styles.ratingText}>{localFilters.rating} étoile{localFilters.rating > 1 ? 's' : ''} et +</Text>
              )}
            </View>
          </View>

          {/* Services d'urgence */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => updateFilter('isEmergency', !localFilters.isEmergency)}
            >
              <View style={[
                styles.checkbox,
                localFilters.isEmergency && styles.checkboxActive
              ]}>
                {localFilters.isEmergency && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Services d'urgence uniquement</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer avec bouton d'application */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>
              Appliquer{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  } as ViewStyle,

  closeButton: {
    padding: 4,
  } as ViewStyle,

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  } as TextStyle,

  resetButton: {
    padding: 4,
  } as ViewStyle,

  resetButtonText: {
    fontSize: 16,
    color: '#007AFF',
  } as TextStyle,

  content: {
    flex: 1,
  } as ViewStyle,

  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  } as ViewStyle,

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
  } as TextStyle,

  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  } as ViewStyle,

  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
    minWidth: '45%',
  } as ViewStyle,

  categoryButtonActive: {
    backgroundColor: '#007AFF',
  } as ViewStyle,

  categoryButtonText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 8,
    flex: 1,
  } as TextStyle,

  categoryButtonTextActive: {
    color: 'white',
  } as TextStyle,

  contractTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  } as ViewStyle,

  contractTypeButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 4,
  } as ViewStyle,

  contractTypeButtonActive: {
    backgroundColor: '#007AFF',
  } as ViewStyle,

  contractTypeButtonText: {
    fontSize: 14,
    color: '#636E72',
  } as TextStyle,

  contractTypeButtonTextActive: {
    color: 'white',
  } as TextStyle,

  priceInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  priceInputWrapper: {
    flex: 1,
  } as ViewStyle,

  priceInputLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  } as TextStyle,

  priceInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3436',
  } as TextStyle,

  priceSeparator: {
    paddingHorizontal: 12,
    paddingTop: 20,
  } as ViewStyle,

  priceSeparatorText: {
    fontSize: 14,
    color: '#636E72',
  } as TextStyle,

  textInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3436',
  } as TextStyle,

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  ratingButton: {
    padding: 4,
  } as ViewStyle,

  ratingText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 12,
  } as TextStyle,

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  checkboxActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  } as ViewStyle,

  checkboxLabel: {
    fontSize: 16,
    color: '#2D3436',
    marginLeft: 12,
  } as TextStyle,

  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  } as ViewStyle,

  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  } as ViewStyle,

  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  } as TextStyle,
});

export default ServiceFilters;