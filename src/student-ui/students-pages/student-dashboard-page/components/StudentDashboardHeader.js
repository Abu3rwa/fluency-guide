import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
} from "@mui/material";
import {
  School as CourseIcon,
} from "@mui/icons-material";

// Import utilities and constants
import { DASHBOARD_CONFIG } from "../constants/dashboardConstants";
import {
  getInitials,
  getStreakText,
  getBestStreakText,
  getPointsText,
  getTodayStudyText,
  getTotalStudyText,
  getCoursesText,
} from "../utils/studentDashboardUtils";
import {
  getHeaderStyles,
  getHeaderBackgroundStyles,
  getProfileCardStyles,
  getAvatarStyles,
  getMobileChipStyles,
} from "../styles/studentDashboardStyles";

const StudentDashboardHeader = ({
  user,
  displayName,
  avatar,
  preferences,
  mode,
  theme,
  isMobile,
  onEditProfile,
  onSettings,
  onLogout,
  toggleTheme,
}) => {
  return (
    <Box sx={getHeaderStyles(theme)}>
      {/* Colored background */}
      <Box sx={getHeaderBackgroundStyles(theme)} />

      {/* Profile Card */}
      <Paper elevation={1} sx={getProfileCardStyles(theme)}>
        <Avatar
          src={avatar}
          sx={{
            ...getAvatarStyles(theme),
            width: { xs: DASHBOARD_CONFIG.PROFILE_CARD.AVATAR_SIZE.MOBILE, sm: DASHBOARD_CONFIG.PROFILE_CARD.AVATAR_SIZE.DESKTOP },
            height: { xs: DASHBOARD_CONFIG.PROFILE_CARD.AVATAR_SIZE.MOBILE, sm: DASHBOARD_CONFIG.PROFILE_CARD.AVATAR_SIZE.DESKTOP },
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
            sx={{ mb: 2, textAlign: "center", px: 1 }}
          >
            {user.bio}
          </Typography>
        )}
        
        <Box
          display="flex"
          gap={{ xs: 0.5, sm: 1 }}
          mb={2}
          flexWrap="wrap"
          justifyContent="center"
          sx={{
            // Better mobile layout for chips
            "@media (max-width: 600px)": {
              maxWidth: "100%",
              px: 1,
            },
          }}
        >
          <Chip
            icon={<CourseIcon />}
            label={getCoursesText(user?.enrolledCoursesCount)}
            sx={{ 
              ...getMobileChipStyles(theme),
              fontWeight: 500,
            }}
          />
          <Chip
            label={getStreakText(user?.currentStreak)}
            color="warning"
            sx={getMobileChipStyles(theme)}
          />
          <Chip
            label={getBestStreakText(user?.longestStreak)}
            color="success"
            sx={getMobileChipStyles(theme)}
          />
          <Chip 
            label={getPointsText(user?.totalPoints)} 
            color="primary"
            sx={getMobileChipStyles(theme)}
          />
          <Chip
            label={getTodayStudyText(user?.todayStudyMinutes)}
            color="info"
            sx={getMobileChipStyles(theme)}
          />
          <Chip
            label={getTotalStudyText(user?.totalStudyMinutes)}
            color="default"
            sx={getMobileChipStyles(theme)}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentDashboardHeader;