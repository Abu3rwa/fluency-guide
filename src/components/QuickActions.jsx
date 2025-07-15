import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  useTheme,
} from "@mui/material";
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as AnalyticsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const QuickActions = ({ stats }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const actions = [
    {
      title: "View Courses",
      description: "Browse and manage your courses",
      icon: <SchoolIcon />,
      color: theme.palette.primary.main,
      path: "/dashboard",
      badge: stats?.totalCourses || 0,
    },
    {
      title: "Manage Students",
      description: "View and manage student enrollments",
      icon: <PeopleIcon />,
      color: theme.palette.success.main,
      path: "/dashboard",
      badge: stats?.totalStudents || 0,
    },
    {
      title: "View Analytics",
      description: "Check performance and insights",
      icon: <AnalyticsIcon />,
      color: theme.palette.info.main,
      path: "/dashboard",
    },
    {
      title: "Content Management",
      description: "Create courses, modules, lessons & tasks",
      icon: <AssignmentIcon />,
      color: theme.palette.warning.main,
      path: "/management",
      badge: stats?.pendingTasks || 0,
    },
    {
      title: "Settings",
      description: "Configure platform settings",
      icon: <SettingsIcon />,
      color: theme.palette.secondary.main,
      path: "/settings",
    },
  ];

  return (
    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                onClick={() => navigate(action.path)}
                sx={{
                  p: 2,
                  height: "auto",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  borderRadius: 2,
                  borderColor: action.color,
                  color: action.color,
                  "&:hover": {
                    backgroundColor: `${action.color}10`,
                    borderColor: action.color,
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4],
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, flex: 1 }}
                  >
                    {action.title}
                  </Typography>
                  {action.badge && (
                    <Chip
                      label={action.badge}
                      size="small"
                      sx={{
                        backgroundColor: action.color,
                        color: "white",
                        fontSize: "0.75rem",
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: "left" }}
                >
                  {action.description}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
