'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Phone,
  Video,
  PanelRight,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Mic,
  MicOff,
  Pin,
  Check,
  CheckCheck,
  X,
  FileText,
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Edit2,
  Reply,
  Sparkles,
  Zap,
  Brain,
  Volume2,
  VolumeX,
  Palette,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConversationItem, ChatMessage, ChatUser, UserPreferences } from './types';
import {
  getTelegramAvatarColor,
  getInitials,
  formatTelegramTime,
  formatOnlineStatus,
} from '@/lib/telegram-utils';
import { telegramAudio } from '@/lib/sound-effects';

interface ChatAreaProps {
  conversation: ConversationItem;
  messages: ChatMessage[];
  currentUser: ChatUser;
  preferences: UserPreferences;
  onSendMessage: (payload: {
    text: string;
    type?: 'text' | 'image' | 'file' | 'voice';
    mediaUrl?: string;
    mediaName?: string;
    mediaSize?: string;
    replyToId?: string;
    replyPreview?: string;
    aiMode?: 'search' | 'thinking';
  }) => void;
  onDeleteMessage: (msgId: string) => void;
  onEditMessage: (msgId: string, newText: string) => void;
  onTogglePinMessage: (msgId: string, isPinned: boolean) => void;
  onReactMessage: (msgId: string, emoji: string) => void;
  onBackMobile: () => void;
  onToggleInfoPanel: () => void;
  onStartCall: (isVideo: boolean) => void;
  onOpenImageViewer: (url: string) => void;
  onClearHistory: () => void;
  onDeleteConversation: () => void;
  onToggleMute: () => void;
  onOpenWallpaperModal?: () => void;
}

const COMMON_REACTIONS = ['👍', '❤️', '🔥', '🎉', '👏', '🚀', '💡', '😂'];

