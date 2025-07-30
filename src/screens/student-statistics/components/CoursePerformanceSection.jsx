import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Avatar,
  useTheme,
} from "@mui/material";

const CoursePerformanceSection = ({ courses }) => {
  const theme = useTheme();

  const defaultCourses = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      studentsEnrolled: 324,
      averageScore: 92.5,
      progress: 92.5,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + "20",
      abbreviation: "JS",
    },
    {
      id: 2,
      title: "Python for Beginners",
      studentsEnrolled: 287,
      averageScore: 89.3,
      progress: 89.3,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + "20",
      abbreviation: "PY",
    },
    {
      id: 3,
      title: "Web Development Bootcamp",
      studentsEnrolled: 156,
      averageScore: 85.7,
      progress: 85.7,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light + "20",
      abbreviation: "WD",
    },
    {
      id: 4,
      title: "Data Science Essentials",
      studentsEnrolled: 203,
      averageScore: 91.2,
      progress: 91.2,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light + "20",
      abbreviation: "DS",
    },
  ];

  const courseData = courses || defaultCourses;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[1],
        border: `1px solid ${theme.palette.grey[100]}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          component="h3"
          fontWeight="600"
          sx={{ mb: 3, color: theme.palette.grey[900] }}
        >
          Course Performance
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {courseData.map((course) => (
            <Box
              key={course.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.grey[100],
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: course.bgColor,
                    color: course.color,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  {course.abbreviation}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="500"
                    sx={{ color: theme.palette.grey[900], mb: 0.5 }}
                  >
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.grey[600] }}
                  >
                    {course.studentsEnrolled} students enrolled
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ textAlign: "right", minWidth: 60 }}>
                  <Typography
                    variant="body2"
                    fontWeight="500"
                    sx={{ color: theme.palette.grey[900] }}
                  >
                    {course.averageScore}%
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.grey[600] }}
                  >
                    Avg. Score
                  </Typography>
                </Box>

                <Box sx={{ width: 128 }}>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.palette.grey[200],
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: course.color,
                        borderRadius: 4,
                        transition: "width 0.8s ease-in-out",
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CoursePerformanceSection;
