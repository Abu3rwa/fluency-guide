import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Skeleton,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import { getTasksByLesson } from "../../../../services/student-services/studentTaskService";
import { ROUTES } from "../../../../routes/constants";

// Task type mapping to translation keys
const getTaskTypeTranslation = (taskType, t) => {
  const typeMap = {
    fillInBlanks: t("lessonDetails.fillInBlanks"),
    multipleChoice: t("lessonDetails.multipleChoice"),
    trueFalse: t("lessonDetails.trueFalse"),
    shortAnswer: t("lessonDetails.shortAnswer"),
    matching: t("lessonDetails.matching"),
    ordering: t("lessonDetails.ordering"),
    dragAndDrop: t("lessonDetails.dragAndDrop"),
  };

  return typeMap[taskType] || taskType;
};

// Difficulty mapping to translation keys
const getDifficultyTranslation = (difficulty, t) => {
  const difficultyMap = {
    easy: t("tasks.difficulty.easy"),
    medium: t("tasks.difficulty.medium"),
    hard: t("tasks.difficulty.hard"),
  };

  return difficultyMap[difficulty] || difficulty;
};

const StudentLessonTasksSection = ({ lessonId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await getTasksByLesson(lessonId);
        setTasks(tasksData);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(t("lessonDetails.tasksError"));
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchTasks();
    }
  }, [lessonId, t]);

  const handleTaskClick = (task) => {
    console.log("Task clicked:", task); // Debug log
    console.log("Task type:", task.type); // Debug log
    console.log("Task ID:", task.taskId); // Debug log

    // Route based on task type
    switch (task.type) {
      case "fillInBlanks":
        console.log("Navigating to fill-in-blanks task:", task.id);
        navigate(
          `${ROUTES.STUDENT_FILL_IN_BLANKS_TASK.replace(":taskId", task.id)}`
        );
        break;
      case "multipleChoice":
        console.log("Navigating to multiple choice task:", task.id);
        navigate(
          `${ROUTES.STUDENT_MULTIPLE_CHOICE_TASK.replace(":taskId", task.id)}`
        );
        break;
      case "trueFalse":
        console.log("Navigating to true/false task:", task.id);
        navigate(
          `${ROUTES.STUDENT_TRUE_FALSE_TASK.replace(":taskId", task.id)}`
        );
        break;
      default:
        console.log(
          "Unknown task type, defaulting to fill-in-blanks:",
          task.type
        );
        // Fallback to fill-in-blanks for unknown types
        navigate(
          `${ROUTES.STUDENT_FILL_IN_BLANKS_TASK.replace(
            ":taskId",
            task.taskId
          )}`
        );
        break;
    }
  };

  const getTaskStatusIcon = (task) => {
    if (task.completed) {
      return <CheckCircleIcon color="success" />;
    }
    if (task.inProgress) {
      return <PendingIcon color="warning" />;
    }
    return <AssignmentIcon color="action" />;
  };

  const getTaskStatusText = (task) => {
    if (task.completed) {
      return t("lessonDetails.completed");
    }
    if (task.inProgress) {
      return t("lessonDetails.incomplete");
    }
    return t("lessonDetails.startQuiz");
  };

  if (loading) {
    return (
      <Box>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          {t("lessonDetails.tasks")}
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Box sx={{ mt: 1 }}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2 }}
        >
          {t("lessonDetails.tasks")}
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Box>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2 }}
        >
          {t("lessonDetails.tasks")}
        </Typography>
        <Alert severity="info">{t("lessonDetails.noTasks")}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: { xs: 1.5, sm: 2 },
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
        }}
      >
        {t("lessonDetails.tasks")}
      </Typography>
      <Grid
        container
        spacing={{ xs: 1, sm: 2 }}
        sx={{
          // Ensure proper mobile layout
          width: "100%",
          margin: 0,
        }}
      >
        {tasks.map((task) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={task.taskId}
            sx={{
              // Ensure proper spacing on mobile
              padding: { xs: 0.5, sm: 1 },
            }}
          >
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
                // Mobile-specific improvements
                "@media (max-width: 600px)": {
                  marginBottom: 0,
                  // Ensure proper touch targets
                  "& .MuiButton-root": {
                    minHeight: 44,
                  },
                },
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  p: { xs: 2, sm: 3 },
                  // Ensure content doesn't overflow on mobile
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  {getTaskStatusIcon(task)}
                  <Typography
                    variant="subtitle1"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      // Prevent text overflow on mobile
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.title}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    minHeight: { xs: 30, sm: 40 },
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    // Handle text overflow better on mobile
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {task.instructions || t("lessonDetails.taskType")}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    flexWrap: "wrap",
                    mb: 2,
                    "& .MuiChip-root": {
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      height: { xs: 20, sm: 24 },
                      // Ensure chips don't overflow
                      maxWidth: "100%",
                    },
                  }}
                >
                  <Chip
                    label={getTaskTypeTranslation(task.type, t)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  {task.difficulty && (
                    <Chip
                      label={getDifficultyTranslation(task.difficulty, t)}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {task.timeLimit && (
                    <Chip
                      label={`${task.timeLimit} ${t("lessonDetails.minutes")}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  {getTaskStatusText(task)}
                </Typography>
              </CardContent>

              <CardActions
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  // Ensure button has proper touch target
                  "& .MuiButton-root": {
                    minHeight: { xs: 44, sm: 36 },
                  },
                }}
              >
                <Button
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleTaskClick(task)}
                  sx={{
                    width: "100%",
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    py: { xs: 0.75, sm: 1 },
                    // Ensure proper touch target on mobile
                    minHeight: { xs: 44, sm: 36 },
                  }}
                >
                  {task.completed
                    ? t("lessonDetails.retake")
                    : t("lessonDetails.startQuiz")}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StudentLessonTasksSection;
