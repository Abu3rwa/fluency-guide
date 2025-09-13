import React from "react";
import {
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../routes/constants";

const UserMenu = ({
  userMenuAnchor,
  handleUserMenuClick,
  handleUserMenuClose,
  handleLogout,
  isAdmin,
  currentUser,
  languageIconColor,
  t,
  navigate,
}) => {
  if (!currentUser) {
    return (
      <div style={{ color: "red", fontWeight: 600 }}>
        UserMenu: No user data
      </div>
    );
  }
  
  const avatarLetter = currentUser?.email?.[0]?.toUpperCase() || "";
  
  // Check if user is instructor (either via isInstructor flag or role)
  const isInstructor = currentUser?.isInstructor || currentUser?.role === 'instructor';
  
  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: { xs: 0.5, sm: 1 },
          alignItems: "center",
        }}
      >
        <IconButton
          size="small"
          onClick={handleUserMenuClick}
          sx={{
            color: languageIconColor,
            p: { xs: 0.5, sm: 1 },
            "&:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
            {avatarLetter}
          </Avatar>
        </IconButton>
      </Box>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        {isAdmin && (
          <MenuItem
            component={RouterLink}
            to={ROUTES.DASHBOARD}
            onClick={handleUserMenuClose}
          >
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("navigation.dashboard")}</ListItemText>
          </MenuItem>
        )}
        
        {/* Session Management for Admin */}
        {isAdmin && (
          <>
            <MenuItem
              onClick={() => {
                navigate(ROUTES.ADMIN_SESSION_DASHBOARD);
                handleUserMenuClose();
              }}
            >
              <ListItemIcon>
                <CalendarIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("navigation.sessionManagement", "Session Management")}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(ROUTES.ADMIN_INSTRUCTOR_MANAGEMENT);
                handleUserMenuClose();
              }}
            >
              <ListItemIcon>
                <SchoolIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("navigation.instructorManagement", "Instructor Management")}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(ROUTES.ADMIN_TERMS_MANAGEMENT);
                handleUserMenuClose();
              }}
            >
              <ListItemIcon>
                <ArticleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("navigation.termsManagement", "Terms Management")}</ListItemText>
            </MenuItem>
          </>
        )}
        
        {/* Instructor Dashboard */}
        {isInstructor && (
          <MenuItem
            onClick={() => {
              navigate(ROUTES.INSTRUCTOR_DASHBOARD);
              handleUserMenuClose();
            }}
          >
            <ListItemIcon>
              <SchoolIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("navigation.instructorDashboard", "Instructor Dashboard")}</ListItemText>
          </MenuItem>
        )}
        
        {/* Instructor Profile */}
        {isInstructor && (
          <MenuItem
            onClick={() => {
              navigate(ROUTES.INSTRUCTOR_PROFILE);
              handleUserMenuClose();
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("navigation.instructorProfile", "Instructor Profile")}</ListItemText>
          </MenuItem>
        )}
        
        {/* Student Dashboard */}
        <MenuItem
          onClick={() => {
            navigate(`/student/dashboard/${currentUser.uid}`);
            handleUserMenuClose();
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("navigation.studentDashboard", "Student Dashboard")}</ListItemText>
        </MenuItem>
        
        <Divider />
        
        {/* Logout */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("auth.logout")}</ListItemText>
        </MenuItem>
        
      </Menu>
    </>
  );
};

export default UserMenu;
