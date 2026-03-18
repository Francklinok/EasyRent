
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'villa' | 'studio' | 'penthouse';
export type PropertyStatus = 'available' | 'rented' | 'sold' | 'pending';
// export  type PropertyListingType = 'sale' | 'rent';

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

// Type for booking/reservation purposes
export interface Property {
  propertyType: string | undefined;
  actionType: any;
  listType: any;
  id: string;
  title?: string;
  description?: string;
  address?: string;
  type?: string;
  listingType?: string;
  price?: number;
  monthlyRent?: number;
  depositAmount?: number;
  maxOccupants?: number;
  ownerId?: string;
  owner?: {
    id: string;
    name?: string;
  };
  ownerCriteria?: {
    monthlyRent?: number;
    isGarantRequired?: boolean;
    depositAmount?: number;
    minimumDuration?: number;
    solvability?: string;
    guarantorRequired?: boolean;
    guarantorLocation?: string;
    acceptedSituations?: string[];
    isdocumentRequired?: boolean;
    maxOccupants?: number;
  };
}
