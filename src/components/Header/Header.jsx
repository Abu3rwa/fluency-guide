import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  useTheme,
  useScrollTrigger,
  Toolbar,
  useMediaQuery,
  Badge,
} from "@mui/material";
import {
  School as SchoolIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  Person as PersonIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { getAuth } from "firebase/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const auth = getAuth();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const db = getDatabase();

  useEffect(() => {
    if (!currentUser) return;

    // Listen for unread messages
    const unreadRef = ref(db, "chats");
    const unsubscribe = onValue(unreadRef, (snapshot) => {
      let totalUnread = 0;
      snapshot.forEach((chatSnapshot) => {
        const chat = chatSnapshot.val();
        if (
          chat.participants?.[currentUser.uid] &&
          chat.unreadCount?.[currentUser.uid]
        ) {
          totalUnread += chat.unreadCount[currentUser.uid];
        }
      });
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [currentUser, db]);

  return (
    <AppBar
      position="fixed"
      className="app-header"
      sx={{
        background: trigger
          ? "rgba(26, 35, 126, 0.98)"
          : "rgba(26, 35, 126, 0.95)",
        boxShadow: trigger ? "0 2px 20px rgba(0, 0, 0, 0.1)" : "none",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container
        className="header-container"
        maxWidth={false}
        sx={{
          width: "100%",
          maxWidth: "100% !important",
          m: 0,
          p: { xs: 1, sm: 2 },
        }}
      >
        <Box
          className="header-content"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: { xs: 60, sm: 70 },
          }}
        >
          {/* Logo */}
          <Box
            className="header-logo"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <SchoolIcon
              className="header-logo-icon"
              sx={{ fontSize: { xs: 28, sm: 32 }, color: "#FFD700" }}
            />
            <Typography
              className="header-logo-text"
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "white",
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                display: { xs: "none", sm: "block" },
              }}
            >
              {t("common.appName")}
            </Typography>
          </Box>

          {/* Navigation Links - Desktop */}
          <Box
            className="header-nav-desktop"
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
            }}
          >
            <Button
              color="inherit"
              component={RouterLink}
              to="/courses"
              sx={{
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {t("navigation.courses")}
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/about"
              sx={{
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {t("navigation.about")}
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/contact"
              sx={{
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {t("navigation.contact")}
            </Button>
          </Box>

          {/* Right Side Actions */}
          <Box
            className="header-actions"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <LanguageSwitcher />
            {auth.currentUser ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/dashboard"
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <MessageIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={logout}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <PersonIcon />
                </IconButton>
              </Box>
            ) : (
              <Box
                className="header-auth-desktop"
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Button
                  className="auth-btn login-btn"
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  {t("auth.login")}
                </Button>
                <Button
                  className="auth-btn signup-btn"
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => navigate("/signup")}
                  sx={{
                    background:
                      "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #008080 30%, #1a237e 90%)",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{
                display: { md: "none" },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Box>
      </Container>

      {/* Mobile Menu */}
      <Box
        className="mobile-menu"
        sx={{
          display: { md: "none" },
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(26, 35, 126, 0.98)",
          zIndex: (theme) => theme.zIndex.drawer,
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            pt: 8,
          }}
        >
          <Button
            color="inherit"
            component={RouterLink}
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {t("navigation.courses")}
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {t("navigation.about")}
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {t("navigation.contact")}
          </Button>

          {!auth.currentUser ? (
            <Box
              className="mobile-auth-buttons"
              sx={{ display: "flex", gap: 1, mt: 1 }}
            >
              <Button
                className="mobile-auth-btn mobile-login-btn"
                variant="outlined"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {t("auth.login")}
              </Button>
              <Button
                className="mobile-auth-btn mobile-signup-btn"
                variant="contained"
                fullWidth
                startIcon={<PersonIcon />}
                onClick={() => {
                  navigate("/signup");
                  setMobileMenuOpen(false);
                }}
                sx={{
                  background:
                    "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #008080 30%, #1a237e 90%)",
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          ) : null}
        </Box>
      </Box>
    </AppBar>
  );
};

export default Header;
