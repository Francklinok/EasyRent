import { PropertyType, PropertyCategory, GeneralInfo } from '@/types/ItemType';

export interface FacilityItem {
  key: string;
  icon: string;
  lib: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5';
  getValue: (generalInfo: GeneralInfo | undefined) => string | number | boolean | undefined;
  label: string;
  showCondition?: (generalInfo: GeneralInfo | undefined) => boolean;
}

export interface PropertyDisplayConfig {
  showBedrooms: boolean;
  showBathrooms: boolean;
  showRooms: boolean;
  showToilets: boolean;
  showFurnished: boolean;
  showPets: boolean;
  showSmoking: boolean;
  showConstructible: boolean;
  showCultivable: boolean;
  showFenced: boolean;
  showWaterAccess: boolean;
  showElectricityAccess: boolean;
  showRoadAccess: boolean;
  showFloor: boolean;
  showParking: boolean;
  priceLabel: string;
  priceSuffix: string;
  category: PropertyCategory;
  facilities: FacilityItem[];
}

// Mapping property types to their category
export const getPropertyCategory = (type: PropertyType | string | undefined): PropertyCategory => {
  if (!type) return 'residential';

  const normalizedType = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (normalizedType.includes('terrain')) return 'land';
  if (normalizedType.includes('commercial') || normalizedType.includes('bureau') || normalizedType.includes('magasin') || normalizedType.includes('entrepot')) return 'commercial';
  if (normalizedType.includes('chateau') || normalizedType.includes('monument') || normalizedType.includes('domaine')) return 'special';

  return 'residential';
};

// Types that are considered land
const LAND_TYPES = ['terrain', 'land'];

// Types that are considered hotels (price per night)
const HOTEL_TYPES = ['hôtel', 'hotel', 'auberge', 'motel', 'resort', 'chambre d\'hôte', 'guesthouse', 'chalet'];

// Commercial types
const COMMERCIAL_TYPES = ['commercial', 'bureau', 'magasin', 'entrepôt', 'local commercial'];

// Check if it's land
export const isLandProperty = (type: PropertyType | string | undefined): boolean => {
  if (!type) return false;
  const normalizedType = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return LAND_TYPES.some(t => normalizedType.includes(t));
};

// Check if it's a hotel
export const isHotelProperty = (type: PropertyType | string | undefined): boolean => {
  if (!type) return false;
  const normalizedType = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return HOTEL_TYPES.some(t => normalizedType.includes(t));
};

// Check if it's a commercial property
export const isCommercialProperty = (type: PropertyType | string | undefined): boolean => {
  if (!type) return false;
  const normalizedType = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return COMMERCIAL_TYPES.some(t => normalizedType.includes(t));
};

