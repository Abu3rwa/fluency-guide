// Mobile-Specific UI Enhancement Components
// Provides mobile-optimized UI components for better touch and visual experience

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Slide,
  Grow,
  alpha,
  useTheme,
  useMediaQuery,
  Paper,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  Accessibility as AccessibilityIcon,
  TextFields as TextSizeIcon,
  Speed as SpeedIcon,
  TouchApp as TouchIcon,
  Vibration as VibrationIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// ============================================================================
// MOBILE UTILITY HOOKS AND FUNCTIONS
// ============================================================================

/**
 * Trigger haptic feedback for mobile devices
 * @param {string} type - Type of haptic feedback ('light', 'medium', 'heavy', 'selection', 'warning')
 */
export const triggerHapticFeedback = (type = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate([10, 10, 10]);
        break;
      case 'selection':
        navigator.vibrate([15, 5, 10]);
        break;
      case 'warning':
        navigator.vibrate([20, 10, 20]);
        break;
      default:
        navigator.vibrate(10);
    }
  }
};

/**
 * Hook for handling swipe gestures on mobile devices
 * @param {Function} onSwipeLeft - Callback for left swipe
 * @param {Function} onSwipeRight - Callback for right swipe
 * @param {boolean} enabled - Whether swipe gestures are enabled
 * @returns {Object} Touch event handlers
 */
export const useSwipeGesture = (onSwipeLeft, onSwipeRight, enabled = true) => {
  const startX = useRef(null);
  const startY = useRef(null);
  const threshold = 50; // Minimum distance for a swipe
  const maxVerticalDistance = 100; // Maximum vertical movement allowed

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, [enabled]);

  const handleTouchEnd = useCallback((e) => {
    if (!enabled || startX.current === null || startY.current === null) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX.current;
    const deltaY = Math.abs(endY - startY.current);

    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > threshold && deltaY < maxVerticalDistance) {
      if (deltaX > 0) {
        onSwipeRight?.();
        triggerHapticFeedback('light');
      } else {
        onSwipeLeft?.();
        triggerHapticFeedback('light');
      }
    }

    startX.current = null;
    startY.current = null;
  }, [enabled, onSwipeLeft, onSwipeRight, threshold, maxVerticalDistance]);

  return { handleTouchStart, handleTouchEnd };
};

/**
 * Hook for handling double tap gestures on mobile devices
 * @param {Function} callback - Callback function to execute on double tap
 * @param {number} delay - Maximum delay between taps (default: 300ms)
 * @returns {Function} Click handler
 */
export const useDoubleTap = (callback, delay = 300) => {
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef(null);

  const handleClick = useCallback((event) => {
    // Prevent default click behavior
    event.preventDefault();
    
    setClickCount(prev => prev + 1);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (clickCount + 1 === 2) {
        // Double tap detected
        callback?.();
        setClickCount(0);
      } else {
        // Single tap - reset count
        setClickCount(0);
      }
    }, delay);
  }, [callback, clickCount, delay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return handleClick;
};

