import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Tooltip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Book as BookIcon,
  EmojiEvents as EmojiEventsIcon,
  School as SchoolIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { useTheme } from "@mui/material/styles";

// Import constants from parent directory
import { QUICK_ACTIONS } from "../constants/dashboardConstants";

const StudentQuickActions = ({
  onEditProfile,
  pinnedActions = [],
  onPinAction,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useUser();
  const theme = useTheme();
  const isRTL = i18n.language === 'ar';

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  // Memoized actions array using constants
  const actions = useMemo(() => [
    {
      ...QUICK_ACTIONS.EDIT_PROFILE,
      name: t(QUICK_ACTIONS.EDIT_PROFILE.name),
      tooltip: t(QUICK_ACTIONS.EDIT_PROFILE.tooltip),
      ariaLabel: t(QUICK_ACTIONS.EDIT_PROFILE.ariaLabel),
      icon: <AccountCircleIcon />,
      onClick: onEditProfile,
    },
    {
      ...QUICK_ACTIONS.SETTINGS,
      name: t(QUICK_ACTIONS.SETTINGS.name),
      tooltip: t(QUICK_ACTIONS.SETTINGS.tooltip),
      ariaLabel: t(QUICK_ACTIONS.SETTINGS.ariaLabel),
      icon: <SettingsIcon />,
      onClick: () => navigate(QUICK_ACTIONS.SETTINGS.route),
    },
    {
      ...QUICK_ACTIONS.MY_COURSES,
      name: t(QUICK_ACTIONS.MY_COURSES.name),
      tooltip: t(QUICK_ACTIONS.MY_COURSES.tooltip),
      ariaLabel: t(QUICK_ACTIONS.MY_COURSES.ariaLabel),
      icon: <SchoolIcon />,
      onClick: () => navigate(QUICK_ACTIONS.MY_COURSES.route),
    },
    {
      ...QUICK_ACTIONS.MY_ACHIEVEMENTS,
      name: t(QUICK_ACTIONS.MY_ACHIEVEMENTS.name),
      tooltip: t(QUICK_ACTIONS.MY_ACHIEVEMENTS.tooltip),
      ariaLabel: t(QUICK_ACTIONS.MY_ACHIEVEMENTS.ariaLabel),
      icon: <EmojiEventsIcon />,
      onClick: () => navigate(QUICK_ACTIONS.MY_ACHIEVEMENTS.route),
    },
    {
      ...QUICK_ACTIONS.MY_VOCABULARY,
      name: t(QUICK_ACTIONS.MY_VOCABULARY.name),
      tooltip: t(QUICK_ACTIONS.MY_VOCABULARY.tooltip),
      ariaLabel: t(QUICK_ACTIONS.MY_VOCABULARY.ariaLabel),
      icon: <BookIcon />,
      onClick: () => navigate(QUICK_ACTIONS.MY_VOCABULARY.route),
    },
    {
      ...QUICK_ACTIONS.LOGOUT,
      name: t(QUICK_ACTIONS.LOGOUT.name),
      tooltip: t(QUICK_ACTIONS.LOGOUT.tooltip),
      ariaLabel: t(QUICK_ACTIONS.LOGOUT.ariaLabel),
      icon: <ExitToAppIcon />,
      onClick: handleLogout,
    },
  ], [onEditProfile, navigate, handleLogout, t]);

  // Memoized sorted actions - pinned actions first
  const sortedActions = useMemo(() => [
    ...actions.filter((a) => pinnedActions.includes(a.key)),
    ...actions.filter((a) => !pinnedActions.includes(a.key)),
  ], [actions, pinnedActions]);

  const getButtonStyles = (action) => ({
    textAlign: isRTL ? 'right' : 'left',
    justifyContent: 'flex-start',
    px: 2,
    py: 1.5,
    minHeight: 56, // Enhanced touch target for mobile
    borderRadius: 2,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[4],
    },
  });

  return (
    <Card 
      elevation={2} 
      sx={{ 
        mb: 3,
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ 
            color: theme.palette.text.primary,
            mb: 2,
            fontWeight: 600,
          }}
        >
          {t('student.dashboard.quickActions.title')}
        </Typography>
        
        <Divider sx={{ mb: 3, bgcolor: theme.palette.divider }} />
        
        <Grid container spacing={2}>
          {sortedActions.map((action) => (
            <Grid item xs={12} sm={6} md={4} key={action.key}>
              <Tooltip title={action.tooltip} arrow placement="top">
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  direction: isRTL ? 'rtl' : 'ltr',
                  width: '100%',
                  gap: 1,
                }}>
                  <Button
                    fullWidth
                    variant={action.color === "error" ? "contained" : "outlined"}
                    color={action.color || "primary"}
                    startIcon={!isRTL ? action.icon : undefined}
                    endIcon={isRTL ? action.icon : undefined}
                    onClick={action.onClick}
                    aria-label={action.ariaLabel}
                    sx={getButtonStyles(action)}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        flex: 1,
                        textAlign: isRTL ? 'right' : 'left',
                        marginLeft: !isRTL && action.icon ? 1 : 0,
                        marginRight: isRTL && action.icon ? 1 : 0,
                        fontWeight: 500,
                      }}
                    >
                      {action.name}
                    </Box>
                  </Button>
                  
                  {onPinAction && (
                    <Tooltip
                      title={
                        pinnedActions.includes(action.key)
                          ? t('student.dashboard.quickActions.unpinFromFavorites')
                          : t('student.dashboard.quickActions.pinToFavorites')
                      }
                      arrow
                      placement="top"
                    >
                      <IconButton
                        onClick={() => onPinAction(action.key)}
                        aria-label={
                          pinnedActions.includes(action.key)
                            ? t('student.dashboard.quickActions.unpinAction', { action: action.name })
                            : t('student.dashboard.quickActions.pinAction', { action: action.name })
                        }
                        sx={{ 
                          ml: isRTL ? 0 : 1,
                          mr: isRTL ? 1 : 0,
                          minWidth: 48,
                          minHeight: 48,
                          borderRadius: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: pinnedActions.includes(action.key) 
                              ? theme.palette.warning.light 
                              : theme.palette.grey[100],
                            transform: 'scale(1.1)',
                          },
                        }}
                        color={pinnedActions.includes(action.key) ? "warning" : "default"}
                      >
                        {pinnedActions.includes(action.key) ? (
                          <StarIcon />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats */}
        <Box sx={{ 
          mt: 3, 
          pt: 2, 
          borderTop: `1px solid ${theme.palette.grey[200]}`,
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center',
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('student.dashboard.quickActions.pinnedActions')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {pinnedActions.length}/{actions.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('student.dashboard.quickActions.totalActions')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {actions.length}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudentQuickActions;