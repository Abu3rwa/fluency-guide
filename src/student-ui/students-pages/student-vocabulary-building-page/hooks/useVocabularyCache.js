import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for vocabulary caching to improve performance
 */
export const useVocabularyCache = () => {
  const [cache, setCache] = useState(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
  });

  // Cache TTL (Time To Live) - 30 minutes
  const CACHE_TTL = 30 * 60 * 1000;

  /**
   * Get cached data if available and not expired
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if not found/expired
   */
  const getCachedData = useCallback(
    (key) => {
      const cached = cache.get(key);
      if (!cached) {
        setCacheStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
        return null;
      }

      // Check if cache is expired
      if (Date.now() - cached.timestamp > CACHE_TTL) {
        cache.delete(key);
        setCacheStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
        return null;
      }

      setCacheStats((prev) => ({ ...prev, hits: prev.hits + 1 }));
      return cached.data;
    },
    [cache]
  );

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  const setCachedData = useCallback(
    (key, data) => {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };

      setCache((prev) => {
        const newCache = new Map(prev);
        newCache.set(key, cacheEntry);
        return newCache;
      });

      setCacheStats((prev) => ({
        ...prev,
        size: cache.size + 1,
      }));
    },
    [cache.size]
  );

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key to clear
   */
  const clearCacheEntry = useCallback((key) => {
    setCache((prev) => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });

    setCacheStats((prev) => ({
      ...prev,
      size: Math.max(0, prev.size - 1),
    }));
  }, []);

  /**
   * Clear all cache
   */
  const clearAllCache = useCallback(() => {
    setCache(new Map());
    setCacheStats({ hits: 0, misses: 0, size: 0 });
  }, []);

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  const getCacheStats = useCallback(() => {
    const hitRate =
      cacheStats.hits + cacheStats.misses > 0
        ? (
            (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) *
            100
          ).toFixed(2)
        : 0;

    return {
      ...cacheStats,
      hitRate: `${hitRate}%`,
      totalRequests: cacheStats.hits + cacheStats.misses,
    };
  }, [cacheStats]);

  /**
   * Clean up expired cache entries
   */
  const cleanupExpiredCache = useCallback(() => {
    const now = Date.now();
    let expiredCount = 0;

    setCache((prev) => {
      const newCache = new Map();
      for (const [key, value] of prev.entries()) {
        if (now - value.timestamp <= CACHE_TTL) {
          newCache.set(key, value);
        } else {
          expiredCount++;
        }
      }
      return newCache;
    });

    if (expiredCount > 0) {
      setCacheStats((prev) => ({
        ...prev,
        size: Math.max(0, prev.size - expiredCount),
      }));
    }
  }, []);

  // Auto-cleanup expired cache entries every 5 minutes
  useEffect(() => {
    const interval = setInterval(cleanupExpiredCache, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cleanupExpiredCache]);

  return {
    getCachedData,
    setCachedData,
    clearCacheEntry,
    clearAllCache,
    getCacheStats,
    cleanupExpiredCache,
  };
};
