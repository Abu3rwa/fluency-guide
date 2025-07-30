import { useState, useEffect, useCallback } from "react";

const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cache vocabulary data
  const cacheVocabularyData = useCallback(async (data) => {
    try {
      if ("caches" in window) {
        const cache = await caches.open("vocabulary-cache-v1");
        const response = new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
        await cache.put("/api/vocabulary", response);

        // Also store in localStorage as backup
        localStorage.setItem(
          "vocabulary-data",
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      }
    } catch (error) {
      console.error("Error caching vocabulary data:", error);
    }
  }, []);

  // Get cached vocabulary data
  const getCachedVocabularyData = useCallback(async () => {
    try {
      // Try cache first
      if ("caches" in window) {
        const cache = await caches.open("vocabulary-cache-v1");
        const response = await cache.match("/api/vocabulary");
        if (response) {
          const data = await response.json();
          return data;
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem("vocabulary-data");
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        // Check if data is not too old (24 hours)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting cached vocabulary data:", error);
      return null;
    }
  }, []);

  // Cache user progress
  const cacheUserProgress = useCallback(async (progress) => {
    try {
      localStorage.setItem(
        "vocabulary-progress",
        JSON.stringify({
          data: progress,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Error caching user progress:", error);
    }
  }, []);

  // Get cached user progress
  const getCachedUserProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem("vocabulary-progress");
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        // Check if data is not too old (7 days)
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting cached user progress:", error);
      return null;
    }
  }, []);

  // Queue offline actions
  const queueOfflineAction = useCallback((action) => {
    try {
      const queue = JSON.parse(
        localStorage.getItem("vocabulary-offline-queue") || "[]"
      );
      queue.push({
        ...action,
        timestamp: Date.now(),
      });
      localStorage.setItem("vocabulary-offline-queue", JSON.stringify(queue));
    } catch (error) {
      console.error("Error queuing offline action:", error);
    }
  }, []);

  // Process offline queue
  const processOfflineQueue = useCallback(async () => {
    try {
      const queue = JSON.parse(
        localStorage.getItem("vocabulary-offline-queue") || "[]"
      );
      if (queue.length === 0) return;

      // Process actions in order
      for (const action of queue) {
        try {
          // Here you would implement the actual API calls
          // For now, we'll just log them
          console.log("Processing offline action:", action);

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error("Error processing offline action:", error);
        }
      }

      // Clear the queue after processing
      localStorage.removeItem("vocabulary-offline-queue");
    } catch (error) {
      console.error("Error processing offline queue:", error);
    }
  }, []);

  // Clear old cache data
  const clearOldCache = useCallback(async () => {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(
          (name) =>
            name.startsWith("vocabulary-cache-") &&
            name !== "vocabulary-cache-v1"
        );

        await Promise.all(oldCaches.map((name) => caches.delete(name)));
      }
    } catch (error) {
      console.error("Error clearing old cache:", error);
    }
  }, []);

  return {
    isOnline,
    offlineData,
    cacheVocabularyData,
    getCachedVocabularyData,
    cacheUserProgress,
    getCachedUserProgress,
    queueOfflineAction,
    processOfflineQueue,
    clearOldCache,
  };
};

export default useOfflineSupport;
