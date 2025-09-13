ocs/mobile-plans/5-integration-with-backend-services.md</path>
<content">  unsubscribe(listenerId: string): void {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  unsubscribeAll(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

export const syncService = new SyncService();
```

### 2. Background Sync Management

**Background Sync Service:**
```typescript
// services/backgroundSync.ts
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from './sync';
import { queueService } from './queue';

class BackgroundSyncService {
  async initialize(): Promise<void> {
    BackgroundFetch.configure({
      minimumFetchInterval: 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    }, async (taskId) => {
      await this.performBackgroundSync();
      BackgroundFetch.finish(taskId);
    });

    await BackgroundFetch.start();
  }

  async performBackgroundSync(): Promise<void> {
    try {
      // Process offline queue
      await queueService.processQueue();

      // Sync pending changes
      await this.syncPendingChanges();

      // Refresh real-time subscriptions
      await this.refreshSubscriptions();

    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  private async syncPendingChanges(): Promise<void> {
    const pendingChanges = await this.getPendingChanges();
    for (const change of pendingChanges) {
      await this.syncChange(change);
    }
  }

  private async refreshSubscriptions(): Promise<void> {
    // Refresh real-time listeners based on user preferences
    const activeSubscriptions = await this.getActiveSubscriptions();
    for (const subscription of activeSubscriptions) {
      await syncService.subscribeToCourseProgress(
        subscription.courseId,
        subscription.userId
      );
    }
  }

  private async getPendingChanges(): Promise<any[]> {
    // Retrieve pending changes from AsyncStorage
    const changes = await AsyncStorage.getItem('@pending_changes');
    return changes ? JSON.parse(changes) : [];
  }

  private async syncChange(change: any): Promise<void> {
    // Implement change synchronization logic
    switch (change.type) {
      case 'PROGRESS_UPDATE':
        await this.syncProgressUpdate(change);
        break;
      case 'TASK_SUBMISSION':
        await this.syncTaskSubmission(change);
        break;
    }
  }

  private async getActiveSubscriptions(): Promise<any[]> {
    // Get active course subscriptions for the current user
    const subscriptions = await AsyncStorage.getItem('@active_subscriptions');
    return subscriptions ? JSON.parse(subscriptions) : [];
  }
}

export const backgroundSyncService = new BackgroundSyncService();
```

## API Error Handling and Retry Logic

### 1. Network Error Handling

**Network Service Implementation:**
```typescript
// services/network.ts
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
}

class NetworkService {
  private retryDelays = [1000, 2000, 4000, 8000]; // Exponential backoff

  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  }

  async waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected && state.isInternetReachable) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        const delay = this.retryDelays[attempt] || 8000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  async getNetworkState(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected || false,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    };
  }

  onNetworkChange(callback: (state: NetworkState) => void): () => void {
    return NetInfo.addEventListener(state => {
      callback({
        isConnected: state.isConnected || false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });
  }
}

export const networkService = new NetworkService();
```

### 2. API Response Caching

**Cache Service Implementation:**
```typescript
// services/apiCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { networkService } from './network';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiCacheService {
  private readonly CACHE_PREFIX = '@api_cache_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);

      if (this.isExpired(entry)) {
        await this.delete(key);
        return null;
      }

      return entry.data as T;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.DEFAULT_TTL,
      };

      await AsyncStorage.setItem(
        this.CACHE_PREFIX + key,
        JSON.stringify(entry)
      );
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Cache with network-aware TTL
  async setNetworkAware<T>(
    key: string,
    data: T,
    onlineTtl: number = 5 * 60 * 1000,
    offlineTtl: number = 30 * 60 * 1000
  ): Promise<void> {
    const isConnected = await networkService.isConnected();
    const ttl = isConnected ? onlineTtl : offlineTtl;
    await this.set(key, data, ttl);
  }
}

export const apiCacheService = new ApiCacheService();
```

## Data Migration and Versioning

### 1. Database Migration Service

**Migration Service Implementation:**
```typescript
// services/migration.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { databaseService } from './database';

interface Migration {
  version: number;
  description: string;
  up: () => Promise<void>;
}

class MigrationService {
  private readonly VERSION_KEY = '@db_version';
  private readonly CURRENT_VERSION = 1;

  private migrations: Migration[] = [
    {
      version: 1,
      description: 'Initial database setup',
      up: async () => {
        // Create initial tables
        await databaseService.initialize();
      },
    },
  ];

  async runMigrations(): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion();

      if (currentVersion >= this.CURRENT_VERSION) {
        return; // Already up to date
      }

