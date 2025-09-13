import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";

/**
 * LessonBasicInfoStep - Step 0 of lesson creation
 * Handles basic lesson information including title, description, duration,
 * vocabulary, grammar focus, skills, and key activities
 */
const LessonBasicInfoStep = ({
  formData,
  errors,
  newVocabulary,
  newGrammarFocus,
  newSkill,
  newActivity,
  onFormDataChange,
  onNewVocabularyChange,
  onNewGrammarFocusChange,
  onNewSkillChange,
  onNewActivityChange,
  onAddVocabulary,
  onRemoveVocabulary,
  onAddGrammarFocus,
  onRemoveGrammarFocus,
  onAddSkill,
  onRemoveSkill,
  onAddActivity,
  onRemoveActivity,
}) => {
  const { t } = useTranslation();
  const { theme: customTheme } = useCustomTheme();

  const textFieldSx = {
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
  };

  const chipSx = {
    borderRadius: customTheme.shape.borderRadius,
    bgcolor: customTheme.palette.primary.light + "20",
    color: customTheme.palette.primary.main,
    "& .MuiChip-deleteIcon": {
      color: customTheme.palette.primary.main,
      "&:hover": {
        color: customTheme.palette.primary.dark,
      },
    },
  };

  const buttonSx = {
    borderRadius: customTheme.shape.borderRadius,
    bgcolor: customTheme.palette.primary.main,
    color: customTheme.palette.primary.contrastText,
    "&:hover": {
      bgcolor: customTheme.palette.primary.dark,
    },
    minWidth: { xs: "auto", sm: 100 },
  };

  const sectionTitleSx = {
    color: customTheme.palette.text.primary,
    fontWeight: 600,
    fontSize: { xs: "0.9rem", sm: "1rem" },
    mb: 1,
  };

  return (
    <Grid container spacing={3}>
      {/* Basic Information Fields */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("createLessonForm.lessonTitle", "Lesson Title")}
          name="title"
          value={formData.title}
          onChange={onFormDataChange("title")}
          error={!!errors.title}
          helperText={errors.title}
          required
          sx={textFieldSx}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("createLessonForm.description", "Description")}
          name="description"
          value={formData.description}
          onChange={onFormDataChange("description")}
          multiline
          rows={3}
          error={!!errors.description}
          helperText={errors.description}
          required
          sx={textFieldSx}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t("createLessonForm.duration", "Duration (minutes)")}
          name="duration"
          type="number"
          value={formData.duration}
          onChange={onFormDataChange("duration")}
          error={!!errors.duration}
          helperText={errors.duration}
          required
          inputProps={{ min: 1, max: 480 }}
          sx={textFieldSx}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={t("createLessonForm.orderLabel", "Lesson Order")}
          type="number"
          value={formData.order}
          onChange={onFormDataChange("order")}
          helperText={t("createLessonForm.lessonSequenceInCourse", "Lesson sequence in course")}
          inputProps={{ min: 0 }}
          sx={textFieldSx}
        />
      </Grid>

      {/* Vocabulary Section */}
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={sectionTitleSx}>
          {t("createLessonForm.vocabularyLabel", "Vocabulary Words")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("createLessonForm.addVocabularyWordPlaceholder", "Add vocabulary word...")}
            value={newVocabulary}
            onChange={onNewVocabularyChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddVocabulary();
              }
            }}
            sx={textFieldSx}
          />
          <Button
            variant="contained"
            onClick={onAddVocabulary}
            startIcon={<AddIcon />}
            size="small"
            sx={buttonSx}
          >
            {t("createLessonForm.addButton", "Add")}
          </Button>
        </Stack>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {(formData.vocabulary || []).map((word, index) => (
            <Chip
              key={index}
              label={word}
              onDelete={() => onRemoveVocabulary(index)}
              sx={chipSx}
            />
          ))}
        </Box>
      </Grid>

      {/* Grammar Focus Section */}
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={sectionTitleSx}>
          {t("createLessonForm.grammarFocusLabel", "Grammar Focus")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("createLessonForm.addGrammarPointPlaceholder", "Add grammar point...")}
            value={newGrammarFocus}
            onChange={onNewGrammarFocusChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddGrammarFocus();
              }
            }}
            sx={textFieldSx}
          />
          <Button
            variant="contained"
            onClick={onAddGrammarFocus}
            startIcon={<AddIcon />}
            size="small"
            sx={buttonSx}
          >
            {t("createLessonForm.addButton", "Add")}
          </Button>
        </Stack>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {(formData.grammarFocus || []).map((grammar, index) => (
            <Chip
              key={index}
              label={grammar}
              onDelete={() => onRemoveGrammarFocus(index)}
              sx={chipSx}
            />
          ))}
        </Box>
      </Grid>

      {/* Skills Section */}
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={sectionTitleSx}>
          {t("createLessonForm.skillsLabel", "Skills Covered")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("createLessonForm.addSkillPlaceholder", "Add skill (e.g., Reading, Writing, Listening...)")}
            value={newSkill}
            onChange={onNewSkillChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSkill();
              }
            }}
            sx={textFieldSx}
          />
          <Button
            variant="contained"
            onClick={onAddSkill}
            startIcon={<AddIcon />}
            size="small"
            sx={buttonSx}
          >
            {t("createLessonForm.addButton", "Add")}
          </Button>
        </Stack>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {(formData.skills || []).map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              onDelete={() => onRemoveSkill(index)}
              sx={chipSx}
            />
          ))}
        </Box>
      </Grid>

      {/* Key Activities Section */}
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={sectionTitleSx}>
          {t("createLessonForm.keyActivitiesLabel", "Key Activities")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("createLessonForm.addActivityPlaceholder", "Add key activity...")}
            value={newActivity}
            onChange={onNewActivityChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddActivity();
              }
            }}
            sx={textFieldSx}
          />
          <Button
            variant="contained"
            onClick={onAddActivity}
            startIcon={<AddIcon />}
            size="small"
            sx={buttonSx}
          >
            {t("createLessonForm.addButton", "Add")}
          </Button>
        </Stack>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {(formData.keyActivities || []).map((activity, index) => (
            <Chip
              key={index}
              label={activity}
              onDelete={() => onRemoveActivity(index)}
              sx={chipSx}
            />
          ))}
        </Box>
      </Grid>

      {/* Assessment Section */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t("createLessonForm.assessmentLabel", "Assessment Type")}
          name="assessment"
          value={formData.assessment}
          onChange={onFormDataChange("assessment")}
          placeholder={t("createLessonForm.assessmentPlaceholder", "e.g., Quiz, Assignment, Discussion")}
          sx={textFieldSx}
        />
      </Grid>
    </Grid>
  );
};

export default LessonBasicInfoStep;