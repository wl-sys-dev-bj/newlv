import React, { useState } from 'react';
import { JournalEntry, AuthorType } from '../types';
import { loveDb } from '../utils/db';
import { romanticAudio } from '../utils/audio';
import { FloralDivider } from './FloralDecorations';
import {
  Heart,
  Camera,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  Smile,
  X,
  Trash2,
  Share2,
  Clock,
  Search,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface DailyJournalProps {
  entries: JournalEntry[];
  onEntriesChange: (updated: JournalEntry[]) => void;
}

const DAILY_PROMPTS = [
  "What made you smile thinking of us today, Ambika?",
  "A sweet moment today I wish I could pause time on...",
  "One little thing about you that made my heart flutter today...",
  "What is our song or soundtrack for today?",
  "A quiet promise I am making to you for tomorrow...",
  "What made you feel most loved today?",
  "The funniest or cutest thing you did or said today...",
];

const MOODS = [
  { id: 'deeply-in-love', label: 'Deeply in Love', icon: '💖', color: 'text-rose-600' },
  { id: 'butterflies', label: 'Butterflies', icon: '🦋', color: 'text-sky-600' },
  { id: 'grateful', label: 'Grateful', icon: '✨', color: 'text-amber-600' },
  { id: 'missing-you', label: 'Missing You', icon: '💌', color: 'text-purple-600' },
  { id: 'tender', label: 'Tender & Sweet', icon: '🌸', color: 'text-pink-600' },
  { id: 'cozy', label: 'Warm & Cozy', icon: '☕', color: 'text-orange-600' },
] as const;

export const DailyJournal: React.FC<DailyJournalProps> = ({
  entries,
  onEntriesChange,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [date, setDate] = useState<string>(todayStr);
  const [author, setAuthor] = useState<AuthorType>('Ambika Rimal');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mood, setMood] = useState<JournalEntry['mood']>('deeply-in-love');
  const [loveScore, setLoveScore] = useState<number>(1000);
  const [location, setLocation] = useState<string>('Our Cozy World');
  const [weather, setWeather] = useState<string>('Sunshine & Love ☀️');
  const [photos, setPhotos] = useState<string[]>([]);
  const [activePromptIndex, setActivePromptIndex] = useState<number>(0);
  
  // Feed Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<'All' | AuthorType>('All');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Check file size limit (max 5MB per image)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Photo is too large (max 5MB). Please pick a smaller image.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      showToast('Please write a title or a thought before saving your love journal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        date,
        title: title.trim() || `Daily Love Note · ${date}`,
        content: content.trim(),
        author,
        mood,
        loveScore,
        photos,
        prompt: DAILY_PROMPTS[activePromptIndex],
        location: location.trim() || undefined,
        weather: weather.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await loveDb.saveJournalEntry(newEntry);
      const updated = [newEntry, ...entries.filter((en) => en.id !== newEntry.id)];
      onEntriesChange(updated);

      romanticAudio.playJournalSaved();
      showToast(`Today's entry saved into Ambika's love archive!`);

      // Reset form fields
      setTitle('');
      setContent('');
      setPhotos([]);
    } catch (err) {
      console.error(err);
      showToast('Could not save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal memory?')) {
      await loveDb.deleteJournalEntry(id);
      const updated = entries.filter((en) => en.id !== id);
      onEntriesChange(updated);
      showToast('Journal memory removed.');
    }
  };

  // Filtered list
  const filteredEntries = entries.filter((entry) => {
    const matchesAuthor = authorFilter === 'All' || entry.author === authorFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.date.includes(searchQuery);
    return matchesAuthor && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-rose-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & BRANDING */}
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-rose-800/80 block mb-1">
          Shared Daily Chronicle
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-rose-950 tracking-tight">
          Ambika Rimal · Daily Love Journal
        </h2>
        <p className="text-rose-900/70 font-serif italic text-base mt-2 max-w-lg mx-auto">
          "One shared entry for every single sunrise and sunset we share together."
        </p>
      </div>

      {/* DAILY PROMPT CARD */}
      <div className="bg-gradient-to-r from-rose-100/60 via-amber-50/70 to-rose-100/60 border border-rose-200/80 rounded-2xl p-4 md:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-200 flex items-center justify-center text-rose-800 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-sans uppercase tracking-widest text-rose-700 font-semibold block">
              Today's Love Prompt
            </span>
            <p className="text-sm md:text-base font-serif italic text-rose-950 font-medium">
              "{DAILY_PROMPTS[activePromptIndex]}"
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActivePromptIndex((prev) => (prev + 1) % DAILY_PROMPTS.length)}
          className="shrink-0 text-xs text-rose-800 hover:text-rose-950 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-2xs transition-colors cursor-pointer"
        >
          Another Prompt ↻
        </button>
      </div>

      {/* WRITE TODAY'S JOURNAL ENTRY FORM */}
      <div className="bg-white/95 border border-rose-100 rounded-3xl p-6 md:p-8 shadow-lg shadow-rose-950/5 mb-14 relative">
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-600" />
            <h3 className="text-xl md:text-2xl font-serif font-bold text-rose-950">
              Write Daily Entry
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-rose-900/80">
            <Calendar className="w-4 h-4 text-rose-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-rose-50/60 border border-rose-200 rounded-lg px-2.5 py-1 text-xs text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-400 font-sans"
            />
          </div>
        </div>

        <form onSubmit={handleSaveEntry} className="space-y-6">
          {/* Author Selector & Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Who is writing today */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Written Today By:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthor('Ambika Rimal')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    author === 'Ambika Rimal'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50/50 text-slate-700 border-rose-200 hover:bg-rose-100/60'
                  }`}
                >
                  <span>🌸</span>
                  <span>Ambika Rimal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthor('My Love')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    author === 'My Love'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50/50 text-slate-700 border-rose-200 hover:bg-rose-100/60'
                  }`}
                >
                  <span>💌</span>
                  <span>My Love</span>
                </button>
              </div>
            </div>

            {/* Mood selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Today's Love Mood:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                      mood === m.id
                        ? 'bg-rose-100 text-rose-900 border-rose-400 font-semibold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Headline for Today
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Your laugh on the phone, or a quiet rainy evening..."
              className="w-full px-4 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl text-slate-800 placeholder:text-slate-400 font-serif text-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Content / Love note body */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Dear Ambika / To My Love (Today's Entry)
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pour your heart onto the page... What happened today? What thoughts brought a smile to your face?"
              className="w-full p-4 bg-rose-50/20 border border-rose-200 rounded-xl text-slate-800 placeholder:text-slate-400 font-serif text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Optional context tags: Weather & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Location Tag</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Living room couch, Our kitchen, Paris in spirit"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Weather / Vibe</label>
              <input
                type="text"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="e.g. Rainy & cuddling, Warm golden sunshine"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
          </div>

          {/* Photo upload section with Polaroid styling */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-500" />
                <span>Upload Photos for Today's Memory</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} attached
              </span>
            </div>

            {/* Upload Area */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-2xs">
                <ImageIcon className="w-4 h-4 text-rose-600" />
                <span>Attach Photo(s)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500">
                Supports camera uploads, selfies, or moments captured together.
              </span>
            </div>

            {/* Uploaded photo polaroid preview strip */}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-rose-100">
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-white p-2.5 pb-6 rounded-md shadow-md border border-slate-200 rotate-[-1deg] hover:rotate-0 transition-transform duration-200"
                  >
                    <img
                      src={src}
                      alt={`Upload ${idx + 1}`}
                      className="w-28 h-28 object-cover rounded-sm"
                    />
                    <div className="text-[10px] text-center font-serif text-slate-500 mt-2 truncate max-w-[112px]">
                      Memory #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Love Intensity meter */}
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-rose-900 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Love Level for Ambika Today</span>
              </span>
              <span className="font-mono font-bold text-rose-800 tabular-nums">
                {loveScore >= 5000 ? '∞ Infinite' : `${loveScore}%`}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={loveScore}
              onChange={(e) => setLoveScore(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{isSubmitting ? 'Saving to Archive...' : 'Save Daily Love Entry'}</span>
            </button>
          </div>
        </form>
      </div>

      <FloralDivider label="The Archive of Days" />

      {/* SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search our entries..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>

        {/* Filter by Author */}
        <div className="flex items-center gap-1 bg-rose-50/70 p-1 rounded-xl border border-rose-200/80 w-full sm:w-auto justify-center">
          {(['All', 'Ambika Rimal', 'My Love'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setAuthorFilter(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                authorFilter === filter
                  ? 'bg-white text-rose-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* JOURNAL ENTRIES TIMELINE STREAM */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 bg-white/70 border border-dashed border-rose-200 rounded-3xl p-8">
          <BookOpen className="w-10 h-10 mx-auto text-rose-300 mb-3" />
          <h4 className="text-lg font-serif text-rose-950 font-bold mb-1">No Entries Found</h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {searchQuery
              ? 'Try a different search keyword.'
              : 'Start your eternal daily journal by writing the first entry above for Ambika!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="bg-white/90 border border-rose-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Subtle top date badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-rose-100 text-xs text-slate-500 font-sans mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-rose-900">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-rose-700 font-medium">By {entry.author}</span>
                  {entry.location && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{entry.location}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {entry.weather && <span className="text-slate-600">{entry.weather}</span>}
                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & prompt */}
              <h3 className="text-xl md:text-2xl font-serif font-bold text-rose-950 mb-2">
                {entry.title}
              </h3>

              {entry.prompt && (
                <div className="inline-block text-xs font-serif italic text-rose-800/80 bg-rose-50 px-3 py-1 rounded-md mb-4">
                  Prompt: {entry.prompt}
                </div>
              )}

              {/* Content body */}
              <p className="text-slate-800 font-serif text-base md:text-lg leading-relaxed whitespace-pre-line mb-6">
                {entry.content}
              </p>

              {/* Photos Gallery */}
              {entry.photos && entry.photos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-rose-100/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3">
                    Attached Memories ({entry.photos.length})
                  </span>
                  <div className="flex flex-wrap gap-4">
                    {entry.photos.map((imgSrc, imgIndex) => (
                      <div
                        key={imgIndex}
                        onClick={() => setSelectedPhotoModal(imgSrc)}
                        className="cursor-pointer bg-white p-2 pb-5 rounded-md shadow-md border border-slate-200 rotate-[-1deg] hover:rotate-0 hover:scale-105 transition-all duration-200"
                      >
                        <img
                          src={imgSrc}
                          alt="Journal memory"
                          className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-[10px] text-center font-serif text-slate-500 mt-2">
                          Ambika · Memory #{imgIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer row with love score */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-rose-100 text-xs font-sans text-rose-900/70">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>
                    Love Intensity:{' '}
                    <strong className="text-rose-900 font-semibold tabular-nums">
                      {entry.loveScore >= 5000 ? '∞ Infinite' : `${entry.loveScore}%`}
                    </strong>
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Stamped at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* FULL PHOTO LIGHTBOX MODAL */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div
            className="max-w-3xl max-h-[90vh] bg-white p-4 pb-8 rounded-2xl shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedPhotoModal}
              alt="Full view memory"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <div className="text-center mt-3 font-serif italic text-sm text-slate-700">
              Ambika Rimal · Eternal Love Memory
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
