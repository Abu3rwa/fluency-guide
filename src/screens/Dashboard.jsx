import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  useMediaQuery,
  Tab,
  Tabs,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  LinearProgress,
  Drawer,
  ListItemButton,
  CircularProgress,
  AppBar,
  Toolbar,
  Skeleton,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Menu,
  MenuItem as MenuItemComponent,
  TextField,
  useTheme as useMuiTheme,
  Stack,
  Container,
} from "@mui/material";
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  EmojiEvents as EmojiEventsIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  AttachMoney as AttachMoneyIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  HowToReg as EnrollmentsIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Folder as ModuleIcon,
  Task as TaskIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import StudentsTable from "../components/StudentsTable";

import EnrollmentsTable from "../components/EnrollmentsTable";
import StudentStatsCharts from "../components/StudentStatsCharts";
import StatCard from "../components/StatCard";
import ResourceTable from "../components/ResourceTable";
import ResourceDialog from "../components/ResourceDialog";
import { useUser } from "../contexts/UserContext";
import { db } from "../firebase";
import { enrollmentService } from "../services/enrollmentService";
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
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { alpha, useTheme } from "@mui/material/styles";
import { ErrorBoundary } from "react-error-boundary";
import {
  ProgressiveLoading,
  LoadingOverlay,
} from "../components/LoadingStates";
import CustomSpinner from "../components/CustomSpinner";
import QuickActions from "../components/QuickActions";
import { useTranslation } from "react-i18next";
import {
  courseSchema,
  moduleSchema,
  lessonSchema,
  taskSchema,
} from "../utils/validation";
import UnifiedDashboardTabs from "../components/UnifiedDashboardTabs";
import ResourceManagementPanel from "../components/ResourceManagementPanel";
import CourseProgress from "../components/course/CourseProgress";
import RecentActivity from "../components/RecentActivity";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, userData } = useUser();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingTasks: 0,
    completionRate: 0,
  });

  // Management Dashboard States
  const [managementLoading, setManagementLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [recentActivities, setRecentActivities] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const navigate = useNavigate();
  const [pendingEnrollmentsCount, setPendingEnrollmentsCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog fields for each resource
  const dialogFields = {
    course: [
      { id: "title", label: "Title", required: true },
      { id: "category", label: "Category", required: true },
      { id: "level", label: "Level", required: true },
      { id: "price", label: "Price", type: "number", required: true },
      {
        id: "description",
        label: "Description",
        multiline: true,
        rows: 3,
        required: true,
      },
    ],
    module: [
      { id: "title", label: "Title", required: true },
      { id: "order", label: "Order", type: "number", required: true },
      {
        id: "description",
        label: "Description",
        multiline: true,
        rows: 3,
        required: true,
      },
    ],
    lesson: [
      { id: "title", label: "Title", required: true },
      { id: "duration", label: "Duration", type: "number", required: true },
      {
        id: "description",
        label: "Description",
        multiline: true,
        rows: 3,
        required: true,
      },
      {
        id: "content",
        label: "Content",
        multiline: true,
        rows: 6,
        required: true,
      },
    ],
    task: [
      { id: "title", label: "Title", required: true },
      { id: "points", label: "Points", type: "number", required: true },
      {
        id: "description",
        label: "Description",
        multiline: true,
        rows: 3,
        required: true,
      },
      {
        id: "instructions",
        label: "Instructions",
        multiline: true,
        rows: 4,
        required: true,
      },
    ],
  };

  // Validation schemas for each resource
  const validationSchemas = {
    course: courseSchema,
    module: moduleSchema,
    lesson: lessonSchema,
    task: taskSchema,
  };

  // Resource API handlers for each resource
  const resourceApi = {
    course: courseService,
    module: moduleService,
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

  // Resource definitions for all resources
  const resourceDefs = {
    course: {
      singular: "Course",
      plural: "Courses",
      data: courses,
      columns: [
        { id: "title", label: "Title" },
        { id: "category", label: "Category" },
        { id: "level", label: "Level" },
        { id: "status", label: "Status" },
      ],
    },
    module: {
      singular: "Module",
      plural: "Modules",
      data: modules,
      columns: [
        { id: "title", label: "Title" },
        { id: "order", label: "Order" },
        { id: "status", label: "Status" },
      ],
    },
    lesson: {
      singular: "Lesson",
      plural: "Lessons",
      data: lessons,
      columns: [
        { id: "title", label: "Title" },
        { id: "duration", label: "Duration" },
        { id: "status", label: "Status" },
      ],
    },
    task: {
      singular: "Task",
      plural: "Tasks",
      data: tasks,
      columns: [
        { id: "title", label: "Title" },
        { id: "type", label: "Type" },
        { id: "points", label: "Points" },
        { id: "status", label: "Status" },
      ],
    },
  };

  const loadingSteps = [
    "Initializing dashboard...",
    "Loading user statistics...",
    "Fetching course data...",
    "Loading enrollment information...",
    "Preparing analytics...",
    "Finalizing dashboard...",
  ];

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "User Management", icon: <PeopleIcon />, path: "/students" },
    { text: "Course Management", icon: <SchoolIcon />, path: "/courses" },
    { text: "Analytics", icon: <AnalyticsIcon />, path: "/analytics" },
    { text: "Security", icon: <SecurityIcon />, path: "/settings" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingStep(0);

      // Step 1: Initialize
      setLoadingStep(1);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 2: Load user statistics
      setLoadingStep(2);
      const studentsQuery = query(
        collection(db, "users"),
        where("isStudent", "==", true)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const totalStudents = studentsSnapshot.size;

      // Step 3: Fetch course data
      setLoadingStep(3);
      const coursesData = await courseService.getAllCourses();
      setCourses(coursesData);
      const activeCourses = coursesData.filter(
        (course) => course.status === "active"
      ).length;

      // Fetch pending tasks
      const tasksQuery = query(
        collection(db, "tasks"),
        where("status", "==", "pending")
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const pendingTasks = tasksSnapshot.docs.filter(
        (doc) => doc.data().dueDate?.toDate() >= new Date()
      ).length;

      // Calculate completion rate
      const completedTasksQuery = query(
        collection(db, "tasks"),
        where("status", "==", "completed")
      );
      const completedTasksSnapshot = await getDocs(completedTasksQuery);
      const totalTasks = tasksSnapshot.size + completedTasksSnapshot.size;
      const completionRate =
        totalTasks > 0
          ? Math.round((completedTasksSnapshot.size / totalTasks) * 100)
          : 0;

      // Step 4: Load enrollment information
      setLoadingStep(4);
      const activitiesQuery = query(
        collection(db, "activities"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activities = activitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: formatTimestamp(doc.data().timestamp),
      }));

      // Fetch course progress for the current user
      if (user) {
        const userProgressQuery = query(
          collection(db, "userProgress"),
          where("userId", "==", user.uid)
        );
        const progressSnapshot = await getDocs(userProgressQuery);
        const progress = await Promise.all(
          progressSnapshot.docs.map(async (doc) => {
            const courseDoc = await getDoc(doc.ref.parent.parent);
            return {
              name: courseDoc.data().name,
              progress: doc.data().progress,
            };
          })
        );
        setCourseProgress(progress);
      }

      // Step 5: Prepare analytics
      setLoadingStep(5);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Step 6: Finalize
      setLoadingStep(6);
      await new Promise((resolve) => setTimeout(resolve, 100));

      setStats({
        totalStudents,
        activeCourses,
        pendingTasks,
        completionRate,
      });
      setRecentActivities(activities);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError(error.message || "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const enrollments = await enrollmentService.getAllEnrollments();
        const pending = enrollments.filter(
          (enrollment) => enrollment.status === "pending"
        );
        const recent = enrollments
          .filter((enrollment) => enrollment.status !== "pending")
          .sort((a, b) => b.enrolledAt - a.enrolledAt)
          .slice(0, 5);

        setPendingEnrollments(pending);
        setRecentEnrollments(recent);
        setPendingEnrollmentsCount(pending.length);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
    };

    fetchEnrollments();
  }, []);

  const handleApproveEnrollment = async (enrollmentId) => {
    try {
      await enrollmentService.approveEnrollment(enrollmentId);
      // Refresh enrollments after approval
      const enrollments = await enrollmentService.getAllEnrollments();
      const pending = enrollments.filter(
        (enrollment) => enrollment.status === "pending"
      );
      const recent = enrollments
        .filter((enrollment) => enrollment.status !== "pending")
        .sort((a, b) => b.enrolledAt - a.enrolledAt)
        .slice(0, 5);

      setPendingEnrollments(pending);
      setRecentEnrollments(recent);
      setPendingEnrollmentsCount(pending.length);
    } catch (error) {
      console.error("Error approving enrollment:", error);
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    try {
      await enrollmentService.rejectEnrollment(enrollmentId);
      // Refresh enrollments after rejection
      const enrollments = await enrollmentService.getAllEnrollments();
      const pending = enrollments.filter(
        (enrollment) => enrollment.status === "pending"
      );
      const recent = enrollments
        .filter((enrollment) => enrollment.status !== "pending")
        .sort((a, b) => b.enrolledAt - a.enrolledAt)
        .slice(0, 5);

      setPendingEnrollments(pending);
      setRecentEnrollments(recent);
      setPendingEnrollmentsCount(pending.length);
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRetry = () => {
    setError(null);
    fetchDashboardData();
  };

  const statsData = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: <PeopleIcon />,
      color: "primary",
      subtitle: "Registered students",
    },
    {
      title: "Active Courses",
      value: stats.activeCourses,
      icon: <SchoolIcon />,
      color: "success",
      subtitle: "Currently running",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: <AssignmentIcon />,
      color: "warning",
      subtitle: "Awaiting completion",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: <TrendingUpIcon />,
      color: "secondary",
      subtitle: "Overall success rate",
    },
  ];

  const paginatedData = pendingEnrollments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Define tab content with responsive considerations
  const tabs = [
    {
      label: "Overview",
      content: (
        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Course Progress */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 2,
                boxShadow: theme.shadows[2],
              }}
            >
              <CardHeader
                title="Current Course Progress"
                sx={{ pb: 1 }}
                titleTypographyProps={{
                  variant: isMobile ? "h6" : "h5",
                  fontSize: isMobile ? "1rem" : "1.25rem",
                }}
              />
              <CardContent>
                <CourseProgress title="" progress={12} total={24} />
              </CardContent>
            </Card>
          </Grid>
          {/* Recent Activity */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 2,
                boxShadow: theme.shadows[2],
              }}
            >
              <CardHeader
                title="Recent Activity"
                sx={{ pb: 1 }}
                titleTypographyProps={{
                  variant: isMobile ? "h6" : "h5",
                  fontSize: isMobile ? "1rem" : "1.25rem",
                }}
              />
              <CardContent sx={{ pt: 0 }}>
                <RecentActivity activities={recentActivities} />
              </CardContent>
            </Card>
          </Grid>
          {/* Charts */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardHeader
                title="Student Performance Analytics"
                titleTypographyProps={{
                  variant: isMobile ? "h6" : "h5",
                  fontSize: isMobile ? "1rem" : "1.25rem",
                }}
              />
              <CardContent>
                <StudentStatsCharts />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Courses",
      content: (
        <ResourceManagementPanel
          resourceDefs={{ course: resourceDefs.course }}
          initialResource="course"
          fetchData={fetchDashboardData}
          loading={loading}
        />
      ),
    },
    {
      label: "Students",
      content: (
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardContent sx={{ p: isMobile ? 1 : 0 }}>
            <StudentsTable />
          </CardContent>
        </Card>
      ),
    },
    {
      label: "Enrollments",
      content: (
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardHeader
            title="Enrollment Management"
            titleTypographyProps={{
              variant: isMobile ? "h6" : "h5",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          />
          <CardContent sx={{ p: isMobile ? 1 : 0 }}>
            <EnrollmentsTable
              enrollments={[...pendingEnrollments, ...recentEnrollments]}
              onApprove={handleApproveEnrollment}
              onReject={handleRejectEnrollment}
            />
          </CardContent>
        </Card>
      ),
    },
    {
      label: "Analytics",
      content: (
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardHeader
            title="Analytics & Reports"
            titleTypographyProps={{
              variant: isMobile ? "h6" : "h5",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          />
          <CardContent>
            <StudentStatsCharts />
          </CardContent>
        </Card>
      ),
    },
    userData?.isAdmin && {
      label: "Content Management",
      content: (
        <ResourceManagementPanel
          resourceDefs={resourceDefs}
          initialResource="course"
          fetchData={fetchDashboardData}
          loading={loading}
          dialogFields={dialogFields}
          validationSchemas={validationSchemas}
          resourceApi={resourceApi}
        />
      ),
    },
  ].filter(Boolean);

  // Show progressive loading during initial load
  if (loading && loadingStep > 0) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <ProgressiveLoading steps={loadingSteps} currentStep={loadingStep} />
      </Box>
    );
  }

  // Show custom spinner for initial loading
  if (loading && loadingStep === 0) {
    return <CustomSpinner />;
  }

  // Show error state with retry option
  if (error) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRetry}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={handleRetry}
          startIcon={<RefreshIcon />}
        >
          Reload Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {loading && <CustomSpinner message="Refreshing data..." />}
      <Box
        sx={{
          opacity: loading ? 0.6 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 4 }, pb: 4 }}>
          {/* Stats Cards with Enhanced Design */}
          <Grid
            container
            spacing={isMobile ? 2 : 3}
            sx={{ mb: { xs: 3, md: 4 } }}
          >
            {/* Quick Actions */}
            <Grid item xs={12}>
              <QuickActions stats={stats} />
            </Grid>

            {/* <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Enrollments"
                value={pendingEnrollmentsCount}
                icon={<EnrollmentsIcon />}
                color="#FF9800"
                subtitle="Awaiting approval"
                onClick={() => navigate("/enrollments")}
                sx={{
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              />
            </Grid> */}
          </Grid>

          {/* Enhanced Tabs Design */}

          {/* Tab Content with Better Spacing */}
          <Box sx={{ minHeight: "60vh" }}>
            <UnifiedDashboardTabs tabs={tabs} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
