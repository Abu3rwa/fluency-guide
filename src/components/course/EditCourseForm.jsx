
import React, { useState, useEffect } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  FormHelperText,
  FormControlLabel,
  Switch,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const steps = ["Basic Info", "Content", "Pricing", "Publishing"];

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

const EditCourseForm = ({ initialData, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
    const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
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
    await onSave(formData);
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
                label="Short Description"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                multiline
                rows={2}
                required
                error={!!errors.shortDescription}
                helperText={
                  errors.shortDescription ||
                  "Brief description for course cards and previews"
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Description"
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
                  <MenuItem value="conversation">Conversation</MenuItem>
                  <MenuItem value="writing">Writing</MenuItem>
                  <MenuItem value="reading">Reading</MenuItem>
                  <MenuItem value="listening">Listening</MenuItem>
                  <MenuItem value="business">Business English</MenuItem>
                  <MenuItem value="exam">Exam Preparation</MenuItem>
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
                  <MenuItem value="beginner">Beginner (A1-A2)</MenuItem>
                  <MenuItem value="intermediate">Intermediate (B1-B2)</MenuItem>
                  <MenuItem value="advanced">Advanced (C1-C2)</MenuItem>
                </Select>
                {errors.level && (
                  <FormHelperText>{errors.level}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instructor Name"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                required
                error={!!errors.instructor}
                helperText={errors.instructor}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instructor Bio"
                name="instructorBio"
                value={formData.instructorBio}
                onChange={handleChange}
                multiline
                rows={2}
                required
                error={!!errors.instructorBio}
                helperText={errors.instructorBio}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Thumbnail
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                {formData.thumbnail && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.thumbnail.name}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Prerequisites
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a prerequisite"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  error={!!errors.prerequisites}
                  helperText={errors.prerequisites}
                />
                <Button
                  variant="contained"
                  onClick={handleAddPrerequisite}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.prerequisites.map((prerequisite, index) => (
                  <Chip
                    key={index}
                    label={prerequisite}
                    onDelete={() => handleRemovePrerequisite(index)}
                  />
                ))}
              </Box>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Duration (hours)"
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Lessons"
                name="totalLessons"
                type="number"
                value={formData.totalLessons}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Quizzes"
                name="totalQuizzes"
                type="number"
                value={formData.totalQuizzes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Course Format</InputLabel>
                <Select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  label="Course Format"
                >
                  <MenuItem value="self-paced">Self-paced</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.format === "scheduled" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Schedule"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  placeholder="e.g., Every Monday, 2 PM"
                />
              </Grid>
            )}
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
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                required
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
                inputProps={{ min: 0, max: 100 }}
                error={!!errors.discount}
                helperText={errors.discount}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Early Bird Price"
                name="earlyBirdPrice"
                type="number"
                value={formData.earlyBirdPrice}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Early Bird End Date"
                name="earlyBirdEndDate"
                type="date"
                value={formData.earlyBirdEndDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount End Date"
                name="discountEndDate"
                type="date"
                value={formData.discountEndDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pricing Model</InputLabel>
                <Select
                  name="pricingModel"
                  value={formData.pricingModel}
                  onChange={handleChange}
                  label="Pricing Model"
                >
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="one-time">One-time Payment</MenuItem>
                  <MenuItem value="subscription">Subscription</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Course Tags
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(index)}
                  />
                ))}
              </Box>
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
                required
                error={!!errors.seoTitle}
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
                required
                error={!!errors.metaDescription}
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
                  <MenuItem value="spanish">Spanish</MenuItem>
                  <MenuItem value="french">French</MenuItem>
                  <MenuItem value="german">German</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featured: e.target.checked,
                      }))
                    }
                  />
                }
                label="Feature this course"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.certificateIncluded}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        certificateIncluded: e.target.checked,
                      }))
                    }
                  />
                }
                label="Include Certificate"
              />
            </Grid>
            {formData.certificateIncluded && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Certificate Template"
                  name="certificateTemplate"
                  value={formData.certificateTemplate}
                  onChange={handleChange}
                  select
                >
                  <MenuItem value="standard">Standard Certificate</MenuItem>
                  <MenuItem value="premium">Premium Certificate</MenuItem>
                  <MenuItem value="custom">Custom Certificate</MenuItem>
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Access Duration"
                name="accessDuration"
                value={formData.accessDuration}
                onChange={handleChange}
                select
              >
                <MenuItem value="lifetime">Lifetime Access</MenuItem>
                <MenuItem value="6months">6 Months</MenuItem>
                <MenuItem value="1year">1 Year</MenuItem>
                <MenuItem value="2years">2 Years</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>{renderStepContent(activeStep)}</Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSave : handleNext}
          color="primary"
        >
          {activeStep === steps.length - 1 ? "Save" : "Next"}
        </Button>
      </Box>
    </>
  );
};

export default EditCourseForm;
