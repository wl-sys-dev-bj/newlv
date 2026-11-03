export type AuthorType = 'Ambika Rimal' | 'My Love';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  author: AuthorType;
  mood: 'deeply-in-love' | 'butterflies' | 'grateful' | 'missing-you' | 'tender' | 'cozy';
  loveScore: number; // 1 - 100 or infinite
  photos: string[]; // Base64 or image URLs
  prompt?: string;
  location?: string;
  weather?: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  category: 'firsts' | 'travel' | 'dates' | 'milestones' | 'everyday';
  description: string;
  photos: string[];
  quote?: string;
  isFavorite?: boolean;
}

export interface SpecialSurprise {
  id: string;
  title: string;
  revealed: boolean;
  letter: string;
  secretPromise: string;
  giftHint?: string;
  unlockDate?: string;
  lockedByPasscode?: boolean;
  passcode?: string;
}

export interface AnniversaryData {
  anniversaryDate: string; // YYYY-MM-DDTHH:mm:ss
  firstMetDate: string; // YYYY-MM-DD
  customMessage: string;
  ourSongTitle: string;
  ourSongArtist: string;
  surprises: SpecialSurprise[];
}

export interface ReminderConfig {
  enabled: boolean;
  reminderTime: string; // "21:00"
  frequency: 'daily';
  customPrompt: string;
  lastNotifiedDate?: string;
}
