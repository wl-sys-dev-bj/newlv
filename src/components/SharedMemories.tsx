import React, { useState } from 'react';
import { MemoryItem } from '../types';
import { loveDb } from '../utils/db';
import { romanticAudio } from '../utils/audio';
import { FloralDivider } from './FloralDecorations';
import {
  Heart,
  Plus,
  Camera,
  Calendar,
  Sparkles,
  X,
  Trash2,
  Check,
  Maximize2
} from 'lucide-react';

interface SharedMemoriesProps {
  memories: MemoryItem[];
  onMemoriesChange: (updated: MemoryItem[]) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Moments' },
  { id: 'firsts', label: 'Our Firsts' },
  { id: 'dates', label: 'Romantic Dates' },
  { id: 'travel', label: 'Travel & Adventures' },
  { id: 'milestones', label: 'Milestones & Vows' },
  { id: 'everyday', label: 'Sweet Everyday' },
] as const;

export const SharedMemories: React.FC<SharedMemoriesProps> = ({
  memories,
  onMemoriesChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [likedMemories, setLikedMemories] = useState<Record<string, boolean>>({});

  // Form State
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<MemoryItem['category']>('dates');
  const [description, setDescription] = useState<string>('');
  const [quote, setQuote] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
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

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || photos.length === 0) {
      showToast('Please provide a title and at least one memory photo.');
      return;
    }

    const newMemory: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: title.trim(),
      date,
      category,
      description: description.trim(),
      quote: quote.trim() || undefined,
      photos,
      isFavorite: true,
    };

    await loveDb.saveMemory(newMemory);
    const updated = [newMemory, ...memories];
    onMemoriesChange(updated);

    romanticAudio.playJournalSaved();
    showToast('New shared memory added to Ambika\'s gallery!');

    // Reset
    setTitle('');
    setDescription('');
    setQuote('');
    setPhotos([]);
    setIsAddModalOpen(false);
  };

  const handleDeleteMemory = async (id: string) => {
    if (window.confirm('Delete this memory tile?')) {
      await loveDb.deleteMemory(id);
      const updated = memories.filter((m) => m.id !== id);
      onMemoriesChange(updated);
      showToast('Memory tile removed.');
    }
  };

  const toggleHeart = (id: string) => {
    romanticAudio.playSoftClick();
    setLikedMemories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredMemories = memories.filter((mem) => {
    if (activeCategory === 'all') return true;
    return mem.category === activeCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-rose-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER & BRANDING */}
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-rose-800/80 block mb-1">
          Eternal Photo Album
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-rose-950 tracking-tight">
          Ambika Rimal · Shared Memories
        </h2>
        <p className="text-rose-900/70 font-serif italic text-base mt-2">
          "Every picture holds a thousand unsaid heartbeats."
        </p>
      </div>

      {/* CATEGORY SELECTOR & ADD BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-rose-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* MEMORIES GRID */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-20 bg-white/70 border border-dashed border-rose-200 rounded-3xl p-8">
          <Camera className="w-10 h-10 mx-auto text-rose-300 mb-3" />
          <h4 className="text-lg font-serif text-rose-950 font-bold mb-1">No Memories in This Category Yet</h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto mb-4">
            Upload a snapshot of your romantic journeys and date nights with Ambika!
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-rose-600 text-white text-xs rounded-xl"
          >
            Add Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((mem) => {
            const isLiked = likedMemories[mem.id] ?? true;
            return (
              <div
                key={mem.id}
                className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Photo Container */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedPhotoModal(mem.photos[0])}>
                  <img
                    src={mem.photos[0]}
                    alt={mem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white">
                    <span className="text-xs flex items-center gap-1 font-sans">
                      <Maximize2 className="w-3.5 h-3.5" /> View Photo
                    </span>
                  </div>

                  {/* Multi-photo badge */}
                  {mem.photos.length > 1 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-sans font-medium rounded-full">
                      +{mem.photos.length - 1} more
                    </div>
                  )}

                  {/* Heart button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHeart(mem.id);
                    }}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-all shadow-sm"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans mb-1.5">
                      <span className="text-rose-700 font-medium">
                        {new Date(mem.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="capitalize text-slate-400">Ambika & Love</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-rose-950 mb-2">
                      {mem.title}
                    </h3>

                    <p className="text-slate-700 text-xs md:text-sm font-sans leading-relaxed mb-4">
                      {mem.description}
                    </p>

                    {mem.quote && (
                      <div className="p-3 bg-[#FAF6F0] border-l-2 border-rose-300 rounded-r-lg font-serif italic text-xs text-rose-900 mb-3">
                        "{mem.quote}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-rose-50 text-[11px] text-slate-400">
                    <span className="font-serif italic text-rose-900/60">
                      Ambika Rimal Eternal Moment
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD NEW MEMORY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                <h3 className="text-xl font-serif font-bold text-rose-950">Add Shared Memory</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stargazing at the lake, Our first coffee"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-rose-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Date of Memory</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-rose-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MemoryItem['category'])}
                    className="w-full p-2 text-xs bg-slate-50 border border-rose-200 rounded-xl"
                  >
                    <option value="dates">Romantic Dates</option>
                    <option value="firsts">Our Firsts</option>
                    <option value="travel">Travel & Adventures</option>
                    <option value="milestones">Milestones</option>
                    <option value="everyday">Everyday Moments</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Story & What Happened
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What made this moment unforgettable with Ambika?"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-rose-200 rounded-xl font-sans"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  A Romantic Quote / Words Said
                </label>
                <input
                  type="text"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="e.g. 'You are my favorite place to go when my mind looks for peace.'"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-rose-200 rounded-xl italic font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photos for this Memory
                </label>
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-rose-200 bg-rose-50/40 hover:bg-rose-50 rounded-2xl cursor-pointer transition-colors text-xs text-rose-800">
                  <Camera className="w-5 h-5 text-rose-600" />
                  <span>Click to choose photo(s)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photos.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {photos.map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="Selected memory"
                        className="w-16 h-16 object-cover rounded-lg border border-rose-200"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl shadow-sm"
                >
                  Save to Memories
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-white p-4 pb-8 rounded-2xl relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedPhotoModal}
              alt="Memory view"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <div className="text-center mt-3 font-serif italic text-sm text-rose-950">
              Ambika Rimal & Love · Cherished Forever
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
