import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Tooltip,
  FormHelperText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import courseService from "../services/courseService";

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

const steps = ["Basic Info", "Content", "Pricing", "Publishing"];

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    thumbnail: null,
    language: "english",
    prerequisites: [],
    objectives: [],
    duration: "",
    totalLessons: 0,
    totalQuizzes: 0,
    totalAssignments: 0,
    maxStudents: "",
    price: "",
    discount: "",
    status: "draft",
    seoTitle: "",
    metaDescription: "",
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const course = await courseService.getCourseById(courseId);
      if (course) {
        setFormData(course);
      } else {
        setError("Course not found");
      }
    } catch (error) {
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));
    }
  };

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()],
      }));
      setNewPrerequisite("");
    }
  };

  const handleRemovePrerequisite = (index) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index),
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
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

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    switch (activeStep) {
      case 0:
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.description)
          newErrors.description = "Description is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.level) newErrors.level = "Level is required";
        break;
      case 1:
        if (!formData.duration) newErrors.duration = "Duration is required";
        if (formData.prerequisites.some((p) => !p)) {
          newErrors.prerequisites = "All prerequisites must be filled";
        }
        if (formData.objectives.some((o) => !o)) {
          newErrors.objectives = "All objectives must be filled";
        }
        break;
      case 2:
        if (!formData.price) newErrors.price = "Price is required";
        if (
          formData.discount &&
          (isNaN(formData.discount) ||
            formData.discount < 0 ||
            formData.discount > 100)
        ) {
          newErrors.discount = "Discount must be between 0 and 100";
        }
        break;
      case 3:
        if (!formData.status) newErrors.status = "Status is required";
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

  const handleSave = async () => {
    if (!validateStep()) return;

    try {
      setSaving(true);
      await courseService.updateCourse(courseId, formData);
      navigate("/courses");
    } catch (error) {
      //
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
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
                onChange={handleChange}
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category} required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="grammar">Grammar</MenuItem>
                  <MenuItem value="vocabulary">Vocabulary</MenuItem>
                  <MenuItem value="pronunciation">Pronunciation</MenuItem>
                  <MenuItem value="business">Business English</MenuItem>
                  <MenuItem value="conversation">Conversation</MenuItem>
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.level} required>
                <InputLabel>Level</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  label="Level"
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
                {errors.level && (
                  <FormHelperText>{errors.level}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ width: "100%" }}
              >
                Upload Thumbnail
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {formData.thumbnail && (
                <Box
                  sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Avatar
                    src={
                      typeof formData.thumbnail === "string"
                        ? formData.thumbnail
                        : URL.createObjectURL(formData.thumbnail)
                    }
                    alt={formData.title}
                    sx={{ width: 100, height: 100 }}
                  />
                  <Typography variant="caption">
                    {typeof formData.thumbnail === "string"
                      ? "Current thumbnail"
                      : formData.thumbnail.name}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (hours)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                error={!!errors.duration}
                helperText={errors.duration}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Students"
                name="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Prerequisites
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    placeholder="Add a prerequisite"
                    error={!!errors.prerequisites}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddPrerequisite}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {formData.prerequisites.map((prerequisite, index) => (
                    <Chip
                      key={index}
                      label={prerequisite}
                      onDelete={() => handleRemovePrerequisite(index)}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Learning Objectives
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Add a learning objective"
                    error={!!errors.objectives}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddObjective}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {formData.objectives.map((objective, index) => (
                    <Chip
                      key={index}
                      label={objective}
                      onDelete={() => handleRemoveObjective(index)}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount (%)"
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                error={!!errors.discount}
                helperText={errors.discount}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  label="Language"
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="arabic">Arabic</MenuItem>
                  <MenuItem value="french">French</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.status} required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SEO Title"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                helperText="This will be used for search engine optimization"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                multiline
                rows={2}
                helperText="This will be used for search engine optimization"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddTag}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate("/courses")} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Edit Course
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={
                  saving ? <CircularProgress size={20} /> : <SaveIcon />
                }
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditCourse;
