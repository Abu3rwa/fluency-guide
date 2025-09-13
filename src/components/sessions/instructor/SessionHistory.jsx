import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  StarRate as StarRateIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

// Import services
import { sessionService } from '../../../services/sessionService';
import { bookingService } from '../../../services/bookingService';

const SessionHistory = ({ instructorId, sessions }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for history
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    sessionType: 'all'
  });
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(false);

  // Filter sessions based on current filters
  useEffect(() => {
    let filtered = [...sessions];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    // Filter by date range
    const now = dayjs();
    if (filters.dateRange !== 'all') {
      switch (filters.dateRange) {
        case 'thisWeek':
          filtered = filtered.filter(session => 
            dayjs(session.startTime).isAfter(now.startOf('week'))
          );
          break;
        case 'thisMonth':
          filtered = filtered.filter(session => 
            dayjs(session.startTime).isAfter(now.startOf('month'))
          );
          break;
        case 'lastMonth':
          const lastMonth = now.subtract(1, 'month');
          filtered = filtered.filter(session => {
            const sessionDate = dayjs(session.startTime);
            return sessionDate.isAfter(lastMonth.startOf('month')) && 
                   sessionDate.isBefore(lastMonth.endOf('month'));
          });
          break;
        case 'last3Months':
          filtered = filtered.filter(session => 
            dayjs(session.startTime).isAfter(now.subtract(3, 'month'))
          );
          break;
      }
    }

    // Filter by session type
    if (filters.sessionType !== 'all') {
      filtered = filtered.filter(session => 
        session.sessionType?.id === filters.sessionType
      );
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf());

    setFilteredSessions(filtered);
  }, [sessions, filters]);

  // Calculate earnings
  useEffect(() => {
    const calculateEarnings = async () => {
      setLoading(true);
      try {
        const completedSessions = sessions.filter(session => session.status === 'completed');
        const now = dayjs();
        
        let total = 0;
        let thisMonth = 0;
        let lastMonth = 0;
        let thisWeek = 0;

        for (const session of completedSessions) {
          const sessionDate = dayjs(session.startTime);
          const sessionEarnings = session.sessionType?.price || 0;
          
          total += sessionEarnings;
          
          if (sessionDate.isAfter(now.startOf('week'))) {
            thisWeek += sessionEarnings;
          }
          
          if (sessionDate.isAfter(now.startOf('month'))) {
            thisMonth += sessionEarnings;
          }
          
          const lastMonthStart = now.subtract(1, 'month').startOf('month');
          const lastMonthEnd = now.subtract(1, 'month').endOf('month');
          if (sessionDate.isAfter(lastMonthStart) && sessionDate.isBefore(lastMonthEnd)) {
            lastMonth += sessionEarnings;
          }
        }

        setEarnings({ total, thisMonth, lastMonth, thisWeek });
      } catch (error) {
        console.error('Error calculating earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessions.length > 0) {
      calculateEarnings();
    }
  }, [sessions]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(0); // Reset to first page when filtering
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'scheduled': return 'primary';
      default: return 'default';
    }
  };

  const EarningsCard = ({ title, amount, icon, color = 'primary', change }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h6" component="div">
              {amount} LYD
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={0.5}>
                <TrendingUpIcon 
                  fontSize="small" 
                  color={change >= 0 ? 'success' : 'error'} 
                />
                <Typography 
                  variant="caption" 
                  color={change >= 0 ? 'success.main' : 'error.main'}
                >
                  {change >= 0 ? '+' : ''}{change}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const monthlyGrowth = earnings.lastMonth > 0 
    ? ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)
    : 0;

  // Get unique session types for filter
  const sessionTypes = [...new Set(sessions.map(s => s.sessionType?.id).filter(Boolean))]
    .map(id => sessions.find(s => s.sessionType?.id === id)?.sessionType)
    .filter(Boolean);

  const paginatedSessions = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Earnings Overview */}
      <Typography variant="h6" gutterBottom>
        {t('sessions.history.earningsOverview')}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <EarningsCard
            title={t('sessions.history.totalEarnings')}
            amount={earnings.total}
            icon={<MoneyIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EarningsCard
            title={t('sessions.history.thisMonthEarnings')}
            amount={earnings.thisMonth}
            icon={<TrendingUpIcon />}
            color="success"
            change={parseFloat(monthlyGrowth)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EarningsCard
            title={t('sessions.history.thisWeekEarnings')}
            amount={earnings.thisWeek}
            icon={<ScheduleIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EarningsCard
            title={t('sessions.history.completedSessions')}
            amount={sessions.filter(s => s.status === 'completed').length}
            icon={<PersonIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Session History */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {t('sessions.history.sessionHistory')}
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title={t('sessions.history.exportData')}>
            <IconButton>
              <GetAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterListIcon color="action" />
            <Typography variant="subtitle1">
              {t('sessions.history.filters')}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('sessions.history.status')}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">{t('sessions.history.allStatuses')}</MenuItem>
                <MenuItem value="completed">{t('sessions.status.completed')}</MenuItem>
                <MenuItem value="cancelled">{t('sessions.status.cancelled')}</MenuItem>
                <MenuItem value="scheduled">{t('sessions.status.scheduled')}</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('sessions.history.dateRange')}
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <MenuItem value="all">{t('sessions.history.allTime')}</MenuItem>
                <MenuItem value="thisWeek">{t('sessions.history.thisWeek')}</MenuItem>
                <MenuItem value="thisMonth">{t('sessions.history.thisMonth')}</MenuItem>
                <MenuItem value="lastMonth">{t('sessions.history.lastMonth')}</MenuItem>
                <MenuItem value="last3Months">{t('sessions.history.last3Months')}</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('sessions.history.sessionType')}
                value={filters.sessionType}
                onChange={(e) => handleFilterChange('sessionType', e.target.value)}
              >
                <MenuItem value="all">{t('sessions.history.allTypes')}</MenuItem>
                {sessionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Sessions Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('sessions.history.date')}</TableCell>
                <TableCell>{t('sessions.history.time')}</TableCell>
                <TableCell>{t('sessions.history.sessionType')}</TableCell>
                <TableCell>{t('sessions.history.students')}</TableCell>
                <TableCell>{t('sessions.history.status')}</TableCell>
                <TableCell align="right">{t('sessions.history.earnings')}</TableCell>
                {!isMobile && <TableCell align="center">{t('sessions.history.actions')}</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSessions.map((session) => (
                <TableRow key={session.id} hover>
                  <TableCell>
                    {dayjs(session.startTime).format('MMM DD, YYYY')}
                  </TableCell>
                  <TableCell>
                    {dayjs(session.startTime).format('HH:mm')} - {dayjs(session.endTime).format('HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {session.sessionType?.name || t('sessions.dashboard.unknownType')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {session.sessionType?.duration} {t('sessions.admin.minutes')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PersonIcon fontSize="small" />
                      <Typography variant="body2">
                        {session.enrolledCount || 0}/{session.maxStudents}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t(`sessions.status.${session.status}`)}
                      color={getStatusColor(session.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {session.status === 'completed' ? 
                        `${session.sessionType?.price || 0} ${session.sessionType?.currency || 'LYD'}` :
                        '-'
                      }
                    </Typography>
                  </TableCell>
                  {!isMobile && (
                    <TableCell align="center">
                      <Tooltip title={t('sessions.history.viewDetails')}>
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('sessions.history.rowsPerPage')}
        />
      </Card>

      {filteredSessions.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            {t('sessions.history.noSessions')}
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            {t('sessions.history.noSessionsDesc')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SessionHistory;