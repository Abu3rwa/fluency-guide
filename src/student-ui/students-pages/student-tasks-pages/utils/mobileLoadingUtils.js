// Mobile Loading States and Offline Support Utilities
// Provides enhanced loading states and offline capabilities for mobile task interfaces

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Alert,
  Skeleton,
  Fade,
  Zoom,
  IconButton,
  Snackbar,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CloudOff as OfflineIcon,
  Wifi as OnlineIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnectAttempts(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleConnectionChange = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
        
        // Consider 2g and slow-2g as slow connections
        const slowConnections = ['slow-2g', '2g'];
        setIsSlowConnection(slowConnections.includes(connection.effectiveType));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
      handleConnectionChange(); // Initial check
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  const attemptReconnect = useCallback(() => {
    if (!isOnline) {
      setReconnectAttempts(prev => prev + 1);
      
      // Simple connectivity check
      fetch('/api/health', { method: 'HEAD', cache: 'no-cache' })
        .then(() => {
          setIsOnline(true);
          setReconnectAttempts(0);
        })
        .catch(() => {
          // Still offline
        });
    }
  }, [isOnline]);

  return {
    isOnline,
    connectionType,
    isSlowConnection,
    reconnectAttempts,
    attemptReconnect,
  };
};

// Offline storage hook
export const useOfflineStorage = (key) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveOffline = useCallback(async (value) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: '1.0',
      });
      
      localStorage.setItem(`offline_${key}`, serializedValue);
      setData(value);
    } catch (err) {
      setError('Failed to save offline data');
      console.error('Offline storage error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const loadOffline = useCallback(async (maxAge = 24 * 60 * 60 * 1000) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stored = localStorage.getItem(`offline_${key}`);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;
        
        if (age <= maxAge) {
          setData(parsed.data);
          return parsed.data;
        } else {
          // Data too old, remove it
          localStorage.removeItem(`offline_${key}`);
          setError('Offline data expired');
        }
      }
      
      return null;
    } catch (err) {
      setError('Failed to load offline data');
      console.error('Offline loading error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const clearOffline = useCallback(() => {
    try {
      localStorage.removeItem(`offline_${key}`);
      setData(null);
      setError(null);
    } catch (err) {
      console.error('Failed to clear offline data:', err);
    }
  }, [key]);

  return {
    data,
    isLoading,
    error,
    saveOffline,
    loadOffline,
    clearOffline,
  };
};

// Mobile-optimized loading skeleton
export const MobileTaskSkeleton = ({ 
  lines = 4, 
  showTimer = true, 
  showProgress = true,
  variant = 'task'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Timer Skeleton */}
      {showTimer && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          p: 1,
        }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      )}

      {/* Progress Skeleton */}
      {showProgress && (
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={4} 
          sx={{ mb: 3, borderRadius: 2 }}
        />
      )}

      {/* Content Skeleton */}
      <Box sx={{ mb: 3 }}>
        {/* Question number */}
        <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
        
        {/* Question text */}
        <Skeleton variant="text" width="90%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="75%" height={32} sx={{ mb: 3 }} />
        
        {/* Options or content based on variant */}
        {variant === 'task' ? (
          // Task options skeleton
          Array.from({ length: lines }).map((_, index) => (
            <Box key={index} sx={{ 
              mb: 2,
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          ))
        ) : (
          // Generic content skeleton
          Array.from({ length: lines }).map((_, index) => (
            <Skeleton 
              key={index}
              variant="text" 
              width={index === lines - 1 ? '60%' : '100%'}
              height={24}
              sx={{ mb: 1 }}
            />
          ))
        )}
      </Box>

      {/* Navigation Skeleton */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pt: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}>
        <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 2 }} />
        <Skeleton variant="text" width={100} height={20} />
        <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  );
};

