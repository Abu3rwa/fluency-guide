import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

const StudentLessonProgressBar = ({ progress }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (typeof progress !== "number") {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography color="text.secondary" variant="body2">
          {t("lessonDetails.noProgress")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography
        variant="h6"
        sx={{ mb: 1, fontFamily: theme.typography.h6.fontFamily }}
      >
        {t("lessonDetails.progress")}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 10,
          borderRadius: theme.shape.borderRadius,
          mb: 1,
          background: theme.palette.grey[200],
        }}
        aria-label={t("lessonDetails.progressBar")}
      />
      <Typography variant="body2" color="text.secondary">
        {progress}%
      </Typography>
    </Box>
  );
};

export default StudentLessonProgressBar;
