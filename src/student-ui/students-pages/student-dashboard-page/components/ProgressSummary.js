import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TodayIcon from "@mui/icons-material/Today";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ProgressSummary = ({
  user,
  progress,
  enrolledCourses,
  completedLessons,
}) => {
  // Example max values for progress bars (customize as needed)
  const maxStreak = Math.max(
    user.longestStreak ?? 0,
    progress.longestStreak ?? 0,
    10
  );
  const maxStudy = Math.max(
    user.totalStudyMinutes ?? 0,
    progress.totalStudyMinutes ?? 0,
    60 * 10
  );
  const maxPoints = Math.max(user.totalPoints ?? 0, 100);

  return (
    <Card
      sx={{
        mb: 3,
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
        boxShadow: 2,
        borderRadius: 3,
      }}
      aria-label="Progress Summary"
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Progress
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Tooltip title="Current streak">
              <Box display="flex" alignItems="center" mb={1}>
                <WhatshotIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Current streak:
                  <strong style={{ marginLeft: 4 }}>
                    {user.currentStreak ?? progress.currentStreak ?? 0} days
                  </strong>
                </Typography>
              </Box>
            </Tooltip>
            <LinearProgress
              variant="determinate"
              value={
                ((user.currentStreak ?? progress.currentStreak ?? 0) /
                  maxStreak) *
                100
              }
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
              aria-label="Current streak progress"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Tooltip title="Longest streak">
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Longest streak:
                  <strong style={{ marginLeft: 4 }}>
                    {user.longestStreak ?? progress.longestStreak ?? 0} days
                  </strong>
                </Typography>
              </Box>
            </Tooltip>
            <LinearProgress
              variant="determinate"
              value={
                ((user.longestStreak ?? progress.longestStreak ?? 0) /
                  maxStreak) *
                100
              }
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
              aria-label="Longest streak progress"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Tooltip title="Total study time">
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTimeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Total study:
                  <strong style={{ marginLeft: 4 }}>
                    {user.totalStudyMinutes ?? progress.totalStudyMinutes ?? 0}{" "}
                    min
                  </strong>
                </Typography>
              </Box>
            </Tooltip>
            <LinearProgress
              variant="determinate"
              value={
                ((user.totalStudyMinutes ?? progress.totalStudyMinutes ?? 0) /
                  maxStudy) *
                100
              }
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
              aria-label="Total study progress"
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Tooltip title="Today's study time">
              <Box display="flex" alignItems="center" mb={1}>
                <TodayIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Today's study:
                  <strong style={{ marginLeft: 4 }}>
                    {user.todayStudyMinutes ?? progress.todayStudyMinutes ?? 0}{" "}
                    min
                  </strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Tooltip title="Total points earned">
              <Box display="flex" alignItems="center" mb={1}>
                <StarIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Total points:
                  <strong style={{ marginLeft: 4 }}>
                    {user.totalPoints ?? 0}
                  </strong>
                </Typography>
              </Box>
            </Tooltip>
            <LinearProgress
              variant="determinate"
              value={((user.totalPoints ?? 0) / maxPoints) * 100}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
              aria-label="Total points progress"
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Tooltip title="Enrolled courses">
              <Box display="flex" alignItems="center" mb={1}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Enrolled courses:
                  <strong style={{ marginLeft: 4 }}>
                    {enrolledCourses.length}
                  </strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Tooltip title="Completed lessons">
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Completed lessons:
                  <strong style={{ marginLeft: 4 }}>
                    {completedLessons.length}
                  </strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProgressSummary;
