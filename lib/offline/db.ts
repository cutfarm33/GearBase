/**
 * Gear Base Local Database
 * Uses Dexie.js (IndexedDB wrapper) for offline-first data storage
 */

import Dexie, { Table } from 'dexie';
import type {
  InventoryItem,
  Kit,
  Job,
  Transaction,
  User,
  Organization,
  Invitation,
  OrganizationMember,
  ItemCondition,
  ItemStatus,
  JobStatus,
  TransactionType
} from '../../types';

// Sync operation types
export type SyncOperation = 'create' | 'update' | 'delete';

// Sync status for records
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

// Base interface for all synced records
export interface SyncableRecord {
  _syncStatus: SyncStatus;
  _lastModified: number; // timestamp
  _localId?: string; // local UUID for new records
  _serverVersion?: number; // for conflict detection
}

// Local versions of types with sync metadata
export interface LocalInventoryItem extends InventoryItem, SyncableRecord {}
export interface LocalKit extends Kit, SyncableRecord {}
export interface LocalJob extends Job, SyncableRecord {}
export interface LocalTransaction extends Transaction, SyncableRecord {}
export interface LocalUser extends User, SyncableRecord {}
export interface LocalOrganization extends Organization, SyncableRecord {}

// Sync queue entry
export interface SyncQueueEntry {
  id?: number;
  table: string;
  operation: SyncOperation;
  recordId: string | number;
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
  status: 'pending' | 'processing' | 'failed';
}

// Sync metadata for tracking last sync
export interface SyncMeta {
  id?: number;
  table: string;
  lastSyncTime: number;
  lastServerTimestamp?: string;
}

// App settings stored locally
export interface AppSettings {
  id?: number;
  key: string;
  value: any;
}

/**
 * Gear Base Database Class
 */
export class GearBaseDB extends Dexie {
  // Tables
  inventory!: Table<LocalInventoryItem, number>;
  kits!: Table<LocalKit, number>;
  jobs!: Table<LocalJob, number>;
  transactions!: Table<LocalTransaction, number>;
  users!: Table<LocalUser, string>;
  organizations!: Table<LocalOrganization, string>;

  // Sync management tables
  syncQueue!: Table<SyncQueueEntry, number>;
  syncMeta!: Table<SyncMeta, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('GearBaseDB');

    // Define database schema
    this.version(1).stores({
      // Main data tables
      inventory: '++id, qrCode, category, status, condition, organization_id, _syncStatus, _lastModified',
      kits: '++id, name, organization_id, _syncStatus, _lastModified',
      jobs: '++id, name, status, producerId, startDate, endDate, organization_id, _syncStatus, _lastModified',
      transactions: '++id, jobId, type, userId, timestamp, organization_id, _syncStatus, _lastModified',
      users: 'id, email, organization_id, active_organization_id, _syncStatus, _lastModified',
      organizations: 'id, name, owner_id, _syncStatus, _lastModified',

      // Sync management
      syncQueue: '++id, table, operation, recordId, timestamp, status',
      syncMeta: '++id, table',
      settings: '++id, key'
    });
  }

  /**
   * Clear all local data (useful for logout)
   */
  async clearAllData(): Promise<void> {
    await this.transaction('rw',
      [this.inventory, this.kits, this.jobs, this.transactions,
       this.users, this.organizations, this.syncQueue, this.syncMeta],
      async () => {
        await this.inventory.clear();
        await this.kits.clear();
        await this.jobs.clear();
        await this.transactions.clear();
        await this.users.clear();
        await this.organizations.clear();
        await this.syncQueue.clear();
        await this.syncMeta.clear();
      }
    );
  }

  /**
   * Get pending sync count
   */
  async getPendingSyncCount(): Promise<number> {
    return await this.syncQueue.where('status').equals('pending').count();
  }

  /**
   * Check if there are unsynced changes
   */
  async hasUnsyncedChanges(): Promise<boolean> {
    const pendingCount = await this.getPendingSyncCount();
    return pendingCount > 0;
  }
}

// Singleton instance
export const db = new GearBaseDB();

// Helper to generate local UUIDs
export function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Helper to create synced record
export function createSyncableRecord<T>(data: T, status: SyncStatus = 'pending'): T & SyncableRecord {
  return {
    ...data,
    _syncStatus: status,
    _lastModified: Date.now(),
  };
}

// Helper to mark record as modified
export function markAsModified<T extends SyncableRecord>(record: T): T {
  return {
    ...record,
    _syncStatus: 'pending',
    _lastModified: Date.now(),
  };
}
