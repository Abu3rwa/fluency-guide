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
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { useAuth } from '../../../contexts/AuthContext';
import { sessionService, sessionTypeService } from '../../../services/sessionService';

const SessionCreationForm = ({ open, onClose, onSessionCreated }) => {
  const { t, i18n } = useTranslation();
  const { currentUser, userData } = useAuth();
  
  // Use userData for role checks and currentUser for basic auth
  const user = userData || currentUser;
  
  // Form state
  const [formData, setFormData] = useState({
    sessionTypeId: '',
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    date: null,
    startTime: null,
    endTime: null,
    maxStudents: 1,
    price: 0,
    currency: 'LYD',
    notes: ''
  });
  
  // Component state
  const [sessionTypes, setSessionTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Load session types on mount
  useEffect(() => {
    if (open) {
      loadSessionTypes();
      resetForm();
    }
  }, [open]);
  
  const loadSessionTypes = async () => {
    try {
      const types = await sessionTypeService.getAll(user);
      setSessionTypes(types.filter(type => type.active !== false) || []);
    } catch (err) {
      console.error('Error loading session types:', err);
      setError(t('sessions.instructor.dashboard.form.validation.sessionTypeRequired'));
    }
  };
  
  const resetForm = () => {
    setFormData({
      sessionTypeId: '',
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      date: null,
      startTime: null,
      endTime: null,
      maxStudents: 1,
      price: 0,
      currency: 'LYD',
      notes: ''
    });
    setValidationErrors({});
    setError(null);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.sessionTypeId) {
      errors.sessionTypeId = t('sessions.instructor.dashboard.form.validation.sessionTypeRequired');
    }
    
    if (!formData.title.en.trim() && !formData.title.ar.trim()) {
      errors.title = t('sessions.instructor.dashboard.form.validation.titleRequired');
    }
    
    if (!formData.date || !dayjs(formData.date).isValid()) {
      errors.date = t('sessions.instructor.dashboard.form.validation.dateRequired');
    }
    
    if (!formData.startTime || !dayjs(formData.startTime).isValid()) {
      errors.startTime = t('sessions.instructor.dashboard.form.validation.startTimeRequired');
    }
    
    if (!formData.endTime || !dayjs(formData.endTime).isValid()) {
      errors.endTime = t('sessions.instructor.dashboard.form.validation.endTimeRequired');
    }
    
    if (formData.startTime && formData.endTime) {
      if (dayjs(formData.endTime).isBefore(dayjs(formData.startTime))) {
        errors.endTime = t('sessions.instructor.dashboard.form.validation.invalidTimeRange');
      }
    }
    
    if (formData.maxStudents < 1 || formData.maxStudents > 50) {
      errors.maxStudents = t('sessions.instructor.dashboard.form.validation.maxStudentsRequired');
    }
    
    if (formData.price < 0) {
      errors.price = t('sessions.instructor.dashboard.form.validation.priceRequired');
    }
    
    return errors;
  };
  
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleBilingualChange = (field, language) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleDateTimeChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-set end time if start time is set and end time is not
    if (field === 'startTime' && value && !formData.endTime) {
      const selectedSessionType = sessionTypes.find(type => type.id === formData.sessionTypeId);
      if (selectedSessionType && selectedSessionType.duration) {
        setFormData(prev => ({
          ...prev,
          endTime: dayjs(value).add(selectedSessionType.duration, 'minute')
        }));
      }
    }
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleSessionTypeChange = (sessionTypeId) => {
    const selectedType = sessionTypes.find(type => type.id === sessionTypeId);
    setFormData(prev => ({
      ...prev,
      sessionTypeId,
      price: selectedType?.price || 0,
      currency: selectedType?.currency || 'LYD',
      maxStudents: selectedType?.maxStudents || 1
    }));
  };
  
  const handleSubmit = async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare session data
      const sessionData = {
        instructorId: currentUser.uid,
        sessionTypeId: formData.sessionTypeId,
        title: formData.title,
        description: formData.description,
        date: dayjs(formData.date).toDate(),
        startTime: dayjs(formData.startTime).toDate(),
        endTime: dayjs(formData.endTime).toDate(),
        timeZone: 'Africa/Tripoli',
        maxStudents: formData.maxStudents,
        enrolledStudents: [],
        price: formData.price,
        currency: formData.currency,
        notes: formData.notes,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await sessionService.create(sessionData);
      
      if (onSessionCreated) {
        onSessionCreated();
      }
      
      onClose();
      
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };
  
  const selectedSessionType = sessionTypes.find(type => type.id === formData.sessionTypeId);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {t('sessions.instructor.dashboard.form.addSession')}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Session Type Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!validationErrors.sessionTypeId}>
                <InputLabel>{t('sessions.instructor.dashboard.form.sessionType')}</InputLabel>
                <Select
                  value={formData.sessionTypeId}
                  onChange={(e) => handleSessionTypeChange(e.target.value)}
                  label={t('sessions.instructor.dashboard.form.sessionType')}
                >
                  {sessionTypes.map((type) => {
                    // Helper function to get localized text
                    const getLocalizedText = (textObj, fallback = '') => {
                      if (!textObj) return fallback;
                      if (typeof textObj === 'string') return textObj;
                      
                      const currentLang = i18n.language || 'en';
                      return textObj[currentLang] || textObj.en || textObj.ar || fallback;
                    };
                    
                    return (
                      <MenuItem key={type.id} value={type.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography>
                            {getLocalizedText(type.name, 'Unnamed Session Type')}
                          </Typography>
                          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                            <Chip size="small" icon={<ScheduleIcon />} label={`${type.duration}min`} />
                            <Chip size="small" icon={<MoneyIcon />} label={`${type.price} ${type.currency}`} />
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
                {validationErrors.sessionTypeId && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {validationErrors.sessionTypeId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            {/* Session Title - Bilingual */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {t('sessions.instructor.dashboard.form.title')} *
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('sessions.instructor.dashboard.form.titleEn')}
                    value={formData.title.en}
                    onChange={handleBilingualChange('title', 'en')}
                    error={!!validationErrors.title}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('sessions.instructor.dashboard.form.titleAr')}
                    value={formData.title.ar}
                    onChange={handleBilingualChange('title', 'ar')}
                    error={!!validationErrors.title}
                    dir="rtl"
                  />
                </Grid>
              </Grid>
              {validationErrors.title && (
                <Typography variant="caption" color="error" sx={{ ml: 1, mt: 0.5 }}>
                  {validationErrors.title}
                </Typography>
              )}
            </Grid>

            {/* Date and Time */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Date & Time *
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <DateTimePicker
                      label={t('sessions.instructor.dashboard.form.date')}
                      value={formData.date}
                      onChange={handleDateTimeChange('date')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!validationErrors.date,
                          helperText: validationErrors.date
                        }
                      }}
                      minDate={dayjs()}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <DateTimePicker
                      label={t('sessions.instructor.dashboard.form.startTime')}
                      value={formData.startTime}
                      onChange={handleDateTimeChange('startTime')}
                      views={['hours', 'minutes']}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!validationErrors.startTime,
                          helperText: validationErrors.startTime
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <DateTimePicker
                      label={t('sessions.instructor.dashboard.form.endTime')}
                      value={formData.endTime}
                      onChange={handleDateTimeChange('endTime')}
                      views={['hours', 'minutes']}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!validationErrors.endTime,
                          helperText: validationErrors.endTime
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>
            
            {/* Session Settings */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('sessions.instructor.dashboard.form.maxStudents')}
                    value={formData.maxStudents}
                    onChange={handleInputChange('maxStudents')}
                    error={!!validationErrors.maxStudents}
                    helperText={validationErrors.maxStudents}
                    InputProps={{ inputProps: { min: 1, max: 50 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('sessions.instructor.dashboard.form.price')}
                    value={formData.price}
                    onChange={handleInputChange('price')}
                    error={!!validationErrors.price}
                    helperText={validationErrors.price}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>{t('sessions.instructor.dashboard.form.currency')}</InputLabel>
                    <Select
                      value={formData.currency}
                      onChange={handleInputChange('currency')}
                      label={t('sessions.instructor.dashboard.form.currency')}
                    >
                      <MenuItem value="LYD">LYD - Libyan Dinar</MenuItem>
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Instructor Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('sessions.instructor.dashboard.form.notes')}
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Add any special instructions or requirements for this session..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('sessions.instructor.dashboard.form.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !formData.sessionTypeId}
          startIcon={loading ? null : <AddIcon />}
        >
          {loading ? 'Creating...' : t('sessions.instructor.dashboard.form.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionCreationForm;