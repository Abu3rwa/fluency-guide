import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
  alpha,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  LocalizationProvider, 
  DatePicker
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { getInstructors } from '../../../services/userService';
import { bookingService } from '../../../services/bookingService';
import { sessionTypeService } from '../../../services/sessionService';
import { getSessionTypeNameString } from '../../../utils/sessionLocalization';
import CreateSampleSessionTypes from '../utils/CreateSampleSessionTypes';
import { useRTL } from '../../../utils/rtlUtils';
import TermsAgreement from '../shared/TermsAgreement';
import SessionTypeCard from '../cards/SessionTypeCard';
import TimeSlotPicker from '../shared/TimeSlotPicker';
import {
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Star as StarIcon
} from '@mui/icons-material';

const StudentBookingInterface = () => {
  const { t, i18n } = useTranslation();
  const isRTL = useRTL();
  const theme = useTheme();
  const { currentUser: user } = useAuth();
  const location = useLocation();
  
  // Ref to track if data has been logged to prevent repetitive logging
  const loggedDataRef = useRef({ sessionTypes: false, instructors: false });
  
  // Main states - simplified
  const [activeTab, setActiveTab] = useState(0);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  
  // Availability data (mock for now - should be fetched from service)
  const [availabilityData, setAvailabilityData] = useState({});
  
  // Mock availability generator for demo purposes
  const generateMockAvailability = (instructorId) => {
    const availability = [];
    const today = new Date();
    
    // Generate availability for next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Random availability (70% available slots)
      const slotsPerDay = 8; // 8 time slots per day
      for (let j = 0; j < slotsPerDay; j++) {
        const hour = 9 + j; // 9 AM to 4 PM
        const datetime = new Date(date);
        datetime.setHours(hour, 0, 0, 0);
        
        availability.push({
          date: date.toISOString().split('T')[0],
          datetime: datetime.toISOString(),
          available: Math.random() > 0.3, // 70% chance of being available
          instructorId
        });
      }
    }
    
    return availability;
  };

  // Load availability data when instructors are loaded
  useEffect(() => {
    if (instructors.length > 0) {
      const newAvailabilityData = {};
      instructors.forEach(instructor => {
        newAvailabilityData[instructor.id] = generateMockAvailability(instructor.id);
      });
      setAvailabilityData(newAvailabilityData);
    }
  }, [instructors]);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day'));
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots] = useState([
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ]);
  const [guestInfo, setGuestInfo] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load instructors and active session types in parallel
        const [instructorsData, sessionTypesData] = await Promise.all([
          getInstructors(),
          sessionTypeService.getPublicActive()
        ]);
        
        setInstructors(instructorsData);
        
        // Process session types with instructor info
        const processedSessionTypes = [];
        
        // Only log if data has changed to prevent repetitive logging
        const sessionTypesChanged = sessionTypesData.length !== sessionTypes.length;
        const instructorsChanged = instructorsData.length !== instructors.length;
        
        if (sessionTypesChanged && !loggedDataRef.current.sessionTypes) {
          console.log('Session types loaded:', sessionTypesData.length);
          loggedDataRef.current.sessionTypes = true;
        }
        if (instructorsChanged && !loggedDataRef.current.instructors) {
          console.log('Instructors loaded:', instructorsData.length);
          loggedDataRef.current.instructors = true;
        }
        
        sessionTypesData.forEach(sessionType => {
          // Find the instructor for this session type
          const instructor = instructorsData.find(inst => inst.id === sessionType.instructorId || inst.id === sessionType.createdBy);
          
          if (instructor && sessionType.active) {
            processedSessionTypes.push({
              ...sessionType,
              instructorId: instructor.id,
              instructorName: instructor.displayName,
              instructorAvatar: instructor.photoURL,
              instructorRating: instructor.instructorProfile?.rating?.average || 0
            });
          } else if (sessionType.active) {
            // Handle session types without matching instructor
            console.warn('Session type without matching instructor:', sessionType);
            processedSessionTypes.push({
              ...sessionType,
              instructorId: sessionType.instructorId || sessionType.createdBy || 'unknown',
              instructorName: 'Unknown Instructor',
              instructorAvatar: null,
              instructorRating: 0
            });
          }
        });
        
        console.log('Processed session types:', processedSessionTypes.length);
        setSessionTypes(processedSessionTypes);
        
        // Check URL params
        const params = new URLSearchParams(location.search);
        const instructorId = params.get('instructorId');
        if (instructorId) {
          setActiveTab(1);
          const instructor = instructorsData.find(i => i.id === instructorId);
          if (instructor) setSearchTerm(instructor.displayName);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setSnackbar({
          open: true,
          message: 'Error loading data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [location.search, t, user]);

  // Filtering
  const filteredSessionTypes = sessionTypes.filter(st => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    
    const nameStr = getSessionTypeNameString(st, i18n.language || 'en');
    const instructorName = st.instructorName || '';
    
    return nameStr.toLowerCase().includes(s) || instructorName.toLowerCase().includes(s);
  });
  
  const filteredInstructors = instructors.filter(inst => {
    if (!searchTerm) return true;
    return inst.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handlers
  const handleBookSessionType = (sessionType) => {
    setSelectedSessionType(sessionType);
    setOpenBookingDialog(true);
  };

  const handleInstructorSelect = (instructor) => {
    setActiveTab(0);
    setSearchTerm(instructor.displayName);
  };

  const handleSubmitBooking = async () => {
    const newErrors = {};
    
    // Validate date and time selection
    if (!selectedDate || !selectedTime) {
      newErrors.dateTime = t('sessions.booking.validation.dateTimeRequired', 'Please select date and time');
    }
    
    // Validate contact information
    if (!user) {
      if (!guestInfo.name.trim()) newErrors.name = t('sessions.booking.validation.nameRequired', 'Name required');
      if (!guestInfo.email.trim()) newErrors.email = t('sessions.booking.validation.emailRequired', 'Email required');
    }
    if (!guestInfo.phone.trim()) newErrors.phone = t('sessions.booking.validation.phoneRequired', 'Phone required');
    
    if (!termsAgreed) {
      newErrors.terms = t('sessions.booking.validation.termsRequired', 'You must agree to the terms and conditions');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setSubmitting(true);
      await bookingService.create({
        userId: user?.uid || null,
        instructorId: selectedSessionType.instructorId,
        sessionTypeId: selectedSessionType.id,
        date: selectedDate.format('YYYY-MM-DD'),
        time: selectedTime,
        guestName: guestInfo.name || user?.displayName,
        guestEmail: guestInfo.email || user?.email,
        phoneNumber: guestInfo.phone,
        price: selectedSessionType.price,
        currency: selectedSessionType.currency,
        status: 'pending'
      });
      
      setSnackbar({
        open: true,
        message: t('sessions.booking.messages.bookingSubmitted', 'Booking submitted! We\'ll contact you via WhatsApp.'),
        severity: 'success'
      });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('sessions.booking.messages.errorSubmitting', 'Error submitting booking'),
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenBookingDialog(false);
    setSelectedSessionType(null);
    setSelectedDate(dayjs().add(1, 'day'));
    setSelectedTime(null);
    setErrors({});
    setTermsAgreed(false);
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)` }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
          {t('sessions.booking.title', 'Book a Private Session')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
          {t('sessions.booking.subtitle', 'Select an instructor, date, and time for your private session.')}
        </Typography>
      </Paper>

      {/* Search & Tabs */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label={t('sessions.booking.search.placeholder', 'Search session types or instructors...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label={t('sessions.booking.tabs.sessionTypes', 'Session Types')} />
          <Tab label={t('sessions.booking.tabs.instructors', 'Instructors')} />
        </Tabs>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Session Types */}
          {activeTab === 0 && (
            <>
              {filteredSessionTypes.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchTerm ? t('sessions.booking.search.noResults', 'No session types match your search') : t('sessions.booking.sessionTypes.noSessionTypes', 'No session types available')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? t('sessions.booking.search.tryAdjusting', 'Try adjusting your search terms') : t('sessions.booking.sessionTypes.instructorsHaventCreated', 'Instructors haven\'t created any session types yet')}
                  </Typography>
                  {searchTerm && (
                    <Button onClick={() => setSearchTerm('')} sx={{ mt: 2 }}>
                      {t('sessions.booking.search.clearSearch', 'Clear Search')}
                    </Button>
                  )}
                  
                  {/* Show sample session types creator for instructors */}
                  {!searchTerm && user?.isInstructor && (
                    <Box sx={{ mt: 3 }}>
                      <CreateSampleSessionTypes 
                        onSessionTypesCreated={() => {
                          // Reload data after creating sample session types
                          window.location.reload();
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {filteredSessionTypes.map((st) => (
                    <Grid item xs={12} sm={6} md={4} key={st.id}>
                      <SessionTypeCard
                        sessionType={{
                          ...st,
                          name: (() => {
                            const name = st.name;
                            if (!name) return t('sessions.booking.sessionTypes.unnamedSession', 'Unnamed Session');
                            if (typeof name === 'string') return name;
                            if (typeof name === 'object') {
                              const currentLang = i18n.language || 'en';
                              return name[currentLang] || name.en || name.ar || t('sessions.booking.sessionTypes.unnamedSession', 'Unnamed Session');
                            }
                            return t('sessions.booking.sessionTypes.unnamedSession', 'Unnamed Session');
                          })(),
                          description: (() => {
                            const desc = st.description;
                            if (!desc) return t('sessions.booking.sessionTypes.professionalSession', 'Professional session');
                            if (typeof desc === 'string') return desc;
                            if (typeof desc === 'object') {
                              const currentLang = i18n.language || 'en';
                              return desc[currentLang] || desc.en || desc.ar || t('sessions.booking.sessionTypes.professionalSession', 'Professional session');
                            }
                            return t('sessions.booking.sessionTypes.professionalSession', 'Professional session');
                          })()
                        }}
                        onBookClick={handleBookSessionType}
                        availability={availabilityData[st.instructorId]}
                        showAvailability={true}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* Instructors */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {filteredInstructors.map((inst) => (
                <Grid item xs={12} sm={6} md={4} key={inst.id}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => handleInstructorSelect(inst)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar src={inst.photoURL} sx={{ width: 56, height: 56, mr: 2 }} />
                        <Box>
                          <Typography variant="h6">{inst.displayName}</Typography>
                          <Typography variant="body2">
                            {sessionTypes.filter(st => st.instructorId === inst.id).length} {t('sessions.booking.instructors.sessionTypesCount', 'session types')}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Booking Dialog */}
      <Dialog open={openBookingDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('sessions.booking.dialog.title', 'Book Session:')} {(() => {
            const name = selectedSessionType?.name;
            if (!name) return t('sessions.booking.dialog.session', 'Session');
            if (typeof name === 'string') return name;
            if (typeof name === 'object') {
              const currentLang = i18n.language || 'en';
              return name[currentLang] || name.en || name.ar || t('sessions.booking.dialog.session', 'Session');
            }
            return t('sessions.booking.dialog.session', 'Session');
          })()}
        </DialogTitle>
        <DialogContent sx={{ minHeight: 400 }}>
          <Grid container spacing={3}>
            {/* Session Info */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                <Typography variant="h6" gutterBottom>{t('sessions.booking.dialog.sessionDetails', 'Session Details')}</Typography>
                <Typography><strong>{t('sessions.shared.instructor', 'Instructor')}:</strong> {selectedSessionType?.instructorName}</Typography>
                <Typography><strong>{t('sessions.booking.dialog.duration', 'Duration')}:</strong> {selectedSessionType?.duration} {t('common.minutes', 'minutes')}</Typography>
                <Typography><strong>{t('sessions.booking.dialog.price', 'Price')}:</strong> {selectedSessionType?.currency} {selectedSessionType?.price}</Typography>
              </Paper>
            </Grid>

            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>{t('sessions.booking.dialog.selectDate', 'Select Date')}</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('sessions.shared.date', 'Date')}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={dayjs()}
                  slotProps={{ textField: { fullWidth: true, error: !!errors.dateTime } }}
                />
              </LocalizationProvider>
              {errors.dateTime && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.dateTime}
                </Typography>
              )}
            </Grid>

            {/* Time Selection */}
            <Grid item xs={12} md={6}>
              <TimeSlotPicker
                date={selectedDate ? selectedDate.toDate() : null}
                onSelect={setSelectedTime}
                selectedSlot={selectedTime}
                availableSlots={availableSlots}
                bookedSlots={[]} // This would come from availability service
                showAvailabilityCount={true}
                compact={false}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>{t('sessions.booking.dialog.contactInformation', 'Contact Information')}</Typography>
              <Grid container spacing={2}>
                {!user && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('sessions.booking.dialog.fullName', 'Full Name')}
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                        error={!!errors.name}
                        helperText={errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('sessions.booking.dialog.email', 'Email')}
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('sessions.booking.dialog.whatsappPhone', 'WhatsApp Phone Number')}
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                    error={!!errors.phone}
                    helperText={errors.phone || t('sessions.booking.dialog.phoneHelper', 'We\'ll contact you via WhatsApp to confirm your booking')}
                    placeholder={t('sessions.booking.dialog.phonePlaceholder', '+218 91 234 5678')}
                  />
                </Grid>
              </Grid>
              <TermsAgreement
                checked={termsAgreed}
                onChange={setTermsAgreed}
                required={true}
              />
            </Grid>

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                  <Typography variant="h6" gutterBottom>{t('sessions.booking.dialog.bookingSummary', 'Booking Summary')}</Typography>
                  <Typography><strong>{t('sessions.booking.dialog.dateTimeLabel', 'Date & Time:')} </strong> {selectedDate.format('MMMM DD, YYYY')} at {selectedTime}</Typography>
                  <Typography><strong>{t('sessions.booking.dialog.contactLabel', 'Contact:')} </strong> {guestInfo.name || user?.displayName} • {guestInfo.phone}</Typography>
                  <Typography><strong>{t('sessions.booking.dialog.totalLabel', 'Total:')} </strong> {selectedSessionType?.currency} {selectedSessionType?.price}</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel', 'Cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSubmitBooking}
            disabled={submitting || !selectedDate || !selectedTime || !termsAgreed}
            startIcon={submitting ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {submitting ? t('sessions.booking.dialog.submitting', 'Submitting...') : t('sessions.booking.dialog.confirmBooking', 'Confirm Booking')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentBookingInterface;
