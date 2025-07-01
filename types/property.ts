import { ItemType, FeatureIcon } from "@/types/ItemType";


// Fichier: types.ts
export interface Property {
    id: string;
    title: string;
    description: string;
    address: string;
    monthlyRent: number;
    depositAmount: number;
    maxOccupants: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    ownerId: string;
    images?: string[];
    amenities?: string[];
    availableFrom: Date;
    createdAt: Date;
    type: string;
    surface: number;
    rooms: number;
  }
  export  interface ExtendedItemType extends ItemType {
    features: FeatureIcon[];
    energyScore: number;
    virtualTourAvailable: boolean;
    distanceToAmenities?: {
      schools: number;
      healthcare: number;
      shopping: number;
      transport: number;
    };
    aiRecommendation: string;
  }