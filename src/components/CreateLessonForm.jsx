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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { createLesson } from "../services/lessonService";
import { useHybridStorage } from "../services/hybridStorageService";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

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

  // Load draft from localStorage if available and no initialData is provided
  useEffect(() => {
    if (open && !initialData.id) {
      const draft = localStorage.getItem("lessonDraft");
      if (draft) {
        try {
          setFormData(JSON.parse(draft));
        } catch (e) {
          // Ignore JSON parse errors for corrupted drafts
        }
      }
    }
  }, [open, initialData.id]);

  // Persist formData to localStorage on every change
  useEffect(() => {
    if (open && !initialData.id) {
      localStorage.setItem("lessonDraft", JSON.stringify(formData));
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
      localStorage.removeItem("lessonDraft"); // Clear draft only after success
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
        localStorage.setItem("lessonDraft", JSON.stringify(formData));
      }
    }
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("createLessonForm.lessonTitleLabel")}
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
                label={t("createLessonForm.descriptionLabel")}
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
                label={t("createLessonForm.durationLabel")}
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
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("createLessonForm.vocabularyLabel")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t(
                    "createLessonForm.addVocabularyWordPlaceholder"
                  )}
                  value={newVocabulary}
                  onChange={(e) => setNewVocabulary(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddVocabulary}
                  startIcon={<AddIcon />}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(formData.vocabulary || []).map((word, index) => (
                  <Chip
                    key={index}
                    label={word}
                    onDelete={() => handleRemoveVocabulary(index)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("createLessonForm.grammarFocusLabel")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addGrammarPointPlaceholder")}
                  value={newGrammarFocus}
                  onChange={(e) => setNewGrammarFocus(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddGrammarFocus}
                  startIcon={<AddIcon />}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(formData.grammarFocus || []).map((grammar, index) => (
                  <Chip
                    key={index}
                    label={grammar}
                    onDelete={() => handleRemoveGrammarFocus(index)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("createLessonForm.skillsLabel")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addSkillPlaceholder")}
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  startIcon={<AddIcon />}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(formData.skills || []).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(index)}
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
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("createLessonForm.keyActivitiesLabel")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addActivityPlaceholder")}
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddActivity}
                  startIcon={<AddIcon />}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(formData.keyActivities || []).map((activity, index) => (
                  <Chip
                    key={index}
                    label={activity}
                    onDelete={() => handleRemoveActivity(index)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("createLessonForm.contentLabel")}
                value={formData.content}
                onChange={handleChange("content")}
                multiline
                rows={6}
                error={!!errors.content}
                helperText={errors.content}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("createLessonForm.learningObjectivesLabel")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
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
                />
                <Button
                  variant="contained"
                  onClick={handleAddObjective}
                  startIcon={<AddIcon />}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.objectives.map((objective, index) => (
                  <Chip
                    key={index}
                    label={objective}
                    onDelete={() => handleRemoveObjective(index)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("createLessonForm.resourcesLabel")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addResourcePlaceholder")}
                  value={newResource.label}
                  onChange={(e) =>
                    setNewResource({ ...newResource, label: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addResourceUrlPlaceholder")}
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource({ ...newResource, url: e.target.value })
                  }
                />
                <Button
                  variant="contained"
                  onClick={handleAddResource}
                  startIcon={<AddIcon />}
                >
                  {t("createLessonForm.addButton")}
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.resources.map((resource, index) => (
                  <Chip
                    key={index}
                    label={`${resource.label}: ${resource.url}`}
                    onDelete={() => handleRemoveResource(index)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {t("createLessonForm.videoLabel")}
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
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
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formData.video.name}
                      </Typography>
                      <video
                        src={formData.video.url}
                        controls
                        style={{ width: "100%", maxHeight: "200px" }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {t("createLessonForm.audioLabel")}
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
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
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formData.audio.name}
                      </Typography>
                      <audio
                        src={formData.audio.url}
                        controls
                        style={{ width: "100%" }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {t("createLessonForm.imageLabel")}
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
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
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formData.image.name}
                      </Typography>
                      <img
                        src={formData.image.url}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {t("createLessonForm.courseMaterialsLabel")}
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
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
                      <Typography variant="subtitle2" gutterBottom>
                        {t("createLessonForm.uploadedMaterialsLabel")}:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {formData.materials.map((material, index) => (
                          <Chip
                            key={index}
                            label={material.name}
                            onDelete={() => handleRemoveMaterial(index)}
                            icon={<CloudUploadIcon />}
                            sx={{ m: 0.5 }}
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
          <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {formData.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {formData.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t("createLessonForm.durationLabel")}: {formData.duration}{" "}
                {t("createLessonForm.minutes")}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                {t("createLessonForm.contentLabel")}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {formData.content}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                {t("createLessonForm.learningObjectivesLabel")}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {formData.objectives.map((objective, index) => (
                  <Chip key={index} label={objective} />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                {t("createLessonForm.resourcesLabel")}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.resources.map((resource, index) => (
                  <Chip
                    key={index}
                    label={`${resource.label}: ${resource.url}`}
                    onClick={() => window.open(resource.url, "_blank")}
                  />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                {t("createLessonForm.courseMaterialsLabel")}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {formData.materials.map((material, index) => (
                  <Chip
                    key={index}
                    label={material.name}
                    icon={<CloudUploadIcon />}
                    onClick={() => window.open(material.url, "_blank")}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>

              <Grid container spacing={2} sx={{ mt: 3 }}>
                {formData.video && (
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardMedia
                        component="video"
                        controls
                        src={formData.video.url}
                        sx={{ height: 200 }}
                      />
                      <CardContent>
                        <Typography variant="subtitle2">
                          {t("createLessonForm.videoLabel")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {formData.audio && (
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardMedia
                        component="audio"
                        controls
                        src={formData.audio.url}
                        sx={{ height: 100 }}
                      />
                      <CardContent>
                        <Typography variant="subtitle2">
                          {t("createLessonForm.audioLabel")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {formData.image && (
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardMedia
                        component="img"
                        image={formData.image.url}
                        sx={{ height: 200, objectFit: "cover" }}
                      />
                      <CardContent>
                        <Typography variant="subtitle2">
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">
            {dialogTitle ||
              (initialData && initialData.id
                ? t("courses.lessons.editLesson")
                : t("courses.lessons.createLesson"))}
          </Typography>
          <Box>
            <IconButton onClick={onClose} sx={{ mr: 1 }}>
              <CloseIcon />
            </IconButton>
            <Button
              variant="outlined"
              onClick={() => setPreviewMode(!previewMode)}
              startIcon={<PreviewIcon />}
              sx={{ mr: 1 }}
            >
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                localStorage.removeItem("lessonDraft");
                setFormData({
                  courseId: courseId || "",
                  moduleId: moduleId || "",
                  title: "",
                  description: "",
                  content: "",
                  duration: "",
                  objectives: [],
                  resources: [],
                  order: 0,
                  video: null,
                  audio: null,
                  image: null,
                  materials: [],
                  type: "lesson",
                  status: "draft",
                  vocabulary: [],
                  grammarFocus: [],
                  skills: [],
                  assessment: "",
                  keyActivities: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }}
              sx={{ borderRadius: 2 }}
            >
              {t("common.clearDraft")}
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {previewMode ? (
          renderStepContent(3)
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
              {loading
                ? t("common.saving")
                : submitLabel ||
                  (initialData && initialData.id
                    ? t("common.save")
                    : t("courses.lessons.add"))}
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
