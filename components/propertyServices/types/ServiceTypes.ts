export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  images: string[];
  priceType: 'fixed' | 'hourly' | 'monthly' | 'yearly';
  basePrice: number;
  contractType: 'short_term' | 'long_term' | 'both';
  availability: {
    days: string[];
    hours: { start: string; end: string };
    zones: string[];
  };
  propertyTypes: PropertyType[];
  mandatory: boolean;
  tags: string[];
  status: 'active' | 'inactive' | 'pending';
}

export interface PropertyType {
  type: 'house' | 'apartment' | 'studio' | 'office';
  hasGarden?: boolean;
  hasParking?: boolean;
  surface?: number;
}

export interface ServiceRecommendation {
  service: Service;
  score: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  timing: 'immediate' | 'after_move' | 'seasonal';
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}