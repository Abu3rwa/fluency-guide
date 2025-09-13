import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useLandingPage } from "../../../contexts/LandingPageContext";

const StatisticsPanel = () => {
  const { realStatistics, isCalculatingStats } = useLandingPage();
  const [refreshMessage, setRefreshMessage] = useState("");

  const handleRefreshStatistics = async () => {
    try {
      setRefreshMessage("Statistics are automatically calculated on page load");
      setTimeout(() => setRefreshMessage(""), 3000);
    } catch (error) {
      setRefreshMessage("Error refreshing statistics");
      setTimeout(() => setRefreshMessage(""), 3000);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Real-time Statistics</Typography>
        <Button
          onClick={handleRefreshStatistics}
          disabled={isCalculatingStats}
          startIcon={
            isCalculatingStats ? (
              <CircularProgress size={20} />
            ) : (
              <RefreshIcon />
            )
          }
          variant="outlined"
        >
          {isCalculatingStats ? "Calculating..." : "Refresh Statistics"}
        </Button>
      </Box>

      {refreshMessage && (
        <Alert
          severity={refreshMessage.includes("Error") ? "error" : "success"}
          sx={{ mb: 2 }}
        >
          {refreshMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Learning Content Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Learning Content
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Total Courses</Typography>
                  <Chip
                    label={realStatistics.learningContent.totalCourses || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Total Modules</Typography>
                  <Chip
                    label={realStatistics.learningContent.totalModules || 0}
                    color="secondary"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Total Lessons</Typography>
                  <Chip
                    label={realStatistics.learningContent.totalLessons || 0}
                    color="success"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Total Tasks</Typography>
                  <Chip
                    label={realStatistics.learningContent.totalTasks || 0}
                    color="info"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Total Quizzes</Typography>
                  <Chip
                    label={realStatistics.learningContent.totalQuizzes || 0}
                    color="warning"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Vocabulary Words</Typography>
                  <Chip
                    label={realStatistics.learningContent.totalVocabulary || 0}
                    color="error"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Student Engagement Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Student Engagement
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Total Students</Typography>
                  <Chip
                    label={realStatistics.studentEngagement.totalStudents || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Active Students</Typography>
                  <Chip
                    label={realStatistics.studentEngagement.activeStudents || 0}
                    color="secondary"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Total Enrollments</Typography>
                  <Chip
                    label={
                      realStatistics.studentEngagement.totalEnrollments || 0
                    }
                    color="success"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Average Progress</Typography>
                  <Chip
                    label={`${
                      realStatistics.studentEngagement.averageProgress || 0
                    }%`}
                    color="info"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievement Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Achievements
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Quizzes Taken</Typography>
                  <Chip
                    label={realStatistics.achievements.totalQuizzesTaken || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Average Quiz Score</Typography>
                  <Chip
                    label={`${
                      realStatistics.achievements.averageQuizScore || 0
                    }%`}
                    color="secondary"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Vocabulary Learned</Typography>
                  <Chip
                    label={
                      realStatistics.achievements.vocabularyWordsLearned || 0
                    }
                    color="success"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Lessons Completed</Typography>
                  <Chip
                    label={realStatistics.achievements.lessonsCompleted || 0}
                    color="info"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Certificates Earned</Typography>
                  <Chip
                    label={realStatistics.achievements.certificatesEarned || 0}
                    color="warning"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Performance Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Platform Performance
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Study Hours</Typography>
                  <Chip
                    label={
                      realStatistics.platformPerformance.totalStudyHours || 0
                    }
                    color="primary"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Avg Session Time</Typography>
                  <Chip
                    label={`${
                      realStatistics.platformPerformance.averageSessionTime || 0
                    } min`}
                    color="secondary"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Mobile Usage</Typography>
                  <Chip
                    label={`${
                      realStatistics.platformPerformance.mobileUsage || 0
                    }%`}
                    color="success"
                    size="small"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Satisfaction Rate</Typography>
                  <Chip
                    label={`${
                      realStatistics.platformPerformance.satisfactionRate || 0
                    }%`}
                    color="info"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsPanel;
