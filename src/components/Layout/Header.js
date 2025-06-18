import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ThemeToggle";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const Header = ({ onMenuClick, isAdmin, drawerWidth }) => {
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleProfile = () => {
    handleUserMenuClose();
    navigate("/profile");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigation = (path) => {
    handleUserMenuClose();
    navigate(path);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: isAdmin ? `calc(100% - ${drawerWidth}px)` : "100%" },
        ml: { md: isAdmin ? `${drawerWidth}px` : 0 },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)"
            : "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
        backdropFilter: "blur(10px)",
        boxShadow: (theme) =>
          theme.palette.mode === "dark" ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
        borderBottom: (theme) =>
          theme.palette.mode === "dark"
            ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
            : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.common.white
            : theme.palette.text.primary,
      }}
    >
      <Toolbar>
        {isAdmin && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 2,
              display: { md: "none" },
              color: "inherit",
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ThemeToggle />
          <LanguageSwitcher />
          <IconButton
            color="inherit"
            onClick={handleUserMenuOpen}
            sx={{
              ml: 1,
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              {user?.email?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchorEl}
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <MenuItem onClick={handleProfile}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            {isAdmin && (
              <MenuItem onClick={() => handleNavigation("/dashboard")}>
                <DashboardIcon sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
