'use client';

import React, { useState, useEffect } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { ConversationItem } from './types';
import { getTelegramAvatarColor, getInitials } from '@/lib/telegram-utils';

interface CallModalProps {
  conversation: ConversationItem;
  isVideo: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  conversation,
  isVideo: initialIsVideo,
  isOpen,
  onClose,
}) => {
  const [isVideo, setIsVideo] = useState(initialIsVideo);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState<'calling' | 'connected'>('calling');

  useEffect(() => {
    if (!isOpen) return;

    // Simulate answering after 2.5 seconds
    const answerTimer = setTimeout(() => {
      setCallState('connected');
    }, 2500);

    return () => {
      clearTimeout(answerTimer);
      setCallDuration(0);
      setCallState('calling');
    };
  }, [isOpen, initialIsVideo]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callState]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const remainingSecs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${remainingSecs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[560px] max-h-[90vh] bg-[#18222d] text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
        {/* Top bar */}
        <div className="p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              {isVideo ? 'Telegram Video Call' : 'Telegram Voice Call'}
            </span>
          </div>
          <div className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-full text-gray-300">
            {callState === 'calling' ? 'Calling...' : formatTimer(callDuration)}
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          {isVideo ? (
            <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center mb-4">
              <img
                src={
                  conversation.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
                }
                alt={conversation.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {/* Floating Pip self view */}
              <div className="absolute bottom-3 right-3 w-20 h-28 rounded-xl bg-gray-800 border-2 border-white/20 overflow-hidden shadow-lg flex items-center justify-center">
                <span className="text-[10px] text-gray-400">You</span>
              </div>
            </div>
          ) : (
            <div className="relative mb-6">
              {/* Pulsing ring animation */}
              <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute -inset-2 rounded-full bg-blue-500/30 animate-pulse" />
              {conversation.avatarUrl ? (
                <img
                  src={conversation.avatarUrl}
                  alt={conversation.title}
                  className="relative w-28 h-28 rounded-full object-cover shadow-2xl border-2 border-white/20"
                />
              ) : (
                <div
                  className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${getTelegramAvatarColor(
                    conversation.title
                  )} text-white font-bold text-3xl flex items-center justify-center shadow-2xl border-2 border-white/20`}
                >
                  {getInitials(conversation.title)}
                </div>
              )}
            </div>
          )}

          <h2 className="text-xl font-bold tracking-tight">{conversation.title}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {callState === 'calling'
              ? 'Ringing...'
              : `${isVideo ? 'HD Video • ' : ''}End-to-End Encryption Verified`}
          </p>
        </div>

        {/* Bottom controls */}
        <div className="p-6 bg-black/30 backdrop-blur-sm border-t border-white/10 flex items-center justify-around z-10">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-colors ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideo(!isVideo)}
            className={`p-3.5 rounded-full transition-colors ${
              isVideo ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isVideo ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-3.5 rounded-full transition-colors ${
              isSpeaker ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'
            }`}
            title="Speaker"
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End call button */}
          <button
            onClick={onClose}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
