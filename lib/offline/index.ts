/**
 * Offline Support Module
 * Export all offline functionality from a single entry point
 */

import { db as _db } from './db';

// Database
export {
  db,
  GearBaseDB,
  generateLocalId,
  createSyncableRecord,
  markAsModified,
  type SyncOperation,
  type SyncStatus,
  type SyncableRecord,
  type LocalInventoryItem,
  type LocalKit,
  type LocalJob,
  type LocalTransaction,
  type LocalUser,
  type LocalOrganization,
  type SyncQueueEntry,
  type SyncMeta,
  type AppSettings
} from './db';

// Sync Queue
export {
  syncQueue,
  SyncQueueManager
} from './syncQueue';

// Sync Engine
export {
  syncEngine,
  SyncEngine,
  type SyncResult,
  type ConflictResolution
} from './syncEngine';

// React Hooks
export {
  useOnlineStatus,
  useSyncStatus,
  usePendingSyncCount,
  useSyncEngine,
  useAutoSync,
  useOfflineData,
  useOfflineInventory,
  useOfflineJobs,
  useOfflineKits,
  useOfflineTransactions,
  useInitialDataLoad
} from './hooks';

/**
 * Register service worker for offline support
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('Service Worker registered:', registration.scope);

    // Handle updates — dispatch event so App can show a refresh banner
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New version available! Dispatching swUpdate event.');
            window.dispatchEvent(new CustomEvent('swUpdate'));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Request background sync (for when coming online)
 */
export async function requestBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.warn('Background sync not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register('sync-pending-operations');
    console.log('Background sync registered');
  } catch (error) {
    console.error('Background sync registration failed:', error);
  }
}

/**
 * Clear all caches: IndexedDB (Dexie) + Service Worker caches
 * Call this on logout to prevent stale data across sessions
 */
export async function clearAllCaches(): Promise<void> {
  // 1. Clear IndexedDB (Dexie)
  try {
    await _db.clearAllData();
    console.log('[Cache] IndexedDB cleared');
  } catch (e) {
    console.error('[Cache] Failed to clear IndexedDB:', e);
  }

  // 2. Tell service worker to clear its caches
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage('clearCache');
    console.log('[Cache] Sent clearCache to service worker');
  }
}

/**
 * Check if app is installed as PWA
 */
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

/**
 * Prompt user to install PWA
 */
let deferredPrompt: any = null;

export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA install prompt ready');
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  return outcome === 'accepted';
}

export function canPromptInstall(): boolean {
  return deferredPrompt !== null;
}
