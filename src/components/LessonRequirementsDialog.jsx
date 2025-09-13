import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Assignment,
  VideoLibrary,
  Quiz,
  AccessTime,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../contexts/ThemeContext";

const LessonRequirementsDialog = ({
  open,
  onClose,
  lessonId,
  requirements = {},
  onCompleteLesson,
}) => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();

  const handleCompleteAnyway = () => {
    if (onCompleteLesson) {
      onCompleteLesson(lessonId, true, { enforceRequirements: false });
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const getRequirementIcon = (type) => {
    switch (type) {
      case "task":
        return <Assignment />;
      case "video":
        return <VideoLibrary />;
      case "quiz":
        return <Quiz />;
      case "time":
        return <AccessTime />;
      default:
        return <Assignment />;
    }
  };

  const getRequirementStatus = (requirement) => {
    if (requirement.completed) {
      return {
        icon: <CheckCircle color="success" />,
        color: "success",
        text: t("lessonRequirements.completed", "Completed"),
      };
    } else {
      return {
        icon: <Cancel color="error" />,
        color: "error",
        text: t("lessonRequirements.incomplete", "Incomplete"),
      };
    }
  };

  const calculateProgress = () => {
    if (!requirements.items || requirements.items.length === 0) return 0;

    const completedCount = requirements.items.filter(
      (item) => item.completed
    ).length;
    return Math.round((completedCount / requirements.items.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme.shape.borderRadius,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Assignment />
        {t("lessonRequirements.title", "Lesson Completion Requirements")}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t(
            "lessonRequirements.description",
            "To complete this lesson, you need to meet the following requirements:"
          )}
        </Alert>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t("lessonRequirements.progress", "Progress")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: theme.palette.grey?.[200] || "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Requirements List */}
        {requirements.items && requirements.items.length > 0 && (
          <List sx={{ mb: 2 }}>
            {requirements.items.map((requirement, index) => {
              const status = getRequirementStatus(requirement);
              return (
                <ListItem
                  key={index}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: requirement.completed
                      ? (theme.palette.success?.light ||
                          theme.palette.success?.main ||
                          "#4caf50") + "20"
                      : theme.palette.background.default,
                  }}
                >
                  <ListItemIcon>
                    {getRequirementIcon(requirement.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={requirement.title}
                    secondary={requirement.description}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: 500,
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {status.icon}
                    <Chip
                      label={status.text}
                      color={status.color}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}

        {/* Alternative Completion Path */}
        {requirements.alternativePath && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {t(
                "lessonRequirements.alternativePath",
                "Alternative completion path available:"
              )}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {requirements.alternativePath.description}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} color="inherit">
          {t("common.close", "Close")}
        </Button>
        {requirements.allowOverride && (
          <Button
            onClick={handleCompleteAnyway}
            variant="outlined"
            color="warning"
          >
            {t("lessonRequirements.completeAnyway", "Complete Anyway")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LessonRequirementsDialog;
