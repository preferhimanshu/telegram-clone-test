'use client';

import React, { useState, useRef } from 'react';
import { X, Check, Image as ImageIcon, Upload, Sparkles, Palette, RefreshCw } from 'lucide-react';
import { UserPreferences } from './types';

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSaveWallpaper: (wallpaperConfig: {
    wallpaperType: 'doodle' | 'color' | 'image';
    wallpaperValue: string;
    wallpaperColor: string;
    wallpaperOpacity: number;
  }) => void;
}

// Preset doodle types
export const DOODLE_PATTERNS = [
  { id: 'classic', name: 'Telegram Classic', desc: 'Airplanes, chats & icons' },
  { id: 'constellations', name: 'Constellations', desc: 'Stars & celestial orbits' },
  { id: 'geometric', name: 'Isometric Tech', desc: 'Futuristic lines & grids' },
  { id: 'minimal', name: 'Minimal Dots', desc: 'Subtle clean dot matrix' },
];

// Color palette presets
export const WALLPAPER_COLORS = [
  { name: 'Telegram Dark', hex: '#0e1621' },
  { name: 'Midnight Blue', hex: '#0f172a' },
  { name: 'Onyx Black', hex: '#111827' },
  { name: 'Emerald Forest', hex: '#064e3b' },
  { name: 'Royal Violet', hex: '#2e1065' },
  { name: 'Dark Burgundy', hex: '#450a0a' },
  { name: 'Steel Gray', hex: '#1e293b' },
  { name: 'Classic Light', hex: '#8c9096' },
  { name: 'Sky Soft', hex: '#93c5fd' },
];

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSaveWallpaper,
}) => {
  const [wallpaperType, setWallpaperType] = useState<'doodle' | 'color' | 'image'>(
    preferences.wallpaperType || 'doodle'
  );
  const [wallpaperValue, setWallpaperValue] = useState<string>(
    preferences.wallpaperValue || 'classic'
  );
  const [wallpaperColor, setWallpaperColor] = useState<string>(
    preferences.wallpaperColor || '#0e1621'
  );
  const [wallpaperOpacity, setWallpaperOpacity] = useState<number>(
    preferences.wallpaperOpacity !== undefined ? preferences.wallpaperOpacity : 80
  );
  const [customImageUrl, setCustomImageUrl] = useState<string>(
    preferences.wallpaperType === 'image' ? preferences.wallpaperValue || '' : ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.mediaUrl) {
        setCustomImageUrl(data.mediaUrl);
        setWallpaperType('image');
        setWallpaperValue(data.mediaUrl);
      }
    } catch (err) {
      console.error('Failed to upload wallpaper image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSaveWallpaper({
      wallpaperType,
      wallpaperValue: wallpaperType === 'image' ? customImageUrl : wallpaperValue,
      wallpaperColor,
      wallpaperOpacity,
    });
    onClose();
  };

  const handleResetToDefault = () => {
    setWallpaperType('doodle');
    setWallpaperValue('classic');
    setWallpaperColor('#0e1621');
    setWallpaperOpacity(80);
    setCustomImageUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[var(--tg-surface)] text-[var(--tg-text)] rounded-2xl shadow-2xl border border-[var(--tg-border)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--tg-primary)]" />
            <h3 className="font-semibold text-lg">Chat Wallpaper</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
          {/* Live Preview Card */}
          <div>
            <div className="text-xs font-semibold text-[var(--tg-text-secondary)] uppercase mb-2">
              Live Preview
            </div>
            <div
              className="relative w-full h-44 rounded-xl overflow-hidden border border-[var(--tg-border)] shadow-inner flex flex-col justify-end p-4"
              style={{
                backgroundColor: wallpaperColor,
                backgroundImage:
                  wallpaperType === 'image' && customImageUrl
                    ? `url(${customImageUrl})`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Pattern overlay if doodle */}
              {wallpaperType === 'doodle' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: wallpaperOpacity / 100,
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.12) 0%, transparent 40%), repeating-linear-gradient(45deg, transparent, transparent 25px, rgba(255,255,255,0.06) 25px, rgba(255,255,255,0.06) 50px)`,
                  }}
                />
              )}

              {/* Sample chat bubbles to show contrast */}
              <div className="relative z-10 space-y-2 pointer-events-none max-w-xs">
                <div className="inline-block bg-[var(--tg-incoming-bubble)] text-[var(--tg-text)] text-xs px-3 py-1.5 rounded-xl rounded-bl-xs shadow-md">
                  Hey! How does the new chat background look? ✨
                </div>
                <div className="flex justify-end">
                  <div className="inline-block bg-[var(--tg-outgoing-bubble)] text-[var(--tg-text)] text-xs px-3 py-1.5 rounded-xl rounded-br-xs shadow-md">
                    Looks fantastic, crisp Telegram styling! 🚀
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallpaper Type Switcher */}
          <div>
            <div className="text-xs font-semibold text-[var(--tg-text-secondary)] uppercase mb-2">
              Background Style
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setWallpaperType('doodle')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  wallpaperType === 'doodle'
                    ? 'border-[var(--tg-primary)] bg-[var(--tg-primary)]/15 text-[var(--tg-primary)] font-semibold ring-1 ring-[var(--tg-primary)]'
                    : 'border-[var(--tg-border)] hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text)]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Vector Doodle</span>
              </button>
              <button
                type="button"
                onClick={() => setWallpaperType('color')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  wallpaperType === 'color'
                    ? 'border-[var(--tg-primary)] bg-[var(--tg-primary)]/15 text-[var(--tg-primary)] font-semibold ring-1 ring-[var(--tg-primary)]'
                    : 'border-[var(--tg-border)] hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text)]'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Solid Color</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWallpaperType('image');
                  if (!customImageUrl) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  wallpaperType === 'image'
                    ? 'border-[var(--tg-primary)] bg-[var(--tg-primary)]/15 text-[var(--tg-primary)] font-semibold ring-1 ring-[var(--tg-primary)]'
                    : 'border-[var(--tg-border)] hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text)]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Custom Image</span>
              </button>
            </div>
          </div>

          {/* If Doodle: Pattern Selector & Opacity Slider */}
          {wallpaperType === 'doodle' && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-[var(--tg-text-secondary)] uppercase mb-2">
                  Doodle Pattern
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DOODLE_PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setWallpaperValue(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        wallpaperValue === p.id
                          ? 'border-[var(--tg-primary)] bg-[var(--tg-primary)]/10 ring-1 ring-[var(--tg-primary)]'
                          : 'border-[var(--tg-border)] hover:bg-[var(--tg-surface-hover)]'
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{p.name}</span>
                        {wallpaperValue === p.id && (
                          <Check className="w-3.5 h-3.5 text-[var(--tg-primary)]" />
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--tg-text-secondary)] mt-0.5">
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[var(--tg-text-secondary)] uppercase">
                    Pattern Opacity
                  </span>
                  <span className="text-xs font-mono font-semibold text-[var(--tg-primary)]">
                    {wallpaperOpacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={wallpaperOpacity}
                  onChange={(e) => setWallpaperOpacity(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--tg-primary)] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Color Palette (for doodle background or solid color) */}
          {wallpaperType !== 'image' && (
            <div>
              <div className="text-xs font-semibold text-[var(--tg-text-secondary)] uppercase mb-2">
                Background Color Palette
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {WALLPAPER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setWallpaperColor(c.hex)}
                    title={c.name}
                    className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center relative shadow-xs ${
                      wallpaperColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-[var(--tg-primary)] scale-110'
                        : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {wallpaperColor.toLowerCase() === c.hex.toLowerCase() && (
                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}

                {/* Custom Color Input */}
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--tg-border)] hover:bg-[var(--tg-surface-hover)] cursor-pointer text-xs">
                  <input
                    type="color"
                    value={wallpaperColor}
                    onChange={(e) => setWallpaperColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs">{wallpaperColor}</span>
                </label>
              </div>
            </div>
          )}

          {/* Image Upload section */}
          {wallpaperType === 'image' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[var(--tg-text-secondary)] uppercase">
                Device Image Upload
              </div>
              <div className="p-4 rounded-xl border-2 border-dashed border-[var(--tg-border)] flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : 'Choose Photo from Device'}</span>
                </button>
                <p className="text-[11px] text-[var(--tg-text-secondary)] mt-2">
                  Supports JPG, PNG, WebP or SVG up to 20MB. Stored directly in Cloud SQL.
                </p>
                {customImageUrl && (
                  <div className="mt-3 text-xs text-green-500 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Custom image loaded
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[var(--tg-sidebar-bg)] border-t border-[var(--tg-border)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-lg hover:bg-[var(--tg-surface-hover)] text-xs text-[var(--tg-text-secondary)] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--tg-border)] hover:bg-[var(--tg-surface-hover)] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] text-xs font-semibold shadow-sm transition-colors"
            >
              Apply Wallpaper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
