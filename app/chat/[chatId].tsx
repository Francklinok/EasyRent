import React, { useState, useEffect, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Alert, View, Text, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import MessageDisplay from '@/components/messages/chat/MessageBody';
import MessageFooter from '@/components/messages/chat/MessageFooter';
import TypingIndicator from '@/components/messages/TypingIndicator';
import { FrontendMessage } from '@/types/MessageTypes';
import { RootStackParamList } from '@/components/navigator/RouteType';
import { StatusBar } from 'expo-status-bar';
import { Message, MessageType } from '@/services/api/chatService';
import VisitRequestActions from '@/components/visit/VisitRequestActions';
import offlineFirstChatService from '@/services/sync/offlineFirstChatService';
import NetInfo from '@react-native-community/netinfo';
import { chatEvents, CHAT_EVENTS } from '@/services/events/chatEvents';
import { unifiedAuthService } from '@/services/auth/unifiedAuthService';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useLanguage } from '@/components/contexts/language';

const mapGqlMessageToFrontend = (
  gqlMessage: Message,
  defaultUserName: string = 'Utilisateur',
  currentUserId: string = ''
): FrontendMessage => {
  if (gqlMessage.messageType.toUpperCase().includes('VISIT')) {
    console.log('🏠 Visit message detected:', {
      id: gqlMessage.id,
      type: gqlMessage.messageType,
      hasVisitData: !!gqlMessage.visitData,
      visitData: gqlMessage.visitData
    });
  }

  const senderId = gqlMessage.sender.id;

  return {
    msgId: gqlMessage.id,
    senderId,
    isSent: currentUserId ? String(senderId) === String(currentUserId) : undefined,
    sender: gqlMessage.sender
      ? {
        name: gqlMessage.sender.username || `${gqlMessage.sender.firstName} ${gqlMessage.sender.lastName}`,
        avatar: gqlMessage.sender.avatar || '',
      }
      : undefined,
    conversationId: gqlMessage.conversationId,
    content: gqlMessage.content || '',
    messageType: gqlMessage.messageType.toLowerCase() as FrontendMessage['messageType'],
    createdAt: gqlMessage.createdAt,
    reactions: gqlMessage.reactions || [],
    mentions: gqlMessage.mentions?.map((user) => user.id) || [],
    status: {
      sent: gqlMessage.status?.sent || new Date().toISOString(),
      delivered:
        gqlMessage.status?.delivered?.map((d) => ({
          userId: d.userId,
          timestamp: d.deliveredAt || new Date().toISOString(),
        })) || [],
      read:
        gqlMessage.status?.read?.map((r) => ({
          userId: r.userId,
          timestamp: r.readAt || new Date().toISOString(),
        })) || [],
    },
    replyTo: gqlMessage.replyTo
      ? {
        id: gqlMessage.replyTo.id,
        content: gqlMessage.replyTo.content || '',
        sender: {
          name: gqlMessage.replyTo.sender?.username || defaultUserName,
          avatar: gqlMessage.replyTo.sender?.avatar || '',
        },
      }
      : undefined,

    isDeleted: gqlMessage.isDeleted || false,
    deletedFor: gqlMessage.deletedBy ? [gqlMessage.deletedBy] : [],
    canRestore: true,
    isEdited: gqlMessage.isEdited || false,
    editHistory: gqlMessage.editHistory || [],
    mediaData: gqlMessage.mediaData,
    visitData: gqlMessage.visitData
      ? {
        id: gqlMessage.visitData.id,
        date: (() => {
          const d = new Date(gqlMessage.visitData.date);
          return isNaN(d.getTime()) ? new Date() : d;
        })(),
        time: gqlMessage.visitData.time,
        status: gqlMessage.visitData.status,
      }
      : undefined,
    propertyData: gqlMessage.propertyData || undefined,
    metadata: gqlMessage.metadata || undefined,
  };
};

