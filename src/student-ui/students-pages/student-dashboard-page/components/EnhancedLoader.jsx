import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Paper,
} from '@mui/material';
import { keyframes } from '@mui/system';

// Animation for pulse effect
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

// Dashboard skeleton loader
const DashboardSkeleton = ({ theme }) => (
  <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, mx: 'auto' }}>
    {/* Header skeleton */}
    <Box sx={{ position: 'relative', pb: { xs: 10, sm: 12 }, mb: 3 }}>
      <Box
        sx={{
          bgcolor: theme?.palette?.background?.paper || '#f5f5f5',
          height: { xs: 140, sm: 180 },
          borderRadius: '0 0 16px 16px',
        }}
      />
      <Paper
        elevation={1}
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          mx: 'auto',
          top: { xs: 70, sm: 100 },
          padding: 2,
          width: { xs: '90%', sm: 400 },
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={100} height={20} sx={{ mb: 2 }} />
        <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={80}
              height={32}
              sx={{ borderRadius: '16px' }}
            />
          ))}
        </Box>
      </Paper>
    </Box>

    {/* Content sections skeleton */}
    <Grid container spacing={2}>
      {/* Progress Overview */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <Box textAlign="center">
                    <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" width={80} height={20} sx={{ mx: 'auto' }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Learning Paths */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width={250} height={28} sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={6} sm={6} md={3} key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={120}
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Other sections */}
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} key={i}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

// Enhanced loader component
const EnhancedLoader = ({
  type = 'skeleton',
  message = 'Loading...',
  fullScreen = false,
  size = 40,
  showMessage = true,
  progress = null,
  theme = null,
  minHeight = '300px',
  skeletonCount = 6,
  skeletonHeight = 60,
}) => {
  const containerSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: fullScreen ? '100vh' : minHeight,
    p: 2,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgcolor: theme?.palette?.background?.default || '#ffffff',
      zIndex: 1300,
    }),
  };

  if (type === 'dashboard') {
    return <DashboardSkeleton theme={theme} />;
  }

  if (type === 'skeleton') {
    return (
      <Box sx={containerSx}>
        {showMessage && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2, textAlign: 'center' }}
          >
            {message}
          </Typography>
        )}
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={skeletonHeight}
              sx={{
                mb: 1,
                borderRadius: 1,
                animation: `${pulse} 1.5s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (type === 'progress') {
    return (
      <Box sx={containerSx}>
        <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          {showMessage && (
            <Typography 
              variant="body1" 
              sx={{ mb: 2, fontWeight: 500 }}
            >
              {message}
            </Typography>
          )}
          <LinearProgress 
            variant={progress !== null ? 'determinate' : 'indeterminate'} 
            value={progress}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: theme?.palette?.grey?.[200] || '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
          />
          {progress !== null && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 1 }}
            >
              {Math.round(progress)}%
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // Default spinner type
  return (
    <Box sx={containerSx}>
      <CircularProgress 
        size={size} 
        thickness={4}
        sx={{
          color: theme?.palette?.primary?.main || '#1976d2',
          mb: showMessage ? 2 : 0,
        }}
      />
      {showMessage && (
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            textAlign: 'center',
            fontWeight: 500,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Loading overlay component
export const LoadingOverlay = ({ 
  loading, 
  children, 
  type = 'spinner',
  message = 'Loading...',
  theme = null 
}) => {
  if (!loading) {
    return children;
  }

  return (
    <Box sx={{ position: 'relative', minHeight: 200 }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          backdropFilter: 'blur(2px)',
        }}
      >
        <EnhancedLoader 
          type={type} 
          message={message} 
          theme={theme}
          fullScreen={false}
        />
      </Box>
      <Box sx={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
        {children}
      </Box>
    </Box>
  );
};

export default EnhancedLoader;