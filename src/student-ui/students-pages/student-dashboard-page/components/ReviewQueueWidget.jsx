import React, { useState, useEffect, useMemo } from "react";
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
  alpha,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import { useTranslation } from 'react-i18next';
import studentReviewService from "../../../../services/student-services/studentReviewService";

const ReviewQueueWidget = ({ userId }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isRTL = i18n.language === 'ar';
  const isDark = theme.palette.mode === 'dark';
  
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized theme-aware styles
  const cardStyles = useMemo(() => ({
    mb: 3,
    backgroundColor: theme.palette.background.paper,
    border: isDark ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none',
    elevation: isDark ? 4 : 2,
    borderRadius: 2,
  }), [theme, isDark]);

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
    if (count === 0) return t('student.dashboard.vocabulary.noReviewNeeded');
    if (count === 1) return `1 ${t('student.dashboard.vocabulary.dueForReview')}`;
    return `${count} ${t('student.dashboard.vocabulary.dueForReview')}`;
  };

  if (loading) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Skeleton variant="text" width={120} height={32} sx={{ bgcolor: isDark ? alpha(theme.palette.common.white, 0.1) : undefined }} />
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: isDark ? alpha(theme.palette.common.white, 0.1) : undefined }} />
          </Box>
          <Skeleton variant="text" width="60%" sx={{ mb: 2, bgcolor: isDark ? alpha(theme.palette.common.white, 0.1) : undefined }} />
          <Skeleton variant="rectangular" height={40} sx={{ bgcolor: isDark ? alpha(theme.palette.common.white, 0.1) : undefined }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <Typography color="error" align="center" sx={{ color: theme.palette.error.main }}>
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardStyles}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexDirection: isRTL ? 'row-reverse' : 'row',
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
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}
          >
            <BookIcon sx={{ fontSize: 20 }} />
            {t('student.dashboard.vocabulary.title')}
          </Typography>
          <Chip
            label={getQueueLabel(reviewQueue.length)}
            color={getQueueColor(reviewQueue.length)}
            size="small"
            icon={
              reviewQueue.length === 0 ? <TrendingUpIcon /> : <ScheduleIcon />
            }
            sx={{
              backgroundColor: isDark ? alpha(theme.palette[getQueueColor(reviewQueue.length)].main, 0.2) : undefined,
              color: theme.palette[getQueueColor(reviewQueue.length)].main,
            }}
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
            <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              {t('student.dashboard.vocabulary.noReviewNeeded')}! {t('vocabulary.excellentProgress')}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {t('student.dashboard.vocabulary.nextReview')}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary, textAlign: isRTL ? 'right' : 'left' }}>
              {t('student.dashboard.vocabulary.reviewPrompt', { 
                count: reviewQueue.length,
                item: reviewQueue.length === 1 ? t('common.item') : t('common.items')
              })}
            </Typography>

            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleStartReview}
              fullWidth={isMobile}
              sx={{
                background: isDark 
                  ? `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`
                  : `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                boxShadow: isDark 
                  ? `0 3px 8px ${alpha(theme.palette.common.black, 0.4)}`
                  : `0 3px 5px 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  background: isDark
                    ? `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`
                    : `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                  transform: 'translateY(-1px)',
                  boxShadow: isDark 
                    ? `0 4px 12px ${alpha(theme.palette.common.black, 0.5)}`
                    : `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {t('student.dashboard.vocabulary.startReview')}
            </Button>

            {reviewQueue.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textAlign: isRTL ? 'right' : 'left' }}>
                  {t('student.dashboard.vocabulary.nextReview')}:
                </Typography>
                <Box sx={{ mt: 1, textAlign: isRTL ? 'right' : 'left' }}>
                  {reviewQueue.slice(0, 3).map((item, index) => (
                    <Typography
                      key={item.id}
                      variant="caption"
                      sx={{
                        display: "block",
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                        '&:before': {
                          content: '"• "',
                          marginRight: isRTL ? 0 : 0.5,
                          marginLeft: isRTL ? 0.5 : 0,
                        }
                      }}
                    >
                      {item.contentData?.title || t('student.dashboard.vocabulary.reviewItem')}
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
                      {t('common.andMore', { count: reviewQueue.length - 3 })}
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
