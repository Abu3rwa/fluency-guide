import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LandingHeader from "../LandingHeader/LandingHeader";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 320;

const AppLayout = ({ children }) => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  // Hide sidebar for student routes
  const isStudentRoute = location.pathname.startsWith("/student/");
  const isDashboardRoute = location.pathname === "/dashboard";
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = userData?.isAdmin
    ? [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/dashboard",
          description: "Overview & Analytics",
        },
        {
          text: "Content Management",
          icon: <SettingsIcon />,
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 600) {
      // Mobile breakpoint
      setMobileOpen(false);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        backgroundColor: theme.palette.background.paper,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: theme.spacing(2) }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
          {userData?.isAdmin
            ? "Admin Dashboard"
            : user
            ? "Dashboard"
            : "Online Teaching"}
        </Typography>
        {userData && (
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, mt: 1 }}
          >
            {userData.email}
            {userData.isAdmin && (
              <Chip label="Admin" size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActiveRoute(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActiveRoute(item.path)
                    ? theme.palette.primary.contrastText
                    : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: isActiveRoute(item.path)
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                    }}
                  >
                    {item.text}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      {user ? (
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => signOut(auth)}>
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
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/auth")}>
              <ListItemIcon>
                <PersonIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: theme.palette.primary.main }}>
                    Sign In
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column" }}
      pt={6}
      className="app-layout"
    >
      <LandingHeader />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          display: "flex", // Make sidebar and main content side by side
          flexDirection: "row",
        }}
      >
        {!isStudentRoute && isDashboardRoute && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "calc(100vh - 64px)",
            backgroundColor: theme.palette.background.default,
            // pt: { xs: 1, sm: 3 },
            ml: !isStudentRoute && isDashboardRoute ? "240px" : 0, // Add margin-left if sidebar is shown
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