// Display configuration by property type
export const getPropertyDisplayConfig = (type: PropertyType | string | undefined): PropertyDisplayConfig => {
  const category = getPropertyCategory(type);
  const isLand = isLandProperty(type);
  const isHotel = isHotelProperty(type);
  const isCommercial = isCommercialProperty(type);

  // Configuration for LAND properties
  if (isLand) {
    return {
      showBedrooms: false,
      showBathrooms: false,
      showRooms: false,
      showToilets: false,
      showFurnished: false,
      showPets: false,
      showSmoking: false,
      showConstructible: true,
      showCultivable: true,
      showFenced: true,
      showWaterAccess: true,
      showElectricityAccess: true,
      showRoadAccess: true,
      showFloor: false,
      showParking: false,
      priceLabel: 'Prix',
      priceSuffix: '',
      category: 'land',
      facilities: [
        {
          key: 'surface',
          icon: 'ruler-square',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.surface,
          label: 'm²'
        },
        {
          key: 'constructible',
          icon: 'home-city',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.constructible,
          label: 'Constructible',
          showCondition: (info) => info?.constructible === true
        },
        {
          key: 'cultivable',
          icon: 'sprout',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.cultivable,
          label: 'Cultivable',
          showCondition: (info) => info?.cultivable === true
        },
        {
          key: 'fenced',
          icon: 'fence',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.fenced,
          label: 'Clôturé',
          showCondition: (info) => info?.fenced === true
        },
        {
          key: 'waterAccess',
          icon: 'water',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.waterAccess,
          label: 'Eau',
          showCondition: (info) => info?.waterAccess === true
        },
        {
          key: 'electricityAccess',
          icon: 'flash',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.electricityAccess,
          label: 'Électricité',
          showCondition: (info) => info?.electricityAccess === true
        },
        {
          key: 'roadAccess',
          icon: 'road-variant',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.roadAccess,
          label: 'Accès route',
          showCondition: (info) => info?.roadAccess === true
        }
      ]
    };
  }

  // Configuration for HOTELS
  if (isHotel) {
    return {
      showBedrooms: true,
      showBathrooms: true,
      showRooms: true,
      showToilets: false,
      showFurnished: false,
      showPets: false,
      showSmoking: false,
      showConstructible: false,
      showCultivable: false,
      showFenced: false,
      showWaterAccess: false,
      showElectricityAccess: false,
      showRoadAccess: false,
      showFloor: false,
      showParking: true,
      priceLabel: 'Prix par nuit',
      priceSuffix: '/nuit',
      category: 'residential',
      facilities: [
        {
          key: 'rooms',
          icon: 'door',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.rooms,
          label: 'Chambres'
        },
        {
          key: 'bedrooms',
          icon: 'bed-outline',
          lib: 'Ionicons',
          getValue: (info) => info?.bedrooms,
          label: 'Lits'
        },
        {
          key: 'bathrooms',
          icon: 'shower',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.bathrooms,
          label: 'SdB'
        },
        {
          key: 'surface',
          icon: 'ruler-square',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.surface,
          label: 'm²'
        }
      ]
    };
  }

  // Configuration for COMMERCIAL properties
  if (isCommercial) {
    return {
      showBedrooms: false,
      showBathrooms: true,
      showRooms: true,
      showToilets: true,
      showFurnished: false,
      showPets: false,
      showSmoking: false,
      showConstructible: false,
      showCultivable: false,
      showFenced: false,
      showWaterAccess: false,
      showElectricityAccess: false,
      showRoadAccess: false,
      showFloor: true,
      showParking: true,
      priceLabel: 'Loyer mensuel',
      priceSuffix: '/mois',
      category: 'commercial',
      facilities: [
        {
          key: 'surface',
          icon: 'ruler-square',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.surface,
          label: 'm²'
        },
        {
          key: 'rooms',
          icon: 'door',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.rooms,
          label: 'Pièces',
          showCondition: (info) => (info?.rooms ?? 0) > 0
        },
        {
          key: 'bathrooms',
          icon: 'shower',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.bathrooms,
          label: 'SdB',
          showCondition: (info) => (info?.bathrooms ?? 0) > 0
        },
        {
          key: 'floor',
          icon: 'layers',
          lib: 'MaterialCommunityIcons',
          getValue: (info) => info?.floor,
          label: 'Étage',
          showCondition: (info) => info?.floor !== undefined
        }
      ]
    };
  }

  // Default configuration for RESIDENTIAL properties (apartment, villa, house, etc.)
  return {
    showBedrooms: true,
    showBathrooms: true,
    showRooms: true,
    showToilets: true,
    showFurnished: true,
    showPets: true,
    showSmoking: true,
    showConstructible: false,
    showCultivable: false,
    showFenced: false,
    showWaterAccess: false,
    showElectricityAccess: false,
    showRoadAccess: false,
    showFloor: true,
    showParking: true,
    priceLabel: 'Loyer',
    priceSuffix: '/mois',
    category: 'residential',
    facilities: [
      {
        key: 'bedrooms',
        icon: 'bed-outline',
        lib: 'Ionicons',
        getValue: (info) => info?.bedrooms,
        label: 'Ch.'
      },
      {
        key: 'bathrooms',
        icon: 'shower',
        lib: 'MaterialCommunityIcons',
        getValue: (info) => info?.bathrooms,
        label: 'SdB'
      },
      {
        key: 'surface',
        icon: 'ruler-square',
        lib: 'MaterialCommunityIcons',
        getValue: (info) => info?.surface,
        label: 'm²'
      },
      {
        key: 'rooms',
        icon: 'door',
        lib: 'MaterialCommunityIcons',
        getValue: (info) => info?.rooms,
        label: 'Pièces',
        showCondition: (info) => (info?.rooms ?? 0) > 0
      }
    ]
  };
};