// Enhanced Floating Action Button for mobile tasks
export const MobileTaskFAB = ({
  isPaused = false,
  onPause,
  onResume,
  onSettings,
  onHelp,
  showSpeedDial = true,
  position = { bottom: 90, right: 16 },
  ...props
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  if (!isMobile) {
    return null; // Only show on mobile
  }

  const handleSpeedDialToggle = useCallback(() => {
    setSpeedDialOpen(prev => !prev);
  }, []);

  const handleSpeedDialClose = useCallback(() => {
    setSpeedDialOpen(false);
  }, []);

  if (!showSpeedDial) {
    // Simple FAB for pause/resume
    return (
      <Fab
        color="primary"
        onClick={isPaused ? onResume : onPause}
        sx={{
          position: 'fixed',
          bottom: position.bottom,
          right: position.right,
          zIndex: theme.zIndex.speedDial,
          boxShadow: theme.shadows[8],
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
        {...props}
      >
        {isPaused ? <PlayIcon /> : <PauseIcon />}
      </Fab>
    );
  }

  const actions = [
    {
      icon: isPaused ? <PlayIcon /> : <PauseIcon />,
      name: isPaused ? t('common.resume', 'Resume') : t('common.pause', 'Pause'),
      onClick: isPaused ? onResume : onPause,
    },
    {
      icon: <SettingsIcon />,
      name: t('common.settings', 'Settings'),
      onClick: onSettings,
    },
    {
      icon: <HelpIcon />,
      name: t('common.help', 'Help'),
      onClick: onHelp,
    },
  ].filter(action => action.onClick); // Only show actions with handlers

  return (
    <SpeedDial
      ariaLabel="Task actions"
      sx={{
        position: 'fixed',
        bottom: position.bottom,
        right: position.right,
        zIndex: theme.zIndex.speedDial,
        '& .MuiFab-primary': {
          boxShadow: theme.shadows[8],
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      }}
      icon={<SpeedDialIcon />}
      onClose={handleSpeedDialClose}
      onOpen={handleSpeedDialToggle}
      open={speedDialOpen}
      direction="up"
      {...props}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => {
            action.onClick?.();
            handleSpeedDialClose();
          }}
          FabProps={{
            sx: {
              '&:active': {
                transform: 'scale(0.95)',
              },
            },
          }}
        />
      ))}
    </SpeedDial>
  );
};

