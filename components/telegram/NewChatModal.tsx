'use client';

import React, { useState } from 'react';
import { X, Users, Megaphone, Check, Camera } from 'lucide-react';
import { ChatUser } from './types';
import { getTelegramAvatarColor, getInitials } from '@/lib/telegram-utils';

interface NewChatModalProps {
  isOpen: boolean;
  type: 'group' | 'channel';
  contacts: ChatUser[];
  onClose: () => void;
  onCreateChat: (chatData: {
    title: string;
    description: string;
    type: 'group' | 'channel';
    avatarUrl?: string;
    selectedMembers: string[];
  }) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  type,
  contacts,
  onClose,
  onCreateChat,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');

  if (!isOpen) return null;

  const toggleMember = (uid: string) => {
    if (selectedMembers.includes(uid)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== uid));
    } else {
      setSelectedMembers([...selectedMembers, uid]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateChat({
      title: title.trim(),
      description: description.trim(),
      type,
      avatarUrl:
        avatarUrl ||
        (type === 'group'
          ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150&auto=format&fit=crop&q=80'),
      selectedMembers,
    });

    setTitle('');
    setDescription('');
    setSelectedMembers([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--tg-surface)] text-[var(--tg-text)] rounded-2xl shadow-2xl border border-[var(--tg-border)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'group' ? (
              <Users className="w-5 h-5 text-[var(--tg-primary)]" />
            ) : (
              <Megaphone className="w-5 h-5 text-[var(--tg-primary)]" />
            )}
            <h3 className="font-semibold text-base">
              {type === 'group' ? 'New Group' : 'New Channel'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
              {type === 'group' ? 'Group Name' : 'Channel Name'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'group' ? 'e.g. Mobile Devs Team' : 'e.g. Tech Weekly'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-[var(--tg-text)] focus:outline-none focus:border-[var(--tg-primary)] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--tg-text-secondary)] uppercase mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What is this chat about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-[var(--tg-text)] focus:outline-none focus:border-[var(--tg-primary)] text-sm resize-none"
            />
          </div>

          {/* Member Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[var(--tg-text-secondary)] uppercase">
                Add Participants ({selectedMembers.length})
              </label>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-[var(--tg-border)] rounded-lg p-2 bg-[var(--tg-sidebar-bg)]">
              {contacts.map((contact) => {
                const isSelected = selectedMembers.includes(contact.uid);
                return (
                  <div
                    key={contact.uid}
                    onClick={() => toggleMember(contact.uid)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--tg-primary)]/15 border border-[var(--tg-primary)]/30'
                        : 'hover:bg-[var(--tg-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {contact.avatarUrl ? (
                        <img
                          src={contact.avatarUrl}
                          alt={contact.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                            contact.displayName
                          )} text-white font-semibold text-xs flex items-center justify-center`}
                        >
                          {getInitials(contact.displayName)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-semibold">{contact.displayName}</div>
                        <div className="text-[10px] text-[var(--tg-text-secondary)]">
                          @{contact.username}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[var(--tg-primary)] border-[var(--tg-primary)] text-white'
                          : 'border-gray-400 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--tg-border)] text-xs font-medium hover:bg-[var(--tg-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              Create {type === 'group' ? 'Group' : 'Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
