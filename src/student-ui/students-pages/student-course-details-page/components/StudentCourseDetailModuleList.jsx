import React, { useState, useRef } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Fade,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Grid,
  Paper,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const MAX_HEIGHT = 220; // px, adjust for ~3-4 modules

const StudentCourseDetailModuleList = ({ modules = [], lessons = [] }) => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [completedLessons, setCompletedLessons] = useState({});
  const contentRef = useRef(null);

  // Group lessons by moduleId
  const lessonsByModule = {};
  lessons.forEach((lesson) => {
    if (!lessonsByModule[lesson.moduleId])
      lessonsByModule[lesson.moduleId] = [];
    lessonsByModule[lesson.moduleId].push(lesson);
  });

  // Handle lesson completion toggle
  const handleLessonCompletion = (lessonId, event) => {
    event.stopPropagation();
    setCompletedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  // Handle lesson navigation
  const handleLessonClick = (lessonId) => {
    navigate(`/student/lessons/${lessonId}`);
  };

  // Calculate module progress
  const getModuleProgress = (moduleId) => {
    const moduleLessons = lessonsByModule[moduleId] || [];
    if (moduleLessons.length === 0) return 0;
    const completedCount = moduleLessons.filter(
      (lesson) => completedLessons[lesson.id] || lesson.completed
    ).length;
    return Math.round((completedCount / moduleLessons.length) * 100);
  };

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          mb: { xs: 2, md: 3 },
          bgcolor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          p: { xs: 1, sm: 2, md: 3 },
          position: "relative",
          boxShadow: { xs: 0, md: 1 },
        }}
        aria-label="Course modules and lessons list"
      >
        <Typography
          fontSize={{ xs: 22, sm: 26, md: theme.typography.h3.fontSize }}
          align="center"
          variant="h3"
          fontWeight={600}
          gutterBottom
          sx={{
            fontFamily: theme.typography.h6.fontFamily,
            mb: { xs: 2, md: 3 },
          }}
        >
          {t("studentCourseDetails.moduleList.title")}
        </Typography>
        {/* Empty state for no modules */}
        {modules.length === 0 && (
          <Typography align="center" color="text.secondary" sx={{ my: 4 }}>
            {t(
              "studentCourseDetails.moduleList.noModules",
              "No modules available."
            )}
          </Typography>
        )}
        {/* Responsive grid for modules */}
        <Box
          ref={contentRef}
          sx={{
            maxHeight: expanded
              ? "none"
              : { xs: `${MAX_HEIGHT}px`, md: "none" },
            overflow: expanded ? "visible" : { xs: "hidden", md: "visible" },
            position: "relative",
            transition: "max-height 0.3s",
          }}
        >
          <Grid container spacing={2}>
            {modules.map((mod) => {
              const moduleProgress = getModuleProgress(mod.id);
              const moduleLessons = lessonsByModule[mod.id] || [];
              return (
                <Grid item xs={12} md={6} key={mod.id || mod.title}>
                  <Paper
                    sx={{
                      mb: 1,
                      bgcolor: theme.palette.background.main,
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[1],
                      "&:hover": {
                        boxShadow: theme.shadows[2],
                      },
                      p: { xs: 1, sm: 2 },
                    }}
                  >
                    {/* Module header */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        fontSize={{
                          xs: 16,
                          sm: 18,
                          md: theme.typography.body1.fontSize,
                        }}
                        fontWeight={600}
                        sx={{
                          fontFamily: theme.typography.body1.fontFamily,
                          color: theme.palette.text.primary,
                          mb: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {mod.title.trim().charAt(0).toUpperCase() +
                          mod.title.trim().slice(1).toLowerCase()}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={`${moduleLessons.length} ${t(
                            "studentCourseDetails.moduleList.lessons"
                          )}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                        />
                        {moduleProgress > 0 && (
                          <Chip
                            label={`${moduleProgress}% ${t(
                              "studentCourseDetails.moduleList.complete"
                            )}`}
                            size="small"
                            color={
                              moduleProgress === 100 ? "success" : "primary"
                            }
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                          />
                        )}
                      </Box>
                      {/* Progress bar for module completion */}
                      {moduleLessons.length > 0 && (
                        <LinearProgress
                          variant="determinate"
                          value={moduleProgress}
                          sx={{
                            height: { xs: 6, sm: 8 },
                            borderRadius: 2,
                            bgcolor: "grey.200",
                          }}
                          aria-label={t(
                            "studentCourseDetails.moduleList.progressBar",
                            "Module progress bar"
                          )}
                        />
                      )}
                    </Box>
                    {/* Lessons list */}
                    {moduleLessons.length === 0 && (
                      <Typography color="text.secondary" sx={{ my: 2 }}>
                        {t(
                          "studentCourseDetails.moduleList.noLessons",
                          "No lessons in this module."
                        )}
                      </Typography>
                    )}
                    <List
                      dense
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 1,
                        p: 0,
                      }}
                    >
                      {moduleLessons.map((lesson, index) => {
                        const isCompleted =
                          completedLessons[lesson.id] || lesson.completed;
                        return (
                          <ListItem
                            key={lesson.id || lesson.title}
                            disablePadding
                            divider={index < moduleLessons.length - 1}
                            aria-label={lesson.title}
                            aria-checked={isCompleted}
                            role="checkbox"
                            sx={{
                              px: { xs: 0, sm: 1 },
                              py: { xs: 0, sm: 0.5 },
                            }}
                          >
                            <ListItemButton
                              onClick={() => handleLessonClick(lesson.id)}
                              sx={{
                                pl: { xs: 0.5, sm: 1 },
                                pr: { xs: 1, sm: 2 },
                                py: { xs: 1, sm: 1.5 },
                                minHeight: { xs: 44, sm: 48 },
                                "&:hover": {
                                  bgcolor: theme.palette.action.hover,
                                },
                              }}
                              tabIndex={0}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Tooltip
                                  title={
                                    isCompleted
                                      ? t(
                                          "studentCourseDetails.moduleList.markIncomplete",
                                          "Mark as incomplete"
                                        )
                                      : t(
                                          "studentCourseDetails.moduleList.markComplete",
                                          "Mark as complete"
                                        )
                                  }
                                  arrow
                                >
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      handleLessonCompletion(lesson.id, e);
                                    }}
                                    sx={{
                                      color: isCompleted
                                        ? theme.palette.success.main
                                        : theme.palette.action.active,
                                      transition: "color 0.2s",
                                      p: { xs: 0.5, sm: 1 },
                                    }}
                                    aria-label={
                                      isCompleted
                                        ? t(
                                            "studentCourseDetails.moduleList.markIncomplete",
                                            "Mark as incomplete"
                                          )
                                        : t(
                                            "studentCourseDetails.moduleList.markComplete",
                                            "Mark as complete"
                                          )
                                    }
                                    aria-checked={isCompleted}
                                    role="checkbox"
                                  >
                                    {isCompleted ? (
                                      <CheckCircleIcon fontSize="small" />
                                    ) : (
                                      <RadioButtonUncheckedIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </ListItemIcon>
                              <ListItemText
                                primary={lesson.title}
                                primaryTypographyProps={{
                                  fontSize: {
                                    xs: 14,
                                    sm: theme.typography.body2.fontSize,
                                  },
                                  fontWeight: isCompleted ? 400 : 500,
                                  color: isCompleted
                                    ? theme.palette.text.secondary
                                    : theme.palette.text.primary,
                                  sx: {
                                    textDecoration: isCompleted
                                      ? "line-through"
                                      : "none",
                                    transition:
                                      "color 0.2s, text-decoration 0.2s",
                                  },
                                }}
                              />
                              {/* Lesson duration */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                }}
                              >
                                <AccessTimeIcon fontSize="small" />
                                <Typography
                                  variant="caption"
                                  sx={{ fontSize: { xs: 11, sm: 12 } }}
                                >
                                  {lesson.duration || "5"} min
                                </Typography>
                              </Box>
                              <PlayArrowIcon
                                fontSize="small"
                                sx={{
                                  color: theme.palette.primary.main,
                                  opacity: 0.7,
                                  ml: { xs: 0.5, sm: 1 },
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
          {/* Fade effect for overflow on mobile */}
          {!expanded && (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 40,
                background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, ${theme.palette.background.paper} 100%)`,
                pointerEvents: "none",
                display: { xs: "block", md: "none" },
              }}
            />
          )}
        </Box>
        <Button
          variant="text"
          color="primary"
          sx={{ mt: 1, fontSize: { xs: 14, sm: 16 } }}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded
            ? t("studentCourseDetails.moduleList.showLess")
            : t("studentCourseDetails.moduleList.showAll")}
        </Button>
      </Box>
    </Fade>
  );
};

export default StudentCourseDetailModuleList;
