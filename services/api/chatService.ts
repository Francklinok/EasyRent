import { getGraphQLService } from './graphqlService';

// ========== TYPES ==========
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  username?: string;
  presenceStatus?: PresenceStatus;
  lastActive?: string;
  isOnline?: boolean;
}

export interface Property {
  id: string;
  title: string;
  address?: string;
  images: string[];
  ownerCriteria?: string;
  price?: number;
  location?: Location;
}

export interface Location {
  type: string;
  coordinates: number[];
  address?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  type: ConversationType;
  propertyId?: Property;
  lastMessage?: Message;
  unreadCount?: number;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
  property?: Property;
  stats?: ConversationStats;
  onlineParticipants?: User[];
  isArchivedFor?: boolean;
  settings?: ConversationSettings;
}

export interface ConversationSettings {
  encryption?: boolean;
  disappearingMessages?: DisappearingMessagesSettings;
  smartReply?: boolean;
  translation?: boolean;
  voiceTranscription?: boolean;
  readReceipts?: boolean;
  typingIndicators?: boolean;
}

export interface DisappearingMessagesSettings {
  enabled: boolean;
  duration: number;
}

export interface ConversationStats {
  conversationId: string;
  participantsCount: number;
  messageCount: number;
  totalReactions: number;
  lastActivity: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content?: string;
  messageType: MessageType;
  mediaData?: MediaData;
  mentions?: User[];
  replyTo?: Message;
  reactions: Reaction[];
  aiInsights?: AIInsight;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  editHistory?: MessageEdit[];
  readStatus?: string;
  sentimentAnalysis?: SentimentAnalysis;
  property?: Property;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  visitData?: {
    id: string;
    date: Date;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  };
  propertyData?: {
    title: string;
    address?: string;
  };
}

export interface MediaData {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
  dimensions?: MediaDimensions;
  variants?: MediaVariant[];
}

export interface MediaDimensions {
  width: number;
  height: number;
}

export interface MediaVariant {
  size: string;
  path: string;
}

export interface MessageStatus {
  sent?: string;
  delivered?: DeliveryStatus[];
  read?: ReadStatus[];
}

export interface DeliveryStatus {
  userId: string;
  deliveredAt: string;
}

export interface ReadStatus {
  userId: string;
  readAt: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface AIInsight {
  sentiment?: SentimentAnalysis;
  intentDetection?: string;
  autoSuggestions?: string[];
  priority: MessagePriority;
  confidence: number;
  language: string;
  topics?: string[];
  entities?: string[];
}

export interface SentimentAnalysis {
  score: number;
  label: SentimentLabel;
}

export interface MessageEdit {
  content: string;
  editedAt: string;
  reason?: string;
}

// ========== ENUMS ==========
export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  PROPERTY_DISCUSSION = 'PROPERTY_DISCUSSION'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  PROPERTY = 'PROPERTY',
  VOICE_NOTE = 'VOICE_NOTE',
  AR_PREVIEW = 'AR_PREVIEW',
  VIRTUAL_TOUR = 'VIRTUAL_TOUR'
}

export enum MessagePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum SentimentLabel {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL'
}

export enum PresenceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
  BUSY = 'BUSY'
}

export enum DeleteType {
  SOFT = 'SOFT',
  HARD = 'HARD'
}

export enum DeleteScope {
  ME = 'ME',
  EVERYONE = 'EVERYONE'
}

// ========== INPUTS ==========
export interface ConversationInput {
  participantId?: string;
  type?: ConversationType;
  propertyId?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  replyToId?: string;
  mentions?: string[];
  scheduleFor?: string;
  priority?: MessagePriority;
}

export interface MessageFilters {
  messageType?: MessageType;
  senderId?: string;
  dateRange?: DateRangeInput;
}

export interface DateRangeInput {
  start: string;
  end: string;
}

export interface ReactionInput {
  messageId: string;
  conversationId: string;
  reactionType: string;
}

