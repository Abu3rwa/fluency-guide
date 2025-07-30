import React from "react";
import {
  Drawer,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  GlobalStyles,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import LanguageSwitcher from "../Layout/LanguageSwitcher";

const MobileDrawer = ({ open, onClose, menuItems = [], theme }) => {
  const { i18n, t } = useTranslation();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Set anchor based on language direction
  const anchor = i18n.dir && i18n.dir() === "rtl" ? "right" : "left";

  return (
    <Drawer
      variant="temporary"
      anchor={anchor}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      // e
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: 240, // Standardized width
          backgroundColor: theme.palette.background.paper,
          borderRight:
            anchor === "left"
              ? `1px solid ${theme.palette.divider}`
              : undefined,
          borderLeft:
            anchor === "right"
              ? `1px solid ${theme.palette.divider}`
              : undefined,
          top: 0,
          height: "100vh",
          zIndex: 1300,
          borderRadius: anchor === "left" ? "0 8px 8px 0" : "8px 0 0 8px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <GlobalStyles
        styles={{
          "*::-webkit-scrollbar": {
            width: "8px",
          },
          "*::-webkit-scrollbar-track": {
            backgroundColor: theme.palette.background.paper,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.primary.main,
            borderRadius: "4px",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton onClick={onClose} aria-label="Close drawer">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          width: 240,
          backgroundColor: theme.palette.background.paper,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: theme.spacing(2) }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              {userData?.isAdmin
                ? "Admin Dashboard"
                : user
                ? "Student Dashboard"
                : "Online Teaching"}
            </Typography>
          </Box>
          {userData && (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                {userData.displayName || userData.name || "User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                }}
              >
                {userData.email}
              </Typography>
            </Box>
          )}
        </Box>
        <Divider />
        <List>
          {(menuItems || []).map((item, index) => (
            <React.Fragment key={item.text}>
              {(item.text === "Students" ||
                item.text === "Payments" ||
                item.text === "Analytics" ||
                item.text === "Assignments" ||
                item.text === "Progress" ||
                item.text === "Messages" ||
                item.text === "Profile") && <Divider sx={{ my: 1 }} />}

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActiveRoute(item.path)}
                  sx={{
                    transition: "background-color 0.3s ease-in-out",
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.dark,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.main,
                      },
                    },
                    py: 1.5,
                    px: 2,
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActiveRoute(item.path)
                        ? theme.palette.primary.contrastText
                        : "inherit",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    sx={{
                      px: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: isActiveRoute(item.path)
                            ? theme.palette.primary.contrastText
                            : theme.palette.text.primary,
                          fontWeight: isActiveRoute(item.path) ? 600 : 400,
                        }}
                      >
                        {item.text}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: isActiveRoute(item.path)
                            ? theme.palette.primary.contrastText
                            : theme.palette.text.secondary,
                          fontSize: "0.7rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary={t("language.changeLanguage")} />
            <LanguageSwitcher />
          </ListItemButton>
        </ListItem>

        {userData ? (
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => signOut(auth)}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ExitToAppIcon sx={{ color: theme.palette.error.main }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ color: theme.palette.error.main }}>
                      Logout
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          </List>
        ) : (
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/auth")}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PersonIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ color: theme.palette.primary.main }}>
                      Sign In
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;
