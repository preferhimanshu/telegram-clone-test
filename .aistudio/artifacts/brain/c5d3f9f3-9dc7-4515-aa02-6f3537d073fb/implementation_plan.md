# Telegram Web: Production Persistence, Real Device Uploads & Custom Wallpapers

Transform the application from seeded demonstration data into a production-grade, persistent messaging platform connected directly to Cloud SQL PostgreSQL. Implement native device file and photo uploads with server-side base64 persistence, an interactive Telegram wallpaper manager with vector doodles, custom colors, and custom image uploads, and wire all interactive controls with live database synchronization.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed and implemented:

- **Confirmed Decision 1: Device File & Photo Persistence**: Implemented `/api/upload` endpoint converting device files (photos, PDFs, documents, audio) into validated base64 data URLs stored directly in Cloud SQL PostgreSQL, ensuring instant retrieval without external cloud storage dependencies.
- **Confirmed Decision 2: Chat Wallpaper Customization**: Created `WallpaperModal` allowing users to choose between classic Telegram vector doodle patterns, custom solid and gradient colors, or upload their own custom background image, saving configuration to Cloud SQL `user_settings`.
- **Confirmed Decision 3: Initial Application State**: Cleaned the database of sample demonstration contacts while retaining the core official **Telegram AI Assistant** (`@GeminiBot` with Google Search and Deep Thinking) and the personal **Saved Messages** cloud vault.

---

## 1. Overview & Core Concept

### What It Delivers
1. Every message, contact, group, reaction, pinned message, and user setting is read from and written to **Cloud SQL PostgreSQL**.
2. Users can upload real photos, images, and documents directly from their local device file picker, viewable inline with full lightbox previews and downloads.
3. Users can customize their chat background wallpaper dynamically (doodle pattern opacity, background tint, or custom uploaded image).
4. Real-time polling and state synchronization ensure newly created conversations, group chats, contacts, and messages persist across browser sessions.

---

## 2. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Telegram Web Frontend                         │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐ │
│  │   ChatListSidebar     │  │     ChatArea      │  │ RightInfoPanel  │ │
│  │  - Search & Folders   │  │ - Doodle Canvas   │  │ - Media Gallery │ │
│  │  - Cloud SQL Sync     │  │ - Real File Input │  │ - Group Members │ │
│  └───────────┬───────────┘  └─────────┬─────────┘  └────────┬────────┘ │
└──────────────┼────────────────────────┼─────────────────────┼──────────┘
               │                        │                     │
               ▼                        ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js API Layer (Server)                      │
│   /api/chats       /api/messages     /api/upload      /api/settings   │
│   (List & Create)  (History & Sync)  (Base64 Handler) (Wallpaper & UI)│
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Cloud SQL (PostgreSQL)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │    users     │  │conversations │  │   messages   │  │user_settings│ │
│  │ (Clean state)│  │(Bot + Saved) │  │(Media base64)│  │(Wallpaper)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Verification & Status

- [x] **Database Schema & Migration**: Added `media_data` on `messages` and `wallpaper_type`, `wallpaper_value`, `wallpaper_color`, `wallpaper_opacity` on `user_settings` in PostgreSQL via Drizzle Kit migration.
- [x] **Database Cleanup**: Cleared sample mock contacts and chats, leaving only `conv_bot_ai` (Telegram Assistant) and `conv_saved` (Saved Messages).
- [x] **Device File & Photo Upload (`/api/upload`)**: Uploads files up to 20MB, validates mime-types, encodes base64 data URLs, and passes to `/api/messages`.
- [x] **Wallpaper Customization (`WallpaperModal`)**:
  - Vector doodles (Telegram Classic, Constellations, Geometric, Minimalist) with opacity slider.
  - Color palette presets with custom hex color picker.
  - Native file upload for custom wallpaper images.
  - Dynamic styles applied to `.tg-chat-pattern` message container.
- [x] **Interactive Controls Connected**:
  - Header More Menu contains "Change chat wallpaper", "Mute/Unmute", "Clear history", "Delete chat".
  - Composer paperclip triggers native device file selectors for photos and documents.
  - Contact additions and group creation persist to Cloud SQL.
- [x] **Verification**:
  - Unit tests passed (5/5).
  - TypeScript compilation and Next.js build succeeded cleanly.
  - ESLint passed with 0 errors.
