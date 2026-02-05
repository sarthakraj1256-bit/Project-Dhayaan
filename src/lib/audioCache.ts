// IndexedDB-based audio cache for generated audio (atmosphere & TTS)

const DB_NAME = 'dhyaan-audio-cache';
const DB_VERSION = 2;
const ATMOSPHERE_STORE = 'atmosphere-sounds';
const TTS_STORE = 'tts-audio';

interface CachedAudio {
  id: string;
  blob: Blob;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open audio cache database');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(ATMOSPHERE_STORE)) {
        db.createObjectStore(ATMOSPHERE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(TTS_STORE)) {
        db.createObjectStore(TTS_STORE, { keyPath: 'id' });
      }
    };
  });

  return dbPromise;
}

// Generic cache functions
async function getFromStore(storeName: string, id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedAudio | undefined;
        resolve(result?.blob ?? null);
      };
    });
  } catch (error) {
    console.error(`Error reading from ${storeName}:`, error);
    return null;
  }
}

async function setInStore(storeName: string, id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const cachedAudio: CachedAudio = {
        id,
        blob,
        timestamp: Date.now(),
      };

      const request = store.put(cachedAudio);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`Error writing to ${storeName}:`, error);
  }
}

async function clearStore(storeName: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`Error clearing ${storeName}:`, error);
  }
}

// Atmosphere sound cache (existing API)
export async function getCachedAudio(atmosphereId: string): Promise<Blob | null> {
  return getFromStore(ATMOSPHERE_STORE, atmosphereId);
}

export async function setCachedAudio(atmosphereId: string, blob: Blob): Promise<void> {
  return setInStore(ATMOSPHERE_STORE, atmosphereId, blob);
}

export async function clearAudioCache(): Promise<void> {
  return clearStore(ATMOSPHERE_STORE);
}

// TTS audio cache
function generateTTSCacheKey(text: string): string {
  // Create a simple hash from the text for cache key
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `tts_${hash}_${text.length}`;
}

export async function getCachedTTS(text: string): Promise<Blob | null> {
  const key = generateTTSCacheKey(text);
  return getFromStore(TTS_STORE, key);
}

export async function setCachedTTS(text: string, blob: Blob): Promise<void> {
  const key = generateTTSCacheKey(text);
  return setInStore(TTS_STORE, key, blob);
}

export async function clearTTSCache(): Promise<void> {
  return clearStore(TTS_STORE);
}

// Check if TTS is cached
export async function isTTSCached(text: string): Promise<boolean> {
  const cached = await getCachedTTS(text);
  return cached !== null;
}