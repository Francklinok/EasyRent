import React, { useState, useEffect } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import MessageDisplay from '@/components/messages/chat/MessageBody';
import MessageFooter from '@/components/messages/chat/MessageFooter';
import { FrontendMessage } from '@/types/MessageTypes';
import { RootStackParamList } from '@/components/navigator/RouteType';
import { RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/ui/ThemedView';
import { messageService } from '@/services/messageService/chatService';

export default function ChatComponent() {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { chatId, name, image, status } = route.params;
  
  // Simuler un userId - à remplacer par l'authentification réelle
  const userId = "current_user_id"; 
  
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<FrontendMessage | undefined>(undefined);

  useEffect(() => {
    // Messages de test pour le développement
    const testMessages: FrontendMessage[] = [
      {
        msgId: "msg_1",
        senderId: "other_user",
        conversationId: chatId,
        messageType: "text",
        content: "Salut ! Comment ça va ?",
        reactions: [],
        mentions: [],
        status: {
          sent: new Date().toISOString(),
          delivered: [],
          read: []
        },
        isDeleted: false,
        deletedFor: [],
        canRestore: true,
        isEdited: false,
        editHistory: [],
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        msgId: "msg_2",
        senderId: userId,
        conversationId: chatId,
        messageType: "text",
        content: "Ça va bien merci ! Et toi ?",
        reactions: [],
        mentions: [],
        status: {
          sent: new Date().toISOString(),
          delivered: [],
          read: []
        },
        isDeleted: false,
        deletedFor: [],
        canRestore: true,
        isEdited: false,
        editHistory: [],
        createdAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        msgId: "msg_3",
        senderId: "other_user",
        conversationId: chatId,
        messageType: "text",
        content: "Super ! Tu veux qu'on se voit demain ?",
        reactions: [],
        mentions: [],
        status: {
          sent: new Date().toISOString(),
          delivered: [],
          read: []
        },
        isDeleted: false,
        deletedFor: [],
        canRestore: true,
        isEdited: false,
        editHistory: [],
        createdAt: new Date(Date.now() - 900000).toISOString()
      }
    ];
    
    setMessages(testMessages);
  }, [chatId, userId]);

  const handleSendMessage = async (
    messageType: FrontendMessage['messageType'],
    content: string,
    mediaData?: any,
    mentions?: string[],
    replyToId?: string
  ) => {
    if (!content.trim() && messageType === 'text') return;

    // Créer un message temporaire pour l'affichage immédiat
    const tempMessage: FrontendMessage = {
      msgId: `temp_${Date.now()}`,
      senderId: userId,
      conversationId: chatId,
      messageType,
      content,
      mediaData,
      reactions: [],
      mentions: mentions || [],
      status: {
        sent: new Date().toISOString(),
        delivered: [],
        read: []
      },
      replyTo: replyToId,
      isDeleted: false,
      deletedFor: [],
      canRestore: true,
      isEdited: false,
      editHistory: [],
      createdAt: new Date().toISOString()
    };

    // Ajouter immédiatement le message à la liste
    setMessages(prevMessages => [tempMessage, ...prevMessages]);
    
    // Réinitialiser la réponse
    setReplyTo(undefined);

    // En production, envoyer au serveur
    try {
      let result;

      switch (messageType) {
        case 'text':
          result = await messageService.sendTextMessage(
            chatId,
            userId,
            content,
            mentions,
            replyToId
          );
          break;

        case 'image':
        case 'video':
        case 'audio':
        case 'document':
        case 'voice_note':
          result = await messageService.sendMediaMessage(
            chatId,
            userId,
            messageType,
            content,
            mediaData
          );
          break;

        case 'location':
          const locationData = JSON.parse(content);
          result = await messageService.sendLocationMessage(
            chatId,
            userId,
            locationData
          );
          break;

        default:
          result = await messageService.sendMessage({
            conversationId: chatId,
            senderId: userId,
            messageType,
            content,
            mediaData
          });
      }

      if (result?.success && result.message) {
        // Remplacer le message temporaire par le message confirmé
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.msgId === tempMessage.msgId ? result.message! : msg
          )
        );
      } else if (result?.error) {
        // En cas d'erreur, retirer le message temporaire
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.msgId !== tempMessage.msgId)
        );
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      // En mode développement sans serveur, garder le message temporaire
      console.log('Mode développement : message gardé localement');
    }
  };

  const handleTypingStatusChange = async (isTyping: boolean) => {
    setIsTyping(isTyping);
    
    try {
      await messageService.updateTypingStatus(chatId, userId, isTyping);
    } catch (error) {
      console.log('Mode développement : statut de frappe non envoyé');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const success = await messageService.markAsRead(messageId, userId);
      if (success) {
        // Mettre à jour le statut local du message
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.msgId === messageId
              ? {
                  ...msg,
                  status: {
                    ...msg.status,
                    read: [
                      ...msg.status.read,
                      {
                        userId,
                        timestamp: new Date().toISOString()
                      }
                    ]
                  }
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.log('Mode développement : marquage comme lu non envoyé');
    }
  };

  const handleReply = (message: FrontendMessage) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(undefined);
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Supprimer le message',
      'Êtes-vous sûr de vouloir supprimer ce message ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.msgId === messageId
                  ? { ...msg, isDeleted: true, deletedFor: [userId] }
                  : msg
              )
            );
          }
        }
      ]
    );
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.msgId === messageId
          ? {
              ...msg,
              reactions: [
                ...msg.reactions.filter(r => r.userId !== userId),
                {
                  userId,
                  emoji,
                  timestamp: new Date().toISOString()
                }
              ]
            }
          : msg
      )
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ThemedView className="flex-1">
        <StatusBar hidden={true} />

        <ThemedView className="flex-1">
          <FlatList
            data={messages}
            keyExtractor={(item) => item.msgId}
            renderItem={({ item }) => (
              <MessageDisplay 
                message={item}
                currentUserId={userId}
                onReply={() => handleReply(item)}
                onDelete={() => handleDeleteMessage(item.msgId)}
                onReact={(emoji: string) => handleReactToMessage(item.msgId, emoji)}
                onMarkAsRead={() => handleMarkAsRead(item.msgId)}
              />
            )}
            inverted
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={() => {
              console.log('Mode développement : pas de rechargement serveur');
            }}
          />
        </ThemedView>

        <ThemedView className="p-2">
          <MessageFooter 
            onSend={handleSendMessage}
            onTypingChange={handleTypingStatusChange}
            isLoading={isLoading}
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
          />
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}