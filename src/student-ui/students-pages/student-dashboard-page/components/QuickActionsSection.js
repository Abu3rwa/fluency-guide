import React from "react";
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

const QuickActionsSection = ({
  onEditProfile,
  pinnedActions = [],
  onPinAction,
}) => {
  const navigate = useNavigate();
  const { logout } = useUser();
  const theme = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate("/auth"); // Redirect to auth page after logout
  };

  const actions = [
    {
      key: "editProfile",
      name: "Edit Profile",
      icon: <AccountCircleIcon />,
      onClick: onEditProfile,
      tooltip: "Edit your profile information",
      ariaLabel: "Edit Profile",
    },
    {
      key: "settings",
      name: "Settings",
      icon: <SettingsIcon />,
      onClick: () => navigate("/settings"),
      tooltip: "Go to settings",
      ariaLabel: "Settings",
    },
    {
      key: "myCourses",
      name: "My Courses",
      icon: <SchoolIcon />,
      onClick: () => navigate("/courses"),
      tooltip: "View your enrolled courses",
      ariaLabel: "My Courses",
    },
    {
      key: "myAchievements",
      name: "My Achievements",
      icon: <EmojiEventsIcon />,
      onClick: () => navigate("/achievements"),
      tooltip: "View your achievements",
      ariaLabel: "My Achievements",
    },
    {
      key: "myVocabulary",
      name: "My Vocabulary",
      icon: <BookIcon />,
      onClick: () => navigate("/vocabulary"),
      tooltip: "Review your vocabulary",
      ariaLabel: "My Vocabulary",
    },
    {
      key: "logout",
      name: "Logout",
      icon: <ExitToAppIcon />,
      onClick: handleLogout,
      tooltip: "Sign out of your account",
      ariaLabel: "Logout",
      color: "error",
    },
  ];

  // Sort actions: pinned first, then others
  const sortedActions = [
    ...actions.filter((a) => pinnedActions.includes(a.key)),
    ...actions.filter((a) => !pinnedActions.includes(a.key)),
  ];

  return (
    <Card
      sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        boxShadow: 3,
        borderRadius: 3,
        position: "relative",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: theme.palette.text.primary }}
        >
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 2, bgcolor: theme.palette.divider }} />
        <Grid container spacing={2}>
          {sortedActions.map((action) => (
            <Grid item xs={12} sm={6} md={4} key={action.key}>
              <Tooltip title={action.tooltip} arrow>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    fullWidth
                    variant={
                      action.color === "error" ? "contained" : "outlined"
                    }
                    color={action.color || "primary"}
                    startIcon={action.icon}
                    onClick={action.onClick}
                    aria-label={action.ariaLabel}
                    sx={{
                      justifyContent: "flex-start",
                      py: 1.7,
                      px: 2,
                      borderRadius: 2,
                      fontWeight: 500,
                      fontSize: "1rem",
                      backgroundColor:
                        action.color === "error"
                          ? theme.palette.error.main
                          : theme.palette.background.paper,
                      color:
                        action.color === "error"
                          ? theme.palette.getContrastText(
                              theme.palette.error.main
                            )
                          : theme.palette.text.primary,
                      boxShadow: action.color === "error" ? 2 : 0,
                      transition:
                        "background 0.2s, box-shadow 0.2s, transform 0.15s",
                      "&:hover": {
                        backgroundColor:
                          action.color === "error"
                            ? theme.palette.error.dark
                            : theme.palette.action.hover,
                        color:
                          action.color === "error"
                            ? theme.palette.getContrastText(
                                theme.palette.error.dark
                              )
                            : theme.palette.primary.main,
                        boxShadow: 4,
                        transform: "scale(1.03)",
                      },
                      "&:focus": {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: "2px",
                      },
                      minHeight: 56,
                      flex: 1,
                    }}
                  >
                    <Box component="span" sx={{ ml: 1 }}>
                      {action.name}
                    </Box>
                  </Button>
                  {onPinAction && (
                    <Tooltip
                      title={
                        pinnedActions.includes(action.key)
                          ? "Unpin from favorites"
                          : "Pin to favorites"
                      }
                      arrow
                    >
                      <IconButton
                        onClick={() => onPinAction(action.key)}
                        aria-label={
                          pinnedActions.includes(action.key)
                            ? `Unpin ${action.name}`
                            : `Pin ${action.name}`
                        }
                        sx={{ ml: 1 }}
                        color={
                          pinnedActions.includes(action.key)
                            ? "warning"
                            : "default"
                        }
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
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
