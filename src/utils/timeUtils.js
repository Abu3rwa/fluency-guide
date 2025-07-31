/**
 * Time utility functions for study time calculations
 * Standardizes time unit conversions across the application
 */

// Time unit constants
export const TIME_UNITS = {
  SECONDS: "seconds",
  MINUTES: "minutes",
  HOURS: "hours",
};

/**
 * Convert seconds to minutes (rounded up)
 * @param {number} seconds - Time in seconds
 * @returns {number} Time in minutes
 */
export const secondsToMinutes = (seconds) => {
  return Math.ceil(seconds / 60);
};

/**
 * Convert minutes to seconds
 * @param {number} minutes - Time in minutes
 * @returns {number} Time in seconds
 */
export const minutesToSeconds = (minutes) => {
  return minutes * 60;
};

/**
 * Convert seconds to hours
 * @param {number} seconds - Time in seconds
 * @returns {number} Time in hours (with decimals)
 */
export const secondsToHours = (seconds) => {
  return seconds / 3600;
};

/**
 * Format time for display
 * @param {number} seconds - Time in seconds
 * @param {string} format - Display format ('short', 'long', 'detailed')
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds, format = "short") => {
  if (!seconds || seconds < 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  switch (format) {
    case "detailed":
      if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      } else {
        return `${remainingSeconds}s`;
      }
    case "long":
      if (hours > 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${
          minutes !== 1 ? "s" : ""
        }`;
      } else if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
      } else {
        return `${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`;
      }
    case "short":
    default:
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      } else {
        return `${remainingSeconds}s`;
      }
  }
};

/**
 * Get timezone-adjusted date string
 * @param {Date} date - Date object (defaults to current date)
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getTimezoneAdjustedDate = (date = new Date()) => {
  return date.toISOString().slice(0, 10);
};

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
  return getTimezoneAdjustedDate(date1) === getTimezoneAdjustedDate(date2);
};

/**
 * Calculate time difference between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date (defaults to current date)
 * @returns {number} Difference in seconds
 */
export const calculateTimeDifference = (startDate, endDate = new Date()) => {
  return Math.floor((endDate - startDate) / 1000);
};

/**
 * Validate study time duration
 * @param {number} duration - Duration in seconds
 * @param {number} maxDuration - Maximum allowed duration in seconds
 * @returns {boolean} True if duration is valid
 */
export const validateStudyTime = (duration, maxDuration = 24 * 60 * 60) => {
  return duration >= 0 && duration <= maxDuration;
};

/**
 * Calculate study time statistics
 * @param {Array} activities - Array of activity objects with duration
 * @returns {Object} Statistics object
 */
export const calculateStudyTimeStats = (activities) => {
  if (!activities || activities.length === 0) {
    return {
      totalTime: 0,
      averageTime: 0,
      studyDays: 0,
      longestSession: 0,
      shortestSession: 0,
    };
  }

  const durations = activities
    .map((activity) => activity.duration || 0)
    .filter((duration) => duration > 0);

  const totalTime = durations.reduce((sum, duration) => sum + duration, 0);
  const studyDays = new Set(
    activities.map((activity) =>
      getTimezoneAdjustedDate(activity.timestamp?.toDate() || new Date())
    )
  ).size;

  return {
    totalTime,
    averageTime: studyDays > 0 ? Math.round(totalTime / studyDays) : 0,
    studyDays,
    longestSession: Math.max(...durations, 0),
    shortestSession: Math.min(...durations, 0),
  };
};

/**
 * Convert study time to different units
 * @param {number} time - Time value
 * @param {string} fromUnit - Source unit ('seconds', 'minutes', 'hours')
 * @param {string} toUnit - Target unit ('seconds', 'minutes', 'hours')
 * @returns {number} Converted time value
 */
export const convertTimeUnit = (time, fromUnit, toUnit) => {
  // Convert to seconds first
  let seconds;
  switch (fromUnit) {
    case TIME_UNITS.SECONDS:
      seconds = time;
      break;
    case TIME_UNITS.MINUTES:
      seconds = time * 60;
      break;
    case TIME_UNITS.HOURS:
      seconds = time * 3600;
      break;
    default:
      throw new Error(`Invalid fromUnit: ${fromUnit}`);
  }

  // Convert from seconds to target unit
  switch (toUnit) {
    case TIME_UNITS.SECONDS:
      return seconds;
    case TIME_UNITS.MINUTES:
      return Math.ceil(seconds / 60);
    case TIME_UNITS.HOURS:
      return seconds / 3600;
    default:
      throw new Error(`Invalid toUnit: ${toUnit}`);
  }
};
