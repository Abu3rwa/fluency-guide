import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import CourseHeader from "../components/course/CourseHeader";
import CourseOverview from "../components/course/CourseOverview";
import TaskFormTabs from "../components/tasks/TaskFormTabs";
import TaskDialog from "../components/tasks/TaskDialog";

import {
  updateTask,
  deleteTask,
  createTask,
  getTasksByLesson,
  publishTask,
  archiveTask,
  draftTask,
  getTasksWithEmptyIds,
} from "../services/taskService";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  MenuItem,
  Fab,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Chip,
  Badge,
  Avatar,
  LinearProgress,
  ListItemIcon,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Container,
  ListItemSecondaryAction,
  Skeleton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as ContentCopyIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import courseService from "../services/courseService";
import {
  deleteLesson,
  updateLesson,
  publishLesson,
  archiveLesson,
  draftLesson,
} from "../services/lessonService";
import { useAuth } from "../contexts/AuthContext";
import CourseDialog from "../components/course/CourseDialog";
import CreateLessonForm from "../components/CreateLessonForm";
import ModuleCard from "../components/ModuleCard";
import StudentProgressList from "../components/StudentProgressList";
import ContentValidationDialog from "../components/ContentValidationDialog";
import CoursePreviewDialog from "../components/course/CoursePreviewDialog";
import ShareCourseDialog from "../components/course/ShareCourseDialog";
import CreateModuleForm from "../components/CreateModuleForm";
import LessonList from "../components/lesson/management/LessonList";
import LessonFilter from "../components/lesson/management/LessonFilter";
import CreateLessonDialog from "../components/lesson/management/CreateLessonDialog";
import DeleteLessonDialog from "../components/lesson/management/DeleteLessonDialog";
import LessonActionsMenu from "../components/lesson/management/LessonActionsMenu";
import { courseSchema, moduleSchema, lessonSchema } from "../utils/validation";
import moduleService from "../services/moduleService";
import ModuleSection from "../components/course/ModuleSection";
import LessonSection from "../components/course/LessonSection";
import TasksTable from "../components/tasks/TasksTable";

const CourseDetailsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [modules, setModules] = useState([]);
  const [analytics, setAnalytics] = useState({
    completionRate: 0,
    averageScore: 0,
    activeStudents: 0,
    totalEnrolled: 0,
    averageTimeSpent: 0,
    satisfactionRate: 0,
  });
  const [studentProgress, setStudentProgress] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);

  const fetchCourseAndLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course details
      const courseData = await courseService.getCourseById(id);
      if (!courseData) {
        throw new Error(t("courseDetails.courseNotFound"));
      }
      setCourse(courseData);

      // Fetch modules
      const modulesData = await moduleService.getModulesByCourseId(id);
      setModules(Array.isArray(modulesData) ? modulesData : []);

      // Fetch lessons
      const lessonsData = {};
      for (const module of modulesData || []) {
        const moduleLessons = await moduleService.getLessonsByModule(
          id,
          module.id
        );
        lessonsData[module.id] = Array.isArray(moduleLessons)
          ? moduleLessons
          : [];
      }
      setLessons(lessonsData);

      // Fetch student progress if user is a student
      if (user?.role === "student") {
        const progress = await courseService.getStudentProgress(id, user.uid);
        setStudentProgress(progress);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError(error.message || t("courseDetails.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [id, user, t]);

  useEffect(() => {
    fetchCourseAndLessons();
  }, [fetchCourseAndLessons]);

  useEffect(() => {
    if (modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId]);

  useEffect(() => {
    if (lessons && selectedModuleId && lessons[selectedModuleId]) {
      setModuleLessons(lessons[selectedModuleId]);
    } else {
      setModuleLessons([]);
    }
  }, [lessons, selectedModuleId]);

  useEffect(() => {
    // When moduleLessons change (i.e., module changes), auto-select the first lesson if none is selected or if the selected lesson is not in the new list
    if (moduleLessons.length > 0) {
      if (
        !selectedLesson ||
        !moduleLessons.some((l) => l.id === selectedLesson.id)
      ) {
        setSelectedLesson(moduleLessons[0]);
      }
    } else {
      setSelectedLesson(null);
    }
  }, [moduleLessons, selectedLesson]);

  // Fetch tasks for the course
  useEffect(() => {
    const fetchTasks = async () => {
      if (!id || !selectedLesson?.id) return;

      try {
        setLoadingTasks(true);
        const lessonTasks = await getTasksByLesson(id, selectedLesson.id);
        setTasks(lessonTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError(t("courseDetails.fetchTasksError"));
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [id, selectedLesson?.id, t]);

  const handleDeleteCourse = useCallback(async () => {
    try {
      setSubmitting(true);
      await courseService.deleteCourse(id);
      navigate("/courses");
    } catch (error) {
      setError(t("courseDetails.deleteError"));
    } finally {
      setSubmitting(false);
    }
  }, [id, navigate, t]);

  const handleEditCourse = useCallback(
    async (updatedCourse) => {
      try {
        setSubmitting(true);
        await courseService.updateCourse(id, updatedCourse);
        setCourse(updatedCourse);
        setEditDialogOpen(false);
      } catch (error) {
        setError(t("courseDetails.updateError"));
      } finally {
        setSubmitting(false);
      }
    },
    [id, t]
  );

  const handleAddLesson = useCallback(() => {
    if (modules.length === 0) {
      return;
    }
    setCreateLessonOpen(true);
  }, [modules.length]);

  const handleUpdateLesson = useCallback(
    async (updatedLesson) => {
      try {
        setLoading(true);
        const result = await updateLesson(
          id,
          selectedModuleId,
          selectedLesson.id,
          updatedLesson
        );
        setLessons((lessons) => ({
          ...lessons,
          [selectedModuleId]: lessons[selectedModuleId].map((l) =>
            l.id === selectedLesson.id ? result : l
          ),
        }));
        setCreateLessonOpen(false);
        setSelectedLesson(null);
      } catch (error) {
        console.error("Error updating lesson:", error);
      } finally {
        setLoading(false);
      }
    },
    [id, selectedModuleId, selectedLesson]
  );

  const handleCreateLesson = useCallback(
    async (lessonData) => {
      try {
        const newLesson = await courseService.createLesson({
          ...lessonData,
          courseId: id,
          moduleId: selectedModuleId,
        });
        setLessons((lessons) => ({
          ...lessons,
          [selectedModuleId]: [...(lessons[selectedModuleId] || []), newLesson],
        }));
        setCreateLessonOpen(false);
      } catch (error) {
        setError(t("courseDetails.createLessonError"));
      }
    },
    [id, selectedModuleId, t]
  );

  const handlePublishToggle = useCallback(async () => {
    try {
      setSubmitting(true);
      const updatedCourse = {
        ...course,
        isPublished: !course.isPublished,
      };
      await courseService.updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
    } catch (error) {
      setError(t("courseDetails.publishToggleError"));
    } finally {
      setSubmitting(false);
    }
  }, [course, id, t]);

  const handleExportCourse = useCallback(async () => {
    try {
      setSubmitting(true);
      await courseService.exportCourse(id);
    } catch (error) {
      setError(t("courseDetails.exportError"));
    } finally {
      setSubmitting(false);
    }
  }, [id, t]);

  const handleImportContent = useCallback(
    async (content) => {
      try {
        setSubmitting(true);
        await courseService.importCourseContent(id, content);
        // Refresh course data
        const courseData = await courseService.getCourseById(id);
        setCourse(courseData);
      } catch (error) {
        setError(t("courseDetails.importError"));
      } finally {
        setSubmitting(false);
      }
    },
    [id, t]
  );

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleUpdateModule = useCallback(
    async (moduleData) => {
      try {
        setSubmitting(true);
        await moduleService.updateModule(moduleData.id, moduleData);
        await fetchCourseAndLessons();
        setModuleDialogOpen(false);
      } catch (error) {
        console.error("Error updating module:", error);
        setError(t("courseDetails.updateModuleError"));
      } finally {
        setSubmitting(false);
      }
    },
    [fetchCourseAndLessons, t]
  );

  const handleDeleteModule = useCallback(
    async (moduleId) => {
      if (window.confirm(t("courseDetails.confirmDeleteModule"))) {
        try {
          setSubmitting(true);
          await moduleService.deleteModule(moduleId);
          await fetchCourseAndLessons();
        } catch (error) {
          console.error("Error deleting module:", error);
          setError(t("courseDetails.deleteModuleError"));
        } finally {
          setSubmitting(false);
        }
      }
    },
    [fetchCourseAndLessons, t]
  );

  const handleCreateModule = useCallback(
    async (moduleData) => {
      try {
        setSubmitting(true);
        await moduleService.createModule(id, moduleData);
        await fetchCourseAndLessons();
        setCreateModuleOpen(false);
      } catch (error) {
        console.error("Error creating module:", error);
        setError(t("courseDetails.createModuleError"));
      } finally {
        setSubmitting(false);
      }
    },
    [id, fetchCourseAndLessons, t]
  );

  const handleCreateTask = useCallback(
    async (taskData) => {
      try {
        if (!selectedLesson) {
          setError(t("courseDetails.selectLessonFirst"));
          return;
        }
        const newTask = await createTask(id, selectedLesson.id, taskData);
        setTasks([...tasks, newTask]);
        setTaskDialogOpen(false);
      } catch (error) {
        setError(error.message || t("courseDetails.createTaskError"));
      }
    },
    [id, selectedLesson, tasks, t]
  );

  const handleTaskDialogOpen = useCallback((lesson) => {
    setSelectedLesson(lesson);
    setTaskDialogOpen(true);
  }, []);

  const handleUpdateTask = useCallback(
    async (taskData) => {
      try {
        if (!selectedLesson || !selectedTask) {
          setError(t("courseDetails.selectTaskFirst"));
          return;
        }
        const updatedTask = await updateTask(
          id,
          selectedLesson.id,
          selectedTask.id,
          taskData
        );
        setTasks(
          tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
        setTaskDialogOpen(false);
      } catch (error) {
        setError(error.message || t("courseDetails.updateTaskError"));
      }
    },
    [id, selectedLesson, selectedTask, tasks, t]
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      try {
        await deleteTask(id, selectedLesson.id, taskId);
        setTasks(tasks.filter((task) => task.id !== taskId));
      } catch (error) {
        // no-op
      }
    },
    [id, selectedLesson, tasks]
  );

  const handleTaskStatusChange = useCallback(
    async (taskId, newStatus) => {
      try {
        setSubmitting(true);

        // Validate taskId
        if (!taskId || taskId.trim() === "") {
          throw new Error("Invalid task ID - task ID is empty or missing");
        }

        console.log("Changing task status:", {
          taskId,
          newStatus,
          courseId: id,
          lessonId: selectedLesson?.id,
        });

        let result;

        switch (newStatus) {
          case "published":
            result = await publishTask(id, selectedLesson.id, taskId);
            break;
          case "archived":
            result = await archiveTask(id, selectedLesson.id, taskId);
            break;
          case "draft":
            result = await draftTask(id, selectedLesson.id, taskId);
            break;
          default:
            throw new Error("Invalid status");
        }

        console.log("Task status change result:", result);

        // Update the task in the state
        setTasks((tasks) =>
          tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );

        console.log(`Task ${taskId} status changed to ${newStatus}`);
      } catch (error) {
        console.error("Error changing task status:", error);
        setError(
          t("courseDetails.taskStatusChangeError") ||
            "Failed to change task status"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [id, selectedLesson, t]
  );

  // Temporary debug function to identify tasks with empty IDs
  const debugTasksWithEmptyIds = useCallback(async () => {
    try {
      const tasksWithEmptyIds = await getTasksWithEmptyIds();
      console.log("Tasks with empty IDs:", tasksWithEmptyIds);
      if (tasksWithEmptyIds.length > 0) {
        console.warn(
          `Found ${tasksWithEmptyIds.length} tasks with empty IDs. These need to be fixed manually.`
        );
      }
    } catch (error) {
      console.error("Error checking for tasks with empty IDs:", error);
    }
  }, []);

  const toggleModuleExpand = useCallback((moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  }, []);

  const handleDeleteLesson = useCallback(
    async (lessonId) => {
      try {
        setSubmitting(true);
        await deleteLesson(id, selectedModuleId, lessonId);
        setLessons((lessons) => ({
          ...lessons,
          [selectedModuleId]: lessons[selectedModuleId].filter(
            (l) => l.id !== lessonId
          ),
        }));
      } catch (error) {
        setError(t("courseDetails.deleteLessonError"));
      } finally {
        setSubmitting(false);
      }
    },
    [id, selectedModuleId, t]
  );

  const handleLessonStatusChange = useCallback(
    async (lessonId, newStatus) => {
      try {
        setSubmitting(true);
        let result;

        switch (newStatus) {
          case "published":
            result = await publishLesson(lessonId);
            break;
          case "archived":
            result = await archiveLesson(lessonId);
            break;
          case "draft":
            result = await draftLesson(lessonId);
            break;
          default:
            throw new Error("Invalid status");
        }

        // Update the lesson in the state
        setLessons((lessons) => ({
          ...lessons,
          [selectedModuleId]: lessons[selectedModuleId].map((l) =>
            l.id === lessonId ? { ...l, status: newStatus } : l
          ),
        }));

        console.log(`Lesson ${lessonId} status changed to ${newStatus}`);
      } catch (error) {
        console.error("Error changing lesson status:", error);
        setError(
          t("courseDetails.statusChangeError") || "Failed to change status"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [selectedModuleId, t]
  );

  const filteredLessons = moduleLessons.filter((lesson) => {
    const matchesSearch = lesson.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || lesson.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    switch (selectedSort) {
      case "newest":
        return b.createdAt - a.createdAt;
      case "oldest":
        return a.createdAt - b.createdAt;
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box p={3}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/courses")}
            sx={{ mt: 2 }}
          >
            {t("courseDetails.backToCourses")}
          </Button>
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box p={3}>
          <Alert severity="warning">{t("courseDetails.courseNotFound")}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/courses")}
            sx={{ mt: 2 }}
          >
            {t("courseDetails.backToCourses")}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: { xs: 2, md: 4 },
        mb: { xs: 2, md: 4 },
        px: { xs: 2, md: 3 },
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        py: { xs: theme.spacing(2), md: theme.spacing(3) },
      }}
    >
      {/* Course Header */}
      <CourseHeader
        course={course}
        onBack={() => navigate("/courses")}
        onPublishToggle={handlePublishToggle}
        onEdit={() => setEditDialogOpen(true)}
        onImport={() => setImportDialogOpen(true)}
        onExport={handleExportCourse}
        onPreview={() => setPreviewDialogOpen(true)}
        onShare={() => setShareDialogOpen(true)}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      {/* Temporary Debug Button - Remove after fixing empty ID tasks */}
      {process.env.NODE_ENV === "development" && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            size="small"
            color="warning"
            onClick={debugTasksWithEmptyIds}
            sx={{ fontSize: "0.75rem" }}
          >
            Debug: Check Empty ID Tasks
          </Button>
        </Box>
      )}
      {/* Course Info and Analytics */}
      <Grid container spacing={{ xs: 2, md: 3 }} mb={{ xs: 2, md: 4 }}>
        {/* Course Overview */}
        <Grid item xs={12} md={8}>
          <CourseOverview course={course} />
        </Grid>
      </Grid>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        sx={{
          mb: { xs: 2, md: 3 },
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          "& .MuiTab-root": {
            color: theme.palette.text.secondary,
            fontSize: { xs: "0.875rem", md: "1rem" },
            minWidth: { xs: "auto", md: 120 },
            "&.Mui-selected": {
              color: theme.palette.primary.main,
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: theme.palette.primary.main,
          },
        }}
        aria-label="Tabs"
      >
        <Tab label={t("courseDetails.overview")} />
        <Tab label={t("courseDetails.modules")} />
        <Tab label={t("courseDetails.lessons")} />
        <Tab label={t("courseDetails.analytics")} />
      </Tabs>
      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Card
            sx={{
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              borderRadius: theme.shape.borderRadius * 2,
            }}
          >
            <CardContent
              sx={{ p: { xs: theme.spacing(2), md: theme.spacing(3) } }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h5">
                  {t("courseDetails.modules")}
                </Typography>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModuleOpen(true)}
                    sx={{
                      mr: 1,
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    aria-label={t("courseDetails.createNewModule")}
                  >
                    {t("courseDetails.createNewModule")}
                  </Button>
                </Box>
              </Box>
              {modules.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: theme.spacing(4),
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t("courseDetails.noModulesYet")}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModuleOpen(true)}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      "&:hover": {
                        borderColor: theme.palette.primary.dark,
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {t("courseDetails.createFirstModule")}
                  </Button>
                </Box>
              ) : (
                <Box>
                  {modules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      onDelete={handleDeleteModule}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
        {/* Modules Tab */}
        {activeTab === 1 && (
          <ModuleSection
            modules={modules}
            onDelete={handleDeleteModule}
            onCreate={() => setCreateModuleOpen(true)}
            onUpdateModule={handleUpdateModule}
          />
        )}
        {/* Lessons Tab */}
        {activeTab === 2 && (
          <>
            {/* Module Filter Dropdown */}
            <Box
              mb={2}
              display="flex"
              alignItems="center"
              gap={2}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: theme.palette.text.primary }}
              >
                {t("courseDetails.modules")}
              </Typography>
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 200 },
                  width: { xs: "100%", sm: "auto" },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.paper,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.primary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <InputLabel id="module-filter-label">
                  {t("courseDetails.selectModule")}
                </InputLabel>
                <Select
                  labelId="module-filter-label"
                  value={
                    selectedModuleId || (modules[0] && modules[0].id) || ""
                  }
                  label={t("courseDetails.selectModule")}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                >
                  {modules.map((module) => (
                    <MenuItem key={module.id} value={module.id}>
                      {module.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <LessonSection
              lessons={sortedLessons}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterAnchorEl={filterAnchorEl}
              setFilterAnchorEl={setFilterAnchorEl}
              sortAnchorEl={sortAnchorEl}
              setSortAnchorEl={setSortAnchorEl}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              menuAnchorEl={menuAnchorEl}
              setMenuAnchorEl={setMenuAnchorEl}
              selectedLesson={selectedLesson}
              onDeleteLesson={handleDeleteLesson}
              onUpdateLesson={handleUpdateLesson}
              onStatusChange={handleLessonStatusChange}
              onCreate={() => setCreateLessonOpen(true)}
              courseId={id}
              moduleId={selectedModuleId}
            />
            {/* Show tasks for the selected lesson */}
            {selectedModuleId && moduleLessons.length > 0 && (
              <Box mt={4}>
                {/* Lesson Filter Dropdown */}
                <Box
                  mb={2}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {t("courseDetails.lessons")}
                  </Typography>
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: { xs: "100%", sm: 200 },
                      width: { xs: "100%", sm: "auto" },
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: theme.palette.background.paper,
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    <InputLabel id="lesson-filter-label">
                      {t("courseDetails.selectLesson")}
                    </InputLabel>
                    <Select
                      labelId="lesson-filter-label"
                      value={selectedLesson?.id || moduleLessons[0]?.id || ""}
                      label={t("courseDetails.selectLesson")}
                      onChange={(e) => {
                        const lesson = moduleLessons.find(
                          (l) => l.id === e.target.value
                        );
                        setSelectedLesson(lesson);
                      }}
                    >
                      {moduleLessons.map((lesson) => (
                        <MenuItem key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                {selectedLesson && (
                  <>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                      flexDirection={{ xs: "column", sm: "row" }}
                      gap={{ xs: 2, sm: 0 }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        {t("courseDetails.tasksForLesson", {
                          count: tasks.length,
                        })}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedTask(null);
                          setTaskDialogOpen(true);
                        }}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          width: { xs: "100%", sm: "auto" },
                          "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        {t("courseDetails.createTask")}
                      </Button>
                    </Box>
                    {loadingTasks ? (
                      <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress
                          sx={{ color: theme.palette.primary.main }}
                        />
                      </Box>
                    ) : (
                      <TasksTable
                        tasks={tasks}
                        onEditTask={(task) => {
                          setSelectedTask(task);
                          setTaskDialogOpen(true);
                        }}
                        onDeleteTask={async (taskId) => {
                          await handleDeleteTask(taskId);
                        }}
                        onStatusChange={handleTaskStatusChange}
                      />
                    )}
                  </>
                )}
              </Box>
            )}
          </>
        )}
        {/* Analytics Tab */}
        {activeTab === 3 && (
          <Card
            sx={{
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              borderRadius: theme.shape.borderRadius * 2,
            }}
          >
            <CardContent
              sx={{ p: { xs: theme.spacing(2), md: theme.spacing(3) } }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: theme.palette.text.primary }}
              >
                {t("courseDetails.progress")}
              </Typography>
              <StudentProgressList students={studentProgress} />
            </CardContent>
          </Card>
        )}
      </Box>
      {/* Dialogs */}
      <CourseDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditCourse}
        course={course}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-course-dialog-title"
        aria-describedby="delete-course-dialog-description"
      >
        <DialogTitle id="delete-course-dialog-title">
          {t("courseDetails.deleteLesson")}
        </DialogTitle>
        <DialogContent id="delete-course-dialog-description">
          <Typography>{t("courseDetails.deleteLessonConfirmation")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => {
              handleDeleteCourse();
              setDeleteDialogOpen(false);
            }}
            color="error"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t("common.delete")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ContentValidationDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        validationResults={validationResults}
      />
      <CoursePreviewDialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        course={course}
      />
      <ShareCourseDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        course={course}
      />
      <CreateLessonForm
        open={createLessonOpen}
        onClose={() => setCreateLessonOpen(false)}
        onSubmit={handleCreateLesson}
        courseId={id}
        moduleId={selectedModuleId}
      />
      <CreateModuleForm
        open={createModuleOpen}
        onClose={() => setCreateModuleOpen(false)}
        onSubmit={handleCreateModule}
        courseId={id}
      />
      <Dialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setSelectedTask(null);
          setSelectedLesson(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="task-dialog-title"
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: isMobile ? 0 : theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[8],
            m: { xs: 0, md: 2 },
            height: { xs: "100%", md: "auto" },
          },
        }}
      >
        <DialogTitle id="task-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">
              {selectedTask
                ? t("courseDetails.editTask")
                : t("courseDetails.createTask")}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TaskFormTabs courseId={id} lessonId={selectedLesson?.id} />
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
          }}
        >
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      )}
    </Container>
  );
};

export default CourseDetailsScreen;
