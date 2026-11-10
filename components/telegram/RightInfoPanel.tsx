'use client';

import React, { useState } from 'react';
import {
  X,
  Bell,
  Image as ImageIcon,
  FileText,
  Link2,
  Mic,
  Users,
  UserPlus,
  Phone,
  Video,
  Shield,
  Download,
  Share2,
} from 'lucide-react';
import { ConversationItem, ChatMessage, ChatUser } from './types';
import { getTelegramAvatarColor, getInitials, formatOnlineStatus } from '@/lib/telegram-utils';

interface RightInfoPanelProps {
  conversation: ConversationItem;
  messages: ChatMessage[];
  contacts: ChatUser[];
  onClose: () => void;
  onStartCall: (isVideo: boolean) => void;
  onOpenImageViewer: (url: string) => void;
  onToggleMute: () => void;
}

type TabType = 'media' | 'files' | 'links' | 'members';

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({
  conversation,
  messages,
  contacts,
  onClose,
  onStartCall,
  onOpenImageViewer,
  onToggleMute,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(
    conversation.type === 'group' ? 'members' : 'media'
  );

  const mediaMessages = messages.filter((m) => m.type === 'image' && m.mediaUrl);
  const fileMessages = messages.filter((m) => m.type === 'file' || m.type === 'voice');

  return (
    <aside
      className="w-80 lg:w-[340px] h-full flex flex-col bg-[var(--tg-sidebar-bg)] border-l border-[var(--tg-border)] select-none shrink-0 animate-in slide-in-from-right duration-150"
      aria-label="Chat Information Panel"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-[var(--tg-border)] flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {conversation.type === 'group'
            ? 'Group Info'
            : conversation.type === 'channel'
            ? 'Channel Info'
            : 'User Info'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
          aria-label="Close info panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-5 flex flex-col items-center text-center border-b border-[var(--tg-border)] bg-[var(--tg-surface)]">
        <div className="relative mb-3">
          {conversation.avatarUrl ? (
            <img
              src={conversation.avatarUrl}
              alt={conversation.title}
              className="w-20 h-20 rounded-full object-cover shadow-md"
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                conversation.title
              )} text-white font-bold text-2xl flex items-center justify-center shadow-md`}
            >
              {getInitials(conversation.title)}
            </div>
          )}
          {conversation.isOnline && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[var(--tg-surface)] rounded-full" />
          )}
        </div>

        <h4 className="font-bold text-base flex items-center gap-1.5">
          {conversation.title}
          {conversation.verified && (
            <span className="text-[var(--tg-primary)] text-xs" title="Verified">
              ✓
            </span>
          )}
        </h4>

        <div className="text-xs text-[var(--tg-text-secondary)] mt-0.5">
          {conversation.type === 'group'
            ? `${conversation.membersCount || 142} members, ${conversation.onlineCount || 38} online`
            : conversation.type === 'channel'
            ? `${conversation.membersCount?.toLocaleString() || '8.9M'} subscribers`
            : formatOnlineStatus(conversation.isOnline, conversation.lastSeen)}
        </div>

        {/* Quick call action buttons for direct chats */}
        {conversation.type === 'direct' && (
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => onStartCall(false)}
              className="p-2.5 rounded-full bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] hover:bg-[var(--tg-primary)] hover:text-white transition-colors"
              title="Voice call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStartCall(true)}
              className="p-2.5 rounded-full bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] hover:bg-[var(--tg-primary)] hover:text-white transition-colors"
              title="Video call"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Details & Bio */}
      <div className="p-4 border-b border-[var(--tg-border)] text-xs space-y-3">
        {conversation.description && (
          <div>
            <div className="text-[10px] text-[var(--tg-text-secondary)] uppercase font-semibold">
              About
            </div>
            <div className="mt-0.5 text-[var(--tg-text)] leading-relaxed">
              {conversation.description}
            </div>
          </div>
        )}

        {conversation.username && (
          <div>
            <div className="text-[10px] text-[var(--tg-text-secondary)] uppercase font-semibold">
              Username
            </div>
            <div className="mt-0.5 text-[var(--tg-primary)] font-medium">
              @{conversation.username}
            </div>
          </div>
        )}

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs">
            <Bell className="w-4 h-4 text-[var(--tg-text-secondary)]" />
            <span>Notifications</span>
          </div>
          <button
            onClick={onToggleMute}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              !conversation.isMuted ? 'bg-[var(--tg-primary)]' : 'bg-gray-400'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                !conversation.isMuted ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Shared Media Tabs */}
      <div className="flex border-b border-[var(--tg-border)] text-xs font-semibold">
        {conversation.type === 'group' && (
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-[var(--tg-primary)] text-[var(--tg-primary)]'
                : 'border-transparent text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]'
            }`}
          >
            Members
          </button>
        )}
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            activeTab === 'media'
              ? 'border-[var(--tg-primary)] text-[var(--tg-primary)]'
              : 'border-transparent text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]'
          }`}
        >
          Media
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'border-[var(--tg-primary)] text-[var(--tg-primary)]'
              : 'border-transparent text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]'
          }`}
        >
          Files
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'members' && conversation.type === 'group' && (
          <div className="space-y-2">
            <div className="text-[11px] text-[var(--tg-text-secondary)] mb-2 font-medium">
              Group Participants
            </div>
            {contacts.length === 0 ? (
              <div className="text-xs text-[var(--tg-text-secondary)] py-3 text-center">
                No other members
              </div>
            ) : (
              contacts.slice(0, 8).map((member, idx) => (
                <div
                  key={member.uid}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--tg-surface-hover)]"
                >
                  <div className="flex items-center gap-2.5">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                          member.displayName
                        )} text-white font-semibold text-xs flex items-center justify-center`}
                      >
                        {getInitials(member.displayName)}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold">{member.displayName}</div>
                      <div className="text-[10px] text-[var(--tg-text-secondary)]">
                        {idx === 0 ? 'owner' : idx === 1 ? 'admin' : member.isOnline ? 'online' : 'offline'}
                      </div>
                    </div>
                  </div>

                  {idx <= 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--tg-primary)]/10 text-[var(--tg-primary)] font-semibold">
                      {idx === 0 ? 'Owner' : 'Admin'}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div>
            {mediaMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--tg-text-secondary)]">
                No shared photos or videos
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {mediaMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => msg.mediaUrl && onOpenImageViewer(msg.mediaUrl)}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-black/10"
                  >
                    <img
                      src={msg.mediaUrl}
                      alt={msg.mediaName || 'Media'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-2">
            {fileMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--tg-text-secondary)]">
                No shared files
              </div>
            ) : (
              fileMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--tg-surface)] border border-[var(--tg-border)] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--tg-primary)]/15 text-[var(--tg-primary)] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{msg.mediaName || 'Document.pdf'}</div>
                      <div className="text-[10px] text-[var(--tg-text-secondary)]">
                        {msg.mediaSize || '1.4 MB'}
                      </div>
                    </div>
                  </div>
                  <button
                    className="p-1.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
