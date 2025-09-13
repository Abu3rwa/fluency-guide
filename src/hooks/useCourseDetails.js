import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import courseService from "../services/courseService";
import moduleService from "../services/moduleService";
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
  deleteLesson,
  updateLesson,
  publishLesson,
  archiveLesson,
  draftLesson,
} from "../services/lessonService";

/**
 * Custom hook for managing CourseDetailsScreen state and operations
 * Extracts complex state management and business logic from the main component
 */
export const useCourseDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Main course data state
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [tasks, setTasks] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Selection states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    completionRate: 0,
    averageScore: 0,
    activeStudents: 0,
    totalEnrolled: 0,
    averageTimeSpent: 0,
    satisfactionRate: 0,
  });

  // Other states
  const [expandedModules, setExpandedModules] = useState({});
  const [validationResults, setValidationResults] = useState(null);

  // Main data fetching function
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

  // Course operations
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

  // Module operations
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

  // Lesson operations
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

  const handleUpdateLesson = useCallback(
    async (updatedLesson) => {
      try {
        const result = await updateLesson(editingLesson.id, updatedLesson);
        setLessons((lessons) => ({
          ...lessons,
          [selectedModuleId]: lessons[selectedModuleId].map((l) =>
            l.id === editingLesson.id ? { ...l, ...result } : l
          ),
        }));
        setCreateLessonOpen(false);
        setEditingLesson(null);
        return result;
      } catch (error) {
        console.error("Error updating lesson:", error);
        setError(error.message || "Failed to update lesson");
        throw error;
      }
    },
    [selectedModuleId, editingLesson]
  );

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

        setLessons((lessons) => ({
          ...lessons,
          [selectedModuleId]: lessons[selectedModuleId].map((l) =>
            l.id === lessonId ? { ...l, status: newStatus } : l
          ),
        }));
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

  // Task operations
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

        if (!taskId || taskId.trim() === "") {
          throw new Error("Invalid task ID - task ID is empty or missing");
        }

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

        setTasks((tasks) =>
          tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
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

  // Utility functions
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const toggleModuleExpand = useCallback((moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  }, []);

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

  // Effects
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

  // Fetch tasks when lesson changes
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

  // Computed values
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

  return {
    // Core data
    course,
    modules,
    lessons,
    tasks,
    studentProgress,
    analytics,

    // Computed data
    moduleLessons,
    filteredLessons,
    sortedLessons,

    // Loading states
    loading,
    loadingTasks,
    submitting,
    error,

    // Dialog states
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    moduleDialogOpen,
    setModuleDialogOpen,
    importDialogOpen,
    setImportDialogOpen,
    previewDialogOpen,
    setPreviewDialogOpen,
    shareDialogOpen,
    setShareDialogOpen,
    validationDialogOpen,
    setValidationDialogOpen,
    createModuleOpen,
    setCreateModuleOpen,
    createLessonOpen,
    setCreateLessonOpen,
    taskDialogOpen,
    setTaskDialogOpen,

    // Selection states
    activeTab,
    setActiveTab,
    selectedModuleId,
    setSelectedModuleId,
    selectedLesson,
    setSelectedLesson,
    selectedTask,
    setSelectedTask,
    editingLesson,
    setEditingLesson,
    selectedModule,
    setSelectedModule,

    // Filter and sort states
    searchQuery,
    setSearchQuery,
    filterAnchorEl,
    setFilterAnchorEl,
    sortAnchorEl,
    setSortAnchorEl,
    selectedStatus,
    setSelectedStatus,
    selectedSort,
    setSelectedSort,
    menuAnchorEl,
    setMenuAnchorEl,

    // Other states
    expandedModules,
    validationResults,
    setValidationResults,

    // Event handlers
    handleTabChange,
    handleDeleteCourse,
    handleEditCourse,
    handlePublishToggle,
    handleExportCourse,
    handleImportContent,
    handleCreateModule,
    handleUpdateModule,
    handleDeleteModule,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleLessonStatusChange,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleTaskStatusChange,
    toggleModuleExpand,
    debugTasksWithEmptyIds,

    // Utilities
    fetchCourseAndLessons,
    courseId: id,
  };
};