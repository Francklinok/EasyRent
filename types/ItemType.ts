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
  atouts?: AtoutItem[]; 
  propertyCategory?: PropertyCategory;

  owner: Owner;
  description: string;
  generalInfo: GeneralInfo;
  propertyAvailability: PropertyAvailability;
  equipments: Equipment[];
  ownerCriteria: OwnerCriteria;
  services: Service[];

  aiGenerated?: boolean;      // Si les atouts ont été générés par IA
  verifiedAtouts?: string[];  // IDs des atouts vérifiés par admin
  customAtoutsCount?: number; // Nombre d'atouts personnalisés
  lastAtoutsUpdate?: string;  // Dernière mise à jour des atouts

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

export type AtoutType = 
  | "predefined"    // Atout prédéfini avec icône
  | "custom_text"   // Texte libre du propriétaire
  | "custom_icon";  // Texte + icône personnalisée

export type PropertyCategory = 
  | "residential"   // Maisons, appartements, villas
  | "commercial"    // Bureaux, magasins
  | "land"         // Terrains
  | "special";     // Châteaux, monuments, etc.

export interface BaseAtout {
  id: string;
  type: AtoutType;
  text: string;
  category?: string;
  priority?: number; // 1-5 pour l'ordre d'affichage
}

export interface PredefinedAtout extends BaseAtout {
  type: "predefined";
  icon: string;
  lib: "FontAwesome5" | "MaterialCommunityIcons" | "Ionicons";
  verified: boolean; // Vérifié par l'admin
}

export interface CustomTextAtout extends BaseAtout {
  type: "custom_text";
  icon?: never; // Pas d'icône
  lib?: never;
}

export interface CustomIconAtout extends BaseAtout {
  type: "custom_icon";
  icon: string;
  lib: "FontAwesome5" | "MaterialCommunityIcons" | "Ionicons";
  customIcon?: boolean;
}

export type AtoutItem = PredefinedAtout | CustomTextAtout | CustomIconAtout;


