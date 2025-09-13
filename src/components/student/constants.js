// Student Course Related Constants
export const COURSE_CARD_VARIANTS = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  DETAILED: 'detailed',
  LIST: 'list'
};

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

export const SORT_OPTIONS = {
  FEATURED: 'featured',
  RATING: 'rating',
  PRICE: 'price',
  NEWEST: 'newest',
  ALPHABETICAL: 'alphabetical'
};

export const FILTER_CATEGORIES = {
  BOOKMARKED: 'bookmarked',
  FOUNDATION: 'foundation',
  BUSINESS: 'business',
  CONVERSATION: 'conversation',
  EXAM: 'exam',
  GRAMMAR: 'grammar',
  VOCABULARY: 'vocabulary',
  PRONUNCIATION: 'pronunciation'
};

export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

export const COURSE_LANGUAGES = {
  ENGLISH: 'english',
  ARABIC: 'arabic',
  SPANISH: 'spanish',
  FRENCH: 'french'
};

export const PRICE_FILTERS = {
  ALL: '',
  FREE: 'free',
  PAID: 'paid',
  UNDER_50: 'under_50',
  UNDER_100: 'under_100'
};

export const DURATION_FILTERS = {
  ALL: '',
  SHORT: 'short', // < 5 hours
  MEDIUM: 'medium', // 5-20 hours
  LONG: 'long', // > 20 hours
  EXTENDED: 'extended' // > 50 hours
};

export const RATING_FILTERS = {
  ALL: '',
  FOUR_PLUS: '4.0',
  FOUR_FIVE_PLUS: '4.5',
  THREE_FIVE_PLUS: '3.5',
  THREE_PLUS: '3.0'
};

export const ENROLLMENT_STATUSES = {
  ENROLLED: 'enrolled',
  PENDING: 'pending',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  DROPPED: 'dropped'
};

// Animation and transition constants
export const TRANSITIONS = {
  CARD_HOVER: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  QUICK: 'all 0.2s ease',
  SMOOTH: 'all 0.3s ease',
  SPRING: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
};

// Design system values
export const DESIGN_TOKENS = {
  BORDER_RADIUS: {
    SMALL: 1,
    MEDIUM: 2,
    LARGE: 3,
    XLARGE: 4
  },
  SPACING: {
    XS: 0.5,
    SM: 1,
    MD: 2,
    LG: 3,
    XL: 4,
    XXL: 6
  },
  SHADOWS: {
    CARD_REST: 3,
    CARD_HOVER: 12,
    ELEVATED: 6
  }
};

// Grid breakpoints for responsive design
export const GRID_BREAKPOINTS = {
  MOBILE_COURSES_PER_PAGE: 6,
  TABLET_COURSES_PER_PAGE: 9,
  DESKTOP_COURSES_PER_PAGE: 12
};

// Course card dimensions
export const CARD_DIMENSIONS = {
  COMPACT_HEIGHT: 350,
  DEFAULT_HEIGHT: 420,
  DETAILED_HEIGHT: 500,
  IMAGE_HEIGHT: 200
};

// Search and filter debounce timing
export const PERFORMANCE = {
  SEARCH_DEBOUNCE: 300,
  FILTER_DEBOUNCE: 150,
  SCROLL_DEBOUNCE: 100
};

// Accessibility
export const ARIA_LABELS = {
  COURSE_CARD: 'Course card',
  BOOKMARK_BUTTON: 'Bookmark course',
  VIEW_COURSE_BUTTON: 'View course details',
  FILTER_PANEL: 'Course filters',
  SEARCH_INPUT: 'Search courses',
  SORT_SELECT: 'Sort courses by',
  VIEW_MODE_TOGGLE: 'Change view mode'
};

// Error messages
export const ERROR_MESSAGES = {
  LOAD_COURSES: 'Failed to load courses',
  REFRESH_COURSES: 'Failed to refresh courses',
  BOOKMARK_ACTION: 'Failed to update bookmark'
};

// Success messages
export const SUCCESS_MESSAGES = {
  BOOKMARK_ADDED: 'Course added to bookmarks',
  BOOKMARK_REMOVED: 'Course removed from bookmarks',
  COURSES_REFRESHED: 'Courses refreshed successfully'
};