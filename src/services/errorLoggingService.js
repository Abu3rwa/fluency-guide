// errorLoggingService.js
// Centralized error logging and monitoring service

class ErrorLoggingService {
  constructor() {
    this.isInitialized = false;
    this.errorQueue = [];
    this.maxQueueSize = 50;
  }

  /**
   * Initialize the error logging service
   * @param {Object} config - Configuration options
   */
  initialize(config = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      remoteEndpoint: null,
      environment: process.env.NODE_ENV || "development",
      appVersion: process.env.REACT_APP_VERSION || "1.0.0",
      ...config,
    };

    this.isInitialized = true;
    this.flushQueue();
  }

  /**
   * Log an error with context
   * @param {Error} error - The error object
   * @param {Object} context - Additional context information
   * @param {string} level - Error level (error, warn, info)
   */
  logError(error, context = {}, level = "error") {
    const errorLog = {
      timestamp: new Date().toISOString(),
      level,
      message: error.message || "Unknown error",
      stack: error.stack,
      name: error.name,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        environment: this.config.environment,
        appVersion: this.config.appVersion,
      },
    };

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorLog);
    }

    // Remote logging
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.logToRemote(errorLog);
    } else {
      // Queue for later if remote logging is not available
      this.queueError(errorLog);
    }
  }

  /**
   * Log to console with appropriate formatting
   * @param {Object} errorLog - Error log object
   */
  logToConsole(errorLog) {
    const { level, message, stack, context } = errorLog;

    const consoleMethod =
      level === "error" ? "error" : level === "warn" ? "warn" : "info";

    console.group(`🚨 ${level.toUpperCase()}: ${message}`);
    console.log("Context:", context);
    if (stack) {
      console.log("Stack:", stack);
    }
    console.groupEnd();
  }

  /**
   * Log to remote service
   * @param {Object} errorLog - Error log object
   */
  async logToRemote(errorLog) {
    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        throw new Error(`Remote logging failed: ${response.status}`);
      }
    } catch (error) {
      console.warn("Failed to log error remotely:", error);
      this.queueError(errorLog);
    }
  }

  /**
   * Queue error for later processing
   * @param {Object} errorLog - Error log object
   */
  queueError(errorLog) {
    this.errorQueue.push(errorLog);

    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Store in localStorage as backup
    try {
      const storedErrors = JSON.parse(
        localStorage.getItem("errorLogs") || "[]"
      );
      storedErrors.push(errorLog);

      // Keep only last 20 errors in localStorage
      if (storedErrors.length > 20) {
        storedErrors.splice(0, storedErrors.length - 20);
      }

      localStorage.setItem("errorLogs", JSON.stringify(storedErrors));
    } catch (error) {
      console.warn("Failed to store error in localStorage:", error);
    }
  }

  /**
   * Flush queued errors
   */
  async flushQueue() {
    if (!this.isInitialized || !this.config.enableRemoteLogging) {
      return;
    }

    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    for (const errorLog of errorsToFlush) {
      await this.logToRemote(errorLog);
    }
  }

  /**
   * Get stored errors from localStorage
   * @returns {Array} Array of stored errors
   */
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem("errorLogs") || "[]");
    } catch (error) {
      console.warn("Failed to retrieve stored errors:", error);
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors() {
    try {
      localStorage.removeItem("errorLogs");
    } catch (error) {
      console.warn("Failed to clear stored errors:", error);
    }
  }

  /**
   * Log dashboard-specific errors
   * @param {Error} error - The error object
   * @param {string} section - Dashboard section where error occurred
   * @param {string} userId - User ID (optional)
   */
  logDashboardError(error, section, userId = null) {
    this.logError(error, {
      section: "dashboard",
      subsection: section,
      userId,
      component: "StudentDashboard",
    });
  }

  /**
   * Log service-specific errors
   * @param {Error} error - The error object
   * @param {string} service - Service name
   * @param {string} method - Method name
   * @param {string} userId - User ID (optional)
   */
  logServiceError(error, service, method, userId = null) {
    this.logError(error, {
      section: "service",
      service,
      method,
      userId,
    });
  }

  /**
   * Log API errors
   * @param {Error} error - The error object
   * @param {string} endpoint - API endpoint
   * @param {Object} requestData - Request data (optional)
   * @param {string} userId - User ID (optional)
   */
  logApiError(error, endpoint, requestData = null, userId = null) {
    this.logError(error, {
      section: "api",
      endpoint,
      requestData,
      userId,
    });
  }

  /**
   * Log user action errors
   * @param {Error} error - The error object
   * @param {string} action - User action
   * @param {Object} actionData - Action data (optional)
   * @param {string} userId - User ID (optional)
   */
  logUserActionError(error, action, actionData = null, userId = null) {
    this.logError(error, {
      section: "user_action",
      action,
      actionData,
      userId,
    });
  }
}

// Create singleton instance
const errorLoggingService = new ErrorLoggingService();

// Initialize with default configuration
errorLoggingService.initialize({
  enableConsoleLogging: true,
  enableRemoteLogging: process.env.NODE_ENV === "production",
  remoteEndpoint: process.env.REACT_APP_ERROR_LOGGING_ENDPOINT,
});

export default errorLoggingService;
