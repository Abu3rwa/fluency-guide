// Student Dashboard Page - Main exports
export { default as StudentDashboardPage } from './StudentDashboardPage';
export { default as StudentDashboard } from './StudentDashboard';
export { default } from './StudentDashboard';

// New Simplified Student Components (Production Ready)
export { default as StudentProfileHeader } from './components/StudentProfileHeader';
export { default as StudentProgressOverview } from './components/StudentProgressOverview';
export { default as StudentCoursesList } from './components/StudentCoursesList';
export { default as StudentVocabularyWidget } from './components/StudentVocabularyWidget';
export { default as StudentRecentActivities } from './components/StudentRecentActivities';
export { default as StudentQuickActions } from './components/StudentQuickActions';

// Core Components
export { default as StudentDashboardHeader } from './components/StudentDashboardHeader';
export { default as StudentQuickActionsSection } from './components/studentQuickActionsSection';
export { default as DashboardErrorBoundary } from './components/DashboardErrorBoundary';
export { default as EnhancedLoader, LoadingOverlay } from './components/EnhancedLoader';

// Memoized Components for Performance (Simplified)
export {
  MemoizedProgressOverview,
  MemoizedReviewQueue,
  MemoizedRecentActivities,
  MemoizedQuickActions,
} from './components/studentMemoizedSections';

// Hooks
export { default as useStudentDashboard } from './hooks/useStudentDashboard';

// Constants (Essential only)
export {
  DASHBOARD_CONFIG,
  QUICK_ACTIONS,
  LOADING_CONFIG,
  ERROR_MESSAGES,
  DEFAULT_VALUES,
  ACTIVITY_TYPES,
  ACTIVITY_ROUTES,
} from './constants/dashboardConstants';

// Essential Utilities
export {
  getDisplayName,
  getAvatarUrl,
  getUserStats,
  handleActivityNavigation,
  handleViewAllActivities,
  getErrorMessage,
  formatStudyTime,
} from './utils/studentDashboardUtils';

// Essential Accessibility Utilities
export {
  announceToScreenReader,
  focusManagement,
  ariaAttributes,
} from './utils/studentAccessibilityUtils';

// Essential Styles
export {
  getMainContainerStyles,
  getContentContainerStyles,
  getMainContentStyles,
  getCardStyles,
  getAriaLiveStyles,
} from './styles/studentDashboardStyles';