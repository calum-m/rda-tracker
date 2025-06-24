// Service Worker for RDA Tracker
// Provides offline caching and background sync capabilities

const CACHE_NAME = 'rda-tracker-v2.1.0';
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/RDALOGO.svg',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints that should be cached for offline use
const API_CACHE_NAME = 'rda-api-cache-v1';

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {
          cache: 'reload'
        })));
      })
      .catch(error => {
        console.error('Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      // Static assets - cache first strategy
      event.respondWith(cacheFirstStrategy(request));
    } else if (isAPIRequest(url)) {
      // API requests - network first with offline fallback
      event.respondWith(networkFirstStrategy(request));
    } else if (isNavigationRequest(request)) {
      // Navigation requests - serve app shell
      event.respondWith(navigationStrategy(request));
    }
  } else if (isAPIRequest(url) && !navigator.onLine) {
    // Non-GET API requests when offline - return meaningful response
    event.respondWith(offlineAPIResponse(request));
  }
});

// Background sync for uploading data when connection returns
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// Push notification support (for future use)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Helper functions
function isStaticAsset(url) {
  return url.pathname.startsWith('/static/') || 
         url.pathname.endsWith('.js') || 
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico') ||
         url.pathname === '/manifest.json';
}

function isAPIRequest(url) {
  // Check if it's a Dataverse API request
  return url.hostname.includes('.dynamics.com') || 
         url.pathname.includes('/api/data/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept').includes('text/html'));
}

// Cache strategies
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok && request.method === 'GET') {
      // Cache successful GET responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline indicator for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Data not available offline',
        offline: true 
      }), 
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function navigationStrategy(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Serve app shell from cache
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RDA Tracker - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: #f5f5f5;
            }
            .offline-message { 
              background: white; 
              padding: 30px; 
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 400px;
              margin: 0 auto;
            }
            .icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #57ab5d; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            .retry-btn {
              background: #57ab5d;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            .retry-btn:hover { background: #4a9350; }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <div class="icon">📱</div>
            <h1>RDA Tracker</h1>
            <p><strong>You're currently offline</strong></p>
            <p>The app will work with your local data. Changes will sync automatically when you're back online.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Try Again
            </button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function offlineAPIResponse(request) {
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Cannot perform this action while offline. Changes will be synced when online.',
      offline: true
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

async function performBackgroundSync() {
  console.log('Performing background sync...');
  
  try {
    // Get the main window to trigger sync
    const windowClients = await clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    });
    
    if (windowClients.length > 0) {
      // Send message to main window to trigger sync
      windowClients[0].postMessage({
        type: 'BACKGROUND_SYNC',
        action: 'PERFORM_SYNC'
      });
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error; // This will cause the sync to be retried
  }
}

// Listen for messages from the main app
self.addEventListener('message', event => {
  const { type, action } = event.data;
  
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (type === 'SYNC_STATUS') {
    // Handle sync status updates from main app
    console.log('Sync status update:', action);
  }
});

// Handle service worker updates
self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Take control of all pages immediately
  event.waitUntil(clients.claim());
});

console.log('RDA Tracker Service Worker loaded');