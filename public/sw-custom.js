// Custom Service Worker additions for immediate update activation
// This file contains event listeners that supplement the Workbox-generated SW

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 SW: Received SKIP_WAITING, activating new version...');
    self.skipWaiting();
  }
});

// Immediately claim clients when SW activates
self.addEventListener('activate', (event) => {
  console.log('✅ SW: New version activated');
  event.waitUntil(
    (async () => {
      // Take control of all clients immediately
      await self.clients.claim();
      
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => !name.includes('workbox'))
          .map((name) => {
            console.log('🗑️ SW: Cleaning old cache:', name);
            return caches.delete(name);
          })
      );
    })()
  );
});

// Log installation
self.addEventListener('install', (event) => {
  console.log('📦 SW: New version installing...');
  // Force immediate activation
  self.skipWaiting();
});
