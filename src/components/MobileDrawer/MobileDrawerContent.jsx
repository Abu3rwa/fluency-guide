import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Fade,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Translate as LanguageIcon,
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useRTL, getRTLIconClass, getDirectionalTextAlign } from "../../utils/rtlUtils";
import ThemeToggle from "../Layout/ThemeToggle";
import LanguageSwitcher from "../Layout/LanguageSwitcher";

// Constants for better maintainability
const DRAWER_WIDTH = 280;
const SECTION_DIVIDER_ITEMS = new Set([
  "Students", "Payments", "Analytics", "Assignments", "Progress", "Messages", "Profile"
]);

/**
 * MobileDrawerContent - Main content sections of the mobile drawer
 * Contains user profile, navigation menu, settings, and authentication
 */
const MobileDrawerContent = ({
  open,
  menuItems = [],
  theme,
  handleNavigation,
  isActiveRoute,
  handleLogout,
  handleSignIn,
  isLoggingOut,
  logoutError,
  setLogoutError,
  displayName,
  dashboardTitle,
}) => {
  const { t } = useTranslation();
  const { user, userData } = useAuth();
  const isRTL = useRTL();

  return (
    <Box
      id="mobile-drawer-description"
      sx={{
        width: DRAWER_WIDTH,
        backgroundColor: theme.palette.background.paper,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {/* User profile section */}
      <Fade in={open} timeout={300}>
        <Box sx={{ p: theme.spacing(2.5) }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, direction: isRTL ? "rtl" : "ltr" }}>
            {userData?.isAdmin ? (
              <SecurityIcon sx={{ color: theme.palette.warning.main, fontSize: 24 }} />
            ) : user ? (
              <AccountIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
            ) : (
              <PersonIcon sx={{ color: theme.palette.text.secondary, fontSize: 24 }} />
            )}
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600, fontSize: "1rem" }}>
              {dashboardTitle}
            </Typography>
          </Box>
          {userData ? (
            <Box sx={{ pl: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                  mb: 0.5,
                  wordBreak: "break-word",
                  textAlign: getDirectionalTextAlign(isRTL),
                  direction: isRTL ? "rtl" : "ltr",
                }}
              >
                {displayName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                  wordBreak: "break-word",
                }}
              >
                {userData.email}
              </Typography>
              {userData.isAdmin && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: theme.palette.warning.main,
                    fontWeight: 500,
                    mt: 0.5,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                  }}
                >
                  {t('user.adminRole', 'Administrator')}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontStyle: "italic",
                pl: 0.5,
              }}
            >
              {t('auth.signInToAccess', 'Sign in to access features')}
            </Typography>
          )}
        </Box>
      </Fade>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation menu */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1 }}>
        <List sx={{ py: 1 }}>
          {(menuItems || []).length > 0 ? (
            menuItems.map((item, index) => {
              const isActive = isActiveRoute(item.path);
              const showDivider = SECTION_DIVIDER_ITEMS.has(item.text);
              
              return (
                <React.Fragment key={`${item.text}-${index}`}>
                  {showDivider && <Divider sx={{ my: 1, mx: 1 }} />}
                  
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip title={item.description || item.text} placement="right">
                      <ListItemButton
                        onClick={() => handleNavigation(item.path)}
                        selected={isActive}
                        disabled={!item.path}
                        sx={{
                          borderRadius: 2,
                          mx: 1,
                          transition: "all 0.2s ease-in-out",
                          "&.Mui-selected": {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            "&:hover": { backgroundColor: theme.palette.primary.dark },
                            boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
                          },
                          "&:hover": {
                            backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.action.hover,
                            transform: "translateX(4px)",
                          },
                          "&.Mui-disabled": { opacity: 0.6 },
                          py: 1.5,
                          px: 2,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                            minWidth: 40,
                            transition: "color 0.2s ease-in-out",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          sx={{ margin: 0 }}
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
                                fontWeight: isActive ? 600 : 500,
                                fontSize: "0.875rem",
                                transition: "color 0.2s ease-in-out",
                              }}
                            >
                              {item.text}
                            </Typography>
                          }
                          secondary={
                            item.description && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: isActive ? `${theme.palette.primary.contrastText}CC` : theme.palette.text.secondary,
                                  fontSize: "0.7rem",
                                  lineHeight: 1.2,
                                  mt: 0.25,
                                  display: "block",
                                  transition: "color 0.2s ease-in-out",
                                }}
                              >
                                {item.description}
                              </Typography>
                            )
                          }
                        />
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                </React.Fragment>
              );
            })
          ) : (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {t('navigation.noMenuItems', 'No menu items available')}
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Settings section */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: "auto" }}>
        {logoutError && (
          <Alert severity="error" sx={{ m: 2, mb: 1 }} onClose={() => setLogoutError(null)}>
            {logoutError}
          </Alert>
        )}
        
        <List sx={{ py: 1 }}>
          <ListItem disablePadding sx={{ px: 1 }}>
            <ListItemButton sx={{ borderRadius: 2, mx: 1, py: 1.5, "&:hover": { backgroundColor: theme.palette.action.hover } }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LanguageIcon 
                  sx={{ color: theme.palette.text.secondary }}
                  className={getRTLIconClass(false)}
                />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      textAlign: getDirectionalTextAlign(isRTL),
                    }}
                  >
                    {t("language.changeLanguage", "Language")}
                  </Typography>
                } 
              />
              <LanguageSwitcher variant="flag" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ px: 1 }}>
            <ListItemButton sx={{ borderRadius: 2, mx: 1, py: 1.5, "&:hover": { backgroundColor: theme.palette.action.hover } }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box sx={{ width: 24, height: 24 }} />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      textAlign: getDirectionalTextAlign(isRTL),
                    }}
                  >
                    {t("header.toggleTheme", "Theme")}
                  </Typography>
                } 
              />
              <ThemeToggle ariaLabel={t("header.toggleTheme", "Toggle theme")} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Authentication section */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        <List sx={{ py: 1 }}>
          {userData ? (
            <ListItem disablePadding sx={{ px: 1 }}>
              <Tooltip title={t('auth.logout', 'Sign out of your account')}>
                <ListItemButton
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    py: 1.5,
                    "&:hover": { backgroundColor: `${theme.palette.error.main}10` },
                    "&.Mui-disabled": { opacity: 0.6 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ExitToAppIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: 20,
                        transform: isRTL ? 'scaleX(-1)' : 'none'
                      }}
                      className={getRTLIconClass(true)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.error.main, 
                          fontWeight: 500,
                          textAlign: getDirectionalTextAlign(isRTL),
                        }}
                      >
                        {isLoggingOut ? t('auth.loggingOut', 'Signing out...') : t('auth.logout', 'Logout')}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ) : (
            <ListItem disablePadding sx={{ px: 1 }}>
              <Tooltip title={t('auth.signInPrompt', 'Sign in to access your account')}>
                <ListItemButton
                  onClick={handleSignIn}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    py: 1.5,
                    "&:hover": { backgroundColor: `${theme.palette.primary.main}10` },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                        {t('auth.signIn', 'Sign In')}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default MobileDrawerContent;