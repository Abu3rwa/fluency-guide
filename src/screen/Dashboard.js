import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  useTheme,
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
} from "@mui/icons-material";
import StudentsTable from "../components/StudentsTable";
import CoursesTable from "../components/CoursesTable";
import StudentStatsCharts from "../components/StudentStatsCharts";
import CreateCourseForm from "../components/CreateCourseForm";

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const RecentActivity = ({ activities }) => (
  <Card sx={{ height: "100%" }}>
    <CardHeader
      title="Recent Activity"
      action={
        <IconButton aria-label="settings">
          <MoreVertIcon />
        </IconButton>
      }
    />
    <Divider />
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {activities.map((activity, index) => (
        <ListItem key={index} alignItems="flex-start">
          <ListItemIcon>{activity.icon}</ListItemIcon>
          <ListItemText
            primary={activity.title}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {activity.description}
                </Typography>
                {` — ${activity.time}`}
              </React.Fragment>
            }
          />
        </ListItem>
      ))}
    </List>
  </Card>
);

const CourseProgress = ({ courses }) => (
  <Card sx={{ height: "100%" }}>
    <CardHeader
      title="Course Progress"
      action={
        <IconButton aria-label="settings">
          <MoreVertIcon />
        </IconButton>
      }
    />
    <Divider />
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {courses.map((course, index) => (
        <ListItem key={index}>
          <ListItemText
            primary={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">{course.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {course.progress}%
                </Typography>
              </Box>
            }
            secondary={
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={course.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  </Card>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const stats = [
    {
      title: "Total Students",
      value: "1,234",
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      subtitle: "+12% from last month",
    },
    {
      title: "Active Courses",
      value: "24",
      icon: <SchoolIcon />,
      color: theme.palette.secondary.main,
      subtitle: "4 new this week",
    },
    {
      title: "Pending Tasks",
      value: "15",
      icon: <AssignmentIcon />,
      color: theme.palette.warning.main,
      subtitle: "3 due today",
    },
    {
      title: "Completion Rate",
      value: "89%",
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
      subtitle: "+5% from last week",
    },
  ];

  const recentActivities = [
    {
      title: "New Student Enrollment",
      description: "John Doe enrolled in Advanced English",
      time: "2 hours ago",
      icon: <PeopleIcon color="primary" />,
    },
    {
      title: "Course Completion",
      description: "Sarah completed Basic Grammar",
      time: "5 hours ago",
      icon: <CheckCircleIcon color="success" />,
    },
    {
      title: "Task Deadline",
      description: "Essay submission due tomorrow",
      time: "1 day ago",
      icon: <ScheduleIcon color="warning" />,
    },
    {
      title: "System Update",
      description: "New features available",
      time: "2 days ago",
      icon: <NotificationsIcon color="info" />,
    },
  ];

  const courseProgress = [
    { name: "Advanced English", progress: 85 },
    { name: "Business Communication", progress: 65 },
    { name: "Grammar Fundamentals", progress: 92 },
    { name: "Speaking Practice", progress: 45 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}

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
              <Tab label="Students" />
              <Tab label="Reports" />
            </Tabs>
          </Paper>
        </Grid>

        {/* Tab Content */}
        <Grid item xs={12}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Recent Activity */}
              <Grid item xs={12} md={6}>
                <RecentActivity activities={recentActivities} />
              </Grid>

              {/* Course Progress */}
              <Grid item xs={12} md={6}>
                <CourseProgress courses={courseProgress} />
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
                  <CardHeader title="Students" />
                  <CardContent>
                    <StudentsTable />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
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
  );
}
