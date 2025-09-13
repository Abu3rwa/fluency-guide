import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  Assignment,
  VideoLibrary,
  Quiz,
  AccessTime,
  Info,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../contexts/ThemeContext";

const LessonRequirementsProgress = ({
  lessonId,
  requirements = {},
  showDetails = false,
  onShowDetails,
}) => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();

  const calculateProgress = () => {
    if (!requirements.items || requirements.items.length === 0) return 0;

    const completedCount = requirements.items.filter(
      (item) => item.completed
    ).length;
    return Math.round((completedCount / requirements.items.length) * 100);
  };

  const getRequirementIcon = (type) => {
    switch (type) {
      case "task":
        return <Assignment fontSize="small" />;
      case "video":
        return <VideoLibrary fontSize="small" />;
      case "quiz":
        return <Quiz fontSize="small" />;
      case "time":
        return <AccessTime fontSize="small" />;
      default:
        return <Assignment fontSize="small" />;
    }
  };

  const progress = calculateProgress();
  const hasRequirements = requirements.items && requirements.items.length > 0;

  if (!hasRequirements) {
    return null; // Don't show anything if no requirements
  }

  return (
    <Box
      sx={{
        mt: 1,
        p: 1,
        border: `1px solid ${theme.palette.divider || "#e0e0e0"}`,
        borderRadius: 1,
        bgcolor: theme.palette.background?.default || "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t("lessonRequirements.progress", "Requirements Progress")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {progress}%
          </Typography>
          {onShowDetails && (
            <Tooltip
              title={t("lessonRequirements.showDetails", "Show Details")}
            >
              <IconButton
                size="small"
                onClick={() => onShowDetails(lessonId)}
                sx={{ p: 0.5 }}
              >
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: theme.palette.grey[200],
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
          },
        }}
      />

      {showDetails && requirements.items && (
        <Box sx={{ mt: 1 }}>
          {requirements.items.map((requirement, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.5,
                fontSize: "0.75rem",
              }}
            >
              {getRequirementIcon(requirement.type)}
              <Typography variant="caption" sx={{ flex: 1 }}>
                {requirement.title}
              </Typography>
              <Chip
                label={
                  requirement.completed
                    ? t("common.completed", "Completed")
                    : t("common.incomplete", "Incomplete")
                }
                color={requirement.completed ? "success" : "default"}
                size="small"
                variant="outlined"
                icon={requirement.completed ? <CheckCircle /> : null}
                sx={{ height: 20, fontSize: "0.6rem" }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default LessonRequirementsProgress;
