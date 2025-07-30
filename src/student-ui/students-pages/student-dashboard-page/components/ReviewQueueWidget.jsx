import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import studentReviewService from "../../../../services/student-services/studentReviewService";

const ReviewQueueWidget = ({ userId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewQueue = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const queue = await studentReviewService.getReviewQueue(userId);
        setReviewQueue(queue);
      } catch (error) {
        console.error("Error fetching review queue:", error);
        setError("Failed to load review queue");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewQueue();
  }, [userId]);

  const handleStartReview = () => {
    // Navigate to review page
    window.location.href = "/review";
  };

  const getQueueColor = (count) => {
    if (count === 0) return "success";
    if (count <= 5) return "warning";
    return "error";
  };

  const getQueueLabel = (count) => {
    if (count === 0) return "All caught up!";
    if (count === 1) return "1 item due";
    return `${count} items due`;
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
          <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={40} />
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
            <ScheduleIcon sx={{ fontSize: 20 }} />
            Review Queue
          </Typography>
          <Chip
            label={getQueueLabel(reviewQueue.length)}
            color={getQueueColor(reviewQueue.length)}
            size="small"
            icon={
              reviewQueue.length === 0 ? <TrendingUpIcon /> : <ScheduleIcon />
            }
          />
        </Box>

        {reviewQueue.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <TrendingUpIcon
              sx={{
                fontSize: 48,
                color: theme.palette.success.main,
                mb: 2,
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No reviews due today! Great job staying on top of your learning.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              New items will appear here as you complete lessons.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You have {reviewQueue.length} item
              {reviewQueue.length !== 1 ? "s" : ""} due for review. Regular
              review sessions help reinforce your learning and improve
              retention.
            </Typography>

            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleStartReview}
              fullWidth={isMobile}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                },
              }}
            >
              Start Review Session
            </Button>

            {reviewQueue.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Next reviews:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {reviewQueue.slice(0, 3).map((item, index) => (
                    <Typography
                      key={item.id}
                      variant="caption"
                      sx={{
                        display: "block",
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                      }}
                    >
                      • {item.contentData?.title || "Review item"}
                    </Typography>
                  ))}
                  {reviewQueue.length > 3 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                      }}
                    >
                      ... and {reviewQueue.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewQueueWidget;
