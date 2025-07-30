import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Close as CloseIcon,
  VolumeUp as VolumeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import studentReviewService from "../../../../services/student-services/studentReviewService";

const ReviewSession = ({ session, onSessionComplete, userId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [currentItem, setCurrentItem] = useState(session.items[0]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    completed: 0,
    correct: 0,
    incorrect: 0,
  });

  useEffect(() => {
    if (session.currentIndex < session.items.length) {
      setCurrentItem(session.items[session.currentIndex]);
      setShowAnswer(false);
      setPerformance(null);
    }
  }, [session.currentIndex, session.items]);

  const handlePerformanceRating = async (rating) => {
    if (!currentItem || loading) return;

    try {
      setLoading(true);
      setError(null);

      // Update the review item with performance
      await studentReviewService.updateReviewItem(
        userId,
        currentItem.id,
        rating
      );

      // Update session stats
      const newStats = { ...sessionStats };
      newStats.completed += 1;
      if (rating === "easy" || rating === "good") {
        newStats.correct += 1;
      } else {
        newStats.incorrect += 1;
      }
      setSessionStats(newStats);

      // Move to next item or complete session
      const nextIndex = session.currentIndex + 1;
      if (nextIndex < session.items.length) {
        // Update session state
        session.currentIndex = nextIndex;
        session.completed = newStats.completed;
      } else {
        // Session complete
        setTimeout(() => {
          onSessionComplete();
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating review item:", error);
      setError("Failed to update review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip current item (treat as 'hard')
    handlePerformanceRating("hard");
  };

  const getProgressPercentage = () => {
    return ((session.currentIndex + 1) / session.total) * 100;
  };

  const getPerformanceColor = (rating) => {
    switch (rating) {
      case "forgot":
        return theme.palette.error.main;
      case "hard":
        return theme.palette.warning.main;
      case "good":
        return theme.palette.info.main;
      case "easy":
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getPerformanceLabel = (rating) => {
    switch (rating) {
      case "forgot":
        return "Forgot";
      case "hard":
        return "Hard";
      case "good":
        return "Good";
      case "easy":
        return "Easy";
      default:
        return "";
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={() => setError(null)}>
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Session Progress */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6">Review Session</Typography>
            <Chip
              label={`${session.currentIndex + 1}/${session.total}`}
              color="primary"
              size="small"
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.divider,
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Progress: {Math.round(getProgressPercentage())}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Correct: {sessionStats.correct} | Incorrect:{" "}
              {sessionStats.incorrect}
            </Typography>
          </Box>
        </Box>

        {/* Current Item */}
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {currentItem?.contentData?.title || "Review Item"}
          </Typography>

          {currentItem?.contentData?.audioUrl && (
            <IconButton
              sx={{ mb: 2 }}
              onClick={() => {
                // TODO: Implement audio playback
                console.log("Play audio:", currentItem.contentData.audioUrl);
              }}
            >
              <VolumeIcon />
            </IconButton>
          )}

          {showAnswer ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 3, minHeight: 60 }}>
                {currentItem?.contentData?.description ||
                  "No description available"}
              </Typography>

              {currentItem?.contentData?.example && (
                <Typography
                  variant="body2"
                  sx={{
                    mb: 3,
                    fontStyle: "italic",
                    color: theme.palette.text.secondary,
                    backgroundColor: theme.palette.background.default,
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  Example: {currentItem.contentData.example}
                </Typography>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                How well did you know this?
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: isMobile ? "wrap" : "nowrap",
                }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ThumbDownIcon />}
                  onClick={() => handlePerformanceRating("forgot")}
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  Forgot
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<TrendingDownIcon />}
                  onClick={() => handlePerformanceRating("hard")}
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  Hard
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<CheckIcon />}
                  onClick={() => handlePerformanceRating("good")}
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  Good
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<ThumbUpIcon />}
                  onClick={() => handlePerformanceRating("easy")}
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  Easy
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Think about this item. When you're ready, click "Show Answer" to
                reveal the details.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => setShowAnswer(true)}
                sx={{ mb: 2 }}
              >
                Show Answer
              </Button>

              <Button
                variant="text"
                onClick={handleSkip}
                disabled={loading}
                sx={{ display: "block", mx: "auto" }}
              >
                Skip this item
              </Button>
            </Box>
          )}
        </Box>

        {/* Session Stats */}
        {sessionStats.completed > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: theme.palette.background.default,
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Session Statistics:
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                label={`Completed: ${sessionStats.completed}`}
                size="small"
                color="primary"
              />
              <Chip
                label={`Correct: ${sessionStats.correct}`}
                size="small"
                color="success"
              />
              <Chip
                label={`Incorrect: ${sessionStats.incorrect}`}
                size="small"
                color="error"
              />
              <Chip
                label={`Accuracy: ${
                  sessionStats.completed > 0
                    ? Math.round(
                        (sessionStats.correct / sessionStats.completed) * 100
                      )
                    : 0
                }%`}
                size="small"
                color="info"
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewSession;
