import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Image, Platform, UIManager, LayoutAnimation, Dimensions, Keyboard, StyleSheet, KeyboardAvoidingView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { launchImageLibraryWithFallback } from '@/utils/imagePickerUtils';

import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import {
  getServiceMarketplaceService,
  CreateServiceInput,
  ServiceCategory,
  ContractType,
  BillingPeriod,
  PaymentMethod,
  Currency
} from '@/services/api/serviceMarketplaceService';

interface ServiceCreationFormProps {
  onClose: () => void;
  onSuccess: (service: any) => void;
}

const ServiceCreationForm: React.FC<ServiceCreationFormProps> = ({ onClose, onSuccess }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const [formData, setFormData] = useState<CreateServiceInput>({
    title: '',
    description: '',
    category: '' as any,
    contractTypes: [],
    pricing: {
      basePrice: 0,
      currency: Currency.EUR,
      billingPeriod: BillingPeriod.HOURLY,
      discounts: {
        longTerm: 0,
        seasonal: 0,
        bulk: 0
      }
    },
    acceptedPaymentMethods: [],
    verificationDocuments: [],
    requirements: {
      propertyTypes: [],
      isMandatory: false,
      isOptional: true
    },
    availability: {
      zones: [],
      schedule: {
        days: [],
        hours: ''
      },
      isEmergency: false
    },
    tags: []
  });

  const serviceCategories = [
    { value: ServiceCategory.MAINTENANCE, label: 'Maintenance', icon: 'build', description: 'Réparations et entretien' },
    { value: ServiceCategory.CLEANING, label: 'Nettoyage', icon: 'cleaning-services', description: 'Services de nettoyage' },
    { value: ServiceCategory.GARDENING, label: 'Jardinage', icon: 'grass', description: 'Entretien espaces verts' },
    { value: ServiceCategory.SECURITY, label: 'Sécurité', icon: 'security', description: 'Surveillance et sécurité' },
    { value: ServiceCategory.PROPERTY_MANAGEMENT, label: 'Gestion locative', icon: 'business', description: 'Gestion de propriété' },
    { value: ServiceCategory.CONSTRUCTION, label: 'Construction', icon: 'construction', description: 'Travaux de construction' },
    { value: ServiceCategory.RENOVATION, label: 'Rénovation', icon: 'home-repair-service', description: 'Réhabilitation et amélioration' },
    { value: ServiceCategory.AGRICULTURE, label: 'Agriculture', icon: 'agriculture', description: 'Exploitation terrain' },
    { value: ServiceCategory.UTILITIES, label: 'Services publics', icon: 'electrical-services', description: 'Eau, électricité, gaz' },
    { value: ServiceCategory.WASTE_MANAGEMENT, label: 'Gestion déchets', icon: 'delete', description: 'Déchets et vidange' },
    { value: ServiceCategory.PEST_CONTROL, label: 'Dératisation', icon: 'pest-control', description: 'Contrôle nuisibles' },
    { value: ServiceCategory.HEALTHCARE_HOME, label: 'Santé à domicile', icon: 'medical-services', description: 'Soins médicaux' },
    { value: ServiceCategory.CHILDCARE_HOME, label: 'Garde d\'enfants', icon: 'child-care', description: 'Baby-sitting' },
    { value: ServiceCategory.ELDERCARE_HOME, label: 'Aide seniors', icon: 'elderly', description: 'Assistance personnes âgées' },
    { value: ServiceCategory.TRANSPORT_LOGISTICS, label: 'Transport', icon: 'local-shipping', description: 'Déménagement, livraison' },
    { value: ServiceCategory.INSPECTION, label: 'Inspection', icon: 'search', description: 'Expertise et diagnostic' },
    { value: ServiceCategory.LEGAL_ADMIN, label: 'Juridique', icon: 'gavel', description: 'Services juridiques' },
    { value: ServiceCategory.EMERGENCY, label: 'Urgence', icon: 'emergency', description: 'Services d\'urgence 24/7' },
    { value: ServiceCategory.ECO_SERVICES, label: 'Écologique', icon: 'eco', description: 'Services écologiques' },
    { value: ServiceCategory.HOSPITALITY_SERVICES, label: 'Hôtellerie', icon: 'hotel', description: 'Services hôteliers' },
    { value: ServiceCategory.OFFICE_SERVICES, label: 'Services bureau', icon: 'business-center', description: 'Maintenance bureau, IT' },
    { value: ServiceCategory.COMMERCIAL_SERVICES, label: 'Services commerciaux', icon: 'storefront', description: 'Services pour magasins' },
    { value: ServiceCategory.OTHER, label: 'Autre', icon: 'more-horiz', description: 'Autre catégorie' }
  ];

  const contractTypesList = [
    { value: ContractType.SHORT_TERM, label: 'Court terme', description: 'Missions de courte durée' },
    { value: ContractType.LONG_TERM, label: 'Long terme', description: 'Contrats longue durée' },
    { value: ContractType.SEASONAL, label: 'Saisonnier', description: 'Services saisonniers' },
    { value: ContractType.ON_DEMAND, label: 'À la demande', description: 'Interventions ponctuelles' },
    { value: ContractType.EMERGENCY, label: 'Urgence', description: 'Interventions d\'urgence' }
  ];

  const billingPeriods = [
    { value: BillingPeriod.HOURLY, label: 'Par heure', icon: 'schedule' },
    { value: BillingPeriod.DAILY, label: 'Par jour', icon: 'today' },
    { value: BillingPeriod.WEEKLY, label: 'Par semaine', icon: 'date-range' },
    { value: BillingPeriod.MONTHLY, label: 'Par mois', icon: 'calendar-month' },
    { value: BillingPeriod.YEARLY, label: 'Par an', icon: 'calendar-today' },
    { value: BillingPeriod.ONE_TIME, label: 'Forfait unique', icon: 'payments' }
  ];

  const paymentMethodsList = [
    { value: PaymentMethod.BANK_CARD, label: 'Carte Bancaire', icon: 'credit-card' },
    { value: PaymentMethod.MOBILE_MONEY, label: 'Mobile Money', icon: 'phone-android' },
    { value: PaymentMethod.PAYPAL, label: 'PayPal', icon: 'payment' },
    { value: PaymentMethod.CASH, label: 'Espèces', icon: 'attach-money' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Virement', icon: 'account-balance' }
  ];

  const currenciesList = [
    { value: Currency.EUR, label: 'Euro (€)', symbol: '€' },
    { value: Currency.USD, label: 'Dollar ($)', symbol: '$' },
    { value: Currency.XAF, label: 'Franc CFA (FCFA)', symbol: 'FCFA' }
  ];

  const verificationRules = {
    [ServiceCategory.HEALTHCARE_HOME]: { level: 'required', docs: ['Diplôme médical', 'Autorisation d\'exercice'] },
    [ServiceCategory.LEGAL_ADMIN]: { level: 'required', docs: ['Carte professionnelle', 'Diplôme de droit'] },
    [ServiceCategory.SECURITY]: { level: 'required', docs: ['Carte professionnelle', 'Casier judiciaire'] },
    [ServiceCategory.UTILITIES]: { level: 'required', docs: ['Certification professionnelle'] },
    [ServiceCategory.CONSTRUCTION]: { level: 'required', docs: ['Assurance décennale', 'SIRET'] },
    [ServiceCategory.RENOVATION]: { level: 'required', docs: ['Assurance décennale'] },
    [ServiceCategory.INSPECTION]: { level: 'required', docs: ['Certification d\'expert'] },
    [ServiceCategory.CHILDCARE_HOME]: { level: 'recommended', docs: ['Certificat de formation', 'Casier judiciaire'] },
    [ServiceCategory.ELDERCARE_HOME]: { level: 'recommended', docs: ['Formation gériatrie'] },
    [ServiceCategory.PEST_CONTROL]: { level: 'recommended', docs: ['Certibiocide'] },
    [ServiceCategory.PROPERTY_MANAGEMENT]: { level: 'recommended', docs: ['Carte professionnelle'] },
    [ServiceCategory.EMERGENCY]: { level: 'recommended', docs: ['Qualificatif professionnel'] },
  };

  const propertyTypes = [
    'apartment', 'house', 'villa', 'studio', 'penthouse', 'loft',
    'bureau', 'chalet', 'hotel', 'terrain', 'commercial'
  ];

  const weekDays = [
    { value: 'monday', label: 'Lun' },
    { value: 'tuesday', label: 'Mar' },
    { value: 'wednesday', label: 'Mer' },
    { value: 'thursday', label: 'Jeu' },
    { value: 'friday', label: 'Ven' },
    { value: 'saturday', label: 'Sam' },
    { value: 'sunday', label: 'Dim' }
  ];

  const predefinedZones = [
    'Centre-ville', 'Banlieue Nord', 'Banlieue Sud', 'Banlieue Est', 'Banlieue Ouest',
    'Région Parisienne', 'Province', 'Toute la France', 'International'
  ];

  const inputStyle = {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 10,
    padding: 12,
    color: theme.onSurface,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.outline + '30'
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleContractType = (contractType: ContractType) => {
    const currentTypes = formData.contractTypes || [];
    const newTypes = currentTypes.includes(contractType)
      ? currentTypes.filter(t => t !== contractType)
      : [...currentTypes, contractType];
    updateFormData('contractTypes', newTypes);
  };

  const togglePropertyType = (propertyType: string) => {
    const currentTypes = formData.requirements.propertyTypes || [];
    const newTypes = currentTypes.includes(propertyType)
      ? currentTypes.filter(t => t !== propertyType)
      : [...currentTypes, propertyType];
    updateFormData('requirements.propertyTypes', newTypes);
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const currentMethods = formData.acceptedPaymentMethods || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    updateFormData('acceptedPaymentMethods', newMethods);
  };

  const toggleDay = (day: string) => {
    const currentDays = formData.availability.schedule.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    updateFormData('availability.schedule.days', newDays);
  };

  const toggleZone = (zone: string) => {
    const currentZones = formData.availability.zones || [];
    const newZones = currentZones.includes(zone)
      ? currentZones.filter(z => z !== zone)
      : [...currentZones, zone];
    updateFormData('availability.zones', newZones);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      updateFormData('tags', [...(formData.tags || []), tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && (formData.category || customCategory);
      case 2:
        return formData.contractTypes.length > 0 && formData.pricing.basePrice > 0 && formData.acceptedPaymentMethods.length > 0;
      case 3:
        return true;
      case 4:
        return formData.requirements.propertyTypes.length > 0;
      case 5:
        return formData.availability.zones.length > 0 && formData.availability.schedule.days.length > 0;
      case 6:
        // Mandatory verification for certain categories
        const rule = (verificationRules as any)[formData.category];
        if (rule?.level === 'required' && (!formData.verificationDocuments || formData.verificationDocuments.length === 0)) {
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentStep(prev => prev + 1);
    } else {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 [ServiceCreationForm] Envoi des données:', formData);
      const serviceMarketplaceService = getServiceMarketplaceService();
      const newService = await serviceMarketplaceService.createService(formData);
      console.log('✅ [ServiceCreationForm] Service créé:', newService);

      Alert.alert('Succès', 'Votre service a été créé avec succès !');
      onSuccess(newService);
      onClose();
    } catch (error) {
      console.error('❌ [ServiceCreationForm] Erreur création service:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ThemedView style={{ gap: 12 }}>
      
      <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
        Informations générales
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          Titre du service *
        </ThemedText>
        <TextInput
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          placeholder="Ex: Réparation plomberie express"
          style={inputStyle}
        />
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          Description détaillée *
        </ThemedText>
        <TextInput
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder="Décrivez vos compétences, votre expérience et ce que comprend le service..."
          multiline
          numberOfLines={4}
          style={{ ...inputStyle, textAlignVertical: 'top', minHeight: 80 }}
        />
      </ThemedView>

      <ThemedView>
        <ThemedText type ="normal" style={{ marginBottom: 16, }}>
          CATÉGORIE *
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {serviceCategories.map((category) => {
            const isSelected = formData.category === category.value;
            return (
              <TouchableOpacity
                key={category.value}
                onPress={() => {
                  updateFormData('category', category.value);
                  setShowCustomCategory(false);
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
                style={{
                  width: '30%',
                  backgroundColor: isSelected ? theme.primary + '90' : theme.surface,
                  borderRadius: 20,
                  padding: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.outline
                 
                }}
              >
                <ThemedView style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : theme.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <MaterialIcons
                    name={category.icon as any}
                    size={24}
                    color={isSelected ? 'white' : theme.onSurface}
                  />
                </ThemedView>
                <ThemedText type = "caption" style={{
                  color: isSelected ? 'white' : theme.onSurface,
                  textAlign: 'center',
                  marginBottom: 2
                }}>
                  {category.label}
                </ThemedText>
                {isSelected && (
                  <View style={{ position: 'absolute', top: 12, right: 12 }}>
                    <MaterialIcons name="check-circle" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => {
              setShowCustomCategory(!showCustomCategory);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            }}
            style={{
              width: '100%',
              backgroundColor: showCustomCategory ? theme.primary : theme.surface,
              borderRadius: 20,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: showCustomCategory ? theme.primary : theme.outline + '20',
              borderStyle: 'dashed'
            }}
          >
            <MaterialIcons
              name="add"
              size={24}
              color={showCustomCategory ? 'white' : theme.onSurface}
              style={{ marginRight: 8 }}
            />
            <ThemedText style={{
              color: showCustomCategory ? 'white' : theme.onSurface,
              fontWeight: '600',
              fontSize: 16
            }}>
              Autre catégorie
            </ThemedText>
          </TouchableOpacity>

          {showCustomCategory && (
            <ThemedView style={{ width: '100%' }}>
              <TextInput
                value={customCategory}
                onChangeText={(value) => {
                  setCustomCategory(value);
                  updateFormData('category', value as any);
                }}
                placeholder="Entrez votre catégorie personnalisée"
                placeholderTextColor={theme.onSurface + '40'}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 16,
                  color: theme.onSurface,
                  borderWidth: 1,
                  borderColor: theme.outline + '20'
                }}
              />
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const renderStep2 = () => (
    <ThemedView style={{ gap: 12 }}>
      <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
        Tarification et paiement
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          Prix de base *
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
          <ThemedView style={{ flex: 0.4 }}>
            <TextInput
              value={formData.pricing.basePrice.toString()}
              onChangeText={(value) => updateFormData('pricing.basePrice', parseFloat(value) || 0)}
              keyboardType="numeric"
              placeholder="0"
              style={inputStyle}
            />
          </ThemedView>
          <ThemedView style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.surfaceVariant, borderRadius: 16, padding: 4 }}>
            {currenciesList.map((currency) => {
              const isActive = formData.pricing.currency === currency.value;
              return (
                <TouchableOpacity
                  key={currency.value}
                  onPress={() => {
                    updateFormData('pricing.currency', currency.value);
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isActive ? theme.surface : 'transparent',
                   
                  }}
                >
                  <ThemedText type = "normal" style={{
                    color: isActive ? theme.primary : theme.onSurface + '60',
                    fontWeight: isActive ? '700' : '500',
                  
                  }}>
                    {currency.symbol}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          Méthodes de paiement acceptées *
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {paymentMethodsList.map((method) => {
            const isSelected = formData.acceptedPaymentMethods.includes(method.value);
            return (
              <TouchableOpacity
                key={method.value}
                onPress={() => {
                  togglePaymentMethod(method.value);
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
                style={{
                  width: '20%',
                  flexGrow: 1,
                  backgroundColor: isSelected ? theme.primary + "90" : theme.surface,
                  borderRadius: 16,
                  padding: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.outline 
                 
                }}
              >
                <MaterialIcons
                  name={method.icon as any}
                  size={24}
                  color={isSelected ? 'white' : theme.onSurface}
                  style={{ marginBottom: 8 }}
                />
                <ThemedText type="caption" style={{
                  color: isSelected ? 'white' : theme.onSurface,
                  textAlign: 'center'
                }}>
                  {method.label}
                </ThemedText>
                {isSelected && (
                  <ThemedView style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }} />
                )}
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          Période de facturation
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
          {billingPeriods.map((period) => {
            const isSelected = formData.pricing.billingPeriod === period.value;
            return (
              <TouchableOpacity
                key={period.value}
                onPress={() => updateFormData('pricing.billingPeriod', period.value)}
                style={{
                  backgroundColor: isSelected ? theme.primary + '15' : theme.surface,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 0.5,
                  borderColor: isSelected ? theme.primary : theme.outline + '20'
                }}
              >
                <MaterialIcons
                  name={period.icon as any}
                  size={18}
                  color={isSelected ? theme.primary : theme.onSurface + '60'}
                  style={{ marginRight: 8 }}
                />
                <ThemedText type ="normal" style={{
                  color: isSelected ? theme.primary : theme.onSurface,
                }}>
                  {period.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          Types de contrat acceptés *
        </ThemedText>
        <ThemedView style={{ gap: 12 }}>
          {contractTypesList.map((contract) => {
            const isSelected = formData.contractTypes.includes(contract.value);
            return (
              <TouchableOpacity
                key={contract.value}
                onPress={() => toggleContractType(contract.value)}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.outline,
                  
                }}
              >
                <ThemedView style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isSelected ? theme.primary + '15' : theme.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <MaterialIcons
                    name={isSelected ? 'check' : 'description'}
                    size={20}
                    color={isSelected ? theme.primary : theme.onSurface + '60'}
                  />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText type ="normal" intensity ="strong" style={{ color: isSelected ? theme.primary : theme.onSurface }}>
                    {contract.label}
                  </ThemedText>
                  <ThemedText type ="body" intensity ="light" style={{ marginTop: 2 }}>
                    {contract.description}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal"  style={{ fontWeight: '600', marginBottom: 6 }}>
          Remises (optionnel)
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { label: 'Long terme', field: 'longTerm', placeholder: '10' },
            { label: 'Saisonnier', field: 'seasonal', placeholder: '5' },
            { label: 'Quantité', field: 'bulk', placeholder: '15' }
          ].map((discount) => (
            <ThemedView key={discount.field} style={{ flex: 1 }}>
              <ThemedText type ="caption" intensity ="light" style={{  marginBottom: 8, textAlign: 'center' }}>
                {discount.label} (%)
              </ThemedText>
              <TextInput
                value={formData.pricing.discounts?.[discount.field as keyof typeof formData.pricing.discounts]?.toString() || ''}
                onChangeText={(value) => updateFormData(`pricing.discounts.${discount.field}`, parseInt(value) || 0)}
                keyboardType="numeric"
                placeholder={discount.placeholder}
                style={{ ...inputStyle, textAlign: 'center' }}
                 
              />
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const pickImages = async () => {
    const result = await launchImageLibraryWithFallback({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const pickDocuments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
    });
    if (!result.canceled) {
      setDocuments(prev => [...prev, ...result.assets]);
    }
  };

  const pickVerificationDocuments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
    });
    if (!result.canceled) {
      const newDocs = result.assets.map(a => a.name);
      updateFormData('verificationDocuments', [
        ...(formData.verificationDocuments || []),
        ...newDocs
      ]);
      Alert.alert('Document ajouté', `Le document ${result.assets[0].name} a été ajouté.`);
    }
  };

  const renderStep3 = () => (
    <ThemedView style={{ gap: 12 }}>
      <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
        Images et documents
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          Photos du service
        </ThemedText>
        <TouchableOpacity
          onPress={pickImages}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            padding: 22,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.primary,
            borderStyle: 'dashed',
            marginBottom: 10
          }}
        >
          <ThemedView style={{
            width: 60, height: 60, borderRadius: 30, backgroundColor: theme.primary + '15',
            alignItems: 'center', justifyContent: 'center', marginBottom: 12
          }}>
            <MaterialIcons name="add-a-photo" size={30} color={theme.primary} />
          </ThemedView>
          <ThemedText type ="normal" intensity ="strong" style={{ color: theme.primary }}>
            Ajouter de belles photos
          </ThemedText>
          <ThemedText type ="caption" intensity = "light" style={{ marginTop: 4 }}>
            Format JPG, PNG • Max 5MB
          </ThemedText>
        </TouchableOpacity>

        {images.length > 0 && (
          <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {images.map((img, i) => (
              <ThemedView key={i} style={{
                width: 100, height: 100, borderRadius: 12, overflow: 'hidden',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1, backgroundColor: theme.surface
              }}>
                <Image source={{ uri: img }} style={{ width: '100%', height: '100%' }} />
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setImages(images.filter((_, idx) => idx !== i));
                  }}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ marginBottom: 6 }}>
          Documents complémentaires
        </ThemedText>
        <TouchableOpacity
          onPress={pickDocuments}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.outline,
            marginBottom: 12
          }}
        >
          <ThemedView style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceVariant, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <MaterialIcons name="attach-file" size={20} color={theme.onSurface} />
          </ThemedView>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type ="normal">
              Certificats, diplômes...
            </ThemedText>
            <ThemedText type ="caption" intensity ="light">
              Ajouter un document
            </ThemedText>
          </ThemedView>
          <MaterialIcons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>

        {documents.length > 0 && (
          <ThemedView style={{ gap: 8 }}>
            {documents.map((doc, i) => (
              <ThemedView key={i} style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.outline + '20'
              }}>
                <ThemedView style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FF6B6B20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <MaterialIcons name="description" size={18} color="#FF6B6B" />
                </ThemedView>
                <ThemedText style={{ flex: 1, fontWeight: '500' }} numberOfLines={1}>
                  {doc.name}
                </ThemedText>
                <TouchableOpacity onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setDocuments(documents.filter((_, idx) => idx !== i));
                }}>
                  <MaterialIcons name="close" size={20} color={theme.error} />
                </TouchableOpacity>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );

  const renderStep4 = () => (
    <ThemedView style={{ gap: 12 }}>
      <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
        Exigences et compatibilité
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{  marginBottom: 6 }}>
          Propriétés compatibles *
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {propertyTypes.map((type) => {
            const isSelected = formData.requirements.propertyTypes.includes(type);
            return (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  togglePropertyType(type);
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
                style={{
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: theme.outline ,
                 
                }}
              >
                <ThemedText type ="body" style={{
                  color: isSelected ? 'white' : theme.onSurface,
                  textTransform: 'capitalize'
                }}>
                  {type}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ marginBottom: 6 }}>
          Nature du service
        </ThemedText>
        <ThemedView style={{ gap: 12 }}>
          {/* Mandatory Toggle */}
          <TouchableOpacity
            onPress={() => {
              updateFormData('requirements.isMandatory', !formData.requirements.isMandatory);
              if (!formData.requirements.isMandatory) updateFormData('requirements.isOptional', false);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            }}
            style={{
              flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: theme.surface,
              borderWidth: 1, borderColor: theme.outline
            }}
          >
            <ThemedView style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: formData.requirements.isMandatory ? theme.primary + '15' : theme.surfaceVariant, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <MaterialIcons name="gavel" size={20} color={formData.requirements.isMandatory ? theme.primary : theme.onSurface + '60'} />
            </ThemedView>
            <ThemedView style={{ flex: 1, paddingRight: 8 }}>
              <ThemedText type ="normal" style={{ marginBottom: 2 }}>Service Obligatoire</ThemedText>
              <ThemedText type = "caption" intensity ="light">
                Requis par la réglementation (ex: DPE)
              </ThemedText>
            </ThemedView>
            <MaterialIcons
              name={formData.requirements.isMandatory ? "radio-button-checked" : "radio-button-unchecked"}
              size={24} color={formData.requirements.isMandatory ? theme.primary : theme.onSurface + '40'}
            />
          </TouchableOpacity>

          {/* Optional Toggle */}
          <TouchableOpacity
            onPress={() => {
              updateFormData('requirements.isOptional', !formData.requirements.isOptional);
              if (!formData.requirements.isOptional) updateFormData('requirements.isMandatory', false);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            }}
            style={{
              flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: theme.surface,
              borderWidth: 1, borderColor: formData.requirements.isOptional ? theme.primary : theme.outline + '20'
            }}
          >
            <ThemedView style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: formData.requirements.isOptional ? theme.primary + '15' : theme.surfaceVariant, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <MaterialIcons name="stars" size={20} color={formData.requirements.isOptional ? theme.primary : theme.onSurface + '60'} />
            </ThemedView>
            <ThemedView style={{ flex: 1, paddingRight: 8 }}>
              <ThemedText type ="normal" style={{ marginBottom: 2 }}>Service Optionnel</ThemedText>
              <ThemedText type ="caption" intensity ="light">
                Choix du locataire (ex: Ménage)
              </ThemedText>
            </ThemedView>
            <MaterialIcons
              name={formData.requirements.isOptional ? "radio-button-checked" : "radio-button-unchecked"}
              size={24} color={formData.requirements.isOptional ? theme.primary : theme.onSurface + '40'}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ marginBottom: 6 }}>
          Tags et mots-clés
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {formData.tags?.map((tag) => (
            <ThemedView key={tag} style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 20,
              paddingLeft: 12,
              paddingRight: 8,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.outline + '20'
            }}>
              <ThemedText type ="body" intensity ="light" style={{ color: theme.onSurface,  marginRight: 6, }}>
                #{tag}
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  removeTag(tag);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ backgroundColor: theme.onSurface + '10', borderRadius: 10, padding: 2 }}
              >
                <MaterialIcons name="close" size={14} color={theme.onSurface} />
              </TouchableOpacity>
            </ThemedView>
          ))}
        </ThemedView>
        <TextInput
          placeholder="Ajouter des mots-clés... (Entrée pour valider)"
          onSubmitEditing={(e) => {
            if (e.nativeEvent.text.trim()) {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              addTag(e.nativeEvent.text.trim());
            }
          }}
          style={inputStyle}
        
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep5 = () => (
    <ThemedView style={{ gap: 12 }}>
      <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
        Disponibilité et zones
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{marginBottom: 6 }}>
          Zones d'intervention *
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {predefinedZones.map((zone) => {
            const isSelected = formData.availability.zones.includes(zone);
            return (
              <TouchableOpacity
                key={zone}
                onPress={() => {
                  toggleZone(zone);
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
                style={{
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: theme.outline 
                  
                }}
              >
                <ThemedText type ="body" style={{
                  color: isSelected ? 'white' : theme.onSurface,
                }}>
                  {zone}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ marginBottom: 6 }}>
          Planning hebdomadaire *
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20, paddingBottom: 10 }}>
          {weekDays.map((day) => {
            const isSelected = formData.availability.schedule.days.includes(day.value);
            return (
              <TouchableOpacity
                key={day.value}
                onPress={() => {
                  toggleDay(day.value);
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.outline 
                 
                }}
              >
                <ThemedText type= "normal" style={{
                  color: isSelected ? 'white' : theme.onSurface,
                }}>
                  {day.label.slice(0, 3)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{marginBottom: 6 }}>
          Horaires typiques
        </ThemedText>
        <TextInput
          value={formData.availability.schedule.hours}
          onChangeText={(value) => updateFormData('availability.schedule.hours', value)}
          placeholder="Ex: 9h00 - 18h00, sauf pause déjeuner..."
          style={inputStyle}
        />
      </ThemedView>

      <ThemedView>
        <TouchableOpacity
          onPress={() => {
            updateFormData('availability.isEmergency', !formData.availability.isEmergency);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          }}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: formData.availability.isEmergency ? theme.error + '10' : theme.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: formData.availability.isEmergency ? theme.error : theme.outline + '20'
          }}
        >
          <ThemedView style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: formData.availability.isEmergency ? theme.error + '20' : theme.surfaceVariant,
            alignItems: 'center', justifyContent: 'center', marginRight: 16
          }}>
            <MaterialCommunityIcons
              name={formData.availability.isEmergency ? "flash" : "flash-outline"}
              size={24}
              color={formData.availability.isEmergency ? theme.error : theme.onSurface + '60'}
            />
          </ThemedView>
          <View style={{ flex: 1 }}>
            <ThemedText type="normal" intensity ="strong" style={{  color: formData.availability.isEmergency ? theme.error : theme.onSurface }}>
              Service d'urgence
            </ThemedText>
            <ThemedText type ="caption" intensity ="light" style={{ marginTop: 2 }}>
              Interventions rapides 24h/24 et 7j/7
            </ThemedText>
          </View>
          <Switch
            value={formData.availability.isEmergency}
            onValueChange={(val) => {
              updateFormData('availability.isEmergency', val);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            }}
            trackColor={{ false: theme.outline + '40', true: theme.error + '60' }}
            thumbColor={formData.availability.isEmergency ? theme.error : '#f4f3f4'}
          />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const renderStep6 = () => {
    const rule = (verificationRules as any)[formData.category];
    const isRequired = rule?.level === 'required';
    const isRecommended = rule?.level === 'recommended';

    if (!rule || rule.level === 'none') {
      return (
        <ThemedView style={{ gap: 16 }}>
          <View style={{ alignItems: 'center', padding: 40 }}>
            <MaterialIcons name="verified-user" size={80} color={theme.success} />
            <ThemedText style={{ fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
              Vérification non requise
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', marginTop: 8, color: theme.onSurface + '80' }}>
              La catégorie sélectionnée ne nécessite pas de justificatifs obligatoires. Vous pouvez passer à l'étape suivante.
            </ThemedText>
          </View>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={{ gap: 12 }}>
        <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
          Vérification et sécurité
        </ThemedText>

        <ThemedView style={{
          backgroundColor: isRequired ? theme.error + '10' : theme.success + '10',
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isRequired ? theme.error + '30' : theme.success + '30',
          flexDirection: 'row',
          gap: 12
        }}>
          <MaterialIcons
            name={isRequired ? "gpp-maybe" : "verified"}
            size={32}
            color={isRequired ? theme.error : theme.success}
          />
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type ="normal" intensity ="strong" style={{ color: isRequired ? theme.error : theme.success }}>
              {isRequired ? 'Justificatifs OBLIGATOIRES' : 'Justificatifs recommandés'}
            </ThemedText>
            <ThemedText type ="body" style={{  marginTop: 4, lineHeight: 20 }}>
              Pour garantir la confiance sur la plateforme, cette catégorie nécessite les documents suivants :
            </ThemedText>
            {rule.docs.map((d: string, i: number) => (
              <ThemedText key={i} style={{ fontSize: 13, fontWeight: '600', marginTop: 2 }}>
                • {d}
              </ThemedText>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView>
          <ThemedText type ="normal" style={{ marginBottom: 8 }}>
            Téléverser vos documents
          </ThemedText>
          <TouchableOpacity
            onPress={pickVerificationDocuments}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.outline + '40',
              borderStyle: 'dashed'
            }}
          >
            <MaterialCommunityIcons name="file-document-edit-outline" size={40} color={theme.primary} />
            <ThemedText type ="body" style={{ marginTop: 8, color: theme.primary }}>
              Sélectionner un fichier
            </ThemedText>
            <ThemedText type ="caption" intensity ="light" style={{ marginTop: 4 }}>
              PDF, JPG, PNG (Max 5MB)
            </ThemedText>
          </TouchableOpacity>

          {formData.verificationDocuments && formData.verificationDocuments.length > 0 && (
            <ThemedView style={{ marginTop: 16, gap: 8 }}>
              {formData.verificationDocuments.map((doc, i) => (
                <ThemedView key={i} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.surface,
                  borderRadius: 8,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: theme.outline
                }}>
                  <MaterialIcons name="check-circle" size={20} color={theme.success} />
                  <ThemedText style={{ flex: 1, marginLeft: 12, fontWeight: '500' }} numberOfLines={1}>
                    {doc}
                  </ThemedText>
                  <TouchableOpacity onPress={() => {
                    const newDocs = [...formData.verificationDocuments!];
                    newDocs.splice(i, 1);
                    updateFormData('verificationDocuments', newDocs);
                  }}>
                    <MaterialIcons name="close" size={20} color={theme.error} />
                  </TouchableOpacity>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    );
  };

  const totalSteps = 6;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.surface, paddingTop:10 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ThemedView style={{
        paddingHorizontal: 16,
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
          <ThemedText type ="normal" intensity = "strong">
            Créer un service
          </ThemedText>
          <View style={{ width: 24 }} />
        </ThemedView>

        {/* Progress bar */}
        <ThemedView style={{
          backgroundColor: theme.surfaceVariant,
          borderRadius: 6,
          height: 4,
          marginBottom: 6
        }}>
          <ThemedView style={{
            backgroundColor: theme.primary,
            borderRadius: 6,
            height: 4,
            width: `${(currentStep / totalSteps) * 100}%`
          }} />
        </ThemedView>
        <ThemedText type ="caption" intensity ="light">
          Étape {currentStep} sur {totalSteps}
        </ThemedText>
      </ThemedView>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </ScrollView>

      {/* Footer */}
      <ThemedView style={{
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.outline + '20',
        flexDirection: 'row',
        gap: 10,
        paddingBottom:insets.bottom + 10
      }}>
        {currentStep > 1 && (
          <TouchableOpacity
            onPress={() => setCurrentStep(prev => prev - 1)}
            style={{
              flex: 1,
              backgroundColor: theme.surface,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
          >
            <ThemedText type ="normal" intensity ="strong">
              Précédent
            </ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={currentStep === totalSteps ? handleSubmit : handleNext}
          disabled={loading || !validateStep()}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[theme.secondary, theme.primary]}
            style={{
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              opacity: loading || !validateStep() ? 0.6 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <ThemedText type ="normal" intensity ="strong" style={{ color: 'white' }}>
                {currentStep === totalSteps ? 'Créer le service' : 'Suivant'}
              </ThemedText>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default ServiceCreationForm;