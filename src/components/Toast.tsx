import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description: string;
  links?: { label: string; url: string }[];
}

interface ToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ messages, onRemove }: ToastProps) {
  return (
    <div className="fixed top-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {messages.map((msg) => (
          <ToastItem key={msg.id} message={msg} onRemove={() => onRemove(msg.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  message,
  onRemove,
}: {
  message: ToastMessage;
  onRemove: () => void;
  key?: string;
}) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 8000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="text-green-400" size={18} />,
    error: <AlertCircle className="text-red-400" size={18} />,
    info: <Info className="text-blue-400" size={18} />,
    warning: <AlertCircle className="text-yellow-400" size={18} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="pointer-events-auto w-80 bg-[#151619] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
    >
      <div className="p-4 flex gap-3">
        <div className="shrink-0 mt-0.5">{icons[message.type]}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white leading-tight">{message.title}</h4>
          <p className="text-xs text-white/50 mt-1 leading-relaxed">{message.description}</p>

          {message.links && message.links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-white/70 hover:text-white transition-colors flex items-center gap-1"
                >
                  {link.label} <ExternalLink size={8} />
                </a>
              ))}
            </div>
          )}
        </div>
        <button onClick={onRemove} className="shrink-0 text-white/20 hover:text-white">
          <X size={14} />
        </button>
      </div>
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 8, ease: 'linear' }}
        className={cn(
          'h-0.5 w-full',
          message.type === 'error'
            ? 'bg-red-500'
            : message.type === 'success'
              ? 'bg-green-500'
              : 'bg-purple-500'
        )}
      />
    </motion.div>
  );
}
