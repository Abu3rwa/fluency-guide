import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Divider,
  Button,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const SessionBookingConfirmation = ({ 
  bookingDetails, 
  onConfirm, 
  onCancel 
}) => {
  const { t } = useTranslation();
  if (!bookingDetails) return null;

  const { 
    instructor, 
    student,
    sessionType,
    date,
    startTime,
    endTime,
    price,
    currency,
    status,
    paymentStatus
  } = bookingDetails;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('sessions.shared.booking.confirmation.title', 'Booking Confirmation')}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {instructor.displayName}
          </Typography>
          <Typography color="text.secondary">
            {instructor.email}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            {t('sessions.admin.bookingQueue.student', 'Student')}
          </Typography>
          <Typography>
            {student.displayName}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            {t('sessions.shared.sessionType', 'Session Type')}
          </Typography>
          <Typography>
            {sessionType.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sessionType.description}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            {t('sessions.shared.booking.confirmation.dateTime', 'Date & Time')}
          </Typography>
          <Typography>
            {date ? format(date, 'EEEE, MMMM d') : t('sessions.shared.na', 'N/A')} • 
            {startTime ? format(startTime, 'h:mm a') : t('sessions.shared.na', 'N/A')} - 
            {endTime ? format(endTime, 'h:mm a') : t('sessions.shared.na', 'N/A')}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            {t('sessions.shared.status', 'Status')}
          </Typography>
          <Typography>
            <Chip 
              label={status} 
              color={getStatusColor(status)} 
              size="small" 
              sx={{ color: 'white' }}
            />
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            {t('sessions.admin.bookingQueue.paymentStatus', 'Payment Status')}
          </Typography>
          <Typography>
            {paymentStatus || t('sessions.shared.na', 'N/A')}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            {t('sessions.booking.dialog.price', 'Price')}
          </Typography>
          <Typography variant="h6" color="primary">
            {currency || 'USD'}{price || 0}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onCancel}
          >
            {t('sessions.shared.cancel', 'Cancel')}
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onConfirm}
            disabled={status === 'confirmed'}
          >
            {status === 'confirmed' ? t('sessions.admin.bookingQueue.booked', 'Booked') : t('sessions.booking.dialog.confirmBooking', 'Confirm Booking')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SessionBookingConfirmation;