/**
 * UnifiedDatabase - SQLite comme source de vérité pour TOUTES les entités
 *
 * Tables:
 * - properties, activities, wallet, transactions
 * - favorites, services, service_subscriptions
 * - notifications, conversations, messages
 * - sync_queue, metadata
 *
 * Fonctionnalités:
 * - Schema unifié avec colonnes JSON pour flexibilité
 * - Index optimisés pour les requêtes fréquentes
 * - Transactions pour opérations atomiques
 * - Support sync status et version pour offline-first
 */

import * as SQLite from 'expo-sqlite';
import {
  EntityTable,
  QueryOptions,
  PendingChange,
  SyncStatusType,
  BaseEntity,
} from './types';

// ============================================================================
// TYPES SPECIFIQUES DATABASE
// ============================================================================

interface DatabaseRow {
  [key: string]: any;
}

interface Transaction {
  run: (sql: string, params?: any[]) => Promise<SQLite.SQLiteRunResult>;
  get: <T>(sql: string, params?: any[]) => Promise<T | null>;
  all: <T>(sql: string, params?: any[]) => Promise<T[]>;
}

interface DatabaseStats {
  tables: Record<EntityTable, number>;
  totalRows: number;
  syncQueueSize: number;
  pendingChanges: number;
}

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

const SCHEMA_VERSION = 1;

