export interface ChatUser {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  convId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type: 'text' | 'image' | 'video' | 'file' | 'audio' | 'voice' | 'system';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  replyToId?: string;
  replyPreview?: string;
  forwardFrom?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  reactions?: Record<string, number>;
  userReaction?: string;
  timestamp: string;
  isOutgoing: boolean;
  status?: 'sending' | 'sent' | 'read';
}

export interface ConversationItem {
  id: string;
  type: 'direct' | 'group' | 'channel' | 'saved' | 'bot';
  title: string;
  username?: string;
  description?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
  membersCount?: number;
  onlineCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  unreadCount?: number;
  verified?: boolean;
  lastMessage?: {
    text: string;
    timestamp: string;
    isOutgoing: boolean;
    senderName?: string;
    status?: 'sent' | 'read';
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  sendByEnter: boolean;
  animations: boolean;
  soundNotifications: boolean;
  textSize: number;
  wallpaperType?: 'doodle' | 'color' | 'image';
  wallpaperValue?: string;
  wallpaperColor?: string;
  wallpaperOpacity?: number;
}
