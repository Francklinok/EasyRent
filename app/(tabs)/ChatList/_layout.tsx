import React from 'react';
import { Slot, router } from 'expo-router';
import { TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MenuAction } from '@/types/ChatListTypes';
import { ChatListProvider, useChatListHeader } from '@/components/contexts/ChatListContext';

function ChatListHeader() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets().top;
    const {
        unreadCount,
        showSearch,
        setShowSearch,
        search,
        setSearch,
        showMenu,
        setShowMenu,
    } = useChatListHeader();

    const handleMenuAction = (action: MenuAction) => {
        setShowMenu(false);
        switch (action) {
            case 'settings':
                router.navigate('/chat/settings' as any);
                break;
            case 'archive':
                router.navigate('/chat/archived' as any);
                break;
            case 'starred':
                router.navigate('/chat/starred' as any);
                break;
            case 'broadcast':
                router.navigate('/chat/broadcast' as any);
                break;
        }
    };

    return (
        <>
            <ThemedView
                style={{
                    paddingHorizontal: 16,
                    paddingTop: insets + 10,
                    paddingBottom: 16,
                }}
            >
                <ThemedView style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                }}>
                    {/* Left: Title with unread badge */}
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
                        <ThemedText type="title" intensity="strong" style={{ color: theme.text }}>
                            Messages
                        </ThemedText>
                        {unreadCount > 0 && (
                            <ThemedView
                                style={{
                                    marginLeft: 8,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 12,
                                    backgroundColor: theme.surface,
                                }}
                            >
                                <ThemedText type = "caption" intensity = "strong" style={{ color:theme.text}}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </ThemedText>
                            </ThemedView>
                        )}
                    </ThemedView>

                    {/* Right: Actions */}
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'transparent' }}>
                        {/* Search Toggle */}
                        <TouchableOpacity
                            onPress={() => {
                                setShowSearch(!showSearch);
                                if (showSearch) setSearch('');
                            }}
                            style={{
                                backgroundColor: theme.surface,
                                borderRadius: 20,
                                padding: 8,
                            }}
                        >
                            <Ionicons
                                name={showSearch ? 'close' : 'search-outline'}
                                size={20}
                                color= {theme.text}
                            />
                        </TouchableOpacity>

                        {/* Menu Button */}
                        <TouchableOpacity
                            onPress={() => setShowMenu(!showMenu)}
                            style={{
                                backgroundColor: theme.surface,
                                borderRadius: 20,
                                padding: 8,
                            }}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="white" />
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>

                {/* Search Bar */}
                {showSearch && (
                    <ThemedView
                        style={{
                            marginTop: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: theme.surfaceVariant,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                        }}
                    >
                        <Ionicons name="search-outline" size={18} color="white" />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Rechercher conversations..."
                            placeholderTextColor={theme.text + '80'}
                            style={{
                                flex: 1,
                                marginLeft: 8,
                                color: 'white',
                                fontSize: 14,
                            }}
                            autoFocus
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={18} color={theme.text + '80'} />
                            </TouchableOpacity>
                        )}
                    </ThemedView>
                )}

                {/* Dropdown Menu */}
                {showMenu && (
                    <ThemedView
                        style={{
                            position: 'absolute',
                            top: insets + 50,
                            right: 16,
                            backgroundColor: theme.surface,
                            borderRadius: 12,
                            shadowColor: '#000',
                            shadowOpacity: 0.15,
                            shadowOffset: { width: 0, height: 4 },
                            shadowRadius: 8,
                            elevation: 8,
                            minWidth: 160,
                            zIndex: 100,
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
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderBottomWidth: index < 3 ? 0.5 : 0,
                                    borderBottomColor: theme.outline + '30',
                                }}
                            >
                                <Ionicons name={item.icon as any} size={18} color={theme.onSurface} />
                                <ThemedText style={{ marginLeft: 12, fontSize: 14 }}>{item.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ThemedView>
                )}
            </ThemedView>

            {/* Overlay to close menu */}
            {showMenu && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 50,
                    }}
                    onPress={() => setShowMenu(false)}
                    activeOpacity={1}
                />
            )}
        </>
    );
}

export default function ChatListLayout() {
    return (
        <ChatListProvider>
            <ThemedView style={{ flex: 1 }}>
                <ChatListHeader />
                <Slot />
            </ThemedView>
        </ChatListProvider>
    );
}
