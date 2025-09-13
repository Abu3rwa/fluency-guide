// Mobile Performance Optimization Utilities
// Provides performance optimizations specifically for mobile task pages

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Device detection utilities
export const detectDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isAndroid = /android/i.test(userAgent);
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  const hasLimitedMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  
  return {
    isMobile,
    isIOS,
    isAndroid,
    isLowEndDevice,
    hasLimitedMemory,
    shouldReduceAnimations: isLowEndDevice || hasLimitedMemory,
    shouldUseLazyLoading: isMobile || isLowEndDevice,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
  });

  const measureRenderTime = useCallback((startTime) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    setMetrics(prev => ({ ...prev, renderTime }));
    
    // Log performance issues
    if (renderTime > 100) {
      console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
    }
    
    return renderTime;
  }, []);

  const measureInteraction = useCallback((callback) => {
    const startTime = performance.now();
    
    return (...args) => {
      const result = callback(...args);
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      setMetrics(prev => ({ ...prev, interactionTime }));
      
      if (interactionTime > 50) {
        console.warn(`Slow interaction detected: ${interactionTime.toFixed(2)}ms`);
      }
      
      return result;
    };
  }, []);

  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      const usagePercentage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
      
      setMetrics(prev => ({ ...prev, memoryUsage: usagePercentage }));
      
      if (usagePercentage > 80) {
        console.warn(`High memory usage detected: ${usagePercentage.toFixed(2)}%`);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(updateMemoryUsage, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [updateMemoryUsage]);

  return {
    metrics,
    measureRenderTime,
    measureInteraction,
  };
};

