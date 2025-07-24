import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Menu,
  Divider,
  TextField,
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Folder as ModuleIcon,
  Task as TaskIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import courseService from "../services/courseService";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getAllLessons,
} from "../services/lessonService";
import moduleService from "../services/moduleService";
import {
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
} from "../services/taskService";
import StatCard from "../components/StatCard";
import ResourceDialog from "../components/ResourceDialog";
import { useTranslation } from "react-i18next";
import {
  courseSchema,
  moduleSchema,
  lessonSchema,
  taskSchema,
} from "../utils/validation";
import ManagementSearchBar from "../components/content-management/ManagementSearchBar";
import ManagementTabs from "../components/content-management/ManagementTabs";
import ManagementTable from "../components/content-management/ManagementTable";
import ManagementStats from "../components/content-management/ManagementStats";
import ManagementMenu from "../components/content-management/ManagementMenu";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import LessonAnalytics from "../components/course/LessonAnalytics";

const ManagementDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { t } = useTranslation();

  // Core States
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data States
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalLessons: 0,
    totalModules: 0,
    totalTasks: 0,
    completionRate: 0,
  });

  // UI States
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "",
    item: null,
  });
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    mode: "create",
    type: "course",
    formData: {},
  });

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const initialForms = {
    course: {
      title: "",
      description: "",
      category: "",
      level: "beginner",
      price: "",
      status: "draft",
    },
    module: { title: "", description: "", order: 1, status: "draft" },
    lesson: {
      title: "",
      description: "",
      content: "",
      duration: 0,
      order: 1,
      type: "video",
      status: "draft",
    },
    task: {
      title: "",
      description: "",
      type: "assignment",
      points: 10,
      status: "draft",
    },
  };

  const dialogFields = {
    course: [
      { id: "title", label: t("courses.fields.title"), required: true },
      { id: "category", label: t("courses.fields.category"), required: true },
      {
        id: "level",
        label: t("courses.fields.level"),
        type: "select",
        required: true,
        options: [
          { value: "beginner", label: t("courses.levels.beginner") },
          { value: "intermediate", label: t("courses.levels.intermediate") },
          { value: "advanced", label: t("courses.levels.advanced") },
        ],
      },
      {
        id: "price",
        label: t("courses.fields.price"),
        type: "number",
        required: true,
      },
      {
        id: "description",
        label: t("courses.fields.description"),
        multiline: true,
        rows: 3,
        sm: 12,
        required: true,
      },
    ],
    module: [
      { id: "title", label: t("modules.fields.title"), required: true },
      {
        id: "order",
        label: t("modules.fields.order"),
        type: "number",
        required: true,
      },
      {
        id: "description",
        label: t("modules.fields.description"),
        multiline: true,
        rows: 3,
        sm: 12,
        required: true,
      },
    ],
    lesson: [
      { id: "title", label: t("lessons.fields.title"), required: true },
      {
        id: "duration",
        label: t("lessons.fields.duration"),
        type: "number",
        required: true,
      },
      {
        id: "description",
        label: t("lessons.fields.description"),
        multiline: true,
        rows: 3,
        sm: 12,
        required: true,
      },
      {
        id: "content",
        label: t("lessons.fields.content"),
        multiline: true,
        rows: 6,
        sm: 12,
        required: true,
      },
    ],
    task: [
      { id: "title", label: t("tasks.fields.title"), required: true },
      {
        id: "points",
        label: t("tasks.fields.points"),
        type: "number",
        required: true,
      },
      {
        id: "description",
        label: t("tasks.fields.description"),
        multiline: true,
        rows: 3,
        sm: 12,
        required: true,
      },
      {
        id: "instructions",
        label: t("tasks.fields.instructions"),
        multiline: true,
        rows: 4,
        sm: 12,
        required: true,
      },
    ],
  };

  const validationSchemas = {
    course: courseSchema,
    module: moduleSchema,
    lesson: lessonSchema,
    task: taskSchema,
  };

  const resourceApi = {
    course: {
      ...courseService,
      delete: courseService.deleteCourse,
    },
    module: {
      ...moduleService,
      delete: moduleService.deleteModule,
    },
    lesson: {
      create: createLesson,
      update: updateLesson,
      delete: deleteLesson,
      getAll: getAllLessons,
    },
    task: {
      create: createTask,
      update: updateTask,
      delete: deleteTask,
      getAll: getAllTasks,
    },
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesData, modulesData, lessonsData, tasksData] =
        await Promise.all([
          resourceApi.course.getAllCourses(),
          resourceApi.module.getAllModules(),
          resourceApi.lesson.getAll(),
          resourceApi.task.getAll(),
        ]);

      setCourses(coursesData || []);
      setModules(modulesData || []);
      setLessons(lessonsData || []);
      setTasks(tasksData || []);

      const activeCourses = (coursesData || []).filter(
        (c) => c.status === "active"
      ).length;

      setStats({
        totalCourses: (coursesData || []).length,
        activeCourses,
        totalLessons: (lessonsData || []).length,
        totalModules: (modulesData || []).length,
        totalTasks: (tasksData || []).length,
        completionRate:
          (coursesData || []).length > 0
            ? Math.round((activeCourses / (coursesData || []).length) * 100)
            : 0,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (userData && !userData.isAdmin) {
      navigate("/dashboard");
    } else if (userData) {
      fetchData();
    }
  }, [user, userData, navigate, fetchData]);

  const handleMenuOpen = useCallback((event, item) => {
    setMenuAnchor(event.currentTarget);
    setMenuItem(item);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setMenuItem(null);
  }, []);

  const openDialog = useCallback((type, mode = "create", item = null) => {
    setDialogConfig({
      open: true,
      type,
      mode,
      formData: item || initialForms[type],
    });
    handleMenuClose();
  }, []);

  const closeDialog = useCallback(() => {
    setDialogConfig((prev) => ({ ...prev, open: false }));
  }, []);

  const handleDialogSubmit = useCallback(async () => {
    const { type, mode, formData } = dialogConfig;
    setSubmitting(true);

    try {
      if (mode === "create") {
        await resourceApi[type].create(formData);
      } else {
        //
      }
      closeDialog();
      fetchData();
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
    } finally {
      setSubmitting(false);
    }
  }, [dialogConfig, fetchData, closeDialog, t]);

  const handleDeleteConfirm = useCallback(async () => {
    const { type, item } = deleteDialog;
    setSubmitting(true);

    try {
      await resourceApi[type].delete(item.id);

      setDeleteDialog({ open: false, type: "", item: null });
      fetchData();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    } finally {
      setSubmitting(false);
    }
  }, [deleteDialog, fetchData, t]);

  const getStatusColor = useCallback((status) => {
    return (
      {
        active: "success",
        published: "success",
        draft: "warning",
        archived: "error",
      }[status] || "default"
    );
  }, []);

  const filteredData = useMemo(() => {
    const dataMap = {
      course: courses,
      module: modules,
      lesson: lessons,
      task: tasks,
    };

    const data = dataMap[Object.keys(dataMap)[activeTab]] || [];

    return data
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (filterStatus === "all" || item.status === filterStatus)
      )
      .sort((a, b) => {
        const aVal = a[sortBy] || "";
        const bVal = b[sortBy] || "";
        return sortOrder === "asc"
          ? String(aVal).localeCompare(bVal)
          : String(bVal).localeCompare(aVal);
      });
  }, [
    courses,
    modules,
    lessons,
    tasks,
    activeTab,
    searchQuery,
    filterStatus,
    sortBy,
    sortOrder,
  ]);

  const resourceDefs = {
    course: {
      singular: t("management.resources.course"),
      plural: t("management.resources.courses"),
      data: courses,
      columns: [
        { id: "title", label: t("management.columns.title") },
        { id: "category", label: t("management.columns.category") },
        { id: "level", label: t("management.columns.level") },
        { id: "status", label: t("management.columns.status") },
        {
          id: "enrolledStudents",
          label: t("management.columns.students"),
          render: (item) => item.enrolledStudents || 0,
        },
      ],
    },
    module: {
      singular: t("management.resources.module"),
      plural: t("management.resources.modules"),
      data: modules,
      columns: [
        { id: "title", label: t("management.columns.title") },
        {
          id: "course",
          label: t("management.columns.course"),
          render: (item, { courses }) =>
            courses.find((c) => c.id === item.courseId)?.title ||
            t("common.unknown"),
        },
        { id: "order", label: t("management.columns.order") },
        { id: "status", label: t("management.columns.status") },
        {
          id: "lessons",
          label: t("management.columns.lessons"),
          render: (item, { lessons }) =>
            lessons.filter((l) => l.moduleId === item.id).length,
        },
      ],
    },
  };

  const activeResource = Object.keys(resourceDefs)[activeTab];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>

        <ManagementStats loading={loading} stats={stats} />

        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ px: { xs: 2, md: 4 } }}>
        <ManagementSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <ManagementTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          resourceDefs={resourceDefs}
        />

        <ManagementTable
          resourceDefs={resourceDefs}
          activeResource={activeResource}
          openDialog={openDialog}
          filteredData={filteredData}
          handleMenuOpen={handleMenuOpen}
          getStatusColor={getStatusColor}
          courses={courses}
          modules={modules}
          lessons={lessons}
          loading={loading}
        />
      </Box>

      <ManagementMenu
        menuAnchor={menuAnchor}
        menuItem={menuItem}
        handleMenuClose={handleMenuClose}
        openDialog={openDialog}
        activeResource={activeResource}
        setDeleteDialog={setDeleteDialog}
      />

      <ResourceDialog
        open={dialogConfig.open}
        onClose={closeDialog}
        mode={dialogConfig.mode}
        title={resourceDefs[dialogConfig.type]?.singular || ""}
        fields={dialogFields[dialogConfig.type] || []}
        formData={dialogConfig.formData}
        onFormChange={(data) =>
          setDialogConfig((prev) => ({ ...prev, formData: data }))
        }
        onSubmit={handleDialogSubmit}
        loading={submitting}
        validationSchema={validationSchemas[dialogConfig.type]}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "", item: null })}
        onConfirm={handleDeleteConfirm}
        item={deleteDialog}
        submitting={submitting}
      />
    </Box>
  );
};

export default ManagementDashboard;
