import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Typography,
  Box,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  BookOnline as BookOnlineIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../utils/rtlUtils';

const SessionTypeCard = ({ 
  sessionType, 
  onBookClick,
  getCategoryColor = () => 'default',
  availability = null, // New prop for availability data
  showAvailability = true // Flag to show/hide availability indicators
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = useRTL();

  // Enhanced RTL utilities for better Arabic support
  const getRTLSpacing = (leftValue, rightValue = 0) => {
    return isRTL 
      ? { marginLeft: rightValue, marginRight: leftValue }
      : { marginLeft: leftValue, marginRight: rightValue };
  };

  const getRTLPosition = (side, value) => {
    if (side === 'left') {
      return isRTL ? { right: value } : { left: value };
    }
    if (side === 'right') {
      return isRTL ? { left: value } : { right: value };
    }
    return {};
  };

  // RTL-aware flex alignment
  const getRTLAlignment = (defaultAlign = 'flex-start') => {
    if (defaultAlign === 'flex-start') {
      return isRTL ? 'flex-end' : 'flex-start';
    }
    if (defaultAlign === 'flex-end') {
      return isRTL ? 'flex-start' : 'flex-end';
    }
    return defaultAlign;
  };

  // RTL-aware text direction enforcement
  const getRTLTextProps = () => ({
    textAlign: isRTL ? 'right' : 'left',
    direction: isRTL ? 'rtl' : 'ltr'
  });

  // Availability calculations
  const getAvailabilityData = () => {
    if (!availability || !showAvailability) {
      return {
        status: 'unknown',
        nextSlot: null,
        totalSlots: 0,
        availableSlots: 0,
        percentage: 0
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Filter availability for the next 7 days
    const weekAvailability = availability.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= today && slotDate <= nextWeek;
    });

    const availableSlots = weekAvailability.filter(slot => slot.available).length;
    const totalSlots = weekAvailability.length;
    const percentage = totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;

    // Find next available slot
    const nextAvailableSlot = weekAvailability
      .filter(slot => slot.available && new Date(slot.datetime) > now)
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))[0];

    let status = 'unavailable';
    if (percentage > 60) status = 'high';
    else if (percentage > 30) status = 'medium';
    else if (percentage > 0) status = 'low';

    return {
      status,
      nextSlot: nextAvailableSlot,
      totalSlots,
      availableSlots,
      percentage: Math.round(percentage)
    };
  };

  const availabilityData = getAvailabilityData();

  // Get availability status color and text
  const getAvailabilityDisplay = () => {
    const { status, percentage, nextSlot, availableSlots } = availabilityData;
    
    switch (status) {
      case 'high':
        return {
          color: 'success',
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
          text: t('sessions.availability.high', 'High availability'),
          chipColor: theme.palette.success.main
        };
      case 'medium':
        return {
          color: 'warning',
          icon: <AccessTimeIcon sx={{ fontSize: 16 }} />,
          text: t('sessions.availability.medium', 'Limited slots'),
          chipColor: theme.palette.warning.main
        };
      case 'low':
        return {
          color: 'error',
          icon: <WarningIcon sx={{ fontSize: 16 }} />,
          text: t('sessions.availability.low', 'Few slots left'),
          chipColor: theme.palette.error.main
        };
      case 'unavailable':
        return {
          color: 'error',
          icon: <WarningIcon sx={{ fontSize: 16 }} />,
          text: t('sessions.availability.none', 'Fully booked'),
          chipColor: theme.palette.error.main
        };
      default:
        return {
          color: 'default',
          icon: <CalendarIcon sx={{ fontSize: 16 }} />,
          text: t('sessions.availability.unknown', 'Check availability'),
          chipColor: theme.palette.grey[500]
        };
    }
  };

  const availabilityDisplay = getAvailabilityDisplay();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        direction: isRTL ? 'rtl' : 'ltr',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[12],
          background: alpha(theme.palette.background.paper, 0.95)
        }
      }}
    >
      {/* Enhanced Availability Indicator */}
      {showAvailability && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            ...getRTLPosition('right', 16),
            zIndex: 2
          }}
        >
          <Tooltip 
            title={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {availabilityDisplay.text}
                </Typography>
                {availabilityData.status !== 'unknown' && (
                  <>
                    <Typography variant="caption" display="block">
                      {t('sessions.availability.slotsAvailable', '{{available}} of {{total}} slots available', {
                        available: availabilityData.availableSlots,
                        total: availabilityData.totalSlots
                      })}
                    </Typography>
                    {availabilityData.nextSlot && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {t('sessions.availability.nextSlot', 'Next: {{time}}', {
                          time: new Date(availabilityData.nextSlot.datetime).toLocaleDateString()
                        })}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            }
            arrow
            placement="left"
          >
            <Chip
              icon={availabilityDisplay.icon}
              label={`${availabilityData.percentage}%`}
              size="small"
              sx={{
                bgcolor: alpha(availabilityDisplay.chipColor, 0.1),
                color: availabilityDisplay.chipColor,
                border: `1px solid ${alpha(availabilityDisplay.chipColor, 0.3)}`,
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: 'inherit'
                }
              }}
            />
          </Tooltip>
        </Box>
      )}

      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Instructor Info - Enhanced RTL */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            flexDirection: isRTL ? 'row' : 'row', // Always row, but order changes
            gap: 2
          }}
        >
          <Avatar 
            src={sessionType.instructorAvatar} 
            sx={{ 
              width: 52, 
              height: 52,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: theme.shadows[2],
              order: isRTL ? 2 : 1 // Avatar on right in RTL, left in LTR
            }} 
          />
          <Box 
            sx={{ 
              flex: 1, 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 52, // Match avatar height for perfect alignment
              order: isRTL ? 1 : 2, // Text on left in RTL, right in LTR
              alignItems: isRTL ? 'flex-start' : 'flex-start' // Always align to start of container
            }}
          >
            <Typography 
              variant="subtitle2" 
              fontWeight={600} 
              color="text.primary"
              sx={{ 
                lineHeight: 1.3,
                mb: 0.5,
                textAlign: 'left', // Always left align text
                direction: 'ltr', // Keep text direction LTR for names
                width: '100%'
              }}
            >
              {sessionType.instructorName}
            </Typography>
            {sessionType.instructorRating > 0 && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 1, // Increased gap from 0.5 to 1 for better spacing
                  width: '100%'
                }}
              >
                <StarIcon 
                  sx={{ 
                    fontSize: 14, 
                    color: '#FFD700',
                    flexShrink: 0 // Prevent icon from shrinking
                  }} 
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 500,
                    textAlign: 'left',
                    direction: 'ltr',
                    marginLeft: '2px' // Extra margin for better separation
                  }}
                >
                  {sessionType.instructorRating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Availability Progress Bar */}
        {showAvailability && availabilityData.status !== 'unknown' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="textSecondary">
                {t('sessions.availability.thisWeek', 'This week')}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {availabilityData.availableSlots}/{availabilityData.totalSlots} {t('sessions.availability.slots', 'slots')}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={availabilityData.percentage}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: availabilityDisplay.chipColor
                }
              }}
            />
          </Box>
        )}
        
        {/* Session Type Info */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              ...getRTLTextProps(),
              lineHeight: 1.3
            }}
          >
            {sessionType.name}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              minHeight: 40,
              ...getRTLTextProps(),
              lineHeight: 1.5
            }}
          >
            {sessionType.description || t('sessionTypes.noDescription', 'Professional tutoring session')}
          </Typography>
        </Box>

        {/* Next Available Slot Indicator */}
        {showAvailability && availabilityData.nextSlot && (
          <Box 
            sx={{ 
              mb: 2, 
              p: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                {t('sessions.availability.nextAvailable', 'Next available: {{time}}', {
                  time: new Date(availabilityData.nextSlot.datetime).toLocaleString()
                })}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Session Details */}
        <Box sx={{ mb: 3 }}>
          {/* Duration - Enhanced RTL */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              justifyContent: getRTLAlignment('flex-start')
            }}
          >
            <ScheduleIcon 
              fontSize="small" 
              color="primary" 
              sx={{ order: isRTL ? 1 : 0 }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                ...getRTLTextProps(),
                order: isRTL ? 0 : 1,
                fontWeight: 500
              }}
            >
              {sessionType.duration} {t('sessionTypes.minutes', 'minutes')}
            </Typography>
          </Box>
          
          {/* Price - Enhanced RTL */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              justifyContent: getRTLAlignment('flex-start')
            }}
          >
            <MoneyIcon 
              fontSize="small" 
              color="success" 
              sx={{ order: isRTL ? 1 : 0 }}
            />
            <Typography 
              variant="h6" 
              color="primary.main" 
              sx={{ 
                fontWeight: 600,
                ...getRTLTextProps(),
                order: isRTL ? 0 : 1
              }}
            >
              {sessionType.currency} {sessionType.price}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => onBookClick(sessionType)}
          disabled={showAvailability && availabilityData.status === 'unavailable'}
          startIcon={isRTL ? undefined : <BookOnlineIcon />}
          endIcon={isRTL ? <BookOnlineIcon /> : undefined}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            background: showAvailability && availabilityData.status === 'unavailable'
              ? theme.palette.action.disabledBackground
              : `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
            direction: isRTL ? 'rtl' : 'ltr',
            '& .MuiButton-startIcon': {
              marginLeft: isRTL ? '8px' : '0',
              marginRight: isRTL ? '0' : '8px'
            },
            '& .MuiButton-endIcon': {
              marginLeft: isRTL ? '0' : '8px',
              marginRight: isRTL ? '8px' : '0'
            },
            '&:hover': showAvailability && availabilityData.status !== 'unavailable' ? {
              background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[8]
            } : {},
            '&:disabled': {
              color: theme.palette.text.disabled
            }
          }}
        >
          {showAvailability && availabilityData.status === 'unavailable'
            ? t('sessionTypes.fullyBooked', 'Fully Booked')
            : t('sessionTypes.bookNow', 'Book Now')
          }
        </Button>
      </CardActions>
    </Card>
  );
};

export default SessionTypeCard;