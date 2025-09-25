import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/components/contexts/theme/themehook';
import { getPropertyService, CreatePropertyInput } from '@/services/api/propertyService';

interface PropertyCreationFormProps {
  onClose: () => void;
  onSuccess: (property: any) => void;
}

const PropertyCreationForm: React.FC<PropertyCreationFormProps> = ({ onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreatePropertyInput>({
    title: '',
    description: '',
    address: '',
    actionType: 'rent',
    propertyType: 'apartment',
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
    }
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement', icon: 'apartment' },
    { value: 'house', label: 'Maison', icon: 'home' },
    { value: 'villa', label: 'Villa', icon: 'villa' },
    { value: 'studio', label: 'Studio', icon: 'weekend' },
    { value: 'penthouse', label: 'Penthouse', icon: 'domain' },
    { value: 'loft', label: 'Loft', icon: 'business' }
  ];

  const amenitiesList = [
    'Wifi', 'Parking', 'Piscine', 'Jardin', 'Balcon', 'Terrasse',
    'Ascenseur', 'Cave', 'Grenier', 'Climatisation', 'Chauffage',
    'Lave-vaisselle', 'Lave-linge', 'Sèche-linge'
  ];

  const acceptedSituationsList = [
    'Étudiant', 'Salarié', 'Fonctionnaire', 'Retraité', 'Profession libérale',
    'Intérimaire', 'CDD', 'CDI', 'Apprenti', 'Stagiaire'
  ];

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages]);
      updateFormData('images', [...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
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
        return formData.title && formData.description && formData.address;
      case 2:
        return formData.generalHInfo.surface > 0 && formData.generalHInfo.area;
      case 3:
        return images.length > 0;
      case 4:
        return formData.ownerCriteria.monthlyRent > 0;
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
      const propertyService = getPropertyService();
      const newProperty = await propertyService.createProperty(formData);

      Alert.alert('Succès', 'Votre propriété a été créée avec succès !');
      onSuccess(newProperty);
      onClose();
    } catch (error) {
      console.error('Error creating property:', error);
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
          Titre de l'annonce *
        </ThemedText>
        <TextInput
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          placeholder="Ex: Bel appartement 3 pièces centre-ville"
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
          Type d'action
        </ThemedText>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { value: 'rent', label: 'Location' },
            { value: 'sell', label: 'Vente' }
          ].map((action) => (
            <TouchableOpacity
              key={action.value}
              onPress={() => updateFormData('actionType', action.value)}
              style={{
                flex: 1,
                backgroundColor: formData.actionType === action.value ? theme.primary : theme.surface,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: formData.actionType === action.value ? theme.primary : theme.outline + '30'
              }}
            >
              <ThemedText style={{
                color: formData.actionType === action.value ? 'white' : theme.onSurface,
                fontWeight: '600'
              }}>
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Type de propriété
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => updateFormData('propertyType', type.value)}
              style={{
                backgroundColor: formData.propertyType === type.value ? theme.primary : theme.surface,
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                minWidth: 80,
                borderWidth: 1,
                borderColor: formData.propertyType === type.value ? theme.primary : theme.outline + '30'
              }}
            >
              <MaterialIcons
                name={type.icon as any}
                size={20}
                color={formData.propertyType === type.value ? 'white' : theme.onSurface}
              />
              <ThemedText style={{
                color: formData.propertyType === type.value ? 'white' : theme.onSurface,
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4
              }}>
                {type.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Adresse *
        </ThemedText>
        <TextInput
          value={formData.address}
          onChangeText={(value) => updateFormData('address', value)}
          placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
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
          Description *
        </ThemedText>
        <TextInput
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder="Décrivez votre propriété en détail..."
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
    </ThemedView>
  );

  const renderStep2 = () => (
    <ThemedView style={{ gap: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Caractéristiques du logement
      </ThemedText>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Nombre de pièces
          </ThemedText>
          <TextInput
            value={formData.generalHInfo.rooms.toString()}
            onChangeText={(value) => updateFormData('generalHInfo.rooms', parseInt(value) || 0)}
            keyboardType="numeric"
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

        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Chambres
          </ThemedText>
          <TextInput
            value={formData.generalHInfo.bedrooms.toString()}
            onChangeText={(value) => updateFormData('generalHInfo.bedrooms', parseInt(value) || 0)}
            keyboardType="numeric"
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
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Salles de bain
          </ThemedText>
          <TextInput
            value={formData.generalHInfo.bathrooms.toString()}
            onChangeText={(value) => updateFormData('generalHInfo.bathrooms', parseInt(value) || 0)}
            keyboardType="numeric"
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

        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Surface (m²) *
          </ThemedText>
          <TextInput
            value={formData.generalHInfo.surface.toString()}
            onChangeText={(value) => updateFormData('generalHInfo.surface', parseInt(value) || 0)}
            keyboardType="numeric"
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
      </View>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Quartier/Zone *
        </ThemedText>
        <TextInput
          value={formData.generalHInfo.area}
          onChangeText={(value) => updateFormData('generalHInfo.area', value)}
          placeholder="Ex: Centre-ville, Montparnasse..."
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
          Occupants maximum
        </ThemedText>
        <TextInput
          value={formData.generalHInfo.maxOccupants.toString()}
          onChangeText={(value) => updateFormData('generalHInfo.maxOccupants', parseInt(value) || 1)}
          keyboardType="numeric"
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
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Options
        </ThemedText>
        <View style={{ gap: 12 }}>
          {[
            { key: 'furnished', label: 'Meublé' },
            { key: 'pets', label: 'Animaux acceptés' },
            { key: 'smoking', label: 'Fumeurs acceptés' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => updateFormData(`generalHInfo.${option.key}`, !formData.generalHInfo[option.key as keyof typeof formData.generalHInfo])}
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
                name={formData.generalHInfo[option.key as keyof typeof formData.generalHInfo] ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={formData.generalHInfo[option.key as keyof typeof formData.generalHInfo] ? theme.primary : theme.onSurface + '60'}
              />
              <ThemedText style={{ marginLeft: 12, fontWeight: '600' }}>
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>
    </ThemedView>
  );

  const renderStep3 = () => (
    <ThemedView style={{ gap: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Photos et équipements
      </ThemedText>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Photos du logement * (au moins 1)
        </ThemedText>

        <TouchableOpacity
          onPress={pickImages}
          style={{
            backgroundColor: theme.primary + '20',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.primary,
            borderStyle: 'dashed'
          }}
        >
          <MaterialIcons name="add-a-photo" size={32} color={theme.primary} />
          <ThemedText style={{ marginTop: 8, color: theme.primary, fontWeight: '600' }}>
            Ajouter des photos
          </ThemedText>
        </TouchableOpacity>

        {images.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {images.map((image, index) => (
              <View key={index} style={{ position: 'relative' }}>
                <Image
                  source={{ uri: image }}
                  style={{ width: 80, height: 80, borderRadius: 8 }}
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    backgroundColor: theme.error,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
          Équipements disponibles
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {amenitiesList.map((amenity) => (
            <TouchableOpacity
              key={amenity}
              onPress={() => toggleAmenity(amenity)}
              style={{
                backgroundColor: formData.amenities?.includes(amenity) ? theme.primary : theme.surface,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: formData.amenities?.includes(amenity) ? theme.primary : theme.outline + '30'
              }}
            >
              <ThemedText style={{
                color: formData.amenities?.includes(amenity) ? 'white' : theme.onSurface,
                fontSize: 12,
                fontWeight: '600'
              }}>
                {amenity}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>
    </ThemedView>
  );

  const renderStep4 = () => (
    <ThemedView style={{ gap: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Critères financiers et locataires
      </ThemedText>

      <ThemedView>
        <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          {formData.actionType === 'rent' ? 'Loyer mensuel (€) *' : 'Prix de vente (€) *'}
        </ThemedText>
        <TextInput
          value={formData.ownerCriteria.monthlyRent.toString()}
          onChangeText={(value) => updateFormData('ownerCriteria.monthlyRent', parseInt(value) || 0)}
          keyboardType="numeric"
          placeholder="1200"
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

      {formData.actionType === 'rent' && (
        <>
          <ThemedView>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Dépôt de garantie (€)
            </ThemedText>
            <TextInput
              value={formData.ownerCriteria.depositAmount.toString()}
              onChangeText={(value) => updateFormData('ownerCriteria.depositAmount', parseInt(value) || 0)}
              keyboardType="numeric"
              placeholder="1200"
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
              Durée minimum (mois)
            </ThemedText>
            <TextInput
              value={formData.ownerCriteria.minimumDuration.toString()}
              onChangeText={(value) => updateFormData('ownerCriteria.minimumDuration', parseInt(value) || 1)}
              keyboardType="numeric"
              placeholder="12"
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
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
              Critères requis
            </ThemedText>
            <View style={{ gap: 12 }}>
              {[
                { key: 'isGarantRequired', label: 'Garant requis' },
                { key: 'guarantorRequired', label: 'Caution solidaire' },
                { key: 'isdocumentRequired', label: 'Justificatifs obligatoires' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => updateFormData(`ownerCriteria.${option.key}`, !formData.ownerCriteria[option.key as keyof typeof formData.ownerCriteria])}
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
                    name={formData.ownerCriteria[option.key as keyof typeof formData.ownerCriteria] ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={formData.ownerCriteria[option.key as keyof typeof formData.ownerCriteria] ? theme.primary : theme.onSurface + '60'}
                  />
                  <ThemedText style={{ marginLeft: 12, fontWeight: '600' }}>
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>

          <ThemedView>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
              Situations acceptées
            </ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {acceptedSituationsList.map((situation) => (
                <TouchableOpacity
                  key={situation}
                  onPress={() => toggleSituation(situation)}
                  style={{
                    backgroundColor: formData.ownerCriteria.acceptedSituations?.includes(situation) ? theme.primary : theme.surface,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: formData.ownerCriteria.acceptedSituations?.includes(situation) ? theme.primary : theme.outline + '30'
                  }}
                >
                  <ThemedText style={{
                    color: formData.ownerCriteria.acceptedSituations?.includes(situation) ? 'white' : theme.onSurface,
                    fontSize: 12,
                    fontWeight: '600'
                  }}>
                    {situation}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        </>
      )}
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
            Créer une propriété
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
            backgroundColor: theme.primary,
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
            colors={[theme.primary, theme.primary + '80']}
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
                {currentStep === totalSteps ? 'Créer la propriété' : 'Suivant'}
              </ThemedText>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
};

export default PropertyCreationForm;