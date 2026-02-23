import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { Conversation } from '@/services/api/chatService';
import { offlineFirstChatService } from '@/services/sync/offlineFirstChatService';
import { cacheService, CACHE_KEYS } from '@/services/cache/cacheService';
import { FilterType, SortType } from '@/types/ChatListTypes';
import { chatEvents, CHAT_EVENTS } from '@/services/events/chatEvents';
import { getMessageTypePreview } from '@/components/utils/encryptionHelper';
import { useChatListHeader } from '@/components/contexts/ChatListContext';
import { usePrivacy } from '@/components/contexts/privacy/PrivacyContext';
import { useLanguage } from '@/components/contexts/language';

interface ChatListConversation {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  count: number;
  status?: 'online' | 'offline' | 'away' | 'busy';
  isArchived?: boolean;
  isBot?: boolean;
  isSentByCurrentUser?: boolean;
  statusIcon?: 'sent' | 'delivered' | 'read';
}

export default function ChatListScreen() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { canShowOnlineStatus, isReadReceiptsEnabled } = usePrivacy();
  const {
    setUnreadCount,
    search,
    activeFilter,
    setActiveFilter,
    sortBy,
    setSortBy,
  } = useChatListHeader();

  const [conversations, setConversations] = useState<ChatListConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertToChatListItem = (conv: Conversation, currentUserId: string = 'CURRENT_USER_ID'): ChatListConversation => {
    const otherParticipant = conv.participants.find(p => p.id !== currentUserId) || conv.participants[0];

    const formatTimestamp = (date: string) => {
      const messageDate = new Date(date);
      const now = new Date();
      const diffMs = now.getTime() - messageDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', de: 'de-DE', ar: 'ar-SA' };
      const locale = localeMap[language] || 'fr-FR';

      if (diffMins < 1) return t('time.justNow');
      if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
      if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
      if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
      return messageDate.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
    };

    const messageContent = getMessageTypePreview(
      conv.lastMessage?.messageType,
      conv.lastMessage?.content
    );

    return {
      id: conv.id,
      sender: {
        id: otherParticipant.id,
        name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
        avatar: otherParticipant.avatar || 'https://via.placeholder.com/100'
      },
      content: messageContent,
      timestamp: conv.lastMessage ? formatTimestamp(conv.lastMessage.createdAt) : '',
      count: conv.unreadCount || 0,
      status: canShowOnlineStatus() && otherParticipant.isOnline ? 'online' : 'offline',
      isArchived: conv.isArchivedFor || false,
      isBot: false,
      isSentByCurrentUser: conv.lastMessage?.sender.id === currentUserId,
      statusIcon: conv.lastMessage?.status?.read?.length ? 'read' :
                  conv.lastMessage?.status?.delivered?.length ? 'delivered' : 'sent'
    };
  };

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load from cache instantly (offline-first)
      const cachedItems = await cacheService.get<ChatListConversation[]>(CACHE_KEYS.CONVERSATIONS_LIST);
      if (cachedItems && cachedItems.length > 0) {
        setConversations(cachedItems);
        const totalUnread = cachedItems.reduce((total: number, item: ChatListConversation) => total + item.count, 0);
        setUnreadCount(totalUnread);
      }

      // 2. Fetch from server via offlineFirstChatService (handles offline fallback internally)
      try {
        const onlineConversations = await offlineFirstChatService.getConversations(true);
        const chatListItems = onlineConversations.map((conv: Conversation) => convertToChatListItem(conv));

        setConversations(chatListItems);
        const totalUnread = chatListItems.reduce((total: number, item: ChatListConversation) => total + item.count, 0);
        setUnreadCount(totalUnread);

        await cacheService.set(CACHE_KEYS.CONVERSATIONS_LIST, chatListItems);
      } catch (serverError) {
        console.warn('⚠️ Serveur inaccessible, utilisation du cache');
        if (!cachedItems || cachedItems.length === 0) {
          setError(t('chat.offlineNoCache' as any));
        }
      }
    } catch (err) {
      console.error('❌ Erreur chargement conversations:', err);
      setError(err instanceof Error ? err.message : t('errors.general'));
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  useEffect(() => {
    const handleMessageSent = () => {
      loadConversations();
    };

    const handleConversationRead = async (data: { conversationId: string }) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === data.conversationId ? { ...conv, count: 0 } : conv
        )
      );
      loadConversations();
    };

    chatEvents.on(CHAT_EVENTS.MESSAGE_SENT, handleMessageSent);
    chatEvents.on(CHAT_EVENTS.MESSAGE_RECEIVED, handleMessageSent);
    chatEvents.on('CONVERSATION_READ', handleConversationRead);

    return () => {
      chatEvents.off(CHAT_EVENTS.MESSAGE_SENT, handleMessageSent);
      chatEvents.off(CHAT_EVENTS.MESSAGE_RECEIVED, handleMessageSent);
      chatEvents.off('CONVERSATION_READ', handleConversationRead);
    };
  }, [loadConversations]);

  const getFilteredMessages = (): ChatListConversation[] => {
    let filtered = conversations;

    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(item => item.count > 0);
        break;
      case 'archived':
        filtered = filtered.filter(item => item.isArchived);
        break;
      default:
        filtered = filtered.filter(item => !item.isArchived);
    }

    if (search) {
      filtered = filtered.filter((item) =>
        item.sender.name.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.sender.name.localeCompare(b.sender.name));
        break;
      case 'unread':
        filtered.sort((a, b) => b.count - a.count);
        break;
    }

    return filtered;
  };

  const filteredMessages = getFilteredMessages();
  const totalUnreadChats = conversations.filter(item => item.count > 0).length;

  const toggleSort = () => {
    const sorts: SortType[] = ['recent', 'name', 'unread'];
    const currentIndex = sorts.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sorts.length;
    setSortBy(sorts[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name': return t('chat.sortByName' as any);
      case 'unread': return t('chat.sortByUnread' as any);
      default: return t('chat.sortByRecent' as any);
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: 16, color: theme.onSurface + '80' }}>
          {t('chat.loadingConversations' as any)}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Filter and Sort Section */}
      <ThemedView style={{ paddingHorizontal: 10, paddingTop: 0 }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Filter Buttons */}
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {[
              { id: 'all' as FilterType, label: t('chat.filterAll' as any), icon: 'chatbubbles-outline', count: conversations.filter(m => !m.isArchived).length },
              { id: 'unread' as FilterType, label: t('chat.filterUnread' as any), icon: 'mail-unread-outline', count: totalUnreadChats },
              { id: 'archived' as FilterType, label: t('chat.filterArchived' as any), icon: 'archive-outline', count: conversations.filter(m => m.isArchived).length },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: activeFilter === filter.id ? theme.primary : theme.surfaceVariant,
                }}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={14}
                  color={activeFilter === filter.id ? 'white' : theme.onSurface}
                />
                <ThemedText
                  style={{
                    marginLeft: 4,
                    fontSize: 12,
                    color: activeFilter === filter.id ? 'white' : theme.onSurface
                  }}
                >
                  {filter.label}
                </ThemedText>
                {filter.count > 0 && (
                  <ThemedView
                    style={{
                      marginLeft: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 10,
                      backgroundColor: activeFilter === filter.id ? 'rgba(255,255,255,0.3)' : theme.primary + '80'
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: activeFilter === filter.id ? 'white' : theme.primary
                      }}
                    >
                      {filter.count > 99 ? '99+' : filter.count}
                    </ThemedText>
                  </ThemedView>
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>

          {/* Sort Button */}
          <TouchableOpacity
            onPress={toggleSort}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: theme.surfaceVariant,
            }}
          >
            <Ionicons name="swap-vertical-outline" size={14} color={theme.onSurface} />
            <ThemedText style={{ marginLeft: 4, fontSize: 12, color: theme.onSurface }}>
              {getSortLabel()}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Search Results Info */}
      {search.length > 0 && (
        <ThemedView style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ThemedText style={{ color: theme.onSurface + '80', fontSize: 13 }}>
            {t('chat.searchResults' as any, { count: filteredMessages.length, query: search })}
          </ThemedText>
        </ThemedView>
      )}

      {/* Chat List */}
      <ThemedView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 8 }}>
        {filteredMessages.length === 0 ? (
          <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons
              name={search ? 'search-outline' : activeFilter === 'unread' ? 'mail-outline' : 'chatbubbles-outline'}
              size={64}
              color={theme.onSurface + '40'}
            />
            <ThemedText style={{ fontSize: 18, fontWeight: '500', marginTop: 16, color: theme.onSurface + '60' }}>
              {search ? t('emptyStates.noResults') : activeFilter === 'unread' ? t('chat.noUnreadMessages' as any) : t('chat.noConversations' as any)}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, marginTop: 8, textAlign: 'center', color: theme.onSurface + '40' }}>
              {search ? t('chat.tryOtherKeywords' as any) : t('chat.startNewConversation' as any)}
            </ThemedText>
            {error && (
              <ThemedText style={{ fontSize: 14, marginTop: 16, textAlign: 'center', color: theme.error }}>
                {t('common.error')}: {error}
              </ThemedText>
            )}
          </ThemedView>
        ) : (
          <FlatList
            data={filteredMessages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            }
            renderItem={({ item }: { item: ChatListConversation }) => (
              <TouchableOpacity
                onPress={() =>
                  router.navigate({
                    pathname: '/chat/[chatId]',
                    params: {
                      chatId: item.id,
                      name: item.sender.name,
                      image: item.sender.avatar,
                    },
                  })
                }
                activeOpacity={0.85}
                style={{ marginBottom: 8 }}
              >
                <ThemedView
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.outline,
                  }}
                >
                  {/* Avatar */}
                  <ThemedView
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      overflow: 'hidden',
                      marginRight: 16,
                      borderColor: item.status === 'online' ? theme.success : theme.outline,
                      borderWidth: 2,
                    }}
                  >
                    <Image source={{ uri: item.sender.avatar }} style={{ width: '100%', height: '100%' }} />
                    {item.status === 'online' && (
                      <ThemedView
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: theme.success,
                          borderWidth: 2,
                          borderColor: theme.surface,
                        }}
                      />
                    )}
                  </ThemedView>

                  {/* Content */}
                  <ThemedView style={{ flex: 1, marginRight: 12 }}>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <ThemedText type = "normal"
                        style={{
                          color: theme.onSurface,
                          fontWeight: item.count > 0 ? '700' : '600',
                        }}
                      >
                        {item.sender.name}
                      </ThemedText>

                      {item.isBot && (
                        <ThemedView
                          style={{
                            marginLeft: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                            backgroundColor: theme.primary + '20',
                          }}
                        >
                          <ThemedText style={{ color: theme.primary, fontSize: 10 }}>IA</ThemedText>
                        </ThemedView>
                      )}
                    </ThemedView>

                    <ThemedText type ="normal"
                      numberOfLines={1}
                      style={{
                        color: item.count > 0 ? theme.onSurface : theme.onSurface + '80',
                        fontWeight: item.count > 0 ? '500' : '400'
                      }}
                    >
                      {item.content}
                    </ThemedText>
                  </ThemedView>

                  {/* Right Side Info */}
                  <ThemedView style={{ alignItems: 'flex-end', justifyContent: 'center', minWidth: 60 }}>
                    <ThemedText type ="caption" style={{  marginBottom: 4, color: theme.onSurface + '60' }}>
                      {item.timestamp}
                    </ThemedText>

                    {item.count > 0 && (
                      <ThemedView
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          backgroundColor: theme.success,
                          minWidth: 24,
                          alignItems: 'center',
                        }}
                      >
                        <ThemedText type= "caption" intensity ="strong" style={{ color: theme.surface }}>
                          {item.count > 99 ? '99+' : item.count}
                        </ThemedText>
                      </ThemedView>
                    )}

                    {item.isSentByCurrentUser && !item.count && (
                      <ThemedView style={{ marginTop: 4 }}>
                        {item.statusIcon === 'sent' && <ThemedText style={{ color: theme.star, fontSize: 12 }}>✓</ThemedText>}
                        {item.statusIcon === 'delivered' && <ThemedText style={{ fontSize: 12 }}>✓</ThemedText>}
                        {item.statusIcon === 'read' && isReadReceiptsEnabled() && (
                          <ThemedText style={{ fontSize: 12, color: theme.success }}>✓✓</ThemedText>
                        )}
                        {item.statusIcon === 'read' && !isReadReceiptsEnabled() && (
                          <ThemedText type = "normal" intensity ="strong">✓</ThemedText>
                        )}
                      </ThemedView>
                    )}
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            )}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}
