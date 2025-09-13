import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  AccountBalanceWallet as WalletIcon,
  Security as SecurityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { ar, enUS } from 'date-fns/locale';
 
// Import services
import { sessionService, bookingService, sessionTypeService } from '../../../services/sessionService';
import { useAuth } from '../../../contexts/AuthContext';
import SessionTypeManagement from './SessionTypeManagement';
import InstructorAvailabilityManager from './InstructorAvailabilityManager';
import { getSessionTypeNameString } from '../../../utils/sessionLocalization';
import SessionCreationForm from './SessionCreationForm';

// Loading component for better UX
const AuthLoadingSpinner = () => {
  const { t } = useTranslation();
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="60vh"
      gap={2}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" color="textSecondary">
        {t('auth.verifyingAccess', 'Verifying access...')}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {t('auth.pleaseWait', 'Please wait while we verify your credentials')}
      </Typography>
    </Box>
  );
};

// Access denied component
const AccessDenied = () => {
  const { t } = useTranslation();
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="60vh"
      gap={2}
    >
      <SecurityIcon sx={{ fontSize: 80, color: 'error.main' }} />
      <Typography variant="h4" color="error" gutterBottom>
        {t('auth.accessDenied', 'Access Denied')}
      </Typography>
      <Typography variant="body1" color="textSecondary" textAlign="center">
        {t('auth.instructorAccessRequired', 'You need instructor privileges to access this page.')}
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => window.location.href = '/auth'}
        sx={{ mt: 2 }}
      >
        {t('auth.signIn', 'Sign In')}
      </Button>
    </Box>
  );
};

