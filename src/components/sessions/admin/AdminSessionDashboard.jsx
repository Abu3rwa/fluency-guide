import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  IconButton,
  Menu,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  useMediaQuery,
  Fab
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';

import SessionOverview from './SessionOverview';
import SessionAnalytics from './SessionAnalytics';
import InstructorPerformance from './InstructorPerformance';
import BookingQueue from './BookingQueue';
import { sessionService, bookingService, sessionTypeService } from '../../../services/sessionService';
import { getInstructors } from '../../../services/userService';
import { getSessionTypeNameString } from '../../../utils/sessionLocalization';

const AdminSessionDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    instructor: '',
    status: '',
    dateRange: 'all',
    search: ''
  });
  
  // Data states
  const [instructors, setInstructors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [performance, setPerformance] = useState([]);
  
  // UI states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', item: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data in parallel
      const [instructorsData, bookingsData, sessionsData, sessionTypesData] = await Promise.all([
        getInstructors().catch(err => { console.warn('Error loading instructors:', err); return []; }),
        bookingService.getAll().catch(err => { console.warn('Error loading bookings:', err); return []; }),
        sessionService.getAll().catch(err => { console.warn('Error loading sessions:', err); return []; }),
        sessionTypeService.getPublicActive().catch(err => { console.warn('Error loading session types:', err); return []; })
      ]);
      
      setInstructors(instructorsData);
      setBookings(bookingsData);
      setSessions(sessionsData);
      setSessionTypes(sessionTypesData);
      
      // Calculate analytics
      calculateAnalytics(sessionsData, bookingsData, instructorsData);
      
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(t('admin.errorLoading', 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  };
  
  const calculateAnalytics = (sessionsData, bookingsData, instructorsData) => {
    const totalSessions = sessionsData.length;
    const totalBookings = bookingsData.length;
    const totalEarnings = bookingsData
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.price || 0), 0);
    const averageRating = 4.75; // This would be calculated from actual ratings
    
    const sessionsByType = sessionTypes.map(type => ({
      type: type.name,
      count: sessionsData.filter(s => s.sessionTypeId === type.id).length
    }));
    
    const earningsByInstructor = instructorsData.map(instructor => ({
      instructor: instructor.displayName,
      earnings: bookingsData
        .filter(b => b.instructorId === instructor.id && b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0)
    }));
    
    setAnalytics({
      totalSessions,
      totalBookings,
      totalEarnings,
      averageRating,
      sessionsByType,
      earningsByInstructor
    });
    
    // Calculate performance data
    const performanceData = instructorsData.map(instructor => {
      const instructorSessions = sessionsData.filter(s => s.instructorId === instructor.id);
      const instructorBookings = bookingsData.filter(b => b.instructorId === instructor.id);
      
      return {
        instructorId: instructor.id,
        displayName: instructor.displayName,
        averageRating: instructor.instructorProfile?.rating?.average || 0,
        sessions: {
          scheduled: instructorSessions.filter(s => s.status === 'scheduled').length,
          completed: instructorSessions.filter(s => s.status === 'completed').length,
          cancelled: instructorSessions.filter(s => s.status === 'cancelled').length
        },
        totalEarnings: instructorBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.price || 0), 0)
      };
    });
    
    setPerformance(performanceData);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  // Filter sessions based on filters
  const filteredSessions = sessions.filter(session => {
    const instructor = instructors.find(i => i.id === session.instructorId);
    const student = session.userId; // In a real app, we'd get the student name
    const sessionType = session.sessionType;
    
    return (
      (!filters.instructor || session.instructorId === filters.instructor) &&
      (!filters.status || session.status === filters.status) &&
      (filters.search === '' || 
       (instructor && instructor.displayName.toLowerCase().includes(filters.search.toLowerCase())) ||
       (student && student.displayName.toLowerCase().includes(filters.search.toLowerCase())) ||
       sessionType.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('admin.sessionManagement', 'Session Management Dashboard')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('admin.sessionSubtitle', 'Monitor and manage all sessions, bookings, and instructors')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAllData}
            disabled={loading}
          >
            {t('common.refresh', 'Refresh')}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {/* Handle export */}}
          >
            {t('admin.export', 'Export Data')}
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>{t('common.loading', 'Loading...')}</Typography>
        </Box>
      )}
      {/* Quick Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('admin.totalSessions', 'Total Sessions')}
              </Typography>
              <Typography variant="h4">
                {analytics.totalSessions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('admin.totalBookings', 'Total Bookings')}
              </Typography>
              <Typography variant="h4">
                {analytics.totalBookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('admin.totalEarnings', 'Total Earnings')}
              </Typography>
              <Typography variant="h4">
                {analytics.totalEarnings || 0} LYD
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('admin.averageRating', 'Average Rating')}
              </Typography>
              <Typography variant="h4">
                {analytics.averageRating || 0} ⭐
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session Filters
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="instructor-filter-label">Instructor</InputLabel>
              <Select
                labelId="instructor-filter-label"
                id="instructor-filter"
                value={filters.instructor}
                label="Instructor"
                name="instructor"
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>All Instructors</em>
                </MenuItem>
                {instructors.map(instructor => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    {instructor.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filters.status}
                label="Status"
                name="status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>All Status</em>
                </MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="missed">Missed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="date-range-filter-label">Date Range</InputLabel>
              <Select
                labelId="date-range-filter-label"
                id="date-range-filter"
                value={filters.dateRange}
                label="Date Range"
                name="dateRange"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              value={filters.search}
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>
      </Box>
      {/* Management Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={t('admin.allSessions', 'All Sessions')} />
          <Tab label={t('admin.bookingQueue', 'Booking Queue')} />
          <Tab label={t('admin.analytics', 'Analytics')} />
          <Tab label={t('admin.instructorPerformance', 'Instructor Performance')} />
        </Tabs>
        
        <CardContent>
          {/* Tab Content */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('admin.sessionsManagement', 'Sessions Management')}
              </Typography>
              
              {/* Enhanced Filters */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('admin.filterInstructor', 'Filter by Instructor')}</InputLabel>
                    <Select
                      value={filters.instructor}
                      label={t('admin.filterInstructor', 'Filter by Instructor')}
                      onChange={(e) => setFilters(prev => ({ ...prev, instructor: e.target.value }))}
                    >
                      <MenuItem value="">
                        <em>{t('admin.allInstructors', 'All Instructors')}</em>
                      </MenuItem>
                      {instructors.map(instructor => (
                        <MenuItem key={instructor.id} value={instructor.id}>
                          {instructor.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('admin.filterStatus', 'Filter by Status')}</InputLabel>
                    <Select
                      value={filters.status}
                      label={t('admin.filterStatus', 'Filter by Status')}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <MenuItem value="">
                        <em>{t('admin.allStatuses', 'All Statuses')}</em>
                      </MenuItem>
                      <MenuItem value="scheduled">{t('admin.scheduled', 'Scheduled')}</MenuItem>
                      <MenuItem value="completed">{t('admin.completed', 'Completed')}</MenuItem>
                      <MenuItem value="cancelled">{t('admin.cancelled', 'Cancelled')}</MenuItem>
                      <MenuItem value="pending">{t('admin.pending', 'Pending')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('admin.dateRange', 'Date Range')}</InputLabel>
                    <Select
                      value={filters.dateRange}
                      label={t('admin.dateRange', 'Date Range')}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    >
                      <MenuItem value="all">{t('admin.allTime', 'All Time')}</MenuItem>
                      <MenuItem value="today">{t('admin.today', 'Today')}</MenuItem>
                      <MenuItem value="week">{t('admin.thisWeek', 'This Week')}</MenuItem>
                      <MenuItem value="month">{t('admin.thisMonth', 'This Month')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('admin.search', 'Search sessions...')}
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </Grid>
              </Grid>
              
              {/* Sessions Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('admin.sessionType', 'Session Type')}</TableCell>
                      <TableCell>{t('admin.instructor', 'Instructor')}</TableCell>
                      <TableCell>{t('admin.student', 'Student')}</TableCell>
                      <TableCell>{t('admin.dateTime', 'Date & Time')}</TableCell>
                      <TableCell>{t('admin.status', 'Status')}</TableCell>
                      <TableCell>{t('admin.price', 'Price')}</TableCell>
                      <TableCell align="center">{t('admin.actions', 'Actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSessions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((session) => {
                        const instructor = instructors.find(i => i.id === session.instructorId);
                        
                        return (
                          <TableRow key={session.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {session.sessionType ? getSessionTypeNameString(session.sessionType, i18n.language || 'en') : session.sessionTypeName || 'Unknown'}
                              </Typography>
                            </TableCell>
                            
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon fontSize="small" />
                                <Typography variant="body2">
                                  {instructor?.displayName || 'Unknown'}
                                </Typography>
                              </Box>
                            </TableCell>
                            
                            <TableCell>
                              <Typography variant="body2">
                                {session.studentName || session.userId || 'Unknown'}
                              </Typography>
                            </TableCell>
                            
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {session.startTime ? format(new Date(session.startTime), 'MMM dd, yyyy') : 'TBD'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {session.startTime ? format(new Date(session.startTime), 'HH:mm') : session.time || 'TBD'}
                                </Typography>
                              </Box>
                            </TableCell>
                            
                            <TableCell>
                              <Chip
                                label={session.status}
                                color={
                                  session.status === 'completed' ? 'success' :
                                  session.status === 'scheduled' ? 'primary' :
                                  session.status === 'cancelled' ? 'error' : 'warning'
                                }
                                size="small"
                              />
                            </TableCell>
                            
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MoneyIcon fontSize="small" />
                                <Typography variant="body2">
                                  {session.currency || 'LYD'}{session.price || 0}
                                </Typography>
                              </Box>
                            </TableCell>
                            
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, session, 'session')}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredSessions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TableContainer>
            </Box>
          )}
          
          {tabValue === 1 && (
            <BookingQueue 
              bookings={bookings}
              instructors={instructors}
              onBookingUpdate={loadAllData}
            />
          )}
          
          {tabValue === 2 && (
            <SessionAnalytics 
              analytics={analytics}
              instructors={instructors}
            />
          )}
          
          {tabValue === 3 && (
            <InstructorPerformance 
              performance={performance}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedItem?.type === 'session' && [
          <MenuItem key="view" onClick={() => handleActionDialog('view', selectedItem)}>
            <VisibilityIcon sx={{ mr: 1 }} />
            {t('admin.viewDetails', 'View Details')}
          </MenuItem>,
          <MenuItem key="edit" onClick={() => handleActionDialog('edit', selectedItem)}>
            <EditIcon sx={{ mr: 1 }} />
            {t('admin.edit', 'Edit Session')}
          </MenuItem>,
          selectedItem.status === 'scheduled' && (
            <MenuItem key="complete" onClick={() => handleActionDialog('complete', selectedItem)}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              {t('admin.markComplete', 'Mark as Complete')}
            </MenuItem>
          ),
          selectedItem.status !== 'cancelled' && (
            <MenuItem key="cancel" onClick={() => handleActionDialog('cancel', selectedItem)} sx={{ color: 'error.main' }}>
              <CancelIcon sx={{ mr: 1 }} />
              {t('admin.cancelSession', 'Cancel Session')}
            </MenuItem>
          )
        ]}
        
        {selectedItem?.type === 'booking' && [
          <MenuItem key="approve" onClick={() => handleActionDialog('approve', selectedItem)}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            {t('admin.approve', 'Approve Booking')}
          </MenuItem>,
          <MenuItem key="reject" onClick={() => handleActionDialog('reject', selectedItem)} sx={{ color: 'error.main' }}>
            <BlockIcon sx={{ mr: 1 }} />
            {t('admin.reject', 'Reject Booking')}
          </MenuItem>,
          selectedItem.paymentStatus === 'paid' && (
            <MenuItem key="refund" onClick={() => handleActionDialog('refund', selectedItem)}>
              <MoneyIcon sx={{ mr: 1 }} />
              {t('admin.refund', 'Process Refund')}
            </MenuItem>
          )
        ]}
      </Menu>
      
      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: '', item: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'approve' && t('admin.confirmApprove', 'Confirm Booking Approval')}
          {actionDialog.type === 'reject' && t('admin.confirmReject', 'Confirm Booking Rejection')}
          {actionDialog.type === 'cancel' && t('admin.confirmCancel', 'Confirm Session Cancellation')}
          {actionDialog.type === 'complete' && t('admin.confirmComplete', 'Mark Session as Complete')}
          {actionDialog.type === 'refund' && t('admin.confirmRefund', 'Process Refund')}
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            {actionDialog.type === 'approve' && t('admin.approveMessage', 'Are you sure you want to approve this booking? The student will be notified.')}
            {actionDialog.type === 'reject' && t('admin.rejectMessage', 'Are you sure you want to reject this booking? The student will be notified.')}
            {actionDialog.type === 'cancel' && t('admin.cancelMessage', 'Are you sure you want to cancel this session? Both instructor and student will be notified.')}
            {actionDialog.type === 'complete' && t('admin.completeMessage', 'Mark this session as completed? This action cannot be undone.')}
            {actionDialog.type === 'refund' && t('admin.refundMessage', 'Process a refund for this booking? This will update the payment status.')}
          </Typography>
          
          {actionDialog.item && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {actionDialog.item.type === 'session' ? t('admin.sessionDetails', 'Session Details') : t('admin.bookingDetails', 'Booking Details')}
              </Typography>
              
              {actionDialog.item.sessionType && (
                <Typography variant="body2">
                  {t('admin.type', 'Type')}: {actionDialog.item.sessionType ? getSessionTypeNameString(actionDialog.item.sessionType, i18n.language || 'en') : actionDialog.item.sessionTypeName || 'Unknown'}
                </Typography>
              )}
              
              {actionDialog.item.startTime && (
                <Typography variant="body2">
                  {t('admin.dateTime', 'Date & Time')}: {format(new Date(actionDialog.item.startTime), 'PPP p')}
                </Typography>
              )}
              
              {actionDialog.item.price && (
                <Typography variant="body2">
                  {t('admin.amount', 'Amount')}: {actionDialog.item.currency || 'LYD'}{actionDialog.item.price}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: '', item: null })}>
            {t('common.cancel', 'Cancel')}
          </Button>
          
          <Button
            onClick={() => {
              if (actionDialog.item?.type === 'session') {
                handleSessionAction(actionDialog.item.id, actionDialog.type);
              } else {
                handleBookingAction(actionDialog.item.id, actionDialog.type);
              }
            }}
            color={actionDialog.type === 'reject' || actionDialog.type === 'cancel' ? 'error' : 'primary'}
            variant="contained"
          >
            {t('common.confirm', 'Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={loadAllData}
        >
          <RefreshIcon />
        </Fab>
      )}
    </Box>
  );
};

export default AdminSessionDashboard;