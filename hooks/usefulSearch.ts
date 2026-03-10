import { useMemo } from 'react';

export interface SearchableItem {
  id: string;
  type: 'property' | 'service';
  searchableText: string;
  data: any;
}

export class PowerfulSearchEngine {
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  private static extractSearchableText(item: any, type: 'property' | 'service'): string {
    if (type === 'property') {
      return [
        item.title || '',
        item.description || '',
        item.address || '',
        item.generalHInfo?.area || '',
        item.propertyType || '',
        item.actionType || '',
        item.status || '',
        item.ownerCriteria?.monthlyRent?.toString() || '',
        item.generalHInfo?.bedrooms?.toString() || '',
        item.generalHInfo?.bathrooms?.toString() || '',
        item.generalHInfo?.surface?.toString() || '',
        item.generalHInfo?.rooms?.toString() || '',
        ...(item.tags || []),
        ...(item.amenities || []),
      ].join(' ');
    } else {
      return [
        item.title || '',
        item.description || '',
        item.category || '',
        item.pricing?.basePrice?.toString() || '',
        item.pricing?.currency || '',
        item.pricing?.billingPeriod || '',
        item.provider?.companyName || '',
        item.provider?.description || '',
        item.status || '',
        item.rating?.toString() || '',
        ...(item.tags || []),
        ...(item.contractTypes || []),
        ...(item.availability?.zones || []),
      ].join(' ');
    }
  }

  static createSearchableItems(properties: any[], services: any[]): SearchableItem[] {
    const items: SearchableItem[] = [];

    properties.forEach(property => {
      items.push({
        id: property.id,
        type: 'property',
        searchableText: this.normalizeText(this.extractSearchableText(property, 'property')),
        data: property
      });
    });

    services.forEach(service => {
      items.push({
        id: service.id,
        type: 'service',
        searchableText: this.normalizeText(this.extractSearchableText(service, 'service')),
        data: service
      });
    });

    return items;
  }

  static search(items: SearchableItem[], query: string, filters?: any): {
    properties: any[];
    services: any[];
    totalCount: number;
  } {
    if (!query.trim() && !filters) {
      return {
        properties: items.filter(item => item.type === 'property').map(item => item.data),
        services: items.filter(item => item.type === 'service').map(item => item.data),
        totalCount: items.length
      };
    }

    const normalizedQuery = this.normalizeText(query);
    const queryTerms = normalizedQuery.split(' ').filter(term => term.length > 0);

    let filteredItems = items;

    // Text search
    if (queryTerms.length > 0) {
      filteredItems = items.filter(item => {
        return queryTerms.every(term => item.searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters) {
      filteredItems = filteredItems.filter(item => {
        if (item.type === 'property') {
          return this.matchesPropertyFilters(item.data, filters.property);
        } else {
          return this.matchesServiceFilters(item.data, filters.service);
        }
      });
    }

    const properties = filteredItems
      .filter(item => item.type === 'property')
      .map(item => item.data);

    const services = filteredItems
      .filter(item => item.type === 'service')
      .map(item => item.data);

    return {
      properties,
      services,
      totalCount: filteredItems.length
    };
  }

  private static matchesPropertyFilters(property: any, filters: any): boolean {
    if (!filters) return true;

    // Price filter
    const price = property.ownerCriteria?.monthlyRent || 0;
    if (filters.minPrice && price < filters.minPrice) return false;
    if (filters.maxPrice && price > filters.maxPrice) return false;

    // Surface filter
    const surface = property.generalHInfo?.surface || 0;
    if (filters.minSurface && surface < filters.minSurface) return false;

    // Rooms filter
    const rooms = property.generalHInfo?.rooms || 0;
    if (filters.rooms && rooms < filters.rooms) return false;

    // Type filter
    if (filters.type && property.propertyType !== filters.type) return false;

    // Country filter
    if (filters.country && !property.address?.toLowerCase().includes(filters.country.toLowerCase())) return false;

    // Action type filter
    if (filters.actionType && property.actionType !== filters.actionType) return false;

    return true;
  }

  private static matchesServiceFilters(service: any, filters: any): boolean {
    if (!filters) return true;

    // Price filter
    const price = service.pricing?.basePrice || 0;
    if (filters.minPrice && price < filters.minPrice) return false;
    if (filters.maxPrice && price > filters.maxPrice) return false;

    // Category filter
    if (filters.category && service.category !== filters.category) return false;

    // Contract type filter
    if (filters.contractType && !service.contractTypes?.includes(filters.contractType)) return false;

    // Emergency filter
    if (filters.isEmergency && !service.availability?.isEmergency) return false;

    // Rating filter
    if (filters.rating && service.rating < filters.rating) return false;

    // Location filter
    if (filters.location && !service.availability?.zones?.some((zone: string) => 
      zone.toLowerCase().includes(filters.location.toLowerCase())
    )) return false;

    return true;
  }

  static getSuggestions(items: SearchableItem[], query: string, limit = 5): string[] {
    if (!query.trim()) return [];

    const normalizedQuery = this.normalizeText(query);
    const suggestions = new Set<string>();

    items.forEach(item => {
      const words = item.searchableText.split(' ');
      words.forEach(word => {
        if (word.startsWith(normalizedQuery) && word.length > normalizedQuery.length) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }
}

export const usePowerfulSearch = (properties: any[], services: any[]) => {
  const searchableItems = useMemo(() => {
    return PowerfulSearchEngine.createSearchableItems(properties, services);
  }, [properties, services]);

  const search = useMemo(() => {
    return (query: string, filters?: any) => {
      return PowerfulSearchEngine.search(searchableItems, query, filters);
    };
  }, [searchableItems]);

  const getSuggestions = useMemo(() => {
    return (query: string, limit?: number) => {
      return PowerfulSearchEngine.getSuggestions(searchableItems, query, limit);
    };
  }, [searchableItems]);

  return { search, getSuggestions, totalItems: searchableItems.length };
};