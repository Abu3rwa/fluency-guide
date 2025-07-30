import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Flag as FlagIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import studentGoalsService from "../../../../services/student-services/studentGoalsService";

const GoalAnalyticsSection = ({ userId, loading = false, error = null }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchGoalAnalytics();
    }
  }, [userId]);

  const fetchGoalAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await studentGoalsService.getGoalAnalytics(userId);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching goal analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "study_time":
        return theme.palette.primary.main;
      case "lesson_completion":
        return theme.palette.success.main;
      case "vocabulary":
        return theme.palette.info.main;
      case "pronunciation":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "study_time":
        return "⏰";
      case "lesson_completion":
        return "📚";
      case "vocabulary":
        return "📖";
      case "pronunciation":
        return "🎤";
      default:
        return "🎯";
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "study_time":
        return "Study Time";
      case "lesson_completion":
        return "Lesson Completion";
      case "vocabulary":
        return "Vocabulary";
      case "pronunciation":
        return "Pronunciation";
      default:
        return "General";
    }
  };

  if (loading || analyticsLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ mr: 1 }}
            />
            <Skeleton variant="text" width={120} height={32} />
          </Box>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={6} sm={3} key={item}>
                <Skeleton variant="rectangular" height={80} />
              </Grid>
            ))}
          </Grid>
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

  if (!analytics) {
    return null;
  }

  const metrics = [
    {
      title: "Total Goals",
      value: analytics.totalGoals,
      icon: <FlagIcon />,
      color: theme.palette.primary.main,
      description: "Goals you've set",
    },
    {
      title: "Active Goals",
      value: analytics.activeGoals,
      icon: <ScheduleIcon />,
      color: theme.palette.info.main,
      description: "Currently in progress",
    },
    {
      title: "Completed",
      value: analytics.completedGoals,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
      description: "Successfully achieved",
    },
    {
      title: "Average Progress",
      value: `${Math.round(analytics.averageProgress)}%`,
      icon: <TrendingUpIcon />,
      color: theme.palette.warning.main,
      description: "Overall progress",
    },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AnalyticsIcon sx={{ color: theme.palette.primary.main }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Goal Analytics
            </Typography>
          </Box>
          <Tooltip title="Goal streak">
            <Chip
              label={`${analytics.goalStreak} day streak`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Tooltip>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {metrics.map((metric, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: metric.color,
                  },
                }}
              >
                <Box
                  sx={{
                    color: metric.color,
                    mb: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {metric.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {metric.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  {metric.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Goal Categories Breakdown */}
        {Object.keys(analytics.goalTypes).length > 0 && (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Goal Categories
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(analytics.goalTypes).map(([category, data]) => (
                <Grid item xs={12} sm={6} key={category}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="h6" sx={{ fontSize: "1.2rem" }}>
                          {getCategoryIcon(category)}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {getCategoryLabel(category)}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${data.count} goals`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {Math.round(data.averageProgress)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={data.averageProgress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: theme.palette.divider,
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: getCategoryColor(category),
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Completed: {data.completed}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active: {data.count - data.completed}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Recent Goals */}
        {analytics.recentGoals && analytics.recentGoals.length > 0 && (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 2,
                mt: 3,
                color: theme.palette.text.primary,
              }}
            >
              Recent Goals
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {analytics.recentGoals.slice(0, 3).map((goal, index) => (
                <Box
                  key={goal.id || index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      {goal.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {goal.current}/{goal.target} {goal.unit}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={`${Math.round(goal.progress)}%`}
                      size="small"
                      color={goal.isCompleted ? "success" : "primary"}
                      variant="outlined"
                    />
                    {goal.isCompleted && (
                      <CheckCircleIcon
                        sx={{ color: theme.palette.success.main, fontSize: 20 }}
                      />
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalAnalyticsSection;
