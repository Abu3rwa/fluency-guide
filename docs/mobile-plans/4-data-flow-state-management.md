# 4. Data Flow and State Management

## Overview

This plan outlines the comprehensive data flow architecture for the React Native mobile application, emphasizing offline-first capabilities, efficient state management, and seamless synchronization with the existing Firebase backend. The architecture ensures data consistency across online and offline modes while providing optimal performance on mobile devices.

## State Management Architecture

### 1. Redux Toolkit Store Structure

**Root Store Configuration:**
```typescript
// app/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rootReducer } from './rootReducer';
import { middleware } from './middleware';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'courses', 'progress', 'settings'],
  blacklist: ['ui', 'api'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(middleware),
  devTools: __DEV__,
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
```

**Store Slices Organization:**
```
store/
├── slices/
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── authSelectors.ts
│   │   └── authThunks.ts
│   ├── courses/
│   │   ├── coursesSlice.ts
│   │   ├── courseSelectors.ts
│   │   └── courseThunks.ts
│   ├── lessons/
│   │   ├── lessonsSlice.ts
│   │   ├── lessonSelectors.ts
│   │   └── lessonThunks.ts
│   ├── tasks/
│   │   ├── tasksSlice.ts
│   │   ├── taskSelectors.ts
│   │   └── taskThunks.ts
│   ├── progress/
│   │   ├── progressSlice.ts
│   │   ├── progressSelectors.ts
│   │   └── progressThunks.ts
│   ├── notifications/
│   │   ├── notificationsSlice.ts
│   │   ├── notificationSelectors.ts
│   │   └── notificationThunks.ts
│   └── ui/
│       ├── uiSlice.ts
│       └── uiSelectors.ts
├── rootReducer.ts
├── middleware.ts
└── hooks.ts
```

### 2. Authentication State Management

**Auth Slice Implementation:**
```typescript
// store/slices/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
  lastLogin: Date | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricEnabled: false,
  lastLogin: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    setLastLogin: (state, action: PayloadAction<Date>) => {
      state.lastLogin = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastLogin = null;
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  setBiometricEnabled,
  setLastLogin,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
```

**Auth Thunks:**
```typescript
// store/slices/auth/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../../../services/firebase';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await signOut(auth);
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    return new Promise<User | null>((resolve) => {
      onAuthStateChanged(auth, (user) => {
        dispatch(setUser(user));
        resolve(user);
      });
    });
  }
);
```

## Data Flow Patterns

### 1. API Integration with RTK Query

