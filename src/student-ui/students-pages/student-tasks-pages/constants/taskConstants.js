// Task Constants - Centralized configuration for all student task types
// This file contains all the constants used across different task components
// to ensure consistency and maintainability

// Task Types
export const TASK_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  FILL_IN_BLANKS: 'fill-in-blanks',
  TRUE_FALSE: 'true-false',
};

// Timer Configuration
export const TIMER_CONFIG = {
  DEFAULT_TIMEOUT: 5 * 60 * 1000, // 5 minutes in milliseconds
  WARNING_THRESHOLD: 60, // Show warning when 60 seconds left
  CRITICAL_THRESHOLD: 30, // Show critical warning when 30 seconds left
  AUTO_SAVE_INTERVAL: 30, // Auto-save every 30 seconds
  TICK_INTERVAL: 1000, // Update timer every second
};

// UI Configuration
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 'md', // MUI breakpoint for mobile detection
  SMALL_SCREEN_BREAKPOINT: 'sm',
  EXTRA_SMALL_BREAKPOINT: 'xs',
  MIN_TOUCH_TARGET: 44, // Minimum touch target size in px (iOS/Android standard)
  OPTIMAL_TOUCH_TARGET: 56, // Optimal touch target size in px
  ANIMATION_DURATION: 300, // Standard animation duration in ms
  DEBOUNCE_DELAY: 300, // Debounce delay for input handlers
  
  // Mobile-specific configurations
  MOBILE_SPACING: {
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
  },
  
  // Touch and gesture settings
  TOUCH_CONFIG: {
    SWIPE_THRESHOLD: 50, // Minimum distance for swipe recognition
    SWIPE_VELOCITY: 0.3, // Minimum velocity for swipe
    TOUCH_SLOP: 8, // Touch slop for gesture recognition
    LONG_PRESS_DURATION: 500, // Long press threshold
    DOUBLE_TAP_DELAY: 300, // Double tap maximum delay
  },
  
  // Safe area and viewport
  SAFE_AREA: {
    TOP: 'env(safe-area-inset-top, 0px)',
    BOTTOM: 'env(safe-area-inset-bottom, 0px)',
    LEFT: 'env(safe-area-inset-left, 0px)',
    RIGHT: 'env(safe-area-inset-right, 0px)',
  },
  
  // Mobile navigation heights
  NAVIGATION_HEIGHT: {
    MOBILE: 64,
    TABLET: 72,
    DESKTOP: 80,
  },
};

// Audio Configuration
export const AUDIO_CONFIG = {
  CORRECT_SOUND: '/sounds/correct.mp3',
  INCORRECT_SOUND: '/sounds/incorrect.mp3',
  WARNING_SOUND: '/sounds/warning.mp3',
  COMPLETION_SOUND: '/sounds/completion.mp3',
  DEFAULT_VOLUME: 0.5,
};

// Storage Keys
export const STORAGE_KEYS = {
  TASK_PROGRESS: 'student_task_progress_',
  TASK_SETTINGS: 'student_task_settings',
  AUDIO_PREFERENCES: 'audio_preferences',
  ACCESSIBILITY_PREFERENCES: 'accessibility_preferences',
};

// Progress States
export const PROGRESS_STATES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  SUBMITTED: 'submitted',
  ERROR: 'error',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEXT_QUESTION: ['ArrowRight', 'ArrowDown', 'n', 'N'],
  PREVIOUS_QUESTION: ['ArrowLeft', 'ArrowUp', 'p', 'P'],
  SUBMIT_ANSWER: ['Enter', 'Space'],
  PAUSE_RESUME: ['Space'],
  OPTION_A: ['1', 'a', 'A'],
  OPTION_B: ['2', 'b', 'B'],
  OPTION_C: ['3', 'c', 'C'],
  OPTION_D: ['4', 'd', 'D'],
  TRUE_ANSWER: ['t', 'T', '1'],
  FALSE_ANSWER: ['f', 'F', '0'],
};

// Accessibility Configuration
export const ACCESSIBILITY_CONFIG = {
  SCREEN_READER_DELAY: 500, // Delay before screen reader announcement
  FOCUS_TRAP_ENABLED: true,
  HIGH_CONTRAST_SUPPORT: true,
  KEYBOARD_NAVIGATION_ENABLED: true,
  ARIA_LIVE_REGION_ID: 'task-announcements',
  
  // Mobile accessibility enhancements
  MOBILE_A11Y: {
    VOICE_OVER_DELAY: 750, // iOS VoiceOver delay
    TALK_BACK_DELAY: 600, // Android TalkBack delay
    FOCUS_RING_WIDTH: 3, // Focus ring width for better visibility
    MIN_CONTRAST_RATIO: 4.5, // WCAG AA compliance
  },
  
  // Touch accessibility
  TOUCH_A11Y: {
    MIN_TOUCH_TARGET: 44, // Minimum accessible touch target
    TOUCH_SPACING: 8, // Minimum spacing between touch targets
    HAPTIC_FEEDBACK: true, // Enable haptic feedback
  },
};

