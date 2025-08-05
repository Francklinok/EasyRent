import React, { useState } from 'react';
import { FlatList, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import Header from '@/components/ui/header';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/components/contexts/theme/themehook';
import chatListData from '@/assets/data/chatListData';
import { ChatListItem, FilterType, SortType, MenuAction } from '@/types/ChatListTypes';

const { width } = Dimensions.get('window');

export default function ChatList() {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [showMenu, setShowMenu] = useState(false);

  // Filter messages based on active filter
  const getFilteredMessages = (): ChatListItem[] => {
    let filtered = chatListData;

    // Apply filter
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

    // Apply search
    if (search) {
      filtered = filtered.filter((item) =>
        item.sender.name.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.sender.name.localeCompare(b.sender.name));
        break;
      case 'unread':
        filtered.sort((a, b) => b.count - a.count);
        break;
      default: // recent
        filtered.sort((a, b) => {
          if (a.timestamp.includes(':') && b.timestamp.includes(':')) {
            return b.timestamp.localeCompare(a.timestamp);
          }
          return a.timestamp.localeCompare(b.timestamp);
        });
    }

    return filtered;
  };

  const filteredMessages = getFilteredMessages();

  // Count unread messages
  const unreadCount = chatListData.reduce((total, item) => total + item.count, 0);
  const totalUnreadChats = chatListData.filter(item => item.count > 0).length;

  // Handle new chat
  const handleNewChat = () => {
    router.navigate('/new-chat');
  };

  // Handle menu actions
  const handleMenuAction = (action: MenuAction) => {
    setShowMenu(false);
    switch (action) {
      case 'settings':
        router.navigate('/chat/settings');
        break;
      case 'archive':
        router.navigate('/chat/archived');
        break;
      case 'starred':
        router.navigate('/chat/starred');
        break;
      case 'broadcast':
        router.navigate('/chat/broadcast');
        break;
      default:
        break;
    }
  };

  // Toggle sort
  const toggleSort = () => {
    const sorts: SortType[] = ['recent', 'name', 'unread'];
    const currentIndex = sorts.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sorts.length;
    setSortBy(sorts[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name': return 'Nom';
      case 'unread': return 'Non lus';
      default: return 'Récent';
    }
  };

  const rightHeaderElement = (
    <ThemedView  className="flex-row items-center gap-2" style = {{backgroundColor:theme.surfaceVariant + "20"}}>
      {/* Search Toggle Button */}
      <TouchableOpacity 
        onPress={() => {
          setShowSearch(!showSearch);
          if (showSearch) setSearch('');
        }}
        className="p-2 rounded-full"
        style={{ backgroundColor: showSearch ? theme.primary + '20' : 'transparent' }}
      >
        <Ionicons 
          name={showSearch ? "close" : "search-outline"} 
          size={22} 
          color={showSearch ? theme.primary : theme.onSurface} 
        />
      </TouchableOpacity>

      {/* New Chat Button */}
      <TouchableOpacity 
        onPress={handleNewChat}
        className="p-2 rounded-full"
        style={{ backgroundColor: theme.primary + '15' }}
      >
        <Ionicons name="add" size={22} color={theme.primary} />
      </TouchableOpacity>

      {/* Menu Button */}
      <TouchableOpacity 
        onPress={() => setShowMenu(!showMenu)}
        className="p-2 rounded-full relative"
        style={{ backgroundColor: showMenu ? theme.primary + '15' : 'transparent' }}
      >
        <Ionicons 
          name="ellipsis-vertical" 
          size={22} 
          color={showMenu ? theme.primary : theme.onSurface} 
        />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: -10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: -10 }}
            transition={{ type: 'timing', duration: 200 }}
            className="absolute top-12 right-0 z-50"
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 12,
              shadowColor: theme.onSurface,
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 8,
              elevation: 8,
              minWidth: 160,
            }}
          >
            {[
              { id: 'starred' as MenuAction, icon: 'star-outline', label: 'Favoris' },
              { id: 'archive' as MenuAction, icon: 'archive-outline', label: 'Archivés' },
              { id: 'broadcast' as MenuAction, icon: 'megaphone-outline', label: 'Diffusion' },
              { id: 'settings' as MenuAction, icon: 'settings-outline', label: 'Paramètres' },
            ].map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleMenuAction(item.id)}
                className="flex-row items-center px-4 py-3"
                style={{ 
                  borderBottomWidth: index < 3 ? 0.5 : 0,
                  borderBottomColor: theme.outline + '30'
                }}
              >
                <Ionicons name={item.icon} size={18} color={theme.onSurface} />
                <ThemedText className="ml-3 text-sm">{item.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </MotiView>
        )}
      </AnimatePresence>
    </ThemedView>
  );

  const leftHeaderElement = (
    <ThemedView className="flex-row items-center">
      <ThemedView className="flex-row items-center">
        <ThemedText type = "subtitle" style={{ color: theme.onSurface }}>
          Messages
        </ThemedText>
        {unreadCount > 0 && (
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 300 }}
            className="ml-2"
          >
            <ThemedView
              className="px-2 py-0.5 rounded-full min-w-[20px] items-center justify-center"
              style={{ backgroundColor: theme.error +'40' }}
            >
              <ThemedText className="text-white text-xs font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </ThemedText>
            </ThemedView>
          </MotiView>
        )}
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView className="flex-1 pt-1">
      <Header 
        leftElement={leftHeaderElement}
        rightElement={rightHeaderElement} 
      />

      {/* Enhanced Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <MotiView
            from={{ opacity: 0, translateY: -30, height: 0 }}
            animate={{ opacity: 1, translateY: 0, height: 'auto' }}
            exit={{ opacity: 0, translateY: -30, height: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            className="px-4 pb-3"
          >
            <ThemedView
              className="px-4 py-1.5 mt-1 rounded-2xl flex-row items-center"
              style={{ 
                backgroundColor: theme.surfaceVariant,
                borderColor: theme.primary + '30',
                borderWidth: 1.5,
                shadowColor: theme.onSurface,
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="search-outline" size={20} color={theme.primary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher conversations, messages..."
                placeholderTextColor={theme.onSurface + '60'}
                className="ml-3 flex-1 text-base"
                style={{ color: theme.onSurface }}
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} className="p-1">
                  <Ionicons name="close-circle" size={20} color={theme.onSurface + '60'} />
                </TouchableOpacity>
              )}
            </ThemedView>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Improved Filter and Sort Section */}
      <ThemedView 
        className="px-4 py-2"
      >
        <ThemedView className="flex-row items-center justify-between">
          {/* Filter Buttons */}
          <ThemedView className="flex-row items-center">
            {[
              { id: 'all' as FilterType, label: 'Tout', icon: 'chatbubbles-outline', count: chatListData.filter(m => !m.isArchived).length },
              { id: 'unread' as FilterType, label: 'Non lus', icon: 'mail-unread-outline', count: totalUnreadChats },
              { id: 'archived' as FilterType, label: 'Archivés', icon: 'archive-outline', count: chatListData.filter(m => m.isArchived).length },
            ].map((filter, index) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                className="mr-2 px-2 py-2 rounded-full flex-row items-center"
                style={{ 
                  backgroundColor: activeFilter === filter.id ? theme.primary +'90' : theme.surfaceVariant,
                  minHeight: 36,
                }}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={16} 
                  color={activeFilter === filter.id ? 'white' : theme.onSurface} 
                />
                <ThemedText 
                  className="ml-2 text-sm font-medium"
                  style={{ 
                    color: activeFilter === filter.id ? 'white' : theme.onSurface 
                  }}
                >
                  {filter.label}
                </ThemedText>
                {filter.count > 0 && (
                  <ThemedView
                    className="ml-2 px-2 py-0.5 rounded-full min-w-[18px] items-center justify-center"
                    style={{ 
                      backgroundColor: activeFilter === filter.id ? 'rgba(255,255,255,0.3)' : theme.primary + '20'
                    }}
                  >
                    <ThemedText 
                      className="text-xs font-bold"
                      style={{ 
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
            className="flex-row items-center px-3 py-2 rounded-full"
            style={{ 
              backgroundColor: theme.surfaceVariant,
              minHeight: 36,
            }}
          >
            <Ionicons name="swap-vertical-outline" size={16} color={theme.onSurface} />
            <ThemedText className="ml-2 text-sm font-medium" style={{ color: theme.onSurface }}>
              {getSortLabel()}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Search Results Info */}
      {search.length > 0 && (
        <ThemedView className="px-4 pb-1 ">
          <ThemedText  style={{ color: theme.onSurface + '80' }}>
            {filteredMessages.length} résultat{filteredMessages.length !== 1 ? 's' : ''} pour "{search}"
          </ThemedText>
        </ThemedView>
      )}

      {/* Chat List */}
      <ThemedView className="flex-1 px-3">
        {filteredMessages.length === 0 ? (
          <ThemedView variant ="surfaceVariant" className="flex-1 items-center justify-center">
            <Ionicons 
              name={search ? "search-outline" : activeFilter === 'unread' ? "mail-outline" : "chatbubbles-outline"} 
              size={64} 
              color={theme.onSurface + '40'} 
            />
            <ThemedText className="text-lg font-medium mt-4" style={{ color: theme.onSurface + '60' }}>
              {search ? 'Aucun résultat' : activeFilter === 'unread' ? 'Aucun message non lu' : 'Aucune conversation'}
            </ThemedText>
            <ThemedText className="text-sm mt-2 text-center" style={{ color: theme.onSurface + '40' }}>
              {search ? 'Essayez avec d\'autres mots-clés' : 'Commencez une nouvelle conversation'}
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={filteredMessages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }: { item: ChatListItem }) => (
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
                className="mb-2"
              >
                <AnimatePresence>
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: 10 }}
                    transition={{ type: 'timing', duration: 300 }}
                  >
                    <ThemedView 
                      className="flex-row items-center px-4 py-2 "
                      style={{
                        // backgroundColor: item.count > 0 ? theme.primary + '08' : theme.surfaceVariant,
                        shadowColor: theme.onSurface,
                        shadowOpacity: 0.08,
                        shadowOffset: { width: 0, height: 1 },
                        borderBottomWidth:1,
                        borderBottomColor:theme.outline
                        // shadowRadius: 8,
                        // elevation: 1,
                        // borderLeftWidth: item.count > 0 ? 3 : 0,
                        // borderLeftColor: theme.surface,
                      }}
                    >
                      {/* Avatar */}
                      <ThemedView 
                        className="w-14 h-14 rounded-full overflow-hidden mr-4 relative"
                        style={{
                          borderColor: item.status === 'online' ? theme.success : theme.outline,
                          borderWidth: 2,
                        }}
                      >
                        <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
                        {item.status === 'online' && (
                          <ThemedView
                            className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
                            style={{ 
                              backgroundColor: theme.success,
                              borderColor: theme.surface,
                            }}
                          />
                        )}
                      </ThemedView>

                      {/* Content */}
                      <ThemedView className="flex-1 mr-3">
                        <ThemedView className="flex-row items-center mb-1">
                          <ThemedText 
                            // className="text-base font-semibold flex-1" 
                            style={{ 
                              color: theme.onSurface,
                              fontWeight: item.count > 0 ? '700' : '600',
                              // fontSize:12
                            }}
                          >
                            {item.sender.name}
                          </ThemedText>

                          
                          {item.isBot && (
                            <ThemedView 
                              className="ml-2 px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: theme.primary + '20' }}
                            >
                              <ThemedText  style={{ color: theme.primary }}>
                                IA
                              </ThemedText>
                            </ThemedView>
                          )}
                        </ThemedView>
                        
                        <ThemedText 
                          numberOfLines={1} 
                          className="text-sm"
                          style={{ 
                            color: item.count > 0 ? theme.onSurface : theme.onSurface + '80',
                            fontWeight: item.count > 0 ? '500' : '400'
                          }}
                        >
                          {item.content}
                        </ThemedText>

                        {item.status && item.status !== 'online' && (
                          <ThemedText intensity = "strong" className=" mt-1" style={{ color: theme.success, fontSize:10 }}>
                            {item.status}
                          </ThemedText>
                        )}
                      </ThemedView>

                      {/* Right Side Info */}
                      <ThemedView className="items-end justify-center min-w-[60px]">
                        <ThemedText className="text-xs mb-1" style={{ color: theme.onSurface + '60' }}>
                          {item.timestamp}
                        </ThemedText>

                        {/* Unread Badge */}
                        {item.count > 0 && (
                          <MotiView
                            from={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                          >
                            <ThemedView variant ="surfaceVariant"
                              className="px-2 py-1 rounded-full items-center justify-center min-w-[24px]"
                              style={{ backgroundColor: theme.success }}
                            >
                              <ThemedText intensity='strong' style = {{color:theme.surface}}>
                                {item.count > 99 ? '99+' : item.count}
                              </ThemedText>
                            </ThemedView>
                          </MotiView>
                        )}

                        {/* Message Status */}
                        {item.isSentByCurrentUser && !item.count && (
                          <ThemedView variant = "surfaceVariant" className="mt-1">
                            {item.statusIcon === 'sent' && <ThemedText style={{ color: theme.star }} className="text-xs">✓</ThemedText>}
                            {item.statusIcon === 'delivered' && <ThemedText  className="text-xs">✓</ThemedText>}
                            {item.statusIcon === 'read' && (
                              <ThemedText className="text-xs" style={{ color: theme.success }}>✓✓</ThemedText>
                            )}
                          </ThemedView>
                        )}
                      </ThemedView>
                    </ThemedView>
                  </MotiView>
                </AnimatePresence>
              </TouchableOpacity>
            )}
          />
        )}
      </ThemedView>

      {/* Overlay to close menu */}
      {showMenu && (
        <TouchableOpacity
          className="absolute inset-0"
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
          style={{ zIndex: 40 }}
        />
      )}
    </ThemedView>
  );
}