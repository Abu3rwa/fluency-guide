import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../contexts/UserContext";
import { useCustomTheme } from "../../../contexts/ThemeContext";
import {
  Box,
  useMediaQuery,
  Snackbar,
  Container,
  Alert,
  Skeleton,
  Grid,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Import simplified components with Student prefix
import StudentProfileHeader from "./components/StudentProfileHeader";
import StudentProgressOverview from "./components/StudentProgressOverview";
import StudentCoursesList from "./components/StudentCoursesList";
import StudentVocabularyWidget from "./components/StudentVocabularyWidget";
import StudentRecentActivities from "./components/StudentRecentActivities";
import StudentQuickActions from "./components/StudentQuickActions";

// Import existing components that are still needed
import EditProfileModal from "./components/EditProfileModal";
import DashboardErrorBoundary from "./components/DashboardErrorBoundary";

// Services
import studentGoalsService from "../../../services/student-services/studentGoalsService";
import studentVocabularyService from "../../../services/student-services/studentVocabularyService";

// Constants and utilities
import { DASHBOARD_CONFIG } from "./constants/dashboardConstants";

// Hooks
import useStudentDashboard from "./hooks/useStudentDashboard";

const StudentDashboard = () => {
  const { t } = useTranslation();
  const { theme, mode, toggleTheme } = useCustomTheme();
  const { userData: user, loading: userLoading, error: userError, logout } = useUser();
  const navigate = useNavigate();
  
  // State management
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileUpdateMsg, setProfileUpdateMsg] = useState("");
  const [pinnedActions, setPinnedActions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studentPinnedActions') || '[]');
    } catch {
      return [];
    }
  });
  
  // Responsive breakpoint
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Memoized user data
  const displayName = useMemo(() => {
    return user?.displayName || user?.name || user?.firstName 
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
      : user?.email?.split('@')[0] || t('student.dashboard.profile.user');
  }, [user, t]);

  const avatar = useMemo(() => {
    return user?.photoURL || user?.avatar || '';
  }, [user]);

  const userStats = useMemo(() => ({
    currentStreak: user?.currentStreak || 0,
    totalPoints: user?.totalPoints || 0,
    todayStudyMinutes: user?.todayStudyMinutes || 0,
    enrolledCoursesCount: user?.enrolledCoursesCount || 0,
  }), [user]);

  // Use the dashboard hook for data fetching
  const {
    todayStats,
    courseProgress,
    achievements,
    goals,
    recentActivities,
    vocabularyStats,
    loading: dashboardLoading,
    error: dashboardError,
    refetch,
    refetchSection,
  } = useStudentDashboard(user?.uid);

  // Effect for managing pinned actions
  useEffect(() => {
    localStorage.setItem('studentPinnedActions', JSON.stringify(pinnedActions));
  }, [pinnedActions]);

  // Handlers
  const handlePinAction = useCallback((key) => {
    setPinnedActions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleProfileUpdate = useCallback((msg) => {
    setProfileUpdateMsg(msg);
    setTimeout(() => setProfileUpdateMsg(""), 6000);
  }, []);

  const handleCourseClick = useCallback((course) => {
    navigate(`/student/courses/${course.id}`);
  }, [navigate]);

  const handleActivityClick = useCallback((activity, action = 'view') => {
    // Smart navigation based on activity type and action
    switch (activity.type) {
      case 'vocabulary_practice':
        navigate('/student/vocabulary');
        break;
      case 'lesson_completed':
      case 'quiz_completed':
        if (action === 'continue' && activity.courseId) {
          navigate(`/student/courses/${activity.courseId}`);
        } else {
          navigate('/student/courses');
        }
        break;
      case 'achievement_unlocked':
        navigate('/student/achievements');
        break;
      default:
        navigate('/student/activities');
    }
  }, [navigate]);

  const handleViewAllActivities = useCallback(() => {
    navigate('/student/activities');
  }, [navigate]);

  const handleStartVocabularyReview = useCallback(() => {
    navigate('/student/vocabulary/review');
  }, [navigate]);

  const handleViewVocabulary = useCallback(() => {
    navigate('/student/vocabulary');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  // Enhanced user data for components
  const enhancedUser = useMemo(() => ({
    ...user,
    ...userStats,
    displayName,
    avatar,
  }), [user, userStats, displayName, avatar]);

  // Loading state
  if (userLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  // Error state
  if (userError) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {userError.message || t('student.dashboard.errors.loadingError')}
        </Alert>
      </Container>
    );
  }
  
  // No user state
  if (!user) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {t('student.dashboard.errors.noUserData')}
        </Alert>
      </Container>
    );
  }

  return (
    <MuiThemeProvider theme={theme}>
      <DashboardErrorBoundary>
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
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

          {/* Profile Header */}
          <StudentProfileHeader
            user={enhancedUser}
            displayName={displayName}
            avatar={avatar}
            userStats={userStats}
            onEditProfile={() => setIsEditModalOpen(true)}
            onSettings={() => navigate("/settings")}
            onLogout={handleLogout}
          />

          <Grid container spacing={3} id="main-content">
            {/* Left Column - Main Content */}
            <Grid item xs={12} lg={8}>
              {/* Progress Overview */}
              <StudentProgressOverview
                todayStats={todayStats}
                goals={goals}
                loading={dashboardLoading}
              />

              {/* Courses List */}
              <StudentCoursesList
                enrolledCourses={courseProgress}
                onCourseClick={handleCourseClick}
                loading={dashboardLoading}
              />

              {/* Recent Activities */}
              <StudentRecentActivities
                activities={recentActivities}
                onActivityClick={handleActivityClick}
                onViewAll={handleViewAllActivities}
                loading={dashboardLoading}
              />
            </Grid>

            {/* Right Column - Sidebar */}
            <Grid item xs={12} lg={4}>
              {/* Vocabulary Widget */}
              <StudentVocabularyWidget
                vocabularyStats={vocabularyStats}
                reviewQueue={[]} // TODO: Implement review queue
                loading={dashboardLoading}
                onStartReview={handleStartVocabularyReview}
                onViewVocabulary={handleViewVocabulary}
              />

              {/* Quick Actions */}
              <StudentQuickActions
                onEditProfile={() => setIsEditModalOpen(true)}
                pinnedActions={pinnedActions}
                onPinAction={handlePinAction}
              />
            </Grid>
          </Grid>

          {/* Edit Profile Modal */}
          <EditProfileModal
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* Profile Update Snackbar */}
          <Snackbar
            open={!!profileUpdateMsg}
            message={profileUpdateMsg}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={6000}
            onClose={() => setProfileUpdateMsg("")}
          />

          {/* Dashboard Error Snackbar */}
          <Snackbar
            open={!!dashboardError}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            autoHideDuration={8000}
          >
            <Alert severity="error" onClose={() => refetch()}>
              {dashboardError || t('student.dashboard.errors.loadingError')}
            </Alert>
          </Snackbar>
        </Container>
      </DashboardErrorBoundary>
    </MuiThemeProvider>
  );
};

export default StudentDashboard;