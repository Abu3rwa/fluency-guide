import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../routes/constants";
import { useCustomTheme } from "../../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import LanguageMenu from "./LanguageMenu";
import UserMenu from "./UserMenu";
import { Box, Button, useTheme, useMediaQuery, Stack } from "@mui/material";

const LandingHeader = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { currentUser, logout, isAdmin } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isRTL = i18n.language === "ar";

  // State for menus
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Handlers for language menu
  const handleLanguageClick = (event) => setLanguageAnchor(event.currentTarget);
  const handleLanguageClose = () => setLanguageAnchor(null);
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    handleLanguageClose();
  };

  // Handlers for user menu
  const handleUserMenuClick = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LANDING);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    handleUserMenuClose();
  };

  const languageIconColor =
    theme.palette.mode === "dark" ? "white" : theme.palette.grey[900];

  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        bgcolor: theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        boxShadow: theme.shadows[1],
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: { xs: 56, sm: 64 },
        px: { xs: 0, sm: 0 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 3 },
        }}
      >
        {/* Logo and App Name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            textDecoration: "none",
          }}
          onClick={() => navigate(ROUTES.LANDING)}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: isMobile ? 32 : 40,
              width: isMobile ? 32 : 40,
              marginRight: 8,
            }}
          />
        </Box>
        {/* Navigation */}
        <Box
          component="nav"
          sx={{
            flex: 1,
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 3 }}
            component="ul"
            sx={{ listStyle: "none", m: 0, p: 0 }}
          >
            <Box component="li">
              <Button
                variant="text"
                color="inherit"
                sx={{
                  fontWeight: 500,
                  fontSize: "1rem",
                  color: theme.palette.text.primary,
                }}
                onClick={() => navigate(ROUTES.LANDING)}
              >
                {t("navigation.home")}
              </Button>
            </Box>
            <Box component="li">
              <Button
                variant="text"
                color="inherit"
                sx={{
                  fontWeight: 500,
                  fontSize: "1rem",
                  color: theme.palette.text.primary,
                }}
                onClick={() => navigate(ROUTES.COURSES)}
              >
                {t("navigation.courses")}
              </Button>
            </Box>
            <Box component="li">
              <Button
                variant="text"
                color="inherit"
                sx={{
                  fontWeight: 500,
                  fontSize: "1rem",
                  color: theme.palette.text.primary,
                }}
                onClick={() => navigate(ROUTES.PRICING)}
              >
                {t("navigation.pricing")}
              </Button>
            </Box>
            <Box component="li">
              <Button
                variant="text"
                color="inherit"
                sx={{
                  fontWeight: 500,
                  fontSize: "1rem",
                  color: theme.palette.text.primary,
                }}
                onClick={() => navigate(ROUTES.CONTACT)}
              >
                {t("navigation.contact")}
              </Button>
            </Box>
          </Stack>
        </Box>
        {/* Actions */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}
        >
          <ThemeToggle mode={mode} toggleTheme={toggleTheme} />
          <LanguageMenu
            languageAnchor={languageAnchor}
            handleLanguageClick={handleLanguageClick}
            handleLanguageClose={handleLanguageClose}
            handleLanguageChange={handleLanguageChange}
            languageIconColor={languageIconColor}
            t={t}
          />
          {currentUser ? (
            <UserMenu
              userMenuAnchor={userMenuAnchor}
              handleUserMenuClick={handleUserMenuClick}
              handleUserMenuClose={handleUserMenuClose}
              handleLogout={handleLogout}
              isAdmin={isAdmin}
              currentUser={currentUser}
              languageIconColor={languageIconColor}
              t={t}
              navigate={navigate}
            />
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(ROUTES.AUTH)}
            >
              {t("auth.login")}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LandingHeader;
