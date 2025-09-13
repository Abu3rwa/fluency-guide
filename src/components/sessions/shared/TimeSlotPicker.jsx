import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Chip, 
  Tooltip, 
  useTheme, 
  alpha, 
  Paper,
  Grid
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Block as BlockIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../utils/rtlUtils';
import { TIME_SLOTS } from './constants';

const TimeSlotPicker = ({ 
  date, 
  onSelect, 
  selectedSlot, 
  selectedSlots = [], // For multi-select support
  disabledSlots = [],
  bookedSlots = [], // Slots that are already booked
  availableSlots = [], // Slots that are available
  multiSelect = false, // Flag to enable multi-select mode
  showAvailabilityCount = false, // Show number of available slots
  compact = false // Compact view for mobile
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = useRTL();
  const [selectedTime, setSelectedTime] = useState(selectedSlot || null);
  const [selectedTimes, setSelectedTimes] = useState(selectedSlots || []);

  // Update local state when props change
  useEffect(() => {
    if (multiSelect) {
      setSelectedTimes(selectedSlots || []);
    } else {
      setSelectedTime(selectedSlot || null);
    }
  }, [selectedSlot, selectedSlots, multiSelect]);

  const handleTimeSelect = (time) => {
    if (disabledSlots.includes(time)) return;
    
    if (multiSelect) {
      // Multi-select mode
      const newSelectedTimes = selectedTimes.includes(time)
        ? selectedTimes.filter(t => t !== time)
        : [...selectedTimes, time];
      
      setSelectedTimes(newSelectedTimes);
      onSelect(newSelectedTimes); // Pass array for multi-select
    } else {
      // Single-select mode
      const newTime = selectedTime === time ? null : time;
      setSelectedTime(newTime);
      onSelect(newTime);
    }
  };

  // Get slot status for visual indicators
  const getSlotStatus = (time) => {
    if (disabledSlots.includes(time)) return 'disabled';
    if (bookedSlots.includes(time)) return 'booked';
    if (availableSlots.length > 0 && !availableSlots.includes(time)) return 'unavailable';
    return 'available';
  };

  // Get slot color based on status
  const getSlotColor = (time, isSelected) => {
    const status = getSlotStatus(time);
    
    if (isSelected) {
      return {
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderColor: theme.palette.primary.dark
      };
    }
    
    switch (status) {
      case 'available':
        return {
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          borderColor: theme.palette.success.main
        };
      case 'booked':
        return {
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          color: theme.palette.warning.main,
          borderColor: theme.palette.warning.main
        };
      case 'disabled':
      case 'unavailable':
        return {
          bgcolor: theme.palette.action.disabledBackground,
          color: theme.palette.text.disabled,
          borderColor: theme.palette.action.disabled
        };
      default:
        return {
          bgcolor: 'transparent',
          color: theme.palette.text.primary,
          borderColor: theme.palette.divider
        };
    }
  };

  // Get icon for slot status
  const getSlotIcon = (time) => {
    const status = getSlotStatus(time);
    const isSelected = multiSelect ? selectedTimes.includes(time) : selectedTime === time;
    
    if (isSelected) {
      return <CheckCircleIcon sx={{ fontSize: 16, ml: 0.5 }} />;
    }
    
    switch (status) {
      case 'available':
        return <UncheckedIcon sx={{ fontSize: 16, ml: 0.5, opacity: 0.7 }} />;
      case 'booked':
        return <ScheduleIcon sx={{ fontSize: 16, ml: 0.5, opacity: 0.7 }} />;
      case 'disabled':
      case 'unavailable':
        return <BlockIcon sx={{ fontSize: 16, ml: 0.5, opacity: 0.5 }} />;
      default:
        return null;
    }
  };

  const availableCount = TIME_SLOTS.filter(time => getSlotStatus(time) === 'available').length;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: compact ? 2 : 3, 
        borderRadius: 2, 
        direction: isRTL ? 'rtl' : 'ltr',
        background: alpha(theme.palette.background.paper, 0.9)
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TimeIcon color="primary" />
          <Typography variant="h6" sx={{ textAlign: isRTL ? 'right' : 'left', fontWeight: 600 }}>
            {date ? format(date, 'EEEE, MMMM d') : t('sessions.timeSlots.selectDate', 'Select a date')}
          </Typography>
        </Box>
        
        {showAvailabilityCount && (
          <Chip
            label={t('sessions.timeSlots.availableSlots', '{{count}} available slots', { count: availableCount })}
            size="small"
            color={availableCount > 0 ? 'success' : 'error'}
            sx={{ mb: 1 }}
          />
        )}
        
        {multiSelect && (
          <Typography variant="caption" display="block" color="textSecondary">
            {t('sessions.timeSlots.multiSelectHint', 'Click multiple time slots to select them')}
          </Typography>
        )}
      </Box>
      
      {/* Time Slots Grid */}
      <Grid container spacing={1.5}>
        {TIME_SLOTS.map((time) => {
          const isSelected = multiSelect 
            ? selectedTimes.includes(time)
            : selectedTime === time;
          const status = getSlotStatus(time);
          const isClickable = status === 'available';
          const colors = getSlotColor(time, isSelected);
          
          return (
            <Grid item xs={6} sm={4} md={3} key={time}>
              <Tooltip 
                title={
                  status === 'booked' 
                    ? t('sessions.timeSlots.booked', 'Already booked')
                    : status === 'disabled' || status === 'unavailable'
                    ? t('sessions.timeSlots.unavailable', 'Not available')
                    : status === 'available'
                    ? t('sessions.timeSlots.available', 'Available')
                    : ''
                }
                arrow
              >
                {!isClickable ? (
                  <span style={{ display: 'block', width: '100%' }}>
                    <Button
                      fullWidth
                      variant={isSelected ? 'contained' : 'outlined'}
                      disabled={!isClickable}
                      onClick={() => handleTimeSelect(time)}
                      sx={{
                        py: compact ? 1 : 1.5,
                        px: 1,
                        minHeight: compact ? 40 : 48,
                        textTransform: 'none',
                        fontWeight: isSelected ? 600 : 500,
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        border: `2px solid`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        ...colors,
                        '&:hover': isClickable ? {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4],
                          bgcolor: isSelected 
                            ? theme.palette.primary.dark 
                            : alpha(theme.palette.primary.main, 0.1),
                          borderColor: theme.palette.primary.main
                        } : {},
                        '&:disabled': {
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                        {time}
                      </Typography>
                      {getSlotIcon(time)}
                    </Button>
                  </span>
                ) : (
                  <Button
                    fullWidth
                    variant={isSelected ? 'contained' : 'outlined'}
                    disabled={!isClickable}
                    onClick={() => handleTimeSelect(time)}
                    sx={{
                      py: compact ? 1 : 1.5,
                      px: 1,
                      minHeight: compact ? 40 : 48,
                      textTransform: 'none',
                      fontWeight: isSelected ? 600 : 500,
                      borderRadius: 2,
                      transition: 'all 0.2s ease-in-out',
                      border: `2px solid`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      ...colors,
                      '&:hover': isClickable ? {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                        bgcolor: isSelected 
                          ? theme.palette.primary.dark 
                          : alpha(theme.palette.primary.main, 0.1),
                        borderColor: theme.palette.primary.main
                      } : {},
                      '&:disabled': {
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                      {time}
                    </Typography>
                    {getSlotIcon(time)}
                  </Button>
                )}
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: 1, 
              bgcolor: alpha(theme.palette.success.main, 0.2),
              border: `2px solid ${theme.palette.success.main}`
            }} 
          />
          <Typography variant="caption" color="textSecondary">
            {t('sessions.timeSlots.legend.available', 'Available')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: 1, 
              bgcolor: alpha(theme.palette.warning.main, 0.2),
              border: `2px solid ${theme.palette.warning.main}`
            }} 
          />
          <Typography variant="caption" color="textSecondary">
            {t('sessions.timeSlots.legend.booked', 'Booked')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: 1, 
              bgcolor: theme.palette.action.disabledBackground,
              border: `2px solid ${theme.palette.action.disabled}`
            }} 
          />
          <Typography variant="caption" color="textSecondary">
            {t('sessions.timeSlots.legend.unavailable', 'Unavailable')}
          </Typography>
        </Box>
      </Box>
      
      {/* Selection Summary */}
      {multiSelect && selectedTimes.length > 0 && (
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.1), 
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
        }}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            {t('sessions.timeSlots.selectedCount', 'Selected: {{count}} time slots', { count: selectedTimes.length })}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedTimes.map((time) => (
              <Chip
                key={time}
                label={time}
                size="small"
                color="primary"
                onDelete={() => handleTimeSelect(time)}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TimeSlotPicker;