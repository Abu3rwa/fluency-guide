import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocalizationProvider,
  DatePicker
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { getSessionTypeNameString } from '../../../utils/sessionLocalization';
import {
  Check as CheckIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useSessionBooking } from '../hooks';
import TermsAgreement from '../shared/TermsAgreement';

const QuickBookingDialog = ({ open, onClose, onBookingSuccess, preSelectedSessionType }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { currentUser: user } = useAuth();
  
  // Use session booking hook for logic
  const {
    step,
    loading,
    submitting,
    sessionTypes,
    selectedSessionType,
    selectedDate,
    selectedTime,
    availableSlots,
    guestInfo,
    errors,
    loadSessionTypes,
    handleSessionSelect,
    handleGuestInfoChange,
    setSelectedDate,
    setSelectedTime,
    submitBooking,
    resetBookingForm,
    initializeWithSessionType,
    goBackStep
  } = useSessionBooking({
    onBookingSuccess: (bookingDetails) => {
      if (onBookingSuccess) {
        onBookingSuccess(bookingDetails);
      }
      handleClose();
    },
    onBookingError: (error) => {
      console.error('Booking error:', error);
    }
  });

  const [termsAgreed, setTermsAgreed] = React.useState(false);

  // Load session types when dialog opens
  useEffect(() => {
    if (open) {
      if (preSelectedSessionType) {
        initializeWithSessionType(preSelectedSessionType);
      } else {
        loadSessionTypes();
        resetBookingForm();
      }
    }
  }, [open, preSelectedSessionType]);

  // Handle booking submission
  const handleSubmitBooking = async () => {
    const result = await submitBooking();
    if (!result.success && result.errors) {
      console.error('Booking validation errors:', result.errors);
    }
    if (!termsAgreed) {
      console.error('Terms agreement required');
    }
  };

  const handleClose = () => {
    resetBookingForm();
    setTermsAgreed(false);
    onClose();
  };

  const getSessionName = (sessionType) => {
    const name = sessionType?.name;
    if (!name) return t('sessions.booking.sessionTypes.unnamedSession', 'Unnamed Session');
    if (typeof name === 'string') return name;
    if (typeof name === 'object') {
      const currentLang = i18n.language || 'en';
      return name[currentLang] || name.en || name.ar || t('sessions.booking.sessionTypes.unnamedSession', 'Unnamed Session');
    }
    return t('sessions.booking.sessionTypes.unnamedSession', 'Unnamed Session');
  };

  const getSessionDescription = (sessionType) => {
    const desc = sessionType?.description;
    if (!desc) return t('sessions.booking.sessionTypes.professionalSession', 'Professional session');
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object') {
      const currentLang = i18n.language || 'en';
      return desc[currentLang] || desc.en || desc.ar || t('sessions.booking.sessionTypes.professionalSession', 'Professional session');
    }
    return t('sessions.booking.sessionTypes.professionalSession', 'Professional session');
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
          backdropFilter: 'blur(20px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {step === 1 
          ? t('sessions.booking.quickDialog.selectSession', 'Select a Session Type')
          : t('sessions.booking.dialog.title', 'Book Session:') + ' ' + getSessionName(selectedSessionType)
        }
      </DialogTitle>
      
      <DialogContent sx={{ minHeight: 400, p: 3 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              {t('sessions.booking.quickDialog.loadingSessions', 'Loading available sessions...')}
            </Typography>
          </Box>
        ) : step === 1 ? (
          // Step 1: Session Selection
          <Box>
            {sessionTypes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('sessions.booking.sessionTypes.noSessionTypes', 'No session types available')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('sessions.booking.sessionTypes.instructorsHaventCreated', 'Instructors haven\'t created any session types yet')}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {sessionTypes.slice(0, 6).map((sessionType) => (
                  <Grid item xs={12} sm={6} key={sessionType.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8]
                        }
                      }}
                      onClick={() => handleSessionSelect(sessionType)}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar src={sessionType.instructorAvatar} sx={{ mr: 2, width: 40, height: 40 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {sessionType.instructorName}
                            </Typography>
                            {sessionType.instructorRating > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarIcon sx={{ fontSize: 14, color: 'gold' }} />
                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                  {sessionType.instructorRating.toFixed(1)}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {getSessionName(sessionType)}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                          {getSessionDescription(sessionType)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={`${sessionType.duration} ${t('sessions.booking.sessionTypes.min', 'min')}`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="subtitle2" color="primary" fontWeight={600}>
                            {sessionType.currency} {sessionType.price}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                        <Button 
                          size="small" 
                          fullWidth 
                          variant="outlined"
                          endIcon={<ArrowForwardIcon />}
                        >
                          {t('sessions.booking.sessionTypes.bookNow', 'Book Now')}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          // Step 2: Booking Details
          <Grid container spacing={3}>
            {/* Session Info */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('sessions.booking.dialog.sessionDetails', 'Session Details')}
                </Typography>
                <Typography>
                  <strong>{t('sessions.shared.instructor', 'Instructor')}:</strong> {selectedSessionType?.instructorName}
                </Typography>
                <Typography>
                  <strong>{t('sessions.booking.dialog.duration', 'Duration')}:</strong> {selectedSessionType?.duration} {t('common.minutes', 'minutes')}
                </Typography>
                <Typography>
                  <strong>{t('sessions.booking.dialog.price', 'Price')}:</strong> {selectedSessionType?.currency} {selectedSessionType?.price}
                </Typography>
              </Paper>
            </Grid>

            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('sessions.booking.dialog.selectDate', 'Select Date')}
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('sessions.shared.date', 'Date')}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={dayjs()}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      error: !!errors.dateTime,
                      helperText: errors.dateTime 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Time Selection */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('sessions.booking.dialog.selectTime', 'Select Time')}
              </Typography>
              <Grid container spacing={1}>
                {availableSlots.map((time) => (
                  <Grid item xs={6} key={time}>
                    <Button
                      variant={selectedTime === time ? 'contained' : 'outlined'}
                      fullWidth
                      size="small"
                      onClick={() => setSelectedTime(time)}
                      sx={{ mb: 1, fontSize: '0.75rem' }}
                    >
                      {time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('sessions.booking.dialog.contactInformation', 'Contact Information')}
              </Typography>
              <Grid container spacing={2}>
                {!user && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('sessions.booking.dialog.fullName', 'Full Name')}
                        value={guestInfo.name}
                        onChange={(e) => handleGuestInfoChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('sessions.booking.dialog.email', 'Email')}
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        size="small"
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('sessions.booking.dialog.whatsappPhone', 'WhatsApp Phone Number')}
                    value={guestInfo.phone}
                    onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone || t('sessions.booking.dialog.phoneHelper', 'We\'ll contact you via WhatsApp to confirm your booking')}
                    placeholder={t('sessions.booking.dialog.phonePlaceholder', '+218 91 234 5678')}
                    size="small"
                  />
                </Grid>
              </Grid>
              <TermsAgreement
                checked={termsAgreed}
                onChange={setTermsAgreed}
                required={true}
              />
            </Grid>

            {/* Error Alert */}
            {errors.submit && (
              <Grid item xs={12}>
                <Alert severity="error">{errors.submit}</Alert>
              </Grid>
            )}

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('sessions.booking.dialog.bookingSummary', 'Booking Summary')}
                  </Typography>
                  <Typography>
                    <strong>{t('sessions.booking.dialog.dateTimeLabel', 'Date & Time:')}</strong> {selectedDate.format('MMMM DD, YYYY')} at {selectedTime}
                  </Typography>
                  <Typography>
                    <strong>{t('sessions.booking.dialog.contactLabel', 'Contact:')}</strong> {guestInfo.name || user?.displayName} • {guestInfo.phone}
                  </Typography>
                  <Typography>
                    <strong>{t('sessions.booking.dialog.totalLabel', 'Total:')}</strong> {selectedSessionType?.currency} {selectedSessionType?.price}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        {step === 2 && !preSelectedSessionType && (
          <Button onClick={goBackStep}>
            {t('common.back', 'Back')}
          </Button>
        )}
        <Button onClick={handleClose}>
          {t('common.cancel', 'Cancel')}
        </Button>
        {step === 2 && (
          <Button
            variant="contained"
            onClick={handleSubmitBooking}
            disabled={submitting || !selectedDate || !selectedTime || !termsAgreed}
            startIcon={submitting ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {submitting 
              ? t('sessions.booking.dialog.submitting', 'Submitting...') 
              : t('sessions.booking.dialog.confirmBooking', 'Confirm Booking')
            }
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuickBookingDialog;