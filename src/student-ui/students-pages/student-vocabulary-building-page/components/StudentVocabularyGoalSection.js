import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useStudentVocabulary } from "../../../../contexts/studentVocabularyContext";
import {
  calculateProgressPercentage,
  isGoalCompleted,
} from "../utils/vocabularyHelpers";

const StudentVocabularyGoalSection = () => {
  const { t } = useTranslation();
  const {
    activeGoal,
    createVocabularyGoal,
    progressPercentage,
    goalCompleted,
    loading,
  } = useStudentVocabulary();

  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goalData, setGoalData] = useState({
    dailyTarget: 10,
  });

  const handleCreateGoal = async () => {
    try {
      await createVocabularyGoal(goalData);
      setShowGoalDialog(false);
      setGoalData({ dailyTarget: 10 });
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleGoalChange = (field, value) => {
    setGoalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getProgressColor = () => {
    if (goalCompleted) return "success";
    if (progressPercentage >= 0.7) return "warning";
    return "primary";
  };

  const getProgressText = () => {
    if (!activeGoal) return t("vocabulary.noGoal", "No active goal");

    if (goalCompleted) {
      return t("vocabulary.goalCompleted", "Daily goal completed! 🎉");
    }

    return t(
      "vocabulary.progressText",
      "{{current}} of {{target}} words learned today",
      {
        current: activeGoal.currentProgress,
        target: activeGoal.dailyTarget,
      }
    );
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            {t("vocabulary.dailyGoal", "Daily Learning Goal")}
          </Typography>

          {activeGoal ? (
            <IconButton
              size="small"
              onClick={() => setShowGoalDialog(true)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowGoalDialog(true)}
              size="small"
            >
              {t("vocabulary.createGoal", "Create Goal")}
            </Button>
          )}
        </Box>

        {activeGoal ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {getProgressText()}
              </Typography>

              {goalCompleted && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label={t("vocabulary.completed", "Completed")}
                  color="success"
                  size="small"
                />
              )}
            </Box>

            <LinearProgress
              variant="determinate"
              value={progressPercentage * 100}
              color={getProgressColor()}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t(
                  "vocabulary.progressPercentage",
                  "{{percentage}}% complete",
                  {
                    percentage: Math.round(progressPercentage * 100),
                  }
                )}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {t("vocabulary.remaining", "{{remaining}} words remaining", {
                  remaining: Math.max(
                    0,
                    activeGoal.dailyTarget - activeGoal.currentProgress
                  ),
                })}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <FlagIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {t(
                "vocabulary.noGoalDescription",
                "Set a daily vocabulary learning goal to track your progress"
              )}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Goal Creation/Edit Dialog */}
      <Dialog
        open={showGoalDialog}
        onClose={() => setShowGoalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {activeGoal
            ? t("vocabulary.editGoal", "Edit Daily Goal")
            : t("vocabulary.createGoal", "Create Daily Goal")}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {t("vocabulary.dailyTarget", "Daily Target")}
              </InputLabel>
              <Select
                value={goalData.dailyTarget}
                onChange={(e) =>
                  handleGoalChange("dailyTarget", e.target.value)
                }
                label={t("vocabulary.dailyTarget", "Daily Target")}
              >
                <MenuItem value={5}>5 words</MenuItem>
                <MenuItem value={10}>10 words</MenuItem>
                <MenuItem value={15}>15 words</MenuItem>
                <MenuItem value={20}>20 words</MenuItem>
                <MenuItem value={25}>25 words</MenuItem>
                <MenuItem value={30}>30 words</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              {t(
                "vocabulary.goalDescription",
                "Choose how many vocabulary words you want to learn each day. This will help you stay motivated and track your progress."
              )}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowGoalDialog(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleCreateGoal}
            variant="contained"
            disabled={loading.goals}
          >
            {activeGoal
              ? t("common.update", "Update")
              : t("common.create", "Create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default StudentVocabularyGoalSection;
