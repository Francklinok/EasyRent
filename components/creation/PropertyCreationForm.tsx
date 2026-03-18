import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager } from 'react-native';
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
import { getPropertyService, CreatePropertyInput } from '@/services/api/propertyService';
import { getMicroservicesApi } from '@/services/api/microservicesApi';
import { getServiceMarketplaceService } from '@/services/api/serviceMarketplaceService';
import { useNotifications, NotificationHelpers } from '@/hooks/useNotifications';
import { useActivity } from '@/components/contexts/activity/ActivityContext';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language';

const HOTEL_ROOM_CATEGORIES = [
  {
    category: 'classic',
    label: 'Chambres classiques',
    icon: 'bed' as const,
    rooms: [
      { id: 'simple', name: 'Chambre simple', capacity: 1, description: '1 lit simple' },
      { id: 'double', name: 'Chambre double', capacity: 2, description: '1 grand lit' },
      { id: 'twin', name: 'Chambre twin', capacity: 2, description: '2 lits séparés' },
      { id: 'triple', name: 'Chambre triple', capacity: 3, description: 'Lit double + lit simple' },
    ]
  },
  {
    category: 'family',
    label: 'Chambres familiales',
    icon: 'account-group' as const,
    rooms: [
      { id: 'family', name: 'Chambre familiale', capacity: 4, description: 'Pour 4+ personnes, spacieuse' },
      { id: 'connecting', name: 'Chambres communicantes', capacity: 4, description: '2 chambres reliées par une porte' },
    ]
  },
  {
    category: 'premium',
    label: 'Chambres haut de gamme',
    icon: 'star' as const,
    rooms: [
      { id: 'superior', name: 'Chambre supérieure', capacity: 2, description: 'Plus grande, mieux équipée' },
      { id: 'deluxe', name: 'Chambre deluxe', capacity: 2, description: 'Très confortable, belle vue' },
      { id: 'suite', name: 'Suite', capacity: 4, description: 'Chambre + salon, très confortable' },
      { id: 'junior_suite', name: 'Junior suite', capacity: 2, description: 'Espace salon intégré' },
    ]
  },
  {
    category: 'accessible',
    label: 'Chambres spécifiques',
    icon: 'wheelchair-accessibility' as const,
    rooms: [
      { id: 'pmr', name: 'Chambre PMR', capacity: 2, description: 'Adaptée mobilité réduite' },
      { id: 'non_smoking', name: 'Chambre non-fumeur', capacity: 2, description: 'Réservée non-fumeurs' },
      { id: 'with_view', name: 'Chambre avec vue', capacity: 2, description: 'Vue mer, montagne, ville...' },
    ]
  },
  {
    category: 'other',
    label: 'Autres types',
    icon: 'door' as const,
    rooms: [
      { id: 'studio_hotel', name: 'Studio', capacity: 2, description: 'Chambre avec coin cuisine' },
      { id: 'apart_hotel', name: 'Appartement hôtelier', capacity: 4, description: 'Pour longs séjours' },
      { id: 'dormitory', name: 'Dortoir', capacity: 8, description: 'Lits en dortoir (auberge)' },
    ]
  }
];

interface HotelRoomEntry {
  roomId: string;
  roomName: string;
  images: string[];    // base64 data URLs for upload
  imageUris: string[]; // local URIs for display
}

interface HotelRoomConfig {
  roomTypeId: string;
  name: string;
  category: string;
  capacity: number;
  pricePerNight: number;
  available: number;
  amenities: string[];
  description?: string;
  rooms: HotelRoomEntry[];
}

// ============================================
// RENTAL STRATEGY & UNIT MANAGEMENT TYPES
// ============================================

type RentalStrategy = 'global' | 'per_unit' | 'both';

const UNIT_CAPABLE_TYPES = ['villa', 'house', 'home', 'chalet', 'penthouse', 'apartment', 'loft', 'hotel'] as const;
const NO_UNIT_TYPES = ['studio', 'terrain', 'bureau', 'commercial'] as const;

const supportsUnits = (propertyType: string): boolean => {
  return (UNIT_CAPABLE_TYPES as readonly string[]).includes(propertyType);
};

interface PropertyUnitEntry {
  unitId: string;
  unitName: string;
  description: string;
  images: string[];
  imageUris: string[];
  amenities: string[];
  capacity: number;
  price: number;
  currency: string;
}

const UNIT_AMENITIES = [
  'Salle de bain privée', 'Climatisation', 'Balcon', 'Terrasse',
  'Vue mer', 'Vue jardin', 'TV', 'Wifi', 'Mini-bar', 'Coffre-fort',
  'Bureau', 'Dressing', 'Kitchenette'
];

interface PropertyCreationFormProps {
  onClose: () => void;
  onSuccess: (property: any) => void;
  editMode?: boolean;
  initialData?: any;
}

