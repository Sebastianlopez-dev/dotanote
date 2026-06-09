import { Mic, Zap, Pin, Copy, Trash2, Sparkles, Loader2, Upload, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { TranscriptionResult } from '../services/transcription';
import { MagicFormat } from '../types';

interface TranscriptFeedProps {
  history: TranscriptionResult[];
  isRecording: boolean;
  toggleRecording: () => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  onEnhance: (id: string, formatId?: string) => void;
  copiedId: string | null;
  onUploadClick?: () => void;
  isProcessingFile?: boolean;
  magicFormats?: MagicFormat[];
}

export function TranscriptFeed({
  history,
  isRecording,
  toggleRecording,
  onPin,
  onDelete,
  onCopy,
  onEnhance,
  copiedId,
  onUploadClick,
  isProcessingFile,
  magicFormats = [],
}: TranscriptFeedProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const sortedHistory = [...history].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });

  const pinnedFormats = magicFormats.filter((f) => f.isPinned && !f.isDefault).slice(0, 3);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent @container">
      <header className="px-8 pb-8 pt-6 safe-pt border-b border-white/5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">dotanote</h1>
          <p className="text-sm text-white/50 mt-1 truncate">
            {isRecording ? 'Listening...' : 'Ready to transcribe'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              disabled={isProcessingFile || isRecording}
              className="flex items-center justify-center gap-2 w-10 h-10 @[500px]:w-auto @[500px]:h-auto @[500px]:px-4 @[500px]:py-2 rounded-full transition-colors bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Subir archivo de audio (Max 10MB)"
            >
              {isProcessingFile ? (
                <Loader2 size={18} className="animate-spin shrink-0" />
              ) : (
                <Upload size={18} className="shrink-0" />
              )}
              <span className="hidden @[500px]:inline whitespace-nowrap">
                {isProcessingFile ? 'Procesando...' : 'Subir Audio'}
              </span>
            </button>
          )}
          <button
            onClick={toggleRecording}
            disabled={isProcessingFile}
            className={cn(
              'flex items-center justify-center gap-2 w-10 h-10 @[500px]:w-auto @[500px]:h-auto @[500px]:px-4 @[500px]:py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0',
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white text-black hover:bg-white/90'
            )}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <Mic size={18} className="shrink-0" />
            <span className="hidden @[500px]:inline whitespace-nowrap">
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar safe-pb">
        {isProcessingFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141414] border border-purple-500/30 p-6 rounded-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Loader2 size={20} className="text-purple-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-white font-medium">Procesando archivo de audio...</h3>
              <p className="text-white/50 text-sm">Extrayendo texto y aplicando formato mágico.</p>
            </div>
          </motion.div>
        )}

        {sortedHistory.length === 0 && !isProcessingFile ? (
          <div className="text-center text-white/30 mt-20 flex flex-col items-center gap-4">
            <Mic size={48} className="opacity-20" />
            <p>No transcriptions yet</p>
            <p className="text-sm">
              Presiona "Start Recording" o arrastra un archivo de audio aquí.
            </p>
          </div>
        ) : (
          sortedHistory.map((item) => (
            <div
              key={item.id}
              className={cn(
                'p-4 rounded-xl border transition-all duration-300',
                item.isPinned
                  ? 'bg-white/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)] scale-[1.01]'
                  : 'bg-white/5 border-white/5'
              )}
            >
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                <div className="flex gap-2">
                  <div className="relative flex items-center">
                    <button
                      onClick={() => onEnhance(item.id)}
                      disabled={item.isEnhancing || !!item.enhancedText}
                      className={cn(
                        'transition-colors flex items-center justify-center',
                        item.enhancedText
                          ? 'text-purple-500'
                          : 'text-white/40 hover:text-purple-400',
                        item.isEnhancing && 'cursor-not-allowed',
                        pinnedFormats.length > 0 ? 'pr-1' : ''
                      )}
                      title="Magic Format (Default)"
                    >
                      {item.isEnhancing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                    </button>

                    {pinnedFormats.length > 0 && !item.enhancedText && !item.isEnhancing && (
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === item.id ? null : item.id)
                        }
                        className="pl-1 border-l border-white/10 hover:text-purple-400 transition-colors text-white/40"
                      >
                        <ChevronDown size={14} />
                      </button>
                    )}

                    <AnimatePresence>
                      {activeDropdown === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
                        >
                          {pinnedFormats.map((format) => (
                            <button
                              key={format.id}
                              onClick={() => {
                                onEnhance(item.id, format.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                            >
                              {format.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={() => onPin(item.id)}
                    className={cn(
                      'hover:text-white transition-colors',
                      item.isPinned ? 'text-yellow-500' : 'text-white/40'
                    )}
                  >
                    <motion.div animate={{ rotate: item.isPinned ? 45 : 0 }}>
                      <Pin size={16} />
                    </motion.div>
                  </button>
                  <button
                    onClick={() => onCopy(item.text, item.id)}
                    className="hover:text-white transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Zap size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <p
                  className={cn(
                    'text-white transition-all',
                    item.enhancedText && 'text-white/40 text-xs italic'
                  )}
                >
                  {item.text}
                </p>
                {item.metadata && (
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border',
                        item.metadata.providerName === 'Groq'
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          : item.metadata.providerName === 'Gemini'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : item.metadata.providerName === 'Anthropic'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : item.metadata.providerName === 'Qwen'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : item.metadata.providerName === 'OpenRouter'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  : 'bg-white/5 text-white/40 border-white/10'
                      )}
                    >
                      via {item.metadata.providerName}
                    </div>
                    <span className="text-[9px] text-white/20 font-mono italic">
                      {item.metadata.modelName}
                    </span>
                  </div>
                )}
                {item.enhancedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} className="text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        Magic Format
                      </span>
                    </div>
                    <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                      {item.enhancedText}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
