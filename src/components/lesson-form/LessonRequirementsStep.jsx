import React from "react";
import {
  Grid,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  Paper,
  FormControlLabel,
  Switch,
  TextField,
  Slider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  VideoLibrary as VideoLibraryIcon,
  AudioFile as AudioIcon,
  MenuBook as ReadingIcon,
  Task as TaskIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";

/**
 * LessonRequirementsStep - Step 3 of lesson creation
 * Handles lesson completion requirements configuration
 */
const LessonRequirementsStep = ({
  requirementsEnabled,
  requirements,
  errors,
  newTask,
  newContent,
  onRequirementsToggle,
  onRequirementsChange,
  onRequirementsSwitch,
  onNewTaskChange,
  onNewContentChange,
  onAddTask,
  onRemoveTask,
  onAddContent,
  onRemoveContent,
}) => {
  const { t } = useTranslation();
  const { theme: customTheme } = useCustomTheme();

  const paperSx = {
    p: 3,
    borderRadius: customTheme.shape.borderRadius,
    bgcolor: customTheme.palette.background.paper,
    border: `1px solid ${customTheme.palette.divider}`,
  };

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
  };

  const chipSx = {
    borderRadius: customTheme.shape.borderRadius,
    bgcolor: customTheme.palette.warning.light + "20",
    color: customTheme.palette.warning.main,
    "& .MuiChip-deleteIcon": {
      color: customTheme.palette.warning.main,
      "&:hover": {
        color: customTheme.palette.warning.dark,
      },
    },
  };

  const RequirementCard = ({ icon: Icon, title, description, checked, onChange, color = "primary" }) => (
    <Card 
      sx={{ 
        border: checked ? `2px solid ${customTheme.palette[color].main}` : `1px solid ${customTheme.palette.divider}`,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Icon 
            sx={{ 
              fontSize: 32, 
              color: checked ? `${color}.main` : "text.secondary" 
            }} 
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <Switch
            checked={checked}
            onChange={onChange}
            color={color}
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {/* Enable Requirements Toggle */}
      <Grid item xs={12}>
        <Paper sx={paperSx}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t("createLessonForm.lessonRequirementsTitle", "Lesson Completion Requirements")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("createLessonForm.requirementsDescription", "Set requirements that students must complete before marking this lesson as finished")}
              </Typography>
            </Box>
            <Switch
              checked={requirementsEnabled}
              onChange={onRequirementsToggle}
              size="large"
              color="primary"
            />
          </Box>

          {!requirementsEnabled && (
            <Alert severity="info">
              {t("createLessonForm.requirementsDisabled", "Requirements are disabled. Students can complete this lesson without specific conditions.")}
            </Alert>
          )}
        </Paper>
      </Grid>

      {requirementsEnabled && (
        <>
          {/* Completion Type Requirements */}
          <Grid item xs={12}>
            <Paper sx={paperSx}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t("createLessonForm.completionRequirements", "Completion Requirements")}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <RequirementCard
                    icon={VideoLibraryIcon}
                    title={t("createLessonForm.videoCompletion", "Video Completion")}
                    description={t("createLessonForm.videoCompletionDesc", "Student must watch the entire lesson video")}
                    checked={requirements.requireVideoCompletion}
                    onChange={onRequirementsSwitch("requireVideoCompletion")}
                    color="primary"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <RequirementCard
                    icon={AudioIcon}
                    title={t("createLessonForm.audioCompletion", "Audio Completion")}
                    description={t("createLessonForm.audioCompletionDesc", "Student must listen to the entire audio content")}
                    checked={requirements.requireAudioCompletion}
                    onChange={onRequirementsSwitch("requireAudioCompletion")}
                    color="secondary"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <RequirementCard
                    icon={ReadingIcon}
                    title={t("createLessonForm.readingCompletion", "Reading Completion")}
                    description={t("createLessonForm.readingCompletionDesc", "Student must read through all lesson content")}
                    checked={requirements.requireReadingCompletion}
                    onChange={onRequirementsSwitch("requireReadingCompletion")}
                    color="info"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <RequirementCard
                    icon={TaskIcon}
                    title={t("createLessonForm.taskCompletion", "Task Completion")}
                    description={t("createLessonForm.taskCompletionDesc", "Student must complete all associated tasks")}
                    checked={requirements.requireTaskCompletion}
                    onChange={onRequirementsSwitch("requireTaskCompletion")}
                    color="success"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Score and Time Requirements */}
          <Grid item xs={12}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t("createLessonForm.performanceRequirements", "Performance Requirements")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Minimum Score */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        {t("createLessonForm.minimumScoreLabel", "Minimum Score")} ({requirements.minimumScore}%)
                      </Typography>
                      <Slider
                        value={requirements.minimumScore}
                        onChange={(_, value) => onRequirementsChange("minimumScore")({ target: { value } })}
                        step={5}
                        min={0}
                        max={100}
                        marks={[
                          { value: 0, label: "0%" },
                          { value: 50, label: "50%" },
                          { value: 70, label: "70%" },
                          { value: 100, label: "100%" },
                        ]}
                        valueLabelDisplay="auto"
                        sx={{ mt: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t("createLessonForm.minimumScoreDesc", "Students must achieve at least this score on assessments")}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Required Time Spent */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("createLessonForm.requiredTimeSpentLabel", "Required Time Spent (minutes)")}
                      type="number"
                      value={requirements.requiredTimeSpent}
                      onChange={onRequirementsChange("requiredTimeSpent")}
                      error={!!errors.requiredTimeSpent}
                      helperText={
                        errors.requiredTimeSpent || 
                        t("createLessonForm.requiredTimeDesc", "Minimum time students must spend on this lesson")
                      }
                      inputProps={{ min: 0, max: 480 }}
                      sx={textFieldSx}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Required Tasks */}
          <Grid item xs={12}>
            <Paper sx={paperSx}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t("createLessonForm.requiredTasksTitle", "Required Tasks")}
              </Typography>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addRequiredTaskPlaceholder", "Add required task...")}
                  value={newTask}
                  onChange={onNewTaskChange}
                  error={!!errors.requiredTasks}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onAddTask();
                    }
                  }}
                  sx={textFieldSx}
                />
                <Button
                  variant="contained"
                  onClick={onAddTask}
                  startIcon={<AddIcon />}
                  size="small"
                  disabled={!newTask.trim()}
                >
                  {t("createLessonForm.addButton", "Add")}
                </Button>
              </Stack>

              {errors.requiredTasks && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.requiredTasks}
                </Alert>
              )}

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {(requirements.requiredTasks || []).map((task, index) => (
                  <Chip
                    key={index}
                    label={task}
                    onDelete={() => onRemoveTask(index)}
                    icon={<AssignmentIcon />}
                    sx={chipSx}
                  />
                ))}
              </Box>

              {requirements.requiredTasks.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t("createLessonForm.noRequiredTasksYet", "No required tasks added yet. Tasks are optional but help structure learning.")}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Required Content */}
          <Grid item xs={12}>
            <Paper sx={paperSx}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t("createLessonForm.requiredContentTitle", "Required Content Sections")}
              </Typography>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("createLessonForm.addRequiredContentPlaceholder", "Add required content section...")}
                  value={newContent}
                  onChange={onNewContentChange}
                  error={!!errors.requiredContent}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onAddContent();
                    }
                  }}
                  sx={textFieldSx}
                />
                <Button
                  variant="contained"
                  onClick={onAddContent}
                  startIcon={<AddIcon />}
                  size="small"
                  disabled={!newContent.trim()}
                >
                  {t("createLessonForm.addButton", "Add")}
                </Button>
              </Stack>

              {errors.requiredContent && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.requiredContent}
                </Alert>
              )}

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {(requirements.requiredContent || []).map((content, index) => (
                  <Chip
                    key={index}
                    label={content}
                    onDelete={() => onRemoveContent(index)}
                    icon={<ReadingIcon />}
                    sx={chipSx}
                  />
                ))}
              </Box>

              {requirements.requiredContent.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t("createLessonForm.noRequiredContentYet", "No required content sections added yet. Specify sections students must review.")}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Requirements Summary */}
          {(requirements.requiredTasks.length > 0 || 
            requirements.requiredContent.length > 0 || 
            requirements.requireVideoCompletion ||
            requirements.requireAudioCompletion ||
            requirements.requireReadingCompletion ||
            requirements.requireTaskCompletion) && (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleIcon />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {t("createLessonForm.requirementsSummaryTitle", "Requirements Summary")}
                  </Typography>
                  <Typography variant="body2">
                    {t("createLessonForm.requirementsSummary", "Students must complete {{count}} requirement(s) to finish this lesson.", {
                      count: [
                        ...requirements.requiredTasks,
                        ...requirements.requiredContent,
                        requirements.requireVideoCompletion && "video",
                        requirements.requireAudioCompletion && "audio", 
                        requirements.requireReadingCompletion && "reading",
                        requirements.requireTaskCompletion && "tasks"
                      ].filter(Boolean).length
                    })}
                  </Typography>
                </Box>
              </Alert>
            </Grid>
          )}

          {/* Validation Error */}
          {errors.requirements && (
            <Grid item xs={12}>
              <Alert severity="error">
                {errors.requirements}
              </Alert>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

export default LessonRequirementsStep;