const EMOJI_LIST = [
  '😀', '😂', '😍', '😎', '🥳', '🤔', '🙌', '👍', '🔥', '❤️',
  '✨', '🚀', '🎉', '💡', '☕', '💻', '🤖', '⭐', '🌈', '⚡',
  '👋', '🤝', '💯', '🎯', '🥑', '🍕', '🛡️', '📦', '🔔', '💬'
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUser,
  preferences,
  onSendMessage,
  onDeleteMessage,
  onEditMessage,
  onTogglePinMessage,
  onReactMessage,
  onBackMobile,
  onToggleInfoPanel,
  onStartCall,
  onOpenImageViewer,
  onClearHistory,
  onDeleteConversation,
  onToggleMute,
  onOpenWallpaperModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Hidden native file input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // In-chat search
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [searchInChatQuery, setSearchInChatQuery] = useState('');

  // AI Assistant mode (for conv_bot_ai)
  const [aiMode, setAiMode] = useState<'search' | 'thinking'>('search');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Voice recording timer
  useEffect(() => {
    if (!isRecordingVoice) return;
    const timer = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (editingMsg) {
      onEditMessage(editingMsg.id, trimmed);
      setEditingMsg(null);
    } else {
      onSendMessage({
        text: trimmed,
        type: 'text',
        replyToId: replyingTo?.id,
        replyPreview: replyingTo?.text.slice(0, 50),
        aiMode: conversation.id === 'conv_bot_ai' ? aiMode : undefined,
      });
      telegramAudio.playSent();
    }

    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (preferences.sendByEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFinishVoiceRecord = () => {
    setIsRecordingVoice(false);
    onSendMessage({
      text: '',
      type: 'voice',
      mediaName: `Voice message (0:${recordingSeconds.toString().padStart(2, '0')})`,
      mediaSize: `${Math.round(recordingSeconds * 14)} KB`,
    });
    telegramAudio.playSent();
  };

  // Real device file selection and upload
  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileKind: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachMenu(false);
    setIsUploadingMedia(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('convId', conversation.id);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.mediaUrl) {
        onSendMessage({
          text: '',
          type: data.mediaType || (fileKind === 'image' ? 'image' : 'file'),
          mediaUrl: data.mediaUrl,
          mediaName: data.mediaName || file.name,
          mediaSize: data.mediaSize,
        });
        telegramAudio.playSent();
      } else {
        alert(data.error || 'Failed to upload file');
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploadingMedia(false);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  // Dynamic Wallpaper Style Resolver
  const getWallpaperStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontSize: `${preferences.textSize}px`,
    };

    if (preferences.wallpaperType === 'image' && preferences.wallpaperValue) {
      return {
        ...base,
        backgroundColor: preferences.wallpaperColor || '#0e1621',
        backgroundImage: `url(${preferences.wallpaperValue})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    if (preferences.wallpaperType === 'color' && preferences.wallpaperColor) {
      return {
        ...base,
        backgroundColor: preferences.wallpaperColor,
        backgroundImage: 'none',
      };
    }

    // Default: Vector Doodle
    const color = preferences.wallpaperColor || (preferences.theme === 'dark' ? '#0e1621' : '#8c9096');
    const opacity = (preferences.wallpaperOpacity !== undefined ? preferences.wallpaperOpacity : 80) / 100;
    return {
      ...base,
      backgroundColor: color,
      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,${0.14 * opacity}) 0%, transparent 40%), repeating-linear-gradient(45deg, transparent, transparent 25px, rgba(255,255,255,${0.07 * opacity}) 25px, rgba(255,255,255,${0.07 * opacity}) 50px)`,
    };
  };

  const triggerReactionCelebration = (emoji: string, e: React.MouseEvent) => {
    if (emoji === '🎉' || emoji === '🔥' || emoji === '❤️' || emoji === '🚀') {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
      });
    }
  };

  // Find pinned message
  const pinnedMessage = messages.find((m) => m.isPinned);

  // Filter messages for search
  const filteredMessages = searchInChatQuery.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(searchInChatQuery.toLowerCase()))
    : messages;

  return (
    <main
      className="flex-1 h-full flex flex-col bg-[var(--tg-chat-bg)] relative min-w-0"
      aria-label="Conversation with chat partner"
    >
      {/* 1. Chat Header */}
      <header className="h-14 px-3 sm:px-4 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)] flex items-center justify-between z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Back button on mobile */}
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 -ml-1 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            aria-label="Back to chat list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div
            onClick={onToggleInfoPanel}
            className="cursor-pointer relative shrink-0"
            title="View chat info"
          >
            {conversation.avatarUrl ? (
              <img
                src={conversation.avatarUrl}
                alt={conversation.title}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                  conversation.title
                )} text-white font-semibold text-sm flex items-center justify-center`}
              >
                {getInitials(conversation.title)}
              </div>
            )}
            {conversation.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--tg-sidebar-bg)] rounded-full" />
            )}
          </div>

          {/* Title & Online Status */}
          <div onClick={onToggleInfoPanel} className="min-w-0 cursor-pointer">
            <h2 className="font-semibold text-sm sm:text-base leading-tight truncate flex items-center gap-1.5">
              <span>{conversation.title}</span>
              {conversation.verified && (
                <span className="text-[var(--tg-primary)] text-xs" title="Verified">
                  ✓
                </span>
              )}
            </h2>
            <div className="text-[11px] text-[var(--tg-text-secondary)] truncate">
              {conversation.type === 'group'
                ? `${conversation.membersCount || 142} members, ${conversation.onlineCount || 38} online`
                : conversation.type === 'channel'
                ? `${conversation.membersCount?.toLocaleString() || '8.9M'} subscribers`
                : conversation.id === 'conv_bot_ai'
                ? 'bot • powered by Gemini'
                : formatOnlineStatus(conversation.isOnline, conversation.lastSeen)}
            </div>
          </div>
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* AI Mode Selector Toggle when chatting with Telegram Assistant */}
          {conversation.id === 'conv_bot_ai' && (
            <div className="hidden sm:flex items-center gap-1 bg-[var(--tg-surface)] p-1 rounded-full border border-[var(--tg-border)] text-xs mr-1">
              <button
                onClick={() => setAiMode('search')}
                className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
                  aiMode === 'search'
                    ? 'bg-[var(--tg-primary)] text-white shadow-xs'
                    : 'text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]'
                }`}
                title="Google Search Grounding (gemini-3.8-flash)"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button
                onClick={() => setAiMode('thinking')}
                className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
                  aiMode === 'thinking'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]'
                }`}
                title="High Thinking Reasoning Mode (gemini-4-argon)"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Thinking</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsSearchingInChat(!isSearchingInChat)}
            className="p-2 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            title="Search in conversation"
            aria-label="Search conversation"
          >
            <Search className="w-5 h-5" />
          </button>

          {conversation.type === 'direct' && (
            <>
              <button
                onClick={() => onStartCall(false)}
                className="p-2 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
                title="Voice call"
                aria-label="Start voice call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => onStartCall(true)}
                className="p-2 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
                title="Video call"
                aria-label="Start video call"
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}

          <button
            onClick={onToggleInfoPanel}
            className="hidden md:flex p-2 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            title="View chat profile info"
            aria-label="Toggle profile information panel"
          >
            <PanelRight className="w-5 h-5" />
          </button>

          {/* More Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--tg-surface)] border border-[var(--tg-border)] rounded-xl shadow-xl py-1.5 z-50 text-xs font-medium animate-in fade-in zoom-in-95">
                {onOpenWallpaperModal && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenWallpaperModal();
                    }}
                    className="w-full px-4 py-2 hover:bg-[var(--tg-surface-hover)] flex items-center gap-2.5 text-left"
                  >
                    <Palette className="w-4 h-4 text-[var(--tg-primary)]" />
                    <span>Change chat wallpaper</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onToggleMute();
                  }}
                  className="w-full px-4 py-2 hover:bg-[var(--tg-surface-hover)] flex items-center gap-2.5 text-left"
                >
                  {conversation.isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{conversation.isMuted ? 'Unmute' : 'Mute'} notifications</span>
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onClearHistory();
                  }}
                  className="w-full px-4 py-2 hover:bg-[var(--tg-surface-hover)] flex items-center gap-2.5 text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear history</span>
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onDeleteConversation();
                  }}
                  className="w-full px-4 py-2 hover:bg-red-500/10 text-red-500 flex items-center gap-2.5 text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. In-Chat Search Bar (conditionally shown) */}
      {isSearchingInChat && (
        <div className="p-2 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)] flex items-center gap-2 z-10 animate-in slide-in-from-top-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tg-text-secondary)]" />
            <input
              type="text"
              autoFocus
              placeholder="Search in this chat..."
              value={searchInChatQuery}
              onChange={(e) => setSearchInChatQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[var(--tg-surface)] border border-[var(--tg-border)] text-xs text-[var(--tg-text)] focus:outline-none focus:border-[var(--tg-primary)]"
            />
            {searchInChatQuery && (
              <button
                onClick={() => setSearchInChatQuery('')}
                className="absolute right-2.5 top-2 text-[var(--tg-text-secondary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsSearchingInChat(false);
              setSearchInChatQuery('');
            }}
            className="px-3 py-1.5 rounded-lg hover:bg-[var(--tg-surface-hover)] text-xs text-[var(--tg-text-secondary)]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 3. Pinned Message Bar */}
      {pinnedMessage && (
        <div className="bg-[var(--tg-surface)] border-b border-[var(--tg-border)] px-4 py-2 flex items-center justify-between text-xs z-10 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <Pin className="w-4 h-4 text-[var(--tg-primary)] shrink-0 rotate-45" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-[var(--tg-primary)]">
                Pinned Message
              </div>
              <div className="truncate text-[var(--tg-text)]">{pinnedMessage.text}</div>
            </div>
          </div>
          <button
            onClick={() => onTogglePinMessage(pinnedMessage.id, false)}
            className="p-1 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            title="Unpin message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Messages Container with dynamic Telegram wallpaper background */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 tg-chat-pattern relative"
        style={getWallpaperStyle()}
      >
        {/* Date Separator */}
        <div className="flex items-center justify-center my-3">
          <span className="px-3 py-1 rounded-full bg-black/20 dark:bg-black/40 backdrop-blur-sm text-[11px] text-white font-medium shadow-xs">
            November 9, 2026
          </span>
        </div>

        {filteredMessages.map((msg) => {
          const isOutgoing = msg.isOutgoing;
          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
              className={`flex flex-col group relative ${
                isOutgoing ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Bubble Container */}
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm transition-all ${
                  isOutgoing
                    ? 'bg-[var(--tg-outgoing-bubble)] text-[var(--tg-text)] rounded-br-xs'
                    : 'bg-[var(--tg-incoming-bubble)] text-[var(--tg-text)] rounded-bl-xs'
                }`}
              >
                {/* Group Sender Name */}
                {conversation.type === 'group' && !isOutgoing && (
                  <div className="text-xs font-bold text-[var(--tg-primary)] mb-1">
                    {msg.senderName}
                  </div>
                )}

                {/* Reply preview */}
                {msg.replyPreview && (
                  <div className="mb-1.5 pl-2 border-l-2 border-[var(--tg-primary)] bg-black/5 dark:bg-white/5 rounded-r py-1 pr-2 text-xs text-[var(--tg-text-secondary)]">
                    <span className="font-semibold block text-[10px] text-[var(--tg-primary)]">
                      Reply
                    </span>
                    <span className="truncate block">{msg.replyPreview}</span>
                  </div>
                )}

                {/* Media Image */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div
                    onClick={() => onOpenImageViewer(msg.mediaUrl!)}
                    className="cursor-pointer overflow-hidden rounded-xl mb-1.5 max-w-sm hover:opacity-95 transition-opacity"
                  >
                    <img
                      src={msg.mediaUrl}
                      alt={msg.mediaName || 'Photo'}
                      className="w-full max-h-72 object-cover rounded-xl"
                    />
                  </div>
                )}

                {/* Media File */}
                {msg.type === 'file' && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-black/5 dark:bg-white/5 mb-1.5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--tg-primary)] text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{msg.mediaName || 'Document'}</div>
                      <div className="text-[10px] text-[var(--tg-text-secondary)]">{msg.mediaSize || '1.2 MB'}</div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--tg-primary)]">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Media Voice Note with interactive scrubber */}
                {msg.type === 'voice' && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-black/5 dark:bg-white/5 mb-1.5 min-w-[200px]">
                    <button
                      onClick={() =>
                        setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)
                      }
                      className="w-9 h-9 rounded-full bg-[var(--tg-primary)] text-white flex items-center justify-center shrink-0 shadow-sm"
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 space-y-1">
                      {/* Waveform bars simulation */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[4, 8, 14, 20, 12, 18, 22, 16, 10, 6, 14, 18, 10, 5, 8, 12, 16, 8].map(
                          (h, idx) => (
                            <span
                              key={idx}
                              className={`w-1 rounded-full transition-all ${
                                playingAudioId === msg.id && idx < 10
                                  ? 'bg-[var(--tg-primary)]'
                                  : 'bg-gray-400 dark:bg-gray-500'
                              }`}
                              style={{ height: `${h}px` }}
                            />
                          )
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--tg-text-secondary)] font-mono">
                        <span>{playingAudioId === msg.id ? '0:12' : '0:24'}</span>
                        <span>{msg.mediaSize || '340 KB'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Text */}
                {msg.text && (
                  <p className="whitespace-pre-wrap break-words leading-relaxed select-text">
                    {msg.text}
                  </p>
                )}

                {/* Timestamp & Status indicators */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[var(--tg-text-secondary)] select-none">
                  {msg.isEdited && <span className="italic mr-0.5">edited</span>}
                  <span>{formatTelegramTime(msg.timestamp)}</span>
                  {isOutgoing && (
                    <span title="Read">
                      <CheckCheck className="w-3.5 h-3.5 text-[var(--tg-primary)]" />
                    </span>
                  )}
                </div>

                {/* Reactions list pill row */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          onReactMessage(msg.id, emoji);
                          triggerReactionCelebration(emoji, e);
                        }}
                        className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs flex items-center gap-1 transition-transform active:scale-90"
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-semibold">{count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Quick Action Buttons & Reaction Selector */}
              {hoveredMsgId === msg.id && (
                <div
                  className={`absolute -top-7 ${
                    isOutgoing ? 'right-0' : 'left-0'
                  } bg-[var(--tg-surface)] border border-[var(--tg-border)] rounded-full shadow-lg px-2 py-1 flex items-center gap-1.5 z-20 animate-in fade-in zoom-in-95`}
                >
                  {/* Quick Reactions */}
                  {COMMON_REACTIONS.slice(0, 4).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        onReactMessage(msg.id, emoji);
                        triggerReactionCelebration(emoji, e);
                      }}
                      className="hover:scale-125 transition-transform text-xs"
                      title={`React ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}

                  <div className="w-px h-3 bg-[var(--tg-border)] mx-0.5" />

                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="p-1 hover:text-[var(--tg-primary)] text-[var(--tg-text-secondary)]"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  {isOutgoing && (
                    <button
                      onClick={() => {
                        setEditingMsg(msg);
                        setInputText(msg.text);
                        textareaRef.current?.focus();
                      }}
                      className="p-1 hover:text-[var(--tg-primary)] text-[var(--tg-text-secondary)]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onTogglePinMessage(msg.id, !msg.isPinned)}
                    className="p-1 hover:text-[var(--tg-primary)] text-[var(--tg-text-secondary)]"
                    title={msg.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${msg.isPinned ? 'text-[var(--tg-primary)]' : ''}`} />
                  </button>

                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-1 hover:text-red-500 text-[var(--tg-text-secondary)]"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 5. Message Composer at Bottom */}
      <footer className="p-3 bg-[var(--tg-sidebar-bg)] border-t border-[var(--tg-border)] z-20 shrink-0">
        {/* Reply/Edit Bar Preview */}
        {(replyingTo || editingMsg) && (
          <div className="mb-2 p-2 rounded-xl bg-[var(--tg-surface)] border-l-4 border-[var(--tg-primary)] flex items-center justify-between text-xs animate-in slide-in-from-bottom-1">
            <div className="min-w-0">
              <span className="font-semibold text-[11px] text-[var(--tg-primary)] block">
                {editingMsg ? 'Editing message' : `Reply to ${replyingTo?.senderName}`}
              </span>
              <span className="truncate block text-[var(--tg-text-secondary)]">
                {editingMsg ? editingMsg.text : replyingTo?.text}
              </span>
            </div>
            <button
              onClick={() => {
                setReplyingTo(null);
                setEditingMsg(null);
                setInputText('');
              }}
              className="p-1 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Composer Controls */}
        <div className="flex items-end gap-2 relative">
          {/* Attachment button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)] transition-colors"
              title="Attach media or document"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Hidden native file inputs */}
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleDeviceFileUpload(e, 'image')}
            />
            <input
              type="file"
              ref={docInputRef}
              accept=".pdf,.doc,.docx,.txt,.zip,.csv,.json,application/*"
              className="hidden"
              onChange={(e) => handleDeviceFileUpload(e, 'file')}
            />

            {/* Attachment popover */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-52 bg-[var(--tg-surface)] border border-[var(--tg-border)] rounded-2xl shadow-xl py-2 z-50 text-xs font-semibold animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    photoInputRef.current?.click();
                  }}
                  className="w-full px-4 py-2 hover:bg-[var(--tg-surface-hover)] flex items-center gap-3 text-left transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    📷
                  </span>
                  <div>
                    <div className="font-semibold text-xs">Photo or Video</div>
                    <div className="text-[10px] text-[var(--tg-text-secondary)] font-normal">Choose from device</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    docInputRef.current?.click();
                  }}
                  className="w-full px-4 py-2 hover:bg-[var(--tg-surface-hover)] flex items-center gap-3 text-left transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                    📄
                  </span>
                  <div>
                    <div className="font-semibold text-xs">Document (PDF/file)</div>
                    <div className="text-[10px] text-[var(--tg-text-secondary)] font-normal">Stored in Cloud SQL</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Uploading indicator */}
          {isUploadingMedia && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--tg-surface)] border border-[var(--tg-border)] text-[11px] text-[var(--tg-primary)] animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading device file...</span>
            </div>
          )}

          {/* Emoji / Sticker button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)] transition-colors"
              title="Emoji and stickers"
              aria-label="Open emoji picker"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Emoji popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-[var(--tg-surface)] border border-[var(--tg-border)] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold text-[var(--tg-text-secondary)] uppercase mb-2">
                  Emojis & Reactions
                </div>
                <div className="grid grid-cols-6 gap-2 text-xl max-h-48 overflow-y-auto pr-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInputText((prev) => prev + emoji);
                        textareaRef.current?.focus();
                      }}
                      className="p-1 hover:bg-[var(--tg-surface-hover)] rounded-lg transition-transform hover:scale-115 flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Voice recording active state vs text input */}
          {isRecordingVoice ? (
            <div className="flex-1 flex items-center justify-between px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Recording audio... 0:{recordingSeconds.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecordingVoice(false)}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishVoiceRecord}
                  className="px-3 py-1 rounded-lg bg-red-500 text-white font-semibold text-xs shadow-sm"
                >
                  Send Memo
                </button>
              </div>
            </div>
          ) : (
            /* Text input */
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Write a message..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 py-2.5 px-3 bg-transparent text-[var(--tg-text)] placeholder-[var(--tg-text-secondary)] text-sm focus:outline-none resize-none max-h-28 overflow-y-auto leading-relaxed"
            />
          )}

          {/* Send or Voice Record Action button */}
          {!isRecordingVoice && (
            <div>
              {inputText.trim() ? (
                <button
                  onClick={handleSend}
                  className="p-2.5 rounded-full bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] shadow-md transition-transform active:scale-95"
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setRecordingSeconds(0);
                    setIsRecordingVoice(true);
                  }}
                  className="p-2.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)] transition-colors"
                  title="Record voice message"
                  aria-label="Record voice note"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </footer>
    </main>
  );
};
