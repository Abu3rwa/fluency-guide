import React, { useState, useEffect, Suspense, lazy } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useCustomTheme } from "../../../contexts/ThemeContext";
import QuickActionsSection from "./components/QuickActionsSection";
import EditProfileModal from "./components/EditProfileModal";
import AchievementsList from "./components/AchievementsList";
import {
  Button,
  Box,
  Divider,
  useMediaQuery,
  Skeleton,
  IconButton,
  Snackbar,
  Typography,
  Fade,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AddIcon from "@mui/icons-material/Add";
import Confetti from "react-confetti"; // Placeholder, install react-confetti if not present
import studentAchievementService from "../../../services/student-services/studentAchievementService";
import StudentDashboardHeader from "./components/StudentDashboardHeader";
import DashboardErrorBoundary from "./components/DashboardErrorBoundary";
import CenteredLoader from "../../../components/CenteredLoader";

// Import new components
import useStudentDashboard from "./hooks/useStudentDashboard";
import ProgressOverviewSection from "./components/ProgressOverviewSection";
import GoalsProgressSection from "./components/GoalsProgressSection";
import GoalAnalyticsSection from "./components/GoalAnalyticsSection";
import RecentActivitiesSection from "./components/RecentActivitiesSection";
import ProgressAnalyticsSection from "./components/ProgressAnalyticsSection";
import ReviewQueueWidget from "./components/ReviewQueueWidget";
import VocabularyReviewIntegration from "../../../shared/components/VocabularyReviewIntegration";
import studentGoalsService from "../../../services/student-services/studentGoalsService";
import studentReviewService from "../../../services/student-services/studentReviewService";

const LearningPathSection = lazy(() =>
  import("./components/LearningPathSection")
);

const StudentDashboardPage = () => {
  const { theme, mode, toggleTheme } = useCustomTheme();
  const { userData: user, loading, error, logout } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [profileUpdateMsg, setProfileUpdateMsg] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [pinnedActions, setPinnedActions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pinnedActions")) || [];
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    console.log(user);
    localStorage.setItem("pinnedActions", JSON.stringify(pinnedActions));
  }, [pinnedActions]);

  const handlePinAction = (key) => {
    setPinnedActions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Placeholder: Show confetti when a new achievement is unlocked
  // setShowConfetti(true) when achievement unlock event occurs

  // Placeholder: ARIA live region for profile updates
  const handleProfileUpdate = (msg) => {
    setProfileUpdateMsg(msg);
    setTimeout(() => setProfileUpdateMsg(""), 4000);
  };

  // Event handlers for new components
  const handleCourseClick = (course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleGoalClick = (goal) => {
    // TODO: Navigate to goal details or edit goal
    console.log("Goal clicked:", goal);
  };

  const handleCreateGoal = async (newGoal) => {
    try {
      await studentGoalsService.createGoal(user?.uid, newGoal);
      refetchSection("goals");
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleUpdateGoal = async (updatedGoal) => {
    try {
      await studentGoalsService.updateGoal(updatedGoal.id, updatedGoal);
      refetchSection("goals");
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDeleteGoal = async (deletedGoal) => {
    try {
      await studentGoalsService.deleteGoal(deletedGoal.id);
      refetchSection("goals");
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleActivityClick = (activity) => {
    // Handle different activity types
    switch (activity.type) {
      case "vocabulary_practice":
        navigate("/student/vocabulary");
        break;
      case "lesson_completed":
        // TODO: Navigate to lesson details
        console.log("Lesson completed:", activity);
        break;
      case "quiz_completed":
        // TODO: Navigate to quiz results
        console.log("Quiz completed:", activity);
        break;
      case "achievement_unlocked":
        // TODO: Show achievement details
        console.log("Achievement unlocked:", activity);
        break;
      default:
        // TODO: Navigate to activity details
        console.log("Activity clicked:", activity);
        break;
    }
  };

  const handleViewAllActivities = () => {
    // TODO: Navigate to activities page
    navigate("/activities");
  };

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
  };

  const handleTimeRangeChange = (range) => {
    // TODO: Update analytics time range
    console.log("Time range changed:", range);
  };

  // Handle dashboard retry
  const handleDashboardRetry = () => {
    clearError();
    refetch();
  };

  if (loading) {
    return (
      <CenteredLoader
        type="spinner"
        message="Loading your dashboard..."
        fullScreen={true}
        size={80}
        showMessage={true}
      />
    );
  }
  if (error) return <div className="student-dashboard-error">{error}</div>;
  if (!user)
    return <div className="student-dashboard-error">No user data found.</div>;

  const displayName = user.displayName || user.name || user.email;
  const avatar = user.profileImage || user.photoURL || user.avatarUrl;
  // Note: enrolledCourses are now fetched via studentCourseService.getUserEnrolledCourses()
  // and passed through the useStudentDashboard hook
  const completedLessons = user.completedLessons || [];
  const preferences = user.preferences || {};
  const progress = user.progress || {};
  // const achievements = user.achievements || [];

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  // Placeholder: FAB for Edit Profile on mobile
  const fab = isMobile ? (
    <IconButton
      color="primary"
      aria-label="Edit Profile"
      onClick={() => setIsEditModalOpen(true)}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1201,
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
        boxShadow: 4,
      }}
    >
      <AddIcon />
    </IconButton>
  ) : null;

  // Placeholder: Avatar fallback with initials
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.length > 1
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <MuiThemeProvider theme={theme}>
      <DashboardErrorBoundary onRetry={handleDashboardRetry}>
        <Box
          sx={{
            minHeight: "100vh",
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            padding: { xs: 0.5, sm: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "100vw",
            overflowX: "hidden",
            // Mobile-specific fixes
            "@media (max-width: 600px)": {
              padding: "0.25rem",
              minHeight: "100dvh", // Use dynamic viewport height for mobile
            },
            // Safari and iOS specific fixes
            "@supports (-webkit-touch-callout: none)": {
              minHeight: "-webkit-fill-available",
            },
          }}
        >
          {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1, sm: 2 },
              width: "100%",
              maxWidth: { xs: "100%", sm: "100%", md: "1200px" },
              margin: "0 auto",
              padding: { xs: 0, sm: 1, md: 2 },
              // Mobile-specific container fixes
              "@media (max-width: 600px)": {
                gap: "0.5rem",
                padding: "0",
                width: "100vw",
                maxWidth: "100vw",
                boxSizing: "border-box",
              },
              // Prevent horizontal scroll on mobile
              "@media (max-width: 480px)": {
                width: "100%",
                maxWidth: "100%",
                overflowX: "hidden",
              },
            }}
          >
            <StudentDashboardHeader
              user={{
                ...user,
                enrolledCoursesCount: courseProgress?.length || 0,
              }}
              displayName={displayName}
              avatar={avatar}
              preferences={preferences}
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
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1, sm: 2 },
                width: "100%",
                // Mobile-specific main content fixes
                "@media (max-width: 600px)": {
                  gap: "0.5rem",
                  width: "100%",
                  maxWidth: "100%",
                  overflowX: "hidden",
                },
                // Extra small devices
                "@media (max-width: 480px)": {
                  padding: "0",
                  margin: "0",
                },
              }}
            >
              <Suspense
                fallback={
                  <CenteredLoader
                    type="skeleton"
                    message="Loading components..."
                    skeletonCount={4}
                    skeletonHeight={24}
                    minHeight="300px"
                  />
                }
              >
                {/* Progress Overview Section */}
                <Fade in timeout={1000}>
                  <Box>
                    <ProgressOverviewSection
                      todayStats={todayStats}
                      goals={goals}
                      loading={dashboardLoading}
                      error={dashboardError}
                    />
                  </Box>
                </Fade>

                {/* Review Queue Widget */}
                <Fade in timeout={1200}>
                  <Box>
                    <ReviewQueueWidget userId={user?.uid} />
                  </Box>
                </Fade>

                {/* Vocabulary Review Integration */}
                <Fade in timeout={1250}>
                  <Box>
                    <VocabularyReviewIntegration />
                  </Box>
                </Fade>

                {/* Learning Path & Course Progress Section */}
                <Fade in timeout={1300}>
                  <Box>
                    <LearningPathSection
                      enrolledCourses={courseProgress}
                      courseProgress={courseProgress}
                      onCourseClick={handleCourseClick}
                      userId={user?.uid}
                    />
                  </Box>
                </Fade>

                {/* Goals Progress Section */}
                <Fade in timeout={1500}>
                  <Box>
                    <GoalsProgressSection
                      goals={goals}
                      onGoalClick={handleGoalClick}
                      onCreateGoal={handleCreateGoal}
                      onGoalUpdated={handleUpdateGoal}
                      onGoalDeleted={handleDeleteGoal}
                      loading={dashboardLoading}
                      error={dashboardError}
                      userId={user?.uid}
                    />
                  </Box>
                </Fade>

                <Fade in timeout={1700}>
                  <Box>
                    <GoalAnalyticsSection
                      userId={user?.uid}
                      loading={dashboardLoading}
                      error={dashboardError}
                    />
                  </Box>
                </Fade>

                {/* Achievements Section */}
                <Fade in timeout={1800}>
                  <Box>
                    <AchievementsList
                      achievements={achievements}
                      horizontalScroll={true}
                      onAchievementClick={handleAchievementClick}
                    />
                  </Box>
                </Fade>

                {/* Progress Analytics Section */}
                <Fade in timeout={1900}>
                  <Box>
                    <ProgressAnalyticsSection
                      trendData={trendData}
                      vocabularyStats={vocabularyStats}
                      pronunciationStats={pronunciationStats}
                      onTimeRangeChange={handleTimeRangeChange}
                      loading={dashboardLoading}
                      error={dashboardError}
                    />
                  </Box>
                </Fade>

                {/* Recent Activities Section */}
                <Fade in timeout={2100}>
                  <Box>
                    <RecentActivitiesSection
                      activities={recentActivities}
                      onActivityClick={handleActivityClick}
                      onViewAll={handleViewAllActivities}
                      loading={dashboardLoading}
                      error={dashboardError}
                    />
                  </Box>
                </Fade>

                {/* Quick Actions Section */}
                <Fade in timeout={2300}>
                  <Box>
                    <QuickActionsSection
                      onEditProfile={() => setIsEditModalOpen(true)}
                      pinnedActions={pinnedActions}
                      onPinAction={handlePinAction}
                    />
                  </Box>
                </Fade>
              </Suspense>
            </Box>
          </Box>
          {fab}
          <EditProfileModal
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onProfileUpdate={handleProfileUpdate}
          />

          <Snackbar
            open={!!profileUpdateMsg}
            message={profileUpdateMsg}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            ContentProps={{ "aria-live": "polite" }}
          />
          {/* ARIA live region for important updates */}
          <Box
            aria-live="polite"
            sx={{
              position: "absolute",
              left: -9999,
              top: "auto",
              width: 1,
              height: 1,
              overflow: "hidden",
            }}
          >
            {profileUpdateMsg}
          </Box>
          {/* TODO: Add animated transitions for cards/sections */}
        </Box>
      </DashboardErrorBoundary>
    </MuiThemeProvider>
  );
};

export default StudentDashboardPage;
