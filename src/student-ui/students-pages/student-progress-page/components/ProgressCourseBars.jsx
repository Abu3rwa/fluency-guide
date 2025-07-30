import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from "@mui/material";

/**
 * Displays course progress bars for each enrolled course.
 * @param {Object[]} courseProgress - List of course progress objects.
 * @param {boolean} loading - Loading state.
 * @param {string|false} error - Error message or false.
 */
const ProgressCourseBars = ({ courseProgress, loading, error }) => {
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={120}
      >
        <CircularProgress aria-label="Loading course progress" />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }} role="alert">
        {error}
      </Alert>
    );
  }
  if (!courseProgress || courseProgress.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={80}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          No course progress available.
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h6" gutterBottom component="h2">
        Course Progress
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {courseProgress.map((course, idx) => (
          <Grid item xs={12} sm={6} md={4} key={course.id || idx}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    component="h3"
                  >
                    {course.title}
                  </Typography>
                  {course.status && (
                    <Chip
                      label={course.status}
                      size="small"
                      color={
                        course.status === "Completed" ? "success" : "default"
                      }
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Box mb={1}>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress || 0}
                    sx={{ height: 10, borderRadius: 5 }}
                    aria-label={`Progress for ${course.title}`}
                  />
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {course.completedLessons || 0} /{" "}
                      {course.totalLessons || 0} lessons
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(course.progress || 0)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

ProgressCourseBars.propTypes = {
  courseProgress: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      progress: PropTypes.number, // 0-100
      completedLessons: PropTypes.number,
      totalLessons: PropTypes.number,
      status: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

ProgressCourseBars.defaultProps = {
  courseProgress: [],
  loading: false,
  error: false,
};

export default ProgressCourseBars;
