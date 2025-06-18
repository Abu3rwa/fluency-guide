import React, { useState, useEffect } from "react";
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
import storageService from "../services/storageService";
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

const CreateLessonForm = ({
  courseId,
  moduleId,
  onSuccess,
  onCancel,
  open,
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("lessonDraft");
    return savedData
      ? JSON.parse(savedData)
      : {
          courseId: courseId,
          moduleId: moduleId,
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
        };
  });

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
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newVocabulary, setNewVocabulary] = useState("");
  const [newGrammarFocus, setNewGrammarFocus] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newActivity, setNewActivity] = useState("");

  useEffect(() => {
    localStorage.setItem("lessonDraft", JSON.stringify(formData));
  }, [formData]);

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

  const handleFileChange = (field) => (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    if (field === "materials") {
      storageService
        .uploadMultipleFiles(
          Array.from(files),
          `courses/${courseId}/modules/${moduleId}/materials`
        )
        .then((uploadedFiles) => {
          setFormData((prev) => ({
            ...prev,
            materials: [...prev.materials, ...uploadedFiles],
          }));
          setLoading(false);
        })
        .catch((error) => {
          setNotification({
            open: true,
            message: `Failed to upload ${field}: ${error.message}`,
            severity: "error",
          });
          setLoading(false);
        });
    } else {
      const file = files[0];
      storageService
        .uploadFile(file, `courses/${courseId}/modules/${moduleId}/${field}`)
        .then((uploadedFile) => {
          setFormData((prev) => ({
            ...prev,
            [field]: uploadedFile,
          }));
          setLoading(false);
        })
        .catch((error) => {
          setNotification({
            open: true,
            message: `Failed to upload ${field}: ${error.message}`,
            severity: "error",
          });
          setLoading(false);
        });
    }
  };

  const handleUrlUpload = async (field, url) => {
    if (!storageService.isValidUrl(url)) {
      setNotification({
        open: true,
        message: "Invalid URL provided",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const uploadedFile = await storageService.uploadFromURL(
        url,
        `courses/${courseId}/modules/${moduleId}/${field}`
      );
      setFormData((prev) => ({
        ...prev,
        [field]: uploadedFile,
      }));
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to upload from URL: ${error.message}`,
        severity: "error",
      });
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
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.description)
          newErrors.description = "Description is required";
        if (!formData.duration) newErrors.duration = "Duration is required";
        break;
      case 1:
        if (!formData.content) newErrors.content = "Content is required";
        if (formData.objectives.length === 0) {
          newErrors.objectives = "At least one objective is required";
        } else if (formData.objectives.some((o) => o.trim() === "")) {
          newErrors.objectives = "Empty objectives are not allowed";
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
      // Validate required props
      if (!courseId || !moduleId) {
        throw new Error("Course ID and Module ID are required");
      }

      const lessonData = {
        courseId: courseId,
        moduleId: moduleId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        duration: parseInt(formData.duration) || 0,
        order: parseInt(formData.order) || 0,
        objectives: formData.objectives.filter((obj) => obj.trim() !== ""),
        resources: formData.resources.filter((res) => res.label && res.url),
        videoUrl: formData.video?.url || "",
        audioUrl: formData.audio?.url || "",
        coverImageUrl: formData.image?.url || "",
        materials: formData.materials.map((material) => ({
          name: material.name,
          url: material.url,
          type: material.type,
        })),
        type: "lesson",
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Submitting lesson data:", lessonData);
      const result = await createLesson(lessonData);
      console.log("Lesson creation result:", result);

      localStorage.removeItem("lessonDraft");
      setNotification({
        open: true,
        message: "Lesson created successfully",
        severity: "success",
      });
      onSuccess?.();
    } catch (err) {
      console.error("Error creating lesson:", err);
      setNotification({
        open: true,
        message: err.message || "Failed to create lesson",
        severity: "error",
      });
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
    onCancel();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lesson Title"
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
                label="Duration (hours)"
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
                label="Order"
                type="number"
                value={formData.order}
                onChange={handleChange("order")}
                helperText="Lesson sequence in the course"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Vocabulary
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add vocabulary word"
                  value={newVocabulary}
                  onChange={(e) => setNewVocabulary(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddVocabulary}
                  startIcon={<AddIcon />}
                >
                  Add
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
                Grammar Focus
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add grammar point"
                  value={newGrammarFocus}
                  onChange={(e) => setNewGrammarFocus(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddGrammarFocus}
                  startIcon={<AddIcon />}
                >
                  Add
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
                Skills
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  startIcon={<AddIcon />}
                >
                  Add
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
                label="Assessment"
                value={formData.assessment || ""}
                onChange={handleChange("assessment")}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Key Activities
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add activity"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddActivity}
                  startIcon={<AddIcon />}
                >
                  Add
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
                label="Content"
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
                Learning Objectives
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a learning objective"
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
                  Add
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
                Resources
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a resource"
                  value={newResource.label}
                  onChange={(e) =>
                    setNewResource({ ...newResource, label: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a resource URL"
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
                  Add
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
                    Video
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                    disabled={loading}
                  >
                    Upload Video
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
                    Audio
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                    disabled={loading}
                  >
                    Upload Audio
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
                    Image
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                    disabled={loading}
                  >
                    Upload Image
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
                    Course Materials (PDF)
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                    disabled={loading}
                  >
                    Upload PDF Materials
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
                        Uploaded Materials:
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
                Duration: {formData.duration} minutes
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Content
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {formData.content}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Learning Objectives
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {formData.objectives.map((objective, index) => (
                  <Chip key={index} label={objective} />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Resources
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
                Course Materials
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
                        <Typography variant="subtitle2">Video</Typography>
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
                        <Typography variant="subtitle2">Audio</Typography>
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
                        <Typography variant="subtitle2">Image</Typography>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">{t("lessons.addLesson")}</Typography>
          <Box>
            <IconButton onClick={handleClose} sx={{ mr: 1 }}>
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
                  courseId: courseId,
                  moduleId: moduleId,
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
              {loading ? "Saving..." : "Create Lesson"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} color="primary">
              Next
            </Button>
          )}
        </DialogActions>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CreateLessonForm;
