export interface ChatListItem {
  id: string;
  sender: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  count: number;
  isArchived: boolean;
  status: 'online' | 'offline' | 'away';
  isBot: boolean;
  isSentByCurrentUser: boolean;
  statusIcon: 'sent' | 'delivered' | 'read';
}

export type FilterType = 'all' | 'unread' | 'archived';
export type SortType = 'recent' | 'name' | 'unread';
export type MenuAction = 'starred' | 'archive' | 'broadcast' | 'settings';