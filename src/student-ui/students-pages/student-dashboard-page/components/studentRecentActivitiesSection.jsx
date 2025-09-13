import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Skeleton,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Book as BookIcon,
  School as SchoolIcon,
  EmojiEvents as AchievementIcon,
  PlayArrow as PlayIcon,
  Replay as ReplayIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Import constants and utilities
import { ACTIVITY_TYPES, ACTIVITY_ROUTES } from "../constants/dashboardConstants";
import { getCardStyles } from "../styles/studentDashboardStyles";

const StudentRecentActivitiesSection = ({
  activities = [],
  onActivityClick,
  onViewAll,
  loading = false,
  error = null,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const mockActivities = activities.length > 0 ? activities : [
    {
      id: 1,
      type: ACTIVITY_TYPES.LESSON_COMPLETED,
      title: "Completed: Basic Greetings",
      description: "English Conversation Course",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "completed",
      progress: 100,
    },
    {
      id: 2,
      type: ACTIVITY_TYPES.VOCABULARY_PRACTICE,
      title: "Vocabulary Practice - In Progress",
      description: "Daily vocabulary practice (Progress: 60%)",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: "incomplete",
      progress: 60,
    },
    {
      id: 3,
      type: ACTIVITY_TYPES.ACHIEVEMENT_UNLOCKED,
      title: "Earned: First Lesson Badge",
      description: "Completed your first lesson!",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: "completed",
      progress: 100,
    },
    {
      id: 4,
      type: ACTIVITY_TYPES.QUIZ_COMPLETED,
      title: "Quiz - Incomplete",
      description: "Grammar basics quiz (Progress: 30%)",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: "incomplete",
      progress: 30,
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.LESSON_COMPLETED:
        return <SchoolIcon />;
      case ACTIVITY_TYPES.ACHIEVEMENT_UNLOCKED:
        return <AchievementIcon />;
      case ACTIVITY_TYPES.VOCABULARY_PRACTICE:
        return <BookIcon />;
      case ACTIVITY_TYPES.QUIZ_COMPLETED:
        return <SchoolIcon />;
      default:
        return <PlayIcon />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 0) {
      return t('student.dashboard.recentActivities.timeAgo.hoursAgo', { count: hours });
    } else if (minutes > 0) {
      return t('student.dashboard.recentActivities.timeAgo.minutesAgo', { count: minutes });
    } else {
      return t('student.dashboard.recentActivities.timeAgo.justNow');
    }
  };

  const handleActivityClick = (activity) => {
    if (activity.status === 'incomplete' || activity.progress < 100) {
      // Navigate to continue the unfinished activity
      const route = ACTIVITY_ROUTES[activity.type] || '/dashboard';
      navigate(route, { state: { continueActivity: activity } });
    } else {
      // Handle completed activity click
      if (onActivityClick) {
        onActivityClick(activity);
      }
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          {[1, 2, 3].map((item) => (
            <Box key={item} sx={{ display: "flex", mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography color="error" align="center">
            {error}
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ReplayIcon />}
              onClick={() => window.location.reload()}
              size="small"
            >
              {t('dashboard.actions.retry')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('student.dashboard.recentActivities.title')}
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={onViewAll}
            sx={{ 
              textTransform: "none",
              direction: isRTL ? 'rtl' : 'ltr'
            }}
          >
            {t('student.dashboard.recentActivities.viewAll')}
          </Button>
        </Box>

        {mockActivities.length > 0 ? (
          <List sx={{ p: 0 }}>
            {mockActivities.slice(0, 5).map((activity) => (
              <ListItem
                key={activity.id}
                sx={{
                  px: 0,
                  cursor: "pointer",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                onClick={() => handleActivityClick(activity)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: theme.palette.primary.main,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                        {activity.title}
                      </Typography>
                      {(activity.status === 'incomplete' || activity.progress < 100) && (
                        <Chip
                          label={t('student.dashboard.learningPath.inProgress')}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getTimeAgo(activity.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: theme.palette.text.secondary,
            }}
          >
            <PlayIcon fontSize="large" sx={{ mb: 1 }} />
            <Typography variant="body1">
              {t('student.dashboard.recentActivities.noActivities')}
            </Typography>
            <Typography variant="body2">
              {t('student.dashboard.recentActivities.startLearning')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentRecentActivitiesSection;