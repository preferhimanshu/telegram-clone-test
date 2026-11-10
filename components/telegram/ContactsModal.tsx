'use client';

import React, { useState } from 'react';
import { X, Search, UserPlus, Phone, UserCheck } from 'lucide-react';
import { ChatUser } from './types';
import { getTelegramAvatarColor, getInitials, formatOnlineStatus } from '@/lib/telegram-utils';

interface ContactsModalProps {
  isOpen: boolean;
  contacts: ChatUser[];
  onClose: () => void;
  onSelectContact: (contact: ChatUser) => void;
  onOpenAddContact: () => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  contacts,
  onClose,
  onSelectContact,
  onOpenAddContact,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      (c.phoneNumber && c.phoneNumber.includes(search))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--tg-surface)] text-[var(--tg-text)] rounded-2xl shadow-2xl border border-[var(--tg-border)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)] flex items-center justify-between">
          <h3 className="font-semibold text-base">Contacts</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddContact();
              }}
              className="p-1.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-primary)]"
              title="Add contact"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tg-text-secondary)]" />
            <input
              type="text"
              placeholder="Search contacts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[var(--tg-surface)] border border-transparent focus:border-[var(--tg-primary)] text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--tg-border)]">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--tg-text-secondary)]">
              No contacts found
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.uid}
                onClick={() => {
                  onSelectContact(contact);
                  onClose();
                }}
                className="flex items-center justify-between p-3 hover:bg-[var(--tg-surface-hover)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {contact.avatarUrl ? (
                      <img
                        src={contact.avatarUrl}
                        alt={contact.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                          contact.displayName
                        )} text-white font-semibold text-sm flex items-center justify-center`}
                      >
                        {getInitials(contact.displayName)}
                      </div>
                    )}
                    {contact.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--tg-surface)] rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{contact.displayName}</div>
                    <div className="text-[11px] text-[var(--tg-text-secondary)]">
                      {formatOnlineStatus(contact.isOnline, contact.lastSeen)}
                    </div>
                  </div>
                </div>

                {contact.phoneNumber && (
                  <div className="text-[11px] font-mono text-[var(--tg-text-secondary)]">
                    {contact.phoneNumber}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
