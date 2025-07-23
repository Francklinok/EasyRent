// Types pour les icônes des fonctionnalités
export type FeatureIcon = 
  | "wifi" | "swimming-pool" | "car" | "umbrella-beach" | "utensils"
  | "tree" | "hot-tub" | "shield-alt" | "wine-glass" | "mountain"
  | "snowflake" | "dumbbell" | "parking" | "elevator" | "subway"
  | "shopping-cart" | "concierge-bell" | "balcony" | "anchor"
  | "fire" | "home" | "playground" | "lightbulb" | "leaf"
  | "solar-panel" | "city" | "gem" | "champagne-glasses"
  | "valet-parking" | "helicopter" | "spa" | "bed" | "coffee"
  | "kitchen" | "washer" | "store" | "beach" | "tram"
  | "stairs" | "palette" | "sun" | "paint-brush" | "music"
  | "water" | "cube" | "phone" | "printer" | "meeting-room"
  | "skiing" | "restaurant" | "cocktail" | "road" | "electricity"
  | "hammer" | "horse" | "nature" | "fence" | "people"
  | "fibre-optique";

// Type pour une fonctionnalité
export interface Feature {
  icon: FeatureIcon;
  name: string;
}

// Type pour la disponibilité
export type Availability = "available" | "not available";

// Type pour le type de propriété
export type PropertyType = 
  | "Villa" | "Appartement" | "Maison" | "Penthouse" 
  | "Studio" | "Loft" | "Bureau" | "Chalet" 
  | "Hôtel" | "Terrain" | "Commercial";

// Type principal pour un élément/propriété


// Types pour les nouvelles propriétés
export interface Owner {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
}

export interface GeneralInfo {
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  surface: number; // en m²
  floor?: number;
  totalFloors?: number;
  furnished?: boolean;
  pets?: boolean;
  smoking?: boolean;

  constructible?: boolean;     // Terrain constructible
  cultivable?: boolean;        // Terrain agricole
  fenced?: boolean;           // Terrain clôturé
  waterAccess?: boolean;      // Accès à l'eau
  electricityAccess?: boolean;// Accès à l'électricité
  roadAccess?: boolean;       // Accès routier
  documents?: string[];  

}
export interface LandInfo {
     // Liste des documents disponibles (titre foncier, etc.)
}

export interface PropertyAvailability  {
  startDate: string;
  endDate?: string; // optionnel pour location longue durée
  type: "immediate" | "scheduled" | "flexible";
}

export interface Equipment {
  id: string;
  name: string;
  icon: string;
  lib: "FontAwesome5" | "MaterialCommunityIcons";
  category: 
    | "comfort"
    | "security"
    | "kitchen"
    | "bathroom"
    | "entertainment"
    | "other"
    | "access"
    | "legal"
    | "utilities"
    | "location";
}


export interface OwnerCriteria {
  minimumDuration: string;
  solvability: string;
  guarantorRequired?: boolean;
  guarantorLocation?: string;
  acceptedSituations: string[];
  requiredDocuments: {
    tenant: string[];
    guarantor: string[];
  };
}

export interface Service {
  key: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
  included: boolean;
  available: boolean;
}

export interface ItemType {
  id: string;
  avatar: any; // Type pour l'image (require() retourne any)
  price: string;
  availibility: Availability; // Note: il y a une faute de frappe dans votre code (availability)
  stars: number; // 1 à 5
  location: string;
  review: string;
  type: PropertyType;
  features: Feature[];
  owner: Owner;
  description: string;
  generalInfo: GeneralInfo;
  propertyAvailability: PropertyAvailability;
  equipments: Equipment[];
  ownerCriteria: OwnerCriteria;
  services: Service[];
}

export interface ExtendedItemTypes extends Omit<ItemType, 'features'> {
  features: Feature[];  // même que dans ItemType
  energyScore: number;
  virtualTourAvailable: boolean;
  distanceToAmenities: {
    schools: number;
    healthcare: number;
    shopping: number;
    transport: number;
  };
  aiRecommendation?: string;
  thumbnail?: string;
  imageWebP?: string;
  imageAvif?: string;
  blurhash?: string;
  
}
