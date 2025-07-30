import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Celebration as CelebrationIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const StudentGoalCompletedDialog = ({ open, onClose, goal }) => {
  const { t } = useTranslation();

  const handleContinue = () => {
    onClose();
  };

  const handleNewGoal = () => {
    onClose();
    // This could trigger a new goal creation dialog
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CelebrationIcon sx={{ fontSize: 60, color: "#FFD700" }} />
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
          {t("vocabulary.goalCompletedTitle")}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center" }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("vocabulary.congratulations")}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("vocabulary.goalCompletedMessage")}
          </Typography>

          {goal && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <CheckCircleIcon
                  sx={{ fontSize: 24, color: "#4CAF50", mr: 1 }}
                />
                <Typography variant="h6">
                  {t("vocabulary.goalAchievement", {
                    current: goal.currentProgress,
                    target: goal.dailyTarget,
                  })}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {t("vocabulary.goalAchievementDescription", {
                  count: goal.currentProgress,
                })}
              </Typography>
            </Paper>
          )}

          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}
          >
            <StarIcon sx={{ fontSize: 24, color: "#FFD700" }} />
            <StarIcon sx={{ fontSize: 24, color: "#FFD700" }} />
            <StarIcon sx={{ fontSize: 24, color: "#FFD700" }} />
          </Box>

          <Typography variant="body1" sx={{ fontStyle: "italic" }}>
            {t("vocabulary.keepGoing")}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button
          onClick={handleContinue}
          variant="contained"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.3)",
            },
            mr: 2,
          }}
        >
          {t("vocabulary.continueLearning")}
        </Button>

        <Button
          onClick={handleNewGoal}
          variant="outlined"
          sx={{
            borderColor: "rgba(255, 255, 255, 0.5)",
            color: "white",
            "&:hover": {
              borderColor: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          {t("vocabulary.setNewGoal")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentGoalCompletedDialog;
