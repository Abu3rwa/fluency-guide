import React from 'react';
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
  Chip,
  Button,
  Avatar
} from '@mui/material';

const BookingQueue = ({ bookings = [], instructors = [], onBookingUpdate = () => {} }) => {
  if (!bookings || bookings.length === 0) return null;

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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell>Session Type</TableCell>
              <TableCell align="center">Booking Date</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Payment</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => {
              const instructor = instructors.find(i => i.id === booking.instructorId);
              
              return (
                <TableRow key={booking.id}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        src={booking.photoURL} 
                        alt={booking.displayName} 
                        sx={{ width: 32, height: 32 }}
                      />
                      <Typography>{booking.displayName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {instructor?.displayName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {booking.sessionType}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={booking.status} 
                      color={getStatusColor(booking.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={booking.paymentStatus} 
                      color={getPaymentStatusColor(booking.paymentStatus)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="primary"
                        onClick={() => onBookingUpdate(booking.id, { status: 'confirmed' })}
                      >
                        Confirm
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="secondary"
                        onClick={() => onBookingUpdate(booking.id, { status: 'cancelled' })}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="primary"
                        onClick={() => onBookingUpdate(booking.id, { status: 'completed' })}
                      >
                        Complete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BookingQueue;