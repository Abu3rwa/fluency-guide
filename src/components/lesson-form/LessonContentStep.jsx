import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  FileDownload as FileIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";

/**
 * LessonContentStep - Step 1 of lesson creation
 * Handles lesson content, learning objectives, and additional resources
 */
const LessonContentStep = ({
  formData,
  errors,
  newObjective,
  newResource,
  onFormDataChange,
  onNewObjectiveChange,
  onNewResourceChange,
  onAddObjective,
  onRemoveObjective,
  onAddResource,
  onRemoveResource,
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
    bgcolor: customTheme.palette.secondary.light + "20",
    color: customTheme.palette.secondary.main,
    "& .MuiChip-deleteIcon": {
      color: customTheme.palette.secondary.main,
      "&:hover": {
        color: customTheme.palette.secondary.dark,
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
    fontSize: { xs: "1rem", sm: "1.1rem" },
    mb: 2,
  };

  const paperSx = {
    p: 2,
    borderRadius: customTheme.shape.borderRadius,
    bgcolor: customTheme.palette.background.paper,
    border: `1px solid ${customTheme.palette.divider}`,
  };

  const handleResourceFieldChange = (field) => (event) => {
    onNewResourceChange({
      ...newResource,
      [field]: event.target.value,
    });
  };

  return (
    <Grid container spacing={3}>
      {/* Main Lesson Content */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={sectionTitleSx}>
          {t("createLessonForm.mainContent", "Main Lesson Content")}
        </Typography>
        <TextField
          fullWidth
          label={t("createLessonForm.content", "Lesson Content")}
          name="content"
          value={formData.content}
          onChange={onFormDataChange("content")}
          multiline
          rows={8}
          error={!!errors.content}
          helperText={
            errors.content || 
            t("createLessonForm.contentHint", "Enter the main lesson content, instructions, and explanations")
          }
          required
          sx={textFieldSx}
        />
      </Grid>

      {/* Learning Objectives Section */}
      <Grid item xs={12}>
        <Paper sx={paperSx}>
          <Typography variant="h6" sx={sectionTitleSx}>
            {t("createLessonForm.learningObjectives", "Learning Objectives")} *
          </Typography>
          
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("createLessonForm.addObjectivePlaceholder", "Add learning objective...")}
              value={newObjective}
              onChange={onNewObjectiveChange}
              error={!!errors.objectives}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddObjective();
                }
              }}
              sx={textFieldSx}
            />
            <Button
              variant="contained"
              onClick={onAddObjective}
              startIcon={<AddIcon />}
              size="small"
              sx={buttonSx}
              disabled={!newObjective.trim()}
            >
              {t("createLessonForm.addButton", "Add")}
            </Button>
          </Stack>

          {errors.objectives && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {errors.objectives}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {(formData.objectives || []).map((objective, index) => (
              <Chip
                key={index}
                label={objective}
                onDelete={() => onRemoveObjective(index)}
                sx={chipSx}
              />
            ))}
          </Box>

          {formData.objectives.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t("createLessonForm.noObjectivesYet", "No learning objectives added yet. Add at least one objective.")}
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Additional Resources Section */}
      <Grid item xs={12}>
        <Paper sx={paperSx}>
          <Typography variant="h6" sx={sectionTitleSx}>
            {t("createLessonForm.additionalResources", "Additional Resources")}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("createLessonForm.resourceType", "Type")}</InputLabel>
                <Select
                  value={newResource.type}
                  onChange={handleResourceFieldChange("type")}
                  label={t("createLessonForm.resourceType", "Type")}
                  sx={textFieldSx}
                >
                  <MenuItem value="link">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinkIcon fontSize="small" />
                      {t("createLessonForm.linkResource", "Link")}
                    </Box>
                  </MenuItem>
                  <MenuItem value="file">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FileIcon fontSize="small" />
                      {t("createLessonForm.fileResource", "File")}
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label={t("createLessonForm.resourceLabel", "Label")}
                value={newResource.label}
                onChange={handleResourceFieldChange("label")}
                placeholder={t("createLessonForm.resourceLabelPlaceholder", "e.g., Reading Material, Video Tutorial")}
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label={t("createLessonForm.resourceUrl", "URL")}
                value={newResource.url}
                onChange={handleResourceFieldChange("url")}
                placeholder={t("createLessonForm.resourceUrlPlaceholder", "https://example.com/resource")}
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={onAddResource}
                startIcon={<AddIcon />}
                size="small"
                sx={buttonSx}
                disabled={!newResource.label.trim() || !newResource.url.trim()}
              >
                {t("createLessonForm.addButton", "Add")}
              </Button>
            </Grid>
          </Grid>

          {errors.resources && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {errors.resources}
            </Typography>
          )}

          {formData.resources && formData.resources.length > 0 ? (
            <Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {formData.resources.map((resource, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
                      {resource.type === "link" ? (
                        <LinkIcon fontSize="small" color="primary" />
                      ) : (
                        <FileIcon fontSize="small" color="primary" />
                      )}
                      <ListItemText
                        primary={resource.label}
                        secondary={resource.url}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          variant: "caption",
                          sx: { 
                            wordBreak: "break-word",
                            color: "text.secondary" 
                          },
                        }}
                      />
                    </Box>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onRemoveResource(index)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("createLessonForm.noResourcesYet", "No additional resources added yet. Resources are optional but can enhance the learning experience.")}
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Content Guidelines */}
      <Grid item xs={12}>
        <Paper sx={{ ...paperSx, bgcolor: customTheme.palette.info.light + "10" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "info.main" }}>
            {t("createLessonForm.contentGuidelines", "Content Guidelines")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {t("createLessonForm.guideline1", "Write clear, concise content that matches your learning objectives")}
            <br />
            • {t("createLessonForm.guideline2", "Include examples and practical applications where relevant")}
            <br />
            • {t("createLessonForm.guideline3", "Use formatting to make content scannable (headers, lists, etc.)")}
            <br />
            • {t("createLessonForm.guideline4", "Add resources that supplement and reinforce the main content")}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LessonContentStep;