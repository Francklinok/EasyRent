import { getGraphQLService } from './graphqlService';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '../cache/cacheService';

// Backend FavoriteItem structure (what the backend actually returns)
export interface FavoriteItem {
  propertyId: string;
  addedAt: string;
  notes?: string;
  tags: string[];
  priceAtSave?: number;
  notifyPriceDrop: boolean;
}

// Enriched favorite with property data (for display)
export interface FavoriteProperty {
  propertyId: string;
  addedAt: string;
  notes?: string;
  tags: string[];
  notifyPriceDrop: boolean;
  property?: {
    id: string;
    title: string;
    address: string;
    propertyType: string;
    actionType: string;
    status: string;
    images: string[];
    ownerCriteria?: {
      monthlyRent?: number;
      currency?: string;
    };
    generalHInfo?: {
      surface?: number;
      bedrooms?: number;
      bathrooms?: number;
    };
  };
}

export interface FavoriteStats {
  totalFavorites: number;
  availableProperties: number;
}

export interface FavoriteFilters {
  type?: string;
  sortBy?: 'dateAdded' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface FavoriteServiceItem {
  serviceId: string;
  addedAt: string;
  notes?: string;
  tags: string[];
}

export interface FavoriteService {
  serviceId: string;
  addedAt: string;
  notes?: string;
  tags: string[];
  service?: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    images: string[];
    pricing?: {
      basePrice?: number;
      currency?: string;
    };
    rating?: number;
    totalReviews?: number;
  };
}

export interface PriceAlert {
  id: string;
  propertyId: string;
  type: 'decrease' | 'increase' | 'any';
  threshold: number;
  percentage?: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

class FavoritesService {
  private graphqlService = getGraphQLService();

  /**
   * Get all favorite property IDs
   */
  async getFavoriteItems(): Promise<FavoriteItem[]> {
    const query = `
      query GetFavoriteProperties {
        favoriteProperties {
          propertyId
          addedAt
          notes
          tags
          priceAtSave
          notifyPriceDrop
        }
      }
    `;

    try {
      const response = await this.graphqlService.query(query, {});
      return response.favoriteProperties || [];
    } catch (error) {
      console.error('Error fetching favorite items:', error);
      return [];
    }
  }

  /**
   * Get all favorite service IDs
   */
  async getFavoriteServiceItems(): Promise<FavoriteServiceItem[]> {
    const query = `
      query GetFavoriteServices {
        favoriteServices {
          serviceId
          addedAt
          notes
          tags
        }
      }
    `;

    try {
      const response = await this.graphqlService.query(query, {});
      return response.favoriteServices || [];
    } catch (error) {
      console.error('Error fetching favorite services:', error);
      return [];
    }
  }

  /**
   * Add service to favorites
   */
  async addServiceToFavorites(
    serviceId: string,
    notes?: string,
    tags?: string[]
  ): Promise<boolean> {
    const mutation = `
      mutation AddFavoriteService($serviceId: ID!, $notes: String, $tags: [String!]) {
        addFavoriteService(serviceId: $serviceId, notes: $notes, tags: $tags) {
          services {
            serviceId
            addedAt
          }
        }
      }
    `;

    try {
      await this.graphqlService.mutate(mutation, { serviceId, notes, tags });
      await cacheService.remove(CACHE_KEYS.FAVORITES_SERVICES);
      return true;
    } catch (error) {
      console.error('Error adding service to favorites:', error);
      return false;
    }
  }

  /**
   * Remove service from favorites
   */
  async removeServiceFromFavorites(serviceId: string): Promise<boolean> {
    const mutation = `
      mutation RemoveFavoriteService($serviceId: ID!) {
        removeFavoriteService(serviceId: $serviceId) {
          services {
            serviceId
          }
        }
      }
    `;

    try {
      await this.graphqlService.mutate(mutation, { serviceId });
      await cacheService.remove(CACHE_KEYS.FAVORITES_SERVICES);
      return true;
    } catch (error) {
      console.error('Error removing service from favorites:', error);
      return false;
    }
  }

