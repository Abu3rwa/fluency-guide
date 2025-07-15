import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
// All text is now hardcoded in English; i18n removed.
import CourseHeader from "../components/course/CourseHeader";
import CourseOverview from "../components/course/CourseOverview";
import CourseAnalytics from "../components/course/CourseAnalytics";
import TaskFormTabs from "../components/tasks/TaskFormTabs";
import TaskDialog from "../components/tasks/TaskDialog";

import { updateTask, deleteTask, createTask } from "../services/taskService";
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
import { deleteLesson, updateLesson } from "../services/lessonService";
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
  // All text is now hardcoded in English; i18n removed.
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
        throw new Error("Course not found");
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
      setError(error.message || "Failed to fetch course data");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

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

  const handleDeleteCourse = useCallback(async () => {
    try {
      setSubmitting(true);
      await courseService.deleteCourse(id);
      navigate("/courses");
    } catch (error) {
      setError("Failed to delete course");
    } finally {
      setSubmitting(false);
    }
  }, [id, navigate]);

  const handleEditCourse = useCallback(
    async (updatedCourse) => {
      try {
        setSubmitting(true);
        await courseService.updateCourse(id, updatedCourse);
        setCourse(updatedCourse);
        setEditDialogOpen(false);
      } catch (error) {
        setError("Failed to update course");
      } finally {
        setSubmitting(false);
      }
    },
    [id]
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
        setError("Failed to create lesson");
      }
    },
    [id, selectedModuleId]
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
      setError("Failed to update course status");
    } finally {
      setSubmitting(false);
    }
  }, [course, id]);

  const handleExportCourse = useCallback(async () => {
    try {
      setSubmitting(true);
      await courseService.exportCourse(id);
    } catch (error) {
      setError("Failed to export course data");
    } finally {
      setSubmitting(false);
    }
  }, [id]);

  const handleImportContent = useCallback(
    async (content) => {
      try {
        setSubmitting(true);
        await courseService.importCourseContent(id, content);
        // Refresh course data
        const courseData = await courseService.getCourseById(id);
        setCourse(courseData);
      } catch (error) {
        setError("Failed to import course data");
      } finally {
        setSubmitting(false);
      }
    },
    [id]
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
        setError("Failed to update module");
      } finally {
        setSubmitting(false);
      }
    },
    [fetchCourseAndLessons]
  );

  const handleDeleteModule = useCallback(
    async (moduleId) => {
      if (window.confirm("Are you sure you want to delete this module?")) {
        try {
          setSubmitting(true);
          await moduleService.deleteModule(moduleId);
          await fetchCourseAndLessons();
        } catch (error) {
          console.error("Error deleting module:", error);
          setError("Failed to delete module");
        } finally {
          setSubmitting(false);
        }
      }
    },
    [fetchCourseAndLessons]
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
        setError("Failed to create module");
      } finally {
        setSubmitting(false);
      }
    },
    [id, fetchCourseAndLessons]
  );

  const handleCreateTask = useCallback(
    async (taskData) => {
      try {
        if (!selectedLesson) {
          setError("Please select a lesson first");
          return;
        }
        const newTask = await createTask(id, selectedLesson.id, taskData);
        setTasks([...tasks, newTask]);
        setTaskDialogOpen(false);
      } catch (error) {
        setError(error.message || "Failed to create task");
      }
    },
    [id, selectedLesson, tasks]
  );

  const handleTaskDialogOpen = useCallback((lesson) => {
    setSelectedLesson(lesson);
    setTaskDialogOpen(true);
  }, []);

  const handleUpdateTask = useCallback(
    async (taskData) => {
      try {
        if (!selectedLesson || !selectedTask) {
          setError("Please select a task");
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
        setError(error.message || "Failed to update task");
      }
    },
    [id, selectedLesson, selectedTask, tasks]
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
        setError("Failed to delete lesson. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [id, selectedModuleId]
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
          <CircularProgress />
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
            Back to Courses
          </Button>
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box p={3}>
          <Alert severity="warning">Course not found</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/courses")}
            sx={{ mt: 2 }}
          >
            Back to Courses
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
      {/* Course Info and Analytics */}
      <Grid container spacing={3} mb={4}>
        {/* Course Overview */}
        <Grid item xs={12} md={8}>
          <CourseOverview course={course} />
        </Grid>

        {/* Analytics Summary */}
        <Grid item xs={12} md={4}>
          <CourseAnalytics analytics={analytics} />
        </Grid>
      </Grid>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        aria-label="Tabs"
      >
        <Tab label="Overview" />
        <Tab label="Modules" />
        <Tab label="Lessons" />
        <Tab label="Analytics" />
      </Tabs>
      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {/* Overview Tab */}
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
                <Typography variant="h5">Modules</Typography>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModuleOpen(true)}
                    sx={{ mr: 1 }}
                    aria-label="Create New Module"
                  >
                    Create New Module
                  </Button>
                </Box>
              </Box>
              {modules.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No modules yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModuleOpen(true)}
                  >
                    Create First Module
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
            <Box mb={2} display="flex" alignItems="center" gap={2}>
              <Typography variant="subtitle1">Modules</Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="module-filter-label">Select Module</InputLabel>
                <Select
                  labelId="module-filter-label"
                  value={
                    selectedModuleId || (modules[0] && modules[0].id) || ""
                  }
                  label="Select Module"
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
              onCreate={() => setCreateLessonOpen(true)}
              courseId={id}
              moduleId={selectedModuleId}
            />
            {/* Show tasks for the selected lesson */}
            {selectedModuleId && moduleLessons.length > 0 && (
              <Box mt={4}>
                {/* Lesson Filter Dropdown */}
                <Box mb={2} display="flex" alignItems="center" gap={2}>
                  <Typography variant="subtitle1">Lessons</Typography>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="lesson-filter-label">
                      Select Lesson
                    </InputLabel>
                    <Select
                      labelId="lesson-filter-label"
                      value={selectedLesson?.id || moduleLessons[0]?.id || ""}
                      label="Select Lesson"
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
                    >
                      <Typography variant="h6">Tasks</Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedTask(null);
                          setTaskDialogOpen(true);
                        }}
                      >
                        Create Task
                      </Button>
                    </Box>
                    <TasksTable
                      tasks={tasks.filter(
                        (task) => task.lessonId === selectedLesson.id
                      )}
                      onEditTask={(task) => {
                        setSelectedTask(task);
                        setTaskDialogOpen(true);
                      }}
                      onDeleteTask={async (taskId) => {
                        await handleDeleteTask(taskId);
                      }}
                    />
                  </>
                )}
              </Box>
            )}
          </>
        )}
        {/* Analytics Tab */}
        {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Progress
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
        <DialogTitle id="delete-course-dialog-title">Delete Lesson</DialogTitle>
        <DialogContent id="delete-course-dialog-description">
          <Typography>
            Are you sure you want to delete this lesson? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={submitting}
          >
            Cancel
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
              "Delete"
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
        aria-labelledby="task-dialog-title"
      >
        <DialogTitle id="task-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">
              {selectedTask ? "Edit Task" : "Create Task"}
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
