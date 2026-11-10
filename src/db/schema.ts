import { pgTable, text, serial, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or local ID
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  username: text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),
  bio: text('bio').default(''),
  phoneNumber: text('phone_number'),
  isOnline: boolean('is_online').default(false),
  lastSeen: timestamp('last_seen').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User contacts
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // User's uid
  contactUid: text('contact_uid').notNull(), // Contact's uid
  customName: text('custom_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Conversations (Direct, Group, Channel, Saved Messages, AI Assistant)
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  convId: text('conv_id').notNull().unique(), // Unique string slug / UUID
  type: text('type').notNull().default('direct'), // 'direct' | 'group' | 'channel' | 'saved' | 'bot'
  title: text('title').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  createdBy: text('created_by'), // uid of creator
  isPinned: boolean('is_pinned').default(false),
  isMuted: boolean('is_muted').default(false),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Conversation Participants
export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  conversationId: text('conversation_id').notNull(), // convId
  userId: text('user_id').notNull(), // uid
  role: text('role').notNull().default('member'), // 'owner' | 'admin' | 'member'
  unreadCount: integer('unread_count').default(0),
  lastReadMessageId: integer('last_read_message_id'),
  isPinned: boolean('is_pinned').default(false),
  isMuted: boolean('is_muted').default(false),
  isArchived: boolean('is_archived').default(false),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Messages
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  msgId: text('msg_id').notNull().unique(),
  conversationId: text('conversation_id').notNull(), // convId
  senderId: text('sender_id').notNull(), // uid
  senderName: text('sender_name').notNull(),
  senderAvatar: text('sender_avatar'),
  text: text('text').notNull().default(''),
  type: text('type').notNull().default('text'), // 'text' | 'image' | 'video' | 'file' | 'audio' | 'voice' | 'system'
  mediaUrl: text('media_url'),
  mediaData: text('media_data'), // Base64 payload for persistent user uploads
  mediaName: text('media_name'),
  mediaSize: text('media_size'),
  replyToId: text('reply_to_id'), // msgId of replied message
  replyPreview: text('reply_preview'),
  forwardFrom: text('forward_from'),
  isEdited: boolean('is_edited').default(false),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Message Reactions
export const messageReactions = pgTable('message_reactions', {
  id: serial('id').primaryKey(),
  messageId: text('message_id').notNull(), // msgId
  userId: text('user_id').notNull(), // uid
  userName: text('user_name').notNull(),
  emoji: text('emoji').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// User Settings
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(), // uid
  theme: text('theme').notNull().default('dark'), // 'light' | 'dark'
  sendByEnter: boolean('send_by_enter').default(true),
  animations: boolean('animations').default(true),
  soundNotifications: boolean('sound_notifications').default(true),
  textSize: integer('text_size').default(16),
  wallpaperType: text('wallpaper_type').default('doodle'), // 'doodle' | 'color' | 'image'
  wallpaperValue: text('wallpaper_value').default('classic'), // doodle preset name or image url
  wallpaperColor: text('wallpaper_color').default('#0e1621'), // background tint
  wallpaperOpacity: integer('wallpaper_opacity').default(100),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  participants: many(participants),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(participants),
  messages: many(messages),
}));
