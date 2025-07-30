import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  Chip,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  HowToReg as EnrollmentsIcon,
  Analytics as AnalyticsIcon,
  Build as ManagementIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "@mui/material/styles";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const isAdmin = userData?.isAdmin;
  const theme = useTheme();

  // Define menu items based on user role
  const menuItems = isAdmin
    ? [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/dashboard",
          description: "Overview & Analytics",
        },
        {
          text: "Content Management",
          icon: <ManagementIcon />,
          path: "/management",
          description: "Create & Manage Content",
        },
        {
          text: "Students",
          icon: <PeopleIcon />,
          path: "/students",
          description: "Student Management",
        },
        {
          text: "Enrollments",
          icon: <EnrollmentsIcon />,
          path: "/enrollments",
          description: "Enrollment Management",
        },
        {
          text: "Analytics",
          icon: <AnalyticsIcon />,
          path: "/analytics",
          description: "Performance Reports",
        },
        {
          text: "Settings",
          icon: <SettingsIcon />,
          path: "/settings",
          description: "Platform Settings",
        },
      ]
    : user
    ? [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/dashboard",
          description: "Overview & Progress",
        },
        {
          text: "Courses",
          icon: <SchoolIcon />,
          path: "/courses",
          description: "Browse Courses",
        },
        {
          text: "Profile",
          icon: <PersonIcon />,
          path: "/profile",
          description: "User Profile",
        },
        {
          text: "Settings",
          icon: <SettingsIcon />,
          path: "/settings",
          description: "Account Settings",
        },
      ]
    : [
        {
          text: "Courses",
          icon: <SchoolIcon />,
          path: "/courses",
          description: "Explore Courses",
        },
        {
          text: "About",
          icon: <PersonIcon />,
          path: "/about",
          description: "About Us",
        },
        {
          text: "Contact",
          icon: <SettingsIcon />,
          path: "/contact",
          description: "Contact Us",
        },
      ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 70,
        width: 240, // Standardized width
        minWidth: 200,
        maxWidth: 300,
        height: "100vh", // Full viewport height
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
            : `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        backdropFilter: "blur(10px)",
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 1200,
      }}
    >
      <Box
        sx={{
          p: theme.spacing(2),
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            {isAdmin ? "Admin Panel" : "Dashboard"}{" "}
            {isAdmin && (
              <Chip
                label="Admin"
                size="small"
                color="primary"
                sx={{ height: 16, fontSize: "0.7rem" }}
              />
            )}
          </Typography>
          {userData && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {userData.email}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mx: theme.spacing(2), mb: 1 }} />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mx: 0.5,
              borderRadius: 2,
              mb: 0.5,
              flexDirection: "column",
              alignItems: "flex-start",
              py: 1.5,
              "&.Mui-selected": {
                background: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  background: alpha(theme.palette.primary.main, 0.15),
                },
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color:
                    location.pathname === item.path
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  fontSize: "0.9rem",
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                ml: 5,
                fontSize: "0.75rem",
                lineHeight: 1.2,
              }}
            >
              {item.description}
            </Typography>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: theme.spacing(2) }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: "center",
            display: "block",
          }}
        >
          {isAdmin ? "Admin Dashboard v1.0" : "Online Teaching Platform"}
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
