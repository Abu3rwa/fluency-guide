import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  TrendingUp as TrendingIcon,
  MoreVert as MoreIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "@mui/icons-material";

// Simple chart component - replace with recharts or chart.js in production
const SimpleLineChart = ({ data, labels, color, isMobile }) => {
  const theme = useTheme();
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  return (
    <Box
      sx={{
        position: "relative",
        height: isMobile ? 100 : 120,
        mt: isMobile ? 1 : 2,
      }}
    >
      {/* Chart area */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "flex-end",
          gap: isMobile ? 0.5 : 1,
        }}
      >
        {data.map((value, index) => {
          const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
          return (
            <Box
              key={index}
              sx={{
                flex: 1,
                height: `${height}%`,
                backgroundColor: color,
                borderRadius: "2px 2px 0 0",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            />
          );
        })}
      </Box>

      {/* Labels */}
      <Box
        sx={{
          position: "absolute",
          bottom: isMobile ? -15 : -20,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          fontSize: isMobile ? "0.65rem" : "0.75rem",
          color: theme.palette.text.secondary,
        }}
      >
        {labels.map((label, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{
              fontSize: isMobile ? "0.65rem" : "inherit",
              transform: isMobile ? "rotate(-45deg)" : "none",
              transformOrigin: "center",
            }}
          >
            {isMobile ? label.substring(0, 2) : label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const ProgressAnalyticsSection = ({
  trendData,
  vocabularyStats,
  pronunciationStats,
  timeRange = "week",
  onTimeRangeChange,
  loading = false,
  error = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (range) => {
    setAnchorEl(null);
    if (range) {
      onTimeRangeChange?.(range);
    }
  };

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "quarter":
        return "This Quarter";
      case "year":
        return "This Year";
      default:
        return "This Week";
    }
  };

  // Safe data extraction with fallbacks
  const getTrendChartData = () => {
    if (!trendData || !trendData.datasets || !trendData.datasets[0]) {
      return {
        data: [0, 0, 0, 0, 0, 0, 0], // Default empty data
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        color: theme.palette.primary.main,
      };
    }

    return {
      data: trendData.datasets[0].data || [0, 0, 0, 0, 0, 0, 0],
      labels: trendData.labels || [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ],
      color: trendData.datasets[0].borderColor || theme.palette.primary.main,
    };
  };

  const getVocabularyStats = () => {
    if (!vocabularyStats) {
      return {
        totalWords: 0,
        accuracyRate: 0,
        newThisWeek: 0,
      };
    }

    return {
      totalWords: vocabularyStats.totalWords || 0,
      accuracyRate: vocabularyStats.accuracyRate || 0,
      newThisWeek: vocabularyStats.newThisWeek || 0,
    };
  };

  const getPronunciationStats = () => {
    if (!pronunciationStats) {
      return {
        wordsPracticed: 0,
        averageAccuracy: 0,
        practiceSessions: 0,
      };
    }

    return {
      wordsPracticed: pronunciationStats.wordsPracticed || 0,
      averageAccuracy: pronunciationStats.averageAccuracy || 0,
      practiceSessions: pronunciationStats.practiceSessions || 0,
    };
  };

  if (loading) {
    return (
      <Card sx={{ mb: isMobile ? 2 : 3 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: isMobile ? 1.5 : 2,
            }}
          >
            <Skeleton
              variant="text"
              width={isMobile ? 120 : 150}
              height={isMobile ? 28 : 32}
            />
            <Skeleton
              variant="circular"
              width={isMobile ? 28 : 32}
              height={isMobile ? 28 : 32}
            />
          </Box>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={isMobile ? 150 : 200} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={isMobile ? 150 : 200} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: isMobile ? 2 : 3 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography
            color="error"
            align="center"
            variant={isMobile ? "body2" : "body1"}
          >
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = getTrendChartData();
  const vocabStats = getVocabularyStats();
  const pronunStats = getPronunciationStats();

  return (
    <Card sx={{ mb: isMobile ? 2 : 3 }}>
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: isMobile ? 1.5 : 2,
          }}
        >
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <TrendingIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
            {isMobile ? "Learning Progress" : "Progress Analytics"}
          </Typography>
          <IconButton
            onClick={handleMenuClick}
            size={isMobile ? "small" : "medium"}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => handleMenuClose()}
        >
          <MenuItem onClick={() => handleMenuClose("week")}>
            <ListItemIcon>
              <TimelineIcon fontSize="small" />
            </ListItemIcon>
            This Week
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose("month")}>
            <ListItemIcon>
              <BarChartIcon fontSize="small" />
            </ListItemIcon>
            This Month
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose("quarter")}>
            <ListItemIcon>
              <PieChartIcon fontSize="small" />
            </ListItemIcon>
            This Quarter
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose("year")}>
            <ListItemIcon>
              <TrendingIcon fontSize="small" />
            </ListItemIcon>
            This Year
          </MenuItem>
        </Menu>

        <Typography
          variant={isMobile ? "caption" : "body2"}
          color="text.secondary"
          sx={{
            mb: isMobile ? 2 : 3,
            fontStyle: "italic",
            fontSize: isMobile ? "0.75rem" : "inherit",
          }}
        >
          {getTimeRangeLabel(timeRange)}
        </Typography>

        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Progress Trend Chart */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
              <Typography
                variant={isMobile ? "body2" : "subtitle1"}
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: isMobile ? 0.5 : 1,
                  fontSize: isMobile ? "0.875rem" : "inherit",
                }}
              >
                Progress Trend
              </Typography>
              <SimpleLineChart
                data={chartData.data}
                labels={chartData.labels}
                color={chartData.color}
                isMobile={isMobile}
              />
            </Box>
          </Grid>

          {/* Vocabulary & Pronunciation Stats */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={isMobile ? 1.5 : 2}>
              {/* Vocabulary Stats */}
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.main + "10",
                    border: `1px solid ${theme.palette.primary.main + "30"}`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant={isMobile ? "caption" : "subtitle2"}
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mb: isMobile ? 0.5 : 1,
                      fontSize: isMobile ? "0.75rem" : "inherit",
                    }}
                  >
                    Vocabulary
                  </Typography>
                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        fontSize: isMobile ? "1.5rem" : "inherit",
                      }}
                    >
                      {vocabStats.totalWords}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? "0.65rem" : "inherit" }}
                    >
                      words learned
                    </Typography>
                    <Box sx={{ mt: isMobile ? 0.5 : 1 }}>
                      <Typography
                        variant={isMobile ? "caption" : "body2"}
                        sx={{
                          fontWeight: 600,
                          fontSize: isMobile ? "0.7rem" : "inherit",
                        }}
                      >
                        {vocabStats.accuracyRate}% accuracy
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: isMobile ? "0.65rem" : "inherit" }}
                      >
                        {vocabStats.newThisWeek} new this week
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Pronunciation Stats */}
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.info.main + "10",
                    border: `1px solid ${theme.palette.info.main + "30"}`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant={isMobile ? "caption" : "subtitle2"}
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.info.main,
                      mb: isMobile ? 0.5 : 1,
                      fontSize: isMobile ? "0.75rem" : "inherit",
                    }}
                  >
                    Pronunciation
                  </Typography>
                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.info.main,
                        fontSize: isMobile ? "1.5rem" : "inherit",
                      }}
                    >
                      {pronunStats.wordsPracticed}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? "0.65rem" : "inherit" }}
                    >
                      words practiced
                    </Typography>
                    <Box sx={{ mt: isMobile ? 0.5 : 1 }}>
                      <Typography
                        variant={isMobile ? "caption" : "body2"}
                        sx={{
                          fontWeight: 600,
                          fontSize: isMobile ? "0.7rem" : "inherit",
                        }}
                      >
                        {pronunStats.averageAccuracy}% accuracy
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: isMobile ? "0.65rem" : "inherit" }}
                      >
                        {pronunStats.practiceSessions} sessions
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProgressAnalyticsSection;
