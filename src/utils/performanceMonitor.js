// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      componentRenders: new Map(),
      memoryUsage: [],
      bundleSize: null,
      loadTime: null,
    };

    this.isEnabled = process.env.NODE_ENV === "development";
  }

  // Track component render performance
  trackComponentRender(componentName, renderTime) {
    if (!this.isEnabled) return;

    if (!this.metrics.componentRenders.has(componentName)) {
      this.metrics.componentRenders.set(componentName, []);
    }

    this.metrics.componentRenders.get(componentName).push({
      timestamp: Date.now(),
      renderTime,
    });

    // Keep only last 100 renders per component
    const renders = this.metrics.componentRenders.get(componentName);
    if (renders.length > 100) {
      renders.splice(0, renders.length - 100);
    }
  }

  // Track memory usage
  trackMemoryUsage() {
    if (!this.isEnabled || !performance.memory) return;

    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    });

    // Keep only last 50 memory readings
    if (this.metrics.memoryUsage.length > 50) {
      this.metrics.memoryUsage.splice(0, this.metrics.memoryUsage.length - 50);
    }
  }

  // Track bundle size
  trackBundleSize(size) {
    this.metrics.bundleSize = size;
  }

  // Track page load time
  trackLoadTime() {
    if (!this.isEnabled) return;

    window.addEventListener("load", () => {
      const loadTime = performance.now();
      this.metrics.loadTime = loadTime;
      console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
    });
  }

  // Get performance report
  getPerformanceReport() {
    const report = {
      componentRenders: {},
      memoryUsage: this.metrics.memoryUsage,
      bundleSize: this.metrics.bundleSize,
      loadTime: this.metrics.loadTime,
      recommendations: [],
    };

    // Analyze component render performance
    for (const [componentName, renders] of this.metrics.componentRenders) {
      if (renders.length > 0) {
        const avgRenderTime =
          renders.reduce((sum, r) => sum + r.renderTime, 0) / renders.length;
        const maxRenderTime = Math.max(...renders.map((r) => r.renderTime));

        report.componentRenders[componentName] = {
          averageRenderTime: avgRenderTime,
          maxRenderTime,
          renderCount: renders.length,
        };

        // Generate recommendations
        if (avgRenderTime > 16) {
          // 60fps threshold
          report.recommendations.push(
            `Consider optimizing ${componentName} - average render time: ${avgRenderTime.toFixed(
              2
            )}ms`
          );
        }
      }
    }

    // Analyze memory usage
    if (this.metrics.memoryUsage.length > 0) {
      const latestMemory =
        this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      const memoryUsageMB = latestMemory.usedJSHeapSize / 1024 / 1024;

      if (memoryUsageMB > 100) {
        report.recommendations.push(
          `High memory usage detected: ${memoryUsageMB.toFixed(
            2
          )}MB. Consider implementing memory cleanup.`
        );
      }
    }

    return report;
  }

  // Log performance report
  logPerformanceReport() {
    if (!this.isEnabled) return;

    const report = this.getPerformanceReport();
    console.group("🚀 Performance Report");
    console.log("Component Render Performance:", report.componentRenders);
    console.log("Memory Usage:", report.memoryUsage);
    console.log("Bundle Size:", report.bundleSize);
    console.log("Load Time:", report.loadTime);

    if (report.recommendations.length > 0) {
      console.warn("Performance Recommendations:", report.recommendations);
    }

    console.groupEnd();
  }

  // Start monitoring
  start() {
    if (!this.isEnabled) return;

    this.trackLoadTime();

    // Track memory usage every 30 seconds
    setInterval(() => {
      this.trackMemoryUsage();
    }, 30000);

    // Log performance report every 5 minutes
    setInterval(() => {
      this.logPerformanceReport();
    }, 300000);
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React component wrapper for performance tracking
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return function PerformanceTrackedComponent(props) {
    const startTime = performance.now();

    const result = <WrappedComponent {...props} />;

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    performanceMonitor.trackComponentRender(componentName, renderTime);

    return result;
  };
};

export default performanceMonitor;
