import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Skeleton,
  Fade,
} from "@mui/material";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const StudentCourseDetailProgressStats = ({
  progress,
  achievements,
  loading,
}) => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  // Placeholder progress: completedLessons/totalLessons
  const completed = progress?.completedLessons || 0;
  const total = progress?.totalLessons || 0;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={60}
        sx={{ borderRadius: theme.shape.borderRadius, mb: 3 }}
      />
    );
  }

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          mb: 3,
          bgcolor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          p: { xs: 2, md: 3 },
        }}
        aria-label="Progress stats section"
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t("studentCourseDetails.progressStats.title")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: theme.palette.grey[200],
                "& .MuiLinearProgress-bar": {
                  bgcolor: theme.palette.primary.main,
                },
              }}
            />
          </Box>
          <Typography variant="body2">
            {t("studentCourseDetails.progressStats.lessons", {
              completed,
              total,
            })}
          </Typography>
        </Box>
        {Array.isArray(achievements) && achievements.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="nowrap"
            mt={1}
            sx={{ overflowX: "auto" }}
          >
            {achievements.map((ach, idx) => (
              <Chip
                key={idx}
                label={
                  ach.title ||
                  ach.name ||
                  t("studentCourseDetails.progressStats.achievement")
                }
                color="success"
                size="small"
              />
            ))}
          </Stack>
        )}
      </Box>
    </Fade>
  );
};

export default StudentCourseDetailProgressStats;