**API Service Configuration:**
```typescript
// services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.yourapp.com',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.user?.getIdToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: (builder) => ({
    // Course endpoints
    getCourses: builder.query({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      providesTags: ['Courses'],
    }),
    getCourse: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Courses', id }],
    }),
    enrollCourse: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}/enroll`,
        method: 'POST',
      }),
      invalidatesTags: ['Courses', 'User'],
    }),

    // Lesson endpoints
    getLessons: builder.query({
      query: (courseId) => `/courses/${courseId}/lessons`,
      providesTags: ['Lessons'],
    }),
    getLesson: builder.query({
      query: ({ courseId, lessonId }) =>
        `/courses/${courseId}/lessons/${lessonId}`,
      providesTags: (result, error, { lessonId }) => [
        { type: 'Lessons', id: lessonId },
      ],
    }),
    updateProgress: builder.mutation({
      query: ({ lessonId, progress }) => ({
        url: `/lessons/${lessonId}/progress`,
        method: 'PUT',
        body: { progress },
      }),
      invalidatesTags: ['Progress'],
    }),

    // Task endpoints
    getTasks: builder.query({
      query: (lessonId) => `/lessons/${lessonId}/tasks`,
      providesTags: ['Tasks'],
    }),
    submitTask: builder.mutation({
      query: ({ taskId, answers }) => ({
        url: `/tasks/${taskId}/submit`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['Tasks', 'Progress'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useEnrollCourseMutation,
  useGetLessonsQuery,
  useGetLessonQuery,
  useUpdateProgressMutation,
  useGetTasksQuery,
  useSubmitTaskMutation,
} = api;
```

### 2. Offline Queue Management

**Queue Service Implementation:**
```typescript
// services/queue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class QueueService {
  private queue: QueuedAction[] = [];
  private isProcessing = false;
  private readonly QUEUE_KEY = '@offline_queue';

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  async addToQueue(action: QueuedAction) {
    this.queue.push({
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0,
    });
    await this.saveQueue();
    await this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const action = this.queue[0];

      try {
        await this.executeAction(action);
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        action.retryCount++;

        if (action.retryCount >= 3) {
          // Move to failed queue or notify user
          this.queue.shift();
          await this.saveQueue();
          this.handleFailedAction(action);
        } else {
          // Retry with exponential backoff
          await new Promise(resolve =>
            setTimeout(resolve, Math.pow(2, action.retryCount) * 1000)
          );
        }
      }
    }

    this.isProcessing = false;
  }

  private async executeAction(action: QueuedAction) {
    switch (action.type) {
      case 'UPDATE_PROGRESS':
        await this.executeProgressUpdate(action.payload);
        break;
      case 'SUBMIT_TASK':
        await this.executeTaskSubmission(action.payload);
        break;
      case 'ENROLL_COURSE':
        await this.executeCourseEnrollment(action.payload);
        break;
    }
  }

  private async saveQueue() {
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
  }

  private async loadQueue() {
    const saved = await AsyncStorage.getItem(this.QUEUE_KEY);
    if (saved) {
      this.queue = JSON.parse(saved);
    }
  }

  private handleFailedAction(action: QueuedAction) {
    // Notify user of failed action
    // Could dispatch to Redux store for UI notification
  }
}

interface QueuedAction {
  id: string;
  type: 'UPDATE_PROGRESS' | 'SUBMIT_TASK' | 'ENROLL_COURSE';
  payload: any;
  timestamp: number;
  retryCount: number;
}

export const queueService = new QueueService();
```

## Offline Data Management

### 1. SQLite Integration for Complex Data

**Database Schema:**
```typescript
// services/database.ts
import SQLite from 'react-native-sqlite-storage';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    this.db = await SQLite.openDatabase({
      name: 'app.db',
      location: 'default',
    });

    await this.createTables();
  }

  private async createTables() {
    if (!this.db) return;

    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        thumbnail TEXT,
        instructor TEXT,
        data TEXT,
        downloaded_at INTEGER,
        last_accessed INTEGER
      )
    `);

    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        course_id TEXT,
        title TEXT,
        content TEXT,
        video_url TEXT,
        data TEXT,
        downloaded_at INTEGER,
        last_accessed INTEGER,
        FOREIGN KEY (course_id) REFERENCES courses (id)
      )
    `);

    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        course_id TEXT,
        lesson_id TEXT,
        progress REAL,
        completed INTEGER,
        last_updated INTEGER,
        FOREIGN KEY (course_id) REFERENCES courses (id),
        FOREIGN KEY (lesson_id) REFERENCES lessons (id)
      )
    `);
  }

  async saveCourse(course: Course) {
    if (!this.db) return;

    await this.db.executeSql(
      `INSERT OR REPLACE INTO courses
       (id, title, description, thumbnail, instructor, data, downloaded_at, last_accessed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course.id,
        course.title,
        course.description,
        course.thumbnail,
        course.instructor,
        JSON.stringify(course),
        Date.now(),
        Date.now(),
      ]
    );
  }

  async getCourse(courseId: string): Promise<Course | null> {
    if (!this.db) return null;

    const [results] = await this.db.executeSql(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return JSON.parse(row.data);
    }

    return null;
  }

  async updateProgress(courseId: string, lessonId: string, progress: number) {
    if (!this.db) return;

    await this.db.executeSql(
      `INSERT OR REPLACE INTO progress
       (id, user_id, course_id, lesson_id, progress, completed, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `${courseId}_${lessonId}`,
        'current_user_id', // Get from auth state
        courseId,
        lessonId,
        progress,
        progress >= 1 ? 1 : 0,
        Date.now(),
      ]
    );
  }
}

export const databaseService = new DatabaseService();
```

### 2. Conflict Resolution Strategy

**Conflict Resolution Service:**
```typescript
// services/conflictResolution.ts
import { store } from '../store';
import { queueService } from './queue';

class ConflictResolutionService {
  async resolveProgressConflict(
    localProgress: ProgressData,
    serverProgress: ProgressData
  ): Promise<ProgressData> {
    // Strategy: Server wins for completion status, merge for detailed progress
    const resolved = {
      ...serverProgress,
      detailedProgress: {
        ...localProgress.detailedProgress,
        ...serverProgress.detailedProgress,
      },
      lastSynced: Date.now(),
    };

    // If local has more progress, queue update to server
    if (localProgress.overallProgress > serverProgress.overallProgress) {
      await queueService.addToQueue({
        type: 'UPDATE_PROGRESS',
        payload: {
          courseId: localProgress.courseId,
          progress: localProgress.overallProgress,
        },
      });
    }

    return resolved;
  }

  async resolveTaskSubmissionConflict(
    localSubmission: TaskSubmission,
    serverSubmission: TaskSubmission
  ): Promise<TaskSubmission> {
    // Strategy: Keep the higher score
    if (localSubmission.score > serverSubmission.score) {
      return localSubmission;
    } else if (serverSubmission.score > localSubmission.score) {
      return serverSubmission;
    } else {
      // Same score, keep the earlier submission
      return localSubmission.timestamp < serverSubmission.timestamp
        ? localSubmission
        : serverSubmission;
    }
  }

  async handleSyncConflict(conflict: SyncConflict) {
    const resolution = await this.resolveConflict(conflict);

    // Update local state
    store.dispatch(updateLocalData(resolution));

    // Queue server update if needed
    if (resolution.needsServerUpdate) {
      await queueService.addToQueue({
        type: conflict.type,
        payload: resolution.data,
      });
    }
  }
}

interface SyncConflict {
  type: 'PROGRESS_UPDATE' | 'TASK_SUBMISSION' | 'COURSE_ENROLLMENT';
  localData: any;
  serverData: any;
  courseId: string;
  userId: string;
}

export const conflictResolutionService = new ConflictResolutionService();
```

## Real-time Data Synchronization

### 1. Firestore Real-time Listeners

**Real-time Service:**
```typescript
// services/realtime.ts
import { onSnapshot, doc, collection, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { store } from '../store';
import { updateCourseProgress, updateLessonProgress } from '../store/slices/progress';

class RealtimeService {
  private listeners: { [key: string]: () => void } = {};

  subscribeToCourseProgress(courseId: string, userId: string) {
    const listenerId = `course_progress_${courseId}`;

    if (this.listeners[listenerId]) {
      this.listeners[listenerId]();
    }

    const q = query(
      collection(db, 'courseProgress'),
      where('courseId', '==', courseId),
      where('userId', '==', userId)
    );

    this.listeners[listenerId] = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const progress = change.doc.data();
          store.dispatch(updateCourseProgress({
            courseId,
            progress: progress.overallProgress,
            lastUpdated: progress.lastUpdated?.toDate(),
          }));
        }
      });
    });
  }

  subscribeToLessonProgress(lessonId: string, userId: string) {
    const listenerId = `lesson_progress_${lessonId}`;

    if (this.listeners[listenerId]) {
      this.listeners[listenerId]();
    }

    const docRef = doc(db, 'lessonProgress', `${userId}_${lessonId}`);

    this.listeners[listenerId] = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const progress = doc.data();
        store.dispatch(updateLessonProgress({
          lessonId,
          progress: progress.progress,
          completed: progress.completed,
          lastUpdated: progress.lastUpdated?.toDate(),
        }));
      }
    });
  }

  unsubscribe(listenerId: string) {
    if (this.listeners[listenerId]) {
      this.listeners[listenerId]();
      delete this.listeners[listenerId];
    }
  }

  unsubscribeAll() {
    Object.keys(this.listeners).forEach(id => {
      this.listeners[id]();
    });
    this.listeners = {};
  }
}

export const realtimeService = new RealtimeService();
```

### 2. Background Sync Management

**Background Sync Service:**
```typescript
// services/backgroundSync.ts
import BackgroundFetch from 'react-native-background-fetch';
import { conflictResolutionService } from './conflictResolution';
import { queueService } from './queue';

class BackgroundSyncService {
  async initialize() {
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

  async performBackgroundSync() {
    try {
      // Check network connectivity
      const isConnected = await this.checkNetworkConnectivity();
      if (!isConnected) return;

      // Process offline queue
      await queueService.processQueue();

      // Sync pending changes
      await this.syncPendingChanges();

      // Resolve conflicts
      await this.resolveConflicts();

      // Update real-time subscriptions
      await this.refreshSubscriptions();

    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  private async checkNetworkConnectivity(): Promise<boolean> {
    // Implementation for network check
    return true; // Placeholder
  }

  private async syncPendingChanges() {
    // Sync local changes to server
    const pendingChanges = await this.getPendingChanges();
    for (const change of pendingChanges) {
      await this.syncChange(change);
    }
  }

  private async resolveConflicts() {
    const conflicts = await this.getConflicts();
    for (const conflict of conflicts) {
      await conflictResolutionService.handleSyncConflict(conflict);
    }
  }

  private async refreshSubscriptions() {
    // Refresh real-time listeners
    const activeSubscriptions = await this.getActiveSubscriptions();
    for (const subscription of activeSubscriptions) {
      await this.refreshSubscription(subscription);
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService();
```

## Performance Optimization

### 1. Selective Data Fetching

**Smart Cache Implementation:**
```typescript
// services/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (entry && !this.isExpired(entry)) {
      return entry.data as T;
    }

    // Check AsyncStorage as fallback
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!this.isExpired(parsed)) {
        this.cache.set(key, parsed);
        return parsed.data as T;
      } else {
        await AsyncStorage.removeItem(key);
      }
    }

    return null;
  }

  async set<T>(key: string, data: T, ttl: number = 300000): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry);
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  async invalidate(pattern: string): Promise<void> {
    // Remove cache entries matching pattern
    const keysToDelete = Array.from(this.cache.keys()).filter(key =>
      key.includes(pattern)
    );

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      AsyncStorage.removeItem(key);
    });
  }
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export const cacheService = new CacheService();
```

### 2. Data Pagination and Virtualization

**Virtualized List Implementation:**
```typescript
// components/VirtualizedCourseList.tsx
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@reduxjs/toolkit/query/react';

const VirtualizedCourseList = ({ category }: { category?: string }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    query: api.endpoints.getCourses,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: { category, limit: 20 },
  });

  const courses = data?.pages.flatMap(page => page.courses) ?? [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <FlashList
      data={courses}
      renderItem={({ item }) => <CourseCard course={item} />}
      keyExtractor={item => item.id}
      estimatedItemSize={120}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <LoadingSpinner /> : null
      }
    />
  );
};
```

This comprehensive data flow and state management plan provides a robust foundation for handling complex data operations in the mobile application, ensuring optimal performance and user experience across online and offline scenarios.