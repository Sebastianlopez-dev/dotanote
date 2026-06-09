import { ChevronRight, Info } from 'lucide-react';
import { TranscriptionResult } from '../services/transcription';

interface StatsDashboardProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  history: TranscriptionResult[];
}

export function StatsDashboard({ isOpen, setIsOpen, history }: StatsDashboardProps) {
  // Calculate total words
  const totalWords = history.reduce((acc, item) => {
    return acc + item.text.split(/\s+/).filter((w) => w.length > 0).length;
  }, 0);

  // Calculate Magic Formats applied
  const magicFormatsApplied = history.filter((item) => item.enhancedText).length;

  // Calculate Time Saved
  // Writing: 40 wpm. Speaking: 150 wpm.
  const writingTime = totalWords / 40;
  const speakingTime = totalWords / 150;
  const timeSavedMinutes = Math.max(0, Math.round(writingTime - speakingTime));

  const formatTime = (minutes: number) => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  return (
    <div className="w-80 bg-[#151619]/80 backdrop-blur-3xl border-l border-white/5 px-6 pb-6 safe-pt safe-pb h-full flex flex-col relative overflow-y-auto z-40 no-scrollbar">
      {/* Toggle Handle */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-1 bg-[#151619] border border-white/5 rounded-full text-white/50 hover:text-white"
      >
        <ChevronRight size={16} />
      </button>

      <h2 className="text-white font-bold mb-8">Dashboard</h2>

      {/* Metrics Section */}
      <div className="space-y-6 mb-12 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Total words</span>
            <div className="relative group flex items-center">
              <Info
                size={14}
                className="text-white/30 hover:text-white/70 cursor-help transition-colors"
              />
              <div className="absolute top-full mt-2 -left-2 w-48 p-2 bg-[#1a1a1a] border border-white/10 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <p className="text-xs text-white/70 leading-relaxed">
                  Total number of words transcribed across all your notes.
                </p>
              </div>
            </div>
          </div>
          <span className="text-white font-mono font-medium text-lg">
            {formatNumber(totalWords)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Magic Formats</span>
            <div className="relative group flex items-center">
              <Info
                size={14}
                className="text-white/30 hover:text-white/70 cursor-help transition-colors"
              />
              <div className="absolute top-full mt-2 -left-2 w-48 p-2 bg-[#1a1a1a] border border-white/10 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <p className="text-xs text-white/70 leading-relaxed">
                  Number of times you've used AI to enhance and format your notes.
                </p>
              </div>
            </div>
          </div>
          <span className="text-white font-mono font-medium text-lg">{magicFormatsApplied}</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Time saved</span>
            <div className="relative group flex items-center">
              <Info
                size={14}
                className="text-white/30 hover:text-white/70 cursor-help transition-colors"
              />
              <div className="absolute top-full mt-2 -left-2 w-64 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <p className="text-xs text-white/70 leading-relaxed">
                  <strong className="text-white">How is this calculated?</strong>
                  <br />
                  Mathematically, the average person writes at 40 words per minute, but speaks at
                  150 words per minute. This metric shows the exact time you've saved by dictating
                  instead of typing.
                </p>
              </div>
            </div>
          </div>
          <span className="text-white font-mono font-medium text-lg text-green-400">
            {formatTime(timeSavedMinutes)}
          </span>
        </div>
      </div>

      {/* Profile Placeholder */}
      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div>
            <p className="text-white text-sm font-medium">User Name</p>
            <p className="text-white/50 text-xs">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
