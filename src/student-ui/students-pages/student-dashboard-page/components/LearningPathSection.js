import React from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  useTheme,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";

const staticCards = [
  {
    title: "Hard Words",
    icon: (
      <span role="img" aria-label="Hard Words">
        📄
      </span>
    ),
    progress: 80,
    color: "#1976d2", // blue
  },
  {
    title: "Vocabulary",
    icon: (
      <span role="img" aria-label="Vocabulary">
        🌐
      </span>
    ),
    progress: 60,
    color: "#388e3c", // green
  },
  {
    title: "Listening",
    icon: (
      <span role="img" aria-label="Listening">
        🎧
      </span>
    ),
    progress: 20,
    color: "#8e24aa", // purple
  },
  {
    title: "Speaking",
    icon: (
      <span role="img" aria-label="Speaking">
        🎤
      </span>
    ),
    progress: 10,
    color: "#e53935", // red
  },
];

const LearningPathSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Learning Path
        </Typography>
        <Button
          variant="text"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate("/courses")}
          sx={{ fontWeight: 500, textTransform: "none" }}
        >
          See All
        </Button>
      </Box>
      {/* Grid of Cards */}
      <Box>
        <Grid container spacing={2}>
          {staticCards.map((course, idx) => (
            <Grid
              item
              xs={6}
              sm={6}
              md={4}
              lg={3}
              key={idx}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Paper
                elevation={1}
                tabIndex={0}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  p: 2,
                  height: { xs: 100, sm: 120 },
                  aspectRatio: "1.2",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(60,60,60,0.06)",
                  border: "1px solid #f0f0f0",
                  transition: "box-shadow 0.2s, border 0.2s",
                  "&:hover, &:focus": {
                    boxShadow: "0 4px 16px rgba(60,60,60,0.10)",
                    border: `1.5px solid ${course.color}`,
                  },
                  background: theme.palette.background.paper,
                }}
                aria-label={`Course: ${course.title}, ${course.progress}% complete`}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box
                    sx={{
                      bgcolor: course.color + "11",
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography fontSize={20}>{course.icon}</Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={course.color}
                  >
                    {`${course.progress}%`}
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ mt: 1, mb: 1, maxWidth: "90%" }}
                  noWrap
                >
                  {course.title}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={course.progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    background: "#f5f5f5",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: course.color,
                    },
                  }}
                  aria-label={`Progress for ${course.title}`}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default LearningPathSection;
