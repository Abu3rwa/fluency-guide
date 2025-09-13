import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { sessionService } from '../../../services/sessionService';
import { bookingService } from '../../../services/bookingService';

const SessionModificationDialog = ({ 
  open, 
  onClose, 
  session, 
  onSessionUpdated,
  mode = 'edit' // 'edit', 'cancel', 'reschedule'
}) => {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    startTime: null,
    endTime: null,
    maxStudents: 1,
    notes: '',
    cancellationReason: '',
    notifyStudents: true
  });
  
  // Dialog state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  // Initialize form data when session changes
  useEffect(() => {
    if (session) {
      setFormData({
        startTime: session.startTime ? dayjs(session.startTime) : null,
        endTime: session.endTime ? dayjs(session.endTime) : null,
        maxStudents: session.maxStudents || 1,
        notes: session.notes || '',
        cancellationReason: '',
        notifyStudents: true
      });
      
      // Load session bookings
      loadSessionBookings();
    }
  }, [session]);

  const loadSessionBookings = async () => {
    if (!session?.id) return;
    
    try {
      const sessionBookings = await bookingService.getForSession(session.id);
      setBookings(sessionBookings.filter(b => b.status === 'confirmed'));
    } catch (error) {
      console.error('Error loading session bookings:', error);
    }
  };

  const validateModification = async () => {
    if (mode === 'cancel') return true;
    
    const conflicts = [];
    
    // Check time conflicts with instructor availability
    // This would normally check against availability service
    
    // Check if new time is in the future
    if (formData.startTime && formData.startTime.isBefore(dayjs())) {
      conflicts.push(t('sessions.modification.pastTimeError'));
    }
    
    // Check if start time is before end time
    if (formData.startTime && formData.endTime && 
        formData.startTime.isAfter(formData.endTime)) {
      conflicts.push(t('sessions.modification.timeOrderError'));
    }
    
    // Check if reducing capacity below current bookings
    if (formData.maxStudents < bookings.length) {
      conflicts.push(t('sessions.modification.capacityError', { 
        current: bookings.length,
        new: formData.maxStudents 
      }));
    }
    
    setConflicts(conflicts);
    return conflicts.length === 0;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (mode === 'cancel') {
        await handleCancellation();
      } else {
        const isValid = await validateModification();
        if (!isValid) {
          setActiveStep(1); // Show conflicts step
          return;
        }
        await handleModification();
      }
      
      if (onSessionUpdated) {
        onSessionUpdated();
      }
      
      onClose();
      
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err.message || t('sessions.modification.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancellation = async () => {
    if (!formData.cancellationReason.trim()) {
      throw new Error(t('sessions.modification.cancellationReasonRequired'));
    }
    
    await sessionService.update(session.id, {
      status: 'cancelled',
      cancellationReason: formData.cancellationReason,
      cancelledAt: new Date(),
      cancelledBy: 'instructor'
    });
    
    // Update all confirmed bookings to cancelled
    for (const booking of bookings) {
      await bookingService.update(booking.id, {
        status: 'cancelled',
        cancellationReason: formData.cancellationReason
      });
    }
  };

  const handleModification = async () => {
    const updates = {
      startTime: formData.startTime.toDate(),
      endTime: formData.endTime.toDate(),
      maxStudents: formData.maxStudents,
      notes: formData.notes,
      updatedAt: new Date(),
      lastModifiedBy: 'instructor'
    };
    
    await sessionService.update(session.id, updates);
    
    // If time changed, notify students
    const timeChanged = !dayjs(session.startTime).isSame(formData.startTime) ||
                       !dayjs(session.endTime).isSame(formData.endTime);
    
    if (timeChanged && formData.notifyStudents) {
      // Create notification records for students
      // This would integrate with notification service
      console.log('Would notify students of time change');
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'cancel': return t('sessions.modification.cancelSession');
      case 'reschedule': return t('sessions.modification.rescheduleSession');
      default: return t('sessions.modification.editSession');
    }
  };

  const renderCancellationStep = () => (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t('sessions.modification.cancellationWarning', { count: bookings.length })}
        </Typography>
      </Alert>
      
      {bookings.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            {t('sessions.modification.affectedStudents')}:
          </Typography>
          <List dense>
            {bookings.map((booking) => (
              <ListItem key={booking.id}>
                <ListItemAvatar>
                  <Avatar>
                    {(booking.studentName || 'S')[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={booking.studentName || booking.userId}
                  secondary={booking.phoneNumber}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <TextField
        fullWidth
        multiline
        rows={4}
        label={t('sessions.modification.cancellationReason')}
        value={formData.cancellationReason}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          cancellationReason: e.target.value 
        }))}
        required
        error={!formData.cancellationReason.trim()}
        helperText={t('sessions.modification.cancellationReasonHelp')}
      />
    </Box>
  );

  const renderEditStep = () => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6">
              {t('sessions.modification.sessionTiming')}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <DateTimePicker
            label={t('sessions.modification.startTime')}
            value={formData.startTime}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, startTime: value }));
              // Auto-calculate end time if duration is known
              if (value && session.sessionType?.duration) {
                const endTime = value.add(session.sessionType.duration, 'minute');
                setFormData(prev => ({ ...prev, endTime }));
              }
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
            minDateTime={dayjs()}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <DateTimePicker
            label={t('sessions.modification.endTime')}
            value={formData.endTime}
            onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
            minDateTime={formData.startTime || dayjs()}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <GroupIcon color="primary" />
            <Typography variant="h6">
              {t('sessions.modification.capacity')}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('sessions.modification.maxStudents')}
            value={formData.maxStudents}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              maxStudents: parseInt(e.target.value) || 1 
            }))}
            inputProps={{ min: Math.max(1, bookings.length) }}
            helperText={t('sessions.modification.currentBookings', { count: bookings.length })}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('sessions.modification.notes')}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={t('sessions.modification.notesPlaceholder')}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );

  const renderConflictsStep = () => (
    <Box>
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('sessions.modification.validationErrors')}
        </Typography>
        {conflicts.map((conflict, index) => (
          <Typography key={index} variant="body2" sx={{ mt: 1 }}>
            • {conflict}
          </Typography>
        ))}
      </Alert>
      
      <Button 
        variant="outlined" 
        onClick={() => setActiveStep(0)}
        startIcon={<EditIcon />}
      >
        {t('sessions.modification.goBackToEdit')}
      </Button>
    </Box>
  );

  const renderStepContent = () => {
    if (mode === 'cancel') {
      return renderCancellationStep();
    }
    
    switch (activeStep) {
      case 0:
        return renderEditStep();
      case 1:
        return renderConflictsStep();
      default:
        return renderEditStep();
    }
  };

  if (!session) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: 400 } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {mode === 'cancel' ? <CancelIcon color="error" /> : <EditIcon color="primary" />}
          {getDialogTitle()}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Session Info Header */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('sessions.modification.sessionType')}
              </Typography>
              <Typography variant="body1">
                {session.sessionType?.name || t('sessions.dashboard.unknownType')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('sessions.modification.currentTime')}
              </Typography>
              <Typography variant="body1">
                {dayjs(session.startTime).format('MMM DD, YYYY HH:mm')} - {dayjs(session.endTime).format('HH:mm')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {mode !== 'cancel' && conflicts.length > 0 && (
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>{t('sessions.modification.editDetails')}</StepLabel>
            </Step>
            <Step>
              <StepLabel error={conflicts.length > 0}>
                {t('sessions.modification.reviewChanges')}
              </StepLabel>
            </Step>
          </Stepper>
        )}

        {renderStepContent()}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        
        {activeStep === 1 && mode !== 'cancel' ? (
          <Button 
            onClick={() => setActiveStep(0)}
            variant="outlined"
          >
            {t('sessions.modification.goBack')}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={mode === 'cancel' ? 'error' : 'primary'}
            disabled={loading || (mode === 'cancel' && !formData.cancellationReason.trim())}
            startIcon={mode === 'cancel' ? <CancelIcon /> : <CheckCircleIcon />}
          >
            {loading ? t('common.saving') : 
             mode === 'cancel' ? t('sessions.modification.confirmCancellation') :
             t('sessions.modification.saveChanges')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SessionModificationDialog;