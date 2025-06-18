import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  HowToReg as EnrollmentsIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Courses", icon: <SchoolIcon />, path: "/courses" },
  { text: "Tasks", icon: <AssignmentIcon />, path: "/tasks" },
  { text: "Students", icon: <PeopleIcon />, path: "/students" },
  { text: "Enrollments", icon: <EnrollmentsIcon />, path: "/enrollments" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        height: "100%",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
        backdropFilter: "blur(10px)",
        borderRight: (theme) =>
          `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: 600 }}
        >
          Dashboard
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                background: (theme) => alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  background: (theme) =>
                    alpha(theme.palette.primary.main, 0.15),
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: (theme) =>
                  location.pathname === item.path
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
                color: (theme) =>
                  location.pathname === item.path
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
