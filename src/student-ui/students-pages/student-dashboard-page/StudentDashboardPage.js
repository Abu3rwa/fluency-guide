import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../contexts/UserContext";
import { useCustomTheme } from "../../../contexts/ThemeContext";
import {
  Box,
  useMediaQuery,
  IconButton,
  Snackbar,
  Fade,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Local imports
import StudentLessonVocabularyIntegration from './components/StudentLessonVocabularyIntegration';
import StudentQuickActionsSection from "./components/studentQuickActionsSection";
import EditProfileModal from "./components/EditProfileModal";

import StudentDashboardHeader from "./components/StudentDashboardHeader";
import DashboardErrorBoundary from "./components/DashboardErrorBoundary";
import EnhancedLoader from "./components/EnhancedLoader";
import CenteredLoader from "../../../components/CenteredLoader";

// Services - removed unused studentGoalsService

// Constants and utilities
import {
  DASHBOARD_CONFIG,
  LOADING_CONFIG,
  ERROR_MESSAGES,
  DEFAULT_VALUES,
} from "./constants/dashboardConstants";
import {
  getDisplayName,
  getAvatarUrl,
  getUserStats,
  getSafePinnedActions,
  savePinnedActions,
  handleActivityNavigation,
  handleViewAllActivities,
  getErrorMessage,
  createTimeoutHandler,
} from "./utils/studentDashboardUtils";
import {
  getMainContainerStyles,
  getContentContainerStyles,
  getMainContentStyles,
  getFabStyles,
  getAriaLiveStyles,
} from "./styles/studentDashboardStyles";
import {
  announceToScreenReader,
  focusManagement,
  ariaAttributes,
  screenReaderText,
} from "./utils/studentAccessibilityUtils";

// Hooks and components
import useStudentDashboard from "./hooks/useStudentDashboard";

// Memoized components for better performance (simplified)
import {
  MemoizedProgressOverview,
  MemoizedReviewQueue,
  MemoizedRecentActivities,
  MemoizedQuickActions,
} from "./components/studentMemoizedSections";

const StudentDashboardPage = () => {
  const { t } = useTranslation();
  const { theme, mode, toggleTheme } = useCustomTheme();
  const { userData: user, loading, error, logout } = useUser();
  const navigate = useNavigate();
  
  // State management (simplified)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileUpdateMsg, setProfileUpdateMsg] = useState("");
  
  // Responsive breakpoint
  const isMobile = useMediaQuery(`(max-width:${DASHBOARD_CONFIG.MOBILE_BREAKPOINT}px)`);
  
  // Memoized pinned actions state
  const [pinnedActions, setPinnedActions] = useState(getSafePinnedActions);
  
  // Memoized user data
  const displayName = useMemo(() => getDisplayName(user), [user]);
  const avatar = useMemo(() => getAvatarUrl(user), [user]);
  const userStats = useMemo(() => getUserStats(user), [user]);
  
  // Use the enhanced dashboard hook
  const {
    todayStats,
    progressData,
    courseProgress,
    achievements,
    goals,
    recentActivities,
    trendData,
    vocabularyStats,
    pronunciationStats,
    learningPaths,
    loading: dashboardLoading,
    error: dashboardError,
    refetch,
    refetchSection,
    clearError,
  } = useStudentDashboard(user?.uid);

  // Effect for managing pinned actions
  useEffect(() => {
    savePinnedActions(pinnedActions);
  }, [pinnedActions]);

  // Optimized pin action handler
  const handlePinAction = useCallback((key) => {
    setPinnedActions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  // Profile update handler with accessibility announcement
  const handleProfileUpdate = useCallback((msg) => {
    setProfileUpdateMsg(msg);
    // Announce to screen readers
    announceToScreenReader(msg, 'polite');
    return createTimeoutHandler(() => setProfileUpdateMsg(""), DASHBOARD_CONFIG.LOADING_MESSAGE_TIMEOUT);
  }, []);

  // Navigation handlers (simplified)
  const handleCourseClick = useCallback((course) => {
    navigate(`/courses/${course.id}`);
  }, [navigate]);

  // Activity handlers
  const handleActivityClick = useCallback((activity) => {
    handleActivityNavigation(activity, navigate);
  }, [navigate]);

  const handleViewAllActivitiesClick = useCallback(() => {
    handleViewAllActivities(navigate);
  }, [navigate]);

  // Dashboard retry handler
  const handleDashboardRetry = useCallback(() => {
    clearError();
    refetch();
  }, [clearError, refetch]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/auth");
  }, [logout, navigate]);

  // Loading and error states
  if (loading) {
    return (
      <EnhancedLoader
        type="dashboard"
        message={t('student.dashboard.loading.dashboard')}
        fullScreen={true}
        theme={theme}
        showMessage={true}
      />
    );
  }
  
  if (error) {
    return (
      <div className="student-dashboard-error">
        {(() => {
          if (!error) return t('student.dashboard.constants.errors.loadingError');

          if (error.code === "permission-denied") {
            return t('student.dashboard.constants.errors.permissionDenied');
          } else if (error.code === "unavailable") {
            return t('student.dashboard.constants.errors.serviceUnavailable');
          } else if (error.message) {
            return error.message;
          }

          return t('student.dashboard.constants.errors.loadingError');
        })()}
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="student-dashboard-error">
        {t('student.dashboard.errors.noUserData')}
      </div>
    );
  }



  // User data for components
  const enhancedUser = useMemo(() => ({
    ...user,
    ...userStats,
    displayName,
    avatar,
    enrolledCoursesCount: courseProgress?.length || DEFAULT_VALUES.ENROLLED_COURSES_COUNT,
    completedLessons: user?.completedLessons || [],
    preferences: user?.preferences || {},
    progress: user?.progress || {},
  }), [user, userStats, displayName, avatar, courseProgress]);

  return (
    <MuiThemeProvider theme={theme}>
      <DashboardErrorBoundary onRetry={handleDashboardRetry}>
        {/* Skip to main content link for accessibility */}
        <Box
          component="a"
          href="#main-content"
          sx={{
            position: 'absolute',
            left: '-9999px',
            zIndex: 1400,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            padding: '8px 16px',
            textDecoration: 'none',
            borderRadius: '0 0 4px 4px',
            fontWeight: 'bold',
            '&:focus': {
              left: '16px',
              top: '16px',
            },
          }}
        >
          {t('student.dashboard.accessibility.skipToMain')}
        </Box>
        
        <Box 
          sx={getMainContainerStyles(theme)}
          role="main"
          aria-label={t('student.dashboard.title')}
        >
          
          <Box sx={getContentContainerStyles(theme)}>
            <StudentDashboardHeader
              user={enhancedUser}
              displayName={displayName}
              avatar={avatar}
              preferences={enhancedUser.preferences}
              mode={mode}
              theme={theme}
              isMobile={isMobile}
              onEditProfile={() => setIsEditModalOpen(true)}
              onSettings={() => navigate("/settings")}
              onLogout={handleLogout}
              toggleTheme={toggleTheme}
            />
            
            <Box 
              component="main" 
              id="main-content"
              sx={getMainContentStyles(theme)}
              aria-label={t('student.dashboard.accessibility.statusUpdates')}
            >
              <Suspense
                fallback={
                  <EnhancedLoader
                    type="skeleton"
                    message={t('student.dashboard.loading.components')}
                    theme={theme}
                    skeletonCount={4}
                    skeletonHeight={80}
                    minHeight="300px"
                    showMessage={true}
                  />
                }
              >
                {/* Progress Overview Section */}
                <MemoizedProgressOverview
                  todayStats={todayStats}
                  goals={goals}
                  loading={dashboardLoading}
                  timeout={1000}
                />

                {/* Review Queue Widget */}
                <MemoizedReviewQueue
                  userId={user?.uid}
                  timeout={1200}
                />

                {/* Lesson Vocabulary Integration - Enhanced */}
                {user?.currentLessonId && (
                  <Box sx={{ mb: 3 }}>
                    <StudentLessonVocabularyIntegration
                      lessonId={user.currentLessonId}
                      lessonTitle={user.currentLessonTitle || "Current Lesson"}
                      showLessonCompletion={true}
                      showVocabularyWords={false} // Keep vocabulary in separate section
                      compact={true}
                    />
                  </Box>
                )}

                {/* Recent Activities Section */}
                <MemoizedRecentActivities
                  activities={recentActivities}
                  onActivityClick={handleActivityClick}
                  onViewAll={handleViewAllActivitiesClick}
                  loading={dashboardLoading}
                  timeout={2100}
                />

                {/* Quick Actions Section */}
                <MemoizedQuickActions
                  onEditProfile={() => setIsEditModalOpen(true)}
                  pinnedActions={pinnedActions}
                  onPinAction={handlePinAction}
                  timeout={2300}
                />
              </Suspense>
            </Box>
          </Box>
          
          <EditProfileModal
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onProfileUpdate={handleProfileUpdate}
          />

          <Snackbar
            open={!!profileUpdateMsg}
            message={profileUpdateMsg}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            ContentProps={{ 
              "aria-live": "polite",
              "aria-atomic": "true",
              role: "status"
            }}
            autoHideDuration={6000}
          />
          
          {/* Enhanced ARIA live region for important updates */}
          <Box 
            {...ariaAttributes.liveRegion('polite', true)}
            sx={getAriaLiveStyles()}
            role="status"
            aria-label={t('student.dashboard.accessibility.statusUpdates')}
          >
            {profileUpdateMsg}
          </Box>
          
          {/* Global loading announcement region */}
          <Box
            {...ariaAttributes.liveRegion('assertive', true)}
            sx={getAriaLiveStyles()}
            role="alert"
            aria-label={t('student.dashboard.accessibility.importantAnnouncements')}
          >
            {dashboardLoading && t('student.dashboard.accessibility.dashboardUpdating')}
            {dashboardError && `${t('common.error')}: ${dashboardError}`}
          </Box>
        </Box>
      </DashboardErrorBoundary>
    </MuiThemeProvider>
  );
};

export default StudentDashboardPage;