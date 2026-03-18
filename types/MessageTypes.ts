
export interface FrontendMessage {
  msgId: string; 
  senderId: string;
  sender?: {
    name: string;
    avatar: string;
  };
  conversationId: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'property' | 'voice_note' | 'ar_preview' | 'virtual_tour' | 'visit_request' | 'reservation_request';
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
    timestamp: string; 
  }[];
  mentions?: string[];
  status: {
    sent: string; 
    delivered: {
      userId: string;
      timestamp: string;
    }[];
    read: {
      userId: string;
      timestamp: string;
    }[];
  };
  replyTo?:string| {
  id: string;
  content?: string;
  sender?: {
    name: string;
    avatar: string;
  };
};
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
  isBot?: boolean,
  isSent?: boolean; 
  visitData?: {
    id: string;
    date: Date;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  };
  propertyData?: {
    title: string;
    address?: string;
    id?: string;
    ownerId?: string;
  };
  metadata?: {
    activityId?: string;
    actionType?: string;
    propertyId?: string;
    visitDate?: string;
    accepted?: boolean;
    acceptDate?: string;
  };
  
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

export interface SendMessageParams {
  conversationId: string; 
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
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Chat: {
    chatId: string;
    name: string;
    image: string;
    status?: string;
    userId?: string;
  };
  Settings: undefined;
  Notifications: undefined;
};

export type ChatScreenProps = {
  chatId: string;
  name: string;
  image: string;
  status?: string;
  userId?: string;
};


export interface MessageBodyProps {
  message: FrontendMessage;
  currentUserId?: string;
  isSent?: boolean;       
  onReply?: (message: FrontendMessage) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onMarkAsRead?: (messageId: string) => void;
}


