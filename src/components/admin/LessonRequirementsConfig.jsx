import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ExpandMore,
  Add,
  Delete,
  Save,
  Settings,
  Assignment,
  VideoLibrary,
  Quiz,
  AccessTime,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";
import { getFeatureFlags } from "../../services/student-services/featureFlags";

const LessonRequirementsConfig = () => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const [featureFlags, setFeatureFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddRequirement, setShowAddRequirement] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    type: "task",
    title: "",
    description: "",
    required: true,
  });

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      const flags = await getFeatureFlags();
      setFeatureFlags(flags);
    } catch (error) {
      console.error("Error loading feature flags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeatureFlags = async () => {
    try {
      setSaving(true);
      // TODO: Implement save feature flags
      console.log("Saving feature flags:", featureFlags);
    } catch (error) {
      console.error("Error saving feature flags:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddRequirement = () => {
    setShowAddRequirement(true);
  };

  const handleSaveRequirement = () => {
    // TODO: Implement save requirement
    console.log("Saving requirement:", newRequirement);
    setShowAddRequirement(false);
    setNewRequirement({
      type: "task",
      title: "",
      description: "",
      required: true,
    });
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading configuration...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t(
          "admin.lessonRequirements.title",
          "Lesson Requirements Configuration"
        )}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t(
          "admin.lessonRequirements.description",
          "Configure lesson completion requirements and feature flags for enhanced learning validation."
        )}
      </Alert>

      {/* Feature Flags Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("admin.featureFlags.title", "Feature Flags")}
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">
              {t(
                "admin.featureFlags.lessonRequirements",
                "Lesson Requirements"
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Switch
                  checked={featureFlags.lessonRequirements?.enabled || false}
                  onChange={(e) =>
                    setFeatureFlags((prev) => ({
                      ...prev,
                      lessonRequirements: {
                        ...prev.lessonRequirements,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label={t(
                "admin.featureFlags.enableRequirements",
                "Enable Lesson Requirements"
              )}
            />

            <TextField
              label={t(
                "admin.featureFlags.rolloutPercentage",
                "Rollout Percentage"
              )}
              type="number"
              value={featureFlags.lessonRequirements?.rolloutPercentage || 0}
              onChange={(e) =>
                setFeatureFlags((prev) => ({
                  ...prev,
                  lessonRequirements: {
                    ...prev.lessonRequirements,
                    rolloutPercentage: parseInt(e.target.value) || 0,
                  },
                }))
              }
              sx={{ mt: 2, width: 200 }}
              inputProps={{ min: 0, max: 100 }}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">
              {t("admin.featureFlags.contentTracking", "Content Tracking")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Switch
                  checked={featureFlags.contentTracking?.enabled || false}
                  onChange={(e) =>
                    setFeatureFlags((prev) => ({
                      ...prev,
                      contentTracking: {
                        ...prev.contentTracking,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label={t(
                "admin.featureFlags.enableContentTracking",
                "Enable Content Tracking"
              )}
            />

            <FormControl sx={{ mt: 2, minWidth: 200 }}>
              <InputLabel>
                {t("admin.featureFlags.trackingLevel", "Tracking Level")}
              </InputLabel>
              <Select
                value={featureFlags.contentTracking?.trackingLevel || "basic"}
                onChange={(e) =>
                  setFeatureFlags((prev) => ({
                    ...prev,
                    contentTracking: {
                      ...prev.contentTracking,
                      trackingLevel: e.target.value,
                    },
                  }))
                }
                label={t("admin.featureFlags.trackingLevel", "Tracking Level")}
              >
                <MenuItem value="basic">
                  {t("admin.featureFlags.basic", "Basic")}
                </MenuItem>
                <MenuItem value="detailed">
                  {t("admin.featureFlags.detailed", "Detailed")}
                </MenuItem>
                <MenuItem value="comprehensive">
                  {t("admin.featureFlags.comprehensive", "Comprehensive")}
                </MenuItem>
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Requirements Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            {t("admin.requirements.title", "Lesson Requirements")}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddRequirement}
          >
            {t("admin.requirements.add", "Add Requirement")}
          </Button>
        </Box>

        <List>
          {/* Sample requirements - will be replaced with real data */}
          <ListItem>
            <ListItemText
              primary="Complete Quiz"
              secondary="Must score at least 70% on the lesson quiz"
            />
            <ListItemSecondaryAction>
              <Chip label="Task" size="small" icon={<Assignment />} />
              <IconButton edge="end" aria-label="delete">
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveFeatureFlags}
          disabled={saving}
        >
          {saving
            ? t("common.saving", "Saving...")
            : t("common.save", "Save Configuration")}
        </Button>
      </Box>

      {/* Add Requirement Dialog */}
      <Dialog
        open={showAddRequirement}
        onClose={() => setShowAddRequirement(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("admin.requirements.addTitle", "Add Requirement")}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t("admin.requirements.type", "Type")}</InputLabel>
            <Select
              value={newRequirement.type}
              onChange={(e) =>
                setNewRequirement((prev) => ({ ...prev, type: e.target.value }))
              }
              label={t("admin.requirements.type", "Type")}
            >
              <MenuItem value="task">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Assignment />
                  {t("admin.requirements.task", "Task")}
                </Box>
              </MenuItem>
              <MenuItem value="video">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <VideoLibrary />
                  {t("admin.requirements.video", "Video")}
                </Box>
              </MenuItem>
              <MenuItem value="quiz">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Quiz />
                  {t("admin.requirements.quiz", "Quiz")}
                </Box>
              </MenuItem>
              <MenuItem value="time">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTime />
                  {t("admin.requirements.time", "Time")}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label={t("admin.requirements.title", "Title")}
            value={newRequirement.title}
            onChange={(e) =>
              setNewRequirement((prev) => ({ ...prev, title: e.target.value }))
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t("admin.requirements.description", "Description")}
            value={newRequirement.description}
            onChange={(e) =>
              setNewRequirement((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={newRequirement.required}
                onChange={(e) =>
                  setNewRequirement((prev) => ({
                    ...prev,
                    required: e.target.checked,
                  }))
                }
              />
            }
            label={t("admin.requirements.required", "Required for completion")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddRequirement(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSaveRequirement} variant="contained">
            {t("common.save", "Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonRequirementsConfig;
