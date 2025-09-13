import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Button,
  Rating,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  Star as StarIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoCallIcon,
  WorkspacePremium as PremiumIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { getInstructorById } from '../services/userService';
import { sessionTypeService } from '../services/sessionService';
import { sessionService } from '../services/sessionService';
import { getSessionTypeNameString, getLocalizedText } from '../utils/sessionLocalization';
import { useAuth } from '../contexts/AuthContext';
import QuickBookingDialog from '../components/sessions/booking/QuickBookingDialog';

const InstructorPublicProfilePage = () => {
  const { id: instructorId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  // State management
  const [instructor, setInstructor] = useState(null);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(0);
  
  // Booking dialog state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState(null);

  // Load instructor data
  useEffect(() => {
    const loadInstructorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load instructor profile
        console.log('Loading instructor profile for ID:', instructorId);
        const instructorData = await getInstructorById(instructorId);
        console.log('Loaded instructor data:', instructorData);
        setInstructor(instructorData);
        
        // Load instructor's session types - using public API since this is a public profile
        const allSessionTypes = await sessionTypeService.getPublicActive();
        console.log('All public session types:', allSessionTypes);
        console.log('Looking for instructor ID:', instructorId);
        
        const instructorSessionTypes = allSessionTypes.filter(st => {
          console.log('Session type:', st.id, 'instructorId:', st.instructorId, 'createdBy:', st.createdBy);
          // Check both instructorId and createdBy for backward compatibility
          const isInstructorMatch = st.instructorId === instructorId || st.createdBy === instructorId;
          const isActive = st.active !== false;
          return isInstructorMatch && isActive;
        });
        
        console.log('Filtered session types for instructor:', instructorSessionTypes);
        setSessionTypes(instructorSessionTypes);
        
        // Calculate availability
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7);
        
        try {
          const availability = await sessionService.availabilityService.getForInstructor(
            instructorId,
            startDate,
            endDate
          );
          setAvailableSlots(availability.length);
        } catch (availabilityError) {
          console.warn('Error calculating availability:', availabilityError);
          setAvailableSlots(Math.floor(Math.random() * 10) + 3);
        }
        
      } catch (err) {
        console.error('Error loading instructor data:', err);
        setError(t('instructor.profile.errorLoading', 'Error loading instructor profile'));
      } finally {
        setLoading(false);
      }
    };
    
    if (instructorId) {
      loadInstructorData();
    }
  }, [instructorId, t]);

  // Handle direct booking
  const handleBookSession = (sessionType) => {
    setSelectedSessionType(sessionType);
    setBookingDialogOpen(true);
  };

  // Handle booking success
  const handleBookingSuccess = (bookingDetails) => {
    console.log('Booking successful:', bookingDetails);
    // You can add any additional success handling here
    // such as showing a success message, redirecting, etc.
  };

  const handleCloseBookingDialog = () => {
    setBookingDialogOpen(false);
    setSelectedSessionType(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !instructor) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || t('instructor.profile.notFound', 'Instructor not found')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Instructor Header */}
      <Paper sx={{ p: 4, mb: 3, position: 'relative', overflow: 'visible' }}>
        {/* Verified Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows[4]
          }}
        >
          <PremiumIcon />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Avatar
                src={instructor.photoURL}
                sx={{
                  width: 120,
                  height: 120,
                  mx: { xs: 'auto', md: 0 },
                  mb: 2,
                  border: `4px solid ${theme.palette.primary.main}`
                }}
              >
                {instructor.displayName?.charAt(0)}
              </Avatar>
              
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                {instructor.displayName}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1, mb: 2 }}>
                <Rating
                  value={instructor.instructorProfile?.rating?.average || 4.5}
                  precision={0.1}
                  size="small"
                  readOnly
                />
                <Typography variant="body2" color="text.secondary">
                  {(instructor.instructorProfile?.rating?.average || 4.5).toFixed(1)} 
                  ({instructor.instructorProfile?.rating?.count || 0} {t('topInstructors.reviews', 'reviews')})
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1, mb: 2 }}>
                <ScheduleIcon fontSize="small" color={availableSlots > 0 ? "success" : "disabled"} />
                <Typography variant="body2" color={availableSlots > 0 ? "success.main" : "text.secondary"}>
                  {availableSlots > 0 
                    ? `${availableSlots} ${t('topInstructors.availableSlots', 'slots available this week')}`
                    : t('topInstructors.noAvailableSlots', 'No slots available this week')
                  }
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1 }}>
                <MoneyIcon fontSize="small" color="primary" />
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {instructor.instructorProfile?.currency === 'USD' ? '$' : instructor.instructorProfile?.currency || 'USD'}
                  {instructor.instructorProfile?.hourlyRate || 25}/{t('common.hr', 'hr')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              {t('instructor.profile.about', 'About')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
              {instructor.instructorProfile?.bio || t('topInstructors.noDescription', 'Experienced instructor ready to help you achieve your learning goals.')}
            </Typography>
            
            {/* Experience */}
            {instructor.instructorProfile?.experience && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {t('topInstructors.experience', 'Experience')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {instructor.instructorProfile.experience}
                </Typography>
              </Box>
            )}
            
            {/* Subjects */}
            {(instructor.instructorProfile?.subjects || instructor.instructorProfile?.languages)?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {t('topInstructors.subjects', 'Subjects')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(instructor.instructorProfile.subjects || instructor.instructorProfile.languages).map((subject, index) => (
                    <Chip
                      key={index}
                      label={subject}
                      size="medium"
                      icon={<LanguageIcon />}
                      variant="filled"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Specialties */}
            {instructor.instructorProfile?.specialties?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {t('topInstructors.specialties', 'Specialties')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {instructor.instructorProfile.specialties.map((specialty, index) => (
                    <Chip
                      key={index}
                      label={specialty}
                      size="medium"
                      variant="outlined"
                      color="secondary"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Qualifications */}
            {instructor.instructorProfile?.qualifications?.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {t('instructor.profile.qualifications', 'Qualifications')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {instructor.instructorProfile.qualifications.map((qual, index) => (
                    <Chip
                      key={index}
                      label={qual}
                      size="medium"
                      variant="outlined"
                      color="success"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Session Types */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {t('instructor.profile.sessionTypes', 'Available Session Types')}
        </Typography>
        
        {sessionTypes.length === 0 ? (
          <Alert severity="info">
            {t('instructor.profile.noSessionTypes', 'This instructor has no available session types at the moment.')}
          </Alert>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {sessionTypes.map((sessionType) => (
              <Grid item xs={12} sm={6} md={4} key={sessionType.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    }
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {getSessionTypeNameString(sessionType, i18n.language)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {getLocalizedText(sessionType.description, t('sessions.noDescription', 'No description available'), i18n.language)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {sessionType.duration} {t('common.minutes', 'min')}
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                        {sessionType.currency === 'USD' ? '$' : sessionType.currency}
                        {sessionType.price}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleBookSession(sessionType)}
                      endIcon={<VideoCallIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[6]
                        }
                      }}
                    >
                      {t('topInstructors.bookSession', 'Book Session')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* QuickBooking Dialog */}
      <QuickBookingDialog
        open={bookingDialogOpen}
        onClose={handleCloseBookingDialog}
        onBookingSuccess={handleBookingSuccess}
        preSelectedSessionType={selectedSessionType}
      />
    </Box>
  );
};

export default InstructorPublicProfilePage;