import React, { useState, useEffect } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Alert, Keyboard, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import MessageDisplay from '@/components/messages/chat/MessageBody';
import MessageFooter from '@/components/messages/chat/MessageFooter';
import { FrontendMessage } from '@/types/MessageTypes';
import { RootStackParamList } from '@/components/navigator/RouteType';
import { RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/ui/ThemedView';
import { messageService } from '@/services/messageService/chatService';
import messageData from '@/assets/data/messagedata';
import chatListData from '@/assets/data/chatListData';
import VisitRequestMessage from '@/components/messages/visit/VisitRequestMessage';

export default function ChatComponent() {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { chatId, name, image, status } = route.params;
  
  const userId = "current_user_id"; 
  
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<FrontendMessage | undefined>(undefined);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const chatMessages = messageData.filter(msg => {
      const chatInfo = chatListData.find(chat => chat.id === chatId);
      if (!chatInfo) return false;
      
      return msg.sender?.name === chatInfo.sender.name || 
             msg.senderId === userId ||
             msg.conversationId === chatId;
    });
    
    if (chatMessages.length === 0) {
      const chatInfo = chatListData.find(chat => chat.id === chatId);
      if (chatInfo) {
        const sampleMessages: FrontendMessage[] = [
          {
            msgId: `${chatId}_1`,
            senderId: chatInfo.sender.name === 'EasyBot' ? 'bot-001' : 'other_user',
            sender: chatInfo.sender,
            conversationId: chatId,
            messageType: 'text',
            content: chatInfo.content,
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
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            isBot: chatInfo.isBot
          }
        ];
        setMessages(sampleMessages);
      }
    } else {
      const sortedMessages = chatMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    }
  }, [chatId, userId]);

  const handleSendMessage = async (
    messageType: FrontendMessage['messageType'],
    content: string,
    mediaData?: any,
    mentions?: string[],
    replyToId?: string
  ) => {
    if (!content.trim() && messageType === 'text') return;

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

    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setReplyTo(undefined);

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
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.msgId === tempMessage.msgId ? result.message! : msg
          )
        );
      } else if (result?.error) {
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.msgId !== tempMessage.msgId)
        );
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
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
    <ThemedView className="flex-1 pb-14">
      <StatusBar hidden={true} />
      <ThemedView style={{ flex: 1, paddingBottom: keyboardHeight }}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.msgId}
          renderItem={({ item }) => (
            item.messageType === 'visit_request' ? (
              <VisitRequestMessage
                visitData={item.visitData}
                propertyData={item.propertyData}
                isOwner={item.senderId !== userId}
                onAccept={() => {
                  console.log('Visit accepted');
                  if ((global as any).updateProfileVisitStatus) {
                    (global as any).updateProfileVisitStatus('Visit Accepted');
                  }
                }}
                onReject={() => {
                  console.log('Visit rejected');
                }}
              />
            ) : (
              <MessageDisplay 
                message={item}
                currentUserId={userId}
                onReply={() => handleReply(item)}
                onDelete={() => handleDeleteMessage(item.msgId)}
                onReact={(emoji: string) => handleReactToMessage(item.msgId, emoji)}
                onMarkAsRead={() => handleMarkAsRead(item.msgId)}
              />
            )
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 16 }}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        />
        
        <MessageFooter
          onSendMessage={handleSendMessage}
          onTypingStatusChange={handleTypingStatusChange}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          isLoading={isLoading}
        />
      </ThemedView>
    </ThemedView>
  );
}