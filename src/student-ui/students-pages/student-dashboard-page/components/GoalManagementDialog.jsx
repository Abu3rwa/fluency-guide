import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Close as CloseIcon,
  Flag as FlagIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import studentGoalsService from "../../../../services/student-services/studentGoalsService";

const GoalManagementDialog = ({
  open,
  onClose,
  userId,
  onGoalCreated,
  onGoalUpdated,
  onGoalDeleted,
  existingGoal = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    target: "",
    unit: "min",
    type: "daily",
    description: "",
    category: "general",
  });

  // Goal type presets
  const goalPresets = [
    {
      title: "Daily Study Time",
      target: 30,
      unit: "min",
      type: "daily",
      category: "study_time",
      description: "Study for 30 minutes every day",
    },
    {
      title: "Weekly Lessons",
      target: 5,
      unit: "lessons",
      type: "weekly",
      category: "lesson_completion",
      description: "Complete 5 lessons this week",
    },
    {
      title: "Monthly Vocabulary",
      targetCount: 50, // Use targetCount as per vocabulary model
      unit: "words",
      period: "monthly", // Use period as per vocabulary model
      category: "vocabulary",
      description: "Learn 50 new vocabulary words this month",
    },
    {
      title: "Daily Pronunciation",
      target: 10,
      unit: "words",
      type: "daily",
      category: "pronunciation",
      description: "Practice pronunciation for 10 words daily",
    },
  ];

  // Unit options based on category
  const getUnitOptions = (category) => {
    switch (category) {
      case "study_time":
        return [
          { value: "min", label: "Minutes" },
          { value: "hours", label: "Hours" },
        ];
      case "lesson_completion":
        return [
          { value: "lessons", label: "Lessons" },
          { value: "modules", label: "Modules" },
        ];
      case "vocabulary":
        return [
          { value: "words", label: "Words" },
          { value: "phrases", label: "Phrases" },
        ];
      case "pronunciation":
        return [
          { value: "words", label: "Words" },
          { value: "sentences", label: "Sentences" },
        ];
      default:
        return [
          { value: "min", label: "Minutes" },
          { value: "lessons", label: "Lessons" },
          { value: "words", label: "Words" },
        ];
    }
  };

  useEffect(() => {
    if (existingGoal) {
      setFormData({
        title: existingGoal.title || "",
        target: existingGoal.target || "",
        unit: existingGoal.unit || "min",
        type: existingGoal.type || "daily",
        description: existingGoal.description || "",
        category: existingGoal.category || "general",
      });
    } else {
      setFormData({
        title: "",
        target: "",
        unit: "min",
        type: "daily",
        description: "",
        category: "general",
      });
    }
    setError("");
    setSuccess("");
  }, [existingGoal, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-update unit when category changes
    if (field === "category") {
      const unitOptions = getUnitOptions(value);
      if (unitOptions.length > 0) {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          unit: unitOptions[0].value,
        }));
      }
    }
  };

  const handlePresetClick = (preset) => {
    // Handle vocabulary goal model compatibility
    const isVocabularyGoal = preset.category === "vocabulary";

    setFormData({
      title: preset.title,
      target: isVocabularyGoal ? preset.targetCount : preset.target, // Map targetCount to target for form
      unit: preset.unit,
      type: isVocabularyGoal ? preset.period : preset.type, // Map period to type for form
      description: preset.description,
      category: preset.category,
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Please enter a goal title");
      return false;
    }
    if (!formData.target || formData.target <= 0) {
      setError("Please enter a valid target value");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Please enter a goal description");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let goalData = { ...formData };

      // Handle vocabulary goal model compatibility
      const isVocabularyGoal = formData.category === "vocabulary";

      if (isVocabularyGoal) {
        // Map form fields to vocabulary goal model structure
        goalData = {
          ...goalData,
          targetCount: formData.target, // Map target to targetCount
          period: formData.type, // Map type to period
          completedCount: 0, // Initialize completed count
        };
      }

      if (existingGoal) {
        const updatedGoal = await studentGoalsService.updateGoal(
          existingGoal.id,
          goalData
        );
        onGoalUpdated(updatedGoal);
        setSuccess("Goal updated successfully!");
      } else {
        const newGoal = await studentGoalsService.createGoal(userId, goalData);
        onGoalCreated(newGoal);
        setSuccess("Goal created successfully!");
      }

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Error saving goal:", error);
      setError("Failed to save goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingGoal) return;

    setLoading(true);
    setError("");

    try {
      await studentGoalsService.deleteGoal(existingGoal.id);
      setSuccess("Goal deleted successfully!");
      onGoalDeleted?.(existingGoal);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || "Failed to delete goal");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FlagIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6">
            {existingGoal ? "Edit Goal" : "Create New Goal"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Goal Presets */}
        {!existingGoal && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Goal Presets
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {goalPresets.map((preset, index) => (
                <Chip
                  key={index}
                  label={preset.title}
                  onClick={() => handlePresetClick(preset)}
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main + "20",
                    },
                  }}
                />
              ))}
            </Box>
          </>
        )}

        {/* Form Fields */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Goal Title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            disabled={loading}
            placeholder="e.g., Daily Study Time"
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={loading}
            multiline
            rows={2}
            placeholder="Describe your goal..."
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Target Value"
              type="number"
              value={formData.target}
              onChange={(e) => handleInputChange("target", e.target.value)}
              disabled={loading}
              placeholder="30"
            />

            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={formData.unit}
                label="Unit"
                onChange={(e) => handleInputChange("unit", e.target.value)}
                disabled={loading}
              >
                {getUnitOptions(formData.category).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleInputChange("category", e.target.value)}
                disabled={loading}
              >
                <MenuItem value="study_time">Study Time</MenuItem>
                <MenuItem value="lesson_completion">Lesson Completion</MenuItem>
                <MenuItem value="vocabulary">Vocabulary</MenuItem>
                <MenuItem value="pronunciation">Pronunciation</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Goal Type</InputLabel>
              <Select
                value={formData.type}
                label="Goal Type"
                onChange={(e) => handleInputChange("type", e.target.value)}
                disabled={loading}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {existingGoal && (
          <Button
            color="error"
            onClick={handleDelete}
            disabled={loading}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        )}

        <Box sx={{ flex: 1 }} />

        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title || !formData.target}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
        >
          {loading ? "Saving..." : existingGoal ? "Update Goal" : "Create Goal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalManagementDialog;
