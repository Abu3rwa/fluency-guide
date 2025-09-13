// Dashboard Configuration Constants
export const DASHBOARD_CONFIG = {
  // Layout and Responsive Design
  MOBILE_BREAKPOINT: 600,
  TABLET_BREAKPOINT: 900,
  DESKTOP_BREAKPOINT: 1200,
  SMALL_MOBILE_BREAKPOINT: 480,
  
  // Container widths
  MAX_CONTAINER_WIDTH: 1200,
  MOBILE_CONTAINER_WIDTH: "100%",
  TABLET_CONTAINER_WIDTH: "100%",
  
  // Spacing and Padding with enhanced mobile support
  MOBILE_PADDING: 0.5, // Increased for better mobile experience
  TABLET_PADDING: 1,
  DESKTOP_PADDING: 2,
  
  // Component Spacing
  SECTION_GAP_MOBILE: 1, // Increased from 0.5 for better spacing
  SECTION_GAP_TABLET: 1.5,
  SECTION_GAP_DESKTOP: 2,
  
  // Touch Target Sizes (following accessibility guidelines)
  MIN_TOUCH_TARGET: 44, // Minimum 44px for accessibility
  RECOMMENDED_TOUCH_TARGET: 48, // Recommended size
  MOBILE_TOUCH_TARGET: 56, // Enhanced mobile target
  
  // Card Configuration
  CARD_BORDER_RADIUS: 3,
  CARD_ELEVATION: 3,
  MOBILE_CARD_PADDING: 2.5,
  DESKTOP_CARD_PADDING: 2,
  
  // Animation and Timing
  FADE_TIMEOUT: {
    PROGRESS_OVERVIEW: 1000,
    REVIEW_QUEUE: 1200,
    VOCABULARY_REVIEW: 1250,
    LEARNING_PATH: 1300,
    GOALS_PROGRESS: 1500,
    GOAL_ANALYTICS: 1700,
    ACHIEVEMENTS: 1800,
    PROGRESS_ANALYTICS: 1900,
    RECENT_ACTIVITIES: 2100,
    QUICK_ACTIONS: 2300,
  },
  
  // Loading Configuration
  CONFETTI_PIECES: 200,
  LOADING_MESSAGE_TIMEOUT: 4000,
  
  // Header Configuration
  HEADER_HEIGHT: {
    MOBILE: 260,
    TABLET: 320,
  },
  
  // Profile Card Configuration with enhanced mobile support
  PROFILE_CARD: {
    WIDTH: {
      MOBILE: "95%", // Increased from 90% for better mobile utilization
      TABLET: 420, // Slightly larger for better content fit
    },
    AVATAR_SIZE: {
      MOBILE: 90, // Larger avatar on mobile
      DESKTOP: 80,
    },
    TOP_POSITION: {
      MOBILE: 70,
      TABLET: 100,
    },
    PADDING: {
      MOBILE: 2, // Increased padding on mobile
      DESKTOP: 1,
    },
  },
  
  // FAB Configuration
  FAB_POSITION: {
    BOTTOM: 24,
    RIGHT: 24,
    Z_INDEX: 1201,
  },
};

// Quick Actions Configuration
export const QUICK_ACTIONS = {
  EDIT_PROFILE: {
    key: "editProfile",
    name: "Edit Profile",
    tooltip: "Edit your profile information",
    ariaLabel: "Edit Profile",
  },
  SETTINGS: {
    key: "settings",
    name: "Settings",
    tooltip: "Go to settings",
    ariaLabel: "Settings",
    route: "/settings",
  },
  MY_COURSES: {
    key: "myCourses",
    name: "My Courses",
    tooltip: "View your enrolled courses",
    ariaLabel: "My Courses",
    route: "/student/courses",
  },
  MY_ACHIEVEMENTS: {
    key: "myAchievements",
    name: "My Achievements",
    tooltip: "View your achievements",
    ariaLabel: "My Achievements",
    route: "/achievements",
  },
  MY_VOCABULARY: {
    key: "myVocabulary",
    name: "My Vocabulary",
    tooltip: "Review your vocabulary",
    ariaLabel: "My Vocabulary",
    route: "/student/vocabulary",
  },
  LOGOUT: {
    key: "logout",
    name: "Logout",
    tooltip: "Sign out of your account",
    ariaLabel: "Logout",
    color: "error",
  },
};

// Loading States Configuration
export const LOADING_CONFIG = {
  DASHBOARD: {
    type: "spinner",
    message: "Loading your dashboard...",
    fullScreen: true,
    size: 80,
    showMessage: true,
  },
  COMPONENTS: {
    type: "skeleton",
    message: "Loading components...",
    skeletonCount: 4,
    skeletonHeight: 24,
    minHeight: "300px",
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_USER_DATA: "No user data found.",
  LOADING_ERROR: "Failed to load dashboard data",
  PERMISSION_DENIED: "You don't have permission to access this data",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again later",
};

// Activity Types for Navigation
export const ACTIVITY_TYPES = {
  VOCABULARY_PRACTICE: "vocabulary_practice",
  LESSON_COMPLETED: "lesson_completed",
  QUIZ_COMPLETED: "quiz_completed",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
};

// Activity Routes
export const ACTIVITY_ROUTES = {
  [ACTIVITY_TYPES.VOCABULARY_PRACTICE]: "/student/vocabulary",
  ACTIVITIES: "/activities",
};

// Default Values
export const DEFAULT_VALUES = {
  PINNED_ACTIONS: [],
  ENROLLED_COURSES_COUNT: 0,
  TODAY_STATS: {
    studyTime: 0,
    lessonsCompleted: 0,
    vocabularyWords: 0,
    pronunciationPractice: 0,
  },
  USER_STATS: {
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    todayStudyMinutes: 0,
    totalStudyMinutes: 0,
  },
  VOCABULARY_STATS: {
    totalWords: 0,
    masteredWords: 0,
    todayWords: 0,
    streakDays: 0,
  },
};

// Theme and Styling Constants
export const THEME_CONFIG = {
  HEADER_BACKGROUND: {
    LIGHT: "success.main",
    DARK: "success.dark",
  },
  GRADIENT_BACKGROUNDS: {
    CARD: "linear-gradient(135deg, {bg.default} 0%, {bg.paper} 100%)",
    FAB: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
  },
};

// Accessibility Configuration
export const ACCESSIBILITY_CONFIG = {
  ARIA_LIVE: {
    POSITION: "absolute",
    LEFT: -9999,
    TOP: "auto",
    WIDTH: 1,
    HEIGHT: 1,
    OVERFLOW: "hidden",
  },
  FOCUS_OUTLINE: {
    WIDTH: "2px",
    OFFSET: "2px",
  },
};

// API Configuration
export const API_CONFIG = {
  RECENT_ACTIVITIES_LIMIT: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};