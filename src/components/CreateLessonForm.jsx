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
} from "@mui/icons-material";
import { createLesson } from "../services/lessonService";
import { useHybridStorage } from "../services/hybridStorageService";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../contexts/ThemeContext";

const steps = ["Basic Info", "Content", "Media", "Review"];

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

// Refactor: add new props and update logic
const CreateLessonForm = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  submitLabel,
  dialogTitle,
  courseId,
  moduleId,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { theme: customTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    uploadFile,
    uploadMultipleFiles,
    uploadFromURL,
    getProvider,
    isGoogleDriveAuthenticated,
    signInToGoogleDrive,
  } = useHybridStorage();

  // Example English lesson default values
  const defaultLesson = {
    courseId: courseId || initialData.courseId || "eng101",
    moduleId: moduleId || initialData.moduleId || "mod1",
    title: initialData.title || "Greetings and Introductions",
    description:
      initialData.description ||
      "Learn how to greet people and introduce yourself in English.",
    content:
      initialData.content ||
      "<p>In this lesson, you will learn common greetings, how to introduce yourself, and ask for someone's name.</p>",
    duration: initialData.duration || "1",
    objectives: initialData.objectives || [
      "Use basic greetings in English",
      "Introduce yourself and others",
      "Ask and answer questions about names",
    ],
    resources: initialData.resources || [
      {
        type: "link",
        label: "Greetings Video",
        url: "https://www.youtube.com/watch?v=english_greetings",
      },
      {
        type: "link",
        label: "Printable Worksheet",
        url: "https://example.com/greetings-worksheet.pdf",
      },
    ],
    order: initialData.order || 1,
    video: initialData.video || null,
    audio: initialData.audio || null,
    image: initialData.image || null,
    materials: initialData.materials || [],
    type: initialData.type || "lesson",
    status: initialData.status || "draft",
    vocabulary: initialData.vocabulary || [
      "hello",
      "good morning",
      "my name is",
      "nice to meet you",
    ],
    grammarFocus: initialData.grammarFocus || [
      "Present Simple",
      "Subject Pronouns",
    ],
    skills: initialData.skills || ["Speaking", "Listening"],
    assessment:
      initialData.assessment ||
      "Complete the dialogue and introduce yourself to a partner.",
    keyActivities: initialData.keyActivities || [
      "Role-play greetings",
      "Listening to dialogues",
      "Worksheet completion",
    ],
    createdAt: initialData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const [formData, setFormData] = useState(() => defaultLesson);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Only update formData when dialog opens or initialData actually changes
  const prevInitialData = useRef();
  useEffect(() => {
    if (open) {
      const prev = JSON.stringify(prevInitialData.current);
      const next = JSON.stringify(initialData);
      if (prev !== next) {
        // If editing an existing lesson, use the initialData directly
        if (initialData.id) {
          setFormData({
            courseId: courseId || initialData.courseId || "",
            moduleId: moduleId || initialData.moduleId || "",
            title: initialData.title || "",
            description: initialData.description || "",
            content: initialData.content || "",
            duration: initialData.duration || "",
            objectives: initialData.objectives || [],
            resources: initialData.resources || [],
            order: initialData.order || 0,
            video: initialData.video || null,
            audio: initialData.audio || null,
            image: initialData.image || null,
            materials: initialData.materials || [],
            type: initialData.type || "lesson",
            status: initialData.status || "draft",
            vocabulary: initialData.vocabulary || [],
            grammarFocus: initialData.grammarFocus || [],
            skills: initialData.skills || [],
            assessment: initialData.assessment || "",
            keyActivities: initialData.keyActivities || [],
            createdAt: initialData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          // If creating a new lesson, check for draft first
          const draft = localStorage.getItem("lessonDraft");
          if (draft) {
            try {
              setFormData(JSON.parse(draft));
            } catch (e) {
              // If draft is corrupted, use default values
              setFormData({
                courseId: courseId || initialData.courseId || "",
                moduleId: moduleId || initialData.moduleId || "",
                title: initialData.title || "",
                description: initialData.description || "",
                content: initialData.content || "",
                duration: initialData.duration || "",
                objectives: initialData.objectives || [],
                resources: initialData.resources || [],
                order: initialData.order || 0,
                video: initialData.video || null,
                audio: initialData.audio || null,
                image: initialData.image || null,
                materials: initialData.materials || [],
                type: initialData.type || "lesson",
                status: initialData.status || "draft",
                vocabulary: initialData.vocabulary || [],
                grammarFocus: initialData.grammarFocus || [],
                skills: initialData.skills || [],
                assessment: initialData.assessment || "",
                keyActivities: initialData.keyActivities || [],
                createdAt: initialData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          } else {
            // No draft, use default values
            setFormData({
              courseId: courseId || initialData.courseId || "",
              moduleId: moduleId || initialData.moduleId || "",
              title: initialData.title || "",
              description: initialData.description || "",
              content: initialData.content || "",
              duration: initialData.duration || "",
              objectives: initialData.objectives || [],
              resources: initialData.resources || [],
              order: initialData.order || 0,
              video: initialData.video || null,
              audio: initialData.audio || null,
              image: initialData.image || null,
              materials: initialData.materials || [],
              type: initialData.type || "lesson",
              status: initialData.status || "draft",
              vocabulary: initialData.vocabulary || [],
              grammarFocus: initialData.grammarFocus || [],
              skills: initialData.skills || [],
              assessment: initialData.assessment || "",
              keyActivities: initialData.keyActivities || [],
              createdAt: initialData.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        prevInitialData.current = initialData;
      }
    }
  }, [open, initialData, courseId, moduleId]);

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

  // Persist formData to localStorage on every change
  useEffect(() => {
    if (open) {
      const draftKey = initialData.id
        ? `lessonDraft_${initialData.id}`
        : "lessonDraft";
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, open, initialData.id]);

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

    // Check if using Google Drive and user is not authenticated
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
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const handleUrlUpload = async (field, url) => {
    // Check if using Google Drive and user is not authenticated
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
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [
          ...prev.objectives.filter((obj) => obj.trim() !== ""),
          newObjective.trim(),
        ],
      }));
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleAddResource = () => {
    if (newResource.label.trim() && newResource.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        resources: [...prev.resources, { ...newResource }],
      }));
      setNewResource({ type: "link", label: "", url: "" });
    }
  };

  const handleRemoveResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleAddAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, { ...newAttachment }],
      }));
      setNewAttachment({ name: "", url: "" });
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveMaterial = (index) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const handleAddVocabulary = () => {
    if (newVocabulary.trim()) {
      setFormData((prev) => ({
        ...prev,
        vocabulary: [...prev.vocabulary, newVocabulary.trim()],
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

  const validateStep = () => {
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
        // Optional media validation if needed
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      setLoading(true);
      if (!formData.courseId || !formData.moduleId) {
        throw new Error(t("createLessonForm.courseIdRequired"));
      }
      const lessonData = {
        ...formData,
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
      await onSubmit(lessonData);
      // Clear draft only after success
      const draftKey = initialData.id
        ? `lessonDraft_${initialData.id}`
        : "lessonDraft";
      localStorage.removeItem(draftKey);
    } catch (err) {
      setError(err.message || t("createLessonForm.errorSaving"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (Object.values(formData).some((value) => value !== "")) {
      if (
        window.confirm(
          "You have unsaved changes. Do you want to save them as a draft?"
        )
      ) {
        const draftKey = initialData.id
          ? `lessonDraft_${initialData.id}`
          : "lessonDraft";
        localStorage.setItem(draftKey, JSON.stringify(formData));
      } else {
        // Clear draft if user doesn't want to save
        const draftKey = initialData.id
          ? `lessonDraft_${initialData.id}`
          : "lessonDraft";
        localStorage.removeItem(draftKey);
      }
    }
    // Reset form state
    setActiveStep(0);
    setErrors({});
    setError(null);
    setPreviewMode(false);
    onClose();
  };

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
      </Paper>
    </Box>
  );

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
      onClose={onClose}
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
        {initialData && initialData.id ? "Edit Lesson" : "Create New Lesson"}
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
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              color="primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create Lesson"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} color="primary">
              Next
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CreateLessonForm;
