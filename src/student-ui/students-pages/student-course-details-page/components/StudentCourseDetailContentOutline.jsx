import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  IconButton,
  Fade,
  Skeleton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const StudentCourseDetailContentOutline = ({
  modules,
  lessons,
  onLessonComplete,
  onLessonUndo,
  user,
  loading,
}) => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [completedLessonTitle, setCompletedLessonTitle] = useState("");
  const [undoLessonId, setUndoLessonId] = useState(null);
  const [animatingLessonId, setAnimatingLessonId] = useState(null);
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={200}
        sx={{ borderRadius: theme.shape.borderRadius, mb: 3 }}
      />
    );
  }
  if (!Array.isArray(modules) || modules.length === 0) return null;
  const userId = user?.uid || user?.id;

  // Group lessons by moduleId
  const lessonsByModule = {};
  if (Array.isArray(lessons)) {
    lessons.forEach((lesson) => {
      if (!lessonsByModule[lesson.moduleId])
        lessonsByModule[lesson.moduleId] = [];
      lessonsByModule[lesson.moduleId].push(lesson);
    });
  }

  const handleComplete = async (lesson) => {
    setAnimatingLessonId(lesson.id);
    (await onLessonComplete) && onLessonComplete(lesson.id);
    setCompletedLessonTitle(lesson.title);
    setUndoLessonId(lesson.id);
    setSnackbarOpen(true);
    setTimeout(() => setAnimatingLessonId(null), 800);
  };

  const handleUndo = async () => {
    if (onLessonUndo && undoLessonId) {
      await onLessonUndo(undoLessonId);
    }
    setSnackbarOpen(false);
    setUndoLessonId(null);
  };

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          mb: 3,
          bgcolor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          p: { xs: 2, md: 3 },
        }}
        aria-label={t("studentCourseDetails.contentOutline.ariaLabel")}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t("studentCourseDetails.contentOutline.title")}
        </Typography>
        {modules.map((mod) => (
          <Accordion
            key={mod.id || mod.title}
            sx={{
              mb: 1,
              bgcolor: theme.palette.background.default,
              boxShadow: theme.shadows[1],
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={500}>{mod.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {mod.description}
              </Typography>
              <List dense>
                {(lessonsByModule[mod.id] || []).map((lesson) => {
                  const completed =
                    Array.isArray(lesson.completedBy) &&
                    userId &&
                    lesson.completedBy.includes(userId);
                  return (
                    <ListItem
                      key={lesson.id || lesson.title}
                      sx={{ pl: 2 }}
                      divider
                    >
                      <ListItemText primary={lesson.title} />
                      <ListItemSecondaryAction>
                        <Fade
                          in={animatingLessonId === lesson.id}
                          timeout={800}
                        >
                          <CheckCircleIcon
                            color="success"
                            sx={{
                              mr: 1,
                              visibility:
                                animatingLessonId === lesson.id
                                  ? "visible"
                                  : "hidden",
                            }}
                          />
                        </Fade>
                        <Checkbox
                          edge="end"
                          checked={completed}
                          disabled={completed}
                          onChange={() => handleComplete(lesson)}
                          inputProps={{
                            "aria-label": t(
                              "studentCourseDetails.contentOutline.markAsCompleted",
                              { lesson: lesson.title }
                            ),
                          }}
                          color="primary"
                          sx={{ width: 32, height: 32 }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={t("studentCourseDetails.contentOutline.lessonCompleted", {
            title: completedLessonTitle ? ` (${completedLessonTitle})` : "",
          })}
          action={
            onLessonUndo ? (
              <IconButton
                size="small"
                color="inherit"
                onClick={handleUndo}
                aria-label="undo"
              >
                {t("studentCourseDetails.contentOutline.undo")}
              </IconButton>
            ) : null
          }
        />
      </Box>
    </Fade>
  );
};

export default StudentCourseDetailContentOutline;
