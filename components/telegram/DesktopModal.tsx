'use client';

import React from 'react';
import { X, Monitor, Terminal, Check, Copy } from 'lucide-react';

interface DesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopModal: React.FC<DesktopModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[var(--tg-surface)] text-[var(--tg-text)] rounded-2xl shadow-2xl border border-[var(--tg-border)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[var(--tg-sidebar-bg)] border-b border-[var(--tg-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[var(--tg-primary)]" />
            <h3 className="font-semibold text-base">Telegram Desktop Application</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--tg-surface-hover)] text-[var(--tg-text-secondary)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto text-xs space-y-4">
          <p className="text-[var(--tg-text-secondary)] leading-relaxed">
            The complete Electron desktop configuration has been prepared under the{' '}
            <code className="font-mono text-[var(--tg-primary)]">desktop/</code> directory. It reuses the same React + TypeScript web application and connects directly to your Cloud SQL PostgreSQL database.
          </p>

          <div className="space-y-2">
            <div className="font-semibold text-sm">1. Run Desktop App in Development:</div>
            <div className="relative bg-black/90 text-green-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto border border-white/10">
              <pre>{`cd desktop\nnpm install\nnpm start`}</pre>
              <button
                onClick={() => copyCommand('cd desktop && npm install && npm start')}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-sm">2. Build Windows Installer (NSIS .exe):</div>
            <div className="relative bg-black/90 text-green-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto border border-white/10">
              <pre>{`npm run dist:win`}</pre>
            </div>
            <p className="text-[var(--tg-text-secondary)] text-[11px]">
              Generates a standalone <code className="font-mono">Telegram Desktop Setup 1.0.0.exe</code> in <code className="font-mono">desktop/dist-electron/</code>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-sm">3. Build macOS DMG & Linux AppImage:</div>
            <div className="bg-black/90 text-green-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto border border-white/10">
              <pre>{`npm run dist:mac\nnpm run dist:linux`}</pre>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--tg-sidebar-bg)] border border-[var(--tg-border)] text-[var(--tg-text-secondary)] text-[11px]">
            <span className="font-semibold text-[var(--tg-text)]">Security note:</span> Sandbox is enabled with <code className="font-mono">contextIsolation: true</code>, strictly preventing node integration in renderer processes.
          </div>
        </div>

        <div className="p-4 bg-[var(--tg-sidebar-bg)] border-t border-[var(--tg-border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] font-semibold text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
