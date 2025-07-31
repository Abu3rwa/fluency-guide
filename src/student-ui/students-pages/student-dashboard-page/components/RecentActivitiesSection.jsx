import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import {
  History as HistoryIcon,
  OpenInNew as OpenIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

const RecentActivitiesSection = ({
  activities = [],
  onActivityClick,
  onViewAll,
  loading = false,
  error = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Ensure activities is always an array
  const safeActivities = Array.isArray(activities) ? activities : [];

  // Debug logging for activities
  console.log("RecentActivitiesSection - activities:", activities);
  console.log("RecentActivitiesSection - safeActivities:", safeActivities);
  console.log(
    "RecentActivitiesSection - activities length:",
    safeActivities.length
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case "lesson_completed":
        return "📖";
      case "pronunciation_practice":
        return "🎤";
      case "quiz_completed":
        return "📝";
      case "vocabulary_practice":
        return "📚";
      case "listening_practice":
        return "🎧";
      case "speaking_practice":
        return "🗣️";
      case "grammar_practice":
        return "📝";
      case "achievement_unlocked":
        return "🏆";
      default:
        return "📋";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "lesson_completed":
        return theme.palette.success.main;
      case "pronunciation_practice":
        return theme.palette.info.main;
      case "quiz_completed":
        return theme.palette.warning.main;
      case "achievement_unlocked":
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const formatTimeAgo = (timestamp) => {
    // Handle undefined or null timestamps
    if (!timestamp) {
      return "Unknown time";
    }

    // Convert timestamp to Date object if it's not already
    let date;
    try {
      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else if (timestamp.toDate && typeof timestamp.toDate === "function") {
        // Handle Firestore Timestamp objects
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Handle Firestore Timestamp with seconds
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
    } catch (error) {
      console.error("Error parsing timestamp:", timestamp, error);
      return "Invalid time";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid time";
    }

    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "completed":
        return (
          <Chip
            icon={<CompletedIcon />}
            label="Completed"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case "pending":
        return (
          <Chip
            icon={<PendingIcon />}
            label="Pending"
            size="small"
            color="warning"
            variant="outlined"
          />
        );
      case "error":
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Error"
            size="small"
            color="error"
            variant="outlined"
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
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
            <Skeleton variant="text" width={150} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
          {[1, 2, 3].map((item) => (
            <Box key={item} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  sx={{ mr: 2 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
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
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <HistoryIcon sx={{ fontSize: 20 }} />
            Recent Activities
          </Typography>
          {safeActivities.length > 0 && (
            <IconButton
              onClick={onViewAll}
              size="small"
              sx={{
                color: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main + "20",
                },
              }}
            >
              <OpenIcon />
            </IconButton>
          )}
        </Box>

        {safeActivities.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <HistoryIcon
              sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              No recent activities. Start learning to see your progress here!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {safeActivities.slice(0, 5).map((activity, index) => {
              // Debug logging for each activity
              console.log(`Activity ${index}:`, activity);
              console.log(`Activity ${index} timestamp:`, activity.timestamp);
              console.log(
                `Activity ${index} lastAccessed:`,
                activity.lastAccessed
              );
              console.log(
                `Activity ${index} completedAt:`,
                activity.completedAt
              );

              // Use the best available timestamp
              const timestamp =
                activity.completedAt ||
                activity.lastAccessed ||
                activity.timestamp;

              return (
                <ListItem
                  key={activity.id || index}
                  sx={{
                    px: 0,
                    py: 1,
                    cursor: "pointer",
                    borderRadius: 1,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  onClick={() => onActivityClick?.(activity)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: getActivityColor(activity.type) + "20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Box>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          mb: 0.5,
                        }}
                      >
                        {activity.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          {activity.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.75rem",
                          }}
                        >
                          {formatTimeAgo(timestamp)}
                        </Typography>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    {activity.status && getStatusChip(activity.status)}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}

        {safeActivities.length > 5 && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.primary.main,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={onViewAll}
            >
              View all {safeActivities.length} activities
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesSection;
