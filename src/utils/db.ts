import { JournalEntry, MemoryItem, AnniversaryData, ReminderConfig } from '../types';

const DB_NAME = 'AmbikaRimalLoveDB';
const DB_VERSION = 1;

const STORES = {
  JOURNAL: 'journal_entries',
  MEMORIES: 'shared_memories',
  SETTINGS: 'love_settings',
};

// Seed images from our generated assets
const SAMPLE_GARDEN_PHOTO = '/src/assets/images/romantic_couple_garden_1793693791147.jpg';
const SAMPLE_FLORAL_HERO = '/src/assets/images/floral_hero_romantic_1793693789392.jpg';
const SAMPLE_WREATH = '/src/assets/images/floral_anniversary_wreath_1793693790231.jpg';

const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-seed-1',
    date: '2026-11-03',
    title: 'The gentle warmth in your smile',
    content: `Woke up thinking about how lucky my life is with you in it, Ambika. There is a quiet grace in the way you look at me—the kind that makes the heaviest days feel light as rose petals. I love listening to your laughter, how you pour your whole heart into everything you care about, and how you make every ordinary evening feel like a celebration. Here is our daily vow to never let a single day pass without expressing how deeply and completely you are loved.`,
    author: 'My Love',
    mood: 'deeply-in-love',
    loveScore: 1000,
    photos: [SAMPLE_GARDEN_PHOTO],
    prompt: 'What made you smile thinking of us today?',
    location: 'Our Cozy Haven',
    weather: 'Gentle Autumn Breeze 🍂',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'entry-seed-2',
    date: '2026-11-02',
    title: 'Tea, whispered dreams, and your hands in mine',
    content: `Yesterday evening when we were talking about our future, I realized again that home isn't a coordinate or a street address; home is wherever you are, Ambika. Every second spent with you feels etched in gold. Thank you for being my patient partner, my dearest confidante, and my eternal sanctuary.`,
    author: 'Ambika Rimal',
    mood: 'butterflies',
    loveScore: 500,
    photos: [SAMPLE_FLORAL_HERO],
    prompt: 'Our favorite moment from this week',
    location: 'Balcony under the Starlight',
    weather: 'Clear Starry Night ✨',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'entry-seed-3',
    date: '2026-11-01',
    title: 'The day we promised to keep choosing each other',
    content: `Looking through our older pictures and remembering how nervous and mesmerized I was when we first started talking. You stole my heart effortlessly, Ambika. And today, I love you even more than yesterday, but not half as much as I will tomorrow.`,
    author: 'My Love',
    mood: 'tender',
    loveScore: 9999,
    photos: [SAMPLE_WREATH],
    prompt: 'A promise for tomorrow',
    location: 'Where it all began',
    weather: 'Warm Golden Sunshine ☀️',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Golden Hour in the Rose Garden',
    date: '2025-06-18',
    category: 'dates',
    description: 'Walking hand in hand through the blooming roses at sunset. You turned around with flower petals in your hair and smiled—that exact moment is permanently stamped in my soul.',
    photos: [SAMPLE_GARDEN_PHOTO],
    quote: 'In all the gardens of the world, my heart only blooms for Ambika.',
    isFavorite: true,
  },
  {
    id: 'mem-2',
    title: 'Our First Endless Conversation',
    date: '2024-10-12',
    category: 'firsts',
    description: 'We started talking at 7:00 PM and before we knew it, the birds were chirping outside at 4:00 AM. Neither of us wanted to say goodbye.',
    photos: [SAMPLE_FLORAL_HERO],
    quote: 'Time stops when two souls recognize each other.',
    isFavorite: true,
  },
  {
    id: 'mem-3',
    title: 'The Sacred Anniversary Promise',
    date: '2025-10-12',
    category: 'milestones',
    description: 'Exchanging handwritten letters and sealing them with botanical wax. A reminder of why our bond only grows deeper with every passing sunrise.',
    photos: [SAMPLE_WREATH],
    quote: 'Forever is only the beginning with you, Ambika Rimal.',
    isFavorite: true,
  },
];

