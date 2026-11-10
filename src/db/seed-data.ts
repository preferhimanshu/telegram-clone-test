export interface SeedContact {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  phoneNumber: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface SeedConversation {
  convId: string;
  type: 'direct' | 'group' | 'channel' | 'saved' | 'bot';
  title: string;
  username?: string;
  description: string;
  avatarUrl: string;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  unreadCount: number;
  verified?: boolean;
  membersCount?: number;
  onlineCount?: number;
}

export interface SeedMessage {
  msgId: string;
  conversationId: string;
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
  isPinned?: boolean;
  isEdited?: boolean;
  reactions?: Record<string, number>;
  createdAtOffsetMinutes: number; // how many minutes ago
}

export const INITIAL_CONTACTS: SeedContact[] = [
  {
    uid: 'user_pavel',
    email: 'durov@telegram.org',
    displayName: 'Pavel Durov',
    username: 'durov',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Freedom and privacy. Building Telegram.',
    phoneNumber: '+1 415 555 0199',
    isOnline: false,
    lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    uid: 'user_gemini',
    email: 'assistant@telegram.bot',
    displayName: 'Telegram Assistant',
    username: 'GeminiBot',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bio: 'Official AI assistant with Google Search and Deep Thinking capabilities.',
    phoneNumber: '+1 800 555 0100',
    isOnline: true,
  },
  {
    uid: 'user_elena',
    email: 'elena.rostova@design.co',
    displayName: 'Elena Rostova',
    username: 'elenadesign',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead UI/UX Designer • Motion & Micro-interactions • Berlin 🇩🇪',
    phoneNumber: '+49 170 555 4321',
    isOnline: true,
  },
  {
    uid: 'user_alexander',
    email: 'alex.volkov@dev.org',
    displayName: 'Alexander Volkov',
    username: 'alexv',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Principal Frontend Architect. Rust, WebGL, Next.js & TypeScript.',
    phoneNumber: '+44 7911 123456',
    isOnline: true,
  },
  {
    uid: 'user_sophia',
    email: 'sophia.chen@ai-labs.io',
    displayName: 'Sophia Chen',
    username: 'sophiac',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'AI Researcher at DeepMind • Neural Interfaces & LLM Reasoning',
    phoneNumber: '+1 650 555 9876',
    isOnline: false,
    lastSeen: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    uid: 'user_marcus',
    email: 'marcus.vance@sound.io',
    displayName: 'Marcus Vance',
    username: 'marcusv',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Sound designer & audio producer. Synthesizers & spatial audio.',
    phoneNumber: '+1 212 555 3344',
    isOnline: false,
    lastSeen: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
  },
  {
    uid: 'user_clara',
    email: 'clara.moreau@paris.fr',
    displayName: 'Clara Moreau',
    username: 'claram',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Product Strategist @ FinTech Europe • Espresso enthusiast ☕',
    phoneNumber: '+33 6 12 34 56 78',
    isOnline: true,
  },
  {
    uid: 'user_liam',
    email: 'liam.oconnor@infra.cloud',
    displayName: 'Liam O’Connor',
    username: 'liamo',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bio: 'Cloud Architect & SRE. Kubernetes, Distributed Systems, Cloud SQL.',
    phoneNumber: '+353 87 555 9988',
    isOnline: true,
  },
  {
    uid: 'user_maya',
    email: 'maya.patel@security.net',
    displayName: 'Maya Patel',
    username: 'mayap',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Application Security & Cryptography researcher.',
    phoneNumber: '+91 98200 12345',
    isOnline: false,
    lastSeen: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
  },
  {
    uid: 'user_david',
    email: 'david.kim@studio.kr',
    displayName: 'David Kim',
    username: 'davidk',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Mobile App Developer • Flutter, Swift, Kotlin, Electron.',
    phoneNumber: '+82 10 1234 5678',
    isOnline: true,
  },
];

export const INITIAL_CONVERSATIONS: SeedConversation[] = [
  {
    convId: 'conv_saved',
    type: 'saved',
    title: 'Saved Messages',
    description: 'Your cloud storage for bookmarks, media, files, and notes.',
    avatarUrl: '',
    isPinned: true,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
  },
  {
    convId: 'conv_bot_ai',
    type: 'bot',
    title: 'Telegram Assistant',
    username: 'GeminiBot',
    description: 'Official AI powered by Google Search grounding and high-thinking reasoning. Ask anything or test realtime answers!',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isPinned: true,
    isMuted: false,
    isArchived: false,
    unreadCount: 1,
    verified: true,
  },
  {
    convId: 'conv_durov',
    type: 'direct',
    title: 'Pavel Durov',
    username: 'durov',
    description: 'Telegram Founder & CEO',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isPinned: true,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
    verified: true,
  },
  {
    convId: 'conv_design_guild',
    type: 'group',
    title: 'Design Systems Guild',
    description: 'Discussion on Telegram Web UI architecture, tokens, typography, and micro-interactions.',
    avatarUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=150&auto=format&fit=crop&q=80',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 4,
    membersCount: 142,
    onlineCount: 38,
  },
  {
    convId: 'conv_elena',
    type: 'direct',
    title: 'Elena Rostova',
    username: 'elenadesign',
    description: 'Lead Product Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 2,
  },
  {
    convId: 'conv_alexander',
    type: 'direct',
    title: 'Alexander Volkov',
    username: 'alexv',
    description: 'Frontend Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
  },
  {
    convId: 'conv_telegram_news',
    type: 'channel',
    title: 'Telegram News',
    username: 'telegram',
    description: 'Official channel for Telegram announcements, major updates, and features.',
    avatarUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150&auto=format&fit=crop&q=80',
    isPinned: false,
    isMuted: true,
    isArchived: false,
    unreadCount: 3,
    verified: true,
    membersCount: 8940000,
  },
  {
    convId: 'conv_cloud_devs',
    type: 'group',
    title: 'Fullstack & Cloud Engineers',
    description: 'Cloud SQL, PostgreSQL, Real-time WebSockets, and Distributed Messaging.',
    avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
    membersCount: 512,
    onlineCount: 89,
  },
  {
    convId: 'conv_sophia',
    type: 'direct',
    title: 'Sophia Chen',
    username: 'sophiac',
    description: 'AI Researcher',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
  },
  {
    convId: 'conv_liam',
    type: 'direct',
    title: 'Liam O’Connor',
    username: 'liamo',
    description: 'DevOps & Infrastructure Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
  },
];

export const INITIAL_MESSAGES: SeedMessage[] = [
  // Saved Messages
  {
    msgId: 'msg_saved_1',
    conversationId: 'conv_saved',
    senderId: 'current_user',
    senderName: 'You',
    text: '🚀 Personal roadmap: Review Telegram Web layout, verify dark mode contrast, test desktop Electron build.',
    type: 'text',
    isPinned: true,
    createdAtOffsetMinutes: 180,
  },
  {
    msgId: 'msg_saved_2',
    conversationId: 'conv_saved',
    senderId: 'current_user',
    senderName: 'You',
    text: 'Key architectural document for Cloud SQL integration and real-time syncing.',
    type: 'file',
    mediaName: 'Telegram_Architecture_Spec_v2.pdf',
    mediaSize: '3.8 MB',
    mediaUrl: '#',
    createdAtOffsetMinutes: 90,
  },
  {
    msgId: 'msg_saved_3',
    conversationId: 'conv_saved',
    senderId: 'current_user',
    senderName: 'You',
    text: 'Design tokens reference: Telegram soft blue (#2481CC), dark slate (#17212B), incoming bubble (#182533).',
    type: 'text',
    reactions: { '⭐': 1, '🔥': 1 },
    createdAtOffsetMinutes: 30,
  },

  // Telegram Assistant
  {
    msgId: 'msg_bot_1',
    conversationId: 'conv_bot_ai',
    senderId: 'user_gemini',
    senderName: 'Telegram Assistant',
    text: '👋 Welcome to Telegram Web! I am your AI assistant powered by Gemini. You can ask me questions with live Google Search grounding or switch to High Thinking mode for deep reasoning and code solutions. Try asking: "What are the latest breakthroughs in space exploration?" or "Explain WebSockets vs Long Polling".',
    type: 'text',
    reactions: { '🤖': 5, '✨': 8 },
    createdAtOffsetMinutes: 60,
  },
  {
    msgId: 'msg_bot_2',
    conversationId: 'conv_bot_ai',
    senderId: 'user_gemini',
    senderName: 'Telegram Assistant',
    text: 'Tip: Use the attachment button to send files, voice notes, or photos. You can also react to any message with emojis!',
    type: 'text',
    reactions: { '👍': 4, '💡': 3 },
    createdAtOffsetMinutes: 5,
  },

  // Pavel Durov
  {
    msgId: 'msg_durov_1',
    conversationId: 'conv_durov',
    senderId: 'user_pavel',
    senderName: 'Pavel Durov',
    text: 'Quality of craftsmanship is what differentiates good software from timeless software. The Telegram Web interface must be fast, responsive, and respectful of user privacy.',
    type: 'text',
    reactions: { '👏': 12, '❤️': 9, '🔥': 15 },
    createdAtOffsetMinutes: 240,
  },
  {
    msgId: 'msg_durov_2',
    conversationId: 'conv_durov',
    senderId: 'current_user',
    senderName: 'You',
    text: 'We implemented the three-column layout, custom Telegram theme tokens, Cloud SQL persistence, and Firebase auth.',
    type: 'text',
    createdAtOffsetMinutes: 120,
  },
  {
    msgId: 'msg_durov_3',
    conversationId: 'conv_durov',
    senderId: 'user_pavel',
    senderName: 'Pavel Durov',
    text: 'Impressive work. Make sure animations stay under 150ms and keyboard navigation feels native.',
    type: 'text',
    reactions: { '👍': 2 },
    createdAtOffsetMinutes: 45,
  },

  // Design Systems Guild
  {
    msgId: 'msg_ds_1',
    conversationId: 'conv_design_guild',
    senderId: 'user_elena',
    senderName: 'Elena Rostova',
    text: 'Here is the revised message bubble border-radius spec: 16px corner radius, with 4px tail curve on the message origin corner.',
    type: 'text',
    createdAtOffsetMinutes: 80,
  },
  {
    msgId: 'msg_ds_2',
    conversationId: 'conv_design_guild',
    senderId: 'user_alexander',
    senderName: 'Alexander Volkov',
    text: 'Looks pixel-perfect. Here is the desktop screenshot preview of our new theme palette in action:',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    mediaName: 'telegram_theme_preview.jpg',
    mediaSize: '1.2 MB',
    createdAtOffsetMinutes: 50,
  },
  {
    msgId: 'msg_ds_3',
    conversationId: 'conv_design_guild',
    senderId: 'user_marcus',
    senderName: 'Marcus Vance',
    text: 'The send sound effect has been fine-tuned to 44.1kHz crisp click.',
    type: 'text',
    reactions: { '🔥': 6, '🎉': 4 },
    createdAtOffsetMinutes: 15,
  },
  {
    msgId: 'msg_ds_4',
    conversationId: 'conv_design_guild',
    senderId: 'user_elena',
    senderName: 'Elena Rostova',
    text: 'Can everyone verify the unread badges and muted chat gray badge rendering?',
    type: 'text',
    reactions: { '👀': 3 },
    createdAtOffsetMinutes: 2,
  },

  // Elena Rostova
  {
    msgId: 'msg_elena_1',
    conversationId: 'conv_elena',
    senderId: 'user_elena',
    senderName: 'Elena Rostova',
    text: 'Hey! I checked the new responsive layout on tablet and mobile viewports. The transition from two-panel to single-panel view is super smooth.',
    type: 'text',
    createdAtOffsetMinutes: 35,
  },
  {
    msgId: 'msg_elena_2',
    conversationId: 'conv_elena',
    senderId: 'user_elena',
    senderName: 'Elena Rostova',
    text: 'Sending you a voice memo regarding the sticker animation timing.',
    type: 'voice',
    mediaName: 'Voice message (0:24)',
    mediaSize: '340 KB',
    createdAtOffsetMinutes: 10,
  },

  // Alexander Volkov
  {
    msgId: 'msg_alex_1',
    conversationId: 'conv_alexander',
    senderId: 'user_alexander',
    senderName: 'Alexander Volkov',
    text: 'The Cloud SQL connection pool configuration is ready. Max 10 connections, lazy initialization, zero startup block.',
    type: 'text',
    createdAtOffsetMinutes: 95,
  },
  {
    msgId: 'msg_alex_2',
    conversationId: 'conv_alexander',
    senderId: 'current_user',
    senderName: 'You',
    text: 'All 7 tables generated: users, contacts, conversations, participants, messages, reactions, and settings.',
    type: 'text',
    createdAtOffsetMinutes: 40,
  },
  {
    msgId: 'msg_alex_3',
    conversationId: 'conv_alexander',
    senderId: 'user_alexander',
    senderName: 'Alexander Volkov',
    text: 'Awesome! We are ready to ship.',
    type: 'text',
    reactions: { '🚀': 5 },
    createdAtOffsetMinutes: 8,
  },

  // Telegram News
  {
    msgId: 'msg_news_1',
    conversationId: 'conv_telegram_news',
    senderId: 'telegram_official',
    senderName: 'Telegram',
    text: '📢 Major Update: Introducing High-Fidelity Telegram Web with Real-time Cloud SQL persistence, Google Search AI Grounding, and Audio/Video calls UI.\n\nNow available seamlessly across Web, Desktop, Tablet, and Mobile.',
    type: 'text',
    reactions: { '❤️': 892, '🔥': 1420, '🎉': 615 },
    createdAtOffsetMinutes: 120,
  },
  {
    msgId: 'msg_news_2',
    conversationId: 'conv_telegram_news',
    senderId: 'telegram_official',
    senderName: 'Telegram',
    text: '✨ Features included:\n• Pinned chats and messages\n• Folders: All, Personal, Groups, Channels, Bots\n• Rich media sharing with image viewer & file download\n• Custom reaction picker and animated reactions\n• Dark & Light themes with persistent preferences',
    type: 'text',
    reactions: { '👏': 420, '⚡': 310 },
    createdAtOffsetMinutes: 18,
  },
];
