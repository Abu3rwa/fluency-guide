import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/constants';
import QuickBookingDialog from '../../components/sessions/booking/QuickBookingDialog';

const PrivateSessionsSection = ({ t, isRTL }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleBookSession = () => {
    setBookingDialogOpen(true);
  };

  const handleBookingSuccess = (bookingDetails) => {
    setSnackbar({
      open: true,
      message: t('sessions.booking.messages.bookingSubmitted', 'Booking submitted! We\'ll contact you via WhatsApp.'),
      severity: 'success'
    });
  };

  const handleViewInstructors = () => {
    navigate(ROUTES.INSTRUCTORS_SHOWCASE);
  };

  const sessionFeatures = [
    {
      icon: <VideoCallIcon />,
      title: t('privateSessions.features.oneOnOne', 'One-on-One Sessions'),
      description: t('privateSessions.features.oneOnOneDesc', 'Personalized learning with dedicated instructor attention'),
      color: 'primary'
    },
    {
      icon: <ScheduleIcon />,
      title: t('privateSessions.features.flexible', 'Flexible Scheduling'),
      description: t('privateSessions.features.flexibleDesc', 'Book sessions that fit your schedule'),
      color: 'secondary'
    },
    {
      icon: <LanguageIcon />,
      title: t('privateSessions.features.allSubjects', 'All Subjects Covered'),
      description: t('privateSessions.features.allSubjectsDesc', 'Mathematics, Physics, Chemistry, Programming, Languages, and more'),
      color: 'success'
    }
  ];

  const stats = [
    { value: '500+', label: t('privateSessions.stats.sessions', 'Sessions Completed') },
    { value: '50+', label: t('privateSessions.stats.tutors', 'Expert Tutors') },
    { value: '4.9', label: t('privateSessions.stats.rating', 'Average Rating') }
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.05)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
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
          backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.palette.primary.main} 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main} 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, ${theme.palette.info.main} 0%, transparent 50%)`,
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
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            {t('privateSessions.title', 'Private Learning Sessions')}
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
          >
            {t('privateSessions.subtitle', 
              'Take your learning to the next level with personalized one-on-one sessions from our expert tutors across all subjects.'
            )}
          </Typography>

          {/* Stats */}
          <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={4} sm={4} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      mb: 0.5
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {sessionFeatures.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                    background: alpha(theme.palette.background.paper, 0.95)
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: `${feature.color}.main`,
                      color: `${feature.color}.contrastText`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      fontSize: '2rem'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box textAlign="center">
          <Paper
            sx={{
              p: 4,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {t('privateSessions.cta.title', 'Ready to Start Your Learning Journey?')}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('privateSessions.cta.description', 
                'Choose from our qualified instructors and book your first session today.'
              )}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleBookSession}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                {t('privateSessions.cta.bookNow', 'Book a Session')}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={handleViewInstructors}
                endIcon={<PersonIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                {t('privateSessions.cta.viewInstructors', 'View Instructors')}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Quick Booking Dialog */}
      <QuickBookingDialog 
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        onBookingSuccess={handleBookingSuccess}
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

export default PrivateSessionsSection;