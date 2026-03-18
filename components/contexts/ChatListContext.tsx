import React, { createContext, useContext, useState } from 'react';
import { FilterType, SortType } from '@/types/ChatListTypes';

interface ChatListHeaderContextType {
    unreadCount: number;
    setUnreadCount: (count: number) => void;
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    search: string;
    setSearch: (search: string) => void;
    showMenu: boolean;
    setShowMenu: (show: boolean) => void;
    activeFilter: FilterType;
    setActiveFilter: (filter: FilterType) => void;
    sortBy: SortType;
    setSortBy: (sort: SortType) => void;
}

const ChatListHeaderContext = createContext<ChatListHeaderContextType>({
    unreadCount: 0,
    setUnreadCount: () => {},
    showSearch: false,
    setShowSearch: () => {},
    search: '',
    setSearch: () => {},
    showMenu: false,
    setShowMenu: () => {},
    activeFilter: 'all',
    setActiveFilter: () => {},
    sortBy: 'recent',
    setSortBy: () => {},
});

export const useChatListHeader = () => useContext(ChatListHeaderContext);

interface ChatListProviderProps {
    children: React.ReactNode;
}

export const ChatListProvider: React.FC<ChatListProviderProps> = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const [search, setSearch] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('recent');

    return (
        <ChatListHeaderContext.Provider value={{
            unreadCount,
            setUnreadCount,
            showSearch,
            setShowSearch,
            search,
            setSearch,
            showMenu,
            setShowMenu,
            activeFilter,
            setActiveFilter,
            sortBy,
            setSortBy,
        }}>
            {children}
        </ChatListHeaderContext.Provider>
    );
};
