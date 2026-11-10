import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTelegramTime,
  formatFileSize,
  formatOnlineStatus,
  getInitials,
  getTelegramAvatarColor,
  filterConversations,
  Conversation,
} from './telegram-utils';

test('getInitials extracts 2 letters for full names or first 2 chars', () => {
  assert.equal(getInitials('Pavel Durov'), 'PD');
  assert.equal(getInitials('Telegram'), 'TE');
  assert.equal(getInitials(''), '?');
});

test('getTelegramAvatarColor returns deterministic gradient class', () => {
  const color1 = getTelegramAvatarColor('Alice');
  const color2 = getTelegramAvatarColor('Alice');
  assert.equal(color1, color2);
  assert.match(color1, /^from-/);
});

test('formatFileSize formats byte amounts correctly', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(1024), '1 KB');
  assert.equal(formatFileSize(1024 * 1024 * 2.5), '2.5 MB');
});

test('formatOnlineStatus handles online and recent states', () => {
  assert.equal(formatOnlineStatus(true), 'online');
  assert.equal(formatOnlineStatus(false, null), 'last seen recently');
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  assert.equal(formatOnlineStatus(false, fiveMinAgo), 'last seen 5m ago');
});

test('filterConversations filters by folder and query and prioritizes pinned chats', () => {
  const mockChats: Conversation[] = [
    { id: '1', type: 'direct', title: 'Alice', isPinned: false },
    { id: '2', type: 'group', title: 'Design Guild', isPinned: true },
    { id: '3', type: 'channel', title: 'Telegram News', isPinned: false },
    { id: '4', type: 'bot', title: 'Gemini Assistant', isPinned: true },
  ];

  const groupFilter = filterConversations(mockChats, 'groups', '');
  assert.equal(groupFilter.length, 1);
  assert.equal(groupFilter[0].title, 'Design Guild');

  const searchFilter = filterConversations(mockChats, 'all', 'alice');
  assert.equal(searchFilter.length, 1);
  assert.equal(searchFilter[0].title, 'Alice');

  const allFiltered = filterConversations(mockChats, 'all', '');
  // Pinned items (Design Guild & Gemini Assistant) should be first
  assert.equal(allFiltered[0].isPinned, true);
  assert.equal(allFiltered[1].isPinned, true);
});
