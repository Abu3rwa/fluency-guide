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
  Avatar,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Send as SendIcon } from '@mui/icons-material';

const NotificationManagement = ({ 
  notifications = [], 
  onNotificationUpdate = () => {},
  onNotificationDelete = () => {}
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'booking_confirmation':
        return 'primary';
      case 'reminder':
        return 'secondary';
      case 'status_update':
        return 'info';
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
              <TableCell>User</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell align="center">Priority</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      src={notification.photoURL} 
                      alt={notification.displayName} 
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography>{notification.displayName}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={notification.type.replace('_', ' ')} 
                    color={getTypeColor(notification.type)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {notification.message.length > 50 
                    ? notification.message.substring(0, 50) + '...' 
                    : notification.message}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={notification.priority} 
                    color={notification.priority === 'high' ? 'error' : 
                          notification.priority === 'medium' ? 'warning' : 'success'} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={notification.status} 
                    color={getStatusColor(notification.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => onNotificationUpdate(notification.id, { status: 'sent' })}
                      disabled={notification.status === 'sent'}
                    >
                      <SendIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="secondary"
                      onClick={() => onNotificationDelete(notification.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {notifications.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No notifications in the queue.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default NotificationManagement;