      for (let version = currentVersion + 1; version <= this.CURRENT_VERSION; version++) {
        const migration = this.migrations.find(m => m.version === version);
        if (migration) {
          console.log(`Running migration ${version}: ${migration.description}`);
          await migration.up();
          await this.setCurrentVersion(version);
        }
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private async getCurrentVersion(): Promise<number> {
    try {
      const version = await AsyncStorage.getItem(this.VERSION_KEY);
      return version ? parseInt(version, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  private async setCurrentVersion(version: number): Promise<void> {
    await AsyncStorage.setItem(this.VERSION_KEY, version.toString());
  }
}

export const migrationService = new MigrationService();
```

### 2. API Version Compatibility

**Version Service Implementation:**
```typescript
// services/apiVersion.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiVersion {
  minSupportedVersion: string;
  currentVersion: string;
  deprecatedVersions: string[];
}

class ApiVersionService {
  private readonly VERSION_KEY = '@api_version_info';

  async checkVersionCompatibility(): Promise<{
    isCompatible: boolean;
    needsUpdate: boolean;
    message?: string;
  }> {
    try {
      // This would typically fetch version info from an API endpoint
      const versionInfo = await this.getVersionInfo();

      const deviceVersion = '1.0.0'; // App version
      const minSupported = versionInfo.minSupportedVersion;

      if (this.isVersionLessThan(deviceVersion, minSupported)) {
        return {
          isCompatible: false,
          needsUpdate: true,
          message: 'Please update the app to continue using this service.',
        };
      }

      return {
        isCompatible: true,
        needsUpdate: false,
      };
    } catch (error) {
      // If we can't check, assume compatible
      return {
        isCompatible: true,
        needsUpdate: false,
      };
    }
  }

  private async getVersionInfo(): Promise<ApiVersion> {
    // In a real implementation, this would fetch from an API
    // For now, return mock data
    return {
      minSupportedVersion: '1.0.0',
      currentVersion: '1.0.0',
      deprecatedVersions: [],
    };
  }

  private isVersionLessThan(version1: string, version2: string): boolean {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const part1 = v1[i] || 0;
      const part2 = v2[i] || 0;

      if (part1 < part2) return true;
      if (part1 > part2) return false;
    }

    return false;
  }
}

export const apiVersionService = new ApiVersionService();
```

## Security Implementation

### 1. Secure Storage Service

**Secure Storage Implementation:**
```typescript
// services/secureStorage.ts
import EncryptedStorage from 'react-native-encrypted-storage';
import { authService } from './auth';

class SecureStorageService {
  private readonly SENSITIVE_DATA_KEY = 'sensitive_data';

  async storeSensitiveData(key: string, data: any): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const storageKey = `${userId}_${key}`;

      const encryptedData = JSON.stringify({
        data,
        timestamp: Date.now(),
      });

      await EncryptedStorage.setItem(storageKey, encryptedData);
    } catch (error) {
      throw new Error(`Failed to store sensitive data: ${error.message}`);
    }
  }

  async getSensitiveData(key: string): Promise<any> {
    try {
      const userId = await this.getCurrentUserId();
      const storageKey = `${userId}_${key}`;

      const encryptedData = await EncryptedStorage.getItem(storageKey);
      if (!encryptedData) return null;

      const { data } = JSON.parse(encryptedData);
      return data;
    } catch (error) {
      console.error('Failed to retrieve sensitive data:', error);
      return null;
    }
  }

  async deleteSensitiveData(key: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const storageKey = `${userId}_${key}`;

      await EncryptedStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to delete sensitive data:', error);
    }
  }

  async clearAllSensitiveData(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const keys = await EncryptedStorage.getAllKeys();

      const userKeys = keys.filter(key => key.startsWith(`${userId}_`));
      await EncryptedStorage.multiRemove(userKeys);
    } catch (error) {
      console.error('Failed to clear sensitive data:', error);
    }
  }

  private async getCurrentUserId(): Promise<string> {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user');
    }
    return user.uid;
  }
}

export const secureStorageService = new SecureStorageService();
```

### 2. Certificate Pinning

**Network Security Service:**
```typescript
// services/networkSecurity.ts
import { config } from '../config';

class NetworkSecurityService {
  getCertificatePins(): { [hostname: string]: string[] } {
    return {
      'api.yourapp.com': [
        'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
      ],
      'storage.googleapis.com': [
        'sha256/CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=',
      ],
    };
  }

  validateCertificate(hostname: string, certificate: string): boolean {
    const pins = this.getCertificatePins()[hostname];
    if (!pins) return true; // No pins configured for this hostname

    return pins.includes(certificate);
  }

  getSecurityConfig() {
    return {
      certificatePinning: true,
      certificatePins: this.getCertificatePins(),
      minTlsVersion: '1.2',
      validateCertificate: this.validateCertificate.bind(this),
    };
  }
}

export const networkSecurityService = new NetworkSecurityService();
```

This comprehensive integration plan provides a robust foundation for connecting the mobile application with the existing Firebase backend while implementing mobile-specific optimizations for performance, security, and offline capabilities.