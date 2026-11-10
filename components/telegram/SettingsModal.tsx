'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Moon,
  Sun,
  Camera,
  Check,
  Palette,
  Loader2,
  Lock,
} from 'lucide-react';
import { ChatUser, UserPreferences } from './types';
import { getTelegramAvatarColor, getInitials } from '@/lib/telegram-utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ChatUser;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  onUpdateProfile: (updatedUser: Partial<ChatUser>) => void;
  onOpenDesktopInfo: () => void;
  onOpenWallpaperModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  preferences,
  onUpdatePreferences,
  onUpdateProfile,
  onOpenWallpaperModal,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'chat'>('general');
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '+1 415 555 0199');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.mediaUrl) {
        setAvatarUrl(data.mediaUrl);
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: displayName.trim(),
      username: username.trim().replace(/^@/, ''),
      bio: bio.trim(),
      phoneNumber: phoneNumber.trim(),
      avatarUrl: avatarUrl.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--tg-surface)] text-[var(--tg-text)] rounded-2xl shadow-2xl border border-[var(--tg-border)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)] flex items-center justify-between">
          <h3 className="font-semibold text-base">Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[var(--tg-border)] bg-[var(--tg-sidebar-bg)] px-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-[var(--tg-primary)] text-[var(--tg-primary)]'
                : 'border-transparent text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]'
            }`}
          >
            Profile & Account
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-[var(--tg-primary)] text-[var(--tg-primary)]'
                : 'border-transparent text-[var(--tg-text-secondary)] hover:text-[var(--tg-text)]'
            }`}
          >
            Chat & Appearance
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 text-sm">
          {activeTab === 'general' && (
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              {/* Profile Avatar Card */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileSelected}
                />
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-[var(--tg-primary)]"
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                        displayName
                      )} text-white font-bold text-2xl flex items-center justify-center shadow-md`}
                    >
                      {getInitials(displayName)}
                    </div>
                  )}

                  {/* Camera overlay button */}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[var(--tg-primary)] hover:underline font-medium"
                >
                  {isUploadingAvatar ? 'Uploading photo...' : 'Change Profile Photo'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-[var(--tg-text)] text-sm focus:outline-none focus:border-[var(--tg-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
                  Username
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-[var(--tg-surface-hover)] border border-r-0 border-[var(--tg-border)] rounded-l-lg text-[var(--tg-text-secondary)] text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-r-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-[var(--tg-text)] text-sm focus:outline-none focus:border-[var(--tg-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A few words about you"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-[var(--tg-text)] text-sm resize-none focus:outline-none focus:border-[var(--tg-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-[var(--tg-text)] text-sm focus:outline-none focus:border-[var(--tg-primary)]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {isSaved ? (
                  <span className="text-xs text-green-500 flex items-center gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Profile saved
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col gap-5">
              {/* Theme selector */}
              <div>
                <label className="block text-xs font-medium text-[var(--tg-text-secondary)] uppercase mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => onUpdatePreferences({ theme: 'light' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      preferences.theme === 'light'
                        ? 'border-[var(--tg-primary)] bg-[var(--tg-primary)]/10 ring-1 ring-[var(--tg-primary)]'
                        : 'border-[var(--tg-border)] hover:bg-[var(--tg-surface-hover)]'
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="font-semibold text-xs">Light Classic</div>
                      <div className="text-[10px] text-[var(--tg-text-secondary)]">Daytime theme</div>
                    </div>
                  </div>

                  <div
                    onClick={() => onUpdatePreferences({ theme: 'dark' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      preferences.theme === 'dark'
                        ? 'border-[var(--tg-primary)] bg-[var(--tg-primary)]/10 ring-1 ring-[var(--tg-primary)]'
                        : 'border-[var(--tg-border)] hover:bg-[var(--tg-surface-hover)]'
                    }`}
                  >
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="font-semibold text-xs">Telegram Dark</div>
                      <div className="text-[10px] text-[var(--tg-text-secondary)]">Night & OLED</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Size slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[var(--tg-text-secondary)] uppercase">
                    Message Text Size
                  </label>
                  <span className="text-xs font-mono font-semibold text-[var(--tg-primary)]">
                    {preferences.textSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="13"
                  max="20"
                  step="1"
                  value={preferences.textSize}
                  onChange={(e) => onUpdatePreferences({ textSize: parseInt(e.target.value, 10) })}
                  className="w-full accent-[var(--tg-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--tg-text-secondary)] mt-1 font-mono">
                  <span>Small (13px)</span>
                  <span>Default (16px)</span>
                  <span>Large (20px)</span>
                </div>
              </div>

              {/* Chat Wallpaper Button */}
              <div>
                <label className="block text-xs font-medium text-[var(--tg-text-secondary)] uppercase mb-2">
                  Chat Wallpaper
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-sidebar-bg)]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-[var(--tg-border)] shadow-xs flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: preferences.wallpaperColor || '#0e1621',
                        backgroundImage:
                          preferences.wallpaperType === 'image' && preferences.wallpaperValue
                            ? `url(${preferences.wallpaperValue})`
                            : undefined,
                        backgroundSize: 'cover',
                      }}
                    >
                      <Palette className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs capitalize">
                        {preferences.wallpaperType === 'image'
                          ? 'Custom Image'
                          : preferences.wallpaperType === 'color'
                          ? 'Solid Color'
                          : `${preferences.wallpaperValue || 'Classic'} Vector Doodle`}
                      </div>
                      <div className="text-[10px] text-[var(--tg-text-secondary)]">
                        {preferences.wallpaperColor || '#0e1621'} • {preferences.wallpaperOpacity ?? 80}% opacity
                      </div>
                    </div>
                  </div>
                  {onOpenWallpaperModal && (
                    <button
                      type="button"
                      onClick={onOpenWallpaperModal}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] text-xs font-medium transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 pt-2 border-t border-[var(--tg-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-xs">Send with Enter</div>
                    <div className="text-[10px] text-[var(--tg-text-secondary)]">
                      Press Shift + Enter for new line
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdatePreferences({ sendByEnter: !preferences.sendByEnter })}
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                      preferences.sendByEnter ? 'bg-[var(--tg-primary)]' : 'bg-gray-400'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                        preferences.sendByEnter ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-xs">Sound Effects</div>
                    <div className="text-[10px] text-[var(--tg-text-secondary)]">
                      Play audible sounds on messages
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onUpdatePreferences({ soundNotifications: !preferences.soundNotifications })
                    }
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                      preferences.soundNotifications ? 'bg-[var(--tg-primary)]' : 'bg-gray-400'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                        preferences.soundNotifications ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
