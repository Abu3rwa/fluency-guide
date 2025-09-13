import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
dayjs.extend(weekday);
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../utils/rtlUtils';
import { isSameDay } from '../../../utils/timeUtils';
import { useAuth } from '../../../contexts/AuthContext';
import { availabilityService } from '../../../services/sessionService';
import { updateInstructorAvailability } from '../../../services/userService';
import { useAvailabilityManager } from '../hooks/useAvailabilityManager';

import DatePicker from '../shared/DatePicker';
import TimeSlotPicker from '../shared/TimeSlotPicker';

const InstructorAvailabilityManager = ({ 
  currentAvailability = [], 
  onSave = () => {},
  loading = false
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = useRTL();
  const { currentUser } = useAuth();
  
  // Database integration state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [availabilityData, setAvailabilityData] = useState(currentAvailability);
  const [initialDate] = useState(new Date(2025, 8, 6)); // September 6, 2025
  
  // Use the availability manager hook for UI logic
  const {
    selectedDate,
    selectedSlots,
    recurringPattern,
    timeZone,
    isRecurring,
    savedAvailability,
    conflictWarning,
    weekDates,
    TIME_SLOTS,
    setSelectedDate: hookSetSelectedDate,
    setSelectedSlots,
    setRecurringPattern,
    setTimeZone,
    setIsRecurring,
    handleDateSelect: hookHandleDateSelect,
    handleSlotSelect: hookHandleSlotSelect,
    handleSlotSelectMultiple,
    isSlotAvailable,
    clearSelections
  } = useAvailabilityManager(availabilityData);
  
  // Set the initial date when component mounts
  React.useEffect(() => {
    hookSetSelectedDate(initialDate);
  }, []);

  // Load existing availability data when component mounts or user changes
  useEffect(() => {
    const loadAvailabilityData = async () => {
      if (!currentUser?.uid) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError('');
        
        // Get availability for current week - expand range to ensure we catch all data
        const weekStart = dayjs(selectedDate).startOf('week').weekday(1); // Monday start
        const weekEnd = dayjs(selectedDate).endOf('week').weekday(1);
        
        // Also get a broader range to ensure we don't miss any data
        const extendedStart = weekStart.subtract(7, 'day').toDate();
        const extendedEnd = weekEnd.add(7, 'day').toDate();
        
        const availability = await availabilityService.getForInstructor(
          currentUser.uid,
          extendedStart,
          extendedEnd
        );
        
        console.log('Loaded availability data:', availability);
        console.log('Week start:', weekStart);
        console.log('Week end:', weekEnd);
        
        let convertedAvailability;
        if (availability.length === 0 && currentAvailability.length > 0) {
          // Fallback to user doc availability if service fetch is empty
          console.log('Service fetch empty, falling back to user doc availability:', currentAvailability);
          convertedAvailability = currentAvailability.map(slot => ({
            ...slot,
            instructorId: currentUser.uid,
            id: slot.id || `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: slot.date ? (slot.date.toDate ? dayjs(slot.date.toDate()) : dayjs(slot.date)) : undefined,
            startTime: slot.startTime ? (slot.startTime.toDate ? dayjs(slot.startTime.toDate()) : dayjs(slot.startTime)) : undefined,
            endTime: slot.endTime ? (slot.endTime.toDate ? dayjs(slot.endTime.toDate()) : dayjs(slot.endTime)) : undefined,
            startDate: slot.startDate ? (slot.startDate.toDate ? dayjs(slot.startDate.toDate()) : dayjs(slot.startDate)) : (slot.date ? dayjs(slot.date) : undefined)
          })).filter(slot => slot.date && slot.startTime && slot.endTime); // Filter out invalid slots
        } else {
          // Convert Firebase Timestamps to dayjs objects if needed
          convertedAvailability = availability.map(slot => ({
            ...slot,
            date: slot.date?.toDate ? dayjs(slot.date.toDate()) : dayjs(slot.date),
            startTime: slot.startTime?.toDate ? dayjs(slot.startTime.toDate()) : dayjs(slot.startTime),
            endTime: slot.endTime?.toDate ? dayjs(slot.endTime.toDate()) : dayjs(slot.endTime),
            startDate: slot.startDate?.toDate ? dayjs(slot.startDate.toDate()) : dayjs(slot.startDate || slot.date)
          }));
        }
        
        console.log('Converted availability data:', convertedAvailability);
        console.log('Number of availability slots:', convertedAvailability.length);
        setAvailabilityData(convertedAvailability);
      } catch (err) {
        console.error('Error loading availability data:', err);
        setError('Failed to load existing availability. You can still add new availability.');
      } finally {
        setLoadingData(false);
      }
    };

    loadAvailabilityData();
  }, [currentUser?.uid, selectedDate]);

  // Wrapper functions to integrate hook methods with component logic
  const handleDateSelect = (date) => {
    hookHandleDateSelect(date);
    // Update the selectedDate for useEffect to trigger data reload
    hookSetSelectedDate(date);
  };

  const handleSlotSelect = (slotsOrSlot) => {
    // Use the hook's multi-select handler which can handle both arrays and single slots
    handleSlotSelectMultiple(slotsOrSlot);
  };

  // Helper function to parse time slot string to dayjs object
  const parseTimeSlot = (timeSlot) => {
    const [time, period] = timeSlot.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let adjustedHours = hours;
    
    if (period === 'PM' && hours !== 12) {
      adjustedHours = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      adjustedHours = 0;
    }
    
    const slotDate = dayjs(selectedDate);
    return slotDate.set('hour', adjustedHours).set('minute', minutes).set('second', 0).set('millisecond', 0);
  };

  // Database-integrated save function
  const handleSave = async () => {
    if (!currentUser?.uid) {
      setError(t('auth.notAuthenticated', 'You must be logged in to save availability'));
      return;
    }

    if (selectedSlots.length === 0) {
      setError(t('sessions.availability.noSlotsSelected', 'Please select at least one time slot'));
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const newAvailabilitySlots = [];
      
      // Convert selected time slots to availability objects
      for (const slot of selectedSlots) {
        const slotTime = parseTimeSlot(slot);
        const endTime = slotTime.add(30, 'minute'); // 30 minutes later
        
        const availabilitySlot = {
          instructorId: currentUser.uid,
          date: dayjs(selectedDate),
          startTime: slotTime,
          endTime: endTime,
          isRecurring: isRecurring,
          timeZone: timeZone,
          isPattern: isRecurring,
          patternType: isRecurring ? recurringPattern : null,
          daysOfWeek: isRecurring ? [selectedDate.getDay()] : [],
          startDate: dayjs(selectedDate)
        };
        
        // Save to availability service
        const availabilityId = await availabilityService.create(availabilitySlot);
        
        newAvailabilitySlots.push({
          ...availabilitySlot,
          id: availabilityId
        });
      }
      
      // Update local state
      const updatedAvailability = [...savedAvailability, ...newAvailabilitySlots];
      setAvailabilityData(updatedAvailability);
      
      // Also update user's availability summary
      await updateInstructorAvailability(currentUser.uid, {
        timeZone: timeZone,
        slots: updatedAvailability,
        lastUpdated: new Date()
      });
      
      // Clear selections using hook method
      clearSelections();
      
      // Notify parent component
      onSave(updatedAvailability);
      
    } catch (err) {
      console.error('Error saving availability:', err);
      setError(t('sessions.availability.saveError', 'Failed to save availability. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  // Database-integrated clear function
  const handleClear = async () => {
    if (!currentUser?.uid) {
      setError(t('auth.notAuthenticated', 'You must be logged in to clear availability'));
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      // Get availability slots for the selected week
      const slotsToDelete = savedAvailability.filter(availability =>
        weekDates.some(date => dayjs(availability.date).isSame(dayjs(date), 'day'))
      );
      
      // Delete each slot from the database
      for (const slot of slotsToDelete) {
        if (slot.id && !slot.id.startsWith('slot-')) { // Only delete real database entries
          await availabilityService.delete(slot.id);
        }
      }
      
      // Update local state
      const updatedAvailability = savedAvailability.filter(availability =>
        !weekDates.some(date => dayjs(availability.date).isSame(dayjs(date), 'day'))
      );
      
      setAvailabilityData(updatedAvailability);
      
      // Update user's availability summary
      await updateInstructorAvailability(currentUser.uid, {
        timeZone: timeZone,
        slots: updatedAvailability,
        lastUpdated: new Date()
      });
      
      // Notify parent component
      onSave(updatedAvailability);
      
    } catch (err) {
      console.error('Error clearing availability:', err);
      setError(t('sessions.availability.clearError', 'Failed to clear availability. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleRecurringChange = (event, newRecurring) => {
    setRecurringPattern(newRecurring);
    setIsRecurring(newRecurring !== 'none');
  };

  return (
    <Paper sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Typography variant="h6" gutterBottom>
        {t('sessions.availability.manageTitle', 'Manage Availability')}
      </Typography>
      
      {loadingData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading existing availability...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!loadingData && (
        <>
          {conflictWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {conflictWarning}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={recurringPattern}
              exclusive
              onChange={handleRecurringChange}
              aria-label={t('sessions.availability.recurringPattern', 'Recurring pattern')}
              size="small"
              sx={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
              <ToggleButton value="none" aria-label={t('sessions.availability.oneTime', 'One-time')}>
                {t('sessions.availability.oneTime', 'One-time')}
              </ToggleButton>
              <ToggleButton value="weekly" aria-label={t('sessions.availability.weeklyRecurring', 'Weekly Recurring')}>
                {t('sessions.availability.weeklyRecurring', 'Weekly Recurring')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <DatePicker
            onSelect={handleDateSelect}
            selectedDate={selectedDate}
            minDate={new Date()}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('sessions.availability.selectSlots', 'Select Available Time Slots for Week')}
            </Typography>
            
            <TimeSlotPicker
              date={selectedDate}
              onSelect={handleSlotSelect}
              selectedSlots={selectedSlots}
              multiSelect={true}
              disabledSlots={weekDates.flatMap(date => 
                savedAvailability
                  .filter(availability => {
                    // Ensure availability has a valid date
                    if (!availability.date) return false;
                    
                    try {
                      // Handle both dayjs objects and Date objects
                      let availabilityDate;
                      if (availability.date._isAMomentObject || availability.date.format) {
                        // It's a dayjs object
                        availabilityDate = availability.date.toDate();
                      } else {
                        // It's a Date object or timestamp
                        availabilityDate = new Date(availability.date);
                      }
                      
                      return isSameDay(availabilityDate, date);
                    } catch (error) {
                      console.warn('Invalid date in availability:', availability.date, error);
                      return false;
                    }
                  })
                  .map(availability => {
                    try {
                      // Convert back to time slot format
                      const startTime = dayjs(availability.startTime);
                      if (!startTime.isValid()) {
                        console.warn('Invalid startTime in availability:', availability.startTime);
                        return null;
                      }
                      
                      const hours = startTime.hour();
                      const minutes = startTime.minute();
                      const period = hours >= 12 ? 'PM' : 'AM';
                      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                    } catch (error) {
                      console.warn('Error converting availability to time slot:', availability, error);
                      return null;
                    }
                  })
                  .filter(slot => slot !== null) // Remove null values
              )}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={selectedSlots.length === 0 || saving || loading}
              sx={{ mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }}
            >
              {saving ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  {t('common.saving', 'Saving...')}
                </>
              ) : (
                t('sessions.availability.save', 'Save Availability')
              )}
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClear}
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  {t('common.clearing', 'Clearing...')}
                </>
              ) : (
                t('sessions.availability.clearWeek', 'Clear Week')
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('sessions.availability.currentWeek', 'Current Availability for Week')}
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mt: 2 }}>
          {weekDates.map((date, index) => {
            console.log(`Processing date ${dayjs(date).format('YYYY-MM-DD')} with ${savedAvailability.length} total availability slots`);
            
            const dayAvailability = savedAvailability.filter(availability => {
              try {
                console.log(`Checking availability slot:`, {
                  id: availability.id,
                  date: availability.date,
                  startTime: availability.startTime,
                  isPattern: availability.isPattern
                });
                
                // For regular slots, check if it's on this date
                if (!availability.isPattern) {
                  if (!availability.date) {
                    console.log(`Slot ${availability.id}: no date, excluding`);
                    return false;
                  }
                  
                  // Handle both dayjs objects and Date objects
                  let availabilityDate;
                  if (availability.date._isAMomentObject || availability.date.format) {
                    // It's a dayjs object
                    availabilityDate = availability.date;
                  } else {
                    // It's a Date object or timestamp
                    availabilityDate = dayjs(availability.date);
                  }
                  
                  if (!availabilityDate.isValid()) {
                    console.log(`Slot ${availability.id}: invalid date, excluding`);
                    return false;
                  }
                  
                  const isMatch = availabilityDate.isSame(dayjs(date), 'day');
                  console.log(`Slot ${availability.id}: date ${availabilityDate.format('YYYY-MM-DD')} vs ${dayjs(date).format('YYYY-MM-DD')}, match: ${isMatch}`);
                  return isMatch;
                }
                
                // For patterns, check if this date matches the pattern
                if (availability.isPattern) {
                  if (availability.patternType === 'weekly') {
                    // Check if this day is in the pattern's days of week
                    const match = availability.daysOfWeek && availability.daysOfWeek.includes(date.getDay());
                    console.log(`Pattern slot ${availability.id}: day ${date.getDay()}, daysOfWeek: ${availability.daysOfWeek}, match: ${match}`);
                    return match;
                  }
                }
                
                return false;
              } catch (error) {
                console.warn('Error filtering availability:', availability, error);
                return false;
              }
            });
            
            console.log(`Found ${dayAvailability.length} slots for ${dayjs(date).format('YYYY-MM-DD')}:`, dayAvailability);
            
            return (
              <Box key={date.toISOString()}>
                <Typography variant="caption" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {dayjs(date).format('ddd, MMM D')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {dayAvailability.map((availability, idx) => {
                    try {
                      const startTime = dayjs(availability.startTime);
                      const endTime = dayjs(availability.endTime);
                      
                      // Validate the time values
                      if (!startTime.isValid() || !endTime.isValid()) {
                        console.warn('Invalid time values in availability:', availability);
                        return null;
                      }
                      
                      return (
                        <Chip
                          key={idx}
                          label={`${startTime.format('h:mm a')} - ${endTime.format('h:mm a')}`}
                          color={availability.isPattern ? "secondary" : "primary"}
                          size="small"
                          variant="outlined"
                          sx={{ alignSelf: 'start' }}
                          onClick={() => {
                            // Show details about the availability slot
                            if (availability.isPattern) {
                              alert(`${t('sessions.availability.recurringSlot', 'Recurring availability pattern')}\n\n${t('sessions.availability.startTime', 'Start time')}: ${startTime.format('h:mm a')}\n${t('sessions.availability.endTime', 'End time')}: ${endTime.format('h:mm a')}\n${t('sessions.availability.pattern', 'Pattern')}: ${availability.patternType}`);
                            } else {
                              const availabilityDate = availability.date._isAMomentObject || availability.date.format 
                                ? availability.date 
                                : dayjs(availability.date);
                              
                              if (availabilityDate.isValid()) {
                                alert(`${t('sessions.availability.availabilitySlot', 'Availability')}\n\n${t('sessions.availability.date', 'Date')}: ${availabilityDate.format('MMM D, YYYY')}\n${t('sessions.availability.time', 'Time')}: ${startTime.format('h:mm a')} - ${endTime.format('h:mm a')}`);
                              }
                            }
                          }}
                        />
                      );
                    } catch (error) {
                      console.warn('Error rendering availability chip:', availability, error);
                      return null;
                    }
                  }).filter(chip => chip !== null)} {/* Filter out null values */}
                  
                  {dayAvailability.length === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {t('sessions.availability.noAvailability', 'No availability')}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
        </>
      )}
    </Paper>
  );
};

export default InstructorAvailabilityManager;