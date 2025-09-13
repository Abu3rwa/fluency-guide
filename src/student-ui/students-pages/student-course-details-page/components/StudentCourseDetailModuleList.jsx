import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  updateLessonCompletion,
  getLessonCompletionStatus,
  updateLessonCompletionWithRequirements,
  CompletionRequirementsError,
} from "../../../../services/student-services/studentLessonProgressService";
import { useLessonRequirements } from "../../../../hooks/useFeatureFlag";
import LessonRequirementsDialog from "../../../../components/LessonRequirementsDialog";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
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
import i18n from "i18next";
import { Link, useNavigate } from "react-router-dom";
import { studentCoursePreviewService } from "../../../../services/student-services/studentCoursePreviewService";

const MAX_HEIGHT = 220; // px, adjust for ~3-4 modules

// Helper function to convert numbers to Arabic ordinal numbers
const getArabicNumber = (number) => {
  const arabicOrdinals = {
    1: "الأولى",
    2: "الثانية",
    3: "الثالثة",
    4: "الرابعة",
    5: "الخامسة",
    6: "السادسة",
    7: "السابعة",
    8: "الثامنة",
    9: "التاسعة",
    10: "العاشرة",
    11: "الحادية عشر",
    12: "الثانية عشر",
    13: "الثالثة عشر",
    14: "الرابعة عشر",
    15: "الخامسة عشر",
  };
  return arabicOrdinals[number] || number;
};

// Debug function to clear cache and reload translations
const clearCacheAndReloadTranslations = () => {
  // Clear i18n cache from localStorage
  localStorage.removeItem("i18nextLng");

  // Force reload translations
  i18n.reloadResources().then(() => {
    console.log("Translations reloaded");
    console.log("Current language:", i18n.language);
    console.log("Available translations:", i18n.store.data);
  });
};

