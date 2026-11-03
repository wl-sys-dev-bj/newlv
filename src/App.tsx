import React, { useState, useEffect } from 'react';
import { JournalEntry, MemoryItem, AnniversaryData, ReminderConfig } from './types';
import { loveDb } from './utils/db';
import { checkAndTriggerDailyReminder } from './utils/notifications';
import { FloralFloatingPetals, FloralCornerFlourish } from './components/FloralDecorations';
import { DoYouLoveMeGate } from './components/DoYouLoveMeGate';
import { TopNav } from './components/TopNav';
import { AnniversaryCountdown } from './components/AnniversaryCountdown';
import { DailyJournal } from './components/DailyJournal';
import { SharedMemories } from './components/SharedMemories';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';
import { Heart, Sparkles, Flower2 } from 'lucide-react';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ambika_sanctuary_unlocked') === 'true';
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<'journal' | 'anniversary' | 'memories'>('journal');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [anniversaryData, setAnniversaryData] = useState<AnniversaryData | null>(null);
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [petalsEnabled, setPetalsEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load database on startup
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [entries, mems, anni, rem] = await Promise.all([
          loveDb.getJournalEntries(),
          loveDb.getMemories(),
          loveDb.getAnniversaryData(),
          loveDb.getReminderConfig(),
        ]);

        if (mounted) {
          setJournalEntries(entries);
          setMemories(mems);
          setAnniversaryData(anni);
          setReminderConfig(rem);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load love sanctuary database:', err);
        if (mounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Periodic reminder checker every 60 seconds
  useEffect(() => {
    if (!reminderConfig || !reminderConfig.enabled) return;

    // Run initial check
    checkAndTriggerDailyReminder(reminderConfig);

    const interval = setInterval(() => {
      if (reminderConfig && reminderConfig.enabled) {
        const didTrigger = checkAndTriggerDailyReminder(reminderConfig);
        if (didTrigger) {
          const today = new Date().toISOString().split('T')[0];
          const updated = { ...reminderConfig, lastNotifiedDate: today };
          setReminderConfig(updated);
          loveDb.saveReminderConfig(updated);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [reminderConfig]);

  const handleUnlock = () => {
    sessionStorage.setItem('ambika_sanctuary_unlocked', 'true');
    setIsUnlocked(true);
    setActiveTab('journal');
  };

  const handleUnlockAndGoToAnniversary = () => {
    sessionStorage.setItem('ambika_sanctuary_unlocked', 'true');
    setIsUnlocked(true);
    setActiveTab('anniversary');
  };

  const handleRelockGate = () => {
    sessionStorage.removeItem('ambika_sanctuary_unlocked');
    setIsUnlocked(false);
  };

  const HERO_FLORAL_IMG = '/src/assets/images/floral_hero_romantic_1793693789392.jpg';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-4">
        <Heart className="w-10 h-10 text-rose-500 fill-rose-300 animate-pulse mb-3" />
        <span className="font-serif italic text-rose-950 text-lg">
          Unfolding Ambika's Love Sanctuary...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-slate-800 relative selection:bg-rose-200 selection:text-rose-900">
      {/* Floating Rose Petals Animation */}
      <FloralFloatingPetals enabled={petalsEnabled} />

      {/* Decorative Corner Botanical Flourishes */}
      <FloralCornerFlourish position="top-left" />
      <FloralCornerFlourish position="top-right" />

      {/* If not unlocked, display the playful "Do you love me?" gate */}
      {!isUnlocked ? (
        <DoYouLoveMeGate
          onUnlock={handleUnlock}
          onGoToAnniversary={handleUnlockAndGoToAnniversary}
        />
      ) : (
        /* UNLOCKED FULL SANCTUARY */
        <div className="relative z-20 flex flex-col min-h-screen">
          {/* Top Bar Navigation */}
          <TopNav
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenReminders={() => setIsReminderModalOpen(true)}
            onRelockGate={handleRelockGate}
          />

          {/* Hero Banner with Floral Motif */}
          <div className="relative h-44 sm:h-52 md:h-64 overflow-hidden border-b border-rose-200/60 bg-amber-50">
            <img
              src={HERO_FLORAL_IMG}
              alt="Ambika Rimal Floral Botanical Reverie"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/40 to-black/20" />
            
            <div className="absolute bottom-4 left-0 right-0 max-w-7xl mx-auto px-4 md:px-8 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-rose-800 font-semibold block">
                  Dedicated With Love
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-rose-950 tracking-tight">
                  AMBIKA RIMAL
                </h1>
              </div>

              {/* Floating petals toggle */}
              <button
                type="button"
                onClick={() => setPetalsEnabled(!petalsEnabled)}
                className="text-xs bg-white/80 backdrop-blur-xs hover:bg-white text-rose-900 border border-rose-200 px-3 py-1.5 rounded-full shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Toggle floating rose petals"
              >
                <Flower2 className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">
                  {petalsEnabled ? 'Pause Petals' : 'Float Petals'}
                </span>
              </button>
            </div>
          </div>

          {/* MAIN WORKSPACE CONTENT */}
          <main className="flex-1 pb-16">
            {activeTab === 'journal' && (
              <DailyJournal
                entries={journalEntries}
                onEntriesChange={setJournalEntries}
              />
            )}

            {activeTab === 'anniversary' && anniversaryData && (
              <AnniversaryCountdown
                initialData={anniversaryData}
                onUpdate={setAnniversaryData}
              />
            )}

            {activeTab === 'memories' && (
              <SharedMemories
                memories={memories}
                onMemoriesChange={setMemories}
              />
            )}
          </main>

          {/* PUSH NOTIFICATION REMINDERS MODAL */}
          {reminderConfig && (
            <ReminderSettingsModal
              isOpen={isReminderModalOpen}
              onClose={() => setIsReminderModalOpen(false)}
              config={reminderConfig}
              onConfigChange={setReminderConfig}
            />
          )}

          {/* LUXURY EDITORIAL FOOTER */}
          <footer className="mt-auto border-t border-rose-200/80 bg-white/60 py-8 px-4 text-center text-xs text-rose-950/70 font-sans">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex items-center justify-center gap-2 font-serif text-sm text-rose-950 font-semibold tracking-wider uppercase">
                <span>❦</span>
                <span>Ambika Rimal · Eternal Love Sanctuary</span>
                <span>❧</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Built with unconditional devotion. Every daily entry, photograph, and memory is preserved in your private sanctuary.
              </p>
              <div className="flex items-center justify-center gap-4 text-slate-400 text-[11px] pt-1">
                <span>Daily Love Chronicle</span>
                <span>·</span>
                <span>Interactive Anniversary Countdown</span>
                <span>·</span>
                <span>Push Reminders Enabled</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
