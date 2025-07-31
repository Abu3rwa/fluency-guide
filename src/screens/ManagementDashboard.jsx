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
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import courseService from "../services/courseService";
import CourseDialog from "../components/course/CourseDialog";
import { useTranslation } from "react-i18next";
import ManagementSearchBar from "../components/content-management/ManagementSearchBar";
import ManagementTable from "../components/content-management/ManagementTable";
import ManagementStats from "../components/content-management/ManagementStats";
import ManagementMenu from "../components/content-management/ManagementMenu";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import PaymentsTable from "../components/PaymentsTable";
import CenteredLoader from "../components/CenteredLoader";
import { useAuth } from "../contexts/AuthContext";
const ManagementDashboard = () => {
  const theme = useTheme();
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
  };

  const resourceApi = {
    course: {
      ...courseService,
      create: courseService.createCourse,
      delete: courseService.deleteCourse,
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
        totalLessons: 0,
        totalModules: 0,
        totalTasks: 0,
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

  const handleDialogSubmit = useCallback(
    async (courseData) => {
      const { type, mode } = dialogConfig;
      setSubmitting(true);

      try {
        if (mode === "create") {
          await resourceApi[type].create(courseData);
        } else {
          await resourceApi[type].updateCourse(
            dialogConfig.formData.id,
            courseData
          );
        }
        closeDialog();
        fetchData();
      } catch (error) {
        console.error(`Failed to save ${type}:`, error);
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
    const data = courses;

    let filteredData = data.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterStatus === "all" || item.status === filterStatus)
    );

    return filteredData.sort((a, b) => {
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

  const activeResource = "course";

  if (loading) {
    return (
      <CenteredLoader
        type="skeleton"
        message="Loading management dashboard..."
        skeletonCount={5}
        skeletonHeight={24}
        minHeight="400px"
        fullScreen={true}
      />
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

        <ManagementTable
          resourceDefs={resourceDefs}
          activeResource={activeResource}
          openDialog={openDialog}
          filteredData={filteredData}
          handleMenuOpen={handleMenuOpen}
          getStatusColor={getStatusColor}
          courses={courses}
          loading={loading}
        />
        {/* Payments Table for Admins */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pending Payments
          </Typography>
          <PaymentsTable />
        </Box>
      </Box>

      <ManagementMenu
        menuAnchor={menuAnchor}
        menuItem={menuItem}
        handleMenuClose={handleMenuClose}
        openDialog={openDialog}
        activeResource={activeResource}
        setDeleteDialog={setDeleteDialog}
        handlePublish={handlePublish}
      />

      <CourseDialog
        open={dialogConfig.open}
        onClose={closeDialog}
        mode={dialogConfig.mode}
        courseData={dialogConfig.formData}
        onSave={handleDialogSubmit}
        loading={submitting}
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
