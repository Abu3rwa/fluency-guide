import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Flag as FlagIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import GoalManagementDialog from "./GoalManagementDialog";

const GoalsProgressSection = ({
  goals = [],
  onGoalClick,
  onCreateGoal,
  onGoalUpdated,
  onGoalDeleted,
  loading = false,
  error = null,
  userId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleCreateGoal = (goalData) => {
    onCreateGoal?.(goalData);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateGoal = (goalData) => {
    onGoalUpdated?.(goalData);
    setSelectedGoal(null);
  };

  const handleDeleteGoal = (goalData) => {
    onGoalDeleted?.(goalData);
    setSelectedGoal(null);
  };

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return theme.palette.success.main;
    if (progress >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getUnitLabel = (unit) => {
    switch (unit) {
      case "min":
        return "minutes";
      case "lessons":
        return "lessons";
      case "words":
        return "words";
      case "sessions":
        return "sessions";
      default:
        return unit;
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          {[1, 2].map((item) => (
            <Box key={item} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={8} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="40%" sx={{ mt: 0.5 }} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FlagIcon sx={{ fontSize: 20 }} />
              Goals Progress
            </Typography>
            <IconButton
              onClick={() => setIsCreateDialogOpen(true)}
              sx={{
                color: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main + "20",
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>

          {goals.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <FlagIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.text.secondary,
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No goals set yet. Create your first learning goal!
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create Goal
              </Button>
            </Box>
          ) : (
            <Box>
              {goals.map((goal, index) => {
                // Handle vocabulary goal model compatibility for progress calculation
                const isVocabularyGoal = goal.category === "vocabulary";
                const current = isVocabularyGoal
                  ? goal.completedCount || 0
                  : goal.current || 0;
                const target = isVocabularyGoal
                  ? goal.targetCount || goal.target
                  : goal.target;
                const progress = target > 0 ? (current / target) * 100 : 0;
                const progressColor = getProgressColor(progress);

                return (
                  <Box
                    key={goal.id || index}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: progressColor,
                        backgroundColor: progressColor + "08",
                      },
                    }}
                    onClick={() => onGoalClick?.(goal)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flex: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {goal.title}
                        </Typography>
                        {goal.isCompleted && (
                          <CheckCircleIcon
                            sx={{
                              color: theme.palette.success.main,
                              fontSize: 20,
                            }}
                          />
                        )}
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: progressColor,
                            fontWeight: 600,
                          }}
                        >
                          {/* Handle vocabulary goal model compatibility */}
                          {goal.category === "vocabulary"
                            ? `${goal.completedCount || 0}/${
                                goal.targetCount || goal.target
                              } ${goal.unit}`
                            : `${goal.current || 0}/${goal.target} ${
                                goal.unit
                              }`}
                        </Typography>
                        <Tooltip title="Edit goal">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGoal(goal);
                            }}
                            sx={{
                              color: theme.palette.text.secondary,
                              "&:hover": {
                                color: theme.palette.primary.main,
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.divider,
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: progressColor,
                          borderRadius: 4,
                        },
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          textTransform: "capitalize",
                        }}
                      >
                        {/* Handle vocabulary goal model compatibility */}
                        {goal.category === "vocabulary"
                          ? `${goal.period || goal.type} goal`
                          : `${goal.type} goal`}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: progressColor,
                          fontWeight: 600,
                        }}
                      >
                        {Math.round(progress)}% complete
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Goal Management Dialog */}
      <GoalManagementDialog
        open={isCreateDialogOpen || !!selectedGoal}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setSelectedGoal(null);
        }}
        userId={userId}
        existingGoal={selectedGoal}
        onGoalCreated={handleCreateGoal}
        onGoalUpdated={handleUpdateGoal}
        onGoalDeleted={handleDeleteGoal}
      />
    </>
  );
};

export default GoalsProgressSection;
