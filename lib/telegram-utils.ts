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
  reactions?: Record<string, number>; // emoji -> count
  userReaction?: string;
  timestamp: string; // ISO or formatted
  isOutgoing: boolean;
  status?: 'sending' | 'sent' | 'read';
}

export interface Conversation {
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

export const TG_AVATAR_GRADIENTS = [
  'from-red-500 to-orange-400',
  'from-orange-500 to-amber-400',
  'from-purple-600 to-pink-500',
  'from-blue-600 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-indigo-600 to-blue-400',
  'from-fuchsia-600 to-purple-400',
  'from-rose-500 to-red-400',
];

export function getTelegramAvatarColor(name: string): string {
  if (!name) return TG_AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TG_AVATAR_GRADIENTS.length;
  return TG_AVATAR_GRADIENTS[index];
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function formatTelegramTime(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (isToday) {
    return `${hours}:${minutes}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'Yesterday';
  }

  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatOnlineStatus(isOnline?: boolean, lastSeen?: string | null): string {
  if (isOnline) return 'online';
  if (!lastSeen) return 'last seen recently';
  const date = new Date(lastSeen);
  if (isNaN(date.getTime())) return 'last seen recently';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'last seen just now';
  if (diffMinutes < 60) return `last seen ${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `last seen ${diffHours}h ago`;
  return `last seen ${formatTelegramTime(date)}`;
}

export function filterConversations(
  list: Conversation[],
  folder: 'all' | 'personal' | 'groups' | 'channels' | 'bots',
  searchQuery: string
): Conversation[] {
  let filtered = list;

  // Folder filtering
  if (folder === 'personal') {
    filtered = filtered.filter((c) => c.type === 'direct' || c.type === 'saved');
  } else if (folder === 'groups') {
    filtered = filtered.filter((c) => c.type === 'group');
  } else if (folder === 'channels') {
    filtered = filtered.filter((c) => c.type === 'channel');
  } else if (folder === 'bots') {
    filtered = filtered.filter((c) => c.type === 'bot');
  }

  // Search filtering
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        (c.username && c.username.toLowerCase().includes(query)) ||
        (c.lastMessage && c.lastMessage.text.toLowerCase().includes(query))
    );
  }

  // Pinned items first, then by last message time
  return [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });
}