// Mobile-optimized dialog component
export const MobileDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  fullScreen = false,
  slideDirection = 'up',
  maxWidth = 'sm',
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction={slideDirection} ref={ref} {...props} />;
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen || isMobile}
      maxWidth={maxWidth}
      TransitionComponent={Transition}
      keepMounted={false} // Better for mobile performance
      sx={{
        '& .MuiDialog-paper': {
          margin: isMobile ? 0 : theme.spacing(2),
          borderRadius: isMobile ? 0 : theme.spacing(2),
          maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)',
        },
      }}
      {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          {isMobile && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
                minWidth: 44,
                minHeight: 44,
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      
      <DialogContent
        sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 3,
          overflowX: 'hidden',
        }}
      >
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions
          sx={{
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 1.5,
            gap: 1,
            flexDirection: isMobile ? 'column' : 'row',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

// Mobile settings panel
export const MobileSettingsPanel = ({
  open,
  onClose,
  settings = {},
  onSettingChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const settingsItems = [
    {
      id: 'audio',
      icon: settings.audioEnabled ? <VolumeIcon /> : <VolumeOffIcon />,
      title: t('settings.audio', 'Audio'),
      description: t('settings.audioDescription', 'Enable sound effects'),
      value: settings.audioEnabled,
      type: 'boolean',
    },
    {
      id: 'hapticFeedback',
      icon: <VibrationIcon />,
      title: t('settings.hapticFeedback', 'Haptic Feedback'),
      description: t('settings.hapticDescription', 'Enable vibration feedback'),
      value: settings.hapticFeedback,
      type: 'boolean',
    },
    {
      id: 'accessibility',
      icon: <AccessibilityIcon />,
      title: t('settings.accessibility', 'Accessibility'),
      description: t('settings.accessibilityDescription', 'Enhanced accessibility features'),
      value: settings.accessibility,
      type: 'boolean',
    },
    {
      id: 'textSize',
      icon: <TextSizeIcon />,
      title: t('settings.textSize', 'Text Size'),
      description: t('settings.textSizeDescription', 'Adjust text size'),
      value: settings.textSize || 'medium',
      type: 'select',
      options: [
        { value: 'small', label: t('settings.textSizeSmall', 'Small') },
        { value: 'medium', label: t('settings.textSizeMedium', 'Medium') },
        { value: 'large', label: t('settings.textSizeLarge', 'Large') },
      ],
    },
    {
      id: 'animationSpeed',
      icon: <SpeedIcon />,
      title: t('settings.animations', 'Animations'),
      description: t('settings.animationsDescription', 'Animation speed'),
      value: settings.animationSpeed || 'normal',
      type: 'select',
      options: [
        { value: 'off', label: t('settings.animationsOff', 'Off') },
        { value: 'slow', label: t('settings.animationsSlow', 'Slow') },
        { value: 'normal', label: t('settings.animationsNormal', 'Normal') },
        { value: 'fast', label: t('settings.animationsFast', 'Fast') },
      ],
    },
  ];

  const handleSettingChange = useCallback((id, value) => {
    onSettingChange?.(id, value);
  }, [onSettingChange]);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '90vh',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Handle bar */}
        <Box
          sx={{
            width: 40,
            height: 4,
            backgroundColor: 'divider',
            borderRadius: 2,
            mx: 'auto',
            mb: 2,
          }}
        />
        
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}>
          <Typography variant="h6">
            {t('settings.title', 'Task Settings')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Settings List */}
        <List sx={{ px: 0 }}>
          {settingsItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem
                sx={{
                  px: 1,
                  py: 2,
                  minHeight: 56,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                button
                onClick={() => {
                  if (item.type === 'boolean') {
                    handleSettingChange(item.id, !item.value);
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  secondary={item.description}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 500,
                    },
                    '& .MuiListItemText-secondary': {
                      fontSize: '0.875rem',
                    },
                  }}
                />
                {item.type === 'boolean' && (
                  <Box
                    sx={{
                      width: 48,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: item.value 
                        ? theme.palette.primary.main 
                        : theme.palette.action.disabled,
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: 2,
                        left: item.value ? 22 : 2,
                        transition: 'left 0.2s',
                        boxShadow: 1,
                      }}
                    />
                  </Box>
                )}
              </ListItem>
              {index < settingsItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

// Mobile quick actions toolbar
export const MobileQuickActions = ({
  actions = [],
  position = 'bottom',
  visible = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile || !visible || actions.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        [position]: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderRadius: position === 'bottom' ? '16px 16px 0 0' : '0 0 16px 16px',
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        borderTop: position === 'bottom' ? `1px solid ${theme.palette.divider}` : 'none',
        borderBottom: position === 'top' ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          py: 1,
          px: 2,
          minHeight: 56,
        }}
      >
        {actions.map((action, index) => (
          <IconButton
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            color={action.color || 'default'}
            sx={{
              minWidth: 48,
              minHeight: 48,
              flexDirection: 'column',
              gap: 0.5,
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            {action.icon}
            {action.label && (
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {action.label}
              </Typography>
            )}
          </IconButton>
        ))}
      </Box>
    </Paper>
  );
};

// Mobile swipe hint component
export const MobileSwipeHint = ({
  visible = true,
  direction = 'horizontal',
  message,
  autoHide = true,
  autoHideDelay = 3000,
  onHide,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [show, setShow] = useState(visible);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  useEffect(() => {
    if (autoHide && show) {
      const timer = setTimeout(() => {
        setShow(false);
        onHide?.();
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, show, onHide]);

  if (!isMobile || !show) {
    return null;
  }

  return (
    <Grow in={show} timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: theme.zIndex.tooltip,
          pointerEvents: 'none',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            px: 3,
            py: 2,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          <TouchIcon 
            sx={{ 
              fontSize: 32, 
              color: 'primary.main', 
              mb: 1,
              animation: direction === 'horizontal' 
                ? 'swipeHorizontal 2s infinite'
                : 'swipeVertical 2s infinite',
              '@keyframes swipeHorizontal': {
                '0%, 100%': { transform: 'translateX(-8px)' },
                '50%': { transform: 'translateX(8px)' },
              },
              '@keyframes swipeVertical': {
                '0%, 100%': { transform: 'translateY(-8px)' },
                '50%': { transform: 'translateY(8px)' },
              },
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {message || t('common.swipeToNavigate', 'Swipe to navigate')}
          </Typography>
        </Paper>
      </Box>
    </Grow>
  );
};

export default {
  MobileTaskFAB,
  MobileDialog,
  MobileSettingsPanel,
  MobileQuickActions,
  MobileSwipeHint,
  triggerHapticFeedback,
  useSwipeGesture,
  useDoubleTap,
};