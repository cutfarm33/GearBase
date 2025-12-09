/**
 * Offline Status Indicator Component
 * Shows connection status and pending sync count
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useOnlineStatus, usePendingSyncCount, useSyncStatus } from '../lib/offline/hooks';

interface OfflineIndicatorProps {
  onSyncClick?: () => Promise<void>;
  className?: string;
}

export function OfflineIndicator({ onSyncClick, className = '' }: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();
  const pendingCount = usePendingSyncCount();
  const { isSyncing, failedCount, lastSyncTime } = useSyncStatus();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Show toast when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      setToastMessage(`${pendingCount} changes waiting to sync`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [isOnline, pendingCount]);

  // Show toast when going offline
  useEffect(() => {
    if (!isOnline) {
      setToastMessage('You are offline. Changes will sync when reconnected.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  }, [isOnline]);

  const handleSyncClick = async () => {
    if (onSyncClick && isOnline && pendingCount > 0) {
      await onSyncClick();
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      {/* Status indicator */}
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Connection status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            isOnline
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Sync status */}
        {pendingCount > 0 && (
          <button
            onClick={handleSyncClick}
            disabled={!isOnline || isSyncing}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              isOnline
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/50 cursor-pointer'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed'
            }`}
            title={`${pendingCount} pending changes${isOnline ? ' - Click to sync' : ''}`}
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isOnline ? (
              <Cloud className="w-3.5 h-3.5" />
            ) : (
              <CloudOff className="w-3.5 h-3.5" />
            )}
            <span>{pendingCount}</span>
          </button>
        )}

        {/* Failed sync indicator */}
        {failedCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            title={`${failedCount} sync errors`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{failedCount}</span>
          </div>
        )}

        {/* Synced indicator (show when all synced) */}
        {pendingCount === 0 && failedCount === 0 && isOnline && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            title={`Last sync: ${formatLastSync(lastSyncTime)}`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Synced</span>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
              isOnline
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Compact offline indicator for mobile/header
 */
export function OfflineIndicatorCompact({ className = '' }: { className?: string }) {
  const isOnline = useOnlineStatus();
  const pendingCount = usePendingSyncCount();

  if (isOnline && pendingCount === 0) {
    return null; // Don't show anything when everything is fine
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {!isOnline && (
        <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
      )}
      {pendingCount > 0 && (
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30">
          <Cloud className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
            {pendingCount}
          </span>
        </div>
      )}
    </div>
  );
}

export default OfflineIndicator;
