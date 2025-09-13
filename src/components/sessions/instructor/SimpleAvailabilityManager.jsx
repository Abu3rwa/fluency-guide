import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Check as CheckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../utils/rtlUtils';

// Simplified time slots for better UX
const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
  '8:00 PM'
];

const DAYS_OF_WEEK = [
  'sunday', 'monday', 'tuesday', 'wednesday', 
  'thursday', 'friday', 'saturday'
];

const SimpleAvailabilityManager = ({ 
  onSave = () => {},
  currentAvailability = []
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = useRTL();
  
  const [selectedSlots, setSelectedSlots] = useState(new Map());
  const [recurringMode, setRecurringMode] = useState(false);

  // Enhanced RTL utilities
  const getFlexDirection = () => isRTL ? 'row-reverse' : 'row';
  const getRTLAlignment = (defaultAlign = 'flex-start') => {
    if (defaultAlign === 'flex-start') {
      return isRTL ? 'flex-end' : 'flex-start';
    }
    if (defaultAlign === 'flex-end') {
      return isRTL ? 'flex-start' : 'flex-end';
    }
    return defaultAlign;
  };
  const getRTLTextProps = () => ({
    textAlign: isRTL ? 'right' : 'left',
    direction: isRTL ? 'rtl' : 'ltr'
  });

  // Handle slot selection
  const handleSlotToggle = (day, time) => {
    const key = `${day}-${time}`;
    const newSlots = new Map(selectedSlots);
    
    if (newSlots.has(key)) {
      newSlots.delete(key);
    } else {
      newSlots.set(key, { day, time, recurring: recurringMode });
    }
    
    setSelectedSlots(newSlots);
  };

  // Check if slot is selected
  const isSlotSelected = (day, time) => {
    return selectedSlots.has(`${day}-${time}`);
  };

  // Handle save
  const handleSave = () => {
    const availability = Array.from(selectedSlots.values()).map(slot => ({
      ...slot,
      id: `${slot.day}-${slot.time}-${Date.now()}`,
      createdAt: new Date()
    }));
    
    onSave(availability);
    setSelectedSlots(new Map());
  };

  // Handle clear
  const handleClear = () => {
    setSelectedSlots(new Map());
  };

  // Get day name for display
  const getDayName = (day) => {
    return t(`days.${day}`, day.charAt(0).toUpperCase() + day.slice(1));
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        direction: isRTL ? 'rtl' : 'ltr',
        borderRadius: 2
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexDirection: getFlexDirection()
          }}
        >
          <ScheduleIcon sx={{ order: isRTL ? 1 : 0 }} />
          <span sx={{ order: isRTL ? 0 : 1 }}>
            {t('sessions.availability.title', 'Manage Availability')}
          </span>
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            ...getRTLTextProps(),
            lineHeight: 1.5
          }}
        >
          {t('sessions.availability.simpleDesc', 'Select your available time slots. Click on time slots to toggle availability.')}
        </Typography>
      </Box>

      {/* Recurring Mode Toggle - Enhanced RTL */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: getRTLAlignment('flex-start') }}>
        <ToggleButtonGroup
          value={recurringMode ? 'recurring' : 'oneTime'}
          exclusive
          onChange={(e, value) => setRecurringMode(value === 'recurring')}
          size="small"
          sx={{ 
            direction: isRTL ? 'rtl' : 'ltr',
            '& .MuiToggleButton-root': {
              px: 2,
              ...getRTLTextProps()
            }
          }}
        >
          <ToggleButton value="oneTime">
            {t('sessions.availability.oneTime', 'One-time')}
          </ToggleButton>
          <ToggleButton value="recurring">
            {t('sessions.availability.weeklyRecurring', 'Weekly Recurring')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Availability Grid */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {DAYS_OF_WEEK.map((day) => (
            <Grid item xs={12} key={day}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5)
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    ...getRTLTextProps(),
                    mb: 2
                  }}
                >
                  {getDayName(day)}
                </Typography>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1,
                    justifyContent: getRTLAlignment('flex-start')
                  }}
                >
                  {TIME_SLOTS.map((time) => (
                    <Chip
                      key={`${day}-${time}`}
                      label={time}
                      onClick={() => handleSlotToggle(day, time)}
                      color={isSlotSelected(day, time) ? 'primary' : 'default'}
                      variant={isSlotSelected(day, time) ? 'filled' : 'outlined'}
                      clickable
                      sx={{
                        minWidth: 80,
                        transition: 'all 0.2s ease',
                        direction: isRTL ? 'rtl' : 'ltr',
                        fontWeight: 500,
                        '& .MuiChip-label': {
                          ...getRTLTextProps(),
                          fontSize: '0.75rem'
                        },
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: theme.shadows[2]
                        },
                        '&.MuiChip-colorPrimary': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.9),
                          color: theme.palette.primary.contrastText
                        }
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Selected Slots Summary */}
      {selectedSlots.size > 0 && (
        <Box sx={{ mb: 3 }}>
          <Paper 
            sx={{ 
              p: 2, 
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
            }}
          >
            <Typography 
              variant="subtitle2" 
              gutterBottom
              sx={{ 
                ...getRTLTextProps(),
                fontWeight: 600
              }}
            >
              {t('sessions.availability.selectedSlots', 'Selected Slots')} ({selectedSlots.size})
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                justifyContent: getRTLAlignment('flex-start')
              }}
            >
              {Array.from(selectedSlots.values()).map((slot, index) => (
                <Chip
                  key={index}
                  label={`${getDayName(slot.day)} ${slot.time}`}
                  onDelete={() => handleSlotToggle(slot.day, slot.time)}
                  color="success"
                  size="small"
                  sx={{ 
                    direction: isRTL ? 'rtl' : 'ltr',
                    '& .MuiChip-label': {
                      ...getRTLTextProps(),
                      fontWeight: 500
                    },
                    '& .MuiChip-deleteIcon': {
                      marginLeft: isRTL ? '-6px' : '5px',
                      marginRight: isRTL ? '5px' : '-6px'
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Action Buttons - Enhanced RTL */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2,
          flexDirection: getFlexDirection(),
          justifyContent: getRTLAlignment('flex-start')
        }}
      >
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={selectedSlots.size === 0}
          startIcon={isRTL ? undefined : <CheckIcon />}
          endIcon={isRTL ? <CheckIcon /> : undefined}
          sx={{ 
            minWidth: 120,
            '& .MuiButton-startIcon': {
              marginLeft: isRTL ? '8px' : '0',
              marginRight: isRTL ? '0' : '8px'
            },
            '& .MuiButton-endIcon': {
              marginLeft: isRTL ? '0' : '8px',
              marginRight: isRTL ? '8px' : '0'
            }
          }}
        >
          {t('sessions.availability.save', 'Save Availability')}
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={selectedSlots.size === 0}
          startIcon={isRTL ? undefined : <ClearIcon />}
          endIcon={isRTL ? <ClearIcon /> : undefined}
          sx={{ 
            minWidth: 120,
            '& .MuiButton-startIcon': {
              marginLeft: isRTL ? '8px' : '0',
              marginRight: isRTL ? '0' : '8px'
            },
            '& .MuiButton-endIcon': {
              marginLeft: isRTL ? '0' : '8px',
              marginRight: isRTL ? '8px' : '0'
            }
          }}
        >
          {t('sessions.availability.clearSelection', 'Clear Selection')}
        </Button>
      </Box>
    </Paper>
  );
};

export default SimpleAvailabilityManager;