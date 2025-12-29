# Offline Support Documentation

Gear Base includes full Progressive Web App (PWA) support for offline operation in remote areas.

## Features

### 1. Progressive Web App (PWA)
- **Installable**: Can be installed on mobile devices and desktops
- **Offline-capable**: Works without internet connection
- **Fast loading**: Assets are cached for instant startup

### 2. Local Database (IndexedDB via Dexie.js)
All data is stored locally:
- Inventory items
- Jobs
- Kits
- Transactions
- User profiles
- Organizations

### 3. Sync Engine
- **Automatic sync**: Data syncs when coming back online
- **Conflict resolution**: Handles conflicts between local and server changes
- **Retry logic**: Failed syncs are retried automatically
- **Background sync**: Uses Service Worker for background synchronization

## How It Works

### Offline Data Flow
```
User Action → Local Database → Sync Queue → (When Online) → Supabase
```

### Sync Queue
Operations made while offline are queued:
1. Creates, updates, and deletes are stored locally
2. Each operation is added to a sync queue
3. When connectivity returns, queue is processed in order
4. Successful operations are removed from queue
5. Failed operations are retried (up to 3 times)

### Conflict Resolution
When local changes conflict with server changes:
- **Default**: Server wins (most recent server data is used)
- **Custom**: Can implement custom resolution strategies

## Architecture

### Files Structure
```
lib/offline/
├── db.ts           # Dexie database schema
├── syncQueue.ts    # Sync queue management
├── syncEngine.ts   # Bidirectional sync logic
├── hooks.ts        # React hooks for offline data
└── index.ts        # Module exports

public/
├── manifest.json   # PWA manifest
└── service-worker.js # Service worker for caching

components/
└── OfflineIndicator.tsx # UI status indicator
```

### Key Components

#### Database (db.ts)
- Defines IndexedDB schema using Dexie
- Includes sync metadata on all records
- Provides helpers for creating/updating synced records

#### Sync Queue (syncQueue.ts)
- Manages pending operations
- Merges redundant operations (create+update = create)
- Tracks retry counts for failed operations

#### Sync Engine (syncEngine.ts)
- Pulls data from Supabase
- Pushes local changes to server
- Handles conflict detection and resolution
- Supports table-specific sync

#### React Hooks (hooks.ts)
- `useOnlineStatus()` - Track online/offline state
- `useSyncStatus()` - Monitor sync progress
- `useAutoSync()` - Auto-sync when coming online
- `useOfflineInventory()` - CRUD for inventory with offline support
- `useOfflineJobs()` - CRUD for jobs with offline support
- `useOfflineKits()` - CRUD for kits with offline support

## Usage Examples

### Check Online Status
```tsx
import { useOnlineStatus } from './lib/offline';

function MyComponent() {
  const isOnline = useOnlineStatus();

  return <div>{isOnline ? 'Online' : 'Offline'}</div>;
}
```

### Use Offline Inventory
```tsx
import { useOfflineInventory } from './lib/offline';

function InventoryList() {
  const { data, create, update, remove, isOnline } = useOfflineInventory(organizationId);

  // Data is automatically synced when online
  // Operations work offline and sync when connection returns

  const handleAdd = async () => {
    await create({ name: 'New Item', ... });
    // Saved locally, will sync when online
  };

  return <ul>{data.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}
```

### Manual Sync
```tsx
import { syncEngine } from './lib/offline';

async function manualSync() {
  const result = await syncEngine.fullSync();
  console.log(`Synced: ${result.synced}, Failed: ${result.failed}`);
}
```

## Installing as PWA

### On Mobile (iOS/Android)
1. Open the app in Safari/Chrome
2. Tap "Share" (iOS) or menu (Android)
3. Select "Add to Home Screen"

### On Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click "Install"

## Service Worker Strategies

| Resource Type | Strategy | Description |
|--------------|----------|-------------|
| Static assets | Cache First | Serve from cache, fallback to network |
| API requests | Network First | Try network, fallback to cached response |
| HTML pages | Stale While Revalidate | Serve cached, update in background |

## Sync Status Indicator

The app shows sync status in the header:
- 🟢 **Online** - Connected to internet
- 🟡 **Offline** - No connection, changes queued
- 🔵 **Pending (#)** - Number of changes waiting to sync
- 🔴 **Failed (#)** - Number of failed sync operations

## Best Practices

1. **Always check online status** before showing features that require connectivity
2. **Show pending sync count** so users know their data will sync
3. **Handle sync errors gracefully** with retry options
4. **Clear local data on logout** to protect user privacy
5. **Test offline scenarios** during development

## Limitations

- Initial data load requires internet connection
- Real-time features (notifications, live updates) require connectivity
- Large file uploads are not cached offline
- QR code scanning works offline, but image uploads don't

## Troubleshooting

### Data not syncing
1. Check internet connection
2. Look for sync errors in console
3. Check pending queue: `syncEngine.getSyncStatus()`
4. Reset failed operations: `syncQueue.resetFailed()`

### PWA not installing
1. Ensure HTTPS is enabled
2. Check manifest.json is valid
3. Verify service worker is registered
4. Clear browser cache and retry

### Clear all local data
```javascript
import { db } from './lib/offline';
await db.clearAllData();
```