const StudentCourseDetailModuleList = ({
  modules = [],
  lessons = [],
  accessLevel = "enrolled",
  previewLessons = 0,
  onLessonClick,
  isEnrolled = true,
  courseId = null,
  // NEW: Optional props for enhanced features
  enableRequirements = false,
  showRequirementsProgress = false,
}) => {
  // Force reload translations on mount
  useEffect(() => {
    clearCacheAndReloadTranslations();
  }, []);

  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [completedLessons, setCompletedLessons] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const contentRef = useRef(null);

  // NEW: Enhanced state for requirements (optional)
  const [lessonRequirements, setLessonRequirements] = useState({});
  const [requirementsDialog, setRequirementsDialog] = useState({ open: false });
  const { enabled: requirementsEnabled, loading: requirementsLoading } =
    useLessonRequirements();

  // Load initial completion status
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!currentUser || !lessons.length) return;

      try {
        const lessonIds = lessons.map((lesson) => lesson.id);
        const status = await getLessonCompletionStatus(
          currentUser.uid,
          lessonIds
        );
        setCompletedLessons(status);
      } catch (error) {
        console.error("Error loading lesson completion status:", error);
      }
    };

    loadCompletionStatus();
  }, [currentUser, lessons]);

  // Group lessons by moduleId
  const lessonsByModule = {};
  lessons.forEach((lesson) => {
    if (!lessonsByModule[lesson.moduleId])
      lessonsByModule[lesson.moduleId] = [];
    lessonsByModule[lesson.moduleId].push(lesson);
  });

  // Sort modules by order
  const sortedModules = [...modules].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return orderA - orderB;
  });

  // Sort lessons within each module by order
  Object.keys(lessonsByModule).forEach((moduleId) => {
    lessonsByModule[moduleId].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  });

  // Handle lesson completion toggle
  const handleLessonCompletion = async (lessonId, event) => {
    event.stopPropagation();
    if (!currentUser || isUpdating) return;

    const newStatus = !completedLessons[lessonId];
    setIsUpdating(true);

    try {
      // Check if requirements feature is enabled
      const shouldEnforceRequirements =
        enableRequirements && requirementsEnabled;

      if (!shouldEnforceRequirements) {
        // Use existing logic - no breaking changes
        await updateLessonCompletion(currentUser.uid, lessonId, newStatus);
      } else {
        // Enhanced logic only when explicitly enabled
        await updateLessonCompletionWithRequirements(
          currentUser.uid,
          lessonId,
          newStatus,
          { enforceRequirements: true }
        );
      }

      setCompletedLessons((prev) => ({
        ...prev,
        [lessonId]: newStatus,
      }));
    } catch (error) {
      if (error instanceof CompletionRequirementsError) {
        // Show requirements dialog instead of completing
        setRequirementsDialog({
          open: true,
          lessonId,
          requirements: error.requirements,
        });
        return;
      }
      console.error("Error updating lesson completion:", error);
      // Show error message to user
    } finally {
      setIsUpdating(false);
    }
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
          maxHeight: expanded ? "none" : { xs: `${MAX_HEIGHT}px`, md: "none" },
          overflow: expanded ? "visible" : { xs: "hidden", md: "visible" },
          position: "relative",
          transition: "max-height 0.3s",
        }}
      >
        <Grid container spacing={2}>
          {sortedModules.map((mod) => {
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
                    direction: i18n.language === "en" ? "ltr" : "rtl",
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
                        direction: i18n.language === "en" ? "ltr" : "rtl",
                        textAlign: i18n.language === "en" ? "left" : "right",
                        width: "100%",
                      }}
                    >
                      {i18n.language === "en"
                        ? `${t("studentCourseDetails.moduleList.unit")} ${
                            modules.indexOf(mod) + 1
                          }: ${
                            mod.title.trim().charAt(0).toUpperCase() +
                            mod.title.trim().slice(1).toLowerCase()
                          }`
                        : `${t(
                            "studentCourseDetails.moduleList.unit"
                          )} ${getArabicNumber(
                            modules.indexOf(mod) + 1
                          )}: ${mod.title.trim()}`}
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
                          color={moduleProgress === 100 ? "success" : "primary"}
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
                      direction: i18n.language === "en" ? "ltr" : "rtl",
                    }}
                  >
                    {moduleLessons.map((lesson, index) => {
                      const isCompleted =
                        completedLessons[lesson.id] || lesson.completed;

                      // Calculate absolute lesson index across all modules
                      let absoluteLessonIndex = 0;
                      for (let i = 0; i < modules.indexOf(mod); i++) {
                        absoluteLessonIndex += (
                          lessonsByModule[modules[i].id] || []
                        ).length;
                      }
                      absoluteLessonIndex += index;

                      // Check if lesson is available based on enrollment status using the preview service
                      const isPreviewable =
                        !isEnrolled &&
                        studentCoursePreviewService.isLessonPreviewable(
                          lesson.lessonIndex || absoluteLessonIndex,
                          lesson.moduleIndex || modules.indexOf(mod),
                          lesson.lessonIndexInModule || index
                        );
                      const isLocked = !isEnrolled && !isPreviewable;

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
                            onClick={() => {
                              if (isLocked && onLessonClick) {
                                onLessonClick(lesson, index);
                              } else {
                                handleLessonClick(lesson.id);
                              }
                            }}
                            sx={{
                              pl: { xs: 1, sm: 1.5 },
                              pr: { xs: 1, sm: 1.5 },
                              py: { xs: 1.5, sm: 2 },
                              minHeight: { xs: 48, sm: 56 },
                              display: "flex",
                              alignItems: "center",

                              gap: { xs: 1, sm: 1.5 },
                              cursor: isLocked ? "not-allowed" : "pointer",
                              opacity: isLocked ? 0.6 : 1,
                              "&:hover": {
                                bgcolor: isLocked
                                  ? "transparent"
                                  : theme.palette.action.hover,
                              },
                            }}
                            tabIndex={0}
                          >
                            {/* Left Column - Image */}
                            {lesson.coverImageUrl ? (
                              <Box
                                component="img"
                                src={lesson.coverImageUrl}
                                alt={`${lesson.title} thumbnail`}
                                sx={{
                                  width: { xs: 80, sm: 100 },
                                  height: { xs: 60, sm: 75 },
                                  borderRadius: 1,
                                  objectFit: "cover",
                                  flexShrink: 0,
                                  mr: { xs: 1.5, sm: 2 },
                                  opacity: isLocked ? 0.6 : 1,
                                  transition: "opacity 0.2s",
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: { xs: 80, sm: 100 },
                                  height: { xs: 60, sm: 75 },
                                  borderRadius: 1,
                                  bgcolor: "grey.100",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  mr: { xs: 1.5, sm: 2 },
                                }}
                              >
                                <PlayArrowIcon
                                  sx={{
                                    fontSize: { xs: "2rem", sm: "2.5rem" },
                                    color: theme.palette.primary.main,
                                    opacity: 0.7,
                                  }}
                                />
                              </Box>
                            )}

                            {/* Right Column - Content */}
                            <Box
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gridTemplateRows: "auto auto",
                                alignContent: "center",
                                height: "100%",
                                direction:
                                  i18n.language === "ar" ? "rtl" : "ltr",
                              }}
                            >
                              {/* Title */}
                              <Typography
                                sx={{
                                  fontSize: {
                                    xs: 14,
                                    sm: theme.typography.body1.fontSize,
                                  },
                                  fontWeight: isCompleted ? 400 : 500,
                                  color: isCompleted
                                    ? theme.palette.text.secondary
                                    : theme.palette.text.primary,
                                  textDecoration: isCompleted
                                    ? "line-through"
                                    : "none",
                                  transition:
                                    "color 0.2s, text-decoration 0.2s",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  minWidth: 0,
                                  alignSelf: "start",
                                  lineHeight: 1.2,
                                  mb: { xs: 0.5, sm: 0.75 },
                                  textAlign:
                                    i18n.language === "ar" ? "right" : "left",
                                  direction:
                                    i18n.language === "ar" ? "rtl" : "ltr",
                                  width: "100%",
                                }}
                                title={lesson.title}
                              >
                                {lesson.title}
                              </Typography>

                              {/* Bottom Row - Duration and Chips */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: { xs: 1, sm: 2 },
                                  flexWrap: "wrap",
                                  alignSelf: "start",
                                }}
                              >
                                {/* Duration */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: theme.palette.text.secondary,
                                    flexShrink: 0,
                                  }}
                                >
                                  <AccessTimeIcon
                                    sx={{
                                      fontSize: { xs: "0.9rem", sm: "1rem" },
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: { xs: 11, sm: 12 },
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {lesson.duration || "5"}{" "}
                                    {t(
                                      "studentCourseDetails.moduleList.minutes"
                                    )}
                                  </Typography>
                                </Box>

                                {/* Status Chips */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexShrink: 0,
                                  }}
                                >
                                  {isPreviewable && (
                                    <Chip
                                      label={t(
                                        "studentCourseDetails.moduleList.preview"
                                      )}
                                      size="small"
                                      color="primary"
                                      sx={{
                                        fontSize: "0.6rem",
                                        height: 20,
                                      }}
                                    />
                                  )}
                                  {isLocked && (
                                    <Chip
                                      label={t(
                                        "studentCourseDetails.moduleList.locked"
                                      )}
                                      size="small"
                                      color="default"
                                      sx={{
                                        fontSize: "0.6rem",
                                        height: 20,
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
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

      {/* NEW: Optional requirements dialog */}
      {enableRequirements && (
        <LessonRequirementsDialog
          open={requirementsDialog.open}
          lessonId={requirementsDialog.lessonId}
          requirements={requirementsDialog.requirements}
          onClose={() => setRequirementsDialog({ open: false })}
          onCompleteLesson={handleLessonCompletion}
        />
      )}
    </Box>
  );
};

export default StudentCourseDetailModuleList;
