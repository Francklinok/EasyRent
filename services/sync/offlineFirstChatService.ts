import { ChatService, Conversation, Message, SendMessageInput, MessageType } from '../api/chatService';
import offlineDB from '../storage/offlineDatabase';
import EncryptionService from '../encryption/encryptionService';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingItems: number;
}

class OfflineFirstChatService {
  private chatService: ChatService;
  private syncStatus: SyncStatus = {
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0
  };
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.chatService = new ChatService();
    this.initNetworkListener();
    this.startPeriodicSync();
    this.cleanupOnInit();
  }

  private async cleanupOnInit(): Promise<void> {
    try {
      await offlineDB.cleanupStaleSyncItems();
    } catch (error) {
      console.error('[OfflineFirstChat] Cleanup error:', error);
    }
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || 'unknown';
      }
    } catch {}
    return 'unknown';
  }

  /**
   * Initialise l'écouteur réseau
   */
  private initNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log('[OfflineFirstChat] État réseau:', this.isOnline ? 'En ligne' : 'Hors ligne');

      // Si on vient de se reconnecter, synchroniser
      if (wasOffline && this.isOnline) {
        console.log('[OfflineFirstChat] Reconnexion détectée, synchronisation...');
        this.syncAll();
      }
    });
  }

  /**
   * Démarre la synchronisation périodique
   */
  private startPeriodicSync(): void {
    // Synchroniser toutes les 30 secondes si en ligne
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncStatus.isSyncing) {
        this.syncAll();
      }
    }, 30000);
  }

  /**
   * Arrête la synchronisation périodique
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Récupère les conversations (offline-first)
   */
  async getConversations(forceOnline: boolean = false): Promise<Conversation[]> {
    try {
      // 1. Charger depuis le cache local d'abord
      const cachedConversations = await offlineDB.getConversations();

      // Si hors ligne ou pas de forçage, retourner le cache
      if (!this.isOnline || !forceOnline) {
        if (cachedConversations.length > 0) {
          console.log(`[OfflineFirstChat] ${cachedConversations.length} conversations chargées depuis le cache`);
          return this.decryptConversations(cachedConversations);
        }
      }

      // 2. Si en ligne, charger depuis le serveur
      if (this.isOnline) {
        try {
          const response = await this.chatService.getConversations({ first: 50 });
          const onlineConversations = response.edges.map(edge => edge.node);

          // Déchiffrer et sauvegarder en cache
          const decrypted = this.decryptConversations(onlineConversations);
          await offlineDB.saveConversations(decrypted);

          console.log(`[OfflineFirstChat] ${decrypted.length} conversations synchronisées`);
          return decrypted;
        } catch (error) {
          console.error('[OfflineFirstChat] Erreur chargement online:', error);
          // En cas d'erreur, retourner le cache
          return this.decryptConversations(cachedConversations);
        }
      }

      return this.decryptConversations(cachedConversations);
    } catch (error) {
      console.error('[OfflineFirstChat] Erreur getConversations:', error);
      return [];
    }
  }

  /**
   * Récupère une conversation spécifique
   */
  async getConversation(id: string, forceOnline: boolean = false): Promise<Conversation | null> {
    try {
      // 1. Charger depuis le cache
      const cached = await offlineDB.getConversation(id);

      if (!this.isOnline || !forceOnline) {
        if (cached) {
          return this.decryptConversation(cached);
        }
      }

      // 2. Si en ligne, charger depuis le serveur
      if (this.isOnline) {
        try {
          const conversation = await this.chatService.getConversation(id);
          if (conversation) {
            const decrypted = this.decryptConversation(conversation);
            await offlineDB.saveConversations([decrypted]);
            return decrypted;
          }
        } catch (error) {
          console.error('[OfflineFirstChat] Erreur chargement conversation:', error);
          return cached ? this.decryptConversation(cached) : null;
        }
      }

      return cached ? this.decryptConversation(cached) : null;
    } catch (error) {
      console.error('[OfflineFirstChat] Erreur getConversation:', error);
      return null;
    }
  }

  /**
   * Récupère les messages d'une conversation (offline-first)
   */
  async getMessages(
    conversationId: string,
    params?: { limit?: number; offset?: number },
    forceOnline: boolean = false
  ): Promise<{ edges: { node: Message }[]; pageInfo: any }> {
    try {
      // 1. Charger depuis le cache
      const cachedMessages = await offlineDB.getMessages(
        conversationId,
        params?.limit || 50
      );

      if (!this.isOnline || !forceOnline) {
        if (cachedMessages.length > 0) {
          console.log(`[OfflineFirstChat] ${cachedMessages.length} messages chargés depuis le cache`);
          const decrypted = this.decryptMessages(cachedMessages);
          return {
            edges: decrypted.map(msg => ({ node: msg })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false
            }
          };
        }
      }

      // 2. Si en ligne, charger depuis le serveur
      if (this.isOnline) {
        try {
          const response = await this.chatService.getMessages(
            conversationId,
            params?.limit || 50,
            params?.offset || 0
          );
          const messages = response.edges.map(edge => edge.node);

          // Déchiffrer et sauvegarder
          const decrypted = this.decryptMessages(messages);
          await offlineDB.saveMessages(conversationId, decrypted);

          console.log(`[OfflineFirstChat] ${decrypted.length} messages synchronisés`);
          return {
            edges: decrypted.map(msg => ({ node: msg })),
            pageInfo: response.pageInfo
          };
        } catch (error) {
          console.error('[OfflineFirstChat] Erreur chargement messages online:', error);
          // Retourner le cache
          const decrypted = this.decryptMessages(cachedMessages);
          return {
            edges: decrypted.map(msg => ({ node: msg })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false
            }
          };
        }
      }

      const decrypted = this.decryptMessages(cachedMessages);
      return {
        edges: decrypted.map(msg => ({ node: msg })),
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    } catch (error) {
      console.error('[OfflineFirstChat] Erreur getMessages:', error);
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }
  }

  /**
   * Envoie un message (offline-first)
   */
  async sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = MessageType.TEXT
  ): Promise<Message> {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = await this.getCurrentUserId();

    const tempMessage: Message = {
      id: tempId,
      conversationId,
      content,
      messageType: type,
      sender: { id: userId } as any,
      reactions: [],
      status: { sent: new Date().toISOString() } as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Sauvegarder localement immediatement (syncStatus = 'pending')
      await offlineDB.saveMessages(conversationId, [tempMessage]);

      // 2. Si en ligne, envoyer au serveur
      if (this.isOnline) {
        try {
          const input: SendMessageInput = {
            conversationId,
            content,
            messageType: type
          };

          const sentMessage = await this.chatService.sendMessage(input);
          const decrypted = this.decryptMessage(sentMessage);

          // Marquer le temp message comme synced et sauvegarder le vrai
          await offlineDB.updateMessageSyncStatus(tempId, 'synced');
          await offlineDB.saveMessages(conversationId, [decrypted]);

          return decrypted;
        } catch (error) {
          console.error('[OfflineFirstChat] Erreur envoi message:', error);
          await offlineDB.updateMessageSyncStatus(tempId, 'failed');
          await offlineDB.addToSyncQueue({
            type: 'message',
            data: { conversationId, content, type }
          });
          return tempMessage;
        }
      } else {
        // Hors ligne: ajouter a la file de sync
        await offlineDB.addToSyncQueue({
          type: 'message',
          data: { conversationId, content, type }
        });
        console.log('[OfflineFirstChat] Message ajoute a la file (hors ligne)');
        return tempMessage;
      }
    } catch (error) {
      console.error('[OfflineFirstChat] Erreur sendMessage:', error);
      throw error;
    }
  }

  /**
   * Synchronise toutes les données en attente
   */
  async syncAll(): Promise<void> {
    if (this.syncStatus.isSyncing) {
      console.log('[OfflineFirstChat] Synchronisation déjà en cours');
      return;
    }

    if (!this.isOnline) {
      console.log('[OfflineFirstChat] Hors ligne, synchronisation annulée');
      return;
    }

    this.syncStatus.isSyncing = true;

    try {
      const queue = await offlineDB.getSyncQueue();
      this.syncStatus.pendingItems = queue.length;

      console.log(`[OfflineFirstChat] Synchronisation de ${queue.length} éléments...`);

      for (const item of queue) {
        try {
          switch (item.type) {
            case 'message':
              await this.chatService.sendMessage({
                conversationId: item.data.conversationId,
                content: item.data.content,
                messageType: item.data.type
              });
              break;
            case 'reaction':
              await this.chatService.reactToMessage({
                messageId: item.data.messageId,
                conversationId: item.data.conversationId,
                reactionType: item.data.emoji
              });
              break;
            case 'delete_message':
              await this.chatService.deleteMessage({
                messageId: item.data.messageId,
                conversationId: item.data.conversationId,
                deleteType: item.data.deleteType,
                deleteFor: item.data.deleteFor
              });
              break;
          }

          await offlineDB.removeFromSyncQueue(item.id);
          this.syncStatus.pendingItems--;
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('[OfflineFirstChat] Erreur sync item:', errMsg);
          await offlineDB.updateSyncQueueRetry(item.id, errMsg);
        }
      }

      // Nettoyer les items qui ont trop echoue
      await offlineDB.cleanupStaleSyncItems();

      this.syncStatus.lastSyncTime = Date.now();
      await offlineDB.setMetadata('lastSyncTime', this.syncStatus.lastSyncTime);

      console.log('[OfflineFirstChat] Synchronisation terminée');
    } catch (error) {
      console.error('[OfflineFirstChat] Erreur syncAll:', error);
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  /**
   * Déchiffre les conversations
   */
  private decryptConversations(conversations: Conversation[]): Conversation[] {
    return conversations.map(conv => this.decryptConversation(conv));
  }

  /**
   * Déchiffre une conversation
   */
  private decryptConversation(conversation: Conversation): Conversation {
    if (conversation.lastMessage) {
      conversation.lastMessage = this.decryptMessage(conversation.lastMessage);
    }
    if (conversation.messages) {
      conversation.messages = this.decryptMessages(conversation.messages);
    }
    return conversation;
  }

  /**
   * Déchiffre les messages
   */
  private decryptMessages(messages: Message[]): Message[] {
    return messages.map(msg => this.decryptMessage(msg));
  }

  /**
   * Déchiffre un message
   */
  private decryptMessage(message: Message): Message {
    if (message.content && EncryptionService.isEncrypted(message.content)) {
      return {
        ...message,
        content: EncryptionService.decrypt(message.content)
      };
    }
    return message;
  }

  /**
   * Récupère le statut de synchronisation
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Vide le cache (déconnexion)
   */
  async clearCache(): Promise<void> {
    await offlineDB.clear();
    console.log('[OfflineFirstChat] Cache vidé');
  }

  /**
   * Souscription aux messages (délégué au ChatService)
   */
  subscribeToMessages(conversationId: string, callback: (message: Message) => void): () => void {
    return this.chatService.subscribeToMessages(conversationId, (message) => {
      // Déchiffrer avant d'appeler le callback
      const decrypted = this.decryptMessage(message);

      // Sauvegarder localement
      offlineDB.saveMessages(conversationId, [decrypted]).catch(err => {
        console.error('[OfflineFirstChat] Erreur sauvegarde message reçu:', err);
      });

      callback(decrypted);
    });
  }

  /**
   * Souscription au typing (délégué au ChatService)
   */
  subscribeToTyping(conversationId: string, callback: (typingUsers: string[]) => void): () => void {
    return this.chatService.subscribeToTyping(conversationId, callback);
  }

  /**
   * Supprime un message (offline-first)
   */
  async deleteMessage(
    messageId: string,
    conversationId: string,
    deleteType: 'soft' | 'hard' = 'soft',
    deleteFor: 'me' | 'everyone' = 'me'
  ): Promise<void> {
    // Marquer comme supprime localement immediatement
    await offlineDB.markMessageAsDeleted(messageId, deleteFor === 'everyone');

    const deleteInput = {
      messageId,
      conversationId,
      deleteType: deleteType.toUpperCase() as any,
      deleteFor: deleteFor.toUpperCase() as any
    };

    try {
      if (this.isOnline) {
        await this.chatService.deleteMessage(deleteInput);
      } else {
        await offlineDB.addToSyncQueue({
          type: 'delete_message',
          data: deleteInput
        });
      }
      console.log(`[OfflineFirstChat] Message ${messageId} supprime (${deleteFor})`);
    } catch (error) {
      console.error('[OfflineFirstChat] Erreur suppression serveur, queued:', error);
      await offlineDB.addToSyncQueue({
        type: 'delete_message',
        data: deleteInput
      });
    }
  }

  /**
   * Ajoute une réaction à un message (offline-first)
   */
  async reactToMessage(
    messageId: string,
    emoji: string,
    conversationId: string
  ): Promise<void> {
    try {
      if (this.isOnline) {
        // Envoyer au serveur
        await this.chatService.reactToMessage({
          messageId,
          conversationId,
          reactionType: emoji
        });
      } else {
        // Ajouter à la file de sync
        await offlineDB.addToSyncQueue({
          type: 'reaction',
          data: { messageId, emoji, conversationId }
        });
      }

      console.log(`[OfflineFirstChat] Réaction ${emoji} ajoutée au message ${messageId}`);
    } catch (error) {
      console.error('[OfflineFirstChat] Erreur ajout réaction:', error);
      throw error;
    }
  }

  /**
   * Marque une conversation comme lue
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      if (this.isOnline) {
        // Envoyer au serveur
        await this.chatService.markConversationAsRead(conversationId);
        console.log(`[OfflineFirstChat] Conversation ${conversationId} marquée comme lue`);
      }

      // Mettre à jour localement
      await offlineDB.markConversationAsRead(conversationId);
    } catch (error) {
      console.error('[OfflineFirstChat] Erreur markConversationAsRead:', error);
      // Ne pas throw - marquer localement même en cas d'erreur réseau
      await offlineDB.markConversationAsRead(conversationId);
    }
  }
}

// Instance singleton
export const offlineFirstChatService = new OfflineFirstChatService();
export default offlineFirstChatService;
