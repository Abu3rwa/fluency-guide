import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

/**
 * Custom hook for managing instructor availability
 * Handles time slot selection, conflict detection, and recurring patterns
 * 
 * @param {Array} currentAvailability - Current availability data
 * @returns {Object} Availability management state and handlers
 */
export const useAvailabilityManager = (currentAvailability = []) => {
  const { t } = useTranslation();
  
  // Time slots configuration
  const TIME_SLOTS = useMemo(() => [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
  ], []);

  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [recurringPattern, setRecurringPattern] = useState('none');
  const [timeZone, setTimeZone] = useState('Africa/Tripoli'); // Libya timezone
  const [isRecurring, setIsRecurring] = useState(false);
  const [savedAvailability, setSavedAvailability] = useState(currentAvailability);
  const [conflictWarning, setConflictWarning] = useState('');
  
  // Update savedAvailability when currentAvailability prop changes
  useEffect(() => {
    console.log('useAvailabilityManager: currentAvailability changed:', currentAvailability);
    setSavedAvailability(currentAvailability);
  }, [currentAvailability]);

  // Get current week dates based on selected date
  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
    }
    
    return dates;
  };

  const weekDates = getWeekDates();

  // Check if two time slots overlap
  const isTimeConflict = (slot1Start, slot1End, slot2Time) => {
    const slot2Start = new Date(slot2Time);
    const slot2End = new Date(slot2Time);
    slot2End.setMinutes(slot2End.getMinutes() + 30);
    
    // Convert all times to Libya time (UTC+2) for consistent comparison
    const adjustToLibyaTime = (date) => {
      const libyaDate = new Date(date);
      libyaDate.setHours(libyaDate.getHours() + 2);
      return libyaDate;
    };
    
    const libyaSlot1Start = adjustToLibyaTime(slot1Start);
    const libyaSlot1End = adjustToLibyaTime(slot1End);
    const libyaSlot2Start = adjustToLibyaTime(slot2Start);
    const libyaSlot2End = adjustToLibyaTime(slot2End);
    
    return libyaSlot1Start < libyaSlot2End && libyaSlot1End > libyaSlot2Start;
  };

  // Check if a slot is available on a specific date
  const isSlotAvailable = (date, slot) => {
    const hasConflict = savedAvailability.some(availability => {
      if (availability.isPattern) {
        if (!availability.daysOfWeek.includes(date.getDay())) {
          return false;
        }
        
        const patternSlotTime = new Date(availability.startTime);
        const patternSlot = new Date(date);
        patternSlot.setHours(patternSlotTime.getHours());
        patternSlot.setMinutes(patternSlotTime.getMinutes());
        
        const patternSlotEndTime = new Date(patternSlot);
        patternSlotEndTime.setMinutes(patternSlot.getMinutes() + 30);
        
        return isTimeConflict(patternSlot, patternSlotEndTime, slot);
      }
      
      if (isSameDay(availability.date, date)) {
        const availabilitySlotTime = new Date(availability.startTime);
        const availabilitySlot = new Date(date);
        availabilitySlot.setHours(availabilitySlotTime.getHours());
        availabilitySlot.setMinutes(availabilitySlotTime.getMinutes());
        
        const availabilitySlotEndTime = new Date(availabilitySlot);
        availabilitySlotEndTime.setMinutes(availabilitySlot.getMinutes() + 30);
        
        return isTimeConflict(availabilitySlot, availabilitySlotEndTime, slot);
      }
      
      return false;
    });
    
    return !hasConflict;
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlots([]); // Clear selected slots when date changes
    setConflictWarning('');
  };

  // Handle time slot selection (multi-select version)
  const handleSlotSelectMultiple = (slots) => {
    setConflictWarning('');
    
    if (Array.isArray(slots)) {
      // Multi-select mode - replace all selected slots
      setSelectedSlots(slots);
    } else {
      // Single slot mode - toggle the slot
      handleSlotSelect(slots);
    }
  };

  // Handle time slot selection
  const handleSlotSelect = (slot) => {
    setConflictWarning('');
    
    if (selectedSlots.includes(slot)) {
      // Remove slot if already selected
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      // Check for conflicts with already selected slots
      const hasConflict = selectedSlots.some(selectedSlot => {
        const slot1 = new Date(selectedSlot);
        const slot2 = new Date(slot);
        
        const slot1End = new Date(slot1.getTime() + 1800000); // 30 minutes later
        const slot2End = new Date(slot2.getTime() + 1800000);
        
        return slot1 < slot2End && slot1End > slot2;
      });
      
      if (hasConflict) {
        setConflictWarning(
          t('sessions.availability.conflictWarning', 
            'Warning: You cannot select overlapping time slots. Please choose non-conflicting times.')
        );
        return;
      }
      
      // Check for conflicts with existing availability
      if (!isSlotAvailable(selectedDate, slot)) {
        setConflictWarning(
          t('sessions.availability.existingConflict', 
            'This time slot conflicts with existing availability.')
        );
        return;
      }
      
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  // Generate availability slots for saving
  const generateAvailabilitySlots = () => {
    const newAvailability = [];
    
    if (isRecurring) {
      // Create recurring pattern
      const pattern = {
        id: `pattern-${Date.now()}`,
        startDate: new Date(selectedDate),
        startTime: selectedSlots[0],
        endTime: new Date(new Date(selectedSlots[0]).getTime() + 1800000),
        patternType: recurringPattern,
        timeZone,
        daysOfWeek: weekDates.map(date => date.getDay()),
        isPattern: true
      };
      newAvailability.push(pattern);
    } else {
      // Create individual slots
      weekDates.forEach(date => {
        selectedSlots.forEach(slot => {
          const localDate = new Date(date);
          const slotTime = new Date(slot);
          
          const utcDate = new Date(localDate);
          utcDate.setHours(slotTime.getHours());
          utcDate.setMinutes(slotTime.getMinutes());
          utcDate.setSeconds(0);
          utcDate.setMilliseconds(0);
          
          // Adjust for Libya timezone (UTC+2)
          const utcOffset = 2 * 60;
          utcDate.setMinutes(utcDate.getMinutes() - utcOffset);
          
          const newSlot = {
            id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: utcDate,
            startTime: utcDate,
            endTime: new Date(utcDate.getTime() + 1800000),
            timeZone,
            isPattern: false
          };
          
          newAvailability.push(newSlot);
        });
      });
    }
    
    return newAvailability;
  };

  // Save availability
  const saveAvailability = (onSave) => {
    if (selectedSlots.length === 0) {
      setConflictWarning(t('sessions.availability.validation.noSlotsSelected', 'Please select at least one time slot'));
      return { success: false, error: 'No slots selected' };
    }
    
    const newAvailability = generateAvailabilitySlots();
    const updatedAvailability = [...savedAvailability, ...newAvailability];
    
    setSavedAvailability(updatedAvailability);
    
    if (onSave) {
      onSave(updatedAvailability);
    }
    
    // Reset form
    setSelectedSlots([]);
    setIsRecurring(false);
    setRecurringPattern('none');
    setConflictWarning('');
    
    return { success: true, data: updatedAvailability };
  };

  // Delete availability slot
  const deleteAvailabilitySlot = (slotId, onSave) => {
    const updatedAvailability = savedAvailability.filter(slot => slot.id !== slotId);
    setSavedAvailability(updatedAvailability);
    
    if (onSave) {
      onSave(updatedAvailability);
    }
    
    return updatedAvailability;
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedSlots([]);
    setConflictWarning('');
  };

  return {
    // State
    selectedDate,
    selectedSlots,
    recurringPattern,
    timeZone,
    isRecurring,
    savedAvailability,
    conflictWarning,
    weekDates,
    TIME_SLOTS,
    
    // Actions
    setSelectedDate,
    setSelectedSlots,
    setRecurringPattern,
    setTimeZone,
    setIsRecurring,
    handleDateSelect,
    handleSlotSelect,
    handleSlotSelectMultiple,
    isSlotAvailable,
    saveAvailability,
    deleteAvailabilitySlot,
    clearSelections,
    generateAvailabilitySlots
  };
};

export default useAvailabilityManager;