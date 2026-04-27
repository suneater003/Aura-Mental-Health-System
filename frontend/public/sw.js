/**
 * Aura PWA Service Worker
 * Handles offline functionality, caching, and network strategies
 */

const CACHE_NAME = 'aura-v1';
const RUNTIME_CACHE = 'aura-runtime';
const API_CACHE = 'aura-api-cache';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icons/aura-icon-192.png',
  '/icons/aura-icon-512.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching essential assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE) {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API calls - Network First
  if (url.pathname.startsWith('/api')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Assets (JS, CSS, images) - Cache First
  if (isAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }

  // HTML pages - Network First with fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE, '/index.html'));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
});

/**
 * Network First Strategy
 * Try network first, fall back to cache
 */
async function networkFirstStrategy(request, cacheName, fallbackUrl = null) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log(`📡 Network failed for ${request.url}, checking cache...`);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return fallback if provided
    if (fallbackUrl) {
      const fallbackResponse = await caches.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    // Return offline page
    return createOfflineResponse();
  }
}

/**
 * Cache First Strategy
 * Try cache first, fall back to network
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Failed to fetch ${request.url}:`, error);
    return createOfflineResponse();
  }
}

/**
 * Create an offline response
 */
function createOfflineResponse() {
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aura - Offline</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: white;
          }
          .container {
            text-align: center;
            max-width: 500px;
            padding: 40px 20px;
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          p {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 30px;
            line-height: 1.6;
          }
          .features {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 12px;
            margin: 30px 0;
            text-align: left;
          }
          .features h3 {
            font-size: 14px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.8;
          }
          .features ul {
            list-style: none;
          }
          .features li {
            padding: 8px 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .features li:before {
            content: "✓ ";
            margin-right: 8px;
          }
          button {
            background: rgba(255,255,255,0.9);
            color: #667eea;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          }
          button:active {
            transform: translateY(0);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🌙</div>
          <h1>You're Offline</h1>
          <p>Don't worry, Aura is still here for you. Some features are available offline.</p>
          
          <div class="features">
            <h3>Available Offline:</h3>
            <ul>
              <li>View your wellness history</li>
              <li>Access mindfulness games</li>
              <li>View your mood trends</li>
              <li>Read saved affirmations</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; opacity: 0.7;">
            Connect to the internet to access AI chat, real-time updates, and cloud sync.
          </p>
          
          <button onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      </body>
    </html>
    `,
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      })
    }
  );
}

/**
 * Check if request is for an asset
 */
function isAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return /\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|eot|ttf|otf)$/.test(pathname) ||
         pathname.includes('/icons/') ||
         pathname.includes('/assets/');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-mood-logs') {
    event.waitUntil(syncMoodLogs());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMoodLogs() {
  try {
    // Implement your sync logic here
    console.log('✅ Mood logs synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error; // Retry sync
  }
}

async function syncMessages() {
  try {
    // Implement your sync logic here
    console.log('✅ Messages synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error; // Retry sync
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('📨 Message from client:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(names =>
        Promise.all(names.map(name => caches.delete(name)))
      )
    );
  }
});
