import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import {
  getServiceMarketplaceService,
  CreateServiceInput,
  ServiceCategory,
  ContractType,
  BillingPeriod
} from '@/services/api/serviceMarketplaceService';

interface ServiceCreationFormProps {
  onClose: () => void;
  onSuccess: (service: any) => void;
}

const ServiceCreationForm: React.FC<ServiceCreationFormProps> = ({ onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<CreateServiceInput>({
    title: '',
    description: '',
    category: ServiceCategory.MAINTENANCE,
    contractTypes: [ContractType.ON_DEMAND],
    pricing: {
      basePrice: 0,
      currency: 'EUR',
      billingPeriod: BillingPeriod.HOURLY,
      discounts: {
        longTerm: 0,
        seasonal: 0,
        bulk: 0
      }
    },
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
    { value: ServiceCategory.SECURITY, label: 'Sécurité', icon: 'security', description: 'Surveillance et sécurité' },
    { value: ServiceCategory.GARDENING, label: 'Jardinage', icon: 'grass', description: 'Entretien espaces verts' },
    { value: ServiceCategory.INSURANCE, label: 'Assurance', icon: 'shield', description: 'Services d\'assurance' },
    { value: ServiceCategory.UTILITIES, label: 'Utilities', icon: 'electrical-services', description: 'Électricité, plomberie' },
    { value: ServiceCategory.WELLNESS, label: 'Bien-être', icon: 'spa', description: 'Services de bien-être' },
    { value: ServiceCategory.EMERGENCY, label: 'Urgence', icon: 'emergency', description: 'Services d\'urgence' },
    { value: ServiceCategory.ECO, label: 'Écologique', icon: 'eco', description: 'Services écologiques' },
    { value: ServiceCategory.TECH, label: 'Technologie', icon: 'computer', description: 'Services technologiques' },
    { value: ServiceCategory.COLLABORATIVE, label: 'Collaboratif', icon: 'people', description: 'Services collaboratifs' }
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
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.contractTypes.length > 0 && formData.pricing.basePrice > 0;
      case 3:
        return formData.requirements.propertyTypes.length > 0;
      case 4:
        return formData.availability.zones.length > 0 && formData.availability.schedule.days.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
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
      const serviceMarketplaceService = getServiceMarketplaceService();
      const newService = await serviceMarketplaceService.createService(formData);

      Alert.alert('Succès', 'Votre service a été créé avec succès !');
      onSuccess(newService);
      onClose();
    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ThemedView style={{ gap: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Informations générales
      </ThemedText>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Titre du service *
        </ThemedText>
        <TextInput
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          placeholder="Ex: Réparation plomberie express"
          style={{
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 16,
            color: theme.onSurface,
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}
        />
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Description détaillée *
        </ThemedText>
        <TextInput
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder="Décrivez votre service, vos compétences, votre expérience..."
          multiline
          numberOfLines={4}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 16,
            color: theme.onSurface,
            borderWidth: 1,
            borderColor: theme.outline + '30',
            textAlignVertical: 'top'
          }}
        />
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Catégorie de service *
        </ThemedText>
        <View style={{ gap: 8 }}>
          {serviceCategories.map((category) => (
            <TouchableOpacity
              key={category.value}
              onPress={() => updateFormData('category', category.value)}
              style={{
                backgroundColor: formData.category === category.value ? theme.primary : theme.surface,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: formData.category === category.value ? theme.primary : theme.outline + '30'
              }}
            >
              <MaterialIcons
                name={category.icon as any}
                size={24}
                color={formData.category === category.value ? 'white' : theme.onSurface}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={{
                  color: formData.category === category.value ? 'white' : theme.onSurface,
                  fontWeight: '600',
                  fontSize: 16
                }}>
                  {category.label}
                </ThemedText>
                <ThemedText style={{
                  color: formData.category === category.value ? 'rgba(255,255,255,0.8)' : theme.onSurface + '60',
                  fontSize: 12,
                  marginTop: 2
                }}>
                  {category.description}
                </ThemedText>
              </View>
              {formData.category === category.value && (
                <MaterialIcons name="check-circle" size={20} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>
    </ThemedView>
  );

  const renderStep2 = () => (
    <ThemedView style={{ gap: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Tarification et types de contrat
      </ThemedText>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Prix de base (€) *
        </ThemedText>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TextInput
            value={formData.pricing.basePrice.toString()}
            onChangeText={(value) => updateFormData('pricing.basePrice', parseFloat(value) || 0)}
            keyboardType="numeric"
            placeholder="50"
            style={{
              flex: 1,
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 16,
              color: theme.onSurface,
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
          />
          <View style={{
            backgroundColor: theme.surfaceVariant,
            borderRadius: 12,
            padding: 16,
            justifyContent: 'center',
            minWidth: 60
          }}>
            <ThemedText style={{ textAlign: 'center', fontWeight: '600' }}>
              EUR
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Période de facturation
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {billingPeriods.map((period) => (
            <TouchableOpacity
              key={period.value}
              onPress={() => updateFormData('pricing.billingPeriod', period.value)}
              style={{
                backgroundColor: formData.pricing.billingPeriod === period.value ? theme.primary : theme.surface,
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                minWidth: 100,
                borderWidth: 1,
                borderColor: formData.pricing.billingPeriod === period.value ? theme.primary : theme.outline + '30'
              }}
            >
              <MaterialIcons
                name={period.icon as any}
                size={20}
                color={formData.pricing.billingPeriod === period.value ? 'white' : theme.onSurface}
              />
              <ThemedText style={{
                color: formData.pricing.billingPeriod === period.value ? 'white' : theme.onSurface,
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
                textAlign: 'center'
              }}>
                {period.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Types de contrat acceptés *
        </ThemedText>
        <View style={{ gap: 8 }}>
          {contractTypesList.map((contract) => (
            <TouchableOpacity
              key={contract.value}
              onPress={() => toggleContractType(contract.value)}
              style={{
                backgroundColor: formData.contractTypes.includes(contract.value) ? theme.primary + '20' : theme.surface,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: formData.contractTypes.includes(contract.value) ? theme.primary : theme.outline + '30'
              }}
            >
              <MaterialIcons
                name={formData.contractTypes.includes(contract.value) ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={formData.contractTypes.includes(contract.value) ? theme.primary : theme.onSurface + '60'}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '600', fontSize: 16 }}>
                  {contract.label}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60', marginTop: 2 }}>
                  {contract.description}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Remises (optionnel)
        </ThemedText>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ThemedText style={{ flex: 1, fontSize: 14 }}>Remise long terme (%)</ThemedText>
            <TextInput
              value={formData.pricing.discounts?.longTerm?.toString() || ''}
              onChangeText={(value) => updateFormData('pricing.discounts.longTerm', parseInt(value) || 0)}
              keyboardType="numeric"
              placeholder="10"
              style={{
                backgroundColor: theme.surface,
                borderRadius: 8,
                padding: 12,
                width: 80,
                textAlign: 'center',
                borderWidth: 1,
                borderColor: theme.outline + '30'
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ThemedText style={{ flex: 1, fontSize: 14 }}>Remise saisonnière (%)</ThemedText>
            <TextInput
              value={formData.pricing.discounts?.seasonal?.toString() || ''}
              onChangeText={(value) => updateFormData('pricing.discounts.seasonal', parseInt(value) || 0)}
              keyboardType="numeric"
              placeholder="5"
              style={{
                backgroundColor: theme.surface,
                borderRadius: 8,
                padding: 12,
                width: 80,
                textAlign: 'center',
                borderWidth: 1,
                borderColor: theme.outline + '30'
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ThemedText style={{ flex: 1, fontSize: 14 }}>Remise quantité (%)</ThemedText>
            <TextInput
              value={formData.pricing.discounts?.bulk?.toString() || ''}
              onChangeText={(value) => updateFormData('pricing.discounts.bulk', parseInt(value) || 0)}
              keyboardType="numeric"
              placeholder="15"
              style={{
                backgroundColor: theme.surface,
                borderRadius: 8,
                padding: 12,
                width: 80,
                textAlign: 'center',
                borderWidth: 1,
                borderColor: theme.outline + '30'
              }}
            />
          </View>
        </View>
      </ThemedView>
    </ThemedView>
  );

  const renderStep3 = () => (
    <ThemedView style={{ gap: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Exigences et compatibilité
      </ThemedText>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Types de propriétés compatibles *
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => togglePropertyType(type)}
              style={{
                backgroundColor: formData.requirements.propertyTypes.includes(type) ? theme.primary : theme.surface,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: formData.requirements.propertyTypes.includes(type) ? theme.primary : theme.outline + '30'
              }}
            >
              <ThemedText style={{
                color: formData.requirements.propertyTypes.includes(type) ? 'white' : theme.onSurface,
                fontSize: 12,
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {type}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Nature du service
        </ThemedText>
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              updateFormData('requirements.isMandatory', !formData.requirements.isMandatory);
              if (!formData.requirements.isMandatory) {
                updateFormData('requirements.isOptional', false);
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
          >
            <MaterialIcons
              name={formData.requirements.isMandatory ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={formData.requirements.isMandatory ? theme.primary : theme.onSurface + '60'}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={{ fontWeight: '600' }}>
                Service obligatoire
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
                Ce service est requis pour tous les biens
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              updateFormData('requirements.isOptional', !formData.requirements.isOptional);
              if (!formData.requirements.isOptional) {
                updateFormData('requirements.isMandatory', false);
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
          >
            <MaterialIcons
              name={formData.requirements.isOptional ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={formData.requirements.isOptional ? theme.primary : theme.onSurface + '60'}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={{ fontWeight: '600' }}>
                Service optionnel
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
                Service proposé en option
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Mots-clés du service
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {formData.tags?.map((tag, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.primary + '20',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <ThemedText style={{ fontSize: 12, color: theme.primary, fontWeight: '600' }}>
                {tag}
              </ThemedText>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                style={{ marginLeft: 6 }}
              >
                <MaterialIcons name="close" size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TextInput
          placeholder="Ajouter des mots-clés (appuyez sur Entrée)"
          onSubmitEditing={(e) => {
            addTag(e.nativeEvent.text);
            e.target.clear();
          }}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 16,
            color: theme.onSurface,
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep4 = () => (
    <ThemedView style={{ gap: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Disponibilité et zones d'intervention
      </ThemedText>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Zones d'intervention *
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {predefinedZones.map((zone) => (
            <TouchableOpacity
              key={zone}
              onPress={() => toggleZone(zone)}
              style={{
                backgroundColor: formData.availability.zones.includes(zone) ? theme.primary : theme.surface,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: formData.availability.zones.includes(zone) ? theme.primary : theme.outline + '30'
              }}
            >
              <ThemedText style={{
                color: formData.availability.zones.includes(zone) ? 'white' : theme.onSurface,
                fontSize: 12,
                fontWeight: '600'
              }}>
                {zone}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Jours de disponibilité *
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {weekDays.map((day) => (
            <TouchableOpacity
              key={day.value}
              onPress={() => toggleDay(day.value)}
              style={{
                backgroundColor: formData.availability.schedule.days.includes(day.value) ? theme.primary : theme.surface,
                borderRadius: 12,
                padding: 12,
                minWidth: 50,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: formData.availability.schedule.days.includes(day.value) ? theme.primary : theme.outline + '30'
              }}
            >
              <ThemedText style={{
                color: formData.availability.schedule.days.includes(day.value) ? 'white' : theme.onSurface,
                fontSize: 12,
                fontWeight: '600'
              }}>
                {day.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Horaires de disponibilité
        </ThemedText>
        <TextInput
          value={formData.availability.schedule.hours}
          onChangeText={(value) => updateFormData('availability.schedule.hours', value)}
          placeholder="Ex: 9h-17h, 24h/24, Sur rendez-vous..."
          style={{
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 16,
            color: theme.onSurface,
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}
        />
      </ThemedView>

      <ThemedView>
        <TouchableOpacity
          onPress={() => updateFormData('availability.isEmergency', !formData.availability.isEmergency)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.outline + '30'
          }}
        >
          <MaterialIcons
            name={formData.availability.isEmergency ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={formData.availability.isEmergency ? theme.primary : theme.onSurface + '60'}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <ThemedText style={{ fontWeight: '600' }}>
              Service d'urgence
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
              Disponible pour les interventions d'urgence 24h/24
            </ThemedText>
          </View>
          {formData.availability.isEmergency && (
            <MaterialCommunityIcons name="flash" size={20} color={theme.warning} />
          )}
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const totalSteps = 4;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header avec progress */}
      <ThemedView style={{
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.outline + '20'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <ThemedText style={{ fontSize: 16, fontWeight: '700' }}>
            Créer un service
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress bar */}
        <View style={{
          backgroundColor: theme.surfaceVariant,
          borderRadius: 8,
          height: 6,
          marginBottom: 8
        }}>
          <View style={{
            backgroundColor: theme.success,
            borderRadius: 8,
            height: 6,
            width: `${(currentStep / totalSteps) * 100}%`
          }} />
        </View>
        <ThemedText style={{ fontSize: 12, color: theme.onSurface + '60' }}>
          Étape {currentStep} sur {totalSteps}
        </ThemedText>
      </ThemedView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <MotiView
          key={currentStep}
          from={{ opacity: 0, translateX: 50 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'spring' }}
          style={{ padding: 20 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </MotiView>
      </ScrollView>

      {/* Footer avec boutons */}
      <ThemedView style={{
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: theme.outline + '20',
        flexDirection: 'row',
        gap: 12
      }}>
        {currentStep > 1 && (
          <TouchableOpacity
            onPress={() => setCurrentStep(prev => prev - 1)}
            style={{
              flex: 1,
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.outline + '30'
            }}
          >
            <ThemedText style={{ fontWeight: '600' }}>
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
            colors={[theme.success, theme.success + '80']}
            style={{
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              opacity: loading || !validateStep() ? 0.6 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator size={24} color="white" />
            ) : (
              <ThemedText style={{ color: 'white', fontWeight: '700' }}>
                {currentStep === totalSteps ? 'Créer le service' : 'Suivant'}
              </ThemedText>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
};

export default ServiceCreationForm;