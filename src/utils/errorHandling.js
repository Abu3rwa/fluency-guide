import { ERROR_MESSAGES } from "../config/constants";

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Handles API errors and returns appropriate error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error) => {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return error.message;
  }

  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      default:
        return error.response.data?.message || ERROR_MESSAGES.GENERIC;
    }
  }

  if (error.request) {
    // Request made but no response
    return ERROR_MESSAGES.NETWORK;
  }

  return ERROR_MESSAGES.GENERIC;
};

/**
 * Logs errors to console and/or external service
 * @param {Error} error - The error to log
 * @param {string} context - Where the error occurred
 */
export const logError = (error, context) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack,
    code: error.code,
    details: error.details,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Log:", errorLog);
  }

  // TODO: Implement external error logging service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error);
  // }
};

/**
 * Validates required fields in an object
 * @param {Object} data - Object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @throws {AppError} - If validation fails
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      "VALIDATION_ERROR",
      { missingFields }
    );
  }
};

/**
 * Wraps async functions with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @returns {Function} - Wrapped function with error handling
 */
export const withErrorHandling = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      logError(error, asyncFn.name);
      throw handleApiError(error);
    }
  };
};
