export interface SearchFilters {
  minPrice: number;
  maxPrice: number;
  minSurface: number;
  rooms: number;
  type: 'apartment' | 'house' | 'villa' | 'studio' | null;
  country: string | null;
}