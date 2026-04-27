/**
 * PWA Service Worker Registration & Update Handler
 * Handles SW registration and user notifications for app updates
 */

export async function registerPWA() {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Workers are not supported in this browser');
    return null;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registered successfully:', registration);

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Listen for controller change (app update applied)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 New service worker activated - app updated');
      notifyUserOfUpdate();
    });

    // Listen for service worker update found
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
          // New service worker is ready and there's already a controller
          showUpdatePrompt();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Show a prompt to the user about a new app version
 */
function showUpdatePrompt() {
  // Create a persistent banner at the top
  const banner = document.createElement('div');
  banner.id = 'pwa-update-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 16px;">🎉</span>
      <span style="font-weight: 500;">A new version of Aura is available!</span>
    </div>
    <div style="display: flex; gap: 12px;">
      <button id="pwa-update-dismiss" style="
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.3s;
      ">
        Later
      </button>
      <button id="pwa-update-reload" style="
        background: rgba(255,255,255,0.9);
        color: #667eea;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.3s;
      ">
        Reload Now
      </button>
    </div>
  `;

  document.body.insertBefore(banner, document.body.firstChild);

  // Handle dismiss button
  document.getElementById('pwa-update-dismiss').addEventListener('click', () => {
    banner.remove();
  });

  // Handle reload button
  document.getElementById('pwa-update-reload').addEventListener('click', () => {
    window.location.reload();
  });

  // Also show toast notification
  showToast('🎉 Aura has been updated! Reload to see the latest features.');
}

/**
 * Notify user that update was applied
 */
function notifyUserOfUpdate() {
  showToast('✨ Aura refreshed with the latest improvements!', 'success');
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9998;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // Remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Check if app is installed
 */
export function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         document.referrer.includes('android-app://') ||
         navigator.standalone === true;
}

/**
 * Request installation prompt
 */
export async function requestInstallPrompt() {
  try {
    // This is automatically handled by browsers, but you can implement custom prompts
    if ('beforeinstallprompt' in window) {
      return true; // Browser will show install prompt
    }
    return false;
  } catch (error) {
    console.error('Error requesting install prompt:', error);
    return false;
  }
}

/**
 * Clear all caches (useful for debugging)
 */
export async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('✅ All caches cleared');
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
}

/**
 * Get cache storage info
 */
export async function getCacheInfo() {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
      };
    }
  } catch (error) {
    console.error('Error getting cache info:', error);
    return null;
  }
}
