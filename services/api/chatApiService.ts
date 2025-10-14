import { API_CONFIG, buildChatUrl } from '../../constants/apiConfig';

/**
 * Service pour les requêtes HTTP directes vers l'API Chat (REST)
 * Complément du ChatService GraphQL pour les endpoints REST spécifiques
 */
export class ChatApiService {
  private baseUrl: string = API_CONFIG.CHAT_URL;

  /**
   * Obtient le token d'authentification
   */
  private async getAuthToken(): Promise<string | null> {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('accessToken');
  }

  /**
   * Effectue une requête HTTP vers l'API Chat
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const url = buildChatUrl(endpoint);

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    console.log(`Chat API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Crée ou récupère une conversation (REST endpoint)
   */
  async createOrGetConversation(data: {
    participantId?: string;
    type?: string;
    propertyId?: string;
  }): Promise<any> {
    return this.makeRequest('create-or-get', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Récupère les conversations de l'utilisateur (REST endpoint)
   */
  async getUserConversations(page: number = 1, limit: number = 20): Promise<any> {
    return this.makeRequest(`conversations?page=${page}&limit=${limit}`);
  }

  /**
   * Envoie un message (REST endpoint avec support multimédia)
   */
  async sendMessage(data: {
    conversationId: string;
    content: string;
    messageType?: string;
    replyToId?: string;
    mentions?: string[];
  }, mediaFile?: File): Promise<any> {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    const token = await this.getAuthToken();
    const url = buildChatUrl('messages');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Send Message Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Récupère les messages d'une conversation (REST endpoint)
   */
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    return this.makeRequest(
      `conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
  }

  /**
   * Réagit à un message (REST endpoint)
   */
  async reactToMessage(
    conversationId: string,
    messageId: string,
    reactionType: string
  ): Promise<any> {
    return this.makeRequest(
      `conversations/${conversationId}/messages/${messageId}/reactions`,
      {
        method: 'POST',
        body: JSON.stringify({ reactionType }),
      }
    );
  }

  /**
   * Marque une conversation comme lue (REST endpoint)
   */
  async markConversationAsRead(conversationId: string): Promise<any> {
    return this.makeRequest(`conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  }

  /**
   * Envoie un indicateur de frappe (REST endpoint)
   */
  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<any> {
    return this.makeRequest('conversations/typing', {
      method: 'POST',
      body: JSON.stringify({ conversationId, isTyping }),
    });
  }

  /**
   * Recherche dans les messages (REST endpoint)
   */
  async searchMessages(
    query: string,
    conversationId?: string,
    messageType?: string
  ): Promise<any> {
    const params = new URLSearchParams({ query });
    if (conversationId) params.append('conversationId', conversationId);
    if (messageType) params.append('messageType', messageType);

    return this.makeRequest(`messages/search?${params.toString()}`);
  }

  /**
   * Archive une conversation (REST endpoint)
   */
  async archiveConversation(conversationId: string): Promise<any> {
    return this.makeRequest(`conversations/${conversationId}/archive`, {
      method: 'PATCH',
    });
  }

  /**
   * Désarchive une conversation (REST endpoint)
   */
  async unarchiveConversation(conversationId: string): Promise<any> {
    return this.makeRequest(`conversations/${conversationId}/unarchive`, {
      method: 'PATCH',
    });
  }

  /**
   * Obtient les statistiques d'une conversation (REST endpoint)
   */
  async getConversationStats(conversationId: string): Promise<any> {
    return this.makeRequest(`conversations/${conversationId}/stats`);
  }

  /**
   * Supprime un message (REST endpoint)
   */
  async deleteMessage(
    conversationId: string,
    messageId: string,
    deleteType: 'SOFT' | 'HARD' = 'SOFT',
    deleteFor: 'ME' | 'EVERYONE' = 'ME'
  ): Promise<any> {
    return this.makeRequest(
      `conversations/${conversationId}/messages/${messageId}/delete`,
      {
        method: 'PATCH',
        body: JSON.stringify({ deleteType, deleteFor }),
      }
    );
  }

  /**
   * Restaure un message supprimé (REST endpoint)
   */
  async restoreMessage(messageId: string): Promise<any> {
    return this.makeRequest(`messages/${messageId}/restore`, {
      method: 'PATCH',
    });
  }

  /**
   * Test de connectivité avec l'API Chat
   */
  async testConnection(): Promise<{ success: boolean; url: string; error?: string }> {
    try {
      const url = buildChatUrl('');
      const response = await fetch(url.replace('/api/chat/', '/api/chat'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthToken() && {
            Authorization: `Bearer ${await this.getAuthToken()}`
          }),
        },
      });

      return {
        success: response.ok,
        url,
        ...(response.ok ? {} : { error: `HTTP ${response.status}` })
      };
    } catch (error) {
      return {
        success: false,
        url: this.baseUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Instance unique du service
let chatApiServiceInstance: ChatApiService | null = null;

/**
 * Récupère l'instance du service API Chat
 */
export function getChatApiService(): ChatApiService {
  if (!chatApiServiceInstance) {
    chatApiServiceInstance = new ChatApiService();
  }
  return chatApiServiceInstance;
}