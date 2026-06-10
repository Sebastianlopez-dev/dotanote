import React, { useState } from 'react';
import { Book, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface DictionaryViewProps {
  words: string[];
  onAdd: (word: string) => void;
  onRemove: (word: string) => void;
  onClose: () => void;
}

export function DictionaryView({ words, onAdd, onRemove, onClose }: DictionaryViewProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Book size={18} className="text-white/70" />
          <h1 className="text-lg font-bold text-white tracking-tight">Dictionary</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <p className="text-sm text-white/50">
          Custom words the AI should recognize and transcribe exactly.
        </p>

        {/* Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a word..."
            className="flex-1 h-10 px-3 bg-[#151619] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className={cn(
              'flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium transition-colors',
              inputValue.trim()
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            )}
          >
            <Plus size={16} className="mr-1" />
            Add
          </button>
        </div>

        {/* Words List */}
        <div className="space-y-2">
          <AnimatePresence>
            {words.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Book size={20} className="text-white/30" />
                </div>
                <p className="text-sm text-white/40 max-w-xs">
                  No custom words yet. Add names, technical terms, or jargon the AI often gets wrong.
                </p>
              </motion.div>
            ) : (
              words.map((word) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 bg-[#151619] border border-white/5 rounded-lg group"
                >
                  <span className="text-sm text-white/90 capitalize">{word}</span>
                  <button
                    onClick={() => onRemove(word)}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