export default function ChatComponentOffline() {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { chatId } = route.params;
  const { t } = useLanguage();
  const defaultUserName = t('chat.defaultUser' as any);

  const [userId, setUserId] = useState<string>('');
  const userIdRef = useRef<string>(''); // always up-to-date, avoids stale closure in loadMessages
  const [userLoaded, setUserLoaded] = useState(false);
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<FrontendMessage | undefined>(undefined);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hiddenVisitActionsIds, setHiddenVisitActionsIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // GraphQL priority (via unifiedAuthService.getProfile)
        const user = await unifiedAuthService.getProfile();
        if (user?.id) {
          userIdRef.current = user.id;
          setUserId(user.id);
          console.log('✅ User ID retrieved via GraphQL:', user.id);
        }
      } catch (error) {
        console.error('❌ Error retrieving user ID:', error);
      } finally {
        setUserLoaded(true);
      }
    };
    fetchUserId();
  }, []);

  // Listen to network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userLoaded) return; // Wait for user load attempt to complete

    // Force refresh on initial load to ensure we have the latest messages
    loadMessages(true);
    markConversationAsRead();
    const unsubscribe = setupSubscriptions();

    return () => {
      unsubscribe();
    };
  }, [chatId, userLoaded]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (isTyping) {
        handleTypingStatusChange(false);
      }
    };
  }, []);

  const loadMessages = async (forceRefresh: boolean = false) => {
    console.log('🔄 [loadMessages] START - chatId:', chatId, 'isOnline:', isOnline, 'forceRefresh:', forceRefresh);
    try {
      setIsLoading(true);

      const AsyncStorage = require('@react-native-async-storage/async-storage').default;

      // If forceRefresh, ignore local cache
      if (!forceRefresh) {
        // Try to load from AsyncStorage first
        const cachedData = await AsyncStorage.getItem(`messages_${chatId}`);

        if (cachedData) {
          const cachedMessages = JSON.parse(cachedData);
          setMessages(cachedMessages);
          console.log(`✅ [loadMessages] Loaded ${cachedMessages.length} messages from local cache`);
        } else {
          console.log('📭 [loadMessages] No local cache found');
        }
      } else {
        console.log('🔄 [loadMessages] Force refresh - ignoring cache');
        // Clear local cache for this conversation
        await AsyncStorage.removeItem(`messages_${chatId}`);
      }

      // Always load from server if online
      console.log('🌐 [loadMessages] Attempting to load from server...');
      try {
        const response = await offlineFirstChatService.getMessages(chatId, {
          limit: 100,
          offset: 0,
        }, forceRefresh); // Pass forceRefresh to bypass offline cache

        console.log('📥 [loadMessages] Server response:', {
          edgesCount: response.edges?.length || 0,
          hasNextPage: response.pageInfo?.hasNextPage
        });

        const gqlMessages = response.edges.map((edge) => edge.node);
        console.log('🔄 [loadMessages] GQL messages extracted:', gqlMessages.length);

        if (gqlMessages.length > 0) {
          console.log('📊 [loadMessages] Premier message:', {
            id: gqlMessages[0].id,
            content: gqlMessages[0].content?.substring(0, 30),
            createdAt: gqlMessages[0].createdAt
          });
          console.log('📊 [loadMessages] Last message:', {
            id: gqlMessages[gqlMessages.length - 1].id,
            content: gqlMessages[gqlMessages.length - 1].content?.substring(0, 30),
            createdAt: gqlMessages[gqlMessages.length - 1].createdAt
          });
        }

        const frontendMessages = gqlMessages.map(msg => mapGqlMessageToFrontend(msg, defaultUserName, userIdRef.current));
        const reversedMessages = frontendMessages.reverse();

        console.log('✅ [loadMessages] Final messages to display:', reversedMessages.length);
        setMessages(reversedMessages);

        await AsyncStorage.setItem(`messages_${chatId}`, JSON.stringify(reversedMessages));
        console.log(`✅ [loadMessages] Cache updated with ${reversedMessages.length} messages`);
      } catch (serverError: any) {
        console.warn('⚠️ [loadMessages] Server error:', serverError?.message || serverError);
        // Keep cached messages if server fails
      }
    } catch (error: any) {
      console.error('❌ [loadMessages] General error:', error?.message || error);
      // Don't show alert, just log
    } finally {
      setIsLoading(false);
      console.log('🔄 [loadMessages] END');
    }
  };

  const markConversationAsRead = async () => {
    try {
      // Mark conversation as read
      await offlineFirstChatService.markConversationAsRead(chatId);
      console.log('✅ Conversation marked as read');

      // Update local cache
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cachedData = await AsyncStorage.getItem('conversations_list');

      if (cachedData) {
        const conversations = JSON.parse(cachedData);
        const updated = conversations.map((conv: any) =>
          conv.id === chatId ? { ...conv, count: 0 } : conv
        );
        await AsyncStorage.setItem('conversations_list', JSON.stringify(updated));
        console.log('✅ Cache updated - counter at 0');
      }

      // Emit event to notify ChatList
      chatEvents.emit('CONVERSATION_READ', {
        conversationId: chatId
      });
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  const setupSubscriptions = () => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to new messages
    const messageUnsubscribe = offlineFirstChatService.subscribeToMessages(chatId, (newMessage) => {
      console.log('📩 New message received:', newMessage.id);
      const frontendMessage = mapGqlMessageToFrontend(newMessage, defaultUserName, userIdRef.current);

      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((msg) => msg.msgId === frontendMessage.msgId)) {
          return prev;
        }
        return [...prev, frontendMessage];
      });
    });
    unsubscribers.push(messageUnsubscribe);

    // Subscribe to typing indicators
    const typingUnsubscribe = offlineFirstChatService.subscribeToTyping(chatId, (users) => {
      console.log('👀 Users typing:', users);
      // Filter current user from list
      const otherUsers = users.filter(user => user !== userId);
      setTypingUsers(otherUsers);
    });
    unsubscribers.push(typingUnsubscribe);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  };

  const handleSendMessage = async (
    messageType: FrontendMessage['messageType'],
    content: string,
    mediaData?: any,
    mentions?: string[],
    replyToId?: string
  ) => {
    if (!content.trim() && messageType === 'text') return;

    // Vérifier si c'est une commande de réponse à une visite
    const normalizedContent = content.trim().toUpperCase();
    const isVisitCommand = ['ACCEPTER', 'REFUSER', 'ACCEPT', 'REFUSE'].includes(normalizedContent);

    if (isVisitCommand) {
      // Search for the last visit request message in the conversation
      console.log('🔍 Search for visit request...');
      console.log('📊 Nombre total de messages:', messages.length);
      console.log('📋 Types de messages:', messages.map(m => ({ id: m.msgId, type: m.messageType, hasVisitData: !!m.visitData })));

      const lastVisitRequest = messages
        .slice()
        .reverse()
        .find(msg => msg.messageType === 'visit_request' && msg.visitData);

      console.log('✅ Visit request found:', lastVisitRequest ? 'YES' : 'NO');
      if (lastVisitRequest) {
        console.log('📍 Détails visite:', lastVisitRequest.visitData);
      }

      if (lastVisitRequest && lastVisitRequest.visitData) {
        const isAccept = ['ACCEPTER', 'ACCEPT'].includes(normalizedContent);

        Alert.alert(
          isAccept ? t('chat.acceptVisitTitle' as any) : t('chat.refuseVisitTitle' as any),
          t('chat.confirmVisitResponse' as any, { date: new Date(lastVisitRequest.visitData.date).toLocaleDateString(), time: lastVisitRequest.visitData.time }),
          [
            {
              text: t('common.cancel'),
              style: 'cancel'
            },
            {
              text: t('common.confirm'),
              onPress: async () => {
                try {
                  // Import booking service
                  const { getBookingService } = require('@/services/api/bookingService');
                  const bookingService = getBookingService();

                  // Call response function
                  await bookingService.respondToVisitRequest(
                    lastVisitRequest.visitData!.id,
                    userId,
                    isAccept,
                    isAccept ? undefined : 'Créneau non disponible'
                  );

                  // Envoyer un message de confirmation dans le chat
                  const confirmationMessage = isAccept
                    ? '✅ **Visite acceptée !**\n\nJ\'ai accepté votre demande de visite. À bientôt !'
                    : '❌ **Visite refusée**\n\nDésolé, ce créneau ne me convient pas. Pouvons-nous en discuter ?';

                  // Continuer avec l'envoi normal du message
                  await sendNormalMessage(messageType, confirmationMessage, mediaData, mentions, replyToId);

                  Alert.alert(
                    t('common.success'),
                    isAccept
                      ? t('chat.visitAccepted' as any)
                      : t('chat.visitRefused' as any)
                  );
                } catch (error) {
                  console.error('Error responding to visit:', error);
                  Alert.alert(t('common.error'), t('chat.visitResponseError' as any));
                }
              }
            }
          ]
        );
        return; // Ne pas envoyer le message "ACCEPTER"/"REFUSER" brut
      } else {
        Alert.alert(
          t('chat.noVisitRequest' as any),
          t('chat.noVisitRequestDescription' as any)
        );
        return;
      }
    }

    // Envoi normal du message
    await sendNormalMessage(messageType, content, mediaData, mentions, replyToId);
  };

  const sendNormalMessage = async (
    messageType: FrontendMessage['messageType'],
    content: string,
    mediaData?: any,
    mentions?: string[],
    replyToId?: string
  ) => {
    // Temporary message for optimistic UI
    const tempId = `temp_${Date.now()}`;
    const tempMessage: FrontendMessage = {
      msgId: tempId,
      senderId: userId,
      isSent: true, // always sent by current user
      conversationId: chatId,
      messageType,
      content,
      mediaData,
      reactions: [],
      mentions: mentions || [],
      status: {
        sent: new Date().toISOString(),
        delivered: [],
        read: [],
      },
      replyTo: replyToId,
      isDeleted: false,
      deletedFor: [],
      canRestore: true,
      isEdited: false,
      editHistory: [],
      createdAt: new Date().toISOString(),
    };

    // Display immediately (optimistic UI)
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setReplyTo(undefined);

    try {
      // Send with offline-first service
      const gqlMessageType = messageType.toUpperCase() as MessageType;
      const sentMessage = await offlineFirstChatService.sendMessage(
        chatId,
        content,
        gqlMessageType
      );

      // Replace temporary message with real message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.msgId === tempId ? mapGqlMessageToFrontend(sentMessage, defaultUserName, userIdRef.current) : msg
        )
      );

      // Emit event to notify ChatList
      chatEvents.emit(CHAT_EVENTS.MESSAGE_SENT, {
        conversationId: chatId,
        message: sentMessage
      });

      console.log('✅ Message sent:', sentMessage.id);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert(
        t('common.error'),
        isOnline
          ? t('chat.sendError' as any)
          : t('chat.savedOffline' as any)
      );
    }
  };

  const handleTypingStatusChange = async (isTyping: boolean) => {
    setIsTyping(isTyping);

    try {
      // Send typing indicator via subscriptions
      const { getChatSubscriptions } = require('@/services/realtime/chatSubscriptions');
      const chatSubscriptions = getChatSubscriptions();

      await chatSubscriptions.ensureConnection();
      chatSubscriptions.sendTypingIndicator(chatId, isTyping);

      console.log(`📝 Typing indicator sent: ${isTyping ? 'typing' : 'stopped typing'}`);
    } catch (error) {
      console.error('❌ Error sending typing indicator:', error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    // TODO: Implement with offline service
    console.log('Mark as read:', messageId);
  };

  const handleReply = (message: FrontendMessage) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(undefined);
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      t('chat.deleteMessage' as any),
      t('chat.deleteMessageConfirm' as any),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('chat.deleteForMe' as any),
          onPress: async () => {
            try {
              await offlineFirstChatService.deleteMessage(messageId, chatId, 'soft', 'me');
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.msgId === messageId
                    ? { ...msg, isDeleted: true, deletedFor: [userId] }
                    : msg
                )
              );
              console.log('✅ Message deleted for me');
            } catch (error) {
              console.error('❌ Error deleting message:', error);
              Alert.alert(t('common.error'), t('chat.deleteError' as any));
            }
          },
        },
        {
          text: t('chat.deleteForEveryone' as any),
          style: 'destructive',
          onPress: async () => {
            try {
              await offlineFirstChatService.deleteMessage(messageId, chatId, 'soft', 'everyone');
              setMessages((prevMessages) =>
                prevMessages.filter((msg) => msg.msgId !== messageId)
              );
              console.log('✅ Message deleted for everyone');
            } catch (error) {
              console.error('❌ Error deleting message:', error);
              Alert.alert(t('common.error'), t('chat.deleteError' as any));
            }
          },
        },
      ]
    );
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      // Update locally first (optimistic UI)
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.msgId === messageId
            ? {
              ...msg,
              reactions: [
                ...msg.reactions.filter((r) => r.userId !== userId),
                {
                  userId,
                  emoji,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
            : msg
        )
      );

      // Send to backend
      await offlineFirstChatService.reactToMessage(messageId, emoji, chatId);
      console.log('✅ Reaction added:', emoji);
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
      // Cancel local reaction on error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.msgId === messageId
            ? {
              ...msg,
              reactions: msg.reactions.filter((r) => r.userId !== userId),
            }
            : msg
        )
      );
      Alert.alert(t('common.error'), t('chat.reactionError' as any));
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert(t('chat.offline'), t('chat.mustBeConnectedToSync' as any));
      return;
    }

    setIsSyncing(true);
    try {
      await offlineFirstChatService.syncAll();
      await loadMessages();
      Alert.alert(t('common.success'), t('chat.syncComplete' as any));
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert(t('common.error'), t('chat.syncFailed' as any));
    } finally {
      setIsSyncing(false);
    }
  };

  const hideVisitActions = (messageId: string) => {
    setHiddenVisitActionsIds(prev => new Set([...prev, messageId]));
  };

  // Display a small status bar only if offline or pending sync
  const renderConnectionStatus = () => {
    const syncStatus = offlineFirstChatService.getSyncStatus();

    // Show nothing if online and no pending messages
    if (isOnline && syncStatus.pendingItems === 0) {
      return null;
    }

    return (
      <ThemedView
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 12,
          paddingVertical: 4,
          backgroundColor: isOnline ? '#F3F4F6' : '#FEF3C7',
        }}
      >
        {!isOnline && (
          <>
            <Feather name="wifi-off" size={12} color="#92400E" />
            <ThemedText style={{ color: '#92400E', fontSize: 11, marginLeft: 4, fontWeight: '500' }}>
              {t('chat.offline')}
            </ThemedText>
          </>
        )}

        {syncStatus.pendingItems > 0 && (
          <>
            {!isOnline && <ThemedText style={{ color: '#92400E', fontSize: 11, marginHorizontal: 4 }}>•</ThemedText>}
            <ThemedText style={{ color: isOnline ? '#6B7280' : '#92400E', fontSize: 11 }}>
              {syncStatus.pendingItems} {t('chat.pending' as any)}
            </ThemedText>
            {isOnline && (
              <TouchableOpacity
                onPress={handleSync}
                style={{ marginLeft: 6, padding: 2 }}
                disabled={isSyncing}
              >
                <Feather name="refresh-cw" size={12} color="#6B7280" />
              </TouchableOpacity>
            )}
          </>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {renderConnectionStatus()}

      {/* Main content */}
      <KeyboardAvoidingView
        style={{ flex: 1,  }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 55}
      >
        {(isLoading || !userLoaded) ? (
          <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText style={{ color: '#6B7280', fontSize: 14 }}>{t('common.loading')}</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.msgId}
            renderItem={({ item }) =>
              item.messageType === 'visit_request' ? (
                <ThemedView>
                  <MessageDisplay
                    message={item}
                    currentUserId={userId}
                    isSent={item.isSent ?? (userId ? String(item.senderId) === String(userId) : false)}
                    onReply={() => handleReply(item)}
                    onDelete={(msgId) => handleDeleteMessage(msgId ?? item.msgId)}
                    onReact={(msgId, emoji) => handleReactToMessage(msgId, emoji)}
                    onMarkAsRead={(msgId) => handleMarkAsRead(msgId ?? item.msgId)}
                  />

                  {item.visitData && item.visitData.status === 'pending' && item.propertyData?.ownerId === userId && !hiddenVisitActionsIds.has(item.msgId) && (
                    <VisitRequestActions
                      visitId={item.visitData.id}
                      propertyId={item.propertyData?.id || ''}
                      clientId={item.senderId}
                      currentUserId={userId}
                      visitDate={item.visitData.date instanceof Date ? item.visitData.date.toISOString() : String(item.visitData.date)}
                      visitTime={item.visitData.time}
                      propertyTitle={item.propertyData?.title || 'Property'}
                      status={item.visitData.status as any}
                      onAccept={() => {
                        hideVisitActions(item.msgId);
                        setMessages(prev => prev.map(msg =>
                          msg.msgId === item.msgId && msg.visitData
                            ? { ...msg, visitData: { ...msg.visitData, status: 'confirmed' } }
                            : msg
                        ));
                        setTimeout(() => loadMessages(), 1000);
                      }}
                      onReject={() => {
                        hideVisitActions(item.msgId);
                        setMessages(prev => prev.map(msg =>
                          msg.msgId === item.msgId && msg.visitData
                            ? { ...msg, visitData: { ...msg.visitData, status: 'cancelled' } }
                            : msg
                        ));
                        setTimeout(() => loadMessages(), 1000);
                      }}
                    />
                  )}
                </ThemedView>
              ) : item.messageType === 'reservation_request' ? (
                <ThemedView>
                  <MessageDisplay
                    message={item}
                    currentUserId={userId}
                    isSent={item.isSent ?? (userId ? String(item.senderId) === String(userId) : false)}
                    onReply={() => handleReply(item)}
                    onDelete={(msgId) => handleDeleteMessage(msgId ?? item.msgId)}
                    onReact={(msgId, emoji) => handleReactToMessage(msgId, emoji)}
                    onMarkAsRead={(msgId) => handleMarkAsRead(msgId ?? item.msgId)}
                  />
                  {item.metadata?.activityId && item.propertyData?.ownerId === userId && !hiddenVisitActionsIds.has(item.msgId) && item.metadata?.accepted == null && (
                    <VisitRequestActions
                      visitId={item.metadata.activityId}
                      propertyId={item.metadata?.propertyId || item.propertyData?.id || ''}
                      clientId={item.senderId}
                      currentUserId={userId}
                      propertyTitle={item.propertyData?.title || 'Property'}
                      isReservation={true}
                      status={item.metadata?.accepted === true ? 'accepted' : item.metadata?.accepted === false ? 'rejected' : 'pending'}
                      onAccept={() => {
                        hideVisitActions(item.msgId);
                        loadMessages();
                      }}
                      onReject={() => {
                        hideVisitActions(item.msgId);
                        loadMessages();
                      }}
                    />
                  )}
                </ThemedView>
              ) : (
                <MessageDisplay
                  message={item}
                  currentUserId={userId}
                  isSent={item.isSent ?? (userId ? String(item.senderId) === String(userId) : false)}
                  onReply={() => handleReply(item)}
                  onDelete={(msgId) => handleDeleteMessage(msgId ?? item.msgId)}
                  onReact={(msgId, emoji) => handleReactToMessage(msgId, emoji)}
                  onMarkAsRead={(msgId) => handleMarkAsRead(msgId ?? item.msgId)}
                />
              )
            }
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            contentContainerStyle={{
              paddingVertical: 8,
              paddingBottom: 8,
              flexGrow: 1,
            }}
            style={{ flex: 1}}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
          />
        )}

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} visible={typingUsers.length > 0} />

        {/* Message input footer */}
        <MessageFooter
          onSendMessage={handleSendMessage}
          onTypingStatusChange={handleTypingStatusChange}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          isLoading={isLoading}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
