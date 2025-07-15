import React, { useState } from "react";
import {
  Box,
  Drawer,
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
import { useTheme as useAppTheme } from "../../theme/ThemeContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Header from "./Header";

const drawerWidth = 320;

const AppLayout = ({ children }) => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    if (window.innerWidth < 600) {
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
        backgroundColor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          {userData?.isAdmin
            ? "Admin Dashboard"
            : user
            ? "Dashboard"
            : "Online Teaching"}
        </Typography>
        {userData && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
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
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActiveRoute(item.path)
                    ? "primary.contrastText"
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
                        ? "primary.contrastText"
                        : "text.primary",
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
                <ExitToAppIcon sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: "error.main" }}>Logout</Typography>
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
                <PersonIcon sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: "primary.main" }}>
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
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Unified Header - Full Width */}
      <Header drawerWidth={drawerWidth} onDrawerToggle={handleDrawerToggle} />

      {/* Content Area with Sidebar and Main Content */}
      <Box sx={{ display: "flex", mt: { xs: 7, sm: 8 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: `1px solid`,
              borderColor: "divider",
              backgroundColor: "background.default",
              top: { xs: 56, sm: 64 }, // Position below header
              height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: `1px solid`,
              borderColor: "divider",
              backgroundColor: "background.default",
              top: { xs: 56, sm: 64 }, // Position below header
              height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            minHeight: "calc(100vh - 64px)", // Subtract header height
            backgroundColor: "background.default",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
