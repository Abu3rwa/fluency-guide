import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Menu,
  Tabs,
  Tab,
  Grid,
  Badge,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon,
  WhatsApp as WhatsAppIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

// Import services
import { notificationService } from '../../../services/notificationService';

const NotificationQueue = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Dialog states
  const [previewDialog, setPreviewDialog] = useState(false);
  const [sendDialog, setSendDialog] = useState(false);
  const [manualMessageDialog, setManualMessageDialog] = useState(false);
  
  // Manual message state
  const [manualMessage, setManualMessage] = useState({
    phoneNumber: '',
    message: '',
    type: 'custom',
    priority: 'normal'
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
    queued: 0
  });

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, [activeTab, filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get notifications based on active tab and filters
      const notificationData = await notificationService.getNotifications({
        status: activeTab === 0 ? 'pending' : activeTab === 1 ? 'sent' : filters.status,
        type: filters.type !== 'all' ? filters.type : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined
      });

      setNotifications(notificationData || []);
      calculateStats(notificationData);

    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(t('notifications.errorLoading', 'Error loading notifications'));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (notificationData) => {
    const total = notificationData.length;
    const pending = notificationData.filter(n => n.status === 'pending').length;
    const sent = notificationData.filter(n => n.status === 'sent').length;
    const failed = notificationData.filter(n => n.status === 'failed').length;
    const queued = notificationData.filter(n => n.status === 'queued').length;

    setStats({ total, pending, sent, failed, queued });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleSendNotification = async (notificationId) => {
    try {
      await notificationService.sendNotification(notificationId);
      await loadNotifications(); // Refresh data
      setSendDialog(false);
      handleMenuClose();
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(t('notifications.errorSending', 'Error sending notification'));
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications(); // Refresh data
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError(t('notifications.errorDeleting', 'Error deleting notification'));
    }
  };

  const handleSendManualMessage = async () => {
    try {
      await notificationService.createManualNotification({
        phoneNumber: manualMessage.phoneNumber,
        message: manualMessage.message,
        type: manualMessage.type,
        priority: manualMessage.priority,
        createdAt: new Date(),
        status: 'pending'
      });
      
      setManualMessageDialog(false);
      setManualMessage({
        phoneNumber: '',
        message: '',
        type: 'custom',
        priority: 'normal'
      });
      
      await loadNotifications(); // Refresh data
    } catch (error) {
      console.error('Error creating manual message:', error);
      setError(t('notifications.errorCreatingManual', 'Error creating manual message'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      case 'queued': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircleIcon />;
      case 'failed': return <ErrorIcon />;
      case 'pending': return <PendingIcon />;
      case 'queued': return <ScheduleIcon />;
      default: return <PendingIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'normal': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h6" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const NotificationPreviewDialog = () => (
    <Dialog 
      open={previewDialog} 
      onClose={() => setPreviewDialog(false)} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        {t('notifications.previewMessage', 'Preview Message')}
      </DialogTitle>
      <DialogContent>
        {selectedNotification && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('notifications.phoneNumber', 'Phone Number')}:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {selectedNotification.phoneNumber}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              {t('notifications.message', 'Message')}:
            </Typography>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}
            >
              {selectedNotification.message}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreviewDialog(false)}>
          {t('common.close', 'Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const SendConfirmDialog = () => (
    <Dialog 
      open={sendDialog} 
      onClose={() => setSendDialog(false)} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        {t('notifications.confirmSend', 'Confirm Send')}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t('notifications.confirmSendMessage', 'Are you sure you want to send this WhatsApp message?')}
        </Typography>
        {selectedNotification && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('notifications.to', 'To')}: {selectedNotification.phoneNumber}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSendDialog(false)}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button 
          onClick={() => handleSendNotification(selectedNotification?.id)} 
          color="primary"
          variant="contained"
          startIcon={<SendIcon />}
        >
          {t('notifications.send', 'Send')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ManualMessageDialog = () => (
    <Dialog 
      open={manualMessageDialog} 
      onClose={() => setManualMessageDialog(false)} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        {t('notifications.createManualMessage', 'Create Manual Message')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('notifications.phoneNumber', 'Phone Number')}
              value={manualMessage.phoneNumber}
              onChange={(e) => setManualMessage(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="+218xxxxxxxxx"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label={t('notifications.priority', 'Priority')}
              value={manualMessage.priority}
              onChange={(e) => setManualMessage(prev => ({ ...prev, priority: e.target.value }))}
            >
              <MenuItem value="low">{t('notifications.priority.low', 'Low')}</MenuItem>
              <MenuItem value="normal">{t('notifications.priority.normal', 'Normal')}</MenuItem>
              <MenuItem value="high">{t('notifications.priority.high', 'High')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('notifications.message', 'Message')}
              value={manualMessage.message}
              onChange={(e) => setManualMessage(prev => ({ ...prev, message: e.target.value }))}
              placeholder={t('notifications.messagePlaceholder', 'Type your WhatsApp message here...')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setManualMessageDialog(false)}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button 
          onClick={handleSendManualMessage}
          color="primary"
          variant="contained"
          disabled={!manualMessage.phoneNumber || !manualMessage.message}
          startIcon={<AddIcon />}
        >
          {t('notifications.addToQueue', 'Add to Queue')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const filteredNotifications = notifications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>{t('notifications.loading', 'Loading notifications...')}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('notifications.title', 'WhatsApp Notification Queue')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('notifications.subtitle', 'Manage WhatsApp notifications for session bookings and manual messages')}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton onClick={loadNotifications} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setManualMessageDialog(true)}
          >
            {t('notifications.createManual', 'Create Manual')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('notifications.total', 'Total')}
            value={stats.total}
            icon={<WhatsAppIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('notifications.pending', 'Pending')}
            value={stats.pending}
            icon={<PendingIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('notifications.sent', 'Sent')}
            value={stats.sent}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('notifications.failed', 'Failed')}
            value={stats.failed}
            icon={<ErrorIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('notifications.queued', 'Queued')}
            value={stats.queued}
            icon={<ScheduleIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={stats.pending} color="warning">
                  {t('notifications.pendingMessages', 'Pending Messages')}
                </Badge>
              }
            />
            <Tab label={t('notifications.sentMessages', 'Sent Messages')} />
            <Tab label={t('notifications.failedMessages', 'Failed Messages')} />
            <Tab label={t('notifications.allMessages', 'All Messages')} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              select
              size="small"
              label={t('notifications.type', 'Type')}
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">{t('notifications.allTypes', 'All Types')}</MenuItem>
              <MenuItem value="booking_confirmation">{t('notifications.bookingConfirmation', 'Booking Confirmation')}</MenuItem>
              <MenuItem value="booking_reminder">{t('notifications.bookingReminder', 'Booking Reminder')}</MenuItem>
              <MenuItem value="session_cancelled">{t('notifications.sessionCancelled', 'Session Cancelled')}</MenuItem>
              <MenuItem value="custom">{t('notifications.custom', 'Custom')}</MenuItem>
            </TextField>
            
            <TextField
              select
              size="small"
              label={t('notifications.priority', 'Priority')}
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">{t('notifications.allPriorities', 'All Priorities')}</MenuItem>
              <MenuItem value="high">{t('notifications.priority.high', 'High')}</MenuItem>
              <MenuItem value="normal">{t('notifications.priority.normal', 'Normal')}</MenuItem>
              <MenuItem value="low">{t('notifications.priority.low', 'Low')}</MenuItem>
            </TextField>
          </Box>

          {/* Notifications Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('notifications.phoneNumber', 'Phone Number')}</TableCell>
                  <TableCell>{t('notifications.type', 'Type')}</TableCell>
                  <TableCell>{t('notifications.message', 'Message')}</TableCell>
                  <TableCell>{t('notifications.priority', 'Priority')}</TableCell>
                  <TableCell>{t('notifications.status', 'Status')}</TableCell>
                  <TableCell>{t('notifications.created', 'Created')}</TableCell>
                  <TableCell align="center">{t('notifications.actions', 'Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id} hover>
                    <TableCell>{notification.phoneNumber}</TableCell>
                    <TableCell>
                      <Chip 
                        label={t(`notifications.types.${notification.type}`, notification.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {notification.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(`notifications.priority.${notification.priority}`, notification.priority)}
                        color={getPriorityColor(notification.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={getStatusIcon(notification.status)}
                        label={t(`notifications.status.${notification.status}`, notification.status)}
                        color={getStatusColor(notification.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(notification.createdAt).format('MMM DD, HH:mm')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, notification)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={notifications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setPreviewDialog(true);
          handleMenuClose();
        }}>
          <PreviewIcon sx={{ mr: 1 }} />
          {t('notifications.preview', 'Preview')}
        </MenuItem>
        
        {selectedNotification?.status === 'pending' && (
          <MenuItem onClick={() => {
            setSendDialog(true);
            handleMenuClose();
          }}>
            <SendIcon sx={{ mr: 1 }} />
            {t('notifications.sendNow', 'Send Now')}
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          handleDeleteNotification(selectedNotification?.id);
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('notifications.delete', 'Delete')}
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <NotificationPreviewDialog />
      <SendConfirmDialog />
      <ManualMessageDialog />
    </Box>
  );
};

export default NotificationQueue;