const PropertyCreationForm: React.FC<PropertyCreationFormProps> = ({ onClose, onSuccess, editMode = false, initialData }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { setIsOwner } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]); // URIs for display
  const [imagesBase64, setImagesBase64] = useState<string[]>([]); // Base64 for upload
  const imagesBase64Ref = useRef<string[]>([]);
  const { sendLocalNotification } = useNotifications();
  const { addActivity } = useActivity();

  // States for sale documents (mandatory for properties being sold)
  const [saleDocuments, setSaleDocuments] = useState<{uri: string; name: string; base64?: string; type: string}[]>([]);

  // Enable LayoutAnimation for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  // States for services
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Geocoding state
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      currency: 'XAF',
      isGarantRequired: false,
      depositAmount: 0,
      minimumDuration: 1,
      solvability: 'instant',
      guarantorRequired: false,
      guarantorLocation: 'same',
      acceptedSituations: [],
      isdocumentRequired: false,
      requiredDocuments: {
        client: [],
        guarantor: []
      },
      paymentDeadlineDays: null as number | null,
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
  const [hotelRoomTypes, setHotelRoomTypes] = useState<HotelRoomConfig[]>([]);
  const [hotelRooms, setHotelRooms] = useState<HotelRoomEntry[]>([]);

  // ============================================
  // RENTAL STRATEGY & UNIT MANAGEMENT STATE
  // ============================================
  const [rentalStrategy, setRentalStrategy] = useState<RentalStrategy>('global');
  const [propertyUnits, setPropertyUnits] = useState<PropertyUnitEntry[]>([]);
  const [expandedUnitIndex, setExpandedUnitIndex] = useState<number | null>(null);
  const [expandedHotelTypeIndex, setExpandedHotelTypeIndex] = useState<number | null>(null);

  // ============================================
  // PROJECT TYPE: classic | rst | spv
  // ============================================
  const [projectType, setProjectType] = useState<'classic' | 'rst' | 'spv'>('classic');

  const [rstData, setRstData] = useState({
    targetAmountUsd: '',
    minInvestmentUsd: '500',
    revenueSharePct: '',
    durationMonths: '24',
    targetAnnualYield: '',
    baseMonthlyRent: '',
    maxReturnPct: '130',
    jurisdiction: 'France',
  });

  const [spvData, setSpvData] = useState({
    companyName: '',
    companyRegistration: '',
    jurisdiction: 'France',
    totalShares: '10000',
    sharePrice: '100',
    minimumInvestment: '500',
    maxInvestors: '500',
    tokenStandard: 'ERC-3643',
    annualYieldPct: '',
    occupancyRate: '95',
    currency: 'USD',
  });

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
    supportsUnits: boolean;
    rentLabel: string;
    amenities: string[];
    priceLabel: string;
  }> = {
    apartment: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      supportsUnits: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Ascenseur', 'Balcon', 'Cave', 'Climatisation', 'Chauffage', 'Interphone']
    },
    home: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      supportsUnits: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Jardin', 'Piscine', 'Terrasse', 'Garage', 'Climatisation', 'Chauffage']
    },
    villa: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      supportsUnits: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Jardin', 'Piscine', 'Terrasse', 'Garage', 'Climatisation', 'Sécurité', 'Salle de sport']
    },
    studio: {
      showRooms: false, showBedrooms: false, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      supportsUnits: false,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Ascenseur', 'Climatisation', 'Chauffage', 'Interphone']
    },
    terrain: {
      showRooms: false, showBedrooms: false, showBathrooms: false,
      showFurnished: false, showPets: false, showSmoking: false,
      showDeposit: false, showMinDuration: false, showSituations: false,
      supportsUnits: false,
      rentLabel: 'Prix location (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Eau', 'Électricité', 'Clôture', 'Accès route', 'Titre foncier']
    },
    penthouse: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      supportsUnits: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Terrasse panoramique', 'Piscine privée', 'Ascenseur privé', 'Climatisation', 'Jacuzzi', 'Sécurité 24h']
    },
    loft: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: true, showSituations: true,
      supportsUnits: true,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Hauteur sous plafond', 'Climatisation', 'Chauffage', 'Espace ouvert']
    },
    hotel: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: false, showPets: false, showSmoking: false,
      showDeposit: false, showMinDuration: false, showSituations: false,
      supportsUnits: true,
      rentLabel: 'Prix par nuit (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Restaurant', 'Piscine', 'Spa', 'Room service', 'Réception 24h', 'Climatisation', 'Petit-déjeuner']
    },
    bureau: {
      showRooms: false, showBedrooms: false, showBathrooms: true,
      showFurnished: true, showPets: false, showSmoking: false,
      showDeposit: true, showMinDuration: true, showSituations: false,
      supportsUnits: false,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Ascenseur', 'Climatisation', 'Salle de réunion', 'Cuisine équipée', 'Sécurité', 'Accès handicapé']
    },
    chalet: {
      showRooms: true, showBedrooms: true, showBathrooms: true,
      showFurnished: true, showPets: true, showSmoking: true,
      showDeposit: true, showMinDuration: false, showSituations: false,
      supportsUnits: true,
      rentLabel: 'Prix par nuit (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Cheminée', 'Terrasse', 'Sauna', 'Jacuzzi', 'Vue montagne', 'Ski aux pieds']
    },
    commercial: {
      showRooms: false, showBedrooms: false, showBathrooms: true,
      showFurnished: false, showPets: false, showSmoking: false,
      showDeposit: true, showMinDuration: true, showSituations: false,
      supportsUnits: false,
      rentLabel: 'Loyer mensuel (€)', priceLabel: 'Prix de vente (€)',
      amenities: ['Wifi', 'Parking', 'Vitrine', 'Réserve', 'Climatisation', 'Alarme', 'Accès livraison', 'Accès handicapé']
    }
  };

  // Documents requis pour la vente selon le type de propriété
  const saleDocumentRequirements: Record<string, { required: string[]; recommended: string[] }> = {
    terrain: {
      required: ['Titre foncier', 'Plan cadastral'],
      recommended: ['Certificat de non-litige', 'Attestation de bornage', 'Plan de situation']
    },
    apartment: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Diagnostic immobilier', 'Règlement de copropriété', 'PV des dernières AG']
    },
    home: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Diagnostic immobilier', 'Plan de la maison', 'Certificat de conformité']
    },
    villa: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Diagnostic immobilier', 'Plan de la propriété', 'Certificat de conformité']
    },
    studio: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Diagnostic immobilier', 'Règlement de copropriété']
    },
    penthouse: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Diagnostic immobilier', 'Règlement de copropriété', 'PV des dernières AG']
    },
    loft: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Diagnostic immobilier', 'Certificat de conformité']
    },
    bureau: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Bail commercial en cours', 'État des lieux', 'Diagnostic immobilier']
    },
    commercial: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Bail commercial en cours', 'Chiffre d\'affaires', 'Diagnostic immobilier']
    },
    chalet: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur'],
      recommended: ['Diagnostic immobilier', 'Plan de la propriété']
    },
    hotel: {
      required: ['Titre de propriété', 'Pièce d\'identité du vendeur', 'Licence d\'exploitation'],
      recommended: ['Bilan financier', 'Contrats en cours', 'Diagnostic immobilier']
    }
  };

  // Get sale document requirements for current property type
  const getCurrentSaleDocRequirements = () => {
    return saleDocumentRequirements[formData.propertyType];
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

  // Available currencies
  const currencies = [
    { value: 'XAF', label: 'CFA (XAF)', symbol: 'FCFA' },
    { value: 'USD', label: 'Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'CNY', label: 'Yuan (¥)', symbol: '¥' },
  ];

  // Helper to get the current type config
  const currentTypeConfig = propertyTypeConfig[formData.propertyType] || propertyTypeConfig.apartment;

  // ============================================
  // DERIVED COMPUTATIONS
  // ============================================
  const canHaveUnits = supportsUnits(formData.propertyType);
  const isHotel = formData.propertyType === 'hotel';
  const noRoomsAllowed = (NO_UNIT_TYPES as readonly string[]).includes(formData.propertyType);
  const unitsAreRentable = formData.actionType === 'rent' &&
    (rentalStrategy === 'per_unit' || rentalStrategy === 'both');
  const unitsAreDescriptiveOnly = formData.actionType === 'sell' ||
    rentalStrategy === 'global';
  const showRentalStrategy = formData.actionType === 'rent' && canHaveUnits && !isHotel;
  const showUnitManagement = canHaveUnits && !isHotel && propertyUnits.length > 0;
  const hasMultipleHotelTypes = isHotel && hotelRoomTypes.length > 1;

  // Type-specific equipments configuration
  const equipmentsByType: Record<string, Array<{ id: string; name: string; icon: string; lib: string; category: string }>> = {
    apartment: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'TV', icon: 'tv', lib: 'FontAwesome5', category: 'Entertainment' },
      { id: '3', name: 'Réfrigérateur', icon: 'fridge-outline', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '4', name: 'Four', icon: 'stove', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '5', name: 'Machine à laver', icon: 'washing-machine', lib: 'MaterialCommunityIcons', category: 'Laundry' },
      { id: '6', name: 'Climatisation', icon: 'air-conditioner', lib: 'MaterialCommunityIcons', category: 'Comfort' }
    ],
    home: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'TV', icon: 'tv', lib: 'FontAwesome5', category: 'Entertainment' },
      { id: '3', name: 'Réfrigérateur', icon: 'fridge-outline', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '4', name: 'Four', icon: 'stove', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '5', name: 'Machine à laver', icon: 'washing-machine', lib: 'MaterialCommunityIcons', category: 'Laundry' },
      { id: '6', name: 'Jardin', icon: 'flower', lib: 'MaterialCommunityIcons', category: 'Outdoor' }
    ],
    villa: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'Piscine', icon: 'pool', lib: 'MaterialCommunityIcons', category: 'Leisure' },
      { id: '3', name: 'Jardin', icon: 'flower', lib: 'MaterialCommunityIcons', category: 'Outdoor' },
      { id: '4', name: 'Garage', icon: 'garage', lib: 'MaterialCommunityIcons', category: 'Parking' },
      { id: '5', name: 'Sécurité', icon: 'shield-check', lib: 'MaterialCommunityIcons', category: 'Security' },
      { id: '6', name: 'Climatisation', icon: 'air-conditioner', lib: 'MaterialCommunityIcons', category: 'Comfort' }
    ],
    studio: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'TV', icon: 'tv', lib: 'FontAwesome5', category: 'Entertainment' },
      { id: '3', name: 'Réfrigérateur', icon: 'fridge-outline', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '4', name: 'Micro-ondes', icon: 'microwave', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '5', name: 'Climatisation', icon: 'air-conditioner', lib: 'MaterialCommunityIcons', category: 'Comfort' }
    ],
    terrain: [
      { id: '1', name: 'Clôture', icon: 'fence', lib: 'MaterialCommunityIcons', category: 'Security' },
      { id: '2', name: 'Accès eau', icon: 'water', lib: 'MaterialCommunityIcons', category: 'Utilities' },
      { id: '3', name: 'Accès électricité', icon: 'flash', lib: 'MaterialCommunityIcons', category: 'Utilities' },
      { id: '4', name: 'Accès route', icon: 'road', lib: 'MaterialCommunityIcons', category: 'Access' },
      { id: '5', name: 'Titre foncier', icon: 'file-document', lib: 'MaterialCommunityIcons', category: 'Legal' }
    ],
    penthouse: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'Terrasse panoramique', icon: 'balcony', lib: 'MaterialCommunityIcons', category: 'Outdoor' },
      { id: '3', name: 'Jacuzzi', icon: 'hot-tub', lib: 'MaterialCommunityIcons', category: 'Leisure' },
      { id: '4', name: 'Ascenseur privé', icon: 'elevator', lib: 'MaterialCommunityIcons', category: 'Access' },
      { id: '5', name: 'Sécurité 24h', icon: 'shield-check', lib: 'MaterialCommunityIcons', category: 'Security' },
      { id: '6', name: 'Climatisation', icon: 'air-conditioner', lib: 'MaterialCommunityIcons', category: 'Comfort' }
    ],
    loft: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'TV', icon: 'tv', lib: 'FontAwesome5', category: 'Entertainment' },
      { id: '3', name: 'Cuisine équipée', icon: 'stove', lib: 'MaterialCommunityIcons', category: 'Kitchen' },
      { id: '4', name: 'Espace ouvert', icon: 'floor-plan', lib: 'MaterialCommunityIcons', category: 'Space' },
      { id: '5', name: 'Chauffage', icon: 'radiator', lib: 'MaterialCommunityIcons', category: 'Comfort' }
    ],
    hotel: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'Room service', icon: 'room-service', lib: 'MaterialCommunityIcons', category: 'Service' },
      { id: '3', name: 'Restaurant', icon: 'silverware-fork-knife', lib: 'MaterialCommunityIcons', category: 'Food' },
      { id: '4', name: 'Piscine', icon: 'pool', lib: 'MaterialCommunityIcons', category: 'Leisure' },
      { id: '5', name: 'Spa', icon: 'spa', lib: 'MaterialCommunityIcons', category: 'Wellness' },
      { id: '6', name: 'Réception 24h', icon: 'desk', lib: 'MaterialCommunityIcons', category: 'Service' }
    ],
    bureau: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'Salle de réunion', icon: 'presentation', lib: 'MaterialCommunityIcons', category: 'Work' },
      { id: '3', name: 'Cuisine équipée', icon: 'coffee-maker', lib: 'MaterialCommunityIcons', category: 'Amenity' },
      { id: '4', name: 'Parking', icon: 'parking', lib: 'MaterialCommunityIcons', category: 'Access' },
      { id: '5', name: 'Climatisation', icon: 'air-conditioner', lib: 'MaterialCommunityIcons', category: 'Comfort' },
      { id: '6', name: 'Accès handicapé', icon: 'wheelchair-accessibility', lib: 'MaterialCommunityIcons', category: 'Access' }
    ],
    chalet: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'Cheminée', icon: 'fireplace', lib: 'MaterialCommunityIcons', category: 'Comfort' },
      { id: '3', name: 'Sauna', icon: 'hot-tub', lib: 'MaterialCommunityIcons', category: 'Wellness' },
      { id: '4', name: 'Terrasse', icon: 'balcony', lib: 'MaterialCommunityIcons', category: 'Outdoor' },
      { id: '5', name: 'Vue montagne', icon: 'image-filter-hdr', lib: 'MaterialCommunityIcons', category: 'View' },
      { id: '6', name: 'Parking', icon: 'parking', lib: 'MaterialCommunityIcons', category: 'Access' }
    ],
    commercial: [
      { id: '1', name: 'Wifi', icon: 'wifi', lib: 'FontAwesome5', category: 'Technology' },
      { id: '2', name: 'Vitrine', icon: 'storefront', lib: 'MaterialCommunityIcons', category: 'Display' },
      { id: '3', name: 'Réserve', icon: 'warehouse', lib: 'MaterialCommunityIcons', category: 'Storage' },
      { id: '4', name: 'Alarme', icon: 'alarm-light', lib: 'MaterialCommunityIcons', category: 'Security' },
      { id: '5', name: 'Accès livraison', icon: 'truck', lib: 'MaterialCommunityIcons', category: 'Access' },
      { id: '6', name: 'Climatisation', icon: 'air-conditioner', lib: 'MaterialCommunityIcons', category: 'Comfort' }
    ]
  };

  // Type-specific atouts configuration
  const atoutsByType: Record<string, Array<{ id: string; type: string; text: string; icon: string; lib: string; category: string; priority: number; verified: boolean }>> = {
    apartment: [
      { id: '1', type: 'predefined', text: 'Proche des transports', icon: 'bus', lib: 'FontAwesome5', category: 'Location', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Quartier calme', icon: 'home-city', lib: 'MaterialCommunityIcons', category: 'Neighborhood', priority: 4, verified: true },
      { id: '3', type: 'predefined', text: 'Vue dégagée', icon: 'window-maximize', lib: 'FontAwesome5', category: 'View', priority: 3, verified: false }
    ],
    home: [
      { id: '1', type: 'predefined', text: 'Quartier calme', icon: 'home-city', lib: 'MaterialCommunityIcons', category: 'Neighborhood', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Proche des écoles', icon: 'school', lib: 'MaterialCommunityIcons', category: 'Education', priority: 4, verified: true },
      { id: '3', type: 'predefined', text: 'Grand jardin', icon: 'flower', lib: 'MaterialCommunityIcons', category: 'Outdoor', priority: 3, verified: false }
    ],
    villa: [
      { id: '1', type: 'predefined', text: 'Quartier résidentiel', icon: 'home-city', lib: 'MaterialCommunityIcons', category: 'Neighborhood', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Sécurité 24h', icon: 'shield-check', lib: 'MaterialCommunityIcons', category: 'Security', priority: 5, verified: true },
      { id: '3', type: 'predefined', text: 'Vue panoramique', icon: 'panorama', lib: 'MaterialCommunityIcons', category: 'View', priority: 4, verified: false }
    ],
    studio: [
      { id: '1', type: 'predefined', text: 'Proche du centre', icon: 'city-variant', lib: 'MaterialCommunityIcons', category: 'Location', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Proche des transports', icon: 'bus', lib: 'FontAwesome5', category: 'Location', priority: 4, verified: true },
      { id: '3', type: 'predefined', text: 'Idéal étudiant', icon: 'school', lib: 'MaterialCommunityIcons', category: 'Target', priority: 3, verified: false }
    ],
    terrain: [
      { id: '1', type: 'predefined', text: 'Zone constructible', icon: 'office-building', lib: 'MaterialCommunityIcons', category: 'Construction', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Titre foncier disponible', icon: 'file-document', lib: 'MaterialCommunityIcons', category: 'Legal', priority: 5, verified: true },
      { id: '3', type: 'predefined', text: 'Accès facile', icon: 'road', lib: 'MaterialCommunityIcons', category: 'Access', priority: 4, verified: false },
      { id: '4', type: 'predefined', text: 'Viabilisé', icon: 'water', lib: 'MaterialCommunityIcons', category: 'Utilities', priority: 4, verified: false }
    ],
    penthouse: [
      { id: '1', type: 'predefined', text: 'Vue panoramique', icon: 'panorama', lib: 'MaterialCommunityIcons', category: 'View', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Dernier étage', icon: 'office-building', lib: 'MaterialCommunityIcons', category: 'Position', priority: 5, verified: true },
      { id: '3', type: 'predefined', text: 'Terrasse privée', icon: 'balcony', lib: 'MaterialCommunityIcons', category: 'Outdoor', priority: 4, verified: false }
    ],
    loft: [
      { id: '1', type: 'predefined', text: 'Hauteur sous plafond', icon: 'arrow-expand-vertical', lib: 'MaterialCommunityIcons', category: 'Space', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Espace lumineux', icon: 'white-balance-sunny', lib: 'MaterialCommunityIcons', category: 'Light', priority: 4, verified: true },
      { id: '3', type: 'predefined', text: 'Style industriel', icon: 'factory', lib: 'MaterialCommunityIcons', category: 'Style', priority: 3, verified: false }
    ],
    hotel: [
      { id: '1', type: 'predefined', text: 'Centre-ville', icon: 'city-variant', lib: 'MaterialCommunityIcons', category: 'Location', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Service 5 étoiles', icon: 'star', lib: 'MaterialCommunityIcons', category: 'Quality', priority: 5, verified: true },
      { id: '3', type: 'predefined', text: 'Petit-déjeuner inclus', icon: 'food-croissant', lib: 'MaterialCommunityIcons', category: 'Service', priority: 4, verified: false }
    ],
    bureau: [
      { id: '1', type: 'predefined', text: 'Quartier d\'affaires', icon: 'city-variant', lib: 'MaterialCommunityIcons', category: 'Location', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Transports à proximité', icon: 'bus', lib: 'FontAwesome5', category: 'Location', priority: 4, verified: true },
      { id: '3', type: 'predefined', text: 'Immeuble moderne', icon: 'office-building', lib: 'MaterialCommunityIcons', category: 'Building', priority: 3, verified: false }
    ],
    chalet: [
      { id: '1', type: 'predefined', text: 'Vue sur les montagnes', icon: 'image-filter-hdr', lib: 'MaterialCommunityIcons', category: 'View', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Pistes à proximité', icon: 'ski', lib: 'MaterialCommunityIcons', category: 'Activity', priority: 5, verified: true },
      { id: '3', type: 'predefined', text: 'Ambiance chaleureuse', icon: 'fireplace', lib: 'MaterialCommunityIcons', category: 'Atmosphere', priority: 4, verified: false }
    ],
    commercial: [
      { id: '1', type: 'predefined', text: 'Zone à fort passage', icon: 'walk', lib: 'MaterialCommunityIcons', category: 'Location', priority: 5, verified: true },
      { id: '2', type: 'predefined', text: 'Parking clientèle', icon: 'parking', lib: 'MaterialCommunityIcons', category: 'Access', priority: 4, verified: true },
      { id: '3', type: 'predefined', text: 'Vitrine visible', icon: 'storefront', lib: 'MaterialCommunityIcons', category: 'Visibility', priority: 4, verified: false }
    ]
  };

  // Get equipments for current property type
  const getEquipmentsForType = (type: string) => {
    return equipmentsByType[type] || equipmentsByType.apartment;
  };

  // Get atouts for current property type
  const getAtoutsForType = (type: string) => {
    return atoutsByType[type] || atoutsByType.apartment;
  };

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
    'Étudiant', 'Salarié', 'Fonctionnaire', 'Retraité', 'CDI', 'CDD', "Tout"
  ];

  // Update equipments and atouts when property type changes
  useEffect(() => {
    const newEquipments = getEquipmentsForType(formData.propertyType);
    const newAtouts = getAtoutsForType(formData.propertyType);

    setFormData(prev => ({
      ...prev,
      equipments: newEquipments,
      atouts: newAtouts
    }));
  }, [formData.propertyType]);

  // Sync individual rooms when room count changes (hotel only)
  useEffect(() => {
    if (!isHotel) {
      setHotelRooms([]);
      return;
    }
    const count = formData.generalHInfo?.rooms || 0;
    if (count <= 1) {
      setHotelRooms([]);
      return;
    }
    setHotelRooms(prev => {
      if (count > prev.length) {
        const newRooms = Array.from({ length: count - prev.length }, (_, i) => ({
          roomId: (prev.length + i + 1).toString(),
          roomName: `Chambre ${prev.length + i + 1}`,
          images: [],
          imageUris: [],
        }));
        return [...prev, ...newRooms];
      }
      return prev.slice(0, count);
    });
  }, [formData.generalHInfo?.rooms, formData.propertyType]);

  // Sync property units when room count changes (non-hotel unit-capable types)
  useEffect(() => {
    if (isHotel || !canHaveUnits) {
      setPropertyUnits([]);
      return;
    }
    const count = formData.generalHInfo?.rooms || 0;
    if (count <= 1) {
      setPropertyUnits([]);
      return;
    }
    setPropertyUnits(prev => {
      if (count > prev.length) {
        const newUnits: PropertyUnitEntry[] = Array.from({ length: count - prev.length }, (_, i) => ({
          unitId: (prev.length + i + 1).toString(),
          unitName: `Chambre ${prev.length + i + 1}`,
          description: '',
          images: [],
          imageUris: [],
          amenities: [],
          capacity: 1,
          price: 0,
          currency: formData.ownerCriteria.currency || 'XAF',
        }));
        return [...prev, ...newUnits];
      }
      return prev.slice(0, count);
    });
  }, [formData.generalHInfo?.rooms, formData.propertyType, formData.actionType]);

  // Reset rental strategy when actionType or propertyType changes
  useEffect(() => {
    if (formData.actionType !== 'rent' || !canHaveUnits || isHotel) {
      setRentalStrategy('global');
    }
    if (noRoomsAllowed) {
      setPropertyUnits([]);
    }
  }, [formData.actionType, formData.propertyType]);

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

  // Geocode address with Nominatim (OpenStreetMap) — debounced 800ms
  const geocodeAddress = async (address: string) => {
    try {
      setGeocodingStatus('loading');
      const encoded = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
        { headers: { 'User-Agent': 'EasyRent/1.0' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
        setGeocodingStatus('success');
      } else {
        setCoordinates(null);
        setGeocodingStatus('error');
      }
    } catch {
      setCoordinates(null);
      setGeocodingStatus('error');
    }
  };

  useEffect(() => {
    if (formData.address.length < 5) {
      setGeocodingStatus('idle');
      setCoordinates(null);
      return;
    }
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    geocodeTimerRef.current = setTimeout(() => {
      geocodeAddress(formData.address);
    }, 800);
    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    };
  }, [formData.address]);

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
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newImageUris = result.assets.map(asset => asset.uri);
      console.log(`📸 Picked ${result.assets.length} images from picker`);

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
          console.log(`📸 Total base64 images now: ${updated.length}`);
          return updated;
        });
      } else {
        Alert.alert(t('common.error'), t('propertyCreationForm.alertImageProcessError'));
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

  // Pick sale documents (mandatory for properties being sold)
  const pickSaleDocuments = async (documentType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        multiple: false, // One document at a time to associate with type
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log(`📄 [Property] Picked sale document: ${asset.name}`);

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

          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setSaleDocuments(prev => {
            
            const existing = prev.filter(doc => doc.type !== documentType);
            return [...existing, {
              uri: asset.uri,
              name: asset.name,
              base64: dataUrl,
              type: documentType
            }];
          });

          console.log(`✅ Sale document converted: ${asset.name} (${documentType})`);
          Alert.alert(t('propertyCreationForm.alertDocumentAdded'), t('propertyCreationForm.alertDocumentAddedMsg', { name: documentType }));
        } catch (error) {
          console.error(`❌ Failed to convert sale document: ${asset.name}`, error);
          // Still add without base64 as fallback
          setSaleDocuments(prev => {
            const existing = prev.filter(doc => doc.type !== documentType);
            return [...existing, {
              uri: asset.uri,
              name: asset.name,
              type: documentType
            }];
          });
        }
      }
    } catch (error) {
      console.error('❌ Sale document picker error:', error);
      Alert.alert(t('common.error'), t('propertyCreationForm.alertDocumentError'));
    }
  };

  // Remove a sale document
  const removeSaleDocument = (documentType: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSaleDocuments(prev => prev.filter(doc => doc.type !== documentType));
  };

  // Check if all required sale documents are uploaded
  const hasAllRequiredSaleDocuments = () => {
    if (formData.actionType !== 'sell') return true;
    const requirements = getCurrentSaleDocRequirements();
    const uploadedTypes = saleDocuments.map(doc => doc.type);
    return requirements.required.every(req => uploadedTypes.includes(req));
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
        if (formData.description.length < 10) {
          return false;
        }
        if (formData.address.length < 3) {
          return false;
        }
        return true;
      case 2:
        if (!(formData.generalLandinfo.surface > 0 && formData.generalHInfo?.area)) return false;
        if (isHotel && hotelRoomTypes.length === 0) return false;
        return true;
      case 3:
        // General photos always required
        if (images.length === 0) return false;
        // Hotel room validation
        if (isHotel && hotelRooms.length > 0) {
          if (hotelRooms.some(r => r.images.length === 0)) return false;
        }
        // Multi-type hotel: each type must have price, count, and total must match
        if (hasMultipleHotelTypes) {
          if (hotelRoomTypes.some(rt => rt.pricePerNight <= 0)) return false;
          if (hotelRoomTypes.some(rt => rt.available <= 0)) return false;
          const totalAssigned = hotelRoomTypes.reduce((sum, rt) => sum + rt.available, 0);
          if (totalAssigned !== (formData.generalHInfo?.rooms || 0)) return false;
        }
        // Unit validation (non-hotel)
        if (showUnitManagement && unitsAreRentable) {
          if (propertyUnits.some(u => u.images.length === 0)) return false;
          if (propertyUnits.some(u => !u.description || u.description.length < 5)) return false;
        }
        // Sale documents
        if (formData.actionType === 'sell' && !hasAllRequiredSaleDocuments()) {
          return false;
        }
        return true;
      case 4:
        if (formData.ownerCriteria.monthlyRent <= 0) return false;
        if (selectedPaymentMethods.length === 0) return false;
        // Per-unit rental: each unit must have a price
        if (unitsAreRentable && propertyUnits.some(u => u.price <= 0)) return false;
        return true;
      case 5:
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
      let errorMessage = 'Veuillez remplir tous les champs obligatoires';

      if (currentStep === 1) {
        if (formData.description && formData.description.length < 10) {
          errorMessage = 'La description doit contenir au moins 10 caractères';
        } else if (formData.address && formData.address.length < 3) {
          errorMessage = 'L\'adresse doit contenir au moins 3 caractères';
        }
      } else if (currentStep === 2) {
        if (isHotel && hotelRoomTypes.length === 0) {
          errorMessage = t('propertyCreationForm.validationSelectRoomType');
        }
      } else if (currentStep === 3) {
        if (images.length === 0) {
          errorMessage = t('propertyCreationForm.validationAddPhoto');
        } else if (isHotel && hotelRooms.length > 0 && hotelRooms.some(r => r.images.length === 0)) {
          const missing = hotelRooms.filter(r => r.images.length === 0).map(r => r.roomName);
          errorMessage = t('propertyCreationForm.validationMissingPhotos', { list: missing.join(', ') });
        } else if (hasMultipleHotelTypes && hotelRoomTypes.some(rt => rt.pricePerNight <= 0)) {
          const missing = hotelRoomTypes.filter(rt => rt.pricePerNight <= 0).map(rt => rt.name);
          errorMessage = t('propertyCreationForm.validationMissingPrice', { list: missing.join(', ') });
        } else if (hasMultipleHotelTypes && hotelRoomTypes.some(rt => rt.available <= 0)) {
          const missing = hotelRoomTypes.filter(rt => rt.available <= 0).map(rt => rt.name);
          errorMessage = t('propertyCreationForm.validationMissingRoomCount', { list: missing.join(', ') });
        } else if (hasMultipleHotelTypes) {
          const totalAssigned = hotelRoomTypes.reduce((sum, rt) => sum + rt.available, 0);
          const totalRooms = formData.generalHInfo?.rooms || 0;
          if (totalAssigned !== totalRooms) {
            errorMessage = t('propertyCreationForm.validationRoomCountMismatch', { actual: totalAssigned, expected: totalRooms });
          }
        } else if (showUnitManagement && unitsAreRentable && propertyUnits.some(u => u.images.length === 0)) {
          const missing = propertyUnits.filter(u => u.images.length === 0).map(u => u.unitName);
          errorMessage = t('propertyCreationForm.validationMissingPhotos', { list: missing.join(', ') });
        } else if (showUnitManagement && unitsAreRentable && propertyUnits.some(u => !u.description || u.description.length < 5)) {
          const missing = propertyUnits.filter(u => !u.description || u.description.length < 5).map(u => u.unitName);
          errorMessage = t('propertyCreationForm.validationMissingDescription', { list: missing.join(', ') });
        } else if (formData.actionType === 'sell' && !hasAllRequiredSaleDocuments()) {
          const requirements = getCurrentSaleDocRequirements();
          const uploadedTypes = saleDocuments.map(doc => doc.type);
          const missing = requirements.required.filter(req => !uploadedTypes.includes(req));
          errorMessage = t('propertyCreationForm.validationSaleDocuments', { list: missing.join('\n• ') });
        }
      } else if (currentStep === 4) {
        if (formData.ownerCriteria.monthlyRent <= 0) {
          errorMessage = t('propertyCreationForm.validationPriceRequired');
        } else if (selectedPaymentMethods.length === 0) {
          errorMessage = t('propertyCreationForm.validationPaymentRequired');
        } else if (unitsAreRentable && propertyUnits.some(u => u.price <= 0)) {
          const missing = propertyUnits.filter(u => u.price <= 0).map(u => u.unitName);
          errorMessage = t('propertyCreationForm.validationMissingPrice', { list: missing.join(', ') });
        }
      }

      Alert.alert(t('propertyCreationForm.alertFieldsRequired'), errorMessage);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Debug: Check auth state before creating property
      const { debugAuthState } = await import('@/components/utils/authDebug');
      const authState = await debugAuthState();

      if (!authState?.hasRestToken && !authState?.hasGraphqlToken) {
        Alert.alert(
          t('propertyCreationForm.alertNotConnectedTitle'),
          t('propertyCreationForm.alertNotConnectedMsg'),
          [{ text: t('common.ok') }]
        );
        setLoading(false);
        return;
      }

      // Check if we have general property images (always required)
      const finalImages = imagesBase64Ref.current;
      console.log(`📸 Checking images - State: ${imagesBase64.length}, Ref: ${finalImages.length}`);

      if (finalImages.length === 0) {
        Alert.alert(t('propertyCreationForm.alertFieldsRequired'), t('propertyCreationForm.alertImagesRequired'));
        setLoading(false);
        return;
      }

      // Verify all images are in base64 format
      const validImages = finalImages.filter(img => img.startsWith('data:image/'));
      if (validImages.length === 0) {
        Alert.alert(t('common.error'), t('propertyCreationForm.alertImagesError'));
        setLoading(false);
        return;
      }

      console.log(`📸 Sending ${validImages.length} base64 images to server...`);

      // Prepare sale documents
      const saleDocsData = formData.actionType === 'sell' ? saleDocuments.map(doc => ({
        type: doc.type,
        name: doc.name,
        base64: doc.base64
      })).filter(doc => doc.base64) : [];

      // Build hotel room types with rooms distributed across selected types
      let finalHotelRoomTypes: any[] | undefined;
      if (isHotel && hotelRoomTypes.length > 0 && hotelRooms.length > 0) {
        const roomsPerType = Math.ceil(hotelRooms.length / hotelRoomTypes.length);
        finalHotelRoomTypes = hotelRoomTypes.map((rt, typeIdx) => {
          const startIdx = typeIdx * roomsPerType;
          const typeRooms = hotelRooms.slice(startIdx, startIdx + roomsPerType);
          // Use per-type price/available/amenities when multiple types, else use global
          const usePerTypeConfig = hotelRoomTypes.length > 1;
          return {
            roomTypeId: rt.roomTypeId,
            name: rt.name,
            category: rt.category,
            capacity: rt.capacity,
            pricePerNight: usePerTypeConfig ? rt.pricePerNight : formData.ownerCriteria.monthlyRent,
            available: usePerTypeConfig ? rt.available : typeRooms.filter(r => r.images.length > 0).length,
            amenities: rt.amenities || [],
            description: rt.description,
            rooms: typeRooms.map(r => ({
              roomId: r.roomId,
              roomName: r.roomName,
              images: r.images,
            })),
          };
        });
      }

      // Build propertyRooms from propertyUnits (non-hotel unit-capable types)
      let finalPropertyRooms: any[] | undefined;
      if (!isHotel && propertyUnits.length > 0) {
        finalPropertyRooms = propertyUnits.map(u => ({
          roomId: u.unitId,
          roomName: u.unitName,
          description: u.description,
          images: u.images,
          amenities: u.amenities,
          capacity: u.capacity,
          price: u.price,
          currency: u.currency,
          isRentable: unitsAreRentable,
        }));
      }

      const propertyData = {
        ...formData,
        rentalStrategy: canHaveUnits && formData.actionType === 'rent' ? rentalStrategy : 'global',
        ownerCriteria: {
          ...formData.ownerCriteria,
          acceptedPaymentMethods: selectedPaymentMethods
        },
        images: validImages,
        saleDocuments: saleDocsData,
        services: selectedServices.map(serviceId => ({ serviceId })),
        iserviceAvalaible: selectedServices.length > 0,
        cryptoEnabled: cryptoEnabled,
        ...(coordinates ? { coordinates } : {}),
        ...(finalHotelRoomTypes ? { hotelRoomTypes: finalHotelRoomTypes } : {}),
        ...(finalPropertyRooms ? { propertyRooms: finalPropertyRooms } : {}),
      };

      console.log('📦 Données de création de propriété:', {
        equipments: propertyData.equipments?.length,
        atouts: propertyData.atouts?.length,
        services: propertyData.services?.length,
        images: propertyData.images?.length
      });

      const propertyService = getPropertyService();
      const newProperty = await propertyService.createProperty({
        ...propertyData,
        projectType,
      } as any);

      console.log('✅ Propriété créée:', {
        id: newProperty.id,
        equipments: newProperty.equipments?.length,
        atouts: newProperty.atouts?.length,
        projectType,
      });

      // After creating the property, register RST or SPV project with the microservice
      if (projectType === 'rst') {
        try {
          const api = getMicroservicesApi();
          await api.createRSTProject({
            propertyId: newProperty.id,
            propertyAddress: formData.address,
            targetAmountUsd: parseFloat(rstData.targetAmountUsd) || 0,
            revenueSharePct: parseFloat(rstData.revenueSharePct) || 0,
            durationMonths: parseInt(rstData.durationMonths) || 24,
            targetAnnualYield: parseFloat(rstData.targetAnnualYield) || 0,
            maxReturnPct: parseFloat(rstData.maxReturnPct) || 130,
            baseMonthlyRent: parseFloat(rstData.baseMonthlyRent) || 0,
            minInvestmentUsd: parseFloat(rstData.minInvestmentUsd) || 500,
            jurisdiction: rstData.jurisdiction,
          });
          console.log('✅ Projet RST créé');
        } catch (rstError) {
          console.warn('⚠️ Propriété créée mais erreur RST microservice:', rstError);
        }
      } else if (projectType === 'spv') {
        try {
          const api = getMicroservicesApi();
          const totalShares = parseInt(spvData.totalShares) || 10000;
          const sharePrice = parseFloat(spvData.sharePrice) || 100;
          await api.createSPVProject({
            propertyId: newProperty.id,
            propertyAddress: formData.address,
            totalValue: totalShares * sharePrice,
            currency: spvData.currency,
            totalShares,
            sharePrice,
            minimumInvestment: parseFloat(spvData.minimumInvestment) || 500,
            maxInvestors: parseInt(spvData.maxInvestors) || 500,
            jurisdiction: spvData.jurisdiction,
            tokenStandard: spvData.tokenStandard,
            companyName: spvData.companyName,
            companyRegistration: spvData.companyRegistration,
            annualYieldPct: parseFloat(spvData.annualYieldPct) || 0,
            occupancyRate: parseFloat(spvData.occupancyRate) || 95,
          });
          console.log('✅ Projet SPV créé');
        } catch (spvError) {
          console.warn('⚠️ Propriété créée mais erreur SPV microservice:', spvError);
        }
      }

      // Send a local success notification
      await sendLocalNotification(
        NotificationHelpers.propertyCreated(newProperty.id, newProperty.title)
      );

      // Log the activity
      addActivity({
        userId: 'current-user', // TODO: Replace with actual user ID
        type: 'data',
        title: projectType === 'rst' ? 'Projet RST créé' : projectType === 'spv' ? 'Projet SPV créé' : 'Propriété créée',
        description: projectType === 'rst'
          ? `Projet RST créé pour "${newProperty.title}" — levée de fonds sur loyers`
          : projectType === 'spv'
            ? `Projet SPV créé pour "${newProperty.title}" — tokenisation via ${spvData.companyName}`
            : `Vous avez créé la propriété "${newProperty.title}"`,
        status: 'completed',
        propertyId: newProperty.id,
        propertyTitle: newProperty.title
      });

      const successMsg = projectType === 'rst'
        ? 'Propriété et projet RST créés avec succès ! Votre bien apparaîtra dans la section investissement RST.'
        : projectType === 'spv'
          ? `Propriété et projet SPV créés ! Les parts tokenisées de ${spvData.companyName} seront disponibles pour les investisseurs.`
          : t('propertyCreationForm.alertSuccessMsg');

      Alert.alert(t('propertyCreationForm.alertSuccessTitle'), successMsg);
      onSuccess(newProperty);
      // Delay setIsOwner so the navigation completes before the tab structure changes
      setTimeout(() => setIsOwner(true), 500);
    } catch (error) {
      console.error('Error creating property:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's an authentication error
      if (errorMessage.includes('Authentication required') || errorMessage.includes('Unauthorized')) {
        Alert.alert(
          t('propertyCreationForm.alertSessionExpired'),
          t('propertyCreationForm.alertSessionExpiredMsg'),
          [{ text: t('common.ok'), onPress: () => onClose() }]
        );
      }
      // In development mode without backend, create locally
      else if (errorMessage.includes('NETWORK_ERROR_USE_MOCK') || errorMessage.includes('Network Error')) {
        Alert.alert(
          t('propertyCreationForm.alertOfflineTitle'),
          t('propertyCreationForm.alertOfflineMsg'),
          [{ text: t('common.ok'), onPress: () => onClose() }]
        );
      } else {
        Alert.alert(t('common.error'), t('propertyCreationForm.alertErrorMsg', { error: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 10,
    padding: 10,
    color: theme.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.outline + '30'
  };

  const renderStep1 = () => (
    <ThemedView style={{ gap: 10 }}>
      
      <ThemedText type ="normal" intensity ="normal" style={{ marginBottom: 4}}>
        {t('propertyCreationForm.step1Title')}
      </ThemedText>

      <ThemedView>
        <ThemedText type ="caption" intensity ="light" style={{marginBottom: 6 }}>
          {t('propertyCreationForm.titleLabel')}
        </ThemedText>
        <TextInput
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          placeholder={t('propertyCreationForm.titlePlaceholder')}
          style={inputStyle}
          placeholderTextColor={theme.text + '80'}
        />
      </ThemedView>

      <ThemedView style={{marginBottom: 6 }}>
        <ThemedText type ="normal" intensity ="normal" style={{  marginBottom: 6 }}>
          {t('propertyCreationForm.actionTypeLabel')}
        </ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
          {[{ value: 'rent', label: t('propertyCreationForm.actionRent') }, { value: 'sell', label: t('propertyCreationForm.actionSell') }].map((action) => (
            <TouchableOpacity
              key={action.value}
              onPress={() => { updateFormData('actionType', action.value); if (action.value === 'sell') setProjectType('classic'); }}
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
          {t('propertyCreationForm.propertyTypeLabel')}
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

      {/* ====== RENTAL STRATEGY SELECTOR ====== */}
      {showRentalStrategy && (
        <ThemedView style={{ marginTop: 4 }}>
          <ThemedText type="normal" intensity="normal" style={{ marginBottom: 6 }}>
            {t('propertyCreationForm.rentalStrategyLabel')}
          </ThemedText>
          <ThemedText type="caption" intensity="light" style={{ marginBottom: 10 }}>
            {t('propertyCreationForm.rentalStrategySubtitle')}
          </ThemedText>
          <ThemedView style={{ gap: 8 }}>
            {([
              {
                value: 'global' as RentalStrategy,
                label: t('propertyCreationForm.strategyGlobal'),
                description: t('propertyCreationForm.strategyGlobalDesc'),
                icon: 'home' as const
              },
              {
                value: 'per_unit' as RentalStrategy,
                label: t('propertyCreationForm.strategyPerUnit'),
                description: t('propertyCreationForm.strategyPerUnitDesc'),
                icon: 'view-module' as const
              },
              {
                value: 'both' as RentalStrategy,
                label: t('propertyCreationForm.strategyBoth'),
                description: t('propertyCreationForm.strategyBothDesc'),
                icon: 'dashboard' as const
              },
            ]).map((strategy) => (
              <TouchableOpacity
                key={strategy.value}
                onPress={() => setRentalStrategy(strategy.value)}
                style={{
                  backgroundColor: rentalStrategy === strategy.value ? theme.primary + '15' : theme.surface,
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1.5,
                  borderColor: rentalStrategy === strategy.value ? theme.primary : theme.outline + '30',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <MaterialIcons
                  name={strategy.icon}
                  size={24}
                  color={rentalStrategy === strategy.value ? theme.primary : theme.onSurface + '60'}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>
                    {strategy.label}
                  </ThemedText>
                  <ThemedText type="caption" intensity="light">
                    {strategy.description}
                  </ThemedText>
                </View>
                <MaterialIcons
                  name={rentalStrategy === strategy.value ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={22}
                  color={rentalStrategy === strategy.value ? theme.primary : theme.outline}
                />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      )}

      <ThemedView>
        <ThemedText type ="normal" intensity ="normal" style={{ marginBottom: 6 }}>
          {t('propertyCreationForm.addressLabel')}
        </ThemedText>
        <TextInput
          value={formData.address}
          onChangeText={(value) => updateFormData('address', value)}
          placeholder={t('propertyCreationForm.addressPlaceholder')}
          style={inputStyle}
          placeholderTextColor={theme.text + '80'}

        />
        <ThemedText style={{ fontSize: 11, color: formData.address.length < 5 ? theme.text : theme.onSurface + '60', marginTop: 4 }}>
          {t('propertyCreationForm.addressCharCount', { count: formData.address.length })}
        </ThemedText>
        {geocodingStatus === 'loading' && (
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
            <ActivityIndicator size="small" color={theme.primary} />
            <ThemedText style={{ fontSize: 11, color: theme.primary }}>{t('propertyCreationForm.geocodingLoading')}</ThemedText>
          </ThemedView>
        )}
        {geocodingStatus === 'success' && coordinates && (
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
            <MaterialIcons name="location-on" size={14} color="#4CAF50" />
            <ThemedText style={{ fontSize: 11, color: '#4CAF50' }}>
              {t('propertyCreationForm.geocodingSuccess', { lat: coordinates.latitude.toFixed(4), lng: coordinates.longitude.toFixed(4) })}
            </ThemedText>
          </ThemedView>
        )}
        {geocodingStatus === 'error' && (
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
            <MaterialIcons name="location-off" size={14} color={theme.error ?? '#F44336'} />
            <ThemedText style={{ fontSize: 11, color: theme.error ?? '#F44336' }}>{t('propertyCreationForm.geocodingError')}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView>
        <ThemedText type = "normal" intensity ="normal" style={{ marginBottom: 6}}>
          {t('propertyCreationForm.descriptionLabel')}
        </ThemedText>
        <TextInput
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder={t('propertyCreationForm.descriptionPlaceholder')}
          multiline
          numberOfLines={3}
          style={{ ...inputStyle, textAlignVertical: 'top', minHeight: 80 }}
          placeholderTextColor={theme.text + '80'}

        />
        <ThemedText style={{ fontSize: 11, color: formData.description.length < 20 ? theme.text : theme.onSurface + '60', marginTop: 4 }}>
          {t('propertyCreationForm.descriptionCharCount', { count: formData.description.length })}
        </ThemedText>
      </ThemedView>

      {/* ====== TYPE DE PROJET ====== */}
      <ThemedView style={{ marginTop: 4 }}>
        <ThemedText type="normal" intensity="normal" style={{ marginBottom: 4 }}>Type de projet</ThemedText>
        <ThemedText type="caption" intensity="light" style={{ marginBottom: 10 }}>
          Choisissez comment vous souhaitez financer ou tokeniser votre bien
        </ThemedText>
        <ThemedView style={{ gap: 8 }}>
          {([
            { value: 'classic' as const, label: 'Propriété classique', desc: 'Location ou vente standard', icon: 'home', color: theme.primary },
            ...(formData.actionType === 'rent' ? [
              { value: 'rst' as const, label: 'RST — Partage de loyers', desc: 'Levée de fonds sur vos loyers (sans vendre)', icon: 'home-analytics', color: theme.success ?? '#10b981' },
              { value: 'spv' as const, label: 'SPV — Tokenisation', desc: 'Tokenisez via votre société (co-actionnaires)', icon: 'office-building', color: theme.secondary },
            ] : []),
          ] as const).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setProjectType(opt.value)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                padding: 14, borderRadius: 12, borderWidth: 1.5,
                backgroundColor: projectType === opt.value ? opt.color + '12' : theme.surface,
                borderColor: projectType === opt.value ? opt.color : theme.outline + '30',
              }}
            >
              <ThemedView style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: opt.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name={opt.icon as any} size={22} color={opt.color} />
              </ThemedView>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '700', fontSize: 14, color: projectType === opt.value ? opt.color : theme.text }}>{opt.label}</ThemedText>
                <ThemedText style={{ fontSize: 11, color: theme.onSurface + '60', marginTop: 2 }}>{opt.desc}</ThemedText>
              </View>
              <MaterialIcons
                name={projectType === opt.value ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={22}
                color={projectType === opt.value ? opt.color : theme.outline}
              />
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {/* ====== CHAMPS RST ====== */}
      {projectType === 'rst' && (
        <ThemedView style={{ marginTop: 4, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: (theme.success ?? '#10b981') + '40', backgroundColor: (theme.success ?? '#10b981') + '08', gap: 12 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="home-analytics" size={18} color={theme.success ?? '#10b981'} />
            <ThemedText style={{ fontWeight: '800', fontSize: 14, color: theme.success ?? '#10b981' }}>Configuration RST</ThemedText>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Montant cible ($)</ThemedText>
              <TextInput value={rstData.targetAmountUsd} onChangeText={v => setRstData(p => ({ ...p, targetAmountUsd: v }))}
                keyboardType="numeric" placeholder="ex: 50000" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Invest. min ($)</ThemedText>
              <TextInput value={rstData.minInvestmentUsd} onChangeText={v => setRstData(p => ({ ...p, minInvestmentUsd: v }))}
                keyboardType="numeric" placeholder="500" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Part des loyers (%)</ThemedText>
              <TextInput value={rstData.revenueSharePct} onChangeText={v => setRstData(p => ({ ...p, revenueSharePct: v }))}
                keyboardType="numeric" placeholder="ex: 80" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Durée (mois)</ThemedText>
              <TextInput value={rstData.durationMonths} onChangeText={v => setRstData(p => ({ ...p, durationMonths: v }))}
                keyboardType="numeric" placeholder="24" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Loyer mensuel estimé ($)</ThemedText>
              <TextInput value={rstData.baseMonthlyRent} onChangeText={v => setRstData(p => ({ ...p, baseMonthlyRent: v }))}
                keyboardType="numeric" placeholder="ex: 1200" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Rendement cible (%/an)</ThemedText>
              <TextInput value={rstData.targetAnnualYield} onChangeText={v => setRstData(p => ({ ...p, targetAnnualYield: v }))}
                keyboardType="numeric" placeholder="ex: 7.5" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
          </ThemedView>

          <ThemedView>
            <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Plafond de retour (% du capital, ex: 130)</ThemedText>
            <TextInput value={rstData.maxReturnPct} onChangeText={v => setRstData(p => ({ ...p, maxReturnPct: v }))}
              keyboardType="numeric" placeholder="130" style={inputStyle} placeholderTextColor={theme.text + '80'} />
          </ThemedView>

          <ThemedView style={{ padding: 10, borderRadius: 8, backgroundColor: (theme.success ?? '#10b981') + '15' }}>
            <ThemedText style={{ fontSize: 11, color: theme.onSurface + '70', lineHeight: 16 }}>
              💡 Les investisseurs recevront {rstData.revenueSharePct || '?'}% des loyers mensuels pendant {rstData.durationMonths} mois. Les tokens seront brûlés automatiquement à {rstData.maxReturnPct}% de retour.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {/* ====== CHAMPS SPV ====== */}
      {projectType === 'spv' && (
        <ThemedView style={{ marginTop: 4, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: theme.secondary + '40', backgroundColor: theme.secondary + '08', gap: 12 }}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="office-building" size={18} color={theme.secondary} />
            <ThemedText style={{ fontWeight: '800', fontSize: 14, color: theme.secondary }}>Configuration SPV</ThemedText>
          </ThemedView>

          <ThemedView>
            <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Nom légal de la société (SPV)</ThemedText>
            <TextInput value={spvData.companyName} onChangeText={v => setSpvData(p => ({ ...p, companyName: v }))}
              placeholder="ex: SCI Paris Prestige" style={inputStyle} placeholderTextColor={theme.text + '80'} />
          </ThemedView>

          <ThemedView>
            <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>N° d'enregistrement de la société</ThemedText>
            <TextInput value={spvData.companyRegistration} onChangeText={v => setSpvData(p => ({ ...p, companyRegistration: v }))}
              placeholder="ex: FR-892345678" style={inputStyle} placeholderTextColor={theme.text + '80'} />
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Nombre total de tokens</ThemedText>
              <TextInput value={spvData.totalShares} onChangeText={v => setSpvData(p => ({ ...p, totalShares: v }))}
                keyboardType="numeric" placeholder="10000" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Prix / token ($)</ThemedText>
              <TextInput value={spvData.sharePrice} onChangeText={v => setSpvData(p => ({ ...p, sharePrice: v }))}
                keyboardType="numeric" placeholder="100" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Invest. min ($)</ThemedText>
              <TextInput value={spvData.minimumInvestment} onChangeText={v => setSpvData(p => ({ ...p, minimumInvestment: v }))}
                keyboardType="numeric" placeholder="500" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Investisseurs max</ThemedText>
              <TextInput value={spvData.maxInvestors} onChangeText={v => setSpvData(p => ({ ...p, maxInvestors: v }))}
                keyboardType="numeric" placeholder="500" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Rendement annuel (%)</ThemedText>
              <TextInput value={spvData.annualYieldPct} onChangeText={v => setSpvData(p => ({ ...p, annualYieldPct: v }))}
                keyboardType="numeric" placeholder="ex: 5.8" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Occupation estimée (%)</ThemedText>
              <TextInput value={spvData.occupancyRate} onChangeText={v => setSpvData(p => ({ ...p, occupancyRate: v }))}
                keyboardType="numeric" placeholder="95" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Juridiction</ThemedText>
              <TextInput value={spvData.jurisdiction} onChangeText={v => setSpvData(p => ({ ...p, jurisdiction: v }))}
                placeholder="France" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>Standard token</ThemedText>
              <TextInput value={spvData.tokenStandard} onChangeText={v => setSpvData(p => ({ ...p, tokenStandard: v }))}
                placeholder="ERC-3643" style={inputStyle} placeholderTextColor={theme.text + '80'} />
            </ThemedView>
          </ThemedView>

          {spvData.totalShares && spvData.sharePrice && (
            <ThemedView style={{ padding: 10, borderRadius: 8, backgroundColor: theme.secondary + '15' }}>
              <ThemedText style={{ fontSize: 11, color: theme.onSurface + '70', lineHeight: 16 }}>
                💡 Valorisation totale : <ThemedText style={{ fontWeight: '700', color: theme.secondary }}>
                  ${(parseFloat(spvData.totalShares || '0') * parseFloat(spvData.sharePrice || '0')).toLocaleString()}
                </ThemedText> · Standard ERC-3643 avec KYC obligatoire
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );

  // Hotel room type helpers
  const toggleHotelRoom = (roomId: string, roomName: string, category: string, capacity: number, description: string) => {
    setHotelRoomTypes(prev => {
      const exists = prev.find(r => r.roomTypeId === roomId);
      if (exists) {
        return prev.filter(r => r.roomTypeId !== roomId);
      }
      return [...prev, {
        roomTypeId: roomId,
        name: roomName,
        category,
        capacity,
        pricePerNight: 0,
        available: 0,
        amenities: [],
        description,
        rooms: [],
      }];
    });
  };

  const pickRoomImages = async (roomIndex: number) => {
    const result = await launchImageLibraryWithFallback({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map(a => a.uri);
      const newBase64: string[] = [];

      for (const asset of result.assets) {
        try {
          let base64Data: string;
          if (asset.base64) {
            base64Data = asset.base64;
          } else {
            base64Data = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any,
            });
          }
          const mimeType = asset.mimeType || (asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
          newBase64.push(`data:${mimeType};base64,${base64Data}`);
        } catch (error) {
          console.error(`❌ Failed to convert room image:`, error);
        }
      }

      if (newBase64.length > 0) {
        setHotelRooms(prev => prev.map((room, idx) => {
          if (idx !== roomIndex) return room;
          return {
            ...room,
            images: [...room.images, ...newBase64],
            imageUris: [...room.imageUris, ...newUris],
          };
        }));
      }
    }
  };

  const removeRoomImage = (roomIndex: number, imageIndex: number) => {
    setHotelRooms(prev => prev.map((room, idx) => {
      if (idx !== roomIndex) return room;
      return {
        ...room,
        images: room.images.filter((_, i) => i !== imageIndex),
        imageUris: room.imageUris.filter((_, i) => i !== imageIndex),
      };
    }));
  };

  const updateRoomName = (roomIndex: number, name: string) => {
    setHotelRooms(prev => prev.map((room, idx) => {
      if (idx !== roomIndex) return room;
      return { ...room, roomName: name };
    }));
  };

  const isRoomSelected = (roomId: string) => hotelRoomTypes.some(r => r.roomTypeId === roomId);

  // ============================================
  // HOTEL ROOM TYPE CONFIG HELPERS
  // ============================================
  const updateHotelRoomTypeField = (typeIndex: number, field: keyof HotelRoomConfig, value: any) => {
    setHotelRoomTypes(prev => prev.map((rt, idx) => {
      if (idx !== typeIndex) return rt;
      return { ...rt, [field]: value };
    }));
  };

  const toggleHotelTypeAmenity = (typeIndex: number, amenity: string) => {
    setHotelRoomTypes(prev => prev.map((rt, idx) => {
      if (idx !== typeIndex) return rt;
      const has = rt.amenities.includes(amenity);
      return {
        ...rt,
        amenities: has ? rt.amenities.filter(a => a !== amenity) : [...rt.amenities, amenity],
      };
    }));
  };

  // ============================================
  // UNIT MANAGEMENT HELPERS
  // ============================================
  const pickUnitImages = async (unitIndex: number) => {
    const result = await launchImageLibraryWithFallback({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map(a => a.uri);
      const newBase64: string[] = [];

      for (const asset of result.assets) {
        try {
          let base64Data: string;
          if (asset.base64) {
            base64Data = asset.base64;
          } else {
            base64Data = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64' as any,
            });
          }
          const mimeType = asset.mimeType || (asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
          newBase64.push(`data:${mimeType};base64,${base64Data}`);
        } catch (error) {
          console.error(`Failed to convert unit image:`, error);
        }
      }

      if (newBase64.length > 0) {
        setPropertyUnits(prev => prev.map((unit, idx) => {
          if (idx !== unitIndex) return unit;
          return {
            ...unit,
            images: [...unit.images, ...newBase64],
            imageUris: [...unit.imageUris, ...newUris],
          };
        }));
      }
    }
  };

  const removeUnitImage = (unitIndex: number, imageIndex: number) => {
    setPropertyUnits(prev => prev.map((unit, idx) => {
      if (idx !== unitIndex) return unit;
      return {
        ...unit,
        images: unit.images.filter((_, i) => i !== imageIndex),
        imageUris: unit.imageUris.filter((_, i) => i !== imageIndex),
      };
    }));
  };

  const updateUnitField = (unitIndex: number, field: keyof PropertyUnitEntry, value: any) => {
    setPropertyUnits(prev => prev.map((unit, idx) => {
      if (idx !== unitIndex) return unit;
      return { ...unit, [field]: value };
    }));
  };

  const toggleUnitAmenity = (unitIndex: number, amenity: string) => {
    setPropertyUnits(prev => prev.map((unit, idx) => {
      if (idx !== unitIndex) return unit;
      const newAmenities = unit.amenities.includes(amenity)
        ? unit.amenities.filter(a => a !== amenity)
        : [...unit.amenities, amenity];
      return { ...unit, amenities: newAmenities };
    }));
  };


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

        {!noRoomsAllowed && (config.showRooms || config.showBedrooms) && (
          <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
            {config.showRooms && (
              <ThemedView style={{ flex: 1 }}>
                <ThemedText type="caption" intensity="light" style={{ fontWeight: '600', marginBottom: 6 }}>
                  {isHotel ? 'Chambres disponibles' : canHaveUnits ? 'Nombre d\'unités/chambres' : 'Pièces'}
                </ThemedText>
                <TextInput
                  value={formData.generalHInfo?.rooms.toString()}
                  onChangeText={(value) => updateFormData('generalHInfo.rooms', parseInt(value) || 0)}
                  keyboardType="numeric"
                  style={inputStyle}
                  placeholderTextColor={theme.text + '80'}

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
                  placeholderTextColor={theme.text + '80'}

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
                placeholderTextColor={theme.text + '80'}

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
              placeholderTextColor={theme.text + '80'}

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
            placeholderTextColor={theme.text + '80'}

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
          <ThemedView style={{ marginTop: 8, gap: 12 }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText type="normaltitle" intensity="strong">
                Types de chambres
              </ThemedText>
              {hotelRoomTypes.length > 0 && (
                <ThemedView style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <ThemedText type = "caption" style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>
                    {hotelRoomTypes.length} type{hotelRoomTypes.length > 1 ? 's' : ''}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            {HOTEL_ROOM_CATEGORIES.map((cat) => (
              <ThemedView key={cat.category} style={{ gap: 6 }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name={cat.icon as any} size={18} color={theme.primary} />
                  <ThemedText type="caption" intensity="strong" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {cat.label}
                  </ThemedText>
                </ThemedView>

                {cat.rooms.map((room) => {
                  const selected = isRoomSelected(room.id);
                  const config = hotelRoomTypes.find(r => r.roomTypeId === room.id);
                  return (
                    <ThemedView key={room.id}>
                      <TouchableOpacity
                        onPress={() => toggleHotelRoom(room.id, room.name, cat.category, room.capacity, room.description)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: selected ? theme.primary + '12' : theme.surface,
                          borderRadius: 10,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: selected ? theme.primary + '40' : theme.outline + '20',
                        }}
                      >
                        <MaterialIcons
                          name={selected ? 'check-box' : 'check-box-outline-blank'}
                          size={22}
                          color={selected ? theme.primary : theme.onSurface + '50'}
                        />
                        <ThemedView style={{ flex: 1, marginLeft: 10, backgroundColor: 'transparent' }}>
                          <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>{room.name}</ThemedText>
                          <ThemedText type="caption" intensity="light" style={{ marginTop: 2 }}>
                            {room.description} - {room.capacity} pers.
                          </ThemedText>
                        </ThemedView>
                      </TouchableOpacity>

                    </ThemedView>
                  );
                })}
              </ThemedView>
            ))}
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

        {/* Photos section - always visible for general property photos */}
        <ThemedView>
          <ThemedText type="normal" intensity="light" style={{ marginBottom: 6}}>
            Photos de la propriété * (au moins 1)
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

        {/* Hotel per-room photos (hotel only) */}
        {isHotel && hotelRooms.length > 0 && (
          <ThemedView style={{ gap: 10 }}>
            <ThemedText type="normaltitle" intensity="strong">
              Chambres ({hotelRooms.length})
            </ThemedText>
            <ThemedText type="caption" intensity="light">
              Saisissez le nom ou numéro de chaque chambre et ajoutez au moins une photo.
            </ThemedText>

            {hotelRooms.map((roomEntry, roomIdx) => (
              <ThemedView
                key={roomEntry.roomId}
                style={{
                  borderRadius: 10,
                  padding: 12,
                  gap: 8,
                }}
              >
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ThemedText type="caption" intensity="strong" style={{ fontSize: 13 }}>
                    Chambre {roomIdx + 1}
                  </ThemedText>
                  {roomEntry.images.length === 0 && (
                    <ThemedView style={{ backgroundColor: theme.error + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <ThemedText style={{ color: theme.error, fontSize: 10, fontWeight: '600' }}>
                        Photo requise
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>

                {/* Room name/number field */}
                <ThemedView>
                  <ThemedText  type="caption" intensity="light" style={{ marginBottom: 4, padding:2}}>
                    Nom / Numéro *
                  </ThemedText>
                  <TextInput
                    value={roomEntry.roomName}
                    onChangeText={(v) => updateRoomName(roomIdx, v)}
                    placeholder={`Ex: Chambre ${roomIdx + 1}, Suite A, 101...`}
                    style={inputStyle}
                    placeholderTextColor={theme.text + '80'}

                  />
                </ThemedView>

                {/* Room photos */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  {roomEntry.imageUris.map((uri, imgIdx) => (
                    <ThemedView key={imgIdx} style={{ marginRight: 6, position: 'relative' }}>
                      <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 6 }} />
                      <TouchableOpacity
                        onPress={() => removeRoomImage(roomIdx, imgIdx)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: -4,
                          backgroundColor: theme.error,
                          borderRadius: 8,
                          width: 16,
                          height: 16,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MaterialIcons name="close" size={10} color="white" />
                      </TouchableOpacity>
                    </ThemedView>
                  ))}

                  <TouchableOpacity
                    onPress={() => pickRoomImages(roomIdx)}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      borderColor: theme.primary,
                      backgroundColor: theme.primary + '10',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons name="add-a-photo" size={20} color={theme.primary} />
                  </TouchableOpacity>
                </ScrollView>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* ====== HOTEL PER-TYPE CONFIG (multiple types selected) ====== */}
        {hasMultipleHotelTypes && (() => {
          const totalRooms = formData.generalHInfo?.rooms || 0;
          const totalAssigned = hotelRoomTypes.reduce((sum, rt) => sum + rt.available, 0);
          const remaining = totalRooms - totalAssigned;
          const isBalanced = totalAssigned === totalRooms;

          return (
          <ThemedView style={{ gap: 10 }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText type="normaltitle" intensity="strong">
                Configuration par type ({hotelRoomTypes.length})
              </ThemedText>
              <ThemedView style={{ backgroundColor: theme.primary + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '600', fontSize: 11 }}>
                  Prix par type
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={{ backgroundColor: theme.surfaceVariant, padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: theme.primary }}>
              <ThemedText type="caption" intensity="light">
                Vous avez sélectionné plusieurs types de chambres. Répartissez vos {totalRooms} chambre{totalRooms > 1 ? 's' : ''} entre les types et configurez le prix et les équipements pour chacun.
              </ThemedText>
            </ThemedView>

            {/* Room distribution counter */}
            <ThemedView style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              padding: 10, borderRadius: 10,
              backgroundColor: isBalanced ? '#10b98115' : remaining < 0 ? '#ef444415' : '#F59E0B15',
              borderWidth: 1,
              borderColor: isBalanced ? '#10b98140' : remaining < 0 ? '#ef444440' : '#F59E0B40',
              gap: 8,
            }}>
              <MaterialCommunityIcons
                name={isBalanced ? 'check-circle' : 'alert-circle'}
                size={18}
                color={isBalanced ? '#10b981' : remaining < 0 ? '#ef4444' : '#F59E0B'}
              />
              <ThemedText style={{
                fontWeight: '700', fontSize: 13,
                color: isBalanced ? '#10b981' : remaining < 0 ? '#ef4444' : '#F59E0B',
              }}>
                {totalAssigned} / {totalRooms} chambres réparties
                {!isBalanced && remaining > 0 ? ` (${remaining} restante${remaining > 1 ? 's' : ''})` : ''}
                {remaining < 0 ? ` (${Math.abs(remaining)} en trop)` : ''}
              </ThemedText>
            </ThemedView>

            {hotelRoomTypes.map((roomType, typeIdx) => {
              const canAdd = totalAssigned < totalRooms;
              return (
              <ThemedView key={roomType.roomTypeId} style={{ borderRadius: 12, borderWidth: 1, borderColor: theme.outline + '30', overflow: 'hidden' }}>
                {/* Collapsible header */}
                <TouchableOpacity
                  onPress={() => setExpandedHotelTypeIndex(expandedHotelTypeIndex === typeIdx ? null : typeIdx)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    gap: 10,
                    backgroundColor: expandedHotelTypeIndex === typeIdx ? theme.primary + '08' : 'transparent',
                  }}
                >
                  <ThemedView style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: theme.primary + '20',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MaterialCommunityIcons name="bed" size={16} color={theme.primary} />
                  </ThemedView>
                  <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>
                      {roomType.name}
                      {roomType.available > 0 ? ` (${roomType.available})` : ''}
                    </ThemedText>
                    <ThemedText type="caption" intensity="light">
                      {roomType.description} - {roomType.capacity} pers.
                      {roomType.pricePerNight > 0 ? ` - ${roomType.pricePerNight} ${formData.ownerCriteria.currency}/nuit` : ''}
                    </ThemedText>
                  </ThemedView>
                  <MaterialIcons
                    name={expandedHotelTypeIndex === typeIdx ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color={theme.onSurface + '60'}
                  />
                </TouchableOpacity>

                {/* Expanded content */}
                {expandedHotelTypeIndex === typeIdx && (
                  <ThemedView style={{ padding: 12, gap: 12, borderTopWidth: 1, borderTopColor: theme.outline + '20' }}>
                    {/* Price per night */}
                    <ThemedView>
                      <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                        Prix par nuit ({formData.ownerCriteria.currency}) *
                      </ThemedText>
                      <TextInput
                        value={roomType.pricePerNight > 0 ? roomType.pricePerNight.toString() : ''}
                        onChangeText={(v) => updateHotelRoomTypeField(typeIdx, 'pricePerNight', parseInt(v) || 0)}
                        keyboardType="numeric"
                        placeholder="Ex: 25000"
                        style={inputStyle}
                        placeholderTextColor={theme.text + '80'}

                      />
                    </ThemedView>

                    {/* Number of rooms of this type */}
                    <ThemedView>
                      <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                        Nombre de chambres de ce type *
                      </ThemedText>
                      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity
                          onPress={() => updateHotelRoomTypeField(typeIdx, 'available', Math.max(0, roomType.available - 1))}
                          style={{
                            width: 36, height: 36, borderRadius: 18,
                            backgroundColor: theme.surfaceVariant,
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <MaterialIcons name="remove" size={20} color={theme.onSurface} />
                        </TouchableOpacity>
                        <ThemedText style={{ fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' }}>
                          {roomType.available}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() => {
                            if (canAdd) updateHotelRoomTypeField(typeIdx, 'available', roomType.available + 1);
                          }}
                          disabled={!canAdd}
                          style={{
                            width: 36, height: 36, borderRadius: 18,
                            backgroundColor: canAdd ? theme.primary + '20' : theme.surfaceVariant,
                            alignItems: 'center', justifyContent: 'center',
                            opacity: canAdd ? 1 : 0.4,
                          }}
                        >
                          <MaterialIcons name="add" size={20} color={canAdd ? theme.primary : theme.onSurface + '40'} />
                        </TouchableOpacity>
                      </ThemedView>
                    </ThemedView>

                    {/* Amenities for this type */}
                    <ThemedView>
                      <ThemedText type="caption" intensity="light" style={{ marginBottom: 6 }}>
                        Équipements spécifiques
                      </ThemedText>
                      <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {UNIT_AMENITIES.map((amenity) => {
                          const selected = roomType.amenities.includes(amenity);
                          return (
                            <TouchableOpacity
                              key={amenity}
                              onPress={() => toggleHotelTypeAmenity(typeIdx, amenity)}
                              style={{
                                backgroundColor: selected ? theme.primary : theme.surface,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderWidth: 1,
                                borderColor: selected ? theme.primary : theme.outline + '30',
                              }}
                            >
                              <ThemedText type="caption" style={{
                                color: selected ? 'white' : theme.onSurface,
                                fontSize: 11,
                              }}>
                                {amenity}
                              </ThemedText>
                            </TouchableOpacity>
                          );
                        })}
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                )}
              </ThemedView>
              );
            })}
          </ThemedView>
          );
        })()}

        {/* ====== UNIT MANAGEMENT SECTION (non-hotel) ====== */}
        {showUnitManagement && (
          <ThemedView style={{ gap: 10 }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText type="normaltitle" intensity="strong">
                Unités ({propertyUnits.length})
              </ThemedText>
              {unitsAreRentable && (
                <ThemedView style={{ backgroundColor: theme.primary + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '600', fontSize: 11 }}>
                    Location par unité
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            {unitsAreDescriptiveOnly && (
              <ThemedView style={{ backgroundColor: theme.surfaceVariant, padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: theme.primary }}>
                <ThemedText type="caption" intensity="light">
                  Les unités sont descriptives uniquement. Elles montrent la composition de votre bien aux locataires/acheteurs potentiels.
                </ThemedText>
              </ThemedView>
            )}

            {propertyUnits.map((unit, unitIdx) => (
              <ThemedView key={unit.unitId} style={{ borderRadius: 12, borderWidth: 1, borderColor: theme.outline + '30', overflow: 'hidden' }}>
                {/* Collapsible header */}
                <TouchableOpacity
                  onPress={() => setExpandedUnitIndex(expandedUnitIndex === unitIdx ? null : unitIdx)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    gap: 10,
                    backgroundColor: expandedUnitIndex === unitIdx ? theme.primary + '08' : 'transparent',
                  }}
                >
                  <MaterialIcons
                    name={expandedUnitIndex === unitIdx ? 'expand-less' : 'expand-more'}
                    size={24}
                    color={theme.onSurface}
                  />
                  <ThemedText style={{ flex: 1, fontWeight: '600', fontSize: 14 }}>
                    {unit.unitName || `Unité ${unitIdx + 1}`}
                  </ThemedText>

                  {unitsAreRentable && unit.images.length === 0 && (
                    <ThemedView style={{ backgroundColor: theme.error + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <ThemedText style={{ color: theme.error, fontSize: 10, fontWeight: '600' }}>
                        Photo requise
                      </ThemedText>
                    </ThemedView>
                  )}
                  <ThemedText type="caption" intensity="light">{unit.images.length} photo(s)</ThemedText>
                </TouchableOpacity>

                {/* Expanded content */}
                {expandedUnitIndex === unitIdx && (
                  <ThemedView style={{ padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: theme.outline + '20' }}>
                    {/* Unit name */}
                    <ThemedView>
                      <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                        Nom / Identifiant *
                      </ThemedText>
                      <TextInput
                        value={unit.unitName}
                        onChangeText={(v) => updateUnitField(unitIdx, 'unitName', v)}
                        placeholder="Ex: Chambre 1, Suite A, Room 203..."
                        style={inputStyle}
                        placeholderTextColor={theme.text + '80'}

                      />
                    </ThemedView>

                    {/* Unit description */}
                    <ThemedView>
                      <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                        Description {unitsAreRentable ? '*' : '(optionnel)'}
                      </ThemedText>
                      <TextInput
                        value={unit.description}
                        onChangeText={(v) => updateUnitField(unitIdx, 'description', v)}
                        placeholder="Décrivez cette unité..."
                        multiline
                        numberOfLines={2}
                        style={{ ...inputStyle, textAlignVertical: 'top', minHeight: 60 }}
                        placeholderTextColor={theme.text + '80'}

                      />
                    </ThemedView>

                    {/* Unit photos */}
                    <ThemedView>
                      <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                        Photos {unitsAreRentable ? '* (au moins 1)' : '(optionnel)'}
                      </ThemedText>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                        {unit.imageUris.map((uri, imgIdx) => (
                          <ThemedView key={imgIdx} style={{ marginRight: 6, position: 'relative' }}>
                            <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 6 }} />
                            <TouchableOpacity
                              onPress={() => removeUnitImage(unitIdx, imgIdx)}
                              style={{
                                position: 'absolute',
                                top: -2,
                                right: -4,
                                backgroundColor: theme.error,
                                borderRadius: 8,
                                width: 16,
                                height: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <MaterialIcons name="close" size={10} color="white" />
                            </TouchableOpacity>
                          </ThemedView>
                        ))}

                        <TouchableOpacity
                          onPress={() => pickUnitImages(unitIdx)}
                          style={{
                            width: 70,
                            height: 70,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            borderColor: theme.primary,
                            backgroundColor: theme.primary + '10',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MaterialIcons name="add-a-photo" size={20} color={theme.primary} />
                        </TouchableOpacity>
                      </ScrollView>
                    </ThemedView>

                    {/* Unit amenities */}
                    <ThemedView>
                      <ThemedText type="caption" intensity="light" style={{ marginBottom: 6 }}>
                        Aménités privées
                      </ThemedText>
                      <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {UNIT_AMENITIES.map(amenity => (
                          <TouchableOpacity
                            key={amenity}
                            onPress={() => toggleUnitAmenity(unitIdx, amenity)}
                            style={{
                              backgroundColor: unit.amenities.includes(amenity) ? theme.primary : theme.surface,
                              borderRadius: 10,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderWidth: 1,
                              borderColor: unit.amenities.includes(amenity) ? theme.primary : theme.outline + '30'
                            }}
                          >
                            <ThemedText type="caption" style={{
                              color: unit.amenities.includes(amenity) ? 'white' : theme.onSurface,
                              fontSize: 11,
                            }}>
                              {amenity}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ThemedView>
                    </ThemedView>

                    {/* Capacity + Price row */}
                    <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                      <ThemedView style={{ flex: 1 }}>
                        <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                          Capacité (personnes)
                        </ThemedText>
                        <TextInput
                          value={unit.capacity.toString()}
                          onChangeText={(v) => updateUnitField(unitIdx, 'capacity', parseInt(v) || 1)}
                          keyboardType="numeric"
                          placeholder="1"
                          style={inputStyle}
                          placeholderTextColor={theme.text + '80'}

                        />
                      </ThemedView>

                      {unitsAreRentable && (
                        <ThemedView style={{ flex: 1 }}>
                          <ThemedText type="caption" intensity="light" style={{ marginBottom: 4 }}>
                            Prix par unité *
                          </ThemedText>
                          <TextInput
                            value={unit.price > 0 ? unit.price.toString() : ''}
                            onChangeText={(v) => updateUnitField(unitIdx, 'price', parseInt(v) || 0)}
                            keyboardType="numeric"
                            placeholder="0"
                            style={inputStyle}
                            placeholderTextColor={theme.text + '80'}

                          />
                        </ThemedView>
                      )}
                    </ThemedView>
                  </ThemedView>
                )}
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Section documents obligatoires pour la vente */}
        {formData.actionType === 'sell' && (
          <ThemedView style={{ marginTop: 16 }}>
            {/* Info banner */}
            <ThemedView style={{
              backgroundColor: theme.error + '10',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.error + '30',
              flexDirection: 'row',
              gap: 12,
              marginBottom: 12
            }}>
              <MaterialCommunityIcons name="file-document-alert" size={28} color={theme.error} />
              <ThemedView style={{ flex: 1,backgroundColor:'transparent' }}>
                <ThemedText type="normal" intensity="strong" style={{ color: theme.error }}>
                  Documents OBLIGATOIRES pour la vente
                </ThemedText>
                <ThemedText type="caption" intensity="light" style={{ marginTop: 4, lineHeight: 18 }}>
                  Pour vendre cette propriété, vous devez fournir les documents légaux suivants :
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Required documents */}
            <ThemedText type="normal" intensity="normal" style={{ marginBottom: 8 }}>
              Documents requis *
            </ThemedText>
            <ThemedView style={{ gap: 10 }}>
              {getCurrentSaleDocRequirements().required.map((docType) => {
                const uploadedDoc = saleDocuments.find(doc => doc.type === docType);
                const isUploaded = !!uploadedDoc;

                return (
                  <ThemedView key={docType} style={{
                    backgroundColor: isUploaded ?'transparent' : theme.surface,
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: isUploaded ? theme.success : theme.error + '40',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <ThemedView style={{
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: isUploaded ? "transparent" : theme.error + '15',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <MaterialCommunityIcons
                        name={isUploaded ? "check-circle" : "file-document-outline"}
                        size={22}
                        color={isUploaded ? theme.success : theme.error}
                      />
                    </ThemedView>
                    <ThemedView style={{ flex: 1 }}>
                      <ThemedText type="normal" style={{ color: isUploaded ? theme.success : theme.onSurface }}>
                        {docType}
                      </ThemedText>
                      {isUploaded && (
                        <ThemedText type="caption" intensity="light" numberOfLines={1}>
                          {uploadedDoc.name}
                        </ThemedText>
                      )}
                    </ThemedView>
                    {isUploaded ? (
                      <TouchableOpacity onPress={() => removeSaleDocument(docType)}>
                        <MaterialIcons name="close" size={20} color={theme.error} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => pickSaleDocuments(docType)}
                        style={{
                          backgroundColor: theme.primary,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8
                        }}
                      >
                        <ThemedText type="caption" style={{ color: 'white', fontWeight: '600' }}>
                          Ajouter
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </ThemedView>
                );
              })}
            </ThemedView>

            {/* Recommended documents */}
            {getCurrentSaleDocRequirements().recommended.length > 0 && (
              <ThemedView style={{ marginTop: 16 }}>
                <ThemedText type="normal" intensity="light" style={{ marginBottom: 8 }}>
                  Documents recommandés (optionnel)
                </ThemedText>
                <ThemedView style={{ gap: 8 }}>
                  {getCurrentSaleDocRequirements().recommended.map((docType) => {
                    const uploadedDoc = saleDocuments.find(doc => doc.type === docType);
                    const isUploaded = !!uploadedDoc;

                    return (
                      <TouchableOpacity
                        key={docType}
                        onPress={() => isUploaded ? removeSaleDocument(docType) : pickSaleDocuments(docType)}
                        style={{
                          backgroundColor: isUploaded ? "transparent" : theme.surfaceVariant,
                          borderRadius: 10,
                          padding: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          borderWidth: 1,
                          borderColor: isUploaded ? theme.success + '30' : theme.outline + '20'
                        }}
                      >
                        <MaterialCommunityIcons
                          name={isUploaded ? "check-circle" : "file-plus-outline"}
                          size={20}
                          color={isUploaded ? theme.success : theme.onSurface + '60'}
                        />
                        <ThemedView style={{ flex: 1, backgroundColor:"transparent" }}>
                          <ThemedText type="caption" style={{ color: isUploaded ? theme.success : theme.onSurface }}>
                            {docType}
                          </ThemedText>
                          {isUploaded && (
                            <ThemedText type="caption" intensity="light" numberOfLines={1} style={{ fontSize: 11 }}>
                              {uploadedDoc.name}
                            </ThemedText>
                          )}
                        </ThemedView>
                        {isUploaded && (
                          <MaterialIcons name="close" size={18} color={theme.error} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ThemedView>
              </ThemedView>
            )}

            {/* Progress indicator */}
            <ThemedView style={{
              marginTop: 16,
              backgroundColor: theme.surfaceVariant,
              borderRadius: 10,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10
            }}>
              <ThemedView style={{
                flex: 1,
                backgroundColor: theme.outline + '30',
                borderRadius: 4,
                height: 6
              }}>
                <ThemedView style={{
                  backgroundColor: hasAllRequiredSaleDocuments() ? theme.success : theme.primary,
                  borderRadius: 4,
                  height: 6,
                  width: `${(saleDocuments.filter(doc =>
                    getCurrentSaleDocRequirements().required.includes(doc.type)
                  ).length / getCurrentSaleDocRequirements().required.length) * 100}%`
                }} />
              </ThemedView>
              <ThemedText type="caption" intensity="light">
                {saleDocuments.filter(doc =>
                  getCurrentSaleDocRequirements().required.includes(doc.type)
                ).length}/{getCurrentSaleDocRequirements().required.length}
              </ThemedText>
            </ThemedView>
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
      if (hasMultipleHotelTypes) {
        return 'Prix de référence (à partir de) *';
      }
      if (showRentalStrategy && rentalStrategy === 'per_unit') {
        return 'Prix de référence (à partir de) *';
      }
      if (showRentalStrategy && rentalStrategy === 'both') {
        return config.rentLabel + ' (prix global) *';
      }
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
            placeholderTextColor={theme.text + '80'}

            

          />
        </ThemedView>

        {/* Sélection de la devise */}
        <ThemedView>
          <ThemedText type="normal" style={{ marginBottom: 8 }}>
            Devise *
          </ThemedText>
          <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.value}
                onPress={() => updateFormData('ownerCriteria.currency', currency.value)}
                style={{
                  flex: 1,
                  minWidth: 70,
                  backgroundColor: formData.ownerCriteria.currency === currency.value ? theme.primary : theme.surface,
                  borderRadius: 10,
                  padding: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: formData.ownerCriteria.currency === currency.value ? theme.primary : theme.outline + '30'
                }}
              >
                <ThemedText type="body" style={{
                  color: formData.ownerCriteria.currency === currency.value ? 'white' : theme.onSurface,
                  fontWeight: '700',
                  fontSize: 16,
                  marginBottom: 2
                }}>
                  {currency.symbol}
                </ThemedText>
                <ThemedText type="caption" style={{
                  color: formData.ownerCriteria.currency === currency.value ? 'white' : theme.onSurface + '80',
                  fontSize: 11
                }}>
                  {currency.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
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
        {formData .propertyType !== "hotel" && formData.propertyType !== "chalet" &&
        <TouchableOpacity
          onPress={() => setCryptoEnabled(!cryptoEnabled)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: cryptoEnabled ? theme.primary + "20" : theme.surfaceVariant,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1.5,
            borderColor: cryptoEnabled ? theme.primary : theme.outline + '30'
          }}
        >
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor:"transparent" }}>
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
            <ThemedView style={{ flex: 1, backgroundColor:"transparent" }}>
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
            justifyContent: 'center',
            right:40
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
        }

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
              placeholderTextColor={theme.text + '80'}


            />
          </ThemedView>
        )}

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
              placeholderTextColor={theme.text + '80'}


            />
          </ThemedView>
        )}

        {/* Délai de paiement exigé (optionnel) */}
        <ThemedView style={{ marginBottom: 16 }}>
          <ThemedText type="normal" style={{ marginBottom: 4 }}>
            Délai de paiement exigé (jours) <ThemedText type="caption" style={{ color: theme.onSurface + '60' }}>— facultatif</ThemedText>
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.onSurface + '60', marginBottom: 8 }}>
            Nombre de jours max accordé au client pour payer après acceptation. Laissez vide pour utiliser le délai par défaut (2j location, 7j vente).
          </ThemedText>
          <TextInput
            value={(formData.ownerCriteria as any).paymentDeadlineDays?.toString() || ''}
            onChangeText={(value) => updateFormData('ownerCriteria.paymentDeadlineDays', value ? parseInt(value) || null : null)}
            keyboardType="numeric"
            placeholder="Ex: 5"
            style={inputStyle}
            placeholderTextColor={theme.text + '80'}

          />
        </ThemedView>

        {config.showSituations && formData.actionType === 'rent'&& formData.propertyType !=="hotel" && (
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

        {/* Garant requis - Toggle */}
        {formData.actionType === 'rent' && (
          <TouchableOpacity
            onPress={() => updateFormData('ownerCriteria.guarantorRequired', !formData.ownerCriteria.guarantorRequired)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: formData.ownerCriteria.guarantorRequired ? theme.primary + '15' : theme.surfaceVariant,
              borderRadius: 12,
              padding: 14,
              borderWidth: 1.5,
              borderColor: theme.outline 
            }}
          >
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor:"transparent" }}>
              <ThemedView style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: formData.ownerCriteria.guarantorRequired ? theme.primary : theme.surface,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MaterialIcons
                  name="shield"
                  size={20}
                  color={formData.ownerCriteria.guarantorRequired ? 'white' : theme.onSurface + '60'}
                />
              </ThemedView>
              <ThemedView style={{ flex: 1, backgroundColor:"transparent" }}>
                <ThemedText type="normal" intensity="light" style={{ marginBottom: 2 }}>
                  Garant requis
                </ThemedText>
                <ThemedText type="caption" intensity="light">
                  Exiger un garant pour la location
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              backgroundColor: formData.ownerCriteria.guarantorRequired ? theme.primary : theme.outline,
              padding: 2,
              justifyContent: 'center',
              right:40

            }}>
              <ThemedView style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'white',
                transform: [{ translateX: formData.ownerCriteria.guarantorRequired ? 22 : 0 }]
              }} />
            </ThemedView>
          </TouchableOpacity>
        )}

        {/* Documents requis - Toggle */}
        {formData.actionType === 'rent' && (
          <TouchableOpacity
            onPress={() => updateFormData('ownerCriteria.isdocumentRequired', !formData.ownerCriteria.isdocumentRequired)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: formData.ownerCriteria.isdocumentRequired ? theme.primary + '15' : theme.surface,
              borderRadius: 12,
              padding: 14,
              borderWidth: 1.5,
              borderColor: formData.ownerCriteria.isdocumentRequired ? theme.primary : theme.outline + '30'
            }}
          >
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor:"transparent" }}>
              <ThemedView style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: formData.ownerCriteria.isdocumentRequired ? theme.primary : theme.surfaceVariant,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MaterialIcons
                  name="folder"
                  size={20}
                  color={formData.ownerCriteria.isdocumentRequired ? 'white' : theme.onSurface + '60'}
                />
              </ThemedView>
              <ThemedView style={{ flex: 1,backgroundColor:"transparent"  }}>
                <ThemedText type="normal" intensity="light" style={{ marginBottom: 2 }}>
                  Documents requis
                </ThemedText>
                <ThemedText type="caption" intensity="light">
                  Demander des documents au locataire
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              backgroundColor: formData.ownerCriteria.isdocumentRequired ? theme.primary : theme.outline + '40',
              padding: 2,
              justifyContent: 'center',
              right:40
            }}>
              <ThemedView style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'white',
                transform: [{ translateX: formData.ownerCriteria.isdocumentRequired ? 22 : 0 }]
              }} />
            </ThemedView>
          </TouchableOpacity>
        )}

        {/* Documents du locataire - Affiché si isdocumentRequired est activé */}
        {formData.actionType === 'rent' && formData.ownerCriteria.isdocumentRequired && (
          <ThemedView style={{ borderRadius: 12, padding: 14 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="person" size={20} color={theme.primary} />
              <ThemedText type="normal" intensity="strong" style={{ marginLeft: 8 }}>
                Documents du locataire
              </ThemedText>
            </ThemedView>

            {/* Liste des documents existants */}
            {formData.ownerCriteria.requiredDocuments?.client?.map((doc, index) => (
              <ThemedView key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.surfaceVariant,
                borderRadius: 8,
                padding: 10,
                marginBottom: 8
              }}>
                <MaterialIcons name="description" size={18} color={theme.onSurface + '60'} />
                <ThemedText type="caption" style={{ flex: 1, marginLeft: 8 }}>{doc}</ThemedText>
                <TouchableOpacity
                  onPress={() => {
                    const newDocs = [...(formData.ownerCriteria.requiredDocuments?.client || [])];
                    newDocs.splice(index, 1);
                    updateFormData('ownerCriteria.requiredDocuments', {
                      ...formData.ownerCriteria.requiredDocuments,
                      client: newDocs
                    });
                  }}
                >
                  <MaterialIcons name="close" size={18} color={theme.error} />
                </TouchableOpacity>
              </ThemedView>
            ))}

            {/* Document suggestions */}
            <ThemedText type="caption" intensity="light" style={{ marginBottom: 8 }}>
              Sélectionnez ou ajoutez des documents:
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {['Pièce d\'identité', 'Justificatif de domicile', 'Bulletins de salaire', 'Contrat de travail', 'Avis d\'imposition'].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => {
                    const currentDocs = formData.ownerCriteria.requiredDocuments?.client || [];
                    if (!currentDocs.includes(suggestion)) {
                      updateFormData('ownerCriteria.requiredDocuments', {
                        ...formData.ownerCriteria.requiredDocuments,
                        client: [...currentDocs, suggestion]
                      });
                    }
                  }}
                  style={{
                    backgroundColor: formData.ownerCriteria.requiredDocuments?.client?.includes(suggestion)
                      ? theme.primary + '30'
                      : theme.surface,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: formData.ownerCriteria.requiredDocuments?.client?.includes(suggestion)
                      ? theme.primary
                      : theme.outline + '30'
                  }}
                >
                  <ThemedText type="caption" style={{
                    color: formData.ownerCriteria.requiredDocuments?.client?.includes(suggestion)
                      ? theme.primary
                      : theme.onSurface
                  }}>
                    + {suggestion}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        {/* Garant Documents */}
        {formData.actionType === 'rent' && formData.ownerCriteria.guarantorRequired && formData.ownerCriteria.isdocumentRequired && (
          <ThemedView style={{ borderRadius: 12, padding: 14 }}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="verified-user" size={20} color={'#10B981'} />
              <ThemedText type="normal" intensity="strong" style={{ marginLeft: 8 }}>
                Documents du garant
              </ThemedText>
            </ThemedView>

            {/* Liste des documents existants */}
            {formData.ownerCriteria.requiredDocuments?.guarantor?.map((doc, index) => (
              <ThemedView key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.surface,
                borderRadius: 8,
                padding: 10,
                marginBottom: 8
              }}>
                <MaterialIcons name="description" size={18} color={theme.onSurface + '60'} />
                <ThemedText type="caption" style={{ flex: 1, marginLeft: 8 }}>{doc}</ThemedText>
                <TouchableOpacity
                  onPress={() => {
                    const newDocs = [...(formData.ownerCriteria.requiredDocuments?.guarantor || [])];
                    newDocs.splice(index, 1);
                    updateFormData('ownerCriteria.requiredDocuments', {
                      ...formData.ownerCriteria.requiredDocuments,
                      guarantor: newDocs
                    });
                  }}
                >
                  <MaterialIcons name="close" size={18} color={theme.error} />
                </TouchableOpacity>
              </ThemedView>
            ))}

            {/* Suggestions de documents */}
            <ThemedText type="caption" intensity="light" style={{ marginBottom: 8 }}>
              Sélectionnez ou ajoutez des documents:
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {['Pièce d\'identité', 'Justificatif de domicile', 'Bulletins de salaire', 'Avis d\'imposition', 'Attestation employeur'].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => {
                    const currentDocs = formData.ownerCriteria.requiredDocuments?.guarantor || [];
                    if (!currentDocs.includes(suggestion)) {
                      updateFormData('ownerCriteria.requiredDocuments', {
                        ...formData.ownerCriteria.requiredDocuments,
                        guarantor: [...currentDocs, suggestion]
                      });
                    }
                  }}
                  style={{
                    backgroundColor: formData.ownerCriteria.requiredDocuments?.guarantor?.includes(suggestion)
                      ? '#10B981' + '30'
                      : theme.surface,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: formData.ownerCriteria.requiredDocuments?.guarantor?.includes(suggestion)
                      ? '#10B981'
                      : theme.outline + '30'
                  }}
                >
                  <ThemedText type="caption" style={{
                    color: formData.ownerCriteria.requiredDocuments?.guarantor?.includes(suggestion)
                      ? '#10B981'
                      : theme.onSurface
                  }}>
                    + {suggestion}
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
            💡 {t('propertyCreationForm.servicesTip')}
          </ThemedText>
          <ThemedText type ="caption" style={{ color: theme.primary, fontWeight: '600', lineHeight: 16 }}>
            ✓ Cette étape est optionnelle, vous pouvez continuer sans sélectionner de service
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
    );
  };

  const totalSteps = formData.actionType === 'sell' ? 4 : 5;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop:10 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" />

      {/* Header avec progress */}
      <ThemedView style={{
        paddingHorizontal: 16,

      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
          <ThemedText type ="normaltitle">
            {editMode ? t('propertyCreationForm.headerEdit') : t('propertyCreationForm.headerCreate')}
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
          {t('propertyCreationForm.stepIndicator', { current: currentStep, total: totalSteps })}
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
              {t('propertyCreationForm.btnPrevious')}
            </ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={currentStep === totalSteps ? handleSubmit : handleNext}
          disabled={loading || (currentStep !== totalSteps && !validateStep())}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[theme.secondary, theme.primary]}
            style={{
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              opacity: (loading || (currentStep !== totalSteps && !validateStep())) ? 0.6 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <ThemedText type ="normal" intensity ="strong" style={{ color: 'white' }}>
                {currentStep === totalSteps ? t('propertyCreationForm.btnCreate') : t('propertyCreationForm.btnNext')}
              </ThemedText>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default PropertyCreationForm;
