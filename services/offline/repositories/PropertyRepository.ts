/**
 * PropertyRepository - Repository pour les propriétés
 *
 * Implémente le pattern Repository pour les propriétés
 * avec support offline-first complet
 */

import { BaseRepository } from './BaseRepository';
import {
  EntityTable,
  BaseEntity,
  RepositoryConfig,
  QueryParams,
  PaginatedResult,
  ConflictStrategy,
} from '../core/types';

// ============================================================================
// PROPERTY TYPES
// ============================================================================

export interface Property extends BaseEntity {
  title: string;
  description?: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: string;
  address: PropertyAddress;
  ownerId: string;
  owner?: PropertyOwner;
  images: string[];
  amenities: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  furnished?: boolean;
  availableFrom?: string;
  minimumStay?: number;
  maximumStay?: number;
  rating?: number;
  reviewCount?: number;
  viewCount?: number;
  favoriteCount?: number;
  isVerified?: boolean;
  isPremium?: boolean;
}

export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'STUDIO'
  | 'VILLA'
  | 'DUPLEX'
  | 'PENTHOUSE'
  | 'ROOM'
  | 'COMMERCIAL'
  | 'LAND'
  | 'OTHER';

export type PropertyStatus =
  | 'AVAILABLE'
  | 'RENTED'
  | 'PENDING'
  | 'RESERVED'
  | 'UNAVAILABLE'
  | 'DRAFT';

export interface PropertyAddress {
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  isVerified?: boolean;
}

export interface PropertyFilters {
  type?: PropertyType | PropertyType[];
  status?: PropertyStatus | PropertyStatus[];
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  country?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  ownerId?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  search?: string;
}

// ============================================================================
// PROPERTY API SERVICE INTERFACE
// ============================================================================

interface PropertyApiService {
  getOne: (id: string) => Promise<Property>;
  getMany: (params: QueryParams) => Promise<{
    edges: Array<{ node: Property }>;
    pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
    totalCount: number;
    availableCount?: number;
  }>;
  create: (data: Partial<Property>) => Promise<Property>;
  update: (id: string, data: Partial<Property>) => Promise<Property>;
  delete: (id: string) => Promise<boolean>;
  search: (query: string, filters?: PropertyFilters) => Promise<{
    edges: Array<{ node: Property }>;
    pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
    totalCount: number;
  }>;
  getSimilar: (propertyId: string, limit?: number) => Promise<Property[]>;
  getByOwner: (ownerId: string) => Promise<Property[]>;
}

// ============================================================================
// PROPERTY REPOSITORY
// ============================================================================

class PropertyRepository extends BaseRepository<Property> {
  private propertyApiService: PropertyApiService | null = null;

  constructor() {
    const config: RepositoryConfig<Property> = {
      entityType: 'properties',
      cacheKeyPrefix: 'property',
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      conflictStrategy: 'LAST_WRITE_WINS' as ConflictStrategy,
      apiService: {
        getOne: async (id) => this.getPropertyFromApi(id),
        getMany: async (params) => this.getPropertiesFromApi(params),
        create: async (data) => this.createPropertyOnApi(data),
        update: async (id, data) => this.updatePropertyOnApi(id, data),
        delete: async (id) => this.deletePropertyOnApi(id),
      },
    };

    super(config);
  }

  /**
   * Configure le service API
   */
  setApiService(apiService: PropertyApiService): void {
    this.propertyApiService = apiService;
  }

  // ==========================================================================
  // API METHODS (to be connected to actual GraphQL service)
  // ==========================================================================

  private async getPropertyFromApi(id: string): Promise<Property> {
    if (!this.propertyApiService) {
      throw new Error('Property API service not configured');
    }
    return this.propertyApiService.getOne(id);
  }

  private async getPropertiesFromApi(params: QueryParams): Promise<{
    edges: Array<{ node: Property }>;
    pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
    totalCount: number;
  }> {
    if (!this.propertyApiService) {
      throw new Error('Property API service not configured');
    }
    return this.propertyApiService.getMany(params);
  }

  private async createPropertyOnApi(data: Partial<Property>): Promise<Property> {
    if (!this.propertyApiService) {
      throw new Error('Property API service not configured');
    }
    return this.propertyApiService.create(data);
  }

  private async updatePropertyOnApi(id: string, data: Partial<Property>): Promise<Property> {
    if (!this.propertyApiService) {
      throw new Error('Property API service not configured');
    }
    return this.propertyApiService.update(id, data);
  }

