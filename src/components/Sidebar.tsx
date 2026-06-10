import React from 'react';
import {
  Home,
  Book,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AIConfig } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onNavigate: (view: 'home' | 'settings' | 'dictionary') => void;
  aiConfig: AIConfig;
}

export function Sidebar({ isOpen, setIsOpen, onNavigate, aiConfig }: SidebarProps) {
  return (
    <div
      className={cn(
        'bg-[#151619]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col transition-all duration-300 relative z-40 safe-pt safe-pb',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Toggle Handle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-1 bg-[#151619] border border-white/5 rounded-full text-white/50 hover:text-white z-10"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className={cn('flex items-center', isOpen ? 'p-4' : 'p-4 justify-center')}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/5 border border-white/10 backdrop-blur-md rounded flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
            </div>
            <span className="font-bold text-white tracking-tight">dotanote</span>
          </div>
        ) : (
          <div className="w-6 h-6 bg-white/5 border border-white/10 backdrop-blur-md rounded flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
          </div>
        )}
      </div>

      <nav className={cn('flex-1 space-y-2', isOpen ? 'p-4' : 'p-2')}>
        <NavItem
          icon={<Home size={18} />}
          label="Home"
          isOpen={isOpen}
          onClick={() => onNavigate('home')}
        />
        <NavItem icon={<Book size={18} />} label="Dictionary" isOpen={isOpen} onClick={() => onNavigate('dictionary')} />
      </nav>

      <div className={cn('space-y-2 border-t border-white/5', isOpen ? 'p-4' : 'p-2')}>
        <NavItem
          icon={<Settings size={18} />}
          label="Settings"
          isOpen={isOpen}
          onClick={() => onNavigate('settings')}
        />
        <NavItem icon={<HelpCircle size={18} />} label="Help" isOpen={isOpen} onClick={() => {}} />
        <div className={cn('mt-4', !isOpen && 'hidden')}>
          <button className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg">
            Get a free month
          </button>
        </div>
      </div>

      {/* AI Status Indicator */}
      <div className={cn('mt-auto border-t border-white/5', isOpen ? 'p-4' : 'p-2')}>
        <div
          className={cn(
            'flex items-center rounded-xl p-2 transition-all duration-500',
            aiConfig.useCustomKeys
              ? 'bg-purple-500/10 text-purple-400'
              : 'bg-white/5 text-white/40',
            !isOpen && 'justify-center'
          )}
        >
          {aiConfig.useCustomKeys ? (
            <Zap size={isOpen ? 14 : 16} />
          ) : (
            <ShieldCheck size={isOpen ? 14 : 16} />
          )}
          {isOpen && (
            <div className="ml-2 overflow-hidden">
              <div className="text-[10px] font-bold uppercase tracking-wider leading-none">
                {aiConfig.useCustomKeys ? 'Custom API' : 'Standard'}
              </div>
              <div className="text-[8px] opacity-70 mt-0.5 truncate">
                {aiConfig.useCustomKeys ? 'Personal Keys' : 'Developer Mode'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  isOpen,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center hover:bg-white/5 rounded-xl text-white/70 hover:text-white transition-colors',
        isOpen ? 'p-3 gap-4' : 'p-3 justify-center'
      )}
    >
      <div className="flex-shrink-0 flex items-center justify-center">{icon}</div>
      {isOpen && <span className="text-sm truncate">{label}</span>}
    </button>
  );
}
