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

// Get estimated cache size in bytes
export async function getCacheSize(): Promise<{ tts: number; atmosphere: number; total: number }> {
  try {
    const db = await openDB();
    
    const getStoreSize = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.openCursor();
        let totalSize = 0;

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const record = cursor.value as { blob?: Blob };
            if (record.blob) {
              totalSize += record.blob.size;
            }
            cursor.continue();
          } else {
            resolve(totalSize);
          }
        };
      });
    };

    const [ttsSize, atmosphereSize] = await Promise.all([
      getStoreSize(TTS_STORE),
      getStoreSize(ATMOSPHERE_STORE),
    ]);

    return {
      tts: ttsSize,
      atmosphere: atmosphereSize,
      total: ttsSize + atmosphereSize,
    };
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return { tts: 0, atmosphere: 0, total: 0 };
  }
}

// Format bytes to human readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Cache expiry - remove entries older than specified days
const CACHE_EXPIRY_DAYS = 30;
const CACHE_EXPIRY_MS = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

async function cleanupExpiredFromStore(storeName: string): Promise<number> {
  try {
    const db = await openDB();
    const now = Date.now();
    let removedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const record = cursor.value as CachedAudio;
          if (record.timestamp && (now - record.timestamp) > CACHE_EXPIRY_MS) {
            cursor.delete();
            removedCount++;
          }
          cursor.continue();
        } else {
          resolve(removedCount);
        }
      };
    });
  } catch (error) {
    console.error(`Error cleaning up ${storeName}:`, error);
    return 0;
  }
}

/**
 * Clean up expired cache entries (older than 30 days)
 * Call this on app startup to maintain cache hygiene
 */
export async function cleanupExpiredCache(): Promise<{ tts: number; atmosphere: number }> {
  try {
    const [ttsRemoved, atmosphereRemoved] = await Promise.all([
      cleanupExpiredFromStore(TTS_STORE),
      cleanupExpiredFromStore(ATMOSPHERE_STORE),
    ]);

    const total = ttsRemoved + atmosphereRemoved;
    if (total > 0) {
      console.log(`Cache cleanup: removed ${ttsRemoved} TTS and ${atmosphereRemoved} atmosphere entries (older than ${CACHE_EXPIRY_DAYS} days)`);
    }

    return { tts: ttsRemoved, atmosphere: atmosphereRemoved };
  } catch (error) {
    console.error('Error during cache cleanup:', error);
    return { tts: 0, atmosphere: 0 };
  }
}