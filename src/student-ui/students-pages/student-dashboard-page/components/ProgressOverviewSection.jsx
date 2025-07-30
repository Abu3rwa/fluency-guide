import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  LocalFireDepartment as StreakIcon,
  CheckCircle as LessonIcon,
  Flag as GoalIcon,
} from "@mui/icons-material";

const ProgressOverviewSection = ({
  todayStats,
  goals,
  loading = false,
  error = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={6} sm={3} key={item}>
                <Box sx={{ textAlign: "center" }}>
                  <Skeleton variant="circular" width={60} height={60} />
                  <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="60%" />
                </Box>
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

  if (!todayStats) {
    return null;
  }

  const metrics = [
    {
      title: "Study Time",
      value: `${todayStats.studyTime} min`,
      icon: <TimeIcon />,
      color: theme.palette.primary.main,
      progress: Math.min((todayStats.studyTime / 60) * 100, 100), // Assuming 60 min is 100%
    },
    {
      title: "Streak",
      value: `${todayStats.streak} days`,
      icon: <StreakIcon />,
      color: theme.palette.warning.main,
      progress: Math.min((todayStats.streak / 30) * 100, 100), // Assuming 30 days is 100%
    },
    {
      title: "Lessons",
      value: `${todayStats.lessonsCompleted} completed`,
      icon: <LessonIcon />,
      color: theme.palette.success.main,
      progress: Math.min((todayStats.lessonsCompleted / 5) * 100, 100), // Assuming 5 lessons is 100%
    },
    {
      title: "Goals",
      value: `${todayStats.goalsProgress}%`,
      icon: <GoalIcon />,
      color: theme.palette.info.main,
      progress: todayStats.goalsProgress,
    },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          Today's Progress
        </Typography>

        <Grid container spacing={2}>
          {metrics.map((metric, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1,
                  borderRadius: 2,
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Progress Ring */}
                <Box
                  sx={{
                    position: "relative",
                    width: 60,
                    height: 60,
                    mx: "auto",
                    mb: 1,
                  }}
                >
                  {/* Background Circle */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: `3px solid ${theme.palette.divider}`,
                    }}
                  />

                  {/* Progress Circle */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: `3px solid transparent`,
                      borderTop: `3px solid ${metric.color}`,
                      transform: `rotate(${(metric.progress / 100) * 360}deg)`,
                      transition: "transform 0.5s ease-in-out",
                    }}
                  />

                  {/* Icon */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: metric.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Box>

                {/* Text Content */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  }}
                >
                  {metric.title}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: "block",
                  }}
                >
                  {metric.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProgressOverviewSection;
