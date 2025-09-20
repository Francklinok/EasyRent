import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { ChatService, Message, Conversation, SendMessageInput, MessageType } from '../services/api/chatService';
import { getChatSubscriptions } from '../services/realtime/chatSubscriptions';
import { connectWebSocket, disconnectWebSocket } from '../services/realtime/websocketService';

interface UseChatOptions {
  conversationId: string;
  enableRealtime?: boolean;
  autoConnect?: boolean;
}

interface UseChatReturn {
  // État
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  typingUsers: string[];

  // Actions
  sendMessage: (content: string, type?: MessageType, attachments?: any[]) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  retry: () => void;

  // États
  hasMoreMessages: boolean;
  loadingMore: boolean;
  sending: boolean;
}

export const useChat = ({
  conversationId,
  enableRealtime = true,
  autoConnect = true,
}: UseChatOptions): UseChatReturn => {
  // État local
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Refs
  const chatService = useRef(new ChatService()).current;
  const chatSubscriptions = useRef(getChatSubscriptions()).current;
  const unsubscribeRefs = useRef<(() => void)[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour charger la conversation
  const loadConversation = useCallback(async () => {
    try {
      const conv = await chatService.getConversation(conversationId);
      if (conv) {
        setConversation(conv);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Impossible de charger la conversation');
    }
  }, [conversationId, chatService]);

  // Fonction pour charger les messages
  const loadMessages = useCallback(async (offset = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await chatService.getMessages(conversationId, {
        limit: 50,
        offset,
      });

      const newMessages = response.edges.map(edge => edge.node);

      if (offset === 0) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...prev, ...newMessages]);
      }

      setHasMoreMessages(response.pageInfo.hasNextPage);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId, chatService]);

  // Fonction pour envoyer un message
  const sendMessage = useCallback(async (
    content: string,
    type: MessageType = 'TEXT',
    attachments?: any[]
  ) => {
    if (!content.trim() && !attachments?.length) return;

    try {
      setSending(true);
      setError(null);

      const input: SendMessageInput = {
        conversationId,
        content: content.trim(),
        type,
        attachments,
      };

      await chatService.sendMessage(input);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Impossible d\'envoyer le message');
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  }, [conversationId, chatService]);

  // Fonction pour charger plus de messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || loadingMore) return;
    await loadMessages(messages.length);
  }, [hasMoreMessages, loadingMore, loadMessages, messages.length]);

  // Fonction pour réagir à un message
  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    try {
      await chatService.reactToMessage({ messageId, emoji });
      setError(null);
    } catch (err) {
      console.error('Error reacting to message:', err);
      setError('Impossible d\'ajouter la réaction');
    }
  }, [chatService]);

  // Fonction pour marquer comme lu
  const markAsRead = useCallback(async () => {
    try {
      await chatService.markConversationAsRead(conversationId);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [conversationId, chatService]);

  // Fonctions pour la saisie
  const startTyping = useCallback(() => {
    chatSubscriptions.sendTypingIndicator(conversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [conversationId, chatSubscriptions]);

  const stopTyping = useCallback(() => {
    chatSubscriptions.sendTypingIndicator(conversationId, false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId, chatSubscriptions]);

  // Fonction de retry
  const retry = useCallback(() => {
    setError(null);
    loadConversation();
    loadMessages(0);
  }, [loadConversation, loadMessages]);

  // Configuration des subscriptions temps réel
  useEffect(() => {
    if (!enableRealtime) return;

    const setupSubscriptions = async () => {
      try {
        await chatSubscriptions.ensureConnection();
        setConnected(true);

        const unsubscribe = chatSubscriptions.subscribeToConversation(conversationId, {
          onMessage: (newMessage) => {
            setMessages(prev => [newMessage, ...prev]);
          },
          onConversationUpdate: (updatedConversation) => {
            setConversation(updatedConversation);
          },
          onTyping: (users) => {
            setTypingUsers(users);
          },
        });

        unsubscribeRefs.current.push(unsubscribe);
      } catch (err) {
        console.error('Error setting up subscriptions:', err);
        setConnected(false);
      }
    };

    setupSubscriptions();

    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
      unsubscribeRefs.current = [];
    };
  }, [conversationId, enableRealtime, chatSubscriptions]);

  // Gestion de l'état de l'app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        chatSubscriptions.sendPresenceUpdate(true);
        if (enableRealtime && autoConnect) {
          connectWebSocket().then(() => setConnected(true));
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        chatSubscriptions.sendPresenceUpdate(false);
        stopTyping();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [enableRealtime, autoConnect, chatSubscriptions, stopTyping]);

  // Chargement initial
  useEffect(() => {
    const initialize = async () => {
      try {
        if (enableRealtime && autoConnect) {
          await connectWebSocket();
          setConnected(true);
        }

        await Promise.all([
          loadConversation(),
          loadMessages(0),
        ]);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Erreur lors de l\'initialisation');
      }
    };

    initialize();
  }, [conversationId, loadConversation, loadMessages, enableRealtime, autoConnect]);

  // Nettoyage
  useEffect(() => {
    return () => {
      stopTyping();
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [stopTyping]);

  return {
    // État
    conversation,
    messages,
    loading,
    error,
    connected,
    typingUsers,

    // Actions
    sendMessage,
    loadMoreMessages,
    reactToMessage,
    markAsRead,
    startTyping,
    stopTyping,
    retry,

    // États
    hasMoreMessages,
    loadingMore,
    sending,
  };
};