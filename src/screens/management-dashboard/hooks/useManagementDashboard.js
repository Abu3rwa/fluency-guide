import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import courseService from "../../../services/courseService";
import * as lessonService from "../../../services/lessonService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const useManagementDashboard = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { t } = useTranslation();

  // Core States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Data States
  const [courses, setCourses] = useState([]);
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
    lesson: {
      title: "",
      description: "",
      content: "",
      duration: "",
      objectives: [],
      resources: [],
      order: 0,
      video: null,
      audio: null,
      image: null,
      materials: [],
      type: "lesson",
      status: "draft",
      vocabulary: [],
      grammarFocus: [],
      skills: [],
      assessment: "",
      keyActivities: [],
    },
  };

  const resourceApi = {
    course: {
      ...courseService,
      create: courseService.createCourse,
      update: courseService.updateCourse,
      delete: courseService.deleteCourse,
    },
    lesson: {
      ...lessonService,
      create: lessonService.createLesson,
      update: lessonService.updateLesson,
      delete: lessonService.deleteLesson,
    },
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const coursesData = await resourceApi.course.getAllCourses();
      setCourses(coursesData || []);
      const activeCourses = (coursesData || []).filter(
        (c) => c.status === "active"
      ).length;
      setStats({
        totalCourses: (coursesData || []).length,
        activeCourses,
        totalLessons: 0, // Placeholder
        totalModules: 0, // Placeholder
        totalTasks: 0, // Placeholder
        completionRate:
          (coursesData || []).length > 0
            ? Math.round((activeCourses / (coursesData || []).length) * 100)
            : 0,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load dashboard data.");
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

  const handleDialogSubmit = useCallback(
    async (data) => {
      const { type, mode } = dialogConfig;
      setSubmitting(true);
      try {
        if (mode === "create") {
          await resourceApi[type].create(data);
        } else {
          await resourceApi[type].update(dialogConfig.formData.id, data);
        }
        closeDialog();
        fetchData();
      } catch (error) {
        console.error(`Failed to save ${type}:`, error);
        setError(`Failed to save ${type}.`);
      } finally {
        setSubmitting(false);
      }
    },
    [dialogConfig, fetchData, closeDialog, t]
  );

  const handlePublish = async (course) => {
    try {
      const courseRef = doc(db, "courses", course.id);
      await updateDoc(courseRef, {
        published: !course.published,
      });
      fetchData();
    } catch (error) {
      console.error("Failed to update course status:", error);
      setError("Failed to update course status");
    }
  };

  const handleDeleteConfirm = useCallback(async () => {
    const { type, item } = deleteDialog;
    setSubmitting(true);
    try {
      await resourceApi[type].delete(item.id);
      setDeleteDialog({ open: false, type: "", item: null });
      fetchData();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      setError(`Failed to delete ${type}.`);
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
    let filtered = courses.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterStatus === "all" || item.status === filterStatus)
    );

    return filtered.sort((a, b) => {
      const aVal = a[sortBy] || "";
      const bVal = b[sortBy] || "";
      return sortOrder === "asc"
        ? String(aVal).localeCompare(bVal)
        : String(bVal).localeCompare(aVal);
    });
  }, [courses, searchQuery, filterStatus, sortBy, sortOrder]);

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
  };

  return {
    loading,
    error,
    submitting,
    courses,
    stats,
    menuAnchor,
    menuItem,
    deleteDialog,
    setDeleteDialog,
    dialogConfig,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleMenuOpen,
    handleMenuClose,
    openDialog,
    closeDialog,
    handleDialogSubmit,
    handlePublish,
    handleDeleteConfirm,
    getStatusColor,
    filteredData,
    resourceDefs,
    activeResource: "course", // Still hardcoded, but can be parameterized later
  };
};

export default useManagementDashboard;