// Image optimization hook
export const useOptimizedImages = (images = []) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const observerRef = useRef(null);

  const createOptimizedImageUrl = useCallback((url, options = {}) => {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp',
    } = options;

    // Return original URL if it's already optimized or is a data URL
    if (url.includes('?') || url.startsWith('data:')) {
      return url;
    }

    // Add optimization parameters
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&h=${height}&q=${quality}&f=${format}`;
  }, []);

  const preloadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, src]));
        resolve(img);
      };
      img.onerror = () => {
        setFailedImages(prev => new Set([...prev, src]));
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (imageUrls) => {
    const promises = imageUrls.map(url => preloadImage(url));
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }, [preloadImage]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!images.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            
            if (src && !loadedImages.has(src)) {
              preloadImage(src);
              observerRef.current.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [images, loadedImages, preloadImage]);

  return {
    createOptimizedImageUrl,
    preloadImage,
    preloadImages,
    loadedImages,
    failedImages,
    observeElement: (element) => {
      if (observerRef.current && element) {
        observerRef.current.observe(element);
      }
    },
  };
};

// Request batching and debouncing
export const useBatchedRequests = (batchSize = 5, batchDelay = 100) => {
  const requestQueue = useRef([]);
  const timeoutRef = useRef(null);

  const addRequest = useCallback((requestFn) => {
    return new Promise((resolve, reject) => {
      requestQueue.current.push({ requestFn, resolve, reject });

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Process batch when size limit reached or after delay
      if (requestQueue.current.length >= batchSize) {
        processBatch();
      } else {
        timeoutRef.current = setTimeout(processBatch, batchDelay);
      }
    });
  }, [batchSize, batchDelay]);

  const processBatch = useCallback(async () => {
    if (requestQueue.current.length === 0) return;

    const batch = requestQueue.current.splice(0, batchSize);
    
    try {
      const promises = batch.map(({ requestFn }) => requestFn());
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        const { resolve, reject } = batch[index];
        
        if (result.status === 'fulfilled') {
          resolve(result.value);
        } else {
          reject(result.reason);
        }
      });
    } catch (error) {
      batch.forEach(({ reject }) => reject(error));
    }

    // Process remaining requests
    if (requestQueue.current.length > 0) {
      setTimeout(processBatch, 0);
    }
  }, [batchSize]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { addRequest };
};

// Memory management utilities
export const useMemoryManagement = () => {
  const cleanupFunctions = useRef([]);

  const addCleanup = useCallback((cleanupFn) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  const forceCleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    cleanupFunctions.current = [];

    // Force garbage collection if available (development only)
    if (window.gc && process.env.NODE_ENV === 'development') {
      window.gc();
    }
  }, []);

  // Auto cleanup on memory pressure
  useEffect(() => {
    let memoryCheckInterval;

    if ('memory' in performance) {
      memoryCheckInterval = setInterval(() => {
        const memoryInfo = performance.memory;
        const usagePercentage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;

        if (usagePercentage > 85) {
          console.log('High memory usage detected, triggering cleanup');
          forceCleanup();
        }
      }, 15000); // Check every 15 seconds
    }

    return () => {
      if (memoryCheckInterval) {
        clearInterval(memoryCheckInterval);
      }
      forceCleanup();
    };
  }, [forceCleanup]);

  return {
    addCleanup,
    forceCleanup,
  };
};

// Optimized state management for large lists
export const useOptimizedList = (items = [], itemHeight = 50, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex: Math.max(0, startIndex),
      endIndex,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Mark scrolling as finished after delay
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 100);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    isScrolling,
    handleScroll,
  };
};

// Network request optimization
export const useOptimizedNetworking = () => {
  const requestCache = useRef(new Map());
  const abortControllers = useRef(new Map());

  const cachedRequest = useCallback(async (key, requestFn, cacheTime = 5 * 60 * 1000) => {
    // Check cache first
    const cached = requestCache.current.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }

    // Abort previous request if still pending
    const existingController = abortControllers.current.get(key);
    if (existingController) {
      existingController.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllers.current.set(key, controller);

    try {
      const data = await requestFn(controller.signal);
      
      // Cache the result
      requestCache.current.set(key, {
        data,
        timestamp: Date.now(),
      });

      // Clean up abort controller
      abortControllers.current.delete(key);

      return data;
    } catch (error) {
      // Clean up abort controller
      abortControllers.current.delete(key);
      
      if (error.name === 'AbortError') {
        console.log(`Request cancelled: ${key}`);
        return null;
      }
      
      throw error;
    }
  }, []);

  const clearCache = useCallback((key) => {
    if (key) {
      requestCache.current.delete(key);
    } else {
      requestCache.current.clear();
    }
  }, []);

  const abortAll = useCallback(() => {
    abortControllers.current.forEach(controller => {
      controller.abort();
    });
    abortControllers.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      abortAll();
    };
  }, [abortAll]);

  return {
    cachedRequest,
    clearCache,
    abortAll,
  };
};

// Main performance optimization hook
export const useMobileTaskOptimization = () => {
  const device = useMemo(() => detectDevice(), []);
  const performance = usePerformanceMonitor();
  const memory = useMemoryManagement();
  const networking = useOptimizedNetworking();

  const optimizationConfig = useMemo(() => ({
    // Reduce animations on low-end devices
    enableAnimations: !device.shouldReduceAnimations,
    
    // Use smaller batch sizes on mobile
    batchSize: device.isMobile ? 3 : 5,
    
    // Increase debounce delays on low-end devices
    debounceDelay: device.isLowEndDevice ? 500 : 300,
    
    // Enable lazy loading on mobile
    useLazyLoading: device.shouldUseLazyLoading,
    
    // Reduce image quality on mobile
    imageQuality: device.isMobile ? 70 : 90,
    
    // Enable aggressive caching on limited memory devices
    aggressiveCaching: device.hasLimitedMemory,
  }), [device]);

  return {
    device,
    performance,
    memory,
    networking,
    optimizationConfig,
  };
};

export default {
  detectDevice,
  usePerformanceMonitor,
  useOptimizedImages,
  useBatchedRequests,
  useMemoryManagement,
  useOptimizedList,
  useOptimizedNetworking,
  useMobileTaskOptimization,
};