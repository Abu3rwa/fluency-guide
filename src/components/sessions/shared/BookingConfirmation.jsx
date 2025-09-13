import React from 'react';
import { Box, Card, CardContent, Typography, Button, Divider } from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const BookingConfirmation = ({ bookingDetails, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  if (!bookingDetails) return null;

  const { 
    session, 
    instructor, 
    sessionType, 
    date, 
    startTime, 
    endTime, 
    price, 
    currency 
  } = bookingDetails;

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
            {sessionType?.name || session?.type || t('sessions.shared.sessionCard.session', 'Session')}
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
            {t('sessions.shared.booking.confirmation.back', 'Back')}
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onConfirm}
          >
            {t('sessions.booking.dialog.confirmBooking', 'Confirm Booking')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingConfirmation;