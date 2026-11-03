import React from 'react';
import { Heart, Bell, Lock } from 'lucide-react';

interface TopNavProps {
  activeTab: 'journal' | 'anniversary' | 'memories';
  onSelectTab: (tab: 'journal' | 'anniversary' | 'memories') => void;
  onOpenReminders: () => void;
  onRelockGate: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenReminders,
  onRelockGate,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-rose-200/60 px-4 md:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <button
          type="button"
          onClick={() => onSelectTab('journal')}
          className="text-lg md:text-xl font-serif font-bold tracking-widest text-rose-950 uppercase whitespace-nowrap shrink-0 hover:text-rose-700 transition-colors cursor-pointer"
        >
          AMBIKA RIMAL
        </button>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-700">
          <button
            type="button"
            onClick={() => onSelectTab('journal')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'journal'
                ? 'border-rose-600 text-rose-950 font-semibold'
                : 'border-transparent text-slate-600 hover:text-rose-900'
            }`}
          >
            Daily Journal
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('anniversary')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'anniversary'
                ? 'border-rose-600 text-rose-950 font-semibold'
                : 'border-transparent text-slate-600 hover:text-rose-900'
            }`}
          >
            Anniversary & Surprise
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('memories')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'memories'
                ? 'border-rose-600 text-rose-950 font-semibold'
                : 'border-transparent text-slate-600 hover:text-rose-900'
            }`}
          >
            Shared Memories
          </button>

          <button
            type="button"
            onClick={onOpenReminders}
            className="whitespace-nowrap shrink-0 text-slate-600 hover:text-rose-900 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-rose-600" />
            <span>Reminders</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenReminders}
            className="md:hidden p-2 text-rose-800 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            title="Notification Reminders"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onRelockGate}
            className="px-3.5 py-2 text-xs font-medium text-rose-900 bg-rose-100/70 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Lock and replay 'Do You Love Me?' gate"
          >
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Replay Love Gate</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-tabs for narrow screens */}
      <div className="md:hidden flex items-center justify-around pt-2.5 mt-2 border-t border-rose-100 text-xs text-slate-600">
        <button
          type="button"
          onClick={() => onSelectTab('journal')}
          className={`pb-1 font-medium ${
            activeTab === 'journal' ? 'text-rose-900 font-semibold border-b-2 border-rose-600' : ''
          }`}
        >
          Daily Journal
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('anniversary')}
          className={`pb-1 font-medium ${
            activeTab === 'anniversary' ? 'text-rose-900 font-semibold border-b-2 border-rose-600' : ''
          }`}
        >
          Anniversary
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('memories')}
          className={`pb-1 font-medium ${
            activeTab === 'memories' ? 'text-rose-900 font-semibold border-b-2 border-rose-600' : ''
          }`}
        >
          Memories
        </button>
      </div>
    </header>
  );
};
