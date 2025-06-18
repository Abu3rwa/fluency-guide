import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
  Stack,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  createLesson,
  updateLesson,
  getLessonById,
} from "../services/lessonService";
import { uploadFile } from "../services/storageService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const steps = ["basic", "content", "resources", "assignments"];

const LessonFormScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    duration: "",
    level: "beginner",
    prerequisites: [],
    objectives: [],
    content: "",
    resources: [],
    assignments: [],
  });

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const lesson = await getLessonById(id);
      setFormData(lesson);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    const errors = {};
    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) {
          errors.title = t("validation.required");
        }
        if (!formData.description.trim()) {
          errors.description = t("validation.required");
        }
        if (!formData.duration) {
          errors.duration = t("validation.required");
        }
        break;
      case 1: // Content
        if (!formData.content.trim()) {
          errors.content = t("validation.required");
        }
        if (formData.objectives.length === 0) {
          errors.objectives = t("validation.atLeastOne");
        }
        break;
      default:
        break;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear validation error when field is modified
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: null,
      });
    }
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content,
    });
    if (validationErrors.content) {
      setValidationErrors({
        ...validationErrors,
        content: null,
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const downloadURL = await uploadFile(file, "lesson-resources");
      setFormData({
        ...formData,
        resources: [
          ...formData.resources,
          {
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size,
          },
        ],
      });
    } catch (err) {
      setError(t("errors.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleArrayFieldChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], value],
    });
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: null,
      });
    }
  };

  const handleArrayFieldDelete = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      setLoading(true);
      if (id) {
        await updateLesson(id, formData);
      } else {
        await createLesson(formData);
      }
      navigate("/lessons");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("lessonForm.title")}
          value={formData.title}
          onChange={handleChange("title")}
          required
          error={!!validationErrors.title}
          helperText={validationErrors.title}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t("lessonForm.description")}
          value={formData.description}
          onChange={handleChange("description")}
          required
          error={!!validationErrors.description}
          helperText={validationErrors.description}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>{t("lessonForm.status")}</InputLabel>
          <Select
            value={formData.status}
            onChange={handleChange("status")}
            label={t("lessonForm.status")}
          >
            <MenuItem value="draft">{t("lessonForm.status.draft")}</MenuItem>
            <MenuItem value="published">
              {t("lessonForm.status.published")}
            </MenuItem>
            <MenuItem value="archived">
              {t("lessonForm.status.archived")}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>{t("lessonForm.level")}</InputLabel>
          <Select
            value={formData.level}
            onChange={handleChange("level")}
            label={t("lessonForm.level")}
          >
            <MenuItem value="beginner">
              {t("lessonForm.level.beginner")}
            </MenuItem>
            <MenuItem value="intermediate">
              {t("lessonForm.level.intermediate")}
            </MenuItem>
            <MenuItem value="advanced">
              {t("lessonForm.level.advanced")}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="number"
          label={t("lessonForm.duration")}
          value={formData.duration}
          onChange={handleChange("duration")}
          required
          error={!!validationErrors.duration}
          helperText={validationErrors.duration}
          InputProps={{
            endAdornment: <Typography>minutes</Typography>,
          }}
        />
      </Grid>
    </Grid>
  );

  const renderContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {t("lessonForm.content")}
        </Typography>
        <Box sx={{ height: 300, mb: 2 }}>
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleContentChange}
            style={{ height: "250px" }}
          />
        </Box>
        {validationErrors.content && (
          <Typography color="error" variant="caption">
            {validationErrors.content}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("lessonForm.objectives")}
        </Typography>
        <Stack spacing={2}>
          {formData.objectives.map((objective, index) => (
            <Box key={index} sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                value={objective}
                onChange={(e) => {
                  const newObjectives = [...formData.objectives];
                  newObjectives[index] = e.target.value;
                  setFormData({ ...formData, objectives: newObjectives });
                }}
              />
              <IconButton
                color="error"
                onClick={() => handleArrayFieldDelete("objectives", index)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleArrayFieldChange("objectives", "")}
          >
            {t("lessonForm.addObjective")}
          </Button>
          {validationErrors.objectives && (
            <Typography color="error" variant="caption">
              {validationErrors.objectives}
            </Typography>
          )}
        </Stack>
      </Grid>
    </Grid>
  );

  const renderResources = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("lessonForm.resources")}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <input
            accept="*/*"
            style={{ display: "none" }}
            id="resource-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="resource-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
            >
              {uploading
                ? t("common.uploading")
                : t("lessonForm.uploadResource")}
            </Button>
          </label>
        </Box>
        <Stack spacing={2}>
          {formData.resources.map((resource, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="subtitle1">{resource.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {resource.type} • {(resource.size / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </Typography>
              </Box>
              <Box>
                <IconButton
                  color="error"
                  onClick={() => handleArrayFieldDelete("resources", index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );

  const renderAssignments = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("lessonForm.assignments")}
        </Typography>
        <Stack spacing={2}>
          {formData.assignments.map((assignment, index) => (
            <Box key={index} sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                value={assignment}
                onChange={(e) => {
                  const newAssignments = [...formData.assignments];
                  newAssignments[index] = e.target.value;
                  setFormData({ ...formData, assignments: newAssignments });
                }}
              />
              <IconButton
                color="error"
                onClick={() => handleArrayFieldDelete("assignments", index)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleArrayFieldChange("assignments", "")}
          >
            {t("lessonForm.addAssignment")}
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderContent();
      case 2:
        return renderResources();
      case 3:
        return renderAssignments();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate("/lessons")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {id ? t("lessonForm.editTitle") : t("lessonForm.createTitle")}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{t(`lessonForm.steps.${label}`)}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3 }}>{renderStepContent(activeStep)}</Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          {t("common.back")}
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {t("common.save")}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              {t("common.next")}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LessonFormScreen;
