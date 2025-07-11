
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial';
export type PropertyStatus = 'available' | 'rented' | 'sold' | 'pending';

export type PropertyItem = {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  surface: number;
  location: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  price: {
    sale?: number;
    rent?: number;
    rentPeriod?: 'monthly' | 'yearly';
  };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    garages?: number;
    yearBuilt?: number;
    additionalFeatures: string[];
  };
  media: {
    thumbnailUrl: string;
    images: string[];
    videos?: string[];
    virtualTour?: string;
  };
  documents: {
    title: string;
    url: string;
    type: string;
  }[];
  createdAt: string;
  updatedAt: string;
};
