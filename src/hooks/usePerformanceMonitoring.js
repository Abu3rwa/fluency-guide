import { useEffect, useCallback } from "react";

/**
 * Custom hook for monitoring Core Web Vitals and performance metrics
 */
export const usePerformanceMonitoring = (options = {}) => {
  const {
    enableLogging = process.env.NODE_ENV === "development",
    enableReporting = process.env.NODE_ENV === "production",
    reportingEndpoint = "/api/analytics/performance",
  } = options;

  // Log performance metric
  const logMetric = useCallback(
    (name, value, unit = "ms") => {
      if (enableLogging) {
        console.log(`[Performance] ${name}: ${value}${unit}`);
      }
    },
    [enableLogging]
  );

  // Report metric to analytics service
  const reportMetric = useCallback(
    async (metric) => {
      if (!enableReporting) return;

      try {
        await fetch(reportingEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...metric,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        });
      } catch (error) {
        console.warn("Failed to report performance metric:", error);
      }
    },
    [enableReporting, reportingEndpoint]
  );

  // Measure Core Web Vitals
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    // Dynamic import to avoid SSR issues
    import("web-vitals")
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        // Cumulative Layout Shift
        getCLS((metric) => {
          logMetric("CLS", metric.value.toFixed(4), "");
          reportMetric({
            name: "CLS",
            value: metric.value,
            rating: metric.rating,
            entries: metric.entries,
          });
        });

        // First Input Delay
        getFID((metric) => {
          logMetric("FID", metric.value.toFixed(2));
          reportMetric({
            name: "FID",
            value: metric.value,
            rating: metric.rating,
            entries: metric.entries,
          });
        });

        // First Contentful Paint
        getFCP((metric) => {
          logMetric("FCP", metric.value.toFixed(2));
          reportMetric({
            name: "FCP",
            value: metric.value,
            rating: metric.rating,
            entries: metric.entries,
          });
        });

        // Largest Contentful Paint
        getLCP((metric) => {
          logMetric("LCP", metric.value.toFixed(2));
          reportMetric({
            name: "LCP",
            value: metric.value,
            rating: metric.rating,
            entries: metric.entries,
          });
        });

        // Time to First Byte
        getTTFB((metric) => {
          logMetric("TTFB", metric.value.toFixed(2));
          reportMetric({
            name: "TTFB",
            value: metric.value,
            rating: metric.rating,
            entries: metric.entries,
          });
        });
      })
      .catch((error) => {
        console.warn("Failed to load web-vitals:", error);
      });
  }, [logMetric, reportMetric]);

  // Measure custom performance metrics
  const measureCustomMetric = useCallback(
    (name, startTime, endTime = performance.now()) => {
      const duration = endTime - startTime;
      logMetric(name, duration.toFixed(2));
      reportMetric({
        name: `custom_${name}`,
        value: duration,
        rating:
          duration < 100
            ? "good"
            : duration < 300
            ? "needs-improvement"
            : "poor",
      });
      return duration;
    },
    [logMetric, reportMetric]
  );

  // Measure component render time
  const measureRenderTime = useCallback(
    (componentName) => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        measureCustomMetric(`${componentName}_render`, startTime, endTime);
      };
    },
    [measureCustomMetric]
  );

  // Measure resource loading times
  const measureResourceLoading = useCallback(() => {
    if (typeof window === "undefined") return;

    // Measure navigation timing
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation) {
      logMetric(
        "DOM Content Loaded",
        navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart
      );
      logMetric(
        "Load Complete",
        navigation.loadEventEnd - navigation.loadEventStart
      );
      logMetric(
        "DNS Lookup",
        navigation.domainLookupEnd - navigation.domainLookupStart
      );
      logMetric(
        "TCP Connection",
        navigation.connectEnd - navigation.connectStart
      );
    }

    // Measure resource timing
    const resources = performance.getEntriesByType("resource");
    const imageResources = resources.filter((r) => r.initiatorType === "img");
    const scriptResources = resources.filter(
      (r) => r.initiatorType === "script"
    );
    const styleResources = resources.filter((r) => r.initiatorType === "link");

    if (imageResources.length > 0) {
      const avgImageLoad =
        imageResources.reduce((sum, r) => sum + r.duration, 0) /
        imageResources.length;
      logMetric("Average Image Load Time", avgImageLoad.toFixed(2));
    }

    if (scriptResources.length > 0) {
      const avgScriptLoad =
        scriptResources.reduce((sum, r) => sum + r.duration, 0) /
        scriptResources.length;
      logMetric("Average Script Load Time", avgScriptLoad.toFixed(2));
    }

    if (styleResources.length > 0) {
      const avgStyleLoad =
        styleResources.reduce((sum, r) => sum + r.duration, 0) /
        styleResources.length;
      logMetric("Average Style Load Time", avgStyleLoad.toFixed(2));
    }
  }, [logMetric]);

  // Monitor memory usage
  const monitorMemoryUsage = useCallback(() => {
    if (typeof window === "undefined" || !performance.memory) return;

    const memory = performance.memory;
    logMetric(
      "Used JS Heap Size",
      (memory.usedJSHeapSize / 1048576).toFixed(2),
      "MB"
    );
    logMetric(
      "Total JS Heap Size",
      (memory.totalJSHeapSize / 1048576).toFixed(2),
      "MB"
    );
    logMetric(
      "JS Heap Size Limit",
      (memory.jsHeapSizeLimit / 1048576).toFixed(2),
      "MB"
    );

    reportMetric({
      name: "memory_usage",
      value: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    });
  }, [logMetric, reportMetric]);

  // Run resource loading measurement on mount
  useEffect(() => {
    // Wait for page to fully load
    if (document.readyState === "complete") {
      measureResourceLoading();
    } else {
      window.addEventListener("load", measureResourceLoading);
      return () => window.removeEventListener("load", measureResourceLoading);
    }
  }, [measureResourceLoading]);

  // Monitor memory usage periodically
  useEffect(() => {
    const interval = setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [monitorMemoryUsage]);

  return {
    measureCustomMetric,
    measureRenderTime,
    measureResourceLoading,
    monitorMemoryUsage,
    logMetric,
    reportMetric,
  };
};

export default usePerformanceMonitoring;
