import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import vocabularyReviewIntegrationService from "../../services/student-services/vocabularyReviewIntegrationService";
import studentReviewService from "../../services/student-services/studentReviewService";
import { useAuth } from "../../contexts/AuthContext";

const VocabularyReviewIntegration = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // State management
  const [reviewQueue, setReviewQueue] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedReviewItems, setSelectedReviewItems] = useState([]);
  const [creatingTask, setCreatingTask] = useState(false);

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dialogFocusedIndex, setDialogFocusedIndex] = useState(-1);
  const listRefs = useRef([]);
  const dialogListRefs = useRef([]);

  // Fetch vocabulary review data
  const fetchVocabularyReviewData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [queue, analyticsData] = await Promise.all([
        vocabularyReviewIntegrationService.getVocabularyReviewQueue(userId),
        vocabularyReviewIntegrationService.getVocabularyLearningAnalytics(
          userId
        ),
      ]);

      setReviewQueue(queue);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Error fetching vocabulary review data:", err);
      setError("Failed to load vocabulary review data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create review task from selected items
  const createReviewTask = useCallback(
    async (reviewItems, taskType = "multipleChoice") => {
      if (!userId || reviewItems.length === 0) return;

      try {
        setCreatingTask(true);
        const task =
          await vocabularyReviewIntegrationService.createVocabularyTaskFromReviews(
            userId,
            reviewItems,
            taskType
          );

        // Navigate to the created task
        window.location.href = `/tasks/${task.id}`;
      } catch (err) {
        console.error("Error creating review task:", err);
        setError("Failed to create review task");
      } finally {
        setCreatingTask(false);
        setShowReviewDialog(false);
      }
    },
    [userId]
  );

  // Handle review item selection
  const handleReviewItemSelect = useCallback((item) => {
    setSelectedReviewItems((prev) => {
      const isSelected = prev.find((selected) => selected.id === item.id);
      if (isSelected) {
        return prev.filter((selected) => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  // Handle start review session
  const handleStartReviewSession = useCallback(() => {
    if (selectedReviewItems.length === 0) {
      setError("Please select at least one item to review");
      return;
    }
    createReviewTask(selectedReviewItems, "multipleChoice");
  }, [selectedReviewItems, createReviewTask]);

  // Handle start fill-in-blanks session
  const handleStartFillInBlanks = useCallback(() => {
    if (selectedReviewItems.length === 0) {
      setError("Please select at least one item to review");
      return;
    }
    createReviewTask(selectedReviewItems, "fillInBlanks");
  }, [selectedReviewItems, createReviewTask]);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback(
    (event) => {
      if (!showReviewDialog) return;

      const { key } = event;
      const maxIndex = reviewQueue.length - 1;

      switch (key) {
        case "ArrowDown":
          event.preventDefault();
          setDialogFocusedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;
        case "ArrowUp":
          event.preventDefault();
          setDialogFocusedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (
            dialogFocusedIndex >= 0 &&
            dialogFocusedIndex < reviewQueue.length
          ) {
            handleReviewItemSelect(reviewQueue[dialogFocusedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          setShowReviewDialog(false);
          setDialogFocusedIndex(-1);
          break;
        case "Tab":
          // Allow default tab behavior but reset focus index
          setDialogFocusedIndex(-1);
          break;
      }
    },
    [showReviewDialog, reviewQueue, handleReviewItemSelect]
  );

  // Main list keyboard navigation
  const handleMainListKeyDown = useCallback(
    (event) => {
      const { key } = event;
      const maxIndex = Math.min(5, reviewQueue.length) - 1;

      switch (key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < reviewQueue.length) {
            setShowReviewDialog(true);
            setDialogFocusedIndex(0);
          }
          break;
      }
    },
    [reviewQueue]
  );

  // Focus management
  useEffect(() => {
    if (showReviewDialog) {
      setDialogFocusedIndex(0);
    } else {
      setDialogFocusedIndex(-1);
      setFocusedIndex(-1);
    }
  }, [showReviewDialog]);

  // Focus refs when index changes
  useEffect(() => {
    if (dialogFocusedIndex >= 0 && dialogListRefs.current[dialogFocusedIndex]) {
      dialogListRefs.current[dialogFocusedIndex].focus();
    }
  }, [dialogFocusedIndex]);

  useEffect(() => {
    if (focusedIndex >= 0 && listRefs.current[focusedIndex]) {
      listRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // Load data on mount
  useEffect(() => {
    fetchVocabularyReviewData();
  }, [fetchVocabularyReviewData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchVocabularyReviewData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchVocabularyReviewData]);

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Vocabulary Review</Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchVocabularyReviewData}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
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
              <SchoolIcon sx={{ fontSize: 20 }} />
              Vocabulary Review
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Go to Vocabulary Building">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => (window.location.href = "/student/vocabulary")}
                  sx={{ mr: 1 }}
                >
                  View All
                </Button>
              </Tooltip>
              <Tooltip title="Refresh data (R)">
                <IconButton
                  onClick={fetchVocabularyReviewData}
                  disabled={loading}
                  size="small"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Analytics Section */}
          {analytics && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Learning Progress
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Chip
                  label={`${analytics.learnedWords}/${analytics.totalWords} learned`}
                  color="success"
                  size="small"
                />
                <Chip
                  label={`${analytics.difficultWords} difficult`}
                  color="warning"
                  size="small"
                />
                <Chip
                  label={`${analytics.wordsDueForReview} due for review`}
                  color="info"
                  size="small"
                />
                <Chip
                  label={`${analytics.averageAccuracy}% accuracy`}
                  color="primary"
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={analytics.learningProgress}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {Math.round(analytics.learningProgress)}% complete
              </Typography>
            </Box>
          )}

          {/* Review Queue Section */}
          {reviewQueue.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <TrendingUpIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.success.main,
                  mb: 2,
                }}
              />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                No vocabulary reviews due today!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Great job staying on top of your vocabulary learning.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Due for Review ({reviewQueue.length})
                </Typography>
                <Tooltip title="Start review session (S)">
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={() => setShowReviewDialog(true)}
                    size="small"
                  >
                    Start Review
                  </Button>
                </Tooltip>
              </Box>

              <Box
                onKeyDown={handleMainListKeyDown}
                tabIndex={0}
                sx={{ outline: "none" }}
              >
                <List dense>
                  {reviewQueue.slice(0, 5).map((item, index) => (
                    <ListItem
                      key={item.id}
                      ref={(el) => (listRefs.current[index] = el)}
                      tabIndex={0}
                      sx={{
                        border: 1,
                        borderColor:
                          focusedIndex === index ? "primary.main" : "divider",
                        borderRadius: 1,
                        mb: 1,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                        "&:focus": {
                          outline: "2px solid",
                          outlineColor: theme.palette.primary.main,
                          outlineOffset: "2px",
                        },
                      }}
                      onClick={() => setShowReviewDialog(true)}
                    >
                      <ListItemIcon>
                        <AssignmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.contentData?.word || "Vocabulary word"}
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.contentData?.definition ||
                                "No definition available"}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={`Due: ${new Date(
                                  item.nextReviewDate
                                ).toLocaleDateString()}`}
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={`${item.repetitions || 0} reviews`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Ease: ${
                            item.easeFactor?.toFixed(1) || "2.5"
                          }`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                  ))}
                  {reviewQueue.length > 5 && (
                    <ListItem>
                      <ListItemText
                        primary={`... and ${reviewQueue.length - 5} more items`}
                        sx={{ textAlign: "center", fontStyle: "italic" }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>

              {/* Keyboard shortcuts help */}
              <Box
                sx={{ mt: 2, p: 1, bgcolor: "action.hover", borderRadius: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  <strong>Keyboard shortcuts:</strong> Use ↑↓ arrows to
                  navigate, Enter/Space to select, R to refresh
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ScheduleIcon />
            Select Items for Review
            <Box
              sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Use ↑↓ arrows, Enter/Space to select, Esc to close
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the vocabulary items you want to review. You can choose
            multiple items to create a comprehensive review session.
          </Typography>

          <List>
            {reviewQueue.map((item, index) => {
              const isSelected = selectedReviewItems.find(
                (selected) => selected.id === item.id
              );
              const isFocused = dialogFocusedIndex === index;

              return (
                <ListItem
                  key={item.id}
                  ref={(el) => (dialogListRefs.current[index] = el)}
                  button
                  tabIndex={0}
                  onClick={() => handleReviewItemSelect(item)}
                  selected={isSelected}
                  sx={{
                    border: 2,
                    borderColor: isSelected
                      ? "primary.main"
                      : isFocused
                      ? "primary.light"
                      : "divider",
                    borderRadius: 1,
                    mb: 1,
                    "&:focus": {
                      outline: "2px solid",
                      outlineColor: theme.palette.primary.main,
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <ListItemIcon>
                    {isSelected ? (
                      <CheckCircleIcon color="primary" />
                    ) : (
                      <AssignmentIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.contentData?.word || "Vocabulary word"}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.contentData?.definition ||
                            "No definition available"}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={`${item.repetitions || 0} previous reviews`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                  />
                  {isFocused && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <ArrowUpIcon fontSize="small" color="action" />
                      <ArrowDownIcon fontSize="small" color="action" />
                    </Box>
                  )}
                </ListItem>
              );
            })}
          </List>

          {selectedReviewItems.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {selectedReviewItems.length} item
                {selectedReviewItems.length !== 1 ? "s" : ""} selected for
                review
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStartReviewSession}
            disabled={selectedReviewItems.length === 0 || creatingTask}
            startIcon={<PlayIcon />}
          >
            Multiple Choice Review
          </Button>
          <Button
            variant="outlined"
            onClick={handleStartFillInBlanks}
            disabled={selectedReviewItems.length === 0 || creatingTask}
            startIcon={<AssignmentIcon />}
          >
            Fill-in-Blanks
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VocabularyReviewIntegration;
