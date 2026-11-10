'use client';

import React, { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, googleAuthProvider } from '@/src/lib/firebase';
import {
  ChatUser,
  ConversationItem,
  ChatMessage,
  UserPreferences,
} from '@/components/telegram/types';
import { ChatListSidebar } from '@/components/telegram/ChatListSidebar';
import { ChatArea } from '@/components/telegram/ChatArea';
import { RightInfoPanel } from '@/components/telegram/RightInfoPanel';
import { HamburgerDrawer } from '@/components/telegram/HamburgerDrawer';
import { CallModal } from '@/components/telegram/CallModal';
import { NewChatModal } from '@/components/telegram/NewChatModal';
import { AddContactModal } from '@/components/telegram/AddContactModal';
import { SettingsModal } from '@/components/telegram/SettingsModal';
import { ContactsModal } from '@/components/telegram/ContactsModal';
import { DesktopModal } from '@/components/telegram/DesktopModal';
import { ImageViewerModal } from '@/components/telegram/ImageViewerModal';
import { WallpaperModal } from '@/components/telegram/WallpaperModal';
import { telegramAudio } from '@/lib/sound-effects';
import { MessageSquare, ShieldCheck, Database, Sparkles } from 'lucide-react';

export default function TelegramApp() {
  // 1. Current User State
  const [currentUser, setCurrentUser] = useState<ChatUser>({
    uid: 'current_user',
    displayName: 'You',
    username: 'current_user',
    email: 'you@telegram.me',
    phoneNumber: '+1 415 555 0199',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Software engineer & tech enthusiast.',
    isOnline: true,
  });
  const [isFirebaseAuthed, setIsFirebaseAuthed] = useState(false);

  // 2. Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    sendByEnter: true,
    animations: true,
    soundNotifications: true,
    textSize: 16,
    wallpaperType: 'doodle',
    wallpaperValue: 'classic',
    wallpaperColor: '#0e1621',
    wallpaperOpacity: 80,
  });

  // 3. Conversations & Contacts
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<ChatUser[]>([]);

  // 4. UI Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [callModal, setCallModal] = useState<{ isOpen: boolean; isVideo: boolean }>({
    isOpen: false,
    isVideo: false,
  });
  const [newChatModal, setNewChatModal] = useState<{
    isOpen: boolean;
    type: 'group' | 'channel';
  }>({
    isOpen: false,
    type: 'group',
  });
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);

  // Apply dark mode class to <html> element
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    telegramAudio.enabled = preferences.soundNotifications;
  }, [preferences.theme, preferences.soundNotifications]);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setIsFirebaseAuthed(true);
        setCurrentUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Telegram User',
          username: fbUser.email?.split('@')[0] || 'user',
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || undefined,
          phoneNumber: fbUser.phoneNumber || undefined,
          bio: 'Verified via Google Sign-In',
          isOnline: true,
        });
      } else {
        setIsFirebaseAuthed(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial Cloud SQL settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setPreferences((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      } catch (e) {
        console.warn('Failed to load settings:', e);
      }
    };
    fetchSettings();
  }, []);

  // Fetch initial contacts from Cloud SQL
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/contacts');
        const data = await res.json();
        if (data.success && Array.isArray(data.contacts)) {
          setContacts(data.contacts);
        }
      } catch (e) {
        console.warn('Failed to load contacts:', e);
      }
    };
    fetchContacts();
  }, []);

  // Fetch initial profile from Cloud SQL
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      } catch (e) {
        console.warn('Failed to load profile:', e);
      }
    };
    fetchProfile();
  }, []);

  // Fetch initial conversations and set up live polling
  useEffect(() => {
    let isMounted = true;
    const fetchChats = async () => {
      try {
        const res = await fetch('/api/chats');
        const data = await res.json();
        if (isMounted && data.conversations && data.conversations.length > 0) {
          setConversations(data.conversations);
          // Auto-select first chat on wide screen
          if (window.innerWidth >= 768) {
            setSelectedChatId((curr) => curr || data.conversations[1]?.id || data.conversations[0]?.id);
          }
        }
      } catch (e) {
        console.warn('Failed to load chats:', e);
      }
    };

    fetchChats();
    const interval = setInterval(fetchChats, 7000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch messages when selected chat changes with polling
  useEffect(() => {
    if (!selectedChatId) return;

    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?convId=${selectedChatId}`);
        const data = await res.json();
        if (isMounted && data.messages) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.warn('Failed to fetch messages:', e);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedChatId]);

  const activeConversation = conversations.find((c) => c.id === selectedChatId) || null;

  // Handlers
  const handleSelectChat = (conv: ConversationItem) => {
    setSelectedChatId(conv.id);
    // Mark as read in local state
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = async (payload: {
    text: string;
    type?: 'text' | 'image' | 'file' | 'voice';
    mediaUrl?: string;
    mediaName?: string;
    mediaSize?: string;
    replyToId?: string;
    replyPreview?: string;
    aiMode?: 'search' | 'thinking';
  }) => {
    if (!selectedChatId) return;

    // Optimistic message
    const tempId = 'temp_' + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      convId: selectedChatId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatarUrl,
      text: payload.text,
      type: payload.type || 'text',
      mediaUrl: payload.mediaUrl,
      mediaName: payload.mediaName,
      mediaSize: payload.mediaSize,
      replyToId: payload.replyToId,
      replyPreview: payload.replyPreview,
      timestamp: new Date().toISOString(),
      isOutgoing: true,
      status: 'sent',
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    // Update conversation last message in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedChatId
          ? {
              ...c,
              lastMessage: {
                text: payload.text || (payload.type === 'voice' ? '🎤 Voice message' : '📎 Attachment'),
                timestamp: new Date().toISOString(),
                isOutgoing: true,
                status: 'read',
              },
            }
          : c
      )
    );

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          convId: selectedChatId,
          ...payload,
        }),
      });
      const data = await res.json();

      if (data.success && data.message) {
        // Replace temp msg
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...data.message, status: 'read' } : m))
        );

        // If AI replied
        if (data.aiResponse) {
          telegramAudio.playReceived();
          setMessages((prev) => [...prev, data.aiResponse]);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedChatId
                ? {
                    ...c,
                    lastMessage: {
                      text: data.aiResponse.text,
                      timestamp: data.aiResponse.timestamp,
                      isOutgoing: false,
                    },
                  }
                : c
            )
          );
        }
      }
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await fetch(`/api/messages?msgId=${msgId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Error deleting message:', e);
    }
  };

  const handleEditMessage = async (msgId: string, newText: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, text: newText, isEdited: true } : m))
    );
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msgId, text: newText, action: 'edit' }),
      });
    } catch (e) {
      console.warn('Error editing message:', e);
    }
  };

  const handleTogglePinMessage = async (msgId: string, isPinned: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isPinned } : m))
    );
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msgId, isPinned, action: 'pin' }),
      });
    } catch (e) {
      console.warn('Error pinning message:', e);
    }
  };

  const handleReactMessage = async (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
        return {
          ...m,
          reactions: currentReactions,
          userReaction: emoji,
        };
      })
    );
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msgId, emoji, action: 'react' }),
      });
    } catch (e) {
      console.warn('Error reacting to message:', e);
    }
  };

  const handleCreateChat = async (chatData: {
    title: string;
    description: string;
    type: 'group' | 'channel';
    avatarUrl?: string;
    selectedMembers: string[];
  }) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData),
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setConversations((prev) => [data.conversation, ...prev]);
        setSelectedChatId(data.conversation.id);
      }
    } catch (e) {
      console.error('Failed to create chat:', e);
    }
  };

  const handleAddContact = async (contact: {
    displayName: string;
    username: string;
    phoneNumber: string;
    bio?: string;
  }) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      const data = await res.json();
      if (data.success && data.contact) {
        setContacts((prev) => [data.contact, ...prev]);
      }
    } catch (e) {
      console.error('Failed to add contact:', e);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (e: any) {
      console.warn('Google sign-in popup closed or cancelled:', e.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsFirebaseAuthed(false);
      setCurrentUser({
        uid: 'current_user',
        displayName: 'You',
        username: 'current_user',
        email: 'you@telegram.me',
        phoneNumber: '+1 415 555 0199',
        bio: 'Software engineer & tech enthusiast.',
        isOnline: true,
      });
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  const handleUpdatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      // Async persist to Cloud SQL
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((e) => console.warn('Failed to persist settings:', e));
      return updated;
    });
  };

  const handleSaveWallpaper = async (wallpaperConfig: {
    wallpaperType: 'doodle' | 'color' | 'image';
    wallpaperValue: string;
    wallpaperColor: string;
    wallpaperOpacity: number;
  }) => {
    setPreferences((prev) => {
      const updated: UserPreferences = {
        ...prev,
        ...wallpaperConfig,
      };
      // Async persist to Cloud SQL
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((e) => console.warn('Failed to persist wallpaper to Cloud SQL:', e));
      return updated;
    });
  };

  const handleToggleMute = async () => {
    if (!selectedChatId) return;
    const targetChat = conversations.find((c) => c.id === selectedChatId);
    const newMuted = !targetChat?.isMuted;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedChatId ? { ...c, isMuted: newMuted } : c))
    );
    try {
      await fetch('/api/chats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convId: selectedChatId, isMuted: newMuted }),
      });
    } catch (e) {
      console.warn('Failed to persist mute status:', e);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedChatId) return;
    setMessages([]);
    try {
      await fetch(`/api/messages?convId=${selectedChatId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to clear conversation history:', e);
    }
  };

  const handleTogglePinChat = async (convId: string, isPinned: boolean) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isPinned } : c))
    );
    try {
      await fetch('/api/chats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convId, isPinned }),
      });
    } catch (e) {
      console.warn('Failed to update pinned chat:', e);
    }
  };

  const handleToggleMuteChat = async (convId: string, isMuted: boolean) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isMuted } : c))
    );
    try {
      await fetch('/api/chats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convId, isMuted }),
      });
    } catch (e) {
      console.warn('Failed to update mute chat:', e);
    }
  };

  const handleDeleteChatById = async (convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (selectedChatId === convId) {
      setSelectedChatId(null);
    }
    try {
      await fetch(`/api/chats?convId=${convId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete chat:', e);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedChatId) return;
    await handleDeleteChatById(selectedChatId);
  };

  const handleUpdateProfile = async (updatedUser: Partial<ChatUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          ...updatedUser,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.warn('Failed to persist profile:', e);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--tg-bg)] text-[var(--tg-text)] font-sans antialiased">
      {/* LEFT SIDEBAR */}
      <div
        className={`${
          selectedChatId ? 'hidden md:flex' : 'flex'
        } w-full md:w-auto h-full shrink-0`}
      >
        <ChatListSidebar
          conversations={conversations}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenNewChat={() => setNewChatModal({ isOpen: true, type: 'group' })}
          currentUser={currentUser}
          onTogglePinChat={handleTogglePinChat}
          onToggleMuteChat={handleToggleMuteChat}
          onDeleteChat={handleDeleteChatById}
        />
      </div>

      {/* CENTRAL CONVERSATION AREA */}
      <div
        className={`${
          !selectedChatId ? 'hidden md:flex' : 'flex'
        } flex-1 h-full min-w-0 flex-col`}
      >
        {activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            messages={messages}
            currentUser={currentUser}
            preferences={preferences}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            onTogglePinMessage={handleTogglePinMessage}
            onReactMessage={handleReactMessage}
            onBackMobile={() => setSelectedChatId(null)}
            onToggleInfoPanel={() => setIsInfoOpen(!isInfoOpen)}
            onStartCall={(isVideo) => setCallModal({ isOpen: true, isVideo })}
            onOpenImageViewer={(url) => setImageViewerUrl(url)}
            onClearHistory={handleClearHistory}
            onDeleteConversation={handleDeleteConversation}
            onToggleMute={handleToggleMute}
            onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
          />
        ) : (
          /* Empty placeholder */
          <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center bg-[var(--tg-chat-bg)] tg-chat-pattern select-none">
            <div className="w-20 h-20 rounded-full bg-[var(--tg-primary)] text-white flex items-center justify-center shadow-lg mb-3 animate-in zoom-in-75 duration-300">
              <MessageSquare className="w-10 h-10 fill-white/90" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Telegram Web</h2>
            <p className="text-xs text-[var(--tg-text-secondary)] max-w-sm mt-1 leading-relaxed">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </div>

      {/* OPTIONAL RIGHT INFO PANEL */}
      {isInfoOpen && activeConversation && (
        <div className="hidden lg:flex h-full">
          <RightInfoPanel
            conversation={activeConversation}
            messages={messages}
            contacts={contacts}
            onClose={() => setIsInfoOpen(false)}
            onStartCall={(isVideo) => setCallModal({ isOpen: true, isVideo })}
            onOpenImageViewer={(url) => setImageViewerUrl(url)}
            onToggleMute={handleToggleMute}
          />
        </div>
      )}

      {/* MODALS & DRAWERS */}
      <HamburgerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUser={currentUser}
        preferences={preferences}
        onToggleTheme={() =>
          setPreferences((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenContacts={() => setIsContactsOpen(true)}
        onOpenNewGroup={() => setNewChatModal({ isOpen: true, type: 'group' })}
        onOpenNewChannel={() => setNewChatModal({ isOpen: true, type: 'channel' })}
        onOpenSavedMessages={() => setSelectedChatId('conv_saved')}
        onOpenDesktopInfo={() => setIsDesktopModalOpen(true)}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isFirebaseAuthed={isFirebaseAuthed}
      />

      {activeConversation && (
        <CallModal
          conversation={activeConversation}
          isVideo={callModal.isVideo}
          isOpen={callModal.isOpen}
          onClose={() => setCallModal({ isOpen: false, isVideo: false })}
        />
      )}

      <NewChatModal
        isOpen={newChatModal.isOpen}
        type={newChatModal.type}
        contacts={contacts}
        onClose={() => setNewChatModal((prev) => ({ ...prev, isOpen: false }))}
        onCreateChat={handleCreateChat}
      />

      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onAddContact={handleAddContact}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onUpdateProfile={handleUpdateProfile}
        onOpenDesktopInfo={() => {
          setIsSettingsOpen(false);
          setIsDesktopModalOpen(true);
        }}
        onOpenWallpaperModal={() => {
          setIsSettingsOpen(false);
          setIsWallpaperModalOpen(true);
        }}
      />

      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        preferences={preferences}
        onSaveWallpaper={handleSaveWallpaper}
      />

      <ContactsModal
        isOpen={isContactsOpen}
        contacts={contacts}
        onClose={() => setIsContactsOpen(false)}
        onSelectContact={(contact) => {
          // Check if conversation exists or select
          const existing = conversations.find(
            (c) => c.title.toLowerCase() === contact.displayName.toLowerCase()
          );
          if (existing) {
            setSelectedChatId(existing.id);
          } else {
            const newConv: ConversationItem = {
              id: 'conv_' + contact.uid,
              type: 'direct',
              title: contact.displayName,
              username: contact.username,
              avatarUrl: contact.avatarUrl,
              description: contact.bio,
              isOnline: contact.isOnline,
              lastSeen: contact.lastSeen,
              unreadCount: 0,
            };
            setConversations((prev) => [newConv, ...prev]);
            setSelectedChatId(newConv.id);
          }
        }}
        onOpenAddContact={() => setIsAddContactOpen(true)}
      />

      <DesktopModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />

      <ImageViewerModal
        imageUrl={imageViewerUrl}
        onClose={() => setImageViewerUrl(null)}
      />
    </div>
  );
}
