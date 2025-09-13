import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  useMediaQuery,
  Stack,
  Fade,
  Zoom,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  VideoLibrary as VideoLibraryIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import {
  updateLesson,
  updateLessonRequirements,
} from "../services/lessonService";
import { getLessonRequirements } from "../services/student-services/studentLessonProgressService";
import { useHybridStorage } from "../services/hybridStorageService";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../contexts/ThemeContext";

const steps = ["Basic Info", "Content", "Media", "Requirements", "Review"];

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UpdateLessonForm = ({
  open,
  onClose,
  onSubmit,
  lessonData = {},
  submitLabel,
  dialogTitle,
  courseId,
  moduleId,
}) => {
  // Safety check - don't render if no lesson data (must be before any hooks)
  if (!lessonData || !lessonData.id) {
    return null;
  }

  const isEditMode = Boolean(lessonData?.id);
  console.log("lessonData", lessonData);
  const { t } = useTranslation();
  const theme = useTheme();
  const { theme: customTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Track lesson data to prevent unnecessary re-renders
  const lessonDataRef = useRef(lessonData);

  const {
    uploadFile,
    uploadMultipleFiles,
    uploadFromURL,
    getProvider,
    isGoogleDriveAuthenticated,
    signInToGoogleDrive,
  } = useHybridStorage();

  const [formData, setFormData] = useState({
    courseId: courseId || lessonData?.courseId || "",
    moduleId: moduleId || lessonData?.moduleId || "",
    title: lessonData?.title || "",
    description: lessonData?.description || "",
    content: lessonData?.content || "",
    duration: lessonData?.duration || "",
    objectives: lessonData?.objectives || [],
    resources: lessonData?.resources || [],
    order: lessonData?.order || 0,
    video: lessonData?.video || null,
    audio: lessonData?.audio || null,
    image: lessonData?.image || null,
    materials: lessonData?.materials || [],
    type: lessonData?.type || "lesson",
    status: lessonData?.status || "draft",
    vocabulary: lessonData?.vocabulary || [],
    grammarFocus: lessonData?.grammarFocus || [],
    skills: lessonData?.skills || [],
    assessment: lessonData?.assessment || "",
    keyActivities: lessonData?.keyActivities || [],
    createdAt: lessonData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [activeStep, setActiveStep] = useState(steps.length - 1); // Start at Review step for editing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Control step behavior for edit mode
  useEffect(() => {
    if (open && isEditMode) {
      setActiveStep(steps.length - 1); // Always stay on review step in edit mode
    }
  }, [open, isEditMode]);

  // Load lesson data when dialog opens
  useEffect(() => {
    if (open && lessonData?.id) {
      // Update ref with current lesson data
      lessonDataRef.current = lessonData;

      setFormData({
        courseId: courseId || lessonData.courseId || "",
        moduleId: moduleId || lessonData.moduleId || "",
        title: lessonData.title || "",
        description: lessonData.description || "",
        content: lessonData.content || "",
        duration: lessonData.duration || "",
        objectives: lessonData.objectives || [],
        resources: lessonData.resources || [],
        order: lessonData.order || 0,
        video: lessonData.video || null,
        audio: lessonData.audio || null,
        image: lessonData.image || null,
        materials: lessonData.materials || [],
        type: lessonData.type || "lesson",
        status: lessonData.status || "draft",
        vocabulary: lessonData.vocabulary || [],
        grammarFocus: lessonData.grammarFocus || [],
        skills: lessonData.skills || [],
        assessment: lessonData.assessment || "",
        keyActivities: lessonData.keyActivities || [],
        createdAt: lessonData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Always start at Review step for editing
      setActiveStep(steps.length - 1);

      // Load existing lesson requirements
      loadExistingLessonRequirements(lessonData.id);
    }
  }, [open, lessonData, courseId, moduleId]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      if (!isClosing) {
        // Only reset if not triggered by normal close
        setErrors({});
        setError(null);
        setPreviewMode(false);
        if (!isEditMode) {
          setActiveStep(0);
        }
      }
      setIsClosing(false);
    }
  }, [open, isEditMode]);

  // Load existing lesson requirements
  const loadExistingLessonRequirements = async (lessonId) => {
    try {
      const existingRequirements = await getLessonRequirements(lessonId);
      if (existingRequirements && existingRequirements.enabled) {
        setRequirementsEnabled(true);
        setRequirements({
          requiredTasks: existingRequirements.requiredTasks || [],
          minimumScore: existingRequirements.minimumScore || 70,
          requiredContent: existingRequirements.requiredContent || [],
          requiredTimeSpent: existingRequirements.requiredTimeSpent || 0,
          requireVideoCompletion:
            existingRequirements.requireVideoCompletion || false,
          requireAudioCompletion:
            existingRequirements.requireAudioCompletion || false,
          requireReadingCompletion:
            existingRequirements.requireReadingCompletion || false,
          requireTaskCompletion:
            existingRequirements.requireTaskCompletion || false,
        });
      } else {
        setRequirementsEnabled(false);
        setRequirements({
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
    } catch (error) {
      setError("Error loading lesson requirements.");
      setRequirementsEnabled(false);
      setRequirements({
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
  };

  // Ensure arrays are initialized
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      vocabulary: prev.vocabulary || [],
      grammarFocus: prev.grammarFocus || [],
      skills: prev.skills || [],
      keyActivities: prev.keyActivities || [],
      resources: prev.resources || [],
      objectives: prev.objectives || [],
      materials: prev.materials || [],
    }));
  }, []);

  const [errors, setErrors] = useState({});
  const [newObjective, setNewObjective] = useState("");
  const [newResource, setNewResource] = useState({
    type: "link",
    label: "",
    url: "",
  });

  const [newAttachment, setNewAttachment] = useState({ name: "", url: "" });
  const [newVocabulary, setNewVocabulary] = useState("");
  const [newGrammarFocus, setNewGrammarFocus] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newActivity, setNewActivity] = useState("");

  // Lesson Requirements State
  const [requirementsEnabled, setRequirementsEnabled] = useState(false);
  const [requirements, setRequirements] = useState({
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

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileChange = (field) => async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (getProvider() === "google-drive" && !isGoogleDriveAuthenticated) {
      return;
    }

    setLoading(true);
    try {
      if (field === "materials") {
        const uploadedFiles = await uploadMultipleFiles(
          Array.from(files),
          `courses/${courseId}/modules/${moduleId}/materials`
        );
        setFormData((prev) => ({
          ...prev,
          materials: [...prev.materials, ...uploadedFiles],
        }));
      } else {
        const uploadedFile = await uploadFile(
          files[0],
          `courses/${courseId}/modules/${moduleId}/${field}`
        );
        setFormData((prev) => ({
          ...prev,
          [field]: uploadedFile,
        }));
      }
    } catch (error) {
      setError("File upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlUpload = async (field, url) => {
    if (getProvider() === "google-drive" && !isGoogleDriveAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      const uploadedFile = await uploadFromURL(
        url,
        `courses/${courseId}/modules/${moduleId}/${field}`
      );
      setFormData((prev) => ({
        ...prev,
        [field]: uploadedFile,
      }));
    } catch (error) {
      setError("File upload from URL failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [
          ...(prev.objectives || []).filter((obj) => obj.trim() !== ""),
          newObjective.trim(),
        ],
      }));
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: (prev.objectives || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddResource = () => {
    if (newResource.label.trim() && newResource.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        resources: [...(prev.resources || []), { ...newResource }],
      }));
      setNewResource({ type: "link", label: "", url: "" });
    }
  };

  const handleRemoveResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: (prev.resources || []).filter((_, i) => i !== index),
    }));
  };

  const handleRemoveMaterial = (index) => {
    setFormData((prev) => ({
      ...prev,
      materials: (prev.materials || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddVocabulary = () => {
    if (newVocabulary.trim()) {
      setFormData((prev) => ({
        ...prev,
        vocabulary: [...(prev.vocabulary || []), newVocabulary.trim()],
      }));
      setNewVocabulary("");
    }
  };

  const handleRemoveVocabulary = (index) => {
    setFormData((prev) => ({
      ...prev,
      vocabulary: prev.vocabulary.filter((_, i) => i !== index),
    }));
  };

  const handleAddGrammarFocus = () => {
    if (newGrammarFocus.trim()) {
      setFormData((prev) => ({
        ...prev,
        grammarFocus: [...prev.grammarFocus, newGrammarFocus.trim()],
      }));
      setNewGrammarFocus("");
    }
  };

  const handleRemoveGrammarFocus = (index) => {
    setFormData((prev) => ({
      ...prev,
      grammarFocus: prev.grammarFocus.filter((_, i) => i !== index),
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      setFormData((prev) => ({
        ...prev,
        keyActivities: [...prev.keyActivities, newActivity.trim()],
      }));
      setNewActivity("");
    }
  };

  const handleRemoveActivity = (index) => {
    setFormData((prev) => ({
      ...prev,
      keyActivities: prev.keyActivities.filter((_, i) => i !== index),
    }));
  };

  // Requirements Handlers
  const handleRequirementsToggle = (event) => {
    setRequirementsEnabled(event.target.checked);
  };

  const handleRequirementsChange = (field) => (event) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleRequirementsSwitch = (field) => (event) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
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

  const validateForm = () => {
    const newErrors = {};

    // Always validate all fields in edit mode
    if (!formData.title) newErrors.title = t("createLessonForm.titleRequired");
    if (!formData.description)
      newErrors.description = t("createLessonForm.descriptionRequired");
    if (!formData.duration)
      newErrors.duration = t("createLessonForm.durationRequired");
    if (!formData.content)
      newErrors.content = t("createLessonForm.contentRequired");
    if (formData.objectives.length === 0) {
      newErrors.objectives = t("createLessonForm.atLeastOneObjectiveRequired");
    } else if (formData.objectives.some((o) => o.trim() === "")) {
      newErrors.objectives = t("createLessonForm.emptyObjectivesNotAllowed");
    }

    if (requirementsEnabled) {
      if (
        requirements.requiredTasks.length === 0 &&
        requirements.requiredContent.length === 0 &&
        !requirements.requireVideoCompletion &&
        !requirements.requireAudioCompletion &&
        !requirements.requireReadingCompletion &&
        !requirements.requireTaskCompletion
      ) {
        newErrors.requirements = t(
          "createLessonForm.atLeastOneRequirementRequired"
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = () => {
    if (isEditMode) {
      return validateForm();
    }

    const newErrors = {};
    switch (activeStep) {
      case 0:
        if (!formData.title)
          newErrors.title = t("createLessonForm.titleRequired");
        if (!formData.description)
          newErrors.description = t("createLessonForm.descriptionRequired");
        if (!formData.duration)
          newErrors.duration = t("createLessonForm.durationRequired");
        break;
      case 1:
        if (!formData.content)
          newErrors.content = t("createLessonForm.contentRequired");
        if (formData.objectives.length === 0) {
          newErrors.objectives = t(
            "createLessonForm.atLeastOneObjectiveRequired"
          );
        } else if (formData.objectives.some((o) => o.trim() === "")) {
          newErrors.objectives = t(
            "createLessonForm.emptyObjectivesNotAllowed"
          );
        }
        break;
      case 2:
        // Optional media validation
        break;
      case 3:
        if (requirementsEnabled) {
          if (
            requirements.requiredTasks.length === 0 &&
            requirements.requiredContent.length === 0 &&
            !requirements.requireVideoCompletion &&
            !requirements.requireAudioCompletion &&
            !requirements.requireReadingCompletion &&
            !requirements.requireTaskCompletion
          ) {
            newErrors.requirements = t(
              "createLessonForm.atLeastOneRequirementRequired"
            );
          }
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (isEditMode) return;
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (isEditMode) return;
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError(t("createLessonForm.pleaseFixErrors"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!formData.courseId || !formData.moduleId) {
        throw new Error(t("createLessonForm.courseIdRequired"));
      }

      // Get the original lesson ID from the lessonData prop
      const originalLessonId = lessonData?.id;
      if (!originalLessonId) {
        throw new Error("Lesson ID is required for updates");
      }

      const updateData = {
        ...formData,
        id: originalLessonId, // Ensure ID is included in update data
        duration: parseInt(formData.duration) || 0,
        order: parseInt(formData.order) || 0,
        objectives: formData.objectives.filter((obj) => obj.trim() !== ""),
        resources: formData.resources.filter((res) => res.label && res.url),
        videoUrl: formData.video?.url || "",
        audioUrl: formData.audio?.url || "",
        coverImageUrl: formData.image?.url || "",
        materials: (formData.materials || []).map((material) => ({
          name: material.name,
          url: material.url,
          type: material.type,
        })),
        updatedAt: new Date().toISOString(),
      };

      // Update lesson - pass both the lesson ID and the update data
      const updatedLesson = await updateLesson(originalLessonId, updateData);

      if (updatedLesson) {
        // Propagate the successful update to the parent component
        onSubmit(updatedLesson);

        // Handle lesson requirements using the original lesson ID
        if (requirementsEnabled) {
          try {
            await updateLessonRequirements(originalLessonId, requirements);
          } catch (requirementsError) {
            setError(
              "Error saving lesson requirements: " + requirementsError.message
            );
          }
        } else {
          try {
            await updateLessonRequirements(originalLessonId, {
              enabled: false,
            });
          } catch (requirementsError) {
            setError(
              "Error disabling lesson requirements: " +
                requirementsError.message
            );
          }
        }

        onClose();
      }
    } catch (err) {
      console.error("=== ERROR IN HANDLE SUBMIT ===");
      console.error("Error details:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message || t("createLessonForm.errorSaving"));
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
      console.log("=== HANDLE SUBMIT FINISHED ===");
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    // Don't reset activeStep for editing - keep it at Review step
    setErrors({});
    setError(null);
    setPreviewMode(false);
    onClose();
  };

  // Reuse the same render functions from CreateLessonForm
  const renderPreview = () => (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {formData.title || "Lesson Title"}
        </Typography>
        <Typography variant="body1" paragraph>
          {formData.description || "Lesson description will appear here."}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Chip label={`${formData.duration} minutes`} color="primary" />
          <Chip label={formData.type || "Lesson"} color="secondary" />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Learning Objectives
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {formData.objectives.map((objective, index) => (
            <Chip key={index} label={objective} />
          ))}
        </Box>
        <Typography variant="h6" gutterBottom>
          Vocabulary
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {formData.vocabulary.map((word, index) => (
            <Chip key={index} label={word} />
          ))}
        </Box>

        {requirementsEnabled && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t("createLessonForm.lessonRequirementsTitle")}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {requirements.requiredTasks.map((task, index) => (
                <Chip
                  key={index}
                  label={task}
                  icon={<AssignmentIcon />}
                  color="primary"
                />
              ))}
              {requirements.requiredContent.map((content, index) => (
                <Chip
                  key={index}
                  label={content}
                  icon={<BookIcon />}
                  color="secondary"
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t("createLessonForm.minimumScoreLabel")}:{" "}
              {requirements.minimumScore}%
            </Typography>
            {requirements.requiredTimeSpent > 0 && (
              <Typography variant="body2" color="text.secondary">
                {t("createLessonForm.requiredTimeSpentLabel")}:{" "}
                {requirements.requiredTimeSpent} minutes
              </Typography>
            )}
          </>
        )}
      </Paper>
    </Box>
  );

  // Reuse the same step content rendering logic from CreateLessonForm
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lesson Title"
                name="title"
                value={formData.title}
                onChange={handleChange("title")}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange("description")}
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange("duration")}
                error={!!errors.duration}
                helperText={errors.duration}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("createLessonForm.orderLabel")}
                type="number"
                value={formData.order}
                onChange={handleChange("order")}
                helperText={t("createLessonForm.lessonSequenceInCourse")}
                size={isSmallMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: customTheme.shape.borderRadius,
                    bgcolor: customTheme.palette.background.paper,
                    "&:hover": {
                      bgcolor: customTheme.palette.action.hover,
                    },
                    "&.Mui-focused": {
                      bgcolor: customTheme.palette.background.paper,
                      boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: customTheme.palette.text.secondary,
                    "&.Mui-focused": {
                      color: customTheme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {t("createLessonForm.vocabularyLabel")}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t(
                    "createLessonForm.addVocabularyWordPlaceholder"
                  )}
                  value={newVocabulary}
                  onChange={(e) => setNewVocabulary(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.background.paper,
                      "&:hover": {
                        bgcolor: customTheme.palette.action.hover,
                      },
                      "&.Mui-focused": {
                        bgcolor: customTheme.palette.background.paper,
                        boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddVocabulary}
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    borderRadius: customTheme.shape.borderRadius,
                    bgcolor: customTheme.palette.primary.main,
                    color: customTheme.palette.primary.contrastText,
                    "&:hover": {
                      bgcolor: customTheme.palette.primary.dark,
                    },
                    minWidth: { xs: "auto", sm: 100 },
                  }}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(formData.vocabulary || []).map((word, index) => (
                  <Chip
                    key={index}
                    label={word}
                    onDelete={() => handleRemoveVocabulary(index)}
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.primary.light + "20",
                      color: customTheme.palette.primary.main,
                      "& .MuiChip-deleteIcon": {
                        color: customTheme.palette.primary.main,
                        "&:hover": {
                          color: customTheme.palette.primary.dark,
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {t("createLessonForm.grammarFocusLabel")}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addGrammarPointPlaceholder")}
                  value={newGrammarFocus}
                  onChange={(e) => setNewGrammarFocus(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.background.paper,
                      "&:hover": {
                        bgcolor: customTheme.palette.action.hover,
                      },
                      "&.Mui-focused": {
                        bgcolor: customTheme.palette.background.paper,
                        boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddGrammarFocus}
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    borderRadius: customTheme.shape.borderRadius,
                    bgcolor: customTheme.palette.secondary.main,
                    color: customTheme.palette.secondary.contrastText,
                    "&:hover": {
                      bgcolor: customTheme.palette.secondary.dark,
                    },
                    minWidth: { xs: "auto", sm: 100 },
                  }}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(formData.grammarFocus || []).map((grammar, index) => (
                  <Chip
                    key={index}
                    label={grammar}
                    onDelete={() => handleRemoveGrammarFocus(index)}
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.secondary.light + "20",
                      color: customTheme.palette.secondary.main,
                      "& .MuiChip-deleteIcon": {
                        color: customTheme.palette.secondary.main,
                        "&:hover": {
                          color: customTheme.palette.secondary.dark,
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {t("createLessonForm.skillsLabel")}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addSkillPlaceholder")}
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.background.paper,
                      "&:hover": {
                        bgcolor: customTheme.palette.action.hover,
                      },
                      "&.Mui-focused": {
                        bgcolor: customTheme.palette.background.paper,
                        boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    borderRadius: customTheme.shape.borderRadius,
                    bgcolor: customTheme.palette.success.main,
                    color: customTheme.palette.success.contrastText,
                    "&:hover": {
                      bgcolor: customTheme.palette.success.dark,
                    },
                    minWidth: { xs: "auto", sm: 100 },
                  }}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(formData.skills || []).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(index)}
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.success.light + "20",
                      color: customTheme.palette.success.main,
                      "& .MuiChip-deleteIcon": {
                        color: customTheme.palette.success.main,
                        "&:hover": {
                          color: customTheme.palette.success.dark,
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("createLessonForm.assessmentLabel")}
                value={formData.assessment || ""}
                onChange={handleChange("assessment")}
                multiline
                rows={isSmallMobile ? 2 : 3}
                size={isSmallMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: customTheme.shape.borderRadius,
                    bgcolor: customTheme.palette.background.paper,
                    "&:hover": {
                      bgcolor: customTheme.palette.action.hover,
                    },
                    "&.Mui-focused": {
                      bgcolor: customTheme.palette.background.paper,
                      boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: customTheme.palette.text.secondary,
                    "&.Mui-focused": {
                      color: customTheme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {t("createLessonForm.keyActivitiesLabel")}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addActivityPlaceholder")}
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.background.paper,
                      "&:hover": {
                        bgcolor: customTheme.palette.action.hover,
                      },
                      "&.Mui-focused": {
                        bgcolor: customTheme.palette.background.paper,
                        boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddActivity}
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    borderRadius: customTheme.shape.borderRadius,
                    bgcolor: customTheme.palette.info.main,
                    color: customTheme.palette.info.contrastText,
                    "&:hover": {
                      bgcolor: customTheme.palette.info.dark,
                    },
                    minWidth: { xs: "auto", sm: 100 },
                  }}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(formData.keyActivities || []).map((activity, index) => (
                  <Chip
                    key={index}
                    label={activity}
                    onDelete={() => handleRemoveActivity(index)}
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.info.light + "20",
                      color: customTheme.palette.info.main,
                      "& .MuiChip-deleteIcon": {
                        color: customTheme.palette.info.main,
                        "&:hover": {
                          color: customTheme.palette.info.dark,
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("createLessonForm.contentLabel")}
                value={formData.content}
                onChange={handleChange("content")}
                multiline
                rows={isSmallMobile ? 4 : 6}
                error={!!errors.content}
                helperText={errors.content}
                required
                size={isSmallMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: customTheme.shape.borderRadius,
                    bgcolor: customTheme.palette.background.paper,
                    "&:hover": {
                      bgcolor: customTheme.palette.action.hover,
                    },
                    "&.Mui-focused": {
                      bgcolor: customTheme.palette.background.paper,
                      boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: customTheme.palette.text.secondary,
                    "&.Mui-focused": {
                      color: customTheme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {t("createLessonForm.learningObjectivesLabel")}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t(
                    "createLessonForm.addLearningObjectivePlaceholder"
                  )}
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  error={!!errors.objectives}
                  helperText={errors.objectives}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.background.paper,
                      "&:hover": {
                        bgcolor: customTheme.palette.action.hover,
                      },
                      "&.Mui-focused": {
                        bgcolor: customTheme.palette.background.paper,
                        boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddObjective}
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    borderRadius: customTheme.shape.borderRadius,
                    bgcolor: customTheme.palette.primary.main,
                    color: customTheme.palette.primary.contrastText,
                    "&:hover": {
                      bgcolor: customTheme.palette.primary.dark,
                    },
                    minWidth: { xs: "auto", sm: 100 },
                  }}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.objectives.map((objective, index) => (
                  <Chip
                    key={index}
                    label={objective}
                    onDelete={() => handleRemoveObjective(index)}
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.primary.light + "20",
                      color: customTheme.palette.primary.main,
                      "& .MuiChip-deleteIcon": {
                        color: customTheme.palette.primary.main,
                        "&:hover": {
                          color: customTheme.palette.primary.dark,
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {t("createLessonForm.resourcesLabel")}
              </Typography>
              <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t("createLessonForm.addResourcePlaceholder")}
                    value={newResource.label}
                    onChange={(e) =>
                      setNewResource({ ...newResource, label: e.target.value })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: customTheme.shape.borderRadius,
                        bgcolor: customTheme.palette.background.paper,
                        "&:hover": {
                          bgcolor: customTheme.palette.action.hover,
                        },
                        "&.Mui-focused": {
                          bgcolor: customTheme.palette.background.paper,
                          boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t(
                      "createLessonForm.addResourceUrlPlaceholder"
                    )}
                    value={newResource.url}
                    onChange={(e) =>
                      setNewResource({ ...newResource, url: e.target.value })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: customTheme.shape.borderRadius,
                        bgcolor: customTheme.palette.background.paper,
                        "&:hover": {
                          bgcolor: customTheme.palette.action.hover,
                        },
                        "&.Mui-focused": {
                          bgcolor: customTheme.palette.background.paper,
                          boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddResource}
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.secondary.main,
                      color: customTheme.palette.secondary.contrastText,
                      "&:hover": {
                        bgcolor: customTheme.palette.secondary.dark,
                      },
                      minWidth: { xs: "auto", sm: 100 },
                    }}
                  >
                    {t("createLessonForm.addButton")}
                  </Button>
                </Stack>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.resources.map((resource, index) => (
                  <Chip
                    key={index}
                    label={`${resource.label}: ${resource.url}`}
                    onDelete={() => handleRemoveResource(index)}
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.secondary.light + "20",
                      color: customTheme.palette.secondary.main,
                      "& .MuiChip-deleteIcon": {
                        color: customTheme.palette.secondary.main,
                        "&:hover": {
                          color: customTheme.palette.secondary.dark,
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: customTheme.shape.borderRadius * 2,
                  bgcolor: customTheme.palette.background.paper,
                  boxShadow: customTheme.shadows[2],
                  "&:hover": {
                    boxShadow: customTheme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      color: customTheme.palette.text.primary,
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {t("createLessonForm.videoLabel")}
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    size={isSmallMobile ? "small" : "medium"}
                    sx={{
                      mb: 2,
                      borderRadius: customTheme.shape.borderRadius,
                      borderColor: customTheme.palette.primary.main,
                      color: customTheme.palette.primary.main,
                      "&:hover": {
                        borderColor: customTheme.palette.primary.dark,
                        bgcolor: customTheme.palette.primary.light + "10",
                      },
                    }}
                    disabled={loading}
                  >
                    {t("createLessonForm.uploadVideoButton")}
                    <VisuallyHiddenInput
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange("video")}
                    />
                  </Button>
                  {formData.video && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: customTheme.palette.text.secondary,
                          mb: 1,
                        }}
                      >
                        {formData.video.name}
                      </Typography>
                      <video
                        src={formData.video.url}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          borderRadius: customTheme.shape.borderRadius,
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: customTheme.shape.borderRadius * 2,
                  bgcolor: customTheme.palette.background.paper,
                  boxShadow: customTheme.shadows[2],
                  "&:hover": {
                    boxShadow: customTheme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      color: customTheme.palette.text.primary,
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {t("createLessonForm.audioLabel")}
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    size={isSmallMobile ? "small" : "medium"}
                    sx={{
                      mb: 2,
                      borderRadius: customTheme.shape.borderRadius,
                      borderColor: customTheme.palette.secondary.main,
                      color: customTheme.palette.secondary.main,
                      "&:hover": {
                        borderColor: customTheme.palette.secondary.dark,
                        bgcolor: customTheme.palette.secondary.light + "10",
                      },
                    }}
                    disabled={loading}
                  >
                    {t("createLessonForm.uploadAudioButton")}
                    <VisuallyHiddenInput
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange("audio")}
                    />
                  </Button>
                  {formData.audio && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: customTheme.palette.text.secondary,
                          mb: 1,
                        }}
                      >
                        {formData.audio.name}
                      </Typography>
                      <audio
                        src={formData.audio.url}
                        controls
                        style={{
                          width: "100%",
                          borderRadius: customTheme.shape.borderRadius,
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: customTheme.shape.borderRadius * 2,
                  bgcolor: customTheme.palette.background.paper,
                  boxShadow: customTheme.shadows[2],
                  "&:hover": {
                    boxShadow: customTheme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      color: customTheme.palette.text.primary,
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {t("createLessonForm.imageLabel")}
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    size={isSmallMobile ? "small" : "medium"}
                    sx={{
                      mb: 2,
                      borderRadius: customTheme.shape.borderRadius,
                      borderColor: customTheme.palette.success.main,
                      color: customTheme.palette.success.main,
                      "&:hover": {
                        borderColor: customTheme.palette.success.dark,
                        bgcolor: customTheme.palette.success.light + "10",
                      },
                    }}
                    disabled={loading}
                  >
                    {t("createLessonForm.uploadImageButton")}
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange("image")}
                    />
                  </Button>
                  {formData.image && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: customTheme.palette.text.secondary,
                          mb: 1,
                        }}
                      >
                        {formData.image.name}
                      </Typography>
                      <img
                        src={formData.image.url}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "cover",
                          borderRadius: customTheme.shape.borderRadius,
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: customTheme.shape.borderRadius * 2,
                  bgcolor: customTheme.palette.background.paper,
                  boxShadow: customTheme.shadows[2],
                  "&:hover": {
                    boxShadow: customTheme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      color: customTheme.palette.text.primary,
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {t("createLessonForm.courseMaterialsLabel")}
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    size={isSmallMobile ? "small" : "medium"}
                    sx={{
                      mb: 2,
                      borderRadius: customTheme.shape.borderRadius,
                      borderColor: customTheme.palette.info.main,
                      color: customTheme.palette.info.main,
                      "&:hover": {
                        borderColor: customTheme.palette.info.dark,
                        bgcolor: customTheme.palette.info.light + "10",
                      },
                    }}
                    disabled={loading}
                  >
                    {t("createLessonForm.uploadPdfMaterialsButton")}
                    <VisuallyHiddenInput
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileChange("materials")}
                    />
                  </Button>
                  {formData.materials.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          color: customTheme.palette.text.primary,
                          fontWeight: 600,
                        }}
                      >
                        {t("createLessonForm.uploadedMaterialsLabel")}:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {formData.materials.map((material, index) => (
                          <Chip
                            key={index}
                            label={material.name}
                            onDelete={() => handleRemoveMaterial(index)}
                            icon={<CloudUploadIcon />}
                            sx={{
                              m: 0.5,
                              borderRadius: customTheme.shape.borderRadius,
                              bgcolor: customTheme.palette.info.light + "20",
                              color: customTheme.palette.info.main,
                              "& .MuiChip-deleteIcon": {
                                color: customTheme.palette.info.main,
                                "&:hover": {
                                  color: customTheme.palette.info.dark,
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: customTheme.shape.borderRadius * 2,
                  bgcolor: customTheme.palette.background.paper,
                  boxShadow: customTheme.shadows[2],
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: customTheme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    mb: 2,
                  }}
                >
                  {t(
                    "createLessonForm.lessonRequirementsTitle",
                    "Lesson Completion Requirements"
                  )}
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={requirementsEnabled}
                      onChange={handleRequirementsToggle}
                      color="primary"
                    />
                  }
                  label={t(
                    "createLessonForm.enableRequirements",
                    "Enable completion requirements"
                  )}
                  sx={{ mb: 2 }}
                />

                {requirementsEnabled && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{
                        color: customTheme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {t(
                        "createLessonForm.requiredTasksLabel",
                        "Required Tasks"
                      )}
                    </Typography>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t(
                          "createLessonForm.addTaskPlaceholder",
                          "Add required task"
                        )}
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: customTheme.shape.borderRadius,
                            bgcolor: customTheme.palette.background.paper,
                            "&:hover": {
                              bgcolor: customTheme.palette.action.hover,
                            },
                            "&.Mui-focused": {
                              bgcolor: customTheme.palette.background.paper,
                              boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                            },
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddTask}
                        startIcon={<AddIcon />}
                        size="small"
                        sx={{
                          borderRadius: customTheme.shape.borderRadius,
                          bgcolor: customTheme.palette.primary.main,
                          color: customTheme.palette.primary.contrastText,
                          "&:hover": {
                            bgcolor: customTheme.palette.primary.dark,
                          },
                          minWidth: { xs: "auto", sm: 100 },
                        }}
                      >
                        {t("createLessonForm.addButton")}
                      </Button>
                    </Stack>
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
                    >
                      {requirements.requiredTasks.map((task, index) => (
                        <Chip
                          key={index}
                          label={task}
                          onDelete={() => handleRemoveTask(index)}
                          icon={<AssignmentIcon />}
                          sx={{
                            borderRadius: customTheme.shape.borderRadius,
                            bgcolor: customTheme.palette.primary.light + "20",
                            color: customTheme.palette.primary.main,
                            "& .MuiChip-deleteIcon": {
                              color: customTheme.palette.primary.main,
                              "&:hover": {
                                color: customTheme.palette.primary.dark,
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{
                        color: customTheme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {t(
                        "createLessonForm.requiredContentLabel",
                        "Required Content"
                      )}
                    </Typography>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t(
                          "createLessonForm.addContentPlaceholder",
                          "Add required content"
                        )}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: customTheme.shape.borderRadius,
                            bgcolor: customTheme.palette.background.paper,
                            "&:hover": {
                              bgcolor: customTheme.palette.action.hover,
                            },
                            "&.Mui-focused": {
                              bgcolor: customTheme.palette.background.paper,
                              boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                            },
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddContent}
                        startIcon={<AddIcon />}
                        size="small"
                        sx={{
                          borderRadius: customTheme.shape.borderRadius,
                          bgcolor: customTheme.palette.secondary.main,
                          color: customTheme.palette.secondary.contrastText,
                          "&:hover": {
                            bgcolor: customTheme.palette.secondary.dark,
                          },
                          minWidth: { xs: "auto", sm: 100 },
                        }}
                      >
                        {t("createLessonForm.addButton")}
                      </Button>
                    </Stack>
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
                    >
                      {requirements.requiredContent.map((content, index) => (
                        <Chip
                          key={index}
                          label={content}
                          onDelete={() => handleRemoveContent(index)}
                          icon={<BookIcon />}
                          sx={{
                            borderRadius: customTheme.shape.borderRadius,
                            bgcolor: customTheme.palette.secondary.light + "20",
                            color: customTheme.palette.secondary.main,
                            "& .MuiChip-deleteIcon": {
                              color: customTheme.palette.secondary.main,
                              "&:hover": {
                                color: customTheme.palette.secondary.dark,
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{
                        color: customTheme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {t(
                        "createLessonForm.completionOptionsLabel",
                        "Completion Options"
                      )}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={requirements.requireVideoCompletion}
                              onChange={handleRequirementsSwitch(
                                "requireVideoCompletion"
                              )}
                              color="primary"
                            />
                          }
                          label={t(
                            "createLessonForm.requireVideoCompletion",
                            "Require video completion"
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={requirements.requireAudioCompletion}
                              onChange={handleRequirementsSwitch(
                                "requireAudioCompletion"
                              )}
                              color="primary"
                            />
                          }
                          label={t(
                            "createLessonForm.requireAudioCompletion",
                            "Require audio completion"
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={requirements.requireReadingCompletion}
                              onChange={handleRequirementsSwitch(
                                "requireReadingCompletion"
                              )}
                              color="primary"
                            />
                          }
                          label={t(
                            "createLessonForm.requireReadingCompletion",
                            "Require reading completion"
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={requirements.requireTaskCompletion}
                              onChange={handleRequirementsSwitch(
                                "requireTaskCompletion"
                              )}
                              color="primary"
                            />
                          }
                          label={t(
                            "createLessonForm.requireTaskCompletion",
                            "Require task completion"
                          )}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label={t(
                          "createLessonForm.minimumScoreLabel",
                          "Minimum Score (%)"
                        )}
                        type="number"
                        value={requirements.minimumScore}
                        onChange={handleRequirementsChange("minimumScore")}
                        inputProps={{ min: 0, max: 100 }}
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: customTheme.shape.borderRadius,
                            bgcolor: customTheme.palette.background.paper,
                            "&:hover": {
                              bgcolor: customTheme.palette.action.hover,
                            },
                            "&.Mui-focused": {
                              bgcolor: customTheme.palette.background.paper,
                              boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label={t(
                          "createLessonForm.requiredTimeSpentLabel",
                          "Required Time Spent (minutes)"
                        )}
                        type="number"
                        value={requirements.requiredTimeSpent}
                        onChange={handleRequirementsChange("requiredTimeSpent")}
                        inputProps={{ min: 0 }}
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: customTheme.shape.borderRadius,
                            bgcolor: customTheme.palette.background.paper,
                            "&:hover": {
                              bgcolor: customTheme.palette.action.hover,
                            },
                            "&.Mui-focused": {
                              bgcolor: customTheme.palette.background.paper,
                              boxShadow: `0 0 0 2px ${customTheme.palette.primary.light}`,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {errors.requirements && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.requirements}
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Box
            sx={{
              p: { xs: 1, sm: 2 },
              pb: { xs: 4, sm: 6 }, // Add extra bottom padding to prevent cutoff
            }}
          >
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                mb: 3,
                borderRadius: customTheme.shape.borderRadius * 2,
                bgcolor: customTheme.palette.background.paper,
                boxShadow: customTheme.shadows[2],
              }}
            >
              <Typography
                variant={isSmallMobile ? "h6" : "h5"}
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: customTheme.typography.h5.fontWeight,
                  fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.5rem" },
                }}
              >
                {formData.title}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  color: customTheme.palette.text.primary,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {formData.description}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: customTheme.palette.text.secondary,
                  mb: 2,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                {t("createLessonForm.durationLabel")}: {formData.duration}{" "}
                {t("createLessonForm.minutes")}
              </Typography>

              <Divider
                sx={{
                  my: { xs: 2, sm: 3 },
                  borderColor: customTheme.palette.divider,
                }}
              />

              <Typography
                variant={isSmallMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                {t("createLessonForm.contentLabel")}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  color: customTheme.palette.text.primary,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  lineHeight: 1.6,
                }}
              >
                {formData.content}
              </Typography>

              <Typography
                variant={isSmallMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  mt: { xs: 2, sm: 3 },
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                {t("createLessonForm.learningObjectivesLabel")}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {formData.objectives.map((objective, index) => (
                  <Chip
                    key={index}
                    label={objective}
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.primary.light + "20",
                      color: customTheme.palette.primary.main,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  />
                ))}
              </Box>

              <Typography
                variant={isSmallMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                {t("createLessonForm.resourcesLabel")}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {formData.resources.map((resource, index) => (
                  <Chip
                    key={index}
                    label={`${resource.label}: ${resource.url}`}
                    onClick={() => window.open(resource.url, "_blank")}
                    sx={{
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.secondary.light + "20",
                      color: customTheme.palette.secondary.main,
                      cursor: "pointer",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      "&:hover": {
                        bgcolor: customTheme.palette.secondary.light + "30",
                      },
                    }}
                  />
                ))}
              </Box>

              <Typography
                variant={isSmallMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  mt: { xs: 2, sm: 3 },
                  color: customTheme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                {t("createLessonForm.courseMaterialsLabel")}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {formData.materials.map((material, index) => (
                  <Chip
                    key={index}
                    label={material.name}
                    icon={<CloudUploadIcon />}
                    onClick={() => window.open(material.url, "_blank")}
                    sx={{
                      m: 0.5,
                      borderRadius: customTheme.shape.borderRadius,
                      bgcolor: customTheme.palette.info.light + "20",
                      color: customTheme.palette.info.main,
                      cursor: "pointer",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      "&:hover": {
                        bgcolor: customTheme.palette.info.light + "30",
                      },
                    }}
                  />
                ))}
              </Box>

              <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 3 }}>
                {formData.video && (
                  <Grid item xs={12} md={4}>
                    <Card
                      sx={{
                        borderRadius: customTheme.shape.borderRadius * 2,
                        bgcolor: customTheme.palette.background.paper,
                        boxShadow: customTheme.shadows[2],
                      }}
                    >
                      <CardMedia
                        component="video"
                        controls
                        src={formData.video.url}
                        sx={{
                          height: { xs: 150, sm: 200 },
                          borderRadius: `${
                            customTheme.shape.borderRadius * 2
                          }px ${customTheme.shape.borderRadius * 2}px 0 0`,
                        }}
                      />
                      <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: customTheme.palette.text.primary,
                            fontWeight: 600,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          {t("createLessonForm.videoLabel")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {formData.audio && (
                  <Grid item xs={12} md={4}>
                    <Card
                      sx={{
                        borderRadius: customTheme.shape.borderRadius * 2,
                        bgcolor: customTheme.palette.background.paper,
                        boxShadow: customTheme.shadows[2],
                      }}
                    >
                      <CardMedia
                        component="audio"
                        controls
                        src={formData.audio.url}
                        sx={{
                          height: { xs: 80, sm: 100 },
                          borderRadius: `${
                            customTheme.shape.borderRadius * 2
                          }px ${customTheme.shape.borderRadius * 2}px 0 0`,
                        }}
                      />
                      <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: customTheme.palette.text.primary,
                            fontWeight: 600,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          {t("createLessonForm.audioLabel")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {formData.image && (
                  <Grid item xs={12} md={4}>
                    <Card
                      sx={{
                        borderRadius: customTheme.shape.borderRadius * 2,
                        bgcolor: customTheme.palette.background.paper,
                        boxShadow: customTheme.shadows[2],
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={formData.image.url}
                        sx={{
                          height: { xs: 150, sm: 200 },
                          objectFit: "cover",
                          borderRadius: `${
                            customTheme.shape.borderRadius * 2
                          }px ${customTheme.shape.borderRadius * 2}px 0 0`,
                        }}
                      />
                      <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: customTheme.palette.text.primary,
                            fontWeight: 600,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          {t("createLessonForm.imageLabel")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        {dialogTitle || t("createLessonForm.editLesson")}
      </DialogTitle>
      <DialogContent>
        {previewMode ? (
          renderPreview()
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 2 }}>{renderStepContent(activeStep)}</Box>
          </>
        )}
      </DialogContent>
      {!previewMode && (
        <DialogActions sx={{ p: 3 }}>
          {!isEditMode && (
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              {t("createLessonForm.back")}
            </Button>
          )}
          <Box sx={{ flex: "1 1 auto" }} />
          {isEditMode ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading
                ? t("createLessonForm.saving")
                : submitLabel || t("createLessonForm.updateLesson")}
            </Button>
          ) : activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              color="primary"
              disabled={loading}
            >
              {t("createLessonForm.create")}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} color="primary">
              {t("createLessonForm.next")}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default UpdateLessonForm;
