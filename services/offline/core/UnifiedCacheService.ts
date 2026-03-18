/**
 * UnifiedCacheService - Cache multi-tier intelligent
 *
 * Architecture:
 * 1. Cache mémoire (Map) - Ultra rapide, LRU par fréquence d'accès
 * 2. AsyncStorage - Persistant, survit aux redémarrages
 *
 * Fonctionnalités:
 * - LRU par fréquence d'accès (pas insertion order)
 * - TTL configurable par type d'entité
 * - Graphe de dépendances pour invalidation automatique
 * - Gestion pression mémoire
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import {
  CacheEntry,
  CacheSetOptions,
  CacheGetOptions,
  CacheConfig,
  CacheStats,
  EntityTable,
  DEFAULT_ENTITY_TTLS,
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: CacheConfig = {
  maxMemoryEntries: 200,
  maxAsyncStorageSize: 10 * 1024 * 1024, // 10 MB
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  entityConfigs: {},
  evictionBatchSize: 20,
};

const CACHE_PREFIX = '@unified_cache_';
const CACHE_VERSION = 2;

// ============================================================================
// UNIFIED CACHE SERVICE
// ============================================================================

class UnifiedCacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    memoryEntries: 0,
    estimatedMemoryBytes: 0,
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
  };
  private isInitialized = false;
  private appStateSubscription: any;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupMemoryWarningListener();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Charger les métadonnées du cache depuis AsyncStorage
      await this.loadCacheMetadata();
      this.isInitialized = true;
      console.log('[UnifiedCache] Initialized successfully');
    } catch (error) {
      console.error('[UnifiedCache] Initialization error:', error);
      this.isInitialized = true; // Continue anyway
    }
  }

  private async loadCacheMetadata(): Promise<void> {
    try {
      const metaKey = `${CACHE_PREFIX}metadata`;
      const metadata = await AsyncStorage.getItem(metaKey);
      if (metadata) {
        const parsed = JSON.parse(metadata);
        // Vérifier la version du cache
        if (parsed.version !== CACHE_VERSION) {
          console.log('[UnifiedCache] Version mismatch, clearing cache');
          await this.clearAll();
        }
      }
    } catch (error) {
      console.error('[UnifiedCache] Error loading metadata:', error);
    }
  }

  private setupMemoryWarningListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'memoryWarning',
      this.onMemoryWarning.bind(this)
    );

    // Also handle app state changes for cleanup
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  private handleAppStateChange(state: AppStateStatus): void {
    if (state === 'background') {
      // Sauvegarder les entrées critiques en AsyncStorage
      this.persistCriticalEntries();
    }
  }

  // ==========================================================================
  // CORE OPERATIONS
  // ==========================================================================

  /**
   * Récupère une valeur du cache (mémoire puis AsyncStorage)
   */
  async get<T>(key: string, options?: CacheGetOptions): Promise<T | null> {
    await this.ensureInitialized();

    // 1. Vérifier le cache mémoire (instant)
    const memEntry = this.memoryCache.get(key);
    if (memEntry) {
      const isStale = this.isEntryStale(memEntry, options?.maxAge);
      if (!isStale || options?.ignoreStale) {
        // Mettre à jour les stats d'accès pour LRU
        memEntry.lastAccessed = Date.now();
        memEntry.accessCount++;
        this.stats.hitCount++;
        return memEntry.data as T;
      }
    }

    // 2. Vérifier AsyncStorage
    try {
      const storageKey = this.buildStorageKey(key);
      const raw = await AsyncStorage.getItem(storageKey);
      if (!raw) {
        this.stats.missCount++;
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(raw);

      // Vérifier la version
      if (entry.version !== CACHE_VERSION) {
        await AsyncStorage.removeItem(storageKey);
        this.stats.missCount++;
        return null;
      }

      const isStale = this.isEntryStale(entry, options?.maxAge);

      // Promouvoir dans le cache mémoire
      if (!isStale || options?.ignoreStale) {
        entry.lastAccessed = Date.now();
        entry.accessCount++;
        await this.promoteToMemory(key, entry);
        this.stats.hitCount++;
        return entry.data;
      }

      // Retourner même si stale (le caller rafraîchira)
      this.stats.hitCount++;
      return entry.data;
    } catch (error) {
      console.error('[UnifiedCache] Get error:', error);
      this.stats.missCount++;
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string, data: T, options?: CacheSetOptions): Promise<void> {
    await this.ensureInitialized();

    const entityType = options?.entityType || this.inferEntityType(key);
    const ttl = options?.ttl || this.getTTLForEntity(entityType);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      version: CACHE_VERSION,
      entityType,
      dependencies: options?.dependencies || [],
      ttl,
    };

    // Gérer l'éviction si nécessaire
    await this.ensureCapacity();

    // Stocker en mémoire
    this.memoryCache.set(key, entry);
    this.stats.memoryEntries = this.memoryCache.size;

    // Enregistrer les dépendances
    if (options?.dependencies) {
      this.registerDependencies(key, options.dependencies);
    }

    // Persister en AsyncStorage (async, non-bloquant)
    this.persistToStorage(key, entry).catch((err) => {
      console.error('[UnifiedCache] Persist error:', err);
    });
  }

  /**
   * Supprime une entrée du cache
   */
  async remove(key: string): Promise<void> {
    await this.ensureInitialized();

    this.memoryCache.delete(key);
    this.stats.memoryEntries = this.memoryCache.size;

    try {
      const storageKey = this.buildStorageKey(key);
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('[UnifiedCache] Remove error:', error);
    }
  }

  // ==========================================================================
  // ENTITY-SPECIFIC OPERATIONS
  // ==========================================================================

  /**
   * Stocke une entité avec clé auto-générée
   */
  async setEntity<T>(
    entityType: EntityTable,
    id: string,
    data: T,
    options?: Omit<CacheSetOptions, 'entityType'>
  ): Promise<void> {
    const key = this.buildEntityKey(entityType, id);
    await this.set(key, data, { ...options, entityType });
  }

  /**
   * Récupère une entité
   */
  async getEntity<T>(
    entityType: EntityTable,
    id: string,
    options?: CacheGetOptions
  ): Promise<T | null> {
    const key = this.buildEntityKey(entityType, id);
    return this.get<T>(key, options);
  }

  /**
   * Invalide une entité et ses dépendants
   */
  async invalidateEntity(entityType: EntityTable, id: string): Promise<void> {
    const key = this.buildEntityKey(entityType, id);
    await this.invalidateWithDependents(key);
  }

  /**
   * Invalide toutes les entrées d'un type d'entité
   */
  async invalidateEntityType(entityType: EntityTable): Promise<void> {
    const prefix = `${entityType}:`;
    const keysToRemove: string[] = [];

    // Trouver toutes les clés correspondantes
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix) || key === entityType) {
        keysToRemove.push(key);
      }
    }

    // Invalider avec dépendants
    for (const key of keysToRemove) {
      await this.invalidateWithDependents(key);
    }
  }

  // ==========================================================================
  // DEPENDENCY MANAGEMENT
  // ==========================================================================

  /**
   * Enregistre une dépendance parent -> enfant
   */
  registerDependency(parentKey: string, childKey: string): void {
    if (!this.dependencyGraph.has(parentKey)) {
      this.dependencyGraph.set(parentKey, new Set());
    }
    this.dependencyGraph.get(parentKey)!.add(childKey);
  }

  private registerDependencies(key: string, dependencies: string[]): void {
    for (const dep of dependencies) {
      this.registerDependency(dep, key);
    }
  }

  /**
   * Invalide une clé et tous ses dépendants
   */
  async invalidateWithDependents(key: string): Promise<void> {
    const toInvalidate = new Set<string>([key]);
    const queue = [key];

    // BFS pour trouver tous les dépendants
    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = this.dependencyGraph.get(current);
      if (dependents) {
        for (const dep of dependents) {
          if (!toInvalidate.has(dep)) {
            toInvalidate.add(dep);
            queue.push(dep);
          }
        }
      }
    }

    // Invalider toutes les clés trouvées
    for (const k of toInvalidate) {
      await this.remove(k);
      this.dependencyGraph.delete(k);
    }
  }

  /**
   * Récupère les dépendants d'une clé
   */
  getDependents(key: string): string[] {
    return Array.from(this.dependencyGraph.get(key) || []);
  }

  // ==========================================================================
  // BULK OPERATIONS
  // ==========================================================================

  /**
   * Récupère plusieurs entrées en une fois
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        results.set(key, value);
      })
    );

    return results;
  }

  /**
   * Stocke plusieurs entrées en une fois
   */
  async setMany<T>(entries: Array<{ key: string; data: T; options?: CacheSetOptions }>): Promise<void> {
    await Promise.all(
      entries.map(({ key, data, options }) => this.set(key, data, options))
    );
  }

  // ==========================================================================
  // TTL & STALENESS
  // ==========================================================================

  /**
   * Vérifie si une entrée est périmée
   */
  isStale(key: string, maxAge?: number): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) return true;
    return this.isEntryStale(entry, maxAge);
  }

  private isEntryStale(entry: CacheEntry<any>, maxAge?: number): boolean {
    const effectiveTTL = maxAge ?? entry.ttl;
    const age = Date.now() - entry.timestamp;
    return age >= effectiveTTL;
  }

  /**
   * Rafraîchit le TTL d'une entrée
   */
  refreshTTL(key: string): void {
    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.timestamp = Date.now();
    }
  }

  /**
   * Obtient le TTL pour un type d'entité
   */
  private getTTLForEntity(entityType: string): number {
    const entityTTL = DEFAULT_ENTITY_TTLS[entityType as EntityTable];
    if (entityTTL !== undefined) return entityTTL;

    const configTTL = this.config.entityConfigs[entityType]?.ttl;
    if (configTTL !== undefined) return configTTL;

    return this.config.defaultTTL;
  }

  /**
   * Retourne le timestamp de la dernière mise à jour
   */
  getTimestamp(key: string): number | null {
    const entry = this.memoryCache.get(key);
    return entry?.timestamp ?? null;
  }

  // ==========================================================================
  // LRU EVICTION
  // ==========================================================================

  private async ensureCapacity(): Promise<void> {
    if (this.memoryCache.size < this.config.maxMemoryEntries) {
      return;
    }

    // Calculer les scores LRU (combinaison fréquence + récence)
    const entries = Array.from(this.memoryCache.entries()).map(([key, entry]) => ({
      key,
      score: this.calculateLRUScore(entry),
    }));

    // Trier par score (plus bas = à évincer)
    entries.sort((a, b) => a.score - b.score);

    // Évincer les entrées avec les scores les plus bas
    const toEvict = entries.slice(0, this.config.evictionBatchSize);
    for (const { key } of toEvict) {
      this.memoryCache.delete(key);
      this.stats.evictionCount++;
    }

    this.stats.memoryEntries = this.memoryCache.size;
    console.log(`[UnifiedCache] Evicted ${toEvict.length} entries`);
  }

  /**
   * Calcule un score LRU basé sur la fréquence et la récence
   */
  private calculateLRUScore(entry: CacheEntry<any>): number {
    const now = Date.now();
    const recencyScore = 1 / (now - entry.lastAccessed + 1);
    const frequencyScore = Math.log(entry.accessCount + 1);

    // Pondérer: 60% récence, 40% fréquence
    return recencyScore * 0.6 + frequencyScore * 0.4;
  }

  // ==========================================================================
  // MEMORY PRESSURE HANDLING
  // ==========================================================================

  async onMemoryWarning(): Promise<void> {
    console.log('[UnifiedCache] Memory warning received, clearing low-priority entries');

    const entries = Array.from(this.memoryCache.entries());

    // Trier par score et garder seulement le top 50%
    entries.sort(([, a], [, b]) => this.calculateLRUScore(b) - this.calculateLRUScore(a));

    const keepCount = Math.floor(entries.length * 0.5);
    const toEvict = entries.slice(keepCount);

    for (const [key] of toEvict) {
      this.memoryCache.delete(key);
      this.stats.evictionCount++;
    }

    this.stats.memoryEntries = this.memoryCache.size;
    console.log(`[UnifiedCache] Evicted ${toEvict.length} entries due to memory pressure`);
  }

  /**
   * Obtient les statistiques d'utilisation mémoire
   */
  getMemoryUsage(): { entries: number; estimatedBytes: number } {
    let estimatedBytes = 0;
    for (const entry of this.memoryCache.values()) {
      estimatedBytes += JSON.stringify(entry.data).length * 2; // UTF-16
    }

    return {
      entries: this.memoryCache.size,
      estimatedBytes,
    };
  }

  // ==========================================================================
  // STORAGE OPERATIONS
  // ==========================================================================

  private async persistToStorage<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      const storageKey = this.buildStorageKey(key);
      await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.error('[UnifiedCache] Storage persist error:', error);
    }
  }

  private async persistCriticalEntries(): Promise<void> {
    // Persister les entrées avec haute fréquence d'accès
    const criticalEntries = Array.from(this.memoryCache.entries())
      .filter(([, entry]) => entry.accessCount > 5)
      .slice(0, 50);

    for (const [key, entry] of criticalEntries) {
      await this.persistToStorage(key, entry);
    }
  }

  private async promoteToMemory<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    await this.ensureCapacity();
    this.memoryCache.set(key, entry);
    this.stats.memoryEntries = this.memoryCache.size;
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Efface tout le cache
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    this.dependencyGraph.clear();
    this.stats.memoryEntries = 0;

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('[UnifiedCache] Clear all error:', error);
    }

    console.log('[UnifiedCache] Cache cleared');
  }

  /**
   * Supprime les entrées correspondant à un préfixe
   */
  async removeByPrefix(prefix: string): Promise<void> {
    // Mémoire
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
    this.stats.memoryEntries = this.memoryCache.size;

    // AsyncStorage
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const matchingKeys = allKeys.filter((k) =>
        k.startsWith(`${CACHE_PREFIX}${prefix}`)
      );
      if (matchingKeys.length > 0) {
        await AsyncStorage.multiRemove(matchingKeys);
      }
    } catch (error) {
      console.error('[UnifiedCache] Remove by prefix error:', error);
    }
  }

  /**
   * Nettoie les entrées périmées
   */
  async cleanupStaleEntries(): Promise<number> {
    let removed = 0;

    // Mémoire
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isEntryStale(entry)) {
        this.memoryCache.delete(key);
        removed++;
      }
    }

    this.stats.memoryEntries = this.memoryCache.size;
    console.log(`[UnifiedCache] Cleaned up ${removed} stale entries`);
    return removed;
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private buildStorageKey(key: string): string {
    return `${CACHE_PREFIX}${key}`;
  }

  private buildEntityKey(entityType: EntityTable, id: string): string {
    return `${entityType}:${id}`;
  }

  private inferEntityType(key: string): string {
    const parts = key.split(':');
    return parts[0] || 'unknown';
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Nettoie les ressources lors de la destruction
   */
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let instance: UnifiedCacheService | null = null;

export function getUnifiedCacheService(): UnifiedCacheService {
  if (!instance) {
    instance = new UnifiedCacheService();
  }
  return instance;
}

export const unifiedCacheService = getUnifiedCacheService();

// ============================================================================
// BACKWARD COMPATIBILITY (wrapper pour l'ancien cacheService)
// ============================================================================

/**
 * Wrapper compatible avec l'ancien cacheService
 * Permet une migration progressive
 */
export const legacyCacheWrapper = {
  async get<T>(key: string, maxAgeMs?: number): Promise<T | null> {
    return unifiedCacheService.get<T>(key, { maxAge: maxAgeMs });
  },

  async set<T>(key: string, data: T): Promise<void> {
    return unifiedCacheService.set(key, data);
  },

  async remove(key: string): Promise<void> {
    return unifiedCacheService.remove(key);
  },

  async removeByPrefix(prefix: string): Promise<void> {
    return unifiedCacheService.removeByPrefix(prefix);
  },

  isStale(key: string, maxAgeMs: number): boolean {
    return unifiedCacheService.isStale(key, maxAgeMs);
  },

  getTimestamp(key: string): number | null {
    return unifiedCacheService.getTimestamp(key);
  },

  async clearAll(): Promise<void> {
    return unifiedCacheService.clearAll();
  },
};

export default UnifiedCacheService;