// Helper to get facilities to display in the RenderItem (card)
export const getRenderItemFacilities = (type: PropertyType | string | undefined, generalInfo: GeneralInfo | undefined): FacilityItem[] => {
  const config = getPropertyDisplayConfig(type);

  // Pour les cartes, on ne prend que les 3 premières facilités pertinentes
  return config.facilities
    .filter(f => {
      if (f.showCondition) {
        return f.showCondition(generalInfo);
      }
      const value = f.getValue(generalInfo);
      return value !== undefined && value !== null && value !== 0 && value !== false;
    })
    .slice(0, 3);
};

// Helper to get facilities to display on the detail page
export const getDetailFacilities = (type: PropertyType | string | undefined, generalInfo: GeneralInfo | undefined): FacilityItem[] => {
  const config = getPropertyDisplayConfig(type);

  return config.facilities.filter(f => {
    if (f.showCondition) {
      return f.showCondition(generalInfo);
    }
    const value = f.getValue(generalInfo);
    return value !== undefined && value !== null && value !== 0 && value !== false;
  });
};

// Helper to format the price according to the property type
export const formatPropertyPrice = (price: number | string, type: PropertyType | string | undefined, listType: 'rent' | 'sale' | string | undefined): string => {
  const config = getPropertyDisplayConfig(type);
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;

  if (listType === 'sale') {
    return `${numPrice.toLocaleString()}`;
  }

  return `${numPrice.toLocaleString()}${config.priceSuffix}`;
};

// Helper to get the price label
export const getPriceLabel = (type: PropertyType | string | undefined, listType: 'rent' | 'sale' | string | undefined): string => {
  if (listType === 'sale') {
    return 'Prix de vente';
  }

  const config = getPropertyDisplayConfig(type);
  return config.priceLabel;
};

// Equipment configuration by property type (based on PropertyCreationForm)
export const EQUIPMENTS_BY_TYPE: Record<string, string[]> = {
  apartment: ['Wifi', 'Parking', 'Ascenseur', 'Balcon', 'Cave', 'Climatisation', 'Chauffage', 'Interphone'],
  home: ['Wifi', 'Parking', 'Jardin', 'Piscine', 'Terrasse', 'Garage', 'Climatisation', 'Chauffage'],
  villa: ['Wifi', 'Parking', 'Jardin', 'Piscine', 'Terrasse', 'Garage', 'Climatisation', 'Sécurité', 'Salle de sport'],
  studio: ['Wifi', 'Parking', 'Ascenseur', 'Climatisation', 'Chauffage', 'Interphone'],
  terrain: ['Eau', 'Électricité', 'Clôture', 'Accès route', 'Titre foncier'],
  penthouse: ['Wifi', 'Parking', 'Terrasse panoramique', 'Piscine privée', 'Ascenseur privé', 'Climatisation', 'Jacuzzi', 'Sécurité 24h'],
  loft: ['Wifi', 'Parking', 'Hauteur sous plafond', 'Climatisation', 'Chauffage', 'Espace ouvert'],
  hotel: ['Wifi', 'Parking', 'Restaurant', 'Piscine', 'Spa', 'Room service', 'Réception 24h', 'Climatisation', 'Petit-déjeuner'],
  bureau: ['Wifi', 'Parking', 'Ascenseur', 'Climatisation', 'Salle de réunion', 'Cuisine équipée', 'Sécurité', 'Accès handicapé'],
  chalet: ['Wifi', 'Parking', 'Cheminée', 'Terrasse', 'Sauna', 'Jacuzzi', 'Vue montagne', 'Ski aux pieds'],
  commercial: ['Wifi', 'Parking', 'Vitrine', 'Réserve', 'Climatisation', 'Alarme', 'Accès livraison', 'Accès handicapé'],
};