const CREATE_TABLES_SQL = [
  // Table des propriétés
  `CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    data TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    status TEXT DEFAULT 'AVAILABLE',
    type TEXT,
    city TEXT,
    price REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    sync_error TEXT,
    version INTEGER DEFAULT 1
  )`,

  // Table des activités
  `CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    data TEXT NOT NULL,
    user_id TEXT NOT NULL,
    property_id TEXT,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    amount REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    sync_error TEXT,
    version INTEGER DEFAULT 1
  )`,

  // Table des portefeuilles
  `CREATE TABLE IF NOT EXISTS wallet (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    user_id TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL,
    balance REAL DEFAULT 0,
    currency TEXT DEFAULT 'XAF',
    is_active INTEGER DEFAULT 1,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    version INTEGER DEFAULT 1
  )`,

  // Table des transactions
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    wallet_id TEXT NOT NULL,
    data TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    reference TEXT,
    description TEXT,
    created_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    version INTEGER DEFAULT 1,
    FOREIGN KEY (wallet_id) REFERENCES wallet(id)
  )`,

  // Table des favoris
  `CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    user_id TEXT NOT NULL,
    property_id TEXT,
    service_id TEXT,
    entity_type TEXT NOT NULL,
    data TEXT NOT NULL,
    notes TEXT,
    tags TEXT,
    created_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    version INTEGER DEFAULT 1,
    UNIQUE(user_id, property_id),
    UNIQUE(user_id, service_id)
  )`,

  // Table des services
  `CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    data TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT,
    status TEXT DEFAULT 'ACTIVE',
    price REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    version INTEGER DEFAULT 1
  )`,

  // Table des subscriptions aux services
  `CREATE TABLE IF NOT EXISTS service_subscriptions (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    user_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    data TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    version INTEGER DEFAULT 1,
    FOREIGN KEY (service_id) REFERENCES services(id)
  )`,

  // Table des notifications
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    user_id TEXT NOT NULL,
    data TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    body TEXT,
    is_read INTEGER DEFAULT 0,
    action_url TEXT,
    created_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'synced',
    version INTEGER DEFAULT 1
  )`,

  // Table des conversations (existante, améliorée)
  `CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    type TEXT NOT NULL,
    title TEXT,
    avatar TEXT,
    participants TEXT NOT NULL,
    last_message TEXT,
    last_message_time TEXT,
    unread_count INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    is_muted INTEGER DEFAULT 0,
    property_id TEXT,
    activity_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'synced',
    version INTEGER DEFAULT 1
  )`,

  // Table des messages (existante, améliorée)
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    conversation_id TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_info TEXT,
    reply_to_id TEXT,
    reply_to TEXT,
    attachments TEXT,
    reactions TEXT,
    status TEXT,
    is_deleted INTEGER DEFAULT 0,
    deleted_for_everyone INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'synced',
    version INTEGER DEFAULT 1,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  )`,

  // Table des utilisateurs (cache local)
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    server_id TEXT UNIQUE,
    data TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    name TEXT,
    avatar TEXT,
    role TEXT,
    is_verified INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'synced',
    version INTEGER DEFAULT 1
  )`,

  // Table de la queue de synchronisation (améliorée)
  `CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    data TEXT NOT NULL,
    previous_state TEXT,
    priority INTEGER DEFAULT 50,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    next_retry_at INTEGER,
    backoff_multiplier REAL DEFAULT 1.5,
    created_at INTEGER NOT NULL,
    last_attempt_at INTEGER,
    error TEXT,
    batch_id TEXT
  )`,

  // Table des métadonnées
  `CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
];

const CREATE_INDEXES_SQL = [
  // Properties indexes
  `CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status)`,
  `CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type)`,
  `CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city)`,
  `CREATE INDEX IF NOT EXISTS idx_properties_sync ON properties(sync_status)`,
  `CREATE INDEX IF NOT EXISTS idx_properties_updated ON properties(updated_at DESC)`,

  // Activities indexes
  `CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_activities_property ON activities(property_id)`,
  `CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status)`,
  `CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type)`,
  `CREATE INDEX IF NOT EXISTS idx_activities_dates ON activities(start_date, end_date)`,

  // Transactions indexes
  `CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`,

  // Favorites indexes
  `CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id)`,
  `CREATE INDEX IF NOT EXISTS idx_favorites_service ON favorites(service_id)`,

  // Services indexes
  `CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)`,
  `CREATE INDEX IF NOT EXISTS idx_services_status ON services(status)`,

  // Notifications indexes
  `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC)`,

  // Conversations indexes
  `CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_time DESC)`,

  // Messages indexes
  `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_sync ON messages(sync_status)`,

  // Sync queue indexes
  `CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority DESC, created_at ASC)`,
  `CREATE INDEX IF NOT EXISTS idx_sync_queue_retry ON sync_queue(next_retry_at)`,
  `CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sync_queue_batch ON sync_queue(batch_id)`,
];

// ============================================================================
// UNIFIED DATABASE CLASS
// ============================================================================

class UnifiedDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('unified_offline.db');

      // Créer les tables
      for (const sql of CREATE_TABLES_SQL) {
        await this.db.execAsync(sql);
      }

      // Créer les index
      for (const sql of CREATE_INDEXES_SQL) {
        await this.db.execAsync(sql);
      }

      // Vérifier/mettre à jour la version du schema
      await this.checkSchemaVersion();

      this.isInitialized = true;
      console.log('[UnifiedDB] Database initialized successfully');
    } catch (error) {
      console.error('[UnifiedDB] Initialization error:', error);
      throw error;
    }
  }

  private async checkSchemaVersion(): Promise<void> {
    const currentVersion = await this.getMetadata('schema_version');
    if (!currentVersion || currentVersion < SCHEMA_VERSION) {
      // Ici on pourrait gérer les migrations
      await this.setMetadata('schema_version', SCHEMA_VERSION);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // ==========================================================================
  // GENERIC CRUD OPERATIONS
  // ==========================================================================

  /**
   * Insère une nouvelle entité
   */
  async insert<T extends Record<string, any>>(
    table: EntityTable,
    data: T
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const { columns, placeholders, values } = this.prepareInsertData(table, data);

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

    try {
      await this.db.runAsync(sql, values);
    } catch (error) {
      console.error(`[UnifiedDB] Insert error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Insère ou remplace une entité (upsert)
   */
  async upsert<T extends Record<string, any>>(
    table: EntityTable,
    data: T
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const { columns, placeholders, values } = this.prepareInsertData(table, data);

    const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

    try {
      await this.db.runAsync(sql, values);
    } catch (error) {
      console.error(`[UnifiedDB] Upsert error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour une entité existante
   */
  async update<T extends Record<string, any>>(
    table: EntityTable,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const { setClause, values } = this.prepareUpdateData(data);
    values.push(id);

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

    try {
      await this.db.runAsync(sql, values);
    } catch (error) {
      console.error(`[UnifiedDB] Update error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Supprime une entité
   */
  async delete(table: EntityTable, id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
    } catch (error) {
      console.error(`[UnifiedDB] Delete error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Trouve une entité par ID
   */
  async findById<T>(table: EntityTable, id: string): Promise<T | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<DatabaseRow>(
        `SELECT * FROM ${table} WHERE id = ?`,
        [id]
      );

      return result ? this.parseRow<T>(table, result) : null;
    } catch (error) {
      console.error(`[UnifiedDB] FindById error in ${table}:`, error);
      return null;
    }
  }

  /**
   * Trouve une entité par server_id
   */
  async findByServerId<T>(table: EntityTable, serverId: string): Promise<T | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<DatabaseRow>(
        `SELECT * FROM ${table} WHERE server_id = ?`,
        [serverId]
      );

      return result ? this.parseRow<T>(table, result) : null;
    } catch (error) {
      console.error(`[UnifiedDB] FindByServerId error in ${table}:`, error);
      return null;
    }
  }

  /**
   * Trouve plusieurs entités avec options de requête
   */
  async findMany<T>(table: EntityTable, options: QueryOptions = {}): Promise<T[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const { sql, params } = this.buildSelectQuery(table, options);
      const results = await this.db.getAllAsync<DatabaseRow>(sql, params);

      return results.map((row) => this.parseRow<T>(table, row));
    } catch (error) {
      console.error(`[UnifiedDB] FindMany error in ${table}:`, error);
      return [];
    }
  }

  /**
   * Compte les entités
   */
  async count(table: EntityTable, where?: Record<string, any>): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) return 0;

    try {
      let sql = `SELECT COUNT(*) as count FROM ${table}`;
      const params: any[] = [];

      if (where) {
        const { whereClause, whereParams } = this.buildWhereClause(where);
        sql += ` WHERE ${whereClause}`;
        params.push(...whereParams);
      }

      const result = await this.db.getFirstAsync<{ count: number }>(sql, params);
      return result?.count ?? 0;
    } catch (error) {
      console.error(`[UnifiedDB] Count error in ${table}:`, error);
      return 0;
    }
  }

  // ==========================================================================
  // BULK OPERATIONS
  // ==========================================================================

  /**
   * Insère plusieurs entités en une transaction
   */
  async bulkInsert<T extends Record<string, any>>(
    table: EntityTable,
    items: T[]
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db || items.length === 0) return;

    try {
      await this.db.withTransactionAsync(async () => {
        for (const item of items) {
          const { columns, placeholders, values } = this.prepareInsertData(table, item);
          const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
          await this.db!.runAsync(sql, values);
        }
      });

      console.log(`[UnifiedDB] Bulk inserted ${items.length} rows in ${table}`);
    } catch (error) {
      console.error(`[UnifiedDB] Bulk insert error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Upsert plusieurs entités en une transaction
   */
  async bulkUpsert<T extends Record<string, any>>(
    table: EntityTable,
    items: T[]
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db || items.length === 0) return;

    try {
      await this.db.withTransactionAsync(async () => {
        for (const item of items) {
          const { columns, placeholders, values } = this.prepareInsertData(table, item);
          const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
          await this.db!.runAsync(sql, values);
        }
      });

      console.log(`[UnifiedDB] Bulk upserted ${items.length} rows in ${table}`);
    } catch (error) {
      console.error(`[UnifiedDB] Bulk upsert error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Supprime plusieurs entités
   */
  async bulkDelete(table: EntityTable, ids: string[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db || ids.length === 0) return;

    try {
      const placeholders = ids.map(() => '?').join(', ');
      await this.db.runAsync(
        `DELETE FROM ${table} WHERE id IN (${placeholders})`,
        ids
      );
    } catch (error) {
      console.error(`[UnifiedDB] Bulk delete error in ${table}:`, error);
      throw error;
    }
  }

  // ==========================================================================
  // SYNC OPERATIONS
  // ==========================================================================

  /**
   * Récupère les changements en attente de sync
   */
  async getPendingChanges(table?: EntityTable): Promise<PendingChange[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      let sql = `SELECT * FROM sync_queue`;
      const params: any[] = [];

      if (table) {
        sql += ` WHERE entity_type = ?`;
        params.push(table);
      }

      sql += ` ORDER BY priority DESC, created_at ASC`;

      const results = await this.db.getAllAsync<DatabaseRow>(sql, params);

      return results.map((row) => ({
        id: row.id,
        entityType: row.entity_type as EntityTable,
        entityId: row.entity_id,
        action: row.action,
        data: JSON.parse(row.data),
        timestamp: row.created_at,
      }));
    } catch (error) {
      console.error('[UnifiedDB] GetPendingChanges error:', error);
      return [];
    }
  }

  /**
   * Marque une entité comme synchronisée
   */
  async markAsSynced(
    table: EntityTable,
    id: string,
    serverId?: string
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      const updates: Record<string, any> = {
        sync_status: 'synced',
        sync_error: null,
        updated_at: new Date().toISOString(),
      };

      if (serverId) {
        updates.server_id = serverId;
      }

      await this.update(table, id, updates);
    } catch (error) {
      console.error(`[UnifiedDB] MarkAsSynced error in ${table}:`, error);
    }
  }

  /**
   * Marque une entité comme échouée
   */
  async markAsFailed(
    table: EntityTable,
    id: string,
    error: string
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.update(table, id, {
        sync_status: 'failed',
        sync_error: error,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`[UnifiedDB] MarkAsFailed error in ${table}:`, error);
    }
  }

  /**
   * Récupère les entités avec un certain statut de sync
   */
  async findBySyncStatus<T>(
    table: EntityTable,
    status: SyncStatusType
  ): Promise<T[]> {
    return this.findMany<T>(table, {
      where: { sync_status: status },
    });
  }

  // ==========================================================================
  // SYNC QUEUE OPERATIONS
  // ==========================================================================

  /**
   * Ajoute un item à la queue de sync
   */
  async addToSyncQueue(item: Omit<PendingChange, 'timestamp'> & {
    priority?: number;
    previousState?: any;
  }): Promise<string> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const id = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      await this.db.runAsync(
        `INSERT INTO sync_queue
         (id, entity_type, entity_id, action, data, previous_state, priority, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.entityType,
          item.entityId,
          item.action,
          JSON.stringify(item.data),
          item.previousState ? JSON.stringify(item.previousState) : null,
          item.priority ?? 50,
          Date.now(),
        ]
      );

      return id;
    } catch (error) {
      console.error('[UnifiedDB] AddToSyncQueue error:', error);
      throw error;
    }
  }

  /**
   * Supprime un item de la queue de sync
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
    } catch (error) {
      console.error('[UnifiedDB] RemoveFromSyncQueue error:', error);
    }
  }

  /**
   * Met à jour les infos de retry d'un item
   */
  async updateSyncQueueRetry(
    id: string,
    error?: string,
    nextRetryAt?: number
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `UPDATE sync_queue
         SET retry_count = retry_count + 1,
             last_attempt_at = ?,
             error = ?,
             next_retry_at = ?
         WHERE id = ?`,
        [Date.now(), error || null, nextRetryAt || null, id]
      );
    } catch (error) {
      console.error('[UnifiedDB] UpdateSyncQueueRetry error:', error);
    }
  }

  /**
   * Nettoie les items périmés de la queue
   */
  async cleanupStaleSyncItems(maxRetries: number = 5, maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) return 0;

    try {
      const cutoff = Date.now() - maxAgeMs;
      const result = await this.db.runAsync(
        `DELETE FROM sync_queue WHERE retry_count >= ? OR created_at < ?`,
        [maxRetries, cutoff]
      );

      const removed = result.changes;
      if (removed > 0) {
        console.log(`[UnifiedDB] Cleaned up ${removed} stale sync items`);
      }
      return removed;
    } catch (error) {
      console.error('[UnifiedDB] CleanupStaleSyncItems error:', error);
      return 0;
    }
  }

  // ==========================================================================
  // METADATA OPERATIONS
  // ==========================================================================

  /**
   * Définit une valeur de métadonnée
   */
  async setMetadata(key: string, value: any): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, ?)`,
        [key, JSON.stringify(value), new Date().toISOString()]
      );
    } catch (error) {
      console.error('[UnifiedDB] SetMetadata error:', error);
    }
  }

  /**
   * Récupère une valeur de métadonnée
   */
  async getMetadata<T = any>(key: string): Promise<T | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync<{ value: string }>(
        'SELECT value FROM metadata WHERE key = ?',
        [key]
      );

      return result ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error('[UnifiedDB] GetMetadata error:', error);
      return null;
    }
  }

  // ==========================================================================
  // TRANSACTIONS
  // ==========================================================================

  /**
   * Exécute une fonction dans une transaction
   */
  async transaction<T>(
    callback: (tx: Transaction) => Promise<T>
  ): Promise<T> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.withTransactionAsync(async () => {
      const tx: Transaction = {
        run: (sql, params) => this.db!.runAsync(sql, params || []),
        get: (sql, params) => this.db!.getFirstAsync(sql, params || []),
        all: (sql, params) => this.db!.getAllAsync(sql, params || []),
      };

      return callback(tx);
    });
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Obtient les statistiques de la base de données
   */
  async getStats(): Promise<DatabaseStats> {
    await this.ensureInitialized();

    const tables: EntityTable[] = [
      'properties', 'activities', 'wallet', 'transactions',
      'favorites', 'services', 'notifications', 'conversations', 'messages',
    ];

    const tableCounts: Record<string, number> = {};
    let totalRows = 0;

    for (const table of tables) {
      const count = await this.count(table);
      tableCounts[table] = count;
      totalRows += count;
    }

    const syncQueueSize = await this.count('sync_queue');
    const pendingChanges = await this.count('sync_queue', { retry_count: 0 });

    return {
      tables: tableCounts as Record<EntityTable, number>,
      totalRows,
      syncQueueSize,
      pendingChanges,
    };
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Vide toutes les tables
   */
  async clearAll(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    const tables: EntityTable[] = [
      'properties', 'activities', 'wallet', 'transactions',
      'favorites', 'services', 'service_subscriptions',
      'notifications', 'conversations', 'messages',
      'users', 'sync_queue', 'metadata',
    ];

    try {
      // Exécuter les DELETE individuellement sans transaction wrapper
      // pour éviter le deadlock si une autre transaction est en cours
      for (const table of tables) {
        try {
          await this.db!.execAsync(`DELETE FROM ${table}`);
        } catch (tableError) {
          console.warn(`[UnifiedDB] Failed to clear ${table}:`, tableError);
        }
      }

      console.log('[UnifiedDB] All tables cleared');
    } catch (error) {
      console.error('[UnifiedDB] ClearAll error:', error);
    }
  }

  /**
   * Vide une table spécifique
   */
  async clearTable(table: EntityTable): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.execAsync(`DELETE FROM ${table}`);
      console.log(`[UnifiedDB] Table ${table} cleared`);
    } catch (error) {
      console.error(`[UnifiedDB] ClearTable error for ${table}:`, error);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private prepareInsertData(
    table: EntityTable,
    data: Record<string, any>
  ): { columns: string[]; placeholders: string[]; values: any[] } {
    const columns: string[] = [];
    const placeholders: string[] = [];
    const values: any[] = [];

    // Mapper les noms de colonnes camelCase -> snake_case
    for (const [key, value] of Object.entries(data)) {
      const columnName = this.toSnakeCase(key);

      // Ignorer les propriétés non mappables
      if (this.isValidColumn(table, columnName)) {
        columns.push(columnName);
        placeholders.push('?');

        // Sérialiser les objets en JSON
        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
          values.push(JSON.stringify(value));
        } else if (value instanceof Date) {
          values.push(value.toISOString());
        } else {
          values.push(value);
        }
      }
    }

    return { columns, placeholders, values };
  }

  private prepareUpdateData(
    data: Record<string, any>
  ): { setClause: string; values: any[] } {
    const setParts: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      const columnName = this.toSnakeCase(key);
      setParts.push(`${columnName} = ?`);

      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        values.push(JSON.stringify(value));
      } else if (value instanceof Date) {
        values.push(value.toISOString());
      } else {
        values.push(value);
      }
    }

    return { setClause: setParts.join(', '), values };
  }

  private buildSelectQuery(
    table: EntityTable,
    options: QueryOptions
  ): { sql: string; params: any[] } {
    let sql = `SELECT * FROM ${table}`;
    const params: any[] = [];

    if (options.where) {
      const { whereClause, whereParams } = this.buildWhereClause(options.where);
      sql += ` WHERE ${whereClause}`;
      params.push(...whereParams);
    }

    if (options.orderBy) {
      const column = this.toSnakeCase(options.orderBy.field);
      sql += ` ORDER BY ${column} ${options.orderBy.direction}`;
    }

    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
    }

    if (options.offset) {
      sql += ` OFFSET ?`;
      params.push(options.offset);
    }

    return { sql, params };
  }

  private buildWhereClause(
    where: Record<string, any>
  ): { whereClause: string; whereParams: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(where)) {
      const column = this.toSnakeCase(key);

      if (value === null) {
        conditions.push(`${column} IS NULL`);
      } else if (Array.isArray(value)) {
        const placeholders = value.map(() => '?').join(', ');
        conditions.push(`${column} IN (${placeholders})`);
        params.push(...value);
      } else {
        conditions.push(`${column} = ?`);
        params.push(value);
      }
    }

    return {
      whereClause: conditions.join(' AND '),
      whereParams: params,
    };
  }

  private parseRow<T>(table: EntityTable, row: DatabaseRow): T {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(row)) {
      const camelKey = this.toCamelCase(key);

      // Parser les colonnes JSON
      if (this.isJsonColumn(key) && typeof value === 'string') {
        try {
          result[camelKey] = JSON.parse(value);
        } catch {
          result[camelKey] = value;
        }
      } else if (key.endsWith('_at') && typeof value === 'string') {
        // Les dates restent en string ISO
        result[camelKey] = value;
      } else if (typeof value === 'number' && (key === 'is_read' || key === 'is_deleted' || key === 'is_archived' || key === 'is_muted' || key === 'is_active' || key === 'is_verified' || key === 'deleted_for_everyone')) {
        // Convertir les booléens SQLite
        result[camelKey] = value === 1;
      } else {
        result[camelKey] = value;
      }
    }

    return result as T;
  }

  private isJsonColumn(column: string): boolean {
    const jsonColumns = [
      'data', 'participants', 'last_message', 'sender_info',
      'reply_to', 'attachments', 'reactions', 'status', 'tags',
    ];
    return jsonColumns.includes(column);
  }

  private isValidColumn(table: EntityTable, column: string): boolean {
    // Liste simplifiée - en production, on pourrait utiliser PRAGMA table_info
    return true;
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let instance: UnifiedDatabase | null = null;

export function getUnifiedDatabase(): UnifiedDatabase {
  if (!instance) {
    instance = new UnifiedDatabase();
  }
  return instance;
}

export const unifiedDatabase = getUnifiedDatabase();

export default UnifiedDatabase;