const InstructorDashboard = () => {
  const { t, i18n } = useTranslation();
  const { t: tInstructor } = useTranslation('instructorDashboard');
  const { currentUser, userData, loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use userData for role checks and currentUser for basic auth
  const user = userData || currentUser;
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showSessionTypes, setShowSessionTypes] = useState(false);
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalEarnings: 0,
    thisWeekEarnings: 0,
    activeSessionTypes: 0
  });

  // Get current locale for date formatting
  const currentLocale = i18n.language === 'ar' ? ar : enUS;
  const isRTL = i18n.language === 'ar';

  // Check if user has instructor privileges
  const hasInstructorAccess = useCallback(() => {
    if (!currentUser || !userData) return false;
    
     
    // Admin users have access to everything
    if (userData.isAdmin) {
      return true;
    }
    
    // Check for instructor role or permissions
    const hasInstructorRole = userData.role === 'instructor' || userData.isInstructor;
    
    
    return hasInstructorRole;
  }, [currentUser, userData]);

  const calculateStats = (sessionData, bookingData, sessionTypeData) => {
    const now = dayjs();
    const thisWeekStart = now.startOf('week');
    const thisMonthStart = now.startOf('month');
    
    const completed = sessionData.filter(s => s.status === 'completed').length;
    const upcoming = sessionData.filter(s => {
      if (s.status !== 'scheduled') return false;
      
      let sessionTime;
      if (s.startTime) {
        // Handle Firebase Timestamp objects
        if (s.startTime.seconds) {
          sessionTime = dayjs.unix(s.startTime.seconds);
        } else {
          sessionTime = dayjs(s.startTime);
        }
      } else if (s.date) {
        // Handle Firebase Timestamp objects
        if (s.date.seconds) {
          sessionTime = dayjs.unix(s.date.seconds);
        } else {
          sessionTime = dayjs(s.date);
        }
      } else {
        return false;
      }
      
      return sessionTime.isAfter(now);
    }).length;
    const cancelled = sessionData.filter(s => s.status === 'cancelled').length;
    
    // Calculate booking statistics
    const pendingBookings = bookingData.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookingData.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookingData.filter(b => b.status === 'completed');
    const cancelledBookings = bookingData.filter(b => b.status === 'cancelled').length;
    
    // Calculate earnings (completed bookings)
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    
    // Calculate this week's earnings based on completion date
    const thisWeekEarnings = bookingData
      .filter(b => {
        if (b.status !== 'completed') return false;
        
        // Use completedAt date if available, otherwise fall back to scheduledDate
        let completionDate;
        if (b.completedAt) {
          completionDate = b.completedAt.seconds ? 
            dayjs.unix(b.completedAt.seconds) : 
            dayjs(b.completedAt);
        } else if (b.scheduledDate) {
          completionDate = dayjs(b.scheduledDate);
        } else {
          return false;
        }
        
        return completionDate.isAfter(thisWeekStart);
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);
      
    // Calculate this month's earnings based on completion date
    const thisMonthEarnings = bookingData
      .filter(b => {
        if (b.status !== 'completed') return false;
        
        // Use completedAt date if available, otherwise fall back to scheduledDate
        let completionDate;
        if (b.completedAt) {
          completionDate = b.completedAt.seconds ? 
            dayjs.unix(b.completedAt.seconds) : 
            dayjs(b.completedAt);
        } else if (b.scheduledDate) {
          completionDate = dayjs(b.scheduledDate);
        } else {
          return false;
        }
        
        return completionDate.isAfter(thisMonthStart);
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);
      
    const activeSessionTypes = sessionTypeData.filter(st => st.active !== false).length;
    
    // Calculate average session price
    const averageSessionPrice = completedBookings.length > 0 ? 
      totalEarnings / completedBookings.length : 0;
    
    // Calculate success rate (completed vs total)
    const totalScheduled = completed + cancelled;
    const successRate = totalScheduled > 0 ? (completed / totalScheduled) * 100 : 0;

    setStats({
      totalSessions: sessionData.length,
      completedSessions: completed,
      upcomingSessions: upcoming,
      cancelledSessions: cancelled,
      totalEarnings,
      thisWeekEarnings,
      thisMonthEarnings,
      activeSessionTypes,
      averageSessionPrice,
      successRate,
      totalBookings: bookingData.length,
      pendingBookings,
      confirmedBookings,
      completedBookings: completedBookings.length,
      cancelledBookings
    });
  };

  // Memoized data loading function to prevent unnecessary re-renders
  const loadDashboardData = useCallback(async () => {
    if (!currentUser?.uid || !userData) {
      return;
    }

    try {
      setDataLoading(true);
      setError(null);
      // Load sessions, bookings and session types with role-based access control
      let instructorSessions = [];
      let instructorBookings = [];
      let instructorSessionTypes = [];
      
      try {
        // Role-based session loading: Admins see all sessions, instructors see only their own
        if (userData.isAdmin) {
          instructorSessions = await sessionService.getAll();
        } else {
          instructorSessions = await sessionService.getByInstructor(currentUser.uid);
        }
      } catch (sessionError) {
        console.error('Error loading sessions:', sessionError);
        // Continue with empty array - don't fail the entire load
      }
      
      try {
        // Role-based booking loading: Admins see all bookings, instructors see only their own
        if (userData.isAdmin) {
          instructorBookings = await bookingService.getAll ? 
            await bookingService.getAll() :
            await bookingService.getForUser(currentUser.uid, null);
        } else {
          // Check if getForInstructor exists, otherwise fall back to getForUser
          if (bookingService.getForInstructor) {
            instructorBookings = await bookingService.getForInstructor(currentUser.uid);
          } else {
            instructorBookings = await bookingService.getForUser(currentUser.uid, null);
          }
        }
      } catch (bookingError) {
        console.error('Error loading bookings:', bookingError);
        // Continue with empty array - don't fail the entire load
      }
      
      try {
        // Session types are already role-aware in the service layer
        instructorSessionTypes = await sessionTypeService.getAll(user);
      } catch (sessionTypeError) {
        console.error('Error loading session types:', sessionTypeError);
        // Continue with empty array - don't fail the entire load
      }

      setSessions(instructorSessions || []);
      setBookings(instructorBookings || []);
      setSessionTypes(instructorSessionTypes || []);
     
      
      // Calculate statistics
      calculateStats(instructorSessions || [], instructorBookings || [], instructorSessionTypes || []);
      
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || t('sessions.instructor.dashboard.errorLoading', 'Failed to load dashboard data'));
    } finally {
      setDataLoading(false);
    }
  }, [currentUser, userData, user, t]);

  // Load data when user is authenticated and has access
  useEffect(() => {
    if (!authLoading && currentUser && userData && hasInstructorAccess()) {
      loadDashboardData();
    }
  }, [authLoading, currentUser, userData, hasInstructorAccess, loadDashboardData]);

  // Handle authentication states
  if (authLoading) {
    return <AuthLoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for userData to load before checking access
  if (!userData) {
    return <AuthLoadingSpinner />;
  }

  if (!hasInstructorAccess()) {
    return <AccessDenied />;
  }

  // Show loading state while data is being fetched
  if (dataLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="textSecondary">
          {t('sessions.instructor.dashboard.loadingData', 'Loading dashboard data...')}
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={loadDashboardData}>
              {t('common.retry', 'Retry')}
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event, session) => {
    setAnchorEl(event.currentTarget);
    setSelectedSession(session);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSession(null);
  };

  const handleCancelSession = async () => {
    try {
      if (!selectedSession || !cancelReason.trim()) return;

      await sessionService.update(selectedSession.id, {
        status: 'cancelled',
        cancellationReason: cancelReason,
        cancelledBy: user.uid,
        cancelledAt: new Date()
      });

      // Refresh data
      await loadDashboardData();
      
      // Close dialogs
      setCancelDialog(false);
      setCancelReason('');
      handleMenuClose();
      
    } catch (err) {
      console.error('Error cancelling session:', err);
      setError(t('sessions.instructor.dashboard.cancelDialog.errorCancelling'));
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      if (!selectedSession) return;

      await sessionService.update(selectedSession.id, {
        status: 'completed',
        completedBy: user.uid,
        completedAt: new Date()
      });

      // Refresh data
      await loadDashboardData();
      
      // Close menu
      handleMenuClose();
      
    } catch (err) {
      console.error('Error marking session as completed:', err);
      setError(tInstructor('dashboard.actions.errorMarkingCompleted', 'Error marking session as completed'));
    }
  };

  const getSessionStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTimeLabel = (sessionDate) => {
    const date = dayjs(sessionDate);
    const now = dayjs();
    
    if (date.isSame(now, 'day')) {
      return t('sessions.dashboard.today');
    } else if (date.isSame(now.add(1, 'day'), 'day')) {
      return t('sessions.dashboard.tomorrow');
    } else if (date.isSame(now, 'week')) {
      return t('sessions.dashboard.thisWeek');
    } else {
      return date.format('MMM DD, YYYY');
    }
  };

  const filterSessionsByTab = (sessions) => {
    const now = dayjs();
    
    // Role-based session filtering:
    // - Admins can see all sessions from all instructors
    // - Instructors can only see their own sessions
    const visibleSessions = user?.isAdmin ? 
      sessions : // Admin sees all sessions
      sessions.filter(s => {
        const isOwner = s.instructorId === user?.uid;
        return isOwner;
      }); // Instructors see only their own
    
    let result;
    switch (activeTab) {
      case 0: // Upcoming
        result = visibleSessions.filter(s => {
          const isScheduled = s.status === 'scheduled';
          
          // Handle both date field and startTime field (your session has both)
          let sessionTime;
          if (s.startTime) {
            // Handle Firebase Timestamp objects
            if (s.startTime.seconds) {
              sessionTime = dayjs.unix(s.startTime.seconds);
            } else {
              sessionTime = dayjs(s.startTime);
            }
          } else if (s.date) {
            // Handle Firebase Timestamp objects
            if (s.date.seconds) {
              sessionTime = dayjs.unix(s.date.seconds);
            } else {
              sessionTime = dayjs(s.date);
            }
          } else {
            console.warn(`Session ${s.id} has no date or startTime`);
            return false;
          }
          
          // Only show sessions that are in the future
          const isAfterNow = sessionTime.isAfter(now);
          
          return isScheduled && isAfterNow;
        });
        break;
      case 1: // Today
        result = visibleSessions.filter(s => {
          let sessionTime;
          if (s.startTime) {
            // Handle Firebase Timestamp objects
            if (s.startTime.seconds) {
              sessionTime = dayjs.unix(s.startTime.seconds);
            } else {
              sessionTime = dayjs(s.startTime);
            }
          } else if (s.date) {
            // Handle Firebase Timestamp objects
            if (s.date.seconds) {
              sessionTime = dayjs.unix(s.date.seconds);
            } else {
              sessionTime = dayjs(s.date);
            }
          } else {
            return false;
          }
          
          const isToday = sessionTime.isSame(now, 'day');
          
          return isToday;
        });
        break;
      case 2: // Bookings - Show no sessions, only bookings
        result = [];
        break;
      case 3: // Completed
        result = visibleSessions.filter(s => s.status === 'completed');
        break;
      case 4: // Cancelled
        result = visibleSessions.filter(s => s.status === 'cancelled');
        break;
      default:
        result = visibleSessions;
    }
    
    return result;
  };

  const filterBookingsByTab = (bookings) => {
    const now = dayjs();
    
    // Role-based booking filtering:
    // - Admins can see all bookings from all instructors
    // - Instructors can only see their own bookings
    const visibleBookings = user?.isAdmin ? 
      bookings : // Admin sees all bookings
      bookings.filter(b => {
        const isOwner = b.instructorId === user?.uid;
        return isOwner;
      }); // Instructors see only their own
    
    // Only return bookings for the Bookings tab (case 2)
    if (activeTab !== 2) {
      return [];
    }
    
    return visibleBookings;
  };

  const StatCard = ({ title, value, icon, color = 'primary', tooltip = null }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {title}
              </Typography>
              {tooltip && (
                <Tooltip title={tooltip} arrow>
                  <InfoIcon fontSize="small" color="action" sx={{ cursor: 'help' }} />
                </Tooltip>
              )}
            </Box>
            <Typography variant="h6" component="div">
              {String(value)}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const BookingCard = ({ booking }) => {
    const getBookingStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'warning';
        case 'confirmed': return 'success';
        case 'completed': return 'info';
        case 'cancelled': return 'error';
        default: return 'default';
      }
    };

    const handleConfirmBooking = async () => {
      try {
        if (!booking.id) return;
        await bookingService.update(booking.id, {
          status: 'confirmed',
          confirmedBy: user.uid,
          confirmedAt: new Date()
        });
        // Refresh data
        await loadDashboardData();
      } catch (err) {
        console.error('Error confirming booking:', err);
        setError('Error confirming booking');
      }
    };

    const handleCancelBooking = async () => {
      try {
        if (!booking.id) return;
        await bookingService.update(booking.id, {
          status: 'cancelled',
          cancelledBy: user.uid,
          cancelledAt: new Date()
        });
        // Refresh data
        await loadDashboardData();
      } catch (err) {
        console.error('Error cancelling booking:', err);
        setError('Error cancelling booking');
      }
    };

    const handleMarkBookingCompleted = async () => {
      try {
        if (!booking.id) return;
        await bookingService.update(booking.id, {
          status: 'completed',
          completedBy: user.uid,
          completedAt: new Date()
        });
        // Refresh data
        await loadDashboardData();
      } catch (err) {
        console.error('Error marking booking as completed:', err);
        setError('Error marking booking as completed');
      }
    };

    const bookingDate = booking.bookingDate ? (
      booking.bookingDate.seconds ? 
        dayjs.unix(booking.bookingDate.seconds) : 
        dayjs(booking.bookingDate)
    ) : null;

    const sessionDate = booking.date ? dayjs(booking.date) : null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h6">
                  {booking.guestName || booking.studentName || 'Guest'}
                </Typography>
                <Chip 
                  label={tInstructor(`status.${booking.status}`)}
                  color={getBookingStatusColor(booking.status)}
                  size="small"
                />
              </Box>
              
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                {bookingDate && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2" component="div">
                      {tInstructor('booking.bookingDate', 'Booked')}: {bookingDate.format('MMM DD, YYYY HH:mm')}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={1}>
                {sessionDate && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2" component="div">
                      {tInstructor('booking.sessionDate', 'Session')}: {sessionDate.format('MMM DD, YYYY')} {booking.time}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={1}>
                {booking.phoneNumber && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" component="div">
                      {booking.phoneNumber}
                    </Typography>
                  </Box>
                )}
                {booking.guestEmail && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" component="div">
                      {booking.guestEmail}
                    </Typography>
                  </Box>
                )}
              </Box>

              {(booking.price && booking.currency) && (
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <MoneyIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="primary" component="div">
                    {booking.price} {booking.currency}
                    {booking.status === 'completed' && (
                      <Chip 
                        label="Earnings Calculated"
                        size="small"
                        color="success"
                        sx={{ ml: 1, fontSize: '0.7rem' }}
                      />
                    )}
                  </Typography>
                </Box>
              )}
              
              {/* Show completion info for completed bookings */}
              {booking.status === 'completed' && booking.completedAt && (
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <CheckCircleIcon fontSize="small" color="success" />
                  <Typography variant="body2" color="success.main" component="div">
                    Completed: {(() => {
                      const completedDate = booking.completedAt.seconds ? 
                        dayjs.unix(booking.completedAt.seconds) : 
                        dayjs(booking.completedAt);
                      return completedDate.format('MMM DD, YYYY HH:mm');
                    })()}
                  </Typography>
                </Box>
              )}
              
              {/* Booking Actions */}
              {booking.status === 'pending' && (
                <Box display="flex" gap={1} mt={2}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={handleConfirmBooking}
                  >
                    {tInstructor('booking.actions.confirmBooking')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleCancelBooking}
                  >
                    {tInstructor('booking.actions.cancelBooking')}
                  </Button>
                </Box>
              )}
              
              {booking.status === 'confirmed' && (
                <Box display="flex" gap={1} mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleMarkBookingCompleted}
                  >
                    {tInstructor('booking.actions.markBookingCompleted')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleCancelBooking}
                  >
                    {tInstructor('booking.actions.cancelBooking')}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const SessionCard = ({ session }) => {
    // Role-based booking filtering:
    // - Admins can see all bookings for any session
    // - Instructors can only see bookings for their own sessions
    const sessionBookings = user?.isAdmin ?
      bookings.filter(b => {
        const matchesSession = b.sessionId === session.id;
        const matchesSessionType = b.sessionTypeId === session.sessionTypeId;
        return matchesSession || matchesSessionType; // Allow both session ID and session type ID matching
      }) : // Admin sees all bookings for this session
      bookings.filter(b => {
        const matchesSession = b.sessionId === session.id;
        const matchesSessionType = b.sessionTypeId === session.sessionTypeId;
        const isOwner = (b.instructorId === user?.uid || session.instructorId === user?.uid);
        return (matchesSession || matchesSessionType) && isOwner;
      }); // Instructors see only their own bookings
    const confirmedBookings = sessionBookings.filter(b => b.status === 'confirmed');
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h6">
                  {(() => {
                    // First try to get the session title (your session has title.ar and title.en)
                    if (session.title) {
                      if (typeof session.title === 'string') {
                        return session.title;
                      } else if (typeof session.title === 'object') {
                        const currentLang = i18n.language || 'en';
                        return session.title[currentLang] || session.title.en || session.title.ar || 'Untitled Session';
                      }
                    }
                    
                    // Fall back to session type name using the localization utility
                    if (session.sessionType) {
                      return getSessionTypeNameString(session.sessionType, i18n.language);
                    }
                    
                    // Final fallback
                    return session.sessionTypeName || t('sessions.instructor.dashboard.sessions.unknownType');
                  })()
                  }
                </Typography>
                <Chip 
                  label={t(`sessions.status.${session.status}`)}
                  color={getSessionStatusColor(session.status)}
                  size="small"
                />
                {(() => {
                  // Check if this is a past scheduled session
                  if (session.status === 'scheduled') {
                    let sessionTime;
                    if (session.startTime) {
                      sessionTime = session.startTime.seconds ? 
                        dayjs.unix(session.startTime.seconds) : 
                        dayjs(session.startTime);
                    } else if (session.date) {
                      sessionTime = session.date.seconds ? 
                        dayjs.unix(session.date.seconds) : 
                        dayjs(session.date);
                    }
                    
                    if (sessionTime && sessionTime.isBefore(dayjs())) {
                      return (
                        <Chip 
                          label={tInstructor('dashboard.sessions.pastScheduled', 'Past Due')}
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      );
                    }
                  }
                  return null;
                })()}
              </Box>
              
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2" component="div">
                    {(() => {
                      let sessionDate;
                      if (session.startTime) {
                        // Handle Firebase Timestamp objects
                        if (session.startTime.seconds) {
                          sessionDate = dayjs.unix(session.startTime.seconds);
                        } else {
                          sessionDate = dayjs(session.startTime);
                        }
                      } else if (session.date) {
                        // Handle Firebase Timestamp objects
                        if (session.date.seconds) {
                          sessionDate = dayjs.unix(session.date.seconds);
                        } else {
                          sessionDate = dayjs(session.date);
                        }
                      }
                      return sessionDate ? sessionDate.format('MMM DD, YYYY') : 'No date';
                    })()}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2" component="div">
                    {(() => {
                      let startTime, endTime;
                      if (session.startTime) {
                        // Handle Firebase Timestamp objects
                        if (session.startTime.seconds) {
                          startTime = dayjs.unix(session.startTime.seconds);
                        } else {
                          startTime = dayjs(session.startTime);
                        }
                      }
                      if (session.endTime) {
                        // Handle Firebase Timestamp objects
                        if (session.endTime.seconds) {
                          endTime = dayjs.unix(session.endTime.seconds);
                        } else {
                          endTime = dayjs(session.endTime);
                        }
                      }
                      
                      const startTimeStr = startTime ? startTime.format('HH:mm') : (session.time || 'TBD');
                      const endTimeStr = endTime ? endTime.format('HH:mm') : 'End time TBD';
                      
                      return `${startTimeStr} - ${endTimeStr}`;
                    })()}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" component="div">
                    {confirmedBookings.length}/{session.maxStudents || 1} {t('sessions.instructor.dashboard.sessions.students')}
                  </Typography>
                </Box>
                {(session.sessionType?.price || session.price) && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <MoneyIcon fontSize="small" color="action" />
                    <Typography variant="body2" component="div">
                      {session.sessionType?.price || session.price} {session.sessionType?.currency || session.currency || 'LYD'}
                    </Typography>
                  </Box>
                )}
              </Box>

              {sessionBookings.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('sessions.instructor.dashboard.sessions.bookings')}:
                  </Typography>
                  {sessionBookings.slice(0, 3).map((booking) => (
                    <Box key={booking.id} display="flex" alignItems="center" gap={1} mb={0.5}>
                      <PersonIcon fontSize="small" />
                      <Typography variant="body2" component="div">
                        {booking.studentName || booking.userId} 
                        <Chip 
                          label={booking.status} 
                          size="small" 
                          color={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'default'}
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      </Typography>
                      {booking.phoneNumber && (
                        <Box display="flex" alignItems="center" gap={0.5} ml={1}>
                          <PhoneIcon fontSize="small" />
                          <Typography variant="body2" color="textSecondary" component="div">
                            {booking.phoneNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                  {sessionBookings.length > 3 && (
                    <Typography variant="body2" color="textSecondary">
                      +{sessionBookings.length - 3} more booking(s)
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {session.status === 'scheduled' && (
              <IconButton
                onClick={(e) => handleMenuOpen(e, session)}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (dataLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const filteredSessions = filterSessionsByTab(sessions);
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box mb={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {user?.isAdmin ? 
              t('admin.sessionManagement', 'Session Management Dashboard') : 
              tInstructor('dashboard.title')
            }
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user?.isAdmin ? 
              t('admin.sessionSubtitle', 'Monitor and manage all sessions, bookings, and instructors') : 
              tInstructor('dashboard.subtitle')
            }
          </Typography>
          {user?.isAdmin && (
            <Chip 
              label={t('admin.adminAccess', 'Admin Access')} 
              color="error" 
              size="small" 
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowSessionTypes(!showSessionTypes)}
            color={showSessionTypes ? 'primary' : 'inherit'}
          >
            {tInstructor('dashboard.actions.manageTypes')}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setShowAvailabilityManager(!showAvailabilityManager)}
            color={showAvailabilityManager ? 'primary' : 'inherit'}
          >
            {tInstructor('dashboard.actions.manageAvailability')}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowSessionForm(true)}
          >
            {tInstructor('dashboard.actions.newSession')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setError(null);
                if (user?.uid) {
                  loadDashboardData();
                } else {
                  window.location.reload();
                }
              }}
            >
              {t('sessions.instructor.dashboard.actions.refresh')}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={tInstructor('dashboard.stats.totalSessions')}
            value={stats.totalSessions}
            icon={<CalendarIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={tInstructor('dashboard.stats.upcomingSessions')}
            value={stats.upcomingSessions}
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={tInstructor('dashboard.stats.completedSessions')}
            value={stats.completedSessions}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={tInstructor('dashboard.stats.activeSessionTypes')}
            value={stats.activeSessionTypes}
            icon={<SettingsIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={tInstructor('dashboard.stats.thisWeekEarnings')}
            value={`${stats.thisWeekEarnings} LYD`}
            icon={<TrendingUpIcon />}
            color="secondary"
            tooltip={tInstructor('dashboard.sessions.earningsInfo')}
          />
        </Grid>
      </Grid>
      
      {/* Additional Statistics Row - Only show if there are sessions or bookings */}
      {(stats.totalSessions > 0 || stats.totalBookings > 0) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title={tInstructor('dashboard.stats.thisMonthEarnings')}
              value={`${stats.thisMonthEarnings || 0} LYD`}
              icon={<MoneyIcon />}
              color="success"
              tooltip={tInstructor('dashboard.sessions.earningsInfo')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title={tInstructor('dashboard.stats.pendingBookings')}
              value={stats.pendingBookings || 0}
              icon={<ScheduleIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title={tInstructor('dashboard.stats.confirmedBookings')}
              value={stats.confirmedBookings || 0}
              icon={<CheckCircleIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title={tInstructor('dashboard.stats.successRate')}
              value={`${(stats.successRate || 0).toFixed(1)}%`}
              icon={<TrendingUpIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title={tInstructor('dashboard.stats.averageSessionPrice')}
              value={`${(stats.averageSessionPrice || 0).toFixed(0)} LYD`}
              icon={<WalletIcon />}
              color="primary"
            />
          </Grid>
        </Grid>
      )}

      {/* Session Type Management */}
      {showSessionTypes && (
        <Box sx={{ mb: 4 }}>
          <SessionTypeManagement />
          <Divider sx={{ my: 3 }} />
        </Box>
      )}
      
      {/* Availability Management */}
      {showAvailabilityManager && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {tInstructor('dashboard.availability.title', 'Manage Availability')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {tInstructor('dashboard.availability.subtitle', 'Set your available time slots so students can book sessions with you.')}
          </Typography>
          <InstructorAvailabilityManager 
            currentAvailability={userData?.availability?.slots || []}
            onSave={(availabilityData) => {
              // Refresh dashboard data after saving availability
              loadDashboardData();
            }}
          />
          <Divider sx={{ my: 3 }} />
        </Box>
      )}

      {/* Session Tabs and List */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label={tInstructor('dashboard.tabs.upcoming')} />
            <Tab label={tInstructor('dashboard.tabs.today')} />
            <Tab label={tInstructor('dashboard.tabs.bookings')} />
            <Tab label={tInstructor('dashboard.tabs.completed')} />
            <Tab label={tInstructor('dashboard.tabs.cancelled')} />
          </Tabs>
        </Box>

        <CardContent>
          {(() => {
            if (activeTab === 2) {
              // Show bookings for the Bookings tab
              const filteredBookings = filterBookingsByTab(bookings);
              
              if (filteredBookings.length === 0) {
                return (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="textSecondary">
                      {tInstructor('dashboard.sessions.noBookings', 'No bookings found')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      {tInstructor('dashboard.sessions.noBookingsDesc', 'You don\'t have any bookings yet')}
                    </Typography>
                  </Box>
                );
              }
              
              return filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ));
            } else {
              // Show sessions for other tabs
              if (filteredSessions.length === 0) {
                return (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="textSecondary">
                      {tInstructor('dashboard.sessions.noSessions')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      {tInstructor('dashboard.sessions.noSessionsDesc')}
                    </Typography>
                  </Box>
                );
              }
              
              return filteredSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ));
            }
          })()}
        </CardContent>
      </Card>

      {/* Session Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setCancelDialog(true);
          handleMenuClose();
        }}>
          <CancelIcon sx={{ mr: 1 }} />
          {tInstructor('dashboard.actions.cancelSession')}
        </MenuItem>
        {(() => {
          // Show "Mark as Completed" option for past scheduled sessions
          if (selectedSession && selectedSession.status === 'scheduled') {
            let sessionTime;
            if (selectedSession.startTime) {
              sessionTime = selectedSession.startTime.seconds ? 
                dayjs.unix(selectedSession.startTime.seconds) : 
                dayjs(selectedSession.startTime);
            } else if (selectedSession.date) {
              sessionTime = selectedSession.date.seconds ? 
                dayjs.unix(selectedSession.date.seconds) : 
                dayjs(selectedSession.date);
            }
            
            if (sessionTime && sessionTime.isBefore(dayjs())) {
              return (
                <MenuItem onClick={handleMarkAsCompleted}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  {tInstructor('dashboard.actions.markAsCompleted', 'Mark as Completed')}
                </MenuItem>
              );
            }
          }
          return null;
        })()}
      </Menu>

      {/* Cancel Session Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{tInstructor('dashboard.cancelDialog.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            {tInstructor('dashboard.cancelDialog.description')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={tInstructor('dashboard.cancelDialog.reasonLabel')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleCancelSession}
            color="error"
            disabled={!cancelReason.trim()}
          >
            {tInstructor('dashboard.cancelDialog.confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add session"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setShowSessionTypes(!showSessionTypes)}
        >
          <SettingsIcon />
        </Fab>
      )}
      
      {/* Session Creation Form */}
      <SessionCreationForm
        open={showSessionForm}
        onClose={() => setShowSessionForm(false)}
        onSessionCreated={() => {
          setShowSessionForm(false);
          loadDashboardData();
        }}
      />
    </Box>
  );
};

export default InstructorDashboard;