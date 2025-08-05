
export interface FrontendMessage {
  msgId: string; // String au lieu d'ObjectId
  senderId: string;
  sender?: {
    name: string;
    avatar: string;
  };
  conversationId: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'property' | 'voice_note' | 'ar_preview' | 'virtual_tour';
  content: string;
  mediaData?: {
    filename?: string;
    originalName?: string;
    size?: number;
    mimetype?: string;
    duration?: number;
    thumbnail?: string;
    dimensions?: { width: number; height: number };
    compressed?: boolean;
  };
  reactions: {
    userId: string;
    emoji: string;
    timestamp: string; // ISO string au lieu de Date
  }[];
  mentions?: string[];
  status: {
    sent: string; // ISO string
    delivered: {
      userId: string;
      timestamp: string;
    }[];
    read: {
      userId: string;
      timestamp: string;
    }[];
  };
  replyTo?: string;
  forwardedFrom?: {
    originalMessageId: string;
    originalSender: string;
    forwardChain: number;
  };
  isDeleted: boolean;
  deletedFor: string[];
  deletedAt?: string;
  deletedBy?: string;
  canRestore: boolean;
  isEdited: boolean;
  editHistory: {
    content: string;
    editedAt: string;
  }[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    propertyId?: string;
  };
  aiInsights?: {
    sentiment?: {
      score?: number;
      label?: string;
    };
    intentDetection?: string;
    autoSuggestions?: string[];
    priority?: 'low' | 'medium' | 'normal' | 'high' | 'urgent';
  };
  theme?: 'light' | 'dark' | 'auto';
  scheduledFor?: string;
  isScheduled?: boolean;
  temporaryAccess?: {
    expiresAt: string;
    accessCode: string;
  };
  createdAt: string;
  updatedAt?: string;
  isBot?: boolean
}

export interface FrontendConversation {
  _id: string;
  participants: string[];
  admins: string[];
  type: 'direct' | 'group' | 'property_discussion';
  groupInfo?: {
    name?: string;
    description?: string;
    avatar?: string;
    admins?: string[];
    settings?: {
      allowMemberAdd?: boolean;
      allowMemberEdit?: boolean;
      muteAll?: boolean;
    };
  };
  propertyId?: string;
  settings?: {
    encryption?: boolean;
    disappearingMessages?: {
      enabled: boolean;
      duration: number;
    };
    smartReply?: boolean;
    translation?: boolean;
    voiceTranscription?: boolean;
  };
  isArchivedBy?: { userId: string; archivedAt: string }[];
  isPinned?: { userId: string; pinnedAt: string }[];
  typingUsers?: { userId: string; lastTyping: string }[];
  pinnedMessages?: string[];
  aiModerator?: {
    enabled: boolean;
    autoResponseSuggestions: boolean;
    priceNegotiationAssist: boolean;
    appointmentScheduling: boolean;
  };
  analytics?: {
    messageCount: number;
    averageResponseTime: number;
    mostActiveHours: number[];
    engagement: {
      reactionsCount: number;
      mediaSharedCount: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// services/MessageService.ts - Service côté frontend
export interface SendMessageParams {
  conversationId: string; // String au lieu d'ObjectId
  senderId: string;
  messageType: FrontendMessage['messageType'];
  content: string;
  mediaData?: FrontendMessage['mediaData'];
  mentions?: string[];
  replyTo?: string;
  location?: FrontendMessage['location'];
  scheduledFor?: string;
  temporaryAccess?: FrontendMessage['temporaryAccess'];
}

export interface SendMessageResponse {
  success: boolean;
  message?: FrontendMessage;
  error?: string;
}
// components/navigator/RouteType.ts - Correction des types de navigation
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Chat: {
    chatId: string;
    name: string;
    image: string;
    status?: string;
    // Ajouter userId si nécessaire
    userId?: string;
  };
  // Ajouter d'autres routes selon vos besoins
  Settings: undefined;
  Notifications: undefined;
};

// Types pour les props des composants
export type ChatScreenProps = {
  chatId: string;
  name: string;
  image: string;
  status?: string;
  userId?: string;
};

// types/MessageTypes.ts ou components/messages/chat/MessageBody.tsx

// Interface corrigée pour MessageBody/MessageDisplay
export interface MessageBodyProps {
  message: FrontendMessage;
  currentUserId: string;
  onReply?: (message: FrontendMessage) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onMarkAsRead?: (messageId: string) => void;
}


