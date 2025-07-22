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
