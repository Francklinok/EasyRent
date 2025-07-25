import { SendMessageParams } from "@/types/MessageTypes";
import { SendMessageResponse } from "@/types/MessageTypes";
import { FrontendMessage } from "@/types/MessageTypes";


class MessageService {
  private baseURL: string;

  constructor(baseURL: string = '/api/messages') {
    this.baseURL = baseURL;
  }

  /**
   * Envoie un message dans une conversation
   */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    try {
      const messageData: Partial<FrontendMessage> = {
        msgId: this.generateTempId(), // Génération côté client
        senderId: params.senderId,
        conversationId: params.conversationId,
        messageType: params.messageType,
        content: params.content,
        mediaData: params.mediaData,
        reactions: [],
        mentions: params.mentions || [],
        status: {
          sent: new Date().toISOString(),
          delivered: [],
          read: []
        },
        replyTo: params.replyTo,
        isDeleted: false,
        deletedFor: [],
        canRestore: true,
        isEdited: false,
        editHistory: [],
        location: params.location,
        aiInsights: await this.generateAIInsights(params.content, params.messageType),
        theme: 'auto',
        scheduledFor: params.scheduledFor,
        isScheduled: !!params.scheduledFor,
        temporaryAccess: params.temporaryAccess,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      await this.updateConversationActivity(params.conversationId, params.senderId);
      await this.sendPushNotifications(params.conversationId, params.senderId, params.content);

      return {
        success: true,
        message: result.message
      };

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Génère un ID temporaire côté client
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Envoie un message texte simple
   */
  async sendTextMessage(
    conversationId: string,
    senderId: string,
    content: string,
    mentions?: string[],
    replyTo?: string
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      conversationId,
      senderId,
      messageType: 'text',
      content,
      mentions,
      replyTo
    });
  }

  /**
   * Envoie un message avec média
   */
  async sendMediaMessage(
    conversationId: string,
    senderId: string,
    messageType: 'image' | 'video' | 'audio' | 'document' | 'voice_note',
    mediaUrl: string,
    mediaData: FrontendMessage['mediaData'],
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      conversationId,
      senderId,
      messageType,
      content: caption || mediaUrl,
      mediaData
    });
  }

  /**
   * Envoie un message de localisation
   */
  async sendLocationMessage(
    conversationId: string,
    senderId: string,
    location: {
      latitude: number;
      longitude: number;
      address?: string;
      propertyId?: string;
    }
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      conversationId,
      senderId,
      messageType: 'location',
      content: location.address || `${location.latitude}, ${location.longitude}`,
      location
    });
  }

  /**
   * Met à jour l'activité de la conversation
   */
  private async updateConversationActivity(
    conversationId: string,
    senderId: string
  ): Promise<void> {
    try {
      await fetch(`${this.baseURL.replace('/messages', '/conversations')}/${conversationId}/activity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastActivity: new Date().toISOString(),
          lastMessageSender: senderId
        })
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
    }
  }

  /**
   * Envoie des notifications push
   */
  private async sendPushNotifications(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<void> {
    try {
      await fetch(`${this.baseURL.replace('/messages', '/notifications')}/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          senderId,
          message: content.substring(0, 100)
        })
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
    }
  }

  /**
   * Génère des insights IA
   */
  private async generateAIInsights(
    content: string,
    messageType: string
  ): Promise<FrontendMessage['aiInsights']> {
    const sentiment = this.analyzeSentiment(content);
    
    return {
      sentiment: {
        score: sentiment.score,
        label: sentiment.label
      },
      intentDetection: this.detectIntent(content, messageType),
      autoSuggestions: this.generateSuggestions(content),
      priority: this.calculatePriority(content, messageType)
    };
  }

  private analyzeSentiment(content: string): { score: number; label: string } {
    const positiveWords = ['super', 'génial', 'parfait', 'excellent', 'merci', 'bravo'];
    const negativeWords = ['problème', 'mauvais', 'terrible', 'erreur', 'bug'];
    
    let score = 0.5;
    
    positiveWords.forEach(word => {
      if (content.toLowerCase().includes(word)) score += 0.1;
    });
    
    negativeWords.forEach(word => {
      if (content.toLowerCase().includes(word)) score -= 0.1;
    });
    
    score = Math.max(0, Math.min(1, score));
    
    let label = 'neutral';
    if (score > 0.6) label = 'positive';
    if (score < 0.4) label = 'negative';
    
    return { score, label };
  }

  private detectIntent(content: string, messageType: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('rendez-vous') || lowerContent.includes('rdv')) {
      return 'appointment_request';
    }
    if (lowerContent.includes('prix') || lowerContent.includes('coût')) {
      return 'price_inquiry';
    }
    if (lowerContent.includes('disponible') || lowerContent.includes('libre')) {
      return 'availability_check';
    }
    if (messageType === 'location') {
      return 'location_share';
    }
    
    return 'general_message';
  }

  private generateSuggestions(content: string): string[] {
    const suggestions: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('merci')) {
      suggestions.push('De rien !', 'Avec plaisir', 'Content d\'avoir pu aider');
    }
    
    if (lowerContent.includes('?')) {
      suggestions.push('Oui', 'Non', 'Je vais vérifier');
    }
    
    return suggestions.slice(0, 3);
  }

  private calculatePriority(
    content: string,
    messageType: string
  ): 'low' | 'medium' | 'normal' | 'high' | 'urgent' {
    const urgentKeywords = ['urgent', 'emergency', 'immediat'];
    const highKeywords = ['important', 'asap', 'rapidement'];
    
    const lowerContent = content.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'urgent';
    }
    
    if (highKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'high';
    }
    
    if (messageType === 'location' || messageType === 'document') {
      return 'medium';
    }
    
    return 'normal';
  }

  /**
   * Marque un message comme lu
   */
  async markAsRead(messageId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      return false;
    }
  }

  /**
   * Met à jour le statut de frappe
   */
  async updateTypingStatus(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      await fetch(`${this.baseURL.replace('/messages', '/conversations')}/${conversationId}/typing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isTyping,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de frappe:', error);
    }
  }
}

export const messageService = new MessageService();
export const useMessageService = () => messageService;