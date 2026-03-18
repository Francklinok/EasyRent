/**
 * CacheService - Wrapper de compatibilité vers UnifiedCacheService
 *
 * Ce fichier maintient la rétrocompatibilité avec l'ancien API
 * tout en utilisant le nouveau UnifiedCacheService en interne.
 *
 * MIGRATION: Les nouveaux composants devraient importer directement
 * depuis '@/services/offline' à la place.
 */

import { legacyCacheWrapper } from '../offline/core/UnifiedCacheService';

/**
 * @deprecated Utilisez unifiedCacheService depuis '@/services/offline'
 * Ce service est maintenu pour compatibilité descendante uniquement.
 */
export const cacheService = legacyCacheWrapper;

// Cache keys constants
export const CACHE_KEYS = {
  // Favorites
  FAVORITES_PROPERTIES: '@cache_favorites_properties',
  FAVORITES_SERVICES: '@cache_favorites_services',
  // Inventory
  INVENTORY_OWNER_PROPERTIES: '@cache_inventory_owner_props',
  INVENTORY_ACQUIRED_PROPERTIES: '@cache_inventory_acquired_props',
  INVENTORY_OWNER_SERVICES: '@cache_inventory_owner_services',
  INVENTORY_CLIENT_SUBSCRIPTIONS: '@cache_inventory_client_subs',
  // Properties
  PROPERTIES_LIST: '@cache_properties_list',
  // Services marketplace
  SERVICES_LIST: '@cache_services_list',
  // Activities
  ACTIVITIES_LIST: '@cache_activities_list',
  ACTIVITIES_STATS: '@cache_activities_stats',
  // Wallet
  WALLET_DATA: '@cache_wallet_data',
  WALLET_TRANSACTIONS: '@cache_wallet_transactions',
  // Notifications
  NOTIFICATIONS_LIST: '@cache_notifications_list',
  NOTIFICATIONS_UNREAD: '@cache_notifications_unread',
  // Conversations
  CONVERSATIONS_LIST: '@cache_conversations_list',
  // Home
  HOME_SERVICES: '@cache_home_services',
};

// Default TTL: 5 minutes (data is stale after this, but still usable)
export const CACHE_TTL = 5 * 60 * 1000;
