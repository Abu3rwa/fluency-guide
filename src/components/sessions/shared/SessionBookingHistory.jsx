import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const SessionBookingHistory = ({ 
  bookings = [], 
  onRateSession = () => {}
}) => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleRateClick = (booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setRating(0);
    setReview('');
  };

  const handleSubmitRating = () => {
    if (selectedBooking && rating > 0) {
      onRateSession(selectedBooking.id, rating, review);
      handleDialogClose();
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('sessions.shared.sessionHistory', 'Session History')}
      </Typography>
      
      {bookings.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('sessions.shared.noPastSessions', 'No past sessions found.')}
          </Typography>
        </Paper>
      )}
      
      {bookings.length > 0 && (
        <TableContainer component={Paper}>
          <Table aria-label="session history table">
            <TableHead>
              <TableRow>
                <TableCell>{t('sessions.shared.date', 'Date')}</TableCell>
                <TableCell>{t('sessions.shared.time', 'Time')}</TableCell>
                <TableCell>{t('sessions.shared.instructor', 'Instructor')}</TableCell>
                <TableCell>{t('sessions.shared.sessionType', 'Session Type')}</TableCell>
                <TableCell>{t('sessions.shared.status', 'Status')}</TableCell>
                <TableCell>{t('sessions.shared.rating', 'Rating')}</TableCell>
                <TableCell align="right">{t('sessions.shared.actions', 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell component="th" scope="row">
                    {format(booking.startTime, 'EEEE, MMMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(booking.startTime, 'h:mm a')} - {format(booking.endTime, 'h:mm a')}
                  </TableCell>
                  <TableCell>
                    {booking.instructor.displayName}
                  </TableCell>
                  <TableCell>
                    {booking.sessionType.name}
                  </TableCell>
                  <TableCell>
                    {booking.status}
                  </TableCell>
                  <TableCell>
                    {booking.rating ? (
                      <Rating 
                        value={booking.rating.student || 0} 
                        readOnly 
                        precision={0.5} 
                      />
                    ) : (
                      t('sessions.shared.na', 'N/A')
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {booking.status === 'completed' && !booking.rating && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        onClick={() => handleRateClick(booking)}
                      >
                        {t('sessions.shared.rateSession', 'Rate Session')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{t('sessions.shared.rateYourSession', 'Rate Your Session')}</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>
                {format(selectedBooking.startTime, 'EEEE, MMMM d, yyyy')} • 
                {format(selectedBooking.startTime, 'h:mm a')} - {format(selectedBooking.endTime, 'h:mm a')}
              </Typography>
              
              <Typography gutterBottom>
                {t('sessions.shared.instructor', 'Instructor')}: {selectedBooking.instructor.displayName}
              </Typography>
              
              <Typography gutterBottom>
                {t('sessions.shared.sessionType', 'Session Type')}: {selectedBooking.sessionType.name}
              </Typography>
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography gutterBottom>
                  {t('sessions.shared.yourRating', 'Your Rating:')}
                </Typography>
                <Rating 
                  value={rating} 
                  onChange={(event, newValue) => {
                    setRating(newValue);
                  }} 
                  precision={0.5} 
                  size="large"
                />
              </Box>
              
              <TextField
                autoFocus
                margin="dense"
                id="review"
                label={t('sessions.shared.yourReview', 'Your Review')}
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>{t('sessions.shared.cancel', 'Cancel')}</Button>
          <Button 
            onClick={handleSubmitRating} 
            variant="contained" 
            color="primary"
            disabled={rating <= 0}
          >
            {t('sessions.shared.submitRating', 'Submit Rating')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionBookingHistory;