import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../../contexts/UserContext";

import {
  Dashboard as DashboardIconMui,
  School as SchoolIconMui,
  People as PeopleIconMui,
  Settings as SettingsIconMui,
  Assignment as AssignmentIconMui,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import Sidebar from "./Sidebar";
import Header from "./Header";

const drawerWidth = 280;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: `${drawerWidth}px`,
    }),
    height: "100vh",
    overflow: "auto",
  })
);

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const menuItems = [
  { text: "Dashboard", icon: <DashboardIconMui />, path: "/dashboard" },
  { text: "Courses", icon: <SchoolIconMui />, path: "/courses" },
  { text: "Students", icon: <PeopleIconMui />, path: "/students" },
  { text: "Enrollments", icon: <AssignmentIconMui />, path: "/enrollments" },
  { text: "Analytics", icon: <AnalyticsIcon />, path: "/analytics" },
  { text: "Settings", icon: <SettingsIconMui />, path: "/settings" },
];

const MotionListItem = motion.create(ListItem);

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, logout } = useUser();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const isAdmin = userData?.isAdmin || false;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfile = () => {
    handleUserMenuClose();
    navigate("/profile");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header
        onMenuClick={handleDrawerToggle}
        isAdmin={isAdmin}
        drawerWidth={drawerWidth}
      />
      {isAdmin && (
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : theme.palette.background.paper,
            },
          }}
        >
          <Sidebar />
        </Drawer>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: isAdmin ? `calc(100% - ${drawerWidth}px)` : "100%" },
          ml: { md: isAdmin ? `${drawerWidth}px` : 0 },
          mt: "64px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