  /**
   * Check if a service is in favorites
   */
  async isServiceFavorite(serviceId: string): Promise<boolean> {
    const query = `
      query IsFavoriteService($serviceId: ID!) {
        isFavoriteService(serviceId: $serviceId)
      }
    `;

    try {
      const response = await this.graphqlService.query(query, { serviceId });
      return response.isFavoriteService || false;
    } catch (error) {
      console.error('Error checking service favorite:', error);
      return false;
    }
  }

  /**
   * Get favorite services with enriched data (stale-while-revalidate)
   */
  async getFavoriteServicesEnriched(): Promise<FavoriteService[]> {
    const cached = await cacheService.get<FavoriteService[]>(CACHE_KEYS.FAVORITES_SERVICES);
    const isStale = cacheService.isStale(CACHE_KEYS.FAVORITES_SERVICES, CACHE_TTL);

    // Fresh cache: return immediately
    if (cached && !isStale) {
      return cached;
    }

    // Stale cache: return it immediately but revalidate in background
    if (cached && isStale) {
      this.revalidateFavoriteServices().catch(() => {});
      return cached;
    }

    // No cache: must fetch
    try {
      return await this.fetchAndCacheFavoriteServices();
    } catch (error) {
      console.error('Error fetching favorite services:', error);
      return [];
    }
  }

  private async fetchAndCacheFavoriteServices(): Promise<FavoriteService[]> {
    const items = await this.getFavoriteServiceItems();
    if (items.length === 0) {
      await cacheService.set(CACHE_KEYS.FAVORITES_SERVICES, []);
      return [];
    }

    const serviceIds = items.map(i => i.serviceId);
    const services = await this.fetchServicesByIds(serviceIds);

    const result = items.map(item => ({
      ...item,
      service: services.find(s => s.id === item.serviceId)
    }));

    await cacheService.set(CACHE_KEYS.FAVORITES_SERVICES, result);
    return result;
  }

  private async revalidateFavoriteServices(): Promise<void> {
    try {
      await this.fetchAndCacheFavoriteServices();
    } catch (error) {
      // Silent fail - stale data was already returned
    }
  }

