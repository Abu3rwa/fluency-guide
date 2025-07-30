import React, { useState, useEffect } from "react";
import logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../routes/constants";
import { useCustomTheme } from "../../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Typography,
  Container,
  Fade,
} from "@mui/material";
import { Menu as MenuIcon, Login as LoginIcon } from "@mui/icons-material";

const Header = ({
  onDrawerToggle,
  showDrawerButton = false,
  title,
  showUserMenu = true,
  showThemeToggle = true,
  customActions = null,
  menuItems = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isLoggedIn = user || userData;

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

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

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: "100%",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: -1,
          ...(theme.palette.mode === "dark" && {
            backgroundColor: "rgba(18, 18, 18, 0.8)",
          }),
        },
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64, md: 72 },
            px: { xs: 1, sm: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1, sm: 2 },
          }}
        >
          {/* Left Section: Drawer button on mobile, logo on desktop */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              minWidth: "fit-content",
            }}
          >
            {showDrawerButton ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.5, sm: 1 },
                }}
              >
                <IconButton
                  color="inherit"
                  aria-label={t("header.openDrawer")}
                  edge="start"
                  onClick={onDrawerToggle}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  <MenuIcon
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
                onClick={() => navigate(ROUTES.LANDING)}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: isMobile ? 36 : 42,
                    width: isMobile ? 36 : 42,
                    marginRight: theme.spacing(1),
                    borderRadius: "6px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  }}
                />
                {!isMobile && title && (
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: { sm: "1rem", md: "1.1rem" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Center Section: Navigation */}
          <Box
            component="nav"
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mx: { xs: 0.5, sm: 1, md: 2 },
              overflow: "hidden",
            }}
          >
            {/* Desktop: Show Menu Items */}
            {!showDrawerButton && menuItems.length > 0 && (
              <Stack
                direction="row"
                spacing={{ xs: 0.5, sm: 1, md: 2 }}
                component="ul"
                sx={{
                  listStyle: "none",
                  m: 0,
                  p: 0,
                  alignItems: "center",
                  flexWrap: "nowrap",
                  overflow: "hidden",
                }}
              >
                {menuItems.map((item, index) => (
                  <Box component="li" key={item.text}>
                    <Button
                      variant="text"
                      color="inherit"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
                        color: theme.palette.text.primary,
                        fontFamily: theme.typography.body1.fontFamily,
                        px: { xs: 0.5, sm: 1, md: 1 },
                        py: 0.5,
                        borderRadius: 2,
                        textTransform: "none",
                        minWidth: "auto",
                        whiteSpace: "nowrap",
                        position: "relative",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                      onClick={() => navigate(item.path)}
                    >
                      {item.text}
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Mobile: Show Centered Title if no drawer button */}
            {!showDrawerButton && isMobile && title && (
              <Typography
                variant="h6"
                component="h1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: "1rem",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </Typography>
            )}
            {/* Mobile: Show Centered Logo if drawer button is present */}
            {showDrawerButton && isMobile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
                onClick={() => navigate(ROUTES.LANDING)}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: 32,
                    width: 32,
                    borderRadius: "6px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Right Section: Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.25, sm: 0.5, md: 1 },
              flexShrink: 0,
              minWidth: "fit-content",
            }}
          >
            {/* Custom Actions */}
            {customActions && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {customActions}
              </Box>
            )}

            {/* Theme Toggle */}
            {showThemeToggle && (
              <ThemeToggle ariaLabel={t("header.toggleTheme")} />
            )}

            {/* Language Switcher */}
            {!isMobile && (
              <LanguageSwitcher ariaLabel={t("language.changeLanguage")} />
            )}

            {/* User Menu or Login Button */}
            {isLoggedIn ? (
              <UserMenu
                userMenuAnchor={userMenuAnchor}
                handleUserMenuClick={handleUserMenuClick}
                handleUserMenuClose={handleUserMenuClose}
                handleLogout={handleLogout}
                isAdmin={userData?.isAdmin}
                currentUser={user || userData}
                t={t}
                navigate={navigate}
              />
            ) : (
              <>
                {/* Mobile Login Icon */}
                <IconButton
                  color="primary"
                  onClick={() => navigate(ROUTES.AUTH)}
                  size="small"
                  sx={{
                    display: { xs: "flex", sm: "none" },
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    width: 36,
                    height: 36,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    transition: "all 0.2s",
                  }}
                  aria-label={t("auth.login")}
                >
                  <LoginIcon sx={{ fontSize: "1rem" }} />
                </IconButton>

                {/* Desktop Login Button */}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate(ROUTES.AUTH)}
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    fontFamily: theme.typography.button.fontFamily,
                    fontWeight: 600,
                    fontSize: { sm: "0.8rem", md: "0.875rem" },
                    px: { sm: 1.5, md: 2 },
                    py: 0.75,
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: theme.shadows[2],
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  {t("auth.login")}
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
