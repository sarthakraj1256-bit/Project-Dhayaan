 // IndexedDB-based audio cache for generated atmosphere sounds
 
 const DB_NAME = 'dhyaan-audio-cache';
 const DB_VERSION = 1;
 const STORE_NAME = 'atmosphere-sounds';
 
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
       if (!db.objectStoreNames.contains(STORE_NAME)) {
         db.createObjectStore(STORE_NAME, { keyPath: 'id' });
       }
     };
   });
 
   return dbPromise;
 }
 
 export async function getCachedAudio(atmosphereId: string): Promise<Blob | null> {
   try {
     const db = await openDB();
     return new Promise((resolve, reject) => {
       const transaction = db.transaction(STORE_NAME, 'readonly');
       const store = transaction.objectStore(STORE_NAME);
       const request = store.get(atmosphereId);
 
       request.onerror = () => reject(request.error);
       request.onsuccess = () => {
         const result = request.result as CachedAudio | undefined;
         resolve(result?.blob ?? null);
       };
     });
   } catch (error) {
     console.error('Error reading from audio cache:', error);
     return null;
   }
 }
 
 export async function setCachedAudio(atmosphereId: string, blob: Blob): Promise<void> {
   try {
     const db = await openDB();
     return new Promise((resolve, reject) => {
       const transaction = db.transaction(STORE_NAME, 'readwrite');
       const store = transaction.objectStore(STORE_NAME);
       
       const cachedAudio: CachedAudio = {
         id: atmosphereId,
         blob,
         timestamp: Date.now(),
       };
 
       const request = store.put(cachedAudio);
       request.onerror = () => reject(request.error);
       request.onsuccess = () => resolve();
     });
   } catch (error) {
     console.error('Error writing to audio cache:', error);
   }
 }
 
 export async function clearAudioCache(): Promise<void> {
   try {
     const db = await openDB();
     return new Promise((resolve, reject) => {
       const transaction = db.transaction(STORE_NAME, 'readwrite');
       const store = transaction.objectStore(STORE_NAME);
       const request = store.clear();
 
       request.onerror = () => reject(request.error);
       request.onsuccess = () => resolve();
     });
   } catch (error) {
     console.error('Error clearing audio cache:', error);
   }
 }