export const ATOUTS_SYSTEM = {
  
  residential: [
    // EMPLACEMENT & QUARTIER
    { id: "res_01", type: "predefined", icon: "map-marker-alt", text: "Emplacement stratégique", lib: "FontAwesome5", category: "location", verified: true, priority: 5 },
    { id: "res_02", type: "predefined", icon: "shield-alt", text: "Quartier ultra-sécurisé", lib: "FontAwesome5", category: "location", verified: true, priority: 5 },
    { id: "res_03", type: "predefined", icon: "city", text: "Centre-ville dynamique", lib: "FontAwesome5", category: "location", verified: true, priority: 4 },
    { id: "res_04", type: "predefined", icon: "leaf", text: "Environnement verdoyant", lib: "FontAwesome5", category: "location", verified: true, priority: 4 },
    { id: "res_05", type: "predefined", icon: "water", text: "Vue mer/lac exceptionnelle", lib: "MaterialCommunityIcons", category: "location", verified: true, priority: 5 },
    
    // ARCHITECTURE & DESIGN
    { id: "res_06", type: "predefined", icon: "home", text: "Architecture contemporaine", lib: "FontAwesome5", category: "design", verified: true, priority: 4 },
    { id: "res_07", type: "predefined", icon: "gem", text: "Finitions haut de gamme", lib: "FontAwesome5", category: "design", verified: true, priority: 5 },
    { id: "res_08", type: "predefined", icon: "sun", text: "Luminosité exceptionnelle", lib: "FontAwesome5", category: "design", verified: true, priority: 4 },
    { id: "res_09", type: "predefined", icon: "cube", text: "Volumes généreux", lib: "FontAwesome5", category: "design", verified: true, priority: 4 },
    { id: "res_10", type: "predefined", icon: "palette", text: "Design d'intérieur sur-mesure", lib: "FontAwesome5", category: "design", verified: true, priority: 3 },
    
    // CONFORT & ÉQUIPEMENTS
    { id: "res_11", type: "predefined", icon: "snowflake", text: "Climatisation centralisée", lib: "FontAwesome5", category: "comfort", verified: true, priority: 4 },
    { id: "res_12", type: "predefined", icon: "fire", text: "Cheminée d'ambiance", lib: "FontAwesome5", category: "comfort", verified: true, priority: 3 },
    { id: "res_13", type: "predefined", icon: "hot-tub", text: "Spa & jacuzzi privé", lib: "MaterialCommunityIcons", category: "comfort", verified: true, priority: 4 },
    { id: "res_14", type: "predefined", icon: "dumbbell", text: "Salle de sport privée", lib: "FontAwesome5", category: "comfort", verified: true, priority: 3 },
    { id: "res_15", type: "predefined", icon: "wine-glass", text: "Cave à vin climatisée", lib: "FontAwesome5", category: "comfort", verified: true, priority: 3 },
    
    // CUISINE & LIVING
    { id: "res_16", type: "predefined", icon: "utensils", text: "Cuisine gastronomique équipée", lib: "FontAwesome5", category: "kitchen", verified: true, priority: 4 },
    { id: "res_17", type: "predefined", icon: "coffee", text: "Espace petit-déjeuner cosy", lib: "FontAwesome5", category: "kitchen", verified: true, priority: 3 },
    { id: "res_18", type: "predefined", icon: "sofa", text: "Salon cathédrale", lib: "MaterialCommunityIcons", category: "living", verified: true, priority: 4 },
    { id: "res_19", type: "predefined", icon: "tv", text: "Home cinéma intégré", lib: "FontAwesome5", category: "entertainment", verified: true, priority: 3 },
    
    // CHAMBRES & SANITAIRES
    { id: "res_20", type: "predefined", icon: "bed", text: "Suite parentale avec dressing", lib: "FontAwesome5", category: "bedroom", verified: true, priority: 4 },
    { id: "res_21", type: "predefined", icon: "shower", text: "Salle de bain luxueuse", lib: "FontAwesome5", category: "bathroom", verified: true, priority: 4 },
    { id: "res_22", type: "predefined", icon: "wardrobe-outline", text: "Dressings sur-mesure", lib: "MaterialCommunityIcons", category: "storage", verified: true, priority: 3 },
    
    // EXTÉRIEUR & LOISIRS
    { id: "res_23", type: "predefined", icon: "swimming-pool", text: "Piscine à débordement", lib: "MaterialCommunityIcons", category: "outdoor", verified: true, priority: 5 },
    { id: "res_24", type: "predefined", icon: "tree", text: "Jardin paysager entretenu", lib: "FontAwesome5", category: "outdoor", verified: true, priority: 4 },
    { id: "res_25", type: "predefined", icon: "umbrella-beach", text: "Terrasse panoramique", lib: "FontAwesome5", category: "outdoor", verified: true, priority: 4 },
    { id: "res_26", type: "predefined", icon: "fire", text: "Espace BBQ & réception", lib: "FontAwesome5", category: "outdoor", verified: true, priority: 3 },
    
    // TECHNOLOGIE & CONNECTIVITÉ
    { id: "res_27", type: "predefined", icon: "wifi", text: "Fibre optique ultra-haut débit", lib: "FontAwesome5", category: "tech", verified: true, priority: 4 },
    { id: "res_28", type: "predefined", icon: "mobile-alt", text: "Domotique intelligente", lib: "FontAwesome5", category: "tech", verified: true, priority: 4 },
    { id: "res_29", type: "predefined", icon: "shield-home", text: "Système sécurité connecté", lib: "MaterialCommunityIcons", category: "security", verified: true, priority: 4 },
    
    // SERVICES & COMMODITÉS  
    { id: "res_30", type: "predefined", icon: "car", text: "Garage sécurisé multiple", lib: "FontAwesome5", category: "parking", verified: true, priority: 4 },
    { id: "res_31", type: "predefined", icon: "elevator", text: "Ascenseur privatif", lib: "FontAwesome5", category: "access", verified: true, priority: 3 },
    { id: "res_32", type: "predefined", icon: "concierge-bell", text: "Conciergerie 24h/24", lib: "MaterialCommunityIcons", category: "service", verified: true, priority: 4 },
    
    // ÉCOLOGIE & ÉNERGIE
    { id: "res_33", type: "predefined", icon: "solar-power", text: "Panneaux solaires dernière gen", lib: "MaterialCommunityIcons", category: "ecology", verified: true, priority: 4 },
    { id: "res_34", type: "predefined", icon: "leaf", text: "Certification écologique", lib: "FontAwesome5", category: "ecology", verified: true, priority: 3 },
    { id: "res_35", type: "predefined", icon: "lightbulb", text: "Éclairage LED intelligent", lib: "FontAwesome5", category: "ecology", verified: true, priority: 3 },
  ],

  // 🌿 TERRAINS - Constructibles, Agricoles, Forestiers
  land: [
    // TYPE & CONSTRUCTIBILITÉ
    { id: "land_01", type: "predefined", icon: "home-city", text: "Terrain constructible viabilisé", lib: "MaterialCommunityIcons", category: "construction", verified: true, priority: 5 },
    { id: "land_02", type: "predefined", icon: "account-hard-hat", text: "Permis de construire accordé", lib: "MaterialCommunityIcons", category: "construction", verified: true, priority: 5 },
    { id: "land_03", type: "predefined", icon: "tractor", text: "Terrain agricole fertile", lib: "MaterialCommunityIcons", category: "agriculture", verified: true, priority: 4 },
    { id: "land_04", type: "predefined", icon: "tree-outline", text: "Forêt exploitable", lib: "MaterialCommunityIcons", category: "forestry", verified: true, priority: 4 },
    { id: "land_05", type: "predefined", icon: "mine", text: "Potentiel minier confirmé", lib: "MaterialCommunityIcons", category: "mining", verified: true, priority: 5 },
    
    // RESSOURCES NATURELLES
    { id: "land_06", type: "predefined", icon: "water", text: "Source d'eau naturelle", lib: "MaterialCommunityIcons", category: "resources", verified: true, priority: 5 },
    { id: "land_07", type: "predefined", icon: "water-pump", text: "Forage artésien fonctionnel", lib: "MaterialCommunityIcons", category: "resources", verified: true, priority: 4 },
    { id: "land_08", type: "predefined", icon: "earth", text: "Sol exceptionnellement fertile", lib: "MaterialCommunityIcons", category: "resources", verified: true, priority: 4 },
    { id: "land_09", type: "predefined", icon: "sprout", text: "Exposition solaire optimale", lib: "MaterialCommunityIcons", category: "resources", verified: true, priority: 4 },
    
    // INFRASTRUCTURE & ACCÈS
    { id: "land_10", type: "predefined", icon: "road-variant", text: "Accès routier bitumé", lib: "MaterialCommunityIcons", category: "access", verified: true, priority: 4 },
    { id: "land_11", type: "predefined", icon: "power-plug", text: "Raccordement électrique disponible", lib: "MaterialCommunityIcons", category: "utilities", verified: true, priority: 4 },
    { id: "land_12", type: "predefined", icon: "gas-cylinder", text: "Desserte gaz naturel", lib: "MaterialCommunityIcons", category: "utilities", verified: true, priority: 3 },
    { id: "land_13", type: "predefined", icon: "fence", text: "Terrain entièrement clôturé", lib: "MaterialCommunityIcons", category: "security", verified: true, priority: 3 },
    
    // SITUATION & DOCUMENTS
    { id: "land_14", type: "predefined", icon: "map-search", text: "Bornage certifié récent", lib: "MaterialCommunityIcons", category: "legal", verified: true, priority: 4 },
    { id: "land_15", type: "predefined", icon: "bank", text: "Proximité services municipaux", lib: "FontAwesome5", category: "location", verified: true, priority: 3 },
    { id: "land_16", type: "predefined", icon: "file-contract", text: "Titre foncier sécurisé", lib: "FontAwesome5", category: "legal", verified: true, priority: 5 },
  ],

  // 🏢 COMMERCIAL - Bureaux, Magasins, Entrepôts
  commercial: [
    // EMPLACEMENT COMMERCIAL
    { id: "com_01", type: "predefined", icon: "store", text: "Emplacement n°1 commercial", lib: "FontAwesome5", category: "location", verified: true, priority: 5 },
    { id: "com_02", type: "predefined", icon: "walking", text: "Fort passage piétonnier", lib: "FontAwesome5", category: "location", verified: true, priority: 5 },
    { id: "com_03", type: "predefined", icon: "car", text: "Parking clientèle dédié", lib: "FontAwesome5", category: "parking", verified: true, priority: 4 },
    { id: "com_04", type: "predefined", icon: "subway", text: "Métro/transport en commun", lib: "FontAwesome5", category: "transport", verified: true, priority: 4 },
    
    // AMÉNAGEMENT & ÉQUIPEMENTS
    { id: "com_05", type: "predefined", icon: "warehouse", text: "Espace modulable premium", lib: "MaterialCommunityIcons", category: "space", verified: true, priority: 4 },
    { id: "com_06", type: "predefined", icon: "elevator", text: "Ascenseurs panoramiques", lib: "FontAwesome5", category: "access", verified: true, priority: 3 },
    { id: "com_07", type: "predefined", icon: "air-conditioner", text: "Climatisation centralisée", lib: "MaterialCommunityIcons", category: "comfort", verified: true, priority: 4 },
    { id: "com_08", type: "predefined", icon: "security", text: "Sécurité 24h gardiennage", lib: "MaterialCommunityIcons", category: "security", verified: true, priority: 4 },
    
    // TECHNOLOGIE BUSINESS
    { id: "com_09", type: "predefined", icon: "wifi", text: "Internet pro haut débit", lib: "FontAwesome5", category: "tech", verified: true, priority: 4 },
    { id: "com_10", type: "predefined", icon: "phone", text: "Installation télécom complète", lib: "FontAwesome5", category: "tech", verified: true, priority: 3 },
    { id: "com_11", type: "predefined", icon: "meeting-room", text: "Salles de réunion équipées", lib: "MaterialCommunityIcons", category: "business", verified: true, priority: 3 },
    { id: "com_12", type: "predefined", icon: "printer", text: "Espace reprographie", lib: "FontAwesome5", category: "business", verified: true, priority: 2 },
  ],

  // 🏰 SPÉCIAL - Châteaux, Monuments, Propriétés uniques
  special: [
    { id: "spe_01", type: "predefined", icon: "crown", text: "Monument historique classé", lib: "FontAwesome5", category: "heritage", verified: true, priority: 5 },
    { id: "spe_02", type: "predefined", icon: "horse", text: "Haras & écuries premium", lib: "FontAwesome5", category: "equestrian", verified: true, priority: 4 },
    { id: "spe_03", type: "predefined", icon: "helicopter", text: "Héliport privé", lib: "FontAwesome5", category: "luxury", verified: true, priority: 5 },
    { id: "spe_04", type: "predefined", icon: "anchor", text: "Port de plaisance privé", lib: "FontAwesome5", category: "nautical", verified: true, priority: 5 },
    { id: "spe_05", type: "predefined", icon: "mountain", text: "Domaine skiable privé", lib: "FontAwesome5", category: "sports", verified: true, priority: 5 },
    { id: "spe_06", type: "predefined", icon: "champagne-glasses", text: "Salon de réception 200+ pers", lib: "FontAwesome5", category: "events", verified: true, priority: 4 },
  ]
} as const;