export interface DeleteMessageInput {
  messageId: string;
  conversationId: string;
  deleteType?: DeleteType;
  deleteFor?: DeleteScope;
}

export interface PaginationInput {
  first?: number;
  after?: string;
}

export interface ConversationSearchFilters {
  type?: ConversationType;
}

// ========== RESPONSE TYPES ==========
export interface ConversationConnection {
  edges: ConversationEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface ConversationEdge {
  node: Conversation;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// ========== SUBSCRIPTION EVENTS ==========
export interface MessageReactionEvent {
  messageId: string;
  userId: string;
  reactionType: string;
  reactions: Reaction[];
  timestamp: string;
}

export interface MessageDeletedEvent {
  messageId: string;
  deleteFor: DeleteScope;
  deletedBy: string;
  timestamp: string;
}

export interface MessageRestoredEvent {
  messageId: string;
  restoredBy: string;
  timestamp: string;
}

export interface TypingStatusEvent {
  userId: string;
  isTyping: boolean;
  typingUsers: string[];
  timestamp: string;
}

export interface PresenceStatusEvent {
  userId: string;
  status: PresenceStatus;
  lastSeen?: string;
  timestamp: string;
}

export interface MessagesReadEvent {
  userId: string;
  messageIds: string[];
  timestamp: string;
}

/**
 * Service pour gérer les fonctionnalités de chat via GraphQL
 */
export class ChatService {
  private graphql = getGraphQLService();

  // ========== QUERIES ==========

  /**
   * Récupère une conversation par son ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    const query = `
      query GetConversation($id: ID!) {
        conversation(id: $id) {
          id
          participants {
            id
            firstName
            lastName
            profilePicture
            presenceStatus
            lastActive
            isOnline
          }
          type
          propertyId {
            id
            title
            address
            images
            ownerCriteria
            price
          }
          lastMessage {
            id
            content
            messageType
            sender {
              id
              firstName
              lastName
              profilePicture
            }
            createdAt
            status {
              sent
              delivered {
                userId
                deliveredAt
              }
              read {
                userId
                readAt
              }
            }
          }
          settings {
            encryption
            disappearingMessages {
              enabled
              duration
            }
            smartReply
            translation
            voiceTranscription
            readReceipts
            typingIndicators
          }
          stats {
            conversationId
            participantsCount
            messageCount
            totalReactions
            lastActivity
          }
          onlineParticipants {
            id
            firstName
            lastName
            profilePicture
          }
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphql.query<{ conversation: Conversation }>(query, { id });
    return result.conversation;
  }

  /**
   * Récupère les conversations de l'utilisateur
   */
  async getConversations(pagination?: PaginationInput): Promise<ConversationConnection> {
    const query = `
      query GetConversations($pagination: PaginationInput) {
        conversations(pagination: $pagination) {
          edges {
            node {
              id
              participants {
                id
                firstName
                lastName
                profilePicture
                presenceStatus
                isOnline
              }
              type
              propertyId {
                id
                title
                address
                images
              }
              lastMessage {
                id
                content
                messageType
                sender {
                  id
                  firstName
                  lastName
                }
                createdAt
              }
              unreadCount(userId: "CURRENT_USER_ID")
              createdAt
              updatedAt
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    `;

    const result = await this.graphql.query<{ conversations: ConversationConnection }>(
      query,
      { pagination }
    );
    return result.conversations;
  }

  /**
   * Recherche dans les conversations
   */
  async searchConversations(
    query: string,
    filters?: ConversationSearchFilters
  ): Promise<Conversation[]> {
    const searchQuery = `
      query SearchConversations($query: String!, $filters: ConversationSearchFilters) {
        searchConversations(query: $query, filters: $filters) {
          id
          participants {
            id
            firstName
            lastName
            profilePicture
          }
          type
          propertyId {
            id
            title
            images
          }
          lastMessage {
            id
            content
            createdAt
          }
          createdAt
        }
      }
    `;

    const result = await this.graphql.query<{ searchConversations: Conversation[] }>(
      searchQuery,
      { query, filters }
    );
    return result.searchConversations;
  }

  /**
   * Récupère les messages d'une conversation
   */
  async getMessages(
    conversationId: string,
    limit = 50,
    offset = 0,
    filters?: MessageFilters
  ): Promise<Message[]> {
    const query = `
      query GetMessages(
        $conversationId: ID!
        $limit: Int
        $offset: Int
        $filters: MessageFilters
      ) {
        getMessages(
          conversationId: $conversationId
          limit: $limit
          offset: $offset
          filters: $filters
        ) {
          id
          conversationId
          sender {
            id
            firstName
            lastName
            profilePicture
          }
          content
          messageType
          mediaData {
            filename
            originalName
            size
            mimetype
            uploadedAt
            dimensions {
              width
              height
            }
            variants {
              size
              path
            }
          }
          mentions {
            id
            firstName
            lastName
            profilePicture
          }
          replyTo {
            id
            content
            sender {
              id
              firstName
              lastName
            }
          }
          reactions {
            userId
            emoji
            timestamp
          }
          aiInsights {
            sentiment {
              score
              label
            }
            intentDetection
            autoSuggestions
            priority
            confidence
            language
            topics
            entities
          }
          status {
            sent
            delivered {
              userId
              deliveredAt
            }
            read {
              userId
              readAt
            }
          }
          createdAt
          updatedAt
          isEdited
          editHistory {
            content
            editedAt
            reason
          }
          isDeleted
          deletedAt
          deletedBy
        }
      }
    `;

    const result = await this.graphql.query<{ getMessages: Message[] }>(
      query,
      { conversationId, limit, offset, filters }
    );
    return result.getMessages;
  }

  /**
   * Recherche dans les messages
   */
  async searchMessages(
    searchQuery: string,
    conversationId?: string,
    messageType?: MessageType,
    dateRange?: DateRangeInput,
    limit = 20
  ): Promise<Message[]> {
    const query = `
      query SearchMessages(
        $query: String!
        $conversationId: ID
        $messageType: MessageType
        $dateRange: DateRangeInput
        $limit: Int
      ) {
        searchMessages(
          query: $query
          conversationId: $conversationId
          messageType: $messageType
          dateRange: $dateRange
          limit: $limit
        ) {
          id
          conversationId
          sender {
            id
            firstName
            lastName
            profilePicture
          }
          content
          messageType
          createdAt
          isDeleted
        }
      }
    `;

    const result = await this.graphql.query<{ searchMessages: Message[] }>(
      query,
      { query: searchQuery, conversationId, messageType, dateRange, limit }
    );
    return result.searchMessages;
  }

  /**
   * Récupère les analytics d'une conversation
   */
  async getConversationAnalytics(conversationId: string): Promise<ConversationStats | null> {
    const query = `
      query GetConversationAnalytics($conversationId: ID!) {
        conversationAnalytics(conversationId: $conversationId) {
          conversationId
          participantsCount
          messageCount
          totalReactions
          lastActivity
        }
      }
    `;

    const result = await this.graphql.query<{ conversationAnalytics: ConversationStats }>(
      query,
      { conversationId }
    );
    return result.conversationAnalytics;
  }

  // ========== MUTATIONS ==========

  /**
   * Envoie un message
   */
  async sendMessage(input: SendMessageInput): Promise<Message> {
    const mutation = `
      mutation SendMessage($input: SendMessageInput!) {
        sendMessage(input: $input) {
          id
          conversationId
          sender {
            id
            firstName
            lastName
            profilePicture
          }
          content
          messageType
          mediaData {
            filename
            originalName
            size
            mimetype
            uploadedAt
          }
          mentions {
            id
            firstName
            lastName
          }
          replyTo {
            id
            content
            sender {
              id
              firstName
              lastName
            }
          }
          reactions {
            userId
            emoji
            timestamp
          }
          status {
            sent
            delivered {
              userId
              deliveredAt
            }
            read {
              userId
              readAt
            }
          }
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ sendMessage: Message }>(mutation, { input });
    return result.sendMessage;
  }

  /**
   * Crée ou récupère une conversation
   */
  async createOrGetConversation(input: ConversationInput): Promise<Conversation> {
    const mutation = `
      mutation CreateOrGetConversation($input: ConversationInput!) {
        createOrGetConversation(input: $input) {
          id
          participants {
            id
            firstName
            lastName
            profilePicture
            presenceStatus
          }
          type
          propertyId {
            id
            title
            address
            images
          }
          lastMessage {
            id
            content
            createdAt
          }
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ createOrGetConversation: Conversation }>(
      mutation,
      { input }
    );
    return result.createOrGetConversation;
  }

  /**
   * Réagit à un message
   */
  async reactToMessage(input: ReactionInput): Promise<Message> {
    const mutation = `
      mutation ReactToMessage($input: ReactionInput!) {
        reactToMessage(input: $input) {
          id
          reactions {
            userId
            emoji
            timestamp
          }
          updatedAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ reactToMessage: Message }>(mutation, { input });
    return result.reactToMessage;
  }

  /**
   * Marque les messages comme lus
   */
  async markMessagesAsRead(conversationId: string, messageIds: string[]): Promise<boolean> {
    const mutation = `
      mutation MarkMessagesAsRead($conversationId: ID!, $messageIds: [ID!]!) {
        markMessagesAsRead(conversationId: $conversationId, messageIds: $messageIds)
      }
    `;

    const result = await this.graphql.mutate<{ markMessagesAsRead: boolean }>(
      mutation,
      { conversationId, messageIds }
    );
    return result.markMessagesAsRead;
  }

  /**
   * Supprime un message
   */
  async deleteMessage(input: DeleteMessageInput): Promise<boolean> {
    const mutation = `
      mutation DeleteMessage($input: DeleteMessageInput!) {
        deleteMessage(input: $input)
      }
    `;

    const result = await this.graphql.mutate<{ deleteMessage: boolean }>(mutation, { input });
    return result.deleteMessage;
  }

  /**
   * Restaure un message supprimé
   */
  async restoreMessage(messageId: string): Promise<boolean> {
    const mutation = `
      mutation RestoreMessage($messageId: ID!) {
        restoreMessage(messageId: $messageId)
      }
    `;

    const result = await this.graphql.mutate<{ restoreMessage: boolean }>(
      mutation,
      { messageId }
    );
    return result.restoreMessage;
  }

  /**
   * Archive une conversation
   */
  async archiveConversation(conversationId: string): Promise<Conversation> {
    const mutation = `
      mutation ArchiveConversation($conversationId: ID!) {
        archiveConversation(conversationId: $conversationId) {
          id
          isArchivedFor(userId: "CURRENT_USER_ID")
          updatedAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ archiveConversation: Conversation }>(
      mutation,
      { conversationId }
    );
    return result.archiveConversation;
  }

  /**
   * Désarchive une conversation
   */
  async unarchiveConversation(conversationId: string): Promise<Conversation> {
    const mutation = `
      mutation UnarchiveConversation($conversationId: ID!) {
        unarchiveConversation(conversationId: $conversationId) {
          id
          isArchivedFor(userId: "CURRENT_USER_ID")
          updatedAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ unarchiveConversation: Conversation }>(
      mutation,
      { conversationId }
    );
    return result.unarchiveConversation;
  }

  /**
   * Met à jour le statut de frappe
   */
  async updateTypingStatus(conversationId: string, isTyping: boolean): Promise<boolean> {
    const mutation = `
      mutation UpdateTypingStatus($conversationId: ID!, $isTyping: Boolean!) {
        updateTypingStatus(conversationId: $conversationId, isTyping: $isTyping)
      }
    `;

    const result = await this.graphql.mutate<{ updateTypingStatus: boolean }>(
      mutation,
      { conversationId, isTyping }
    );
    return result.updateTypingStatus;
  }

  /**
   * Édite un message
   */
  async editMessage(messageId: string, newContent: string, reason?: string): Promise<Message> {
    const mutation = `
      mutation EditMessage($messageId: ID!, $newContent: String!, $reason: String) {
        editMessage(messageId: $messageId, newContent: $newContent, reason: $reason) {
          id
          content
          isEdited
          editHistory {
            content
            editedAt
            reason
          }
          updatedAt
        }
      }
    `;

    const result = await this.graphql.mutate<{ editMessage: Message }>(
      mutation,
      { messageId, newContent, reason }
    );
    return result.editMessage;
  }

  /**
   * Transfère un message
   */
  async forwardMessage(messageId: string, targetConversationIds: string[]): Promise<boolean> {
    const mutation = `
      mutation ForwardMessage($messageId: ID!, $targetConversationIds: [ID!]!) {
        forwardMessage(messageId: $messageId, targetConversationIds: $targetConversationIds)
      }
    `;

    const result = await this.graphql.mutate<{ forwardMessage: boolean }>(
      mutation,
      { messageId, targetConversationIds }
    );
    return result.forwardMessage;
  }

  // ========== SUBSCRIPTIONS ==========

  /**
   * S'abonne aux nouveaux messages d'une conversation
   */
  subscribeToMessages(conversationId: string, callback: (message: Message) => void): () => void {
    const { getChatSubscriptions } = require('../realtime/chatSubscriptions');
    const chatSubscriptions = getChatSubscriptions();

    return chatSubscriptions.subscribeToMessages(conversationId, callback);
  }

  /**
   * S'abonne au statut de frappe avec typing users
   */
  subscribeToTyping(conversationId: string, callback: (typingUsers: string[]) => void): () => void {
    const { getChatSubscriptions } = require('../realtime/chatSubscriptions');
    const chatSubscriptions = getChatSubscriptions();

    return chatSubscriptions.subscribeToTyping(conversationId, callback);
  }

  /**
   * Marque une conversation comme lue
   */
  async markConversationAsRead(conversationId: string): Promise<boolean> {
    const mutation = `
      mutation MarkConversationAsRead($conversationId: ID!) {
        markConversationAsRead(conversationId: $conversationId)
      }
    `;

    const result = await this.graphql.mutate<{ markConversationAsRead: boolean }>(
      mutation,
      { conversationId }
    );
    return result.markConversationAsRead;
  }

  /**
   * S'abonne aux réactions des messages
   */
  subscribeToReactions(
    conversationId: string,
    callback: (event: MessageReactionEvent) => void
  ): () => void {
    console.log(`Subscribing to reactions for conversation: ${conversationId}`);

    return () => {
      console.log(`Unsubscribing from reactions for conversation: ${conversationId}`);
    };
  }

  /**
   * S'abonne au statut de frappe
   */
  subscribeToTypingStatus(
    conversationId: string,
    callback: (event: TypingStatusEvent) => void
  ): () => void {
    console.log(`Subscribing to typing status for conversation: ${conversationId}`);

    return () => {
      console.log(`Unsubscribing from typing status for conversation: ${conversationId}`);
    };
  }

  /**
   * S'abonne aux mises à jour de conversation
   */
  subscribeToConversationUpdates(
    userId: string,
    callback: (conversation: Conversation) => void
  ): () => void {
    console.log(`Subscribing to conversation updates for user: ${userId}`);

    return () => {
      console.log(`Unsubscribing from conversation updates for user: ${userId}`);
    };
  }

  /**
   * S'abonne au statut de présence
   */
  subscribeToPresenceStatus(
    userId: string,
    callback: (event: PresenceStatusEvent) => void
  ): () => void {
    console.log(`Subscribing to presence status for user: ${userId}`);

    return () => {
      console.log(`Unsubscribing from presence status for user: ${userId}`);
    };
  }
}

// Instance unique du service chat
let chatServiceInstance: ChatService | null = null;

/**
 * Récupère l'instance du service chat
 */
export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService();
  }
  return chatServiceInstance;
}