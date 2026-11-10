'use client';

import React, { useState } from 'react';
import {
  Menu,
  Search,
  X,
  Pin,
  VolumeX,
  Volume2,
  Trash2,
  Check,
  CheckCheck,
  Bookmark,
  Bot,
  Users,
  Megaphone,
  PenSquare,
  Sparkles,
  MoreVertical,
} from 'lucide-react';
import { ConversationItem, ChatUser } from './types';
import {
  getTelegramAvatarColor,
  getInitials,
  formatTelegramTime,
  filterConversations,
} from '@/lib/telegram-utils';

interface ChatListSidebarProps {
  conversations: ConversationItem[];
  selectedChatId: string | null;
  onSelectChat: (conv: ConversationItem) => void;
  onOpenDrawer: () => void;
  onOpenNewChat: () => void;
  currentUser: ChatUser;
  onTogglePinChat?: (convId: string, isPinned: boolean) => void;
  onToggleMuteChat?: (convId: string, isMuted: boolean) => void;
  onDeleteChat?: (convId: string) => void;
}

type FolderTab = 'all' | 'personal' | 'groups' | 'channels' | 'bots';

export const ChatListSidebar: React.FC<ChatListSidebarProps> = ({
  conversations,
  selectedChatId,
  onSelectChat,
  onOpenDrawer,
  onOpenNewChat,
  currentUser,
  onTogglePinChat,
  onToggleMuteChat,
  onDeleteChat,
}) => {
  const [activeFolder, setActiveFolder] = useState<FolderTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    chat: ConversationItem;
  } | null>(null);

  const filtered = filterConversations(conversations, activeFolder, searchQuery);

  const getFolderUnread = (folder: FolderTab): number => {
    const list = filterConversations(conversations, folder, '');
    return list.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  };

  return (
    <aside
      className="w-full md:w-[380px] lg:w-[410px] h-full flex flex-col bg-[var(--tg-sidebar-bg)] border-r border-[var(--tg-border)] select-none shrink-0"
      aria-label="Telegram Chat List"
    >
      {/* Top Header & Search Bar */}
      <div className="p-2.5 flex items-center gap-2 border-b border-[var(--tg-border)]">
        <button
          onClick={onOpenDrawer}
          className="p-2 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tg-text-secondary)]" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-full bg-[var(--tg-surface)] border border-transparent focus:border-[var(--tg-primary)] text-xs text-[var(--tg-text)] placeholder-[var(--tg-text-secondary)] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onOpenNewChat}
          className="p-2 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-primary)] transition-colors"
          title="New conversation"
          aria-label="New chat"
        >
          <PenSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Folders Bar */}
      <div className="flex items-center px-2 border-b border-[var(--tg-border)] bg-[var(--tg-sidebar-bg)] overflow-x-auto no-scrollbar text-xs">
        {[
          { key: 'all', label: 'All' },
          { key: 'personal', label: 'Personal' },
          { key: 'groups', label: 'Groups' },
          { key: 'channels', label: 'Channels' },
          { key: 'bots', label: 'Bots' },
        ].map((tab) => {
          const unread = getFolderUnread(tab.key as FolderTab);
          const isActive = activeFolder === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFolder(tab.key as FolderTab)}
              className={`py-2.5 px-3 font-semibold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'border-[var(--tg-primary)] text-[var(--tg-primary)]'
                  : 'border-transparent text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]'
              }`}
            >
              <span>{tab.label}</span>
              {unread > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[var(--tg-primary)] text-white' : 'bg-gray-400 text-white dark:bg-gray-600'
                  }`}
                >
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-transparent">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--tg-text-secondary)]">
            No chats found in this folder
          </div>
        ) : (
          filtered.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: Math.min(e.clientX, window.innerWidth - 200),
                    y: Math.min(e.clientY, window.innerHeight - 150),
                    chat,
                  });
                }}
                className={`relative px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors group ${
                  isSelected
                    ? 'bg-[var(--tg-primary)] text-white'
                    : 'hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text)]'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {chat.type === 'saved' ? (
                    <div className="w-12 h-12 rounded-full bg-[var(--tg-primary)] flex items-center justify-center text-white shadow-sm">
                      <Bookmark className="w-6 h-6 fill-white" />
                    </div>
                  ) : chat.avatarUrl ? (
                    <img
                      src={chat.avatarUrl}
                      alt={chat.title}
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                        chat.title
                      )} text-white font-semibold text-base flex items-center justify-center shadow-sm`}
                    >
                      {getInitials(chat.title)}
                    </div>
                  )}

                  {/* Online Indicator */}
                  {chat.isOnline && chat.type !== 'saved' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--tg-sidebar-bg)] rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Title & Time */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <h4
                        className={`font-semibold text-sm truncate ${
                          isSelected ? 'text-white' : 'text-[var(--tg-text)]'
                        }`}
                      >
                        {chat.title}
                      </h4>
                      {chat.verified && (
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isSelected ? 'text-white' : 'text-[var(--tg-primary)]'
                          }`}
                          title="Verified"
                        >
                          ✓
                        </span>
                      )}
                      {chat.isMuted && (
                        <VolumeX
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-white/70' : 'text-[var(--tg-text-secondary)]'
                          }`}
                        />
                      )}
                    </div>

                    {chat.lastMessage && (
                      <span
                        className={`text-[11px] shrink-0 font-medium ${
                          isSelected ? 'text-white/80' : 'text-[var(--tg-text-secondary)]'
                        }`}
                      >
                        {formatTelegramTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  {/* Message Preview & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`text-xs truncate flex items-center gap-1 ${
                        isSelected ? 'text-white/85' : 'text-[var(--tg-text-secondary)]'
                      }`}
                    >
                      {chat.lastMessage?.isOutgoing && (
                        <span className="shrink-0">
                          <CheckCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[var(--tg-primary)]'}`} />
                        </span>
                      )}
                      {chat.type === 'group' && chat.lastMessage?.senderName && (
                        <span className={`font-semibold ${isSelected ? 'text-white' : 'text-[var(--tg-text)]'}`}>
                          {chat.lastMessage.senderName}:
                        </span>
                      )}
                      <span className="truncate">
                        {chat.lastMessage?.text || chat.description || 'No messages yet'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {chat.isPinned && (
                        <Pin
                          className={`w-3.5 h-3.5 rotate-45 ${
                            isSelected ? 'text-white/80' : 'text-[var(--tg-text-secondary)]'
                          }`}
                        />
                      )}
                      {(chat.unreadCount ?? 0) > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold min-w-5 text-center ${
                            isSelected
                              ? 'bg-white text-[var(--tg-primary)]'
                              : chat.isMuted
                              ? 'bg-gray-400 text-white dark:bg-gray-600'
                              : 'bg-[var(--tg-unread)] text-white'
                          }`}
                        >
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Context Menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-50 select-none"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
        >
          <div
            className="fixed w-48 bg-[var(--tg-surface)] border border-[var(--tg-border)] rounded-xl shadow-2xl py-1 z-50 text-xs font-medium animate-in fade-in zoom-in-95"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {onTogglePinChat && (
              <button
                onClick={() => {
                  onTogglePinChat(contextMenu.chat.id, !contextMenu.chat.isPinned);
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-2 hover:bg-[var(--tg-surface-hover)] flex items-center gap-2.5 text-left transition-colors"
              >
                <Pin className="w-4 h-4 text-[var(--tg-text-secondary)]" />
                <span>{contextMenu.chat.isPinned ? 'Unpin from top' : 'Pin to top'}</span>
              </button>
            )}

            {onToggleMuteChat && (
              <button
                onClick={() => {
                  onToggleMuteChat(contextMenu.chat.id, !contextMenu.chat.isMuted);
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-2 hover:bg-[var(--tg-surface-hover)] flex items-center gap-2.5 text-left transition-colors"
              >
                {contextMenu.chat.isMuted ? (
                  <Volume2 className="w-4 h-4 text-[var(--tg-text-secondary)]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[var(--tg-text-secondary)]" />
                )}
                <span>{contextMenu.chat.isMuted ? 'Unmute notifications' : 'Mute notifications'}</span>
              </button>
            )}

            {onDeleteChat && (
              <button
                onClick={() => {
                  onDeleteChat(contextMenu.chat.id);
                  setContextMenu(null);
                }}
                className="w-full px-3.5 py-2 hover:bg-red-500/10 text-red-500 flex items-center gap-2.5 text-left transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete chat</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
