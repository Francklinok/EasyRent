import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Image, Platform, UIManager, LayoutAnimation, Dimensions, Keyboard, StyleSheet, KeyboardAvoidingView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { launchImageLibraryWithFallback } from '@/components/utils/imagePickerUtils';

import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import {
  getServiceMarketplaceService,
  CreateServiceInput,
  ServiceCategory,
  ContractType,
  BillingPeriod,
  PaymentMethod,
  Currency
} from '@/services/api/serviceMarketplaceService';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language';

interface ServiceCreationFormProps {
  onClose: () => void;
  onSuccess: (service: any) => void;
  editMode?: boolean;
  initialData?: any;
}

const ServiceCreationForm: React.FC<ServiceCreationFormProps> = ({ onClose, onSuccess, editMode = false, initialData }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { setIsOwner } = useAuth();
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
  const [images, setImages] = useState<string[]>([]); // URIs for display
  const [imagesBase64, setImagesBase64] = useState<string[]>([]); // Base64 for upload
  // Use ref to always have access to the latest base64 images (avoids closure issues)
  const imagesBase64Ref = useRef<string[]>([]);
  const [documents, setDocuments] = useState<{uri: string; name: string; base64?: string}[]>([]);
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
    { value: ServiceCategory.MAINTENANCE, label: t('serviceCreationForm.catMaintenance'), icon: 'build', description: t('serviceCreationForm.catMaintenanceDesc') },
    { value: ServiceCategory.CLEANING, label: t('serviceCreationForm.catCleaning'), icon: 'cleaning-services', description: t('serviceCreationForm.catCleaningDesc') },
    { value: ServiceCategory.GARDENING, label: t('serviceCreationForm.catGardening'), icon: 'grass', description: t('serviceCreationForm.catGardeningDesc') },
    { value: ServiceCategory.SECURITY, label: t('serviceCreationForm.catSecurity'), icon: 'security', description: t('serviceCreationForm.catSecurityDesc') },
    { value: ServiceCategory.PROPERTY_MANAGEMENT, label: t('serviceCreationForm.catPropertyMgmt'), icon: 'business', description: t('serviceCreationForm.catPropertyMgmtDesc') },
    { value: ServiceCategory.CONSTRUCTION, label: t('serviceCreationForm.catConstruction'), icon: 'construction', description: t('serviceCreationForm.catConstructionDesc') },
    { value: ServiceCategory.RENOVATION, label: t('serviceCreationForm.catRenovation'), icon: 'home-repair-service', description: t('serviceCreationForm.catRenovationDesc') },
    { value: ServiceCategory.AGRICULTURE, label: t('serviceCreationForm.catAgriculture'), icon: 'agriculture', description: t('serviceCreationForm.catAgricultureDesc') },
    { value: ServiceCategory.UTILITIES, label: t('serviceCreationForm.catUtilities'), icon: 'electrical-services', description: t('serviceCreationForm.catUtilitiesDesc') },
    { value: ServiceCategory.WASTE_MANAGEMENT, label: t('serviceCreationForm.catWaste'), icon: 'delete', description: t('serviceCreationForm.catWasteDesc') },
    { value: ServiceCategory.PEST_CONTROL, label: t('serviceCreationForm.catPestControl'), icon: 'pest-control', description: t('serviceCreationForm.catPestControlDesc') },
    { value: ServiceCategory.HEALTHCARE_HOME, label: t('serviceCreationForm.catHomeHealth'), icon: 'medical-services', description: t('serviceCreationForm.catHomeHealthDesc') },
    { value: ServiceCategory.CHILDCARE_HOME, label: t('serviceCreationForm.catChildcare'), icon: 'child-care', description: t('serviceCreationForm.catChildcareDesc') },
    { value: ServiceCategory.ELDERCARE_HOME, label: t('serviceCreationForm.catEldercare'), icon: 'elderly', description: t('serviceCreationForm.catEldercareDesc') },
    { value: ServiceCategory.TRANSPORT_LOGISTICS, label: t('serviceCreationForm.catTransport'), icon: 'local-shipping', description: t('serviceCreationForm.catTransportDesc') },
    { value: ServiceCategory.INSPECTION, label: t('serviceCreationForm.catInspection'), icon: 'search', description: t('serviceCreationForm.catInspectionDesc') },
    { value: ServiceCategory.LEGAL_ADMIN, label: t('serviceCreationForm.catLegal'), icon: 'gavel', description: t('serviceCreationForm.catLegalDesc') },
    { value: ServiceCategory.EMERGENCY, label: t('serviceCreationForm.catEmergency'), icon: 'emergency', description: t('serviceCreationForm.catEmergencyDesc') },
    { value: ServiceCategory.ECO_SERVICES, label: t('serviceCreationForm.catEco'), icon: 'eco', description: t('serviceCreationForm.catEcoDesc') },
    { value: ServiceCategory.HOSPITALITY_SERVICES, label: t('serviceCreationForm.catHospitality'), icon: 'hotel', description: t('serviceCreationForm.catHospitalityDesc') },
    { value: ServiceCategory.OFFICE_SERVICES, label: t('serviceCreationForm.catOffice'), icon: 'business-center', description: t('serviceCreationForm.catOfficeDesc') },
    { value: ServiceCategory.COMMERCIAL_SERVICES, label: t('serviceCreationForm.catCommercial'), icon: 'storefront', description: t('serviceCreationForm.catCommercialDesc') },
    { value: ServiceCategory.OTHER, label: t('serviceCreationForm.catOther'), icon: 'more-horiz', description: t('serviceCreationForm.catOtherDesc') }
  ];

  const contractTypesList = [
    { value: ContractType.SHORT_TERM, label: t('serviceCreationForm.contractShortTerm'), description: t('serviceCreationForm.contractShortTermDesc') },
    { value: ContractType.LONG_TERM, label: t('serviceCreationForm.contractLongTerm'), description: t('serviceCreationForm.contractLongTermDesc') },
    { value: ContractType.SEASONAL, label: t('serviceCreationForm.contractSeasonal'), description: t('serviceCreationForm.contractSeasonalDesc') },
    { value: ContractType.ON_DEMAND, label: t('serviceCreationForm.contractOnDemand'), description: t('serviceCreationForm.contractOnDemandDesc') },
    { value: ContractType.EMERGENCY, label: t('serviceCreationForm.contractEmergency'), description: t('serviceCreationForm.contractEmergencyDesc') }
  ];

  const billingPeriods = [
    { value: BillingPeriod.HOURLY, label: t('serviceCreationForm.billingHourly'), icon: 'schedule' },
    { value: BillingPeriod.DAILY, label: t('serviceCreationForm.billingDaily'), icon: 'today' },
    { value: BillingPeriod.WEEKLY, label: t('serviceCreationForm.billingWeekly'), icon: 'date-range' },
    { value: BillingPeriod.MONTHLY, label: t('serviceCreationForm.billingMonthly'), icon: 'calendar-month' },
    { value: BillingPeriod.YEARLY, label: t('serviceCreationForm.billingYearly'), icon: 'calendar-today' },
    { value: BillingPeriod.ONE_TIME, label: t('serviceCreationForm.billingFlat'), icon: 'payments' }
  ];

  const paymentMethodsList = [
    { value: PaymentMethod.BANK_CARD, label: t('serviceCreationForm.paymentCard'), icon: 'credit-card' },
    { value: PaymentMethod.MOBILE_MONEY, label: t('serviceCreationForm.paymentMobileMoney'), icon: 'phone-android' },
    { value: PaymentMethod.PAYPAL, label: t('serviceCreationForm.paymentPaypal'), icon: 'payment' },
    { value: PaymentMethod.CASH, label: t('serviceCreationForm.paymentCash'), icon: 'attach-money' },
    { value: PaymentMethod.BANK_TRANSFER, label: t('serviceCreationForm.paymentBankTransfer'), icon: 'account-balance' }
  ];

  const currenciesList = [
    { value: Currency.EUR, label: t('serviceCreationForm.currencyEUR'), symbol: '€' },
    { value: Currency.USD, label: t('serviceCreationForm.currencyUSD'), symbol: '$' },
    { value: Currency.XAF, label: t('serviceCreationForm.currencyXAF'), symbol: 'FCFA' }
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
    'bureau', 'chalet', 'hotel', 'terrain', 'commercial', 'Tout'
  ];

  const weekDays = [
    { value: 'monday', label: t('serviceCreationForm.dayMon') },
    { value: 'tuesday', label: t('serviceCreationForm.dayTue') },
    { value: 'wednesday', label: t('serviceCreationForm.dayWed') },
    { value: 'thursday', label: t('serviceCreationForm.dayThu') },
    { value: 'friday', label: t('serviceCreationForm.dayFri') },
    { value: 'saturday', label: t('serviceCreationForm.daySat') },
    { value: 'sunday', label: t('serviceCreationForm.daySun') }
  ];

  const predefinedZones = [
    t('serviceCreationForm.zoneCityCenter'),
    t('serviceCreationForm.zoneNorthSuburb'),
    t('serviceCreationForm.zoneSouthSuburb'),
    t('serviceCreationForm.zoneEastSuburb'),
    t('serviceCreationForm.zoneWestSuburb'),
    t('serviceCreationForm.zoneRegional'),
    t('serviceCreationForm.zoneProvince'),
    t('serviceCreationForm.zoneAll'),
    t('serviceCreationForm.zoneInternational'),
  ];

  const inputStyle = {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 10,
    padding: 12,
    color: theme.text,
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

  const allPropertyTypes = propertyTypes.filter(t => t !== 'Tout');

  const togglePropertyType = (propertyType: string) => {
    const currentTypes = formData.requirements.propertyTypes || [];

    if (propertyType === 'Tout') {
      // If all are already selected, deselect all; otherwise select all
      const newTypes = currentTypes.length === allPropertyTypes.length ? [] : [...allPropertyTypes];
      updateFormData('requirements.propertyTypes', newTypes);
      return;
    }

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
        // Vérification des documents obligatoires selon la catégorie
        const rule = (verificationRules as any)[formData.category];
        if (rule?.level === 'required' && (!formData.verificationDocuments || formData.verificationDocuments.length === 0)) {
          return false;
        }
        return true;
      case 4:
        return formData.requirements.propertyTypes.length > 0;
      case 5:
        return formData.availability.zones.length > 0 && formData.availability.schedule.days.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentStep(prev => prev + 1);
    } else {
      // Message d'erreur spécifique selon l'étape
      let errorMessage = t('serviceCreationForm.alertFieldsRequiredMsg');

      if (currentStep === 3) {
        const rule = (verificationRules as any)[formData.category];
        if (rule?.level === 'required' && (!formData.verificationDocuments || formData.verificationDocuments.length === 0)) {
          const categoryLabel = serviceCategories.find(c => c.value === formData.category)?.label || formData.category;
          errorMessage = t('serviceCreationForm.alertDocRequired', { category: categoryLabel });
        }
      }

      Alert.alert(t('serviceCreationForm.alertFieldsRequired'), errorMessage);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      Alert.alert(t('serviceCreationForm.alertFieldsRequired'), t('serviceCreationForm.alertFieldsRequiredMsg'));
      return;
    }

    try {
      setLoading(true);

      // Verify all images are in base64 format
      const validImages = imagesBase64Ref.current.filter(img =>
        img && typeof img === 'string' && img.startsWith('data:image/')
      );

      console.log(`📸 [ServiceCreationForm] Sending ${validImages.length} base64 images to server...`);

      // Prepare data with base64 images (same pattern as PropertyCreationForm)
      const submitData = {
        ...formData,
        images: validImages,
      };

      console.log('📤 [ServiceCreationForm] Envoi des données:', {
        ...submitData,
        images: `[${validImages.length} images base64]`,
      });

      const serviceMarketplaceService = getServiceMarketplaceService();
      const newService = await serviceMarketplaceService.createService(submitData);
      console.log('✅ [ServiceCreationForm] Service créé:', newService);

      Alert.alert(t('serviceCreationForm.alertSuccessTitle'), t('serviceCreationForm.alertSuccessMsg'));
      setIsOwner(true);
      onSuccess(newService);
      onClose();
    } catch (error) {
      console.error('❌ [ServiceCreationForm] Erreur création service:', error);
      Alert.alert(t('serviceCreationForm.alertErrorTitle'), t('serviceCreationForm.alertErrorMsg'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ThemedView style={{ gap: 12 }}>
      
      <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
        {t('serviceCreationForm.step1Title')}
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          {t('serviceCreationForm.titleLabel')}
        </ThemedText>
        <TextInput
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          placeholder={t('serviceCreationForm.titlePlaceholder')}
          style={inputStyle}
          placeholderTextColor={theme.text + '80'}

        />
      </ThemedView>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          {t('serviceCreationForm.descriptionLabel')}
        </ThemedText>
        <TextInput
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder={t('serviceCreationForm.descriptionPlaceholder')}
          multiline
          numberOfLines={4}
          style={{ ...inputStyle, textAlignVertical: 'top', minHeight: 80 }}
          placeholderTextColor={theme.text + '80'}

        />
      </ThemedView>

      <ThemedView>
        <ThemedText type ="normal" style={{ marginBottom: 16, }}>
          {t('serviceCreationForm.categoryLabel')}
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
              {t('serviceCreationForm.categoryCustomLabel')}
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
                placeholder={t('serviceCreationForm.categoryCustomPlaceholder')}
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
        {t('serviceCreationForm.step2Title')}
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
          {t('serviceCreationForm.basePriceLabel')}
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
          <ThemedView style={{ flex: 0.4 }}>
            <TextInput
              value={formData.pricing.basePrice.toString()}
              onChangeText={(value) => updateFormData('pricing.basePrice', parseFloat(value) || 0)}
              keyboardType="numeric"
              placeholder="0"
              style={inputStyle}
              placeholderTextColor={theme.text + '80'}

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
                    backgroundColor: isActive ? theme.primary : 'transparent',
                   
                  }}
                >
                  <ThemedText type = "normal" style={{
                    color: isActive ? theme.text : theme.onSurface + '60',
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
          {t('serviceCreationForm.paymentMethodsLabel')}
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
          {t('serviceCreationForm.billingPeriodLabel')}
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
          {t('serviceCreationForm.contractTypesLabel')}
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
                <ThemedView style={{ flex: 1, backgroundColor: "transparent" }}>
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
          {t('serviceCreationForm.discountsLabel')}
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { label: t('serviceCreationForm.discountLongTerm'), field: 'longTerm', placeholder: '10' },
            { label: t('serviceCreationForm.discountSeasonal'), field: 'seasonal', placeholder: '5' },
            { label: t('serviceCreationForm.discountQuantity'), field: 'bulk', placeholder: '15' }
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
                placeholderTextColor={theme.text + '80'}

                 
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
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newImageUris = result.assets.map(asset => asset.uri);
      console.log(`📸 [Service] Picked ${result.assets.length} images from picker`);

      // Convert all images to base64 immediately after picking
      const newBase64Images: string[] = [];
      for (const asset of result.assets) {
        try {
          let base64Data: string;

          if (asset.base64) {
            // Base64 provided by picker (rare with allowsMultipleSelection)
            base64Data = asset.base64;
            console.log(`✅ Base64 provided by picker for: ${asset.uri.substring(asset.uri.length - 20)}`);
          } else {
            // Convert URI to base64 using FileSystem
            console.log(`🔄 Converting to base64: ${asset.uri.substring(asset.uri.length - 30)}`);
            base64Data = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any,
            });
            console.log(`✅ Converted successfully, length: ${base64Data.length}`);
          }

          // Determine MIME type
          const mimeType = asset.mimeType ||
            (asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');

          // Create data URL
          const dataUrl = `data:${mimeType};base64,${base64Data}`;
          newBase64Images.push(dataUrl);
        } catch (error) {
          console.error(`❌ Failed to convert image: ${asset.uri}`, error);
          // Skip this image if conversion fails
        }
      }

      if (newBase64Images.length > 0) {
        setImages(prev => [...prev, ...newImageUris]);
        setImagesBase64(prev => {
          const updated = [...prev, ...newBase64Images];
          imagesBase64Ref.current = updated;
          console.log(`📸 [Service] Total base64 images now: ${updated.length}`);
          return updated;
        });
      } else {
        Alert.alert(t('common.error'), t('serviceCreationForm.alertImageError'));
      }
    }
  };

  const removeImage = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesBase64(prev => {
      const updated = prev.filter((_, i) => i !== index);
      imagesBase64Ref.current = updated;
      return updated;
    });
  };

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        console.log(`📄 [Service] Picked ${result.assets.length} documents`);

        const newDocs: {uri: string; name: string; base64?: string}[] = [];
        for (const asset of result.assets) {
          try {
            // Convert document to base64
            const base64Data = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any,
            });

            // Determine MIME type
            const ext = asset.name.toLowerCase().split('.').pop();
            let mimeType = 'application/octet-stream';
            if (ext === 'pdf') mimeType = 'application/pdf';
            else if (ext === 'png') mimeType = 'image/png';
            else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            newDocs.push({
              uri: asset.uri,
              name: asset.name,
              base64: dataUrl
            });
            console.log(`✅ Document converted: ${asset.name}`);
          } catch (error) {
            console.error(`❌ Failed to convert document: ${asset.name}`, error);
            // Still add without base64 as fallback
            newDocs.push({
              uri: asset.uri,
              name: asset.name
            });
          }
        }

        setDocuments(prev => [...prev, ...newDocs]);
      }
    } catch (error) {
      console.error('❌ Document picker error:', error);
      Alert.alert(t('common.error'), t('serviceCreationForm.alertDocumentError'));
    }
  };

  const pickVerificationDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        console.log(`📄 [Service] Picked ${result.assets.length} verification documents`);

        const newVerificationDocs: {name: string; uri: string; base64?: string}[] = [];
        for (const asset of result.assets) {
          try {
            // Convert document to base64
            const base64Data = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any,
            });

            // Determine MIME type
            const ext = asset.name.toLowerCase().split('.').pop();
            let mimeType = 'application/octet-stream';
            if (ext === 'pdf') mimeType = 'application/pdf';
            else if (ext === 'png') mimeType = 'image/png';
            else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            newVerificationDocs.push({
              name: asset.name,
              uri: asset.uri,
              base64: dataUrl
            });
            console.log(`✅ Verification document converted: ${asset.name}`);
          } catch (error) {
            console.error(`❌ Failed to convert verification document: ${asset.name}`, error);
            // Still add without base64 as fallback
            newVerificationDocs.push({
              name: asset.name,
              uri: asset.uri
            });
          }
        }

        // Update formData with the new verification documents (storing full object, not just name)
        updateFormData('verificationDocuments', [
          ...(formData.verificationDocuments || []),
          ...newVerificationDocs.map(doc => doc.name) // Keep just name for display in formData
        ]);

        Alert.alert(
          t('serviceCreationForm.alertDocumentAdded'),
          t('serviceCreationForm.alertDocumentAddedMsg', { count: newVerificationDocs.length })
        );
      }
    } catch (error) {
      console.error('❌ Verification document picker error:', error);
      Alert.alert(t('common.error'), t('serviceCreationForm.alertDocumentError'));
    }
  };

  const renderStep3 = () => {
    // Vérifier si la catégorie nécessite des documents obligatoires
    const rule = (verificationRules as any)[formData.category];
    const isRequired = rule?.level === 'required';
    const hasVerificationRule = rule && rule.level !== 'none';

    return (
      <ThemedView style={{ gap: 12 }}>
        <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
          {t('serviceCreationForm.step3Title')}
        </ThemedText>

        <ThemedView>
          <ThemedText type="normal" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
            {t('serviceCreationForm.photosLabel')}
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
              {t('serviceCreationForm.photosAddBtn')}
            </ThemedText>
            <ThemedText type ="caption" intensity = "light" style={{ marginTop: 4 }}>
              {t('serviceCreationForm.photosFormat')}
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
                    onPress={() => removeImage(i)}
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

        {/* Section de vérification des documents obligatoires selon la catégorie */}
        {hasVerificationRule && (
          <ThemedView style={{ marginTop: 8 }}>
            <ThemedView style={{
              backgroundColor: isRequired ? theme.error + '10' : theme.success + '10',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isRequired ? theme.error + '30' : theme.success + '30',
              flexDirection: 'row',
              gap: 12,
              marginBottom: 12
            }}>
              <MaterialIcons
                name={isRequired ? "gpp-maybe" : "verified"}
                size={32}
                color={isRequired ? theme.error : theme.success}
              />
              <ThemedView style={{ flex: 1,  backgroundColor: 'transparent' }}>
                <ThemedText type ="normal" intensity ="strong" style={{ color: isRequired ? theme.error : theme.success }}>
                  {isRequired ? t('serviceCreationForm.verificationRequired') : t('serviceCreationForm.verificationRecommended')}
                </ThemedText>
                <ThemedText type ="body" style={{  marginTop: 4, lineHeight: 20 }}>
                  {t('serviceCreationForm.verificationInstruction', { status: isRequired ? t('serviceCreationForm.verificationStatusRequired') : t('serviceCreationForm.verificationStatusRecommended') })}
                </ThemedText>
                {rule.docs.map((d: string, i: number) => (
                  <ThemedText key={i} style={{ fontSize: 13, fontWeight: '600', marginTop: 2 }}>
                    • {d}
                  </ThemedText>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedText type ="normal" style={{ marginBottom: 8 }}>
              {isRequired ? t('serviceCreationForm.verificationUploadLabel') + ' *' : t('serviceCreationForm.verificationUploadLabelOptional')}
            </ThemedText>
            <TouchableOpacity
              onPress={pickVerificationDocuments}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isRequired && (!formData.verificationDocuments || formData.verificationDocuments.length === 0)
                  ? theme.error + '60'
                  : theme.outline + '40',
                borderStyle: 'dashed'
              }}
            >
              <MaterialCommunityIcons name="file-document-edit-outline" size={40} color={theme.primary} />
              <ThemedText type ="body" style={{ marginTop: 8, color: theme.primary }}>
                {t('serviceCreationForm.verificationSelectFile')}
              </ThemedText>
              <ThemedText type ="caption" intensity ="light" style={{ marginTop: 4 }}>
                {t('serviceCreationForm.verificationFormat')}
              </ThemedText>
            </TouchableOpacity>

            {formData.verificationDocuments && formData.verificationDocuments.length > 0 && (
              <ThemedView style={{ marginTop: 12, gap: 8 }}>
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
        )}

        <ThemedView>
          <ThemedText type="normal" intensity="light" style={{ marginBottom: 6 }}>
            {t('serviceCreationForm.additionalDocsLabel')}
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
            <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
              <ThemedText type ="normal">
                {t('serviceCreationForm.additionalDocsHint')}
              </ThemedText>
              <ThemedText type ="caption" intensity ="light">
                {t('serviceCreationForm.additionalDocsAdd')}
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
  };

  const renderStep4 = () => (
    <ThemedView style={{ gap: 12 }}>
      <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
        {t('serviceCreationForm.step4Title')}
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{  marginBottom: 6 }}>
          {t('serviceCreationForm.compatiblePropertiesLabel')}
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {propertyTypes.map((type) => {
            const isSelected = type === 'Tout'
              ? formData.requirements.propertyTypes.length === allPropertyTypes.length
              : formData.requirements.propertyTypes.includes(type);
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
          {t('serviceCreationForm.serviceNatureLabel')}
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
            <ThemedView style={{ flex: 1, paddingRight: 8, backgroundColor:"transparent"  }}>
              <ThemedText type ="normal" style={{ marginBottom: 2 }}>{t('serviceCreationForm.serviceMandatory')}</ThemedText>
              <ThemedText type = "caption" intensity ="light">
                {t('serviceCreationForm.serviceMandatoryDesc')}
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
            <ThemedView style={{ flex: 1, paddingRight: 8, backgroundColor:"transparent" }}>
              <ThemedText type ="normal" style={{ marginBottom: 2 }}>{t('serviceCreationForm.serviceOptional')}</ThemedText>
              <ThemedText type ="caption" intensity ="light">
                {t('serviceCreationForm.serviceOptionalDesc')}
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
          {t('serviceCreationForm.tagsLabel')}
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
          placeholder={t('serviceCreationForm.tagsPlaceholder')}
          onSubmitEditing={(e) => {
            if (e.nativeEvent.text.trim()) {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              addTag(e.nativeEvent.text.trim());
            }
          }}
          style={inputStyle}
          placeholderTextColor={theme.text + '80'}

        
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep5 = () => (
    <ThemedView style={{ gap: 12 }}>
      <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4}}>
        {t('serviceCreationForm.step5Title')}
      </ThemedText>

      <ThemedView>
        <ThemedText type="normal" intensity="light" style={{marginBottom: 6 }}>
          {t('serviceCreationForm.zonesLabel')}
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
          {t('serviceCreationForm.weeklyScheduleLabel')}
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
          {t('serviceCreationForm.typicalHoursLabel')}
        </ThemedText>
        <TextInput
          value={formData.availability.schedule.hours}
          onChangeText={(value) => updateFormData('availability.schedule.hours', value)}
          placeholder={t('serviceCreationForm.typicalHoursPlaceholder')}
          style={inputStyle}
          placeholderTextColor={theme.text + '80'}

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
              {t('serviceCreationForm.emergencyServiceLabel')}
            </ThemedText>
            <ThemedText type ="caption" intensity ="light" style={{ marginTop: 2 }}>
              {t('serviceCreationForm.emergencyServiceDesc')}
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

  const totalSteps = 5;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop:10 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <ThemedView style={{
        paddingHorizontal: 16,
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
          <ThemedText type ="normaltitle">
            {t('serviceCreationForm.headerCreate')}
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
          {t('serviceCreationForm.stepIndicator', { current: currentStep, total: totalSteps })}
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
              {t('serviceCreationForm.btnPrevious')}
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
                {currentStep === totalSteps ? t('serviceCreationForm.btnCreate') : t('serviceCreationForm.btnNext')}
              </ThemedText>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default ServiceCreationForm;