// Target anniversary: e.g. Next upcoming anniversary date (e.g. October 12, 2027 or customizable)
const DEFAULT_ANNIVERSARY_DATA: AnniversaryData = {
  anniversaryDate: '2027-10-12T00:00:00',
  firstMetDate: '2024-10-12',
  customMessage: 'To my dearest Ambika Rimal: Through every season and every storm, you are my calm, my anchor, and my sweetest joy. With every heartbeat, I promise to choose you, cherish you, and hold you close forever.',
  ourSongTitle: 'Until I Found You',
  ourSongArtist: 'Stephen Sanchez',
  surprises: [
    {
      id: 'surprise-1',
      title: 'A Love Letter Sealed with Pressed Roses',
      revealed: false,
      letter: `Dearest Ambika,\n\nIf I could gather every star from the night sky and place it in the palm of your hand, it still wouldn't match the light you've brought into my universe.\n\nThank you for loving me with such gentleness, for understanding my quiet moments, and for making me want to become the best human being I can possibly be.\n\nHere is my promise: As long as there is breath in my lungs, you will never have to doubt whether you are cherished. You are my once-in-a-lifetime.\n\nForever yours,\nYour Love ❤️`,
      secretPromise: 'A weekend getaway to your favorite scenic retreat reserved just for the two of us, plus a personalized golden locket.',
      giftHint: 'Look inside the vintage wooden jewelry box where you keep your favorite dried lavender.',
    },
  ],
};

const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: true,
  reminderTime: '21:00',
  frequency: 'daily',
  customPrompt: "A gentle romantic pause: take a moment to write today's shared memory in our eternal love journal.",
};

class LoveDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.JOURNAL)) {
          const journalStore = db.createObjectStore(STORES.JOURNAL, { keyPath: 'id' });
          journalStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.MEMORIES)) {
          db.createObjectStore(STORES.MEMORIES, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = async () => {
        this.db = request.result;
        await this.seedInitialDataIfEmpty();
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.initPromise;
  }

  private async seedInitialDataIfEmpty() {
    const entries = await this.getJournalEntries();
    if (entries.length === 0) {
      for (const entry of INITIAL_JOURNAL_ENTRIES) {
        await this.saveJournalEntry(entry);
      }
    }

    const memories = await this.getMemories();
    if (memories.length === 0) {
      for (const mem of INITIAL_MEMORIES) {
        await this.saveMemory(mem);
      }
    }

    const anniversary = await this.getAnniversaryData();
    if (!anniversary) {
      await this.saveAnniversaryData(DEFAULT_ANNIVERSARY_DATA);
    }

    const reminder = await this.getReminderConfig();
    if (!reminder) {
      await this.saveReminderConfig(DEFAULT_REMINDER_CONFIG);
    }
  }

  // --- JOURNAL ENTRIES ---
  async getJournalEntries(): Promise<JournalEntry[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.JOURNAL, 'readonly');
      const store = tx.objectStore(STORES.JOURNAL);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: JournalEntry[] = request.result || [];
        // Sort descending by date
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.JOURNAL, 'readwrite');
      const store = tx.objectStore(STORES.JOURNAL);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteJournalEntry(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.JOURNAL, 'readwrite');
      const store = tx.objectStore(STORES.JOURNAL);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- MEMORIES ---
  async getMemories(): Promise<MemoryItem[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEMORIES, 'readonly');
      const store = tx.objectStore(STORES.MEMORIES);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: MemoryItem[] = request.result || [];
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveMemory(memory: MemoryItem): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEMORIES, 'readwrite');
      const store = tx.objectStore(STORES.MEMORIES);
      const request = store.put(memory);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMemory(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEMORIES, 'readwrite');
      const store = tx.objectStore(STORES.MEMORIES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- SETTINGS (Anniversary & Reminders) ---
  async getAnniversaryData(): Promise<AnniversaryData> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.get('anniversary_data');

      request.onsuccess = () => {
        if (request.result && request.result.value) {
          resolve(request.result.value);
        } else {
          resolve(DEFAULT_ANNIVERSARY_DATA);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveAnniversaryData(data: AnniversaryData): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.put({ key: 'anniversary_data', value: data });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getReminderConfig(): Promise<ReminderConfig> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.get('reminder_config');

      request.onsuccess = () => {
        if (request.result && request.result.value) {
          resolve(request.result.value);
        } else {
          resolve(DEFAULT_REMINDER_CONFIG);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveReminderConfig(config: ReminderConfig): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.put({ key: 'reminder_config', value: config });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const loveDb = new LoveDatabase();
