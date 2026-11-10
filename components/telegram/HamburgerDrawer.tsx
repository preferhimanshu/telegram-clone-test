'use client';

import React from 'react';
import {
  User,
  Users,
  Megaphone,
  Phone,
  Bookmark,
  Settings,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
  X,
  LogOut,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { ChatUser, UserPreferences } from './types';
import { getTelegramAvatarColor, getInitials } from '@/lib/telegram-utils';

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ChatUser;
  preferences: UserPreferences;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenContacts: () => void;
  onOpenNewGroup: () => void;
  onOpenNewChannel: () => void;
  onOpenSavedMessages: () => void;
  onOpenDesktopInfo: () => void;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  isFirebaseAuthed: boolean;
}

export const HamburgerDrawer: React.FC<HamburgerDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  preferences,
  onToggleTheme,
  onOpenSettings,
  onOpenContacts,
  onOpenNewGroup,
  onOpenNewChannel,
  onOpenSavedMessages,
  onOpenDesktopInfo,
  onSignInWithGoogle,
  onSignOut,
  isFirebaseAuthed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-label="Close menu"
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] h-full bg-[var(--tg-sidebar-bg)] border-r border-[var(--tg-border)] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* User Header */}
        <div className="p-4 bg-[var(--tg-surface)] border-b border-[var(--tg-border)] flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="relative">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-14 h-14 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                    currentUser.displayName
                  )} text-white font-semibold text-lg flex items-center justify-center shadow-sm`}
                >
                  {getInitials(currentUser.displayName)}
                </div>
              )}
              {currentUser.isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--tg-surface)] rounded-full" />
              )}
            </div>

            <div>
              <div className="font-semibold text-base flex items-center gap-1.5">
                {currentUser.displayName}
                {isFirebaseAuthed && (
                  <span title="Firebase Verified">
                    <CheckCircle2 className="w-4 h-4 text-[var(--tg-primary)]" />
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--tg-text-secondary)]">
                {currentUser.phoneNumber || `@${currentUser.username}`}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu list */}
        <div className="flex-1 overflow-y-auto py-2 text-sm">
          <button
            onClick={() => {
              onClose();
              onOpenSavedMessages();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--tg-surface-hover)] transition-colors text-left"
          >
            <Bookmark className="w-5 h-5 text-[var(--tg-primary)]" />
            <span className="font-medium">Saved Messages</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenContacts();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--tg-surface-hover)] transition-colors text-left"
          >
            <User className="w-5 h-5 text-[var(--tg-text-secondary)]" />
            <span>Contacts</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNewGroup();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--tg-surface-hover)] transition-colors text-left"
          >
            <Users className="w-5 h-5 text-[var(--tg-text-secondary)]" />
            <span>New Group</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNewChannel();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--tg-surface-hover)] transition-colors text-left"
          >
            <Megaphone className="w-5 h-5 text-[var(--tg-text-secondary)]" />
            <span>New Channel</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--tg-surface-hover)] transition-colors text-left"
          >
            <Settings className="w-5 h-5 text-[var(--tg-text-secondary)]" />
            <span>Settings</span>
          </button>

          <div className="my-2 border-t border-[var(--tg-border)]" />

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-4 py-3 hover:bg-[var(--tg-surface-hover)] transition-colors">
            <div className="flex items-center gap-4">
              {preferences.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <span>Night Mode</span>
            </div>
            <button
              onClick={onToggleTheme}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.theme === 'dark' ? 'bg-[var(--tg-primary)]' : 'bg-gray-300'
              }`}
              aria-label="Toggle dark mode"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Desktop App */}
          <button
            onClick={() => {
              onClose();
              onOpenDesktopInfo();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--tg-surface-hover)] transition-colors text-left"
          >
            <Monitor className="w-5 h-5 text-[var(--tg-text-secondary)]" />
            <span>Telegram Desktop</span>
          </button>
        </div>

        {/* Bottom Auth action */}
        <div className="p-4 border-t border-[var(--tg-border)] bg-[var(--tg-surface)]">
          {isFirebaseAuthed ? (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out ({currentUser.displayName})
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onSignInWithGoogle();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] text-xs font-semibold shadow-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in with Google Account
            </button>
          )}
          <div className="text-[10px] text-center text-[var(--tg-text-secondary)] mt-2 font-medium">
            Telegram Web
          </div>
        </div>
      </div>
    </div>
  );
};
