import React, { useState, useEffect, Suspense, lazy } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useCustomTheme } from "../../../contexts/ThemeContext";
import UserAvatar from "./components/UserAvatar";
import UserInfo from "./components/UserInfo";
import ProgressSummary from "./components/ProgressSummary";
import QuickActionsSection from "./components/QuickActionsSection";
import EditProfileModal from "../../../components/EditProfileModal";
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
import "./StudentDashboardPage.css";
import StudentDashboardHeader from "./components/StudentDashboardHeader";
import StudentEnrolledCourses from "./components/StudentEnrolledCourses";

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

  const [userAchievements, setUserAchievements] = useState(null);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    async function fetchAchievements() {
      setAchievementsLoading(true);
      try {
        const [userAch, allAch] = await Promise.all([
          studentAchievementService.getUserAchievements(user?.uid),
          studentAchievementService.getAllAchievements(),
        ]);
        const userAchievementsData =
          await studentAchievementService.getUserAchievements(user?.uid);
        console.log(userAchievementsData);
        setUserAchievements(userAchievementsData);
        const userAchMap = {};
        userAch.forEach((ua) => {
          userAchMap[ua.achievementId] = ua;
        });
      } catch (e) {
        if (isMounted) setUserAchievements(null);
      } finally {
        if (isMounted) setAchievementsLoading(false);
      }
    }
    if (user && user.uid) fetchAchievements();
    return () => {
      isMounted = false;
    };
  }, [user && user.uid]);
  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }
  if (error) return <div className="student-dashboard-error">{error}</div>;
  if (!user)
    return <div className="student-dashboard-error">No user data found.</div>;

  const displayName = user.displayName || user.name || user.email;
  const avatar = user.profileImage || user.photoURL || user.avatarUrl;
  const enrolledCourses = user.enrolledCourses || [];
  const completedLessons = user.completedLessons || [];
  const preferences = user.preferences || {};
  const progress = user.progress || {};
  const achievements = user.achievements || [];

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
      <div
        className={`student-dashboard-page ${mode} p-3`}
        style={{
          "--primary": theme.palette.primary.main,
          "--background": theme.palette.background.default,
          "--text": theme.palette.text.primary,
          "--card": theme.palette.background.paper,
        }}
      >
        {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
        <div className="student-dashboard-grid">
          <StudentDashboardHeader
            user={user}
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
          <main className="student-dashboard-main">
            <Suspense
              fallback={
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="rectangular" height={120} />
                </Box>
              }
            >
              <Fade in timeout={1000}>
                <Box>
                  <LearningPathSection
                    enrolledCourses={enrolledCourses}
                    completedLessons={completedLessons}
                    // TODO: Add timeline/cards, progress bars, quick navigation
                  />
                </Box>
              </Fade>
              <Fade in timeout={1200}>
                <Box>
                  <QuickActionsSection
                    onEditProfile={() => setIsEditModalOpen(true)}
                    pinnedActions={pinnedActions}
                    onPinAction={handlePinAction}
                  />
                </Box>
              </Fade>
            </Suspense>
          </main>
        </div>
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
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            left: -9999,
            top: "auto",
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          {profileUpdateMsg}
        </div>
        {/* TODO: Add animated transitions for cards/sections */}
      </div>
    </MuiThemeProvider>
  );
};

export default StudentDashboardPage;
