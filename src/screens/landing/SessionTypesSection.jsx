import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes/constants';
import { sessionTypeService } from '../../services/sessionService';
import { getInstructors } from '../../services/userService';
import { getSessionTypeNameString, getLocalizedText } from '../../utils/sessionLocalization';
import QuickBookingDialog from '../../components/sessions/booking/QuickBookingDialog';
import SessionTypeCard from '../../components/sessions/cards/SessionTypeCard';

const SessionTypesSection = ({ isRTL }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // State management
  const [sessionTypes, setSessionTypes] = useState([]);
  const [processedSessionTypes, setProcessedSessionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quick booking states
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Load session types from database
  useEffect(() => {
    const loadSessionTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load instructors and session types in parallel
        const [instructorsData, sessionTypesData] = await Promise.all([
          getInstructors(),
          sessionTypeService.getPublicActive()
        ]);
        
        // Limit to top 6 session types and format for display
        const featuredSessionTypes = sessionTypesData
          .slice(0, 6)
          .map((sessionType, index) => {
            // Find the instructor for this session type
            const instructor = instructorsData.find(inst => 
              inst.id === sessionType.instructorId || inst.id === sessionType.createdBy
            );
            
            // Determine badge type based on various criteria
            let badgeType = null;
            let badgeLabel = '';
            let badgeColor = 'default';
            let badgeIcon = null;
            
            // Featured badge for first session (highest priority)
            if (index === 0) {
              badgeType = 'featured';
              badgeLabel = t('sessionTypes.featured', 'Featured');
              badgeColor = 'primary';
              badgeIcon = <StarIcon />;
            }
            // New badge for sessions created in last 30 days
            else if (sessionType.createdAt && 
              new Date(sessionType.createdAt.toDate?.() || sessionType.createdAt) > 
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
              badgeType = 'new';
              badgeLabel = t('sessionTypes.new', 'New');
              badgeColor = 'success';
            }
            // Popular badge for certain categories or conditions
            else if (['mathematics', 'programming', 'languages'].includes(sessionType.category)) {
              badgeType = 'popular';
              badgeLabel = t('sessionTypes.popular', 'Popular');
              badgeColor = 'warning';
              badgeIcon = <StarIcon />;
            }
            // Best value badge for sessions with good price-to-duration ratio
            else if (sessionType.duration >= 60 && sessionType.price <= 35) {
              badgeType = 'bestValue';
              badgeLabel = t('sessionTypes.bestValue', 'Best Value');
              badgeColor = 'info';
            }
            
            return {
              ...sessionType, // Include all original session type data
              id: sessionType.id,
              name: getSessionTypeNameString(sessionType, i18n.language || 'ar'),
              description: getLocalizedText(sessionType.description, '', i18n.language || 'ar'),
              duration: sessionType.duration || 60,
              price: sessionType.price || 0,
              currency: sessionType.currency || 'USD',
              category: sessionType.category || '',
              active: sessionType.active !== false,
              // Instructor information
              instructorId: instructor?.id || sessionType.instructorId || sessionType.createdBy,
              instructorName: instructor?.displayName || 'Unknown Instructor',
              instructorAvatar: instructor?.photoURL || null,
              instructorRating: instructor?.instructorProfile?.rating?.average || 0,
              // Badge properties
              hasBadge: badgeType !== null,
              badgeType,
              badgeLabel,
              badgeColor,
              badgeIcon
            };
          })
          .filter(sessionType => sessionType.instructorId); // Only show sessions with valid instructors
        
        setSessionTypes(featuredSessionTypes);
        
        // Process session types with instructor info for booking
        const processedTypes = [];
        
        sessionTypesData.forEach(sessionType => {
          const instructor = instructorsData.find(inst => 
            inst.id === sessionType.instructorId || inst.id === sessionType.createdBy
          );
          
          if (instructor && sessionType.active) {
            processedTypes.push({
              ...sessionType,
              instructorId: instructor.id,
              instructorName: instructor.displayName,
              instructorAvatar: instructor.photoURL,
              instructorRating: instructor.instructorProfile?.rating?.average || 0
            });
          }
        });
        
        setProcessedSessionTypes(processedTypes);
      } catch (err) {
        console.error('Error loading session types:', err);
        setError(t('sessionTypes.error', 'Error loading session types'));
      } finally {
        setLoading(false);
      }
    };
    
    loadSessionTypes();
  }, [t, i18n.language]);
  
  const handleBookSessionType = (sessionType) => {
    setSelectedSessionType(sessionType);
    setBookingDialogOpen(true);
  };
  
  const handleBookingSuccess = (bookingDetails) => {
    setSnackbar({
      open: true,
      message: t('sessions.booking.messages.bookingSubmitted', 'Booking submitted! We\'ll contact you via WhatsApp.'),
      severity: 'success'
    });
  };

  const handleViewAllSessionTypes = () => {
    navigate(ROUTES.STUDENT_BOOKING);
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      mathematics: 'primary',
      physics: 'secondary', 
      chemistry: 'success',
      programming: 'info',
      language: 'warning',
      general: 'default'
    };
    return categoryColors[category] || 'default';
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.secondary.main, 0.05)} 0%, 
          ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(circle at 30% 40%, ${theme.palette.secondary.main} 0%, transparent 50%),
                           radial-gradient(circle at 70% 60%, ${theme.palette.primary.main} 0%, transparent 50%)`,
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            {t('sessionTypes.title', 'Available Session Types')}
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
          >
            {t('sessionTypes.subtitle', 'Choose from our diverse range of specialized tutoring sessions')}
          </Typography>
        </Box>

        {/* Session Types Grid or Loading/Error States */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
              {t('sessionTypes.loading', 'Loading session types...')}
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 6 }}>
            {error}
          </Alert>
        ) : sessionTypes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('sessionTypes.noSessionTypes', 'No session types available')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {sessionTypes.map((sessionType) => (
              <Grid item xs={12} sm={6} md={4} key={sessionType.id}>
                <SessionTypeCard
                  sessionType={sessionType}
                  onBookClick={handleBookSessionType}
                  getCategoryColor={getCategoryColor}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* View All Session Types Button */}
        {!loading && !error && sessionTypes.length > 0 && (
          <Box textAlign="center">
            <Button
              variant="outlined"
              size="large"
              onClick={handleViewAllSessionTypes}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              {t('sessionTypes.exploreAll', 'Explore All Session Types')}
            </Button>
          </Box>
        )}
      </Container>

      {/* Quick Booking Dialog */}
      <QuickBookingDialog 
        open={bookingDialogOpen}
        onClose={() => {
          setBookingDialogOpen(false);
          setSelectedSessionType(null);
        }}
        onBookingSuccess={handleBookingSuccess}
        preSelectedSessionType={selectedSessionType}
      />

      {/* Success Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SessionTypesSection;