/**
 * OfflineDatabase - Base de données SQLite spécialisée pour le Chat
 *
 * @deprecated Pour les NOUVELLES fonctionnalités, utilisez UnifiedDatabase depuis '@/services/offline'.
 * Cette base de données est maintenue pour la gestion spécialisée des conversations et messages.
 *
 * USAGE RECOMMANDÉ:
 * - Chat (conversations, messages) → Garder offlineDB
 * - Autres entités (properties, activities, etc.) → Utiliser unifiedDatabase
 *
 * MIGRATION FUTURE:
 * import { unifiedDatabase } from '@/services/offline';
 */

import * as SQLite from 'expo-sqlite';
import { Conversation, Message } from '../api/chatService';

/**
 * @deprecated Utilisez QueueItem depuis '@/services/offline' pour les nouvelles fonctionnalités
 */
export interface SyncQueueItem {
  id: string;
  type: 'message' | 'reaction' | 'read_status' | 'typing' | 'delete_message';
  data: any;
  timestamp: number;
  retryCount: number;
  lastRetry?: number;
  error?: string;
}

const MAX_SYNC_RETRIES = 5;
const STALE_SYNC_ITEM_MS = 24 * 60 * 60 * 1000; // 24h

class OfflineDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private transactionQueue: Promise<void> = Promise.resolve();

  async initialize(): Promise<void> {
    if (this.isInitialized && this.db) return;

    // Prevent multiple concurrent initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async doInitialize(): Promise<void> {
    try {
      // Close existing connection if any
      if (this.db) {
        try {
          await this.db.closeAsync();
        } catch (e) {
          // Ignore close errors
        }
        this.db = null;
      }

      this.db = await SQLite.openDatabaseAsync('chat_offline.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('[OfflineDB] Base de données initialisée');
    } catch (error) {
      console.error('[OfflineDB] Erreur initialisation:', error);
      this.isInitialized = false;
      this.db = null;
      // Don't throw - just log and return to prevent app crashes
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      // Table des conversations
      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT,
        avatar TEXT,
        participants TEXT NOT NULL,
        lastMessage TEXT,
        lastMessageTime TEXT,
        unreadCount INTEGER DEFAULT 0,
        isArchived INTEGER DEFAULT 0,
        isMuted INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncStatus TEXT DEFAULT 'synced'
      )`,

      // Table des messages
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        content TEXT NOT NULL,
        messageType TEXT NOT NULL,
        senderId TEXT NOT NULL,
        senderInfo TEXT,
        replyToId TEXT,
        replyTo TEXT,
        attachments TEXT,
        reactions TEXT,
        status TEXT,
        isDeleted INTEGER DEFAULT 0,
        deletedForEveryone INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncStatus TEXT DEFAULT 'synced',
        FOREIGN KEY (conversationId) REFERENCES conversations (id)
      )`,

      // Table de la file de synchronisation
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retryCount INTEGER DEFAULT 0,
        lastRetry INTEGER,
        error TEXT
      )`,

      // Table des métadonnées
      `CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`,

      // Index pour les performances
      `CREATE INDEX IF NOT EXISTS idx_messages_conversation 
       ON messages (conversationId, createdAt DESC)`,
      
      `CREATE INDEX IF NOT EXISTS idx_messages_status 
       ON messages (syncStatus)`,
       
      `CREATE INDEX IF NOT EXISTS idx_sync_queue_timestamp 
       ON sync_queue (timestamp ASC)`,
    ];

    for (const query of queries) {
      await this.db.execAsync(query);
    }
  }

  // === CONVERSATIONS ===

  async saveConversations(conversations: Conversation[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.runTransaction(async () => {
        await this.db!.withTransactionAsync(async () => {
          for (const conv of conversations) {
            await this.db!.runAsync(
              `INSERT OR REPLACE INTO conversations
               (id, type, title, avatar, participants, lastMessage, lastMessageTime,
                unreadCount, isArchived, isMuted, createdAt, updatedAt, syncStatus)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                conv.id,
                conv.type,
                conv.title || null,
                conv.avatar || null,
                JSON.stringify(conv.participants),
                conv.lastMessage ? JSON.stringify(conv.lastMessage) : null,
                conv.lastMessage?.createdAt || null,
                conv.unreadCount || 0,
                conv.isArchived ? 1 : 0,
                conv.isMuted ? 1 : 0,
                conv.createdAt,
                conv.updatedAt,
                'synced'
              ]
            );
          }
        });
      });

      console.log(`[OfflineDB] ${conversations.length} conversations sauvegardées`);
    } catch (error) {
      console.error('[OfflineDB] Erreur sauvegarde conversations:', error);
      throw error;
    }
  }

  async getConversations(): Promise<Conversation[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM conversations
         ORDER BY lastMessageTime DESC, createdAt DESC`
      );

      return result.map(row => this.parseConversation(row as any));
    } catch (error) {
      console.error('[OfflineDB] Erreur récupération conversations:', error);
      return [];
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM conversations WHERE id = ?',
        [id]
      );

      return result ? this.parseConversation(result as any) : null;
    } catch (error) {
      console.error('[OfflineDB] Erreur récupération conversation:', error);
      return null;
    }
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        'UPDATE conversations SET unreadCount = 0, updatedAt = ? WHERE id = ?',
        [new Date().toISOString(), conversationId]
      );
      
      console.log(`[OfflineDB] Conversation ${conversationId} marquée comme lue`);
    } catch (error) {
      console.error('[OfflineDB] Erreur markConversationAsRead:', error);
    }
  }

  // === MESSAGES ===

  async saveMessages(conversationId: string, messages: Message[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.runTransaction(async () => {
        await this.db!.withTransactionAsync(async () => {
          for (const msg of messages) {
            await this.db!.runAsync(
              `INSERT OR REPLACE INTO messages
               (id, conversationId, content, messageType, senderId, senderInfo,
                replyToId, replyTo, attachments, reactions, status, isDeleted,
                deletedForEveryone, createdAt, updatedAt, syncStatus)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                msg.id,
                conversationId,
                msg.content,
                msg.messageType || msg.type || 'TEXT',
                msg.sender.id,
                JSON.stringify(msg.sender),
                msg.replyTo?.id || null,
                msg.replyTo ? JSON.stringify(msg.replyTo) : null,
                msg.attachments ? JSON.stringify(msg.attachments) : null,
                msg.reactions ? JSON.stringify(msg.reactions) : null,
                msg.status ? JSON.stringify(msg.status) : null,
                0, // isDeleted
                0, // deletedForEveryone
                msg.createdAt,
                msg.updatedAt,
                msg.id.startsWith('temp_') ? 'pending' : 'synced'
              ]
            );
          }
        });
      });

      console.log(`[OfflineDB] ${messages.length} messages sauvegardés`);
    } catch (error) {
      console.error('[OfflineDB] Erreur sauvegarde messages:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM messages 
         WHERE conversationId = ? AND isDeleted = 0 
         ORDER BY createdAt DESC 
         LIMIT ? OFFSET ?`,
        [conversationId, limit, offset]
      );

      return result.map(row => this.parseMessage(row as any));
    } catch (error) {
      console.error('[OfflineDB] Erreur récupération messages:', error);
      return [];
    }
  }

  async markMessageAsDeleted(messageId: string, forEveryone: boolean = false): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `UPDATE messages 
         SET isDeleted = 1, deletedForEveryone = ?, updatedAt = ? 
         WHERE id = ?`,
        [forEveryone ? 1 : 0, new Date().toISOString(), messageId]
      );
      
      console.log(`[OfflineDB] Message ${messageId} marqué comme supprimé`);
    } catch (error) {
      console.error('[OfflineDB] Erreur markMessageAsDeleted:', error);
    }
  }

  // === FILE DE SYNCHRONISATION ===

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.db.runAsync(
        `INSERT INTO sync_queue (id, type, data, timestamp, retryCount)
         VALUES (?, ?, ?, ?, ?)`,
        [id, item.type, JSON.stringify(item.data), Date.now(), 0]
      );
      
      console.log(`[OfflineDB] Élément ajouté à la file de sync: ${item.type}`);
    } catch (error) {
      console.error('[OfflineDB] Erreur addToSyncQueue:', error);
    }
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM sync_queue ORDER BY timestamp ASC'
      );

      return result.map(row => ({
        id: (row as any).id,
        type: (row as any).type,
        data: JSON.parse((row as any).data),
        timestamp: (row as any).timestamp,
        retryCount: (row as any).retryCount,
      }));
    } catch (error) {
      console.error('[OfflineDB] Erreur getSyncQueue:', error);
      return [];
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
      console.log(`[OfflineDB] Élément supprimé de la file de sync: ${id}`);
    } catch (error) {
      console.error('[OfflineDB] Erreur removeFromSyncQueue:', error);
    }
  }

  async updateSyncQueueRetry(id: string, error?: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `UPDATE sync_queue 
         SET retryCount = retryCount + 1, lastRetry = ?, error = ? 
         WHERE id = ?`,
        [Date.now(), error || null, id]
      );
    } catch (error) {
      console.error('[OfflineDB] Erreur updateSyncQueueRetry:', error);
    }
  }

  // === MÉTADONNÉES ===

  async setMetadata(key: string, value: any): Promise<void> {
    const initialized = await this.ensureInitialized();
    if (!initialized || !this.db) {
      console.warn('[OfflineDB] setMetadata skipped - database not available');
      return;
    }

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO metadata (key, value, updatedAt)
         VALUES (?, ?, ?)`,
        [key, JSON.stringify(value), new Date().toISOString()]
      );
    } catch (error) {
      console.error('[OfflineDB] Erreur setMetadata:', error);
      // Reset initialization state on critical errors
      if (error instanceof Error && error.message.includes('NullPointerException')) {
        this.isInitialized = false;
        this.db = null;
      }
    }
  }

  async getMetadata(key: string): Promise<any> {
    await this.ensureInitialized();
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync(
        'SELECT value FROM metadata WHERE key = ?',
        [key]
      );

      return result ? JSON.parse((result as any).value) : null;
    } catch (error) {
      console.error('[OfflineDB] Erreur getMetadata:', error);
      return null;
    }
  }

  // === NETTOYAGE ===

  async cleanupStaleSyncItems(): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) return 0;

    try {
      const cutoff = Date.now() - STALE_SYNC_ITEM_MS;
      const result = await this.db.runAsync(
        `DELETE FROM sync_queue WHERE retryCount >= ? OR timestamp < ?`,
        [MAX_SYNC_RETRIES, cutoff]
      );
      const removed = result.changes;
      if (removed > 0) {
        console.log(`[OfflineDB] ${removed} stale sync items removed`);
      }
      return removed;
    } catch (error) {
      console.error('[OfflineDB] Erreur cleanupStaleSyncItems:', error);
      return 0;
    }
  }

  async getPendingMessages(conversationId: string): Promise<Message[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM messages
         WHERE conversationId = ? AND syncStatus = 'pending' AND isDeleted = 0
         ORDER BY createdAt ASC`,
        [conversationId]
      );
      return result.map(row => this.parseMessage(row as any));
    } catch (error) {
      console.error('[OfflineDB] Erreur getPendingMessages:', error);
      return [];
    }
  }

  async updateMessageSyncStatus(messageId: string, status: 'synced' | 'pending' | 'failed'): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        'UPDATE messages SET syncStatus = ?, updatedAt = ? WHERE id = ?',
        [status, new Date().toISOString(), messageId]
      );
    } catch (error) {
      console.error('[OfflineDB] Erreur updateMessageSyncStatus:', error);
    }
  }

  // === UTILITAIRES ===

  async clear(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    try {
      await this.runTransaction(async () => {
        await this.db!.withTransactionAsync(async () => {
          await this.db!.execAsync('DELETE FROM conversations');
          await this.db!.execAsync('DELETE FROM messages');
          await this.db!.execAsync('DELETE FROM sync_queue');
          await this.db!.execAsync('DELETE FROM metadata');
        });
      });

      console.log('[OfflineDB] Cache vidé');
    } catch (error) {
      console.error('[OfflineDB] Erreur clear:', error);
    }
  }

  async getStats(): Promise<{ conversations: number; messages: number; syncQueue: number }> {
    await this.ensureInitialized();
    if (!this.db) return { conversations: 0, messages: 0, syncQueue: 0 };

    try {
      const [convResult, msgResult, syncResult] = await Promise.all([
        this.db.getFirstAsync('SELECT COUNT(*) as count FROM conversations'),
        this.db.getFirstAsync('SELECT COUNT(*) as count FROM messages'),
        this.db.getFirstAsync('SELECT COUNT(*) as count FROM sync_queue'),
      ]);

      return {
        conversations: (convResult as any)?.count || 0,
        messages: (msgResult as any)?.count || 0,
        syncQueue: (syncResult as any)?.count || 0,
      };
    } catch (error) {
      console.error('[OfflineDB] Erreur getStats:', error);
      return { conversations: 0, messages: 0, syncQueue: 0 };
    }
  }

  // === MÉTHODES PRIVÉES ===

  /**
   * Serialize transaction calls to prevent "cannot start a transaction within a transaction"
   */
  private async runTransaction(fn: () => Promise<void>): Promise<void> {
    const prev = this.transactionQueue;
    this.transactionQueue = prev.then(() => fn(), () => fn());
    return this.transactionQueue;
  }

  private async ensureInitialized(): Promise<boolean> {
    if (!this.isInitialized || !this.db) {
      await this.initialize();
    }
    return this.isInitialized && this.db !== null;
  }

  private parseConversation(row: any): Conversation {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      avatar: row.avatar,
      participants: JSON.parse(row.participants),
      lastMessage: row.lastMessage ? JSON.parse(row.lastMessage) : null,
      unreadCount: row.unreadCount,
      isArchived: row.isArchived === 1,
      isMuted: row.isMuted === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private parseMessage(row: any): Message {
    return {
      id: row.id,
      conversationId: row.conversationId,
      content: row.content,
      messageType: row.messageType,
      type: row.messageType, // Compatibilité
      sender: JSON.parse(row.senderInfo),
      replyTo: row.replyTo ? JSON.parse(row.replyTo) : null,
      attachments: row.attachments ? JSON.parse(row.attachments) : null,
      reactions: row.reactions ? JSON.parse(row.reactions) : null,
      status: row.status ? JSON.parse(row.status) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// Instance singleton
const offlineDB = new OfflineDatabase();
export default offlineDB;