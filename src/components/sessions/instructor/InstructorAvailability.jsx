import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAvailabilityManager } from '../hooks';

const InstructorAvailability = ({ 
  availability = [], 
  onSave = () => {},
  onAdd = () => {},
  onRemove = () => {},
  onRecurringChange = () => {}
}) => {
  const { t } = useTranslation();
  
  // Use the availability manager hook for logic
  const {
    selectedDate,
    selectedSlots,
    recurringPattern,
    isRecurring,
    savedAvailability,
    conflictWarning,
    weekDates,
    TIME_SLOTS,
    setRecurringPattern,
    setIsRecurring,
    handleDateSelect,
    handleSlotSelect,
    isSlotAvailable,
    saveAvailability,
    deleteAvailabilitySlot,
    clearSelections
  } = useAvailabilityManager(availability);
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  
  // Get availability for a specific day from hook's saved availability
  const getAvailabilityForDay = (date) => {
    return savedAvailability.filter(a => 
      isSameDay(new Date(a.date), date)
    );
  };
  
  // Handle day selection for dialog
  const handleDaySelect = (date) => {
    handleDateSelect(date);
    setOpenDialog(true);
  };
  
  // Handle slot selection in dialog
  const handleTimeSlotSelect = (slot) => {
    handleSlotSelect(slot);
  };
  
  // Handle save availability
  const handleSaveAvailability = () => {
    const result = saveAvailability(onSave);
    if (result.success) {
      setOpenDialog(false);
      clearSelections();
    }
  };
  
  // Handle delete slot
  const handleDeleteSlot = (slotId) => {
    deleteAvailabilitySlot(slotId, onSave);
  };
  
  // Handle recurring pattern change
  const handleRecurringPatternChange = (pattern) => {
    setRecurringPattern(pattern);
    setIsRecurring(pattern !== 'none');
    onRecurringChange(pattern);
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('sessions.instructor.availability.title', 'Manage Availability')}
        </Typography>
        
        {/* Display conflict warning if any */}
        {conflictWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {conflictWarning}
          </Alert>
        )}
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => handleDateSelect(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
          >
            {t('sessions.instructor.availability.previousWeek', 'Previous Week')}
          </Button>
          <Typography variant="subtitle1">
            {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => handleDateSelect(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
          >
            {t('sessions.instructor.availability.nextWeek', 'Next Week')}
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {weekDates.map((date, index) => (
                  <TableCell key={index} align="center">
                    {format(date, 'EEEE')}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date, index) => (
                  <TableCell key={index} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                      {getAvailabilityForDay(date).length > 0 ? (
                        <>
                          {getAvailabilityForDay(date).map((slot, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Button 
                                variant="contained" 
                                size="small" 
                                color="primary"
                                onClick={() => handleDaySelect(date)}
                              >
                                {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                              </Button>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteSlot(slot.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </>
                      ) : (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleDaySelect(date)}
                        >
                          {t('sessions.instructor.availability.add', 'Add')}
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('sessions.instructor.availability.recurringAvailability', 'Recurring Availability')}
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel id="recurring-label">{t('sessions.instructor.availability.recurringPattern', 'Recurring Pattern')}</InputLabel>
            <Select
              labelId="recurring-label"
              value={recurringPattern}
              label={t('sessions.instructor.availability.recurringPattern', 'Recurring Pattern')}
              onChange={(e) => handleRecurringPatternChange(e.target.value)}
            >
              <MenuItem value="none">{t('sessions.instructor.availability.patterns.none', 'None')}</MenuItem>
              <MenuItem value="daily">{t('sessions.instructor.availability.patterns.daily', 'Daily')}</MenuItem>
              <MenuItem value="weekly">{t('sessions.instructor.availability.patterns.weekly', 'Weekly')}</MenuItem>
              <MenuItem value="monthly">{t('sessions.instructor.availability.patterns.monthly', 'Monthly')}</MenuItem>
            </Select>
          </FormControl>
          
          {recurringPattern !== 'none' && (
            <Box sx={{ mt: 2 }}>
              <Typography color="text.secondary" gutterBottom>
                {recurringPattern === 'daily' && t('sessions.instructor.availability.dailyRepeat', 'Your availability will repeat every day')}
                {recurringPattern === 'weekly' && t('sessions.instructor.availability.weeklyRepeat', 'Your availability will repeat every week')}
                {recurringPattern === 'monthly' && t('sessions.instructor.availability.monthlyRepeat', 'Your availability will repeat every month')}
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSaveAvailability}
                disabled={selectedSlots.length === 0}
                sx={{ mt: 1 }}
              >
                {t('sessions.instructor.availability.applyRecurringPattern', 'Apply Recurring Pattern')}
              </Button>
            </Box>
          )}
        </Box>
        
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {t('sessions.instructor.availability.selectTimeSlots', 'Select Time Slots for')} {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : ''}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* Display selected date */}
              <Typography variant="subtitle1" gutterBottom>
                {t('sessions.instructor.availability.selectedDate', 'Selected Date')}: {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : ''}
              </Typography>
              
              {/* Time slots grid */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('sessions.instructor.availability.availableTimeSlots', 'Available Time Slots')}
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                  gap: 1,
                  mt: 2 
                }}>
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlots.includes(slot);
                    const isAvailable = isSlotAvailable(selectedDate, slot);
                    
                    return (
                      <Button
                        key={slot}
                        variant={isSelected ? 'contained' : 'outlined'}
                        color={isSelected ? 'primary' : 'default'}
                        size="small"
                        onClick={() => handleTimeSlotSelect(slot)}
                        disabled={!isAvailable && !isSelected}
                        sx={{
                          fontSize: '0.75rem',
                          minWidth: '100px',
                          opacity: isAvailable || isSelected ? 1 : 0.5
                        }}
                      >
                        {slot}
                      </Button>
                    );
                  })}
                </Box>
                
                {/* Show selected slots summary */}
                {selectedSlots.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('sessions.instructor.availability.selectedSlots', 'Selected Time Slots')} ({selectedSlots.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleTimeSlotSelect(slot)}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {slot} ×
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
              
              {/* Recurring pattern selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="dialog-recurring-label">
                  {t('sessions.instructor.availability.recurringPattern', 'Recurring Pattern')}
                </InputLabel>
                <Select
                  labelId="dialog-recurring-label"
                  value={recurringPattern}
                  label={t('sessions.instructor.availability.recurringPattern', 'Recurring Pattern')}
                  onChange={(e) => handleRecurringPatternChange(e.target.value)}
                >
                  <MenuItem value="none">{t('sessions.instructor.availability.patterns.none', 'None')}</MenuItem>
                  <MenuItem value="daily">{t('sessions.instructor.availability.patterns.daily', 'Daily')}</MenuItem>
                  <MenuItem value="weekly">{t('sessions.instructor.availability.patterns.weekly', 'Weekly')}</MenuItem>
                  <MenuItem value="monthly">{t('sessions.instructor.availability.patterns.monthly', 'Monthly')}</MenuItem>
                </Select>
              </FormControl>
              
              {/* Show recurring pattern description */}
              {recurringPattern !== 'none' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {recurringPattern === 'daily' && t('sessions.instructor.availability.dailyRepeat', 'Your availability will repeat every day')}
                  {recurringPattern === 'weekly' && t('sessions.instructor.availability.weeklyRepeat', 'Your availability will repeat every week')}
                  {recurringPattern === 'monthly' && t('sessions.instructor.availability.monthlyRepeat', 'Your availability will repeat every month')}
                </Alert>
              )}
              
              {/* Show conflict warning */}
              {conflictWarning && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {conflictWarning}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              clearSelections();
            }}>
              {t('sessions.shared.cancel', 'Cancel')}
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSaveAvailability}
              disabled={selectedSlots.length === 0}
            >
              {t('sessions.instructor.availability.saveAvailability', 'Save Availability')} ({selectedSlots.length})
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default InstructorAvailability;