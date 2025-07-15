import React from "react";
import {
  Box,
  Skeleton,
  CircularProgress,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  Grid,
  Fade,
  Slide,
  useTheme,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

// Loading Spinner with different sizes and positions
export const LoadingSpinner = ({
  size = 40,
  position = "center",
  color = "primary",
  message = "Loading...",
  showMessage = false,
}) => {
  const theme = useTheme();

  const positionStyles = {
    center: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    },
    "top-left": {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      padding: theme.spacing(2),
    },
    "top-right": {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start",
      padding: theme.spacing(2),
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 9999,
    },
  };

  return (
    <Box sx={positionStyles[position]}>
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={size} color={color} />
        {showMessage && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Skeleton for Stat Cards
export const StatCardSkeleton = ({ count = 4 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Skeleton variant="circular" width={56} height={56} />
                <Box flex={1}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="80%" height={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Skeleton for Tables
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
        <Box>
          {/* Header */}
          <Box display="flex" gap={2} sx={{ mb: 1 }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} variant="text" width="20%" height={32} />
            ))}
          </Box>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <Box key={rowIndex} display="flex" gap={2} sx={{ mb: 1 }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  width="20%"
                  height={24}
                />
              ))}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// Skeleton for Charts
export const ChartSkeleton = ({ height = 300 }) => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={height} />
      </CardContent>
    </Card>
  );
};

// Progressive Loading with Steps
export const ProgressiveLoading = ({ steps, currentStep = 0 }) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Loading Dashboard...
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(currentStep / steps.length) * 100}
        sx={{ mb: 2 }}
      />
      <Box>
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              opacity: index <= currentStep ? 1 : 0.5,
            }}
          >
            <CircularProgress
              size={16}
              color={index < currentStep ? "success" : "primary"}
            />
            <Typography
              variant="body2"
              color={index < currentStep ? "success.main" : "text.secondary"}
            >
              {step}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Shimmer Effect Skeleton
export const ShimmerSkeleton = ({ width, height, variant = "rectangular" }) => {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "grey.300",
        borderRadius: variant === "circular" ? "50%" : 1,
        width,
        height,
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          animation: "shimmer 1.5s infinite",
        },
        "@keyframes shimmer": {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
      }}
    />
  );
};

// Dashboard Loading State
export const DashboardLoading = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={500}>
        <Box>
          {/* Header Skeleton */}
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width="40%" height={48} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>

          {/* Stats Cards */}
          <StatCardSkeleton count={6} />

          {/* Tabs Skeleton */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={48} />
          </Box>

          {/* Content Area */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartSkeleton height={200} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TableSkeleton rows={3} columns={3} />
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

// Pulse Loading Animation
export const PulseLoading = ({ children, loading = true }) => {
  return (
    <Box
      sx={{
        opacity: loading ? 0.6 : 1,
        animation: loading ? "pulse 2s infinite" : "none",
        "@keyframes pulse": {
          "0%": { opacity: 0.6 },
          "50%": { opacity: 1 },
          "100%": { opacity: 0.6 },
        },
      }}
    >
      {children}
    </Box>
  );
};

// Loading with Error Retry
export const LoadingWithRetry = ({ loading, error, onRetry, children }) => {
  if (loading) {
    return <LoadingSpinner message="Loading data..." showMessage />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <button onClick={onRetry}>Retry</button>
      </Box>
    );
  }

  return children;
};

// Skeleton for Course Cards
export const CourseCardSkeleton = ({ count = 6 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Loading Overlay
export const LoadingOverlay = ({
  loading,
  children,
  message = "Processing...",
}) => {
  if (!loading) return children;

  return (
    <Box sx={{ position: "relative" }}>
      {children}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {message}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
