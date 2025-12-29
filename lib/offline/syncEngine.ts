/**
 * Sync Engine
 * Handles bidirectional sync between local IndexedDB and Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db, SyncStatus, generateLocalId, SyncQueueEntry } from './db';
import { syncQueue } from './syncQueue';

// Map of local table names to Supabase table names
const TABLE_MAP: Record<string, string> = {
  inventory: 'inventory',
  kits: 'kits',
  jobs: 'jobs',
  transactions: 'transactions',
  users: 'profiles',
  organizations: 'organizations'
};

// Tables that use numeric IDs vs UUID
const NUMERIC_ID_TABLES = ['inventory', 'kits', 'jobs', 'transactions'];

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

export interface ConflictResolution {
  recordId: string | number;
  table: string;
  localData: any;
  serverData: any;
  resolution: 'local' | 'server' | 'merge';
  mergedData?: any;
}

type ConflictResolver = (conflict: Omit<ConflictResolution, 'resolution' | 'mergedData'>) => ConflictResolution;

export class SyncEngine {
  private supabase: SupabaseClient | null = null;
  private organizationId: string | null = null;
  private isSyncing = false;
  private conflictResolver: ConflictResolver;

  constructor() {
    // Default conflict resolution: server wins
    this.conflictResolver = (conflict) => ({
      ...conflict,
      resolution: 'server'
    });
  }

  /**
   * Initialize the sync engine with Supabase client
   */
  initialize(supabase: SupabaseClient, organizationId: string): void {
    this.supabase = supabase;
    this.organizationId = organizationId;
  }

  /**
   * Set custom conflict resolver
   */
  setConflictResolver(resolver: ConflictResolver): void {
    this.conflictResolver = resolver;
  }

  /**
   * Check if we're online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Full sync - pull from server then push local changes
   */
  async fullSync(): Promise<SyncResult> {
    if (!this.supabase || !this.organizationId) {
      return { success: false, synced: 0, failed: 0, conflicts: 0, errors: ['Sync engine not initialized'] };
    }

    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0, conflicts: 0, errors: ['Sync already in progress'] };
    }

    if (!this.isOnline()) {
      return { success: false, synced: 0, failed: 0, conflicts: 0, errors: ['No internet connection'] };
    }

    this.isSyncing = true;
    const result: SyncResult = { success: true, synced: 0, failed: 0, conflicts: 0, errors: [] };

    try {
      // First, pull data from server
      await this.pullFromServer(result);

      // Then, push local changes
      await this.pushToServer(result);

      result.success = result.failed === 0;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Pull data from server to local database
   */
  private async pullFromServer(result: SyncResult): Promise<void> {
    if (!this.supabase || !this.organizationId) return;

    const tables = ['inventory', 'kits', 'jobs', 'transactions'];

    for (const table of tables) {
      try {
        const serverTable = TABLE_MAP[table];
        const { data, error } = await this.supabase
          .from(serverTable)
          .select('*')
          .eq('organization_id', this.organizationId);

        if (error) {
          result.errors.push(`Failed to fetch ${table}: ${error.message}`);
          result.failed++;
          continue;
        }

        if (data) {
          await this.mergeServerData(table, data, result);
        }
      } catch (error) {
        result.errors.push(`Error pulling ${table}: ${error instanceof Error ? error.message : 'Unknown'}`);
        result.failed++;
      }
    }
  }

  /**
   * Merge server data with local data
   */
  private async mergeServerData(table: string, serverData: any[], result: SyncResult): Promise<void> {
    const localTable = (db as any)[table];

    for (const serverRecord of serverData) {
      const localRecord = await localTable.get(serverRecord.id);

      if (!localRecord) {
        // New record from server - add locally
        await localTable.put({
          ...serverRecord,
          _syncStatus: 'synced' as SyncStatus,
          _lastModified: Date.now()
        });
        result.synced++;
      } else if (localRecord._syncStatus === 'synced') {
        // Local is synced - just update with server data
        await localTable.put({
          ...serverRecord,
          _syncStatus: 'synced' as SyncStatus,
          _lastModified: Date.now()
        });
        result.synced++;
      } else if (localRecord._syncStatus === 'pending') {
        // Conflict! Local has changes that haven't been pushed
        const resolution = this.conflictResolver({
          recordId: serverRecord.id,
          table,
          localData: localRecord,
          serverData: serverRecord
        });

        if (resolution.resolution === 'server') {
          await localTable.put({
            ...serverRecord,
            _syncStatus: 'synced' as SyncStatus,
            _lastModified: Date.now()
          });
          // Remove from sync queue since we're discarding local changes
          await db.syncQueue.where({ table, recordId: serverRecord.id }).delete();
        } else if (resolution.resolution === 'local') {
          // Keep local - it will be pushed later
        } else if (resolution.resolution === 'merge' && resolution.mergedData) {
          await localTable.put({
            ...resolution.mergedData,
            _syncStatus: 'pending' as SyncStatus,
            _lastModified: Date.now()
          });
        }
        result.conflicts++;
      }
    }

    // Check for records deleted on server
    const localRecords = await localTable
      .where('organization_id')
      .equals(this.organizationId)
      .toArray();

    const serverIds = new Set(serverData.map(r => r.id));

    for (const localRecord of localRecords) {
      if (!serverIds.has(localRecord.id) && localRecord._syncStatus === 'synced') {
        // Record was deleted on server and local is synced - delete locally
        await localTable.delete(localRecord.id);
        result.synced++;
      }
    }
  }

  /**
   * Push local changes to server
   */
  private async pushToServer(result: SyncResult): Promise<void> {
    if (!this.supabase) return;

    const pendingOps = await syncQueue.getPending();

    for (const op of pendingOps) {
      try {
        await syncQueue.markProcessing(op.id!);
        await this.processOperation(op, result);
        await syncQueue.markCompleted(op.id!);
        result.synced++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        await syncQueue.markFailed(op.id!, errorMsg);
        result.errors.push(`Failed to sync ${op.table} ${op.operation}: ${errorMsg}`);
        result.failed++;
      }
    }
  }

  /**
   * Process a single sync operation
   */
  private async processOperation(op: SyncQueueEntry, result: SyncResult): Promise<void> {
    if (!this.supabase) throw new Error('Supabase not initialized');

    const serverTable = TABLE_MAP[op.table];
    const localTable = (db as any)[op.table];

    switch (op.operation) {
      case 'create': {
        // Remove sync metadata before sending to server
        const { _syncStatus, _lastModified, _localId, _serverVersion, ...data } = op.data;

        // For numeric ID tables, remove the ID so Supabase generates it
        const insertData = NUMERIC_ID_TABLES.includes(op.table)
          ? { ...data, id: undefined }
          : data;

        const { data: created, error } = await this.supabase
          .from(serverTable)
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Update local record with server-assigned ID
        if (created && NUMERIC_ID_TABLES.includes(op.table)) {
          // Delete old local record and create with new ID
          await localTable.delete(op.recordId);
          await localTable.put({
            ...created,
            _syncStatus: 'synced' as SyncStatus,
            _lastModified: Date.now()
          });
        } else if (created) {
          await localTable.update(op.recordId, {
            _syncStatus: 'synced' as SyncStatus,
            _lastModified: Date.now()
          });
        }
        break;
      }

      case 'update': {
        const { _syncStatus, _lastModified, _localId, _serverVersion, ...data } = op.data;

        const { error } = await this.supabase
          .from(serverTable)
          .update(data)
          .eq('id', op.recordId);

        if (error) throw error;

        await localTable.update(op.recordId, {
          _syncStatus: 'synced' as SyncStatus,
          _lastModified: Date.now()
        });
        break;
      }

      case 'delete': {
        const { error } = await this.supabase
          .from(serverTable)
          .delete()
          .eq('id', op.recordId);

        if (error) throw error;

        // Local record should already be deleted
        break;
      }
    }
  }

  /**
   * Push a single table's changes
   */
  async syncTable(table: string): Promise<SyncResult> {
    const result: SyncResult = { success: true, synced: 0, failed: 0, conflicts: 0, errors: [] };

    const pendingOps = await syncQueue.getPending();
    const tableOps = pendingOps.filter(op => op.table === table);

    for (const op of tableOps) {
      try {
        await syncQueue.markProcessing(op.id!);
        await this.processOperation(op, result);
        await syncQueue.markCompleted(op.id!);
        result.synced++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        await syncQueue.markFailed(op.id!, errorMsg);
        result.errors.push(errorMsg);
        result.failed++;
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    pendingCount: number;
    failedCount: number;
    lastSyncTime: number | null;
    isSyncing: boolean;
  }> {
    const pendingCount = await syncQueue.getPendingCount();
    const failed = await syncQueue.getFailed();
    const meta = await db.syncMeta.orderBy('lastSyncTime').last();

    return {
      pendingCount,
      failedCount: failed.length,
      lastSyncTime: meta?.lastSyncTime || null,
      isSyncing: this.isSyncing
    };
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();
