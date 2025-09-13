import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Badge,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

// Import services
import { sessionService } from '../../../services/sessionService';
import { bookingService } from '../../../services/bookingService';
import userService from '../../../services/userService';
import { getSessionTypeNameString } from '../../../utils/sessionLocalization';

const AdminSessionOverview = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    totalInstructors: 0,
    totalStudents: 0,
    revenue: 0,
    pendingBookings: 0
  });

  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: 'all',
    instructor: 'all',
    dateRange: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadOverviewData();
    loadInstructors();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all sessions
      const allSessions = await sessionService.getAll();
      setSessions(allSessions || []);

      // Calculate statistics
      calculateStats(allSessions);

    } catch (err) {
      console.error('Error loading admin overview data:', err);
      setError(t('sessions.admin.overview.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const loadInstructors = async () => {
    try {
      const allInstructors = await userService.getUsersByRole('isInstructor');
      setInstructors(allInstructors || []);
    } catch (error) {
      console.error('Error loading instructors:', error);
    }
  };

  const calculateStats = async (sessionData) => {
    const now = dayjs();
    
    const totalSessions = sessionData.length;
    const activeSessions = sessionData.filter(s => s.status === 'scheduled').length;
    const completedSessions = sessionData.filter(s => s.status === 'completed').length;
    const cancelledSessions = sessionData.filter(s => s.status === 'cancelled').length;

    // Calculate revenue from completed sessions
    const revenue = sessionData
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.sessionType?.price || 0), 0);

    // Get unique instructors and students
    const uniqueInstructors = new Set(sessionData.map(s => s.instructorId)).size;
    
    // Load all bookings to count students and pending bookings
    let totalStudents = 0;
    let pendingBookings = 0;
    
    try {
      const allBookings = await bookingService.getAll();
      totalStudents = new Set(allBookings.map(b => b.userId)).size;
      pendingBookings = allBookings.filter(b => b.status === 'pending').length;
    } catch (error) {
      console.error('Error calculating booking stats:', error);
    }

    setStats({
      totalSessions,
      activeSessions,
      completedSessions,
      cancelledSessions,
      totalInstructors: uniqueInstructors,
      totalStudents,
      revenue,
      pendingBookings
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(0);
  };

  const handleMenuOpen = (event, session) => {
    setAnchorEl(event.currentTarget);
    setSelectedSession(session);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setDetailsDialog(true);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // Filter by status
    if (filters.status !== 'all') {
      if (filters.status === 'upcoming') {
        filtered = filtered.filter(s => 
          s.status === 'scheduled' && dayjs(s.startTime).isAfter(dayjs())
        );
      } else {
        filtered = filtered.filter(s => s.status === filters.status);
      }
    }

    // Filter by instructor
    if (filters.instructor !== 'all') {
      filtered = filtered.filter(s => s.instructorId === filters.instructor);
    }

    // Filter by date range
    const now = dayjs();
    if (filters.dateRange !== 'all') {
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(s => 
            dayjs(s.startTime).isSame(now, 'day')
          );
          break;
        case 'thisWeek':
          filtered = filtered.filter(s => 
            dayjs(s.startTime).isAfter(now.startOf('week'))
          );
          break;
        case 'thisMonth':
          filtered = filtered.filter(s => 
            dayjs(s.startTime).isAfter(now.startOf('month'))
          );
          break;
      }
    }

    return filtered.sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf());
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
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const SessionDetailsDialog = () => (
    <Dialog 
      open={detailsDialog} 
      onClose={() => setDetailsDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {t('sessions.admin.overview.sessionDetails')}
      </DialogTitle>
      <DialogContent>
        {selectedSession && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('sessions.admin.overview.sessionType')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedSession.sessionType ? getSessionTypeNameString(selectedSession.sessionType, i18n.language || 'en') : t('sessions.dashboard.unknownType')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('sessions.admin.overview.instructor')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {instructors.find(i => i.id === selectedSession.instructorId)?.displayName || 'Unknown'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('sessions.admin.overview.dateTime')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {dayjs(selectedSession.startTime).format('MMM DD, YYYY HH:mm')} - {dayjs(selectedSession.endTime).format('HH:mm')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('sessions.admin.overview.status')}
              </Typography>
              <Chip 
                label={t(`sessions.status.${selectedSession.status}`)}
                color={getStatusColor(selectedSession.status)}
                size="small"
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailsDialog(false)}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const filteredSessions = filterSessions();
  const paginatedSessions = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>{t('sessions.admin.overview.loading')}</Typography>
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
            {t('sessions.admin.overview.title')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('sessions.admin.overview.subtitle')}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton onClick={loadOverviewData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={() => {/* Export functionality */}}
          >
            {t('sessions.admin.overview.export')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('sessions.admin.overview.totalSessions')}
            value={stats.totalSessions}
            icon={<DashboardIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('sessions.admin.overview.activeSessions')}
            value={stats.activeSessions}
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('sessions.admin.overview.totalInstructors')}
            value={stats.totalInstructors}
            icon={<PersonIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('sessions.admin.overview.revenue')}
            value={`${stats.revenue} LYD`}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Sessions Table */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label={t('sessions.admin.overview.allSessions')} />
              <Tab 
                label={
                  <Badge badgeContent={stats.pendingBookings} color="error">
                    {t('sessions.admin.overview.pendingBookings')}
                  </Badge>
                } 
              />
              <Tab label={t('sessions.admin.overview.issues')} />
            </Tabs>
            
            {/* Filters */}
            <Box display="flex" gap={2}>
              <TextField
                select
                size="small"
                label={t('sessions.admin.overview.status')}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">{t('sessions.admin.overview.allStatuses')}</MenuItem>
                <MenuItem value="upcoming">{t('sessions.admin.overview.upcoming')}</MenuItem>
                <MenuItem value="scheduled">{t('sessions.status.scheduled')}</MenuItem>
                <MenuItem value="completed">{t('sessions.status.completed')}</MenuItem>
                <MenuItem value="cancelled">{t('sessions.status.cancelled')}</MenuItem>
              </TextField>
              
              <TextField
                select
                size="small"
                label={t('sessions.admin.overview.instructor')}
                value={filters.instructor}
                onChange={(e) => handleFilterChange('instructor', e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">{t('sessions.admin.overview.allInstructors')}</MenuItem>
                {instructors.map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    {instructor.displayName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('sessions.admin.overview.session')}</TableCell>
                <TableCell>{t('sessions.admin.overview.instructor')}</TableCell>
                <TableCell>{t('sessions.admin.overview.dateTime')}</TableCell>
                <TableCell>{t('sessions.admin.overview.students')}</TableCell>
                <TableCell>{t('sessions.admin.overview.status')}</TableCell>
                <TableCell align="right">{t('sessions.admin.overview.revenue')}</TableCell>
                <TableCell align="center">{t('sessions.admin.overview.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSessions.map((session) => (
                <TableRow key={session.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {session.sessionType ? getSessionTypeNameString(session.sessionType, i18n.language || 'en') : t('sessions.dashboard.unknownType')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {session.sessionType?.duration} {t('sessions.admin.minutes')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {instructors.find(i => i.id === session.instructorId)?.displayName || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {dayjs(session.startTime).format('MMM DD, YYYY')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {dayjs(session.startTime).format('HH:mm')} - {dayjs(session.endTime).format('HH:mm')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {session.enrolledCount || 0}/{session.maxStudents}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t(`sessions.status.${session.status}`)}
                      color={getStatusColor(session.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {session.status === 'completed' ? 
                      `${session.sessionType?.price || 0} LYD` : '-'
                    }
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, session)}
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
          count={filteredSessions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedSession)}>
          <VisibilityIcon sx={{ mr: 1 }} />
          {t('sessions.admin.overview.viewDetails')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          {t('sessions.admin.overview.edit')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <NotificationsIcon sx={{ mr: 1 }} />
          {t('sessions.admin.overview.notify')}
        </MenuItem>
      </Menu>

      {/* Session Details Dialog */}
      <SessionDetailsDialog />
    </Box>
  );
};

export default AdminSessionOverview;