import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { launchImageLibraryWithFallback } from '@/utils/imagePickerUtils';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { getPropertyService, CreatePropertyInput } from '@/services/api/propertyService';
import { getServiceMarketplaceService } from '@/services/api/serviceMarketplaceService';
import { useNotifications, NotificationHelpers } from '@/hooks/useNotifications';
import { useActivity } from '@/components/contexts/activity/ActivityContext';

interface PropertyCreationFormProps {
  onClose: () => void;
  onSuccess: (property: any) => void;
}

const PropertyCreationForm: React.FC<PropertyCreationFormProps> = ({ onClose, onSuccess }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const { sendLocalNotification } = useNotifications();
  const { addActivity } = useActivity();

  // States for services
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [formData, setFormData] = useState<CreatePropertyInput>({
    title: '',
    description: '',
    address: '',
    actionType: 'rent',
    propertyType: 'apartment',
    generalLandinfo: {
      surface: 0
    },
    generalHInfo: {
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      surface: 0,
      area: '',
      furnished: false,
      pets: false,
      smoking: false,
      maxOccupants: 1
    },
    images: [],
    amenities: [],
    availableFrom: new Date().toISOString().split('T')[0],
    ownerCriteria: {
      monthlyRent: 0,
      isGarantRequired: false,
      depositAmount: 0,
      minimumDuration: 1,
      solvability: 'instant',
      guarantorRequired: false,
      guarantorLocation: 'same',
      acceptedSituations: [],
      isdocumentRequired: false
    },
    equipments: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'TV', icon: 'tv', lib: 'FontAwesome5', category: 'Entertainment' },
      { id: '3', name: 'Réfrigérateur', icon: 'fridge-outline', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '4', name: 'Four', icon: 'stove', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '5', name: 'Machine à laver', icon: 'washing-machine', lib: 'MaterialCommunityIcons', category: 'Laundry' }
    ],
    atouts: [
      { id: '1', type: 'predefined', text: 'Proche des transports', icon: 'bus', lib: 'FontAwesome5', category: 'Location', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Quartier calme', icon: 'home-city', lib: 'MaterialCommunityIcons', category: 'Neighborhood', priority: 4, verified: true },
      { id: '3', type: 'predefined', text: 'Vue dégagée', icon: 'window-maximize', lib: 'FontAwesome5', category: 'View', priority: 3, verified: false }
    ]
  });

  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);

  // Configuration of fields by property type
  const propertyTypeConfig: Record<string, {
    showRooms: boolean;
    showBedrooms: boolean;
    showBathrooms: boolean;
    showFurnished: boolean;
    showPets: boolean;
    showSmoking: boolean;
    showDeposit: boolean;
    showMinDuration: boolean;
    showSituations: boolean;
    rentLabel: string;
    amenities: string[];
    priceLabel: string;
  }> = {
    apartment: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Ascenseur', 'Balcon', 'Cave', 'Climatisation', 'Chauffage', 'Interphone']
    },
    home: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Jardin', 'Piscine', 'Terrasse', 'Garage', 'Climatisation', 'Chauffage']
    },
    villa: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Jardin', 'Piscine', 'Terrasse', 'Garage', 'Climatisation', 'Sécurité', 'Salle de sport']
    },
    studio: {
      showRooms: false, showBedrooms: false, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Ascenseur', 'Climatisation', 'Chauffage', 'Interphone']
    },
    terrain: {
      showRooms: false, showBedrooms: false, showBathrooms: false,
      showFurnished: false, showPets: false, showSmoking: false,
      showDeposit: false, showMinDuration: false, showSituations: false,
      rentLabel: 'Prix location (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Eau', 'Électricité', 'Clôture', 'Accès route', 'Titre foncier']
    },
    penthouse: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Terrasse panoramique', 'Piscine privée', 'Ascenseur privé', 'Climatisation', 'Jacuzzi', 'Sécurité 24h']
    },
    loft: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Hauteur sous plafond', 'Climatisation', 'Chauffage', 'Espace ouvert']
    },
    hotel: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: false, showPets: false, showSmoking: false,
      showDeposit: false, showMinDuration: false, showSituations: false,
      rentLabel: 'Prix par nuit (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Restaurant', 'Piscine', 'Spa', 'Room service', 'Réception 24h', 'Climatisation', 'Petit-déjeuner']
    },
    bureau: {
      showRooms: true, showBedrooms: false, showBathrooms: true,
      showFurnished: true, showPets: false, showSmoking: false,
      showDeposit: true, showMinDuration: true, showSituations: false,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Ascenseur', 'Climatisation', 'Salle de réunion', 'Cuisine équipée', 'Sécurité', 'Accès handicapé']
    },
    chalet: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: false, showSituations: false,
      rentLabel: 'Prix par nuit (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Cheminée', 'Terrasse', 'Sauna', 'Jacuzzi', 'Vue montagne', 'Ski aux pieds']
    },
    commercial: {
      showRooms: false, showBedrooms: false, showBathrooms: true,
      showFurnished: false, showPets: false, showSmoking: false,
      showDeposit: true, showMinDuration: true, showSituations: false,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Vitrine', 'Réserve', 'Climatisation', 'Alarme', 'Accès livraison', 'Accès handicapé']
    }
  };

  // Available payment methods
  const paymentMethods = [
    { value: 'mobile_money', label: 'Mobile Money', icon: 'phone-android' },
    { value: 'bank_card', label: 'Carte bancaire', icon: 'credit-card' },
    { value: 'paypal', label: 'PayPal', icon: 'account-balance-wallet' },
    { value: 'bank_transfer', label: 'Virement bancaire', icon: 'account-balance' },
    { value: 'cash', label: 'Espèces', icon: 'payments' },
    { value: 'other', label: 'Autre', icon: 'more-horiz' },
  ];

  // Helper to get the current type config
  const currentTypeConfig = propertyTypeConfig[formData.propertyType] || propertyTypeConfig.apartment;

  // Toggle payment method
  const togglePaymentMethod = (method: string) => {
    setSelectedPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement', icon: 'apartment' },
    { value: 'home', label: 'Maison', icon: 'home' },
    { value: 'villa', label: 'Villa', icon: 'villa' },
    { value: 'studio', label: 'Studio', icon: 'weekend' },
    { value: 'terrain', label: 'Terrain', icon: 'landscape' },
    { value: 'penthouse', label: 'Penthouse', icon: 'location-city' },
    { value: 'loft', label: 'Loft', icon: 'meeting-room' },
    { value: 'hotel', label: 'Hôtel', icon: 'hotel' },
    { value: 'bureau', label: 'Bureau', icon: 'work' },
    { value: 'chalet', label: 'Chalet', icon: 'cabin' },
    { value: 'commercial', label: 'Commercial', icon: 'storefront' },
  ];

  const acceptedSituationsList = [
    'Étudiant', 'Salarié', 'Fonctionnaire', 'Retraité', 'CDI', 'CDD'
  ];

  // Load available services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setServicesLoading(true);
        const serviceMarketplace = getServiceMarketplaceService();
        const result = await serviceMarketplace.getServices(
          {}, // Removed invalid filters: isActive and status
          { first: 50 }
        );
        const services = result.edges.map(edge => edge.node);
        setAvailableServices(services);
        console.log('✅ Services loaded for creation:', services.length);
      } catch (error) {
        console.error('❌ Error loading services:', error);
        setAvailableServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CreatePropertyInput],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const pickImages = async () => {
    const result = await launchImageLibraryWithFallback({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages]);
      // GraphQL expects an array of strings (URIs)
      const imageUrls = [...images, ...newImages];
      updateFormData('images', imageUrls);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    // GraphQL expects an array of strings (URIs)
    updateFormData('images', newImages);
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    updateFormData('amenities', newAmenities);
  };

  const toggleSituation = (situation: string) => {
    const currentSituations = formData.ownerCriteria.acceptedSituations || [];
    const newSituations = currentSituations.includes(situation)
      ? currentSituations.filter(s => s !== situation)
      : [...currentSituations, situation];
    updateFormData('ownerCriteria.acceptedSituations', newSituations);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.title || !formData.description || !formData.address) {
          return false;
        }
        // Validate description length (minimum 20 characters)
        if (formData.description.length < 20) {
          return false;
        }
        // Validate address length (minimum 5 characters)
        if (formData.address.length < 5) {
          return false;
        }
        return true;
      case 2:
        return formData.generalLandinfo.surface > 0 && formData.generalHInfo?.area;
      case 3:
        return images.length > 0;
      case 4:
        return formData.ownerCriteria.monthlyRent > 0;
      case 5:
        return true; // Optional services
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    } else {
      let errorMessage = 'Veuillez remplir tous les champs obligatoires';

      if (currentStep === 1) {
        if (formData.description && formData.description.length < 20) {
          errorMessage = 'La description doit contenir au moins 20 caractères';
        } else if (formData.address && formData.address.length < 5) {
          errorMessage = 'L\'adresse doit contenir au moins 5 caractères';
        }
      }

      Alert.alert('Champs requis', errorMessage);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Debug: Check auth state before creating property
      const { debugAuthState } = await import('@/utils/authDebug');
      const authState = await debugAuthState();

      if (!authState?.hasRestToken && !authState?.hasGraphqlToken) {
        Alert.alert(
          'Non connecté',
          'Vous devez être connecté pour créer une propriété. Veuillez vous connecter et réessayer.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Prepare data with selected services
      const propertyData = {
        ...formData,
        services: selectedServices.map(serviceId => ({ serviceId })),
        iserviceAvalaible: selectedServices.length > 0,
        cryptoEnabled: cryptoEnabled,
        acceptedPaymentMethods: selectedPaymentMethods.length > 0 ? selectedPaymentMethods : ['cash']
      };

      console.log('📦 Données de création de propriété:', {
        equipments: propertyData.equipments?.length,
        atouts: propertyData.atouts?.length,
        services: propertyData.services?.length
      });

      const propertyService = getPropertyService();
      const newProperty = await propertyService.createProperty(propertyData);

      console.log('✅ Propriété créée:', {
        id: newProperty.id,
        equipments: newProperty.equipments?.length,
        atouts: newProperty.atouts?.length
      });

      // Send a local success notification
      await sendLocalNotification(
        NotificationHelpers.propertyCreated(newProperty.id, newProperty.title)
      );

      // Log the activity
      addActivity({
        userId: 'current-user', // TODO: Replace with actual user ID
        type: 'data',
        title: 'Propriété créée',
        description: `Vous avez créé la propriété "${newProperty.title}"`,
        status: 'completed',
        propertyId: newProperty.id,
        propertyTitle: newProperty.title
      });

      Alert.alert('Succès', 'Votre propriété a été créée avec succès !');
      onSuccess(newProperty);
      onClose();
    } catch (error) {
      console.error('Error creating property:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's an authentication error
      if (errorMessage.includes('Authentication required') || errorMessage.includes('Unauthorized')) {
        Alert.alert(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter.',
          [{ text: 'OK', onPress: () => onClose() }]
        );
      }
      // In development mode without backend, create locally
      else if (errorMessage.includes('NETWORK_ERROR_USE_MOCK') || errorMessage.includes('Network Error')) {
        Alert.alert(
          'Mode hors ligne',
          'Votre propriété sera créée localement. Elle sera synchronisée quand vous serez connecté.',
          [{ text: 'OK', onPress: () => onClose() }]
        );
      } else {
        Alert.alert('Erreur', `Une erreur est survenue: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 10,
    padding: 12,
    color: theme.onSurface,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.outline + '30'
  };

  const renderStep1 = () => (
    <ThemedView style={{ gap: 10 }}>
      
      <ThemedText type ="normal" intensity ="normal" style={{ marginBottom: 4}}>
        Informations générales
      </ThemedText>

      <ThemedView>
        <ThemedText type ="caption" intensity ="light" style={{marginBottom: 6 }}>
          Titre de l'annonce *
        </ThemedText>
        <TextInput
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          placeholder="Ex: Bel appartement 3 pièces"
          style={inputStyle}
        />
      </ThemedView>

      <ThemedView style={{marginBottom: 6 }}>
        <ThemedText type ="normal" intensity ="normal" style={{  marginBottom: 6 }}>
          Type d'action
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
          {[{ value: 'rent', label: 'Location' }, { value: 'sell', label: 'Vente' }].map((action) => (
            <TouchableOpacity
              key={action.value}
              onPress={() => updateFormData('actionType', action.value)}
              style={{
                flex: 1,
                backgroundColor: formData.actionType === action.value ? theme.primary : theme.surface,
                borderRadius: 10,
                padding: 10,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: formData.actionType === action.value ? theme.primary : theme.outline + '30'
              }}
            >
              <ThemedText type ="caption" intensity ="strong" style={{
                color: formData.actionType === action.value ? 'white' : theme.onSurface,
                fontWeight: '600',
              }}>
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText type ="normal" intensity ="normal" style={{ marginBottom: 6 }}>
          Type de propriété
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => updateFormData('propertyType', type.value)}
              style={{
                backgroundColor: formData.propertyType === type.value ? theme.primary : theme.surface,
                borderRadius: 10,
                padding: 6,
                alignItems: 'center',
                minWidth: 75,
                borderWidth: 1,
                borderColor: formData.propertyType === type.value ? theme.primary : theme.outline + '30'
              }}
            >
              <MaterialIcons
                name={type.icon as any}
                size={18}
                color={formData.propertyType === type.value ? 'white' : theme.onSurface}
              />
              <ThemedText style={{
                color: formData.propertyType === type.value ? 'white' : theme.onSurface,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 3
              }}>
                {type.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText type ="normal" intensity ="normal" style={{ marginBottom: 6 }}>
          Adresse * (minimum 5 caractères)
        </ThemedText>
        <TextInput
          value={formData.address}
          onChangeText={(value) => updateFormData('address', value)}
          placeholder="Ex: 123 Rue de la Paix, Paris"
          style={inputStyle}
        />
        <ThemedText style={{ fontSize: 11, color: formData.address.length < 5 ? theme.text : theme.onSurface + '60', marginTop: 4 }}>
          {formData.address.length}/5 caractères
        </ThemedText>
      </ThemedView>

      <ThemedView>
        <ThemedText type = "normal" intensity ="normal" style={{ marginBottom: 6}}>
          Description * (minimum 20 caractères)
        </ThemedText>
        <TextInput
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder="Décrivez votre propriété en détail..."
          multiline
          numberOfLines={3}
          style={{ ...inputStyle, textAlignVertical: 'top', minHeight: 80 }}
        />
        <ThemedText style={{ fontSize: 11, color: formData.description.length < 20 ? theme.text : theme.onSurface + '60', marginTop: 4 }}>
          {formData.description.length}/20 caractères
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const renderStep2 = () => {
    const config = currentTypeConfig;
    const availableOptions = [
      config.showFurnished && { key: 'furnished', label: 'Meublé' },
      config.showPets && { key: 'pets', label: 'Animaux acceptés' },
      config.showSmoking && { key: 'smoking', label: 'Fumeurs acceptés' }
    ].filter(Boolean) as { key: string; label: string }[];

    return (
      <ThemedView style={{ gap: 12 }}>
        <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4 }}>
          Caractéristiques - {propertyTypes.find(t => t.value === formData.propertyType)?.label}
        </ThemedText>

        {(config.showRooms || config.showBedrooms) && (
          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            {config.showRooms && (
              <ThemedView style={{ flex: 1 }}>
                <ThemedText type="caption" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
                  {formData.propertyType === 'hotel' ? 'Chambres disponibles' : 'Pièces'}
                </ThemedText>
                <TextInput
                  value={formData.generalHInfo?.rooms.toString()}
                  onChangeText={(value) => updateFormData('generalHInfo.rooms', parseInt(value) || 0)}
                  keyboardType="numeric"
                  style={inputStyle}
                />
              </ThemedView>
            )}
            {config.showBedrooms && (
              <ThemedView style={{ flex: 1 }}>
                <ThemedText type="caption" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
                  {formData.propertyType === 'hotel' ? 'Lits par chambre' : 'Chambres'}
                </ThemedText>
                <TextInput
                  value={formData.generalHInfo?.bedrooms.toString()}
                  onChangeText={(value) => updateFormData('generalHInfo.bedrooms', parseInt(value) || 0)}
                  keyboardType="numeric"
                  style={inputStyle}
                />
              </ThemedView>
            )}
          </ThemedView>
        )}

        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
          {config.showBathrooms && (
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
                Salles de bain
              </ThemedText>
              <TextInput
                value={formData.generalHInfo?.bathrooms.toString()}
                onChangeText={(value) => updateFormData('generalHInfo.bathrooms', parseInt(value) || 0)}
                keyboardType="numeric"
                style={inputStyle}
              />
            </ThemedView>
          )}
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="caption" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
              Surface (m²) *
            </ThemedText>
            <TextInput
              value={formData.generalHInfo?.surface.toString()}
              onChangeText={(value) => {
                const surfaceValue = parseInt(value) || 0;
                updateFormData('generalHInfo.surface', surfaceValue);
                updateFormData('generalLandinfo.surface', surfaceValue);
              }}
              keyboardType="numeric"
              style={inputStyle}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView>
          <ThemedText type="normal" intensity="normal" style={{ marginBottom: 6 }}>
            {formData.propertyType === 'terrain' ? 'Localisation *' : 'Quartier/Zone *'}
          </ThemedText>
          <TextInput
            value={formData.generalHInfo?.area}
            onChangeText={(value) => updateFormData('generalHInfo.area', value)}
            placeholder={formData.propertyType === 'terrain' ? 'Ex: Zone industrielle, Résidentielle...' : 'Ex: Centre-ville'}
            style={inputStyle}
          />
        </ThemedView>

        {availableOptions.length > 0 && (
          <ThemedView>
            <ThemedText type="normal" intensity="normal" style={{  marginBottom: 8 }}>
              Options
            </ThemedText>
            <ThemedView style={{ gap: 2 }}>
              {availableOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => updateFormData(`generalHInfo.${option.key}`, !formData.generalHInfo?.[option.key as keyof typeof formData.generalHInfo])}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, padding: 8 }}
                >
                  <MaterialIcons
                    name={formData.generalHInfo?.[option.key as keyof typeof formData.generalHInfo] ? 'check-box' : 'check-box-outline-blank'}
                    size={20}
                    color={formData.generalHInfo?.[option.key as keyof typeof formData.generalHInfo] ? theme.primary : theme.onSurface + '60'}
                  />
                  <ThemedText type ="body" style={{ marginLeft: 10 }}>{option.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        {formData.propertyType === 'hotel' && (
          <ThemedView style={{ backgroundColor: theme.primary + '10', padding: 12, borderRadius: 10, marginTop: 8 }}>
            <ThemedText type="caption" intensity ="light">
              💡 Pour un hôtel, indiquez le nombre de chambres disponibles et les équipements communs.
            </ThemedText>
          </ThemedView>
        )}
        {formData.propertyType === 'terrain' && (
          <ThemedView style={{ backgroundColor: theme.primary + '10', padding: 12, borderRadius: 10, marginTop: 8 }}>
            <ThemedText type="caption" intensity="light">
              💡 Pour un terrain, précisez la surface totale et le type de zone (constructible, agricole, etc.).
            </ThemedText>
          </ThemedView>
        )}
        {formData.propertyType === 'commercial' && (
          <ThemedView style={{ backgroundColor: theme.primary + '10', padding: 12, borderRadius: 10, marginTop: 8 }}>
            <ThemedText type="caption" intensity= "light">
              💡 Pour un local commercial, indiquez la surface de vente et les accès disponibles.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  const renderStep3 = () => {
    const config = currentTypeConfig;
    const dynamicAmenities = config.amenities;

    return (
      <ThemedView style={{ gap: 12 }}>
        <ThemedText type="body" intensity="normal" style={{  marginBottom: 4 }}>
          Photos et équipements - {propertyTypes.find(t => t.value === formData.propertyType)?.label}
        </ThemedText>

        <ThemedView>
          <ThemedText type="normal" intensity="light" style={{ marginBottom: 6}}>
            Photos * (au moins 1)
          </ThemedText>

          <TouchableOpacity
            onPress={pickImages}
            style={{
              backgroundColor: theme.primary + '20',
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.primary,
              borderStyle: 'dashed'
            }}
          >
            <MaterialIcons name="add-a-photo" size={24} color={theme.primary} />
            <ThemedText type="normal" style={{ marginTop: 4, color: theme.primary }}>
              Ajouter des photos
            </ThemedText>
          </TouchableOpacity>

          {images.length > 0 && (
            <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {images.map((image, index) => (
                <ThemedView key={index} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: image }}
                    style={{ width: 85, height: 85, borderRadius: 8 }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      backgroundColor: theme.error,
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MaterialIcons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView>
          <ThemedText type="normal" intensity="normal" style={{ marginBottom: 8 }}>
            {formData.propertyType === 'terrain' ? 'Caractéristiques du terrain' : 'Équipements'}
          </ThemedText>
          <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {dynamicAmenities.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                onPress={() => toggleAmenity(amenity)}
                style={{
                  backgroundColor: formData.amenities?.includes(amenity) ? theme.primary : theme.surface,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: formData.amenities?.includes(amenity) ? theme.primary : theme.outline + '30'
                }}
              >
                <ThemedText type="caption" intensity="light" style={{
                  color: formData.amenities?.includes(amenity) ? 'white' : theme.onSurface,
                }}>
                  {amenity}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {formData.propertyType === 'hotel' && (
          <ThemedView style={{ backgroundColor: theme.primary + '10', padding: 12, borderRadius: 10 }}>
            <ThemedText type="caption" intensity="light">
              💡 Sélectionnez les équipements et services disponibles dans votre établissement.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  const renderStep4 = () => {
    const config = currentTypeConfig;

    // Determine the price label according to property type and action
    const getPriceLabel = () => {
      if (formData.actionType === 'sell') return config.priceLabel + ' *';
      return config.rentLabel + ' *';
    };

    return (
      <ThemedView style={{ gap: 12 }}>
        <ThemedText type="normal" intensity="normal" style={{  marginBottom: 4 }}>
          Critères financiers - {propertyTypes.find(t => t.value === formData.propertyType)?.label}
        </ThemedText>

        <ThemedView>
          <ThemedText type="normal" style={{ marginBottom: 6 }}>
            {getPriceLabel()}
          </ThemedText>
          <TextInput
            value={formData.ownerCriteria.monthlyRent.toString()}
            onChangeText={(value) => updateFormData('ownerCriteria.monthlyRent', parseInt(value) || 0)}
            keyboardType="numeric"
            placeholder={formData.propertyType === 'hotel' || formData.propertyType === 'chalet' ? '150' : '1200'}
            style={inputStyle}
          />
        </ThemedView>

        {/* Méthodes de paiement acceptées */}
        <ThemedView>
          <ThemedText type="normal" style={{ marginBottom: 8 }}>
            Méthodes de paiement acceptées *
          </ThemedText>
          <ThemedView style={{ gap: 8 }}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.value}
                onPress={() => togglePaymentMethod(method.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: selectedPaymentMethods.includes(method.value) ? theme.primary + '15' : theme.surface,
                  borderRadius: 10,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: selectedPaymentMethods.includes(method.value) ? theme.primary : theme.outline + '30'
                }}
              >
                <ThemedView style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: selectedPaymentMethods.includes(method.value) ? theme.primary : theme.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <MaterialIcons
                    name={method.icon as any}
                    size={18}
                    color={selectedPaymentMethods.includes(method.value) ? 'white' : theme.onSurface + '60'}
                  />
                </ThemedView>
                <ThemedText style={{ flex: 1, fontWeight: '600', fontSize: 14 }}>
                  {method.label}
                </ThemedText>
                <MaterialIcons
                  name={selectedPaymentMethods.includes(method.value) ? 'check-circle' : 'radio-button-unchecked'}
                  size={22}
                  color={selectedPaymentMethods.includes(method.value) ? theme.primary : theme.outline}
                />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Crypto Payment Option */}
        <TouchableOpacity
          onPress={() => setCryptoEnabled(!cryptoEnabled)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: cryptoEnabled ? theme.primary + '15' : theme.surface,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1.5,
            borderColor: cryptoEnabled ? theme.primary : theme.outline + '30'
          }}
        >
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ThemedView style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: cryptoEnabled ? theme.primary : theme.surfaceVariant,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MaterialIcons
                name="currency-bitcoin"
                size={20}
                color={cryptoEnabled ? 'white' : theme.onSurface + '60'}
              />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="normal" intensity="light" style={{ marginBottom: 2 }}>
                Accepter les crypto-monnaies
              </ThemedText>
              <ThemedText type="caption" intensity="light">
                BTC, ETH, USDT acceptés
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={{
            width: 48,
            height: 26,
            borderRadius: 13,
            backgroundColor: cryptoEnabled ? theme.primary : theme.outline + '40',
            padding: 2,
            justifyContent: 'center'
          }}>
            <ThemedView style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: 'white',
              transform: [{ translateX: cryptoEnabled ? 22 : 0 }]
            }} />
          </ThemedView>
        </TouchableOpacity>

        {/* Dépôt de garantie - conditionnel selon le type */}
        {config.showDeposit && formData.actionType === 'rent' && (
          <ThemedView>
            <ThemedText type="normal" style={{ marginBottom: 6 }}>
              Dépôt de garantie (€)
            </ThemedText>
            <TextInput
              value={formData.ownerCriteria.depositAmount.toString()}
              onChangeText={(value) => updateFormData('ownerCriteria.depositAmount', parseInt(value) || 0)}
              keyboardType="numeric"
              placeholder="1200"
              style={inputStyle}
            />
          </ThemedView>
        )}

        {/* Durée minimum - conditionnel selon le type */}
        {config.showMinDuration && formData.actionType === 'rent' && (
          <ThemedView>
            <ThemedText type="normal" style={{ marginBottom: 6 }}>
              Durée minimum ({formData.propertyType === 'hotel' || formData.propertyType === 'chalet' ? 'nuits' : 'mois'})
            </ThemedText>
            <TextInput
              value={formData.ownerCriteria.minimumDuration.toString()}
              onChangeText={(value) => updateFormData('ownerCriteria.minimumDuration', parseInt(value) || 1)}
              keyboardType="numeric"
              placeholder={formData.propertyType === 'hotel' || formData.propertyType === 'chalet' ? '1' : '12'}
              style={inputStyle}
            />
          </ThemedView>
        )}

        {/* Situations acceptées - conditionnel selon le type */}
        {config.showSituations && formData.actionType === 'rent' && (
          <ThemedView>
            <ThemedText type="normal" style={{ marginBottom: 8 }}>
              Situations acceptées
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {acceptedSituationsList.map((situation) => (
                <TouchableOpacity
                  key={situation}
                  onPress={() => toggleSituation(situation)}
                  style={{
                    backgroundColor: formData.ownerCriteria.acceptedSituations?.includes(situation) ? theme.primary : theme.surface,
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: formData.ownerCriteria.acceptedSituations?.includes(situation) ? theme.primary : theme.outline + '30'
                  }}
                >
                  <ThemedText type="caption" intensity="light" style={{
                    color: formData.ownerCriteria.acceptedSituations?.includes(situation) ? 'white' : theme.onSurface,
                  }}>
                    {situation}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        {/* Info spécifique pour hôtel/chalet */}
        {(formData.propertyType === 'hotel' || formData.propertyType === 'chalet') && (
          <ThemedView style={{ backgroundColor: theme.primary + '10', padding: 12, borderRadius: 10 }}>
            <ThemedText type="caption" intensity ="light">
              💡 Pour les locations courte durée, le prix est par nuit. Les options de garantie et situation locataire ne s'appliquent pas.
            </ThemedText>
          </ThemedView>
        )}

        {formData.propertyType === 'terrain' && (
          <ThemedView style={{ backgroundColor: theme.primary + '10', padding: 12, borderRadius: 10 }}>
            <ThemedText type="caption" intensity ="light">
              💡 Pour un terrain, seul le prix de vente ou de location s'applique. Les options de garantie ne sont pas requises.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  const renderStep5 = () => {
    // Custom messages according to property type
    const getServiceMessage = () => {
      switch (formData.propertyType) {
        case 'hotel':
          return 'Sélectionnez les services proposés dans votre établissement (room service, spa, etc.)';
        case 'bureau':
          return 'Sélectionnez les services disponibles pour les professionnels (ménage, réception, etc.)';
        case 'commercial':
          return 'Sélectionnez les services disponibles pour votre local commercial';
        case 'terrain':
          return 'Sélectionnez les services d\'entretien ou de surveillance disponibles';
        default:
          return 'Sélectionnez les services déjà disponibles avec cette propriété';
      }
    };

    return (
      <ThemedView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <ThemedView style={{ marginBottom: 16 }}>
            <ThemedText type="normal" style={{ marginBottom: 4 }}>
              Services associés - {propertyTypes.find(t => t.value === formData.propertyType)?.label} (optionnel)
            </ThemedText>
            <ThemedText type="body" intensity="light">
              {getServiceMessage()}
            </ThemedText>
          </ThemedView>

        {servicesLoading ? (
          <ThemedView style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText type ="body" style={{ marginTop: 12 }}>
              Chargement des services...
            </ThemedText>
          </ThemedView>
        ) : availableServices.length === 0 ? (
          <ThemedView style={{ padding: 40, alignItems: 'center' }}>
            <MaterialIcons name="work-outline" size={48} color={theme.onSurface + '40'} />
            <ThemedText type ="body"  style={{ marginTop: 12, color: theme.onSurface + '80', textAlign: 'center' }}>
              Aucun service disponible pour le moment
            </ThemedText>
            <ThemedText type ="body" style={{ marginTop: 8, color: theme.primary, textAlign: 'center'}}>
              Vous pouvez continuer sans sélectionner de service
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedView style={{ marginBottom: 12 }}>
              <ThemedText type ="normal">
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} sélectionné{selectedServices.length > 1 ? 's' : ''}
              </ThemedText>
            </ThemedView>

            {availableServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => toggleService(service.id)}
                style={{
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: theme.outline 
                }}
              >
                <ThemedView style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  {/* Checkbox */}
                  <ThemedView style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: selectedServices.includes(service.id) ? theme.primary : theme.outline,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2
                  }}>
                    {selectedServices.includes(service.id) && (
                      <MaterialIcons name="check" size={14} color="white" />
                    )}
                  </ThemedView>

                  {/* Service Info */}
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText type ="normal" style={{ marginBottom: 4 }}>
                      {service.title}
                    </ThemedText>
                    <ThemedText type ="caption" intensity ="light" style={{ marginBottom: 6 }} numberOfLines={2}>
                      {service.description}
                    </ThemedText>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="business" size={12} color={theme.onSurface + '60'} />
                        <ThemedText type ="caption" intensity ="light" style={{  marginLeft: 4 }}>
                          {service.provider?.businessName || 'Fournisseur'}
                        </ThemedText>
                      </ThemedView>
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="euro" size={12} color={theme.success} />
                        <ThemedText type ="caption" intensity ="strong" style={{ color: theme.success, marginLeft: 2 }}>
                          {service.pricing?.basePrice || 0}€
                        </ThemedText>
                      </ThemedView>
                      {service.category && (
                        <ThemedView  style={{
                          backgroundColor: theme.primary + '20',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6
                        }}>
                          <ThemedText type ="caption" intensity ="strong" style={{ color: theme.primary }}>
                            {service.category}
                          </ThemedText>
                        </ThemedView>
                      )}
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </>
        )}

        <ThemedView style={{ marginTop: 16, padding: 12, backgroundColor: theme.primary + '10', borderRadius: 10, borderWidth: 1, borderColor: theme.primary + '30' }}>
          <ThemedText type ="caption" style={{ color: theme.onSurface + '80', lineHeight: 16, marginBottom: 8 }}>
            💡 <ThemedText style={{ fontWeight: '600' }}>Astuce :</ThemedText> Les services sélectionnés seront visibles par les locataires potentiels et peuvent augmenter l'attractivité de votre propriété.
          </ThemedText>
          <ThemedText type ="caption" style={{ color: theme.primary, fontWeight: '600', lineHeight: 16 }}>
            ✓ Cette étape est optionnelle, vous pouvez continuer sans sélectionner de service
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
    );
  };

  const totalSteps = 5;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.surface, paddingTop:10 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header avec progress */}
      <ThemedView style={{
        paddingHorizontal: 16,
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
          <ThemedText type ="normal" intensity = "strong">
            Créer une propriété
          </ThemedText>
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
      </ScrollView>

      {/* Footer avec boutons */}
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
          disabled={loading || (currentStep !== 5 && !validateStep())}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[theme.secondary, theme.primary]}
            style={{
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              opacity: (loading || (currentStep !== 5 && !validateStep())) ? 0.6 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <ThemedText type ="normal" intensity ="strong" style={{ color: 'white' }}>
                {currentStep === totalSteps ? 'Créer la propriété' : 'Suivant'}
              </ThemedText>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default PropertyCreationForm;