// Advantage categories by property type
export const ATOUTS_CATEGORIES_BY_TYPE: Record<string, string[]> = {
  terrain: ['construction', 'agriculture', 'forestry', 'mining', 'resources', 'access', 'utilities', 'legal', 'location'],
  commercial: ['location', 'parking', 'transport', 'space', 'access', 'comfort', 'security', 'tech', 'business'],
  bureau: ['location', 'parking', 'transport', 'space', 'access', 'comfort', 'security', 'tech', 'business'],
  residential: ['location', 'design', 'comfort', 'kitchen', 'living', 'bedroom', 'bathroom', 'storage', 'outdoor', 'tech', 'security', 'parking', 'access', 'service', 'ecology', 'entertainment'],
};

// Helper to get valid equipments for a property type
export const getValidEquipmentsForType = (type: PropertyType | string | undefined): string[] => {
  if (!type) return EQUIPMENTS_BY_TYPE.apartment;
  const normalizedType = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return EQUIPMENTS_BY_TYPE[normalizedType] || EQUIPMENTS_BY_TYPE.apartment;
};

// Helper to filter equipments according to the property type
export const filterEquipmentsByType = (equipments: any[], type: PropertyType | string | undefined): any[] => {
  if (!equipments || equipments.length === 0) return [];

  const validEquipments = getValidEquipmentsForType(type);
  const isLand = isLandProperty(type);

  // For land, the "equipments" are actually the accesses (water, electricity, etc.)
  // These infos are shown in a dedicated section, not in "Equipments"
  if (isLand) {
    return []; // No traditional equipments for land
  }

  // Filtrer les équipements qui correspondent au type
  return equipments.filter(eq => {
    const eqName = (eq.name || eq.text || '').toLowerCase();
    return validEquipments.some(valid =>
      eqName.includes(valid.toLowerCase()) || valid.toLowerCase().includes(eqName)
    );
  });
};

// Helper to get valid advantage categories for a type
export const getValidAtoutsCategoriesForType = (type: PropertyType | string | undefined): string[] => {
  if (!type) return ATOUTS_CATEGORIES_BY_TYPE.residential;

  if (isLandProperty(type)) return ATOUTS_CATEGORIES_BY_TYPE.terrain;
  if (isCommercialProperty(type)) return ATOUTS_CATEGORIES_BY_TYPE.commercial;

  const normalizedType = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalizedType === 'bureau') return ATOUTS_CATEGORIES_BY_TYPE.bureau;

  return ATOUTS_CATEGORIES_BY_TYPE.residential;
};

// Helper to filter advantages according to the property type
export const filterAtoutsByType = (atouts: any[], type: PropertyType | string | undefined): any[] => {
  if (!atouts || atouts.length === 0) return [];

  const validCategories = getValidAtoutsCategoriesForType(type);

  // Filtrer les atouts dont la catégorie est valide pour ce type
  return atouts.filter(atout => {
    // If no category defined, keep the advantage
    if (!atout.category) return true;

    const category = atout.category.toLowerCase();
    return validCategories.some(valid => category.includes(valid) || valid.includes(category));
  });
};

// Helper to generate a share message adapted to the type
export const getShareMessage = (item: {
  title?: string;
  location?: string;
  price?: number | string;
  type?: PropertyType | string;
  listType?: 'rent' | 'sale' | string;
  generalInfo?: GeneralInfo;
  description?: string;
  review?: string;
}): string => {
  const config = getPropertyDisplayConfig(item.type);
  const isLand = isLandProperty(item.type);

  let details = '';

  if (isLand) {
    const info = item.generalInfo;
    const features: string[] = [];
    if (info?.surface) features.push(`${info.surface}m²`);
    if (info?.constructible) features.push('Constructible');
    if (info?.cultivable) features.push('Cultivable');
    if (info?.fenced) features.push('Clôturé');
    if (info?.waterAccess) features.push('Eau');
    if (info?.electricityAccess) features.push('Électricité');
    details = features.join(' | ');
  } else {
    const info = item.generalInfo;
    const features: string[] = [];
    if (info?.bedrooms) features.push(`${info.bedrooms} chambre(s)`);
    if (info?.bathrooms) features.push(`${info.bathrooms} salle(s) de bain`);
    if (info?.surface) features.push(`${info.surface}m²`);
    details = features.join(' | ');
  }

  return `${item.title}\n\n${item.location}\n${item.price}${config.priceSuffix}\n\n${details}\n\n${item.description || item.review || ''}\n\nDécouvrez cette propriété exceptionnelle !`;
};
