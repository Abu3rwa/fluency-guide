import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Chip,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Fab,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  SwipeableDrawer,
  Tooltip
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarMonth,
  Schedule,
  ViewDay,
  ViewWeek,
  FilterList,
  Touch as TouchIcon
} from '@mui/material/icons';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, isBefore, addMinutes } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../utils/rtlUtils';
import { 
  getAvailabilityForWeek, 
  getBookingsForWeek
} from 'src/services/availabilityService';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
// Consistent TIME_SLOTS format with your existing implementation
const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
];

const SessionBookingCalendar = ({ 
  instructorId = null,
  userId = null,
  viewType = 'instructor', // 'instructor' or 'student'
  onSlotSelect = () => {}
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = useRTL();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState(isMobile ? 'day' : 'week'); // Default to day view on mobile
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Get the current week's dates
  const getWeekDates = (date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return Array(7).fill().map((_, i) => addDays(start, i));
  };
  
  const weekDates = getWeekDates(currentDate);
  const dayNames = view === 'week' 
    ? weekDates.map(date => format(date, 'EEE, MMM d'))
    : ['Time', ...DAYS_OF_WEEK];
  
  // Minimum swipe distance for touch navigation (pixels)
  const minSwipeDistance = 50;
  
  // Handle touch start
  const onTouchStart = (e) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  // Handle touch move
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  // Handle touch end for swipe navigation
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && view === 'day') {
      // Swipe left: next day
      setCurrentDate(addDays(currentDate, 1));
    } else if (isRightSwipe && view === 'day') {
      // Swipe right: previous day
      setCurrentDate(addDays(currentDate, -1));
    } else if (isLeftSwipe && view === 'week') {
      // Swipe left: next week
      handleNextWeek();
    } else if (isRightSwipe && view === 'week') {
      // Swipe right: previous week
      handlePreviousWeek();
    }
  };
  
  // Get available slots for a specific date (mobile day view)
  const getAvailableSlotsForDate = (date) => {
    return TIME_SLOTS.filter(time => {
      const status = getCellStatus(date, time);
      return status === 'available' && isBookable(date, time);
    }).map(time => ({
      time,
      date,
      status: getCellStatus(date, time)
    }));
  };
  
  // Handle slot selection for mobile
  const handleMobileSlotSelect = (date, time) => {
    setSelectedSlot({ date, time });
    onSlotSelect(date, time);
    if (isMobile) {
      setShowTimeSlots(false); // Close drawer after selection
    }
  };
  
  // Get next available date
  const getNextAvailableDate = () => {
    const today = new Date();
    for (let i = 1; i <= 30; i++) { // Check next 30 days
      const checkDate = addDays(today, i);
      const availableSlots = getAvailableSlotsForDate(checkDate);
      if (availableSlots.length > 0) {
        return checkDate;
      }
    }
    return null;
  };
  
  // Quick navigation to next available slot
  const goToNextAvailable = () => {
    const nextDate = getNextAvailableDate();
    if (nextDate) {
      setCurrentDate(nextDate);
      setView('day');
    }
  };
  const getCellStatus = (date, time) => {
    const slotDate = new Date(date);
    // Convert from "8:00 AM" format to 24-hour format for comparison
    const timeString = convertTo24Hour(time);
    const slotTime = new Date(`1970-01-01T${timeString}:00`);
    
    // Combine date and time
    const slotDateTime = new Date(
      slotDate.getFullYear(),
      slotDate.getMonth(),
      slotDate.getDate(),
      slotTime.getHours(),
      slotTime.getMinutes()
    );
    
    // Adjust for Libya timezone (UTC+2)
    if (viewType === 'instructor') {
      // For instructors, we show times in their local time (Libya UTC+2)
      // So we need to adjust the slotDateTime to UTC by subtracting 2 hours
      slotDateTime.setHours(slotDateTime.getHours() - 2);
    }
    
    // Check if slot is in the past
    if (isBefore(slotDateTime, new Date()) && viewType === 'student') {
      return 'past';
    }
    
    // Check if slot is available
    const isAvailable = availability.some(a => {
      // For non-pattern slots, check exact date match
      if (!a.isPattern) {
        // Adjust for Libya timezone when comparing dates
        const availabilityDate = new Date(a.date);
        if (viewType === 'instructor') {
          availabilityDate.setHours(availabilityDate.getHours() + 2); // Convert to UTC+2 for display
        }
        
        return isSameDay(availabilityDate, slotDateTime) && 
               format(a.startTime, 'h:mm a') === time;
      }
      
      // For pattern slots, check if this day matches the pattern
      if (a.isPattern) {
        if (a.patternType === 'weekly') {
          // Adjust for Libya timezone when checking days
          const availabilityDate = new Date(a.startDate);
          if (viewType === 'instructor') {
            availabilityDate.setHours(availabilityDate.getHours() + 2); // Convert to UTC+2 for display
          }
          
          // Check if this day is in the pattern's days of week
          return a.daysOfWeek.includes(slotDateTime.getDay()) && 
                 format(a.startTime, 'h:mm a') === time;
        }
      }
      
      return false;
    });
    
    // Check if slot is booked
    const isBooked = bookings.some(b => {
      const bookingTime = new Date(b.startTime);
      if (viewType === 'instructor') {
        bookingTime.setHours(bookingTime.getHours() + 2); // Convert to UTC+2 for display
      }
      return isSameDay(bookingTime, slotDateTime);
    });
    
    if (isBooked) return 'booked';
    if (isAvailable) return 'available';
    return 'unavailable';
  };
  
  // Helper function to convert "8:00 AM" to "08:00"
  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };
  
  // Helper function to convert "08:00" to "8:00 AM"
  const convertTo12Hour = (time24h) => {
    const [hours, minutes] = time24h.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  // Get cell color based on status
  const getCellColor = (status) => {
    switch (status) {
      case 'available':
        return 'primary.main';
      case 'booked':
        return 'secondary.main';
      case 'unavailable':
        return 'action.disabledBackground';
      case 'past':
        return 'action.hover';
      default:
        return 'transparent';
    }
  };
  
  // Check if slot is available for booking
  const isBookable = (date, time) => {
    const slotDate = new Date(date);
    const slotTime = new Date(`1970-01-01T${time}:00`);
    
    // Combine date and time
    const slotDateTime = new Date(
      slotDate.getFullYear(),
      slotDate.getMonth(),
      slotDate.getDate(),
      slotTime.getHours(),
      slotTime.getMinutes()
    );
    
    // Convert to Libya time for comparison
    const libyaSlotTime = new Date(slotDateTime);
    libyaSlotTime.setHours(libyaSlotTime.getHours() + 2);
    
    // Check if slot is in the past
    if (isBefore(libyaSlotTime, new Date()) && viewType === 'student') {
      return false;
    }
    
    // Check if slot is available
    const isAvailable = availability.some(a => {
      // For non-pattern slots, check exact date match
      if (!a.isPattern) {
        // Adjust for Libya timezone
        const availabilityDate = new Date(a.date);
        availabilityDate.setHours(availabilityDate.getHours() + 2);
        
        return isSameDay(availabilityDate, libyaSlotTime) && 
               format(a.startTime, 'HH:mm') === time;
      }
      
      // For pattern slots, check if this day matches the pattern
      if (a.isPattern) {
        if (a.patternType === 'weekly') {
          // Check if this day is in the pattern's days of week
          return a.daysOfWeek.includes(libyaSlotTime.getDay()) && 
                 format(a.startTime, 'HH:mm') === time;
        }
      }
      
      return false;
    });
    
    // Check if slot is already booked
    const isBooked = bookings.some(b => {
      const bookingTime = new Date(b.startTime);
      bookingTime.setHours(bookingTime.getHours() + 2); // Convert to Libya time
      return isSameDay(bookingTime, libyaSlotTime);
    });
    
    return isAvailable && !isBooked;
  };
  
  // Load data for current week
  useEffect(() => {
    const loadData = async () => {
      if (instructorId) {
        // Load instructor availability
        const instructorAvailability = await getAvailabilityForWeek(instructorId, weekDates[0], weekDates[6]);
        setAvailability(instructorAvailability);
        
        // Load instructor bookings
        const instructorBookings = await getBookingsForWeek(instructorId, weekDates[0], weekDates[6]);
        setBookings(instructorBookings);
      } else if (userId) {
        // Load student bookings
        const studentBookings = await getBookingsForWeek(userId, weekDates[0], weekDates[6]);
        setBookings(studentBookings);
        
        // In a real implementation, we'd also get the instructor's availability
        // when viewing a specific session type
      }
    };
    
    loadData();
  }, [currentDate, instructorId, userId, viewType]);
  
  // Handle previous week
  const handlePreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };
  
  // Handle next week
  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };
  
  // Handle day view
  const handleDayView = (date) => {
    if (isToday(date)) {
      setCurrentDate(date);
      setView('day');
    }
  };
  
  // Handle week view
  const handleWeekView = () => {
    setView('week');
  };
  
  return (
    <Paper 
      sx={{ 
        p: isMobile ? 2 : 3, 
        direction: isRTL ? 'rtl' : 'ltr',
        minHeight: isMobile ? '60vh' : 'auto'
      }}
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
    >
      {/* Mobile-first header with touch-friendly controls */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 2 : 1
      }}>
        <Typography variant={isMobile ? "h6" : "h6"} sx={{ 
          textAlign: isMobile ? 'center' : 'left',
          mb: isMobile ? 1 : 0
        }}>
          {view === 'week' ? t('sessions.calendar.weeklySchedule', 'Weekly Schedule') : t('sessions.calendar.dailySchedule', 'Daily Schedule')}
        </Typography>
        
        {/* Mobile view toggle buttons */}
        {isMobile && (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button 
              variant={view === 'day' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<ViewDay />}
              onClick={() => setView('day')}
            >
              {t('sessions.calendar.dayView', 'Day')}
            </Button>
            <Button 
              variant={view === 'week' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<ViewWeek />}
              onClick={() => setView('week')}
            >
              {t('sessions.calendar.weekView', 'Week')}
            </Button>
          </Stack>
        )}
        
        {/* Navigation controls */}
        <Box sx={{ 
          display: 'flex', 
          gap: isMobile ? 1 : 2, 
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto'
        }}>
          {view === 'week' && (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'space-between' : 'center'
              }}>
                <IconButton 
                  onClick={handlePreviousWeek}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                
                <Typography variant={isMobile ? "body1" : "body2"} sx={{ 
                  fontWeight: 'medium',
                  textAlign: 'center',
                  minWidth: isMobile ? '140px' : 'auto'
                }}>
                  {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
                </Typography>
                
                <IconButton 
                  onClick={handleNextWeek}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
            </>
          )}
          
          {view === 'day' && (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'space-between' : 'center'
              }}>
                <IconButton 
                  onClick={() => setCurrentDate(addDays(currentDate, -1))}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                
                <Typography variant={isMobile ? "body1" : "body2"} sx={{ 
                  fontWeight: 'medium',
                  textAlign: 'center',
                  minWidth: isMobile ? '180px' : 'auto'
                }}>
                  {format(currentDate, isMobile ? 'EEE, MMM d' : 'EEEE, MMMM d, yyyy')}
                </Typography>
                
                <IconButton 
                  onClick={() => setCurrentDate(addDays(currentDate, 1))}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
              
              {!isMobile && (
                <Button 
                  variant="outlined" 
                  onClick={handleWeekView}
                  startIcon={<ViewWeek />}
                >
                  {t('sessions.calendar.backToWeek', 'Back to Week')}
                </Button>
              )}
            </>
          )}
          
          {/* Quick access to next available slot */}
          {viewType === 'student' && isMobile && (
            <Button 
              variant="contained"
              color="secondary"
              size="small"
              onClick={goToNextAvailable}
              startIcon={<Schedule />}
              fullWidth={isMobile}
            >
              {t('sessions.calendar.nextAvailable', 'Next Available')}
            </Button>
          )}
        </Box>
      </Box>
      
      {view === 'week' && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">{t('sessions.calendar.time', 'Time')}</TableCell>
                {weekDates.map((date, index) => (
                  <TableCell key={index} align="center">
                    <Typography 
                      variant="subtitle2" 
                      onClick={() => handleDayView(date)}
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {format(date, 'EEE, MMM d')}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map((time, timeIndex) => (
                <TableRow key={timeIndex}>
                  <TableCell align="center">
                    {time}
                  </TableCell>
                  {weekDates.map((date, dateIndex) => {
                    const status = getCellStatus(date, time);
                    
                    return (
                      <TableCell 
                        key={`${dateIndex}-${timeIndex}`} 
                        align="center"
                        sx={{ 
                          bgcolor: getCellColor(status),
                          cursor: viewType === 'student' && status === 'available' ? 'pointer' : 'default',
                          '&:hover': { 
                            bgcolor: viewType === 'student' && status === 'available' ? 'primary.dark' : 'inherit'
                          }
                        }}
                        onClick={() => {
                          if (viewType === 'student' && status === 'available' && isBookable(date, time)) {
                            // In a real implementation, this would call onSlotSelect with date and time
                            onSlotSelect(date, time);
                          }
                        }}
                      >
                        {status === 'booked' && (
                          <Typography variant="caption" color="white">
                            {t('sessions.calendar.booked', 'Booked')}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Mobile-optimized day view with card layout */}
      {view === 'day' && isMobile && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ 
            textAlign: 'center', 
            mb: 2,
            color: 'primary.main',
            fontWeight: 'medium' 
          }}>
            {isToday(currentDate) ? 
              t('sessions.calendar.todaySchedule', 'Today\'s Schedule') : 
              format(currentDate, 'EEEE, MMMM d, yyyy')
            }
          </Typography>
          
          {/* Swipe hint for mobile users */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2,
            color: 'text.secondary'
          }}>
            <TouchIcon sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="caption">
              {t('sessions.calendar.swipeHint', 'Swipe left/right to navigate days')}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {(() => {
              const availableSlots = getAvailableSlotsForDate(currentDate);
              const bookedSlots = TIME_SLOTS.filter(time => {
                const status = getCellStatus(currentDate, time);
                return status === 'booked';
              });
              
              if (availableSlots.length === 0 && bookedSlots.length === 0) {
                return (
                  <Grid item xs={12}>
                    <Card sx={{ 
                      textAlign: 'center', 
                      p: 4,
                      bgcolor: 'grey.50',
                      border: '2px dashed',
                      borderColor: 'grey.300'
                    }}>
                      <Schedule sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t('sessions.calendar.noSlotsAvailable', 'No slots available')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('sessions.calendar.noSlotsMessage', 'No sessions are scheduled for this day.')}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        onClick={goToNextAvailable}
                        startIcon={<Schedule />}
                      >
                        {t('sessions.calendar.findNextAvailable', 'Find Next Available')}
                      </Button>
                    </Card>
                  </Grid>
                );
              }
              
              const allSlots = [...availableSlots, ...bookedSlots.map(time => ({
                time,
                date: currentDate,
                status: 'booked'
              }))];
              
              // Sort slots by time
              allSlots.sort((a, b) => {
                const timeA = new Date(`1970-01-01T${convertTo24Hour(a.time)}:00`);
                const timeB = new Date(`1970-01-01T${convertTo24Hour(b.time)}:00`);
                return timeA - timeB;
              });
              
              return allSlots.map(({ time, date, status }, index) => {
                const isSelected = selectedSlot?.time === time && isSameDay(selectedSlot?.date, date);
                const isBookable = status === 'available' && viewType === 'student';
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={`${time}-${index}`}>
                    <Card 
                      sx={{ 
                        cursor: isBookable ? 'pointer' : 'default',
                        border: 2,
                        borderColor: 
                          isSelected ? 'primary.main' :
                          status === 'available' ? 'success.main' :
                          status === 'booked' ? 'warning.main' : 'grey.300',
                        bgcolor: 
                          isSelected ? 'primary.50' :
                          status === 'available' ? 'success.50' :
                          status === 'booked' ? 'warning.50' : 'grey.50',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': isBookable ? {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                          borderColor: 'primary.main'
                        } : {},
                        '&:active': isBookable ? {
                          transform: 'translateY(0px)',
                          boxShadow: 2
                        } : {}
                      }}
                      onClick={() => {
                        if (isBookable) {
                          handleMobileSlotSelect(date, time);
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {time}
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              status === 'available' ? 
                                t('sessions.calendar.available', 'Available') :
                              status === 'booked' ? 
                                t('sessions.calendar.booked', 'Booked') :
                                t('sessions.calendar.unavailable', 'Unavailable')
                            }
                            color={
                              status === 'available' ? 'success' :
                              status === 'booked' ? 'warning' : 'default'
                            }
                            variant={status === 'available' ? 'filled' : 'outlined'}
                          />
                        </Box>
                        
                        {status === 'available' && viewType === 'student' && (
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                            {t('sessions.calendar.tapToBook', 'Tap to book this slot')}
                          </Typography>
                        )}
                        
                        {status === 'booked' && (
                          <Typography variant="body2" color="text.secondary">
                            {t('sessions.calendar.alreadyBooked', 'This slot is already booked')}
                          </Typography>
                        )}
                        
                        {isSelected && (
                          <Box sx={{ 
                            mt: 1, 
                            p: 1, 
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            borderRadius: 1,
                            textAlign: 'center'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              {t('sessions.calendar.selected', 'SELECTED')}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              });
            })()
            }
          </Grid>
        </Box>
      )}
      
      {/* Desktop day view (table format) */}
      {view === 'day' && !isMobile && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">{t('sessions.calendar.time', 'Time')}</TableCell>
                  <TableCell align="center">{t('sessions.calendar.instructor', 'Instructor')}</TableCell>
                  <TableCell align="center">{t('sessions.calendar.sessionType', 'Session Type')}</TableCell>
                  <TableCell align="center">{t('sessions.calendar.status', 'Status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TIME_SLOTS.map((time, index) => {
                  const slotDate = new Date(currentDate);
                  const slotTime = new Date(`1970-01-01T${convertTo24Hour(time)}:00`);
                  
                  // Combine date and time
                  const slotDateTime = new Date(
                    slotDate.getFullYear(),
                    slotDate.getMonth(),
                    slotDate.getDate(),
                    slotTime.getHours(),
                    slotTime.getMinutes()
                  );
                  
                  // Check if slot is available
                  const isAvailable = availability.some(a => 
                    isSameDay(new Date(a.date), currentDate) && 
                    format(new Date(a.startTime), 'HH:mm') === convertTo24Hour(time)
                  );
                  
                  // Check if slot is booked
                  const booking = bookings.find(b => 
                    isSameDay(new Date(b.startTime), currentDate) && 
                    format(new Date(b.startTime), 'HH:mm') === convertTo24Hour(time)
                  );
                  
                  const status = getCellStatus(currentDate, time);
                  
                  return (
                    <TableRow key={index}>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {time}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {booking ? booking.instructor?.displayName : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {booking ? booking.sessionType?.name : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {booking ? (
                          <Chip 
                            label={booking.status} 
                            color={booking.status === 'completed' ? 'info' : 
                                   booking.status === 'cancelled' ? 'error' : 'default'} 
                            size="small" 
                          />
                        ) : (
                          <Button 
                            variant={status === 'available' ? 'contained' : 'outlined'}
                            color="primary"
                            size="small"
                            disabled={status !== 'available'}
                            onClick={() => {
                              if (status === 'available' && viewType === 'student') {
                                onSlotSelect(currentDate, time);
                              }
                            }}
                          >
                            {status === 'available' ? 
                              t('sessions.calendar.book', 'Book') : 
                              t('sessions.calendar.unavailable', 'N/A')
                            }
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* Floating Action Button for quick booking (mobile only) */}
      {isMobile && viewType === 'student' && view === 'day' && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setShowTimeSlots(true)}
        >
          <Schedule />
        </Fab>
      )}
      
      {/* Mobile drawer for quick time slot selection */}
      <SwipeableDrawer
        anchor="bottom"
        open={showTimeSlots && isMobile}
        onClose={() => setShowTimeSlots(false)}
        onOpen={() => setShowTimeSlots(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '60vh'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
            {t('sessions.calendar.quickBook', 'Quick Book')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          
          <List>
            {getAvailableSlotsForDate(currentDate).map(({ time, date }) => (
              <ListItemButton
                key={time}
                onClick={() => handleMobileSlotSelect(date, time)}
                sx={{
                  border: 1,
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'primary.50'
                  }
                }}
              >
                <ListItemText
                  primary={time}
                  secondary={t('sessions.calendar.available', 'Available')}
                  primaryTypographyProps={{
                    variant: 'h6',
                    color: 'primary.main'
                  }}
                  secondaryTypographyProps={{
                    color: 'success.main'
                  }}
                />
              </ListItemButton>
            ))}
            
            {getAvailableSlotsForDate(currentDate).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {t('sessions.calendar.noAvailableSlots', 'No available slots for this date.')}
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </SwipeableDrawer>
    </Paper>
  );
};

export default SessionBookingCalendar;