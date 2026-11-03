import React, { useState, useEffect } from 'react';
import { AnniversaryData, SpecialSurprise } from '../types';
import { loveDb } from '../utils/db';
import { romanticAudio } from '../utils/audio';
import { FloralDivider } from './FloralDecorations';
import { Heart, Gift, Edit3, Calendar, Clock, Sparkles, Check, Lock, Unlock } from 'lucide-react';

interface AnniversaryCountdownProps {
  initialData: AnniversaryData;
  onUpdate: (data: AnniversaryData) => void;
}

export const AnniversaryCountdown: React.FC<AnniversaryCountdownProps> = ({
  initialData,
  onUpdate,
}) => {
  const [data, setData] = useState<AnniversaryData>(initialData);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  const [daysTogether, setDaysTogether] = useState<number>(0);
  const [isEditingMessage, setIsEditingMessage] = useState<boolean>(false);
  const [tempMessage, setTempMessage] = useState<string>(initialData.customMessage);
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<string>(initialData.anniversaryDate.split('T')[0]);
  const [tempMetDate, setTempMetDate] = useState<string>(initialData.firstMetDate || '2024-10-12');
  
  // Surprise state
  const [activeSurprise, setActiveSurprise] = useState<SpecialSurprise | null>(
    initialData.surprises[0] || null
  );
  const [isEditingSurprise, setIsEditingSurprise] = useState<boolean>(false);
  const [surpriseTitle, setSurpriseTitle] = useState<string>('');
  const [surpriseLetter, setSurpriseLetter] = useState<string>('');
  const [surpriseHint, setSurpriseHint] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Sync when initialData changes
  useEffect(() => {
    setData(initialData);
    setTempMessage(initialData.customMessage);
    setTempDate(initialData.anniversaryDate.split('T')[0]);
    if (initialData.surprises.length > 0) {
      setActiveSurprise(initialData.surprises[0]);
    }
  }, [initialData]);

  // Real-time ticking timer
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(data.anniversaryDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      // Also calculate days together from firstMetDate
      const metTarget = new Date(data.firstMetDate || '2024-10-12').getTime();
      const diffTogether = Math.max(0, now - metTarget);
      setDaysTogether(Math.floor(diffTogether / (1000 * 60 * 60 * 24)));

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      } else {
        // Target date reached or passed
        const pastDiff = Math.abs(difference);
        const days = Math.floor(pastDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((pastDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((pastDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((pastDiff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPast: true });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data.anniversaryDate, data.firstMetDate]);

  const showTemporaryNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleSaveMessage = async () => {
    const updated = { ...data, customMessage: tempMessage };
    setData(updated);
    await loveDb.saveAnniversaryData(updated);
    onUpdate(updated);
    setIsEditingMessage(false);
    romanticAudio.playJournalSaved();
    showTemporaryNotice('Anniversary message updated successfully!');
  };

  const handleSaveDates = async () => {
    const updated = {
      ...data,
      anniversaryDate: `${tempDate}T00:00:00`,
      firstMetDate: tempMetDate,
    };
    setData(updated);
    await loveDb.saveAnniversaryData(updated);
    onUpdate(updated);
    setIsEditingDate(false);
    romanticAudio.playJournalSaved();
    showTemporaryNotice('Anniversary countdown target updated!');
  };

  const handleRevealSurprise = async () => {
    if (!activeSurprise) return;
    romanticAudio.playLoveYesChime();
    const updatedSurprise: SpecialSurprise = {
      ...activeSurprise,
      revealed: true,
    };
    const updatedSurprises = data.surprises.map((s) =>
      s.id === updatedSurprise.id ? updatedSurprise : s
    );
    const updated = { ...data, surprises: updatedSurprises };
    setData(updated);
    setActiveSurprise(updatedSurprise);
    await loveDb.saveAnniversaryData(updated);
    onUpdate(updated);
  };

  const handleStartEditSurprise = () => {
    if (activeSurprise) {
      setSurpriseTitle(activeSurprise.title);
      setSurpriseLetter(activeSurprise.letter);
      setSurpriseHint(activeSurprise.giftHint || '');
    }
    setIsEditingSurprise(true);
  };

  const handleSaveSurprise = async () => {
    const updatedSurprise: SpecialSurprise = {
      id: activeSurprise?.id || `surprise-${Date.now()}`,
      title: surpriseTitle.trim() || 'A Secret Romantic Surprise',
      revealed: activeSurprise?.revealed ?? false,
      letter: surpriseLetter.trim(),
      secretPromise: activeSurprise?.secretPromise || 'Forever my priority',
      giftHint: surpriseHint.trim(),
    };

    const updatedSurprises = [updatedSurprise];
    const updated = { ...data, surprises: updatedSurprises };
    setData(updated);
    setActiveSurprise(updatedSurprise);
    await loveDb.saveAnniversaryData(updated);
    onUpdate(updated);
    setIsEditingSurprise(false);
    romanticAudio.playJournalSaved();
    showTemporaryNotice('Special surprise updated for Ambika!');
  };

  const WREATH_IMG = '/src/assets/images/floral_anniversary_wreath_1793693790231.jpg';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Toast Notice */}
      {savedNotice && (
        <div className="fixed top-20 right-6 z-50 bg-rose-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* TOP FLORAL HEADER & BRANDING */}
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.3em] font-medium text-rose-800/80 block mb-1">
          Forever & Always · Milestone Tracker
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-rose-950 tracking-tight">
          Ambika Rimal & Love
        </h2>
        <p className="text-rose-900/70 font-serif italic text-base mt-2">
          "Every second since the day we met has been the best chapter of my story."
        </p>
      </div>

      {/* WREATH & LIVE TICKING COUNTDOWN HERO */}
      <div className="relative bg-white/90 backdrop-blur-sm border border-rose-100 rounded-3xl p-6 md:p-10 shadow-xl shadow-rose-950/5 text-center overflow-hidden mb-12">
        {/* Soft background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Center Floral Monogram Wreath */}
        <div className="relative w-40 h-40 md:w-52 md:h-52 mx-auto mb-6 rounded-full overflow-hidden shadow-md border-4 border-white/80">
          <img
            src={WREATH_IMG}
            alt="Ambika Rimal Floral Anniversary Wreath"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/50 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
            <span className="text-[11px] uppercase tracking-wider font-sans font-medium">Ambika Rimal</span>
            <span className="text-xs font-serif italic">Our Eternal Vow</span>
          </div>
        </div>

        {/* Header indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-800 text-xs font-medium mb-4">
          <Clock className="w-3.5 h-3.5 text-rose-600" />
          <span>
            {timeLeft.isPast
              ? 'Celebrating Our Anniversary Every Day!'
              : 'Counting Down to Our Next Anniversary'}
          </span>
        </div>

        {/* 4-Zone Live Countdown Clock */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-xl mx-auto mb-6">
          <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-3 sm:p-5">
            <div className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-rose-950 tabular-nums">
              {timeLeft.days}
            </div>
            <div className="text-[11px] sm:text-xs font-sans uppercase tracking-wider text-rose-800/80 mt-1">
              Days
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-3 sm:p-5">
            <div className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-rose-950 tabular-nums">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[11px] sm:text-xs font-sans uppercase tracking-wider text-rose-800/80 mt-1">
              Hours
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-3 sm:p-5">
            <div className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-rose-950 tabular-nums">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[11px] sm:text-xs font-sans uppercase tracking-wider text-rose-800/80 mt-1">
              Minutes
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-3 sm:p-5">
            <div className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-rose-600 tabular-nums">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[11px] sm:text-xs font-sans uppercase tracking-wider text-rose-800/80 mt-1">
              Seconds
            </div>
          </div>
        </div>

        {/* Days Together Milestone Stat */}
        <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-slate-600 font-sans">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 inline" />
          <span>
            Together for <strong className="text-rose-950 font-semibold tabular-nums">{daysTogether}</strong> radiant days of love and counting
          </span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setIsEditingDate(!isEditingDate)}
            className="text-rose-700 hover:text-rose-900 underline text-xs font-medium cursor-pointer"
          >
            {isEditingDate ? 'Cancel' : 'Change Date'}
          </button>
        </div>

        {/* Date Edit Form */}
        {isEditingDate && (
          <div className="mt-6 pt-6 border-t border-rose-100 max-w-md mx-auto text-left bg-rose-50/40 p-4 rounded-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-900 mb-3">
              Customize Important Milestone Dates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Upcoming Anniversary</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">First Day We Met / Fell in Love</label>
                <input
                  type="date"
                  value={tempMetDate}
                  onChange={(e) => setTempMetDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveDates}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Save Milestone Dates
            </button>
          </div>
        )}
      </div>

      <FloralDivider label="A Sacred Vow" />

      {/* CUSTOM ANNIVERSARY MESSAGE SECTION */}
      <div className="bg-white/80 border border-rose-100 rounded-3xl p-6 md:p-8 shadow-sm mb-12 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-100" />
            <h3 className="text-xl md:text-2xl font-serif font-bold text-rose-950">
              Custom Anniversary Message for Ambika
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingMessage(!isEditingMessage)}
            className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-medium px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingMessage ? 'Close' : 'Edit Message'}</span>
          </button>
        </div>

        {!isEditingMessage ? (
          <div className="relative p-6 bg-[#FCF9F5] border border-rose-200/50 rounded-2xl">
            <span className="text-4xl text-rose-300 font-serif leading-none absolute top-2 left-4 select-none">
              “
            </span>
            <p className="text-slate-800 font-serif text-lg md:text-xl leading-relaxed italic pl-6 pr-4 py-2 whitespace-pre-line">
              {data.customMessage}
            </p>
            <div className="text-right mt-3 text-xs font-sans text-rose-900/70 font-medium">
              — Written with unconditional devotion for Ambika Rimal
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-xs font-medium text-slate-700">
              Express your love, vows, or future promises:
            </label>
            <textarea
              rows={5}
              value={tempMessage}
              onChange={(e) => setTempMessage(e.target.value)}
              className="w-full p-4 bg-white border border-rose-200 rounded-xl font-serif text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Write a sweet anniversary message for Ambika..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingMessage(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMessage}
                className="px-5 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Save Anniversary Message
              </button>
            </div>
          </div>
        )}
      </div>

      <FloralDivider label="A Special Surprise" />

      {/* SPECIAL SURPRISE VAULT FOR HER */}
      <div className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 border-2 border-rose-200/80 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-sans uppercase tracking-widest text-rose-700 font-semibold block">
                Reserved Exclusively For Her
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-rose-950">
                {activeSurprise?.title || 'Special Surprise for Ambika'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartEditSurprise}
            className="self-start sm:self-auto text-xs text-rose-800 hover:text-rose-950 font-medium px-3 py-1.5 bg-white border border-rose-200 rounded-lg shadow-2xs hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Customize Surprise
          </button>
        </div>

        {/* Surprise Editing Mode */}
        {isEditingSurprise ? (
          <div className="bg-white p-5 rounded-2xl border border-rose-200 space-y-4">
            <h4 className="text-sm font-semibold text-rose-950">Customize Surprise for Ambika</h4>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Surprise Title</label>
              <input
                type="text"
                value={surpriseTitle}
                onChange={(e) => setSurpriseTitle(e.target.value)}
                placeholder="e.g. A Secret Getaway, A Golden Locket, or A Romantic Letter"
                className="w-full text-sm p-2.5 bg-slate-50 border border-rose-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Secret Love Letter / Reveal Content</label>
              <textarea
                rows={6}
                value={surpriseLetter}
                onChange={(e) => setSurpriseLetter(e.target.value)}
                placeholder="Write the intimate reveal letter or details of the surprise..."
                className="w-full text-sm p-2.5 bg-slate-50 border border-rose-200 rounded-lg font-serif"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Hidden Clue / Gift Hint</label>
              <input
                type="text"
                value={surpriseHint}
                onChange={(e) => setSurpriseHint(e.target.value)}
                placeholder="e.g. Look behind our framed photo in the living room..."
                className="w-full text-sm p-2.5 bg-slate-50 border border-rose-200 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingSurprise(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSurprise}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg"
              >
                Save Surprise
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!activeSurprise?.revealed ? (
              /* UNREVEALED WAX SEAL ENVELOPE */
              <div className="text-center py-8 px-4 bg-white/70 border border-dashed border-rose-300 rounded-2xl relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 cursor-pointer transform hover:scale-105 active:scale-95 transition-transform" onClick={handleRevealSurprise}>
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-serif font-bold text-rose-950 mb-1">
                  Sealed with an Eternal Wax Stamp
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mb-5">
                  A special surprise has been prepared just for you, Ambika. Tap below to unseal your gift and letter.
                </p>
                <button
                  type="button"
                  onClick={handleRevealSurprise}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-full shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4 text-rose-200" />
                  <span>Break the Seal & Open Surprise</span>
                </button>
              </div>
            ) : (
              /* REVEALED SURPRISE LETTER */
              <div className="bg-[#FAF6F0] border border-rose-200 p-6 md:p-8 rounded-2xl relative animate-in fade-in duration-500">
                <div className="flex items-center justify-between pb-4 border-b border-rose-200 mb-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Surprise Unsealed for Ambika</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!activeSurprise) return;
                      const resealed = { ...activeSurprise, revealed: false };
                      const updated = { ...data, surprises: [resealed] };
                      setData(updated);
                      setActiveSurprise(resealed);
                      await loveDb.saveAnniversaryData(updated);
                      onUpdate(updated);
                    }}
                    className="text-xs text-rose-700 hover:underline"
                  >
                    Reseal Envelope
                  </button>
                </div>

                <div className="font-serif text-slate-800 text-base md:text-lg leading-relaxed whitespace-pre-line mb-6">
                  {activeSurprise.letter}
                </div>

                {activeSurprise.giftHint && (
                  <div className="bg-white/80 border border-amber-200/80 p-4 rounded-xl flex items-start gap-3">
                    <Gift className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs font-semibold uppercase tracking-wider text-amber-900 block">
                        Secret Gift Clue
                      </strong>
                      <p className="text-xs text-slate-700 mt-0.5">{activeSurprise.giftHint}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
