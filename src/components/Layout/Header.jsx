import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ExitToApp as ExitToAppIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme as useAppTheme } from "../../theme/ThemeContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const Header = ({
  drawerWidth = 320,
  onDrawerToggle,
  title,
  showMenuButton = true,
  showUserMenu = true,
  showThemeToggle = true,
  customActions = null,
}) => {
  const theme = useTheme();
  const { toggleTheme } = useAppTheme();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState(null);
  // Remove any notification system if present

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // Remove any notification system if present

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
      handleUserMenuClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
    handleUserMenuClose();
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    handleUserMenuClose();
  };

  // Get current page title
  const getCurrentTitle = () => {
    if (title) return title;

    const menuItems = userData?.isAdmin
      ? [
          { text: "Dashboard", path: "/dashboard" },
          { text: "Content Management", path: "/management" },
          { text: "Students", path: "/students" },
          { text: "Analytics", path: "/analytics" },
          { text: "Settings", path: "/settings" },
        ]
      : user
      ? [
          { text: "Dashboard", path: "/dashboard" },
          { text: "Courses", path: "/courses" },
          { text: "Profile", path: "/profile" },
          { text: "Settings", path: "/settings" },
        ]
      : [
          { text: "Courses", path: "/courses" },
          { text: "About", path: "/about" },
          { text: "Contact", path: "/contact" },
        ];

    return (
      menuItems.find((item) => location.pathname === item.path)?.text ||
      "Dashboard"
    );
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Mobile Menu Button */}
        {showMenuButton && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              color: theme.palette.text.primary,
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Page Title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            color: theme.palette.text.primary,
            fontWeight: 600,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          {getCurrentTitle()}
        </Typography>

        {/* Custom Actions */}
        {customActions && (
          <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
            {customActions}
          </Box>
        )}

        {/* Theme Toggle */}
        {showThemeToggle && (
          <Tooltip
            title={`Switch to ${
              theme.palette.mode === "dark" ? "light" : "dark"
            } mode`}
          >
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
          </Tooltip>
        )}

        {/* User Menu */}
        {showUserMenu && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      color: theme.palette.text.primary,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    {userData?.photoURL ? (
                      <Avatar
                        src={userData.photoURL}
                        alt={userData.displayName || user.email}
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: theme.palette.primary.main,
                        }}
                      >
                        {userData?.displayName?.[0] ||
                          user.email?.[0]?.toUpperCase()}
                      </Avatar>
                    )}
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      boxShadow: theme.shadows[8],
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {userData?.displayName || "User"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {userData?.email || user.email}
                    </Typography>
                    {userData?.isAdmin && (
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.primary.main }}
                      >
                        Administrator
                      </Typography>
                    )}
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleProfileClick}>
                    <AccountCircleIcon sx={{ mr: 2, fontSize: 20 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleSettingsClick}>
                    <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
                    Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <ExitToAppIcon sx={{ mr: 2, fontSize: 20 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Tooltip title="Sign in">
                <IconButton
                  onClick={() => navigate("/auth")}
                  sx={{
                    color: theme.palette.text.primary,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <PersonIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
