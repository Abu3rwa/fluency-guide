import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import StudentsTable from "../components/StudentsTable";
import CoursesTable from "../components/CoursesTable";
import EnrollmentsTable from "../components/EnrollmentsTable";
import StudentStatsCharts from "../components/StudentStatsCharts";
import { useUser } from "../contexts/UserContext";
import { db } from "../firebase";
import { enrollmentService } from "../services/enrollmentService";
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
import { useTheme } from "../theme/ThemeContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { alpha } from "@mui/material/styles";

const drawerWidth = 240;

const StatCard = ({ title, value, icon, color, subtitle, onClick }) => {
  const { theme } = useTheme();

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: alpha(color, 0.1),
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const CourseProgress = ({ title, progress, total }) => {
  const { theme } = useTheme();
  const percentage = Math.round((progress / total) * 100);

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
              },
            }}
          />
        </Box>
        <Typography variant="h6" gutterBottom>
          {percentage}% Complete
        </Typography>
        <Typography color="text.secondary">
          {progress} of {total} lessons completed
        </Typography>
      </CardContent>
    </Card>
  );
};

const RecentActivity = ({ activities }) => {
  const { theme } = useTheme();

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity.id} sx={{ px: 0 }}>
              <ListItemIcon>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  {activity.type === "course" ? (
                    <SchoolIcon />
                  ) : activity.type === "assignment" ? (
                    <AssignmentIcon />
                  ) : (
                    <PersonIcon />
                  )}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={activity.title}
                secondary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                    <Chip
                      label={activity.time}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const AdminDrawer = () => {
  const { theme, toggleTheme } = useTheme();
  const { userData } = useUser();
  const navigate = useNavigate();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "User Management", icon: <PeopleIcon /> },
    { text: "Course Management", icon: <SchoolIcon /> },
    { text: "Analytics", icon: <AnalyticsIcon /> },
    { text: "Security", icon: <SecurityIcon /> },
    { text: "Settings", icon: <SettingsIcon /> },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        backgroundColor: theme.palette.background.paper,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
          Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton key={item.text}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ color: theme.palette.text.primary }}>
                  {item.text}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ color: theme.palette.error.main }}>
                Logout
              </Typography>
            }
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ overflow: "auto", mt: 8 }}>{drawerContent}</Box>
    </Drawer>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, userData } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingTasks: 0,
    completionRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingEnrollmentsCount, setPendingEnrollmentsCount] = useState(0);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "Profile", icon: <PersonIcon /> },
    { text: "Settings", icon: <SettingsIcon /> },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch total students
        const studentsQuery = query(
          collection(db, "users"),
          where("isStudent", "==", true)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const totalStudents = studentsSnapshot.size;

        // Fetch active courses
        const coursesQuery = query(
          collection(db, "courses"),
          where("status", "==", "active")
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        const activeCourses = coursesSnapshot.size;

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

        // Fetch recent activities
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

        setStats({
          totalStudents,
          activeCourses,
          pendingTasks,
          completionRate,
        });
        setRecentActivities(activities);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

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

  const statsData = [
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      subtitle: "Active students",
    },
    {
      title: "Active Courses",
      value: stats.activeCourses.toString(),
      icon: <SchoolIcon />,
      color: theme.palette.secondary.main,
      subtitle: "Currently running",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      icon: <AssignmentIcon />,
      color: theme.palette.warning.main,
      subtitle: "Requires attention",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
      subtitle: "Task completion",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        backgroundColor: theme.palette.background.paper,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
          Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton key={item.text}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ color: theme.palette.text.primary }}>
                  {item.text}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ color: theme.palette.error.main }}>
                Logout
              </Typography>
            }
          />
        </ListItemButton>
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      {userData?.isAdmin && <AdminDrawer />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            sm: `calc(100% - ${userData?.isAdmin ? drawerWidth : 0}px)`,
          },
          ml: { sm: userData?.isAdmin ? `${drawerWidth}px` : 0 },
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.background.paper,
            boxShadow: 1,
          }}
        >
          <Toolbar>
            {userData?.isAdmin && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ mr: 2, display: { sm: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                color: theme.palette.text.primary,
              }}
            >
              Dashboard
            </Typography>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {theme.palette.mode === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>
            <IconButton
              color="inherit"
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton
              color="inherit"
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <PersonIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Stats Cards */}
            {statsData.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard {...stat} />
              </Grid>
            ))}

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Enrollments"
                value={pendingEnrollmentsCount}
                icon={<EnrollmentsIcon />}
                color="#FF9800"
                subtitle="Awaiting approval"
                onClick={() => navigate("/enrollments")}
              />
            </Grid>

            {/* Main Content Tabs */}
            <Grid item xs={12}>
              <Paper sx={{ width: "100%", mb: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant={isMobile ? "fullWidth" : "standard"}
                >
                  <Tab label="Overview" />
                  <Tab label="Courses" />
                  <Tab label="Enrollments" />
                  <Tab label="Students" />
                  <Tab label="Reports" />
                </Tabs>
              </Paper>
            </Grid>

            {/* Tab Content */}
            <Grid item xs={12}>
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  {/* Course Progress */}
                  <Grid item xs={12} md={6}>
                    <CourseProgress
                      title="Current Course Progress"
                      progress={12}
                      total={24}
                    />
                  </Grid>

                  {/* Recent Activity */}
                  <Grid item xs={12} md={6}>
                    <RecentActivity activities={recentActivities} />
                  </Grid>

                  {/* Charts */}
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Student Performance" />
                      <CardContent>
                        <StudentStatsCharts />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader
                        title="Courses"
                        action={
                          <IconButton color="primary" aria-label="add course">
                            <SchoolIcon />
                          </IconButton>
                        }
                      />
                      <CardContent>
                        <CoursesTable />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader
                        title="Enrollments"
                        action={
                          <IconButton
                            color="primary"
                            aria-label="view all enrollments"
                          >
                            <EnrollmentsIcon />
                          </IconButton>
                        }
                      />
                      <CardContent>
                        <EnrollmentsTable
                          enrollments={[
                            ...pendingEnrollments,
                            ...recentEnrollments,
                          ]}
                          onApprove={handleApproveEnrollment}
                          onReject={handleRejectEnrollment}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Students" />
                      <CardContent>
                        <StudentsTable />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 4 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Performance Reports" />
                      <CardContent>
                        <StudentStatsCharts />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
