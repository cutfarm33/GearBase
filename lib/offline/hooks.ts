/**
 * React Hooks for Offline-First Data Access
 * Provides seamless offline/online data operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SyncStatus, createSyncableRecord, markAsModified, generateLocalId } from './db';
import { syncQueue } from './syncQueue';
import { syncEngine, SyncResult } from './syncEngine';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Hook for online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for sync status
 */
export function useSyncStatus() {
  const [status, setStatus] = useState({
    pendingCount: 0,
    failedCount: 0,
    lastSyncTime: null as number | null,
    isSyncing: false
  });

  const updateStatus = useCallback(async () => {
    const newStatus = await syncEngine.getSyncStatus();
    setStatus(newStatus);
  }, []);

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  return status;
}

/**
 * Hook for pending sync count (live)
 */
export function usePendingSyncCount() {
  return useLiveQuery(() => db.syncQueue.where('status').equals('pending').count(), [], 0);
}

/**
 * Hook to initialize sync engine
 */
export function useSyncEngine(supabase: SupabaseClient | null, organizationId: string | null) {
  const initialized = useRef(false);

  useEffect(() => {
    if (supabase && organizationId && !initialized.current) {
      syncEngine.initialize(supabase, organizationId);
      initialized.current = true;
    }
  }, [supabase, organizationId]);

  const sync = useCallback(async (): Promise<SyncResult> => {
    return await syncEngine.fullSync();
  }, []);

  return { sync, syncEngine };
}

/**
 * Hook for auto-sync when coming online
 */
export function useAutoSync(supabase: SupabaseClient | null, organizationId: string | null) {
  const isOnline = useOnlineStatus();
  const wasOffline = useRef(!navigator.onLine);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const { sync } = useSyncEngine(supabase, organizationId);

  useEffect(() => {
    // If we just came online and have pending changes, sync
    if (isOnline && wasOffline.current) {
      sync().then(setLastSyncResult);
    }
    wasOffline.current = !isOnline;
  }, [isOnline, sync]);

  // Listen for service worker sync messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_REQUIRED') {
        sync().then(setLastSyncResult);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [sync]);

  return { lastSyncResult, triggerSync: sync };
}

/**
 * Generic hook for offline-first CRUD operations
 */
export function useOfflineData<T extends { id?: number | string }>(
  tableName: 'inventory' | 'kits' | 'jobs' | 'transactions',
  organizationId: string | null
) {
  const isOnline = useOnlineStatus();
  const table = (db as any)[tableName];

  // Live query for all data
  const data = useLiveQuery(
    () => organizationId
      ? table.where('organization_id').equals(organizationId).toArray()
      : Promise.resolve([]),
    [organizationId],
    []
  );

  // Create
  const create = useCallback(async (item: Omit<T, 'id'>): Promise<T> => {
    const record = createSyncableRecord({
      ...item,
      organization_id: organizationId,
      _localId: generateLocalId()
    } as any);

    const id = await table.add(record);

    await syncQueue.enqueue(tableName, 'create', id, { ...record, id });

    return { ...record, id } as T;
  }, [tableName, organizationId]);

  // Update
  const update = useCallback(async (id: number | string, changes: Partial<T>): Promise<void> => {
    const existing = await table.get(id);
    if (!existing) throw new Error(`Record ${id} not found`);

    const updated = markAsModified({ ...existing, ...changes });
    await table.put(updated);

    await syncQueue.enqueue(tableName, 'update', id, updated);
  }, [tableName]);

  // Delete
  const remove = useCallback(async (id: number | string): Promise<void> => {
    const existing = await table.get(id);
    if (!existing) return;

    await table.delete(id);

    // Only queue delete if it was synced (has real server ID)
    if (existing._syncStatus === 'synced') {
      await syncQueue.enqueue(tableName, 'delete', id, null);
    }
  }, [tableName]);

  // Get single item
  const getById = useCallback(async (id: number | string): Promise<T | undefined> => {
    return await table.get(id);
  }, []);

  return {
    data: data as T[],
    create,
    update,
    remove,
    getById,
    isOnline
  };
}

/**
 * Hook for inventory with offline support
 */
export function useOfflineInventory(organizationId: string | null) {
  return useOfflineData<any>('inventory', organizationId);
}

/**
 * Hook for jobs with offline support
 */
export function useOfflineJobs(organizationId: string | null) {
  return useOfflineData<any>('jobs', organizationId);
}

/**
 * Hook for kits with offline support
 */
export function useOfflineKits(organizationId: string | null) {
  return useOfflineData<any>('kits', organizationId);
}

/**
 * Hook for transactions with offline support
 */
export function useOfflineTransactions(organizationId: string | null) {
  return useOfflineData<any>('transactions', organizationId);
}

/**
 * Hook to populate local database from server on first load
 */
export function useInitialDataLoad(
  supabase: SupabaseClient | null,
  organizationId: string | null,
  isOnline: boolean
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!supabase || !organizationId || loaded.current) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      if (!isOnline) {
        // Offline - just use local data
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Check if we have any local data
        const localInventoryCount = await db.inventory
          .where('organization_id')
          .equals(organizationId)
          .count();

        if (localInventoryCount === 0) {
          // First load - fetch all data from server
          await fetchAndStoreAllData(supabase, organizationId);
        } else {
          // Have local data - do a sync
          await syncEngine.fullSync();
        }

        loaded.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [supabase, organizationId, isOnline]);

  return { isLoading, error };
}

/**
 * Fetch all data from server and store locally
 */
async function fetchAndStoreAllData(supabase: SupabaseClient, organizationId: string) {
  const tables = [
    { local: 'inventory', remote: 'inventory' },
    { local: 'kits', remote: 'kits' },
    { local: 'jobs', remote: 'jobs' },
    { local: 'transactions', remote: 'transactions' }
  ];

  for (const { local, remote } of tables) {
    const { data, error } = await supabase
      .from(remote)
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error(`Failed to fetch ${remote}:`, error);
      continue;
    }

    if (data && data.length > 0) {
      const localTable = (db as any)[local];
      const records = data.map(item => createSyncableRecord(item, 'synced'));
      await localTable.bulkPut(records);
    }
  }
}
