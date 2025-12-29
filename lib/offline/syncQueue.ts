/**
 * Sync Queue Manager
 * Queues operations when offline for later synchronization
 */

import { db, SyncQueueEntry, SyncOperation } from './db';

export class SyncQueueManager {
  /**
   * Add an operation to the sync queue
   */
  async enqueue(
    table: string,
    operation: SyncOperation,
    recordId: string | number,
    data: any
  ): Promise<number> {
    const entry: SyncQueueEntry = {
      table,
      operation,
      recordId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    // Check for existing entry for same record - merge if exists
    const existing = await db.syncQueue
      .where('[table+recordId]')
      .equals([table, recordId])
      .first();

    if (existing) {
      // Merge operations
      if (existing.operation === 'create' && operation === 'update') {
        // Keep as create with updated data
        await db.syncQueue.update(existing.id!, {
          data: { ...existing.data, ...data },
          timestamp: Date.now()
        });
        return existing.id!;
      }

      if (existing.operation === 'create' && operation === 'delete') {
        // Remove from queue entirely (never synced, now deleted)
        await db.syncQueue.delete(existing.id!);
        return -1;
      }

      if (existing.operation === 'update' && operation === 'delete') {
        // Change to delete operation
        await db.syncQueue.update(existing.id!, {
          operation: 'delete',
          timestamp: Date.now()
        });
        return existing.id!;
      }

      // Default: update the existing entry
      await db.syncQueue.update(existing.id!, {
        data,
        timestamp: Date.now()
      });
      return existing.id!;
    }

    return await db.syncQueue.add(entry);
  }

  /**
   * Get all pending operations
   */
  async getPending(): Promise<SyncQueueEntry[]> {
    return await db.syncQueue
      .where('status')
      .equals('pending')
      .sortBy('timestamp');
  }

  /**
   * Get pending count
   */
  async getPendingCount(): Promise<number> {
    return await db.syncQueue.where('status').equals('pending').count();
  }

  /**
   * Mark an entry as processing
   */
  async markProcessing(id: number): Promise<void> {
    await db.syncQueue.update(id, { status: 'processing' });
  }

  /**
   * Mark an entry as completed (delete it)
   */
  async markCompleted(id: number): Promise<void> {
    await db.syncQueue.delete(id);
  }

  /**
   * Mark an entry as failed
   */
  async markFailed(id: number, error: string): Promise<void> {
    const entry = await db.syncQueue.get(id);
    if (entry) {
      await db.syncQueue.update(id, {
        status: entry.retryCount >= 3 ? 'failed' : 'pending',
        lastError: error,
        retryCount: entry.retryCount + 1
      });
    }
  }

  /**
   * Reset failed entries to pending (for retry)
   */
  async resetFailed(): Promise<number> {
    const failed = await db.syncQueue.where('status').equals('failed').toArray();
    for (const entry of failed) {
      await db.syncQueue.update(entry.id!, {
        status: 'pending',
        retryCount: 0,
        lastError: undefined
      });
    }
    return failed.length;
  }

  /**
   * Clear all entries
   */
  async clear(): Promise<void> {
    await db.syncQueue.clear();
  }

  /**
   * Get failed entries
   */
  async getFailed(): Promise<SyncQueueEntry[]> {
    return await db.syncQueue.where('status').equals('failed').toArray();
  }
}

// Singleton instance
export const syncQueue = new SyncQueueManager();
