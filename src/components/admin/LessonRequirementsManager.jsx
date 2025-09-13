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
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Stack,
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
  Edit,
  Visibility,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";
import { getAllLessons } from "../../services/lessonService";
import { getLessonRequirements, updateLessonRequirements, deleteLessonRequirements } from "../../services/lessonService";
import { getLessonRequirements as getStudentLessonRequirements } from "../../services/student-services/studentLessonProgressService";

const LessonRequirementsManager = () => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [requirements, setRequirements] = useState({
    enabled: false,
    requiredTasks: [],
    minimumScore: 70,
    requiredContent: [],
    requiredTimeSpent: 0,
    requireVideoCompletion: false,
    requireAudioCompletion: false,
    requireReadingCompletion: false,
    requireTaskCompletion: false,
  });
  const [newTask, setNewTask] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const allLessons = await getAllLessons();
      setLessons(allLessons);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = async (lesson) => {
    setSelectedLesson(lesson);
    try {
      const existingRequirements = await getStudentLessonRequirements(lesson.id);
      if (existingRequirements && existingRequirements.enabled) {
        setRequirements({
          enabled: true,
          requiredTasks: existingRequirements.requiredTasks || [],
          minimumScore: existingRequirements.minimumScore || 70,
          requiredContent: existingRequirements.requiredContent || [],
          requiredTimeSpent: existingRequirements.requiredTimeSpent || 0,
          requireVideoCompletion: existingRequirements.requireVideoCompletion || false,
          requireAudioCompletion: existingRequirements.requireAudioCompletion || false,
          requireReadingCompletion: existingRequirements.requireReadingCompletion || false,
          requireTaskCompletion: existingRequirements.requireTaskCompletion || false,
        });
      } else {
        setRequirements({
          enabled: false,
          requiredTasks: [],
          minimumScore: 70,
          requiredContent: [],
          requiredTimeSpent: 0,
          requireVideoCompletion: false,
          requireAudioCompletion: false,
          requireReadingCompletion: false,
          requireTaskCompletion: false,
        });
      }
      setShowEditDialog(true);
    } catch (error) {
      console.error("Error loading lesson requirements:", error);
    }
  };

  const handleSaveRequirements = async () => {
    if (!selectedLesson) return;

    try {
      setSaving(true);
      if (requirements.enabled) {
        await updateLessonRequirements(selectedLesson.id, requirements);
      } else {
        await deleteLessonRequirements(selectedLesson.id);
      }
      setShowEditDialog(false);
      // Reload lessons to refresh the list
      await loadLessons();
    } catch (error) {
      console.error("Error saving lesson requirements:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setRequirements((prev) => ({
        ...prev,
        requiredTasks: [...prev.requiredTasks, newTask.trim()],
      }));
      setNewTask("");
    }
  };

  const handleRemoveTask = (index) => {
    setRequirements((prev) => ({
      ...prev,
      requiredTasks: prev.requiredTasks.filter((_, i) => i !== index),
    }));
  };

  const handleAddContent = () => {
    if (newContent.trim()) {
      setRequirements((prev) => ({
        ...prev,
        requiredContent: [...prev.requiredContent, newContent.trim()],
      }));
      setNewContent("");
    }
  };

  const handleRemoveContent = (index) => {
    setRequirements((prev) => ({
      ...prev,
      requiredContent: prev.requiredContent.filter((_, i) => i !== index),
    }));
  };

  const getRequirementsStatus = (lesson) => {
    // This would need to be implemented to check if lesson has requirements
    return "unknown";
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading lessons...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t("admin.lessonRequirements.title", "Lesson Requirements Manager")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("admin.lessonRequirements.description", "Manage completion requirements for existing lessons")}
      </Typography>

      <Grid container spacing={3}>
        {lessons.map((lesson) => (
          <Grid item xs={12} md={6} lg={4} key={lesson.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {lesson.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lesson.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={lesson.status}
                    size="small"
                    color={lesson.status === "published" ? "success" : "default"}
                  />
                  <Chip
                    label={`${lesson.duration} min`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Course: {lesson.courseId} | Module: {lesson.moduleId}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleLessonSelect(lesson)}
                  fullWidth
                >
                  {t("admin.lessonRequirements.editRequirements", "Edit Requirements")}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Requirements Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("admin.lessonRequirements.editTitle", "Edit Lesson Requirements")}
          {selectedLesson && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedLesson.title}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={requirements.enabled}
                onChange={(e) =>
                  setRequirements((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                color="primary"
              />
            }
            label={t("admin.lessonRequirements.enableRequirements", "Enable completion requirements")}
            sx={{ mb: 2 }}
          />

          {requirements.enabled && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t("admin.lessonRequirements.requiredTasks", "Required Tasks")}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("admin.lessonRequirements.addTaskPlaceholder", "Add required task")}
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddTask}
                  startIcon={<Add />}
                  size="small"
                >
                  {t("admin.lessonRequirements.add", "Add")}
                </Button>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {requirements.requiredTasks.map((task, index) => (
                  <Chip
                    key={index}
                    label={task}
                    onDelete={() => handleRemoveTask(index)}
                    icon={<Assignment />}
                  />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                {t("admin.lessonRequirements.requiredContent", "Required Content")}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("admin.lessonRequirements.addContentPlaceholder", "Add required content")}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddContent}
                  startIcon={<Add />}
                  size="small"
                >
                  {t("admin.lessonRequirements.add", "Add")}
                </Button>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {requirements.requiredContent.map((content, index) => (
                  <Chip
                    key={index}
                    label={content}
                    onDelete={() => handleRemoveContent(index)}
                    icon={<VideoLibrary />}
                  />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                {t("admin.lessonRequirements.completionOptions", "Completion Options")}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={requirements.requireVideoCompletion}
                        onChange={(e) =>
                          setRequirements((prev) => ({
                            ...prev,
                            requireVideoCompletion: e.target.checked,
                          }))
                        }
                        color="primary"
                      />
                    }
                    label={t("admin.lessonRequirements.requireVideoCompletion", "Require video completion")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={requirements.requireAudioCompletion}
                        onChange={(e) =>
                          setRequirements((prev) => ({
                            ...prev,
                            requireAudioCompletion: e.target.checked,
                          }))
                        }
                        color="primary"
                      />
                    }
                    label={t("admin.lessonRequirements.requireAudioCompletion", "Require audio completion")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={requirements.requireReadingCompletion}
                        onChange={(e) =>
                          setRequirements((prev) => ({
                            ...prev,
                            requireReadingCompletion: e.target.checked,
                          }))
                        }
                        color="primary"
                      />
                    }
                    label={t("admin.lessonRequirements.requireReadingCompletion", "Require reading completion")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={requirements.requireTaskCompletion}
                        onChange={(e) =>
                          setRequirements((prev) => ({
                            ...prev,
                            requireTaskCompletion: e.target.checked,
                          }))
                        }
                        color="primary"
                      />
                    }
                    label={t("admin.lessonRequirements.requireTaskCompletion", "Require task completion")}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label={t("admin.lessonRequirements.minimumScore", "Minimum Score (%)")}
                  type="number"
                  value={requirements.minimumScore}
                  onChange={(e) =>
                    setRequirements((prev) => ({
                      ...prev,
                      minimumScore: parseInt(e.target.value) || 70,
                    }))
                  }
                  inputProps={{ min: 0, max: 100 }}
                  size="small"
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label={t("admin.lessonRequirements.requiredTimeSpent", "Required Time Spent (minutes)")}
                  type="number"
                  value={requirements.requiredTimeSpent}
                  onChange={(e) =>
                    setRequirements((prev) => ({
                      ...prev,
                      requiredTimeSpent: parseInt(e.target.value) || 0,
                    }))
                  }
                  inputProps={{ min: 0 }}
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>
            {t("admin.lessonRequirements.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleSaveRequirements}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <LinearProgress /> : <Save />}
          >
            {saving
              ? t("admin.lessonRequirements.saving", "Saving...")
              : t("admin.lessonRequirements.save", "Save Requirements")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonRequirementsManager; 