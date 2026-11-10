'use client';

import React, { useState } from 'react';
import { X, UserPlus, Phone, AtSign, User } from 'lucide-react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: {
    displayName: string;
    username: string;
    phoneNumber: string;
    bio?: string;
  }) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onAddContact,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
    onAddContact({
      displayName,
      username: username.trim().replace(/^@/, '') || firstName.toLowerCase().replace(/\s+/g, ''),
      phoneNumber: phone.trim(),
      bio: bio.trim(),
    });

    setFirstName('');
    setLastName('');
    setPhone('');
    setUsername('');
    setBio('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[var(--tg-surface)] text-[var(--tg-text)] rounded-2xl shadow-2xl border border-[var(--tg-border)] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[var(--tg-primary)]" />
            <h3 className="font-semibold text-base">New Contact</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-sm focus:outline-none focus:border-[var(--tg-primary)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-sm focus:outline-none focus:border-[var(--tg-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tg-text-secondary)]" />
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-sm focus:outline-none focus:border-[var(--tg-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
              Username (Optional)
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tg-text-secondary)]" />
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-sm focus:outline-none focus:border-[var(--tg-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
              Bio / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Designer from London"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-sm focus:outline-none focus:border-[var(--tg-primary)]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--tg-border)] text-xs font-medium hover:bg-[var(--tg-surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!firstName.trim()}
              className="px-5 py-2 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