  /**
   * Get favorites with enriched property data (stale-while-revalidate)
   */
  async getFavorites(userId: string, _filters?: FavoriteFilters): Promise<FavoriteProperty[]> {
    const cached = await cacheService.get<FavoriteProperty[]>(CACHE_KEYS.FAVORITES_PROPERTIES);
    const isStale = cacheService.isStale(CACHE_KEYS.FAVORITES_PROPERTIES, CACHE_TTL);

    // Fresh cache: return immediately
    if (cached && !isStale) {
      return cached;
    }

    // Stale cache: return it immediately but revalidate in background
    if (cached && isStale) {
      this.revalidateFavorites(userId).catch(() => {});
      return cached;
    }

    // No cache: must fetch
    try {
      return await this.fetchAndCacheFavorites(userId);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  private async fetchAndCacheFavorites(userId: string): Promise<FavoriteProperty[]> {
    const items = await this.getFavoriteItems();
    if (items.length === 0) {
      await cacheService.set(CACHE_KEYS.FAVORITES_PROPERTIES, []);
      return [];
    }

    const propertyIds = items.map(i => i.propertyId);
    const properties = await this.fetchPropertiesByIds(propertyIds);

    const result = items.map(item => ({
      ...item,
      property: properties.find(p => p.id === item.propertyId)
    }));

    await cacheService.set(CACHE_KEYS.FAVORITES_PROPERTIES, result);
    return result;
  }

  private async revalidateFavorites(userId: string): Promise<void> {
    try {
      await this.fetchAndCacheFavorites(userId);
    } catch (error) {
      // Silent fail - stale data was already returned
    }
  }

  /**
   * Check if a property is in favorites
   */
  async isFavorite(propertyId: string): Promise<boolean> {
    const query = `
      query IsFavoriteProperty($propertyId: ID!) {
        isFavoriteProperty(propertyId: $propertyId)
      }
    `;

    try {
      const response = await this.graphqlService.query(query, { propertyId });
      return response.isFavoriteProperty || false;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  /**
   * Add property to favorites
   */
  async addToFavorites(
    _userId: string,
    propertyId: string,
    notes?: string,
    tags?: string[]
  ): Promise<FavoriteProperty> {
    const mutation = `
      mutation AddFavoriteProperty($propertyId: ID!, $notes: String, $tags: [String!], $notifyPriceDrop: Boolean) {
        addFavoriteProperty(propertyId: $propertyId, notes: $notes, tags: $tags, notifyPriceDrop: $notifyPriceDrop) {
          properties {
            propertyId
            addedAt
            notes
            tags
            notifyPriceDrop
          }
        }
      }
    `;

    const response = await this.graphqlService.mutate(mutation, {
      propertyId,
      notes,
      tags,
      notifyPriceDrop: false
    });

    // Invalidate cache
    await cacheService.remove(CACHE_KEYS.FAVORITES_PROPERTIES);

    // Find the newly added item from the returned settings
    const properties = response.addFavoriteProperty?.properties || [];
    const added = properties.find((p: any) => p.propertyId === propertyId) || {
      propertyId,
      addedAt: new Date().toISOString(),
      notes,
      tags: tags || [],
      notifyPriceDrop: false
    };

    return added;
  }

  /**
   * Remove property from favorites
   */
  async removeFromFavorites(_userId: string, propertyId: string): Promise<boolean> {
    const mutation = `
      mutation RemoveFavoriteProperty($propertyId: ID!) {
        removeFavoriteProperty(propertyId: $propertyId) {
          properties {
            propertyId
          }
        }
      }
    `;

    try {
      await this.graphqlService.mutate(mutation, { propertyId });
      await cacheService.remove(CACHE_KEYS.FAVORITES_PROPERTIES);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  /**
   * Get favorite stats - uses cached data instead of re-fetching
   */
  async getFavoriteStats(_userId: string): Promise<FavoriteStats> {
    // Use cached favorites data if available to avoid extra network call
    const cached = await cacheService.get<FavoriteProperty[]>(CACHE_KEYS.FAVORITES_PROPERTIES);
    if (cached) {
      return {
        totalFavorites: cached.length,
        availableProperties: cached.length
      };
    }

    try {
      const items = await this.getFavoriteItems();
      return {
        totalFavorites: items.length,
        availableProperties: items.length
      };
    } catch (error) {
      console.error('Error fetching favorite stats:', error);
      return { totalFavorites: 0, availableProperties: 0 };
    }
  }

  /**
   * Bulk remove favorites
   */
  async bulkRemoveFavorites(
    userId: string,
    propertyIds: string[]
  ): Promise<{ success: boolean; removedCount: number; failedIds: string[] }> {
    const failedIds: string[] = [];
    let removedCount = 0;

    // Run removals in parallel (batches of 5 to avoid overwhelming)
    const batchSize = 5;
    for (let i = 0; i < propertyIds.length; i += batchSize) {
      const batch = propertyIds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(propertyId => this.removeFromFavorites(userId, propertyId))
      );
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value) {
          removedCount++;
        } else {
          failedIds.push(batch[idx]);
        }
      });
    }

    await cacheService.remove(CACHE_KEYS.FAVORITES_PROPERTIES);
    return { success: failedIds.length === 0, removedCount, failedIds };
  }

  // Stubs for features that the backend may not support yet
  async updateFavoriteNotes(_userId: string, _propertyId: string, _notes: string): Promise<boolean> {
    return false;
  }

  async updateFavoriteTags(_userId: string, _propertyId: string, _tags: string[]): Promise<boolean> {
    return false;
  }

  async updateNotificationSettings(
    _userId: string,
    _propertyId: string,
    _notifications: any
  ): Promise<boolean> {
    return false;
  }

  async trackPropertyView(_userId: string, _propertyId: string): Promise<boolean> {
    return false;
  }

  async createPriceAlert(
    _userId: string,
    _propertyId: string,
    _type: string,
    _threshold: number,
    _percentage?: number
  ): Promise<PriceAlert> {
    throw new Error('Price alerts not implemented');
  }

  async getPriceAlerts(_userId: string): Promise<PriceAlert[]> {
    return [];
  }

  async togglePriceAlert(_userId: string, _alertId: string, _isActive: boolean): Promise<boolean> {
    return false;
  }

  async deletePriceAlert(_userId: string, _alertId: string): Promise<boolean> {
    return false;
  }

  async getSimilarProperties(_userId: string, _propertyId: string, _limit?: number): Promise<any[]> {
    return [];
  }

  async exportFavorites(
    _userId: string,
    _format: string
  ): Promise<{ downloadUrl: string; filename: string; expiresAt: string }> {
    throw new Error('Export not implemented');
  }

  async shareFavoritesList(
    _userId: string,
    _recipientEmail: string,
    _message?: string
  ): Promise<boolean> {
    return false;
  }

  /**
   * Invalidate all favorites cache
   */
  async invalidateCache(): Promise<void> {
    await Promise.all([
      cacheService.remove(CACHE_KEYS.FAVORITES_PROPERTIES),
      cacheService.remove(CACHE_KEYS.FAVORITES_SERVICES),
    ]);
  }

  // --- Helper: fetch properties by IDs (single batched query via aliases) ---
  private async fetchPropertiesByIds(propertyIds: string[]): Promise<any[]> {
    if (propertyIds.length === 0) return [];

    // Build a single query with aliases: p0: property(id: "...") { ... }, p1: ...
    const fragment = `
      fragment PropFields on PropertyType {
        id
        title
        address
        propertyType
        actionType
        status
        images
        ownerCriteria {
          monthlyRent
          currency
        }
        generalHInfo {
          surface
          bedrooms
          bathrooms
        }
      }
    `;

    const aliasedQueries = propertyIds.map((id, i) =>
      `p${i}: property(id: "${id}") { ...PropFields }`
    ).join('\n');

    const query = `
      ${fragment}
      query GetPropertiesBatch {
        ${aliasedQueries}
      }
    `;

    try {
      const response = await this.graphqlService.query(query, {});
      return propertyIds
        .map((_, i) => response[`p${i}`])
        .filter((p: any) => p != null);
    } catch {
      // Fallback: parallel individual queries if batch fails
      const results = await Promise.allSettled(
        propertyIds.map(id => {
          const singleQuery = `
            query GetProperty($id: ID!) {
              property(id: $id) {
                id title address propertyType actionType status images
                ownerCriteria { monthlyRent currency }
                generalHInfo { surface bedrooms bathrooms }
              }
            }
          `;
          return this.graphqlService.query(singleQuery, { id }).then(r => r.property);
        })
      );
      return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value != null)
        .map(r => r.value);
    }
  }

  // --- Helper: fetch services by IDs (single batched query via aliases) ---
  private async fetchServicesByIds(serviceIds: string[]): Promise<any[]> {
    if (serviceIds.length === 0) return [];

    const fragment = `
      fragment SvcFields on ServiceType {
        id
        title
        description
        category
        status
        media {
          photos
        }
        pricing {
          basePrice
          currency
        }
        rating
        totalReviews
      }
    `;

    const aliasedQueries = serviceIds.map((id, i) =>
      `s${i}: service(id: "${id}") { ...SvcFields }`
    ).join('\n');

    const query = `
      ${fragment}
      query GetServicesBatch {
        ${aliasedQueries}
      }
    `;

    try {
      const response = await this.graphqlService.query(query, {});
      return serviceIds
        .map((_, i) => response[`s${i}`])
        .filter((s: any) => s != null);
    } catch {
      // Fallback: parallel individual queries if batch fails
      const results = await Promise.allSettled(
        serviceIds.map(id => {
          const singleQuery = `
            query GetService($id: ID!) {
              service(id: $id) {
                id title description category status
                media { photos }
                pricing { basePrice currency }
                rating totalReviews
              }
            }
          `;
          return this.graphqlService.query(singleQuery, { id }).then(r => r.service);
        })
      );
      return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value != null)
        .map(r => r.value);
    }
  }
}

// Singleton
export const favoritesService = new FavoritesService();
export default favoritesService;