// Task Validation Rules
export const VALIDATION_RULES = {
  MIN_QUESTIONS_PER_TASK: 1,
  MAX_QUESTIONS_PER_TASK: 100,
  MIN_TASK_TIME: 60, // 1 minute
  MAX_TASK_TIME: 3600, // 1 hour
  MAX_RETRY_ATTEMPTS: 3,
};

// Network Configuration
export const NETWORK_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // Base delay between retries
  TIMEOUT_DURATION: 10000, // Request timeout in ms
  OFFLINE_CHECK_INTERVAL: 5000, // Check network status every 5 seconds
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  LAZY_LOADING_THRESHOLD: 10, // Questions to load initially
  VIRTUAL_SCROLLING_THRESHOLD: 50, // Enable virtual scrolling after 50 items
  DEBOUNCE_INPUT_DELAY: 300,
  THROTTLE_SCROLL_DELAY: 100,
  
  // Mobile performance optimizations
  MOBILE_PERFORMANCE: {
    REDUCE_ANIMATIONS: false, // Respect user's motion preferences
    OPTIMIZE_IMAGES: true, // Enable image optimization
    LAZY_LOAD_IMAGES: true, // Lazy load images
    PRELOAD_NEXT_QUESTION: true, // Preload next question for smooth navigation
    MAX_CONCURRENT_REQUESTS: 3, // Limit concurrent network requests
  },
  
  // Memory management
  MEMORY_CONFIG: {
    MAX_CACHED_QUESTIONS: 20, // Maximum questions to keep in memory
    CLEANUP_INTERVAL: 60000, // Cleanup unused resources every minute
    AUTO_SAVE_THROTTLE: 2000, // Throttle auto-save to prevent excessive writes
  },
  
  // Network optimization
  NETWORK_OPTIMIZATION: {
    PREFETCH_ENABLED: true, // Prefetch next question data
    COMPRESS_REQUESTS: true, // Enable request compression
    REQUEST_PRIORITY: {
      HIGH: ['task_data', 'user_progress'],
      MEDIUM: ['images', 'audio'],
      LOW: ['analytics', 'logs'],
    },
  },
};

// Default Task Configuration
export const DEFAULT_TASK_CONFIG = {
  timeLimit: 300, // 5 minutes in seconds
  allowPause: true,
  allowPrevious: true,
  showProgress: true,
  showTimer: true,
  autoSave: true,
  audioCues: false,
  highContrast: false,
  fontSize: 'medium',
  
  // Mobile-specific defaults
  mobile: {
    enableSwipeGestures: true,
    hapticFeedback: true,
    fullscreenMode: true,
    preventZoom: true,
    optimizeForTouch: true,
    showMobileHints: true,
    autoHideInterface: false,
  },
  
  // Accessibility defaults
  accessibility: {
    screenReaderSupport: true,
    keyboardNavigation: true,
    focusManagement: true,
    announceProgress: true,
    reducedMotion: false, // Will be overridden by user preference
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  TASK_NOT_FOUND: 'tasks.taskNotFound',
  NETWORK_ERROR: 'tasks.networkError',
  TIMEOUT_ERROR: 'tasks.timeoutError',
  SUBMISSION_ERROR: 'tasks.submissionError',
  VALIDATION_ERROR: 'tasks.validationError',
  PERMISSION_ERROR: 'tasks.permissionError',
  GENERIC_ERROR: 'tasks.genericError',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TASK_COMPLETED: 'tasks.taskCompleted',
  PROGRESS_SAVED: 'tasks.progressSaved',
  ANSWER_CORRECT: 'tasks.answerCorrect',
  TASK_SUBMITTED: 'tasks.taskSubmitted',
};

// Color Scheme (following Material-UI theme structure)
export const TASK_COLORS = {
  correct: '#4caf50',
  incorrect: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  neutral: '#9e9e9e',
  primary: '#1976d2',
  secondary: '#dc004e',
};

// Animation Variants for Framer Motion and CSS animations
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  
  // Mobile-optimized animations (shorter durations, smoother easing)
  mobile: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slideUp: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
    bounce: {
      initial: { scale: 0.9 },
      animate: { scale: 1 },
      exit: { scale: 0.9 },
      transition: { duration: 0.15, ease: 'easeOut' },
    },
  },
  
  // Touch feedback animations
  touch: {
    press: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
    release: {
      scale: 1,
      transition: { duration: 0.1 },
    },
  },
};

// Export all constants as a single object for easier imports
export default {
  TASK_TYPES,
  TIMER_CONFIG,
  UI_CONFIG,
  AUDIO_CONFIG,
  STORAGE_KEYS,
  PROGRESS_STATES,
  NOTIFICATION_TYPES,
  KEYBOARD_SHORTCUTS,
  ACCESSIBILITY_CONFIG,
  VALIDATION_RULES,
  NETWORK_CONFIG,
  PERFORMANCE_CONFIG,
  DEFAULT_TASK_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TASK_COLORS,
  ANIMATION_VARIANTS,
};