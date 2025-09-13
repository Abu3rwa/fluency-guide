import { DEFAULT_VALUES, ERROR_MESSAGES, ACTIVITY_TYPES, ACTIVITY_ROUTES } from '../constants/dashboardConstants';

/**
 * Get user initials for avatar fallback
 * @param {string} name - User's display name
 * @returns {string} User initials
 */
export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  return parts.length > 1
    ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    : parts[0][0].toUpperCase();
};

/**
 * Get safe pinned actions from localStorage
 * @returns {Array} Array of pinned action keys
 */
export const getSafePinnedActions = () => {
  try {
    return JSON.parse(localStorage.getItem("pinnedActions")) || DEFAULT_VALUES.PINNED_ACTIONS;
  } catch {
    return DEFAULT_VALUES.PINNED_ACTIONS;
  }
};

/**
 * Save pinned actions to localStorage
 * @param {Array} pinnedActions - Array of pinned action keys
 */
export const savePinnedActions = (pinnedActions) => {
  try {
    localStorage.setItem("pinnedActions", JSON.stringify(pinnedActions));
  } catch (error) {
    console.warn("Failed to save pinned actions to localStorage:", error);
  }
};

/**
 * Get display name with fallback
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export const getDisplayName = (user) => {
  return user?.displayName || user?.name || user?.email || "Unknown User";
};

/**
 * Get avatar URL with fallback
 * @param {Object} user - User object
 * @returns {string|null} Avatar URL or null
 */
export const getAvatarUrl = (user) => {
  return user?.profileImage || user?.photoURL || user?.avatarUrl || null;
};

/**
 * Get user stats with defaults
 * @param {Object} user - User object
 * @returns {Object} User stats object
 */
export const getUserStats = (user) => {
  return {
    currentStreak: user?.currentStreak || DEFAULT_VALUES.USER_STATS.currentStreak,
    longestStreak: user?.longestStreak || DEFAULT_VALUES.USER_STATS.longestStreak,
    totalPoints: user?.totalPoints || DEFAULT_VALUES.USER_STATS.totalPoints,
    todayStudyMinutes: user?.todayStudyMinutes || DEFAULT_VALUES.USER_STATS.todayStudyMinutes,
    totalStudyMinutes: user?.totalStudyMinutes || DEFAULT_VALUES.USER_STATS.totalStudyMinutes,
    enrolledCoursesCount: user?.enrolledCoursesCount || DEFAULT_VALUES.ENROLLED_COURSES_COUNT,
  };
};

/**
 * Handle activity navigation based on activity type
 * @param {Object} activity - Activity object
 * @param {Function} navigate - React Router navigate function
 */
export const handleActivityNavigation = (activity, navigate) => {
  if (!activity || !navigate) return;

  switch (activity.type) {
    case ACTIVITY_TYPES.VOCABULARY_PRACTICE:
      navigate(ACTIVITY_ROUTES[ACTIVITY_TYPES.VOCABULARY_PRACTICE]);
      break;
    case ACTIVITY_TYPES.LESSON_COMPLETED:
      // TODO: Navigate to lesson details
      console.log("Lesson completed:", activity);
      break;
    case ACTIVITY_TYPES.QUIZ_COMPLETED:
      // TODO: Navigate to quiz results
      console.log("Quiz completed:", activity);
      break;
    case ACTIVITY_TYPES.ACHIEVEMENT_UNLOCKED:
      // TODO: Show achievement details
      console.log("Achievement unlocked:", activity);
      break;
    default:
      // TODO: Navigate to activity details
      console.log("Activity clicked:", activity);
      break;
  }
};

/**
 * Handle view all activities navigation
 * @param {Function} navigate - React Router navigate function
 */
export const handleViewAllActivities = (navigate) => {
  navigate(ACTIVITY_ROUTES.ACTIVITIES);
};

/**
 * Get error message based on error type
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.LOADING_ERROR;
  
  if (error.code === "permission-denied") {
    return ERROR_MESSAGES.PERMISSION_DENIED;
  } else if (error.code === "unavailable") {
    return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
  } else if (error.message) {
    return error.message;
  }
  
  return ERROR_MESSAGES.LOADING_ERROR;
};

/**
 * Check if device is mobile based on breakpoint
 * @param {Object} theme - MUI theme object
 * @param {number} width - Current screen width
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = (theme, width) => {
  return width <= theme.breakpoints.values.sm;
};

/**
 * Get responsive breakpoint values
 * @param {Object} theme - MUI theme object
 * @returns {Object} Breakpoint values
 */
export const getBreakpoints = (theme) => ({
  mobile: theme.breakpoints.values.xs,
  tablet: theme.breakpoints.values.sm,
  desktop: theme.breakpoints.values.md,
  large: theme.breakpoints.values.lg,
});

/**
 * Format number with fallback
 * @param {number} value - Number to format
 * @param {number} fallback - Fallback value
 * @returns {number} Formatted number
 */
export const formatNumber = (value, fallback = 0) => {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
};

/**
 * Format study time in human readable format
 * @param {number} minutes - Study time in minutes
 * @returns {string} Formatted time string
 */
export const formatStudyTime = (minutes) => {
  const safeMinutes = formatNumber(minutes, 0);
  
  if (safeMinutes < 60) {
    return `${safeMinutes}m`;
  }
  
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get current streak display text
 * @param {number} streak - Current streak count
 * @returns {string} Formatted streak text
 */
export const getStreakText = (streak) => {
  const safeStreak = formatNumber(streak, 0);
  return `🔥 ${safeStreak}d Streak`;
};

/**
 * Get best streak display text
 * @param {number} streak - Best streak count
 * @returns {string} Formatted streak text
 */
export const getBestStreakText = (streak) => {
  const safeStreak = formatNumber(streak, 0);
  return `🏆 ${safeStreak}d Best`;
};

/**
 * Get points display text
 * @param {number} points - Points count
 * @returns {string} Formatted points text
 */
export const getPointsText = (points) => {
  const safePoints = formatNumber(points, 0);
  return `⭐ ${safePoints} Points`;
};

/**
 * Get study time display text for today
 * @param {number} minutes - Study minutes today
 * @returns {string} Formatted study time text
 */
export const getTodayStudyText = (minutes) => {
  const safeMinutes = formatNumber(minutes, 0);
  return `⏰ ${safeMinutes}m Today`;
};

/**
 * Get total study time display text
 * @param {number} minutes - Total study minutes
 * @returns {string} Formatted study time text
 */
export const getTotalStudyText = (minutes) => {
  const safeMinutes = formatNumber(minutes, 0);
  return `⏳ ${formatStudyTime(safeMinutes)} Total`;
};

/**
 * Get courses count display text
 * @param {number} count - Number of enrolled courses
 * @returns {string} Formatted courses text
 */
export const getCoursesText = (count) => {
  const safeCount = formatNumber(count, 0);
  return `${safeCount} Courses`;
};

/**
 * Create timeout handler with cleanup
 * @param {Function} callback - Function to call after timeout
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Cleanup function
 */
export const createTimeoutHandler = (callback, delay) => {
  const timeoutId = setTimeout(callback, delay);
  return () => clearTimeout(timeoutId);
};

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed value or fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};