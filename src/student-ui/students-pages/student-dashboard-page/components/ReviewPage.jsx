import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useUser } from "../../../../contexts/UserContext";
import studentReviewService from "../../../../services/student-services/studentReviewService";
import ReviewSession from "./ReviewSession";

const ReviewPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userData: user } = useUser();

  const [reviewItems, setReviewItems] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewItems = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);
        const queue = await studentReviewService.getReviewQueue(user.uid);
        setReviewItems(queue);
      } catch (error) {
        console.error("Error fetching review items:", error);
        setError("Failed to load review items");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewItems();
  }, [user?.uid]);

  const handleStartSession = () => {
    setCurrentSession({
      items: reviewItems,
      currentIndex: 0,
      completed: 0,
      total: reviewItems.length,
      startTime: new Date(),
    });
  };

  const handleSessionComplete = () => {
    setCurrentSession(null);
    // Refresh the review queue
    window.location.reload();
  };

  const getSessionProgress = () => {
    if (!currentSession) return 0;
    return (currentSession.completed / currentSession.total) * 100;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Container>
    );
  }

  if (currentSession) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Review Session
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Progress: {currentSession.completed} of {currentSession.total} items
          </Typography>
        </Box>

        <ReviewSession
          session={currentSession}
          onSessionComplete={handleSessionComplete}
          userId={user?.uid}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Review Session
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <ScheduleIcon
              sx={{ fontSize: 40, color: theme.palette.primary.main }}
            />
            <Box>
              <Typography variant="h6" gutterBottom>
                Ready to Review
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have {reviewItems.length} item
                {reviewItems.length !== 1 ? "s" : ""} due for review
              </Typography>
            </Box>
          </Box>

          {reviewItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <TrendingUpIcon
                sx={{
                  fontSize: 64,
                  color: theme.palette.success.main,
                  mb: 2,
                }}
              />
              <Typography variant="h6" gutterBottom>
                All Caught Up!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You have no items due for review today. Great job staying on top
                of your learning!
              </Typography>
              <Button variant="outlined" onClick={() => window.history.back()}>
                Back to Dashboard
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Regular review sessions help reinforce your learning and improve
                long-term retention. This session will present items one at a
                time, and you'll rate how well you remember each one.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Session Overview:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {reviewItems.slice(0, 5).map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        backgroundColor: theme.palette.background.default,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {item.contentData?.title || "Review item"}
                      </Typography>
                    </Box>
                  ))}
                  {reviewItems.length > 5 && (
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        backgroundColor: theme.palette.background.default,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        +{reviewItems.length - 5} more
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                onClick={handleStartSession}
                fullWidth={isMobile}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                  boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
                  "&:hover": {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                  },
                }}
              >
                Start Review Session ({reviewItems.length} items)
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, display: "block" }}
              >
                Estimated time: {Math.ceil(reviewItems.length * 0.5)} minutes
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReviewPage;