  private async deletePropertyOnApi(id: string): Promise<boolean> {
    if (!this.propertyApiService) {
      throw new Error('Property API service not configured');
    }
    return this.propertyApiService.delete(id);
  }

  // ==========================================================================
  // PROPERTY-SPECIFIC METHODS
  // ==========================================================================

  /**
   * Recherche de propriétés avec filtres
   */
  async searchProperties(
    query: string,
    filters?: PropertyFilters,
    pagination?: { page?: number; limit?: number }
  ): Promise<PaginatedResult<Property>> {
    // D'abord essayer l'API si en ligne
    if (await this.isOnline() && this.propertyApiService) {
      try {
        const result = await this.propertyApiService.search(query, filters);
        const items = result.edges.map((e) => e.node);

        // Sauvegarder en local
        await this.db.bulkUpsert('properties', items);

        return {
          items,
          pageInfo: result.pageInfo,
          totalCount: result.totalCount,
        };
      } catch (error) {
        console.error('[PropertyRepository] Search API error:', error);
      }
    }

    // Fallback: recherche locale
    return this.search(query, { filters, pagination });
  }

  /**
   * Récupère les propriétés similaires
   */
  async getSimilarProperties(propertyId: string, limit = 5): Promise<Property[]> {
    const cacheKey = `similar:${propertyId}:${limit}`;

    // Vérifier le cache
    const cached = await this.cache.get<Property[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Essayer l'API
    if (await this.isOnline() && this.propertyApiService) {
      try {
        const similar = await this.propertyApiService.getSimilar(propertyId, limit);
        await this.cache.set(cacheKey, similar, { ttl: 10 * 60 * 1000 });
        return similar;
      } catch (error) {
        console.error('[PropertyRepository] GetSimilar API error:', error);
      }
    }

    // Fallback: propriétés de même type/ville
    const property = await this.getById(propertyId);
    if (!property) return [];

    const similar = await this.db.findMany<Property>('properties', {
      where: {
        type: property.type,
        status: 'AVAILABLE',
      },
      limit: limit + 1, // +1 pour exclure la propriété courante
    });

    return similar.filter((p) => p.id !== propertyId).slice(0, limit);
  }

  /**
   * Récupère les propriétés d'un propriétaire
   */
  async getOwnerProperties(ownerId: string): Promise<Property[]> {
    const cacheKey = `owner:${ownerId}`;

    // Vérifier le cache
    const cached = await this.cache.get<Property[]>(cacheKey);
    if (cached && !this.cache.isStale(cacheKey)) {
      return cached;
    }

    // Essayer l'API
    if (await this.isOnline() && this.propertyApiService) {
      try {
        const properties = await this.propertyApiService.getByOwner(ownerId);
        await this.cache.set(cacheKey, properties);
        await this.db.bulkUpsert('properties', properties);
        return properties;
      } catch (error) {
        console.error('[PropertyRepository] GetByOwner API error:', error);
      }
    }

    // Fallback: base locale
    return this.db.findMany<Property>('properties', {
      where: { owner_id: ownerId },
    });
  }

  /**
   * Récupère les propriétés par statut
   */
  async getByStatus(status: PropertyStatus): Promise<Property[]> {
    return this.db.findMany<Property>('properties', {
      where: { status },
    });
  }

  /**
   * Récupère les propriétés disponibles
   */
  async getAvailable(pagination?: { page?: number; limit?: number }): Promise<PaginatedResult<Property>> {
    return this.getMany({
      filters: { status: 'AVAILABLE' },
      pagination,
    });
  }

  /**
   * Incrémente le compteur de vues
   */
  async incrementViewCount(propertyId: string): Promise<void> {
    const property = await this.getById(propertyId);
    if (!property) return;

    await this.update(propertyId, {
      viewCount: (property.viewCount || 0) + 1,
    });
  }

  /**
   * Récupère les statistiques des propriétés
   */
  async getStats(): Promise<{
    total: number;
    available: number;
    rented: number;
    pending: number;
  }> {
    const all = await this.db.count('properties');
    const available = await this.db.count('properties', { status: 'AVAILABLE' });
    const rented = await this.db.count('properties', { status: 'RENTED' });
    const pending = await this.db.count('properties', { status: 'PENDING' });

    return {
      total: all,
      available,
      rented,
      pending,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let instance: PropertyRepository | null = null;

export function getPropertyRepository(): PropertyRepository {
  if (!instance) {
    instance = new PropertyRepository();
  }
  return instance;
}

export const propertyRepository = getPropertyRepository();

export default PropertyRepository;
