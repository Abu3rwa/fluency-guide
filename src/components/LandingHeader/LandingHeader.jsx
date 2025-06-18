import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  alpha,
  Container,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Translate as TranslateIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle as AccountIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../routes/constants";
import { Link as RouterLink } from "react-router-dom";
import { useTheme as useAppTheme } from "../../theme/ThemeContext";

const LandingHeader = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { currentUser, userData, logout } = useAuth();
  const { toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isRTL = i18n.language === "ar";

  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleLanguageClick = (event) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    handleLanguageClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LANDING);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    handleUserMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: (theme) => alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(10px)",
        boxShadow: (theme) =>
          `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        width: "100%",
        left: 0,
        right: 0,
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 1, sm: 2 },
          minHeight: { xs: "56px", sm: "64px" },
          width: "100%",
          maxWidth: "100vw",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            minWidth: 0,
          }}
          onClick={() => navigate(ROUTES.LANDING)}
        >
          <SchoolIcon
            sx={{
              color: "primary.main",
              fontSize: { xs: "1.25rem", sm: "2rem" },
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.875rem", sm: "1.25rem" },
              background: (theme) =>
                `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t("common.appName")}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Theme Toggle */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.25, sm: 1 },
            alignItems: "center",
            mr: { xs: 0.25, sm: 1 },
          }}
        >
          <IconButton
            size="small"
            onClick={toggleTheme}
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark"
                  ? "white"
                  : theme.palette.grey[900],
              p: { xs: 0.25, sm: 1 },
              "&:hover": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            {theme.palette.mode === "dark" ? (
              <LightModeIcon
                sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }}
              />
            ) : (
              <DarkModeIcon sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }} />
            )}
          </IconButton>
        </Box>

        {/* Language Selector */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.25, sm: 1 },
            alignItems: "center",
          }}
        >
          <IconButton
            size="small"
            onClick={handleLanguageClick}
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark"
                  ? "white"
                  : theme.palette.grey[900],
              p: { xs: 0.25, sm: 1 },
              "&:hover": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <TranslateIcon sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }} />
          </IconButton>
          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={handleLanguageClose}
          >
            <MenuItem onClick={() => handleLanguageChange("en")}>
              {t("language.en")}
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange("ar")}>
              {t("language.ar")}
            </MenuItem>
          </Menu>
        </Box>

        {/* User Menu */}
        {currentUser ? (
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
                  color: (theme) =>
                    theme.palette.mode === "dark"
                      ? "white"
                      : theme.palette.grey[900],
                  p: { xs: 0.5, sm: 1 },
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                  }}
                >
                  {currentUser.email?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
            >
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
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t("auth.logout")}</ListItemText>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(ROUTES.AUTH)}
          >
            {t("auth.login")}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default LandingHeader;
