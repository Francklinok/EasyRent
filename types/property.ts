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
  }