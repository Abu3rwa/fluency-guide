import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
  Badge
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

// Import services
import { sessionService } from '../../../services/sessionService';
import { bookingService } from '../../../services/bookingService';
import userService from '../../../services/userService';

const UpcomingSessions = ({ sessions, onSessionUpdate }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for student details
  const [studentDetails, setStudentDetails] = useState({});
  const [loadingStudents, setLoadingStudents] = useState({});
  
  // Session actions state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Get upcoming sessions only
  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' && dayjs(session.startTime).isAfter(dayjs())
  );

  // Load student details for each session
  useEffect(() => {
    const loadStudentDetails = async () => {
      for (const session of upcomingSessions) {
        const bookings = await bookingService.getForSession(session.id);
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        
        for (const booking of confirmedBookings) {
          if (booking.userId && !studentDetails[booking.userId] && !loadingStudents[booking.userId]) {
            setLoadingStudents(prev => ({ ...prev, [booking.userId]: true }));
            
            try {
              const student = await userService.getUserById(booking.userId);
              setStudentDetails(prev => ({
                ...prev,
                [booking.userId]: student
              }));
            } catch (error) {
              console.error(`Error loading student ${booking.userId}:`, error);
            } finally {
              setLoadingStudents(prev => ({ ...prev, [booking.userId]: false }));
            }
          }
        }
      }
    };

    if (upcomingSessions.length > 0) {
      loadStudentDetails();
    }
  }, [upcomingSessions, studentDetails, loadingStudents]);

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
        cancelledAt: new Date()
      });

      // Notify parent component to refresh data
      if (onSessionUpdate) {
        onSessionUpdate();
      }
      
      // Close dialogs
      setCancelDialog(false);
      setCancelReason('');
      handleMenuClose();
      
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  };

  const getSessionUrgency = (sessionTime) => {
    const now = dayjs();
    const sessionDate = dayjs(sessionTime);
    const hoursUntil = sessionDate.diff(now, 'hour');
    
    if (hoursUntil <= 2) return 'urgent';
    if (hoursUntil <= 24) return 'soon';
    return 'normal';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'error';
      case 'soon': return 'warning';
      default: return 'default';
    }
  };

  const SessionCard = ({ session, bookings, students }) => {
    const urgency = getSessionUrgency(session.startTime);
    const urgencyColor = getUrgencyColor(urgency);
    
    return (
      <Card 
        sx={{ 
          mb: 2,
          border: urgency === 'urgent' ? `2px solid ${theme.palette.error.main}` : 
                  urgency === 'soon' ? `2px solid ${theme.palette.warning.main}` : 'none'
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              {/* Session Header */}
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h6">
                  {session.sessionType?.name || t('sessions.dashboard.unknownType')}
                </Typography>
                <Chip 
                  label={t(`sessions.status.${session.status}`)}
                  color="primary"
                  size="small"
                />
                {urgency !== 'normal' && (
                  <Chip 
                    label={urgency === 'urgent' ? t('sessions.dashboard.urgent') : t('sessions.dashboard.soon')}
                    color={urgencyColor}
                    size="small"
                    variant="filled"
                  />
                )}
              </Box>
              
              {/* Session Details */}
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {dayjs(session.startTime).format('MMM DD, YYYY')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {dayjs(session.startTime).format('HH:mm')} - {dayjs(session.endTime).format('HH:mm')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <GroupIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {bookings.length}/{session.maxStudents} {t('sessions.dashboard.students')}
                  </Typography>
                </Box>
                {session.sessionType?.price && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <MoneyIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {session.sessionType.price} {session.sessionType.currency}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Student List */}
              {bookings.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('sessions.dashboard.enrolledStudents')}:
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    {bookings.map((booking, index) => {
                      const student = students[booking.userId];
                      return (
                        <React.Fragment key={booking.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Badge
                                badgeContent={
                                  booking.status === 'confirmed' ? (
                                    <CheckCircleIcon 
                                      sx={{ 
                                        fontSize: 16, 
                                        color: theme.palette.success.main 
                                      }} 
                                    />
                                  ) : null
                                }
                              >
                                <Avatar 
                                  src={student?.profileImage} 
                                  sx={{ width: 32, height: 32 }}
                                >
                                  {(student?.displayName || booking.studentName || 'U')[0].toUpperCase()}
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              primary={student?.displayName || booking.studentName || booking.userId}
                              secondary={
                                <Box>
                                  {booking.phoneNumber && (
                                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                      <PhoneIcon sx={{ fontSize: 12 }} />
                                      <Typography variant="caption">
                                        {booking.phoneNumber}
                                      </Typography>
                                    </Box>
                                  )}
                                  {student?.email && (
                                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                      <EmailIcon sx={{ fontSize: 12 }} />
                                      <Typography variant="caption">
                                        {student.email}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              }
                            />
                            <Chip 
                              label={t(`sessions.booking.${booking.status}`)}
                              size="small"
                              color={booking.status === 'confirmed' ? 'success' : 'default'}
                            />
                          </ListItem>
                          {index < bookings.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
              )}

              {bookings.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {t('sessions.dashboard.noBookingsYet')}
                </Alert>
              )}
            </Box>

            <IconButton
              onClick={(e) => handleMenuOpen(e, session)}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (upcomingSessions.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary">
          {t('sessions.dashboard.noUpcomingSessions')}
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          {t('sessions.dashboard.noUpcomingSessionsDesc')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {upcomingSessions.map((session) => {
        const sessionBookings = bookingService.getForSession(session.id);
        const confirmedBookings = sessionBookings.filter(b => b.status === 'confirmed');
        
        return (
          <SessionCard 
            key={session.id} 
            session={session} 
            bookings={confirmedBookings}
            students={studentDetails}
          />
        );
      })}

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
          {t('sessions.dashboard.cancelSession')}
        </MenuItem>
      </Menu>

      {/* Cancel Session Dialog */}
      <Dialog 
        open={cancelDialog} 
        onClose={() => setCancelDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{t('sessions.dashboard.cancelSessionTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            {t('sessions.dashboard.cancelSessionDesc')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('sessions.dashboard.cancellationReason')}
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
            {t('sessions.dashboard.confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpcomingSessions;