import { QueryClient } from 'react-query';

// Create a client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Custom hooks for common queries
export const queryKeys = {
  user: 'user',
  courses: 'courses',
  lessons: 'lessons',
  tasks: 'tasks',
  vocabulary: 'vocabulary',
  achievements: 'achievements',
  notifications: 'notifications',
  messages: 'messages',
  recentActivity: 'recentActivity',
  pronunciationProgress: 'pronunciationProgress',
  vocabularyProgress: 'vocabularyProgress',
  studyTime: 'studyTime',
};

// Query invalidation helpers
export const invalidateQueries = {
  user: () => queryClient.invalidateQueries([queryKeys.user]),
  courses: () => queryClient.invalidateQueries([queryKeys.courses]),
  lessons: () => queryClient.invalidateQueries([queryKeys.lessons]),
  tasks: () => queryClient.invalidateQueries([queryKeys.tasks]),
  vocabulary: () => queryClient.invalidateQueries([queryKeys.vocabulary]),
  achievements: () => queryClient.invalidateQueries([queryKeys.achievements]),
  notifications: () => queryClient.invalidateQueries([queryKeys.notifications]),
  messages: () => queryClient.invalidateQueries([queryKeys.messages]),
  recentActivity: () => queryClient.invalidateQueries([queryKeys.recentActivity]),
  pronunciationProgress: () => queryClient.invalidateQueries([queryKeys.pronunciationProgress]),
  vocabularyProgress: () => queryClient.invalidateQueries([queryKeys.vocabularyProgress]),
  studyTime: () => queryClient.invalidateQueries([queryKeys.studyTime]),
};

// Prefetch helpers for better UX
export const prefetchQueries = {
  user: async () => {
    await queryClient.prefetchQuery([queryKeys.user], () => 
      // Add your user fetching logic here
      Promise.resolve({ id: 'user', name: 'User' })
    );
  },
  courses: async () => {
    await queryClient.prefetchQuery([queryKeys.courses], () =>
      // Add your courses fetching logic here
      Promise.resolve([])
    );
  },
};

export default queryClient; 