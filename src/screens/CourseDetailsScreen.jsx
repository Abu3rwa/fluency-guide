import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Snackbar,
  Container,
  ListItemSecondaryAction,
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
import { deleteLesson, updateLesson } from "../services/lessonService";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import moduleService from "../services/moduleService";
import CourseDialog from "../components/CourseDialog";
import CreateLessonForm from "../components/CreateLessonForm";
import AnalyticsCard from "../components/AnalyticsCard";
import ModuleCard from "../components/ModuleCard";
import StudentProgressList from "../components/StudentProgressList";
import ContentValidationDialog from "../components/ContentValidationDialog";
import CoursePreviewDialog from "../components/CoursePreviewDialog";
import ShareCourseDialog from "../components/ShareCourseDialog";
import CreateModuleForm from "../components/CreateModuleForm";
import LessonCard from "../components/LessonCard";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasksByLesson,
} from "../services/taskService";
import TaskForm from "../components/tasks/TaskForm";

const CourseDetailsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
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
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonEditDialogOpen, setLessonEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching course data for ID:", id);

      // Fetch course details
      const courseData = await courseService.getCourseById(id);
      console.log("Course data fetched:", courseData);

      if (!courseData) {
        throw new Error("Course not found");
      }

      setCourse(courseData);

      // Fetch modules
      console.log("Fetching modules for course:", id);
      const modulesData = await moduleService.getModulesByCourseId(id);
      console.log("Modules fetched:", modulesData);
      setModules(modulesData);

      // Fetch lessons
      console.log("Fetching lessons for modules");
      const lessonsData = {};
      for (const module of modulesData) {
        console.log("Fetching lessons for module:", module.id);
        const moduleLessons = await moduleService.getLessonsByModule(
          id,
          module.id
        );
        console.log("Lessons fetched for module:", module.id, moduleLessons);
        lessonsData[module.id] = moduleLessons;
      }
      setLessons(lessonsData);

      // Fetch student progress if user is a student
      if (user?.role === "student") {
        console.log("Fetching student progress for user:", user.uid);
        const progress = await courseService.getStudentProgress(id, user.uid);
        console.log("Student progress fetched:", progress);
        setStudentProgress(progress);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError(error.message || t("courses.errors.fetchFailed"));
      showNotification(
        error.message || t("courses.errors.fetchFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndLessons();
  }, [id, user]);

  useEffect(() => {
    if (modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules]);

  const selectedModule = modules.find((m) => m.id === selectedModuleId);
  const moduleLessons = lessons[selectedModuleId] || [];

  const handleModuleChange = (event) => {
    setSelectedModuleId(event.target.value);
  };

  const handleDeleteCourse = async () => {
    try {
      await courseService.deleteCourse(id);
      navigate("/courses");
    } catch (error) {
      setError(t("courses.errors.deleteFailed"));
    }
  };

  const handleEditCourse = async (updatedCourse) => {
    try {
      await courseService.updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
      setEditDialogOpen(false);
    } catch (error) {
      setError(t("courses.errors.updateFailed"));
    }
  };

  const handleAddLesson = () => {
    if (modules.length === 0) {
      showNotification(t("lessons.errors.noModules"), "error");
      return;
    }
    setLessonDialogOpen(true);
  };

  const handleEditLesson = (lessonId) => {
    const lesson = lessons[selectedModuleId].find((l) => l.id === lessonId);
    setSelectedLesson(lesson);
    setLessonEditDialogOpen(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      setLoading(true);
      await deleteLesson(id, selectedModuleId, lessonId);
      setLessons((lessons) => ({
        ...lessons,
        [selectedModuleId]: lessons[selectedModuleId].filter(
          (l) => l.id !== lessonId
        ),
      }));
      showNotification(t("courses.lessons.deleteSuccess"));
    } catch (error) {
      console.error("Error deleting lesson:", error);
      showNotification(t("courses.lessons.deleteFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (updatedLesson) => {
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
      setLessonEditDialogOpen(false);
      setSelectedLesson(null);
      showNotification(t("courses.lessons.updateSuccess"));
    } catch (error) {
      console.error("Error updating lesson:", error);
      showNotification(t("courses.lessons.updateFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (lessonData) => {
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
      setLessonDialogOpen(false);
      showNotification(t("courses.lessons.createSuccess"));
    } catch (error) {
      setError(t("courses.lessons.createFailed"));
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setModules(items);
    try {
      await courseService.updateModuleOrder(
        id,
        items.map((item) => item.id)
      );
    } catch (error) {
      setError(t("courses.errors.updateModuleOrderFailed"));
    }
  };

  const handlePublishToggle = async () => {
    try {
      const updatedCourse = {
        ...course,
        isPublished: !course.isPublished,
      };
      await courseService.updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
    } catch (error) {
      setError(t("courses.errors.publishToggleFailed"));
    }
  };

  const handleAccessLevelChange = async (event) => {
    try {
      const updatedCourse = {
        ...course,
        accessLevel: event.target.value,
      };
      await courseService.updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
    } catch (error) {
      setError(t("courses.errors.accessLevelUpdateFailed"));
    }
  };

  const handleValidateContent = async () => {
    try {
      const results = await courseService.validateCourseContent(id);
      setValidationResults(results);
      setValidationDialogOpen(true);
    } catch (error) {
      setError(t("courses.errors.validationFailed"));
    }
  };

  const handleExportCourse = async () => {
    try {
      await courseService.exportCourse(id);
    } catch (error) {
      setError(t("courses.errors.exportFailed"));
    }
  };

  const handleImportContent = async (content) => {
    try {
      await courseService.importCourseContent(id, content);
      // Refresh course data
      const courseData = await courseService.getCourseById(id);
      setCourse(courseData);
    } catch (error) {
      setError(t("courses.errors.importFailed"));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditModule = async (moduleId, updatedData) => {
    try {
      await moduleService.updateModule(id, moduleId, updatedData);
      await fetchCourseAndLessons();
    } catch (error) {
      console.error("Error updating module:", error);
      setError(t("courses.modules.updateError"));
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm(t("courses.modules.deleteConfirm"))) {
      try {
        await moduleService.deleteModule(moduleId);
        await fetchCourseAndLessons();
      } catch (error) {
        console.error("Error deleting module:", error);
        setError(t("courses.modules.deleteError"));
      }
    }
  };

  const handleCreateModule = async (moduleData) => {
    try {
      await moduleService.createModule(id, moduleData);
      await fetchCourseAndLessons();
      setCreateModuleOpen(false);
    } catch (error) {
      console.error("Error creating module:", error);
      setError(t("courses.modules.createError"));
    }
  };

  const handleCreateDummyModules = async () => {
    try {
      const newModules = await moduleService.createDummyModules(id);
      setModules([...modules, ...newModules]);
    } catch (error) {
      setError(t("courses.errors.addModuleFailed"));
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      if (!selectedLesson) {
        showNotification(t("tasks.errors.selectLessonFirst"), "error");
        return;
      }
      const newTask = await createTask(id, selectedLesson.id, taskData);
      setTasks([...tasks, newTask]);
      showNotification(t("tasks.createSuccess"));
      setTaskDialogOpen(false);
    } catch (error) {
      showNotification(error.message || t("tasks.createError"), "error");
    }
  };

  const handleTaskDialogOpen = (lesson) => {
    setSelectedLesson(lesson);
    setTaskDialogOpen(true);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      if (!selectedLesson || !selectedTask) {
        showNotification(t("tasks.errors.selectTask"), "error");
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
      showNotification(t("tasks.updateSuccess"));
      setTaskDialogOpen(false);
    } catch (error) {
      showNotification(error.message || t("tasks.updateError"), "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(id, selectedLesson.id, taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
      showNotification(t("tasks.deleteSuccess"));
    } catch (error) {
      showNotification(error.message || t("tasks.deleteError"), "error");
    }
  };

  const handleModuleDialogOpen = (module = null) => {
    if (module) {
      setSelectedModuleId(module.id);
    } else {
      setSelectedModuleId(null);
    }
    setModuleDialogOpen(true);
  };

  const handleModuleDialogClose = () => {
    setModuleDialogOpen(false);
    setSelectedModuleId(null);
  };

  const handleModuleSubmit = async () => {
    try {
      if (selectedModuleId) {
        await handleEditModule(selectedModuleId, {
          title: selectedModule.title,
          description: selectedModule.description,
          order: selectedModule.order,
        });
        showNotification(t("courses.modules.updateSuccess"), "success");
      } else {
        await handleCreateModule({
          title: selectedModule.title,
          description: selectedModule.description,
          order: selectedModule.order,
        });
        showNotification(t("courses.modules.createSuccess"), "success");
      }
      handleModuleDialogClose();
      fetchCourseAndLessons();
    } catch (error) {
      console.error("Error saving module:", error);
      showNotification(t("courses.modules.updateError"), "error");
    }
  };

  const handleLessonDialogOpen = (moduleId, lesson = null) => {
    if (lesson) {
      setSelectedLesson(lesson);
    } else {
      setSelectedLesson(null);
    }
    setLessonDialogOpen(true);
  };

  const handleLessonDialogClose = () => {
    setLessonDialogOpen(false);
    setSelectedLesson(null);
  };

  const handleLessonSubmit = async () => {
    try {
      if (selectedLesson) {
        await handleUpdateLesson(selectedLesson);
        showNotification(t("courses.lessons.updateSuccess"), "success");
      } else {
        await handleCreateLesson({
          title: selectedModule.title,
          description: selectedModule.description,
          content: "",
          type: "video",
          duration: 0,
          order: (lessons[selectedModuleId]?.length || 0) + 1,
        });
        showNotification(t("courses.lessons.createSuccess"), "success");
      }
      handleLessonDialogClose();
      fetchCourseAndLessons();
    } catch (error) {
      console.error("Error saving lesson:", error);
      showNotification(t("courses.lessons.updateError"), "error");
    }
  };

  const toggleModuleExpand = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/courses")}
          sx={{ mt: 2 }}
        >
          {t("common.backToCourses")}
        </Button>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box p={3}>
        <Alert severity="warning">{t("courses.errors.notFound")}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/courses")}
          sx={{ mt: 2 }}
        >
          {t("common.backToCourses")}
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Top Action Bar */}
      <Box
        sx={{
          mb: 4,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate("/courses")} size="large">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">{course.title}</Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={
              course.isPublished ? <VisibilityIcon /> : <VisibilityOffIcon />
            }
            onClick={handlePublishToggle}
          >
            {course.isPublished
              ? t("courses.details.actions.unpublish")
              : t("courses.details.actions.publish")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            {t("courses.details.actions.edit")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            {t("courses.details.actions.import")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportCourse}
          >
            {t("courses.details.actions.export")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewDialogOpen(true)}
          >
            {t("courses.details.actions.preview")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => setShareDialogOpen(true)}
          >
            {t("courses.details.actions.share")}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            {t("courses.details.actions.delete")}
          </Button>
        </Box>
      </Box>

      {/* Course Info and Analytics */}
      <Grid container spacing={3} mb={4}>
        {/* Course Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("courses.details.overview")}
              </Typography>
              <Typography variant="body1" paragraph>
                {course.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="primary" />
                    <Typography variant="body2">
                      {t("courses.details.instructor")}: {course.instructor}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="body2">
                      {t("courses.details.duration")}: {course.duration}{" "}
                      {t("courses.hours")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LanguageIcon color="primary" />
                    <Typography variant="body2">
                      {t("courses.details.language")}:{" "}
                      {t(`courses.language.${course.language}`)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CategoryIcon color="primary" />
                    <Typography variant="body2">
                      {t("courses.details.category")}:{" "}
                      {t(`courses.categories.${course.category}`)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("courses.analytics.title")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <AnalyticsCard
                    title="completionRate"
                    value={`${analytics.completionRate}%`}
                    icon={<TimelineIcon color="primary" />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <AnalyticsCard
                    title="activeStudents"
                    value={analytics.activeStudents}
                    icon={<PeopleIcon color="primary" />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <AnalyticsCard
                    title="totalEnrolled"
                    value={analytics.totalEnrolled}
                    icon={<GroupIcon color="primary" />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <AnalyticsCard
                    title="satisfactionRate"
                    value={`${analytics.satisfactionRate}%`}
                    icon={<EmojiEventsIcon color="primary" />}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={t("courses.tabs.overview")} />
        <Tab label={t("courses.tabs.modules")} />
        <Tab label={t("courses.tabs.lessons")} />
        <Tab label={t("courses.tabs.analytics")} />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h5">
                  {t("courses.modules.title")}
                </Typography>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModuleOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    {t("courses.modules.createModule")}
                  </Button>
                </Box>
              </Box>
              {modules.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t("courses.modules.noModules")}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModuleOpen(true)}
                  >
                    {t("courses.modules.createFirstModule")}
                  </Button>
                </Box>
              ) : (
                <Box>
                  {modules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      onEdit={handleEditModule}
                      onDelete={handleDeleteModule}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 1 && (
          <Box>
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onEdit={handleEditModule}
                onDelete={handleDeleteModule}
              />
            ))}
            <Fab
              color="primary"
              onClick={() => setModuleDialogOpen(true)}
              sx={{ position: "fixed", bottom: 16, right: 16 }}
            >
              <AddIcon />
            </Fab>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>{t("courses.lessons.filterByModule")}</InputLabel>
                  <Select
                    value={selectedModuleId || ""}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    label={t("courses.lessons.filterByModule")}
                  >
                    <MenuItem value="">
                      {t("courses.lessons.allModules")}
                    </MenuItem>
                    {modules.map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedLesson(null);
                    setLessonDialogOpen(true);
                  }}
                >
                  {t("courses.lessons.createLesson")}
                </Button>
              </Box>
            </Box>

            {moduleLessons.length > 0 ? (
              moduleLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={handleEditLesson}
                  onDelete={handleDeleteLesson}
                  onCreateTask={() => handleTaskDialogOpen(lesson)}
                />
              ))
            ) : (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  {t("courses.lessons.noLessons")}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddLesson}
                  sx={{ mt: 2 }}
                >
                  {t("courses.lessons.createFirstLesson")}
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {t("courses.progress.title")}
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
      >
        <DialogTitle>{t("courses.lessons.deleteConfirm.title")}</DialogTitle>
        <DialogContent>
          <Typography>{t("courses.lessons.deleteConfirm.message")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("courses.lessons.deleteConfirm.cancel")}
          </Button>
          <Button
            onClick={() => {
              handleDeleteCourse();
              setDeleteDialogOpen(false);
            }}
            color="error"
          >
            {t("courses.lessons.deleteConfirm.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={lessonEditDialogOpen}
        onClose={() => {
          setLessonEditDialogOpen(false);
          setSelectedLesson(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon color="primary" />
            <Typography variant="h6">
              {t("courses.lessons.editLesson")}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <CreateLessonForm
            open={lessonEditDialogOpen}
            initialData={selectedLesson}
            onSubmit={handleUpdateLesson}
            onCancel={() => {
              setLessonEditDialogOpen(false);
              setSelectedLesson(null);
            }}
            courseId={id}
            moduleId={selectedModuleId}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon color="primary" />
            <Typography variant="h6">
              {t("courses.lessons.createLesson")}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <CreateLessonForm
            open={lessonDialogOpen}
            onSubmit={handleLessonSubmit}
            onCancel={() => setLessonDialogOpen(false)}
            courseId={id}
            moduleId={selectedModuleId}
          />
        </DialogContent>
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
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">
              {selectedTask ? t("tasks.editTask") : t("tasks.createTask")}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TaskForm
            onClose={() => {
              setTaskDialogOpen(false);
              setSelectedTask(null);
              setSelectedLesson(null);
            }}
            onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
            task={selectedTask}
            lessonId={selectedLesson?.id}
          />
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>

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
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default CourseDetailsScreen;
