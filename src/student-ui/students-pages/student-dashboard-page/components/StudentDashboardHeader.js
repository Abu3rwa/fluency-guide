import React from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Typography,
  useMediaQuery,
  ThemeProvider,
  useTheme,
  Paper,
  Avatar,
  Chip,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import UserAvatar from "./UserAvatar";
import UserInfo from "./UserInfo";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import StarIcon from "@mui/icons-material/Star";
import GroupIcon from "@mui/icons-material/Group";
import CourseIcon from "@mui/icons-material/School";

const StudentDashboardHeader = ({
  user,
  displayName,
  avatar,
  preferences,
  mode,
  isMobile,
  onEditProfile,
  onSettings,
  onLogout,
  toggleTheme,
}) => {
  // Helper for initials fallback
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.length > 1
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Design colors
  const headerBg =
    theme.palette.mode === "dark"
      ? theme.palette.success.dark
      : theme.palette.success.main;

  return (
    <Box
      sx={{
        position: "relative",
        pb: { xs: 10, sm: 12 },
        minHeight: { xs: 260, sm: 320 },
      }}
    >
      {/* Colored background */}
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          height: { xs: 140, sm: 180 },
          borderRadius: "0 0 16px 16px",
        }}
      />

      {/* Profile Card */}
      <Paper
        elevation={1}
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          mx: "auto",
          top: { xs: 70, sm: 100 },
          padding: { xs: 1, sm: 1 },
          width: { xs: "90%", sm: 400 },
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <Avatar
          src={user?.profileImage || user?.photoURL}
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            bgcolor: theme.palette.primary.main,
          }}
        >
          {getInitials(displayName)}
        </Avatar>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
          {displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {user?.role || "Student"}
        </Typography>
        {user?.bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: "center" }}
          >
            {user.bio}
          </Typography>
        )}
        <Box
          display="flex"
          gap={1}
          mb={2}
          flexWrap="wrap"
          justifyContent="center"
        >
          <Chip
            icon={<CourseIcon />}
            label={`${user?.enrolledCourses?.length ?? 0} Courses`}
            sx={{ fontWeight: 500 }}
          />

          <Chip
            label={`🔥 ${user?.currentStreak ?? 0}d Streak`}
            color="warning"
          />
          <Chip
            label={`🏆 ${user?.longestStreak ?? 0}d Best`}
            color="success"
          />
          <Chip label={`⭐ ${user?.totalPoints ?? 0} Points`} color="primary" />
          <Chip
            label={`⏰ ${user?.todayStudyMinutes ?? 0}m Today`}
            color="info"
          />
          <Chip
            label={`⏳ ${user?.totalStudyMinutes ?? 0}m Total`}
            color="default"
          />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        ></Menu>
      </Paper>
    </Box>
  );
};

export default StudentDashboardHeader;
