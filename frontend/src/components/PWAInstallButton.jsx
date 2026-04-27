/**
 * PWA Install Button Component
 * Displays installation prompt for PWA
 */

import React, { useState, useEffect } from 'react';
import { Download, Check, Smartphone } from 'lucide-react';

export default function PWAInstallButton({ className = '', variant = 'primary' }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('✅ Aura installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    setIsLoading(true);

    try {
      // Show the install prompt
      installPrompt.prompt();

      // Wait for user choice
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('❌ User dismissed the install prompt');
      }

      // Clear the prompt
      setInstallPrompt(null);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if already installed or no install prompt available
  if (isInstalled) {
    return (
      <button
        disabled
        className={`
          flex items-center justify-center gap-2 px-4 py-2 rounded-lg
          bg-emerald-500/20 text-emerald-600 dark:text-emerald-400
          font-medium text-sm transition-all duration-200
          cursor-default
          ${className}
        `}
      >
        <Check size={18} />
        <span>App Installed</span>
      </button>
    );
  }

  if (!installPrompt) {
    return null;
  }

  // Button variants
  const variants = {
    primary: `
      flex items-center justify-center gap-2 px-6 py-3 rounded-lg
      bg-gradient-to-r from-purple-600 to-purple-700 
      text-white font-semibold
      hover:shadow-lg hover:shadow-purple-500/50
      active:scale-95
      transition-all duration-200
      ${className}
    `,
    secondary: `
      flex items-center justify-center gap-2 px-4 py-2 rounded-lg
      bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white
      font-medium text-sm
      hover:bg-slate-300 dark:hover:bg-slate-600
      active:scale-95
      transition-all duration-200
      ${className}
    `,
    outline: `
      flex items-center justify-center gap-2 px-4 py-2 rounded-lg
      border-2 border-purple-600 text-purple-600 dark:text-purple-400
      font-medium text-sm
      hover:bg-purple-600/10
      active:scale-95
      transition-all duration-200
      ${className}
    `,
    minimal: `
      flex items-center justify-center gap-2 px-3 py-2 rounded
      text-slate-600 dark:text-slate-300 font-medium text-sm
      hover:bg-slate-100 dark:hover:bg-slate-800
      active:scale-95
      transition-all duration-200
      ${className}
    `
  };

  return (
    <button
      onClick={handleInstall}
      disabled={isLoading}
      className={`${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
      title="Install Aura as an app on your device for quick access and offline functionality"
    >
      <Download size={18} />
      <span>{isLoading ? 'Installing...' : 'Install App'}</span>
    </button>
  );
}

/**
 * PWA Status Component
 * Shows connection status and app installation status
 */
export function PWAStatus({ showDetails = false }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleAppInstalled = () => setIsInstalled(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isOnline ? 'bg-emerald-500' : 'bg-orange-500'
          }`}
        />
        <span className="text-slate-600 dark:text-slate-300">
          {isOnline ? 'Online' : 'Offline Mode'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
        App Status
      </h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-300">Connection:</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
            />
            <span className="font-medium text-slate-900 dark:text-white">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-300">Installation:</span>
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-blue-500" />
            <span className="font-medium text-slate-900 dark:text-white">
              {isInstalled ? 'Installed' : 'Not Installed'}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
        {isOnline
          ? '✅ All features available. App will work offline too.'
          : '⚠️ Limited features in offline mode. Reconnect to sync data.'}
      </p>
    </div>
  );
}
