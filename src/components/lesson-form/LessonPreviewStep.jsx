import React from "react";
import {
  Grid,
  Typography,
  Paper,
  Box,
  Chip,
  Divider,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  VideoLibrary as VideoLibraryIcon,
  AudioFile as AudioIcon,
  Image as ImageIcon,
  AttachFile as FileIcon,
  Link as LinkIcon,
  MenuBook as BookIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Task as TaskIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";

/**
 * LessonPreviewStep - Step 4 of lesson creation
 * Provides a comprehensive preview of the lesson before final submission
 */
const LessonPreviewStep = ({
  formData,
  requirements,
  requirementsEnabled,
  validationSummary,
  onStepChange,
}) => {
  const { t } = useTranslation();
  const { theme: customTheme } = useCustomTheme();

  const paperSx = {
    p: 3,
    borderRadius: customTheme.shape.borderRadius,
    bgcolor: customTheme.palette.background.paper,
    border: `1px solid ${customTheme.palette.divider}`,
  };

  const sectionTitleSx = {
    color: customTheme.palette.text.primary,
    fontWeight: 600,
    fontSize: "1.1rem",
    mb: 2,
  };

  const chipSx = {
    borderRadius: customTheme.shape.borderRadius,
    mx: 0.5,
    my: 0.25,
  };

  const PreviewSection = ({ title, icon: Icon, children, hasError = false, onEdit }) => (
    <Paper 
      sx={{
        ...paperSx,
        border: hasError ? `2px solid ${customTheme.palette.error.main}` : `1px solid ${customTheme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon color={hasError ? "error" : "primary"} />
          <Typography variant="h6" sx={sectionTitleSx}>
            {title}
          </Typography>
          {hasError && <WarningIcon color="error" />}
        </Box>
        {onEdit && (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={onEdit}
            variant="outlined"
          >
            {t("common.edit", "Edit")}
          </Button>
        )}
      </Box>
      {children}
    </Paper>
  );

  const MediaPreview = ({ type, media, icon: Icon, label }) => {
    if (!media) return null;

    return (
      <Card sx={{ maxWidth: 300, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", p: 1, bgcolor: "primary.light" }}>
          <Icon sx={{ mr: 1 }} />
          <Typography variant="subtitle2">{label}</Typography>
        </Box>
        {type === "image" && media.url && (
          <CardMedia
            component="img"
            height="150"
            image={media.url}
            alt={label}
          />
        )}
        {type === "video" && media.url && (
          <video controls width="100%" height="150">
            <source src={media.url} type="video/mp4" />
          </video>
        )}
        {type === "audio" && media.url && (
          <Box sx={{ p: 2 }}>
            <audio controls style={{ width: "100%" }}>
              <source src={media.url} type="audio/mpeg" />
            </audio>
          </Box>
        )}
        <CardContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {media.name || t("createLessonForm.uploadedFile", "Uploaded file")}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={3}>
      {/* Validation Status */}
      <Grid item xs={12}>
        {validationSummary?.isAllValid ? (
          <Alert severity="success" sx={{ display: "flex", alignItems: "center" }}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t("createLessonForm.lessonReady", "Lesson Ready for Publication")}
              </Typography>
              <Typography variant="body2">
                {t("createLessonForm.allValidationsPassed", "All validations passed. Your lesson is ready to be created.")}
              </Typography>
            </Box>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ display: "flex", alignItems: "center" }}>
            <WarningIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t("createLessonForm.issuesFound", "Issues Found ({{count}})", { 
                  count: validationSummary?.totalErrors || 0 
                })}
              </Typography>
              <Typography variant="body2">
                {t("createLessonForm.pleaseReviewAndFix", "Please review and fix the issues before creating the lesson.")}
              </Typography>
            </Box>
          </Alert>
        )}
      </Grid>

      {/* Basic Information Preview */}
      <Grid item xs={12}>
        <PreviewSection 
          title={t("createLessonForm.basicInformation", "Basic Information")}
          icon={SchoolIcon}
          hasError={!validationSummary?.stepValidities?.[0]}
          onEdit={() => onStepChange(0)}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {formData.title || t("createLessonForm.untitledLesson", "Untitled Lesson")}
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ color: "text.secondary" }}>
            {formData.description || t("createLessonForm.noDescription", "No description provided")}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
            <Chip 
              icon={<ScheduleIcon />} 
              label={`${formData.duration || 0} ${t("common.minutes", "minutes")}`}
              color="primary" 
              sx={chipSx}
            />
            <Chip 
              label={`${t("createLessonForm.orderLabel", "Order")}: ${formData.order || 0}`}
              color="secondary" 
              sx={chipSx}
            />
            <Chip 
              label={formData.status || "draft"}
              color={formData.status === "published" ? "success" : "default"} 
              sx={chipSx}
            />
          </Stack>

          {/* Learning Elements */}
          <Box sx={{ mt: 2 }}>
            {formData.vocabulary && formData.vocabulary.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t("createLessonForm.vocabularyWords", "Vocabulary Words")}:
                </Typography>
                <Box>
                  {formData.vocabulary.map((word, index) => (
                    <Chip key={index} label={word} size="small" sx={chipSx} />
                  ))}
                </Box>
              </Box>
            )}

            {formData.grammarFocus && formData.grammarFocus.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t("createLessonForm.grammarFocus", "Grammar Focus")}:
                </Typography>
                <Box>
                  {formData.grammarFocus.map((grammar, index) => (
                    <Chip key={index} label={grammar} size="small" color="info" sx={chipSx} />
                  ))}
                </Box>
              </Box>
            )}

            {formData.skills && formData.skills.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t("createLessonForm.skills", "Skills Covered")}:
                </Typography>
                <Box>
                  {formData.skills.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" color="success" sx={chipSx} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </PreviewSection>
      </Grid>

      {/* Content Preview */}
      <Grid item xs={12}>
        <PreviewSection 
          title={t("createLessonForm.content", "Content & Objectives")}
          icon={BookIcon}
          hasError={!validationSummary?.stepValidities?.[1]}
          onEdit={() => onStepChange(1)}
        >
          {formData.content ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("createLessonForm.mainContent", "Main Content")}:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {formData.content.substring(0, 300)}
                  {formData.content.length > 300 && "..."}
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("createLessonForm.noContentProvided", "No content provided")}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t("createLessonForm.learningObjectives", "Learning Objectives")}:
          </Typography>
          {formData.objectives && formData.objectives.length > 0 ? (
            <List dense>
              {formData.objectives.map((objective, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={objective} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="error">
              {t("createLessonForm.noObjectivesProvided", "No learning objectives provided")}
            </Alert>
          )}

          {formData.resources && formData.resources.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("createLessonForm.additionalResources", "Additional Resources")}:
              </Typography>
              <List dense>
                {formData.resources.map((resource, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={resource.label}
                      secondary={resource.url}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </PreviewSection>
      </Grid>

      {/* Media Preview */}
      <Grid item xs={12}>
        <PreviewSection 
          title={t("createLessonForm.mediaContent", "Media Content")}
          icon={VideoLibraryIcon}
          hasError={!validationSummary?.stepValidities?.[2]}
          onEdit={() => onStepChange(2)}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <MediaPreview 
                type="video"
                media={formData.video}
                icon={VideoLibraryIcon}
                label={t("createLessonForm.lessonVideo", "Lesson Video")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MediaPreview 
                type="audio"
                media={formData.audio}
                icon={AudioIcon}
                label={t("createLessonForm.audioContent", "Audio Content")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MediaPreview 
                type="image"
                media={formData.image}
                icon={ImageIcon}
                label={t("createLessonForm.coverImage", "Cover Image")}
              />
            </Grid>
          </Grid>

          {formData.materials && formData.materials.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("createLessonForm.additionalMaterials", "Additional Materials")}:
              </Typography>
              <List dense>
                {formData.materials.map((material, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <FileIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={material.name}
                      secondary={material.type}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {!formData.video && !formData.audio && !formData.image && 
           (!formData.materials || formData.materials.length === 0) && (
            <Typography variant="body2" color="text.secondary">
              {t("createLessonForm.noMediaContent", "No media content added. Media is optional but can enhance the learning experience.")}
            </Typography>
          )}
        </PreviewSection>
      </Grid>

      {/* Requirements Preview */}
      <Grid item xs={12}>
        <PreviewSection 
          title={t("createLessonForm.completionRequirements", "Completion Requirements")}
          icon={TaskIcon}
          hasError={!validationSummary?.stepValidities?.[3]}
          onEdit={() => onStepChange(3)}
        >
          {requirementsEnabled ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                {t("createLessonForm.requirementsEnabled", "Completion requirements are enabled for this lesson")}
              </Alert>

              {/* Completion Types */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t("createLessonForm.requiredCompletionTypes", "Required Completion Types")}:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  {requirements.requireVideoCompletion && (
                    <Chip icon={<VideoLibraryIcon />} label={t("createLessonForm.videoCompletion", "Video")} size="small" />
                  )}
                  {requirements.requireAudioCompletion && (
                    <Chip icon={<AudioIcon />} label={t("createLessonForm.audioCompletion", "Audio")} size="small" />
                  )}
                  {requirements.requireReadingCompletion && (
                    <Chip icon={<BookIcon />} label={t("createLessonForm.readingCompletion", "Reading")} size="small" />
                  )}
                  {requirements.requireTaskCompletion && (
                    <Chip icon={<TaskIcon />} label={t("createLessonForm.taskCompletion", "Tasks")} size="small" />
                  )}
                </Stack>
              </Box>

              {/* Performance Requirements */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t("createLessonForm.performanceRequirements", "Performance Requirements")}:
                </Typography>
                <Typography variant="body2">
                  • {t("createLessonForm.minimumScore", "Minimum Score")}: {requirements.minimumScore}%
                </Typography>
                {requirements.requiredTimeSpent > 0 && (
                  <Typography variant="body2">
                    • {t("createLessonForm.requiredTime", "Required Time")}: {requirements.requiredTimeSpent} {t("common.minutes", "minutes")}
                  </Typography>
                )}
              </Box>

              {/* Required Tasks & Content */}
              {(requirements.requiredTasks.length > 0 || requirements.requiredContent.length > 0) && (
                <Box>
                  {requirements.requiredTasks.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {t("createLessonForm.requiredTasks", "Required Tasks")}:
                      </Typography>
                      <Box>
                        {requirements.requiredTasks.map((task, index) => (
                          <Chip key={index} label={task} size="small" icon={<AssignmentIcon />} sx={chipSx} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {requirements.requiredContent.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {t("createLessonForm.requiredContent", "Required Content")}:
                      </Typography>
                      <Box>
                        {requirements.requiredContent.map((content, index) => (
                          <Chip key={index} label={content} size="small" icon={<BookIcon />} sx={chipSx} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              {t("createLessonForm.noRequirements", "No completion requirements set. Students can complete this lesson freely.")}
            </Alert>
          )}
        </PreviewSection>
      </Grid>
    </Grid>
  );
};

export default LessonPreviewStep;