// Enhanced loading component for mobile
export const MobileLoadingState = ({ 
  loading = false,
  error = null,
  retryCount = 0,
  onRetry,
  loadingMessage,
  errorMessage,
  enableAnimations = true,
  variant = 'circular'
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isOnline, isSlowConnection, attemptReconnect } = useNetworkStatus();
  
  const handleRetry = useCallback(() => {
    if (!isOnline) {
      attemptReconnect();
    }
    onRetry?.();
  }, [isOnline, attemptReconnect, onRetry]);

  if (loading) {
    return (
      <Fade in={enableAnimations} timeout={300}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '50vh' : '40vh',
          p: 3,
          textAlign: 'center',
        }}>
          {variant === 'skeleton' ? (
            <MobileTaskSkeleton />
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                {variant === 'linear' ? (
                  <LinearProgress 
                    sx={{ width: '200px', height: 6, borderRadius: 3 }}
                    color={isSlowConnection ? 'warning' : 'primary'}
                  />
                ) : (
                  <CircularProgress 
                    size={isMobile ? 48 : 56}
                    thickness={4}
                    color={isSlowConnection ? 'warning' : 'primary'}
                  />
                )}
              </Box>
              
              <Typography 
                variant={isMobile ? 'body1' : 'h6'}
                sx={{ mb: 1, fontWeight: 500 }}
              >
                {loadingMessage || t('common.loading', 'Loading...')}
              </Typography>
              
              {isSlowConnection && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {t('common.slowConnection', 'Slow connection detected')}
                </Typography>
              )}
              
              {!isOnline && (
                <Alert 
                  severity="warning" 
                  icon={<OfflineIcon />}
                  sx={{ mt: 2, maxWidth: 300 }}
                >
                  {t('common.offline', 'You are currently offline')}
                </Alert>
              )}
            </>
          )}
        </Box>
      </Fade>
    );
  }

  if (error) {
    return (
      <Zoom in={enableAnimations} timeout={300}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '50vh' : '40vh',
          p: 3,
          textAlign: 'center',
        }}>
          <ErrorIcon 
            sx={{ 
              fontSize: isMobile ? 48 : 64, 
              color: 'error.main', 
              mb: 2 
            }} 
          />
          
          <Typography 
            variant={isMobile ? 'h6' : 'h5'}
            sx={{ mb: 2, fontWeight: 600 }}
          >
            {t('common.error', 'Something went wrong')}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400 }}
          >
            {errorMessage || error?.message || t('common.genericError', 'Please try again')}
          </Typography>
          
          {retryCount > 0 && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {t('common.retryAttempts', 'Retry attempts: {{count}}', { count: retryCount })}
            </Typography>
          )}
          
          <IconButton
            onClick={handleRetry}
            color="primary"
            size={isMobile ? 'large' : 'medium'}
            sx={{
              minWidth: 48,
              minHeight: 48,
              border: 1,
              borderColor: 'primary.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
          
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {t('common.tapToRetry', 'Tap to retry')}
          </Typography>
        </Box>
      </Zoom>
    );
  }

  return null;
};

// Offline indicator component
export const OfflineIndicator = () => {
  const { t } = useTranslation();
  const { isOnline, isSlowConnection, attemptReconnect } = useNetworkStatus();
  const [showIndicator, setShowIndicator] = useState(!isOnline);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setShowIndicator(!isOnline);
  }, [isOnline]);

  if (!showIndicator) {
    return null;
  }

  return (
    <Snackbar
      open={showIndicator}
      anchorOrigin={{ 
        vertical: isMobile ? 'top' : 'bottom', 
        horizontal: 'center' 
      }}
      sx={{
        '& .MuiSnackbarContent-root': {
          backgroundColor: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
          minWidth: isMobile ? '90vw' : 'auto',
        },
      }}
    >
      <Alert 
        severity="warning"
        icon={<OfflineIcon />}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={attemptReconnect}
            sx={{ color: 'inherit' }}
          >
            <RefreshIcon />
          </IconButton>
        }
        sx={{ 
          width: '100%',
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('common.offline', 'You are offline')}
          </Typography>
          {isSlowConnection && (
            <Typography variant="caption">
              {t('common.slowConnection', 'Slow connection detected')}
            </Typography>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
};

// Progress persistence hook
export const useProgressPersistence = (taskId) => {
  const { saveOffline, loadOffline, clearOffline } = useOfflineStorage(`task_progress_${taskId}`);
  const [progress, setProgress] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const saveProgress = useCallback(async (progressData) => {
    const dataToSave = {
      ...progressData,
      taskId,
      lastSaved: Date.now(),
    };
    
    await saveOffline(dataToSave);
    setProgress(dataToSave);
  }, [saveOffline, taskId]);

  const restoreProgress = useCallback(async () => {
    setIsRestoring(true);
    try {
      const savedProgress = await loadOffline(2 * 60 * 60 * 1000); // 2 hours max age
      
      if (savedProgress && savedProgress.taskId === taskId) {
        setProgress(savedProgress);
        return savedProgress;
      }
    } catch (error) {
      console.error('Failed to restore progress:', error);
    } finally {
      setIsRestoring(false);
    }
    return null;
  }, [loadOffline, taskId]);

  const clearProgress = useCallback(async () => {
    await clearOffline();
    setProgress(null);
  }, [clearOffline]);

  return {
    progress,
    isRestoring,
    saveProgress,
    restoreProgress,
    clearProgress,
  };
};

export default {
  useNetworkStatus,
  useOfflineStorage,
  useProgressPersistence,
  MobileTaskSkeleton,
  MobileLoadingState,
  OfflineIndicator,
};