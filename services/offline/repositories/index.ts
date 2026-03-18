/**
 * Repositories Index
 *
 * Export centralisé de tous les repositories
 */

// Base repository
export { BaseRepository } from './BaseRepository';

// Property repository
export {
  PropertyRepository,
  getPropertyRepository,
  propertyRepository,
} from './PropertyRepository';
export type {
  Property,
  PropertyType,
  PropertyStatus,
  PropertyAddress,
  PropertyOwner,
  PropertyFilters,
} from './PropertyRepository';

// Note: Les autres repositories suivront le même pattern
// ActivityRepository, WalletRepository, FavoritesRepository, etc.
// Ils seront ajoutés au fur et à mesure de la migration
