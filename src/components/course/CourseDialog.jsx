import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  IconButton,
  Chip,
  Paper,
  Alert,
  FormHelperText,
  Avatar,
  Tooltip,
  Divider,
  Snackbar,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import courseService from "../../services/courseService";

const CourseDialog = ({
  open,
  onClose,
  onSave,
  initialData,
  mode = "create",
}) => {
  const { t } = useTranslation();

  const steps = [
    t("courseDialog.steps.basicInfo"),
    t("courseDialog.steps.content"),
    t("courseDialog.steps.pricing"),
    t("courseDialog.steps.publishing"),
  ];

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

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    level: "",
    thumbnail: null,
    introVideo: null,
    instructor: "",
    instructorBio: "",
    language: "english",
    prerequisites: [],
    objectives: [],
    duration: "",
    totalLessons: 0,
    totalQuizzes: 0,
    totalAssignments: 0,
    maxStudents: "",
    startDate: "",
    endDate: "",
    schedule: "",
    format: "self-paced",
    price: "",
    discount: "",
    pricingModel: "one-time",
    currency: "USD",
    discountEndDate: "",
    earlyBirdPrice: "",
    earlyBirdEndDate: "",
    status: "draft",
    seoTitle: "",
    metaDescription: "",
    tags: [],
    featured: false,
    certificateIncluded: false,
    certificateTemplate: "standard",
    accessDuration: "lifetime",
    requirements: [],
    targetAudience: [],
    whatYouWillLearn: [],
    courseMaterials: [],
    support: {
      email: "",
      hours: "",
      responseTime: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      setFormData(initialData);
    } else if (open && mode === "create") {
      // Load draft if exists
      const draft = courseService.getDraft();
      if (draft) {
        setFormData(draft);
      }
    }
  }, [open, mode, initialData]);

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
    // Save to draft if in create mode
    if (mode === "create") {
      courseService.saveDraft({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));
      // Save to draft if in create mode
      if (mode === "create") {
        courseService.saveDraft({ ...formData, [field]: file });
      }
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

  const handlePrerequisiteChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.map((item, i) =>
        i === index ? value : item
      ),
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

  const handleObjectiveChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((item, i) =>
        i === index ? value : item
      ),
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
        if (!formData.title)
          newErrors.title = t("courseDialog.validation.titleRequired");
        if (!formData.description)
          newErrors.description = t(
            "courseDialog.validation.descriptionRequired"
          );
        if (!formData.category)
          newErrors.category = t("courseDialog.validation.categoryRequired");
        if (!formData.level)
          newErrors.level = t("courseDialog.validation.levelRequired");
        break;
      case 1:
        if (!formData.duration)
          newErrors.duration = t("courseDialog.validation.durationRequired");
        if (formData.prerequisites.some((p) => !p)) {
          newErrors.prerequisites = t(
            "courseDialog.validation.prerequisitesFilled"
          );
        }
        if (formData.objectives.some((o) => !o)) {
          newErrors.objectives = t("courseDialog.validation.objectivesFilled");
        }
        break;
      case 2:
        if (!formData.price)
          newErrors.price = t("courseDialog.validation.priceRequired");
        if (
          formData.discount &&
          (isNaN(formData.discount) ||
            formData.discount < 0 ||
            formData.discount > 100)
        ) {
          newErrors.discount = t("courseDialog.validation.discountRange");
        }
        break;
      case 3:
        if (!formData.status)
          newErrors.status = t("courseDialog.validation.statusRequired");
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
      await onSave(formData);
      if (mode === "create") {
        courseService.clearDraft();
      }
      onClose();
    } catch (error) {
      // Removed notification logic
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (
      mode === "create" &&
      Object.values(formData).some((value) => value !== "")
    ) {
      if (window.confirm(t("courseDialog.confirm.unsavedChanges"))) {
        courseService.saveDraft(formData);
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
                label={t("courseDialog.fields.courseTitle")}
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
                label={t("courseDialog.fields.shortDescription")}
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                multiline
                rows={2}
                required
                error={!!errors.shortDescription}
                helperText={
                  errors.shortDescription ||
                  t("courseDialog.helpText.shortDescription")
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("courseDialog.fields.fullDescription")}
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
                <InputLabel>{t("courseDialog.fields.category")}</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label={t("courseDialog.fields.category")}
                >
                  <MenuItem value="grammar">
                    {t("courseDialog.categories.grammar")}
                  </MenuItem>
                  <MenuItem value="vocabulary">
                    {t("courseDialog.categories.vocabulary")}
                  </MenuItem>
                  <MenuItem value="pronunciation">
                    {t("courseDialog.categories.pronunciation")}
                  </MenuItem>
                  <MenuItem value="conversation">
                    {t("courseDialog.categories.conversation")}
                  </MenuItem>
                  <MenuItem value="writing">
                    {t("courseDialog.categories.writing")}
                  </MenuItem>
                  <MenuItem value="reading">
                    {t("courseDialog.categories.reading")}
                  </MenuItem>
                  <MenuItem value="listening">
                    {t("courseDialog.categories.listening")}
                  </MenuItem>
                  <MenuItem value="business">
                    {t("courseDialog.categories.business")}
                  </MenuItem>
                  <MenuItem value="exam">
                    {t("courseDialog.categories.exam")}
                  </MenuItem>
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.level} required>
                <InputLabel>{t("courseDialog.fields.level")}</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  label={t("courseDialog.fields.level")}
                >
                  <MenuItem value="beginner">
                    {t("courseDialog.levels.beginner")}
                  </MenuItem>
                  <MenuItem value="intermediate">
                    {t("courseDialog.levels.intermediate")}
                  </MenuItem>
                  <MenuItem value="advanced">
                    {t("courseDialog.levels.advanced")}
                  </MenuItem>
                </Select>
                {errors.level && (
                  <FormHelperText>{errors.level}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("courseDialog.fields.instructorName")}
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
                label={t("courseDialog.fields.instructorBio")}
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
                  {t("courseDialog.actions.uploadThumbnail")}
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "thumbnail")}
                  />
                </Button>
                {formData.thumbnail && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.thumbnail.name}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                >
                  {t("courseDialog.actions.uploadIntroVideo")}
                  <VisuallyHiddenInput
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, "introVideo")}
                  />
                </Button>
                {formData.introVideo && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.introVideo.name}
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
                {t("courseDialog.sections.prerequisites")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("courseDialog.placeholders.addPrerequisite")}
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
                  {t("courseDialog.actions.add")}
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
                {t("courseDialog.sections.learningObjectives")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t(
                    "courseDialog.placeholders.addLearningObjective"
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
                  {t("courseDialog.actions.add")}
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
                label={t("courseDialog.fields.courseDuration")}
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
                label={t("courseDialog.fields.maximumStudents")}
                name="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("courseDialog.fields.totalLessons")}
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
                label={t("courseDialog.fields.totalQuizzes")}
                name="totalQuizzes"
                type="number"
                value={formData.totalQuizzes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("courseDialog.fields.startDate")}
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
                label={t("courseDialog.fields.endDate")}
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t("courseDialog.fields.courseFormat")}</InputLabel>
                <Select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  label={t("courseDialog.fields.courseFormat")}
                >
                  <MenuItem value="self-paced">
                    {t("courseDialog.formats.selfPaced")}
                  </MenuItem>
                  <MenuItem value="scheduled">
                    {t("courseDialog.formats.scheduled")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.format === "scheduled" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("courseDialog.fields.schedule")}
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  placeholder={t("courseDialog.placeholders.scheduleExample")}
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
                label={t("courseDialog.fields.price")}
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
                label={t("courseDialog.fields.discount")}
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
                label={t("courseDialog.fields.earlyBirdPrice")}
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
                label={t("courseDialog.fields.earlyBirdEndDate")}
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
                label={t("courseDialog.fields.discountEndDate")}
                name="discountEndDate"
                type="date"
                value={formData.discountEndDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t("courseDialog.fields.pricingModel")}</InputLabel>
                <Select
                  name="pricingModel"
                  value={formData.pricingModel}
                  onChange={handleChange}
                  label={t("courseDialog.fields.pricingModel")}
                >
                  <MenuItem value="free">
                    {t("courseDialog.pricingModels.free")}
                  </MenuItem>
                  <MenuItem value="one-time">
                    {t("courseDialog.pricingModels.oneTime")}
                  </MenuItem>
                  <MenuItem value="subscription">
                    {t("courseDialog.pricingModels.subscription")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("courseDialog.sections.courseTags")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("courseDialog.placeholders.addTag")}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  {t("courseDialog.actions.add")}
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
                <InputLabel>{t("courseDialog.fields.status")}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label={t("courseDialog.fields.status")}
                >
                  <MenuItem value="draft">
                    {t("courseDialog.statuses.draft")}
                  </MenuItem>
                  <MenuItem value="published">
                    {t("courseDialog.statuses.published")}
                  </MenuItem>
                  <MenuItem value="archived">
                    {t("courseDialog.statuses.archived")}
                  </MenuItem>
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("courseDialog.fields.seoTitle")}
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                helperText={t("courseDialog.helpText.seoTitle")}
                required
                error={!!errors.seoTitle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("courseDialog.fields.metaDescription")}
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                multiline
                rows={2}
                helperText={t("courseDialog.helpText.metaDescription")}
                required
                error={!!errors.metaDescription}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t("courseDialog.fields.language")}</InputLabel>
                <Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  label={t("courseDialog.fields.language")}
                >
                  <MenuItem value="english">
                    {t("courseDialog.languages.english")}
                  </MenuItem>
                  <MenuItem value="spanish">
                    {t("courseDialog.languages.spanish")}
                  </MenuItem>
                  <MenuItem value="french">
                    {t("courseDialog.languages.french")}
                  </MenuItem>
                  <MenuItem value="german">
                    {t("courseDialog.languages.german")}
                  </MenuItem>
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
                label={t("courseDialog.fields.featureThisCourse")}
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
                label={t("courseDialog.fields.includeCertificate")}
              />
            </Grid>
            {formData.certificateIncluded && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("courseDialog.fields.certificateTemplate")}
                  name="certificateTemplate"
                  value={formData.certificateTemplate}
                  onChange={handleChange}
                  select
                >
                  <MenuItem value="standard">
                    {t("courseDialog.certificateTemplates.standard")}
                  </MenuItem>
                  <MenuItem value="premium">
                    {t("courseDialog.certificateTemplates.premium")}
                  </MenuItem>
                  <MenuItem value="custom">
                    {t("courseDialog.certificateTemplates.custom")}
                  </MenuItem>
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("courseDialog.fields.accessDuration")}
                name="accessDuration"
                value={formData.accessDuration}
                onChange={handleChange}
                select
              >
                <MenuItem value="lifetime">
                  {t("courseDialog.accessDurations.lifetime")}
                </MenuItem>
                <MenuItem value="6months">
                  {t("courseDialog.accessDurations.sixMonths")}
                </MenuItem>
                <MenuItem value="1year">
                  {t("courseDialog.accessDurations.oneYear")}
                </MenuItem>
                <MenuItem value="2years">
                  {t("courseDialog.accessDurations.twoYears")}
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {formData.title || t("courseDialog.preview.courseTitle")}
        </Typography>
        <Typography variant="body1" paragraph>
          {formData.description || t("courseDialog.preview.courseDescription")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Chip
            label={formData.level || t("courseDialog.preview.level")}
            color="primary"
          />
          <Chip
            label={formData.category || t("courseDialog.preview.category")}
            color="secondary"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t("courseDialog.sections.prerequisites")}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {formData.prerequisites.map((prerequisite, index) => (
            <Chip key={index} label={prerequisite} />
          ))}
        </Box>
        <Typography variant="h6" gutterBottom>
          {t("courseDialog.sections.learningObjectives")}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {formData.objectives.map((objective, index) => (
            <Chip key={index} label={objective} />
          ))}
        </Box>
      </Paper>
    </Box>
  );

  return (
    <>
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
          {mode === "create"
            ? t("courseDialog.titles.createNewCourse")
            : t("courseDialog.titles.editCourse")}
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
              {t("courseDialog.actions.back")}
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSave}
                color="primary"
                disabled={saving}
              >
                {saving
                  ? t("courseDialog.actions.saving")
                  : t("courseDialog.actions.createCourse")}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext} color="primary">
                {t("courseDialog.actions.next")}
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>

      {/* Removed Snackbar and Alert */}
    </>
  );
};

export default CourseDialog;
