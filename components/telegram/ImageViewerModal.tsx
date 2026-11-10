'use client';

import React from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string | null;
  imageName?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  imageName,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-150">
      {/* Top action bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <a
          href={imageUrl}
          download={imageName || 'telegram-image.jpg'}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={imageName || 'Full preview'}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
        />
      </div>

      {imageName && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1.5 rounded-full text-xs text-gray-300 font-mono">
          {imageName}
        </div>
      )}
    </div>
  );
};
