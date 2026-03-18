export interface SearchFilters {
  minPrice: number;
  maxPrice: number;
  minSurface: number;
  rooms: number;
  type: 'apartment' | 'house' | 'villa' | 'studio' | null;
  country: string | null;
}

export interface UnifiedSearchFilters {
  searchType: 'properties' | 'services' | 'both';
  property: {
    minPrice: number;
    maxPrice: number;
    minSurface: number;
    rooms: number;
    type: 'apartment' | 'house' | 'villa' | 'studio' | null;
    country: string | null;
    actionType: 'rent' | 'sale' | null;
  };
  service: {
    category: string | null;
    minPrice: number;
    maxPrice: number;
    contractType: string | null;
    isEmergency: boolean;
    rating: number;
    location: string | null;
  };
}